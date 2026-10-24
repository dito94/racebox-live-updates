// 60 store-cards (review fix 3): taps just outside the buttons do nothing; the buttons, the card area, the EVO card still behave.
const { launch, context, quiet, OUT } = require('./lib');
const base = process.argv[2] || 'http://127.0.0.1:8924';
const wantEvo = process.argv[3] === 'evo';
let fails = 0; const ok = (c, m, d) => { if (!c) { fails++; console.log('FAIL', m, d === undefined ? '' : JSON.stringify(d)); } };
(async () => {
  const b = await launch();
  for (const vp of [[390, 844], [768, 1024], [1280, 720], [1440, 900], [1920, 1080]]) {
    const ctx = await context(b, base, vp); await quiet(ctx, base);
    const p = await ctx.newPage(); await p.goto(base + '/store/', { waitUntil: 'load' });
    await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    const n = await p.locator('div.products-list > div').count();
    const evoFirst = await p.evaluate(() => /EVO/.test(document.querySelector('div.products-list > div h3').textContent));
    ok(evoFirst === wantEvo, `${vp} EVO card first = ${evoFirst}`);
    let probes = 0;
    for (let i = 0; i < n; i++) {
      const r = await p.evaluate(i => {
        const c = document.querySelectorAll('div.products-list > div')[i];
        c.scrollIntoView({ block: 'center', behavior: 'instant' });
        const kind = e => { const a = e && e.closest('a,button'); return a ? (a.matches('.rbu-card-link') ? 'CARDLINK' : a.matches('.see-more') ? 'SEE' : a.matches('button') ? 'ADD' : 'OTHERLINK') : (e ? 'none:' + e.tagName.toLowerCase() : 'null'); };
        const hit = (x, y) => kind(document.elementFromPoint(x, y));
        const btn = c.querySelector('.buttons button').getBoundingClientRect(), sm = c.querySelector('.see-more').getBoundingClientRect(), bx = c.querySelector('.buttons').getBoundingClientRect(), cr = c.getBoundingClientRect();
        const cx = btn.left + btn.width / 2, cy = btn.top + btn.height / 2;
        const f = (sel) => { const e = c.querySelector(sel); if (!e) return 'absent'; const q = e.getBoundingClientRect(); return hit(q.left + Math.min(q.width / 2, 40), q.top + Math.min(q.height / 2, sel === '.img img' ? 100 : 6)); };
        const before = getComputedStyle(c.querySelector('.buttons'), '::before');
        return { name: c.querySelector('h3').textContent.trim(),
          addCentre: hit(cx, cy), seeCentre: hit(sm.left + sm.width / 2, sm.top + sm.height / 2),
          below4: hit(cx, btn.bottom + 4), below10: hit(cx, btn.bottom + 10), below14: hit(cx, btn.bottom + 14), right6: hit(btn.right + 6, cy), left6: hit(btn.left - 6, cy), aboveSee4: hit(sm.left + sm.width / 2, sm.top - 4),
          rightOfSee6: hit(sm.right + 6, sm.top + sm.height / 2), between: hit(btn.left + 4, (sm.bottom + btn.top) / 2),
          img: f('.img img'), h3: f('h3'), li: f('li'), price: f('p.price'),
          inside: bx.left - 10 >= cr.left - 0.5 && bx.right + 10 <= cr.right + 0.5, pseudo: before.content + ' ' + before.zIndex };
      }, i);
      probes++;
      const dead = ['below4', 'below10', 'below14', 'right6', 'left6', 'aboveSee4', 'rightOfSee6', 'between'];
      for (const k of dead) ok(r[k] !== 'CARDLINK', `${vp} ${r.name}: ${k} must not open the product (got ${r[k]})`);
      ok(r.addCentre === 'ADD' && r.seeCentre === 'SEE', `${vp} ${r.name}: buttons clickable`, r);
      ok(['img', 'h3', 'li', 'price'].every(k => r[k] === 'CARDLINK' || r[k] === 'absent'), `${vp} ${r.name}: card area opens the product`, r);
      ok(r.inside, `${vp} ${r.name}: protected margin stays inside the card`, r);
    }
    // real clicks: 10 px below Add to cart stays on /store/; a click on the image still goes to the product; Add to cart still posts
    const card = p.locator('div.products-list > div').nth(wantEvo ? 1 : 1);
    await card.scrollIntoViewIfNeeded();
    const bb = await card.locator('.buttons button').boundingBox();
    await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height + 10); await p.waitForTimeout(500);
    ok(new URL(p.url()).pathname === '/store/', `${vp} click 10px below Add to cart stays on the store: ${p.url()}`);
    await p.mouse.click(bb.x - 6, bb.y + bb.height / 2); await p.waitForTimeout(500);
    ok(new URL(p.url()).pathname === '/store/', `${vp} click 6px left of Add to cart stays on the store: ${p.url()}`);
    const ib = await card.locator('.img img').boundingBox();
    await Promise.all([p.waitForURL(/\/products\//, { timeout: 8000 }).catch(() => {}), p.mouse.click(ib.x + ib.width / 2, ib.y + ib.height / 2)]);
    ok(/\/products\//.test(p.url()), `${vp} image click opens a product: ${p.url()}`);
    if (vp[0] === 390 || vp[0] === 1280) {
      await p.goto(base + '/store/', { waitUntil: 'load' });
      // tab order inside the first card (EVO when present)
      await p.focus('div.products-list > div:first-child .rbu-card-link');
      const seq = [await p.evaluate(() => document.activeElement.className)];
      for (let k = 0; k < 3; k++) { await p.keyboard.press('Tab'); seq.push(await p.evaluate(() => document.activeElement.className || document.activeElement.tagName)); }
      ok(/rbu-card-link/.test(seq[0]) && /see-more/.test(seq[1]) && /submit/.test(seq[2]) && /rbu-card-link/.test(seq[3]), `${vp} tab order ${seq.join(' > ')}`);
      const href = await p.evaluate(() => { const c = document.querySelector('div.products-list > div'); return [c.querySelector('.rbu-card-link').getAttribute('href'), c.querySelector('a.see-more').getAttribute('href')]; });
      ok(href[0] === href[1], `${vp} first card link = See More link ${href}`);
      // add to cart in the first card still posts and does not navigate
      await p.goto(base + '/store/', { waitUntil: 'load' });
      const [req] = await Promise.all([p.waitForRequest(r => r.url().includes('/store/add-to-cart'), { timeout: 5000 }).catch(() => null), p.click('div.products-list > div:first-child button.submit')]);
      ok(req && req.method() === 'POST', `${vp} Add to cart posts in the first card`);
      await p.goto(base + '/store/', { waitUntil: 'load' }); await p.mouse.move(0, 0);
      // screenshot of a card region with the protected margin made visible, for the record
      await p.addStyleTag({ content: 'div.products-list > div .buttons::before{background:rgba(255,0,0,.18)!important}' });
      const c2 = p.locator('div.products-list > div').nth(1); await c2.scrollIntoViewIfNeeded(); const q = await c2.boundingBox();
      await p.screenshot({ path: `${OUT}/fix-near-margin-${vp[0]}${wantEvo ? '-evo' : ''}.png`, clip: { x: Math.max(0, q.x - 10), y: q.y - 10, width: Math.min(vp[0] - Math.max(0, q.x - 10), q.width + 20), height: q.height + 20 } });
    }
    console.log(vp.join('x'), 'cards probed', probes);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `${fails} FAILURES` : 'ALL PASS');
})();
