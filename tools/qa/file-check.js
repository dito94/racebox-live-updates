// Open every exported page from disk and list failed local file requests.
const { chromium } = require('playwright-core');
const fs = require('fs'), path = require('path');
const root = process.argv[2];
const pages = [];
(function walk(d){ for (const f of fs.readdirSync(d)) { const p = path.join(d,f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.html')) pages.push(p); } })(root);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route(u => !u.href.startsWith('file:'), r => r.abort());
  const bad = new Set(); let errs = 0;
  for (const p of pages) {
    const pg = await ctx.newPage();
    pg.on('requestfailed', r => { if (r.url().startsWith('file:') && !/\.(webm|ogv)$/.test(r.url())) bad.add(r.url().replace('file://' + root, '')); });
    pg.on('pageerror', e => { errs++; });
    await pg.goto('file://' + p, { waitUntil: 'load' }).catch(e => console.error('ERR', p, e.message));
    await pg.close();
  }
  console.log(pages.length, 'pages; page errors', errs); console.log([...bad].sort().join('\n'));
  await b.close();
})();
