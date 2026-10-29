// node video.mjs <up|side> -> frames of 7-4's slide mock-up played by a simple bot, frame by frame at 30 fps (the engine's own step),
// for ffmpeg. Needs the dev server on 4301 (npx vite --port 4301). PW=<path to playwright> if it is not installed locally.
import { createRequire } from 'module';
import { mkdirSync } from 'fs';
const { chromium } = createRequire(import.meta.url)(process.env.PW ?? 'playwright');
const mode = process.argv[2] ?? 'side';
const dir = process.argv[3] ?? `/tmp/slide74-${mode}`;
mkdirSync(dir, { recursive: true });
const vp = mode === 'up' ? { width: 390, height: 844 } : { width: 844, height: 390 };
const b = await chromium.launch();
const p = await b.newPage({ viewport: vp, deviceScaleFactor: 1.5, hasTouch: true, isMobile: true });
p.on('pageerror', (e) => { if (!/AudioParam/.test(e.message)) console.log('ERR', e.message); });
await p.goto('http://127.0.0.1:4301/?nodemo=1&lessons=off');
await p.waitForTimeout(4000);
await p.evaluate(() => window.__play('7-4'));
await p.waitForTimeout(4000);
for (let i = 0; i < 6; i++) { const g = p.getByText('Got it!'); if (await g.count()) { await g.first().click({ force: true }); await p.waitForTimeout(300); } else break; }
await p.addStyleTag({ content: '.dg-root{display:none!important}' });
await p.evaluate(() => {
  const e = window.__engine();
  e.isPaused = true; // the page's own loop stops; the frames below step it
  e.player.x = 2300;
  e.player.y = 580;
  const base = e.input.update.bind(e.input);
  window.__miss = -1;
  e.input.update = (dt) => {
    base(dt);
    const s = e.input.state;
    const run = e.slideRun;
    Object.assign(s, { left: false, right: false, jumpPressed: false, jumpHeld: false, down: false });
    if (!run || run.phase === 'hall' || run.phase === 'out') {
      // side-on: run right, hop the blocks
      s.right = true;
      const x = e.player.x;
      if ([2600 - 110, 7000 - 110, 6200 - 110].some((bx) => x > bx && x < bx + 25)) { s.jumpPressed = true; s.jumpHeld = true; }
      return;
    }
    if (run.phase !== 'slide') return;
    const sim = run.sim;
    const v = sim.c.speed;
    const ahead = sim.sorted.filter((o, i) => o.z + o.len > sim.z && o.z < sim.z + v * 1.3 && i !== window.__miss);
    // the lane to be in: free of the next heads (and of a column, which it steers round when it can)
    const blockers = ahead.filter((o) => o.kind === 'head' || o.kind === 'column');
    let want = Math.round(sim.x / 1.2) + 1;
    if (blockers.length) {
      const o = blockers[0];
      if (o.lanes.includes(want)) {
        const free = [0, 1, 2].filter((l) => !o.lanes.includes(l));
        if (free.length) want = free.sort((a, b) => Math.abs(a - want) - Math.abs(b - want))[0];
      }
    }
    const tx = (want - 1) * 1.2;
    if (tx < sim.x - 0.12) s.left = true;
    else if (tx > sim.x + 0.12) s.right = true;
    for (const o of ahead) {
      const dz = o.z - sim.z;
      if ((o.kind === 'rubble' || o.kind === 'gap' || (o.kind === 'column' && o.lanes.includes(want))) && dz > 0 && dz < v * 0.22) s.jumpPressed = true;
      if (o.kind === 'beam' && dz < v * 0.35) s.down = true;
    }
  };
});
const plan = JSON.parse(process.argv[4] ?? '[]');
let n = 0;
const shot = () => p.screenshot({ path: `${dir}/f${String(n++).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 80 });
const step = (k) => p.evaluate((k) => { const e = window.__engine(); for (let i = 0; i < k; i++) e.update(1 / 30); e.render(); }, k);
for (const [what, frames, code] of plan) {
  if (code) await p.evaluate((c) => { const e = window.__engine(); new Function('e', c)(e); }, code);
  for (let i = 0; i < frames; i++) { await step(1); await shot(); }
  console.log(what, n);
}
await b.close();
