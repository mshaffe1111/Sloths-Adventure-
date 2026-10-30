import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  await p.goto('http://127.0.0.1:8816/?lessons=off'); await p.waitForTimeout(6000);
  await p.click('[data-menu]'); await p.waitForTimeout(600);
  // drag music to ~30%
  const r = await p.locator('#pm-music').boundingBox();
  await p.mouse.click(r.x + r.width * 0.3, r.y + r.height / 2); await p.waitForTimeout(200);
  const e = await p.locator('#pm-sfx').boundingBox();
  await p.mouse.click(e.x + 2, e.y + e.height / 2); await p.waitForTimeout(300);
  await p.screenshot({ path: `/tmp/claude-0/kit3/slider-${tag}.png` });
  await p.close();
}
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
await p.goto('http://127.0.0.1:8816/?lessons=off'); await p.waitForTimeout(5000);
await p.evaluate(() => window.__play('1-2')); await p.waitForTimeout(5000); await p.keyboard.press('Escape'); await p.waitForTimeout(1500);
await p.screenshot({ path: '/tmp/claude-0/kit3/slider-pause.png' });
await b.close();
