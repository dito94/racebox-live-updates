// Review fixes on the fixed toast (every page except checkout): auto-hide, Escape from anywhere, focus never hidden
// behind it (scroll-padding), excluded paths, newsletter popup untouched.
const fs = require('fs');
const { launch, context, OUT } = require('./lib');
const base = process.env.BASE || 'http://127.0.0.1:8924';
const SITE = process.env.SITE || 'tools/qa/discount-links/site';
const STORE = fs.readFileSync(SITE + '/store/index.html', 'utf8');
let fails = 0; const ok = (c, m, d) => { if (!c) { fails++; console.log('FAIL', m, d === undefined ? '' : JSON.stringify(d)); } else console.log('ok  ', m); };
const block = ctx => ctx.addInitScript(() => { for (const k of ['localStorage', 'sessionStorage']) Object.defineProperty(window, k, { get() { throw new DOMException('The operation is insecure.', 'SecurityError'); } }); });
const consent = (ctx, dismissedPopup = true) => ctx.addCookies([{ name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }, ...(dismissedPopup ? [{ name: 'newsletter-subscribe-popup-dismissed', value: 'true', url: base }] : [])]);
const T = p => p.evaluate(() => { const t = document.querySelector('.rbu-toast'); if (!t) return null; const r = t.getBoundingClientRect(); return { pos: getComputedStyle(t).position, top: Math.round(r.top), bottom: Math.round(r.bottom), pad: document.documentElement.style.scrollPaddingTop, text: t.textContent.trim() }; });

(async () => {
  const b = await launch();
  // 1. storage blocked: the long-lived toast. Tab walk (both directions) must never leave focus fully behind it; it leaves by itself after 20 s.
  for (const vp of [[390, 844], [1280, 720]]) {
    const ctx = await context(b, base, vp); await consent(ctx); await block(ctx);
    const p = await ctx.newPage(); await p.goto(base + '/store/?code=SUMMER10', { waitUntil: 'load' }); await p.waitForTimeout(500);
    await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });   // the site scrolls smoothly: measure where the scroll ends
    const t0 = await T(p);
    ok(t0 && t0.pos === 'fixed' && /^Your discount code is SUMMER10\. Enter it at checkout\.$/.test(t0.text), `1 ${vp} storage-blocked toast shown`, t0);
    ok(t0 && parseFloat(t0.pad) >= t0.bottom, `1 ${vp} scroll-padding-top (${t0 && t0.pad}) reaches the toast bottom (${t0 && t0.bottom})`);
    let hidden = [], seen = 0;
    const scan = async dir => {
      await p.evaluate(back => window.scrollTo(0, back ? document.documentElement.scrollHeight : 0), dir === 'back');
      if (dir === 'back') await p.evaluate(() => [...document.querySelectorAll('footer a')].pop().focus()); else await p.evaluate(() => document.activeElement && document.activeElement.blur());
      for (let i = 0; i < 70; i++) {
        await p.keyboard.press(dir === 'back' ? 'Shift+Tab' : 'Tab'); await p.waitForTimeout(30);
        const r = await p.evaluate(() => { const t = document.querySelector('.rbu-toast'); const a = document.activeElement; if (!t) return { gone: true }; if (!a || a === document.body || t.contains(a)) return { skip: true };
          const q = a.getBoundingClientRect(), tr = t.getBoundingClientRect(); const vis = q.width > 0 && q.bottom > 0 && q.top < innerHeight;
          return { vis, full: vis && q.left >= tr.left - 1 && q.right <= tr.right + 1 && q.top >= tr.top - 1 && q.bottom <= tr.bottom + 1, part: vis && q.right > tr.left && q.left < tr.right && q.bottom > tr.top && q.top < tr.bottom, d: (a.id || a.className || a.tagName) + ' @' + Math.round(q.top) }; });
        if (r.gone) break; if (r.skip) continue; seen++; if (r.full) hidden.push(r.d);
      }
    };
    await scan('back'); await scan('fwd');
    ok(hidden.length === 0 && seen > 20, `1 ${vp} focus walk: ${seen} stops, fully hidden behind the toast: ${hidden.length}`, hidden.slice(0, 5));
    await p.mouse.move(2, 2);
    const t1 = await T(p);
    if (t1) { // the walk may have paused the countdown; focus outside again and wait for the rest
      await p.evaluate(() => document.activeElement && document.activeElement.blur());
    }
    const t = Date.now(); let gone = false; while (Date.now() - t < 40000) { if (!(await T(p))) { gone = true; break; } await p.waitForTimeout(500); }
    ok(gone, `1 ${vp} toast closed by itself`, Date.now() - t);
    const after = await p.evaluate(() => document.documentElement.style.scrollPaddingTop);
    ok(after === '', `1 ${vp} scroll-padding restored (${JSON.stringify(after)})`);
    await ctx.close();
  }
  // 1b. A link that sits right under the toast when it receives focus is scrolled out from under it (negative control in neg2.js: without scroll-padding it stays hidden)
  for (const vp of [[390, 844], [1280, 720]]) {
    const ctx = await context(b, base, vp); await consent(ctx); await block(ctx);
    const p = await ctx.newPage(); await p.goto(base + '/store/?code=SUMMER10', { waitUntil: 'load' }); await p.waitForTimeout(400);
    await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    for (const method of ['tab', 'focus()']) {
      await p.evaluate(() => { const l = document.querySelectorAll('.rbu-card-link')[1]; const t = document.querySelector('.rbu-toast').getBoundingClientRect(); const r = l.getBoundingClientRect(); window.scrollBy(0, r.top - (t.top + t.height / 2 - r.height / 2)); document.querySelectorAll('.rbu-card-link')[0].focus({ preventScroll: true }); });
      const under = await p.evaluate(() => { const r = document.querySelectorAll('.rbu-card-link')[1].getBoundingClientRect(), t = document.querySelector('.rbu-toast').getBoundingClientRect(); return r.top >= t.top && r.bottom <= t.bottom; });
      if (method === 'tab') for (let i = 0; i < 3; i++) await p.keyboard.press('Tab'); else await p.evaluate(() => document.querySelectorAll('.rbu-card-link')[1].focus());
      const r = await p.evaluate(() => { const q = document.activeElement.getBoundingClientRect(), t = document.querySelector('.rbu-toast').getBoundingClientRect(); return { cls: document.activeElement.className, overlap: q.bottom > t.top && q.top < t.bottom }; });
      ok(under && r.cls === 'rbu-card-link' && !r.overlap, `1b ${vp} ${method}: link that was under the toast is clear of it after focus`, { under, r });
    }
    await ctx.close();
  }
  // 2. normal toast: 10 s, pausing on hover; exact timing without hover
  { const ctx = await context(b, base, [1280, 720]); await consent(ctx);
    const p = await ctx.newPage(); await p.goto(base + '/store/?code=SUMMER10', { waitUntil: 'load' }); const t0 = Date.now(); await p.waitForTimeout(500);
    ok((await T(p)).text === 'Discount code SUMMER10 saved. We’ll enter it for you at checkout, on the items it applies to.', '2 saved toast');
    await p.waitForTimeout(7500); ok(!!(await T(p)), '2 still there at 8 s');
    await p.waitForTimeout(4000); ok(!(await T(p)), '2 gone by 12 s', Date.now() - t0);
    await ctx.close(); }
  // 3. Escape from anywhere; no focus stealing from a stale return point
  { const ctx = await context(b, base, [1280, 720]); await consent(ctx);
    const p = await ctx.newPage(); await p.goto(base + '/store/?code=SUMMER10', { waitUntil: 'load' }); await p.waitForTimeout(400);
    await p.focus('.products-list > div:nth-child(2) .rbu-card-link');
    await p.keyboard.press('Escape');
    const r = await p.evaluate(() => ({ toast: !!document.querySelector('.rbu-toast'), active: document.activeElement.className, pad: document.documentElement.style.scrollPaddingTop }));
    ok(!r.toast && r.active === 'rbu-card-link' && r.pad === '', '3 Escape with focus in the page closes the toast and leaves focus alone', r);
    // focus enters the toast, leaves it, a new toast is not involved: Escape elsewhere must not pull focus back
    await p.goto(base + '/store/?code=SUMMER11', { waitUntil: 'load' }); await p.waitForTimeout(400);
    await p.focus('.products-list > div:nth-child(1) .see-more'); await p.focus('.rbu-toast-close'); await p.focus('.products-list > div:nth-child(3) .rbu-card-link');
    await p.keyboard.press('Escape');
    const r2 = await p.evaluate(() => ({ toast: !!document.querySelector('.rbu-toast'), active: document.querySelector('.products-list > div:nth-child(3) .rbu-card-link') === document.activeElement }));
    ok(!r2.toast && r2.active, '3b Escape elsewhere does not pull focus back to an old spot', r2);
    // Dismiss button from the keyboard returns the focus to where it came from
    await p.goto(base + '/store/?code=SUMMER12', { waitUntil: 'load' }); await p.waitForTimeout(400);
    await p.focus('.products-list > div:nth-child(1) .see-more'); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Shift+Tab');
    const where = await p.evaluate(() => document.activeElement.className);
    await p.focus('.rbu-toast-close'); await p.keyboard.press('Enter');
    const r3 = await p.evaluate(() => ({ toast: !!document.querySelector('.rbu-toast'), active: document.activeElement.className }));
    ok(!r3.toast, '3c Dismiss closes', { where, r3 });
    await ctx.close(); }
  // 4. excluded paths and the boundary of the rule
  for (const [path, expectTaken] of [['/webapp/reset-password?code=3f9a1c0e8b7d6a5f&email=a%40b.c', false], ['/webapp/login?promo=ABC123', false], ['/store/payment/abc123?code=ABC123', false], ['/store/order/abc123?discount=ABC123', false], ['/orders/55?coupon=ABC123', false], ['/api/x?code=ABC123', false],
    ['/info/privacy-policy?code=ABC123', true], ['/webappx?code=ABC123', true], ['/store/?code=ABC123&utm_source=n', true], ['/store/ordering?code=ABC123', true]]) {
    const ctx = await context(b, base, [1280, 720]); await consent(ctx);
    await ctx.route(u => /^\/(webapp|store\/payment|store\/order|orders|api|webappx|store\/ordering)/.test(u.pathname), r => r.request().method() === 'GET' ? r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: STORE }) : r.fallback());
    const p = await ctx.newPage(); await p.goto(base + path, { waitUntil: 'load' }); await p.waitForTimeout(500);
    const r = await p.evaluate(() => ({ url: location.pathname + location.search, stored: localStorage.getItem('rbu-discount-code'), toast: !!document.querySelector('.rbu-toast') }));
    const want = new URL(base + path); 
    if (expectTaken) ok(r.toast && !!r.stored && !/code=|discount=|coupon=|promo=/.test(r.url), `4 ${path} is read and cleaned`, r);
    else ok(!r.toast && !r.stored && r.url === want.pathname + want.search, `4 ${path} left alone`, r);
    await ctx.close();
  }
  // 5. the newsletter popup opens by itself with a saved code as it does without (not held any more)
  for (const [label, path] of [['no code', '/store/'], ['with code', '/store/?code=SUMMER10']]) {
    const ctx = await context(b, base, [1280, 720]); await consent(ctx, false);
    const p = await ctx.newPage(); await p.goto(base + path, { waitUntil: 'load' }); await p.waitForTimeout(8500);
    const d = await p.evaluate(() => { const e = document.querySelector('#newsletter-subscribe-popup'); return e ? getComputedStyle(e).display : 'none-found'; });
    ok(d === 'block', `5 popup auto-opens (${label}): ${d}`);
    if (label === 'with code') { await p.goto(base + '/products/racebox-mini', { waitUntil: 'load' }); await p.waitForTimeout(8500);
      const d2 = await p.evaluate(() => { const e = document.querySelector('#newsletter-subscribe-popup'); return e ? getComputedStyle(e).display : 'none-found'; }); ok(d2 === 'block', `5 popup auto-opens on the next page too: ${d2}`); }
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `${fails} FAILURES` : 'ALL PASS');
})();
