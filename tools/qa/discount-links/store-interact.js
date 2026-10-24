// 60 store-cards: hit-testing, navigation, Add to cart, tab order, hover/focus screenshots.
const { launch, context, quiet, VPS, OUT } = require('./lib');

async function at(p, sel, action) { // pointer action at the centre of an element, as a real pointer would do
  const l = p.locator(sel).first(); await l.scrollIntoViewIfNeeded(); const bx = await l.boundingBox();
  const x = bx.x + bx.width / 2, y = bx.y + bx.height / 2;
  if (action === 'click') await p.mouse.click(x, y); else await p.mouse.move(x, y);
}
const base = process.argv[2] || 'http://127.0.0.1:8914';
(async () => {
  const b = await launch();
  let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };
  for (const vp of VPS) {
    const ctx = await context(b, base, vp); await quiet(ctx, base);
    const p = await ctx.newPage();
    await p.goto(base + '/store/', { waitUntil: 'load' });
    // Hit-test every card: image, name, first bullet, price -> the card link; See More -> see-more; Add to cart -> button
    await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    const hits = await p.evaluate(() => [...document.querySelectorAll('.products-list > div')].map(card => {
      const at = el => { if (!el) return 'none'; el.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = el.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 8)); return t ? (t.closest('a,button') ? (t.closest('a,button').className || t.closest('a,button').tagName) : t.tagName) : 'null'; };
      return { name: card.querySelector('h3').textContent.trim(), img: at(card.querySelector('.img img')), h3: at(card.querySelector('h3')),
        li: at(card.querySelector('li')), price: at(card.querySelector('p.price')), more: at(card.querySelector('a.see-more')), cart: at(card.querySelector('button.submit')),
        same: card.querySelector('.rbu-card-link').getAttribute('href') === card.querySelector('a.see-more').getAttribute('href') };
    }));
    for (const h of hits) {
      ok(h.img === 'rbu-card-link' && h.h3 === 'rbu-card-link' && (h.li === 'rbu-card-link' || h.li === 'none') && h.price === 'rbu-card-link', `${vp} ${h.name} card area ${JSON.stringify(h)}`);
      ok(h.more === 'see-more' && h.cart === 'submit' && h.same, `${vp} ${h.name} buttons ${JSON.stringify(h)}`);
    }
    if (vp[0] === 1280 || vp[0] === 390) {
      // Tab order inside the first card
      await p.goto(base + '/store/', { waitUntil: 'load' });
      await p.focus('.products-list > div:first-child .rbu-card-link >> nth=0');
      const seq = [await p.evaluate(() => document.activeElement.className)];
      for (let i = 0; i < 3; i++) { await p.keyboard.press('Tab'); seq.push(await p.evaluate(() => document.activeElement.className || document.activeElement.tagName)); }
      console.log(vp.join('x'), 'tab order from first card link:', seq.join(' > '));
      ok(seq[0] === 'rbu-card-link' && seq[1] === 'see-more' && seq[2] === 'submit' && seq[3] === 'rbu-card-link', 'tab order ' + seq);
      // focus screenshot (keyboard focus on the 2nd card)
      await p.goto(base + '/store/', { waitUntil: 'load' });
      await p.focus('.products-list > div:nth-child(1) button.submit >> nth=0');
      await p.keyboard.press('Tab');
      const card2 = p.locator('.products-list > div').nth(1);
      await card2.scrollIntoViewIfNeeded();
      await p.waitForTimeout(400);
      const box = await card2.boundingBox();
      await p.screenshot({ path: `${OUT}/after-card-focus-${vp[0]}.png`, clip: { x: Math.max(0, box.x - 20), y: box.y - 20, width: Math.min(vp[0] - Math.max(0, box.x - 20), box.width + 40), height: box.height + 40 } });
      // hover screenshot on the image of the 3rd card
      await p.mouse.move(0, 0);
      const card3 = p.locator('.products-list > div').nth(2);
      await card3.scrollIntoViewIfNeeded();
      await at(p, '.products-list > div:nth-child(3) .img img', 'hover');
      await p.waitForTimeout(600);
      const b3 = await card3.boundingBox();
      await p.screenshot({ path: `${OUT}/after-card-hover-${vp[0]}.png`, clip: { x: Math.max(0, b3.x - 20), y: b3.y - 20, width: Math.min(vp[0] - Math.max(0, b3.x - 20), b3.width + 40), height: b3.height + 40 } });
      // Hover on Add to cart must not underline the name (only the link area does)
      await p.hover('.products-list > div:nth-child(3) button.submit >> nth=0');
      const deco = await p.evaluate(() => getComputedStyle(document.querySelector('.products-list > div:nth-child(3) .rbu-card-link')).textDecorationLine);
      ok(deco === 'none', 'name underlined while hovering Add to cart: ' + deco);
      // Click the image -> product page (follows the 301 to the slug)
      await Promise.all([p.waitForURL(/\/products\//, { timeout: 8000 }).catch(() => {}), at(p, '.products-list > div:nth-child(2) .img img', 'click')]);
      console.log(vp.join('x'), 'image click ->', p.url());
      ok(/\/products\/racebox-mini$/.test(p.url()), 'image click went to ' + p.url());
      // Click a bullet -> product page
      await p.goto(base + '/store/', { waitUntil: 'load' });
      await Promise.all([p.waitForURL(/\/products\//, { timeout: 8000 }).catch(() => {}), at(p, '.products-list > div:nth-child(3) li', 'click')]);
      ok(/\/products\/racebox-mini-s$/.test(p.url()), 'bullet click went to ' + p.url());
      // Keyboard Enter on the name link
      await p.goto(base + '/store/', { waitUntil: 'load' });
      await p.focus('.products-list > div:nth-child(4) .rbu-card-link >> nth=0');
      await Promise.all([p.waitForURL(/\/products\//, { timeout: 8000 }).catch(() => {}), p.keyboard.press('Enter')]);
      ok(/\/products\/racebox-micro$/.test(p.url()), 'Enter went to ' + p.url());
      // See More still works
      await p.goto(base + '/store/', { waitUntil: 'load' });
      await Promise.all([p.waitForURL(/\/products\//, { timeout: 8000 }).catch(() => {}), p.click('.products-list > div:nth-child(1) a.see-more >> nth=0')]);
      ok(/\/products\/racebox$/.test(p.url()), 'See More went to ' + p.url());
      // Add to cart still posts to /store/add-to-cart (the mirror answers 501) and does not open the product page
      await p.goto(base + '/store/', { waitUntil: 'load' });
      const [req] = await Promise.all([p.waitForRequest(r => r.url().includes('/store/add-to-cart'), { timeout: 5000 }).catch(() => null), p.click('.products-list > div:nth-child(2) button.submit >> nth=0')]);
      await p.waitForTimeout(800);
      ok(req && req.method() === 'POST', 'Add to cart did not POST');
      ok(!/\/products\//.test(p.url()), 'Add to cart navigated to ' + p.url());
      console.log(vp.join('x'), 'add to cart:', req && req.method(), req && req.url(), 'page now', p.url());
    }
    console.log(vp.join('x'), 'cards checked:', hits.length);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `${fails} FAILURES` : 'ALL PASS');
})();
