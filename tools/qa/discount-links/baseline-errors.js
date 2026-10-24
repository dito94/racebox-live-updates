// Errors on the ORIGINAL site under the same conditions, to tell pre-existing errors from new ones.
const { launch, context } = require('./lib');
(async () => {
  const b = await launch();
  for (const [base, path, noStorage] of [['http://127.0.0.1:8924', '/store/', true], ['http://127.0.0.1:8914', '/store/?code=SPRING10', true], ['http://127.0.0.1:8924', '/store/checkout', false], ['http://127.0.0.1:8914', '/store/checkout', false]]) {
    const ctx = await context(b, base, [1280, 720]);
    await ctx.addCookies([{ name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }, { name: 'newsletter-subscribe-popup-dismissed', value: 'true', url: base }]);
    if (noStorage) await ctx.addInitScript(() => { for (const k of ['localStorage', 'sessionStorage']) Object.defineProperty(window, k, { get() { throw new DOMException('The operation is insecure.', 'SecurityError'); } }); });
    const p = await ctx.newPage();
    const stacks = []; p.on('pageerror', e => stacks.push((e.stack || '').split('\n').slice(0, 3).join(' | ')));
    const posts = []; p.on('request', r => { if (r.method() === 'POST') posts.push(r.url()); });
    await p.goto(base + path, { waitUntil: 'load' }); await p.waitForTimeout(1500);
    console.log(base.slice(-4), path, noStorage ? '(storage blocked)' : '', JSON.stringify({ errors: ctx.log.errors.filter(e => !/net::ERR_FAILED/.test(e)), stacks, posts }));
    await ctx.close();
  }
  await b.close();
})();
