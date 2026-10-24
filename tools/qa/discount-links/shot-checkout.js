const fs = require('fs');
const { launch, context, OUT } = require('./lib');
const base = process.env.BASE || 'http://127.0.0.1:8924';
const ITEMS = fs.readFileSync(__dirname + '/fixtures/checkout-items.html', 'utf8');
(async () => {
  const b = await launch();
  for (const vp of [[1440, 900], [390, 844]]) for (const code of ['NOPE2026', 'SPRING10']) {
    const ctx = await context(b, base, vp);
    await ctx.addCookies([{ name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }, { name: 'newsletter-subscribe-popup-dismissed', value: 'true', url: base }]);
    await ctx.route(u => u.pathname === '/store/checkout', r => r.request().method() === 'GET' ? r.fulfill({ status: 200, contentType: 'text/html; charset=UTF-8', body: ITEMS }) : r.fallback());
    let server = false;
    await ctx.route(u => u.pathname === '/store/checkout/ajax', async r => {
      const body = JSON.parse(r.request().postData() || '{}'); const ok = body.action === 'apply-discount-code' && body.code === 'SPRING10'; if (ok) server = true;
      const fin = server ? '260.10' : '289.00';
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ total: '$' + fin, shipping: '', shippingFl: null, hasDiscount: server, discountApplies: server, discountCodeAccepted: ok, couriersData: [], shippingTermsText: '', destination: { postalCodeRequired: true, supported: true, couriersVaryPerPostCodePrefix: false, exclusiveDistributor: null },
        items: [{ sku: 'RB08', quantity: 1, totalText: 'Total', discountCode: server ? { code: 'SPRING10', discount: '-$28.90' } : null, prices: { regular: '$319.00', promotional: '$289.00', discounted: server ? '$260.10' : null, discount: server ? '-$28.90' : null, volumeDiscount: null, finalWithQuantity: '$' + fin } }] }) });
    });
    const p = await ctx.newPage(); await p.goto(base + '/store/checkout?code=' + code, { waitUntil: 'load' }); await p.waitForTimeout(2500);
    await p.screenshot({ path: `${OUT}/fix-co-${code}-${vp[0]}.png`, fullPage: true });
    await ctx.close();
  }
  await b.close();
})();
