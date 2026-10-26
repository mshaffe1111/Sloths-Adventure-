/**
 * dotFlightStage — Dot's netting flight, the extra stage of World 4 that sits between 4-5 and 4-6 (Matt, 2026-10-25). Dot is the
 * player for once: she carries Meeca's note through the General's iron netting to the one gap in it, "about as wide as a folded
 * letter", and arrives at the halfway scene with nine scratches and a bare patch on her tail (reference/STORY-REWRITE.md).
 *
 * There is no ground. She flies between netting walls (iron mesh, floor to cloud) through their holes, drinking at glowing nectar
 * flowers that refill her energy, past iron thorn strands (a touch is a heart and a scratch), gusts that blow through the holes on a
 * beat, and stretches where the netting sways and its holes move. Spider silk is the secret, three pieces hidden in pockets.
 *
 * The beats, always in this order (CLAUDE.md: learn, develop, twist, finish):
 *   1. LEARN    fly and flap (the first line teaches both), a fence of netting to rise over, the first nectar flower (hover and
 *               drink), all over a catch net so nothing can hurt her until both are taught; then the first walls with holes
 *   2. DEVELOP  thorn strands by the holes and a hanging thorn slalom; dandelion puffs over a small hole, with a silk pocket behind
 *   3. TWIST    gusts through the holes (the petals fly first), a downdraft over thorns, the swaying netting, a long climb
 *   4. FINISH   the pieces mixed up to the stage's length (STAGE_SECONDS), then the folded-letter gap: slow motion, the note, the light
 *
 * Planned, details rolled: a seed sets the holes' heights and sizes, the spacing, which flowers, the sway, the gust beats and the order
 * of the mixed stretch. `checkFlight` proves every roll can be flown with Dot's real numbers (dotFlight.ts DOT): the energy needed
 * between flowers, every hole against her body, the thorns clear of every route through a hole, the gusts' lulls long enough to cross.
 */
import type { LevelConfig } from './types.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import { stream } from './protoStage.ts';
import { DOT_PROP_FRAMES } from './dotPropsData.ts';

export { DOT_STAGE_ID, dotStageConfig } from './extraStages.ts';
/** the stage's height: the netting overhead hangs to TOP, the mist of the gorge begins at MIST (below it she has fallen) */
export const DOT_H = 1000;
export const TOP = 70;
export const MIST = 925;
/** the flight numbers the stage is built and checked against (dotFlight.ts flies by the same ones) */
export const DOT = {
  /** her body: a circle this big (the wings, tail and beak are not counted, so a brush with a wing tip is forgiven) */
  R: 13,
  /** flying flat out, px/s, and how quickly she gets there */
  speed: 290,
  accel: 2200,
  /** with no direction held she brakes, as hummingbirds do */
  brake: 6,
  /** pulled down this hard (px/s²) and never faster than `fall`; flying along at speed holds her up a little (`cruiseFall`) */
  g: 620,
  fall: 210,
  /** (gentler: sliding along with one thumb she sank too fast to keep up with flicks; QA, then Matt's retune, 2026-10-26) */
  cruiseFall: 55,
  /** a flap: straight up at this speed. Three in hand, one back each `regen` s, never two within `gap` s: she climbs, she can't rocket */
  flapV: 340,
  flaps: 3,
  regen: 0.4,
  gap: 0.16,
  /** hovering: she sinks this slowly and moves at this share of her speed. A tap holds her for `tap` s */
  hoverSink: 24,
  hoverMul: 0.8,
  tap: 0.6,
  /** after a flap, a thumb still on the glass this long is a hover (a flick alone holds for 220 ms: inputEngine.ts) */
  holdAfter: 0.24,
  /** energy: full, a flap's cost, hovering's cost a second, and how fast a flower fills her */
  energy: 100,
  flapCost: 3.5,
  hoverCost: 3.5,
  sip: 150,
  /** how much one flower holds before it droops (and regrows); she drinks anywhere in its bloom (`drinkBox`) */
  flowerHolds: 120,
  regrow: 6,
  /** out of energy: no flap, no hover, she sinks at this and steers at this share of her speed */
  tiredFall: 115,
  tiredMul: 0.75,
} as const;

/** how high one flap lifts her (px): straight up at flapV against the pull down */
export const FLAP_RISE = (DOT.flapV * DOT.flapV) / (2 * DOT.g);
/** how far from a thorn strand's line it scratches her (dotFlight.ts) */
export const THORN_REACH = DOT.R + 5;

/** the stage's length for a quick, sure player (s): STAGE_SECONDS['4-D'] in protoStage.ts is this number */
export const DOT_STAGE_SECONDS = 200;

export type NectarKind = 'heli' | 'fuchsia' | 'trumpet' | 'passion' | 'blue';

/**
 * Each nectar flower's painted bloom about its mouth (x, y): the piece, its width, where the mouth sits in it (fractions), and whether
 * it hangs from a vine overhead. The art draws it so (dotFlightArt.ts) and she drinks anywhere in and around it (`drinkBox`).
 */
export const BLOOM: Record<NectarKind, { piece: keyof typeof DOT_PROP_FRAMES; w: number; ax: number; ay: number; hang: boolean }> = {
  heli: { piece: 'heliGlow', w: 124, ax: 0.56, ay: 0.4, hang: false },
  fuchsia: { piece: 'fuchsia', w: 96, ax: 0.5, ay: 0.7, hang: true },
  trumpet: { piece: 'trumpet', w: 116, ax: 0.26, ay: 0.82, hang: true },
  passion: { piece: 'passion', w: 112, ax: 0.5, ay: 0.44, hang: false },
  blue: { piece: 'blueCluster', w: 108, ax: 0.5, ay: 0.36, hang: false },
};
/**
 * Where she drinks at a flower: the whole painted bloom and a generous margin round it (QA, 2026-10-25: hovering just under a head
 * didn't drink, and a first-timer tapped away beside the stem until empty). The stalk side gets the most room.
 */
export function drinkBox(f: { x: number; y: number; kind: NectarKind }): { x0: number; x1: number; y0: number; y1: number } {
  const b = BLOOM[f.kind];
  const fr = DOT_PROP_FRAMES[b.piece];
  const h = (b.w * fr.h) / fr.w;
  const pad = DOT.R + 12;
  const top = f.y - h * b.ay;
  return {
    x0: f.x - b.w * b.ax - pad,
    x1: f.x + b.w * (1 - b.ax) + pad,
    y0: top - (b.hang ? pad : pad + 6),
    y1: top + h + (b.hang ? pad + 6 : pad + 34),
  };
}

export interface Opening {
  /** the top of the hole and its height (px) */
  y: number;
  h: number;
  /** the netting sways and the hole moves with it: y + amp * sin(2π t / period + phase) */
  sway?: { amp: number; period: number; phase: number };
  /** a little hole into a silk pocket (puffs cover it), not the way on */
  pocket?: boolean;
}
export interface NetWall {
  id: number;
  x: number;
  w: number;
  openings: Opening[];
  /** the last wall: one gap, as wide as a folded letter */
  letter?: boolean;
}
/** a solid piece of netting hung in the air (a painted framed panel): the floor of a silk pocket, a slab to weave round */
export interface NetPanel {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  /** the catch net strung under the start (she rests on it) until her flap and hover are taught: drawn as a sagging net, not a panel */
  catch?: boolean;
}
/** an iron thorn strand: a segment, touching it is a heart and a scratch */
export interface Thorn {
  id: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
export interface Nectar {
  id: number;
  /** the flower's mouth, where she drinks */
  x: number;
  y: number;
  kind: NectarKind;
  /** which way the flower faces (its mouth is on this side of its stem) */
  face: -1 | 1;
  /** grows up out of the mist on a long stalk, rather than out of a wall */
  stalk?: boolean;
}
/** a gust through the netting: inside the box it pushes (wx, wy) px/s while it blows, for `on` s of every `period` s */
export interface Gust {
  id: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  wx: number;
  wy: number;
  period: number;
  on: number;
  phase: number;
}
/** seconds of warning before a gust blows (the petals stream through first) */
export const GUST_WARN = 0.9;
export interface Puff { id: number; x: number; y: number; s: number }
export interface Dew { id: number; x: number; y: number }
export interface Silk { id: number; x: number; y: number }
/** painted dressing: never touched, drawn behind (depth < 1, hazier) or in front of the play */
export interface Decor { k: 'giant' | 'vine' | 'web' | 'ring' | 'blooms'; x: number; y: number; w: number; flip?: boolean; depth: number; piece?: string }
export interface FlightHint {
  x: number;
  text: string;
  pad: string;
  keys: string;
}
/** the way a quick player goes: through every hole, past every flower, with the seconds a piece costs on top of the flying */
export interface RoutePoint {
  x: number;
  y: number;
  k: 'go' | 'gap' | 'flower' | 'finish';
  /** seconds spent hovering here (lining up a small hole, waiting out a gust, watching the sway) */
  hover?: number;
  /** this point is a hole in this wall */
  wall?: number;
}

export interface DotStage {
  seed: number;
  width: number;
  height: number;
  spawn: { x: number; y: number };
  walls: NetWall[];
  panels: NetPanel[];
  thorns: Thorn[];
  flowers: Nectar[];
  gusts: Gust[];
  puffs: Puff[];
  dew: Dew[];
  silk: Silk[];
  decor: Decor[];
  hints: FlightHint[];
  beats: Array<[number, number, string]>;
  /** where the folded-letter gap is (its wall, and the gap's middle), and where the slow-motion moment begins */
  letter: { wall: number; x: number; y: number; h: number; slowFrom: number };
  route: RoutePoint[];
  /** the modelled seconds of a quick, sure run, and where they come from */
  est: { seconds: number; flying: number; extra: number };
  /** the backgrounds along the stage: [x where it starts, which painting] */
  backs: Array<[number, BackName]>;
}
/** (near-22 has a hummingbird of its own in the middle of it, which read as a second Dot: it is not used) */
export type BackName = 'far1' | 'far2' | 'near1' | 'near3';

/** a hole's top at time t */
export function openingY(o: Opening, t: number): number {
  return o.sway ? o.y + o.sway.amp * Math.sin((2 * Math.PI * t) / o.sway.period + o.sway.phase) : o.y;
}
/** a gust is blowing at t; `warn` is how far into its warning it is (0..1, 1 = it blows), or 0 when calm */
export function gustState(g: Gust, t: number): { blowing: boolean; warn: number } {
  const c = (((t + g.phase) % g.period) + g.period) % g.period;
  if (c < g.on) return { blowing: true, warn: 1 };
  const until = g.period - c;
  return { blowing: false, warn: until < GUST_WARN ? 1 - until / GUST_WARN : 0 };
}

/** the stage as the engine takes it: no ground, no animals, her flight in `dot` (the engine hands it to dotFlightRun.ts) */
export function dotGeneratedStage(config: LevelConfig, seed: number): GeneratedStage {
  const st = buildDotStage(seed);
  return {
    config: { ...config, levelWidth: st.width, levelHeight: DOT_H },
    trees: [],
    platforms: [],
    vines: [],
    enemies: [],
    boss: null,
    collectibles: [],
    spawnX: st.spawn.x,
    spawnY: st.spawn.y,
    exitTotemX: st.letter.x,
    exitTotemY: st.letter.y,
    // every flower is a checkpoint (dotFlight.ts `reach`): a life lost, or Continue after a game over, brings her back to the last
    // one she got to (QA, 2026-10-26: with none, Continue started the flight over)
    checkpoints: [...st.flowers].sort((a, b) => a.x - b.x).map((f) => ({ ...flowerCheckpoint(f), reached: false })),
    dot: st,
  };
}

/**
 * The smallest hole with thorns along its edges: the room between the thorns' reach is two flaps' rise and a little, so a flap from
 * the middle of it (and a tap's hover) goes through clean (QA, 2026-10-25: the first one was tighter than one flap, and clipped).
 */
export const EDGED_HOLE = Math.ceil(2 * FLAP_RISE + 2 * THORN_REACH + 8 + 12);

/** the way between the first slalom's thorns: room for a flap from its middle and a slide's sink besides */
export const SLALOM_FIRST = Math.ceil(2 * FLAP_RISE + 2 * THORN_REACH + 90);

/** the top of the catch net under the lesson */
export const CATCH_Y = 770;

/** where she comes back at a flower: hanging at its mouth */
export const flowerCheckpoint = (f: { x: number; y: number; face: -1 | 1 }) => ({ x: f.x + (f.face > 0 ? 34 : -34), y: f.y });

/** how fast a quick player crosses open air (a little under flat out: she weaves) */
const CRUISE = 195;

/**
 * Build the stage from its seed. Same seed, same stage. A retry keeps the layout; a fresh roll comes after a clear (App.tsx).
 */
export function buildDotStage(seed = 1): DotStage {
  const R = stream(seed * 7 + 3);
  const walls: NetWall[] = [];
  const panels: NetPanel[] = [];
  const thorns: Thorn[] = [];
  const flowers: Nectar[] = [];
  const gusts: Gust[] = [];
  const puffs: Puff[] = [];
  const dew: Dew[] = [];
  const silk: Silk[] = [];
  const decor: Decor[] = [];
  const hints: FlightHint[] = [];
  const beats: Array<[number, number, string]> = [];
  const route: RoutePoint[] = [];
  const backs: Array<[number, BackName]> = [];
  let id = 1;
  let x = 0;
  /** the height the route is at now */
  let y = 520;
  let extra = 0;

  const go = (nx: number, ny: number) => {
    route.push({ x: nx, y: ny, k: 'go' });
    y = ny;
  };
  const hint = (hx: number, text: string, pad = text, keys = pad) => hints.push({ x: hx, text, pad, keys });
  const dewLine = (x0: number, y0: number, x1: number, y1: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const u = n === 1 ? 0.5 : i / (n - 1);
      dew.push({ id: id++, x: Math.round(x0 + (x1 - x0) * u), y: Math.round(y0 + (y1 - y0) * u - Math.sin(u * Math.PI) * 18) });
    }
  };
  const kinds: NectarKind[] = ['heli', 'fuchsia', 'trumpet', 'passion', 'blue'];
  let kindAt = R.i(0, kinds.length - 1);
  const flower = (fx: number, fy: number, opts: { stalk?: boolean; face?: -1 | 1; kind?: NectarKind } = {}) => {
    const kind = opts.kind ?? kinds[kindAt++ % kinds.length];
    flowers.push({ id: id++, x: Math.round(fx), y: Math.round(fy), kind, face: opts.face ?? -1, stalk: opts.stalk });
    route.push({ x: Math.round(fx), y: Math.round(fy), k: 'flower', hover: 0.9 });
    extra += 0.9;
    y = fy;
  };
  /** a netting wall here with these holes; the route goes through `via` (the index of the hole it takes) */
  const wall = (openings: Opening[], via = 0, w = R.i(50, 64), hover = 0) => {
    const wl: NetWall = { id: id++, x: Math.round(x), w, openings: openings.map((o) => ({ ...o, y: Math.round(o.y), h: Math.round(o.h) })) };
    walls.push(wl);
    const o = wl.openings[via];
    const cy = Math.round(o.y + o.h / 2);
    route.push({ x: wl.x - 30, y: cy, k: 'gap', wall: wl.id, hover });
    route.push({ x: wl.x + w + 30, y: cy, k: 'gap', wall: wl.id });
    extra += hover;
    y = cy;
    // a vine climbing the wall, a ring anchor at its head, now and then a web with dew in a corner of a hole
    if (R.chance(0.6)) decor.push({ k: 'vine', x: wl.x + w / 2, y: MIST + 20, w: R.i(90, 130), depth: 1, flip: R.chance(0.5) });
    if (R.chance(0.5)) decor.push({ k: 'ring', x: wl.x + w / 2, y: TOP + 8, w: 46, depth: 1 });
    if (!wl.letter && R.chance(0.35)) decor.push({ k: 'web', x: wl.x + w + 26, y: o.y + 30, w: 70, depth: 1, flip: R.chance(0.5) });
    return wl;
  };
  const giant = (gx: number, depth: number) => {
    const piece = R.pick(['heliDrip', 'trumpet', 'fuchsiaDrop', 'passion2', 'blueCluster2']);
    decor.push({ k: 'giant', x: Math.round(gx), y: MIST + 60, w: R.i(230, 340), depth, flip: R.chance(0.5), piece });
  };
  const beat = (name: string, body: () => void) => {
    const x0 = x;
    body();
    beats.push([x0, x, name]);
  };
  const advance = (dx: number) => {
    x += dx;
  };
  /** a hole somewhere in the flying band, `h` tall, not too far from where the route is now */
  const holeY = (h: number, reach = 260) => {
    const lo = Math.max(TOP + 60, y - reach - h / 2);
    const hi = Math.min(MIST - 90 - h, y + reach - h / 2);
    return R.r(lo, Math.max(lo, hi));
  };
  /** a thorn strand hanging from the netting overhead down to `to`, or rising from the mist up to `to` */
  const thornDown = (tx: number, to: number) => thorns.push({ id: id++, x0: tx, y0: TOP - 10, x1: tx + R.r(-14, 14), y1: to });
  const thornUp = (tx: number, to: number) => thorns.push({ id: id++, x0: tx, y0: MIST + 40, x1: tx + R.r(-14, 14), y1: to });

  // ---------------- 1. LEARN ----------------
  backs.push([0, 'far1']);
  const spawn = { x: 170, y: 500 };
  beat('Start: the note', () => {
    y = spawn.y;
    route.push({ x: spawn.x, y: spawn.y, k: 'go' });
    // (the first line teaches the flap as well as the flying: holding a direction alone, she sinks; QA, 2026-10-25)
    hint(
      60,
      "Meeca's note, safe in my satchel. Slide your thumb left or right and I fly. Flick up and I flap, or I sink. There's a catch net under me, for now.",
      "Meeca's note, safe in my satchel. Push the pad left or right and I fly. Press Jump and I flap, or I sink. There's a catch net under me, for now.",
      "Meeca's note, safe in my satchel. Left and right arrows and I fly. Space and I flap, or I sink. There's a catch net under me, for now.",
    );
    dewLine(340, 500, 760, 470, 5);
    giant(520, 0.55);
    advance(R.r(820, 920));
    go(x, 480);
  });
  beat('Learn: flap', () => {
    // a fence of netting from the mist up to `top`: rise over it
    const top = R.r(410, 450);
    hint(
      x - 180,
      "Over the fence: flick up to flap, again to climb. After three my wings want a little rest. They're wings, not miracles.",
      'Over the fence: press Jump to flap, again to climb. After three my wings want a little rest. They\'re wings, not miracles.',
      "Over the fence: Space to flap, again to climb. After three my wings want a little rest. They're wings, not miracles.",
    );
    advance(260);
    dewLine(x - 200, 470, x + 40, top - 70, 5);
    wall([{ y: TOP, h: top - TOP }], 0, 60);
    route[route.length - 2].y = route[route.length - 1].y = Math.round(top - 60);
    y = top - 60;
    extra += 1.5;
    advance(R.r(260, 320));
  });
  beat('Learn: nectar and hover', () => {
    hint(
      x - 200,
      "Nectar! Fly me into the flower's head and hover there: tap, tap, tap. Or flick up and keep your thumb down. I drink while I hover in it.",
      "Nectar! Fly me into the flower's head and hover there: press Punch again and again. Or hold Jump after a flap. I drink while I hover in it.",
      "Nectar! Fly me into the flower's head and hover there: tap J. Or hold Space after a flap. I drink while I hover in it.",
    );
    flower(x, y + 10, { stalk: true, kind: 'heli' });
    extra += 1.5; // the first sip, read slowly
    advance(R.r(380, 460));
  });
  backs.push([x - 300, 'near1']);
  beat('Learn: the netting', () => {
    hint(x - 260, "That's the General's netting. Floor to cloud. Iron doesn't cut, it just bonks. Find a hole and go through.");
    giant(x - 120, 0.6);
    const h1 = R.r(150, 170);
    const first = wall([{ y: holeY(h1, 160), h: h1 }], 0, 56, 0.4);
    // the catch net: strung low under the whole lesson, from the start to this first wall with a hole, so nothing can hurt her (the
    // mist is beneath it) until the flap and the hover are taught (QA, 2026-10-25: she sank into the mist before the flap line showed)
    panels.push({ id: id++, x: 0, y: CATCH_Y, w: first.x, h: 26, catch: true });
    advance(R.r(400, 470));
    dewLine(x - 330, y, x - 60, y, 3);
    const h2 = R.r(120, 140);
    const y2 = holeY(h2, 220);
    wall([{ y: y2, h: h2 }], 0, 58, 0.6);
    advance(R.r(380, 440));
    flower(x, Math.min(MIST - 160, Math.max(TOP + 120, y + R.r(-60, 60))), { stalk: true });
    advance(R.r(360, 420));
    const h3 = R.r(110, 125);
    // two holes: either way works
    const a = holeY(h3, 200);
    const b = a < 480 ? a + R.r(250, 320) : a - R.r(250, 320);
    wall([{ y: a, h: h3 }, { y: Math.max(TOP + 50, Math.min(MIST - 80 - h3, b)), h: h3 }], 0, 60, 0.6);
    advance(R.r(380, 440));
  });

  // ---------------- 2. DEVELOP ----------------
  beat('Develop: iron thorns', () => {
    hint(x - 280, "Iron thorns. Each one I touch costs a heart. The hearts are what matter; the scratches are just my tally. Somebody has to count.");
    flower(x - 120, Math.min(MIST - 180, Math.max(TOP + 140, y)), { stalk: true });
    // thorns jutting from a wall's hole, top and bottom edges (the middle of the hole stays clear)
    advance(R.r(200, 260));
    // (tall enough that one flap from the middle of the room between the thorns doesn't reach the top ones: `EDGED_HOLE`)
    const h = R.r(EDGED_HOLE + 4, EDGED_HOLE + 16);
    const wl = wall([{ y: holeY(h, 200), h }], 0, 60, 0.7);
    const o = wl.openings[0];
    thorns.push({ id: id++, x0: wl.x - 20, y0: o.y + 3, x1: wl.x + wl.w + 18, y1: o.y + 6 });
    thorns.push({ id: id++, x0: wl.x - 18, y0: o.y + o.h - 5, x1: wl.x + wl.w + 20, y1: o.y + o.h - 2 });
    advance(R.r(320, 380));
    // the slalom: strands hanging from overhead and rising from the mist, the way between them weaving up and down. The first one is
    // gentle: a wide way through, weaving only a little, so a flick that rises a whole flap too far, or a slide that sinks, still
    // gets through (QA, 2026-10-26: a one-thumb player lost all three lives and 14 scratches in here)
    let up = R.chance(0.5);
    const n = R.i(4, 5);
    for (let i = 0; i < n; i++) {
      const gapMid = up ? R.r(400, 430) : R.r(490, 520);
      const gapH = R.r(SLALOM_FIRST, SLALOM_FIRST + 20);
      thornDown(x, gapMid - gapH / 2);
      thornUp(x + R.r(-10, 10), gapMid + gapH / 2);
      dewLine(x - 40, gapMid, x + 40, gapMid, 2);
      route.push({ x: x - 20, y: Math.round(gapMid), k: 'gap' });
      route.push({ x: x + 20, y: Math.round(gapMid), k: 'gap' });
      y = gapMid;
      extra += 0.5;
      up = !up;
      advance(R.r(230, 270));
    }
    flower(x, Math.min(MIST - 180, Math.max(TOP + 160, y + R.r(-40, 40))), { stalk: true });
    advance(R.r(300, 360));
  });
  backs.push([x - 300, 'near3']);
  beat('Develop: puffs and the silk pocket', () => {
    hint(x - 330, 'Dandelion puffs! Fly right through them and they pop. Things hide behind puffs. Not always. Sometimes. Today, yes.');
    // wall A: the way on (a small hole) and, high up, a little hole behind puffs into a pocket floored by a panel, then wall B
    const h = R.r(84, 96);
    const mainY = R.r(470, 600);
    const pocketY = R.r(TOP + 70, TOP + 110);
    const wa = wall([{ y: mainY, h }, { y: pocketY, h: 64, pocket: true }], 0, 58, 1.0);
    for (let i = 0; i < 7; i++) puffs.push({ id: id++, x: wa.x - R.r(20, 70), y: Math.round(pocketY + R.r(-20, 84)), s: R.r(0.8, 1.15) });
    for (let i = 0; i < 4; i++) puffs.push({ id: id++, x: wa.x - R.r(40, 160), y: Math.round(mainY + R.r(-10, h + 10)), s: R.r(0.8, 1.1) });
    const room = R.r(200, 240);
    panels.push({ id: id++, x: wa.x + wa.w, y: Math.round(pocketY + 64 + R.r(40, 70)), w: Math.round(room), h: 36 });
    silk.push({ id: id++, x: Math.round(wa.x + wa.w + room / 2), y: Math.round(pocketY + 40) });
    advance(wa.w + room);
    wall([{ y: mainY + R.r(-40, 40), h: h + 20 }], 0, 56, 0.5);
    advance(R.r(320, 380));
    flower(x, Math.min(MIST - 180, y + R.r(-30, 30)), { stalk: true });
    advance(R.r(320, 380));
  });

  // ---------------- 3. TWIST ----------------
  const gustWall = (dir: number) => {
    // the gust blows back out of a hole (dir -1: into her face), so wait for the lull and go
    const h = R.r(120, 140);
    const wl = wall([{ y: holeY(h, 200), h }], 0, 58, 2.0);
    const o = wl.openings[0];
    const period = R.r(3.9, 4.6);
    gusts.push({ id: id++, x0: wl.x - 150, x1: wl.x + wl.w + 40, y0: o.y - 70, y1: o.y + o.h + 70, wx: 330 * dir, wy: 0, period, on: R.r(1.4, 1.7), phase: R.r(0, period) });
    return wl;
  };
  beat('Twist: gusts through the holes', () => {
    flower(x - 60, Math.min(MIST - 200, Math.max(TOP + 160, y)), { stalk: true });
    hint(x - 40, 'The wind comes through the holes in gusts. The petals fly first. When they fly, wait. When they settle, go.');
    advance(R.r(380, 440));
    gustWall(-1);
    advance(R.r(380, 440));
    gustWall(-1);
    advance(R.r(360, 420));
    flower(x, Math.min(MIST - 200, Math.max(TOP + 160, y + R.r(-40, 40))), { stalk: true });
    advance(R.r(280, 340));
  });
  const downdraft = (first: boolean) => {
    // a downdraft in a shaft between two walls, thorns rising from the mist below it: flap through, or wait for the lull
    if (first) hint(x - 300, "This one blows down. Flap through it, or wait for the lull. Don't let it push me onto the thorns.");
    const h = R.r(130, 150);
    const ya = R.r(250, 330);
    wall([{ y: ya, h }], 0, 56, 0.4);
    const x0 = x + 70;
    const shaft = R.r(300, 340);
    const period = R.r(3.6, 4.2);
    gusts.push({ id: id++, x0: Math.round(x0), x1: Math.round(x0 + shaft), y0: TOP, y1: MIST, wx: 0, wy: 200, period, on: R.r(1.2, 1.5), phase: R.r(0, period) });
    for (let k = 0; k < 4; k++) thornUp(x0 + 40 + (k * (shaft - 80)) / 3, R.r(690, 740));
    route.push({ x: Math.round(x0 + shaft / 2), y: Math.round(ya + h / 2), k: 'go', hover: 1.0 });
    extra += 1.0;
    advance(70 + shaft);
    wall([{ y: ya + R.r(-30, 30), h }], 0, 56, 0.4);
    advance(R.r(320, 380));
  };
  beat('Twist: the downdraft', () => {
    downdraft(true);
    flower(x, Math.min(MIST - 200, Math.max(TOP + 160, y + R.r(0, 80))), { stalk: true });
    advance(R.r(320, 360));
  });
  backs.push([x - 300, 'near1']);
  const swayWall = (h: number, phase: number) => {
    const amp = R.r(120, 170);
    const mid = R.r(TOP + 80 + amp + h / 2, MIST - 100 - amp - h / 2);
    return wall([{ y: mid - h / 2, h, sway: { amp, period: R.r(3.8, 4.6), phase } }], 0, 60, 1.8);
  };
  beat('Twist: the swaying netting', () => {
    hint(x - 280, 'This bit sways in the wind and the hole moves with it. Hover, watch it, and go when it comes to me.');
    swayWall(R.r(120, 135), R.r(0, 6.28));
    advance(R.r(360, 420));
    flower(x - 100, Math.min(MIST - 200, Math.max(TOP + 160, y)), { stalk: true });
    // two close together, swaying opposite ways
    const p = R.r(0, 6.28);
    swayWall(R.r(115, 130), p);
    advance(R.r(210, 240));
    swayWall(R.r(115, 130), p + Math.PI);
    advance(R.r(360, 420));
    flower(x, Math.min(MIST - 200, Math.max(TOP + 160, y)), { stalk: true });
    advance(R.r(320, 360));
  });
  const climb = () => {
    // up the netting: four walls, each hole higher than the last, one flower half way
    const steps = [R.r(700, 740), R.r(520, 560), R.r(330, 380), R.r(150, 200)];
    for (let i = 0; i < steps.length; i++) {
      wall([{ y: steps[i] - 55, h: R.r(110, 125) }], 0, 56, 0.5);
      advance(R.r(260, 300));
      if (i === 1) flower(x - 120, steps[i] - 10, { stalk: true });

    }
    flower(x, steps[steps.length - 1] + 20, { stalk: true });
    advance(R.r(300, 340));
  };
  beat('Twist: the long climb', () => {
    hint(x - 260, 'All the way up. If I run dry, the flowers droop, and they fill back up if I give them a few seconds. Like me.');
    climb();
    // and back down to the middle
    go(x + 160, 520);
    advance(R.r(380, 420));
  });

  // ---------------- 4. FINISH ----------------
  const est = () => {
    let fly = 0;
    for (let i = 1; i < route.length; i++) fly += Math.hypot(route[i].x - route[i - 1].x, (route[i].y - route[i - 1].y) * 0.8) / CRUISE;
    return fly + extra;
  };
  /** seconds the last stretch (flower, the letter wall and the light beyond) takes; the mixed stretch fills the rest */
  const LETTER_SECONDS = 4.5 + 2.4 + (380 + 700 + 600) / CRUISE;
  beat('Finish: the netting, all of it', () => {
    hint(x - 200, "Nearly there. All of it at once now. Gusts, thorns, the swaying bits. I've done this twice. Well, I've tried it twice.");
    const order = R.shuffle([0, 1, 2, 3, 4]);
    let n = 0;
    while (est() + LETTER_SECONDS < DOT_STAGE_SECONDS && n < 30) {
      const k = order[n % order.length];
      if (k === 0) {
        gustWall(-1);
        advance(R.r(360, 420));
      } else if (k === 1) {
        swayWall(R.r(110, 125), R.r(0, 6.28));
        advance(R.r(340, 400));
      } else if (k === 2) {
        downdraft(false);
      } else if (k === 3) {
        // a hole with thorns along its edges (the same height as the first: a flap from its middle clears them)
        const h = R.r(EDGED_HOLE, EDGED_HOLE + 10);
        const wl = wall([{ y: holeY(h, 220), h }], 0, 58, 0.8);
        const o = wl.openings[0];
        thorns.push({ id: id++, x0: wl.x - 20, y0: o.y + 3, x1: wl.x + wl.w + 20, y1: o.y + 5 });
        thorns.push({ id: id++, x0: wl.x - 20, y0: o.y + o.h - 3, x1: wl.x + wl.w + 20, y1: o.y + o.h - 5 });
        advance(R.r(340, 400));
      } else {
        // a short slalom
        let up = R.chance(0.5);
        for (let i = 0; i < 3; i++) {
          const gapMid = up ? R.r(340, 410) : R.r(510, 580);
          const gapH = R.r(210, 240);
          thornDown(x, gapMid - gapH / 2);
          thornUp(x, gapMid + gapH / 2);
          route.push({ x, y: Math.round(gapMid), k: 'gap' });
          y = gapMid;
          extra += 0.5;
          up = !up;
          advance(R.r(220, 260));
        }
      }
      n++;
      // a flower after every piece but the odd one (the energy check holds every stretch between them to a safe share)
      if (n % 3 !== 2) {
        flower(x - 40, Math.min(MIST - 200, Math.max(TOP + 160, y + R.r(-40, 40))), { stalk: true });
        advance(R.r(260, 320));
      }
      if (n === 4) backs.push([x - 300, 'near3']);
    }
  });
  backs.push([x - 200, 'far2']);
  let letter: DotStage['letter'] = { wall: 0, x: 0, y: 0, h: 0, slowFrom: 0 };
  beat('Finish: the folded-letter gap', () => {
    advance(80);
    flower(x, 500, { stalk: true, kind: 'heli' });
    advance(380);
    hint(x - 420, "There it is. The only way out of the whole netting, about as wide as a folded letter. Good thing that's what I'm carrying.");
    const gh = 38;
    const gy = R.r(440, 520);
    const wl = wall([{ y: gy, h: gh }], 0, 70, 2.5);
    wl.letter = true;
    // (the iron round the gap is torn and hooked: drawn, never touched, so the squeeze is about lining up, not luck)
    letter = { wall: wl.id, x: wl.x + wl.w / 2, y: Math.round(gy + gh / 2), h: gh, slowFrom: wl.x - 240 };
    extra += 2.0; // the slow motion
    advance(wl.w + 600);
    route.push({ x, y: Math.round(gy + gh / 2), k: 'finish' });
  });
  const width = Math.round(x + 300);
  // the giant flowers behind the netting, every so often along the way
  for (let gx = 1200; gx < width - 600; gx += R.r(700, 1100)) giant(gx, R.chance(0.5) ? 0.55 : 0.7);
  const seconds = est();
  return {
    seed,
    width,
    height: DOT_H,
    spawn,
    walls,
    panels,
    thorns,
    flowers,
    gusts,
    puffs,
    dew,
    silk: silk.slice(0, 1).concat(extraSilk(walls, panels, thorns, gusts, R, id, silk.length)),
    decor,
    hints,
    beats,
    letter,
    route,
    est: { seconds, flying: seconds - extra, extra },
    backs,
  };
}

/**
 * The other two pieces of silk: tucked high in the netting overhead, just under it, in a stretch with no gust and no thorn near, a
 * little above where the route goes (you see them if you look up). One in the middle of the stage, one late.
 */
function extraSilk(walls: NetWall[], panels: NetPanel[], thorns: Thorn[], gusts: Gust[], R: ReturnType<typeof stream>, id0: number, have: number): Silk[] {
  const out: Silk[] = [];
  let id = id0 + 1000;
  const last = walls[walls.length - 1]?.x ?? 0;
  const spots = [0.45, 0.78];
  for (const u of spots) {
    if (out.length + have >= 3) break;
    for (let k = 0; k < 40; k++) {
      const sx = Math.round(last * u + R.r(-400, 400));
      const sy = Math.round(TOP + R.r(34, 50));
      const clearWall = walls.every((w) => sx < w.x - 50 || sx > w.x + w.w + 50);
      const clearThorn = thorns.every((t) => segDist(sx, sy, t) > 70);
      const clearGust = gusts.every((g) => sx < g.x0 - 40 || sx > g.x1 + 40);
      const clearPanel = panels.every((p) => sx < p.x - 40 || sx > p.x + p.w + 40);
      if (clearWall && clearThorn && clearGust && clearPanel) {
        out.push({ id: id++, x: sx, y: sy });
        break;
      }
    }
  }
  return out;
}

/** the distance from a point to a thorn strand */
export function segDist(px: number, py: number, t: { x0: number; y0: number; x1: number; y1: number }): number {
  const dx = t.x1 - t.x0;
  const dy = t.y1 - t.y0;
  const L = dx * dx + dy * dy;
  const u = L > 0 ? Math.max(0, Math.min(1, ((px - t.x0) * dx + (py - t.y0) * dy) / L)) : 0;
  return Math.hypot(px - (t.x0 + dx * u), py - (t.y0 + dy * u));
}

// ---------------------------------------------------------------------------------------------------------------------------
// The flight check: the level check (levelCheck.ts) walks and jumps between platforms, and Dot never stands on anything, so her
// stage has its own. It is run on every roll by the tests (dotFlightStage.test.ts, 16 seeds).
// ---------------------------------------------------------------------------------------------------------------------------

/** a thorn must stay this far (beyond her body) from the line through a hole */
export const THORN_CLEAR = 10;
/** the share of a full tank the hardest stretch between two flowers may need */
export const ENERGY_SHARE = 0.75;
/** flaps a second a first-timer makes, flapping steadily (QA, 2026-10-25) */
export const BUSY_FLAPS = 1.1;
/** energy spent per second flying along, holding her height (a flap every so often against the pull down) */
export function holdCostPerSec(): number {
  // flying along she sinks at cruiseFall at most. A flap throws her up at flapV; the pull brings her back to sinking at cruiseFall, a
  // net rise of `up` px, which she then sinks again. One flap a cycle
  const turn = (DOT.flapV + DOT.cruiseFall) / DOT.g;
  const up = (DOT.flapV * DOT.flapV) / (2 * DOT.g) - (DOT.cruiseFall * DOT.cruiseFall) / (2 * DOT.g);
  const cycle = turn + up / DOT.cruiseFall;
  return DOT.flapCost / cycle;
}
/** energy to climb `dy` px with flaps */
export const climbCost = (dy: number): number => (Math.max(0, dy) / ((DOT.flapV * DOT.flapV) / (2 * DOT.g))) * DOT.flapCost;

export interface FlightProblem {
  what: string;
  x: number;
}

export function checkFlight(st: DotStage): { ok: boolean; problems: FlightProblem[]; worstStretch: number } {
  const problems: FlightProblem[] = [];
  const bad = (what: string, x: number) => problems.push({ what, x: Math.round(x) });
  const body = 2 * DOT.R;

  // every hole fits her body, with room (the folded-letter gap with a little less), and a swaying hole never leaves the netting
  for (const w of st.walls) {
    const way = w.openings.filter((o) => !o.pocket);
    if (!way.length) bad(`wall ${w.id} has no way through`, w.x);
    for (const o of w.openings) {
      const room = w.letter ? 8 : 16;
      if (o.h < body + room) bad(`wall ${w.id}: hole ${Math.round(o.h)} px is too small for her (${body} + ${room})`, w.x);
      const amp = o.sway?.amp ?? 0;
      if ((o.y > TOP && o.y - amp < TOP + 20) || o.y + o.h + amp > MIST - 30) bad(`wall ${w.id}: hole leaves the flying band`, w.x);
    }
    // two holes in one wall never run together
    const os = [...w.openings].sort((a, b) => a.y - b.y);
    for (let i = 1; i < os.length; i++) if (os[i].y - (os[i - 1].y + os[i - 1].h) < 60) bad(`wall ${w.id}: holes too close`, w.x);
  }
  // walls far enough apart to change height between them, and never overlapping
  const ws = [...st.walls].sort((a, b) => a.x - b.x);
  for (let i = 1; i < ws.length; i++) {
    const gap = ws[i].x - (ws[i - 1].x + ws[i - 1].w);
    if (gap < 150) bad(`walls ${ws[i - 1].id} and ${ws[i].id} only ${Math.round(gap)} px apart`, ws[i].x);
  }

  // thorns clear of every way through a hole (the line through its middle, from just before the wall to just after)
  for (const w of st.walls) {
    for (const o of w.openings) {
      if (o.sway) {
        if (st.thorns.some((t) => Math.min(t.x0, t.x1) < w.x + w.w + 80 && Math.max(t.x0, t.x1) > w.x - 80)) bad(`wall ${w.id}: thorns by a swaying hole`, w.x);
        continue;
      }
      const cy = o.y + o.h / 2;
      for (let px = w.x - 40; px <= w.x + w.w + 40; px += 6) {
        for (const t of st.thorns) if (segDist(px, cy, t) < DOT.R + THORN_CLEAR) bad(`thorn ${t.id} in the way through wall ${w.id}`, px);
      }
    }
  }
  // a hole with thorns along its edges: the room between their reach takes a flap from its middle, or a tap's hover, without a touch
  for (const w of st.walls) {
    const edge = st.thorns.filter((t) => Math.min(t.x0, t.x1) < w.x + w.w && Math.max(t.x0, t.x1) > w.x && Math.abs(t.y0 - t.y1) < 20);
    if (!edge.length) continue;
    for (const o of w.openings) {
      const over = edge.filter((t) => Math.max(t.y0, t.y1) < o.y + o.h / 2 && Math.min(t.y0, t.y1) > o.y - 20);
      const under = edge.filter((t) => Math.min(t.y0, t.y1) > o.y + o.h / 2 && Math.max(t.y0, t.y1) < o.y + o.h + 20);
      if (!over.length || !under.length) continue;
      const room = Math.min(...under.map((t) => Math.min(t.y0, t.y1))) - Math.max(...over.map((t) => Math.max(t.y0, t.y1))) - 2 * THORN_REACH;
      if (room / 2 < FLAP_RISE + 4) bad(`wall ${w.id}: a flap from the middle of its thorned hole reaches the thorns (room ${Math.round(room)} px)`, w.x);
    }
  }
  // the lesson: the catch net under it, from the start to beyond where the flap and the hover are taught, and no thorn before it ends
  const flapAt = st.hints.find((h) => /flap/i.test(h.text))?.x ?? Infinity;
  const hoverAt = st.hints.find((h) => /hover/i.test(h.text))?.x ?? Infinity;
  const net = st.panels.find((p) => p.catch);
  if (!net || net.x > st.spawn.x - 100 || net.x + net.w < Math.max(flapAt, hoverAt) + 200) bad('the start has no catch net under the flap and hover lessons', 0);
  else {
    if (net.y < st.spawn.y + 150 || net.y > MIST - 60) bad('the catch net is in the wrong place', net.x);
    if (st.thorns.some((t) => Math.min(t.x0, t.x1) < net.x + net.w)) bad('a thorn over the catch net', net.x);
    if (st.gusts.some((g) => g.x0 < net.x + net.w)) bad('a gust over the catch net', net.x);
  }
  // every route point clear of thorns, inside the band, outside the netting and the panels
  const inWall = (px: number, py: number, r: number) =>
    st.walls.some((w) => px > w.x - r && px < w.x + w.w + r && !w.openings.some((o) => !o.sway && py - r >= o.y && py + r <= o.y + o.h));
  for (const p of st.route) {
    if (p.y < TOP + DOT.R || p.y > MIST - DOT.R - 20) bad(`route point outside the flying band (${Math.round(p.y)})`, p.x);
    if (p.k !== 'gap') {
      for (const t of st.thorns) if (segDist(p.x, p.y, t) < DOT.R + THORN_CLEAR) bad(`route point on thorn ${t.id}`, p.x);
      if (inWall(p.x, p.y, DOT.R)) bad('route point inside the netting', p.x);
    }
    for (const pn of st.panels) if (p.x > pn.x - DOT.R && p.x < pn.x + pn.w + DOT.R && p.y > pn.y - DOT.R && p.y < pn.y + pn.h + DOT.R) bad('route point inside a panel', p.x);
  }
  // the flowers: she can reach every mouth (inside the band, out of the netting, away from thorns)
  for (const f of st.flowers) {
    if (f.y < TOP + 40 || f.y > MIST - 120) bad(`flower ${f.id} out of reach (${f.y})`, f.x);
    if (inWall(f.x, f.y, DOT.R + 6)) bad(`flower ${f.id} inside the netting`, f.x);
    for (const t of st.thorns) if (segDist(f.x, f.y, t) < DOT.R + THORN_CLEAR + 20) bad(`flower ${f.id} by thorn ${t.id}`, f.x);
  }
  // the silk: inside the band, out of the netting and the panels, away from thorns
  for (const s of st.silk) {
    if (s.y < TOP + DOT.R || s.y > MIST - 60) bad(`silk ${s.id} out of reach`, s.x);
    if (inWall(s.x, s.y, DOT.R)) bad(`silk ${s.id} inside the netting`, s.x);
    for (const t of st.thorns) if (segDist(s.x, s.y, t) < DOT.R + THORN_CLEAR) bad(`silk ${s.id} on thorn ${t.id}`, s.x);
  }
  // the pocket's silk is behind its little hole: the panel under it shuts it off from the way on
  for (const w of st.walls) {
    const pk = w.openings.find((o) => o.pocket);
    if (!pk) continue;
    const pn = st.panels.find((p) => Math.abs(p.x - (w.x + w.w)) < 2);
    if (!pn) bad(`wall ${w.id}: a pocket with no floor`, w.x);
    else if (pn.y - (pk.y + pk.h) < 30 || pn.y - (pk.y + pk.h) > 90) bad(`wall ${w.id}: pocket floor in the wrong place`, w.x);
  }

  // gusts: a gust in her face has a lull long enough to cross it at a hover's speed, and a downdraft can be flapped against
  for (const g of st.gusts) {
    const off = g.period - g.on - GUST_WARN;
    const cross = (g.x1 - g.x0 + body) / (DOT.speed * 0.85);
    if (g.wx !== 0 && off + GUST_WARN / 2 < cross) bad(`gust ${g.id}: lull ${off.toFixed(1)} s, crossing takes ${cross.toFixed(1)} s`, g.x0);
    // flapping as fast as she can (a flap every `regen` s) climbs faster than the downdraft pushes
    // (and if it is stronger, crossing it flapping all the way loses less height than there is between the way and the thorns below)
    const climbRate = (DOT.flapV * DOT.regen - 0.5 * DOT.g * DOT.regen * DOT.regen) / DOT.regen;
    if (g.wy > 0) {
      const crossT = (g.x1 - g.x0 + body) / DOT.speed;
      const lost = Math.max(0, g.wy - climbRate) * crossT;
      const wayY = Math.max(...st.route.filter((p) => p.x >= g.x0 - 80 && p.x <= g.x1 + 80).map((p) => p.y));
      const thornTop = Math.min(MIST, ...st.thorns.filter((t) => Math.max(t.x0, t.x1) > g.x0 && Math.min(t.x0, t.x1) < g.x1).map((t) => Math.min(t.y0, t.y1)));
      if (wayY + lost + DOT.R + THORN_CLEAR > thornTop) bad(`downdraft ${g.id}: flapping across, she would sink onto the thorns`, g.x0);
      if (g.period - g.on < crossT + 0.6) bad(`downdraft ${g.id}: lull too short to cross`, g.x0);
    }
  }

  // energy: from each flower to the next along the route (and from the start, and to the gap), what a quick run spends, against the tank
  // and a first-timer who flaps steadily the whole way (QA, 2026-10-25: about one flap a second, full to "running low" in 18 s) at
  // two-thirds the pace still gets to the next flower with some left
  let worst = 0;
  let spent = 0;
  let busy = 0;
  for (let i = 1; i < st.route.length; i++) {
    const a = st.route[i - 1];
    const b = st.route[i];
    const dx = Math.abs(b.x - a.x);
    const t = dx / CRUISE;
    spent += t * holdCostPerSec() + climbCost(a.y - b.y) + (b.hover ?? 0) * DOT.hoverCost;
    busy += (t + (b.hover ?? 0)) * 1.5 * BUSY_FLAPS * DOT.flapCost;
    if (b.k === 'flower' || b.k === 'finish') {
      worst = Math.max(worst, spent);
      if (spent > DOT.energy * ENERGY_SHARE) bad(`the stretch to x ${b.x} needs ${Math.round(spent)} energy`, b.x);
      if (busy > DOT.energy * 0.85) bad(`the stretch to x ${b.x} drains a steady flapper (${Math.round(busy)} energy)`, b.x);
      spent = 0;
      busy = 0;
    }
  }

  // every lesson is said before the thing it teaches first appears
  const firstHint = (re: RegExp) => st.hints.find((h) => re.test(h.text))?.x ?? Infinity;
  const teach = (what: string, re: RegExp, at: number) => {
    if (firstHint(re) > at - 120) bad(`${what} appears at ${Math.round(at)} before it is taught`, at);
  };
  const firstWall = Math.min(...st.walls.map((w) => w.x));
  const holeWalls = st.walls.filter((w) => w.openings.some((o) => o.y > TOP + 1));
  teach('flapping', /flap/i, firstWall);
  teach('nectar', /nectar/i, Math.min(...st.flowers.map((f) => f.x)));
  teach('the holes', /hole/i, Math.min(...holeWalls.map((w) => w.x)));
  teach('thorns', /thorn/i, Math.min(...st.thorns.flatMap((t) => [t.x0, t.x1])));
  teach('puffs', /puff/i, Math.min(...st.puffs.map((p) => p.x)));
  teach('gusts', /gust/i, Math.min(...st.gusts.filter((g) => g.wx !== 0).map((g) => g.x0)));
  teach('the downdraft', /blows down/i, Math.min(...st.gusts.filter((g) => g.wy !== 0).map((g) => g.x0)));
  teach('the sway', /sway/i, Math.min(...st.walls.filter((w) => w.openings.some((o) => o.sway)).map((w) => w.x)));
  teach('the letter gap', /folded letter/i, st.letter.x);
  if (st.silk.length !== 3) bad(`${st.silk.length} pieces of silk, not 3`, 0);
  return { ok: problems.length === 0, problems, worstStretch: worst };
}
