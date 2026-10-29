// polish-c (AN-6): a stage's creatures, plain and mid hurt-flash, side by side; node tools/art/shot-flash-c.mjs <port> <out> <stage>
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, stage = '1-3'] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForTimeout(3500);
await p.evaluate((id) => window.__play(id), stage);
await p.waitForTimeout(5000);
await p.evaluate(() => {
  const e = window.__engine();
  const foe = e.enemies.find((x) => !x.defeated && x.x > e.player.x + 200);
  if (foe) { e.player.x = foe.x - 260; e.player.y = foe.y - 40; }
});
await p.waitForTimeout(1500);
await p.screenshot({ path: `${out}-plain.png` });
await p.evaluate(() => { for (const x of window.__engine().enemies) x.hitFlashTimer = 999; });
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}-flash.png` });
await b.close();
