const { chromium } = require('tools/qa/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [w, h] of [[390, 844], [1280, 720]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const base = 'http://127.0.0.1:8914';
    await ctx.route(u => !u.href.startsWith(base), r => r.abort());
    const p = await ctx.newPage();
    await p.goto(base + '/store/', { waitUntil: 'load' });
    const r = await p.evaluate(() => {
      const cs = e => getComputedStyle(e);
      const q = s => document.querySelector(s);
      const h = q('header').getBoundingClientRect();
      const nav = q('header nav.top').getBoundingClientRect();
      const card = q('.products-list > div'); const cr = card.getBoundingClientRect();
      const img = card.querySelector('.img img');
      return { html: cs(document.documentElement).fontSize, body: cs(document.body).fontSize, main: cs(q('main')).fontSize,
        h3: cs(card.querySelector('h3')).fontSize, li: cs(card.querySelector('li')).fontSize, p: cs(q('p')).fontSize,
        header: [h.top, h.bottom], nav: [nav.top, nav.bottom], card: [cr.width, cr.height], img: [img.naturalWidth, img.naturalHeight, img.getBoundingClientRect().width],
        coreNote: (() => { const s = document.createElement('span'); s.className = 'rbu-price-note'; document.body.appendChild(s); return cs(s).fontSize; })(),
        trigger: (() => { const t = q('.newsletter-popup-trigger.fixed'); const r = t.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom, cs(t).display]; })() };
    });
    console.log(w, JSON.stringify(r));
    await ctx.close();
  }
  await b.close();
})();
