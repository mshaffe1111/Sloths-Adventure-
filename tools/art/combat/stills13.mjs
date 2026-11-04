// 1-3 rebuild stills (w8-rope2, 2026-11-04): Pokey placed at each node's start in the real game, upright and sideways, one still per
// node (and a second further into the split and the climax), then a contact sheet per orientation.
//   PW=/opt/node-tools/node_modules/playwright/index.mjs node tools/art/combat/stills13.mjs <port> <out dir> [seed]
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port = '4303', out = '.', seedS = '1'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const [tag, w, h] of [['side', 844, 390], ['up', 390, 844]]) {
  const page = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
  page.on('pageerror', (e) => console.log('ERR', e.message));
  await page.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await page.waitForTimeout(3000);
  await page.evaluate((s) => window.__play('1-3', s), Number(seedS));
  await page.waitForTimeout(8000);
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(300); await page.keyboard.up('ArrowRight');
  await page.waitForTimeout(6000);
  const beats = await page.evaluate(() => window.__engine().proto.beats.map((b) => [b[0], b[1], b[2]]));
  const spots = [];
  for (const [x0, x1, name] of beats) {
    spots.push([x0 + 260, name.split(':')[0]]);
    if (/Spike|Climax|Ramp/.test(name)) spots.push([(x0 + x1) / 2, name.split(':')[0] + ' (middle)']);
  }
  let n = 0;
  for (const [px, label] of spots) {
    await page.evaluate((px) => {
      const e = window.__engine();
      e.isPaused = true;
      const p = e.player;
      const under = e.platforms.filter((q) => q.x <= px && q.x + q.width >= px && !q.broken).sort((a, c) => a.y - c.y);
      const g = under.find((q) => q.y > 300) ?? under[0];
      Object.assign(p, { x: px, y: g ? g.y : 580, vx: 0, vy: 0, grounded: true, facing: 1, invincibleTimer: 5 });
      const c = e.camera;
      c.x = c.targetX = p.x - c.viewportWidth * 0.35;
      c.y = c.targetY = p.y - c.viewportHeight * 0.6;
      for (let i = 0; i < 6; i++) e.update(1 / 30);
      e.render();
    }, px);
    const f = path.join(out, `${tag}-${String(n++).padStart(2, '0')}.png`);
    await page.screenshot({ path: f });
    console.log(tag, label, Math.round(px), f);
  }
  await page.context().close();
}
await b.close();
