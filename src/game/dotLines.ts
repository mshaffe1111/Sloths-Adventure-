/**
 * Matt's approved lines for the new look (dotLinesData.ts), and how a line about to be said is swapped for its new words.
 *
 * The game still sends its old words (the engine's tips, the story asides, the goal), so everything keyed by them keeps working: the
 * "already heard" memory (tipMemory.ts) and the journal pages a hint opens both match the OLD text. Dot's guide looks the old words up here
 * when it says a line and shows the new ones; a cut line is not said at all.
 */
import { DOT_LINES, type DotLineKind, type DotLineRow } from './dotLinesData.ts';
import { W5_DOT_LINES, W5_SCENE_IDS, W5_SPEAKERS, W5_THING_TIPS } from './w5Lines.ts';
import type { GuideKind, GuideLine, GuideWho, MoveId, TopicId } from './dotGuide.ts';
import { GUIDE, classifyLine, topicOf } from './dotGuide.ts';
import { firstOf, PUZZLE_LATER, PUZZLE_STEPS, roomLineOf } from './dotTips.ts';
import { ctestEnabled } from './playRecorder.ts';

export interface DotLine {
  id: string;
  stage: string;
  surface: string;
  kind: DotLineKind;
  old: string | null;
  /** null: cut (not said in the new look) */
  text: string | null;
  then: string | null;
  gesture: string | null;
  target: string | null;
}

const toLine = (r: DotLineRow): DotLine => ({ id: r[0], stage: r[1], surface: r[2], kind: r[3], old: r[4], text: r[5], then: r[6], gesture: r[7], target: r[8] });

// (World 5's lines are written alongside its stages, w5Lines.ts, and join the approved set here)
export const ALL_DOT_LINES: readonly DotLine[] = [...DOT_LINES, ...W5_DOT_LINES].map(toLine);
const BY_ID = new Map(ALL_DOT_LINES.map((l) => [l.id, l]));

/** a line by its id ('lesson.swing.grab', 'help.kickAir'), or undefined */
export function dotLine(id: string): DotLine | undefined {
  return BY_ID.get(id);
}
/** its new words, or the fallback when it is missing or cut */
export function dotText(id: string, fallback = ''): string {
  return BY_ID.get(id)?.text ?? fallback;
}

/** the same words, whatever the punctuation, quotes or spacing */
export const normWords = (s: string) =>
  s
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// the plain lines, by their old words (a few old lines are said in more than one stage: those keep a list, the stage's own first)
const PLAIN = new Map<string, DotLine[]>();
// the templated ones ("{Verb} {n} {noun} to open the sanctuary"): a pattern for the old words, and the names in order
const TEMPLATED: { line: DotLine; re: RegExp; names: string[] }[] = [];
const HOLE = /\$?\{(\w+)\}/g;
// (only the surfaces whose words reach the guide as plain text: the cards, floats and flight read theirs by id or keep their own)
const SAID = new Set(['stage hint', 'wayside', 'guide', 'boss', 'flight']);
for (const l of ALL_DOT_LINES) {
  if (!l.old || !SAID.has(l.surface)) continue;
  if (/\$?\{\w+\}/.test(l.old)) {
    const names: string[] = [];
    const marked = l.old.replace(HOLE, (_m, n: string) => {
      names.push(n);
      return ' qqhole ';
    });
    const parts = normWords(marked)
      .split('qqhole')
      .map((p) => p.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    // (a hole is one or more whole words: "14", "night blooms")
    const tokens: string[] = [];
    parts.forEach((p, i) => {
      if (p) tokens.push(p);
      if (i < parts.length - 1) tokens.push('(\\S+(?: \\S+)*?)');
    });
    TEMPLATED.push({ line: l, re: new RegExp(`^${tokens.join(' ')}$`), names });
    continue;
  }
  const k = normWords(l.old);
  const list = PLAIN.get(k) ?? [];
  list.push(l);
  PLAIN.set(k, list);
}

export interface Swapped {
  line: DotLine;
  /** the new words, with any {holes} filled from the old line; null when the line is cut */
  text: string | null;
  then: string | null;
}

function fill(t: string | null, names: string[], vals: string[]): string | null {
  if (t === null) return null;
  return t.replace(HOLE, (_m, name: string) => {
    const i = names.findIndex((n) => n.toLowerCase() === name.toLowerCase());
    if (i < 0) return '';
    const v = vals[i].trim();
    // {Verb} takes a capital, {verb} none, as the old words had it
    return name[0] === name[0].toUpperCase() && name[0] !== name[0].toLowerCase() ? v.charAt(0).toUpperCase() + v.slice(1) : v.toLowerCase();
  });
}

/** the approved line for these old words (said in this stage), or null when the review does not have it (it is said as it is) */
export function swapLine(old: string, stage = ''): Swapped | null {
  const k = normWords(old);
  const list = PLAIN.get(k);
  if (list) {
    const l = list.find((x) => x.stage === stage) ?? list.find((x) => !x.stage) ?? list[0];
    return { line: l, text: l.text, then: l.then };
  }
  for (const t of TEMPLATED) {
    const m = t.re.exec(k);
    if (!m) continue;
    // the holes come back lower-cased from the match: take the words from the old line itself where it can
    const vals = m.slice(1);
    return { line: t.line, text: fill(t.line.text, t.names, vals), then: fill(t.line.then, t.names, vals) };
  }
  return null;
}

/** what Dot's ring points at, from the review's target words */
export function targetTopic(target: string | null): TopicId | undefined {
  if (!target) return undefined;
  const s = target.toLowerCase();
  if (/^pokey$|card's gesture/.test(s)) return 'controls';
  if (/goal card/.test(s)) return undefined;
  if (/shrine|thorn gate|sanctuary/.test(s)) return 'exit';
  if (/far side|landing|gap edge|\bgap\b|edge/.test(s)) return 'gap';
  if (/\blog\b|logs/.test(s)) return 'log';
  if (/stump|step|ledge|branch beside/.test(s)) return 'ledge';
  if (/heart/.test(s)) return 'heart';
  if (/power/.test(s)) return 'power';
  if (/hidden find|relic/.test(s)) return 'relic';
  if (/flag/.test(s)) return 'flag';
  if (/moving platform/.test(s)) return 'moving';
  if (/mushroom/.test(s)) return 'mushroom';
  if (/crumbl|shaky/.test(s)) return 'crumble';
  if (/bird|eagle|spider|ant|big animal|foe|snake|guard|monkey|prowler|jaguar/.test(s)) return 'foe';
  // (World 5's cocoons and closing orchids: rung where they are, GuideView.w5. The orchid's tip rang Pokey: QA, 5-3, v198)
  if (/cocoon/.test(s)) return 'cocoon';
  if (/orchid/.test(s)) return 'orchid';
  return topicOf(s);
}

/** the move that closes a move tip, from the gesture it names (and what it points at); undefined: it is not one the guide can see */
export function gestureMove(gesture: string | null, topic: TopicId | undefined): MoveId | undefined {
  switch (gesture) {
    case 'slide':
      return topic === 'log' ? 'push' : topic === 'vine' || topic === 'rope' ? undefined : 'run';
    case 'flick-up':
      // (onto a mushroom: the tip is done when he bounces, not on any jump)
      if (topic === 'mushroom') return 'bounce';
      return topic === 'vine' || topic === 'rope' || topic === 'trunk' ? 'grab' : 'jump';
    case 'double-jump':
      return 'double';
    case 'tap':
      return 'punch';
    case 'flick-side':
      return 'kick';
    case 'flick-hold':
      return 'glide';
    case 'climb-up':
      return 'climb';
    case 'slide-down':
      return 'crouch';
    default:
      // (climb-down, lift, hold-still: shown for their reading time)
      return undefined;
  }
}

/** how long a puzzle's first line may wait its turn (ms) */
export const PUZZLE_NAME_WAIT_MS = 45000;
/** how long a line of a scene played in a stage (5-5's pouch scene) may wait its turn (ms) */
export const SCENE_WAIT_MS = 150000;
/** a tip about a new thing rather than a new move (dotGuide.ts GuideLine.thing): World 5's first-time tips */
/** how long a thing's tip stays up at most (ms): read, then gone, done or not */
export const THING_CAP_MS = 6000;
export const isThingTip = (id: string): boolean => W5_THING_TIPS.has(id);

/**
 * A line from the engine, in its old words, as the new look's guide queues it (components/dot/DotGuide.tsx engineLine): what it is
 * comes from those words (a warning, the locked exit, a tip and the move that closes it), and what is said is Matt's approved line for
 * it. Null: a cut line, not said. (Here, not in the component, so the tests queue exactly what the game does.)
 */
export function engineGuideLine(text: string, stageId: string, o: { boss?: boolean; flight?: boolean; dot?: boolean; ms?: number } = {}): GuideLine | null {
  const sw = swapLine(text, stageId);
  if (sw && sw.text === null) return null;
  // (a puzzle's later step, the move itself, is never said as he walks up: only after struggle there, dotTips.ts)
  if (sw && PUZZLE_LATER.has(sw.line.id)) return null;
  const c = classifyLine(text, !!o.boss);
  const said = sw?.text ?? text;
  let kind: GuideKind = c.kind;
  let move = c.move;
  let topic = c.topic;
  const thing = !!sw && isThingTip(sw.line.id) && kind !== 'must' && kind !== 'danger';
  if (sw && kind !== 'must' && kind !== 'danger') {
    const k = sw.line.kind;
    kind = k === 'move' || thing ? 'teach' : k === 'story' ? 'story' : k === 'help' ? 'struggle' : k === 'lock' ? 'must' : k === 'goal' ? 'goal' : 'info';
    topic = targetTopic(sw.line.target) ?? c.topic;
    move = kind === 'teach' ? c.move ?? gestureMove(sw.line.gesture, topic) : undefined;
  }
  // Dot's own flight: she is the one flying, so her tips are read, not watched for
  if (o.flight && kind !== 'must') {
    kind = 'info';
    move = undefined;
  }
  // (a scene's line says who speaks it: 5-5's pouch scene is Pokey, Dot and the narrator in turn, w5Lines.ts)
  const who: GuideWho = (sw && W5_SPEAKERS.get(sw.line.id)) ?? (o.dot === false ? 'Pokey' : 'Dot');
  const scene = !!sw && W5_SCENE_IDS.has(sw.line.id);
  const key = `engine:${sw?.line.id ?? text}`;
  // (what Tips says, dotTips.ts: the first line about a new thing, and a puzzle's steps)
  const room = roomLineOf(text);
  const id = sw?.line.id ?? '';
  const step: GuideLine['step'] = room?.step ?? (PUZZLE_STEPS[id] ? 'name' : PUZZLE_LATER.has(id) ? 'move' : undefined);
  // (a boss's line is about that boss's attack: Tips says each one the first time, as a new hazard)
  const mech = room?.mech ?? firstOf(id || text) ?? PUZZLE_STEPS[id]?.mech ?? (o.boss && !o.flight ? `boss:${id || text}` : undefined);
  if (room) {
    // (a room's lines are about its pieces: she perches by the one that matters now, or by the log a line names)
    topic = topicOf(said) === 'log' ? 'log' : 'puzzle';
    if (room.step === 'nudge' || room.step === 'move') kind = 'struggle';
    move = undefined;
  }
  // (a puzzle's first line is said as he walks in, ahead of a plain line: waiting behind one, it was taken down when he left the room
  // unsaid, 1-6 on Help)
  if (step === 'name') kind = 'teach';
  // (World 5's let-go on the silk follows the grab at once, with no breath: a quick thumb let go in the first sweet spot, and the line
  // came after it, QA v198 sideways. It is said while he swings, before he needs it)
  const thenNow = sw?.line.id === 'w5.silk';
  const then: GuideLine | undefined = sw?.then ? { key: `${key}:then`, text: sw.then, kind: thenNow ? 'must' : kind === 'teach' ? 'info' : kind, who, topic, source: 'engine' } : undefined;
  return {
    key,
    text: said,
    kind,
    who,
    move,
    topic,
    gesture: sw?.line.gesture ?? undefined,
    // (a thing's tip is taught once per thing, whatever moves this phone has seen: "Just reminders" still says it the first time)
    skill: thing ? sw!.line.id : kind === 'teach' && move ? `move:${move}` : c.skill,
    ...(thing ? { thing: true } : {}),
    // (a scene's lines are sent one after another, and may wait behind tips and the moments a spider is near: they keep their place)
    ...(scene ? { scene: true, waitMs: SCENE_WAIT_MS } : {}),
    // (the goal's "Still {n}" line: its number as it is when read, dotGuide.ts countedText)
    ...(sw?.line.id === 'goal.late' ? { counted: true } : {}),
    // (the engine's own time is for its old, longer words: the reading time of the new ones is the floor)
    ms: sw || o.boss ? undefined : o.ms,
    // a boss fight's warning or tip goes when its attack ends (the engine says so), or after about 6 s
    // (a thing's tip is read, not held for its move: one the player never does, a punch, kept the screen 20 s and the next tips waited)
    capMs: o.boss && kind !== 'must' ? GUIDE.bossLineMs : thing ? THING_CAP_MS : undefined,
    next: then,
    ...(mech ? { mech } : {}),
    // (a puzzle's first line belongs to the puzzle, not to a spot he runs past: it may wait its turn while he is there; the room takes
    // it down when he leaves, puzzlePlay.ts passTip)
    ...(step ? { step, ...(step === 'name' ? { waitMs: PUZZLE_NAME_WAIT_MS, soon: true } : {}) } : {}),
    // (the control test's lines are the test itself: each is said, every run, and none is dropped for a move he made before it came.
    // Seed 7920 said nothing for 24 s: "Run to the flowers" and "Turn around" went because he was already running at 2.5 s)
    // (only while the control test runs: a stage's own words can match a test row, "Flick up onto the mushroom to bounce" in 1-3)
    ...(sw?.line.id.startsWith('ctest.') && ctestEnabled() ? { soon: true, ctest: true } : {}),
    said: text,
    source: 'engine',
  };
}
