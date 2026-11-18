import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../assets/announcement-bar.js', import.meta.url), 'utf8');
function fixture() {
  let Component;
  let serial = 0;
  const timers = new Map();
  const context = vm.createContext({
    HTMLElement: class {},
    customElements: { get: () => false, define: (_, component) => { Component = component; } },
    document: { addEventListener() {}, activeElement: null, documentElement: { style: { setProperty() {} } } },
    Date,
    setTimeout(fn, delay) { const id = ++serial; timers.set(id, { fn, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  vm.runInContext(source, context);
  const bar = new Component();
  const slide = () => {
    const attrs = new Set();
    const classes = new Set();
    const digits = { textContent: '' };
    const message = { inert: false, textContent: 'Shipping details' };
    const timer = { style: {}, querySelector: () => digits, setAttribute() {} };
    return {
      dataset: { expiredBehavior: 'hide' },
      hasAttribute: name => attrs.has(name),
      setAttribute: name => attrs.add(name),
      classList: { toggle(name, active) { if (active) classes.add(name); else classes.delete(name); }, remove(name) { classes.delete(name); } },
      querySelector: selector => selector === '[data-countdown]' ? timer : message,
      contains: () => false,
      digits, message,
    };
  };
  bar.slides = [slide(), slide()];
  bar.index = 0;
  bar.reasons = new Set();
  bar.dataset = { autoplay: 'true', speed: '5' };
  bar.countdowns = [];
  bar.toggleAttribute = () => {};
  bar.querySelectorAll = () => [];
  bar.contains = () => false;
  bar.status = { textContent: '' };
  bar.editorBlock = null;
  return { Component, bar, timers };
}

test('countdown parses fixed offsets independently of shopper timezone and rejects invalid calendar dates', () => {
  const { Component } = fixture();
  assert.equal(Component.parseEnd('2028-02-29 12:30', '-06:00'), Date.UTC(2028, 1, 29, 18, 30));
  assert.equal(Component.parseEnd('2028-02-29 12:30', '+05:30'), Date.UTC(2028, 1, 29, 7, 0));
  for (const [date, offset] of [['2027-02-29 12:00', '+00:00'], ['2028-04-31 12:00', '+00:00'], ['2028-01-01 24:00', '+00:00'], ['2028-01-01 12:00', '+14:30'], ['bad', '+00:00'], ['2028-01-01 12:00', 'CST']]) {
    assert.ok(Number.isNaN(Component.parseEnd(date, offset)), `${date} ${offset}`);
  }
});

test('one-second countdown ticks do not restart the five-second rotation deadline', () => {
  const { bar, timers } = fixture();
  bar.countdowns = [{ slide: bar.slides[0], end: Date.now() + 60000 }];
  bar.tick();
  const rotation = bar.rotation;
  assert.equal(timers.get(rotation).delay, 5000);
  bar.tick();
  assert.equal(bar.rotation, rotation);
  assert.ok(timers.has(rotation));
  timers.get(rotation).fn();
  assert.equal(bar.index, 1);
});

test('pause reasons compose and rotation resumes only after the last reason is cleared', () => {
  const { bar, timers } = fixture();
  bar.schedule();
  bar.setPause('hover', true);
  bar.setPause('focus', true);
  assert.equal(timers.size, 0);
  bar.setPause('hover', false);
  assert.equal(timers.size, 0);
  bar.setPause('focus', false);
  assert.equal(timers.size, 1);
  bar.setPause('motion', true);
  bar.setPause('dialog', true);
  bar.setPause('dialog', false);
  assert.equal(timers.size, 0);
});

test('expired hidden announcements are removed from rotation and the countdown stops', () => {
  const { bar } = fixture();
  bar.countdowns = [{ slide: bar.slides[0], end: Date.now() - 1000 }];
  bar.tick();
  assert.equal(bar.index, 1);
  assert.equal(bar.available().length, 1);
  assert.ok(bar.slides[0].hasAttribute('data-unavailable'));
  assert.equal(bar.slides[0].message.inert, true);
  assert.equal(bar.clock, undefined);
});

test('expired text remains eligible, and editor selection can reveal an expired hidden block', () => {
  const { bar } = fixture();
  bar.slides[0].dataset.expiredBehavior = 'text';
  bar.countdowns = [{ slide: bar.slides[0], end: Date.now() - 1000 }];
  bar.tick();
  assert.equal(bar.available().length, 2);
  assert.ok(bar.slides[0].hasAttribute('data-expired'));
  bar.slides[0].dataset.expiredBehavior = 'hide';
  bar.tick();
  bar.editorBlock = bar.slides[0];
  bar.show(0);
  bar.tick();
  assert.equal(bar.index, 0);
  assert.equal(bar.available().length, 2);
});

test('disconnect cancels rotation and ticking timers and releases observers/listeners', () => {
  const { bar, timers } = fixture();
  let aborted = false, disconnected = false;
  bar.controller = { abort() { aborted = true; } };
  bar.resize = { disconnect() { disconnected = true; } };
  bar.countdowns = [{ slide: bar.slides[0], end: Date.now() + 10000 }];
  bar.tick();
  assert.equal(timers.size, 2);
  bar.disconnectedCallback();
  assert.equal(timers.size, 0);
  assert.ok(aborted && disconnected);
});


test('announcement schema uses valid range controls and string-valued font-size options', async () => {
  const liquid = await readFile(new URL('../sections/announcement-bar.liquid', import.meta.url), 'utf8');
  const schema = JSON.parse(liquid.match(/{% schema %}([\s\S]*?){% endschema %}/)[1]);
  const settings = [...schema.settings, ...schema.blocks.flatMap(block => block.settings)];
  for (const setting of settings.filter(setting => setting.type === 'range')) {
    assert.ok((setting.max - setting.min) / setting.step >= 2, `${setting.id} must offer at least three values`);
  }
  const font = schema.settings.find(setting => setting.id === 'font_size');
  assert.equal(font.type, 'select');
  assert.deepEqual(font.options.map(option => option.value), ['12', '13']);
  assert.ok(font.options.some(option => option.value === font.default));
});


test('header group enables the announcement bar before the header with a visible initial message', async () => {
  const group = JSON.parse(await readFile(new URL('../sections/header-group.json', import.meta.url), 'utf8'));
  const announcementId = group.order.find(id => group.sections[id].type === 'announcement-bar');
  const headerId = group.order.find(id => group.sections[id].type === 'header-beatnik');
  assert.ok(announcementId && headerId);
  assert.equal(group.order.indexOf(announcementId) + 1, group.order.indexOf(headerId));
  const section = group.sections[announcementId];
  assert.equal(section.disabled, false);
  assert.ok(section.blocks[section.block_order[0]].settings.message.trim());
  assert.notEqual(section.settings.background, section.settings.text_color);
  const layout = await readFile(new URL('../layout/theme.liquid', import.meta.url), 'utf8');
  assert.ok(layout.includes("{% sections 'header-group' %}"));
  assert.ok(layout.includes("'announcement-bar.css' | asset_url"));
  assert.ok(layout.includes("'announcement-bar.js' | asset_url"));
});
