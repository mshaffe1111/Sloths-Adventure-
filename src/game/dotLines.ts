/**
 * Matt's approved lines for the new look (dotLinesData.ts), and how a line about to be said is swapped for its new words.
 *
 * The game still sends its old words (the engine's tips, the story asides, the goal), so everything keyed by them keeps working: the
 * "already heard" memory (tipMemory.ts) and the journal pages a hint opens both match the OLD text. Dot's guide looks the old words up here
 * when it says a line and shows the new ones; a cut line is not said at all. With the new look off, nothing here is used.
 */
import { DOT_LINES, type DotLineKind, type DotLineRow } from './dotLinesData.ts';
import { W5_DOT_LINES } from './w5Lines.ts';
import type { MoveId, TopicId } from './dotGuide.ts';
import { topicOf } from './dotGuide.ts';

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
