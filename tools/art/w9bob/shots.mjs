// Stills of World 9's moving logs (gen2/worlds/w9Bob.ts: the rafts of 9-1, the logs of 9-5 and 9-9, the pistons of 9-8), upright 390 x 844
// and sideways 844 x 390, from a dev-hooks build that ships a roll for the stage (curation, or a probe seed list while the pieces are built):
//   NODE_ENV=development npx vite build && npx vite preview --port 4301 &   then
//   STAGE=9-1 node tools/art/w9bob/shots.mjs <out dir> [port]      (LOOK=flare or LOOK=lavafall: World 9's heat hazards, w9Heat.ts)
// Pokey is stood on the bank before the first moving log; each spot is shot three times, ~1.7 s apart, so the log is seen high and low (a hazard quiet, warning and firing).
import { mkdirSync } from 'node:fs';
const pw = await import(process.env.PW ?? 'playwright');
const chromium = pw.chromium ?? pw.default.chromium;
const out = process.argv[2] ?? 'reference/prop-sheets/qa-notes/w9/bob';
const port = process.argv[3] ?? '4301';
const id = process.env.STAGE ?? '9-1';
const nth = Number(process.env.NTH ?? 0);
mkdirSync(out, { recursive: true });
const SIZES = { upright: [390, 844], sideways: [844, 390] };
const b = await chromium.launch();
for (const [size, [w, h]] of Object.entries(SIZES)) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { if (!/AudioParam|AudioContext/.test(e.message)) console.log('ERR', e.message); });
  await p.goto(`http://127.0.0.1:${port}/`);
  await p.waitForTimeout(2500);
  await p.evaluate((l) => { window.__shotLook = l; }, process.env.LOOK ?? '');
  await p.evaluate((s) => window.__play(s, 0), id);
  await p.waitForTimeout(3500);
  await p.mouse.click(w / 2, h / 2);
  await p.waitForTimeout(1200);
  const where = await p.evaluate((nth) => {
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
    const plats = e.platforms ?? e.currentStage.platforms;
    // (LOOK=flare|lavafall: the zone of that look instead, Pokey stood 170 px before it)
    const look = window.__shotLook;
    if (look) {
      const z = (e.currentStage.zones ?? []).filter((q) => q.look === look).sort((a, c) => a.x0 - c.x0)[nth];
      if (!z) return null;
      const x = z.x0 - 170;
      const under = plats.filter((q) => x >= q.x && x <= q.x + q.width && q.y > z.baseY - 80).sort((a, c) => a.y - c.y)[0];
      Object.assign(e.player, { x, y: under ? under.y : z.baseY, vx: 0, vy: 0, grounded: true, climbing: false, facing: 1 });
      return { x: Math.round(x), y: Math.round(z.baseY), kind: look };
    }
    const bobs = plats.filter((q) => q.lift?.bob).sort((a, c) => a.x - c.x);
    const first = bobs[nth];
    if (!first) return null;
    const bank = plats.filter((q) => !q.lift && q.x + q.width <= first.x + 2 && q.x + q.width > first.x - 160 && Math.abs(q.y - first.lift.top - (first.lift.bob === 'piston' ? first.lift.bottom - first.lift.top : 0)) < 60).sort((a, c) => c.x - a.x)[0];
    const x = bank ? bank.x + bank.width - 50 : first.x - 60;
    const y = bank ? bank.y : first.lift.top;
    Object.assign(e.player, { x, y, vx: 0, vy: 0, grounded: true, climbing: false, facing: 1 });
    return { x: Math.round(x), y: Math.round(y), kind: first.lift.bob, n: bobs.length };
  }, nth);
  for (let k = 0; k < Number(process.env.SHOTS ?? 3); k++) {
    await p.waitForTimeout(k ? Number(process.env.GAP ?? 1700) : 4500);
    await p.screenshot({ path: `${out}/${id}-${where?.kind ?? 'none'}${nth ? nth : ''}-${size}-${k}.png` });
  }
  console.log(id, size, JSON.stringify(where));
  await ctx.close();
}
await b.close();
