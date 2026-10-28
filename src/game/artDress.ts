/**
 * artDress — Matt's World 3 and 4 puzzle sheets set into the hand-built stages as dressing (Matt, 2026-10-28: "make sure all the concept
 * art and all the different props that we created for worlds 1, 2, 3, 4 are all being placed into it, so it has different feels and
 * looks"; STAGE-RULES.md §4). It runs once a stage is built and only adds pictures: never a platform, a hazard, a pickup or a wall, and it
 * never draws from the stage's own random stream, so no route, jump, puzzle, length or bot result can change (w3Puzzles.test.ts,
 * w4Puzzles.test.ts and the stage inspector prove it).
 *
 *   World 3  on the grotto floor, away from the puzzle rooms: one of two sets, rotated by the roll with a cooldown (artRoll.ts):
 *            a shallow pool with stepping stones and fiddleheads, or a dry stone basin with flat slabs and a sprig of fern.
 *            3-7's "Which fern?": each hollow's three ferns are one of Matt's ferns, rolled per hollow (the grotto's own, his first, or
 *            his round-leaved one), all three the same, so only Dot's stones tell them apart; and Grandma's fern stone door stands
 *            in the hollow's back wall where he comes in, rolling aside as he comes up to it.
 *   World 4  one of two sets, rotated the same way: the old rope bridge far off across the mist, or a broken one, its two ends hanging
 *            at a gap he jumps (that is why he jumps it).
 *
 * Matt's other ferns (his fiddleheads and the sprig) are the floor sets' undergrowth: too thin to hide anything, so they are never taken
 * for a fern to search.
 */
import { lookHash, rollLook } from './artRoll.ts';
import { anchorAt, roomBox } from './puzzleKit.ts';
import type { KitDecor } from './puzzleArt.ts';
import type { KitArtName } from './puzzleAtlasData.ts';
import type { W3Decor } from './w3Art.ts';
import type { Collectible, Platform } from './types.ts';
import type { RoomSpec } from './puzzleKit.ts';

export interface DressInput {
  world: number;
  stage: number;
  seed: number;
  platforms: readonly Platform[];
  rooms: readonly RoomSpec[];
  collectibles: readonly Collectible[];
  w3decor?: W3Decor[];
}

/** World 3's floor sets (artRoll.ts rotates them: never the same in two stages running) */
export const W3_FLOOR_SETS = ['pool', 'basin', 'slabs', 'shallows'] as const;
/** what each floor set lays down, left to right: [piece, offset from the spot, width, sunk below the floor top] */
const FLOOR: Record<(typeof W3_FLOOR_SETS)[number], Array<[KitArtName, number, number, number]>> = {
  pool: [['fern2', -95, 46, 6], ['pool', 0, 150, 12], ['steppingStones', 150, 140, 8]],
  basin: [['fern4', -95, 62, 6], ['basin', 0, 130, 16], ['slabStones', 145, 130, 8]],
  slabs: [['fern2', -90, 42, 6], ['slab', 0, 120, 8], ['slabStones', 130, 120, 8], ['fern4', 225, 56, 6]],
  shallows: [['steppingStones', -10, 130, 8], ['pool', 140, 140, 12], ['fern4', 235, 56, 6]],
};
/** World 4's bridge sets */
export const W4_BRIDGE_SETS = ['far', 'broken'] as const;
/** 3-7's riddle ferns: the grotto's own fern, or one of Matt's two bushy puzzle ferns */
export const RIDDLE_FERNS = ['grotto', 'fern1', 'fern3'] as const;

type Box = { x0: number; x1: number; y0: number; y1: number };

/** the dressing a stage adds (kit pieces), and the changes it makes to its own World 3 decor (the riddle ferns' kind) */
export function dressStage(d: DressInput): KitDecor[] {
  const out: KitDecor[] = [];
  const boxes: Box[] = d.rooms.map((r) => roomBox(r, d.platforms));
  const inRoom = (x: number, pad: number) => boxes.some((b) => x > b.x0 - pad && x < b.x1 + pad);
  if (d.world === 3) {
    riddle(d, out);
    floor(d, out, inRoom);
  }
  if (d.world === 4) bridges(d, out, inRoom);
  if (d.world === 1) world1(d, out);
  return out;
}

/**
 * World 1's rooms (1-4's squirrels' lift, 1-6's seesaws, 1-7's acorn meadow), from Matt's World 1 sheet:
 *   1-4  the squirrels' home on their tree, a hollow log with a round door on the ledge the lift goes up to: it opens as the lift tops out
 *   1-6  a branch gate at the top of the bank the seesaw is the way up to: shut, it rises out of the way as the seesaw tips
 *   all  a petal bundle, the room's reward: it rises out of the spot past the way on as he gets there (a picture: it is not a pickup and
 *        counts for nothing, so no goal or count changes)
 * (1-6's first seesaw shows itself and needs nothing doing: no gate and no reward there)
 */
function world1(d: DressInput, out: KitDecor[]) {
  for (const r of d.rooms) {
    if (r.id.startsWith('seesaw-show')) continue;
    const top = d.platforms.find((p) => p.id === r.right.on);
    if (r.id.startsWith('squirrel-lift') && top) out.push({ n: 'nestDoorShut', open: 'nestDoorOpen', room: r.id, x: top.x + top.width - 70, b: top.y + 8, scale: 0.9 });
    if (r.id.startsWith('seesaw-') && top) out.push({ n: 'branchGate', room: r.id, rise: true, x: top.x + 75, b: top.y + 6, w: 150 });
    const b = anchorAt(r.beyond, d.platforms);
    if (b) out.push({ n: 'petalBundle', room: r.id, pop: true, x: b.x, b: b.y - 20, scale: 1.3 });
  }
}

function riddle(d: DressInput, out: KitDecor[]) {
  d.rooms.forEach((r, k) => {
    if (!r.id.startsWith('whichFern')) return;
    const b = roomBox(r, d.platforms);
    const kind = RIDDLE_FERNS[Math.floor(lookHash(d.seed, 41 + k) * RIDDLE_FERNS.length)];
    for (const f of d.w3decor ?? []) {
      if (f.n !== 'fern' || f.rustle === undefined || f.x < b.x0 || f.x > b.x1) continue;
      if (kind === 'grotto') delete f.kit;
      else f.kit = kind;
    }
    // Grandma's fern stone door in the back wall, where he comes into the hollow (the room's left edge: the stone "by the door" is
    // the one beside it); it rolls aside as he comes up to it
    const floorY = d.platforms.find((p) => p.id === r.left.on)?.y ?? b.y1 - 60;
    out.push({ n: 'fernDoorShut', open: 'fernDoorOpen', near: 300, x: b.x0 - 60, b: floorY + 10, w: 190, alpha: 0.92 });
  });
}

/** the long flat stretches of floor (the grotto's ground pieces) */
function floors(d: DressInput): Platform[] {
  return d.platforms.filter((p) => p.type === 'solid' && !p.art && p.width >= 420 && (p.style === 'moss_stone' || p.style === 'log'));
}

function floor(d: DressInput, out: KitDecor[], inRoom: (x: number, pad: number) => boolean) {
  const set = rollLook(W3_FLOOR_SETS, d.stage, d.seed, 3);
  const busy = (x: number) =>
    inRoom(x, 160) ||
    (d.w3decor ?? []).some((q) => Math.abs(q.x - x) < q.w / 2 + 130 && !q.hang) ||
    d.collectibles.some((c) => Math.abs(c.x - x) < 120);
  let last = -Infinity;
  let n = 0;
  for (const p of floors(d).sort((a, b) => a.x - b.x)) {
    for (let x = p.x + 200; x < p.x + p.width - 200 && n < 6; x += 90) {
      if (x - last < 1300 || busy(x - 100) || busy(x + 60) || busy(x + 240)) continue;
      const flip = lookHash(d.seed + x, 5) < 0.5;
      for (const [n2, dx, w, sink] of FLOOR[set]) out.push({ n: n2, x: x + dx, b: p.y + sink, w, flip: n2.startsWith('fern') ? !flip : flip });
      last = x;
      n++;
    }
  }
}

function bridges(d: DressInput, out: KitDecor[], inRoom: (x: number, pad: number) => boolean) {
  const set = rollLook(W4_BRIDGE_SETS, d.stage, d.seed, 4);
  const ps = d.platforms.filter((p) => p.type === 'solid' && !p.art && p.width >= 110 && p.crumbleAfter === undefined && !p.push);
  if (set === 'broken') {
    // the gaps between two ledges at one height, a jump across: the broken bridge's two ends, one on each side
    const gaps: Array<{ a: Platform; b: Platform; gap: number }> = [];
    for (const a of ps) {
      for (const b of ps) {
        const gap = b.x - (a.x + a.width);
        if (gap < 90 || gap > 280 || Math.abs(a.y - b.y) > 30) continue;
        if (inRoom(a.x + a.width, 120) || inRoom(b.x, 120)) continue;
        // (nothing standing up in between: a gap open to the sky)
        if (ps.some((q) => q !== a && q !== b && q.x < b.x && q.x + q.width > a.x + a.width && q.y < a.y + 200 && q.y > a.y - 260)) continue;
        gaps.push({ a, b, gap });
      }
    }
    gaps.sort((p, q) => p.a.x - q.a.x);
    let last = -Infinity;
    for (const g of gaps) {
      const x = g.a.x + g.a.width;
      if (x - last < 1600) continue;
      last = x;
      // (each end stands at its ledge's edge, its rope and planks hanging down into the gap)
      out.push({ n: 'bridgeBroken', x: x + 20, b: g.a.y + 10, scale: 0.8, half: 'left', under: true });
      out.push({ n: 'bridgeBroken', x: g.b.x - 20, b: g.b.y + 10, scale: 0.8, half: 'right', under: true });
      if (out.length >= 6) break;
    }
    if (out.length) return;
  }
  // far off across the mist: one or two old rope bridges, faded, drifting with the backdrop (on a stage of the broken set with no gap
  // to hang its ends at, the broken one, far off)
  const xs = ps.map((p) => p.x + p.width);
  const span = { x0: Math.min(...xs), x1: Math.max(...xs) };
  for (const u of [0.28, 0.72]) {
    const x = span.x0 + (span.x1 - span.x0) * (u + (lookHash(d.seed, 9 + u * 10) - 0.5) * 0.1);
    const near = ps.reduce((best, p) => (Math.abs(p.x + p.width / 2 - x) < Math.abs(best.x + best.width / 2 - x) ? p : best), ps[0]);
    if (!near) return;
    out.push({ n: set === 'broken' ? 'bridgeBroken' : 'bridge', x, b: near.y - 330, scale: 1.4, far: 0.7, alpha: 0.5, flip: u > 0.5 });
  }
}
