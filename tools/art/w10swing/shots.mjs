// Stills of World 10's swings and puzzle rooms (gen2/worlds/w10Swing.ts, w10Rooms.ts), upright 390 x 844 and sideways 844 x 390, from
// a dev-hooks build with the World 10 stages hooked up (the main builder's w10Game.ts, or a local stand-in):
//   NODE_ENV=development npx vite build --outDir /tmp/w10dev && npx vite preview --outDir /tmp/w10dev --port 4301 &   then
//   node tools/art/w10swing/shots.mjs <out dir> [port] [layout]
// Swings (10-6): for each look (chain, banner, cage, rope) Pokey on the ledge before one, then a jump for it, then a moment later.
// Rooms: Pokey at the door of each (10-1 the hoist, 10-3 the beam, 10-7 the gatehouse), and each with its way on open.
import { mkdirSync } from 'node:fs';
let pw;
try { pw = await import('playwright'); } catch { pw = await import('/opt/node22/lib/node_modules/playwright/index.mjs'); }
const chromium = pw.chromium ?? pw.default.chromium;
const out = process.argv[2] ?? 'shots/w10';
const port = process.argv[3] ?? '4301';
const layout = Number(process.argv[4] ?? 0);
mkdirSync(out, { recursive: true });
const SIZES = { upright: [390, 844], sideways: [844, 390] };
const b = await chromium.launch();

async function start(p, w, h, id) {
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(2500);
  await p.evaluate(([id, l]) => window.__play(id, l), [id, layout]);
  await p.waitForTimeout(3500);
  await p.mouse.click(w / 2, h / 2);
  await p.waitForTimeout(800);
}
const put = (p, x, y, face = 1) => p.evaluate(([x, y, face]) => {
  const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
  Object.assign(e.player, { x, y, vx: 0, vy: 0, grounded: true, climbing: false, facing: face });
  if (e.camera) { e.camera.x = x - e.camera.viewportWidth * 0.4; e.camera.y = y - e.camera.viewportHeight * 0.6; }
}, [x, y, face]);

for (const [size, [w, h]] of Object.entries(SIZES)) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { if (!/AudioParam|AudioContext/.test(e.message)) console.log('ERR', e.message); });
  // ── the swings ──
  for (const look of ['chain', 'banner', 'cage', 'rope']) {
    await start(p, w, h, '10-6');
    const spot = await p.evaluate((look) => {
      const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
      const v = e.vines.find((v) => v.vineType === 'swing_liana' && v.hangLook === look);
      if (!v) return null;
      const ledge = e.platforms.filter((q) => q.x + q.width <= v.x + 4 && q.x + q.width > v.x - 260 && q.y > v.topY && q.y < v.bottomY + 120)
        .sort((a, c) => c.x + c.width - (a.x + a.width))[0];
      return ledge ? { x: ledge.x + ledge.width - 30, y: ledge.y } : null;
    }, look);
    if (!spot) { console.log('no', look); continue; }
    await put(p, spot.x, spot.y);
    await p.waitForTimeout(700);
    await p.screenshot({ path: `${out}/swing-${look}-ledge-${size}.png` });
    await p.keyboard.down('ArrowRight');
    await p.keyboard.down('Space');
    await p.waitForTimeout(260);
    await p.keyboard.up('Space');
    await p.waitForTimeout(500);
    await p.keyboard.up('ArrowRight');
    await p.screenshot({ path: `${out}/swing-${look}-on-${size}.png` });
    await p.waitForTimeout(900);
    await p.screenshot({ path: `${out}/swing-${look}-on2-${size}.png` });
  }
  // ── the rooms ──
  for (const [id, room] of [['10-1', 'hoist'], ['10-3', 'beam'], ['10-7', 'gate']]) {
    for (const state of ['door', 'open']) {
      await start(p, w, h, id);
      const spot = await p.evaluate(([room, state]) => {
        const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
        const r = e.kit?.rooms.find((x) => x.spec.id.endsWith(room));
        if (!r) return null;
        if (state === 'open') {
          for (const g of r.gates) { g.open = true; g.latched = true; g.door.broken = true; g.show = 1; }
          for (const l of r.levers) { l.on = true; l.show = 1; }
          for (const b of r.baskets) { b.weight = 9; b.count = 1; }
          for (const p of r.plates) { p.down = true; p.show = 1; }
        }
        const post = r.resets[0];
        if (state === 'open' && room === 'hoist') { const l = r.lifts[0]; return { x: l.plat.x + 40, y: l.plat.y }; }
        return { x: post.x + (state === 'open' ? 160 : 70), y: post.y };
      }, [room, state]);
      if (!spot) { console.log('no room', id); continue; }
      await put(p, spot.x, spot.y);
      await p.waitForTimeout(state === 'open' ? 3500 : 1200);
      await p.screenshot({ path: `${out}/room-${room}-${state}-${size}.png` });
    }
  }
  await ctx.close();
}
await b.close();
