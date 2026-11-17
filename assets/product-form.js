class ProductForm extends HTMLElement {
  connectedCallback() {
    this.controller = new AbortController();
    this.querySelector('select[name="id"]').addEventListener('change', (event) => {
      const option = event.target.selectedOptions[0];
      const quantity = this.querySelector('input[name="quantity"]');
      quantity.min = option.dataset.min;
      quantity.step = option.dataset.step;
      if (option.dataset.max) quantity.max = option.dataset.max; else quantity.removeAttribute('max');
      quantity.value = option.dataset.min;
    }, { signal: this.controller.signal });
  }
  disconnectedCallback() { this.controller.abort(); }
}
if (!customElements.get('product-form')) customElements.define('product-form', ProductForm);
