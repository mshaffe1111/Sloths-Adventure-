// ENG-WALL-b scratch: a 2x still of each puzzle room's shut gate wall (drawWallArt over a door), as it is. node gate.mjs <out> <id>...
const { chromium } = await import('/opt/node-tools/node_modules/playwright/index.mjs');
const fs = await import('node:fs');
const [out, ...ids] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const b = await chromium.launch();
for (const [orient, W, H] of [['upright', 412, 915], ['sideways', 915, 412]]) for (const id of ids) {
  const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto('http://127.0.0.1:5291/?lessons=off'); await p.waitForTimeout(2500);
  await p.evaluate((id) => window.__play(id, 1), id); await p.waitForTimeout(5000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(1500);
  const info = await p.evaluate((E) => {
    const e = eval(E); e.isPaused = true;
    const g = e.kit?.rooms?.find((r) => r.gates?.length)?.gates[0];
    if (!g) return { none: true };
    const x = g.wall.x - 110;
    const under = e.platforms.filter((q) => x >= q.x && x <= q.x + q.width && !q.soil && q.y >= g.door.y - 10).sort((a, c) => a.y - c.y)[0];
    Object.assign(e.player, { x, y: under ? under.y : g.door.y + 118, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
    for (let i = 0; i < 60; i++) { e.player.vx = 0; e.update(1 / 30); }
    e.player.invincibleTimer = 0;
    for (let i = 0; i < 40; i++) e.render();
    const z = e.camera.zoom * document.querySelector('canvas').getBoundingClientRect().width / e.camera.viewportWidth;
    return { wall: { x: g.wall.x, y: g.wall.y, w: g.wall.width }, door: { y: g.door.y }, look: g.spec.look ?? null, cam: { x: e.camera.x, y: e.camera.y }, z };
  }, E);
  console.log(id, orient, JSON.stringify(info));
  await p.screenshot({ path: `${out}/gate-${id}-${orient}.png` });
  fs.writeFileSync(`${out}/gate-${id}-${orient}.json`, JSON.stringify(info));
  await p.close();
}
await b.close();
