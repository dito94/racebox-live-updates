// Before/after review page for the racebox.pro updates: one self-contained HTML file with JPEG screenshots inlined.
// node before-after.js <original base> <patched base> <out.html>
const { chromium } = require('playwright-core');
const fs = require('fs');
const [ORIG, PATCH, OUT] = process.argv.slice(2);

const DESK = { width: 1440, height: 900 }, PHONE = { width: 390, height: 844 };
// crop: JS expression returning the element to capture (evaluated in the page), or null for the first screen only
const ITEMS = [
  { t: 'Home page', note: 'The page now opens with the RaceBox EVO pre-order instead of the large photo.', path: '/',
    crop: null, cropOrig: null },
  { t: 'Store', note: 'EVO card first in the list. The whole image and name of every card now open the product page.', path: '/store/',
    crop: `document.querySelector('.products-list')`, cropOrig: `document.querySelector('.products-list')` },
  { t: 'RaceBox product page', note: 'Desktop: name, photo, price and Add to cart in the first screen; the header video now sits below the description. Phones unchanged. New "RaceBox vs RaceBox EVO" comparison further down.', path: '/products/racebox',
    crop: `document.getElementById('evo-vs-racebox')`, cropOrig: null },
  { t: 'RaceBox EVO pre-order page (new)', note: 'Pre-order at 339, with 449 struck through and labelled "after pre-order". Ships March 2027.', path: '/products/racebox-evo',
    crop: 'FULL', cropOrig: null, newPage: true },
  { t: 'Mini product page', note: 'Desktop first screen with price and Add to cart, plus the Mini note: "The Mini records only while your phone stays connected. The Mini S also records on its own."', path: '/products/racebox-mini',
    crop: `document.querySelector('#buy-section')`, cropOrig: `document.querySelector('#buy-section')` },
  { t: 'Comparison page (/products)', note: 'The Mini note sits in the table under the Mini and Mini S columns.', path: '/products',
    crop: `document.querySelector('.rbu-compare-note')?.closest('table, section') || document.querySelector('section.compare')`, cropOrig: `document.querySelector('section.compare')` },
  { t: 'Accessory page (example: External GPS Antenna)', note: 'Desktop: one clean product block (name, description, all points, price, Add to cart), then delivery details. The generic header photo and the repeated intro are hidden on desktop. Phones unchanged.', path: '/products/external-gps-antenna', crop: null, cropOrig: null },
  { t: 'Discount link (example: /store/?code=WELCOME10)', note: 'The code is saved and applied at checkout automatically. Checkout itself needs the real store back end, so it is not shown here.', path: '/store/?code=WELCOME10', crop: null, cropOrig: null, patchedOnly: true },
];

async function shot(page, url, vp, cropExpr) {
  await page.setViewportSize(vp);
  await page.goto(url, { waitUntil: 'load' });
  await page.addStyleTag({ content: '*{animation:none!important;transition:none!important} #cookie-consent-popup,#newsletter-subscribe-popup,.newsletter-subscribe-popup{display:none!important}' }).catch(() => {});
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(400);
  const first = (await page.screenshot({ type: 'jpeg', quality: 70 })).toString('base64');
  let crop = null;
  if (cropExpr === 'FULL') crop = (await page.screenshot({ type: 'jpeg', quality: 62, fullPage: true })).toString('base64');
  else if (cropExpr) {
    const h = await page.evaluateHandle(cropExpr);
    const el = h.asElement();
    if (el) { await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(200); crop = (await el.screenshot({ type: 'jpeg', quality: 70 })).toString('base64'); }
  }
  return { first, crop };
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ deviceScaleFactor: 1 });
  await ctx.route(u => !(u.href.startsWith(ORIG) || u.href.startsWith(PATCH)), r => r.abort());
  const page = await ctx.newPage();
  const sections = [];
  for (const it of ITEMS) {
    const row = { ...it, d: {}, p: {} };
    row.d.after = await shot(page, PATCH + it.path, DESK, it.crop);
    row.p.after = await shot(page, PATCH + it.path, PHONE, it.crop === 'FULL' ? null : it.crop);
    if (!it.newPage && !it.patchedOnly) {
      row.d.before = await shot(page, ORIG + it.path, DESK, it.cropOrig);
      row.p.before = await shot(page, ORIG + it.path, PHONE, it.cropOrig);
    }
    sections.push(row);
    console.error('done', it.path);
  }
  await b.close();
  const img = (s, alt) => s ? `<img src="data:image/jpeg;base64,${s}" alt="${alt}" loading="lazy">` : '<p class="none">Not on the current site</p>';
  const pair = (label, before, after, newPage) => `<div class="pair"><figure><figcaption>Before</figcaption>${newPage ? '<p class="none">New page</p>' : img(before, label + ' before')}</figure><figure><figcaption>After</figcaption>${img(after, label + ' after')}</figure></div>`;
  const body = sections.map((s, i) => `<section id="s${i}"><h2>${s.t}</h2><p class="note">${s.note}</p>
    <h3>Desktop, first screen (1440 x 900)</h3>${pair(s.t + ' desktop', s.d.before?.first, s.d.after.first, s.newPage || s.patchedOnly)}
    <h3>Phone, first screen (390 x 844)</h3>${pair(s.t + ' phone', s.p.before?.first, s.p.after.first, s.newPage || s.patchedOnly)}
    ${s.crop ? `<h3>${s.crop === 'FULL' ? 'Whole page, desktop' : 'Close-up of the change, desktop'}</h3>${pair(s.t + ' detail', s.d.before?.crop, s.d.after.crop, s.newPage || !s.cropOrig)}` : ''}
    ${s.crop && s.crop !== 'FULL' ? `<h3>Close-up of the change, phone</h3>${pair(s.t + ' detail phone', s.p.before?.crop, s.p.after.crop, s.newPage || !s.cropOrig)}` : ''}
  </section>`).join('\n');
  const toc = sections.map((s, i) => `<li><a href="#s${i}">${s.t}</a></li>`).join('');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>RaceBox Updates Review</title><style>
:root{--bg:#fff;--fg:#2c2c2c;--mut:#5f6670;--line:#e4e4ec;--card:#f6f6f8}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#15181d;--fg:#eceef1;--mut:#a9b0ba;--line:#2a2f37;--card:#1e2228}}
:root[data-theme="dark"]{--bg:#15181d;--fg:#eceef1;--mut:#a9b0ba;--line:#2a2f37;--card:#1e2228}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,-apple-system,Segoe UI,Arial,sans-serif}
main{max-width:1500px;margin:0 auto;padding:24px 16px 64px}h1{font-size:1.6rem;margin:0 0 4px}h2{font-size:1.25rem;margin:40px 0 4px;padding-top:16px;border-top:1px solid var(--line)}
h3{font-size:.95rem;color:var(--mut);font-weight:600;margin:20px 0 8px}.note{margin:0 0 8px;max-width:75ch}.lede{color:var(--mut);max-width:75ch}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media (max-width:760px){.pair{grid-template-columns:1fr}}
figure{margin:0;background:var(--card);border:1px solid var(--line);border-radius:6px;padding:8px;min-width:0}figcaption{font-size:.8rem;font-weight:600;color:var(--mut);margin-bottom:6px}
img{display:block;max-width:100%;height:auto;border-radius:3px}.none{color:var(--mut);font-style:italic;margin:24px 0}
ul.toc{columns:2;padding-left:18px}@media (max-width:760px){ul.toc{columns:1}}a{color:inherit}
</style></head><body><main><h1>RaceBox site updates: before and after</h1>
<p class="lede">Screenshots of the current racebox.pro (before) and the proposed changes (after), taken from the local copies on 23 Oct 2026. Prices show in US dollars because the copy was made from the US view. Add to cart and checkout need the real store and are not shown working.</p>
<ul class="toc">${toc}</ul>${body}</main></body></html>`;
  fs.writeFileSync(OUT, html);
  console.error('wrote', OUT, (html.length / 1e6).toFixed(1), 'MB');
})();
