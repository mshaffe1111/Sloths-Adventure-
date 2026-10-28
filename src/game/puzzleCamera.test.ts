/**
 * The puzzle rooms' camera on a phone (puzzleCamera.ts, puzzlePlay.ts camFocus, engine.ts updateCamera), 2026-10-28: upright, a whole
 * room never fitted (on a stage 900 px tall the view would not pull back past the level's height, ~420 px of world across), and in World
 * 2's cage rooms the lean toward the stone pile cut the hanging cage off. Now, in every puzzle room of Worlds 1 and 2 and the kit's test
 * rooms, the real engine's real camera (realPlay.ts with updateCamera put back) shows the piece he is working or carrying together with
 * what it works: the stone and its basket, the basket and its cage or lift, the seesaw's whole plank and its raised end, the lever, bell
 * or plate and its gate, the lure's plate and the beetle; upright on a 390 x 844 and a 360 x 740 phone, and sideways.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { GameEngine } from './engine.ts';
import { boxFits, fitZoom, ROOM_CAM, roomCentre, roomFloor, type CamBox } from './puzzleCamera.ts';
import { KIT } from './puzzleKit.ts';

const STAGES = ['1-4', '1-6', '1-7', '2-2', '2-3', '2-8', '2-9', 'kit'];
const PHONES: Array<[number, number]> = [[390, 844], [360, 740], [844, 390]];

type Room = {
  spec: { id: string; pieces: Array<{ kind: string; id: string; for?: string; by?: string; open?: unknown }> };
  box: CamBox;
  items: Array<{ spec: { id: string; for?: string; source?: string }; mode: string; x: number; y: number; home: { x: number; y: number }; r: number }>;
  sources: Array<{ spec: { id: string }; x: number; y: number }>;
  baskets: Array<{ spec: { id: string }; x: number; y: number }>;
  lifts: Array<{ spec: { id: string; by: string }; plat: { x: number; y: number; width: number } }>;
  plates: Array<{ spec: { id: string }; x: number; y: number }>;
  levers: Array<{ spec: { id: string }; x: number; y: number }>;
  bells: Array<{ spec: { id: string }; x: number; y: number }>;
  gates: Array<{ spec: { id: string; open: unknown }; x: number; y: number }>;
  seesaws: Array<{ spec: { id: string }; x: number; y: number; w: number; rise: number }>;
  beetles: Array<{ spec: { id: string }; st: { x: number }; span: { x0: number; x1: number } }>;
};

const wireReads = (w: unknown, id: string): boolean =>
  typeof w === 'string' ? w === id : !!w && typeof w === 'object' && Object.values(w as object).some((v) => (Array.isArray(v) ? v.some((x) => wireReads(x, id)) : wireReads(v, id)));

/** what must be in the view, as world boxes, by piece (made here from the room's pieces, not from the camera's own boxes) */
function boxOf(room: Room, id: string): CamBox | null {
  const pt = (x: number, y: number, hw: number, h: number): CamBox => ({ x0: x - hw, x1: x + hw, y0: y - h, y1: y });
  const it = room.items.find((q) => q.spec.id === id);
  if (it) return it.mode === 'wait' ? pt(it.home.x, it.home.y, 16, 30) : pt(it.x, it.y, it.r, it.r * 2);
  const b = room.baskets.find((q) => q.spec.id === id);
  if (b) return pt(b.x, b.y, 30, 50);
  const lf = room.lifts.find((q) => q.spec.id === id);
  if (lf) return { x0: lf.plat.x, x1: lf.plat.x + lf.plat.width, y0: lf.plat.y - 70, y1: lf.plat.y };
  const g = room.gates.find((q) => q.spec.id === id);
  if (g) return pt(g.x, g.y, KIT.gateW / 2, KIT.doorH);
  const pl = room.plates.find((q) => q.spec.id === id) ?? room.levers.find((q) => q.spec.id === id);
  if (pl) return pt(pl.x, pl.y, 24, 40);
  const bl = room.bells.find((q) => q.spec.id === id);
  if (bl) return pt(bl.x, bl.y - 20, 24, 90);
  const bt = room.beetles.find((q) => q.spec.id === id);
  if (bt) return pt(bt.st.x, room.box.y1 - 60, 24, 30);
  return null;
}

/** each moment to check: where he stands, what he holds, and the pieces that must show together */
function moments(room: Room): Array<{ name: string; x: number; y: number; hold?: number; show: string[] }> {
  const out: Array<{ name: string; x: number; y: number; hold?: number; show: string[] }> = [];
  room.items.forEach((it, k) => {
    const src = room.sources.find((s) => s.spec.id === it.spec.source);
    const target = it.spec.for;
    if (!target) return;
    const tBox = boxOf(room, target);
    if (!tBox) return;
    // at the source (or where the thing lies): the thing and what it is for
    const at = src ?? { x: it.home.x, y: it.home.y };
    if (src) out.push({ name: `${it.spec.id} at its ${src.spec.id}`, x: at.x - 30, y: at.y, show: [it.spec.id, target] });
    // carrying it up to what it is for: that, and what that works (a basket's cage or lift; a plate's gate; the lure's beetle)
    const works = [
      ...room.lifts.filter((l) => l.spec.by === target).map((l) => l.spec.id),
      ...room.gates.filter((g) => wireReads(g.spec.open, target)).map((g) => g.spec.id),
      ...room.beetles.filter((bt) => { const p = room.plates.find((q) => q.spec.id === target); return !!p && p.x >= bt.span.x0 && p.x <= bt.span.x1; }).map((bt) => bt.spec.id),
    ];
    const tx = (tBox.x0 + tBox.x1) / 2;
    out.push({ name: `carrying ${it.spec.id} to ${target}`, x: tx - 90, y: tBox.y1 > room.box.y1 ? at.y : Math.min(at.y, tBox.y1), hold: k, show: [target, ...works] });
  });
  // a lever, bell or plate by its gate
  for (const pc of [...room.levers, ...room.bells, ...room.plates]) {
    const gates = room.gates.filter((g) => wireReads(g.spec.open, pc.spec.id)).map((g) => g.spec.id);
    if (gates.length && !room.items.some((it) => it.spec.for === pc.spec.id)) out.push({ name: `at ${pc.spec.id}`, x: pc.x - 50, y: pc.y, show: [pc.spec.id, ...gates] });
  }
  // coming up to a seesaw: its whole plank and the end it raises
  for (const s of room.seesaws) out.push({ name: `by ${s.spec.id}`, x: room.box.x0 + 50, y: room.box.y1 - 70, show: [`seesaw:${s.spec.id}`] });
  return out;
}

function engineFor(id: string, w: number, h: number) {
  const r = new RealPlay(id, 1);
  const e = r.e;
  e.updateCamera = (GameEngine.prototype as unknown as Record<string, () => void>).updateCamera.bind(e);
  e.viewCssW = w;
  e.viewCssH = h;
  e.introT = 99;
  e.applyZoom();
  return { r, e };
}

test('every puzzle room in Worlds 1 and 2 and the kit test room: what he works and what it works are in view together, upright and sideways', () => {
  let smallest = Infinity;
  let checked = 0;
  for (const [w, h] of PHONES) {
    for (const id of STAGES) {
      const { r, e } = engineFor(id, w, h);
      const kit = e.kit;
      assert.ok(kit?.rooms.length, `${id} has puzzle rooms`);
      (kit.rooms as Room[]).forEach((room, ri) => {
        for (const m of moments(room)) {
          r.stand(m.x, m.y);
          if (m.hold !== undefined) {
            room.items[m.hold].mode = 'held';
            kit.held = { room: ri, item: m.hold };
          }
          for (let i = 0; i < 120; i++) r.frame();
          // (2-8's island rooms overlap by a step: a spot in two rooms belongs to the first, and is checked there)
          const first = (kit.rooms as Room[]).findIndex((q) => m.x >= q.box.x0 && m.x <= q.box.x1 && m.y >= q.box.y0 && m.y <= q.box.y1);
          if (first !== ri) {
            if (m.hold !== undefined) {
              kit.held = null;
              room.items[m.hold].mode = 'wait';
            }
            continue;
          }
          assert.equal(kit.inRoom, ri, `${id} ${room.spec.id}: ${m.name}: he is in the room`);
          const v = { x0: e.camera.x, x1: e.camera.x + e.camera.viewportWidth, y0: e.camera.y, y1: e.camera.y + e.camera.viewportHeight };
          for (const s of m.show) {
            const ss = s.startsWith('seesaw:') ? room.seesaws.find((q) => q.spec.id === s.slice(7)) : null;
            const b = ss ? { x0: ss.x - ss.w / 2, x1: ss.x + ss.w / 2, y0: ss.y - ss.rise, y1: ss.y } : boxOf(room, s);
            assert.ok(b, `${id} ${room.spec.id}: ${s}`);
            const where = `${w}x${h} ${id} ${room.spec.id}, ${m.name}: ${s} [${Math.round(b.x0)}..${Math.round(b.x1)}, ${Math.round(b.y0)}..${Math.round(b.y1)}] in view [${Math.round(v.x0)}..${Math.round(v.x1)}, ${Math.round(v.y0)}..${Math.round(v.y1)}]`;
            assert.ok(b.x0 >= v.x0 - 1 && b.x1 <= v.x1 + 1 && b.y0 >= v.y0 - 1 && b.y1 <= v.y1 + 1, where);
          }
          // he is in it too, and never drawn smaller than in a room on the same phone held sideways
          assert.ok(r.p.x - 30 >= v.x0 && r.p.x + 30 <= v.x1 && r.p.y - 100 >= v.y0 && r.p.y <= v.y1, `${w}x${h} ${id} ${room.spec.id}, ${m.name}: Pokey in view`);
          assert.ok(e.zoom >= (Math.min(w, h) / ROOM_CAM.sideH) * ROOM_CAM.minZoom - 1e-6, `${w}x${h} ${id}: zoom ${e.zoom}`);
          smallest = Math.min(smallest, e.zoom);
          checked++;
          if (m.hold !== undefined) {
            kit.held = null;
            room.items[m.hold].mode = 'wait';
          }
        }
      });
    }
  }
  console.log(`camera: ${checked} moments checked, smallest scale ${smallest.toFixed(3)}`);
  assert.ok(checked > 80, `${checked} moments checked`);
  assert.ok(smallest >= 0.5 - 1e-6, `the smallest scale: ${smallest.toFixed(3)} css px a world px`);
});

test('sideways the room camera is as it was: three quarters at the most; upright it may pull back to the sideways size on that phone', () => {
  // 844 x 390 sideways: the usual zoom is 390 / 540
  assert.equal(roomFloor(844, 390, 390 / 540), ROOM_CAM.minZoom);
  // a stage with a wider view sideways (4-7) still pulls back no further than before
  assert.equal(roomFloor(844, 390, 390 / 700), ROOM_CAM.minZoom);
  // 390 x 844 upright on a 900 px stage: the usual zoom is 844 / 900; the room may go to 0.54 css px a world px
  const f = roomFloor(390, 844, 844 / 900);
  assert.ok(Math.abs(f * (844 / 900) - (390 / 540) * 0.75) < 1e-9);
  assert.ok(f < ROOM_CAM.minZoom);
  // the fit: a box that fits needs no zoom; a wide one pulls back, but not past the floor
  assert.equal(fitZoom(416, 900, { x0: 0, x1: 300, y0: 0, y1: 200 }, f), 1);
  assert.ok(Math.abs(fitZoom(416, 900, { x0: 0, x1: 528, y0: 0, y1: 200 }, f) - 416 / 600) < 1e-9);
  assert.equal(fitZoom(416, 900, { x0: 0, x1: 2000, y0: 0, y1: 200 }, f), f);
  assert.ok(boxFits({ x0: 0, x1: 600 - 2 * ROOM_CAM.keyMargin, y0: 0, y1: 10 }, 600, 900));
  assert.ok(!boxFits({ x0: 0, x1: 601 - 2 * ROOM_CAM.keyMargin, y0: 0, y1: 10 }, 600, 900));
});

test('the room camera centre moves smoothly: no jump as the key box grows past the view', () => {
  const lean = { x: 100, y: 0 };
  let last = roomCentre(lean, { x0: 0, x1: 300, y0: -50, y1: 50 }, 400, 900).x;
  for (let x1 = 300; x1 < 900; x1 += 1) {
    const c = roomCentre(lean, { x0: 0, x1, y0: -50, y1: 50 }, 400, 900).x;
    assert.ok(Math.abs(c - last) <= 1.01, `at ${x1}: ${last} to ${c}`);
    last = c;
  }
  // a box that fits: the lean point, moved only as far as keeps the box (and its margin) in
  assert.equal(roomCentre(lean, { x0: 0, x1: 200, y0: -50, y1: 50 }, 400, 900).x, 100);
  assert.equal(roomCentre(lean, { x0: 0, x1: 320, y0: -50, y1: 50 }, 400, 900).x, 320 + ROOM_CAM.keyMargin - 200);
});

test('leaving a room the view eases back out, with no jump in the zoom or the camera', () => {
  for (const [w, h] of [[390, 844], [360, 740]] as Array<[number, number]>) {
    const { r, e } = engineFor('2-3', w, h);
    const room = e.kit.rooms[0] as Room;
    const src = room.sources[0];
    r.stand(src.x - 30, src.y);
    for (let i = 0; i < 90; i++) r.frame();
    const inZoom = e.zoom;
    // walk out to the left, past the room's edge, and on
    let z = e.zoom;
    let cx = e.camera.x;
    let cy = e.camera.y;
    for (let i = 0; i < 150; i++) {
      if (r.p.x > room.box.x0 - 200) r.frame({ left: true });
      else r.frame();
      assert.ok(Math.abs(e.zoom - z) < 0.03, `${w}x${h}: zoom ${z} to ${e.zoom}`);
      assert.ok(Math.abs(e.camera.x - cx) < 24 && Math.abs(e.camera.y - cy) < 24, `${w}x${h}: camera (${cx}, ${cy}) to (${e.camera.x}, ${e.camera.y})`);
      z = e.zoom;
      cx = e.camera.x;
      cy = e.camera.y;
    }
    assert.ok(e.kit.inRoom < 0 || r.p.x < room.box.x0, 'out of the room');
    assert.ok(e.zoom > inZoom || inZoom === e.roomUsual, 'the view came back in');
  }
});
