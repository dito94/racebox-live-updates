/* 20 evo-banner: <main> follows the header when the visitor's own text spacing makes it taller (WCAG 1.4.12) */
(function () {
  'use strict';
  function init() {
    var hdr = document.querySelector('header'), bar = hdr && hdr.querySelector('.rbu-evo-bar');
    if (!bar || !window.ResizeObserver) return;
    var ban = hdr.querySelector('.shipping-info-banner'), root = document.documentElement, last = -1;
    function sync() {
      var grow = Math.max(0, bar.offsetHeight - (parseFloat(getComputedStyle(bar).minHeight) || 0));
      if (ban) grow += Math.max(0, ban.offsetHeight - 20);
      grow = Math.round(grow);
      if (grow !== last) { last = grow; root.style.setProperty('--rbu-hdr-grow', grow + 'px'); }
    }
    new ResizeObserver(sync).observe(hdr);
    sync();
  }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
