const { launch, context } = require('./lib');
const base = 'http://127.0.0.1:8924';
(async () => {
  const b = await launch();
  for (const off of [false, true]) for (const vp of [[390, 844], [1280, 720]]) {
    const ctx = await context(b, base, vp);
    await ctx.addCookies([{ name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }, { name: 'newsletter-subscribe-popup-dismissed', value: 'true', url: base }]);
    await ctx.addInitScript(() => { for (const k of ['localStorage', 'sessionStorage']) Object.defineProperty(window, k, { get() { throw new DOMException('x', 'SecurityError'); } }); });
    const p = await ctx.newPage(); await p.goto(base + '/store/?code=SUMMER10', { waitUntil: 'load' }); await p.waitForTimeout(400);
    if (off) await p.evaluate(() => { document.documentElement.style.scrollPaddingTop = '0px'; });
    await p.evaluate(() => { window.scrollTo(0, document.documentElement.scrollHeight); [...document.querySelectorAll('footer a')].pop().focus(); });
    let hidden = 0, part = 0, n = 0;
    for (let i = 0; i < 70; i++) {
      await p.keyboard.press('Shift+Tab'); await p.waitForTimeout(20);
      const r = await p.evaluate(() => { const t = document.querySelector('.rbu-toast'); const a = document.activeElement; if (!t || !a || t.contains(a)) return null; const q = a.getBoundingClientRect(), tr = t.getBoundingClientRect(); const vis = q.width > 0 && q.bottom > 0;
        return { full: vis && q.left >= tr.left - 1 && q.right <= tr.right + 1 && q.top >= tr.top - 1 && q.bottom <= tr.bottom + 1, part: vis && q.right > tr.left && q.left < tr.right && q.bottom > tr.top && q.top < tr.bottom, top: Math.round(q.top) }; });
      if (!r) continue; n++; if (r.full) hidden++; if (r.part) part++;
    }
    console.log(off ? 'WITHOUT scroll-padding' : 'with scroll-padding   ', vp.join('x'), 'stops', n, 'fully hidden', hidden, 'partly', part);
    await ctx.close();
  }
  await b.close();
})();
