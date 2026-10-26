/* OldRoot HQ 2.0 — approved-art staging loader.
 * Imports creator-approved files only when they actually exist.
 * Keep existing images and honest pending states if assets aren't in the repo yet.
 * The source PNG masters remain untouched under assets/approved-home/.
 */
(() => {
  'use strict';

  const approved = [
    ['Kincast', 'kincast.webp'],
    ['Anchorage', 'anchorage.webp'],
    ['Isiah Ivory', 'isiah-ivory.webp'],
    ['Liontone', 'liontone.webp'],
    ['Agent Emerald', 'agent-emerald.webp'],
    ['Remedie', 'remedie.webp'],
    ['Flying Saucer', 'flying-saucer.webp'],
    ['Gila Monster', 'gila-monster.webp']
  ];
  const directory = 'assets/approved-home/';

  function loadVerifiedDerivative(filename, onReady) {
    const url = directory + filename;
    const preload = new Image();
    preload.onload = () => {
      if (preload.naturalWidth > 0 && preload.naturalHeight > 0) onReady(url);
    };
    // Preserve existing draft art or the ART IMPORT PENDING state on 404.
    preload.onerror = () => {};
    preload.src = url;
  }

  const faces = [...document.querySelectorAll('.lc-face-grid .lc-face')];
  if (faces.length !== approved.length) return;

  approved.forEach(([name, filename], index) => {
    const panel = faces[index];
    const label = panel.querySelector('.lc-face-name');
    if (!label || label.textContent.trim() !== name) return;

    loadVerifiedDerivative(filename, (url) => {
      let portrait = panel.querySelector('img');
      if (portrait) {
        portrait.src = url;
      } else {
        portrait = document.createElement('img');
        portrait.alt = name + ', approved OldRoot homepage portrait';
        portrait.decoding = 'async';
        portrait.loading = index < 4 ? 'eager' : 'lazy';
        panel.insertBefore(portrait, panel.firstChild);
      }
      panel.querySelector('.lc-pending-pattern')?.remove();
      panel.querySelector('.lc-face-flag')?.remove();
      panel.classList.remove('lc-face--pending');
      panel.dataset.approvedArt = 'true';
      if (panel.tagName !== 'A') {
        panel.setAttribute('role', 'img');
        panel.setAttribute('aria-label', name + ' — approved character portrait');
      }
    });
  });

  const homepageLogo = document.querySelector('.lc-wordmark');
  if (homepageLogo) {
    loadVerifiedDerivative('primary-logo.webp', (url) => {
      homepageLogo.style.backgroundImage = 'url("' + url + '")';
      homepageLogo.dataset.approvedLogo = 'true';
    });
  }
})();
