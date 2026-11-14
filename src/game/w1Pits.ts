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
import { drawEnd, drawLip, endFace } from './groundPaint.ts';
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
 * The stage's pits, from its platforms: its open pits (findOpenPits: each gap judged by its own lips; ground is earth only), a soft pit
 * when a floor lies SOFT_FLOOR to FALL_BELOW px under the gap's line (1-3's, 130), else a fall; a sunk step (75 px) is not a pit; and its
 * hollows (hurtPits). 1-8's long branch has no ground: its gaps are the holes between the chase's sections (and the branches beside them),
 * all falls.
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
/**
 * The stage's open pits, each judged by its OWN lips, never by one ground line read off the whole stage (the lead's rulings 11-13, 3:21,
 * 3:27 and 8:50 PM ET; R-165.197/.200: the ruler read the commonest top of the stage's banks, so a bank laid 5,000 px away moved what a gap
 * here was, and gaps away from that line went unseen). Ground is earth only: a piece EARTH_DEEP px deep or more (a bank, a stump, a pillar);
 * a log or a bough is a platform over a gap, never its lip, and never its floor. The earth's top along x (`earthLine`) has holes, where
 * no earth is at all, and dips, where it drops deeper than SOFT_BELOW and comes back up. A gap is a hole between two banks at any width
 * from 24 px, or a dip. Its line is read off its two lips (`gapLine`); from that line a dip lies more than SOFT_BELOW down, its floor is
 * the earth SOFT_BELOW to FALL_BELOW down, and a soft pit's floor is SOFT_FLOOR down or more. `top` is the lower lip, where its inside begins.
 */
function findOpenPits(platforms: readonly Platform[]): PitGap[] {
  const chase = platforms.filter((q) => (q as Platform & { chase?: boolean }).chase && !q.broken);
  if (chase.length) return chaseGaps(platforms, chase);
  const earth = platforms.filter((q) => q.height >= EARTH_DEEP && floorish(q));
  if (!earth.length) return [];
  const line = earthLine(earth);
  const out: PitGap[] = [];
  const judge = (x0: number, x1: number, yl: number, yr: number, inside: readonly EarthRun[]) => {
    const g = gapLine(yl, yr);
    // (a dip's inside lies deeper than SOFT_BELOW under its line, all of it: else it is a step in the ground, not a gap)
    if (inside.some((s) => s.y <= g + SOFT_BELOW)) return;
    const top = Math.max(yl, yr);
    const marked = earth.some((q) => q.pit === 'drop' && (Math.abs(q.x + q.width - x0) < 3 || Math.abs(q.x - x1) < 3));
    const fall = () => {
      const walls = marked ? pitWalls(platforms, x0, x1, top) : undefined;
      out.push({ x0, x1, top, kind: 'fall', lipL: true, lipR: true, ...(marked ? { drop: true } : {}), ...(walls ? { walls } : {}) });
    };
    // (its floor: the earth under it, SOFT_BELOW to FALL_BELOW under its line; a hole has none, so it is a fall)
    const fl = earth.filter((q) => q.y > g + SOFT_BELOW && q.y <= g + FALL_BELOW && q.x < x1 - 4 && q.x + q.width > x0 + 4);
    if (!fl.length) return fall();
    // (the floor is the piece under most of the gap: the soil steps at a soft pit's walls are its way out, not its floor)
    // (and a sunk step's own floor, under all of it, is its floor even with deeper ground below: the highest piece under most of it)
    const ov = (q: Platform) => Math.min(x1, q.x + q.width) - Math.max(x0, q.x);
    const most = fl.filter((q) => ov(q) >= 0.7 * (x1 - x0));
    const floorQ = most.length ? most.reduce((a, b) => (b.y < a.y ? b : a)) : [...fl].sort((p, q) => ov(q) - ov(p))[0];
    const floor = floorQ.y;
    // (a soft pit is a hole in the ground: a bank of earth at both lips, its walls, and its floor ending at them (World 1's vault pits:
    // within 60 px past each wall). A floor that runs on far under a lip is a lower road and the gap open air over it: a fork's high road
    // over its low road. It is judged as a fall: a marked drop, or open air)
    // (and a slit narrower than his body is no pit: he cannot fall into it (Easy's wider landings left 40 px between two banks))
    const lower = x1 - x0 < HERO_BODY || x0 - floorQ.x > SOFT_RUN_ON || floorQ.x + floorQ.width - x1 > SOFT_RUN_ON;
    // (only what would be a soft pit: a floor nearer than SOFT_FLOOR is a sunk step, no gap at all)
    if (floor - g < SOFT_FLOOR) return;
    if (lower) return fall();
    // (the steps out, and anything else standing in it: x, y, w, h)
    const steps = platforms.filter((q) => !q.broken && q.type !== 'fragile' && q.x < x1 && q.x + q.width > x0 && q.y > top + 4 && q.y < floor - 4).map((q) => [q.x, q.y, q.width, q.height, !!q.soil] as [number, number, number, number, boolean]);
    out.push({ x0, x1, top, kind: 'soft', floor, lipL: true, lipR: true, steps });
  };
  for (let i = 0; i + 1 < line.length; i++) {
    const a = line[i], b = line[i + 1];
    // (a hole: no earth at all between two banks, at any width from 24 px)
    if (b.x0 > a.x1) {
      if (b.x0 - a.x1 >= 24) judge(a.x1, b.x0, a.y, b.y, []);
      continue;
    }
    // (a dip: the earth drops more than SOFT_BELOW; its far wall is the first top back within SOFT_BELOW of a's, or one that rises more
    // than SOFT_BELOW out of it; a hole on the way is its own gap)
    if (b.y <= a.y + SOFT_BELOW) continue;
    for (let j = i + 2; j < line.length; j++) {
      const c = line[j], p = line[j - 1];
      if (c.x0 > p.x1) break;
      if (c.y <= a.y + SOFT_BELOW || c.y < p.y - SOFT_BELOW) {
        if (c.x0 - a.x1 >= 24) judge(a.x1, c.x0, a.y, c.y, line.slice(i + 1, j));
        break;
      }
    }
  }
  return out.sort((p, q) => p.x0 - q.x0);
}
/** a piece this deep or more is earth (a bank, a stump, a pillar): only earth is ground, a gap's lip or its floor */
const EARTH_DEEP = 90;
/** a stretch of the earth's top: x0..x1 at y */
interface EarthRun { x0: number; x1: number; y: number }
/**
 * the earth's top along x: at each x the highest earth there, in runs at one height; where no earth is at all, a hole (two runs closer
 * than 2 px are one ground, as the ruler always read them)
 */
function earthLine(earth: readonly Platform[]): EarthRun[] {
  const xs = [...new Set(earth.flatMap((q) => [q.x, q.x + q.width]))].sort((a, b) => a - b);
  const runs: EarthRun[] = [];
  for (let k = 0; k + 1 < xs.length; k++) {
    const x0 = xs[k], x1 = xs[k + 1], mid = (x0 + x1) / 2;
    let y = Infinity;
    for (const q of earth) if (q.x < mid && q.x + q.width > mid && q.y < y) y = q.y;
    if (y === Infinity) continue;
    const r = runs[runs.length - 1];
    if (r && x0 - r.x1 <= 2 && Math.abs(r.y - y) < 0.5) r.x1 = x1;
    else if (r && x0 - r.x1 <= 2) runs.push({ x0: r.x1, x1, y });
    else runs.push({ x0, x1, y });
  }
  return runs;
}
/**
 * a gap's line, from its two lips: the higher when the lower lies within SOFT_BELOW of it (one ground, the lower lip sunk in it, as the
 * ground band always read it), else the lower (the higher a stump, a pillar or a raised bank over it: its top is not the ground the gap
 * is cut in)
 */
export const gapLine = (yl: number, yr: number) => (Math.abs(yl - yr) <= SOFT_BELOW ? Math.min(yl, yr) : Math.max(yl, yr));

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
const cache = new WeakMap<readonly Platform[], { gaps: PitGap[]; bottom: number; hurt: boolean }>();
/** the stage's pits, and how far down its pieces reach (a drop is baked to there and a little more: below it the camera never looks) */
const pitsOf = (platforms: readonly Platform[]) => {
  let v = cache.get(platforms);
  if (!v) {
    const gaps = findW1Pits(platforms);
    cache.set(platforms, (v = { gaps, bottom: Math.max(0, ...platforms.map((q) => q.y + q.height)) + DROP_BELOW, hurt: gaps.some((g) => g.kind === 'hurt') }));
  }
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

interface Baked { under: HTMLCanvasElement | null; over: HTMLCanvasElement | null; x: number; y: number; ox: number; oy: number; drop?: ReturnType<typeof bakeDrop>; hollow?: { c: HTMLCanvasElement; x: number; y: number } }
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

/** the thorn bed's size in world px: each bramble's width (its height follows its picture) and how far its foot sinks under the floor's
 *  top (the hurt floor's own slab is never seen: the hollow's inside runs HOLLOW_FOOT under its top and the bed stands over that) */
export const THORN_BED = { long: 210, low: 170, sink: 34 } as const;
/**
 * a hollow's torn lips, scaled to its width: each hangs LIP_IN of its own width into the pit, so over a hollow narrower than two full
 * lips (84 px each) they met and read as one column of roots, not a hole (EN-W's Rough 1, Matt's 11-11). Each now hangs in at most
 * HOLLOW_LIP_SHARE of the hollow's width, and never shrinks below HOLLOW_LIP_MIN wide
 */
export const LIP_IN = 0.38;
export const HOLLOW_LIP_SHARE = 0.25;
export const HOLLOW_LIP_MIN = 30;
export const hollowLipWidth = (g: Pick<PitGap, 'x0' | 'x1'>) => Math.max(HOLLOW_LIP_MIN, Math.min(PIT_SIZE.lipW, ((g.x1 - g.x0) * HOLLOW_LIP_SHARE) / LIP_IN));
/**
 * A hollow is a hole in the ground with two walls (the lead 11-12: its inside read as a soft dark rectangle pasted on the dirt). Each
 * wall is its bank's own painted end face (groundPaint.ts endFace: the line drawBankArt cuts an open bank end to, World 1's end piece),
 * the right one set HOLLOW_FACE_LIFT up its piece, so the two sides are not one mirrored picture. A wall stands at most HOLLOW_JUT into
 * the hollow (Pokey falls through what he sees) and goes back at most HOLLOW_BACK into its bank, and both round into the floor over
 * HOLLOW_FOOT under the hurt floor's top, so the hole has a bottom and no corners
 */
export const HOLLOW_JUT = 8;
export const HOLLOW_BACK = 24;
export const HOLLOW_FOOT = 16;
export const HOLLOW_FACE_LIFT = 38;
/** the end piece is drawn this narrow at a hollow's wall (its face's swings scaled with it), so its face fits the bounds and is never cut */
export const HOLLOW_FACE_SCALE = 0.6;
/** the rows (px) a wall's picture is moved in, each onto the wall's line at its middle */
const HOLLOW_ROW = 3;
/** how far into its bank a wall's painted face is shown (px), fading out into the bank's soil over the inner half */
export const HOLLOW_BAND = 28;
const faceX = (pts: ReadonlyArray<[number, number]>, y: number) => {
  for (let i = 1; i < pts.length; i++) {
    if (pts[i][1] >= y) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      return y1 === y0 ? x1 : x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
    }
  }
  return pts[pts.length - 1][0];
};
/**
 * how far up its piece the right wall's face is drawn: HOLLOW_FACE_LIFT, and as much again as the right lip lies under the left, so the two
 * faces are never at the same height of the piece (a step down of HOLLOW_FACE_LIFT drew one mirrored picture, 1-2's dip: RF3)
 */
export const hollowFaceLift = (g: Pick<PitGap, 'top' | 'walls'>) => {
  const [yl, yr] = g.walls ?? [g.top, g.top];
  return HOLLOW_FACE_LIFT + Math.max(0, yr - yl);
};
/** where a wall's painted face may lie above the hollow's top (a taller bank's side over the lower lip): out past its bank's closed side
 *  (protoArt.ts sideOverHollow: its soil ends in a straight cut there), so the face is the edge seen against the air, never that cut */
export const HOLLOW_PROUD: readonly [number, number] = [-HOLLOW_JUT + 0.5, -1];
/** where it may lie inside the hollow: HOLLOW_JUT into it to HOLLOW_BACK into its bank, never held on either bound */
export const HOLLOW_IN: readonly [number, number] = [-HOLLOW_JUT + 0.5, HOLLOW_BACK - 0.5];
/** over this many px each side of the hollow's top a taller wall's face goes from the one fit to the other */
const HOLLOW_BLEND = 16;
/** the span (px) a wall face's slow drift is taken over: what is narrowed to fit; its swings within it are kept */
const HOLLOW_DRIFT = 61;
interface WallLine { top: number; line: Float32Array; face: Float32Array }
const wallCache = new WeakMap<object, { l: WallLine | null; r: WallLine | null }>();
/**
 * a wall's line, one value a px from its own lip's top down to past the foot: its bank's painted end face (drawn HOLLOW_FACE_SCALE
 * narrow), fitted between the bounds by moving and narrowing it (one straight-line fit over each part, so the face keeps its shape), never
 * by holding it on a bound: a held face ran as a straight cut (1-2's stair, RF3). `face` is the picture's own face at each px: the bake
 * draws each row of the picture moved by line - face, so its painted edge is the line
 */
function wallLine(g: PitGap, right: boolean): WallLine | null {
  if (!(right ? g.lipR : g.lipL)) return null;
  const [yl, yr] = g.walls ?? [g.top, g.top];
  const top = Math.floor(right ? yr : yl), foot = (g.floor ?? g.top + 150) + HOLLOW_FOOT, edge = right ? g.x1 : g.x0, d = right ? 1 : -1;
  const pts = endFace(1, edge, right ? yr - hollowFaceLift(g) : yl, foot + 40, !right).map(([px, py]): [number, number] => [edge + (px - edge) * HOLLOW_FACE_SCALE, py]);
  const n = Math.ceil(foot + 2 - top) + 1;
  const face = new Float32Array(n), u = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    face[i] = faceX(pts, top + i);
    u[i] = d * (face[i] - edge);
  }
  // (each part's fit: the face's slow drift (its mean over HOLLOW_DRIFT px) moved and narrowed into the part's bounds, its own swings on it
  // kept at their size (narrowed only past a third of the bounds), so the wall keeps the painted face's shape: the part above the hollow's
  // top (a taller bank's side) into HOLLOW_PROUD, the part in it into HOLLOW_IN)
  const base = new Float32Array(n), R = HOLLOW_DRIFT >> 1;
  for (let i = 0; i < n; i++) {
    let t = 0;
    for (let j = i - R; j <= i + R; j++) t += u[Math.max(0, Math.min(n - 1, j))];
    base[i] = t / (2 * R + 1);
  }
  const fit = (i0: number, i1: number, [lo, hi]: readonly [number, number]) => {
    let a = Infinity, b = -Infinity, amp = 0;
    let fits = true;
    // (judged down to the floor's top: under it the wall rounds into the floor and the thorns stand over it)
    for (let i = Math.max(0, i0); i < Math.min(n, i1, Math.ceil((g.floor ?? g.top + 150) - top) + 1); i++) {
      a = Math.min(a, base[i]); b = Math.max(b, base[i]); amp = Math.max(amp, Math.abs(u[i] - base[i]));
      fits &&= u[i] > lo && u[i] < hi;
    }
    // (a face that fits as it is stays as it is)
    if (fits) return (i: number) => u[i];
    if (a > b) return (i: number) => u[i];
    const kd = Math.min(1, (hi - lo) / 3 / Math.max(amp, 1e-6)), l2 = lo + kd * amp, h2 = hi - kd * amp;
    const k = b - a > h2 - l2 ? (h2 - l2) / (b - a) : 1;
    const shift = k * a < l2 ? l2 - k * a : k * b > h2 ? h2 - k * b : 0;
    return (i: number) => Math.max(lo, Math.min(hi, k * base[i] + shift + kd * (u[i] - base[i])));
  };
  const split = Math.round(g.top - top);
  const inside = fit(split, n, HOLLOW_IN), above = split > 0 ? fit(0, split, HOLLOW_PROUD) : inside;
  const line = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    // (the blend runs in under the top: above it nothing may carry the face back behind the bank's cut)
    const t = split > 0 ? Math.min(1, Math.max(0, (i - split) / (2 * HOLLOW_BLEND))) : 1, s = t * t * (3 - 2 * t);
    const v = i < split ? above(i) : Math.max(HOLLOW_IN[0], Math.min(HOLLOW_IN[1], above(i) * (1 - s) + inside(i) * s));
    line[i] = edge + d * v;
  }
  return { top, line, face };
}
const linesOf = (g: PitGap) => {
  let f = wallCache.get(g);
  if (!f) wallCache.set(g, (f = { l: wallLine(g, false), r: wallLine(g, true) }));
  return f;
};
const lineAt = (w: WallLine, y: number, of: 'line' | 'face' = 'line') => {
  const a = w[of], i = Math.max(0, Math.min(a.length - 1, y - w.top)), i0 = Math.floor(i), i1 = Math.min(a.length - 1, i0 + 1);
  return a[i0] + (a[i1] - a[i0]) * (i - i0);
};
/**
 * a hollow's wall at height y: [left x, right x] (world px): its banks' end faces fitted inside the bounds, rounded into its floor. Above
 * the hollow's top only a taller bank's wall has a line (its side over the lower lip); the other side is its lip's own end there
 */
export const hollowWalls = (g: PitGap, y: number): [number, number] => {
  const f = linesOf(g);
  let a = f.l ? lineAt(f.l, y) : g.x0;
  let b = f.r ? lineAt(f.r, y) : g.x1;
  const foot = (g.floor ?? g.top + 150) + HOLLOW_FOOT, r = Math.max(4, Math.min(40, (b - a) / 2 - 2));
  if (y > foot - r) {
    const d = Math.min(r, y - (foot - r)), inset = r - Math.sqrt(Math.max(0, r * r - d * d));
    a += inset;
    b -= inset;
  }
  return [a, b];
};
/** how far the wall's painted picture is moved at height y so its face lies on the wall's line (0 where the face fits as it is) */
export const hollowWallShift = (g: PitGap, side: 0 | 1, y: number) => {
  const w = linesOf(g)[side ? 'r' : 'l'];
  return w ? lineAt(w, y) - lineAt(w, y, 'face') : 0;
};
/** everything a hollow paints darker than its banks' soil lies in this span (world x): its widest walls */
export const hollowSpan = (g: PitGap): [number, number] => {
  let a = Infinity, b = -Infinity;
  for (let y = g.top; y <= (g.floor ?? g.top + 150) + HOLLOW_FOOT; y += 2) {
    const [l, r] = hollowWalls(g, y);
    a = Math.min(a, l);
    b = Math.max(b, r);
  }
  return [a, b];
};
/**
 * is bank p's side next to a hollow's hurt floor (a lower piece gen2 marks pit 'hurt' meeting it)? The ground painter closes that side
 * (protoArt.ts drawGround): the hollow's inside is drawn over it here
 */
export const sideOverHollow = (p: Platform, banks: readonly Platform[], side: 'l' | 'r') => banks.some((q) => q !== p && q.pit === 'hurt' && q.y > p.y + 2 && (side === 'l' ? Math.abs(q.x + q.width - p.x) < 2 : Math.abs(p.x + p.width - q.x) < 2));
/** the lip picture with its foot faded out, for a hollow (baked once): its column's flat foot hung in the pit's dark as a hard line */
let fadedLip: HTMLCanvasElement | null | undefined;
function lipFaded(lip: HTMLImageElement): HTMLCanvasElement | HTMLImageElement {
  if (fadedLip === undefined) {
    fadedLip = canvas(lip.width, lip.height);
    const k = fadedLip?.getContext('2d');
    if (fadedLip && k) {
      k.drawImage(lip, 0, 0);
      k.globalCompositeOperation = 'destination-out';
      const f = k.createLinearGradient(0, lip.height * 0.55, 0, lip.height);
      f.addColorStop(0, 'rgba(0,0,0,0)');
      f.addColorStop(1, 'rgba(0,0,0,1)');
      k.fillStyle = f;
      k.fillRect(0, lip.height * 0.55, lip.width, lip.height * 0.45);
    }
  }
  return fadedLip ?? lip;
}
/** the painted brambles lifted off the dark they lie in (EN-W's Rough 4: brown thorns on dark earth were hard to see on a phone) */
export const THORN_LIFT = 'brightness(1.5) contrast(1.12) saturate(1.15)';
/** the thorn bed's brambles span (world x): between the hollow's walls at the floor's top, never past them */
export const thornBedSpan = (g: PitGap): [number, number] => {
  const [a, b] = hollowWalls(g, (g.floor ?? g.top + 150) - 10), [s0, s1] = hollowSpan(g);
  return [Math.max(a, s0), Math.min(b, s1)];
};
/** the two brambles with THORN_LIFT applied, made once (a canvas filter per hollow cost milliseconds on its first frame) */
let lifted: { long: HTMLCanvasElement | HTMLImageElement; low: HTMLCanvasElement | HTMLImageElement } | undefined;
const liftOnce = (im: HTMLImageElement): HTMLCanvasElement | HTMLImageElement => {
  const c = canvas(im.width, im.height), k = c?.getContext('2d');
  if (!c || !k) return im;
  k.filter = THORN_LIFT;
  k.drawImage(im, 0, 0);
  k.filter = 'none';
  return c;
};
/**
 * a hollow's thorn bed, baked once: the two painted brambles side by side along the whole floor, overlapping, wall to wall (it hurts
 * anywhere, so no bare floor shows), their feet sunk into the floor and fading into it. No dark of their own: the hollow's inside is
 * darkest at its floor (bakeHollow), and the old shade under them read as a square patch (the lead 11-12)
 */
function bakeThorns(g: PitGap, longPic: HTMLImageElement, lowPic: HTMLImageElement): HTMLCanvasElement | null {
  lifted ??= { long: liftOnce(longPic), low: liftOnce(lowPic) };
  const { long, low } = lifted;
  const [S0, S1] = hollowSpan(g), X0 = Math.floor(S0), W = Math.ceil(S1 - X0) + 2;
  const tall = Math.ceil((THORN_BED.long * 1.1 * long.height) / long.width) + 8;
  const H = tall;
  const c = canvas(W, H);
  const k = c?.getContext('2d');
  if (!c || !k) return null;
  // (the canvas's foot is THORN_BED.sink under the floor's top; the brambles stand between the hollow's own walls)
  const oy = (g.floor ?? 0) + THORN_BED.sink - H, ox = X0;
  k.save();
  k.beginPath();
  for (let y = 0; y <= H; y += 4) (y ? k.lineTo : k.moveTo).call(k, hollowWalls(g, Math.min(y + oy, (g.floor ?? 0) - 10))[0] - ox, y);
  for (let y = H - (H % 4); y >= 0; y -= 4) k.lineTo(hollowWalls(g, Math.min(y + oy, (g.floor ?? 0) - 10))[1] - ox, y);
  k.closePath();
  k.clip();
  const [s0, s1] = thornBedSpan(g);
  let x = s0 - ox - 16 - hash(g.x0) * 30;
  let n = 0;
  while (x < s1 - ox) {
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
  k.restore();
  // (their feet go into the floor: faded out over the sunk part, never a cut line)
  k.globalCompositeOperation = 'destination-out';
  const f = k.createLinearGradient(0, H - THORN_BED.sink - 6, 0, H);
  f.addColorStop(0, 'rgba(0,0,0,0)');
  f.addColorStop(1, 'rgba(0,0,0,1)');
  k.fillStyle = f;
  k.fillRect(0, H - THORN_BED.sink - 6, W, THORN_BED.sink + 6);
  k.globalCompositeOperation = 'source-over';
  return c;
}

/**
 * World 1's bank end piece and grass lip (groundPaint.ts drawEnd, drawLip) and the pit's drop picture, each copied once into a small canvas
 * of its own: read from the 2048 px ground sheet into every hollow's small bake canvas they cost about 2 ms a hollow on its first frame.
 * The end piece is a right end with its walking line at (PIECE_AT[0], PIECE_AT[1]); the lip's walking line is at PIECE_AT[1]
 */
const PIECE_AT = [300, 40] as const;
let pieces: { end: HTMLCanvasElement; lip: HTMLCanvasElement; drop: HTMLCanvasElement } | undefined;
function hollowPieces(drop: HTMLImageElement) {
  if (pieces) return pieces;
  const end = canvas(420, 360), lip = canvas(700, 160), dc = canvas(drop.width, drop.height);
  const ek = end?.getContext('2d'), lk = lip?.getContext('2d'), dk = dc?.getContext('2d');
  if (!end || !lip || !dc || !ek || !lk || !dk) return undefined;
  if (!drawEnd(ek, 1, PIECE_AT[0], PIECE_AT[1], true) || !drawLip(lk, 1, 0, 700, PIECE_AT[1])) return undefined;
  dk.drawImage(drop, 0, 0);
  return (pieces = { end, lip, drop: dc });
}

/**
 * a hollow, baked once and drawn over the ground (its banks' sides over it are closed: protoArt.ts drawGround overHollow):
 *   - its back: the pit's drop picture (dark earth and roots) between its walls, from its far grass rim (World 1's ground lip, dimmed)
 *     down to its rounded floor, going darker with depth and in the walls' shadow, so it is a hole, not a patch;
 *   - its two walls: World 1's bank end piece (groundPaint.ts drawEnd) at each bank's end face, shown HOLLOW_BAND into the bank and
 *     fading into its soil, shaded toward the bottom.
 * Returns the canvas and its world top-left; null while the ground's sheet is not in (tried again next frame)
 */
function bakeHollow(g: PitGap, drop: HTMLImageElement): { c: HTMLCanvasElement; x: number; y: number } | null {
  const [yl, yr] = g.walls ?? [g.top, g.top];
  const floor = g.floor ?? g.top + 150, foot = floor + HOLLOW_FOOT;
  const X0 = Math.floor(g.x0 - HOLLOW_BACK - HOLLOW_BAND), X1 = Math.ceil(g.x1 + HOLLOW_BACK + HOLLOW_BAND);
  const Y0 = Math.floor(Math.min(yl, yr) - 40), Y1 = Math.ceil(foot + 2);
  const W = X1 - X0, H = Y1 - Y0;
  const pc = hollowPieces(drop);
  if (!pc) return null;
  const c = canvas(W, H), t = canvas(W, H), m = canvas(W, H);
  const k = c?.getContext('2d'), tk = t?.getContext('2d'), mk = m?.getContext('2d');
  if (!c || !t || !m || !k || !tk || !mk) return null;
  const ys: number[] = [];
  for (let y = g.top; y < foot; y += 3) ys.push(y);
  ys.push(foot);
  // (the back runs on under a wall that stands out into the hollow, to its bank's cut: the painted face's own edge is soft and lies a px or
  // two inside its line, and with nothing under it the sky showed through there as a light sliver, RF3)
  const under = (y: number): [number, number] => {
    const [a, b] = hollowWalls(g, y), k = Math.min(1, Math.max(0, (foot - 40 - y) / 20));
    // (and eases off above the floor's rounding, which keeps its shape)
    return [g.lipL ? a - k * Math.max(0, a - (g.x0 - 1)) : a, g.lipR ? b + k * Math.max(0, g.x1 + 1 - b) : b];
  };
  const outline = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ys.forEach((y, i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, under(y)[0] - X0, y - Y0));
    for (let i = ys.length - 1; i >= 0; i--) ctx.lineTo(under(ys[i])[1] - X0, ys[i] - Y0);
    ctx.closePath();
  };
  // ── its back ──
  k.save();
  outline(k);
  k.clip();
  const tw = PIT_SIZE.dropTile, th = (tw * drop.height) / drop.width;
  for (let x = Math.floor(X0 / tw) * tw; x < X1; x += tw) for (let y = g.top - 8; y < Y1; y += th) k.drawImage(pc.drop, x - X0, y - Y0, tw, th);
  // (darker with depth, softly: a hole's back gets less light the further down it is)
  const v = k.createLinearGradient(0, g.top - Y0, 0, foot - Y0);
  v.addColorStop(0, 'rgba(12,8,6,0.38)');
  v.addColorStop(0.55, 'rgba(10,7,5,0.66)');
  v.addColorStop(1, 'rgba(8,5,4,0.86)');
  k.fillStyle = v;
  k.fillRect(0, g.top - Y0, W, foot - g.top);
  // (each wall casts its shade on the back, following the wall: a band along it, one gradient from its mean line)
  const along = (side: 0 | 1, depth: number, ctx: CanvasRenderingContext2D, y0: number, at: (y: number) => number) => {
    const rows: number[] = [];
    for (let y = y0; y < foot; y += 3) rows.push(y);
    rows.push(foot);
    const d = side === 0 ? 1 : -1;
    ctx.beginPath();
    rows.forEach((y, i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, at(y) - X0, y - Y0));
    for (let i = rows.length - 1; i >= 0; i--) ctx.lineTo(at(rows[i]) + d * depth - X0, rows[i] - Y0);
    ctx.closePath();
    return rows.reduce((m, y) => m + at(y), 0) / rows.length;
  };
  for (const side of [0, 1] as const) {
    const sw = Math.min(18, (g.x1 - g.x0) / 3), d = side === 0 ? 1 : -1;
    const mx = along(side, sw, k, g.top, (y) => hollowWalls(g, y)[side]);
    const hg = k.createLinearGradient(mx - X0 - d * 4, 0, mx + d * sw - X0, 0);
    hg.addColorStop(0, 'rgba(6,4,3,0.6)');
    hg.addColorStop(1, 'rgba(6,4,3,0)');
    k.fillStyle = hg;
    k.fill();
  }
  // (its far rim: World 1's own grass lip across the opening, dimmed, so the eye reads the ground going on behind the hole)
  tk.drawImage(pc.lip, g.x0 - 40 - Math.floor(hash(g.x0) * 300) - X0, g.top + 4 - PIECE_AT[1] - Y0);
  tk.globalCompositeOperation = 'source-atop';
  tk.fillStyle = 'rgba(14,16,10,0.5)';
  tk.fillRect(0, 0, W, H);
  tk.globalCompositeOperation = 'source-over';
  k.drawImage(t, 0, 0);
  k.restore();
  tk.clearRect(0, 0, W, H);
  // ── its walls ──
  // (each drawn HOLLOW_FACE_SCALE narrow about its bank's end, as its face is in hollowWalls, then moved row by row onto the wall's line
  // (hollowWallShift): its painted edge is the wall, at every height, with nothing held straight on a bound)
  const end = (x: number, y: number, right: boolean) => {
    mk.save();
    mk.translate(x - X0, -Y0);
    mk.scale(right ? HOLLOW_FACE_SCALE : -HOLLOW_FACE_SCALE, 1);
    mk.drawImage(pc.end, -PIECE_AT[0], y - PIECE_AT[1]);
    mk.restore();
  };
  for (const [side, on, top] of [[0, g.lipL, yl], [1, g.lipR, yr]] as const) {
    if (!on) continue;
    mk.clearRect(0, 0, W, H);
    if (side === 0) end(g.x0, yl, true);
    else end(g.x1, yr - hollowFaceLift(g), false);
    for (let y = Math.floor(top); y < Y1; y += HOLLOW_ROW) tk.drawImage(m, 0, y - Y0, W, HOLLOW_ROW, hollowWallShift(g, side, y + HOLLOW_ROW / 2), y - Y0, W, HOLLOW_ROW);
  }
  mk.clearRect(0, 0, W, H);
  // (shown from just under each bank's own top (its torn lip covers the corner) down to the floor, HOLLOW_BAND into the bank, fading
  // into its soil over the band's inner half; a side with no bank of earth has no painted wall)
  for (const [side, on, top] of [[0, g.lipL, yl], [1, g.lipR, yr]] as const) {
    if (!on) continue;
    const d = side === 0 ? -1 : 1, y0 = Math.floor(top + 4);
    const mx = along(side, -HOLLOW_BAND, mk, y0, (y) => hollowWalls(g, y)[side]);
    // (the band's polygon: from the wall's own line HOLLOW_BAND into the bank; it fades into the soil from its mean line)
    const hg = mk.createLinearGradient(mx + d * HOLLOW_BAND - X0, 0, mx + d * HOLLOW_BAND * 0.3 - X0, 0);
    hg.addColorStop(0, 'rgba(0,0,0,0)');
    hg.addColorStop(1, 'rgba(0,0,0,1)');
    mk.fillStyle = hg;
    mk.fill();
    // (in under its torn lip at the top, out into the floor at the foot)
    mk.globalCompositeOperation = 'destination-out';
    const vg = mk.createLinearGradient(0, y0 - Y0, 0, foot - Y0);
    const span = Math.max(1, foot - y0);
    vg.addColorStop(0, 'rgba(0,0,0,1)');
    vg.addColorStop(Math.min(0.5, 10 / span), 'rgba(0,0,0,0)');
    vg.addColorStop(Math.max(0.5, 1 - 10 / span), 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,1)');
    mk.fillStyle = vg;
    mk.fillRect(mx + Math.min(0, d * HOLLOW_BAND) - X0 - 30, y0 - Y0, HOLLOW_BAND + 60, foot - y0);
    mk.globalCompositeOperation = 'source-over';
  }
  tk.globalCompositeOperation = 'destination-in';
  tk.drawImage(m, 0, 0);
  // (shaded toward the bottom: the walls fall into the hole's dark)
  tk.globalCompositeOperation = 'source-atop';
  // (a taller bank's side above the hollow's top stands in the open, lit as its soil: it darkens from its own top to the hollow's)
  const hi = Math.min(yl, yr), sv = tk.createLinearGradient(0, hi - Y0, 0, foot - Y0);
  if (hi < g.top - 1) sv.addColorStop(0, 'rgba(10,7,5,0)');
  sv.addColorStop((g.top - hi) / (foot - hi), 'rgba(10,7,5,0.22)');
  sv.addColorStop(1, 'rgba(10,7,5,0.66)');
  tk.fillStyle = sv;
  tk.fillRect(0, 0, W, H);
  tk.globalCompositeOperation = 'source-over';
  k.drawImage(t, 0, 0);
  return { c, x: X0, y: Y0 };
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
  const { gaps, bottom: stageBottom, hurt } = pitsOf(platforms);
  // (a stage with a hollow starts its thorn pictures loading on its first frame, not when the first hollow comes into view: until they
  // were in, the hollow showed its bare hurt-floor slab, a grey-green box, EN-W's "not wired")
  if (hurt) w1ThornsReady();
  // (a hollow's two bakes cost a few ms on a phone: the stage's hollows are baked one a frame from its first frames, the nearest first,
  // so each is ready long before it comes into view and no frame of play bakes more than one; one in view and not yet baked is baked
  // at once, PERFORMANCE-RULES §1)
  const bakeHurt = (g: PitGap, h: Baked) => {
    if (!h.hollow) h.hollow = bakeHollow(g, pic('drop')!) ?? undefined;
    if (!h.over) {
      h.ox = Math.floor(hollowSpan(g)[0]);
      h.over = bakeThorns(g, pic('thornLong')!, pic('thornLow')!);
    }
  };
  if (hurt && layer === 'over' && w1ThornsReady()) {
    const mid = (view.x0 + view.x1) / 2;
    let next: PitGap | undefined;
    for (const g of gaps) {
      if (g.kind !== 'hurt' || g.floor === undefined || inWater(g)) continue;
      const h = baked.get(g);
      if (h?.hollow && h.over) continue;
      if (!next || Math.abs(g.x0 - mid) < Math.abs(next.x0 - mid)) next = g;
    }
    if (next) {
      let h = baked.get(next);
      if (!h) baked.set(next, (h = { under: null, over: null, x: 0, y: 0, ox: 0, oy: 0 }));
      bakeHurt(next, h);
    }
  }
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
      if (layer === 'under') continue;
      bakeHurt(g, h);
      if (h.hollow) ctx.drawImage(h.hollow.c, h.hollow.x, h.hollow.y);
      const [yl, yr] = g.walls ?? [g.top, g.top];
      // (its torn lips scaled to it: two full lips met over a narrow hollow and read as a column of roots, hollowLipWidth)
      const hw = hollowLipWidth(g), hh = (hw * lip.height) / lip.width, out = 1 - LIP_IN, hl = lipFaded(lip);
      if (g.lipL) ctx.drawImage(hl, g.x0 - hw * out, yl - 12 * (hw / lw), hw, hh);
      if (g.lipR) {
        ctx.save();
        ctx.translate(g.x1 + hw * out, yr - 12 * (hw / lw));
        ctx.scale(-1, 1);
        ctx.drawImage(hl, 0, 0, hw, hh);
        ctx.restore();
      }
      if (h.over) ctx.drawImage(h.over, h.ox, g.floor + THORN_BED.sink - h.over.height);
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
