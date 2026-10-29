// Screenshots of Meeca's puzzle rooms 2-5 (5-M, meecaStage.ts), upright 390 x 844 and sideways 844 x 390, from a dev-hooks build:
//   NODE_ENV=development npx vite build && npx vite preview --port 4301 &   then
//   node tools/art/shot-meeca-rooms.mjs <out dir> [port] [seed] [playwright module path]
// Each shot stands her in the room at the moment that matters (the trunks before it marked, Flicker with her): room 2 holding the cake
// by the far plate, then on the near plate as the gate opens; room 3 under the knot with a pinecone; room 4 on the lift's plank by the
// teapot; room 5 on the first dark step. Then the carving ring at room 2's trunk, and the practice pinecone at room 2's door.
import { mkdirSync } from 'node:fs';
const pw = await import(process.argv[5] ?? 'playwright');
const chromium = pw.chromium ?? pw.default.chromium;
const out = process.argv[2] ?? 'shots/meeca-rooms';
const port = process.argv[3] ?? '4301';
const seed = Number(process.argv[4] ?? 1);
mkdirSync(out, { recursive: true });
const SIZES = { upright: [390, 844], sideways: [844, 390] };
const SHOTS = ['eat-door', 'eat-hold', 'eat-open', 'eat-carve', 'silk', 'tea', 'look'];
const b = await chromium.launch();
for (const [size, [w, h]] of Object.entries(SIZES)) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => { if (!/AudioParam|AudioContext/.test(e.message)) console.log('ERR', e.message); });
  for (const shot of SHOTS) {
    await p.goto(`http://127.0.0.1:${port}/`);
    await p.waitForTimeout(2500);
    await p.evaluate((s) => window.__play('5-M', s), seed);
    await p.waitForTimeout(3000);
    await p.mouse.click(w / 2, h / 2);
    await p.waitForTimeout(1200);
    const where = await p.evaluate((shot) => {
      const e = window.__engine();
      const mc = e.mc;
      const kit = e.kit;
      const id = shot.split('-')[0];
      const order = ['sit', 'eat', 'silk', 'tea', 'look'];
      mc.phase = 'play';
      mc.cardOut = 1;
      mc.marked = 1 + order.indexOf(id);
      mc.flicker.on = true;
      mc.flicker.show = 1;
      const ri = kit.rooms.findIndex((r) => r.spec.id === id);
      const room = kit.rooms[ri];
      const pl = e.player;
      const put = (x, y) => Object.assign(pl, { x, y, vx: 0, vy: 0, grounded: true, climbing: false, facing: 1 });
      const host = e.kitHost();
      if (shot === 'eat-door') put(room.resets[0].x + 40, room.resets[0].y);
      if (shot === 'eat-hold' || shot === 'eat-open') {
        const ii = room.items.findIndex((it) => it.spec.id === 'cake2');
        if (shot === 'eat-hold') {
          put(room.plates[1].x - 60, room.plates[1].y);
          kit.pickUp(room, ri, ii, host);
        } else {
          const it = room.items[ii];
          Object.assign(it, { mode: 'rest', x: room.plates[1].x, y: room.plates[1].y, plat: room.plates[1].plat });
          room.beetles[1].st.x = room.plates[1].x;
          room.beetles[1].st.mode = 'sleep';
          put(room.plates[0].x, room.plates[0].y);
        }
      }
      if (shot === 'eat-carve') {
        mc.marked = 2;
        const tr = mc.st.trunks[2];
        put(tr.x - 20, tr.standY);
        for (const g of room.gates) { g.open = true; g.latched = true; g.door.broken = true; }
      }
      if (shot === 'silk') {
        const ii = room.items.findIndex((it) => it.spec.id === 'cone3');
        put(room.knots[0].x - 90, 580);
        kit.pickUp(room, ri, ii, host);
      }
      if (shot === 'tea') put(room.lifts[0].plat.x + 20, room.lifts[0].plat.y);
      if (shot === 'look') put(room.resets[0].x + 110, room.resets[0].y);
      return { x: Math.round(pl.x), y: Math.round(pl.y) };
    }, shot);
    await p.waitForTimeout(shot === 'eat-open' ? 900 : 2200);
    await p.screenshot({ path: `${out}/${shot}-${size}.png` });
    console.log(shot, size, JSON.stringify(where));
  }
  await ctx.close();
}
await b.close();
