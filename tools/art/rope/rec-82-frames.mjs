// 8-2's rope grab, frame by frame (w8-rope2): the engine paused and stepped one 30 fps frame at a time, a screenshot each, so the clip
// shows every frame the phone would (no headless-browser lag). The early flick (150 px short of the bough's end): he is caught past the
// rope's end on the way down and slides onto it over 3 frames. Writes <out>/<tag>-NNN.png; tools/art/rope/rec-82.mjs has the rest.
//   PW=/opt/node-tools/node_modules/playwright/index.mjs node tools/art/rope/rec-82-frames.mjs 4301 <out> <layout> <rope index> <lead px>
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port = '4301', out = '.', layout = '1', ropeIx = '0', leadS = '150'] = process.argv.slice(2);
const lead = Number(leadS);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const [tag, w, h] of [['sideways', 844, 390], ['upright', 390, 844]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(3000);
  await p.evaluate((l) => window.__play('8-2', Number(l)), layout);
  await p.waitForTimeout(9000);
  const edge = await p.evaluate((ix) => {
    const e = window.__engine();
    const r = e.ropes[Number(ix)];
    const from = e.platforms.filter((q) => q.x < r.x0 && q.x + q.width >= r.x0 && q.x + q.width <= r.x0 + 120 && q.y > r.y).sort((a, b) => a.y - b.y)[0];
    const edge = from.x + from.width;
    Object.assign(e.player, { x: edge - 330, y: from.y, vx: 0, vy: 0, grounded: true, hanging: false, facing: 1 });
    e.isPaused = true;
    for (let i = 0; i < 20; i++) { e.update(1 / 30); }
    return edge;
  }, ropeIx);
  const step = () => p.evaluate(() => { const e = window.__engine(); e.update(1 / 30); e.render(); const q = e.player; return { x: q.x, y: q.y, h: !!q.hanging }; });
  await p.keyboard.down('ArrowRight');
  let s = await step(), n = 0, pressed = -1, grabbed = -1;
  const log = [];
  while (n < 400) {
    if (pressed < 0 && s.x >= edge - lead - 60) { /* start filming a little before the flick */ }
    if (pressed < 0 && s.x >= edge - lead) { await p.keyboard.down('Space'); pressed = n; }
    if (pressed >= 0 && n - pressed === 5) await p.keyboard.up('Space');
    s = await step();
    if (s.x >= edge - lead - 60) {
      const f = String(log.length).padStart(3, '0');
      await p.screenshot({ path: path.join(out, `${tag}-${f}.png`) });
      log.push(`${f} x ${s.x.toFixed(1)} y ${s.y.toFixed(1)} ${s.h ? 'HANG' : ''}`);
    }
    if (s.h && grabbed < 0) grabbed = n;
    if (grabbed >= 0 && n - grabbed > 30) break;
    n++;
  }
  await p.keyboard.up('ArrowRight');
  fs.writeFileSync(path.join(out, `${tag}-frames.txt`), log.join('\n') + '\n');
  console.log(tag, 'frames', log.length, grabbed >= 0 ? 'grabbed' : 'MISSED');
  await p.context().close();
}
await b.close();
