// ENG-WALL-d: b/flip-probe.mjs split by layer. Each case's frames as the game draws them, against the same camera drawn SETTLED (30
// renders, every square in), measured twice: the whole canvas, and the GROUND only (a mask of the 8-px cells whose world point lies in a
// painted bank, protoArt.ts bankPainted, at least 16 under its top so the animated grass and flowers are left out, and more than 160 from
// Pokey). RED on the ground while any frame's masked cells differ from settled by more than 1 luma (mean).
// Cases: the stage start (squares released, the dolly at its first frame), a cold respawn (x 19900, 14800), the fastest descent (x 18990).
//   node flip-layers.mjs <port> <out> [upright|sideways]     (a DSF 2 page on the vite dev server at <port>)
const { chromium } = await import(process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs');
const fs = await import('node:fs');
const [port, out, orient = 'upright'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const [W, H] = orient === 'upright' ? [412, 915] : [915, 412];
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })).newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(3000);
await p.evaluate(() => window.__play('2-97', 1)); await p.waitForTimeout(6000);
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(2000);
const res = await p.evaluate(async (E) => {
  const art = await import('/src/game/protoArt.ts');
  const e = eval(E); e.isPaused = true;
  const main = [...document.querySelectorAll('canvas')].sort((a, c) => c.width * c.height - a.width * a.height)[0];
  const g = main.getContext('2d');
  const cols = Math.ceil(main.width / 8);
  const cells = () => { const d = g.getImageData(0, 0, main.width, main.height).data, o = []; for (let y = 0; y < main.height; y += 8) for (let x = 0; x < main.width; x += 8) { const i = (y * main.width + x) * 4; o.push(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]); } return o; };
  // (the ground mask for this camera: the cell's world point inside a painted bank, under its grass, away from Pokey)
  const mask = () => {
    const k = main.width / e.camera.viewportWidth, banks = e.platforms.filter((q) => art.bankPainted(q)), m = [];
    const px = e.player.x + (e.player.width ?? 0) / 2, py = e.player.y + (e.player.height ?? 0) / 2;
    for (let y = 0; y < main.height; y += 8) for (let x = 0; x < main.width; x += 8) {
      const wx = e.camera.x + x / k, wy = e.camera.y + y / k;
      m.push(Math.hypot(wx - px, wy - py) > 160 && banks.some((q) => wx >= q.x && wx <= q.x + q.width && wy >= q.y + 16));
    }
    return m;
  };
  const place = (x, y, vy = 0) => { Object.assign(e.player, { x, y, vx: 0, vy, grounded: vy === 0, hanging: false, climbing: false, invincibleTimer: 9 }); };
  const cases = {};
  const judge = (name, frames) => {
    const rows = [];
    for (const f of frames) {
      if (f.introT !== undefined) { e.introT = f.introT; e.applyZoom(); }
      Object.assign(e.camera, f.cam); for (let i = 0; i < 30; i++) e.render(); Object.assign(e.camera, f.cam); e.render();
      // (and the cells near where Pokey is drawn on the re-render: after the descent he is at its end, maybe inside an earlier frame's view)
      const k2 = main.width / e.camera.viewportWidth, ex = e.player.x + (e.player.width ?? 0) / 2, ey = e.player.y + (e.player.height ?? 0) / 2;
      const near = (i) => { const x = (i % cols) * 8, y = Math.floor(i / cols) * 8; return Math.hypot(e.camera.x + x / k2 - ex, e.camera.y + y / k2 - ey) <= 160; };
      const s = cells(); let sum = 0, gs = 0, gn = 0; const colD = new Array(cols).fill(0), colN = new Array(cols).fill(0);
      for (let i = 0; i < s.length; i++) { const d = Math.abs(s[i] - f.l[i]); sum += d; colD[i % cols] += d; colN[i % cols]++; if (f.m[i] && !near(i)) { gs += d; gn++; } }
      const worst = Math.max(...colD.map((v, i) => v / colN[i]));
      rows.push({ cam: [Math.round(f.cam.x), Math.round(f.cam.y)], mean: +(sum / s.length).toFixed(2), worstCol: +worst.toFixed(1), ground: gn ? +(gs / gn).toFixed(2) : null, groundCells: gn, other: +((sum - gs) / Math.max(1, s.length - gn)).toFixed(2) });
    }
    cases[name] = { groundRed: rows.some((r) => r.ground !== null && r.ground > 1), rows };
  };
  // (0) the control: settled against itself
  { for (let i = 0; i < 30; i++) e.render(); judge('control', [{ cam: { x: e.camera.x, y: e.camera.y }, l: cells(), m: mask() }]); }
  // (1) the stage start: Pokey at the start, every square released, the intro dolly at its first eased frame
  {
    place(e.currentStage.spawnX, e.currentStage.spawnY);
    for (let i = 0; i < 3; i++) { e.player.vx = 0; e.update(1 / 30); }
    e.camera.x = e.camera.targetX ?? e.camera.x; e.camera.y = e.camera.targetY ?? e.camera.y;
    art.releaseGroundChunks(); e.introT = 1 / 30; e.applyZoom(); e.render();
    judge('stage start', [{ cam: { x: e.camera.x, y: e.camera.y }, l: cells(), m: mask(), introT: 1 / 30 }]);
    e.introT = 99; e.applyZoom();
  }
  // (2) a cold respawn: Pokey put down far from where the squares are
  for (const x of [19900, 14800]) {
    const under = e.platforms.filter((q) => x >= q.x && x <= q.x + q.width && !q.soil).sort((a, c) => c.y - a.y)[0];
    place(x, under ? under.y : 1500);
    for (let i = 0; i < 3; i++) { e.player.vx = 0; e.update(1 / 30); }
    e.camera.x = e.camera.targetX ?? e.camera.x; e.camera.y = e.camera.targetY ?? e.camera.y;
    e.render();
    judge(`cold x ${x}`, [{ cam: { x: e.camera.x, y: e.camera.y }, l: cells(), m: mask() }]);
  }
  // (3) the fastest descent: from the top of the descent column (x 18990), falling at maxFall, every frame drawn as the game does
  place(18990, 600, 950);
  const frames = [];
  for (let i = 0; i < 40; i++) { e.update(1 / 30); e.render(); frames.push({ cam: { x: e.camera.x, y: e.camera.y }, l: cells(), m: mask() }); }
  judge('descent x 18990', frames);
  return cases;
}, E);
let red = false;
for (const [k, v] of Object.entries(res)) {
  red ||= v.groundRed;
  const w = v.rows.reduce((a, r) => ((r.ground ?? 0) > (a.ground ?? 0) ? r : a));
  const bad = v.rows.filter((r) => r.ground !== null && r.ground > 1).length;
  console.log(`${v.groundRed ? 'RED  ' : 'GREEN'} ${orient} ${k}: ${v.rows.length} frames (${bad} over 1 on the ground); worst ground ${w.ground} (${w.groundCells} cells), other layers ${w.other}, whole ${w.mean}, worstCol ${Math.max(...v.rows.map((r) => r.worstCol))} at cam ${w.cam}`);
}
fs.writeFileSync(`${out}/flip-layers-${orient}.json`, JSON.stringify(res));
await b.close();
process.exit(red ? 1 : 0);
