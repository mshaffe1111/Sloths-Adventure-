// node shoot.mjs <port> <out> <prefix> <stage> <layout> <px:pick:cx0:cy0:cx1:cy1> ...  (stills-at's way; also a crop of the world rect)
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const { chromium } = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default;
const [port, out, prefix, id, layout, ...spots] = process.argv.slice(2);
const only = process.env.ORIENT;
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  if (only && only !== tag) continue;
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(2500);
  if (process.env.FLAGS) await p.evaluate((f) => { for (const k of f.split(',')) globalThis[k] = true; }, process.env.FLAGS);
  await p.evaluate(([id, v]) => window.__play(id, v), [id, +layout]); await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(3000);
  for (const spot of spots) {
    const [xs, pick = 'low', ...cr] = spot.split(':'); const x = +xs;
    await p.evaluate(([x, pick, E]) => { const e = eval(E); e.isPaused = true;
      const under = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type !== 'bouncy' && q.pit !== 'hurt' && x >= q.x && x <= q.x + q.width).sort((a, c) => pick === 'low' ? c.y - a.y : a.y - c.y)[0];
      Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
      for (let i = 0; i < 450; i++) e.update(1 / 30); }, [x, pick, E]);
    for (let i = 0; i < 30; i++) {
      await p.evaluate((E) => { const e = eval(E); e.update(1 / 30); e.clearGuide?.(); e.player.invincibleTimer = 0; e.render(); }, E);
      await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    }
    if (cr.length === 4) for (let i = 0; i < 12; i++) {
      await p.evaluate(([E, cr]) => { const e = eval(E); const [a, b, c, d] = cr.map(Number);
        e.camera.x = (a + c) / 2 - e.camera.viewportWidth / 2; e.camera.y = (b + d) / 2 - e.camera.viewportHeight / 2; e.clearGuide?.(); e.render(); }, [E, cr]);
      await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    }
    if (process.env.HIDEUI) await p.addStyleTag({ content: 'body{visibility:hidden} canvas{visibility:visible}' });
    const cam = await p.evaluate((E) => { const e = eval(E); e.player.invincibleTimer = 0; return [e.camera.x, e.camera.y, e.zoom]; }, E);
    const file = path.join(out, `${prefix}-${id}-L${layout}-x${x}-${tag}.png`);
    await p.screenshot({ path: file });
    if (cr.length === 4) { const [a, bb, c, d] = cr.map(Number); const s = (wx, wy) => [Math.round((wx - cam[0]) * cam[2] * 2), Math.round((wy - cam[1]) * cam[2] * 2)];
      const [X0, Y0] = s(a, bb), [X1, Y1] = s(c, d);
      execFileSync('python3', ['-c', `from PIL import Image;im=Image.open('${file}');im.crop((${X0},${Y0},${X1},${Y1})).save('${file.replace('.png', '-crop.png')}')`]); }
    console.log('wrote', file, 'cam', cam.map((v) => v.toFixed(2)).join(' '));
  }
  await p.context().close();
}
await b.close();
