class PredictiveSearch extends HTMLElement {
  connectedCallback() {
    this.controller = new AbortController();
    const input = this.querySelector('input');
    this.results = this.querySelector('[data-results]');
    input.addEventListener('input', () => {
      clearTimeout(this.timer);
      this.fetchController?.abort();
      const query = input.value.trim();
      if (query.length < 2) { this.results.replaceChildren(); return; }
      this.timer = setTimeout(() => this.search(query), 200);
    }, { signal: this.controller.signal });
    this.addEventListener('keydown', (event) => { if (event.key === 'Escape') { clearTimeout(this.timer); this.fetchController?.abort(); this.results.replaceChildren(); input.focus(); } }, { signal: this.controller.signal });
  }
  async search(query) {
    this.fetchController = new AbortController();
    try {
      const url = new URL(this.dataset.url, location.origin);
      url.search = new URLSearchParams({ q: query, section_id: this.dataset.section, 'resources[type]': 'product', 'resources[limit]': '6' });
      const response = await fetch(url, { signal: this.fetchController.signal });
      if (!response.ok) throw new Error('Search failed');
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      const results = doc.querySelector('[data-predictive-results]');
      this.results.replaceChildren(...(results ? [...results.childNodes] : []));
    } catch (error) { if (error.name !== 'AbortError') this.results.textContent = this.dataset.error; }
  }
  disconnectedCallback() { clearTimeout(this.timer); this.fetchController?.abort(); this.controller.abort(); }
}
if (!customElements.get('predictive-search')) customElements.define('predictive-search', PredictiveSearch);
