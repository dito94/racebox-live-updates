// With the site's own smooth scrolling left on, wait for each scroll to finish, then check the focused element is not behind the toast.
const { launch, context } = require('./lib');
const base = 'http://127.0.0.1:8924';
(async () => {
  const b = await launch();
  for (const vp of [[390, 844], [1280, 720]]) {
    const ctx = await context(b, base, vp);
    await ctx.addCookies([{ name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }, { name: 'newsletter-subscribe-popup-dismissed', value: 'true', url: base }]);
    await ctx.addInitScript(() => { for (const k of ['localStorage', 'sessionStorage']) Object.defineProperty(window, k, { get() { throw new DOMException('x', 'SecurityError'); } }); });
    const p = await ctx.newPage(); await p.goto(base + '/store/?code=SUMMER10', { waitUntil: 'load' }); await p.waitForTimeout(400);
    const sb = await p.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
    await p.evaluate(() => { window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }); [...document.querySelectorAll('footer a')].pop().focus(); });
    let hidden = [], n = 0;
    for (let i = 0; i < 45; i++) {
      await p.keyboard.press('Shift+Tab');
      let y0 = -1; for (let k = 0; k < 20; k++) { await p.waitForTimeout(60); const y = await p.evaluate(() => Math.round(scrollY)); if (y === y0) break; y0 = y; }
      const r = await p.evaluate(() => { const t = document.querySelector('.rbu-toast'), a = document.activeElement; if (!t || !a || t.contains(a)) return null; const q = a.getBoundingClientRect(), tr = t.getBoundingClientRect(); const vis = q.width > 0 && q.bottom > 0 && q.top < innerHeight; return { full: vis && q.left >= tr.left - 1 && q.right <= tr.right + 1 && q.top >= tr.top - 1 && q.bottom <= tr.bottom + 1, d: (a.id || a.className || a.tagName) + ' @' + Math.round(q.top) }; });
      if (!r) continue; n++; if (r.full) hidden.push(r.d);
    }
    console.log(vp.join('x'), 'scroll-behavior', sb, 'stops', n, 'hidden behind toast', hidden.length, JSON.stringify(hidden));
    await ctx.close();
  }
  await b.close();
})();
