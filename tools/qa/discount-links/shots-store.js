// Before/after screenshots of /store/: first screen and full page at every viewport, plus CLS and horizontal scroll.
const { launch, context, quiet, VPS, OUT } = require('./lib');
const [label, base] = [process.argv[2], process.argv[3]];
(async () => {
  const b = await launch();
  for (const vp of VPS) {
    const ctx = await context(b, base, vp); await quiet(ctx, base);
    const p = await ctx.newPage();
    await p.addInitScript(() => { window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
    await p.goto(base + '/store/', { waitUntil: 'load' });
    await p.waitForTimeout(600);
    await p.screenshot({ path: `${OUT}/${label}-store-${vp[0]}.png` });
    await p.screenshot({ path: `${OUT}/${label}-store-${vp[0]}-full.png`, fullPage: true });
    const m = await p.evaluate(() => ({ cls: +window.__cls.toFixed(4), hscroll: document.documentElement.scrollWidth > window.innerWidth }));
    console.log(label, vp.join('x'), JSON.stringify(m), 'errors:', ctx.log.errors.length, ctx.log.errors.slice(0, 3), '404:', ctx.log.notFound);
    await ctx.close();
  }
  await b.close();
})();
