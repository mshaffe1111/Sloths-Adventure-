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
export function helpGuideLine(text: string, help: 'teach' | 'reminders' | 'quiet', ms?: number): { key: string; text: string; kind: 'struggle'; who: 'Dot'; source: 'struggle'; soon: true; ms?: number } | null | undefined {
  if (!HELP_LINES.has(text)) return undefined;
  if (help === 'quiet') return null;
  // (`soon`: due now, so neither Tips' 30 s gap nor its busy count holds it back; a fall in progress still does)
  return { key: `help:${text}`, text, kind: 'struggle', who: 'Dot', source: 'struggle', soon: true, ms };
}

/**
 * Puts a ladder line in Dot's queue (DotGuide.tsx engineLine): the stage's own move tips, up or waiting, give way first (the ladder's line
 * is the better one now, about the same move; the stage's double tip stayed up until the double was done, holding the help behind it)
 */
export function pushHelpLine<L extends { kind: string; source?: string }>(q: { clear(f: (l: L) => boolean, now: number): void; push(l: L, now: number): void }, line: L, now: number): void {
  q.clear((l) => l.kind === 'teach' && l.source === 'engine', now);
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
      if (c.n === this.r.step) fire('step');
    } else if (!c.asking) {
      if (c.n === this.r.offer && !c.fired.has('step')) fire('offer');
      else if (c.noes === 1 && c.n === c.noAt + this.r.reaskAfter) fire('reask');
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
export function moveLine(m: Move, mode: 'screen' | 'pad' | 'keys'): string {
  return mode === 'screen' ? MOVE_LINES[m].touch : MOVE_LINES[m].pad;
}

// ───────────────────────────── the grown steps ─────────────────────────────
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}
/** the climb a step leaves (px): a plain jump clears it (the lead's ruling 11-11) */
export const STEP_LEFT = 60;
export const STEP_W = 80;
export const PAD_W = 60;

/**
 * The steps for a piece, from the piece as laid (never a constant): its road is its standing pieces that are under no other (a catch
 * branch under a log is not road), with the road piece on either side of it; between each two in turn, a rise taller than STEP_LEFT gets
 * a step at the foot of the rise (its top STEP_LEFT under the next one), and a gap wider than `plainGap(dyUp)` a PAD_W pad at its middle
 * (no higher than STEP_LEFT under the far side, with a step under it if the near side is lower still).
 */
export function stepsFor(piece: Piece, solids: readonly Box[], plainGap: (dyUp: number) => number): Box[] {
  const under = (a: Box) => solids.some((b) => b !== a && b.y < a.y && b.x < a.x + a.width && b.x + b.width > a.x);
  const road = solids.filter((a) => a.width >= 40 && !under(a)).sort((a, b) => a.x - b.x);
  const inside = road.filter((a) => a.x + a.width > piece.x0 && a.x < piece.x1);
  if (!inside.length) return [];
  const i0 = road.indexOf(inside[0]), i1 = road.indexOf(inside[inside.length - 1]);
  const run = road.slice(Math.max(0, i0 - 1), Math.min(road.length, i1 + 2));
  const out: Box[] = [];
  const stepOn = (a: Box, topY: number) => {
    const h = a.y - topY;
    if (h <= 0) return;
    const w = Math.min(STEP_W, a.width);
    out.push({ x: a.x + a.width - w, y: topY, width: w, height: h });
  };
  for (let i = 0; i + 1 < run.length; i++) {
    const a = run[i], b = run[i + 1];
    // (only the joins that touch the piece: the one into it, those inside it, the one out of it)
    if (a.x + a.width < piece.x0 - 1 && b.x + b.width < piece.x0) continue;
    if (a.x > piece.x1 + 1) continue;
    const gap = b.x - (a.x + a.width);
    const rise = a.y - b.y;
    if (gap > plainGap(rise)) {
      const padY = Math.min(Math.max(a.y, b.y), b.y + STEP_LEFT);
      const pad = { x: Math.round(a.x + a.width + gap / 2 - PAD_W / 2), y: padY, width: PAD_W, height: Math.max(24, Math.max(a.y, b.y) + 24 - padY) };
      out.push(pad);
      if (a.y - padY > STEP_LEFT) stepOn(a, padY + STEP_LEFT);
    } else if (rise > STEP_LEFT) stepOn(a, b.y + STEP_LEFT);
  }
  return out;
}
