const { launch, context } = require('./lib');
(async () => {
  const b = await launch();
  for (const [base, q] of [['http://127.0.0.1:8924', ''], ['http://127.0.0.1:8914', ''], ['http://127.0.0.1:8914', '?code=SPRING10']]) {
    const ctx = await context(b, base, [320, 640]); const p = await ctx.newPage();
    await p.goto(base + '/store/' + q, { waitUntil: 'load' }); await p.waitForTimeout(300);
    console.log(base.slice(-4), q, await p.evaluate(() => { const wide = [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 0.5).slice(0, 4).map(e => e.tagName + '.' + e.className + ' ' + Math.round(e.getBoundingClientRect().right)); return { sw: document.documentElement.scrollWidth, vw: innerWidth, wide }; }));
    await ctx.close();
  }
  await b.close();
})();
