const fs = require('fs');
const { launch, context, OUT } = require('./lib');
const base = 'http://127.0.0.1:8924';
const ITEMS = fs.readFileSync(__dirname + '/fixtures/checkout-items.html', 'utf8');
(async () => {
  const b = await launch();
  for (const vp of [[390, 844], [768,1024], [1280, 720], [1440, 900]]) {
    const ctx = await context(b, base, vp);
    await ctx.addCookies([{ name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }, { name: 'newsletter-subscribe-popup-dismissed', value: 'true', url: base }]);
    await ctx.route(u => u.pathname === '/store/checkout', r => r.request().method()==='GET' ? r.fulfill({status:200, contentType:'text/html; charset=UTF-8', body: ITEMS}) : r.fallback());
    await ctx.route(u => u.pathname === '/store/checkout/ajax', r => r.fulfill({status:200, contentType:'application/json', body: '{}'}));
    const p = await ctx.newPage();
    await p.goto(base + '/store/checkout', {waitUntil:'load'}); await p.waitForTimeout(1500);
    const r = await p.evaluate(() => {
      const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top + scrollY), Math.round(r.width), Math.round(r.height), getComputedStyle(e).position, getComputedStyle(e).display]; };
      const main = document.querySelector('main');
      return { main: q('main'), mainKids: [...main.children].map(c => c.tagName + '.' + c.className + '#' + c.id), cartParent: document.querySelector('main .cart').parentElement.className, form: q('main .form'), cart: q('main .cart'), cartKids: [...document.querySelector('main .cart').children].map(c=>c.tagName+'.'+c.className), btn: q('.discount_code_button'), h1: q('main h1'), header: q('body > header'), headerKids: [...document.querySelector('body > header').children].map(c => c.tagName + '.' + c.className + ' ' + JSON.stringify(q('body > header > ' + c.tagName.toLowerCase() + (c.className ? '.' + c.className.split(' ')[0] : '')))), docH: document.documentElement.scrollHeight };
    });
    console.log(vp.join('x'), JSON.stringify(r, null, 1));
    await p.screenshot({ path: `${OUT}/layout-${vp[0]}.png`, fullPage: true });
    await ctx.close();
  }
  await b.close();
})();
