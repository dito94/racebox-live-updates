const { launch, context } = require('./lib');
(async () => {
  const b = await launch();
  for (const [base, q] of [['http://127.0.0.1:8924', ''], ['http://127.0.0.1:8914', ''], ['http://127.0.0.1:8914', '?code=SPRING10']]) {
    for (let run = 0; run < 2; run++) {
    const ctx = await context(b, base, [390, 844]);
    await ctx.addCookies([{ name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }]);
    const p = await ctx.newPage();
    await p.addInitScript(() => { window.__ls = []; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__ls.push({ v: +e.value.toFixed(4), t: Math.round(e.startTime), src: e.sources.map(s => (s.node ? (s.node.className || s.node.nodeName) : '?') + ' ' + JSON.stringify([s.previousRect.y, s.currentRect.y, s.previousRect.height, s.currentRect.height])) }); }).observe({ type: 'layout-shift', buffered: true }); });
    await p.goto(base + '/store/' + q, { waitUntil: 'load' });
    await p.waitForTimeout(1000);
    console.log(base.slice(-4), q || '(no code)', JSON.stringify(await p.evaluate(() => window.__ls)));
    await ctx.close();
    }
  }
  await b.close();
})();
