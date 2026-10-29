// Screenshots of Meeca's trail sections (5-M, meecaStage.ts: canopy, logs, hollow, fallen, double), upright 390 x 844 and sideways
// 844 x 390, from a dev-hooks build:
//   NODE_ENV=development npx vite build && npx vite preview --port 4301 &   then   node tools/art/shot-meeca-trails.mjs <out dir> [port] [seed] [playwright module path]
// Each shot stands her on the section's high way (its second step; in the hollow, its floor by the trunk out), the trunks before it
// marked, Flicker with her.
import { mkdirSync } from 'node:fs';
const pw = await import(process.argv[5] ?? 'playwright');
const chromium = pw.chromium ?? pw.default.chromium;
const out = process.argv[2] ?? 'shots/meeca-layout';
const port = process.argv[3] ?? '4301';
const seed = Number(process.argv[4] ?? 1);
mkdirSync(out, { recursive: true });
const SIZES = { upright: [390, 844], sideways: [844, 390] };
const KINDS = ['canopy', 'logs', 'hollow', 'fallen', 'double'];
const b = await chromium.launch();
for (const [size, [w, h]] of Object.entries(SIZES)) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { if (!/AudioParam|AudioContext/.test(e.message)) console.log('ERR', e.message); });
  await p.goto(`http://127.0.0.1:${port}/`);
  await p.waitForTimeout(2500);
  await p.evaluate((s) => window.__play('5-M', s), seed);
  await p.waitForTimeout(3000);
  // (the card: a tap)
  await p.mouse.click(w / 2, h / 2);
  await p.waitForTimeout(1200);
  for (const kind of KINDS) {
    const where = await p.evaluate((kind) => {
      const e = window.__engine();
      const mc = e.mc;
      const tr = mc.st.trails.find((t) => t.sections.some((s) => s.kind === kind));
      if (!tr) return null;
      const sec = tr.sections.find((s) => s.kind === kind);
      const inSec = (x) => x >= sec.x0 && x < sec.x1;
      const steps = tr.steps.filter((st) => (st.kind === 'plat' ? inSec(e.platforms.find((q) => q.id === st.id).x) : inSec(e.vines.find((v) => v.id === st.vine).x)));
      // the second step that is a platform off the path (a branch, a log, the hollow's floor, the snag, the bank's top)
      const off = steps.filter((st) => st.kind === 'plat').map((st) => e.platforms.find((q) => q.id === st.id)).filter((q) => q.y !== 580);
      // (the hollow: its floor, by the trunk that is the way out)
      const at = kind === 'hollow' ? off[0] : off[Math.min(1, off.length - 1)];
      const atX = kind === 'hollow' ? at.x + at.width - 110 : at.x + Math.min(40, at.width / 2);
      mc.phase = 'play';
      mc.cardOut = 1;
      mc.marked = mc.st.trunks.filter((t) => t.x < sec.x0).length;
      mc.flicker.on = true;
      mc.flicker.show = 1;
      const pl = e.player;
      Object.assign(pl, { x: atX, y: at.y, vx: 0, vy: 0, grounded: true, climbing: false, facing: 1 });
      return { x: Math.round(pl.x), y: at.y, sec };
    }, kind);
    if (!where) continue;
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `${out}/${kind}-${size}.png` });
    console.log(kind, size, JSON.stringify(where));
  }
  await ctx.close();
}
await b.close();
