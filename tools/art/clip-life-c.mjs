// polish-c (AN-1, AN-2): losing a life to a hit, as a run of screenshots (a video recording shrinks the page once play goes wide),
// upright and sideways; then ffmpeg makes the clip. node tools/art/clip-life-c.mjs <port> <outDir> [stage] [last=1]
import { createRequire } from 'module';
import fs from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, outDir, stage = '1-2', last = '0'] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(3500);
  await p.evaluate((s) => window.__play(s), stage);
  await p.waitForTimeout(6000);
  const dir = `${outDir}/${tag}${last === '1' ? '-last' : ''}`;
  fs.mkdirSync(dir, { recursive: true });
  // (real time: about one screenshot every 170 ms; times.json keeps when each was taken, so the clip plays at the right speed)
  await p.evaluate((l) => {
    const e = window.__engine();
    if (l === '1') e.lives = 1;
    e.player.hp = 1;
    e.player.invincibleTimer = 0;
    e.stompGrace = 0;
    e.damagePlayer(1, e.player.x + 40);
  }, last);
  const t0 = Date.now();
  const times = [];
  for (let i = 0; i < 36; i++) {
    await p.screenshot({ path: `${dir}/f${String(i).padStart(3, '0')}.png` });
    times.push(Date.now() - t0);
  }
  fs.writeFileSync(`${dir}/times.json`, JSON.stringify(times));
  await p.close();
}
await b.close();
