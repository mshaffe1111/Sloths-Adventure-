// polish-c (AN-1, AN-2): a clip of losing a life to a hit (the beat, the dark closing, the flag, the blink after), upright and sideways
// node tools/art/rec-life-c.mjs <port> <outDir> [stage] [last=1 for the last life]
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, outDir, stage = '1-2', last = '0'] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, recordVideo: { dir: outDir, size: { width: w, height: h } } });
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(3500);
  await p.evaluate((s) => window.__play(s), stage);
  await p.waitForTimeout(6000);
  await p.evaluate((l) => {
    const e = window.__engine();
    if (l === '1') e.lives = 1;
    e.player.hp = 1;
    e.player.invincibleTimer = 0;
    e.stompGrace = 0;
    e.damagePlayer(1, e.player.x + 40);
  }, last);
  await p.waitForTimeout(3500);
  const v = p.video();
  await ctx.close();
  fs.renameSync(await v.path(), path.join(outDir, `life-${stage}${last === '1' ? '-last' : ''}-${tag}.webm`));
}
await b.close();
