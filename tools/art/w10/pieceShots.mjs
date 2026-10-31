// One grab-bag piece at a time, in the real game (STAGE-RULES §1c step 3, §5b): upright 390 x 844 and sideways 844 x 390.
//   NODE_ENV=development npx vite --port 4399 &   (a dev server; World 10's stages need a roll in seeds.ts to play)
//   node tools/art/w10/pieceShots.mjs <out dir> '<stage>:<section>[,...]' [port]
// Per piece: window.__w10force puts it (and its theme's gate) in the stage's roll (w10Game.ts devForced); Pokey is set at the section's
// start and at its middle, and a third still is taken a second and a half later (a moving piece's other state).
import { mkdirSync } from 'node:fs';
const [out, list, port = '4399'] = process.argv.slice(2);
const pw = await import(process.env.PW ?? 'playwright');
const { chromium } = pw.chromium ? pw : pw.default;
mkdirSync(out, { recursive: true });
const SIZES = { upright: [390, 844], sideways: [844, 390] };
const pieces = list.split(',').map((s) => s.split(':'));
const b = await chromium.launch();
for (const [size, [w, h]] of Object.entries(SIZES)) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { if (!/AudioParam|AudioContext/.test(e.message)) console.log('ERR', e.message); });
  for (const [stage, sec] of pieces) {
    await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
    await p.waitForFunction(() => typeof window.__play === "function" && typeof window.__engine === "function", null, { timeout: 30000 });
    await p.waitForTimeout(800);
    await p.evaluate(([stage, sec]) => { window.__w10force = sec; window.__play(stage, 0); }, [stage, sec]);
    await p.waitForTimeout(6000);
    const spots = await p.evaluate((sec) => {
      const e = window.__engine();
      const st = e.currentStage;
      const s = (st.gen2?.sections ?? []).find((x) => x.template === sec);
      if (!s) return [];
      const top = (x) => st.platforms.filter((q) => q.type !== 'drift' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0]?.y ?? 0;
      const xs = [s.x0 + 40, (s.x0 + s.x1) / 2];
      return xs.map((x) => [x, top(x)]);
    }, sec);
    if (!spots.length) console.log('not laid', stage, sec);
    let i = 0;
    for (const [x, y] of spots) {
      await p.evaluate(([x, y]) => {
        const e = window.__engine();
        Object.assign(e.player, { x, y: y - 2, vx: 0, vy: 0, invincibleTimer: 0 });
      }, [x, y]);
      await p.waitForTimeout(1600);
      await p.screenshot({ path: `${out}/${sec}-${++i}-${size}.png` });
      if (i === 2) { await p.waitForTimeout(1500); await p.screenshot({ path: `${out}/${sec}-${i}b-${size}.png` }); }
    }
  }
  await ctx.close();
}
await b.close();
