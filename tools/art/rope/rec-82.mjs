// 8-2's rope blooms in the real game (w8-rope2, 2026-11-01): Pokey stands on the bough before a rope, runs at the gap, flicks up and
// catches the rope, creeps across hand over hand and lets go onto the far bough. Two flicks: one at the edge, and an early one (150 px
// short of the edge, the first-timer's miss before w8-rope2: his hands topped out short of the rope's end and fell back through it).
// Upright 390x844 and sideways 844x390, a .webm each, plus stills of the moments. Needs a dev-hooks build served on <port>.
//   NODE_ENV=development npx vite build && npx vite preview --port 4301
//   node tools/art/rope/rec-82.mjs 4301 <out dir> <layout> [rope index]
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port = '4301', out = '.', layout = '1', ropeIx = '0'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const [tag, w, h] of [['sideways', 844, 390], ['upright', 390, 844]]) {
  for (const lead of [0, 150]) {
    const name = `8-2-rope-${tag}-${lead ? 'early' : 'edge'}`;
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, recordVideo: { dir: out, size: { width: w, height: h } } });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => console.log('ERR', e.message));
    await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
    await p.waitForTimeout(3000);
    await p.evaluate((l) => window.__play('8-2', Number(l)), layout);
    await p.waitForTimeout(6000);
    const at = await p.evaluate((ix) => {
      let e = window.__engine; if (typeof e === 'function') e = e();
      const r = e.ropes[Number(ix)];
      const from = e.platforms.filter((q) => q.x < r.x0 && q.x + q.width >= r.x0 && q.x + q.width <= r.x0 + 120 && q.y > r.y).sort((a, b) => a.y - b.y)[0];
      const edge = from.x + from.width;
      Object.assign(e.player, { x: Math.max(from.x + 20, edge - 230), y: from.y, vx: 0, vy: 0, grounded: true, hanging: false, facing: 1 });
      e.camera.x = e.camera.targetX = e.player.x - e.camera.viewportWidth * 0.4;
      return { edge, x0: r.x0, x1: r.x1 };
    }, ropeIx);
    await p.waitForTimeout(1200);
    const px = () => p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); return { x: e.player.x, h: !!e.player.hanging, g: !!e.player.grounded, y: e.player.y }; });
    const shot = (s) => p.screenshot({ path: path.join(out, `${name}-${s}.png`) });
    await p.keyboard.down('ArrowRight');
    while ((await px()).x < at.edge - lead - 8) await p.waitForTimeout(10);
    await p.keyboard.down('Space');
    await p.waitForTimeout(120);
    await p.keyboard.up('Space');
    await p.waitForTimeout(90);
    await shot('1-flick');
    let s = await px(), n = 0;
    while (!s.h && n++ < 200) { await p.waitForTimeout(15); s = await px(); }
    await shot(s.h ? '2-grab' : '2-MISSED');
    await p.waitForTimeout(1500);
    await shot('3-crossing');
    n = 0;
    while ((await px()).h && n++ < 600) await p.waitForTimeout(20);
    await p.waitForTimeout(500);
    await shot('4-landed');
    await p.keyboard.up('ArrowRight');
    await p.waitForTimeout(800);
    const vid = p.video();
    await ctx.close();
    const vp = await vid.path();
    fs.renameSync(vp, path.join(out, `${name}.webm`));
    console.log(name, s.h ? 'grabbed' : 'MISSED');
  }
}
await b.close();
