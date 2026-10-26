/**
 * Dot's guide: ONE teaching surface. Her stage tips, the lessons, the first-stage coach, the goal, the story
 * asides and the journal notes all go through this one queue, so there is only ever one line on screen and none is cut short by another
 * (today the goal line got 1.1 s before a tip replaced it). Pure logic: the clock is handed in (milliseconds of play), so tests drive it.
 *
 * The rules (teaching research, section D3 and D4):
 *   - one line at a time; the highest priority waiting line goes next, oldest first within a priority;
 *   - a line on screen keeps the screen for its reading time. Only an urgent line (a danger warning, a must-know rule change) may come in
 *     over it, and the line it interrupted goes back to the front of the queue to be said again in full;
 *   - a move tip ("Flick up into the vine") stays until the move is done, or 20 s; after its reading time it steps aside for a more
 *     important line and comes back later. A move tip is never dropped before its move is done: one still waiting stays in the queue
 *     until he does the move (then it is not needed), and one that hit its 20 s comes back once more later;
 *   - a move tip for a move already done this stage is not said; one up closes as soon as its move is done;
 *   - nothing starts while the stage-start goal card is up (the two share the top-centre lane);
 *   - every line is up for at least 1.5 s, even when its move is done at once or its sender takes it down (QA, v189: "Tap to punch it
 *     when it's close" closed on the very punch it asked for, before it could be read);
 *   - an info line stays 1.5 s + 0.5 s a word, at least 4 s; nothing closes on a tap (a tap is a punch);
 *   - no line starts while Pokey is in danger, unless it is the danger warning itself;
 *   - a story aside waits 8 s after the last line; anything else waits a short breath.
 */
import type { GlyphKind } from '../components/GestureGlyph.tsx';

/** what kind of line: it sets the priority, who may silence it (the "Dot's help" setting) and how it leaves */
export type GuideKind = 'must' | 'danger' | 'teach' | 'goal' | 'struggle' | 'info' | 'story' | 'journal';
/** a move a tip asks for: the tip stays until the guide sees it done (dotGuideMoves.ts) */
export type MoveId = 'run' | 'jump' | 'double' | 'grab' | 'climb' | 'leap' | 'glide' | 'punch' | 'kick' | 'crouch' | 'push' | 'bounce';
/** the kind of thing a line is about, for the ring and arrow (dotGuideTarget.ts) */
export type TopicId =
  | 'vine' | 'trunk' | 'rope' | 'log' | 'foe' | 'gap' | 'ledge' | 'petal' | 'cage' | 'bush' | 'fern' | 'mushroom'
  | 'crumble' | 'moving' | 'water' | 'heart' | 'power' | 'relic' | 'flag' | 'exit' | 'controls';
export type GuideWho = 'Dot' | 'Pokey' | 'Petal';

export interface GuideLine {
  /** the same key is never queued twice */
  key: string;
  text: string;
  kind: GuideKind;
  who: GuideWho;
  move?: MoveId;
  /** what it teaches, for "Just reminders" (a skill already seen on this phone is not taught again) */
  skill?: string;
  topic?: TopicId;
  /** a world point to ring, when the sender knows it (else the guide looks for the topic near Pokey) */
  at?: { x: number; y: number };
  /** the gesture picture (the old look's cards; the new bubble has no picture: its words carry the gesture) */
  glyph?: GlyphKind;
  /** the gesture the words name ('flick-up', 'slide'...), from the approved lines */
  gesture?: string;
  /** said after this one, once it is done or read (the next step of a lesson, a boss line's second half) */
  next?: GuideLine;
  /** the sender asked for this long on screen (ms); the reading time is the floor */
  ms?: number;
  /** it goes after this long at most (ms), done or not: a boss fight's lines, which belong to one attack (about 6 s) */
  capMs?: number;
  /** how long it may wait in the queue before it is old news (ms) */
  waitMs?: number;
  /**
   * a tip about a new THING, not a new move (World 5's threads, cakes, the Butler's tray): "Flick up over the cakes" teaches the cake,
   * and a player who has jumped a hundred times still needs it. It is said even when its move was done earlier in the stage, waits in
   * the queue by time as a plain line does, and once up stays until the move is done again (or its reading time, if it has no move).
   * (QA, 5-2, 2026-10-26: the cake, thread and tray tips were dropped unseen because she had already jumped and punched.)
   */
  thing?: boolean;
  /** where it came from: an engine line can be taken down by the engine ("the moment has passed") */
  source: 'engine' | 'lesson' | 'coach' | 'story' | 'journal' | 'struggle';
}

export const PRIORITY: Record<GuideKind, number> = {
  must: 60,
  danger: 55,
  teach: 40,
  goal: 35,
  struggle: 30,
  info: 20,
  story: 10,
  journal: 5,
};
/** lines that may come in over a line still being read */
export const isUrgent = (l: GuideLine) => l.kind === 'danger' || l.kind === 'must';

export const GUIDE = {
  /** a move tip closes after this long even if the move was not done */
  moveCapMs: 20000,
  /** a story aside waits this long after the last line ended */
  storyGapMs: 8000,
  /** any other line waits this short breath */
  breathMs: 600,
  /** default queue waits by kind (ms): a tip for a spot he has run past is old news, a story line can wait a while */
  waitMs: { must: 12000, danger: 2500, teach: 12000, goal: 30000, struggle: 15000, info: 9000, story: 60000, journal: 120000 } as Record<GuideKind, number>,
  /** the pause menu shows this many of her last lines */
  historyN: 3,
  /** a story aside has had a fair look (and counts as heard) after this long, and may give way to teaching (ms) */
  storyYieldMs: 2000,
  /** a line sent back by an interruption may wait this long to be said again */
  backMs: 30000,
  /** every line is up at least this long (a move done at once, or a sender taking it down, waits for it) */
  minShowMs: 1500,
  /** a boss fight's warning or tip is up at most this long (it belongs to one attack; QA v189: one stayed 20 s of a 26 s fight) */
  bossLineMs: 6000,
  /** a tip about a thing (GuideLine.thing) has had a fair look after this long, and gives way to the next thing's tip (ms) */
  thingYieldMs: 3000,
} as const;

const waitFor = (l: GuideLine) => l.waitMs ?? GUIDE.waitMs[l.kind];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, '').replace(/\s+/g, ' ').trim();
const sameWords = (a: string, b: string) => norm(a) === norm(b);

export function wordCount(text: string): number {
  const m = text.trim().match(/\S+/g);
  return m ? m.length : 0;
}

/** reading time: 1.5 s + 0.5 s a word, at least 4 s (about 120 words a minute, the figure for young readers) */
export function readMs(text: string): number {
  return Math.max(4000, 1500 + 500 * wordCount(text));
}

/** how long an info line stays: its reading time, or longer if the sender asked */
export function showFor(l: GuideLine): number {
  return Math.max(readMs(l.text), l.ms ?? 0);
}

interface Waiting {
  line: GuideLine;
  /** a move tip: the move counter when it was queued (it waits until the move is done, not for a time); -1 until the first tick */
  base?: number;
  /** old news after this (a line sent back by an interruption gets a longer wait: it was already said once) */
  until: number;
  /** order of arrival (an interrupted line goes back in front of its priority) */
  seq: number;
}
export interface Showing {
  line: GuideLine;
  startedAt: number;
  /** the move counter when it started (done once it goes past) */
  base: number;
  /** a new number for each line put up (the view keys on it) */
  n: number;
}

export interface TickEnv {
  /** Pokey is in danger: an animal at hand, falling, hurt */
  danger: boolean;
  /** how many times a move has been done in this run of the stage */
  moveCount(m: MoveId): number;
  /** he is swinging on a liana: a tip about a gap in the ground waits (heldBack) */
  swinging?: boolean;
  /** no line starts at all, not even an urgent one (the stage-start goal card is up: they share the top-centre lane) */
  hold?: boolean;
}

/**
 * a line that must wait for now: a tip about jumping a gap in the ground while he swings on a liana. Its jump cannot be done from there,
 * so it held the screen all through the swing and the swing's own tips never came (QA, 1-6 new look, 2026-10-26). It waits in the queue
 * (until its usual wait runs out) and may come once he is off the vine.
 */
const heldBack = (l: GuideLine, env?: TickEnv): boolean => !!env?.swinging && l.topic === 'gap' && l.move === 'jump';

export type GuideEvent =
  | { type: 'start'; show: Showing }
  | { type: 'end'; show: Showing; why: 'done' | 'read' | 'cap' | 'yield' | 'cut' | 'cleared' };

export class GuideQueue {
  private waiting: Waiting[] = [];
  private seq = 0;
  private n = 0;
  cur: Showing | null = null;
  /** when the last line ended (for the gaps) */
  private endedAt = -1e9;
  /** her last lines, newest first (for the pause menu) */
  history: GuideLine[] = [];
  /** story asides that have already given way once (they come back once, not over and over) */
  private yielded = new Set<string>();
  /** move tips that have hit their cap once (they come back once more, not over and over) */
  private capped = new Set<string>();
  /** the line on screen was taken down by its sender before its minimum time: it goes when that is up */
  private clearCur = false;
  /** what happened on the last calls (the view and the tests read it) */
  events: GuideEvent[] = [];

  /** a line with this key, or these same words (a lesson and a stage tip can say the same thing), is up or waiting */
  has(key: string, text?: string): boolean {
    const same = (l: GuideLine) => l.key === key || (text !== undefined && sameWords(l.text, text));
    return (!!this.cur && same(this.cur.line)) || this.waiting.some((w) => same(w.line));
  }

  get size(): number {
    return this.waiting.length;
  }

  /** queue a line. An urgent line comes in at once over a lower line, which goes back to the front of the queue. */
  push(line: GuideLine, now: number): void {
    if (!line.text || this.has(line.key, line.text)) return;
    const cur = this.cur;
    if (cur && isUrgent(line) && !isUrgent(cur.line) && PRIORITY[line.kind] > PRIORITY[cur.line.kind]) {
      this.events.push({ type: 'end', show: cur, why: 'cut' });
      // (it goes back in front of everything of its own priority, to be said again in full)
      this.waiting.push({ line: cur.line, until: now + Math.max(GUIDE.backMs, waitFor(cur.line)), seq: -++this.seq, base: cur.line.move ? cur.base : undefined });
      this.cur = null;
      this.begin(line, now, 0);
      return;
    }
    this.waiting.push({ line, until: now + waitFor(line), seq: ++this.seq, base: line.move ? -1 : undefined });
  }

  /**
   * The sender says the moment has passed: take its line down (and any of its waiting lines that match). A line up less than its
   * minimum time stays until that is up, unless `now` is asked for (the player turned tips off).
   */
  clear(match: (l: GuideLine) => boolean, now: number, at = false): void {
    this.waiting = this.waiting.filter((w) => !match(w.line));
    if (this.cur && match(this.cur.line)) {
      if (!at && now - this.cur.startedAt < GUIDE.minShowMs) {
        this.clearCur = true;
        return;
      }
      this.clearCur = false;
      this.events.push({ type: 'end', show: this.cur, why: 'cleared' });
      this.cur = null;
      this.endedAt = now;
    }
  }

  /** forget everything (a new run of the stage) */
  reset(): void {
    this.waiting = [];
    this.cur = null;
    this.clearCur = false;
    this.endedAt = -1e9;
  }

  private best(now: number, env?: TickEnv): Waiting | null {
    let best: Waiting | null = null;
    for (const w of this.waiting) {
      if (heldBack(w.line, env)) continue;
      if (!best || PRIORITY[w.line.kind] > PRIORITY[best.line.kind] || (PRIORITY[w.line.kind] === PRIORITY[best.line.kind] && w.seq < best.seq)) best = w;
    }
    void now;
    return best;
  }

  private begin(line: GuideLine, now: number, base: number): void {
    this.cur = { line, startedAt: now, base, n: ++this.n };
    this.history = [line, ...this.history.filter((h) => h.key !== line.key)].slice(0, GUIDE.historyN);
    this.events.push({ type: 'start', show: this.cur });
  }

  /** run the clock: ends the line on screen when it is done, and starts the next one when it may */
  tick(now: number, env: TickEnv): Showing | null {
    // old news goes first (a tip for a spot he has long run past). A move tip is not old news until its move is done: it waits for
    // that, however long, so it is never dropped unseen
    // A move tip for a move he has already done this stage is not said at all (QA v189: "Flick up again midair" came 21 s after she
    // had been double jumping)
    // (the next step of a lesson still comes, in its place)
    const skipped: GuideLine[] = [];
    this.waiting = this.waiting.filter((w) => {
      const m = w.line.move;
      if (!m || w.line.thing) return now <= w.until;
      if (w.base === undefined || w.base < 0) {
        if (env.moveCount(m) > 0) {
          if (w.line.next) skipped.push(w.line.next);
          return false;
        }
        w.base = env.moveCount(m);
      }
      return env.moveCount(m) <= w.base;
    });
    for (const n of skipped) this.push(n, now);
    const cur = this.cur;
    if (cur) {
      const age = now - cur.startedAt;
      const l = cur.line;
      let why: 'done' | 'read' | 'cap' | 'yield' | 'cleared' | null = null;
      const shown = age >= GUIDE.minShowMs;
      if (this.clearCur) {
        if (shown) why = 'cleared';
      } else if (l.capMs !== undefined && age >= Math.max(GUIDE.minShowMs, l.capMs)) {
        why = 'read';
      } else if (l.thing && age >= GUIDE.thingYieldMs && this.best(now, env)?.line.kind === 'teach') {
        // (a tip about a thing he has had a fair look at gives way to the next thing's: that one is coming up now)
        why = 'read';
      } else if (l.move) {
        if (env.moveCount(l.move) > cur.base) {
          if (shown) why = 'done';
        } else if (heldBack(l, env)) {
          if (shown) why = 'yield';
        } else if (age >= GUIDE.moveCapMs) why = 'cap';
        else if (age >= readMs(l.text)) {
          const b = this.best(now, env);
          if (b && PRIORITY[b.line.kind] > PRIORITY[l.kind]) why = 'yield';
        }
      } else if (age >= showFor(l)) why = 'read';
      else if (l.kind === 'story' && age >= GUIDE.storyYieldMs) {
        // a story aside gives way to teaching that is waiting (research D3), after a fair look; it comes back later, in full
        const b = this.best(now, env);
        if (b && PRIORITY[b.line.kind] > PRIORITY.struggle && !this.yielded.has(l.key)) why = 'yield';
      }
      if (!why) return cur;
      this.events.push({ type: 'end', show: cur, why });
      this.cur = null;
      this.clearCur = false;
      this.endedAt = now;
      // a move tip that ran out of time without its move comes back once more, later (it waits for the move as any other does)
      if (why === 'cap' && l.move && !this.capped.has(l.key)) {
        this.capped.add(l.key);
        this.waiting.push({ line: l, until: now + GUIDE.backMs, seq: ++this.seq, base: cur.base });
      }
      // a move tip that stepped aside comes back after the more important line, if it is still wanted then
      if (why === 'yield' && (l.kind !== 'story' || !this.yielded.has(l.key))) {
        this.yielded.add(l.key);
        this.waiting.push({ line: l, until: now + Math.max(GUIDE.backMs, waitFor(l)), seq: ++this.seq, base: l.move ? cur.base : undefined });
      }
    }
    const b = this.best(now, env);
    if (!b) return null;
    const gap = b.line.kind === 'story' ? GUIDE.storyGapMs : isUrgent(b.line) ? 0 : GUIDE.breathMs;
    if (now - this.endedAt < gap) return null;
    if (env.hold) return null;
    if (env.danger && !isUrgent(b.line)) return null;
    this.waiting.splice(this.waiting.indexOf(b), 1);
    this.begin(b.line, now, b.line.move ? env.moveCount(b.line.move) : 0);
    return this.cur;
  }

  /** take the events since the last call */
  drain(): GuideEvent[] {
    const e = this.events;
    this.events = [];
    return e;
  }
}

// ───────────────────────────── her last lines, for the pause menu ─────────────────────────────

let lastLines: { text: string; who: GuideWho }[] = [];
/** the pause menu's "Dot said": her last three lines, newest first */
export function dotSaid(): readonly { text: string; who: GuideWho }[] {
  return lastLines;
}
export function noteSaid(l: GuideLine): void {
  if (l.kind === 'journal') return;
  lastLines = [{ text: l.text, who: l.who }, ...lastLines.filter((s) => s.text !== l.text)].slice(0, GUIDE.historyN);
}

// ───────────────────────────── what a line from the engine is ─────────────────────────────

/**
 * The engine hands over a stage line as plain words (engine.ts guide). This works out what it is, from the words: a locked exit or a
 * sudden rule change (must), a warning about what is happening right now (danger), a move to do (teach, with the move that closes it),
 * the goal, or plain information. The topic is what the ring points at.
 */
export function classifyLine(text: string, inBoss = false): Pick<GuideLine, 'kind' | 'move' | 'topic' | 'glyph' | 'skill'> {
  const t = text.trim();
  if (/^Sealed:|Finish the goal/i.test(t)) return { kind: 'must', topic: 'exit' };
  if (/The water is rising|breaking behind us|The ring!|Drive them all off|Clear them all to open the way/i.test(t)) return { kind: 'must' };
  if (inBoss) return { kind: 'danger' };
  // (World 5: the silk creeping up him, the wrap itself and a thread's hum come in at once, over whatever is being read: the creep is the
  // only warning before the wrap takes a heart, QA v193)
  if (/^(It saw you|She saw you|Here (she|it) comes|Ouch!|A (thorn )?vine is stirring|Her shadow!|Eyes in the dark|The eyes are back|The glowworms noticed|Don't stand still here|Wrapped up!|Wake up, Pokey|It hummed!)/i.test(t)) {
    return { kind: 'danger', topic: /bush/i.test(t) ? 'bush' : /fern/i.test(t) ? 'fern' : undefined };
  }
  if (/to open the sanctuary|before the sanctuary opens/i.test(t)) return { kind: 'goal' };
  const r = moveOf(t);
  if (r) return { kind: 'teach', ...r };
  return { kind: 'info', topic: topicOf(t) };
}

/** the move a tip asks for, from its words (the first gesture it names), with the topic and the gesture picture */
export function moveOf(t: string): Pick<GuideLine, 'move' | 'topic' | 'glyph' | 'skill'> | null {
  const s = t.toLowerCase();
  if (/\bleaf\b|glide|thumb on the glass as you fall|hold (jump|space) as you fall/.test(s)) return { move: 'glide', topic: 'controls', glyph: 'up', skill: 'glide' };
  if (/again in the air|jump twice|second jump|jump again as you fly|press (jump|space) again/.test(s)) return { move: 'double', topic: topicOf(s) ?? 'controls', glyph: 'up', skill: 'double' };
  if (/swing forward|let go (while|when|as)|leap off/.test(s)) return { move: 'leap', topic: 'vine', glyph: 'jump', skill: 'leap' };
  if (/into the vine|grab (it|the vine|on)|jump into the vine/.test(s)) return { move: 'grab', topic: 'vine', glyph: 'up', skill: 'swing' };
  if (/trunk|climb the/.test(s)) return { move: 'climb', topic: 'trunk', glyph: 'up', skill: 'climb' };
  if (/into the log|push it/.test(s)) return { move: 'push', topic: 'log', glyph: 'run', skill: 'push' };
  if (/\bkick\b/.test(s) && !/punch/.test(s)) return { move: 'kick', topic: 'foe', glyph: 'flick', skill: 'kick' };
  if (/tap (to|twice|beside)|to punch|press punch|press j\b|knock the fruit/.test(s)) return { move: 'punch', topic: /netting|cage/.test(s) ? 'cage' : 'foe', glyph: 'tap', skill: 'punch' };
  if (/slide down|hold down|crouch|duck/.test(s)) return { move: 'crouch', topic: /fern/.test(s) ? 'fern' : /bush/.test(s) ? 'bush' : undefined, glyph: 'down', skill: 'crouch' };
  if (/\bjump the|hop (up|from)|jump the gaps|flick up/.test(s)) return { move: 'jump', topic: /stump|stone|up/.test(s) ? 'ledge' : 'gap', glyph: 'jump', skill: 'jump' };
  return null;
}

/** what an information line is about, for the ring */
export function topicOf(t: string): TopicId | undefined {
  const s = t.toLowerCase();
  if (/petal|flower|bloom/.test(s)) return 'petal';
  if (/\bvine\b|liana/.test(s)) return 'vine';
  if (/tree|trunk/.test(s)) return 'trunk';
  if (/\brope\b/.test(s)) return 'rope';
  if (/\blog\b/.test(s)) return 'log';
  if (/snake|guard|prowler|jaguar|foe|monkey|lookout|predator/.test(s)) return 'foe';
  if (/mushroom/.test(s)) return 'mushroom';
  if (/creaky|crumbl|shaky/.test(s)) return 'crumble';
  if (/\bfern\b/.test(s)) return 'fern';
  if (/\bbush/.test(s)) return 'bush';
  if (/netting|cage|chick/.test(s)) return 'cage';
  if (/gap|edge|ledge|stump|stone/.test(s)) return 'gap';
  return undefined;
}
