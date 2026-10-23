/* 80 discount-links: a link can carry a discount code, so customers never type one.
   Any page: ?code=XXXX (also discount=, coupon=, promo=). The code is saved for 30 days (RBU.store), taken out of
   the address bar and confirmed in a small notice. On /store/checkout it is applied through the site's own
   Cart.applyDiscountCode once the cart has items, the first cart sync has finished and no discount is applied yet. */
(function () {
  'use strict';
  var RBU = window.RBU = window.RBU || {};
  var KEY = 'rbu-discount-code';
  var PARAMS = ['code', 'discount', 'coupon', 'promo'];
  var VALID = /^[A-Za-z0-9_-]{2,40}$/;
  var DAYS = 30;
  var ON_CHECKOUT = /^\/store\/checkout(?:\.html)?\/?$/.test(window.location.pathname);
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
  // One small notice at a time, under the header. Built with text nodes only: the code is never parsed as HTML.
  var ICONS = {
    tag: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
    ok: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><circle cx="12" cy="12" r="10"/><path d="m7.5 12.5 3 3 6-6.5"/></svg>',
    info: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" focusable="false"><circle cx="12" cy="12" r="10"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r=".6" fill="currentColor"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>'
  };
  var toast = null, live = null, ticker = null, left = 0, returnTo = null;

  function notice(before, code, after, tone, stays) {
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
      if (e.relatedTarget && !t.contains(e.relatedTarget)) returnTo = e.relatedTarget;
    });
    t.appendChild(icon);
    t.appendChild(msg);
    t.appendChild(close);
    // Right after the header, so Dismiss comes early in the tab order; it is position: fixed, so nothing moves.
    var header = document.querySelector('body > header');
    if (header && header.parentNode) header.parentNode.insertBefore(t, header.nextSibling);
    else document.body.insertBefore(t, document.body.firstChild);
    toast = t;
    place();
    announce(msg.textContent);
    if (!stays) { left = 10000; ticker = setTimeout(tick, 1000); }
  }
  // Just under what the header shows: the lowest of its visible parts (nav bar, shipping banner, any bar added to
  // it). The <header> box itself is not used: it is taller than the bar on phones and shorter on desktop.
  function place() {
    if (!toast) return;
    var header = document.querySelector('body > header'), top = 0;
    if (header) {
      for (var i = 0; i < header.children.length; i++) {
        var r = header.children[i].getBoundingClientRect();
        if (r.height > 0 && r.bottom > 0 && r.bottom < window.innerHeight / 2) top = Math.max(top, Math.round(r.bottom));
      }
      if (!top) { var h = header.getBoundingClientRect(); if (h.bottom > 0 && h.bottom < window.innerHeight / 2) top = Math.round(h.bottom); }
    }
    toast.style.top = (top + 8) + 'px';
  }
  // The countdown runs only while the notice can be read: not while it is hovered or focused, and not while the
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
    if (!toast.matches(':hover') && !toast.contains(document.activeElement) && !layerOpen()) left -= 1000;
    if (left <= 0) { removeToast(false); return; }
    ticker = setTimeout(tick, 1000);
  }
  function removeToast(byUser) {
    if (ticker) { clearTimeout(ticker); ticker = null; }
    left = 0;
    if (!toast) return;
    var hadFocus = toast.contains(document.activeElement);
    toast.parentNode && toast.parentNode.removeChild(toast);
    toast = null;
    if (hadFocus || byUser) {
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

  var say = {
    // "saved" only when it really was: with storage blocked the code can't follow the visitor to checkout
    saved: function (c) {
      if (stored) notice('Discount code ', c, ' saved. It\u2019s applied automatically at checkout.', 'saved');
      else notice('Your discount code is ', c, '. Enter it at checkout.', 'saved', true);
    },
    applied: function (c) { notice('Discount code ', c, ' applied.', 'ok'); },
    notApplicable: function (c) { notice('Discount code ', c, ' was added, but it doesn\u2019t apply to the items in your cart.', 'info', true); },
    rejected: function (c) { notice('Discount code ', c, ' couldn\u2019t be applied to this order.', 'info', true); },
    hasOther: function (c) { notice('Your order already has a discount code, so ', c, ' wasn\u2019t added.', 'info', true); }
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
        if (current.toLowerCase() === code.toLowerCase()) { if (fromLink) say.applied(code); } else say.hasOther(code);
        return;
      }
      if (!button.is(':visible')) { if (fromLink) say.saved(code); return; }
      var main = cart.mainCartElement;
      var retry = function () {
        if (attempt < 2) setTimeout(function () { applyAtCheckout(code, fromLink, attempt + 1); }, 1500);
        else if (fromLink) say.saved(code); // still saved: tried again on the next checkout visit
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

  /* ------------------------------------------------- the newsletter popup */
  // Someone who arrived with a code (often from the newsletter itself) should not get the "Get 10% OFF!" popup
  // five seconds later. Hold its auto-open timer; the "Get 10% off!" button still opens it.
  function holdNewsletterPopup() {
    if (!window.jQuery) return;
    window.jQuery(function () {
      setTimeout(function () {
        var p = window.newsletterSubscribePopup;
        if (p && typeof p.holdAutoShowTimer === 'function') p.holdAutoShowTimer();
      }, 0);
    });
  }

  /* ------------------------------------------------------------------ start */
  var fromLink = takeFromUrl();
  if (fromLink) stored = save(fromLink);
  var code = fromLink || saved();
  if (!code) return;
  holdNewsletterPopup();
  RBU.ready(function () {
    if (ON_CHECKOUT) applyAtCheckout(code, !!fromLink, 0);
    else if (fromLink) say.saved(fromLink);
  });
})();
