class BeatnikHeader extends HTMLElement {
  connectedCallback() {
    this.classList.add('is-enhanced');
    this.controller = new AbortController();
    const { signal } = this.controller;
    this.lastY = window.scrollY;
    this.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-menu-toggle]');
      if (!toggle) return;
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      this.querySelector('nav').classList.toggle('is-open', open);
    }, { signal });
    this.addEventListener('toggle', (event) => {
      if (!(event.target instanceof HTMLDetailsElement) || !event.target.open) return;
      this.querySelectorAll('details[open]').forEach((details) => { if (details !== event.target) details.open = false; });
    }, { capture: true, signal });
    this.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const details = event.target.closest('details[open]');
      if (details) { details.open = false; details.querySelector('summary').focus(); }
      else { this.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded', 'false'); this.querySelector('nav').classList.remove('is-open'); }
    }, { signal });
    document.addEventListener('click', (event) => {
      if (!this.contains(event.target)) this.querySelectorAll('details[open]').forEach((d) => { d.open = false; });
    }, { signal });
    window.addEventListener('scroll', () => {
      if (this.pending) return;
      this.pending = requestAnimationFrame(() => {
        const y = Math.max(0, window.scrollY);
        const engaged = this.contains(document.activeElement) || this.querySelector('details[open], .is-open') || window.Shopify?.designMode;
        if (Math.abs(y - this.lastY) > 5) {
          this.classList.toggle('is-hidden', this.dataset.sticky === 'true' && y > this.offsetHeight * 2 && y > this.lastY && !engaged);
          this.lastY = y;
        }
        this.pending = null;
      });
    }, { passive: true, signal });
    this.addEventListener('focusin', () => this.classList.remove('is-hidden'), { signal });
    document.addEventListener('shopify:block:select', (event) => {
      const block = event.target.closest('[data-promo]');
      if (block && this.contains(block)) { block.closest('details').open = true; this.classList.remove('is-hidden'); }
    }, { signal });
  }
  disconnectedCallback() { this.controller.abort(); cancelAnimationFrame(this.pending); }
}
if (!customElements.get('beatnik-header')) customElements.define('beatnik-header', BeatnikHeader);
