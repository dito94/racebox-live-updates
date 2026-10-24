// 80 discount-links on a normal page: saved notice, URL cleaned, storage, popup held. Screenshots at every viewport.
const { launch, context, quiet, VPS, OUT } = require('./lib');
const base = 'http://127.0.0.1:8914';
(async () => {
  const b = await launch();
  for (const vp of VPS) {
    const ctx = await context(b, base, vp);
    await ctx.addCookies([{ name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }]);
    const p = await ctx.newPage();
    await p.addInitScript(() => { window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
    await p.goto(base + '/store/?utm_source=newsletter&code=SPRING10&utm_medium=email#top', { waitUntil: 'load' });
    await p.waitForTimeout(700);
    const r = await p.evaluate(() => ({ url: location.pathname + location.search + location.hash, stored: localStorage.getItem('rbu-discount-code'),
      toast: document.querySelector('.rbu-toast') && document.querySelector('.rbu-toast').textContent, live: document.querySelector('[role=status].rbu-sr') && document.querySelector('[role=status].rbu-sr').textContent,
      box: document.querySelector('.rbu-toast') && JSON.stringify(document.querySelector('.rbu-toast').getBoundingClientRect()), cls: window.__cls, hscroll: document.documentElement.scrollWidth > innerWidth }));
    await p.screenshot({ path: `${OUT}/after-code-store-${vp[0]}.png` });
    console.log(vp.join('x'), JSON.stringify(r));
    if (vp[0] === 390) { await p.waitForTimeout(5500); console.log('  popup after 6s:', await p.evaluate(() => getComputedStyle(document.querySelector('#newsletter-subscribe-popup')).display)); }
    await ctx.close();
  }
  await b.close();
})();
