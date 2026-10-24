// axe on the notice (in the flow on checkout, toast elsewhere), and a page-wide comparison with and without a code.
const fs = require('fs');
const { launch, context } = require('./lib');
const AXE = fs.readFileSync('tools/qa/node_modules/axe-core/axe.min.js', 'utf8');
const base = process.env.BASE || 'http://127.0.0.1:8924';
const ITEMS = fs.readFileSync(__dirname + '/fixtures/checkout-items.html', 'utf8');
const TAGS = { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } };
async function open(b, vp, path) {
  const ctx = await context(b, base, vp);
  await ctx.addCookies([{ name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }, { name: 'newsletter-subscribe-popup-dismissed', value: 'true', url: base }]);
  await ctx.route(u => u.pathname === '/store/checkout', r => r.request().method() === 'GET' ? r.fulfill({ status: 200, contentType: 'text/html; charset=UTF-8', body: ITEMS }) : r.fallback());
  await ctx.route(u => u.pathname === '/store/checkout/ajax', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ total: '$289.00', shipping: '', shippingFl: null, hasDiscount: false, discountApplies: false, discountCodeAccepted: false, couriersData: [], shippingTermsText: '', destination: { postalCodeRequired: true, supported: true, couriersVaryPerPostCodePrefix: false, exclusiveDistributor: null }, items: [{ sku: 'RB08', quantity: 1, totalText: 'Total', discountCode: null, prices: { regular: '$319.00', promotional: '$289.00', discounted: null, discount: null, volumeDiscount: null, finalWithQuantity: '$289.00' } }] }) }));
  const p = await ctx.newPage(); await p.goto(base + path, { waitUntil: 'load' }); await p.waitForTimeout(3000);
  await p.addScriptTag({ content: AXE });
  return { ctx, p };
}
(async () => {
  const b = await launch(); let fails = 0;
  for (const vp of [[390, 844], [1440, 900]]) for (const path of ['/store/checkout?code=NOPE2026', '/store/?code=SUMMER10']) {
    const { ctx, p } = await open(b, vp, path);
    const own = await p.evaluate(async TAGS => { const res = await axe.run({ include: [['.rbu-toast'], ['.rbu-sr']] }, TAGS); return { v: res.violations.map(v => v.id + ':' + v.nodes.length), incomplete: res.incomplete.map(v => v.id + ':' + v.nodes.length), toast: !!document.querySelector('.rbu-toast') }; }, TAGS);
    const page = await p.evaluate(async TAGS => { const res = await axe.run(document, TAGS); return res.violations.flatMap(v => v.nodes.map(n => v.id + ' ' + n.target.join(' '))); }, TAGS);
    await ctx.close();
    const ctx2 = await open(b, vp, path.split('?')[0]); // same page without a code
    const base0 = await ctx2.p.evaluate(async TAGS => { const res = await axe.run(document, TAGS); return res.violations.flatMap(v => v.nodes.map(n => v.id + ' ' + n.target.join(' '))); }, TAGS);
    await ctx2.ctx.close();
    const added = page.filter(x => !base0.includes(x) && !/rbu-toast|rbu-sr/.test(x) || /rbu-toast|rbu-sr/.test(x));
    console.log(vp.join('x'), path, 'notice present:', own.toast, '| axe on the notice:', JSON.stringify(own.v), 'incomplete', JSON.stringify(own.incomplete), '| new page-wide violations vs no code:', JSON.stringify(added));
    if (!own.toast || own.v.length || added.length) fails++;
  }
  await b.close(); console.log(fails ? fails + ' PROBLEMS' : 'ALL CLEAN');
})();
