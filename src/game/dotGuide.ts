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
 *   - a story aside waits 8 s after the last line; anything else waits a short breath;
 *   - a plain information line steps aside, after a fair look, for a tip about a thing coming up now (World 5's cocoons, cakes), and
 *     comes back once after it.
 */
import type { GlyphKind } from '../components/GestureGlyph.tsx';

/** what kind of line: it sets the priority, who may silence it (the "Dot's help" setting) and how it leaves */
export type GuideKind = 'must' | 'danger' | 'teach' | 'goal' | 'struggle' | 'info' | 'story' | 'journal';
/** a move a tip asks for: the tip stays until the guide sees it done (dotGuideMoves.ts) */
export type MoveId = 'run' | 'jump' | 'double' | 'grab' | 'climb' | 'leap' | 'glide' | 'punch' | 'kick' | 'crouch' | 'push' | 'bounce';
/** the kind of thing a line is about: where Dot flies and perches to point at it (dotGuidePerch.ts) */
export type TopicId =
  | 'vine' | 'trunk' | 'rope' | 'log' | 'foe' | 'gap' | 'ledge' | 'petal' | 'cage' | 'bush' | 'fern' | 'mushroom'
  | 'crumble' | 'moving' | 'water' | 'heart' | 'power' | 'relic' | 'flag' | 'exit' | 'controls'
  // (World 5's pieces Dot points at: GuideView.w5)
  | 'cocoon' | 'orchid' | 'seamstress'
  // (a puzzle room's active part: GuideView.kit)
  | 'puzzle';
export type GuideWho = 'Dot' | 'Pokey' | 'Petal' | 'Flicker';

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
  /**
   * one line of a scene played in a stage (5-5's pouch scene, w5Lines.ts W5_POUCH): a story line, but the next one follows after a
   * breath, not a story aside's long wait, so the people in it talk to each other
   */
  scene?: boolean;
  /**
   * it names how many of the goal are still to get ("Still 65 flowers to collect!"): the number is put in as it is when the line is on
   * screen (countedText), not as it was when the engine sent it. The line can wait its turn a while, and he picks more up meanwhile:
   * the HUD said 51/116 as Dot said "Still 68" (QA, 5-3, v198)
   */
  counted?: boolean;
  /** the thing it introduces for the first time (dotTips.ts FIRST_OF): "Tips" says it once per save */
  mech?: string;
  /** a puzzle's line (dotTips.ts): 'name' names the problem, 'nudge' points at the piece after struggle, 'move' says the move (Help
   *  only), 'event' is one of its moments (the log lands, the gate opens) */
  step?: 'name' | 'nudge' | 'move' | 'event';
  /** the engine's own words for it (tipMemory.ts keeps the tips it carries once it has been shown) */
  said?: string;
  /** a first-time hazard about to hit: it does not wait out the gap between lines (it never cuts in over a line, as a warning does) */
  soon?: boolean;
  /** one of the control test's lines (dotLines.ts): the test itself, said whatever the help setting has heard before */
  ctest?: boolean;
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
  /** a line of a scene (GuideLine.scene) has been heard once it has been up this share of its reading time: only then may it give
   *  way (to teaching that is waiting) or be cut without being said again */
  sceneHeard: 0.7,
  /** a line sent back by an interruption may wait this long to be said again */
  backMs: 30000,
  /** every line is up at least this long (a move done at once, or a sender taking it down, waits for it) */
  minShowMs: 1500,
  /** a boss fight's warning or tip is up at most this long (it belongs to one attack; QA v189: one stayed 20 s of a 26 s fight) */
  bossLineMs: 6000,
  /** a tip about a thing (GuideLine.thing) has had a fair look after this long, and gives way to the next thing's tip (ms) */
  thingYieldMs: 3000,
} as const;

/**
 * Dot toned down (Matt, 2026-10-28: "a little repetitive at times and comes in a little too soon. Tone her down a little."), for
 * Worlds 1-4 (a queue made with `calm`). Rules that stay: the first appearance of every mechanic is taught, and the locked exit is
 * always explained (a must line is never held back by any of these, nor is a warning just before a danger).
 *   - startMs: nothing in a stage's first seconds; the stage starts are built so nothing can hurt before then (stageStart.test.ts);
 *   - gapMs: at least this long from one line's start to the next's, for everything but a warning, the locked exit, a lesson's next
 *     step, a first-time lesson and a tip for a move (those need only the usual breath: a tip comes before its thing, and its thing
 *     will not wait; in 2-2 a 2.5 s gap after the opening aside kept the first river's tip back past the river);
 *   - repeatMax: the same words at most this many times a stage (a reminder once), and never again once he has done the move they ask
 *     for since they were said;
 *   - moveCapMs: a move tip goes after this long if its move is not done (it does not come back), or sooner once the thing it is about
 *     has been out of view goneMs (QA 2026-10-28, 1-7: "Flick up into the trunk to grab it" stayed 30 s with no trunk in reach).
 * A first-time lesson may also come in over a plain information line already up, and any tip over a story aside (the line cut comes
 * back once, after it): a stage's opening words held the gap's lesson back past 2-2's first river.
 */
export const CALM = { startMs: 2500, gapMs: 10000, repeatMax: 2, moveCapMs: 12000, goneMs: 2500, nearMs: 30000 } as const;
/** "Tips" (dotTips.ts): at least this long from one line's start to the next's, for everything but the urgent lines (a warning, the
 *  locked exit, a first-time hazard about to hit, a lesson's next step) */
export const TIPS_GAP_MS = 30000;
/** "Tips": the most lines that start in any 30 s (the polish target: 2 in the busiest 30 s), a warning or the locked exit aside */
export const TIPS_BUSY = 2;
/** "Help": the most in any 30 s (Help says more, but not a line every few seconds: 5-9 had 7 in 30 s) */
export const HELP_BUSY = 3;
const BUSY_WINDOW_MS = 30000;

/**
 * Lines that say the same thing as another line of the same stage in other words: once one of a pair has been said, the other is not said
 * within CALM.nearMs (a stage hint before a thing, and the engine's own tip at it). Keys are the guide's (`engine:<line id>`, dotLines.ts).
 * (QA 2026-10-29, 4-3 Easy: "The water pushes you back. Stop it at the top!" came 10 s after "The water pushes you down. Climb up and stop
 * it.") Found by comparing every pair of a stage's lines (their meaning words); the pairs that are about one thing in one place.
 */
const SAME_TIPS: readonly (readonly string[])[] = [
  ['hint.4-3.push', 'w4.fall'],
  ['hint.4-3.quiet', 'w4.surge'],
  ['hint.4-4.knot', 'w4.knot'],
  ['hint.4-5.fall', 'w4.veil'],
  // (and a watcher's pass: one call to hide is enough; 1-7 on Help said three in 15 s, in three wordings)
  ['hint.1-7.hide', 'eng.watch.hide.bush', 'eng.watch.seen.bush', 'Hide! Into a bush!'],
  ['hint.3-2.eyes', 'eng.watch.hide.fern', 'eng.watch.seen.fern', 'Hide! Into a fern!'],
  ['hint.3-6.search', 'eng.fern.near'],
  ['eng.watch.hide.cliffs', 'eng.watch.seen.cliffs', 'Hide! Water or a bush!'],
  ['hint.1-1.double', 'eng.stuck.wall'],
];
export const SAME_TIP = new Map<string, readonly string[]>();
for (const group of SAME_TIPS) for (const id of group) SAME_TIP.set(`engine:${id}`, group.filter((g) => g !== id).map((g) => `engine:${g}`));

const waitFor = (l: GuideLine) => l.waitMs ?? GUIDE.waitMs[l.kind];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, '').replace(/\s+/g, ' ').trim();
const sameWords = (a: string, b: string) => norm(a) === norm(b);

/** a counted line's words with the number still needed now (its first number swapped for `need`) */
export function countedText(text: string, need: number): string {
  return text.replace(/\d+/, String(Math.max(0, Math.round(need))));
}

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
  /** its bubble has appeared (onScreen) */
  onScreen?: boolean;
}

export interface TickEnv {
  /** Pokey is in danger: an animal at hand, falling, hurt */
  danger: boolean;
  /** how many times a move has been done in this run of the stage */
  moveCount(m: MoveId): number;
  /** he is swinging on a liana: a tip about a gap in the ground waits (heldBack) */
  swinging?: boolean;
  /** (a calm queue) the thing this move tip is about is nowhere in view (a trunk, a vine, a rope, a log): the tip has had its moment */
  gone?(l: GuideLine): boolean;
  /** no line starts at all, not even an urgent one (the stage-start goal card is up: they share the top-centre lane) */
  hold?: boolean;
  /**
   * the thing this line teaches has been done already, or it no longer applies (a petal picked up while the petals' lesson waited, the
   * heart's lesson once he is back to full health): a waiting line for it is dropped unsaid, with its next step (QA 2026-10-29, 2-2)
   */
  stale?(l: GuideLine): boolean;
  /**
   * not now: the line keeps waiting (its usual wait) but does not start. Inside a puzzle room only the room's own lines, the warnings,
   * the locked exit, a lesson and a new thing's first line are said: no chatter while he thinks (World 8 builder, 2026-10-29)
   */
  hush?(l: GuideLine): boolean;
}

/** inside a puzzle room: the lines that may still be said there (the rest wait, or are old news when he leaves) */
export const roomMaySay = (l: GuideLine): boolean => isUrgent(l) || !!l.step || l.source === 'lesson' || !!l.mech || (l.kind === 'struggle' && l.source === 'struggle' && l.key.startsWith('struggle:death'));

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
  /** `calm`: Dot toned down (CALM); `gapMs`: the least time from one line's start to the next's (Tips: TIPS_GAP_MS) */
  constructor(readonly calm = false, public gapMs: number = CALM.gapMs) {}
  /** (calm) the same words at most this many times a stage, and a warning's (dotSay.ts sets them for the help setting) */
  repeatMax: number = CALM.repeatMax;
  repeatWarn = Infinity;
  /** (calm) when the last line started, and the words said this stage: how often, and the move count when last said */
  private startedAt = -1e9;
  /** when the lines of the last 30 s started (Tips' TIPS_BUSY) */
  private starts: number[] = [];
  private heard = new Map<string, { n: number; base: number }>();
  /** (calm) when each line was last started, by key (for SAME_TIP) */
  private saidAt = new Map<string, number>();
  /** (calm) since when the showing move tip's thing has been out of view (-1: in view) */
  private goneSince = -1;
  /** (calm) a line is a first-time lesson's, or the next step of one: it is never held back by the gap */
  private static lessonish = (l: GuideLine) => l.source === 'lesson' || l.source === 'coach';
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
  /**
   * (calm) may this line come in over the one up? A first-time lesson over a plain information or story line, and any tip over a story
   * aside (in 2-2 the opening aside held the first river's tip until he was at the water); only once the line up has been read its
   * minimum time (one cut sooner came back 10-15 s later, said twice: DOT-6). Until then it waits in the queue (tick tries again).
   */
  private cutsIn(line: GuideLine, now: number): boolean {
    const cur = this.cur;
    return this.calm && line.kind === 'teach' && !!cur && now >= CALM.startMs && now - cur.startedAt >= GUIDE.minShowMs && (cur.line.kind === 'story' || (line.source === 'lesson' && cur.line.kind === 'info'));
  }

  push(line: GuideLine, now: number): void {
    if (!line.text || this.has(line.key, line.text)) return;
    // (calm: a warning said often enough this stage, or one saying what another said a moment ago, is not said: tick's rules, here
    // too, for a warning that cuts in at once. 1-7's "Hide! Into a bush!" came 10 s after "Slide down in a bush to hide!")
    if (this.calm && line.kind === 'danger' && ((this.heard.get(norm(line.text))?.n ?? 0) >= this.repeatWarn || SAME_TIP.get(line.key)?.some((k) => now - (this.saidAt.get(k) ?? -1e9) < CALM.nearMs))) return;
    const cur = this.cur;
    const lessonCut = this.cutsIn(line, now);
    if (cur && ((isUrgent(line) && !isUrgent(cur.line) && PRIORITY[line.kind] > PRIORITY[cur.line.kind]) || lessonCut)) {
      this.events.push({ type: 'end', show: cur, why: 'cut' });
      // (it goes back in front of everything of its own priority, to be said again in full; a scene's line that was mostly read
      // counts as heard, and the scene goes on)
      // (calm: a plain line that a first-time lesson cut after it had been up its minimum time counts as heard, and is not said again)
      // (calm: and any line cut once it has been up its minimum time has been seen: it is not said twice, DOT-6. "The Sky Sovereign is
      // hunting" came again 11 s after a warning cut it)
      const up = now - cur.startedAt;
      const heard = (cur.line.scene && up >= readMs(cur.line.text) * GUIDE.sceneHeard) || (lessonCut && up >= GUIDE.minShowMs) || (this.calm && up >= GUIDE.minShowMs && !cur.line.move);
      if (!heard) this.waiting.push({ line: cur.line, until: now + Math.max(GUIDE.backMs, waitFor(cur.line)), seq: -++this.seq, base: cur.line.move ? cur.base : undefined });
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

  /** drop the waiting lines that match (the line up stays) */
  dropWaiting(match: (l: GuideLine) => boolean): void {
    this.waiting = this.waiting.filter((w) => !match(w.line));
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
      if (heldBack(w.line, env) || env?.hush?.(w.line)) continue;
      if (!best || PRIORITY[w.line.kind] > PRIORITY[best.line.kind] || (PRIORITY[w.line.kind] === PRIORITY[best.line.kind] && w.seq < best.seq)) best = w;
    }
    void now;
    return best;
  }

  private begin(line: GuideLine, now: number, base: number): void {
    this.cur = { line, startedAt: now, base, n: ++this.n };
    this.startedAt = now;
    this.starts = [...this.starts.filter((t) => now - t < BUSY_WINDOW_MS), now];
    this.goneSince = -1;
    const k = norm(line.text);
    this.heard.set(k, { n: (this.heard.get(k)?.n ?? 0) + 1, base });
    this.saidAt.set(line.key, now);
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
      // (a tip whose thing he has done already is not said, nor anything after it)
      if (!isUrgent(w.line) && env.stale?.(w.line)) return false;
      // (calm) words said often enough this stage, or a move tip whose move he has done since it was said, are not said again
      // (calm) the same warning again and again as the eagle passes is nagging: at most repeatWarn times a stage
      if (this.calm && w.line.kind === 'danger' && (this.heard.get(norm(w.line.text))?.n ?? 0) >= this.repeatWarn) return false;
      // (nor a warning that says what another said a moment ago, in other words: SAME_TIP's watcher calls)
      if (this.calm && w.line.kind === 'danger' && SAME_TIP.get(w.line.key)?.some((k) => now - (this.saidAt.get(k) ?? -1e9) < CALM.nearMs)) return false;
      if (this.calm && !isUrgent(w.line)) {
        const h = this.heard.get(norm(w.line.text));
        if (h && (h.n >= this.repeatMax || (w.line.move && env.moveCount(w.line.move) > h.base))) {
          if (w.line.next) skipped.push(w.line.next);
          return false;
        }
        // (nor a stage line that says what its pair said a moment ago, in other words: SAME_TIP)
        if (SAME_TIP.get(w.line.key)?.some((k) => now - (this.saidAt.get(k) ?? -1e9) < CALM.nearMs)) return false;
      }
      const m = w.line.move;
      if (!m || w.line.thing) return now <= w.until;
      // (a first-time hazard or a new thing is not taught by a jump made somewhere else: 2-1's first river lost the water's lesson
      // because he had jumped a bank before it came. It waits as a line does, and once up stays until he does the move. A tip whose
      // thing is the move itself, the double jump's, is learned by doing it: QA v189)
      if ((w.line.soon || w.line.mech) && w.line.mech !== m && (w.base === undefined || w.base < 0)) return now <= w.until;
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
    // (calm: a lesson that came while the line up was still new comes in once that line has had its minimum time, DOT-6)
    if (this.cur && this.calm) {
      const w = this.waiting.find((x) => this.cutsIn(x.line, now));
      if (w) {
        this.waiting.splice(this.waiting.indexOf(w), 1);
        this.push(w.line, now);
      }
    }
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
        const gone = this.calm && !!env.gone?.(l);
        if (!gone) this.goneSince = -1;
        else if (this.goneSince < 0) this.goneSince = now;
        if (env.moveCount(l.move) > cur.base) {
          if (shown) why = 'done';
        } else if (heldBack(l, env)) {
          if (shown) why = 'yield';
        } else if (this.calm && shown && (age >= CALM.moveCapMs || (gone && now - this.goneSince >= CALM.goneMs))) {
          // (calm: its moment has passed; it does not come back, and a lesson's next step does not follow it)
          why = 'cap';
        } else if (age >= GUIDE.moveCapMs) why = 'cap';
        else if (age >= readMs(l.text)) {
          // (read: it steps aside for a more important line, or for a puzzle's first line or a new thing's, which belong to now)
          const b = this.best(now, env);
          if (b && b.line.kind !== 'story' && (PRIORITY[b.line.kind] > PRIORITY[l.kind] || b.line.step === 'name' || (!!b.line.mech && !l.mech))) why = 'yield';
        }
      } else if (age >= showFor(l)) why = 'read';
      else if (l.kind === 'story' && age >= (l.scene ? readMs(l.text) * GUIDE.sceneHeard : GUIDE.storyYieldMs)) {
        // a story aside gives way to teaching that is waiting (research D3), after a fair look; it comes back later, in full
        // (a line of a scene may give way again: the scene's lines come one after another over a long stretch, and a tip about a thing
        // coming up waited a whole line of it out behind one that had given way once already. 5-5's soft chairs, v198)
        const b = this.best(now, env);
        if (b && PRIORITY[b.line.kind] > PRIORITY.struggle && (!this.yielded.has(l.key) || l.scene)) why = 'yield';
      } else if (l.kind === 'info' && age >= GUIDE.thingYieldMs && !this.yielded.has(l.key)) {
        // a plain information line ("A flag! Fall, and you start again here.", the fern's hint) gives way to a tip about a thing that is
        // coming up now, after a fair look, and comes back once, in full: it held the screen while he walked past the first two cocoons
        // and the cocoon's tip waited behind it (QA, 5-5, v198)
        const b = this.best(now, env);
        if (b?.line.thing && b.line.kind === 'teach') why = 'yield';
      }
      if (!why) return cur;
      this.events.push({ type: 'end', show: cur, why });
      this.cur = null;
      this.clearCur = false;
      this.endedAt = now;
      // a move tip that ran out of time without its move comes back once more, later (it waits for the move as any other does)
      if (why === 'cap' && l.move && !this.capped.has(l.key) && !this.calm) {
        this.capped.add(l.key);
        this.waiting.push({ line: l, until: now + GUIDE.backMs, seq: ++this.seq, base: cur.base });
      }
      // a move tip that stepped aside comes back after the more important line, if it is still wanted then
      // (a line of a scene that gives way has been mostly read: it counts as heard and is not said again. "Somebody I'm scared of."
      // came twice in 5-5's pouch scene, QA v198, once in its turn and again after a tip it had stepped aside for)
      if (why === 'yield' && (l.kind !== 'story' || (!l.scene && !this.yielded.has(l.key)))) {
        this.yielded.add(l.key);
        this.waiting.push({ line: l, until: now + Math.max(GUIDE.backMs, waitFor(l)), seq: ++this.seq, base: l.move ? cur.base : undefined });
      }
    }
    const b = this.best(now, env);
    if (!b) return null;
    const gap = b.line.kind === 'story' && !b.line.scene ? GUIDE.storyGapMs : isUrgent(b.line) ? 0 : GUIDE.breathMs;
    if (now - this.endedAt < gap) return null;
    if (env.hold) return null;
    if (env.danger && !isUrgent(b.line)) return null;
    if (this.calm && !isUrgent(b.line)) {
      // (calm) nothing in the stage's first seconds; then the gaps between lines
      if (now < CALM.startMs) return null;
      const teach = GuideQueue.lessonish(b.line) || b.line.kind === 'teach' || !!b.line.soon;
      // (Tips: only a first-time hazard about to hit, the coach, a lesson's next step or a first move skips the long gap)
      // (and the first line about a new thing: the first appearance of a mechanic is always taught, so it may not be held back past it)
      const tipsFirst = !!b.line.soon || !!b.line.mech || b.line.source === 'coach' || (b.line.kind === 'teach' && !!b.line.move);
      // (on Tips a harmless lesson, the flag's or the heart's, waits too: it is not a hazard about to hit)
      const exempt = this.gapMs >= TIPS_GAP_MS ? tipsFirst : tipsFirst || teach;
      const gap = exempt ? 0 : this.gapMs;
      if (now - this.startedAt < gap) return null;
      // (at most TIPS_BUSY lines start in any 30 s on Tips, HELP_BUSY on Help; only a first-time hazard about to hit may make one more)
      const busy = this.gapMs >= TIPS_GAP_MS ? TIPS_BUSY : HELP_BUSY;
      if (!b.line.soon && this.starts.filter((t) => now - t < BUSY_WINDOW_MS).length >= busy) return null;
    }
    this.waiting.splice(this.waiting.indexOf(b), 1);
    this.begin(b.line, now, b.line.move ? env.moveCount(b.line.move) : 0);
    return this.cur;
  }

  /**
   * The line's bubble is on screen now (she has landed beside the thing): its reading time counts from here, not from when it left the
   * queue, so her flight does not eat into it (DOT-7: a 4 s line showed for about 3 s). Once per line.
   */
  onScreen(now: number): void {
    const c = this.cur;
    if (!c || c.onScreen) return;
    c.onScreen = true;
    if (now > c.startedAt) c.startedAt = Math.min(now, c.startedAt + 1500);
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
  if (/^Sealed:|Finish the goal|^The shrine's shut/i.test(t)) return { kind: 'must', topic: 'exit' };
  if (/The water is rising|breaking behind us|The ring!|Drive them all off|Clear them all to open the way/i.test(t)) return { kind: 'must' };
  if (inBoss) return { kind: 'danger' };
  // (World 5: the silk creeping up him, the wrap itself and a thread's hum come in at once, over whatever is being read: the creep is the
  // only warning before the wrap takes a heart, QA v193)
  // (and the water warning, LV-8: worded "Flick up and over", it read as a jump tip and was dropped unsaid once he had jumped)
  if (/^(It saw you|She saw you|Here (she|it) comes|Hide! |Hide in the bush|Ouch!|A (thorn )?vine is stirring|Her shadow!|Eyes in the dark|The eyes are back|The glowworms noticed|Don't stand still here|Wrapped up!|Wake up, Pokey|It hummed!|Careful, water|Careful! That water)/i.test(t)) {
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
  // (a puzzle room's lines name a tap or a flick, but what closes them is the puzzle, not a punch or a jump: they are read)
  if (PUZZLE_WORDS.test(s)) return null;
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
/** the words of a puzzle room's lines (kitStage.ts tips): Dot's ring goes on the puzzle's active part */
export const PUZZLE_WORDS = /\bacorn|\bthe plates?\b|far plate|two plates|basket to|flick up to throw|beetle|love cake|cake on the|signpost|\blever/;

export function topicOf(t: string): TopicId | undefined {
  const s = t.toLowerCase();
  if (PUZZLE_WORDS.test(s)) return 'puzzle';
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
