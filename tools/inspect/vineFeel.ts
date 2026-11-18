/**
 * vineFeel — the climbing vine's moves, frame by frame on the real engine at 30 fps (RealPlay, engine.ts's own update; D37), for
 * FEEL-VINE (R-165.214, Matt 11-13: "the climbing vines and going from vine to vine felt a little off... not very smooth").
 *
 * Three moves, found on any stage from its own vines (no stage id, seed or x here): GRAB (standing at a trunk's foot beside it, up),
 * VAULT (climbing to a trunk's top with up held, either facing) and STEP (two field vines: a push toward the next one, twice, and the
 * leap across). Each frame records where he is and what he is doing; `judge` names what reads as not smooth, with numbers:
 *   snap   - he moved further in one frame than his own speed carries him (px beyond v*dt)
 *   vjump  - his speed changed more in one frame than a push or gravity does (px/s)
 *   stall  - a thumb held toward where he is going and no motion for 2+ frames, before he gets there
 *   pop    - the drawn state changed (climb / air / ground) with no frame between
 *   cam    - the camera moved more than 24 px in one frame
 *
 *   npx tsx tools/inspect/vineFeel.ts [stage] [seed]     (both settings)
 */
import '../../src/game/headlessDom.ts';
import { RealPlay, DT, type Pad } from '../../src/game/realPlay.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
import type { Vine } from '../../src/game/types.ts';
import { drawnOff } from '../../src/game/vineFeel.ts';

export interface Frame { f: number; x: number; y: number; /** where he is DRAWN (the body and the vine settle, vineFeel.ts) */ sx: number; sy: number; vx: number; vy: number; st: string; facing: number; pair: number; camX: number; camY: number; pad: string }
export interface Flag { f: number; kind: 'snap' | 'vjump' | 'stall' | 'pop' | 'cam'; n: number; note: string }

const state = (r: RealPlay) => { const p = r.p; return p.climbing ? 'c' : p.isVineSwinging ? 's' : p.hanging ? 'h' : p.grounded ? 'g' : 'a'; };
const padStr = (k: Pad) => (k.left ? 'L' : '') + (k.right ? 'R' : '') + (k.up ? 'U' : '') + (k.down ? 'D' : '') + (k.press ? 'J' : k.jump ? 'j' : '');

/** run `pads` (one per frame) from the current placement, with the camera running as on the page */
export function trace(r: RealPlay, pads: Pad[]): Frame[] {
  const e = r.e;
  const cam = Object.getPrototypeOf(e).updateCamera as (dt: number) => void;
  const out: Frame[] = [];
  const off = () => (e.vineSettle ? drawnOff(e.vineSettle, r.p.x, r.p.y, r.p.climbing) : { x: 0, y: 0 });
  const snap = (f: number, k: Pad) => out.push({ f, x: r.p.x, y: r.p.y, sx: r.p.x + off().x, sy: r.p.y + off().y, vx: r.p.vx, vy: r.p.vy, st: state(r), facing: r.p.facing, pair: r.p.climbPair ?? 0, camX: e.camera.x, camY: e.camera.y, pad: padStr(k) });
  // (a placement cuts the view to him, as at a flag: the camera settles first, and the hands of the last move are let go)
  for (let i = 0; i < 90; i++) cam.call(e, DT);
  snap(0, {});
  pads.forEach((k, i) => {
    r.frame(k);
    cam.call(e, DT);
    snap(i + 1, k);
  });
  return out;
}

/** what reads as not smooth in a trace (see the header) */
export function judge(T: Frame[]): Flag[] {
  const F: Flag[] = [];
  let still = 0;
  for (let i = 1; i < T.length; i++) {
    const a = T[i - 1], b = T[i];
    const dx = b.x - a.x, dy = b.y - a.y;
    // (his own speed carries him between a's and b's: the frame's move is v*dt with either end's speed, and gravity's 1100 px/s/s)
    const ex = Math.min(Math.abs(dx - a.vx * DT), Math.abs(dx - b.vx * DT));
    const ey = Math.min(Math.abs(dy - a.vy * DT), Math.abs(dy - b.vy * DT));
    // a climb moves at its own speed with vx = vy = 0 (engine.ts sets them): up to 1.6x 220 px/s a frame is the climb, not a snap
    const climbBoth = a.st === 'c' && b.st === 'c';
    const sx = climbBoth ? Math.abs(dx) : ex, sy = climbBoth ? Math.max(0, Math.abs(dy) - 352 * DT) : ey;
    if (sx > 3 || sy > 3) F.push({ f: b.f, kind: 'snap', n: Math.round(Math.hypot(sx, sy)), note: `${a.st}->${b.st} dx ${dx.toFixed(1)} dy ${dy.toFixed(1)}` });
    const dvx = Math.abs(b.vx - a.vx), dvy = Math.abs(b.vy - a.vy);
    if (dvx > 120 || dvy > 160) F.push({ f: b.f, kind: 'vjump', n: Math.round(Math.max(dvx, dvy)), note: `${a.st}->${b.st} v (${Math.round(a.vx)},${Math.round(a.vy)})->(${Math.round(b.vx)},${Math.round(b.vy)})` });
    if (a.st !== b.st && (a.st === 'c' || b.st === 'c')) F.push({ f: b.f, kind: 'pop', n: 1, note: `${a.st}->${b.st} facing ${a.facing}->${b.facing} pair ${a.pair}->${b.pair}` });
    if (a.pair !== b.pair && a.st === 'c' && b.st === 'c') F.push({ f: b.f, kind: 'pop', n: 1, note: `hands ${a.pair}->${b.pair}` });
    const moving = Math.hypot(dx, dy) > 0.5;
    still = !moving && b.pad && b.pad !== 'j' ? still + 1 : 0;
    if (still === 2) F.push({ f: b.f, kind: 'stall', n: 2, note: `${b.st} pad ${b.pad} at (${Math.round(b.x)},${Math.round(b.y)})` });
    const dc = Math.hypot(b.camX - a.camX, b.camY - a.camY);
    if (dc > 24) F.push({ f: b.f, kind: 'cam', n: Math.round(dc), note: `cam (${Math.round(a.camX)},${Math.round(a.camY)})->(${Math.round(b.camX)},${Math.round(b.camY)})` });
  }
  return F;
}

/**
 * What the eye sees: the worst jerk on screen, the change in his drawn move from one frame to the next (px), on frames with no new jump
 * press (a jump starts at once by design). A snap onto a vine is a 40 px jerk; gravity is about 1.2; a run starting about 3-4.
 * `drawn` false judges the body (what the screen showed before the settle), true the drawn Pokey.
 */
export function jerk(T: Frame[], drawn: boolean): { max: number; at: number } {
  let max = 0, at = -1;
  const X = (t: Frame) => (drawn ? t.sx : t.x), Y = (t: Frame) => (drawn ? t.sy : t.y);
  for (let i = 2; i < T.length; i++) {
    if (T[i].pad.includes('J') || T[i - 1].pad.includes('J')) continue;
    const jx = X(T[i]) - 2 * X(T[i - 1]) + X(T[i - 2]), jy = Y(T[i]) - 2 * Y(T[i - 1]) + Y(T[i - 2]);
    const j = Math.hypot(jx, jy);
    if (j > max) { max = j; at = T[i].f; }
  }
  return { max, at };
}
/** how far the drawn Pokey is off his body `n` frames after the worst body snap (px): his paws on the vine, his feet on the wood */
export function lagAfter(T: Frame[], n: number): number {
  const at = jerk(T, false).at;
  const t = T.find((u) => u.f === at + n);
  return t ? Math.hypot(t.sx - t.x, t.sy - t.y) : 0;
}

const hold = (k: Pad, n: number): Pad[] => Array.from({ length: n }, () => ({ ...k }));
const floorAt = (r: RealPlay, x: number, y: number) => r.platforms.find((q) => !q.broken && x >= q.x && x <= q.x + q.width && Math.abs(q.y - y) < 4);

/** the moves, found from the stage's own vines */
export function moves(r: RealPlay): Array<{ name: string; setup: () => void; pads: Pad[] }> {
  const trunks = r.vines.filter((v) => v.vineType === 'tree_climb' && !v.field && !v.pair && !v.off);
  const fields = r.vines.filter((v) => v.vineType === 'tree_climb' && v.field && !v.off);
  const M: Array<{ name: string; setup: () => void; pads: Pad[] }> = [];
  // GRAB: a trunk standing on wood (its foot on a floor), Pokey 40 px beside it, up held; and a jump at it from 90 px out
  const foot = trunks.find((v) => floorAt(r, v.x - 40, v.bottomY) && floorAt(r, v.x - 90, v.bottomY));
  if (foot) {
    M.push({ name: `grab: up beside trunk ${foot.id} (40 px out)`, setup: () => { r.stand(foot.x - 40, foot.bottomY); r.p.facing = 1; }, pads: hold({ up: true }, 20) });
    M.push({ name: `grab: jump at trunk ${foot.id} (90 px out)`, setup: () => { r.stand(foot.x - 90, foot.bottomY); r.p.facing = 1; }, pads: [{ press: true, jump: true, up: true, right: true }, ...hold({ right: true, up: true, jump: true }, 6), ...hold({ up: true }, 16)] });
  }
  // VAULT: a trunk whose top has wood beside it, climbed from 90 px under the top with up held, facing each way
  const top = trunks.find((v) => r.platforms.some((q) => !q.broken && Math.abs(q.y - v.topY) < 4 && (Math.abs(q.x + q.width - v.x) < 40 || Math.abs(q.x - v.x) < 40)));
  if (top) for (const facing of [1, -1] as const) {
    M.push({ name: `vault: trunk ${top.id} top, facing ${facing}`, setup: () => { r.climb(top, top.topY + 90); r.p.facing = facing; }, pads: [...hold({ up: true }, 22), ...hold({}, 10)] });
  }
  // STEP: two field vines side by side; a push toward the next, let go, push again (both hands, then the new one); and the leap
  const pairOf = (v: Vine) => fields.find((w) => w !== v && Math.abs(w.x - v.x) <= 90 && w.x > v.x && Math.min(w.bottomY, v.bottomY) - Math.max(w.topY, v.topY) > 200);
  const a = fields.find((v) => pairOf(v));
  if (a) {
    const b = pairOf(a)!;
    const y = (Math.max(a.topY, b.topY) + Math.min(a.bottomY, b.bottomY)) / 2 + 40;
    M.push({ name: `step: field ${a.id} -> ${b.id} (${Math.round(b.x - a.x)} px), push twice`, setup: () => { r.climb(a, y); r.p.facing = 1; }, pads: [...hold({}, 2), ...hold({ right: true }, 4), ...hold({}, 6), ...hold({ right: true }, 4), ...hold({}, 8)] });
    M.push({ name: `leap: field ${a.id} -> ${b.id}, jump toward it with up`, setup: () => { r.climb(a, y); r.p.facing = 1; }, pads: [...hold({}, 2), { press: true, jump: true, up: true, right: true }, ...hold({ up: true, right: true, jump: true }, 5), ...hold({ up: true }, 10)] });
  }
  return M;
}

if (process.argv[1]?.endsWith('vineFeel.ts')) {
  const id = process.argv[2] ?? '1-4';
  const seed = Number(process.argv[3] ?? 1);
  const verbose = process.argv.includes('-v');
  for (const d of ['normal', 'easy'] as const) {
    setDifficulty(d);
    const n = moves(new RealPlay(id, seed)).length;
    for (let i = 0; i < n; i++) {
      // (each move on a fresh stage: a crumbling bough the last move broke, or hands it held, would carry over)
      const r = new RealPlay(id, seed);
      const m = moves(r)[i];
      m.setup();
      const T = trace(r, m.pads);
      const F = judge(T);
      const b = jerk(T, false), a = jerk(T, true);
      console.log(`${d} ${id}#${seed} ${m.name}: on screen worst jerk ${b.max.toFixed(1)} px (f${b.at}) body -> ${a.max.toFixed(1)} px (f${a.at}) drawn; drawn off body 5 frames on ${lagAfter(T, 5).toFixed(1)} px`);
      if (process.argv.includes('-f')) console.log('   body flags: ' + (F.length ? F.map((f) => `f${f.f} ${f.kind} ${f.n} (${f.note})`).join('; ') : 'smooth'));
      if (verbose) for (const t of T) console.log(`  f${t.f} ${t.st} ${t.pad.padEnd(4)} x ${t.x.toFixed(1)} y ${t.y.toFixed(1)} drawn ${t.sx.toFixed(1)},${t.sy.toFixed(1)} v (${Math.round(t.vx)},${Math.round(t.vy)}) face ${t.facing} pair ${t.pair} cam (${Math.round(t.camX)},${Math.round(t.camY)})`);
    }
  }
}
