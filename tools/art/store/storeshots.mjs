// Play Store screenshots (HF list row 3, 2026-10-30): four scenes of the real game at the store's sizes, upright and sideways.
//   node tools/art/store/storeshots.mjs <dev build url> <out dir>
// phone 1080 x 1920, 7-inch tablet 1200 x 1920, 10-inch tablet 1600 x 2560 (and the same turned), from CSS viewports at a device scale.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const [url, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const SIZES = [['phone', 412, 732, 2.625], ['tab7', 600, 960, 2], ['tab10', 800, 1280, 2]];
const SCENES = [
  ['1-title', null, 0],
  ['2-jungle', (p) => p.evaluate(() => window.__play('1-4', 3)), 9000],
  ['3-boss', (p) => p.evaluate(() => window.__play('2-10')), 12000],
  ['4-map', (p) => p.getByText('World Map', { exact: false }).first().click(), 2500],
];
const b = await chromium.launch();
for (const [dev, cw, ch, s] of SIZES) {
  for (const [tag, w, h] of [['up', cw, ch], ['side', ch, cw]]) {
    for (const [name, go, wait] of SCENES) {
      const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: s, hasTouch: true, isMobile: true });
      await p.goto(`${url}?lessons=off`);
      await p.waitForTimeout(5000);
      try { if (go) await go(p); } catch (e) { console.log(name, dev, tag, 'could not open', String(e).slice(0, 100)); }
      await p.waitForTimeout(wait);
      // (the boss scene: keep Pokey whole and the fight on, so the shot is of play, not a hit)
      await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); if (e?.player) { e.player.health = 5; e.player.invincibleTimer = 0; } });
      await p.screenshot({ path: `${out}/${dev}-${tag}-${name}.png` });
      await p.close();
    }
  }
}
await b.close();
