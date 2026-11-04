// dot-box: Meeca's first thought cloud in 5-M ("All asleep. Soft feet. Go."), shot as she starts walking, upright and sideways, with the
// cloud's box (engine.mcThoughtBox, after the fix) checked against her and the way ahead of her (reference/methods/in-play-text.md).
//   PW=/opt/node-tools/node_modules/playwright/index.mjs npx tsx tools/dotbox/meeca.mjs <port> <out dir> <tag>
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const { aheadZone } = await import('../../src/game/dotGuidePerch.ts');
const [port = '4301', out = '.', tag = 'after'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const SIZES = (process.env.SIZES ?? 'upright:412x915,sideways:915x412').split(',').map((q) => { const [n, d] = q.split(':'); const [w, h] = d.split('x'); return [n, +w, +h]; });
const b = await chromium.launch();
const rec = { moment: '5-M-thought', tag, shots: [] };
for (const [ori, W, H] of SIZES) {
  const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 90000 });
  await p.evaluate(() => window.__play('5-M', 1));
  await p.waitForFunction(() => typeof window.__engine === 'function' && !!window.__engine()?.mc, null, { timeout: 90000 });
  await p.waitForTimeout(3500);
  // (the card, tapped away)
  for (let i = 0; i < 40; i++) {
    const phase = await p.evaluate(() => window.__engine().mc.phase);
    if (phase !== 'card') break;
    await p.touchscreen.tap(W / 2, H / 2);
    await p.keyboard.press('j');
    await p.waitForTimeout(400);
  }
  await p.waitForFunction(() => !!window.__engine().mc.thought, null, { timeout: 20000 }).catch(() => {});
  await p.keyboard.down('ArrowRight');
  await p.waitForTimeout(700);
  await p.keyboard.up('ArrowRight');
  await p.waitForTimeout(150);
  const file = path.join(out, `5-M-thought-${tag}-${ori}.png`);
  await p.screenshot({ path: file });
  const r = await p.evaluate(() => {
    const e = window.__engine();
    const q = e.player;
    return { text: e.mc.thought?.text ?? null, box: e.mcThoughtBox ?? null, v: { px: q.x, py: q.y, pw: q.width, ph: q.height, zoom: e.zoom, camX: e.camera.x, camY: e.camera.y, cssW: e.viewCssW, cssH: e.viewCssH, facing: q.facing, climbing: q.climbing, grounded: q.grounded, vy: q.vy, gliding: false } };
  });
  const z = r.v.zoom;
  const her = { x0: (r.v.px - r.v.camX) * z, y0: (r.v.py - r.v.ph - r.v.camY) * z, x1: (r.v.px + r.v.pw - r.v.camX) * z, y1: (r.v.py - r.v.camY) * z };
  const ahead = aheadZone(r.v);
  const hit = (a, c) => a && c && a.x0 < c.x1 && a.x1 > c.x0 && a.y0 < c.y1 && a.y1 > c.y0;
  const bx = r.box && { x0: r.box.x, y0: r.box.y, x1: r.box.x + r.box.w, y1: r.box.y + r.box.h };
  const checks = bx ? { meeca: !hit(bx, her), ahead: !hit(bx, ahead) } : null;
  rec.shots.push({ ori, file, text: r.text, box: bx, her, ahead, checks });
  console.log('5-M', ori, JSON.stringify({ text: r.text, box: bx, checks }));
  await p.context().close();
}
fs.writeFileSync(path.join(out, `5-M-thought-${tag}.json`), JSON.stringify(rec, null, 1));
await b.close();
