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
  // (a lively moment, 2026-10-30: Pokey running and mid-jump through 1-2's petals, the score popping, Dot quiet so no bubble covers it)
  ['2-jungle', async (p) => { await p.evaluate(() => window.__play('1-2', 3)); await p.waitForTimeout(6500); await p.keyboard.down('ArrowRight'); await p.waitForTimeout(1400); await p.keyboard.down('Space'); }, 230],
  ['3-boss', (p) => p.evaluate(() => window.__play('2-10')), 12000],
  ['4-map', (p) => p.getByText('World Map', { exact: false }).first().click(), 2500],
];
const b = await chromium.launch();
for (const [dev, cw, ch, s] of SIZES) {
  for (const [tag, w, h] of [['up', cw, ch], ['side', ch, cw]]) {
    for (const [name, go, wait] of SCENES) {
      if (process.env.ONLY && !name.includes(process.env.ONLY)) continue;
      const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: s, hasTouch: name !== '2-jungle', isMobile: true });
      await p.addInitScript((jungle) => {
        localStorage.setItem('sloth_dot_help', 'quiet');
        // (the jungle shot only: no wayside chatter and no speech bubble over the play, the lead's call 2026-10-30)
        if (jungle) {
          localStorage.setItem('sloth_wayside_off', '1');
          document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = '.dg-bub-body, .dg-bub-art, .dg-tail, .dg-ptail { visibility: hidden !important; }'; document.head.appendChild(st); });
        }
      }, name === '2-jungle');
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
