// Screenshots of World 8's gen2 stages (gen2/worlds/w8*.ts), upright 390 x 844 and sideways 844 x 390, from a dev-hooks build:
//   NODE_ENV=development npx vite build && npx vite preview --port 4301 &   then
//   node tools/art/shot-w8.mjs <out dir> [port] [layout] [playwright module path]
// For each stage, Pokey is stood: at the start; in its first dark stretch (the fireflies over the gaps); and at its own thing: 8-1, 8-2
// and 8-5 at the room's post, 8-3 and 8-5 on the ledge of the first liana, 8-4 by the first roost's hiding place, 8-6 at the first glide's
// lip, 8-8 and 8-9 short of the first animal.
import { mkdirSync } from 'node:fs';
const pw = await import(process.argv[5] ?? 'playwright');
const chromium = pw.chromium ?? pw.default.chromium;
const out = process.argv[2] ?? 'reference/prop-sheets/qa-notes/w8';
const port = process.argv[3] ?? '4301';
const layout = Number(process.argv[4] ?? 0);
mkdirSync(out, { recursive: true });
const SIZES = { upright: [390, 844], sideways: [844, 390] };
const STAGES = ['8-1', '8-2', '8-3', '8-4', '8-5', '8-6', '8-8', '8-9'];
const b = await chromium.launch();
for (const [size, [w, h]] of Object.entries(SIZES)) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { if (!/AudioParam|AudioContext/.test(e.message)) console.log('ERR', e.message); });
  for (const id of STAGES) {
    for (const what of ['start', 'dark', 'own']) {
      await p.goto(`http://127.0.0.1:${port}/`);
      await p.waitForTimeout(2500);
      await p.evaluate(([s, l]) => window.__play(s, l), [id, layout]);
      await p.waitForTimeout(3000);
      await p.mouse.click(w / 2, h / 2);
      await p.waitForTimeout(1200);
      const where = await p.evaluate(([id, what]) => {
        const e = window.__engine();
        const st = e.currentStage;
        const plats = e.platforms ?? st.platforms;
        const topAt = (x) => {
          const under = plats.filter((q) => q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y);
          return under.length ? under[0].y : null;
        };
        let x = null;
        if (what === 'dark') {
          const z = (st.zones ?? []).filter((q) => q.kind === 'dark' && q.lights?.length).sort((a, c) => a.x0 - c.x0)[0];
          if (z) x = z.x0 + 120;
        } else if (what === 'own') {
          const room = e.kit?.rooms?.[0];
          const liana = (st.vines ?? []).filter((v) => v.vineType === 'swing_liana').sort((a, c) => a.x - c.x)[0];
          const watch = (st.proto?.watch ?? e.proto?.watch ?? [])[0];
          const glide = st.gen2?.sections?.find((s) => s.template.startsWith('w8-glide-'));
          const foe = [...e.enemies].sort((a, c) => a.x - c.x)[0];
          if ((id === '8-3' || id === '8-5') && liana && !(id === '8-5' && what === 'own' && room)) x = liana.x - 200;
          else if (room) x = room.resets[0].x + 60;
          else if (watch) x = watch.x0 + 60;
          else if (glide) x = glide.x0 + 200;
          else if (foe) x = foe.patrolMinX - 260;
        }
        if (x === null) x = e.player.x;
        const y = topAt(x) ?? e.player.y;
        Object.assign(e.player, { x, y, vx: 0, vy: 0, grounded: true, climbing: false, facing: 1 });
        return { x: Math.round(x), y: Math.round(y) };
      }, [id, what]);
      await p.waitForTimeout(2200);
      await p.screenshot({ path: `${out}/${id}-${what}-${size}.png` });
      console.log(id, what, size, JSON.stringify(where));
    }
  }
  await ctx.close();
}
await b.close();
