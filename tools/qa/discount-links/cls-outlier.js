const fs = require('fs');
const { launch, context } = require('./lib');
const base = process.env.BASE || 'http://127.0.0.1:8924';
const ITEMS = fs.readFileSync(__dirname + '/fixtures/checkout-items.html', 'utf8');
(async () => {
  const b = await launch();
  const vp = [390, 844];
  for (const q of ['?code=NOPE2026', '']) for (let k = 0; k < 8; k++) {
    const ctx = await context(b, base, vp);
    await ctx.addCookies([{ name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }, { name: 'newsletter-subscribe-popup-dismissed', value: 'true', url: base }]);
    await ctx.addInitScript(() => { window.__sh = []; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__sh.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), s: (e.sources || []).map(s => (s.node && (s.node.className || s.node.tagName)) + ' ' + Math.round(s.previousRect.y) + '->' + Math.round(s.currentRect.y)) }); }).observe({ type: 'layout-shift', buffered: true }); });
    await ctx.route(u => u.pathname === '/store/checkout', r => r.request().method() === 'GET' ? r.fulfill({ status: 200, contentType: 'text/html; charset=UTF-8', body: ITEMS }) : r.fallback());
    await ctx.route(u => u.pathname === '/store/checkout/ajax', async r => {
      const body = JSON.parse(r.request().postData() || '{}'); await new Promise(res => setTimeout(res, body.action === 'load' ? 600 : 200));
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ total: '$289.00', shipping: '', shippingFl: null, hasDiscount: false, discountApplies: false, discountCodeAccepted: false, couriersData: [], shippingTermsText: '', destination: { postalCodeRequired: true, supported: true, couriersVaryPerPostCodePrefix: false, exclusiveDistributor: null },
        items: [{ sku: 'RB08', quantity: 1, totalText: 'Total', discountCode: null, prices: { regular: '$319.00', promotional: '$289.00', discounted: null, discount: null, volumeDiscount: null, finalWithQuantity: '$289.00' } }] }) });
    });
    const p = await ctx.newPage(); await p.goto(base + '/store/checkout' + q, { waitUntil: 'load' }); await p.waitForTimeout(3000);
    const sh = await p.evaluate(() => window.__sh);
    console.log((q || 'none').padEnd(16), 'total', sh.reduce((a, e) => a + e.v, 0).toFixed(4), JSON.stringify(sh));
    await ctx.close();
  }
  await b.close();
})();
