// Native dialog supplies focus trapping, Escape, and background inertness.
export class ThemeDialog extends HTMLElement {
  connectedCallback() {
    this.controller = new AbortController();
    this.dialog = this.querySelector('dialog');
    this.addEventListener('click', (event) => {
      if (event.target.closest('[data-close]') || event.target === this.dialog) this.dialog.close();
    }, { signal: this.controller.signal });
    this.dialog.addEventListener('close', () => {
      if (!document.querySelector('dialog[open]')) document.documentElement.style.overflow = this.oldOverflow || '';
      if (this.opener?.isConnected) this.opener.focus();
    }, { signal: this.controller.signal });
  }
  open(opener = document.activeElement) {
    if (this.dialog.open) { this.querySelector('[data-close]')?.focus(); return; }
    this.opener = opener;
    this.oldOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    if (!this.dialog.open) this.dialog.showModal();
  }
  disconnectedCallback() {
    this.controller.abort();
    if (this.dialog.open) { this.dialog.close(); document.documentElement.style.overflow = this.oldOverflow || ''; }
  }
}
