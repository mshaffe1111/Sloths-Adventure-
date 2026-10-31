// World 5's new pieces in the real game, upright 390x844 and sideways 844x390 (2026-10-31): 5-3's teapot (quiet and mid-puff), 5-5's
// silk sheet, a split high road, 5-4's drawn pieces, each stage's opening. Needs a dev server: npx vite --port=4301 --host=127.0.0.1
//   node tools/art/w5shots.mjs <port> <out dir> [scene,...]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port = '4301', out = 'tools/art/eshots/w5', only] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const at = (pick, dx = -140) => `const t = (${pick})(e); if (!t) return 'none'; const pl = e.platforms.filter((p) => p.x <= t.x + ${dx} && p.x + p.width >= t.x + ${dx} && p.y >= (t.y ?? 580) - 5).sort((a, b) => a.y - b.y)[0];
  Object.assign(e.player, { x: t.x + ${dx}, y: pl ? pl.y : 580, vx: 0, vy: 0, facing: 1, invincibleTimer: 99 }); return t.x;`;
const SCENES = {
  pot: { stage: '5-3', setup: at(`(e) => e.proto.w5.pots[0]`, -150), waits: [0.2, 1.4, 2.4, 3.2, 4.0] },
  sheet: { stage: '5-5', setup: at(`(e) => { const s = (e.proto.w5.sheets ?? [])[0]; return s && { x: s.x0, y: 580 }; }`, -120), waits: [0.3] },
  road51: { stage: '5-1', setup: at(`(e) => { const b = e.platforms.filter((p) => p.style === 'branch' && p.y < 420); for (let i = 1; i < b.length; i++) if (b[i].x - (b[i - 1].x + b[i - 1].width) < 120 && b[i].x > b[i - 1].x && Math.abs(b[i].y - b[i - 1].y) < 2) return { x: b[i].x, y: b[i].y }; return null; }`, -150), waits: [0.3] },
  start52: { stage: '5-2', setup: `return 0;`, waits: [3] },
  start53: { stage: '5-3', setup: `return 0;`, waits: [3] },
  start55: { stage: '5-5', setup: `return 0;`, waits: [3] },
  pit54: { stage: '5-4', setup: at(`(e) => { const v = e.vines[0]; return v && { x: v.x - 900, y: 580 }; }`, 0), waits: [0.3] },
  spider51: { stage: '5-1', setup: at(`(e) => e.enemies[2]`, -260), waits: [0.3, 1.0] },
};
const b = await chromium.launch();
for (const [name, sc] of Object.entries(SCENES)) {
  if (only && !only.split(',').includes(name)) continue;
  for (const [ori, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    p.on('pageerror', (er) => console.log('ERR', er.message));
    await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
    await p.waitForTimeout(2500);
    await p.evaluate((s) => window.__play(s), sc.stage);
    await p.waitForTimeout(6000);
    for (let i = 0; i < 4; i++) { const g = p.getByText('Skip tips'); if (await g.count()) { await g.first().click(); await p.waitForTimeout(300); } else break; }
    const r = await p.evaluate(`(() => { let e = window.__engine; if (typeof e === 'function') e = e(); ${sc.setup} })()`);
    let t0 = 0;
    for (const s of sc.waits) {
      await p.waitForTimeout((s - t0) * 1000);
      t0 = s;
      await p.screenshot({ path: join(out, `${name}-${ori}-${Math.round(s * 10)}.png`) });
    }
    console.log(name, ori, r);
    await p.close();
  }
}
await b.close();
