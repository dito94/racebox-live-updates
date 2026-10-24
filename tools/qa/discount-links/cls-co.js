const fs = require('fs');
const { launch, context } = require('./lib');
const base = process.env.BASE || 'http://127.0.0.1:8924';
const ITEMS = fs.readFileSync(__dirname + '/fixtures/checkout-items.html', 'utf8');
(async () => {
  const b = await launch();
  for (const vp of [[390, 844], [768, 1024], [1280, 720], [1440, 900]]) for (const q of ['', '?code=NOPE2026', '?code=SPRING10']) {
    const vals = [];
    for (let k = 0; k < 3; k++) {
      const ctx = await context(b, base, vp);
      await ctx.addCookies([{ name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }, { name: 'newsletter-subscribe-popup-dismissed', value: 'true', url: base }]);
      await ctx.addInitScript(() => { window.__cls = 0; window.__src = []; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) { window.__cls += e.value; (e.sources || []).forEach(s => window.__src.push((s.node && (s.node.className || s.node.tagName)) + '')); } }).observe({ type: 'layout-shift', buffered: true }); });
      await ctx.route(u => u.pathname === '/store/checkout', r => r.request().method() === 'GET' ? r.fulfill({ status: 200, contentType: 'text/html; charset=UTF-8', body: ITEMS }) : r.fallback());
      let server = false;
      await ctx.route(u => u.pathname === '/store/checkout/ajax', async r => {
        const body = JSON.parse(r.request().postData() || '{}'); const ok = body.action === 'apply-discount-code' && body.code === 'SPRING10'; if (ok) server = true;
        await new Promise(res => setTimeout(res, body.action === 'load' ? 600 : 200));
        const fin = server ? '260.10' : '289.00';
        r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ total: '$' + fin, shipping: '', shippingFl: null, hasDiscount: server, discountApplies: server, discountCodeAccepted: ok, couriersData: [], shippingTermsText: '', destination: { postalCodeRequired: true, supported: true, couriersVaryPerPostCodePrefix: false, exclusiveDistributor: null },
          items: [{ sku: 'RB08', quantity: 1, totalText: 'Total', discountCode: server ? { code: 'SPRING10', discount: '-$28.90' } : null, prices: { regular: '$319.00', promotional: '$289.00', discounted: server ? '$260.10' : null, discount: server ? '-$28.90' : null, volumeDiscount: null, finalWithQuantity: '$' + fin } }] }) });
      });
      const p = await ctx.newPage(); await p.goto(base + '/store/checkout' + q, { waitUntil: 'load' }); await p.waitForTimeout(3000);
      const r = await p.evaluate(() => ({ cls: window.__cls, src: [...new Set(window.__src)].slice(0, 6) }));
      vals.push(r.cls); if (k === 0) vals.src = r.src;
      await ctx.close();
    }
    console.log(vp.join('x'), (q || '(no code)').padEnd(16), 'CLS runs', vals.map(v => v.toFixed(4)).join(' '), JSON.stringify(vals.src));
  }
  await b.close();
})();
