// Screenshots of World 9's gen2 stages (upright 390 x 844 and sideways 844 x 390), for the lead's review:
//   NODE_ENV=development npx vite --port 4399 &   then   node tools/art/w9/shots.mjs <out dir> [port]
// Per stage (STAGES, layout LAYOUT): the start, then the spots worth a look found in the stage the engine is playing: a geyser caught
// mid-burst (and in its warning), a lava chasm, the cracked basalt, a hiding place on the doorstep, a vent in a chasm.
import { mkdirSync } from 'node:fs';
const out = process.argv[2];
const port = process.argv[3] ?? '4399';
const pw = await import(process.env.PW ?? 'playwright');
const { chromium } = pw.chromium ? pw : pw.default;
mkdirSync(out, { recursive: true });
const SIZES = { upright: [390, 844], sideways: [844, 390] };
const STAGES = (process.env.STAGES ?? '9-1,9-4,9-5').split(',');
const LAYOUT = Number(process.env.LAYOUT ?? 1);
const b = await chromium.launch();
const eng = () => (typeof window.__engine === 'function' ? window.__engine() : window.__engine);
for (const [size, [w, h]] of Object.entries(SIZES)) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { if (!/AudioParam|AudioContext/.test(e.message)) console.log('ERR', e.message); });
  for (const id of STAGES) {
    await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
    await p.waitForTimeout(2500);
    await p.evaluate(([id, l]) => window.__play(id, l), [id, LAYOUT]);
    await p.waitForTimeout(6500);
    await p.screenshot({ path: `${out}/${id}-start-${size}.png` });
    const spots = await p.evaluate(`(() => {
      const e = (${eng.toString()})();
      const st = e.currentStage;
      const out = [];
      const ground = (st.zones ?? []).filter((z) => z.kind === 'geyser' && z.baseY - z.top > 150).sort((a, c) => a.x0 - c.x0);
      const vents = (st.zones ?? []).filter((z) => z.kind === 'geyser' && z.baseY - z.top <= 150).sort((a, c) => a.x0 - c.x0);
      if (ground.length) out.push(['geyser', ground[Math.min(1, ground.length - 1)].x0 - 150, ground[Math.min(1, ground.length - 1)].baseY, ground[Math.min(1, ground.length - 1)].x0]);
      const plats = st.platforms.filter((q) => q.type === 'solid').sort((a, c) => a.x - c.x);
      // (a lava chasm: two ground pieces with open air under the gap, past the first 1500 px)
      for (let i = 1; i < plats.length; i++) {
        const a = plats[i - 1], c = plats[i];
        const gap = c.x - (a.x + a.width);
        if (a.x > 1500 && gap > 90 && gap < 260 && !plats.some((q) => q.x < c.x && q.x + q.width > a.x + a.width && q.y > a.y)) { out.push(['chasm', a.x + a.width - 160, a.y]); break; }
      }
      const tiles = st.platforms.filter((q) => q.type === 'fragile').sort((a, c) => a.x - c.x);
      if (tiles.length) out.push(['basalt', tiles[0].x - 160, tiles[0].y]);
      const hide = (e.proto?.bushes ?? []).find((b) => b.look);
      if (hide) out.push(['hide', hide.x - 120, hide.y]);
      if (vents.length) out.push(['vent', vents[0].x0 - 200, vents[0].baseY - 110]);
      return out;
    })()`);
    for (const [name, x, y, zx] of spots) {
      // (stood on the top of the ground under that spot, never dropped into a chasm)
      await p.evaluate(`(() => { const e = (${eng.toString()})(); const x = ${x};
        const under = e.currentStage.platforms.filter((q) => q.type === 'solid' && x >= q.x + 10 && x <= q.x + q.width - 30).sort((a, c) => a.y - c.y)[0];
        e.player.x = x; e.player.y = (under ? under.y : ${y}) - e.player.height - 1; e.player.vx = 0; e.player.vy = 0; e.player.invincibleTimer = 99; })()`);
      if (name === 'geyser') {
        // (wait for it to burst: the zone's own clock)
        for (let k = 0; k < 40; k++) {
          const ph = await p.evaluate(`(() => { const e = (${eng.toString()})(); const z = e.currentStage.zones.find((q) => q.x0 === ${zx}); const s = (((e.gameTime + z.offset) % z.period) + z.period) % z.period; return s; })()`);
          const z = await p.evaluate(`(() => { const e = (${eng.toString()})(); const z = e.currentStage.zones.find((q) => q.x0 === ${zx}); return [z.period, z.warn, z.active]; })()`);
          const idle = z[0] - z[1] - z[2];
          if (ph > idle + z[1] * 0.6 && ph < idle + z[1] + 0.2) { await p.screenshot({ path: `${out}/${id}-geyser-warn-${size}.png` }); }
          if (ph > idle + z[1] + 0.3 && ph < z[0] - 0.2) break;
          await p.waitForTimeout(120);
        }
        await p.screenshot({ path: `${out}/${id}-geyser-burst-${size}.png` });
        continue;
      }
      await p.waitForTimeout(1500);
      await p.screenshot({ path: `${out}/${id}-${name}-${size}.png` });
    }
  }
  await ctx.close();
}
await b.close();
