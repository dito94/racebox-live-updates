const { launch, context } = require('./lib');
const base = 'http://127.0.0.1:8924';
(async () => {
  const b = await launch();
  for (const off of [false, true]) for (const vp of [[390, 844], [1280, 720]]) {
    const ctx = await context(b, base, vp);
    await ctx.addCookies([{ name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }, { name: 'newsletter-subscribe-popup-dismissed', value: 'true', url: base }]);
    await ctx.addInitScript(() => { for (const k of ['localStorage', 'sessionStorage']) Object.defineProperty(window, k, { get() { throw new DOMException('x', 'SecurityError'); } }); });
    const p = await ctx.newPage(); await p.goto(base + '/store/?code=SUMMER10', { waitUntil: 'load' }); await p.waitForTimeout(400);
    await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    if (off) await p.evaluate(() => { document.documentElement.style.scrollPaddingTop = '0px'; });
    const res = [];
    for (const method of ['tab', 'focus()']) {
      // put the 2nd card's name link under the toast, then move focus to it
      await p.evaluate(() => { const l = document.querySelectorAll('.rbu-card-link')[1]; const t = document.querySelector('.rbu-toast').getBoundingClientRect(); const r = l.getBoundingClientRect(); window.scrollBy(0, r.top - (t.top + t.height / 2 - r.height / 2)); document.querySelectorAll('.rbu-card-link')[0].focus({ preventScroll: true }); });
      const before = await p.evaluate(() => { const l = document.querySelectorAll('.rbu-card-link')[1]; const r = l.getBoundingClientRect(), t = document.querySelector('.rbu-toast').getBoundingClientRect(); return { top: Math.round(r.top), tb: Math.round(t.bottom) }; });
      // from card 1: tab x2 (See More, Add to cart) + 1 = card 2's link
      if (method === 'tab') for (let i = 0; i < 3; i++) await p.keyboard.press('Tab'); else await p.evaluate(() => document.querySelectorAll('.rbu-card-link')[1].focus());
      await p.waitForTimeout(100);
      const r = await p.evaluate(() => { const a = document.activeElement; const q = a.getBoundingClientRect(), t = document.querySelector('.rbu-toast').getBoundingClientRect(); return { cls: a.className, top: Math.round(q.top), bottom: Math.round(q.bottom), toastBottom: Math.round(t.bottom), hidden: q.top >= t.top - 1 && q.bottom <= t.bottom + 1, overlap: q.bottom > t.top && q.top < t.bottom }; });
      res.push(method + ': ' + JSON.stringify({ before, ...r }));
    }
    console.log(off ? 'WITHOUT' : 'WITH   ', vp.join('x'), res.join('  |  '));
    await ctx.close();
  }
  await b.close();
})();
