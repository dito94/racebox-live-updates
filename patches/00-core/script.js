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
