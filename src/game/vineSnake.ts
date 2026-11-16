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
import type { ClockRead, PhaseName } from './clock.ts';
import type { ClockId } from './stageKit.types.ts';
import { AHEAD, focusHero, focusY, settledView, SWING_CAM, VIEW_PHONES, FOCUS_CAM, type Box } from './cameraFollow.ts';
import { VINE_HANG } from './heroVineData.ts';

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
  /** its tell pose's height (px): the hiss, reared on the bough or the liana's foot (vineSnakeArt.ts draws it this tall) */
  tellH: 60,
  /** the least time (s) a snake coming at his grip is in the clear view before it reaches it, on the shortest sideways view (1-6.md:
   *  "a snake coming down must be in view 1 s+ before it reaches his grip"; snakeViewFaults) */
  seen: 1,
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
  /** startled, it flings itself off the bough AWAY from him (px/s across) so it lands clear of him, never on him (the lead, 11-14: on
   *  ENG-S2's still it landed overlapping Pokey and read as an attack) */
  fling: 300,
  /** the least room (px) between his body and its slithering body on the floor */
  clear: 16,
  /** how near (px across) he comes before the view keeps its foot in (its head, the tell, PieceHost.focus): a liana's reach and more */
  near: 520,
} as const;

/**
 * Where a startled false liana's slither starts on the floor, clear of him: its pose `w` px long, centred at `x`, heading `away` (+1 right),
 * him (his body x0..x1). If any of it would lie over him, it starts FALSE_LIANA.clear past his far side instead: it never lands on him
 * and never slithers through him.
 */
export function slitherClear(x: number, w: number, away: number, me: { x0: number; x1: number }): number {
  const near = away > 0 ? x - w / 2 : x + w / 2;
  if (away > 0 ? near >= me.x1 + FALSE_LIANA.clear : near <= me.x0 - FALSE_LIANA.clear) return x;
  return away > 0 ? me.x1 + FALSE_LIANA.clear + w / 2 : me.x0 - FALSE_LIANA.clear - w / 2;
}

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

/**
 * The box a snake's piece asks the view to keep in while it comes at him (PieceHost.focus, cameraFollow.ts focusY): his body (feet at
 * hx, hy) and the end it starts from with its tell pose reared there (over the anchor at ax, ay; or on the liana's foot), the liana at
 * `angle` from straight down. While it threatens him its trip lies between the two, so it is in the box too. The same box gen2's view
 * verdict judges (snakeViewFaults), so the check and the screen agree.
 */
export function snakeFocusBox(sn: VineSnake, len: number, ax: number, ay: number, angle: number, hx: number, hy: number): Box {
  const d = sn.route === 'up' ? len : 0;
  const x = ax + Math.sin(angle) * d;
  const y = ay + Math.cos(angle) * d;
  const me = focusHero(hx, hy);
  return { x0: Math.min(x - SNAKE.tellH, me.x0), x1: Math.max(x + SNAKE.tellH, me.x1), y0: Math.min(y - SNAKE.tellH, me.y0), y1: Math.max(y, me.y1) };
}

/**
 * Is the snake coming at his hands (`hands` px down the liana), so the view should keep it in: in its tell; due to tell or travel within
 * FOCUS_CAM.lead s (`ahead`: its clock read that far ahead), so the view is there by the tell's first frame; or travelling with any of it
 * still on the side of his hands it came from (over them for a snake from the anchor, under them for one from the foot).
 */
export function snakeComing(sn: VineSnake, n: SnakeNow, ahead: Pick<ClockRead, 'phase'>, len: number, hands: number): boolean {
  if (sn.route === 'still') return false;
  if (n.tell) return true;
  if (!n.live) return ahead.phase === 'warn' || ahead.phase === 'on';
  const on = onVine(n, len);
  if (!on) return false;
  return sn.route === 'up' ? on.to > hands : on.from < hands;
}

/** where a snake's liana hangs: its anchor's height (world px down from the level's top) and the level's height (px) */
export type SnakeSite = { anchorY: number; levelH: number };
/** a liana with room all round it (no level top or foot near): the view verdict's bare world */
export const ROOMY_SITE: SnakeSite = { anchorY: 1500, levelH: 4000 };

/** a phone's settled views (cameraFollow.ts settledView) for the view verdict: sideways one; upright, the swing's widening from 1 to
 *  SWING_CAM.out, and where on the way the view first shows sky over the level (the band is tallest in world px there) */
function snakeViewsOn(w: number, h: number, levelH: number): Array<{ name: string; vh: number; band: number; lo: number; hi: number }> {
  if (h >= w) {
    const ks = [1, SWING_CAM.out];
    const k1 = settledView(w, h, levelH, 1);
    const kSky = levelH / k1.vh;
    if (kSky > 1 && kSky < SWING_CAM.out) ks.push(kSky);
    return ks.map((k) => ({ name: `${w}x${h} upright${k > 1 ? ` widened ${k.toFixed(2)}x` : ''}`, ...settledView(w, h, levelH, k) }));
  }
  return [{ name: `${w}x${h} sideways`, ...settledView(w, h, levelH, 1) }];
}

/**
 * A snake lay's view faults (gen2's verdict; ENG-S3 CAM-THREAT, ENG-S4 the level's top): him on the liana at every hold from its foot
 * up, straight down (the tallest box), on the phones the framing names (`phones`, default cameraFollow.ts VIEW_PHONES: the squattest
 * sideways one and three upright, each widened as a swing widens it), the view where its focus puts it (focusY on snakeFocusBox) and then
 * where the level lets it be (settledView: a normal stage never shows past its top, so a liana hung within the HUD band of the level's
 * top hides its tell whatever the camera does; 6-3's hangs 124 px down). The snake must be in the clear view (under the HUD band, over
 * his feet's foot) for SNAKE.seen s before it reaches his hands, or for all the time it gives him if that is less (a high hold under a
 * snake from the anchor is the hold it takes: its whole tell and trip in view is the camera's part). At the lowest hold, his way out
 * from under it, it must give SNAKE.seen in full. Walks one beat at 30 steps a second.
 */
export function snakeViewFaults(sn: VineSnake, len: number, phases: ReadonlyArray<{ name: string; seconds: number }>, site: SnakeSite = ROOMY_SITE, phones: ReadonlyArray<readonly [number, number]> = [...VIEW_PHONES.side, ...VIEW_PHONES.up]): string[] {
  if (sn.route === 'still' || !sn.clock) return [];
  const dt = 1 / 30;
  const period = phases.reduce((a, p) => a + p.seconds, 0);
  if (!(period > 0)) return [];
  // (the beat from the start of its first tell: two periods, so a beat that starts mid-trip is read whole)
  const firstWarn = phases.findIndex((p) => p.name === 'warn');
  if (firstWarn < 0) return [];
  const start = phases.slice(0, firstWarn).reduce((a, p) => a + p.seconds, 0);
  const readAt = (t: number): { phase: PhaseName; u: number } => {
    let c = (((start + t) % period) + period) % period;
    for (const p of phases) {
      if (c < p.seconds) return { phase: p.name as PhaseName, u: c / p.seconds };
      c -= p.seconds;
    }
    return { phase: phases[phases.length - 1].name as PhaseName, u: 1 };
  };
  const ay = site.anchorY;
  const views = phones.flatMap(([w, h]) => snakeViewsOn(w, h, site.levelH));
  const bad: string[] = [];
  for (let hold = len; hold >= VINE_HANG + SNAKE.touch + 20; hold -= 10) {
    const hands = Math.max(0, Math.min(len, hold - VINE_HANG));
    // (the snake as it comes, step by step, until it reaches his hands: the tell seen whole, its pose reared SNAKE.tellH over its start
    // end; on the trip, any of it on the vine; world y)
    const spans: Array<{ tell: boolean; from: number; to: number } | null> = [];
    let touched = false;
    for (let t = 0; t < period; t += dt) {
      const n = snakeNow(sn, len, readAt(t));
      if (!n.shown) continue;
      if (snakeTouches(n, len, hands)) {
        touched = true;
        break;
      }
      const s = n.tell ? { from: n.head - SNAKE.tellH, to: n.head } : onVine(n, len);
      spans.push(s ? { tell: n.tell, from: ay + s.from, to: ay + s.to } : null);
    }
    if (!touched) continue;
    const gave = spans.length * dt;
    const want = hold === len ? SNAKE.seen : Math.min(SNAKE.seen, gave);
    const box = snakeFocusBox(sn, len, 0, ay, 0, 0, ay + hold);
    const me = focusHero(0, ay + hold);
    for (const v of views) {
      const aim = focusY(me.y0 - v.band, box, me, v.vh, v.band);
      const top = Math.max(v.lo, Math.min(v.hi, aim));
      const y0 = top + v.band, y1 = top + v.vh * AHEAD.heroPad.b;
      let seen = 0, tells = 0, tellsSeen = 0;
      for (const s of spans) {
        if (!s) continue;
        const inView = s.tell ? s.from >= y0 && s.to <= y1 : s.to >= y0 && s.from <= y1;
        if (inView) seen += dt;
        if (s.tell) (tells++, inView && tellsSeen++);
      }
      const where = `held at ${hold} px down a ${len} px liana hung ${Math.round(ay)} px under the level's top, ${v.name}`;
      if (seen + 1e-6 < want - dt) {
        bad.push(`snake on ${sn.clock} (${sn.route}): ${where}: it is in the clear view ${seen.toFixed(2)} s of the ${gave.toFixed(2)} s before it reaches his hands, under ${want.toFixed(2)} s (1-6.md: in view 1 s+)`);
        break;
      }
      // (where the focus box fits the clear view's height, the camera's promise is the whole tell: a tell no view can show is no tell,
      // PREDATORS.md §2; it is the level's top, or its foot, that hides it there)
      const fits = box.y1 - box.y0 + 2 * FOCUS_CAM.pad <= v.vh * AHEAD.heroPad.b - v.band;
      if (fits && tellsSeen + 1 < tells) {
        bad.push(`snake on ${sn.clock} (${sn.route}): ${where}: its tell is whole in the clear view ${tellsSeen} of its ${tells} frames, though the view fits it and him (the level's top or foot keeps the view off it)`);
        break;
      }
    }
  }
  return bad;
}

/**
 * What is unfair about the vine snakes a stage carries, in words (none: they may be laid; rideLay.ts rideFaults' shape, for the snake
 * lay and the stage's builder to call): each travelling snake's beat is in the stage, has a tell of SNAKE.tell s or more and a trip
 * (snakeBeatFaults), and shows the snake in the clear view SNAKE.seen s before it reaches his hands on the shortest sideways view
 * (snakeViewFaults); a false liana hangs still (no swing) from a liana.
 */
export function snakeFaults(st: { config: { levelHeight: number }; vines: ReadonlyArray<{ id: number; topY: number; bottomY: number; vineType?: string; swingAmp?: number; snake?: VineSnake }>; clocks?: ReadonlyArray<{ id: ClockId; phases: ReadonlyArray<{ name: string; seconds: number }> }> }): string[] {
  const out: string[] = [];
  for (const v of st.vines) {
    const sn = v.snake;
    if (!sn) continue;
    const name = `vine ${v.id}`;
    if (v.vineType === 'tree_climb') {
      out.push(`${name}: a snake on a climbing vine (it rides a liana's grip line only)`);
      continue;
    }
    if (sn.route === 'still') {
      if ((v.swingAmp ?? 0) !== 0) out.push(`${name}: a false liana swings (it hangs still: never sweeping an arc is its tell)`);
      continue;
    }
    const def = st.clocks?.find((c) => c.id === sn.clock);
    if (!def) {
      out.push(`${name}: its snake's beat ${sn.clock ?? '(none)'} is not in the stage`);
      continue;
    }
    const len = v.bottomY - v.topY;
    for (const f of [...snakeBeatFaults(sn, def.phases), ...snakeViewFaults(sn, len, def.phases, { anchorY: v.topY, levelH: st.config.levelHeight })]) out.push(`${name}: ${f}`);
  }
  return out;
}
