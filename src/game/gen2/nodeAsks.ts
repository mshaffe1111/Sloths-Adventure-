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
// (l, the lure: a node holds it where a lure target was laid in it, a prop tagged 'lure' (gen2/lureLay.ts LURE_TAG; nodeLetters.test))
export const FILL_LETTER: Readonly<Record<string, string>> = { m: 'hide', l: 'lure' };

/** the building blocks with no emitter in this tree yet, and where each is built (packet NODES-2: named, never dropped; the one
 *  letter table's `unlaid` rows, nodeLetters.ts) */
export const LATER_CONTENT: Readonly<Record<string, string>> = Object.fromEntries(Object.entries(CONTENT_LETTERS).flatMap(([k, v]) => ('unlaid' in v ? [[k, v.unlaid]] : [])));

/** the hazard kinds the lay reads from the built stage's falls: registered in every world (any other id is a world's own, HazardDef) */
export const HAZARDS = ['soft', 'water', 'hurt', 'void'] as const;

/** what lays a hazard or a clock: the bricks that can (a section with a zone of one of `zones`' kinds, or a prop socket that allows one
 *  of `props`), and what the BUILT stage holds where it was laid (`zone`: a zone of that kind, zones.ts, over the node's span) */
export interface HazardLay {
  /** the built stage's zone kind it is read by (st.zones) */
  zone: string;
  /** a section lays it when one of its zones (SectionZone.kind) is of these kinds */
  zones?: readonly string[];
  /** or when one of its prop sockets allows one of these props (an emitter lays the zone: the dark's ends, gen2/dark.ts) */
  props?: readonly string[];
}

/**
 * THE HAZARD REGISTRY (ENG-ASKS, R-165.501; AUDIT-W3 finding 1): a world's own hazards, by id, as its data fills them
 * (WorldManifest.hazards). A node code's `:#id` asks for that hazard on the node, `:#id@clock` for it on that named clock: the deal draws a
 * section of the pool that lays it (and the clock), and the built roll holds its zone over the node's span, or the roll fails BY NAME
 * ('#moon is not a registered hazard', 'no section in the pool lays #spore'). The four fall kinds (HAZARDS) are registered everywhere and
 * read from the falls as they always were; a world's row of one of their ids adds only its clocks (World 3's '#soft@moon').
 */
export interface HazardDef extends Partial<HazardLay> {
  id: string;
  /** the named clocks it runs on (the world's: the puff, the moon, the doze), each laid as a hazard is */
  clocks?: Readonly<Record<string, HazardLay>>;
}

/** a world's registry: the four falls, then its own rows (a fall's row adds clocks to it) */
export function hazardRegistry(rows: readonly HazardDef[] | undefined): ReadonlyMap<string, HazardDef> {
  const reg = new Map<string, HazardDef>(HAZARDS.map((k) => [k, { id: k }]));
  for (const r of rows ?? []) {
    const fall = (HAZARDS as readonly string[]).includes(r.id);
    reg.set(r.id, fall ? { id: r.id, ...(r.clocks ? { clocks: r.clocks } : {}) } : r);
  }
  return reg;
}

/** may section `t` lay `lay` (its zones, or a prop its sockets allow) */
export function sectionLays(t: { zones?: ReadonlyArray<{ kind: string }>; sockets: ReadonlyArray<{ role: string; allow?: readonly string[] }> }, lay: Partial<HazardLay>): boolean {
  return (t.zones ?? []).some((z) => (lay.zones ?? []).includes(z.kind))
    || t.sockets.some((s) => s.role === 'prop' && (s.allow ?? []).some((p) => (lay.props ?? []).includes(p)));
}

/** what a node's hazard ask needs a section to lay (its hazard's bricks unless it is a fall, its clock's), or why it cannot be asked */
export function hazardNeeds(h: { kind: string; clock?: string }, reg: ReadonlyMap<string, HazardDef>): { lays: HazardLay[]; fall?: string } | { refused: string } {
  const def = reg.get(h.kind);
  if (!def) return { refused: `#${h.kind} is not a registered hazard in this world` };
  const fall = (HAZARDS as readonly string[]).includes(h.kind) ? h.kind : undefined;
  const lays: HazardLay[] = [];
  if (!fall) {
    // (a row that names no zone is world data written wrong: it cannot be checked, so it is refused by name, never passed)
    if (!def.zone) return { refused: `#${h.kind} names no zone it is laid as` };
    lays.push({ zone: def.zone, ...(def.zones ? { zones: def.zones } : {}), ...(def.props ? { props: def.props } : {}) });
  }
  if (h.clock) {
    const c = def.clocks?.[h.clock];
    if (!c) return { refused: `@${h.clock} is not a clock #${h.kind} runs on in this world` };
    lays.push(c);
  }
  return { lays, ...(fall ? { fall } : {}) };
}

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
  { element: "hazard of the world's registry :#id", mark: ':#dark', status: 'laid', how: "the world's registry (WorldManifest.hazards) names its bricks: the node draws a section that lays it and its zone lies in the node's span; an id not registered, or one no section of the pool lays, fails by name" },
  { element: 'hazard on a clock :#id@clock', mark: ':#dark@puff', status: 'laid', how: "the registry's row names the clocks it runs on (the world's data: the puff, the moon): a section that lays the hazard and the clock, both zones in the span; any other clock fails by name" },
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
  }
  return out;
}

/** a span's overlap with an x range */
const over = <T extends { x0: number; x1: number }>(xs: readonly T[], span: readonly [number, number]) => xs.filter((f) => f.x1 > span[0] && f.x0 < span[1]);

/**
 * a node's hazard ask against the built stage over its span (x0..x1), by the world's registry (hazardRegistry): refused by name when the id
 * or clock is not registered or no section of the pool lays it; else a fall of that kind (the four, as the drops name them) and each
 * zone it needs (its own, its clock's) over the span, or the miss by name
 */
export function hazardMiss(a: NodeAsks | undefined, id: string, token: string, span: readonly [number, number], falls: ReadonlyArray<{ x0: number; x1: number; kind: string }>,
  reg: ReadonlyMap<string, HazardDef> = hazardRegistry(undefined), zones: ReadonlyArray<{ x0: number; x1: number; kind: string }> = [],
  pool?: ReadonlyArray<Parameters<typeof sectionLays>[0]>): string[] {
  const h = a?.dials?.hazard;
  if (!h) return [];
  const what = `hazard #${h.kind}${h.clock ? `@${h.clock}` : ''}`;
  const miss = (why: string) => [`node ${id} "${token}": ${what}: ${why}`];
  const need = hazardNeeds(h, reg);
  if ('refused' in need) return miss(need.refused);
  for (const l of need.lays) if (pool && !pool.some((t) => sectionLays(t, l))) return miss(`no section in the pool lays ${l === need.lays[0] && !need.fall ? `#${h.kind}` : `@${h.clock}`}`);
  if (need.fall) {
    const f = over(falls, span);
    if (!f.some((q) => q.kind === need.fall)) return miss(f.length ? `laid ${[...new Set(f.map((q) => q.kind))].join(', ')}` : 'no fall in its span');
  }
  const z = over(zones, span);
  for (const l of need.lays) if (!z.some((q) => q.kind === l.zone)) return miss(`no ${l.zone} zone in its span${z.length ? ` (laid ${[...new Set(z.map((q) => q.kind))].join(', ')})` : ''}`);
  return [];
}
