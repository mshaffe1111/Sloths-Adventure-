// What's New pop-up: screenshots (About, newest open, one older open, scrolled to the bottom) upright 412x915 and sideways 915x412,
// a clip check, and the three ways out (X, tap outside, Back via Escape). Method: reference/methods/menu-screen.md.
// Run: npx vite --port=8816 --host=127.0.0.1 (another shell), then: node tools/qa/menushots/whatsnew.mjs reference/menus/whatsnew
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const out = process.argv[2];
const b = await chromium.launch();
const errs = [];
for (const [tag, w, h] of [['up', 412, 915], ['side', 915, 412]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.addInitScript(() => localStorage.setItem('sloth_lvl_1-1', JSON.stringify({ completed: true, stars: 2, bestScore: 900, bestTime: 90 })));
  await p.goto('http://127.0.0.1:8816/?lessons=off'); await p.waitForTimeout(6500);
  await p.click('[data-menu]'); await p.waitForTimeout(700);
  await p.click('.st-tab[aria-label="About"]'); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/about-${tag}.png` });
  const openWN = async () => { await p.getByRole('button', { name: 'What’s New' }).click(); await p.waitForTimeout(600); };
  await openWN();
  await p.screenshot({ path: `${out}/whatsnew-newest-${tag}.png` });
  const check = async (label) => {
    const r = await p.evaluate(() => {
      const bad = [];
      const card = document.querySelector('.wn-card').getBoundingClientRect();
      if (card.top < 0 || card.bottom > innerHeight || card.left < 0 || card.right > innerWidth) bad.push(['card out', card.top, card.bottom, card.left, card.right]);
      for (const e of document.querySelectorAll('.wn-card button, .wn-card .nv-plaque')) { const q = e.getBoundingClientRect(); if (q.top < 0 || q.right > innerWidth || q.left < 0) bad.push(['out', e.className, q.top, q.left, q.right]); }
      for (const e of document.querySelectorAll('.wn-head')) { if (e.scrollWidth > e.clientWidth + 1) bad.push(['head overflow', e.textContent]); const q = e.getBoundingClientRect(); if (q.height < 47.5) bad.push(['small', q.height]); }
      const body = document.querySelector('.wn-card .nv-body');
      return { bad, scroll: [body.scrollHeight, body.clientHeight] };
    });
    console.log(tag, label, JSON.stringify(r));
  };
  await check('newest');
  // open an older one (0.9.0, the 4th)
  await p.locator('.wn-head').nth(3).click(); await p.waitForTimeout(300);
  await p.locator('.wn-head').nth(3).scrollIntoViewIfNeeded();
  await p.screenshot({ path: `${out}/whatsnew-older-${tag}.png` });
  await check('older');
  await p.locator('.wn-head').last().click(); await p.waitForTimeout(200);
  await p.evaluate(() => { const b = document.querySelector('.wn-card .nv-body'); b.scrollTop = b.scrollHeight; }); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/whatsnew-bottom-${tag}.png` });
  await check('bottom');
  const isOpen = () => p.evaluate(() => !!document.querySelector('.wn-card'));
  const stOpen = () => p.evaluate(() => !!document.querySelector('.st-card'));
  // close: X
  await p.click('.wn-card .nv-x'); await p.waitForTimeout(300);
  console.log(tag, 'X closes', !(await isOpen()), 'settings still open', await stOpen());
  // close: tap outside
  await openWN(); await p.mouse.click(5, h / 2); await p.waitForTimeout(300);
  console.log(tag, 'outside closes', !(await isOpen()), 'settings still open', await stOpen());
  // close: Back (Escape drives the same back stack)
  await openWN(); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  console.log(tag, 'Back closes', !(await isOpen()), 'settings still open', await stOpen());
  // Back from About: Settings closes, title stays
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  console.log(tag, 'Back from About closes Settings', !(await stOpen()), 'title shown', await p.evaluate(() => !!document.querySelector('[data-menu]')));
  // tapping inside the card doesn't close
  await p.close();
}
console.log('errors', errs);
await b.close();
