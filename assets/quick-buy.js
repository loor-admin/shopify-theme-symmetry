import { ThemeDialog } from './dialog.js';
class QuickBuy extends ThemeDialog {
  connectedCallback() {
    super.connectedCallback();
    const { signal } = this.controller;
    this.dialog.addEventListener('close', () => this.fetchController?.abort(), { signal });
    document.addEventListener('click', async (event) => {
      const trigger = event.target.closest('[data-quick-buy]');
      if (!trigger) return;
      event.preventDefault();
      this.fetchController?.abort();
      this.fetchController = new AbortController();
      this.querySelector('[data-quick-content]').replaceChildren();
      const status = this.querySelector('[data-quick-status]');
      status.textContent = '';
      this.setAttribute('aria-busy', 'true');
      this.open(trigger);
      try {
        const url = new URL(trigger.href);
        url.searchParams.set('section_id', 'quick-buy');
        const response = await fetch(url, { signal: this.fetchController.signal });
        if (!response.ok) throw new Error('Product unavailable');
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        const content = doc.querySelector('[data-quick-product]');
        if (!content) throw new Error('Missing product');
        this.querySelector('[data-quick-content]').append(content);
      } catch (error) {
        if (error.name !== 'AbortError') {
          status.textContent = this.dataset.error;
          const link = document.createElement('a'); link.href = trigger.href; link.textContent = trigger.textContent;
          this.querySelector('[data-quick-content]').append(link);
        }
      } finally { this.removeAttribute('aria-busy'); }
    }, { signal });
  }
  disconnectedCallback() { this.fetchController?.abort(); super.disconnectedCallback(); }
}
if (!customElements.get('quick-buy')) customElements.define('quick-buy', QuickBuy);
