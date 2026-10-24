// axe-core (WCAG 2.0/2.1/2.2 A+AA) on the changed pages, before vs after; prints only violations that are new.
const fs = require('fs');
const { launch, context } = require('./lib');
const AXE = fs.readFileSync('tools/qa/node_modules/axe-core/axe.min.js', 'utf8');
const ITEMS = fs.readFileSync(__dirname + '/fixtures/checkout-items.html', 'utf8');
const ORIG = 'http://127.0.0.1:8924', NEW = 'http://127.0.0.1:8914';
const ok = { total: '$260.10', totalFl: 260.1, shipping: '', shippingFl: null, hasDiscount: true, discountApplies: true, discountCodeAccepted: true, couriersData: [], shippingTermsText: '', destination: { postalCodeRequired: true, supported: true, couriersVaryPerPostCodePrefix: false, courier: 'dhl', exclusiveDistributor: null }, items: [{ sku: 'RB08', quantity: 1, totalText: 'Total', discountCode: { code: 'SPRING10', discount: '-$28.90' }, prices: { regular: '$319.00', promotional: '$289.00', discounted: '$260.10', discount: '-$28.90', volumeDiscount: null, finalWithQuantity: '$260.10' } }] };
async function scan(b, base, path, vp, fixture) {
  const ctx = await context(b, base, vp);
  await ctx.addCookies([{ name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }, { name: 'newsletter-subscribe-popup-dismissed', value: 'true', url: base }]);
  if (fixture) {
    await ctx.route(u => u.pathname === '/store/checkout', r => r.request().method() === 'GET' ? r.fulfill({ status: 200, contentType: 'text/html; charset=UTF-8', body: fixture }) : r.fallback());
    await ctx.route(u => u.pathname === '/store/checkout/ajax', r => { const a = JSON.parse(r.request().postData()).action; const body = a === 'load' ? { ...ok, hasDiscount: false, discountApplies: false, total: '$289.00', items: [{ ...ok.items[0], discountCode: null, prices: { ...ok.items[0].prices, discounted: null, discount: null, finalWithQuantity: '$289.00' } }] } : ok; r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) }); });
  }
  const p = await ctx.newPage();
  await p.goto(base + path, { waitUntil: 'load' }); await p.waitForTimeout(fixture ? 2000 : 800);
  // the original has no discount links: apply the same code through the site's own path so both sides match
  if (fixture && base === ORIG) { await p.evaluate(() => window.cart.applyDiscountCode('SPRING10')); await p.waitForTimeout(500); }
  await p.addScriptTag({ content: AXE });
  const res = await p.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } })).violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, targets: v.nodes.map(n => n.html.slice(0, 160)) })));
  const toast = await p.evaluate(() => !!document.querySelector('.rbu-toast'));
  await ctx.close();
  return { res, toast };
}
(async () => {
  const b = await launch(); let newCount = 0;
  for (const vp of [[390, 844], [1280, 720]]) {
    for (const [label, path, fixture] of [['store', '/store/', null], ['store + notice', '/store/?code=SPRING10', null], ['checkout fixture + applied notice', '/store/checkout?code=SPRING10', ITEMS], ['empty checkout + saved notice', '/store/checkout?code=SPRING10', null]]) {
      const before = await scan(b, ORIG, path.split('?')[0], vp, fixture);
      const after = await scan(b, NEW, path, vp, fixture);
      const seen = new Set(before.res.flatMap(v => v.targets.map(t => v.id + '|' + t)));
      const fresh = after.res.flatMap(v => v.targets.filter(t => !seen.has(v.id + '|' + t)).map(t => `${v.id} (${v.impact}) ${t}`));
      newCount += fresh.length;
      console.log(vp.join('x'), label, '| notice shown:', after.toast, '| before:', before.res.map(v => v.id + 'x' + v.n).join(',') || 'none', '| after:', after.res.map(v => v.id + 'x' + v.n).join(',') || 'none', '| NEW:', fresh.length ? fresh : 'none');
    }
  }
  await b.close();
  console.log(newCount ? `${newCount} NEW VIOLATIONS` : 'NO NEW VIOLATIONS');
})();
