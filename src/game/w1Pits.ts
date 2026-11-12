/**
 * World 1's pits, painted (R-6.38, fix-petals 2026-11-04; the pictures are R-159.1's, approved by Matt on the pit list, PIT-LIST.md, and
 * accepted by the lead: the drop s52-7, the lip s55-7, the bed s60-7, cut by tools/art/combat/pitcut.py; the high drop s65-23 read as a
 * grey haze box over 1-8's gaps and is not used: 1-8's gaps darken the foliage behind them and end on 1-8's own broken-branch pieces).
 * The quality supervisor's stills: a gap Pokey falls through read as more foliage (1-8) or as a log over a muddy stream (1-3, 1-5, 1-9).
 * Now:
 *   - a soft pit (World 1's vault pits: a floor 100-200 px down, a miss costs nothing): the drop down its walls, dark earth and roots to
 *     its floor, the torn lip at each end where the ground is a bank of earth, and the bed of big leaves on its floor: a pit, and a soft one;
 *   - 1-8's long branch (a stage with the chase): the foliage behind each gap going dark into black, its sides uneven, and the branch's
 *     torn ends at both sides (1-8's own breaking-branch halves, protoArt.ts drawChaseBroken);
 *   - a floorless gap a builder marks with `pit: 'drop'` on either bank (1-9's hard vault): the drop all the way down, over the water;
 *   - an unmarked floorless gap anywhere else in World 1 is water (1-6's, with Dot's "Careful, water!" and its sign): it keeps its water.
 * For the builders (W1-REBUILD-PLAN): a soft pit needs nothing but a floor SOFT_FLOOR to FALL_BELOW px down and a piece standing in it as
 * its way out; a drop needs `pit: 'drop'` on a bank beside it; 1-8's gaps need nothing.
 * Everything is found once per stage from its platforms (the gaps never move: a breaking branch over a gap is not a floor) and drawn each
 * frame for the gaps in view, behind the platforms (protoArt.ts drawProtoScene, after the ground). Nothing here touches the HUD.
 */
import { trackAtlas } from './atlasLoader.ts';
import { endFace } from './groundPaint.ts';
import type { Platform } from './types.ts';

const URL_OF = {
  drop: new URL('../assets/props/pits/w1-drop.webp', import.meta.url).href,
  lip: new URL('../assets/props/pits/w1-lip.webp', import.meta.url).href,
  bed: new URL('../assets/props/pits/w1-bed.webp', import.meta.url).href,
} as const;
/**
 * the thorn bed's pictures: World 1's hurt floor (gen2 WorldManifest.hurtFloor, art family 'w1-thorn'), the art director's cut brambles
 * (catalog rows w1-thorn-bramble-long and w1-thorn-bramble-b, slot other/proto.thorns). Loaded only for a stage that lays a hurt floor
 */
const THORN_URL = {
  thornLong: new URL('../assets/props/pits/w1-thorn-long.webp', import.meta.url).href,
  thornLow: new URL('../assets/props/pits/w1-thorn-low.webp', import.meta.url).href,
} as const;
const URL_ALL = { ...URL_OF, ...THORN_URL } as const;
type Pic = keyof typeof URL_ALL;
export const W1_PIT_URLS: readonly string[] = Object.values(URL_OF);
export const W1_THORN_URLS: readonly string[] = Object.values(THORN_URL);

const imgs = new Map<Pic, { img: HTMLImageElement | null; ready: boolean }>();
function pic(k: Pic): HTMLImageElement | null {
  let s = imgs.get(k);
  if (!s) imgs.set(k, (s = { img: null, ready: false }));
  if (!s.img && typeof Image !== 'undefined') {
    const im = new Image();
    const sh = s;
    sh.img = im;
    trackAtlas(im, URL_ALL[k], () => { sh.ready = true; }, () => { sh.img = null; });
  }
  return s.ready ? s.img : null;
}
/** start the four pictures loading; true once they are all in (stagePreload.ts waits for it on World 1's stages) */
export function w1PitsReady(): boolean {
  let all = true;
  for (const k of Object.keys(URL_OF) as Pic[]) if (!pic(k)) all = false;
  return all;
}
/** start the thorn bed's pictures loading; true once they are in (asked for only by a stage with a hurt floor) */
export function w1ThornsReady(): boolean {
  let all = true;
  for (const k of Object.keys(THORN_URL) as Pic[]) if (!pic(k)) all = false;
  return all;
}

/** the world px each picture is drawn at (its height follows its own proportions) */
export const PIT_SIZE = { dropTile: 256, lipW: 84, bedTile: 220 } as const;
/** deeper than this under the ground line and there is no floor: a fall */
export const FALL_BELOW = 200;
/** the ground line drops this far and it is a gap (a sunk step or a pit) */
export const SOFT_BELOW = 50;
/** a soft pit's floor sits this far under the ground line, or more (and under FALL_BELOW): 1-3's, 130 down; a 75 px sunk step is not one */
export const SOFT_FLOOR = 100;
/** Pokey's body width (engine.ts: the hero is 44 px wide): a gap narrower than this he cannot fall into */
const HERO_BODY = 44;
/** a soft pit's floor runs no further than this past either wall (px): further, it is a lower road under open air (World 1's vault pits: 60) */
export const SOFT_RUN_ON = 120;
/** a floor this close under a soft pit's lower lip is its own way out: he walks or hops straight up onto the lip (the vault-pit rule) */
export const SUNK_STEP = 75;
/** a marked drop is nearly black this far under its lip (px) */
export const DROP_DARK = 200;

/** `steps`: the pieces standing in a soft pit above its floor (its way out): never painted over */
/** `drop`: a fall a builder marked as a painted drop (either bank's `pit: 'drop'`); an unmarked fall is water (1-6's) */
/**
 * `walls`: a marked drop that is a real pit, the tops of the two banks of earth either side of it (R-164.6): only then is it painted. A
 * drop beside a log, a stone slab or a branch, or with ground standing in it, is open air: nothing is painted there (Matt's stills
 * 0224-0228: a black column hung down through the air under floating logs and slabs, and a dark box stood behind the bank he was on)
 */
export interface PitGap { x0: number; x1: number; top: number; kind: 'fall' | 'soft' | 'hurt'; floor?: number; lipL: boolean; lipR: boolean; steps?: Array<[number, number, number, number, boolean]>; drop?: boolean; walls?: [number, number] }

const floorish = (q: Platform) => !q.broken && q.type !== 'bouncy' && q.type !== 'fragile' && q.type !== 'drift' && q.type !== 'moving';
/**
 * a piece the ground painter draws as a bank of earth, its soil running down out of sight (protoArt.ts drawProtoScene's `banks`, which
 * calls this: one rule for the ground and its pits)
 */
export const paintedBank = (q: Platform) => (q.height >= 90 || !!q.soil) && !q.push && !q.broken && !q.art && !q.hollow;
/**
 * a marked drop's walls: a bank of earth ends at each side of it, and nothing that stands (a floor, a stone, a log) lies in it below its
 * lip. Else undefined: the gap is open air
 */
function pitWalls(platforms: readonly Platform[], x0: number, x1: number, top: number): [number, number] | undefined {
  const side = (right: boolean) => platforms.filter((q) => paintedBank(q) && Math.abs((right ? q.x : q.x + q.width) - (right ? x1 : x0)) < 3 && q.y <= top + 4 && q.y + q.height > top).sort((a, b) => a.y - b.y)[0];
  const L = side(false), R = side(true);
  if (!L || !R) return undefined;
  // (a bank of earth over it at any height stands in it too: its soil runs on down out of sight, in front of the drop)
  if (platforms.some((q) => floorish(q) && q.x < x1 - 4 && q.x + q.width > x0 + 4 && (q.y + q.height > top + 4 || paintedBank(q)))) return undefined;
  return [L.y, R.y];
}

/**
 * The stage's pits, from its platforms. The ground line is the commonest top of its banks of earth. A spot is ground where a piece stands
 * in the ground band (a bank, a stump or a pillar reaching down to the line, or a log bridge across it); between two stretches of ground
 * is a gap, a soft pit when a floor lies SOFT_FLOOR to FALL_BELOW px down (1-3's, 130), else a fall. A sunk step (75 px) is not a pit.
 * 1-8's long branch has no ground: its gaps are the holes between the chase's sections (and the branches beside them), all falls.
 */
export function findW1Pits(platforms: readonly Platform[]): PitGap[] {
  const base = findOpenPits(platforms);
  const hurt = hurtPits(platforms);
  return hurt.length ? [...base.filter((g) => !hurt.some((h) => h.x0 < g.x1 && h.x1 > g.x0)), ...hurt].sort((a, b) => a.x0 - b.x0) : base;
}
/**
 * a hollow: a gap with the world's hurt floor on its bottom (a piece gen2 marks `pit: 'hurt'`, wall to wall between two banks that reach
 * down to it). `kind: 'hurt'`, `floor` the hurt floor's top, `walls` the two lips' tops (the left, the right), `top` the LOWER lip: the
 * pit's dark inside begins there, and the thorn bed lies on the floor. Read off the marked piece, at any height (never the ground line)
 */
function hurtPits(platforms: readonly Platform[]): PitGap[] {
  const out: PitGap[] = [];
  for (const f of platforms) {
    if (f.pit !== 'hurt' || f.broken) continue;
    const x0 = f.x, x1 = f.x + f.width;
    const lipOf = (edge: (q: Platform) => number) => platforms.filter((q) => q !== f && floorish(q) && Math.abs(edge(q)) < 3 && q.y < f.y && q.y + q.height >= f.y).sort((a, b) => a.y - b.y)[0];
    const l = lipOf((q) => q.x + q.width - x0), r = lipOf((q) => q.x - x1);
    if (!l && !r) continue;
    const yl = (l ?? r)!.y, yr = (r ?? l)!.y;
    out.push({ x0, x1, top: Math.max(yl, yr), kind: 'hurt', floor: f.y, lipL: !!l && paintedBank(l), lipR: !!r && paintedBank(r), walls: [yl, yr] });
  }
  return out;
}
function findOpenPits(platforms: readonly Platform[]): PitGap[] {
  const chase = platforms.filter((q) => (q as Platform & { chase?: boolean }).chase && !q.broken);
  if (chase.length) return chaseGaps(platforms, chase);
  const banks = platforms.filter((q) => q.height >= 90 && floorish(q));
  if (!banks.length) return [];
  const tops = new Map<number, number>();
  for (const b of banks) tops.set(Math.round(b.y), (tops.get(Math.round(b.y)) ?? 0) + b.width);
  const G = [...tops].sort((p, q) => q[1] - p[1])[0][0];
  // (ground: reaches the ground band from above, or lies across the line itself)
  const ground = platforms.filter((q) => floorish(q) && q.y <= G + SOFT_BELOW && (q.y + q.height >= G + 30 || q.y >= G - 20));
  const under = platforms.filter((q) => floorish(q) && q.y > G + SOFT_BELOW && q.y <= G + FALL_BELOW);
  if (!ground.length) return [];
  // (the ground's stretches along x, merged)
  const spans = ground.map((q) => [q.x, q.x + q.width] as [number, number]).sort((p, q) => p[0] - q[0]);
  const merged: Array<[number, number]> = [];
  for (const [a0, a1] of spans) {
    const m = merged[merged.length - 1];
    if (m && a0 <= m[1] + 2) m[1] = Math.max(m[1], a1);
    else merged.push([a0, a1]);
  }
  const topAt = (x: number) => Math.min(...ground.filter((q) => x >= q.x - 1 && x <= q.x + q.width + 1).map((q) => q.y));
  const bankAt = (x: number) => ground.some((q) => x >= q.x - 1 && x <= q.x + q.width + 1 && q.height >= 90);
  const out: PitGap[] = [];
  for (let i = 0; i + 1 < merged.length; i++) {
    const x0 = merged[i][1], x1 = merged[i + 1][0];
    if (x1 - x0 < 24 || x1 - x0 > 1600) continue;
    const fl = under.filter((q) => q.x < x1 - 4 && q.x + q.width > x0 + 4);
    const top = Math.max(topAt(x0), topAt(x1));
    const lip = { lipL: bankAt(x0), lipR: bankAt(x1) };
    const marked = ground.some((q) => q.pit === 'drop' && (Math.abs(q.x + q.width - x0) < 3 || Math.abs(q.x - x1) < 3));
    if (!fl.length) {
      const walls = marked ? pitWalls(platforms, x0, x1, top) : undefined;
      out.push({ x0, x1, top, kind: 'fall', ...lip, ...(marked ? { drop: true } : {}), ...(walls ? { walls } : {}) });
    }
    else {
      // (the floor is the piece under most of the gap: the soil steps at a soft pit's walls are its way out, not its floor)
      // (and a sunk step's own floor, under all of it, is its floor even with deeper ground below: the highest piece under most of it)
      const ov = (q: Platform) => Math.min(x1, q.x + q.width) - Math.max(x0, q.x);
      const most = fl.filter((q) => ov(q) >= 0.7 * (x1 - x0));
      const floorQ = most.length ? most.reduce((a, b) => (b.y < a.y ? b : a)) : [...fl].sort((p, q) => ov(q) - ov(p))[0];
      const floor = floorQ.y;
      // (a soft pit is a hole in the ground: a bank of earth at both lips, its walls, and its floor ending at them (World 1's vault pits:
      // within 60 px past each wall). A floor that runs on far under a lip is a lower road and the gap open air over it: a fork's high road
      // over its low road (the mixer's 1-1, 21 such gaps over 16 layouts read as pits with no way out, and would have painted pit walls
      // and a leaf bed over the low road). It is judged as a fall: a marked drop, or open air)
      // (and a slit narrower than his body is no pit: he cannot fall into it (Easy's wider landings left 40 px between two banks))
      const lower = x1 - x0 < HERO_BODY || !lip.lipL || !lip.lipR || x0 - floorQ.x > SOFT_RUN_ON || floorQ.x + floorQ.width - x1 > SOFT_RUN_ON;
      // (only what would be a soft pit: a floor nearer than SOFT_FLOOR is a sunk step, no gap at all, as before)
      if (lower && floor - G >= SOFT_FLOOR) {
        const walls = marked ? pitWalls(platforms, x0, x1, top) : undefined;
        out.push({ x0, x1, top, kind: 'fall', ...lip, ...(marked ? { drop: true } : {}), ...(walls ? { walls } : {}) });
        continue;
      }
      // (the steps out, and anything else standing in it: x, y, w, h)
      const steps = platforms.filter((q) => !q.broken && q.type !== 'fragile' && q.x < x1 && q.x + q.width > x0 && q.y > top + 4 && q.y < floor - 4).map((q) => [q.x, q.y, q.width, q.height, !!q.soil] as [number, number, number, number, boolean]);
      if (floor - G >= SOFT_FLOOR) out.push({ x0, x1, top, kind: 'soft', floor, ...lip, steps });
    }
  }
  // (a stage that climbs and falls through many heights, the mixer's 1-5: one ground line finds only the gaps at its own height. A marked
  // drop between two banks of earth at any height is judged against those two banks: their tops, and nothing standing in it)
  const marked = platforms.filter((q) => paintedBank(q) && floorish(q) && q.pit === 'drop').sort((a, b) => a.x - b.x);
  for (const a of marked) {
    const x0 = a.x + a.width;
    // (the next bank of earth to the right whose top is near a's: the gap's far wall)
    const b = platforms.filter((q) => paintedBank(q) && floorish(q) && q.x - x0 >= 24 && q.x - x0 <= 1600 && Math.abs(q.y - a.y) <= OWN_STEP).sort((p, q) => p.x - q.x)[0];
    if (!b) continue;
    const x1 = b.x, top = Math.max(a.y, b.y);
    // (inside a wider gap the ground line found, painted or not: a soft pit, water, a painted drop keep it; open air does not)
    if (out.some((g) => g.x0 < x1 && g.x1 > x0 && (g.kind === 'soft' || !g.drop || g.walls))) continue;
    // (anything between them at all, at their height or under it: it is not one clean drop, and the ground line's pass judges it)
    if (platforms.some((q) => !q.broken && q !== a && q !== b && q.x < x1 - 4 && q.x + q.width > x0 + 4 && q.y + q.height > Math.min(a.y, b.y) - 40)) continue;
    const walls = pitWalls(platforms, x0, x1, top);
    if (walls) out.push({ x0, x1, top, kind: 'fall', lipL: a.height >= 90, lipR: b.height >= 90, drop: true, walls });
  }
  return out.sort((p, q) => p.x0 - q.x0);
}
/** a marked drop's two banks at any height (findW1Pits' own pass) are at most this far apart in height */
const OWN_STEP = 120;

/** 1-8: the holes between the chase's sections (and any branch at their height), with nothing under them within 400 px: falls */
function chaseGaps(platforms: readonly Platform[], chase: readonly Platform[]): PitGap[] {
  const path = platforms.filter((q) => floorish(q) && q.width >= 40 && chase.some((c) => Math.abs(c.y - q.y) < 80));
  const s = path.map((q) => [q.x, q.x + q.width, q.y] as [number, number, number]).sort((p, q) => p[0] - q[0]);
  const merged: Array<[number, number, number, number]> = [];
  for (const [a0, a1, y] of s) {
    const m = merged[merged.length - 1];
    if (m && a0 <= m[1] + 2) { m[1] = Math.max(m[1], a1); m[3] = y; } else merged.push([a0, a1, y, y]);
  }
  const out: PitGap[] = [];
  for (let i = 0; i + 1 < merged.length; i++) {
    const x0 = merged[i][1], x1 = merged[i + 1][0];
    if (x1 - x0 < 24 || x1 - x0 > 2400) continue;
    const top = Math.max(merged[i][3], merged[i + 1][2]);
    if (platforms.some((q) => floorish(q) && q.x < x1 - 4 && q.x + q.width > x0 + 4 && q.y > top + 20 && q.y < top + 400)) continue;
    out.push({ x0, x1, top, kind: 'fall', lipL: false, lipR: false });
  }
  return out;
}

/** the water the stage declares (engine.ts sets it at the stage's start: proto.water): a drop it fills is water, never painted dark */
let pitWater: ReadonlyArray<{ x0: number; x1: number; y: number }> = [];
export function setW1PitWater(zones: ReadonlyArray<{ x0: number; x1: number; y: number }> | undefined) {
  pitWater = zones ?? [];
}
/** is this gap filled by the stage's water (its surface across the gap, no lower than where its dark comes in) */
/** does the stage's drawn water lie across x0..x1 (any of it): the ground's pit shade is not drawn over water (protoArt.ts drawGround) */
export const waterAcross = (x0: number, x1: number) => pitWater.some((z) => z.x0 < x1 && z.x1 > x0);
export const inWater = (g: PitGap) => pitWater.some((z) => z.x0 <= g.x0 + 4 && z.x1 >= g.x1 - 4 && z.y <= g.top + DROP_DARK);
const cache = new WeakMap<readonly Platform[], { gaps: PitGap[]; bottom: number }>();
/** the stage's pits, and how far down its pieces reach (a drop is baked to there and a little more: below it the camera never looks) */
const pitsOf = (platforms: readonly Platform[]) => {
  let v = cache.get(platforms);
  if (!v) cache.set(platforms, (v = { gaps: findW1Pits(platforms), bottom: Math.max(0, ...platforms.map((q) => q.y + q.height)) + DROP_BELOW }));
  return v;
};
/** a drop is baked this far under the stage's lowest piece */
const DROP_BELOW = 400;
/** the dark of a drop under DROP_DARK is baked at this fraction of world size (a flat fill: its edges lie under the banks' soil) */
const DEEP_SCALE = 0.25;

/**
 * A drop between two banks of earth, following the ground (R-164.6, R-164.8): the region between the two banks' own painted end faces
 * (groundPaint.ts endFace, the outline drawBankArt cuts their soil to), from the lip down; the drop's picture and torn top fading in
 * over DROP_DARK, then near black on down. The faces wobble and lean, so a straight column showed open air either side of it and ran on
 * through it under the banks; inside the faces the dark only ever meets soil. Baked once: the top at world size, the dark below at
 * DEEP_SCALE. Where the faces close the gap (they lean in past each other) there is nothing to paint.
 */
function bakeDrop(g: PitGap, drop: HTMLImageElement, bottom: number): { top: HTMLCanvasElement | null; deep: HTMLCanvasElement | null; x: number } | null {
  const [yl, yr] = g.walls!;
  const H = Math.min(3000, bottom - g.top);
  if (H <= 0) return null;
  const outline = dropOutline(g, yl, yr, g.top + H);
  const xs = outline.flatMap(([, a, b]) => (a < b ? [a, b] : []));
  if (!xs.length) return null;
  const X0 = Math.floor(Math.min(...xs)) - 1, X1 = Math.ceil(Math.max(...xs)) + 1;
  const clipTo = (k: CanvasRenderingContext2D, sc: number, oy: number) => {
    k.beginPath();
    k.moveTo((outline[0][1] - X0) * sc, (outline[0][0] - oy) * sc);
    for (const [y, a] of outline) k.lineTo((a - X0) * sc, (y - oy) * sc);
    for (let i = outline.length - 1; i >= 0; i--) k.lineTo((outline[i][2] - X0) * sc, (outline[i][0] - oy) * sc);
    k.closePath();
    k.clip();
  };
  // (the top ends where the dark below begins: an overlap was darker twice, a line across the drop)
  const topH = Math.min(H, DROP_DARK);
  const tc = canvas(X1 - X0, topH);
  const tk = tc?.getContext('2d');
  const soft = bakeSoft({ ...g, x0: X0, x1: X1, floor: g.top + DROP_DARK }, drop);
  if (tc && tk && soft) {
    clipTo(tk, 1, g.top);
    tk.drawImage(soft, 0, 0);
  }
  let dc: HTMLCanvasElement | null = null;
  if (H > DROP_DARK) {
    dc = canvas((X1 - X0) * DEEP_SCALE, (H - DROP_DARK) * DEEP_SCALE);
    const dk = dc?.getContext('2d');
    if (dc && dk) {
      clipTo(dk, DEEP_SCALE, g.top + DROP_DARK);
      dk.fillStyle = 'rgba(10,7,5,0.94)';
      dk.fillRect(0, 0, dc.width, dc.height);
    }
  }
  return { top: tc, deep: dc, x: X0 };
}

/** a drop's outline, every 8 px down from its lip: [y, the left bank's face x, the right bank's face x] (closed where they meet) */
export function dropOutline(g: PitGap, yl: number, yr: number, bottom: number): Array<[number, number, number]> {
  const fl = endFace(1, g.x0, yl, bottom, true), fr = endFace(1, g.x1, yr, bottom, false);
  const at = (f: Array<[number, number]>, y: number) => {
    if (y <= f[0][1]) return f[0][0];
    for (let i = 1; i < f.length; i++) if (f[i][1] >= y) return f[i - 1][0] + ((f[i][0] - f[i - 1][0]) * (y - f[i - 1][1])) / (f[i][1] - f[i - 1][1] || 1);
    return f[f.length - 1][0];
  };
  const out: Array<[number, number, number]> = [];
  for (let y = g.top; ; y = Math.min(bottom, y + 8)) {
    const a = at(fl, y), b = at(fr, y);
    out.push(a < b ? [y, a, b] : [y, (a + b) / 2, (a + b) / 2]);
    if (y >= bottom) break;
  }
  return out;
}

/** draw the pits in view (World 1 only: protoArt.ts calls it there); false while the pictures load */
/** a steady pseudo-random number from a position (the same pit always looks the same) */
const hash = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
/** a smooth, irregular line: the sum of three waves keyed to the world x (px of wobble, 0..1) */
const wobble = (x: number, seed: number) => 0.5 + 0.22 * Math.sin(x / 23 + seed) + 0.16 * Math.sin(x / 9.7 + seed * 2.1) + 0.12 * Math.sin(x / 41 + seed * 0.7);
const canvas = (w: number, h: number): HTMLCanvasElement | null => {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
};

/** how far under the lip a soft pit's darkness has fully come in (px): the backdrop shows at the top and goes dark below it */
export const PIT_FADE = 70;
/** the torn top line's depth (px under the lip, at most) */
export const TORN = 16;
/** 1-8: how far under the branch its gap is fully dark (px) */
export const HIGH_DARK = 170;

interface Baked { under: HTMLCanvasElement | null; over: HTMLCanvasElement | null; x: number; y: number; ox: number; oy: number; drop?: ReturnType<typeof bakeDrop> }
const baked = new WeakMap<PitGap, Baked>();

/** a soft pit's inside, baked once: the drop and its shade, under a torn top line that fades the backdrop into the dark */
function bakeSoft(g: PitGap, drop: HTMLImageElement): HTMLCanvasElement | null {
  const floor = g.floor ?? g.top + 130;
  const W = g.x1 - g.x0, H = floor + 12 - g.top;
  const c = canvas(W, H);
  const k = c?.getContext('2d');
  if (!c || !k) return null;
  const tw = PIT_SIZE.dropTile, th = (tw * drop.height) / drop.width;
  for (let x = Math.floor(g.x0 / tw) * tw; x < g.x1; x += tw) k.drawImage(drop, x - g.x0, 0, tw, th);
  // (darker down to the floor, darker at its walls)
  const v = k.createLinearGradient(0, 0, 0, H);
  v.addColorStop(0, 'rgba(10,7,5,0.35)');
  v.addColorStop(1, 'rgba(10,7,5,0.74)');
  k.fillStyle = v;
  k.fillRect(0, 0, W, H);
  const wall = Math.min(46, W / 3);
  for (const [a, b] of [[0, wall], [W, W - wall]] as const) {
    const hg = k.createLinearGradient(a, 0, b, 0);
    hg.addColorStop(0, 'rgba(10,7,5,0.55)');
    hg.addColorStop(1, 'rgba(10,7,5,0)');
    k.fillStyle = hg;
    k.fillRect(Math.min(a, b), 0, Math.abs(b - a), H);
  }
  // the torn top: a mask where each 2 px column fades in from its own torn line down over PIT_FADE, drawn whole on its own canvas and
  // then laid on once with destination-in (which works on the whole canvas: column by column, each fill wiped all the others)
  const mc = canvas(W, H);
  const mk = mc?.getContext('2d');
  if (!mc || !mk) return c;
  for (let x = 0; x < W; x += 2) {
    const t = TORN * wobble(g.x0 + x, g.x0 * 0.01);
    const m = mk.createLinearGradient(0, t, 0, t + PIT_FADE);
    // (front-loaded: soft at the torn line, most of the way dark a third of the way down, so a 130 px pit reads dark, not as its floor)
    m.addColorStop(0, 'rgba(0,0,0,0)');
    m.addColorStop(0.35, 'rgba(0,0,0,0.62)');
    m.addColorStop(1, 'rgba(0,0,0,1)');
    mk.fillStyle = m;
    mk.fillRect(x, 0, 2, H);
  }
  k.globalCompositeOperation = 'destination-in';
  k.drawImage(mc, 0, 0);
  k.globalCompositeOperation = 'source-over';
  return c;
}

/** a soft pit's leaf bed, baked once: the tile flipped, offset, scaled and spaced from its own seed, low on the floor */
function bakeBed(g: PitGap, bed: HTMLImageElement): HTMLCanvasElement | null {
  const W = g.x1 - g.x0 + 12;
  const bw0 = PIT_SIZE.bedTile * 0.8;
  const H = (bw0 * 1.25 * bed.height) / bed.width + 8;
  const c = canvas(W, H);
  const k = c?.getContext('2d');
  if (!c || !k) return null;
  let x = -16 - hash(g.x0) * 40;
  let n = 0;
  while (x < W) {
    const r = hash(g.x0 + n * 7.3);
    const sc = 0.75 + 0.5 * hash(g.x0 + n * 3.1);
    const bw = bw0 * sc, bh = (bw * bed.height) / bed.width;
    k.save();
    k.translate(x + (r > 0.5 ? bw : 0), H - bh);
    k.scale(r > 0.5 ? -1 : 1, 1);
    // (a little lower or higher, never up at the lip)
    k.drawImage(bed, 0, hash(g.x0 + n) * 6, bw, bh);
    k.restore();
    // (spaced on, now and then with a gap of bare floor between)
    x += bw * (0.55 + 0.3 * hash(g.x0 + n * 5.7)) + (hash(g.x0 + n * 9.1) > 0.8 ? 26 : 0);
    n++;
  }
  return c;
}

/** the thorn bed's size in world px: each bramble's width (its height follows its picture) and how far its foot sinks under the floor's top */
export const THORN_BED = { long: 190, low: 150, sink: 12 } as const;
/**
 * a hollow's thorn bed, baked once: the two painted brambles side by side along the whole floor, overlapping, wall to wall (it hurts
 * anywhere, so no bare floor shows), their feet a little under the floor's top
 */
function bakeThorns(g: PitGap, long: HTMLImageElement, low: HTMLImageElement): HTMLCanvasElement | null {
  const W = g.x1 - g.x0 + 12;
  const H = Math.ceil((THORN_BED.long * 1.1 * long.height) / long.width) + 8;
  const c = canvas(W, H);
  const k = c?.getContext('2d');
  if (!c || !k) return null;
  let x = -10 - hash(g.x0) * 30;
  let n = 0;
  while (x < W) {
    const im = n % 2 === 0 ? long : low;
    const sc = 0.9 + 0.2 * hash(g.x0 + n * 3.1);
    const bw = (n % 2 === 0 ? THORN_BED.long : THORN_BED.low) * sc, bh = (bw * im.height) / im.width;
    const flip = hash(g.x0 + n * 7.3) > 0.5;
    k.save();
    k.translate(x + (flip ? bw : 0), H - bh);
    k.scale(flip ? -1 : 1, 1);
    k.drawImage(im, 0, 0, bw, bh);
    k.restore();
    x += bw * (0.58 + 0.12 * hash(g.x0 + n * 5.7));
    n++;
  }
  return c;
}

/** 1-8's gap, baked once: the foliage behind it going dark into black under the branch, its sides uneven, no band of haze */
const HIGH_SIDE = 44;
function bakeHigh(g: PitGap): HTMLCanvasElement | null {
  const SIDE = HIGH_SIDE;
  const W = g.x1 - g.x0 + 2 * SIDE, H = HIGH_DARK + 260;
  const c = canvas(W, H);
  const k = c?.getContext('2d');
  if (!c || !k) return null;
  for (let x = 0; x < W; x += 2) {
    const wx = g.x0 - SIDE + x;
    // (how far in from the gap's sides this column is. The understory under each section of branch is drawn after the scene and ends
    // square at the gap, so the darkness feathers in from inside the gap, unevenly, and meets that edge as a soft fade, not a cut line)
    const f = Math.min(SIDE, (g.x1 - g.x0) * 0.3);
    const inL = wx - g.x0 + 6 * wobble(wx, 1.3) - 3, inR = g.x1 - wx + 6 * wobble(wx, 4.1) - 3;
    const s0 = Math.max(0, Math.min(1, Math.min(inL, inR) / f)), side = s0 * s0 * (3 - 2 * s0);
    if (side <= 0) continue;
    const t = 6 + 12 * wobble(wx, 2.7);
    const m = k.createLinearGradient(0, t, 0, t + HIGH_DARK);
    // (front-loaded: the canopy below goes dark fast, so the hole reads as depth at once, then black)
    m.addColorStop(0, `rgba(4,6,4,${0.12 * side})`);
    m.addColorStop(0.2, `rgba(4,6,4,${0.5 * side})`);
    m.addColorStop(0.55, `rgba(4,6,4,${0.84 * side})`);
    m.addColorStop(1, `rgba(3,4,3,${0.97 * side})`);
    k.fillStyle = m;
    k.fillRect(x, 0, 2, t + HIGH_DARK);
    k.fillStyle = `rgba(3,4,3,${0.97 * side})`;
    k.fillRect(x, t + HIGH_DARK, 2, H - (t + HIGH_DARK));
  }
  return c;
}

/**
 * `layer`: 'under' is drawn before the ground (the drop in each pit, 1-8's darkness): the ground's own floor, soil steps and bank faces
 * then draw over it as they always did, so a step out of a pit is never hidden; 'over' after it (the lips, the leaf bed, the soil steps'
 * shade, 1-8's broken branch ends). Each pit's pictures are baked once into its own canvas: a frame draws one image per pit in view.
 */
export function drawW1Pits(ctx: CanvasRenderingContext2D, platforms: readonly Platform[], view: { x0: number; x1: number; y0?: number; y1?: number }, layer: 'under' | 'over', brokenEnd?: (ctx: CanvasRenderingContext2D, right: boolean, x: number, y: number, w: number, h: number) => boolean): boolean {
  if (!w1PitsReady()) return false;
  const drop = pic('drop')!, lip = pic('lip')!, bed = pic('bed')!;
  const chase = platforms.some((q) => (q as Platform & { chase?: boolean }).chase);
  const bottom = (view.y1 ?? 2000) + 40;
  const lw = PIT_SIZE.lipW, lh = (lw * lip.height) / lip.width;
  const lips = (g: PitGap) => {
    // (the torn lip at each bank of earth, its root column hanging into the pit over the wall's top: the left as painted, the right mirrored)
    if (g.lipL) ctx.drawImage(lip, g.x0 - lw * 0.62, g.top - 12, lw, lh);
    if (g.lipR) {
      ctx.save();
      ctx.translate(g.x1 + lw * 0.62, g.top - 12);
      ctx.scale(-1, 1);
      ctx.drawImage(lip, 0, 0, lw, lh);
      ctx.restore();
    }
  };
  /** clip out a pit's steps that are not soil: they are drawn before the ground (1-5's middle stump) and must stay in view */
  const clipOut = (g: PitGap, y0: number, y1: number) => {
    ctx.beginPath();
    ctx.rect(g.x0 - 8, y0, g.x1 - g.x0 + 16, y1 - y0);
    for (const [sx, sy, sw, sh, soil] of g.steps ?? []) if (!soil) ctx.rect(sx + sw, sy - 2, -sw, sh + 4);
    ctx.clip('evenodd');
  };
  const { gaps, bottom: stageBottom } = pitsOf(platforms);
  for (const g of gaps) {
    if (g.x1 < view.x0 - 100 || g.x0 > view.x1 + 100) continue;
    // (a drop the stage's water fills is the water's: engine.ts draws it)
    if (inWater(g)) continue;
    if (g.kind === 'hurt') {
      // (a hollow: the soft pit's dark inside from its lower lip to the hurt floor, under the ground; over it each bank's torn lip at
      // its own top and the thorn bed, painted, along the whole floor. Nothing is drawn for it until its pictures are in)
      if (g.floor === undefined || !w1ThornsReady()) continue;
      let h = baked.get(g);
      if (!h) baked.set(g, (h = { under: null, over: null, x: 0, y: 0, ox: 0, oy: 0 }));
      if (layer === 'under') {
        h.under ??= bakeSoft(g, drop);
        if (h.under) ctx.drawImage(h.under, g.x0, g.top);
        continue;
      }
      const [yl, yr] = g.walls ?? [g.top, g.top];
      if (g.lipL) ctx.drawImage(lip, g.x0 - lw * 0.62, yl - 12, lw, lh);
      if (g.lipR) {
        ctx.save();
        ctx.translate(g.x1 + lw * 0.62, yr - 12);
        ctx.scale(-1, 1);
        ctx.drawImage(lip, 0, 0, lw, lh);
        ctx.restore();
      }
      h.over ??= bakeThorns(g, pic('thornLong')!, pic('thornLow')!);
      if (h.over) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(g.x0 - 2, g.floor - h.over.height - 4, g.x1 - g.x0 + 4, h.over.height + 4 + THORN_BED.sink + 4);
        ctx.clip();
        ctx.drawImage(h.over, g.x0 - 6, g.floor + THORN_BED.sink - h.over.height);
        ctx.restore();
      }
      continue;
    }
    // (engine-core, 11-05: only a drop a builder marks, pit: 'drop', is painted here; on main only the mixer's stages mark any. The
    // R-6.38 look for the other World 1 stages' soft pits, unmarked falls and 1-8's chase holes is not live: those keep main's painting)
    if (!g.drop) continue;
    let b = baked.get(g);
    if (!b) baked.set(g, (b = { under: null, over: null, x: 0, y: 0, ox: 0, oy: 0 }));
    if (g.kind === 'fall') {
      if (chase) {
        if (layer === 'over') {
          // (over the ground: the understory under the branch is part of the ground's picture, so the darkness's feathered sides must
          // lie on it, or the hole's sides read as hard cut lines; the branch itself is drawn after the scene and stays on top)
          b.under ??= bakeHigh(g);
          if (b.under) ctx.drawImage(b.under, g.x0 - HIGH_SIDE, g.top);
          ctx.fillStyle = 'rgb(3,4,3)';
          if (bottom > g.top + HIGH_DARK + 260) ctx.fillRect(g.x0 + 4, g.top + HIGH_DARK + 260, g.x1 - g.x0 - 8, bottom - (g.top + HIGH_DARK + 260));
        }
        if (layer === 'over' && brokenEnd) {
          // (the branch's broken ends at the gap, from 1-8's own breaking-branch pieces: the left half's torn end, the right half's)
          const k = 0.6, eh = 123 * k;
          ctx.save();
          ctx.beginPath();
          ctx.rect(g.x0 - 4, g.top - 40, 40, 120);
          ctx.clip();
          brokenEnd(ctx, false, g.x0 - 259 * k + 24, g.top + 2 - 23 * k, 259 * k, eh);
          ctx.restore();
          ctx.save();
          ctx.beginPath();
          ctx.rect(g.x1 - 36, g.top - 40, 40, 120);
          ctx.clip();
          brokenEnd(ctx, true, g.x1 - 24, g.top + 2 - 29 * k, 225 * k, eh);
          ctx.restore();
        }
      } else if (g.drop && g.walls) {
        // (a drop a builder marked, pit: 'drop' on a bank, between two banks of earth: the soft pit's look, then near black on down,
        // inside the banks' faces (bakeDrop), and its lips. A marked drop with no walls is open air: nothing)
        if (layer === 'under') {
          if (b.drop === undefined) b.drop = bakeDrop(g, drop, stageBottom);
          const d = b.drop;
          if (d?.top) ctx.drawImage(d.top, d.x, g.top);
          if (d?.deep && bottom > g.top + DROP_DARK) ctx.drawImage(d.deep, d.x, g.top + DROP_DARK, d.deep.width / DEEP_SCALE, d.deep.height / DEEP_SCALE);
        } else lips(g);
      }
      // (an unmarked floorless gap is water, which Dot warns of by name on 1-6: it keeps its painted water)
      continue;
    }
    if (g.floor === undefined) continue;
    if (layer === 'under') {
      b.under ??= bakeSoft(g, drop);
      ctx.save();
      clipOut(g, g.top, g.floor + 12);
      if (b.under) ctx.drawImage(b.under, g.x0, g.top);
      ctx.restore();
      continue;
    }
    // over the ground: the soil steps in the pit's shade (they are painted with the banks' soil, lit, and read as a pasted box), the
    // lips, the bed
    for (const [sx, sy, sw, sh, soil] of g.steps ?? []) {
      if (!soil) continue;
      ctx.fillStyle = 'rgba(10,7,5,0.5)';
      ctx.fillRect(sx, sy + 6, sw, sh - 6);
    }
    lips(g);
    b.over ??= bakeBed(g, bed);
    if (b.over) {
      ctx.save();
      clipOut(g, g.floor - b.over.height - 4, g.floor + 16);
      ctx.drawImage(b.over, g.x0 - 6, g.floor + 14 - b.over.height);
      ctx.restore();
    }
  }
  return true;
}
