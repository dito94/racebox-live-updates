const { chromium } = require('tools/qa/node_modules/playwright-core');
const VPS = [[390, 844], [768, 1024], [1280, 720], [1366, 768], [1440, 900], [1920, 1080]];
const OUT = 'tools/qa/discount-links/shots';
async function launch() { return chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }); }
// A context that only reaches the local server; console errors, page errors and failed local requests are collected.
async function context(b, base, vp, opts = {}) {
  const ctx = await b.newContext({ viewport: { width: vp[0], height: vp[1] }, ...opts });
  await ctx.route(u => !u.href.startsWith(base), r => r.abort());
  ctx.log = { errors: [], notFound: [], requests: [] };
  ctx.on('page', p => watch(p, ctx.log));
  return ctx;
}
function watch(p, log) {
  p.on('console', m => { if (m.type() === 'error') log.errors.push(m.text()); });
  p.on('pageerror', e => log.errors.push('pageerror: ' + e.message));
  p.on('request', r => log.requests.push(r.method() + ' ' + r.url()));
  p.on('response', r => { if (r.status() === 404) log.notFound.push(r.url()); });
}
// Stop the newsletter popup and cookie banner from covering screenshots (both are on the live site too).
async function quiet(ctx, base) {
  await ctx.addCookies([{ name: 'newsletter-subscribe-popup-dismissed', value: 'true', url: base }, { name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }]);
}
module.exports = { launch, context, quiet, VPS, OUT };
