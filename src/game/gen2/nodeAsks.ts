/**
 * gen2/nodeAsks: what the DESIGNER fixed on a node (the node code's marks and long-form dials, NODES.md §8.0 and §8.9; R-165.198, Matt
 * 12:11-1:01 PM 11-13: the node is the unit every designer builds with, and every element mixes and matches with every other), and the
 * check that the built roll laid each one. The rule (packet NODES-2 item 1): every element a code writes is either LAID or the roll
 * FAILS BY NAME. Nothing a designer writes is ever dropped in silence.
 *
 * A mark the job already implies is no ask (`U^` is a climb, `D_` a descent: V8, V9), and an absent mark is rolled as ever, so every
 * graph written before the long form carries no asks and lays byte for byte as it did.
 *
 * ELEMENTS is the one table of what each element does today (the key's cards, reference/engine/NODE-KEY.html, show it):
 *   laid    the lay builds it from the ask, and the built roll is checked;
 *   checked the lay rolls it as before; the built roll is checked, and fails by name when it does not hold;
 *   later   nothing in this tree lays it: a code that writes it always fails by name (its emitter is named).
 */
import type { CodeDials, CodeToken } from './nodeCode.ts';
import { CONTENT_OF } from './nodeCode.ts';
import { CONTENT_LETTERS } from './nodeLetters.ts';
import type { ContentType, NodeJob } from './types.ts';

/** a node's asks: the token's marks and dials that the job does not already imply */
export interface NodeAsks {
  /** the content letter (§8.0) */
  content?: string;
  /** the move digit: '2' the node asks for the double, '1' for plain jumps only */
  move?: '1' | '2';
  /** the shape mark, when it is not the job's own (a climb's '^', a descent's '_') */
  shape?: Exclude<CodeToken['shape'], ''>;
  /** '+': a find on this node */
  find?: boolean;
  /** '&': creatures on this node; '&&': two or more together */
  creatures?: boolean;
  formation?: boolean;
  /** '<' patience, '>' hurry */
  tempo?: '<' | '>';
  /** the long form's dials (`:7`, `:p5.5`, `:t0.9`, `:&kind*n!`, `:#hazard`, `:+find`, `:$n`) */
  dials?: CodeDials;
}

/** a content letter's type in the deal (the eight the pool's sections carry; s v p t x are building blocks laid by their own emitters) */
export const TYPE_OF_LETTER: Readonly<Partial<Record<string, ContentType>>> = {
  g: 'ground', f: 'floating', c: 'climb', b: 'bounce', r: 'rope', k: 'crumble', w: 'water', h: 'hazard',
};

/** a content letter laid by what a node's sections FILL, not by the deal's section type: the prop tag a node asking for it must have
 *  laid at least one of (m: cover, World 1's hides through stillLay.ts, 1-7's 'Tm<': a bush, a moss carpet, a patch, hanging moss) */
export const FILL_LETTER: Readonly<Record<string, string>> = { m: 'hide' };

/** the building blocks with no emitter in this tree yet, and where each is built (packet NODES-2: named, never dropped; the one
 *  letter table's `unlaid` rows, nodeLetters.ts) */
export const LATER_CONTENT: Readonly<Record<string, string>> = Object.fromEntries(Object.entries(CONTENT_LETTERS).flatMap(([k, v]) => ('unlaid' in v ? [[k, v.unlaid]] : [])));

/** the hazard kinds the lay reads from the built stage's falls (any other id is a world's own hazard, Later) */
export const HAZARDS = ['soft', 'water', 'hurt', 'void'] as const;

export type ElementStatus = 'laid' | 'checked' | 'later';
/** every element of the key, what it does today (one source: NODE-KEY.html's cards and the tests read it) */
export const ELEMENTS: ReadonlyArray<{ element: string; mark: string; status: ElementStatus; how: string }> = [
  { element: 'content g f c b r k w h', mark: 'Pg', status: 'laid', how: "the node's type is fixed in the deal; every section laid there is checked to be that type" },
  { element: `content ${Object.keys(LATER_CONTENT).join(' ')}`, mark: 'Ps', status: 'later', how: 'no emitter keyed by the letter in this tree: the roll fails by name' },
  { element: 'move 1 / 2', mark: 'Pg2', status: 'checked', how: "2: a section there asks for the double; 1: none does. A miss fails by name" },
  { element: 'shape ^ _', mark: 'Pg^', status: 'laid', how: "the node's shape and height dial are the ask; its sections' net rise is checked (^ ends higher, _ lower)" },
  { element: 'shape ^^ @ *', mark: 'U^^', status: 'later', how: "V10: a stage must own the shape; the shaft, loop-back and hub have no lay here" },
  { element: 'find +', mark: 'P+', status: 'checked', how: 'a find (the seed perch) laid in the node, or the roll fails by name' },
  { element: 'creatures & / &&', mark: 'P&', status: 'checked', how: '&: a creature laid in the node; &&: two or more. A miss fails by name' },
  { element: 'tempo < >', mark: 'P>', status: 'laid', how: "the node's tempo dial (the flat stretch's walk) is the ask" },
  { element: 'rating :7', mark: ':7', status: 'laid', how: "the node's rating (its sections' difficulty pick) is the ask" },
  { element: 'threat :&kind*n!', mark: ':&snake*2', status: 'laid', how: "the node's enemy sockets take only its kinds, up to their counts; each kind's count is checked" },
  { element: 'threat asleep z', mark: ':&snake*1z', status: 'checked', how: "asleep only where the world lays that kind asleep (tag 'sleeper'); awake only where it does not" },
  { element: 'hazard :#soft :#water :#hurt :#void', mark: ':#hurt', status: 'checked', how: "a fall of that kind lies in the node's span, or the roll fails by name" },
  { element: 'hazard on a clock :#kind@clock', mark: ':#pods@beat', status: 'later', how: "named clocks are B14's pods (t-b14): the roll fails by name" },
  { element: 'reward :+find', mark: ':+seed', status: 'checked', how: 'the find laid in the node is that one' },
  { element: 'reward :$n', mark: ':$8', status: 'checked', how: 'the pickups laid in the node number exactly n' },
  { element: 'beat :t0.9', mark: ':t0.9', status: 'later', how: 'no clock piece in this tree keeps a beat: the roll fails by name' },
  { element: 'points :p5.5', mark: ':p5.5', status: 'later', how: 'the meter (tools/difficulty/score.ts) does not score a node inside the lay yet: the roll fails by name' },
];

/** the asks a parsed token carries: the marks it writes that its job does not imply (none: undefined, and the node rolls as ever) */
export function asksOf(t: CodeToken, job: NodeJob): NodeAsks | undefined {
  const implied = (job === 'climb' && t.shape === '^') || (job === 'descent' && t.shape === '_');
  const a: NodeAsks = {
    ...(t.content ? { content: t.content } : {}),
    ...(t.move ? { move: t.move } : {}),
    ...(t.shape && !implied ? { shape: t.shape } : {}),
    ...(t.find ? { find: true } : {}),
    ...(t.creatures ? { creatures: true } : {}),
    ...(t.formation ? { formation: true } : {}),
    ...(t.tempo ? { tempo: t.tempo } : {}),
    ...(t.dials ? { dials: t.dials } : {}),
  };
  return Object.keys(a).length ? a : undefined;
}

/** a node as laid, as the check reads it */
export interface LaidNode {
  id: string;
  /** the node's code as asked (for the message) */
  token: string;
  /** its sections in order: the template's content type, whether it asks for the double, and its exit's height less its entry's (y down) */
  sections: ReadonlyArray<{ content?: string; double: boolean; dy: number }>;
  /** the creatures laid in it (kind, and whether the world lays that kind asleep) */
  enemies: ReadonlyArray<{ kind: string; asleep: boolean }>;
  /** the finds laid in it (the find socket's id: 'seed') */
  finds: readonly string[];
  /** the pickups laid in it */
  pickups: number;
  /** the props laid in it, by their tags (a hide: 'hide', 'cover'), for a letter laid by fills (FILL_LETTER) */
  props?: ReadonlyArray<readonly string[]>;
}

/** each ask the laid node does not hold, by name: "node n5 Pg2&:&snake*2 threat snake*2: laid 1" (empty: every ask laid) */
export function askMisses(a: NodeAsks | undefined, n: LaidNode, cast: ReadonlyArray<{ id: string; tags?: readonly string[] }>, easy = false): string[] {
  if (!a) return [];
  const out: string[] = [];
  const miss = (what: string, why: string) => out.push(`node ${n.id} "${n.token}": ${what}: ${why}`);
  if (a.content && FILL_LETTER[a.content]) {
    const tag = FILL_LETTER[a.content];
    if (!(n.props ?? []).some((t) => t.includes(tag))) miss(`content '${a.content}' (${CONTENT_OF[a.content] ?? '?'})`, `no ${tag} laid`);
  } else if (a.content) {
    const type = TYPE_OF_LETTER[a.content];
    if (!type) miss(`content '${a.content}' (${CONTENT_OF[a.content] ?? '?'})`, `Later: ${LATER_CONTENT[a.content] ?? 'no such letter'}`);
    else {
      // (a section with no type, or the structural one, does not lay the ask either: every section of the node is that type)
      const off = n.sections.filter((s) => s.content !== type);
      if (!n.sections.length) miss(`content '${a.content}'`, 'no section laid');
      else if (off.length) miss(`content '${a.content}' (${type})`, `${off.length} of ${n.sections.length} sections are ${[...new Set(off.map((s) => s.content ?? 'untyped'))].join(', ')}`);
    }
  }
  if (a.move) {
    const dbl = n.sections.some((s) => s.double);
    if (a.move === '2' && !dbl) miss('move 2 (the double)', 'no section there asks for it');
    if (a.move === '1' && dbl) miss('move 1 (plain jumps)', 'a section there asks for the double');
  }
  if (a.shape) {
    const dy = n.sections.reduce((s, q) => s + q.dy, 0);
    if (a.shape === '^' && !(dy < 0)) miss('shape ^ (rising)', `its sections rise ${-Math.round(dy)} px`);
    else if (a.shape === '_' && !(dy > 0)) miss('shape _ (falling)', `its sections fall ${Math.round(dy)} px`);
    else if (a.shape !== '^' && a.shape !== '_') miss(`shape ${a.shape}`, 'Later: no lay for the shaft, loop-back or hub as a run node');
  }
  if (a.find && !n.finds.length) miss('find (+)', 'no find laid');
  if (a.creatures && !n.enemies.length) miss('creatures (&)', 'no creature laid');
  if (a.formation && n.enemies.length < 2) miss('formation (&&)', `${n.enemies.length} creature${n.enemies.length === 1 ? '' : 's'} laid`);
  const d = a.dials;
  if (d) {
    if (d.threat) for (const k of d.threat) {
      const def = cast.find((c) => c.id === k.kind);
      if (!def) { miss(`threat ${k.kind}`, "no creature of that id in this world's cast"); continue; }
      // (Easy cuts the count after the spacing, as every stage's: at most the ask there, and at least one; Normal lays it exactly)
      const got = n.enemies.filter((e) => e.kind === k.kind).length;
      if (easy ? got > k.count || got < 1 : got !== k.count) miss(`threat ${k.kind}*${k.count}`, `laid ${got}${easy ? ' on Easy' : ''}`);
      const sleeper = !!def.tags?.includes('sleeper');
      if (k.state === 'asleep' && !sleeper) miss(`threat ${k.kind} asleep`, 'this world lays it awake');
      if (k.state === 'awake' && sleeper) miss(`threat ${k.kind} awake`, 'this world lays it asleep');
    }
    if (d.threat) {
      const other = n.enemies.filter((e) => !d.threat!.some((k) => k.kind === e.kind));
      if (other.length) miss('threat', `also laid ${other.map((e) => e.kind).join(', ')}, which the node does not name`);
    }
    if (d.reward?.find && !n.finds.includes(d.reward.find)) miss(`reward +${d.reward.find}`, n.finds.length ? `laid ${n.finds.join(', ')}` : 'no find laid');
    if (d.reward?.pickups !== undefined && n.pickups !== d.reward.pickups) miss(`reward $${d.reward.pickups}`, `laid ${n.pickups} pickups`);
    if (d.beat !== undefined) miss(`beat t${d.beat}`, 'Later: no clock piece in this tree keeps a beat');
    if (d.points !== undefined) miss(`points p${d.points}`, 'Later: the meter does not score a node inside the lay');
    if (d.hazard?.clock) miss(`hazard #${d.hazard.kind}@${d.hazard.clock}`, "Later: named clocks are B14's pods (t-b14)");
    else if (d.hazard && !(HAZARDS as readonly string[]).includes(d.hazard.kind)) miss(`hazard #${d.hazard.kind}`, "Later: no world hazard of that id is laid by a node yet");
  }
  return out;
}

/** a node's hazard ask against the built stage's falls over its span (x0..x1): each fall's kind as the drops name it */
export function hazardMiss(a: NodeAsks | undefined, id: string, token: string, span: readonly [number, number], falls: ReadonlyArray<{ x0: number; x1: number; kind: string }>): string[] {
  const h = a?.dials?.hazard;
  if (!h || h.clock || !(HAZARDS as readonly string[]).includes(h.kind)) return [];
  const over = falls.filter((f) => f.x1 > span[0] && f.x0 < span[1]);
  return over.some((f) => f.kind === h.kind) ? [] : [`node ${id} "${token}": hazard #${h.kind}: ${over.length ? `laid ${[...new Set(over.map((f) => f.kind))].join(', ')}` : 'no fall in its span'}`];
}
