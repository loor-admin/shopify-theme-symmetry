class HeroSlider extends HTMLElement {
  connectedCallback() {
    this.controller = new AbortController();
    this.querySelector('[data-slider-controls]')?.removeAttribute('hidden');
    this.addEventListener('click', (event) => {
      const button = event.target.closest('[data-slide-to]');
      if (button) this.show(Number(button.dataset.slideTo));
    }, { signal: this.controller.signal });
    document.addEventListener('shopify:block:select', (event) => {
      if (!this.contains(event.target)) return;
      const slides = [...this.querySelectorAll('[data-slide]')];
      const index = slides.findIndex((slide) => slide.dataset.blockId === event.detail.blockId);
      if (index >= 0) this.show(index);
    }, { signal: this.controller.signal });
  }
  show(index) {
    this.querySelectorAll('[data-slide]').forEach((slide, i) => { slide.hidden = i !== index; });
    this.querySelectorAll('[data-slide-to]').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  }
  disconnectedCallback() { this.controller.abort(); }
}
if (!customElements.get('hero-slider')) customElements.define('hero-slider', HeroSlider);
