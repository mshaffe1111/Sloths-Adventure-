// node burst-enemy.mjs <stage> <type> <outdir> [seconds] -> close-up screenshots following the first awake enemy of a type: idle near Pokey, then he punches it
import { chromium } from 'playwright';
import fs from 'node:fs';
const [stage, type, outDir, secs] = [process.argv[2], process.argv[3], process.argv[4], +(process.argv[5] ?? 6)];
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2 });
await p.goto('http://127.0.0.1:4301/?nodemo=1&lessons=off');
await p.waitForTimeout(2500);
await p.evaluate((s) => window.__play(s), stage);
await p.waitForTimeout(2000);
const gotIt = async () => { for (let i = 0; i < 6; i++) { const g = p.getByText('Got it!'); if (await g.count()) { await g.first().click(); await p.waitForTimeout(150); } else break; } };
await gotIt();
const setup = (t) => p.evaluate((t) => {
  let e = window.__engine; if (typeof e === 'function') e = e();
  const a = e.enemies.find((x) => x.type === t && !x.defeated);
  window.__target = a;
  if (a.state === 'sleep') { a.state = 'patrol'; a.asleep = false; a.wakeT = 1.1; }
  e.player.x = a.x - 110; e.player.y = a.y - 40; e.player.vx = 0; e.player.vy = 0;
}, t);
await setup(type);
await p.waitForTimeout(500);
await gotIt();
await setup(type);
let n = 0;
const snap = async () => {
  const r = await p.evaluate(() => {
    let e = window.__engine; if (typeof e === 'function') e = e();
    e.player.health = 5; e.player.invulnerable = 30;
    const a = window.__target, z = e.zoom ?? 1;
    return { x: (a.x - e.camera.x) * z, y: (a.y - e.camera.y) * z };
  });
  const W = 380, H = 190;
  const x = Math.max(0, Math.min(844 - W, r.x - W / 2)), y = Math.max(0, Math.min(390 - H, r.y - H * 0.62));
  await p.screenshot({ path: `${outDir}/f${String(n++).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 88, clip: { x, y, width: W, height: H } });
};
const t0 = Date.now();
while (Date.now() - t0 < secs * 1000) await snap();
await p.keyboard.down('ArrowRight'); await p.waitForTimeout(250); await p.keyboard.up('ArrowRight');
const t1 = Date.now();
let k = 0;
while (Date.now() - t1 < 3500) { if (k++ % 3 === 0) p.keyboard.press('j'); await snap(); }
console.log(n, 'frames in', ((Date.now() - t0) / 1000).toFixed(1), 's');
await b.close();
