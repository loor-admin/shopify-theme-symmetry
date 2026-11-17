class ProductCard extends HTMLElement {
  connectedCallback() {
    this.controller = new AbortController();
    this.addEventListener('click', (event) => {
      const swatch = event.target.closest('[data-swatch]');
      if (!swatch) return;
      swatch.parentElement.querySelectorAll('[data-swatch]').forEach((item) => item.setAttribute('aria-pressed', String(item === swatch)));
      const image = this.querySelector('.card-primary');
      if (image && swatch.dataset.image) {
        this.dataset.preview = '';
        image.srcset = swatch.dataset.srcset;
        image.src = swatch.dataset.image;
        image.alt = swatch.dataset.alt;
      }
      this.querySelectorAll('[data-product-link], [data-quick-buy]').forEach((link) => { link.href = swatch.dataset.url; });
    }, { signal: this.controller.signal });
  }
  disconnectedCallback() { this.controller.abort(); }
}
if (!customElements.get('product-card')) customElements.define('product-card', ProductCard);
