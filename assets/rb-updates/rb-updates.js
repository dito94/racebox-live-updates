/* ---- 00-core/script.js ---- */
/* RaceBox site updates: shared helpers. window.RBU is the only global the updates add. */
(function () {
  'use strict';
  var RBU = window.RBU = window.RBU || {};
  /* Storage that never throws (private browsing, blocked storage, in-app browsers). */
  RBU.store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    remove: function (k) { try { window.localStorage.removeItem(k); } catch (e) { /* storage unavailable */ } }
  };
  RBU.ready = function (fn) {
    if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn);
  };
})();

/* ---- 20-evo-banner/script.js ---- */
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

/* ---- 80-discount-links/script.js ---- */
/* 80 discount-links: a link can carry a discount code, so customers never type one.
   Storefront pages: ?code=XXXX (also discount=, coupon=, promo=). The code is saved for 30 days (RBU.store), taken out
   of the address bar and confirmed in a small notice. On /store/checkout it is applied through the site's own
   Cart.applyDiscountCode once the cart has items, the first cart sync has finished and no discount is applied yet.
   The notice is a toast under the header that closes by itself, except on checkout, where it sits in the page flow,
   in the order summary, so it can never cover the form or the cart. */
(function () {
  'use strict';
  var RBU = window.RBU = window.RBU || {};
  var KEY = 'rbu-discount-code';
  var PARAMS = ['code', 'discount', 'coupon', 'promo'];
  var VALID = /^[A-Za-z0-9_-]{2,40}$/;
  var DAYS = 30;
  var ON_CHECKOUT = /^\/store\/checkout(?:\.html)?\/?$/.test(window.location.pathname);
  // Pages where code=, discount=, coupon= or promo= may already mean something else (account emails, password
  // resets, payment returns). A link code is never read there and the address bar is left alone. The mirror has none
  // of these pages: the CTO checks the real paths (see CTO.md).
  var EXCLUDED = /^\/(?:webapp|api|payment|order|orders|account(?:-[a-z-]+)?)(?:\/|$)|^\/store\/(?:payment|pay|order|orders|proforma|checkout-complete)(?:\/|$)/i;
  var HOVER = window.matchMedia ? window.matchMedia('(hover: hover)') : { matches: true }; // a tap on a touch screen leaves :hover stuck on the toast
  var SHORT_MS = 10000, LONG_MS = 20000; // how long a toast stays: a short line, a longer one
  var memory = null; // the code for this page only, when storage is blocked
  var stored = true;  // false when the code from the link could not be saved

  /* ---------------------------------------------------------------- storage */
  function save(code) {
    memory = code;
    return RBU.store.set(KEY, JSON.stringify({ code: code, exp: Date.now() + DAYS * 864e5 }));
  }
  function saved() {
    var raw = RBU.store.get(KEY);
    if (raw) {
      try {
        var o = JSON.parse(raw);
        if (o && typeof o.code === 'string' && VALID.test(o.code) && o.exp > Date.now()) return o.code;
      } catch (e) { /* not ours or damaged: dropped below */ }
      RBU.store.remove(KEY);
    }
    return memory;
  }
  function forget() { memory = null; RBU.store.remove(KEY); }
  RBU.discountCode = { get: saved, clear: forget };

  /* ------------------------------------------------- the code in the link */
  // Reads the first valid code from the query and removes every code parameter from the address bar, valid or
  // not. Other parameters (utm_*, etc.) and the #hash stay exactly as they were.
  function takeFromUrl() {
    if (EXCLUDED.test(window.location.pathname)) return null;
    var q = window.location.search;
    if (!q || q.length < 2) return null;
    var keep = [], found = null, hit = false;
    q.slice(1).split('&').forEach(function (pair) {
      if (!pair) return;
      var eq = pair.indexOf('=');
      var name = decode(eq < 0 ? pair : pair.slice(0, eq)).toLowerCase();
      if (PARAMS.indexOf(name) < 0) { keep.push(pair); return; }
      hit = true;
      var value = decode(eq < 0 ? '' : pair.slice(eq + 1)).trim();
      if (!found && VALID.test(value)) found = value;
    });
    if (hit) {
      try {
        window.history.replaceState(window.history.state, '',
          window.location.pathname + (keep.length ? '?' + keep.join('&') : '') + window.location.hash);
      } catch (e) { /* some in-app browsers refuse: the code still works */ }
    }
    return found;
  }
  function decode(s) {
    try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch (e) { return ''; }
  }

  /* ------------------------------------------------------------ the notice */
  // One small notice at a time. Built with text nodes only: the code is never parsed as HTML.
  //  - On /store/checkout it sits in the page flow, at the top of the order summary (or above the "cart is empty"
  //    message). It scrolls with the page, so it can't cover the form or the cart, and it stays until dismissed.
  //  - Everywhere else it is a toast under the header (position: fixed) that closes by itself after a readable time.
  var ICONS = {
    tag: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
    ok: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><circle cx="12" cy="12" r="10"/><path d="m7.5 12.5 3 3 6-6.5"/></svg>',
    info: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" focusable="false"><circle cx="12" cy="12" r="10"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r=".6" fill="currentColor"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>'
  };
  var toast = null, inFlow = false, live = null, ticker = null, left = 0, returnTo = null, padInline = null;

  // Where the in-flow notice goes on checkout: right under the "Your order" heading, in the same element checkout.js
  // uses as its cart (main .cart). With an empty cart there is no summary, so it goes above the layout instead.
  function flowSlot() {
    var cart = document.querySelector('main .cart');
    if (cart) {
      var first = cart.firstElementChild;
      return { parent: cart, before: first && /^H[1-6]$/.test(first.tagName) ? first.nextSibling : cart.firstChild };
    }
    var layout = document.querySelector('section.checkout .layout');
    if (layout && layout.parentNode) return { parent: layout.parentNode, before: layout };
    return null;
  }

  // ms: how long a toast stays (ignored in the page flow, where the notice stays until dismissed)
  function notice(before, code, after, tone, ms) {
    if (!document.body) return;
    removeToast(false);
    var t = document.createElement('div');
    t.className = 'rbu-toast rbu-toast--' + tone;
    var icon = document.createElement('span');
    icon.className = 'rbu-toast-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = ICONS[tone === 'ok' ? 'ok' : tone === 'saved' ? 'tag' : 'info'];
    var msg = document.createElement('p');
    msg.className = 'rbu-toast-msg';
    msg.appendChild(document.createTextNode(before));
    var strong = document.createElement('strong');
    strong.className = 'rbu-toast-code';
    strong.textContent = code;
    msg.appendChild(strong);
    msg.appendChild(document.createTextNode(after));
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'rbu-toast-close';
    close.setAttribute('aria-label', 'Dismiss');
    close.innerHTML = ICONS.close;
    close.addEventListener('click', function () { removeToast(true); });
    t.addEventListener('keydown', function (e) { if (e.key === 'Escape') removeToast(true); });
    t.addEventListener('focusin', function (e) {
      var from = e.relatedTarget;
      if (from && t.contains(from)) return;      // focus moved inside the notice: keep the way back
      returnTo = from || null;                   // came from outside (or from nowhere): never keep an old one
    });
    t.appendChild(icon);
    t.appendChild(msg);
    t.appendChild(close);
    var slot = ON_CHECKOUT ? flowSlot() : null;
    inFlow = !!slot;
    if (slot) {
      t.className += ' rbu-toast--flow';
      slot.parent.insertBefore(t, slot.before);
      toast = t;
    } else {
      // A named region, so the toast is inside a landmark like the rest of the page (inside the order summary the
      // notice is already inside <main>).
      t.setAttribute('role', 'region');
      t.setAttribute('aria-label', 'Discount code');
      // Right after the header, so Dismiss comes early in the tab order; it is position: fixed, so nothing moves.
      var header = document.querySelector('body > header');
      if (header && header.parentNode) header.parentNode.insertBefore(t, header.nextSibling);
      else document.body.insertBefore(t, document.body.firstChild);
      toast = t;
      place();
      left = ms || SHORT_MS;
      ticker = setTimeout(tick, 1000);
    }
    announce(msg.textContent);
  }
  // Just under what the header shows: the lowest of its visible parts (nav bar, shipping banner, any bar added to
  // it). The <header> box itself is not used: it is taller than the bar on phones and shorter on desktop.
  function place() {
    if (!toast || inFlow) return;
    var header = document.querySelector('body > header'), top = 0;
    if (header) {
      for (var i = 0; i < header.children.length; i++) {
        var r = header.children[i].getBoundingClientRect();
        if (r.height > 0 && r.bottom > 0 && r.bottom < window.innerHeight / 2) top = Math.max(top, Math.round(r.bottom));
      }
      if (!top) { var h = header.getBoundingClientRect(); if (h.bottom > 0 && h.bottom < window.innerHeight / 2) top = Math.round(h.bottom); }
    }
    toast.style.top = (top + 8) + 'px';
    keepFocusClear();
  }
  // While a toast is up, the browser keeps a focused element below it when it scrolls the element into view
  // (scroll-padding), so tabbing through the page never leaves the focus hidden behind the toast.
  function keepFocusClear() {
    var root = document.documentElement;
    if (padInline === null) padInline = root.style.scrollPaddingTop;
    root.style.scrollPaddingTop = padInline;
    var site = parseFloat(window.getComputedStyle(root).scrollPaddingTop) || 0; // the page's own value, if any
    root.style.scrollPaddingTop = Math.max(site, Math.ceil(toast.getBoundingClientRect().bottom) + 8) + 'px';
  }
  function releaseFocusClear() {
    if (padInline !== null) { document.documentElement.style.scrollPaddingTop = padInline; padInline = null; }
  }
  // The countdown runs only while the notice can be read: not while it is hovered with a mouse or focused, and not while the
  // cookie banner or a dialog covers the page (EU visitors meet the cookie banner on arrival).
  function layerOpen() {
    var layers = document.querySelectorAll('#cookie-consent-popup, .modal-container');
    for (var i = 0; i < layers.length; i++) {
      if (window.getComputedStyle(layers[i]).display !== 'none' && layers[i].getClientRects().length) return true;
    }
    return false;
  }
  // A one-second tick that only counts the seconds the notice could be read, whatever opens or closes when.
  function tick() {
    ticker = null;
    if (!toast || left <= 0) return;
    if (!(HOVER.matches && toast.matches(':hover')) && !toast.contains(document.activeElement) && !layerOpen()) left -= 1000;
    if (left <= 0) { removeToast(false); return; }
    ticker = setTimeout(tick, 1000);
  }
  function removeToast(byUser) {
    if (ticker) { clearTimeout(ticker); ticker = null; }
    left = 0;
    releaseFocusClear();
    if (!toast) return;
    var hadFocus = toast.contains(document.activeElement);
    toast.parentNode && toast.parentNode.removeChild(toast);
    toast = null;
    inFlow = false;
    // Only a notice that held the focus hands it back; one dismissed from elsewhere leaves the focus where it is.
    if (hadFocus) {
      var back = returnTo && document.contains(returnTo) ? returnTo : null;
      if (back && typeof back.focus === 'function') back.focus({ preventScroll: true });
    }
    returnTo = null;
  }
  // A separate polite live region, created empty and filled a moment later so screen readers announce it.
  function announce(text) {
    if (!live) {
      live = document.createElement('div');
      live.className = 'rbu-sr';
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('aria-atomic', 'true');
      document.body.appendChild(live);
    }
    live.textContent = '';
    setTimeout(function () { live.textContent = text; }, 150);
  }
  window.addEventListener('resize', place);
  // Escape closes a toast from anywhere on the page (a notice in the page flow closes with Escape while focused).
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toast && !inFlow && !e.defaultPrevented) removeToast(false);
  });

  var say = {
    // "saved" only when it really was: with storage blocked the code can't follow the visitor to checkout
    saved: function (c) {
      if (stored) notice('Discount code ', c, ' saved. We\u2019ll enter it for you at checkout, on the items it applies to.', 'saved');
      else notice('Your discount code is ', c, '. Enter it at checkout.', 'saved', LONG_MS);
    },
    applied: function (c) { notice('Discount code ', c, ' applied.', 'ok'); },
    notApplicable: function (c) { notice('Discount code ', c, ' was added, but it doesn\u2019t apply to the items in your cart.', 'info', LONG_MS); },
    rejected: function (c) { notice('Discount code ', c, ' couldn\u2019t be applied to this order.', 'info', LONG_MS); },
    hasOther: function (c) { notice('Your order already has a discount code, so ', c, ' wasn\u2019t added.', 'info', LONG_MS); },
    // The server never answered (three tries). Not "saved": the customer is at checkout and nothing was applied.
    noAnswer: function (c) {
      notice('We couldn\u2019t apply discount code ', c, stored
        ? ' right now. We\u2019ll try again next time you open checkout, or you can enter it yourself.'
        : ' right now. You can enter it yourself.', 'info', LONG_MS);
    }
  };

  /* -------------------------------------------------------------- checkout */
  // Waits for checkout.js (window.cart, window.checkoutForm; built on DOMContentLoaded) and for its first cart
  // sync to finish. CheckoutForm.postToServer aborts any request in flight, so posting the code while the
  // initial 'load' sync runs would cancel it. The form carries .loading until that sync settles, and the submit
  // button carries .loading while any request is out.
  function whenCheckoutIdle(cb) {
    var until = Date.now() + 20000;
    (function poll() {
      var cart = window.cart, form = window.checkoutForm;
      if (cart && form && cart.mainCartElement && form.element) {
        var busy = form.element.hasClass('loading') || (form.submitButton && form.submitButton.hasClass('loading'));
        if (!busy) { cb(cart); return; }
      }
      if (Date.now() > until) { cb(null); return; }
      setTimeout(poll, 150);
    })();
  }
  function appliedCode(cart) {
    var el = cart.mainCartElement.find('.discount_code_row span.lbl span').filter(function () {
      return this.textContent.trim() !== '';
    }).first();
    return el.length ? el.text().trim() : '';
  }
  function applyAtCheckout(code, fromLink, attempt) {
    whenCheckoutIdle(function (cart) {
      var hasItems = cart && cart.products && cart.products.length > 0;
      var button = cart && cart.discountCodeButton;
      if (!hasItems || !button || !button.length) { // empty cart (or no discount box): keep the code for later
        if (fromLink) say.saved(code);
        return;
      }
      if (button.hasClass('hidden')) { // the order already has a discount: never replace the customer's code
        var current = appliedCode(cart);
        forget();
        // The same code (any letter case) is already on the order: say so with the code as the cart shows it
        if (current && current.toLowerCase() === code.toLowerCase()) { if (fromLink) say.applied(current); } else say.hasOther(code);
        return;
      }
      if (!button.is(':visible')) { if (fromLink) say.saved(code); return; }
      var main = cart.mainCartElement;
      var retry = function () {
        if (attempt < 2) { setTimeout(function () { applyAtCheckout(code, fromLink, attempt + 1); }, 1500); return; }
        // No answer three times. The cart keeps its "updating" class when a request gets no answer (the site's own
        // code only drops it on an answer); drop it so the order summary isn't left marked as busy.
        main.removeClass('updating');
        say.noAnswer(code); // the code stays saved: tried again on the next checkout visit
      };
      cart.applyDiscountCode(code).then(function (res) {
        // applyDiscountCode answers {accepted:false} both for a refused code and for no answer at all (request
        // aborted or failed). With an answer the cart has run onCartUpdateResponse, which drops .updating.
        if (main.hasClass('updating')) { retry(); return; }
        forget();
        if (res && res.accepted === true) {
          if (res.applies === false) say.notApplicable(code); else say.applied(code);
        } else {
          say.rejected(code);
        }
      }, retry);
    });
  }

  /* ------------------------------------------------------------------ start */
  var fromLink = takeFromUrl();
  if (fromLink) stored = save(fromLink);
  var code = fromLink || saved();
  if (!code) return;
  RBU.ready(function () {
    if (ON_CHECKOUT) applyAtCheckout(code, !!fromLink, 0);
    else if (fromLink) say.saved(fromLink);
  });
})();
