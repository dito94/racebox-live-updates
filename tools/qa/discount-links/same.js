// Pages that should look exactly as before: compare full-page screenshots of original vs patched, pixel for pixel.
const { launch, context, quiet } = require('./lib');
(async () => {
  const b = await launch(); let diff = 0;
  for (const vp of [[390, 844], [1280, 720]]) for (const path of ['/', '/products/racebox-mini', '/store/checkout', '/store/']) {
    const shots = [];
    for (const base of ['http://127.0.0.1:8924', 'http://127.0.0.1:8914']) {
      const ctx = await context(b, base, vp, { reducedMotion: 'reduce' }); await quiet(ctx, base);
      const p = await ctx.newPage();
      await p.goto(base + path, { waitUntil: 'load' });
      await p.addStyleTag({ content: 'video{visibility:hidden!important}*{caret-color:transparent!important}' });
      await p.waitForTimeout(800);
      shots.push(await p.screenshot({ fullPage: true }));
      await ctx.close();
    }
    const same = Buffer.compare(shots[0], shots[1]) === 0;
    if (!same) diff++;
    console.log(vp.join('x'), path, same ? 'identical' : `DIFFERENT (${shots[0].length} vs ${shots[1].length} bytes)`);
  }
  await b.close(); console.log(diff ? diff + ' differ' : 'all identical');
})();
