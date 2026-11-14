// camFeel — the camera through the climbing vine's moves on the REAL page (FEEL-CAM, R-165.214 second half). Upright 390x844 and
// sideways 844x390, stepped 1/30 s at a time on Playwright's clock (tools/inspect/vineFeelClip.mjs's way: the clock is installed before
// the page loads). Each frame logs the camera (e.camera x/y), its aim, the anchor and the landing look, and Pokey; a frame where the view
// moves more than the eye takes as a cut is flagged with the rule that moved it. Optional: shoots every frame for a sheet or clip.
// The moves are found from the stage's own vines (no stage id, seed or x here): GRAB (jump from beside a trunk's foot, up), VAULT (up
// off a trunk's top onto its bough), STEP (two pushes between field vines), LEAP (jump across to the next field vine), OFF (jump off a
// trunk sideways and land), DOWN (climb down to the ground and walk off).
//   node tools/inspect/camFeel.mjs <port> <out dir> <stage> [layout] [--shots] [--moves grab,vault]
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = await import(process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs');
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const pos = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--moves', '--orient'].includes(args[i - 1])));
const [port = '3101', out = 'reference/qa-reports/FEEL-CAM/measure', stage = '1-4', layout = '1'] = pos;
const shots = flag('--shots');
const only = opt('--moves')?.split(',');
const orients = (opt('--orient') ?? 'up,side').split(',');
mkdirSync(out, { recursive: true });

const TRUNK = `(v) => v.vineType === 'tree_climb' && !v.field && !v.pair`;
const FIELD = `const F = e.vines.filter((v) => v.vineType === 'tree_climb' && v.field && !v.off);
      const by = (v, w) => w.x > v.x && w.x - v.x <= 90 && Math.min(w.bottomY, v.bottomY) - Math.max(w.topY, v.topY) > 200;
      const a = F.find((v) => F.some((w) => by(v, w)));
      if (!a) return 'no field pair';
      const b = F.find((w) => by(a, w));
      Object.assign(e.player, { x: a.x, y: (Math.max(a.topY, b.topY) + Math.min(a.bottomY, b.bottomY)) / 2 + 40, vx: 0, vy: 0, grounded: false, climbing: true, facing: 1 });`;
/** one move: where he is put (in the page; returns a string if the stage has no such place) and the keys held, frame by frame */
const MOVES = {
  grab: {
    place: `const v = e.vines.find((v) => (${TRUNK})(v) && e.platforms.some((q) => q.x <= v.x - 90 && q.x + q.width >= v.x - 40 && Math.abs(q.y - v.bottomY) < 4));
      if (!v) return 'no trunk with ground beside its foot';
      Object.assign(e.player, { x: v.x - 90, y: v.bottomY, vx: 0, vy: 0, grounded: true, climbing: false, facing: 1 });`,
    keys: [[], [], [], [], [], [], ...Array(7).fill(['Space', 'ArrowRight', 'ArrowUp']), ...Array(20).fill(['ArrowUp']), ...Array(20).fill([])],
  },
  vault: {
    place: `const v = e.vines.find((v) => (${TRUNK})(v) && e.platforms.some((q) => Math.abs(q.y - v.topY) < 4 && (Math.abs(q.x + q.width - v.x) < 40 || Math.abs(q.x - v.x) < 40)));
      if (!v) return 'no trunk with a bough at its top';
      Object.assign(e.player, { x: v.x, y: v.topY + 90, vx: 0, vy: 0, grounded: false, climbing: true, facing: 1 });`,
    keys: [[], [], [], [], ...Array(22).fill(['ArrowUp']), ...Array(24).fill([])],
  },
  step: { place: FIELD, keys: [[], [], [], [], ...Array(4).fill(['ArrowRight']), ...Array(8).fill([]), ...Array(4).fill(['ArrowRight']), ...Array(20).fill([])] },
  leap: { place: FIELD, keys: [[], [], [], [], ...Array(6).fill(['Space', 'ArrowRight', 'ArrowUp']), ...Array(16).fill(['ArrowUp']), ...Array(20).fill([])] },
  off: {
    place: `const v = e.vines.find((v) => (${TRUNK})(v) && v.bottomY - v.topY > 260 && e.platforms.some((q) => q.x <= v.x - 160 && q.x + q.width >= v.x - 40 && q.y > v.bottomY - 4 && q.y < v.bottomY + 200));
      if (!v) return 'no trunk with ground beside it';
      Object.assign(e.player, { x: v.x, y: v.bottomY - 140, vx: 0, vy: 0, grounded: false, climbing: true, facing: -1 });`,
    keys: [[], [], [], [], ...Array(4).fill(['Space', 'ArrowLeft']), ...Array(10).fill(['ArrowLeft']), ...Array(36).fill([])],
  },
  down: {
    place: `const v = e.vines.find((v) => (${TRUNK})(v) && v.bottomY - v.topY > 260 && e.platforms.some((q) => q.x <= v.x - 60 && q.x + q.width >= v.x + 10 && Math.abs(q.y - v.bottomY) < 4));
      if (!v) return 'no trunk standing on ground';
      Object.assign(e.player, { x: v.x, y: v.bottomY - 200, vx: 0, vy: 0, grounded: false, climbing: true, facing: -1 });`,
    keys: [[], [], [], [], ...Array(26).fill(['ArrowDown']), ...Array(10).fill(['ArrowLeft']), ...Array(20).fill([])],
  },
};

const PROBE = () => {
  let e = window.__engine; if (typeof e === 'function') e = e();
  const p = e.player, c = e.camera;
  return { cx: c.x, cy: c.y, tx: c.targetX, ty: c.targetY, an: e.camAnchorY, lx: e.camLandX, ly: e.camLandY, lifted: e.camLifted,
    px: p.x, py: p.y, cl: !!p.climbing, gr: !!p.grounded, hang: !!p.hanging, s: c.viewportWidth ? e.viewCssW / c.viewportWidth : 1, t: Math.round(e.gameTime * 30) };
};

const b = await chromium.launch();
const summary = [];
for (const [orient, w, h] of [['up', 390, 844], ['side', 844, 390]].filter(([o]) => orients.includes(o))) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  const T0 = Date.parse('2026-11-13T23:00:00Z');
  await p.clock.install({ time: T0 });
  await p.clock.pauseAt(T0 + 1000);
  await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
  const run = async (ms) => { for (let t = 0; t < ms; t += 500) { await p.clock.runFor(500); await p.waitForTimeout(150); } };
  await run(3500);
  await p.evaluate(([s, l]) => window.__play(s, Number(l)), [stage, layout]);
  await run(6000);
  for (let i = 0; i < 4; i++) { const g = p.getByText('Skip tips'); if (await g.count()) { await g.first().click(); await run(500); } else break; }
  for (const [name, m] of Object.entries(MOVES).filter(([n]) => !only || only.includes(n))) {
    const miss = await p.evaluate((src) => {
      let e = window.__engine; if (typeof e === 'function') e = e();
      e.hands = null; e.vineCooldownTimer = 0; e.climbGrace = 0; e.upIntent = 0;
      return new Function('e', src)(e) ?? null;
    }, m.place);
    if (miss) { console.log(orient, name, 'SKIP:', miss); continue; }
    // (a second and a half for the view to come to rest after the placement cut)
    await run(1500);
    const dir = join(out, `${stage}-${name}-${orient}-frames`);
    if (shots) { rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true }); }
    const rows = [await p.evaluate(PROBE)];
    let held = new Set();
    for (let i = 0; i < m.keys.length; i++) {
      const now = new Set(m.keys[i]);
      for (const k of held) if (!now.has(k)) await p.keyboard.up(k);
      for (const k of now) if (!held.has(k)) await p.keyboard.down(k);
      held = now;
      await p.clock.runFor(1000 / 30);
      rows.push(await p.evaluate(PROBE));
      if (shots) await p.screenshot({ path: join(dir, `f${String(i).padStart(4, '0')}.png`) });
    }
    for (const k of held) await p.keyboard.up(k);
    // per frame: the view's move (css px on the screen) and its change from the frame before (the jerk the eye reads as a cut)
    let worst = { d: 0, j: 0, fd: -1, fj: -1 };
    const lines = [];
    for (let i = 1; i < rows.length; i++) {
      const a = rows[i - 1], r = rows[i];
      const dx = (r.cx - a.cx) * r.s, dy = (r.cy - a.cy) * r.s;
      const pdx = i > 1 ? (a.cx - rows[i - 2].cx) * a.s : 0, pdy = i > 1 ? (a.cy - rows[i - 2].cy) * a.s : 0;
      const d = Math.hypot(dx, dy), j = Math.hypot(dx - pdx, dy - pdy);
      // which rule: the anchor re-picked, the landing look, or the HUD hold / lift (the aim moved by more than the anchor)
      const why = [Math.abs(r.an - a.an) > 2 ? `anchor ${Math.round(r.an - a.an)}` : '', Math.abs(r.ly - a.ly) + Math.abs(r.lx - a.lx) > 2 ? `land ${Math.round(r.lx - a.lx)},${Math.round(r.ly - a.ly)}` : '',
        Math.abs(r.ty - a.ty - (r.an - a.an) - (r.ly - a.ly)) > 2 ? `aimY ${Math.round(r.ty - a.ty)}` : '', r.cl !== a.cl ? (r.cl ? 'GRAB' : 'LET GO') : '', r.gr !== a.gr ? (r.gr ? 'LAND' : 'LEAVE') : ''].filter(Boolean).join(' ');
      if (d > worst.d) Object.assign(worst, { d, fd: i });
      if (j > worst.j) Object.assign(worst, { j, fj: i });
      lines.push(`f${i} cam ${Math.round(r.cx)},${Math.round(r.cy)} move ${dx.toFixed(1)},${dy.toFixed(1)} jerk ${j.toFixed(1)} aim ${Math.round(r.tx)},${Math.round(r.ty)} anchor ${Math.round(r.an)} pokey ${Math.round(r.px)},${Math.round(r.py)}${r.cl ? ' climb' : ''}${r.gr ? ' ground' : ''} ${why}`);
    }
    writeFileSync(join(out, `${stage}-${name}-${orient}.txt`), lines.join('\n') + '\n');
    const s = `${stage} ${orient} ${name}: worst move ${worst.d.toFixed(1)} css px (f${worst.fd}), worst jerk ${worst.j.toFixed(1)} (f${worst.fj})`;
    summary.push(s);
    console.log(s);
  }
  await p.close();
}
writeFileSync(join(out, `${stage}-summary.txt`), summary.join('\n') + '\n');
await b.close();
