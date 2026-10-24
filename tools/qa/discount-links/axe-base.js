const fs = require('fs');
const { launch, context } = require('./lib');
const AXE = fs.readFileSync('tools/qa/node_modules/axe-core/axe.min.js', 'utf8');
const ITEMS = fs.readFileSync(__dirname + '/fixtures/checkout-items.html', 'utf8');
(async () => {
  const b = await launch();
  for (const [name, base] of [['original', 'http://127.0.0.1:8927'], ['patched', 'http://127.0.0.1:8924']]) {
    const ctx = await context(b, base, [390, 844]);
    await ctx.addCookies([{ name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }, { name: 'newsletter-subscribe-popup-dismissed', value: 'true', url: base }]);
    await ctx.route(u => u.pathname === '/store/checkout', r => r.request().method() === 'GET' ? r.fulfill({ status: 200, contentType: 'text/html; charset=UTF-8', body: ITEMS }) : r.fallback());
    await ctx.route(u => u.pathname === '/store/checkout/ajax', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    const p = await ctx.newPage(); await p.goto(base + '/store/checkout', { waitUntil: 'load' }); await p.waitForTimeout(1500);
    await p.addScriptTag({ content: AXE });
    const v = await p.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } })).violations.flatMap(v => v.nodes.map(n => v.id + ' ' + n.target.join(' '))));
    console.log(name, JSON.stringify(v));
    await ctx.close();
  }
  await b.close();
})();
