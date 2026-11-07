/* OldRoot Studios — first-entry development welcome.
   Intentionally isolated from navigation, roster, poll and OPI controllers. */
(() => {
  'use strict';
  const STORAGE_KEY = 'oldroot-welcome-seen-v1';
  const overlay = document.getElementById('oldrootWelcome');
  if (!overlay) return;
  const dialog = overlay.querySelector('.or-welcome-card');
  const closeButton = overlay.querySelector('.or-welcome-close');
  const enterButton = overlay.querySelector('.or-welcome-enter');
  let previousFocus = null;
  let locked = [];

  function wasSeen() {
    try { return localStorage.getItem(STORAGE_KEY) === 'yes'; }
    catch (_) { try { return sessionStorage.getItem(STORAGE_KEY) === 'yes'; } catch (_) { return false; } }
  }
  function rememberVisit() {
    try { localStorage.setItem(STORAGE_KEY, 'yes'); }
    catch (_) { try { sessionStorage.setItem(STORAGE_KEY, 'yes'); } catch (_) {} }
  }
  function show() {
    if (!overlay.hidden) return;
    previousFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('or-welcome-open');
    locked = [...document.querySelectorAll('body > header, body > main, body > footer')].map(element => ({ element, inert: element.inert }));
    locked.forEach(({ element }) => { element.inert = true; });
    closeButton.focus({ preventScroll: true });
  }
  function dismiss() {
    if (overlay.hidden) return;
    rememberVisit();
    overlay.hidden = true;
    document.body.classList.remove('or-welcome-open');
    locked.forEach(({ element, inert }) => { element.inert = inert; });
    locked = [];
    const fallback = document.querySelector('.masthead .brand');
    const focusTarget = previousFocus && previousFocus !== document.body ? previousFocus : fallback;
    if (focusTarget && typeof focusTarget.focus === 'function') focusTarget.focus({ preventScroll: true });
  }
  closeButton.addEventListener('click', dismiss);
  enterButton.addEventListener('click', dismiss);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) dismiss(); });
  overlay.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); dismiss(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [closeButton, enterButton];
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  const force = new URLSearchParams(window.location.search).get('welcome') === '1';
  if (force || !wasSeen()) show();
})();
