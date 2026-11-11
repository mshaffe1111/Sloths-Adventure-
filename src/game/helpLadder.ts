/**
 * The help ladder (R-165.62, fix A2; reference/ONE-ONE-FIX-PLAN.md "The help schedule", the lead's ruling 11-09 and 11-11): a player set
 * back again and again at one piece of 1-1 gets help, by setting. It is the ONE place that decides help in 1-1; the engine only reports
 * put-backs and standing places to it and carries out what it answers. Off on every other stage (help.md §5 owns the rest, later).
 *
 *   Put-backs at the piece | Easy (steps in by itself)              | Normal (offered; the stage never changes by itself)
 *   3                      | Dot says the move the piece needs       | the same
 *   5                      | quiet: a pad tap is a full jump there   | nothing
 *   8                      | the steps grow (kept for the run)       | nothing
 *   12                     | (past)                                  | Dot offers the step; a yes grows it; after a no she asks once
 *                          |                                         | more 8 put-backs later, then never at that piece
 *
 * Counted per piece (the piece he was trying to reach when he fell: the piece at the x of the fall). Reset by standing on the piece
 * beyond, or the stage ending; NOT by a put-back, a pause, time, a refused offer or a step already given. Each rung fires once a piece.
 * The words are the story keeper's (reference/specs/help-lines.md), word for word.
 */
import { PHYS } from './physics.ts';

export type Setting = 'easy' | 'normal';
export type Rung = 'move' | 'pad' | 'step' | 'offer' | 'reask';
export type Move = 'single' | 'double' | 'bounce';

/** the schedule, put-backs at one piece (frozen by the lead's ruling) */
export const RUNGS = { move: 3, pad: 5, step: 8, offer: 12, reaskAfter: 8 } as const;
export type Rungs = { [K in keyof typeof RUNGS]: number };

/** Dot's lines (help-lines.md §1-3, word for word) */
export const MOVE_LINES: Record<Move, { touch: string; pad: string }> = {
  single: { touch: 'Run first, then flick up and forward!', pad: 'Run first, then hold Jump. Big one!' },
  double: { touch: 'Jump, then flick up again in the air!', pad: 'Jump, then hold Jump again in the air!' },
  bounce: { touch: 'Land right on the mushroom. Boing!', pad: 'Land right on the mushroom. Boing!' },
};
export const STEP_LINE = 'Ooh, look! A step. Up you go.';
/** the one sprite every grown step is drawn with, and the offer's YES picture (the story keeper: YES shows exactly what grows) */
export const STEP_CUT = 'w1-boulder-grey-moss';
/** a ladder line is taken down this long (s of play) after it is said: her own clock holds while he blinks after each set-back */
export const LINE_UP_S = 8;
/** a ladder line never put on screen in this long (game seconds; Quiet, or her bubble busy) is taken down all the same */
export const LINE_WAIT_S = 30;
/**
 * Her bubble tells the engine when a ladder line is first on screen (DotGuide.tsx, where the queue's onScreen is called; RealPlay at once):
 * the line's LINE_UP_S count from then, not from when the engine sent it (INT-1-1, the Critic's find: the 8 s ran out unseen)
 */
let onScreenText: string | null = null;
export function helpLineOnScreen(text: string): void {
  if (HELP_LINES.has(text)) onScreenText = text;
}
/** the ladder line reported on screen since the last call, or null (the engine reads it each frame) */
export function takeHelpOnScreen(): string | null {
  const t = onScreenText;
  onScreenText = null;
  return t;
}
export const OFFER_LINE = "Want a little step? I won't tell anyone.";
export const REASK_LINE = "Still want that step? It's yours.";

/** every line the ladder says (Dot's guide shows these as struggle help: helpGuideLine) */
export const HELP_LINES: ReadonlySet<string> = new Set([...Object.values(MOVE_LINES).flatMap((m) => [m.touch, m.pad]), STEP_LINE]);

/**
 * How Dot's guide shows a line the engine sent (DotGuide.tsx engineLine): undefined when it is not one of the ladder's; null when it is
 * but the setting is Quiet (no line; the step still grows and the offer still shows, their own pictures); else the line, as struggle
 * help that her tip rules don't judge again (the ladder is the one place that decides help: a move already taught this stage is the
 * point, not a repeat)
 */
export function helpGuideLine(text: string, help: 'teach' | 'reminders' | 'quiet', ms?: number): { key: string; text: string; kind: 'struggle'; who: 'Dot'; source: 'struggle'; soon: true; anyway: true; ms?: number } | null | undefined {
  if (!HELP_LINES.has(text)) return undefined;
  if (help === 'quiet') return null;
  // (`soon`: due now, so neither Tips' 30 s gap nor its busy count holds it back; a fall in progress still does)
  // (keyed as any engine line is, `engine:<words>`: the engine's "passed" for it, DotGuide passedLine, takes it down)
  // (`anyway`: it starts while he blinks after a set-back or is in the air: a player set back every 2 s is always one or the other)
  return { key: `engine:${text}`, text, kind: 'struggle', who: 'Dot', source: 'struggle', soon: true, anyway: true, ms };
}

/**
 * Puts a ladder line in Dot's queue (DotGuide.tsx engineLine): the stage's own move tips, up or waiting, give way first (the ladder's line
 * is the better one now, about the same move; the stage's double tip stayed up until the double was done, holding the help behind it)
 */
export function pushHelpLine<L extends { kind: string; source?: string }>(q: { clear(f: (l: L) => boolean, now: number, at?: boolean): void; push(l: L, now: number): void }, line: L, now: number): void {
  // (at once, not after its minimum time: her clock stands still while he blinks, so a set-back every 2 s held the stage's own tip up for
  // good and the ladder's line behind it, INT-1-1 in the browser)
  q.clear((l) => l.kind === 'teach' && l.source === 'engine', now, true);
  q.push(line, now);
}

export interface Piece {
  k: string;
  x0: number;
  x1: number;
}

interface Count {
  n: number;
  fired: Set<Rung>;
  /** Normal: the put-back count of the last "no" (the re-ask is 8 later), and how many noes */
  noAt: number;
  noes: number;
  /** the offer is up, waiting for an answer */
  asking: boolean;
}

/** what a put-back asks the engine to do (in order) */
export interface HelpAct {
  rung: Rung;
  piece: Piece;
  count: number;
}

export class HelpLadder {
  private counts = new Map<string, Count>();
  /** the piece the latest put-back counted for, until he stands beyond it (the pad's full jump is for it) */
  private active: Piece | null = null;
  /** the least x1 of the pieces with a count: standing at or past it resets that piece (one compare a grounded frame) */
  private beyond = Infinity;

  constructor(
    readonly setting: Setting,
    private readonly pieces: readonly Piece[],
    /** the schedule (the tests plant a wrong one to show they catch it) */
    private readonly r: Rungs = RUNGS,
    /** whether anything can grow at a piece: where nothing can, Dot never promises a step (no step rung, no offer, no re-ask) */
    private readonly canGrow: (p: Piece) => boolean = () => true,
  ) {}

  /** the piece at world x (the last one whose span holds it), or null at a seam */
  pieceAt(x: number): Piece | null {
    let hit: Piece | null = null;
    for (const p of this.pieces) if (x >= p.x0 && x < p.x1) hit = p;
    return hit;
  }

  count(k: string): number {
    return this.counts.get(k)?.n ?? 0;
  }

  /** a put-back while heading for world x: counts it at that piece and answers the rungs it reaches (each once a piece) */
  putBack(x: number): HelpAct[] {
    const piece = this.pieceAt(x);
    if (!piece) return [];
    let c = this.counts.get(piece.k);
    if (!c) this.counts.set(piece.k, (c = { n: 0, fired: new Set(), noAt: -1, noes: 0, asking: false }));
    c.n++;
    this.active = piece;
    this.beyond = Math.min(this.beyond, piece.x1);
    const out: HelpAct[] = [];
    const fire = (rung: Rung) => {
      if (c!.fired.has(rung)) return;
      c!.fired.add(rung);
      out.push({ rung, piece, count: c!.n });
    };
    if (c.n === this.r.move) fire('move');
    if (this.setting === 'easy') {
      if (c.n === this.r.pad) fire('pad');
      if (c.n === this.r.step && this.canGrow(piece)) fire('step');
    } else if (!c.asking) {
      if (c.n === this.r.offer && !c.fired.has('step') && this.canGrow(piece)) fire('offer');
      else if (c.noes === 1 && c.n === c.noAt + this.r.reaskAfter && this.canGrow(piece)) fire('reask');
      if (out.some((a) => a.rung === 'offer' || a.rung === 'reask')) c.asking = true;
    }
    return out;
  }

  /** Normal's answer to the offer at a piece: true when the steps should grow */
  answer(k: string, yes: boolean): boolean {
    const c = this.counts.get(k);
    if (!c || !c.asking) return false;
    c.asking = false;
    if (yes) {
      c.fired.add('step');
      return true;
    }
    c.noes++;
    c.noAt = c.n;
    return false;
  }

  /** he stands at world x (only called on a grounded frame): past a counted piece, its count resets */
  stood(x: number): void {
    if (x < this.beyond) return;
    let least = Infinity;
    for (const [k, c] of this.counts) {
      const p = this.pieces.find((q) => q.k === k)!;
      if (x >= p.x1) {
        c.n = 0;
        if (this.active?.k === k) this.active = null;
      } else if (c.n > 0) least = Math.min(least, p.x1);
    }
    this.beyond = least;
  }

  /** Easy's rung 5: a tap on the pad's Jump is a full jump at the piece he is being set back at */
  padFull(): boolean {
    if (this.setting !== 'easy' || !this.active) return false;
    return !!this.counts.get(this.active.k)?.fired.has('pad');
  }

  /** the stage ended (cleared, left, restarted): every count goes */
  end(): void {
    this.counts.clear();
    this.active = null;
    this.beyond = Infinity;
  }
}

// ───────────────────────────── the pad's seam ─────────────────────────────
// (padControl reads this; the engine sets the ladder of the stage on now, and clears it when the stage ends)
let current: HelpLadder | null = null;
export function setHelpLadder(l: HelpLadder | null): void {
  current = l;
}
/** a stage's help ladder is on (1-1): Dot's older struggle helpers stay quiet there (DotGuide.tsx) */
export function helpLadderOn(): boolean {
  return !!current;
}
/** true while a tap on the pad's Jump should be a full jump (Easy's rung 5 at the piece he is at) */
export function padFullJump(): boolean {
  return !!current && current.padFull();
}

// ───────────────────────────── the move a piece needs ─────────────────────────────
/** what the piece asks of him: its section's own needs (gen2 w1.ts `needs`), bounce first, then the double; else a long single jump */
export function pieceMove(needs: readonly string[] | undefined): Move {
  if (needs?.includes('bounce')) return 'bounce';
  if (needs?.includes('double')) return 'double';
  return 'single';
}
/** the move a piece needs, read from its walking surface (skyline): a mushroom in it is the bounce; a join a single jump can't make is the double */
export function pieceMoveLaid(piece: Piece, solids: readonly Box[], mushrooms: readonly Box[], singleGap: (dyUp: number) => number): Move {
  if (mushrooms.some((m) => m.x + m.width > piece.x0 && m.x < piece.x1)) return 'bounce';
  const segs = skyline(piece, solids);
  for (let i = 0; i + 1 < segs.length; i++) {
    const a = segs[i], b = segs[i + 1];
    const rise = a.y - b.y;
    if (b.x0 > a.x1 + 1 ? b.x0 - a.x1 > singleGap(rise) : rise > 0 && singleGap(rise) < 0) return 'double';
  }
  return 'single';
}

/** one stretch of the walking surface: the top a foot stands on from x0 to x1, and the piece it is */
export interface Seg {
  x0: number;
  x1: number;
  y: number;
  /** the bottom of the piece whose top it is (a stump reaches the ground; a floating log does not) */
  bottom: number;
  bouncy: boolean;
}
/**
 * A piece's walking surface, read from the piece as laid (the Critic's find, 11-11: a guess that dropped any ground under a higher
 * piece made fake gaps and walls). The road is every solid or bouncy piece that is not a catch (the builder marks those: a fall's
 * floor) and not wholly under a higher piece floating over it (a log laid under a log). Its surface at each x is the highest road top
 * there: ground with a stone resting on it is ground, then the stone. Runs from the road piece before the piece to the one after it.
 */
export function skyline(piece: Piece, solids: readonly Box[]): Seg[] {
  const hidden = (a: Box) => solids.some((b) => b !== a && !b.catch && b.y + b.height < a.y - 2 && b.x <= a.x + 1 && b.x + b.width >= a.x + a.width - 1);
  const road = solids.filter((a) => !a.catch && a.width >= 24 && !hidden(a));
  const lo = piece.x0 - 400, hi = piece.x1 + 400;
  const near = road.filter((a) => a.x + a.width > lo && a.x < hi);
  const xs = [...new Set(near.flatMap((a) => [a.x, a.x + a.width]))].filter((x) => x >= lo && x <= hi).sort((a, b) => a - b);
  const out: Seg[] = [];
  for (let k = 0; k + 1 < xs.length; k++) {
    const m = (xs[k] + xs[k + 1]) / 2;
    let top: Box | null = null;
    for (const a of near) if (m > a.x && m < a.x + a.width && (!top || a.y < top.y)) top = a;
    if (!top) continue;
    const last = out[out.length - 1];
    const bottom = top.y + top.height;
    if (last && Math.abs(last.x1 - xs[k]) < 0.5 && last.y === top.y && last.bottom === bottom && last.bouncy === !!top.bouncy) last.x1 = xs[k + 1];
    else out.push({ x0: xs[k], x1: xs[k + 1], y: top.y, bottom, bouncy: !!top.bouncy });
  }
  return out;
}
export function moveLine(m: Move, mode: 'screen' | 'pad' | 'keys'): string {
  return mode === 'screen' ? MOVE_LINES[m].touch : MOVE_LINES[m].pad;
}

// ───────────────────────────── the grown steps ─────────────────────────────
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
  /** a mushroom: it gives the rise itself, so no stair grows where it does */
  bouncy?: boolean;
  /** the builder's catch under a gap (a fall's floor): not road */
  catch?: boolean;
  /** a grown plank in a gap (it may float); every other grown box is a rock that stands */
  plank?: boolean;
}
/** the climb a step leaves (px): a plain jump clears it (the lead's ruling 11-11) */
export const STEP_LEFT = 60;
export const STEP_W = 80;
/** the top tread of a stair, where the ground allows (a run-up before the last jump) */
export const TOP_W = 160;
export const PAD_W = 60;
/**
 * a pad leaves this much open at each side of its gap (the lead's ruling 11-11, INT-1-1 PUSHBACK 1): the pad is gap - 2 x PAD_EDGE wide,
 * PAD_W at the least, so a full plain jump from anywhere up to the lip lands on it (a 60 px pad was overshot from the lip: seed 3868
 * w1-two-answers); 154 px on the 254 px double test
 */
export const PAD_EDGE = 50;

/** a mushroom on the lower stretch this close before a face gives that rise (px): no stair there */
export const BOUNCE_NEAR = 200;
/** how high a mushroom's bounce alone carries him over its cap, with a margin (px): 80% of bounceV^2 / 2g (about 145) */
export const BOUNCE_ALONE = (0.8 * PHYS.bounceV * PHYS.bounceV) / (2 * PHYS.gravUp);
/**
 * What grows at a piece (the lead's ruling 11-11, after the Critic's find): along its walking surface (skyline), every rise over
 * STEP_LEFT gets a STAIR at its foot: rocks standing on the lower stretch (each on the ground, never floating), every face STEP_LEFT or
 * less, every tread at least STEP_W wide, the top tread within STEP_LEFT under the lip. A gap the last plain jump still can't clear
 * (`plainGap(dyUp)` for the climb left) gets a plank at its middle, PAD_EDGE short of each side (planks may float: Matt, 11-06), no more than STEP_LEFT under
 * the far side, with a stair up to it if the near side is lower still. A rise a mushroom gives grows nothing.
 */
/** rises a stair had no room for, since the last read (the sweep test reports them) */
let stairsLeftOut = 0;
export function takeStairsLeftOut(): number {
  const n = stairsLeftOut;
  stairsLeftOut = 0;
  return n;
}
export function stepsFor(piece: Piece, solids: readonly Box[], plainGap: (dyUp: number) => number): Box[] {
  return stepPlan(piece, solids, plainGap).boxes;
}
/**
 * What grows at a piece, and how many joins in it a plain jump still can't make after it grows (`unsolved`: a climb or a gap no plain
 * jump makes, where no stair or pad had room). The ladder promises a step only where something grows AND nothing is left unsolved
 * (INT-1-1: on the new 1-1 a step grown at one join while the piece's real climb had no room let Dot promise help that did not get him
 * through, w1-hollow-twoway on Normal, seed 1136)
 */
export function stepPlan(piece: Piece, solids: readonly Box[], plainGap: (dyUp: number) => number): { boxes: Box[]; unsolved: number } {
  let unsolved = 0;
  const segs = skyline(piece, solids);
  const mushrooms = solids.filter((m) => m.bouncy);
  const out: Box[] = [];
  /**
   * a stair up to `lipY`, ending at x `face`, built leftwards from the lip: each rock's top is STEP_LEFT under the tread to its right;
   * its foot is the lowest surface under it (a rock as wide as a tread may take in a narrow stump: it stands on the ground beside it,
   * the stump inside it, never over air); it stops as soon as the surface under it is within STEP_LEFT of the tread above
   */
  /** true when the stair is laid or none is needed there; false when it had no room */
  const stair = (a: Seg, face: number, lipY: number): boolean => {
    if (a.y - lipY <= STEP_LEFT || a.bouncy) return true;
    // (a mushroom just before the face whose bounce alone reaches the lip gives the rise: nothing grows; one that needs a second jump
    // after it does not, and the stair grows over it)
    if (mushrooms.some((m) => m.x + m.width > face - BOUNCE_NEAR && m.x < face && m.y + m.height >= a.y - 2 && m.y - lipY <= BOUNCE_ALONE)) return true;
    if (build(a, face, lipY, TOP_W) || build(a, face, lipY, STEP_W)) return true;
    stairsLeftOut++;
    return false;
  };
  /** lays one stair (the top tread `topW` wide where it fits); false, laying nothing, when the ground has no room for all of it */
  const build = (a: Seg, face: number, lipY: number, topW: number): boolean => {
    // (first where the rocks go: STEP_W treads leftwards, each on the lowest surface under it, until the surface is within reach)
    const rocks: Array<{ x: number; w: number; foot: number; high: number }> = [];
    let cur = lipY, x = face, endY = NaN;
    for (let guard = 0; guard < 12; guard++) {
      const s0 = segs.find((q) => q.x0 < x - 0.5 && q.x1 >= x - 0.5);
      if (s0 && s0.y - cur <= STEP_LEFT) {
        endY = s0.y;
        break;
      }
      if (!s0) break;
      // (the level it stands on: the stretch at its right edge)
      const base = s0;
      // (one level under it: a stump wholly inside it that stands on its level it takes in; anything else under it (a ledge reaching in,
      // a dip, a floating log) and there is no room for this stair: never sunk in a ledge, never over a hole. INT-1-1: the old layouts'
      // trims and narrow-stump swap are gone; on the re-laid 1-1 dropping them loses no help and breaks nothing, helpSweep.ts)
      const x0 = x - (rocks.length ? STEP_W : topW);
      if (segs.some((q) => q.x1 > x0 + 0.5 && q.x0 < x - 0.5 && Math.abs(q.y - base.y) > 2 && !(q.y < base.y && q.x0 >= x0 - 0.5 && q.bottom >= base.y - 2))) return false;
      const under = segs.filter((q) => q.x1 > x0 + 0.5 && q.x0 < x - 0.5);
      rocks.push({ x: x0, w: x - x0, foot: base.y, high: Math.min(...under.map((q) => q.y)) });
      cur += STEP_LEFT;
      x = x0;
    }
    if (!rocks.length) return false;
    // (then their tops, spread evenly from the surface the stair starts on up to the lip: no sliver, no tall last face)
    if (Number.isNaN(endY)) endY = rocks[rocks.length - 1].foot;
    // (the stair would start on ground already within reach of the lip: a dip between two shelves, crossed by a jump; nothing grows)
    if (endY - lipY <= STEP_LEFT) return true;
    const rise = (endY - lipY) / (rocks.length + 1);
    // (no room for a whole stair, the ground under it too short: nothing grows here, never a wall; counted, stairsLeftOut)
    if (rise > STEP_LEFT) return false; // (lipY and endY whole pixels: each rounded face is at most ceil(rise), STEP_LEFT or less)
    const laid: Box[] = [];
    for (let k = 0; k < rocks.length; k++) {
      const r = rocks[k];
      const top = Math.round(lipY + (k + 1) * rise);
      // (a piece it takes in must stay under its top: one standing higher would bury its tread, the Critic's find)
      if (r.high < top - 2) return false;
      if (r.foot - top > 0) laid.push({ x: Math.round(r.x), y: top, width: Math.round(r.w), height: Math.round(r.foot - top) });
    }
    // (checked against the stage's own pieces, not just their tops: each rock stands (its whole foot on a top at its foot, or inside a body
    // that reaches it) and overlaps nothing but a stump wholly inside it, no higher than its top; else this stair is not laid)
    const stage = solids.filter((q) => !q.plank);
    for (const r of laid) {
      const foot = r.y + r.height;
      const holds = stage.filter((q) => q.x < r.x + r.width && q.x + q.width > r.x && (Math.abs(q.y - foot) <= 2 || (q.y < foot - 2 && q.y + q.height >= foot - 2)));
      let covered = r.x;
      for (const q of [...holds].sort((p, o) => p.x - o.x)) if (q.x <= covered + 1) covered = Math.max(covered, q.x + q.width);
      if (covered < r.x + r.width - 1) return false;
      for (const q of stage) {
        if (!(q.x < r.x + r.width - 0.5 && q.x + q.width > r.x + 0.5 && q.y < foot - 2 && q.y + q.height > r.y + 0.5)) continue;
        const inside = q.x >= r.x - 0.5 && q.x + q.width <= r.x + r.width + 0.5 && q.y >= r.y - 2;
        if (!inside) return false;
      }
    }
    // (never over a box already grown: two stairs laid over each other made a tread across two rocks)
    if (laid.some((b) => out.some((o) => b.x < o.x + o.width - 0.5 && o.x < b.x + b.width - 0.5 && b.y < o.y + o.height - 0.5 && o.y < b.y + b.height - 0.5))) return false;
    out.push(...laid);
    return true;
  };
  // (right to left: the stair to the highest lip is laid first, and takes in the small steps below it)
  for (let i = segs.length - 2; i >= 0; i--) {
    const a = segs[i], b = segs[i + 1];
    // (only the joins that touch the piece: the one into it, those inside it, the one out of it)
    if (b.x1 < piece.x0 || a.x0 > piece.x1) continue;
    const gap = b.x0 - a.x1;
    const rise = a.y - b.y;
    // (a join a plain single jump can't make as laid: the same test as pieceMoveLaid's)
    const need = gap > 1 ? gap > plainGap(rise) : plainGap(rise) < 0;
    if (gap > 1 && gap > plainGap(Math.min(rise, STEP_LEFT))) {
      const padY = Math.min(Math.max(a.y, b.y), b.y + STEP_LEFT);
      const pw = Math.max(PAD_W, Math.round(gap - 2 * PAD_EDGE));
      const pad: Box = { x: Math.round(a.x1 + gap / 2 - pw / 2), y: padY, width: pw, height: 24, plank: true };
      if (out.some((o) => pad.x < o.x + o.width - 0.5 && o.x < pad.x + pad.width - 0.5 && pad.y < o.y + o.height - 0.5 && o.y < pad.y + pad.height - 0.5)) {
        if (need) unsolved++;
        continue;
      }
      out.push(pad);
      // (the climb to the pad, across half the gap: unsolved only when a plain jump can't make it and no stair had room)
      if (!stair(a, a.x1, padY) && pad.x - a.x1 > plainGap(a.y - padY)) unsolved++;
    } else if (!stair(a, a.x1, b.y) && need) unsolved++;
  }
  return { boxes: out, unsolved };
}
