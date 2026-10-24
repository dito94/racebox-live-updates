const { launch, context, quiet } = require('./lib');
(async () => {
  const b = await launch();
  for (const vp of [[390, 844], [1280, 720]]) {
    const shots = [];
    for (const base of ['http://127.0.0.1:8927', 'http://127.0.0.1:8927', 'http://127.0.0.1:8924', 'http://127.0.0.1:8924']) {
      const ctx = await context(b, base, vp, { reducedMotion: 'reduce' }); await quiet(ctx, base);
      const p = await ctx.newPage(); await p.goto(base + '/products/racebox-mini', { waitUntil: 'load' });
      await p.addStyleTag({ content: '.newsletter-popup-trigger{visibility:hidden!important}' }); await p.waitForTimeout(1200); await p.mouse.move(0, 0);
      shots.push(await p.screenshot({ fullPage: true })); await ctx.close();
    }
    console.log(vp.join('x'), 'orig vs orig', shots[0].equals(shots[1]), '| patched vs patched', shots[2].equals(shots[3]), '| orig vs patched', shots[0].equals(shots[2]), shots[1].equals(shots[3]));
  }
  await b.close();
})();
