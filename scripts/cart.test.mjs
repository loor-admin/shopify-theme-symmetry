import test from 'node:test';
import assert from 'node:assert/strict';

// Isolate request, serialization and failed-render contracts without pretending
// this replaces an actual Shopify/browser checkout test.
globalThis.HTMLElement = class {};
globalThis.customElements = { get: () => true };
globalThis.window = { Shopify: { routes: { root: '/fr/' } } };
globalThis.location = { href: 'https://example.test/fr/products/example', pathname: '/fr/products/example' };
const { CartDrawer } = await import('../assets/cart-drawer.js');

test('cart requests preserve localized routes and line keys', async () => {
  const drawer = new CartDrawer();
  drawer.dataset = { error: 'Cart error' };
  let requested;
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => { requested = { url, options }; return { ok: true, json: async () => ({ item_count: 2 }) }; };
  try {
    await drawer.request('cart/change.js', { id: '123:unique-properties', quantity: 2 });
    assert.equal(requested.url, '/fr/cart/change.js');
    assert.equal(JSON.parse(requested.options.body).id, '123:unique-properties');
    assert.equal(requested.options.headers['Content-Type'], 'application/json');
  } finally { globalThis.fetch = original; }
});

test('422 inventory messages propagate to the caller', async () => {
  const drawer = new CartDrawer();
  drawer.dataset = { error: 'Cart error' };
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, json: async () => ({ status: 422, description: 'Only one remaining' }) });
  try { await assert.rejects(drawer.request('cart/add.js', new FormData()), /Only one remaining/); }
  finally { globalThis.fetch = original; }
});

test('mutations serialize and a rejected mutation does not stall the queue', async () => {
  const drawer = new CartDrawer();
  drawer.queue = Promise.resolve();
  const order = [];
  const first = drawer.enqueue(async () => { order.push('first'); throw new Error('Unavailable'); });
  const second = drawer.enqueue(async () => { order.push('second'); });
  await assert.rejects(first, /Unavailable/);
  await second;
  assert.deepEqual(order, ['first', 'second']);
});

test('null rendered sections cause one GET, never another cart mutation', async () => {
  const drawer = new CartDrawer();
  drawer.dataset = { section: 'cart-drawer', refreshError: 'View cart for latest contents' };
  const content = { hidden: false };
  const error = { textContent: '' };
  drawer.querySelector = (selector) => selector === '[data-cart-content]' ? content : error;
  const requests = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return { ok: true, json: async () => ({ 'cart-drawer': null }) }; };
  try {
    await drawer.renderCart({ 'cart-drawer': null });
    assert.equal(requests.length, 1);
    assert.equal(requests[0].options.method, undefined);
    assert.equal(requests[0].url.searchParams.get('sections'), 'cart-drawer');
    assert.equal(content.hidden, true);
    assert.equal(error.textContent, drawer.dataset.refreshError);
  } finally { globalThis.fetch = original; }
});
