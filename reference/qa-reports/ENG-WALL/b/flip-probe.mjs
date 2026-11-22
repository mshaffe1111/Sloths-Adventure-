// ENG-WALL-b: the plant for the lead's ruling C (the frame never flips ground path). For each case the frames the game draws are kept
// (luma, 4-px cells over the canvas), then each camera is drawn again SETTLED (30 renders, the squares all in) and compared.
// RED while any frame differs from its settled self by more than 1 luma (mean) or any 4-px column of cells by more than 4.
//   node flip-probe.mjs <port> <out> [upright|sideways]     (a DSF 2 page on the stage server at <port>)
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
const res = await p.evaluate((E) => {
  const e = eval(E); e.isPaused = true;
  const main = [...document.querySelectorAll('canvas')].sort((a, c) => c.width * c.height - a.width * a.height)[0];
  const g = main.getContext('2d');
  const cells = () => { const d = g.getImageData(0, 0, main.width, main.height).data, out = []; for (let y = 0; y < main.height; y += 8) for (let x = 0; x < main.width; x += 8) { const i = (y * main.width + x) * 4; out.push(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]); } return out; };
  const cols = Math.ceil(main.width / 8);
  const place = (x, y, vy = 0) => { Object.assign(e.player, { x, y, vx: 0, vy, grounded: vy === 0, hanging: false, climbing: false, invincibleTimer: 9 }); };
  const cases = {};
  const judge = (name, frames) => {
    const rows = [];
    for (const f of frames) {
      Object.assign(e.camera, f.cam); for (let i = 0; i < 30; i++) e.render(); Object.assign(e.camera, f.cam); e.render();
      const s = cells(); let sum = 0; const colD = new Array(cols).fill(0), colN = new Array(cols).fill(0);
      for (let i = 0; i < s.length; i++) { const d = Math.abs(s[i] - f.l[i]); sum += d; colD[i % cols] += d; colN[i % cols]++; }
      const worst = Math.max(...colD.map((v, i) => v / colN[i]));
      rows.push({ cam: [Math.round(f.cam.x), Math.round(f.cam.y)], mean: +(sum / s.length).toFixed(2), worstCol: +worst.toFixed(1) });
    }
    cases[name] = { red: rows.some((r) => r.mean > 1 || r.worstCol > 4), rows };
  };
  // (1) a cold view: Pokey put down far from where the squares are (as a respawn or a stage start puts the camera)
  for (const x of [19900, 14800]) {
    const under = e.platforms.filter((q) => x >= q.x && x <= q.x + q.width && !q.soil).sort((a, c) => c.y - a.y)[0];
    place(x, under ? under.y : 1500);
    for (let i = 0; i < 3; i++) { e.player.vx = 0; e.update(1 / 30); }
    e.camera.x = e.camera.targetX ?? e.camera.x; e.camera.y = e.camera.targetY ?? e.camera.y;
    e.render();
    judge(`cold x ${x}`, [{ cam: { x: e.camera.x, y: e.camera.y }, l: cells() }]);
  }
  // (0) the control: a settled frame against itself (must be ~0, or the measure is noise)
  { for (let i = 0; i < 30; i++) e.render(); judge('control (settled vs settled)', [{ cam: { x: e.camera.x, y: e.camera.y }, l: cells() }]); }
  // (2) the fastest descent: from the top of the descent column (x 18990), falling at maxFall, every frame drawn as the game does
  place(18990, 600, 950);
  const frames = [];
  for (let i = 0; i < 40; i++) { e.update(1 / 30); e.render(); frames.push({ cam: { x: e.camera.x, y: e.camera.y }, l: cells() }); }
  judge('descent x 18990', frames);
  return cases;
}, E);
let red = false;
for (const [k, v] of Object.entries(res)) { red ||= v.red; const w = v.rows.reduce((a, r) => (r.mean > a.mean ? r : a)); console.log(`${v.red ? 'RED  ' : 'GREEN'} ${orient} ${k}: ${v.rows.length} frames, worst mean ${w.mean} worstCol ${Math.max(...v.rows.map((r) => r.worstCol))} at cam ${w.cam}`); }
fs.writeFileSync(`${out}/flip-${orient}.json`, JSON.stringify(res));
await b.close();
process.exit(red ? 1 : 0);
