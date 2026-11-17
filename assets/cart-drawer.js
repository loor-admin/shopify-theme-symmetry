import { ThemeDialog } from './dialog.js';

const root = () => window.Shopify?.routes?.root || '/';
export class CartDrawer extends ThemeDialog {
  connectedCallback() {
    super.connectedCallback();
    this.queue = Promise.resolve();
    const { signal } = this.controller;
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-open-cart]');
      if (!trigger) return;
      event.preventDefault();
      this.open(trigger);
    }, { signal });
    document.addEventListener('submit', (event) => {
      const form = event.target.closest('form[data-cart-add]');
      if (!form) return;
      event.preventDefault();
      const data = new FormData(form);
      const button = event.submitter;
      const error = form.querySelector('[data-form-error]');
      if (error) error.textContent = '';
      if (button) button.disabled = true;
      this.enqueue(async () => {
        data.set('sections', this.dataset.section);
        data.set('sections_url', location.pathname);
        const result = await this.request('cart/add.js', data);
        // A successful mutation is never retried if section rendering fails.
        await this.renderCart(result.sections);
        const quickBuy = document.querySelector('quick-buy');
        const opener = quickBuy?.dialog.open ? quickBuy.opener : button;
        quickBuy?.dialog.close();
        this.open(opener);
      }).catch((err) => {
        if (error) error.textContent = err.message;
      }).finally(() => { if (button) button.disabled = false; });
    }, { signal });
    this.addEventListener('submit', (event) => {
      const form = event.target.closest('[data-line-form]');
      if (!form) return;
      event.preventDefault();
      const quantity = event.submitter?.name === 'remove' ? 0 : Number(form.elements.quantity.value);
      if (!Number.isInteger(quantity) || quantity < 0) return;
      const key = form.dataset.key;
      const lineIndex = [...this.querySelectorAll('[data-line-form]')].indexOf(form);
      const status = this.querySelector('[data-cart-error]');
      status.textContent = '';
      form.querySelectorAll('button').forEach((button) => { button.disabled = true; });
      this.enqueue(async () => {
        const result = await this.request('cart/change.js', {
          id: key, quantity, sections: [this.dataset.section], sections_url: location.pathname
        });
        await this.renderCart(result.sections);
        const forms = this.querySelectorAll('[data-line-form]');
        (forms[Math.min(lineIndex, forms.length - 1)]?.querySelector('input') || this.querySelector('[data-close]')).focus();
      }).catch((err) => { this.querySelector('[data-cart-error]').textContent = err.message; })
        .finally(() => form.querySelectorAll('button').forEach((button) => { button.disabled = false; }));
    }, { signal });
  }
  enqueue(work) {
    const next = this.queue.then(work);
    this.queue = next.catch(() => {});
    return next;
  }
  async request(path, body) {
    const multipart = body instanceof FormData;
    const response = await fetch(root() + path, {
      method: 'POST', credentials: 'same-origin',
      headers: { Accept: 'application/json', ...(multipart ? {} : { 'Content-Type': 'application/json' }) },
      body: multipart ? body : JSON.stringify(body)
    });
    const result = await response.json();
    if (!response.ok || result.status >= 400) throw new Error(typeof result.description === 'string' ? result.description : this.dataset.error);
    return result;
  }
  async renderCart(sections) {
    let html = sections?.[this.dataset.section];
    if (!html) {
      try {
        const url = new URL(location.href);
        url.searchParams.set('sections', this.dataset.section);
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('Section fetch failed');
        html = (await response.json())[this.dataset.section];
      } catch { /* Mutation succeeded. Offer a cart link without repeating it. */ }
    }
    const parsed = html ? new DOMParser().parseFromString(html, 'text/html') : null;
    const content = parsed?.querySelector('[data-cart-content]');
    if (!content) {
      this.querySelector('[data-cart-error]').textContent = this.dataset.refreshError;
      this.querySelector('[data-cart-content]').hidden = true;
      return;
    }
    this.querySelector('[data-cart-content]').hidden = false;
    this.querySelector('[data-cart-content]').replaceChildren(...content.childNodes);
    const count = this.querySelector('[data-item-count]')?.dataset.itemCount;
    document.querySelectorAll('[data-cart-count]').forEach((item) => { item.textContent = count; });
    this.querySelector('[data-cart-status]').textContent = this.dataset.updated;
    document.dispatchEvent(new CustomEvent('theme:cart:updated', { detail: { itemCount: Number(count) } }));
  }
}
if (!customElements.get('cart-drawer')) customElements.define('cart-drawer', CartDrawer);
