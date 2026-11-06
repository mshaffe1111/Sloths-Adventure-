// 1-8's chase at its closest approach on a first-timer run (fun-validator, the quality supervisor 11-04: "the player has to SEE it"):
// Pokey where the collapse came closest, the front where it was, held still, the engine's camera settled; upright and sideways.
//   node tools/validate/chaseshot.mjs <port> <layout> <pokeyX> <frontX>
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs');
const [port = '4302', layout = '2', px = '32320', fx = '32186'] = process.argv.slice(2);
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const b = await chromium.launch();
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(2500);
  await p.evaluate((l) => window.__play('1-8', Number(l)), layout);
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(6000);
  const info = await p.evaluate(([x, f, E]) => {
    const e = eval(E);
    e.isPaused = true;
    const under = e.platforms.filter((q) => !q.broken && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
    Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, facing: 1, invincibleTimer: 9 });
    e.chase.front = f; e.chase.active = true; e.chase.hold = 99;
    for (let i = 0; i < 45; i++) e.update(1 / 30);
    e.clearGuide?.();
    // (safe while the frames settle, then not: a still never shows him flashing see-through, the lead 11-05)
    e.player.invincibleTimer = 0;
    e.render();
    return { camX: Math.round(e.camera.x), vw: Math.round(e.camera.viewportWidth), front: Math.round(e.chase.front), x: Math.round(e.player.x) };
  }, [Number(px), Number(fx), E]);
  const file = path.join('reference/qa-reports/validator/stills', `1-8-chase-closest-${tag}.jpg`);
  await p.screenshot({ path: file, type: 'jpeg', quality: 75 });
  console.log(tag, JSON.stringify(info), info.front >= info.camX && info.front <= info.camX + info.vw ? 'FRONT ON SCREEN' : 'front off screen');
  await p.context().close();
}
await b.close();
