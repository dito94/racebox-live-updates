// Combined build (10 evo-page, 20 evo-banner, 60, 80): EVO card linked and clickable, notice below the EVO bar.
const { launch, context, VPS, OUT } = require('./lib');
const base = 'http://127.0.0.1:8934';
(async () => {
  const b = await launch(); let fails = 0; const ok = (c, m, x) => { if (!c) { fails++; console.log('FAIL', m, JSON.stringify(x)); } };
  for (const vp of VPS) {
    const ctx = await context(b, base, vp);
    await ctx.addCookies([{ name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }]);
    const p = await ctx.newPage();
    await p.addInitScript(() => { window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
    await p.goto(base + '/store/?code=SPRING10', { waitUntil: 'load' }); await p.waitForTimeout(700);
    const m = await p.evaluate(() => {
      const r = s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : null; };
      const bar = r('header .rbu-evo-bar'), nav = r('header nav.top'), t = r('.rbu-toast');
      return { barBottom: bar && bar.height ? Math.round(bar.bottom) : null, navBottom: Math.round(nav.bottom), toastTop: Math.round(t.top), toastBottom: Math.round(t.bottom), cls: +window.__cls.toFixed(4), hscroll: document.documentElement.scrollWidth > innerWidth };
    });
    ok(m.toastTop > m.navBottom && (!m.barBottom || m.toastTop > m.barBottom) && !m.hscroll && m.cls < 0.01, vp + ' notice below header and EVO bar', m);
    await p.screenshot({ path: `${OUT}/combo-code-store-${vp[0]}.png` });
    await p.click('.rbu-toast-close');
    await p.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    const hits = await p.evaluate(() => [...document.querySelectorAll('.products-list > div')].map(card => {
      const at = el => { if (!el) return 'none'; el.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = el.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 8)); const a = t && t.closest('a,button'); return a ? (a.className || a.tagName) : (t ? t.tagName : 'null'); };
      return { name: card.querySelector('h3').textContent.trim(), img: at(card.querySelector('.img img')), h3: at(card.querySelector('h3')), more: at(card.querySelector('a.see-more')), buy: at(card.querySelector('form button')) };
    }));
    ok(hits.length === 13 && hits[0].name.startsWith('RaceBox EVO'), vp + ' 13 cards, EVO first', hits.map(h => h.name));
    for (const h of hits) ok(h.img === 'rbu-card-link' && h.h3 === 'rbu-card-link' && h.more === 'see-more' && h.buy !== 'rbu-card-link' && h.buy !== 'DIV', vp + ' ' + h.name, h);
    if (vp[0] === 390 || vp[0] === 1280) {
      const evoCard = p.locator('.products-list > div').first();
      await evoCard.scrollIntoViewIfNeeded();
      const bx = await p.locator('.products-list > div .img img').first().boundingBox();
      await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.waitForTimeout(500);
      const cb = await evoCard.boundingBox();
      await p.screenshot({ path: `${OUT}/combo-evo-card-hover-${vp[0]}.png`, clip: { x: Math.max(0, cb.x - 10), y: Math.max(0, cb.y - 10), width: Math.min(vp[0] - Math.max(0, cb.x - 10), cb.width + 20), height: cb.height + 20 } });
      await Promise.all([p.waitForURL(/racebox-evo/, { timeout: 8000 }).catch(() => {}), p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2)]);
      ok(/\/products\/racebox-evo$/.test(p.url()), vp + ' EVO image opens the EVO page', p.url());
    }
    const errs = ctx.log.errors.filter(e => !/net::ERR_FAILED/.test(e));
    ok(errs.length === 0 && ctx.log.notFound.length === 0, vp + ' no console errors or 404s', { errs, nf: ctx.log.notFound });
    console.log(vp.join('x'), JSON.stringify(m), 'cards', hits.length);
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `${fails} FAILURES` : 'ALL PASS');
})();
