const { launch, context } = require('./lib');
const [base, path, vpw, vph, runs] = [process.argv[2], process.argv[3], +process.argv[4], +process.argv[5], +(process.argv[6] || 4)];
(async () => {
  const b = await launch();
  for (let i = 0; i < runs; i++) {
    const ctx = await context(b, base, [vpw, vph]);
    await ctx.addCookies([{ name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }]);
    const p = await ctx.newPage();
    await p.addInitScript(() => { window.__ls = []; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__ls.push({ v: +e.value.toFixed(4), t: Math.round(e.startTime), src: e.sources.map(s => (s.node ? (s.node.nodeName + '.' + (s.node.className || '')).slice(0, 40) : '?') + ' y ' + Math.round(s.previousRect.y) + '->' + Math.round(s.currentRect.y) + ' h ' + Math.round(s.previousRect.height) + '->' + Math.round(s.currentRect.height)) }); }).observe({ type: 'layout-shift', buffered: true }); });
    await p.goto(base + path, { waitUntil: 'load' }); await p.waitForTimeout(1200);
    const ls = await p.evaluate(() => window.__ls);
    console.log(base.slice(-4), path, vpw, 'run', i, 'CLS', ls.reduce((a, e) => a + e.v, 0).toFixed(4), JSON.stringify(ls));
    await ctx.close();
  }
  await b.close();
})();
