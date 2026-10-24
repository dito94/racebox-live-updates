// 80 discount-links on /store/checkout: the fixture (cart with items) served at /store/checkout, the cart endpoint
// mocked with responses shaped like checkout.js's ServerReturnData. Every scenario in a fresh browser context.
const fs = require('fs');
const { launch, context, OUT } = require('./lib');
const base = process.env.BASE || 'http://127.0.0.1:8924';
const FIX = process.env.FIX || (__dirname + '/fixtures/');
const ITEMS = fs.readFileSync(FIX + 'checkout-items.html', 'utf8');
const HAS = fs.readFileSync(FIX + 'checkout-has-discount.html', 'utf8');
const ACCEPT = { SPRING10: 0.10, WELCOME5: 0.05 }, NOT_APPLICABLE = ['PREORDER10'];

function state(disc) { // disc: null | {code, applies, pct}
  const has = !!disc, applies = has && disc.applies;
  const off = applies ? +(289 * disc.pct).toFixed(2) : 0, fin = (289 - off).toFixed(2);
  return { total: '$' + fin, totalFl: +fin, shipping: '', shippingFl: null, importDutyAndTaxes: null, importDutyAndTaxesFl: null,
    freeShipping: false, hasDiscount: has, discountApplies: !!applies,
    couriersData: [{ name: 'DHL', code: 'dhl', selected: true }], shippingTermsText: 'Delivery via DHL.',
    destination: { postalCodeRequired: true, supported: true, couriersVaryPerPostCodePrefix: false, courier: 'dhl', exclusiveDistributor: null },
    items: [{ sku: 'RB08', quantity: 1, totalText: 'Total', discountCode: has ? { code: disc.code, discount: applies ? '-$' + off.toFixed(2) : null } : null,
      prices: { regular: '$319.00', promotional: '$289.00', discounted: applies ? '$' + fin : null, discount: applies ? '-$' + off.toFixed(2) : null, volumeDiscount: null, finalWithQuantity: '$' + fin } }] };
}

// One scenario. opts: page (fixture html or null for the mirrored empty checkout), url, before (async fn(page) run first),
// initial (discount already on the server cart), fail (number of apply requests answered with HTTP 500), noStorage.
async function run(b, name, opts) {
  const ctx = await context(b, base, opts.vp || [1280, 720]);
  await ctx.addCookies([{ name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }, { name: 'newsletter-subscribe-popup-dismissed', value: 'true', url: base }]);
  if (opts.noStorage) await ctx.addInitScript(() => {
    for (const k of ['localStorage', 'sessionStorage']) Object.defineProperty(window, k, { get() { throw new DOMException('The operation is insecure.', 'SecurityError'); } });
  });
  const log = [], aborted = [];
  let server = opts.initial || null, fails = opts.fail || 0;
  if (opts.page) await ctx.route(u => u.pathname === '/store/checkout' || u.pathname === '/store/checkout/', r => r.request().method() === 'GET' ? r.fulfill({ status: 200, contentType: 'text/html; charset=UTF-8', body: opts.page }) : r.fallback());
  await ctx.route(u => u.pathname === '/store/checkout/ajax', async r => {
    const body = JSON.parse(r.request().postData() || '{}');
    const entry = { action: body.action, code: body.code, t0: Date.now() };
    log.push(entry);
    if (body.action === 'load') await new Promise(res => setTimeout(res, 1200)); // a slow first sync
    if (body.action === 'apply-discount-code') {
      if (opts.onFirstApply && !opts._hooked) { opts._hooked = true; await opts.onFirstApply(pageRef.p); }
      await new Promise(res => setTimeout(res, 300));
      if (fails > 0) { fails--; entry.status = 500; return r.fulfill({ status: 500, body: 'error' }).catch(() => {}); }
      const c = String(body.code || '').toUpperCase();
      let accepted = false;
      if (ACCEPT[c]) { server = { code: body.code, applies: true, pct: ACCEPT[c] }; accepted = true; }
      else if (NOT_APPLICABLE.includes(c)) { server = { code: body.code, applies: false, pct: 0 }; accepted = true; }
      entry.status = 200; entry.t1 = Date.now();
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...state(server), discountCodeAccepted: accepted }) }).catch(() => {});
    }
    entry.status = 200; entry.t1 = Date.now();
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(state(server)) }).catch(() => {});
  });
  const pageRef = {};
  const p = await ctx.newPage(); pageRef.p = p;
  p.on('requestfailed', rq => { if (rq.url().startsWith(base)) aborted.push(rq.method() + ' ' + new URL(rq.url()).pathname + ' ' + (rq.failure() || {}).errorText); });
  let dialogs = 0; p.on('dialog', d => { dialogs++; d.dismiss(); });
  if (opts.before) await opts.before(p);
  await p.goto(base + opts.url, { waitUntil: 'load' });
  await p.waitForTimeout(opts.wait || 3500);
  const r = await p.evaluate(() => {
    let stored = null; try { stored = localStorage.getItem('rbu-discount-code'); } catch (e) { stored = 'blocked'; }
    const q = s => document.querySelector(s);
    const btn = q('main .cart .discount_code_button');
    const tt = q('.rbu-toast');
    return { url: location.pathname + location.search + location.hash, stored,
      toastPos: tt ? getComputedStyle(tt).position : null, toastIn: tt ? (tt.parentElement.matches('main .cart') ? 'cart' : tt.parentElement.tagName + '.' + tt.parentElement.className) : null,
      cartUpdating: !!(q('main .cart') && q('main .cart').classList.contains('updating')),
      toast: q('.rbu-toast') ? q('.rbu-toast').textContent.trim() : null, live: q('.rbu-sr[role=status]') ? q('.rbu-sr[role=status]').textContent : null,
      button: btn ? (btn.classList.contains('hidden') ? 'hidden' : 'shown') : 'none',
      row: q('main .cart > .discount_code_row') ? (q('main .cart > .discount_code_row').classList.contains('hidden') ? 'hidden' : 'shown') : 'none',
      total: q('main .cart .cart_total .price') ? q('main .cart .cart_total .price').textContent : null,
      productCode: q('main .cart .product .discount_code_row span.lbl span') ? q('main .cart .product .discount_code_row span.lbl span').textContent : null,
      formLoading: q('#checkout-form') ? q('#checkout-form').classList.contains('loading') : null };
  });
  const errors = ctx.log.errors.filter(e => !/net::ERR_FAILED/.test(e));
  const res = { name, ...r, posts: log.map(e => e.action + (e.code ? ':' + e.code : '') + (e.status === 500 ? '(500)' : '')), aborted, dialogs, errors };
  // the apply request must start after the load sync answered
  const load = log.find(e => e.action === 'load'), apply = log.find(e => e.action === 'apply-discount-code');
  res.applyAfterLoad = !apply || !load || (load.t1 && apply.t0 >= load.t1);
  if (opts.after) res.extra = await opts.after(p);
  if (opts.shot) await p.screenshot({ path: `${OUT}/${opts.shot}` });
  await ctx.close();
  return res;
}

(async () => {
  const b = await launch();
  let fails = 0; const ok = (c, m, r) => { if (!c) { fails++; console.log('FAIL', m, JSON.stringify(r)); } };
  const results = []; const ONLY = process.env.ONLY;
  const check = async (name, opts, expect) => { if (ONLY && !name.startsWith(ONLY)) return; const r = await run(b, name, opts); results.push(r); console.log(JSON.stringify(r)); expect(r); };

  await check('A link on checkout, accepted', { page: ITEMS, url: '/store/checkout?code=SPRING10&utm_source=mail', shot: 'checkout-applied-1280.png' }, r => {
    ok(r.toast === 'Discount code SPRING10 applied.', 'A toast', r); ok(r.stored === null, 'A cleared', r);
    ok(r.button === 'hidden' && r.row === 'shown' && r.total === '$260.10' && r.productCode === 'SPRING10', 'A cart UI', r);
    ok(r.url === '/store/checkout?utm_source=mail', 'A url', r); ok(r.toastPos === 'static' && r.toastIn === 'cart', 'A toast is in the cart, in the flow', r); ok(r.applyAfterLoad && r.aborted.length === 0, 'A no abort', r);
    ok(r.posts.join() === 'load,apply-discount-code:SPRING10', 'A posts', r); ok(r.errors.length === 0, 'A errors', r); });

  await check('B saved on the store, applied at checkout', { page: ITEMS, url: '/store/checkout', before: async p => { await p.goto(base + '/store/?coupon=SPRING10', { waitUntil: 'load' }); await p.waitForTimeout(300); } }, r => {
    ok(r.toast === 'Discount code SPRING10 applied.' && r.stored === null && r.button === 'hidden', 'B', r); ok(r.applyAfterLoad && r.aborted.length === 0, 'B no abort', r); });

  await check('C rejected', { page: ITEMS, url: '/store/checkout?code=NOPE2026', shot: 'checkout-rejected-1280.png' }, r => {
    ok(r.toast === 'Discount code NOPE2026 couldn’t be applied to this order.', 'C toast', r); ok(r.stored === null && r.button === 'shown' && r.row === 'hidden' && r.total === '$289.00', 'C cart', r); ok(r.toastPos === 'static' && r.toastIn === 'cart', 'C in flow', r); ok(r.errors.length === 0, 'C errors', r); });

  await check('D accepted, applies to nothing in the cart', { page: ITEMS, url: '/store/checkout?promo=PREORDER10' }, r => {
    ok(r.toast === 'Discount code PREORDER10 was added, but it doesn’t apply to the items in your cart.', 'D toast', r); ok(r.stored === null, 'D cleared', r); });

  await check('E empty cart (mirrored page), code from link', { page: null, url: '/store/checkout?code=SPRING10', shot: 'checkout-empty-1280.png' }, r => {
    ok(r.toast === 'Discount code SPRING10 saved. We’ll enter it for you at checkout, on the items it applies to.', 'E toast', r); ok(r.stored && r.stored.includes('SPRING10'), 'E kept', r);
    ok(!r.posts.some(x => x.startsWith('apply')), 'E no apply', r); });

  await check('E2 empty cart, stored code, no link', { page: null, url: '/store/checkout', before: async p => { await p.goto(base + '/store/?code=SPRING10', { waitUntil: 'load' }); } }, r => {
    ok(r.toast === null && r.stored && r.stored.includes('SPRING10') && !r.posts.some(x => x.startsWith('apply')), 'E2 silent and kept', r); });

  await check('F storage blocked, link on store', { page: null, url: '/store/?code=SPRING10', noStorage: true, shot: 'store-nostorage-1280.png' }, r => {
    ok(r.toast === 'Your discount code is SPRING10. Enter it at checkout.' && r.stored === 'blocked' && r.url === '/store/', 'F', r); ok(r.errors.every(e => /^pageerror: The operation is insecure\.$|status of 501/.test(e)), 'F errors beyond the baseline (same 2 errors on the original page)', r); });

  await check('F2 storage blocked, link on checkout with items', { page: ITEMS, url: '/store/checkout?code=SPRING10', noStorage: true }, r => {
    ok(r.toast === 'Discount code SPRING10 applied.' && r.button === 'hidden', 'F2 applied from memory', r); ok(r.errors.length === 0, 'F2 errors', r); });

  for (const [label, q] of [['script', '?code=%3Cscript%3Ealert(1)%3C%2Fscript%3E'], ['short', '?code=A'], ['long', '?code=' + 'X'.repeat(41)], ['space', '?code=AB%20CD'], ['malformed', '?promo=%E0%A4%A&x=1'], ['html', '?discount=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E'], ['empty', '?code=']])
    await check('G bad code ' + label, { page: null, url: '/store/' + q }, r => {
      ok(r.toast === null && r.stored === null && r.dialogs === 0, 'G ' + label + ' ignored', r);
      ok(r.url === '/store/' + (label === 'malformed' ? '?x=1' : ''), 'G ' + label + ' url cleaned', r); ok(r.errors.length === 0, 'G errors', r); });

  await check('H already has another discount', { page: HAS, initial: { code: 'WELCOME5', applies: true, pct: 0.05 }, url: '/store/checkout?code=SPRING10', shot: 'checkout-hasother-1280.png' }, r => {
    ok(r.toast === 'Your order already has a discount code, so SPRING10 wasn’t added.', 'H toast', r); ok(!r.posts.some(x => x.startsWith('apply')) && r.stored === null && r.productCode === 'WELCOME5', 'H untouched', r); });

  await check('H2 same code already applied', { page: HAS, initial: { code: 'WELCOME5', applies: true, pct: 0.05 }, url: '/store/checkout?code=welcome5' }, r => {
    ok(r.toast === 'Discount code WELCOME5 applied.' && !r.posts.some(x => x.startsWith('apply')) && r.stored === null, 'H2 shows the code as the cart shows it', r); });

  await check('I no answer first (HTTP 500), then accepted on retry', { page: ITEMS, url: '/store/checkout?code=SPRING10', fail: 1, wait: 6000 }, r => {
    ok(r.toast === 'Discount code SPRING10 applied.' && r.posts.join() === 'load,apply-discount-code:SPRING10(500),apply-discount-code:SPRING10', 'I retry', r); });

  await check('I2 no answer three times: code kept', { page: ITEMS, url: '/store/checkout?code=SPRING10', fail: 3, wait: 9000 }, r => {
    ok(r.stored && r.stored.includes('SPRING10') && r.posts.filter(x => x.startsWith('apply')).length === 3, 'I2 kept after 3 tries', r);
    ok(r.toast === 'We couldn’t apply discount code SPRING10 right now. We’ll try again next time you open checkout, or you can enter it yourself.', 'I2 wording (not "saved")', r);
    ok(r.cartUpdating === false, 'I2 cart not left busy', r); });

  await check('L customer changes country while the code is being applied', { page: ITEMS, url: '/store/checkout?code=SPRING10', wait: 7000,
    onFirstApply: async p => { await p.evaluate(() => { const s = document.querySelector('#shippingAddressFields select.country-select'); s.value = 'DE'; s.dispatchEvent(new Event('change', { bubbles: true })); }); } }, r => {
    ok(r.toast === 'Discount code SPRING10 applied.' && r.button === 'hidden' && r.stored === null, 'L applied in the end', r);
    ok(r.posts.join() === 'load,apply-discount-code:SPRING10,save-address,apply-discount-code:SPRING10', 'L sequence: aborted apply, address sync, retry', r); });

  await check('J first valid param wins, all removed', { page: null, url: '/store/?promo=bad!&Discount=SUMMER_24&code=OTHER1&utm_campaign=x#cards' }, r => {
    ok(r.stored && r.stored.includes('SUMMER_24') && r.url === '/store/?utm_campaign=x#cards', 'J', r); });

  await check('K expired code ignored', { page: ITEMS, url: '/store/checkout', before: async p => { await p.goto(base + '/store/', { waitUntil: 'load' }); await p.evaluate(() => localStorage.setItem('rbu-discount-code', JSON.stringify({ code: 'OLDCODE', exp: Date.now() - 1000 }))); } }, r => {
    ok(r.toast === null && r.stored === null && !r.posts.some(x => x.startsWith('apply')), 'K', r); });

  await check('K2 tampered storage ignored', { page: ITEMS, url: '/store/checkout', before: async p => { await p.goto(base + '/store/', { waitUntil: 'load' }); await p.evaluate(() => localStorage.setItem('rbu-discount-code', JSON.stringify({ code: '<b>x</b>', exp: Date.now() + 1e9 }))); } }, r => {
    ok(r.toast === null && r.stored === null && !r.posts.some(x => x.startsWith('apply')), 'K2', r); });


  // ---- review fix 1: the result notice is in the page flow on checkout and never covers the form or the cart
  const scan = async p => p.evaluate(async () => {
    const out = { tested: 0, covered: [], fixedToasts: document.querySelectorAll('.rbu-toast').length ? getComputedStyle(document.querySelector('.rbu-toast')).position : null };
    const hdr = document.querySelector('body > header').getBoundingClientRect().bottom;
    const link = document.querySelector('.discount_code_button a');
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y <= max; y += 40) {
      window.scrollTo(0, y); await new Promise(r => requestAnimationFrame(r));
      for (const el of [link, document.querySelector('#inpShippingName'), document.querySelector('#checkout-form button.submit'), document.querySelector('.rbu-toast-close')]) {
        if (!el || !el.getClientRects().length) continue;
        const r = el.getBoundingClientRect();
        if (r.top < hdr + 2 || r.bottom > innerHeight - 2) continue;      // under the site's own header or off-screen
        out.tested++;
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (!(hit === el || el.contains(hit) || (hit && hit.closest && hit.closest('label') && el.id))) out.covered.push((el.id || el.className || el.tagName) + ' @' + y + ' by ' + (hit && (hit.className || hit.tagName)));
      }
    }
    return out;
  });
  for (const vp of [[390, 844], [768, 1024], [1280, 720], [1440, 900]]) {
    for (const [label, q, extraOpts] of [['rejected', '?code=NOPE2026', {}], ['not applicable', '?code=PREORDER10', {}], ['has other', '?code=SPRING10', { page: HAS, initial: { code: 'WELCOME5', applies: true, pct: 0.05 } }]]) {
      await check(`M ${label} ${vp.join('x')}`, { page: ITEMS, url: '/store/checkout' + q, vp, after: scan, shot: `fix-checkout-${label.replace(/ /g, '-')}-${vp[0]}.png`, ...extraOpts }, r => {
        ok(r.toastPos === 'static' && r.toastIn === 'cart', `M ${label} ${vp} notice is in the cart, in the flow`, r);
        ok(r.extra.covered.length === 0 && r.extra.tested > 10, `M ${label} ${vp} nothing covered while scrolling`, r.extra);
      });
    }
  }
  await check('N dismiss and Escape return the focus', { page: ITEMS, url: '/store/checkout?code=NOPE2026', vp: [1280, 720], after: async p => {
    await p.focus('#checkout-form button.submit'); await p.keyboard.press('Tab');
    const onDismiss = await p.evaluate(() => document.activeElement.className);
    await p.keyboard.press('Escape');
    const after = await p.evaluate(() => ({ toast: !!document.querySelector('.rbu-toast'), active: document.activeElement.className + '|' + document.activeElement.tagName }));
    // a second time with the mouse
    return { onDismiss, ...after };
  } }, r => { ok(r.extra.onDismiss === 'rbu-toast-close' && !r.extra.toast && /submit/.test(r.extra.active), 'N', r.extra); });
  await check('N2 Escape elsewhere does not close a notice in the flow or steal focus', { page: ITEMS, url: '/store/checkout?code=NOPE2026', vp: [1280, 720], after: async p => {
    await p.focus('#inpShippingName'); await p.keyboard.press('Escape');
    return await p.evaluate(() => ({ toast: !!document.querySelector('.rbu-toast'), active: document.activeElement.id }));
  } }, r => { ok(r.extra.toast && r.extra.active === 'inpShippingName', 'N2', r.extra); });
  await check('O applied notice also stays in the flow (no timer, no shift later)', { page: ITEMS, url: '/store/checkout?code=SPRING10', vp: [390, 844], wait: 12500 }, r => {
    ok(r.toast === 'Discount code SPRING10 applied.' && r.toastPos === 'static', 'O still there after 12.5 s', r); });
  await check('P empty cart: saved notice in the flow above the message', { page: null, url: '/store/checkout?code=SPRING10', vp: [1280, 720], shot: 'fix-checkout-empty-1280.png', after: async p => p.evaluate(() => { const t = document.querySelector('.rbu-toast'); const e = document.querySelector('.cart-empty'); return { before: !!(t.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING), pos: getComputedStyle(t).position, w: Math.round(t.getBoundingClientRect().width), left: Math.round(t.getBoundingClientRect().left) }; }) }, r => {
    ok(r.extra.before && r.extra.pos === 'static', 'P', r.extra); });
  // ---- review fix 5 (wording): three server errors
  await check('Q 500 x3 at 390: wording and the cart is not left busy', { page: ITEMS, url: '/store/checkout?code=GOOD10', fail: 3, wait: 9000, vp: [390, 844], shot: 'fix-checkout-noanswer-390.png' }, r => {
    ok(/^We couldn’t apply discount code GOOD10 right now\./.test(r.toast) && !/saved/.test(r.toast) && r.cartUpdating === false, 'Q', r); });
  await check('Q2 500 x3, storage blocked: no promise to try again', { page: ITEMS, url: '/store/checkout?code=SPRING10', fail: 3, wait: 9000, noStorage: true }, r => {
    ok(r.toast === 'We couldn’t apply discount code SPRING10 right now. You can enter it yourself.', 'Q2', r); });
  await check('Q3 500 x3 for a code saved earlier (no link): the customer is told too', { page: ITEMS, url: '/store/checkout', fail: 3, wait: 9000, before: async p => { await p.goto(base + '/store/?code=SPRING10', { waitUntil: 'load' }); await p.waitForTimeout(300); } }, r => {
    ok(/^We couldn’t apply discount code SPRING10 right now\./.test(r.toast) && r.stored && r.stored.includes('SPRING10'), 'Q3', r); });

  await b.close();
  fs.writeFileSync(OUT + '/../checkout-results.json', JSON.stringify(results, null, 1));
  console.log(fails ? `${fails} FAILURES` : 'ALL PASS');
})();
