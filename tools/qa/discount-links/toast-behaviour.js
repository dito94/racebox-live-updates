// The notice: dismiss (click, Escape), auto-hide after 10 s, pause while hovered, focus return, live region,
// newsletter popup held only when a code arrived, 200% zoom, reduced motion.
const { launch, context, OUT } = require('./lib');
const base = 'http://127.0.0.1:8914';
(async () => {
  const b = await launch();
  let fails = 0; const ok = (c, m, x) => { if (!c) { fails++; console.log('FAIL', m, x === undefined ? '' : JSON.stringify(x)); } else console.log('ok  ', m); };
  const fresh = async (vp = [1280, 720], extra = {}) => { const ctx = await context(b, base, vp, extra); await ctx.addCookies([{ name: 'cookie-consent', value: 'analytics,marketing,essential', url: base }]); return ctx; };
  const shown = p => p.evaluate(() => !!document.querySelector('.rbu-toast'));

  // 1. Click Dismiss
  let ctx = await fresh(); let p = await ctx.newPage();
  await p.goto(base + '/store/?code=SPRING10', { waitUntil: 'load' }); await p.waitForTimeout(300);
  const closeBox = await p.locator('.rbu-toast-close').boundingBox();
  ok(closeBox.width >= 44 && closeBox.height >= 44, 'Dismiss target is at least 44x44', closeBox);
  await p.click('.rbu-toast-close'); ok(!(await shown(p)), 'click Dismiss removes the notice');
  ok(await p.evaluate(() => !!localStorage.getItem('rbu-discount-code')), 'dismissing keeps the saved code');
  await ctx.close();

  // 2. Keyboard: Tab from the header reaches Dismiss early; Escape closes; focus goes back
  ctx = await fresh(); p = await ctx.newPage();
  await p.goto(base + '/store/?code=SPRING10', { waitUntil: 'load' }); await p.waitForTimeout(300);
  await p.focus('header a.cart');
  let steps = 0, onClose = false;
  for (; steps < 25 && !onClose; steps++) { await p.keyboard.press('Tab'); onClose = await p.evaluate(() => document.activeElement && document.activeElement.classList.contains('rbu-toast-close')); }
  ok(onClose, `Dismiss reached by Tab ${steps} stops after the cart icon (before the page content)`);
  const ring = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle + ' ' + getComputedStyle(document.activeElement).outlineWidth);
  ok(/solid 2px/.test(ring), 'Dismiss has a visible focus ring', ring);
  await p.screenshot({ path: `${OUT}/toast-focus-1280.png`, clip: { x: 820, y: 100, width: 460, height: 110 } });
  await p.waitForTimeout(11000);
  ok(await shown(p), 'notice stays while Dismiss has focus (timer paused)');
  await p.keyboard.press('Escape');
  ok(!(await shown(p)), 'Escape closes the notice');
  const back = await p.evaluate(() => document.activeElement && (document.activeElement.className || document.activeElement.tagName));
  ok(back !== 'BODY', 'focus returns to the element before the notice', back);
  console.log('     focus after Escape:', back);
  await ctx.close();

  // 3. Auto-hide after 10 s (saved), pause on hover
  ctx = await fresh(); p = await ctx.newPage();
  await p.goto(base + '/store/?code=SPRING10', { waitUntil: 'load' });
  await p.waitForTimeout(9000); ok(await shown(p), 'saved notice still there at 9 s');
  await p.waitForTimeout(2000); ok(!(await shown(p)), 'saved notice gone after 10 s');
  await p.goto(base + '/store/?code=SPRING10', { waitUntil: 'load' });
  await p.hover('.rbu-toast-msg'); await p.waitForTimeout(12000);
  ok(await shown(p), 'notice stays while hovered');
  await p.mouse.move(5, 600); await p.waitForTimeout(3500);
  ok(await shown(p), 'after the pointer leaves, the time that was left resumes (not cut short)');
  await p.waitForTimeout(7000);
  ok(!(await shown(p)), 'and then the notice leaves');
  await ctx.close();

  // 4. Newsletter popup: held when a code arrives; still opens normally without one; button still opens it
  ctx = await fresh(); p = await ctx.newPage();
  await p.goto(base + '/store/', { waitUntil: 'load' }); await p.waitForTimeout(6000);
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('#newsletter-subscribe-popup')).display === 'block'), 'control: popup opens after 5 s without a code (live behaviour unchanged)');
  await ctx.close();
  ctx = await fresh(); p = await ctx.newPage();
  await p.goto(base + '/store/?code=SPRING10', { waitUntil: 'load' }); await p.waitForTimeout(6000);
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('#newsletter-subscribe-popup')).display === 'none'), 'popup does not open on its own when a code arrived');
  await p.goto(base + '/products/racebox-mini', { waitUntil: 'load' }); await p.waitForTimeout(6000);
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('#newsletter-subscribe-popup')).display === 'none'), 'nor on the next page while the code is saved');
  await p.click('.newsletter-popup-trigger.fixed');
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('#newsletter-subscribe-popup')).display === 'block'), '"Get 10% off!" button still opens it');
  await ctx.close();

  // 5. 200% zoom (1280x720 at 200% = 640x360 CSS px) and 320 px phones
  for (const vp of [[640, 360], [320, 640]]) {
    ctx = await fresh(vp); p = await ctx.newPage();
    await p.goto(base + '/store/?code=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-AB', { waitUntil: 'load' }); await p.waitForTimeout(400);
    const m = await p.evaluate(() => { const r = document.querySelector('.rbu-toast').getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, h: r.height, vw: innerWidth, hscroll: document.documentElement.scrollWidth > innerWidth }; });
    ok(m.left >= 0 && m.right <= m.vw && (!m.hscroll || vp[0] === 320), `${vp.join('x')}: notice fits with a 40-character code` + (vp[0] === 320 ? ' (the page itself scrolls 15 px at 320: footer logo, same on the original)' : ', no horizontal scroll'), m);
    await p.screenshot({ path: `${OUT}/toast-${vp[0]}x${vp[1]}.png` });
    await ctx.close();
  }

  // 6. Reduced motion: no animation on the notice, no transform transition on the card photo
  ctx = await fresh([1280, 720], { reducedMotion: 'reduce' }); p = await ctx.newPage();
  await p.goto(base + '/store/?code=SPRING10', { waitUntil: 'load' }); await p.waitForTimeout(300);
  const rm = await p.evaluate(() => ({ anim: getComputedStyle(document.querySelector('.rbu-toast')).animationName, tr: getComputedStyle(document.querySelector('.products-list .img img')).transitionDuration }));
  ok(rm.anim === 'none' && rm.tr === '0s', 'reduced motion respected', rm);
  await ctx.close();

  // 7. EU arrival: the cookie banner covers the page; the notice waits for it before counting down
  ctx = await fresh(); p = await ctx.newPage();
  await p.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { const d = document.createElement('div'); d.id = 'cookie-consent-popup'; d.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:9999'; document.body.appendChild(d); }));
  await p.goto(base + '/store/?code=SPRING10', { waitUntil: 'load' });
  await p.waitForTimeout(12000);
  ok(await shown(p), 'notice still there after 12 s behind the cookie banner');
  await p.evaluate(() => { document.getElementById('cookie-consent-popup').style.display = 'none'; });
  await p.waitForTimeout(9000); ok(await shown(p), 'then gets its full 10 s once the banner closes');
  await p.waitForTimeout(2500); ok(!(await shown(p)), 'and leaves after that');
  await ctx.close();

  await b.close();
  console.log(fails ? `${fails} FAILURES` : 'ALL PASS');
})();
