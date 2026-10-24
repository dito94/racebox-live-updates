// Pages without a code must look exactly as before: original vs patched, full-page screenshots, pixel for pixel.
const { launch, context, quiet, OUT } = require('./lib');
const O = 'http://127.0.0.1:8927', P = process.env.BASE || 'http://127.0.0.1:8924';
(async () => {
  const b = await launch(); let diff = 0;
  for (const vp of [[390, 844], [1440, 900]]) for (const path of ['/', '/store/', '/products/racebox-mini', '/store/checkout', '/info/faq']) {
    const shots = [];
    for (const base of [O, P]) {
      const ctx = await context(b, base, vp, { reducedMotion: 'reduce' }); await quiet(ctx, base);
      const p = await ctx.newPage();
      await p.goto(base + path, { waitUntil: 'load' });
      await p.addStyleTag({ content: 'video{visibility:hidden!important}*{caret-color:transparent!important}.newsletter-popup-trigger{visibility:hidden!important}' });
      await p.waitForTimeout(1200); await p.mouse.move(0, 0);
      shots.push(await p.screenshot({ fullPage: true }));
      await ctx.close();
    }
    const same = Buffer.compare(shots[0], shots[1]) === 0;
    if (!same) { diff++; require('fs').writeFileSync(`${OUT}/pix-${P.slice(-4)}-${path.replace(/\W+/g, '_')}-${vp[0]}-orig.png`, shots[0]); require('fs').writeFileSync(`${OUT}/pix-${P.slice(-4)}-${path.replace(/\W+/g, '_')}-${vp[0]}-new.png`, shots[1]); }
    console.log(vp.join('x'), path, same ? 'identical' : `DIFFERENT (${shots[0].length} vs ${shots[1].length} bytes)`);
  }
  await b.close(); console.log(diff ? diff + ' differ' : 'all identical');
})();
