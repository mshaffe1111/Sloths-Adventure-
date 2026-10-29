/**
 * w7Slide — 7-4, World 7's special stage (Matt, 2026-10-29: "Let's not do a climb special for 7th... have him crumble into something as
 * he's running through... then it turns into a slide and we have to jump over things and slide right and left to avoid hitting").
 *
 * Three parts, in one stage:
 *   1. SIDE-ON   a short run through the temple hall (the normal engine, World 7's kit): a few blocks to hop, petals.
 *   2. CRUMBLE   a scripted beat, not a platform he has to use (CLAUDE.md: crumbling is never required): the floor at the far end of the
 *                hall cracks under him, the controls are not his for a moment, the floor drops and he falls into the chute.
 *   3. SLIDE     the view goes behind his back: an ancient stone chute running into the screen. He slides down it on his own; the thumb
 *                steers him left and right (the game's usual left/right), a flick up jumps, a held down ducks. Statue heads, rubble,
 *                fallen columns, gaps in the floor and low beams come at him, each taught by his own line the first time.
 *   4. CHAMBER   he shoots out of the chute's mouth into a chamber, back to side-on, and walks to the shrine.
 *
 * Here: the slide's numbers, its course (built from a seed for each difficulty, in seconds, so Easy is slower with fewer obstacles but
 * the same shape), `checkSlide` (every row has a clear lane he can reach in time, every obstacle is in view long enough), the run
 * itself (`SlideSim`, pure: the tests drive it) and the side-on stretches as an ordinary hand-built stage (`buildSlideStage`).
 * Drawing: w7SlideArt.ts. The engine's hand-over: w7SlideRun.ts.
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, InputState, LevelConfig, Platform } from './types.ts';

export const SLIDE_STAGE_ID = '7-4';

// ───────────────────────── the slide's numbers ─────────────────────────

/** world units are metres along the chute (z) and across it (x: lane centres at -LANE, 0, LANE) and up (y) */
export const SLIDE = {
  /** lane spacing (m) and the chute's half width at the floor */
  lane: 1.2,
  halfW: 1.8,
  /** the walls stand this far out (m): a stone ledge runs between the lanes and each wall, where the statues and torches are; the
   *  ceiling is this high */
  wallX: 2.4,
  roof: 2.8,
  /** Pokey's half width (m): an obstacle's edge must overlap this to count (a brush is forgiven) */
  bodyHalf: 0.3,
  /** sliding speed (m/s) */
  speed: { normal: 8.5, easy: 7 },
  /** steering (m/s across) and, with no thumb, how fast he settles into the nearest lane */
  steer: 6.4,
  settle: 2.6,
  /** a jump: straight up at this, pulled down at this (airtime 2*jumpV/g = 0.8 s, peak 1.3 m: over a rubble wall he can see) */
  jumpV: 6.5,
  g: 16.25,
  /** a jump pressed this long before landing still goes (buffer, s) */
  buffer: 0.15,
  /** a duck lasts this long after a down, or while down is held (s), and he stands this tall ducked / up (m) */
  duck: 0.55,
  tallUp: 1.0,
  tallDuck: 0.5,
  /** after a hit he flickers and nothing hurts for this long (s) */
  safe: 1.4,
  /** how far ahead the chute is drawn (m), and how far it fades in over (an obstacle is readable from FAR - FADE) */
  far: 24,
  fade: 4,
  /** how long the light at the chute's end takes before he is out (s) */
  outro: 1.4,
} as const;

/** the jump's airtime (s) */
export const AIRTIME = (2 * SLIDE.jumpV) / SLIDE.g;
/** how long a lane change takes (s), one lane */
export const LANE_TIME = SLIDE.lane / SLIDE.steer;

export type ObstacleKind = 'head' | 'rubble' | 'column' | 'gap' | 'beam';

/** what each kind is and how it is beaten: dodge (steer round), jump (over), duck (under) */
export const KINDS: Record<ObstacleKind, { beat: 'dodge' | 'jump' | 'duck' | 'jumpOrDodge'; len: number; low?: number; high?: number }> = {
  /** a statue (or a tower of crates) in one lane, too tall to jump (two lanes on Normal later on): steer round it */
  head: { beat: 'dodge', len: 1.0 },
  /** a plank barrier nailed across every trough (Matt's Sheet 1): jump it */
  rubble: { beat: 'jump', len: 0.8, low: 0.85 },
  /** crates spilled across two lanes (Matt's Sheet 1): jump them or steer to the open lane */
  column: { beat: 'jumpOrDodge', len: 0.9, low: 0.85 },
  /** the floor is gone across the chute: jump it (len is Normal's; Easy's is shorter, see gapLen) */
  gap: { beat: 'jump', len: 2.6 },
  /** a beam across every trough at head height (Matt's Sheet 1): duck under it (high = its underside) */
  beam: { beat: 'duck', len: 0.6, high: 0.75 },
};
export const gapLen = (easy: boolean) => (easy ? 1.8 : 2.6);

export interface Obstacle {
  z: number;
  kind: ObstacleKind;
  /** the lanes it fills (0 left, 1 middle, 2 right) */
  lanes: number[];
  len: number;
  /** the first of its kind: his line comes before it, and running into it is a stumble, not a heart (taught in a safe spot) */
  taught?: boolean;
  /** which picture (the roll picks among a kind's looks) */
  look: number;
}
export interface SlidePetal {
  z: number;
  /** across (m) and up (m) */
  x: number;
  y: number;
}
export interface SlideLine {
  z: number;
  id: string;
  text: string;
  seconds: number;
}
export interface SlideCourse {
  easy: boolean;
  speed: number;
  /** the chute's length (m): past it he is out */
  length: number;
  obstacles: Obstacle[];
  petals: SlidePetal[];
  /** the flags (z): a life lost comes back to the last one passed */
  flags: number[];
  lines: SlideLine[];
  sections: Array<{ z0: number; z1: number; name: string }>;
  /** the chute's bends: x offset (m) at distance z, a sum of slow waves */
  bends: Array<{ a: number; k: number; p: number }>;
}

/** Pokey's lines on the slide (new, need Matt's approval): World 7, he teaches himself, under 10 words (STAGE-RULES §1) */
export const SLIDE_LINES = {
  drop: 'Whoa! Lean left, lean right!',
  head: 'Statues! Steer round them.',
  rubble: 'Planks across! Flick up, jump!',
  column: 'Crates! Jump them, or go round.',
  gap: 'No floor! Jump!',
  beam: 'Low beam! Thumb down, duck!',
  hit: 'Ow. Eyes ahead, Pokey.',
  light: 'Light! There is an end!',
} as const;

/** the bend of the chute at distance z (m across) */
export function bendAt(c: SlideCourse, z: number): number {
  let x = 0;
  for (const b of c.bends) x += b.a * Math.sin(z / b.k + b.p);
  // straight at the top and the bottom (the drop in and the shoot out)
  const ease = Math.min(1, z / 40, Math.max(0, (c.length - z) / 40));
  return x * ease;
}

function rng(seed: number) {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The course, in seconds (the same shape on both settings; Easy is slower, with fewer obstacles and more room between them, and never
 * two lanes of statues at once, but it asks for every move). Matt, 2026-10-29: "Everything can be done just by avoiding objects": so
 * every section past the first has things across the WHOLE chute (rubble walls to jump, gaps to jump, low doorways to duck), and the
 * one-lane statues come in front of them, so a steer is followed by a jump or a duck.
 *
 *   0-6     the drop in: petals to steer for ("lean left, lean right")
 *   6-20    statues and rubble piles in one lane (Normal: two, later)
 *   20-34   rubble walls across the chute (taught), between statues          flag
 *   36-50   gaps across the chute (taught), a statue before some             flag
 *   52-66   low doorways across the chute (taught), statues, rubble walls    flag
 *   68-80   fallen columns over two lanes (taught: jump or go round), all of it
 *   82-104  the climax: everything, in steer-then-jump and steer-then-duck pairs
 *   104-110 the light at the end: petals, then out
 */
export function buildCourse(seed: number, easy: boolean): SlideCourse {
  const R = rng(seed * 7 + (easy ? 3 : 1));
  const v = easy ? SLIDE.speed.easy : SLIDE.speed.normal;
  const Z = (t: number) => Math.round(t * v * 10) / 10;
  const obstacles: Obstacle[] = [];
  const petals: SlidePetal[] = [];
  const lines: SlideLine[] = [];
  const sections: SlideCourse['sections'] = [];
  const taught = new Set<ObstacleKind>();
  const pick = <T,>(a: readonly T[]) => a[Math.floor(R() * a.length)];
  const lx = (lane: number) => (lane - 1) * SLIDE.lane;
  /** the free lane of the last steering row (the next row's free lane is one he can get to in time), and when the last thing ends */
  let lastFree = 1;
  let lastT = -9;
  const line = (t: number, id: keyof typeof SLIDE_LINES, seconds = 3) => lines.push({ z: Z(t), id, text: SLIDE_LINES[id], seconds });
  const put = (t: number, kind: ObstacleKind, lanes: number[]) => {
    const first = !taught.has(kind);
    taught.add(kind);
    const len = kind === 'gap' ? gapLen(easy) : KINDS[kind].len;
    obstacles.push({ z: Z(t), kind, lanes, len, ...(first ? { taught: true } : {}), look: Math.floor(R() * 3) });
    // his line comes 2.2 s before the first of a kind (it is readable by then: (SLIDE.far - SLIDE.fade) / speed is over 2.3 s)
    if (first) line(t - 2.2, kind);
    lastT = t + len / v;
  };
  const petalRow = (t0: number, t1: number, lane: number, y = 0.35) => {
    for (let t = t0; t <= t1 + 1e-6; t += 0.3) petals.push({ z: Z(t), x: lx(lane), y });
  };
  /** a steering row: statues in `n` lanes, the free lane one he can reach in time from the last */
  const heads = (t: number, n: number) => {
    const gap = t - lastT;
    const reach = Math.max(0, Math.floor((gap - (easy ? 0.6 : 0.35)) / LANE_TIME));
    const free = [0, 1, 2].filter((l) => Math.abs(l - lastFree) <= Math.max(1, reach));
    const f = pick(free);
    const blocked = [0, 1, 2].filter((l) => l !== f);
    put(t, 'head', n >= 2 ? blocked : [pick(blocked)]);
    lastFree = f;
    if (R() < 0.5) petals.push({ z: Z(t) + 1.4, x: lx(f), y: 0.35 });
  };
  const across = (t: number, kind: 'rubble' | 'gap' | 'beam') => {
    put(t, kind, [0, 1, 2]);
    // petals in an arc over a wall or a gap (they show the jump), low under a doorway (they show the duck)
    if (kind !== 'beam') for (let i = -2; i <= 2; i++) petals.push({ z: Z(t) + (kind === 'gap' ? gapLen(easy) / 2 : 0) + i * 0.9, x: lx(lastFree), y: 0.9 + 0.5 * (1 - (i * i) / 4) });
    else petals.push({ z: Z(t), x: lx(lastFree), y: 0.25 });
  };
  const column = (t: number) => {
    const open = pick([0, 2]);
    put(t, 'column', open === 0 ? [1, 2] : [0, 1]);
    lastFree = open;
  };
  const sec = (t0: number, t1: number, name: string) => sections.push({ z0: Z(t0), z1: Z(t1), name });
  /** a beat: Normal every `n` s, Easy every `e` s, a little jitter; timed from the end of the last thing (a gap's far edge) */
  const next = (n: number, e: number) => lastT + (easy ? e : n) + (R() - 0.5) * 0.3;
  /** a steer then (shortly after) something across the chute: the pair Matt asked for */
  const pair = (t: number, kind: 'rubble' | 'gap' | 'beam') => {
    heads(t, !easy && R() < 0.35 ? 2 : 1);
    across(lastT + (easy ? 1.5 : 1.05), kind);
  };

  // 1. the drop in
  sec(0, 6, 'drop');
  line(0.8, 'drop', 3.5);
  petalRow(2.0, 3.0, 0);
  petalRow(3.8, 4.8, 2);
  // 2. statues
  sec(6, 20, 'statues');
  heads(8.6, 1);
  let t = next(2.6, 2.6);
  while (t < 19) {
    heads(t, !easy && t > 14 && R() < 0.5 ? 2 : 1);
    t = next(1.4, 2.1);
  }
  // 3. rubble walls (taught on their own, then between statues and in pairs)
  sec(20, 34, 'rubble');
  across(Math.max(t, 22.5), 'rubble');
  t = next(2.6, 3);
  while (t < 33) {
    // (each section asks for its move at least three times, Easy too)
    const r = obstacles.filter((o) => o.kind === 'rubble').length < 3 ? 0.5 : R();
    if (r < 0.4) pair(t, 'rubble');
    else if (r < 0.7) across(t, 'rubble');
    else heads(t, 1);
    t = next(1.5, 2.2);
  }
  const flags = [Z(Math.max(34, lastT + 0.8))];
  petalRow(35, 36, 1);
  // 4. gaps
  sec(36, 50, 'gaps');
  across(Math.max(lastT + 2, 38.5), 'gap');
  t = next(2.6, 3);
  while (t < 49) {
    // (each section asks for its move at least three times, Easy too)
    const r = obstacles.filter((o) => o.kind === 'gap').length < 3 ? 0.5 : R();
    if (r < 0.45) pair(t, 'gap');
    else if (r < 0.75) across(t, 'gap');
    else heads(t, 1);
    t = next(1.5, 2.2);
  }
  flags.push(Z(Math.max(50, lastT + 0.8)));
  petalRow(51, 52, lastFree);
  // 5. low doorways
  sec(52, 66, 'doorways');
  across(Math.max(lastT + 2, 54.5), 'beam');
  t = next(2.6, 3);
  while (t < 65) {
    // (each section asks for its move at least three times, Easy too)
    const r = obstacles.filter((o) => o.kind === 'beam').length < 3 ? 0.5 : R();
    if (r < 0.4) pair(t, 'beam');
    else if (r < 0.65) across(t, 'beam');
    else if (r < 0.85) across(t, 'rubble');
    else heads(t, 1);
    t = next(1.5, 2.2);
  }
  flags.push(Z(Math.max(66, lastT + 0.8)));
  // 6. fallen columns, among all of it
  sec(68, 80, 'columns');
  column(Math.max(lastT + 2, 70));
  t = next(2.4, 3);
  while (t < 79) {
    const r = R();
    if (r < 0.4) column(t);
    else if (r < 0.6) across(t, 'gap');
    else if (r < 0.8) across(t, 'beam');
    else across(t, 'rubble');
    t = next(1.5, 2.2);
  }
  // 7. the climax: pairs and everything
  sec(82, 104, 'climax');
  t = Math.max(next(1.5, 2.2), 82);
  while (t < 102) {
    const r = R();
    if (r < 0.45) pair(t, pick(['rubble', 'gap', 'beam'] as const));
    else if (r < 0.65) across(t, pick(['rubble', 'gap', 'beam'] as const));
    else if (r < 0.8) column(t);
    else heads(t, !easy && R() < 0.5 ? 2 : 1);
    t = next(1.3, 2.0);
  }
  // 8. the light
  const tl = Math.max(104, lastT + 1.5);
  sec(tl, tl + 6, 'light');
  line(tl + 0.5, 'light', 3);
  petalRow(tl + 1, tl + 3, 1, 0.35);
  const length = Z(tl + 6);
  // (a straight chute: the painted far view and the pieces are drawn for one)
  return { easy, speed: v, length, obstacles, petals, flags, lines, sections, bends: [] };
}

// ───────────────────────── the proof ─────────────────────────

/** what can't be right about a course: a row with no clear lane, a clear lane he can't reach in time, too little time to read */
export function checkSlide(c: SlideCourse): string[] {
  const bad: string[] = [];
  const react = c.easy ? 0.6 : 0.35;
  const readS = (SLIDE.far - SLIDE.fade) / c.speed;
  const want = c.easy ? 1.6 : 1.0;
  if (readS < want) bad.push(`obstacles readable only ${readS.toFixed(2)} s ahead (want ${want})`);
  const obs = [...c.obstacles].sort((a, b) => a.z - b.z);
  let free = new Set([0, 1, 2]);
  let lastZ = -99;
  let lastAir = false;
  for (const o of obs) {
    const dt = (o.z - lastZ) / c.speed;
    // room after the last thing: after a jump or a duck he must be down and ready again; after a steer, a moment to react
    const need = lastAir ? AIRTIME * 0.75 + 0.25 : c.easy ? 1.0 : 0.7;
    if (dt < need) bad.push(`z ${o.z}: only ${dt.toFixed(2)} s after the last obstacle`);
    const steer = KINDS[o.kind].beat === 'dodge';
    const open = steer ? [0, 1, 2].filter((l) => !o.lanes.includes(l)) : [0, 1, 2];
    if (!open.length) bad.push(`z ${o.z}: no clear lane`);
    // the lanes he can reach in time from where he could be
    const reach = Math.floor(Math.max(0, dt - react) / LANE_TIME);
    const ok = open.filter((l) => [...free].some((f) => Math.abs(f - l) <= reach));
    if (steer && !ok.length) bad.push(`z ${o.z}: the clear lane can't be reached in ${dt.toFixed(2)} s`);
    // a column: he can jump it from any lane, so every lane stays possible; heads: only the free lanes
    free = steer ? new Set(ok.length ? ok : open) : new Set([0, 1, 2]);
    // a jump over it must fit the window: in the air long enough to clear it at this speed
    const k = KINDS[o.kind];
    if (k.beat === 'jump' || k.beat === 'jumpOrDodge') {
      const cross = o.len / c.speed;
      if (cross > AIRTIME - 0.25) bad.push(`z ${o.z}: a ${o.kind} too long to jump (${cross.toFixed(2)} s)`);
    }
    lastZ = o.z + o.len;
    lastAir = KINDS[o.kind].beat !== 'dodge';
  }
  // every move is asked for: something across the whole chute to jump (rubble, a gap) and to duck (a doorway), and statues to steer round
  for (const k of ['rubble', 'gap', 'beam', 'head'] as const) if (!c.obstacles.some((o) => o.kind === k)) bad.push(`no ${k}`);
  return bad;
}

/** the window (s) in which a jump clears an obstacle: takeoff times that are in the air (above `low`) over all of it */
export function jumpWindow(len: number, speed: number, low = 0): number {
  // y(t) = jumpV t - g t²/2 > low  ⇔  t in [t0, t1]
  const a = SLIDE.g / 2, b = -SLIDE.jumpV, cc = low;
  const d = b * b - 4 * a * cc;
  if (d <= 0) return 0;
  const t0 = (-b - Math.sqrt(d)) / (2 * a), t1 = (-b + Math.sqrt(d)) / (2 * a);
  return Math.max(0, t1 - t0 - len / speed);
}

// ───────────────────────── the run ─────────────────────────

export type SlideEvent =
  | { k: 'hit'; kind: ObstacleKind; taught: boolean }
  | { k: 'fall' }
  | { k: 'petal'; i: number }
  | { k: 'flag'; z: number }
  | { k: 'line'; id: string; text: string; seconds: number }
  | { k: 'jump' }
  | { k: 'land' }
  | { k: 'out' };

/** the slide, step by step (pure: no drawing, no engine; the tests and the bots drive it) */
export class SlideSim {
  readonly c: SlideCourse;
  /** how far down the chute (m), across (m), up (m), and his speed up (m/s) */
  z = 0;
  x = 0;
  y = 0;
  vy = 0;
  /** how much he leans (-1..1, for the picture), and the duck still left (s) */
  lean = 0;
  duckT = 0;
  /** nothing hurts while this runs (s) */
  safeT = 0;
  /** the flag he comes back to */
  flagZ = 0;
  hits = 0;
  stumbles = 0;
  petalsGot = new Set<number>();
  /** obstacles already met (by index: each hurts once) */
  private met = new Set<number>();
  private said = new Set<string>();
  private bufT = 0;
  private overGap = false;
  /** seconds since he passed the end (the light), -1 before */
  outT = -1;
  /** when he last landed (the picture's bump) */
  landedAt = -9;
  done = false;
  clock = 0;
  events: SlideEvent[] = [];
  private obs: Obstacle[];

  constructor(c: SlideCourse) {
    this.c = c;
    this.obs = [...c.obstacles].sort((a, b) => a.z - b.z);
  }

  get grounded() {
    return this.y <= 0 && this.vy <= 0;
  }
  get ducking() {
    return this.duckT > 0 && this.grounded;
  }
  /** 0..1 down the chute */
  ratio() {
    return Math.min(1, this.z / this.c.length);
  }

  step(dt: number, inp: Pick<InputState, 'left' | 'right' | 'jumpPressed' | 'down'>) {
    this.events = [];
    this.clock += dt;
    const c = this.c;
    if (this.outT >= 0) {
      this.outT += dt;
      this.z += c.speed * dt;
      if (this.outT >= SLIDE.outro && !this.done) {
        this.done = true;
        this.events.push({ k: 'out' });
      }
      return;
    }
    // steering: the thumb moves him across; let go and he settles into the nearest lane
    const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    if (dir) this.x += dir * SLIDE.steer * dt;
    else {
      const lane = Math.round(this.x / SLIDE.lane) * SLIDE.lane;
      const d = lane - this.x;
      this.x += Math.sign(d) * Math.min(Math.abs(d), SLIDE.settle * dt);
    }
    const lim = SLIDE.lane + 0.15;
    this.x = Math.max(-lim, Math.min(lim, this.x));
    this.lean += (dir - this.lean) * Math.min(1, dt * 10);
    // jump (a flick up), with a short buffer; duck (a held down)
    if (inp.jumpPressed) this.bufT = SLIDE.buffer;
    else this.bufT = Math.max(0, this.bufT - dt);
    const wasAir = !this.grounded;
    if (this.bufT > 0 && this.grounded && !this.overGap) {
      this.vy = SLIDE.jumpV;
      this.bufT = 0;
      this.duckT = 0;
      this.events.push({ k: 'jump' });
    }
    if (inp.down && this.grounded) this.duckT = SLIDE.duck;
    else this.duckT = Math.max(0, this.duckT - dt);
    this.vy -= SLIDE.g * dt;
    this.y += this.vy * dt;
    if (this.y <= 0 && !this.overGap) {
      this.y = 0;
      this.vy = 0;
      if (wasAir) {
        this.landedAt = this.clock;
        this.events.push({ k: 'land' });
      }
    }
    this.safeT = Math.max(0, this.safeT - dt);
    const z0 = this.z;
    this.z += c.speed * dt;
    // lines (his own, once each run)
    for (const l of c.lines) {
      if (l.z <= this.z && !this.said.has(l.id)) {
        this.said.add(l.id);
        this.events.push({ k: 'line', id: l.id, text: l.text, seconds: l.seconds });
      }
    }
    for (const f of c.flags) {
      if (f > this.flagZ && f <= this.z) {
        this.flagZ = f;
        this.events.push({ k: 'flag', z: f });
      }
    }
    // obstacles: where his body is now
    this.overGap = false;
    for (let i = 0; i < this.obs.length; i++) {
      const o = this.obs[i];
      if (o.z > this.z + 0.5) break;
      if (o.z + o.len < z0 - 0.5) continue;
      const inZ = this.z >= o.z && z0 <= o.z + o.len;
      if (!inZ) continue;
      if (o.kind === 'gap') {
        if (this.y <= 0.02) {
          this.overGap = true;
          if (!this.met.has(i)) this.fallIn(i, o);
        }
        continue;
      }
      if (this.met.has(i) || this.safeT > 0) continue;
      if (!this.touches(o)) continue;
      this.met.add(i);
      this.hurt(o);
    }
    // petals
    for (let i = 0; i < c.petals.length; i++) {
      if (this.petalsGot.has(i)) continue;
      const p = c.petals[i];
      if (p.z < z0 - 0.3 || p.z > this.z + 0.3) continue;
      if (Math.abs(p.x - this.x) < 0.55 && Math.abs(p.y - (this.y + 0.35)) < 0.6) {
        this.petalsGot.add(i);
        this.events.push({ k: 'petal', i });
      }
    }
    if (this.z >= c.length) {
      this.outT = 0;
    }
  }

  /** does his body overlap this obstacle across and up */
  private touches(o: Obstacle): boolean {
    const k = KINDS[o.kind];
    const across = o.lanes.some((l) => Math.abs((l - 1) * SLIDE.lane - this.x) < SLIDE.lane / 2 + SLIDE.bodyHalf - 0.12);
    if (!across) return false;
    if (k.low !== undefined) return this.y < k.low;
    if (k.high !== undefined) return this.y + (this.ducking ? SLIDE.tallDuck : SLIDE.tallUp) > k.high;
    return true; // a head: tall, only steering beats it
  }

  private hurt(o: Obstacle) {
    if (o.taught) {
      // the first of a kind: a stumble, no heart (it is taught: he is told, he learns)
      this.stumbles++;
      this.safeT = 0.6;
      this.events.push({ k: 'hit', kind: o.kind, taught: true });
      return;
    }
    this.hits++;
    this.safeT = SLIDE.safe;
    this.events.push({ k: 'hit', kind: o.kind, taught: false });
  }

  /** into a gap: a heart (or a stumble, the first gap), and he is set down on the far side of it */
  private fallIn(i: number, o: Obstacle) {
    this.met.add(i);
    if (o.taught) this.stumbles++;
    else if (this.safeT <= 0) this.hits++;
    this.events.push(o.taught || this.safeT > 0 ? { k: 'hit', kind: 'gap', taught: true } : { k: 'fall' });
    this.z = o.z + o.len + 0.2;
    this.y = 0;
    this.vy = 0;
    this.overGap = false;
    this.safeT = SLIDE.safe;
  }

  /** a life lost: back to the last flag, everything ahead of it again */
  respawn() {
    this.z = this.flagZ;
    this.x = 0;
    this.y = 0;
    this.vy = 0;
    this.safeT = SLIDE.safe + 0.6;
    for (const i of [...this.met]) if (this.obs[i].z > this.flagZ) this.met.delete(i);
  }

  /** the obstacles in index order (the art draws them) */
  get sorted(): readonly Obstacle[] {
    return this.obs;
  }
  wasMet(i: number) {
    return this.met.has(i);
  }
}

// ───────────────────────── the side-on stretches ─────────────────────────

/** the hall's floor height, and the side-on numbers the engine uses */
export const HALL_G = 580;
/** where the crumble begins (the floor from here to the back wall drops), and the back wall */
export const CRUMBLE_X0 = 3300;
export const CRUMBLE_X1 = 3700;
/** the chamber at the bottom: he comes out of the chute's mouth here (side-on), and the shrine */
export const CHAMBER_X0 = 5200;
export const CHAMBER_EXIT = 7700;
export const SLIDE_LEVEL_W = 8200;
export const SLIDE_LEVEL_H = 1100;

/** what the engine needs about the slide that is not a platform: the crumble, the chute's two courses, the chamber */
export interface SlideStage {
  seed: number;
  /** the platforms that drop at the crumble (ids) */
  crumbleIds: number[];
  crumbleX: number;
  /** where he comes out into the chamber (side-on, flying out of the chute's mouth), and the chamber's flag */
  outAt: { x: number; y: number };
  chamberFlag: { x: number; y: number };
  normal: SlideCourse;
  easy: SlideCourse;
}

/** the stage's length (s) for a quick, sure player: the hall, the crumble, the slide, the chamber */
export function slideSeconds(c: SlideCourse): number {
  const hall = CRUMBLE_X0 / 285 + 3; // the run and its hops
  const crumble = 3;
  const chamber = (CHAMBER_EXIT - CHAMBER_X0) / 285 + 3;
  return Math.round(hall + crumble + c.length / c.speed + SLIDE.outro + chamber);
}

/**
 * 7-4 as a hand-built stage: the side-on hall (a few blocks to hop), the floor that crumbles, a catch floor deep under it (he never
 * falls out of the stage, whatever happens), and the chamber at the bottom. The slide itself is `slide` (the engine hands over to it).
 */
export function buildSlideStage(config: LevelConfig, seed = 1): GeneratedStage & { proto: import('./protoStage.ts').ProtoExtras } {
  const P: Platform[] = [];
  const C: Collectible[] = [];
  let pid = 1, cid = 1;
  const G = HALL_G;
  const plat = (x0: number, x1: number, y: number, h = 90, style: Platform['style'] = 'ruin') => {
    const p: Platform = { id: pid++, x: x0, y, width: x1 - x0, height: h, type: 'solid', style };
    P.push(p);
    return p;
  };
  const flower = (x: number, y: number) => C.push({ id: cid++, type: 'flower', botanicalVariant: 'orchid', x, y, collected: false, bobPhase: (x * 0.031) % 6.28 });
  // the hall: the floor, broken around three blocks to hop (they stand down into the floor), petals over each
  plat(-200, 900, G);
  plat(900, 1080, G - 70, 160); // a fallen block
  plat(1080, 1800, G);
  plat(1800, 1990, G - 90, 180);
  plat(1990, 2600, G);
  plat(2600, 2760, G - 70, 160);
  plat(2760, CRUMBLE_X0, G);
  for (const x of [990, 1895, 2680]) for (let i = -1; i <= 1; i++) flower(x + i * 50, G - 170 - (i === 0 ? 30 : 0));
  for (let x = 400; x < 800; x += 80) flower(x, G - 40);
  // the floor that crumbles (two pieces), and the back wall: past it there is no way on but down
  const c1 = plat(CRUMBLE_X0, CRUMBLE_X0 + 200, G);
  const c2 = plat(CRUMBLE_X0 + 200, CRUMBLE_X1, G);
  plat(CRUMBLE_X1, CRUMBLE_X1 + 160, G - 520, 610);
  // a catch floor far below the crumble (the slide starts before he reaches it; it is only there so nothing can strand him)
  plat(CRUMBLE_X0 - 100, CRUMBLE_X1 + 100, G + 380, 60);
  // the chamber at the bottom: the chute's mouth high in its left wall, a walk with two steps, the shrine
  plat(CHAMBER_X0 - 160, CHAMBER_X0, G - 520, 610); // its left wall (the chute's mouth is in it)
  const floor = plat(CHAMBER_X0, 6200, G);
  plat(6200, 6380, G - 80, 170);
  plat(6380, 7000, G);
  plat(7000, 7160, G - 80, 170);
  plat(7160, SLIDE_LEVEL_W, G);
  for (let x = 5500; x < 6100; x += 90) flower(x, G - 40);
  C.push({ id: cid++, type: 'exit_totem', x: CHAMBER_EXIT, y: G - 30, collected: false, bobPhase: 0 });
  const cfg: LevelConfig = { ...config, objectiveType: 'sprint', levelWidth: SLIDE_LEVEL_W, levelHeight: SLIDE_LEVEL_H };
  const slide: SlideStage = {
    seed,
    crumbleIds: [c1.id, c2.id],
    crumbleX: CRUMBLE_X0 + 40,
    outAt: { x: CHAMBER_X0 + 30, y: G - 300 },
    chamberFlag: { x: CHAMBER_X0 + 260, y: G },
    normal: buildCourse(seed, false),
    easy: buildCourse(seed, true),
  };
  return {
    config: cfg,
    trees: [],
    platforms: P,
    vines: [],
    ropes: [],
    enemies: [],
    boss: null,
    collectibles: C,
    spawnX: 220,
    spawnY: G,
    exitTotemX: CHAMBER_EXIT,
    exitTotemY: G,
    checkpoints: [{ x: slide.chamberFlag.x, y: G, reached: false }],
    // (the level check can't see the slide: the crumble leads on to the chamber's floor)
    links: [c1, c2].map((c) => ({ from: c.id, to: floor.id })),
    meta: { attempt: seed, chunks: [], width: SLIDE_LEVEL_W, timing: { layoutSeconds: slideSeconds(slide.normal), decorSeconds: 0, route: SLIDE_LEVEL_W } },
    proto: { hints: [], covers: [], beats: [[0, CRUMBLE_X0, 'hall'], [CRUMBLE_X0, CRUMBLE_X1, 'crumble'], [CHAMBER_X0, SLIDE_LEVEL_W, 'chamber']], slide },
  };
}
