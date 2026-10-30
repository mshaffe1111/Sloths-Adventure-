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
import { dressSize, type DressPiece } from './dressArt.ts';
import type { DressName } from './dressAtlasData.ts';

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

/*
 * Worlds 1, 2 and 5 (hf-art-ground, 2026-10-29; polish report VI-17: "World 1 and World 5 look the same every visit"): three dressing
 * jobs, each with two sets the roll takes turns between (rollLook: a retry keeps the look, the next stage wears the other), drawn from
 * one small sheet (dressArt.ts). World 5's pieces are new, painted on Hugging Face from its own props; Worlds 1 and 2 have new hanging
 * moss and their own painted pieces otherwise.
 *   bank     a set of three where a bank drops away, along its lip by the edge
 *   hang     moss, roots or orchids hanging under the thin ledges, where there is clear air below
 *   clutter  small things lying along the long floors
 * Pictures only, like the rest of this file: never a platform or a pickup, and no draw from the stage's own random stream.
 */
export const DRESS_SETS: Record<1 | 2 | 5 | 8 | 9 | 10, Record<'bank' | 'hang' | 'clutter', DressName[][]>> = {
  1: {
    bank: [['w1Fern', 'w1Mushroom', 'w1Pebble'], ['w1Stump', 'w1Acorns', 'w1Sprig']],
    hang: [['w1Hang1', 'w1Hang2'], ['w1Hang2', 'w1Hang1']],
    clutter: [['w1Acorns', 'w1Pinecone', 'w1Pebble'], ['w1Stones', 'w1MushroomDim', 'w1Fiddle']],
  },
  2: {
    bank: [['w2ReedTall', 'w2ReedShort', 'w2ReedLean'], ['w2Log', 'w2ReedShort', 'w2Stone']],
    hang: [['w2Hang1', 'w2Hang2'], ['w2Hang2', 'w2Hang1']],
    clutter: [['w2RiverStone', 'w2ReedLean', 'w2Stone'], ['w2Stones', 'w2Fern', 'w2Stone']],
  },
  5: {
    bank: [['w5BankA1', 'w5BankA2', 'w5BankA3'], ['w5BankB1', 'w5BankB2', 'w5BankB3']],
    hang: [['w5Hang1', 'w5Hang2'], ['w5Hang2', 'w5Hang1']],
    clutter: [['w5ClutA1', 'w5ClutA2', 'w5ClutA3'], ['w5ClutB1', 'w5ClutB2', 'w5ClutB3']],
  },
  // (Worlds 8-10: Matt's props-made set dressing, packed and never drawn until now, hf-art-ground 2026-10-30. Worlds 9 and 10 have no
  // hanging piece: World 10's hanging grate and scaffold read as ledges to stand on)
  8: {
    bank: [['w8Flowers', 'w8Firefly', 'w8Nest'], ['w8FlowersB', 'w8FireflyB', 'w8NestB']],
    hang: [['w8Curtain'], ['w8CurtainB']],
    clutter: [['w8Hollow', 'w8Fungus', 'w8Flowers'], ['w8HollowB', 'w8NestB', 'w8FireflyB']],
  },
  9: {
    bank: [['w9Tree', 'w9Fern', 'w9Obsidian'], ['w9TreeB', 'w9FernB', 'w9ObsidianB']],
    hang: [[], []],
    clutter: [['w9Log', 'w9Smoke', 'w9Fern'], ['w9LogB', 'w9SmokeB', 'w9ObsidianB']],
  },
  10: {
    bank: [['w10Banner', 'w10Brazier', 'w10Crates'], ['w10Rack', 'w10Cage', 'w10Crate']],
    hang: [[], []],
    clutter: [['w10Crates', 'w10Banner', 'w10Crate'], ['w10Cage', 'w10Brazier', 'w10Rack']],
  },
};
/** the worlds dressed this way */
export const DRESS_WORLDS = [1, 2, 5, 8, 9, 10] as const;

/** the dressing sets laid in a stage of World 1, 2 or 5 (empty for any other world) */
export function dressSets(d: DressInput & { checkpoints?: readonly { x: number }[] }): DressPiece[] {
  const sets = DRESS_SETS[d.world as 1 | 2 | 5 | 8 | 9 | 10];
  if (!sets) return [];
  const out: DressPiece[] = [];
  const boxes: Box[] = d.rooms.map((r) => roomBox(r, d.platforms));
  const inRoom = (x: number, pad: number) => boxes.some((b) => x > b.x0 - pad && x < b.x1 + pad);
  const clear = (x: number, w: number) =>
    !inRoom(x, 80) && !d.collectibles.some((c) => Math.abs(c.x - x) < w / 2 + 50) && !(d.checkpoints ?? []).some((c) => Math.abs(c.x - x) < w / 2 + 70);
  // (and nothing else stands where it would: a bounce pad, a step or a stone on the bank, or a wall rising from it)
  const free = (n: DressName, x: number, b: number, on: Platform) => {
    const { w, h } = dressSize(n);
    return !d.platforms.some((q) => q !== on && q.x < x + w / 2 + 12 && q.x + q.width > x - w / 2 - 12 && q.y < b - 4 && q.y + q.height > b - h - 12);
  };
  const pick = (job: 'bank' | 'hang' | 'clutter', salt: number) => rollLook(sets[job], d.stage, d.seed, salt + d.world * 11);
  // (each set laid in a turned order, so the same three in the same order do not come round bank after bank)
  const turn = (set: DressName[], k: number) => {
    const i = Math.floor(lookHash(d.seed + k, 41) * set.length);
    return [...set.slice(i), ...set.slice(0, i)];
  };
  const banks = d.platforms.filter((p) => p.type === 'solid' && p.height >= 90 && !p.art && !p.push).sort((a, b) => a.x - b.x);
  const touches = (p: Platform, right: boolean) =>
    banks.some((q) => q !== p && q.y <= p.y + 2 && (right ? Math.abs(p.x + p.width - q.x) < 2 : Math.abs(q.x + q.width - p.x) < 2));
  // bank: a set of three along the lip by each end that drops away, laid inward from the edge
  const bankSet = pick('bank', 51);
  let lastBank = -Infinity;
  let lastSet = -Infinity;
  for (const p of banks) {
    if (p.width < 240) continue;
    for (const right of [false, true]) {
      if (touches(p, right) || out.length >= 18) continue;
      const edge = right ? p.x + p.width : p.x;
      if (Math.abs(edge - lastBank) < 700) continue;
      // (none at the stage's start, where he stands as it opens: a set there piled up round him, W8-10's first screens)
      if (edge < 300) continue;
      const dir = right ? -1 : 1;
      let at = edge + dir * 34;
      const laid: DressPiece[] = [];
      for (const n of turn(bankSet, out.length + Math.round(edge))) {
        const w = dressSize(n).w;
        const x = at + (dir * w) / 2;
        if (!clear(x, w) || !free(n, x, p.y + 5, p)) break;
        laid.push({ n, x, b: p.y + 5, flip: lookHash(d.seed + Math.round(x), 17) < 0.5 });
        at += dir * (w * 0.78 + 6);
      }
      // (and 600 or more clear of the last set: sets laid inward from two edges facing each other met in the middle, the same piece
      // twice side by side)
      const near = Math.min(...laid.map((q) => q.x));
      if (laid.length === bankSet.length && near - lastSet >= 600) {
        out.push(...laid);
        lastBank = edge;
        lastSet = Math.max(...laid.map((q) => q.x));
      }
    }
  }
  // hang: under a thin ledge with clear air below it (the nearest ground at least 230 units down)
  const hangSet = pick('hang', 53);
  let lastHang = -Infinity;
  let hangs = 0;
  const ledges = d.platforms
    .filter((p) => p.height < 50 && p.width >= 110 && (p.type === 'solid' || p.type === 'fragile') && !p.art && !p.push)
    .sort((a, b) => a.x - b.x);
  for (const p of hangSet.length ? ledges : []) {
    if (hangs >= 6 || p.x - lastHang < 520 || inRoom(p.x + p.width / 2, 60)) continue;
    const under = p.y + p.height;
    const below = d.platforms.filter((q) => q !== p && q.x < p.x + p.width && q.x + q.width > p.x && q.y > under).reduce((m, q) => Math.min(m, q.y), Infinity);
    if (below - under < 230) continue;
    // (and well up off the ground: a log lying across a gap at ground level is no place to hang moss from)
    // (the two nearest banks, however far: a log across a wide river has no bank within reach and still lies at ground level)
    const dist = (q: Platform) => Math.max(0, q.x - (p.x + p.width), p.x - (q.x + q.width));
    const ground = [...banks].sort((a, b) => dist(a) - dist(b)).slice(0, 2).reduce((m, q) => Math.min(m, q.y), Infinity);
    if (ground - p.y < 150) continue;
    const n = hangSet[hangs % hangSet.length];
    const w = dressSize(n).w;
    if (w > p.width - 20) continue;
    const u = 0.28 + lookHash(d.seed + Math.round(p.x), 19) * 0.44;
    // (never in front of a pickup hanging under the ledge)
    if (d.collectibles.some((c) => Math.abs(c.x - (p.x + p.width * u)) < w / 2 + 40 && c.y > under - 40 && c.y < under + dressSize(n).h + 40)) continue;
    out.push({ n, x: p.x + p.width * u, b: under - 4, flip: lookHash(d.seed + Math.round(p.x), 23) < 0.5 });
    lastHang = p.x;
    hangs++;
  }
  // clutter: a small set lying along each long floor, every 820 or so, away from its ends and the bank sets
  const clutSet = pick('clutter', 57);
  const bankXs = out.map((q) => q.x);
  let sets3 = 0;
  for (const p of banks) {
    if (p.width < 420) continue;
    for (let x = p.x + 200 + lookHash(d.seed + Math.round(p.x), 29) * 200; x < p.x + p.width - 260 && sets3 < 8; x += 820) {
      if (bankXs.some((bx) => bx > x - 440 && bx < x + 700)) continue;
      let at = x;
      const laid: DressPiece[] = [];
      for (const n of turn(clutSet, sets3 + Math.round(x))) {
        const w = dressSize(n).w;
        const cx = at + w / 2;
        if (!clear(cx, w) || !free(n, cx, p.y + 6, p)) break;
        laid.push({ n, x: cx, b: p.y + 6, flip: lookHash(d.seed + Math.round(cx), 31) < 0.5 });
        at += w + 26 + lookHash(d.seed + Math.round(cx), 37) * 40;
      }
      if (laid.length === clutSet.length) {
        out.push(...laid);
        sets3++;
      }
    }
  }
  return out;
}
