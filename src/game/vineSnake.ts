/**
 * vineSnake — the brown vine snake on a liana (1-6.md NEW 2, ENG-S2; the cast: Oxybelis, never Chrysopelea, R-165.166). A liana's data
 * may carry one snake (`Vine.snake`): it keeps a beat on the stage's one clock (clock.ts; laid with beat.ts beatDef: off, warn, on) and
 * rides the liana's grip line, the line from its anchor to its foot that he holds and climbs, wherever the liana's own swing has it:
 *
 *   off    not there (in the bough, or in the ferns under the foot)
 *   warn   THE TELL: it shows at its start end, reared, mouth open (the hiss pose), before it moves. Never shorter than SNAKE.tell
 *          (PREDATORS.md §2: "never under 0.5 s"; Easy stretches the clock, never shortens it). Nothing it does in the tell touches him.
 *   on     it travels, head first, by its route:
 *            'down-off'   from the anchor all the way down and off the foot, into the ferns (DK Jr.'s blue Snapjaw: it passes)
 *            'down-back'  from the anchor down to `reach`, waits a beat there, and climbs back up into the bough
 *            'up'         from the foot up to `reach`, waits a beat there, and goes back down off the foot into the ferns
 *          Every trip ends with all of it off the vine (in the bough, or in the ferns), so it never blinks out on the vine.
 *
 * It never bites and never costs a heart: if any of its body reaches his HANDS while it travels, he lets go (the piece calls the host's
 * letGo: a startle hop off the liana). So the one thing it takes is his hold: above him it pushes him lower, below him higher (1-6.md).
 *
 * Distances are along the grip line from the anchor (px): 0 the anchor, the liana's length its foot. Pure (no canvas, no engine).
 */
import type { ClockRead } from './clock.ts';
import type { ClockId } from './stageKit.types.ts';

/** a snake that travels a liana's grip line, or 'still': a FALSE liana, the snake itself hanging stiff from a bough (1-6.md beat 13) */
export type SnakeRoute = 'down-off' | 'down-back' | 'up' | 'still';

/** a liana's snake, as the stage's data lays it (Vine.snake) */
export interface VineSnake {
  route: SnakeRoute;
  /** the beat a travelling snake keeps on the stage's clock (stage.clocks; beat.ts beatDef): off, warn (its tell), on (its trip). A
   *  travelling snake with none never shows (snakeBeatFaults names it); a false liana ('still') has none */
  clock?: ClockId;
  /** its stagger on that clock (StageClock.read's shift, s) */
  shift?: number;
  /** how far its head comes, a share (0..1] of the liana's length from the end it starts at (down-back: from the anchor; up: from the
   *  foot, 1 = up to the anchor): where it waits and turns. Default 1, the whole way. down-off always goes the whole way */
  reach?: number;
}

export const SNAKE = {
  /** its body along the vine (px): the hanging pose's ship size (vineSnakeArt.ts, 115), a little longer than Pokey is tall (89.1 drawn,
   *  heroSprite.ts), thin as a vine */
  body: 115,
  /** how near (px, along the vine) any of it must come to his hands to be touching them */
  touch: 10,
  /** the shortest tell a snake beat may have (s, PREDATORS.md §2) */
  tell: 0.5,
  /** down-back: the share of its trip it waits at the turn (the middle of the trip), its head toward him */
  wait: 0.2,
} as const;

/**
 * A false liana (route 'still'): the snake IS the vine. It hangs straight from its bough and never sweeps (its Vine has no swing), head
 * at its foot; the engine leaves it out of the lianas it draws (the piece draws the snake) but catches it like any liana. Caught, it
 * startles: he lets go (a hop), it drops with him onto what is below, slithers off unhurt and is gone until he respawns.
 */
export const isFalseLiana = (v: { snake?: VineSnake }): boolean => v.snake?.route === 'still';
export const FALSE_LIANA = {
  /** its fall (px/s/s) and how long it slithers off before it is gone (s), at what speed (px/s) */
  fall: 1800,
  slither: 1.1,
  speed: 150,
} as const;

/** where the snake is now: its head and its tail, px along the vine from the anchor; `dir` +1 heading down the vine, -1 up */
export interface SnakeNow {
  /** it is there to be seen */
  shown: boolean;
  /** its tell: shown, reared, not moving, touching nothing */
  tell: boolean;
  /** it is travelling (or waiting at its turn): only now can it touch his hands */
  live: boolean;
  head: number;
  tail: number;
  dir: 1 | -1;
}

const ABSENT: SnakeNow = { shown: false, tell: false, live: false, head: 0, tail: 0, dir: 1 };

/** where on its route a share `s` (0..1) of its trip puts its head, and which way it is heading, on a liana `len` px long */
function along(sn: VineSnake, len: number, s: number): { head: number; dir: 1 | -1 } {
  const reach = Math.max(0, Math.min(1, sn.reach ?? 1)) * len;
  const B = SNAKE.body;
  if (sn.route === 'down-off') return { head: s * (len + B), dir: 1 };
  // there and back: out to its turn in the first part, wait there, then back the way it came until all of it is off the vine
  const go = (1 - SNAKE.wait) / 2;
  const out = s < go ? s / go : s < go + SNAKE.wait ? 1 : -1;
  const back = out < 0 ? (s - go - SNAKE.wait) / go : 0;
  if (sn.route === 'down-back') return out >= 0 ? { head: out * reach, dir: 1 } : { head: reach - back * (reach + B), dir: -1 };
  // up from the foot (its head leads up; going back down, its head leads down again)
  return out >= 0 ? { head: len - out * reach, dir: -1 } : { head: len - reach + back * (reach + B), dir: 1 };
}

/** the snake on a liana `len` px long, for its clock's read now */
export function snakeNow(sn: VineSnake, len: number, read: Pick<ClockRead, 'phase' | 'u'>): SnakeNow {
  if (sn.route === 'still') return ABSENT;
  if (read.phase === 'warn') {
    // (at its start end, its head just onto the vine: down from the anchor, or up from the foot)
    const a = along(sn, len, 0);
    return { shown: true, tell: true, live: false, head: a.head, tail: a.head - a.dir * SNAKE.body, dir: a.dir };
  }
  if (read.phase !== 'on') return ABSENT;
  const a = along(sn, len, Math.max(0, Math.min(1, read.u)));
  // (the body trails behind the head, back the way it came: never above the anchor, never below the foot while on the vine)
  const tail = a.head - a.dir * SNAKE.body;
  return { shown: true, tell: false, live: true, head: a.head, tail, dir: a.dir };
}

/** the part of the snake on the vine (px from the anchor, low..high), clipped to the vine; null when none of it is on the vine */
export function onVine(n: SnakeNow, len: number): { from: number; to: number } | null {
  const from = Math.max(0, Math.min(n.head, n.tail));
  const to = Math.min(len, Math.max(n.head, n.tail));
  // (a hair of it is none of it: the trip's end lands its tail on the anchor or the foot to within rounding)
  return to > from + 1e-6 ? { from, to } : null;
}

/** does it touch his hands, `hands` px down the vine from the anchor? Only while it travels: the tell never touches him */
export function snakeTouches(n: SnakeNow, len: number, hands: number): boolean {
  if (!n.live) return false;
  const on = onVine(n, len);
  return !!on && hands >= on.from - SNAKE.touch && hands <= on.to + SNAKE.touch;
}

/** a snake beat's faults, in words (the builder's check, and the tests'): its tell at least SNAKE.tell, a trip to make */
export function snakeBeatFaults(sn: VineSnake, phases: ReadonlyArray<{ name: string; seconds: number }>): string[] {
  const bad: string[] = [];
  if (sn.route === 'still') return bad;
  if (!sn.clock) return [`a travelling snake (${sn.route}) has no beat`];
  const warn = phases.filter((p) => p.name === 'warn');
  const on = phases.filter((p) => p.name === 'on');
  if (!warn.length) bad.push(`snake on ${sn.clock}: its beat has no tell (warn)`);
  for (const w of warn) if (w.seconds < SNAKE.tell) bad.push(`snake on ${sn.clock}: its tell is ${w.seconds} s, under ${SNAKE.tell} s (PREDATORS.md §2)`);
  if (!on.length) bad.push(`snake on ${sn.clock}: its beat has no trip (on)`);
  if (sn.reach !== undefined && !(sn.reach > 0 && sn.reach <= 1)) bad.push(`snake on ${sn.clock}: reach ${sn.reach} is not a share of the liana (0..1]`);
  return bad;
}
