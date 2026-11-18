/* Native dialogs, intrinsic grid sizing, fixed-offset countdowns; no dependencies. */
class AnnouncementBar extends HTMLElement {
  connectedCallback() {
    if (this.controller) return;
    this.controller = new AbortController();
    const { signal } = this.controller;
    this.slides = [...this.querySelectorAll('[data-slide]')];
    this.index = Math.max(0, this.slides.findIndex(slide => slide.classList.contains('is-active')));
    this.reasons = new Set();
    this.motion = matchMedia('(prefers-reduced-motion: reduce)');
    this.status = this.querySelector('[data-status]');
    this.editorBlock = null;
    this.countdowns = this.slides.filter(slide => slide.dataset.end !== undefined).map(slide => ({ slide, end: AnnouncementBar.parseEnd(slide.dataset.end, slide.dataset.offset) }));
    this.setAttribute('data-enhanced', '');
    this.addEventListener('click', event => {
      if (!(event.target instanceof Element)) return;
      if (Date.now() < (this.suppressClickUntil || 0)) { event.preventDefault(); return; }
      const opener = event.target.closest('[data-dialog-open]');
      if (opener) {
        const dialog = this.querySelector(`#${CSS.escape(opener.dataset.dialogOpen)}`);
        if (!dialog || typeof dialog.showModal !== 'function') return;
        event.preventDefault();
        this.opener = opener;
        dialog.showModal();
        this.setPause('dialog', true);
      } else if (event.target.closest('[data-previous]')) this.step(-1, true);
      else if (event.target.closest('[data-next]')) this.step(1, true);
      else if (event.target instanceof HTMLDialogElement) {
        const bounds = event.target.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.target.close();
      }
    }, { signal });
    this.querySelectorAll('dialog').forEach(dialog => {
      dialog.addEventListener('close', () => {
        this.setPause('dialog', !!this.querySelector('dialog[open]'));
        if (this.opener?.isConnected && !this.opener.closest('[data-expired]')) this.opener.focus({ preventScroll: true });
        else { this.setAttribute('tabindex', '-1'); this.focus({ preventScroll: true }); }
      }, { signal });
    });
    this.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch' && this.dataset.pauseHover === 'true') this.setPause('hover', true);
    }, { signal });
    this.addEventListener('pointerleave', () => this.setPause('hover', false), { signal });
    this.addEventListener('focusin', () => this.setPause('focus', true), { signal });
    this.addEventListener('focusout', () => queueMicrotask(() => {
      if (this.isConnected) this.setPause('focus', this.contains(document.activeElement));
    }), { signal });
    const track = this.querySelector('.ab__track');
    track?.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch' || !event.isPrimary) return;
      this.touch = { x: event.clientX, y: event.clientY, id: event.pointerId };
      this.setPause('touch', true);
    }, { signal, passive: true });
    window.addEventListener('pointerup', event => {
      if (!this.touch || this.touch.id !== event.pointerId) return;
      const dx = event.clientX - this.touch.x;
      const dy = event.clientY - this.touch.y;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5 && !this.querySelector('dialog[open]')) {
        this.step(dx > 0 ? -1 : 1, true);
        this.suppressClickUntil = Date.now() + 400;
      }
      this.touch = null;
      this.setPause('touch', false);
    }, { signal, passive: true });
    window.addEventListener('pointercancel', () => {
      this.touch = null;
      this.setPause('touch', false);
    }, { signal });
    document.addEventListener('visibilitychange', () => this.setPause('hidden', document.hidden), { signal });
    this.motion.addEventListener('change', () => {
      this.setPause('motion', this.motion.matches);
    }, { signal });
    document.addEventListener('shopify:block:select', event => {
      if (event.detail?.sectionId !== this.dataset.sectionId && !this.contains(event.target)) return;
      const index = this.slides.findIndex(slide => slide.dataset.blockId === event.detail?.blockId || slide.contains(event.target));
      if (index < 0) return;
      this.editorBlock = this.slides[index];
      this.setPause('editor', true);
      this.show(index, false);
    }, { signal });
    document.addEventListener('shopify:block:deselect', event => {
      if (event.detail?.blockId !== this.editorBlock?.dataset.blockId && !this.editorBlock?.contains(event.target)) return;
      this.editorBlock = null;
      this.setPause('editor', false);
      this.tick();
    }, { signal });
    this.resize = new ResizeObserver(() => this.measure());
    this.resize.observe(this);
    this.setPause('hidden', document.hidden);
    this.setPause('motion', this.motion.matches);
    this.tick();
    this.measure();
    this.schedule();
  }

  static parseEnd(value, offset) {
    const date = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(value || '');
    const zone = /^([+-])(\d{2}):(\d{2})$/.exec(offset || '');
    if (!date || !zone) return NaN;
    const [, year, month, day, hour, minute] = date.map(Number);
    const zoneHours = Number(zone[2]), zoneMinutes = Number(zone[3]);
    if (year < 1000 || month < 1 || month > 12 || day < 1 || hour > 23 || minute > 59 || zoneHours > 14 || zoneMinutes > 59 || (zoneHours === 14 && zoneMinutes !== 0)) return NaN;
    const utc = Date.UTC(year, month - 1, day, hour, minute);
    const check = new Date(utc);
    if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return NaN;
    return utc - (zone[1] === '+' ? 1 : -1) * (zoneHours * 60 + zoneMinutes) * 60000;
  }

  available() {
    return this.slides.filter(slide => !slide.hasAttribute('data-unavailable') || slide === this.editorBlock);
  }

  show(index, announce = false) {
    const slide = this.slides[index];
    if (!slide) return;
    this.index = index;
    this.slides.forEach(item => {
      const active = item === slide;
      item.classList.toggle('is-active', active);
      item.inert = !active;
      item.setAttribute('aria-hidden', String(!active));
    });
    if (announce) {
      const message = slide.querySelector(slide.hasAttribute('data-expired') ? '[data-expired-text]' : '[data-message]');
      this.status.textContent = message?.textContent.trim() || '';
    }
    this.schedule();
  }

  step(direction, announce = false) {
    const available = this.available();
    if (available.length < 2) return;
    const current = available.indexOf(this.slides[this.index]);
    const next = available[(current + direction + available.length) % available.length];
    this.show(this.slides.indexOf(next), announce);
  }

  setPause(reason, paused) {
    if (paused) this.reasons.add(reason); else this.reasons.delete(reason);
    this.schedule();
  }

  schedule() {
    clearTimeout(this.rotation);
    if (this.dataset.autoplay !== 'true' || this.reasons.size || this.available().length < 2) return;
    const seconds = Math.min(10, Math.max(3, Number(this.dataset.speed) || 5));
    this.rotation = setTimeout(() => this.step(1), seconds * 1000);
  }

  tick() {
    clearTimeout(this.clock);
    const now = Date.now();
    let pending = false;
    this.countdowns.forEach(({ slide, end }) => {
      const timer = slide.querySelector('[data-countdown]');
      if (!Number.isFinite(end)) {
        // Invalid configuration never displays a misleading running timer.
        timer.style.visibility = 'hidden';
        return;
      }
      const remaining = Math.max(0, Math.ceil((end - now) / 1000));
      const days = Math.floor(remaining / 86400);
      const hours = Math.floor(remaining / 3600) % 24;
      const minutes = Math.floor(remaining / 60) % 60;
      const seconds = remaining % 60;
      timer.querySelector('[data-digits]').textContent = [days, hours, minutes, seconds].map(part => String(part).padStart(2, '0')).join(' : ');
      timer.setAttribute('data-ready', '');
      if (remaining > 0) { pending = true; return; }
      const firstExpiration = !slide.hasAttribute('data-expired');
      slide.setAttribute('data-expired', '');
      if (slide.dataset.expiredBehavior === 'hide') slide.setAttribute('data-unavailable', '');
      if (firstExpiration && slide === this.slides[this.index] && this.contains(document.activeElement) && slide.contains(document.activeElement)) {
        // Transfer focus before removing an expired link from keyboard navigation.
        this.setAttribute('tabindex', '-1');
        this.focus({ preventScroll: true });
      }
      slide.querySelector('[data-message]').inert = true;
    });
    const available = this.available();
    const availabilityChanged = this.availableCount !== available.length;
    this.availableCount = available.length;
    this.toggleAttribute('data-multiple', available.length > 1);
    this.querySelectorAll('[data-previous], [data-next]').forEach(control => {
      control.disabled = available.length < 2;
    });
    if (!available.includes(this.slides[this.index])) {
      if (available.length) this.show(this.slides.indexOf(available[0]));
      else this.slides.forEach(slide => {
        slide.classList.remove('is-active');
        slide.inert = true;
        slide.setAttribute('aria-hidden', 'true');
      });
    }
    // Keep the intrinsic grid space even when all slides expire; no content jumps.
    if (pending) this.clock = setTimeout(() => this.tick(), 1000 - (Date.now() % 1000));
    if (availabilityChanged) this.schedule();
  }

  measure() {
    const height = this.dataset.sticky === 'header' ? this.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--announcement-bar-height', `${height}px`);
  }

  disconnectedCallback() {
    this.controller?.abort();
    this.controller = null;
    this.resize?.disconnect();
    clearTimeout(this.rotation);
    clearTimeout(this.clock);
    this.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
    document.documentElement.style.setProperty('--announcement-bar-height', '0px');
  }
}
if (!customElements.get('announcement-bar')) customElements.define('announcement-bar', AnnouncementBar);
// Native custom-element callbacks cover section insertion/removal in the editor.
document.addEventListener('shopify:section:load', event => {
  event.target.querySelectorAll('announcement-bar').forEach(bar => {
    if (!bar.controller) bar.connectedCallback();
    bar.measure();
  });
});
