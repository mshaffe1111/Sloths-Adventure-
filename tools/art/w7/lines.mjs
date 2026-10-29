// Screenshots of Pokey's World 7 lines in context (upright 390 x 844 and sideways 844 x 390): for each stage, Pokey is set down just short
// past each of its stage lines' spots (proto.hints), and the shot is taken with his thought up; then at each puzzle room's door.
//   NODE_ENV=development npx vite --port 4399 &   then   node tools/art/w7/lines.mjs <out dir> [port] [playwright module path]
import { mkdirSync } from 'node:fs';
const out = process.argv[2];
const port = process.argv[3] ?? '4399';
const pw = await import(process.argv[4] ?? 'playwright');
const { chromium } = pw.chromium ? pw : pw.default;
mkdirSync(out, { recursive: true });
const SIZES = { upright: [390, 844], sideways: [844, 390] };
const STAGES = (process.env.STAGES ?? '7-1,7-3,7-5,7-7,7-9').split(',');
const b = await chromium.launch();
for (const [size, [w, h]] of Object.entries(SIZES)) {
  for (const id of STAGES) {
    // (a fresh context each stage: a line is said once per device, tipMemory.ts)
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true });
    const p = await ctx.newPage();
    await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
    await p.waitForTimeout(2500);
    await p.evaluate((id) => window.__play(id, 1), id);
    await p.waitForTimeout(6000);
    const spots = await p.evaluate(`(${(() => {
      const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
      const st = e.currentStage;
      const ground = (x) => st.platforms.filter((q) => q.type === 'solid' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
      const outS = [];
      for (const hnt of e.proto?.hints ?? []) {
        const g = ground(hnt.x + 12);
        if (g) outS.push({ name: hnt.text.split(' ').slice(0, 3).join('-').replace(/[^a-z-]/gi, '').toLowerCase(), x: hnt.x + 12, y: g.y });
      }
      for (const r of st.kit?.rooms ?? []) {
        const g = st.platforms.find((q) => q.id === r.left.on);
        if (g) outS.push({ name: `room-${r.id}`, x: g.x + 30, y: g.y });
      }
      return outS;
    }).toString()})()`);
    for (const s of spots) {
      await p.evaluate(`(${((s) => {
        const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
        e.player.x = s.x; e.player.y = s.y - 2; e.player.vx = 0; e.player.vy = 0; e.player.invincibleTimer = 0;
      }).toString()})(${JSON.stringify(s)})`);
      // (his thought comes up a moment after the spot: wait for the bubble in the page, at most 4 s)
      await p.waitForFunction(() => document.querySelector('.dg-root')?.getAttribute('aria-hidden') === 'false', null, { timeout: 4000 }).catch(() => {});
      await p.waitForTimeout(600);
      await p.screenshot({ path: `${out}/${id}-${s.name}-${size}.png` });
    }
    await ctx.close();
  }
}
await b.close();
