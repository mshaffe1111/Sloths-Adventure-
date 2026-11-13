/**
 * The node code (reference/engine/NODES.md §8, Matt: "our own compact notation"): one token per node, `JOB content move shape find
 * creatures tempo` with no spaces (§8.1); a stage string is the tokens in order, a fork written `F[high road|low road]` (§8.2). A world's
 * graphs are stored as code strings (§8.6); this parser reads them, and checks a string against the validity rules (§8.3), failing with
 * the rule and the token ("V5 at token 9"). Every built roll records its realised string in its meta (gen2.code, gen2.codeString).
 *
 * Two kinds of string: a GRAPH (jobs and shapes only, §8.4: the deal fills in the content) and a REALISED roll (every mark). The rules
 * about content, moves and tempo apply only where a token carries them, so one checker reads both.
 */
import type { NodeJob, NodeShape } from './types.ts';

export interface CodeToken {
  /** the job letter (§8.0) */
  job: string;
  /** the content letter: g ground, f floating, c climb, b bounce, r rope, k crumble, w water, h hazard */
  content?: string;
  /** the move digit: 1 jump, 2 double */
  move?: '1' | '2';
  /** the shape mark: '' flat, '^' rising, '_' falling, '^^' shaft, '@' loop-back, '*' hub */
  shape: '' | '^' | '_' | '^^' | '@' | '*';
  /** '+': the find */
  find?: boolean;
  /** '&': creatures */
  creatures?: boolean;
  /** '<' patience, '>' hurry */
  tempo?: '<' | '>';
  /** '&&': the creatures come as a formation */
  formation?: boolean;
  /** a fork's roads, high then low; a pick's two stretches (`?[a|b]`, job '?') */
  roads?: [CodeToken[], CodeToken[]];
  /** the long form's dials (§8.9): what the designer fixes on this node, each `:` and one sign after the token */
  dials?: CodeDials;
}

/**
 * A node's long-form dials (NODES.md §8.9, R-165.198: the node is the designer's unit). Each is optional; a node that names none
 * rolls it, as ever. Written after the token, each `:` and one sign, in any order:
 *   `:7`           rating, 1-10 (the cadence)
 *   `:p5.5`        the node's difficulty target, in meter points (tools/difficulty/score.ts)
 *   `:t0.9`        the beat, seconds (the tempo mark's own number)
 *   `:&snake*2!`   threat: a cast kind (the world's creature id), how many (`*n`; unset 1), `!` awake, or `z` asleep after the count
 *                  (`snake*1z`); several with a comma
 *   `:#hurt`       hazard: what lies under or along the node (soft, water, hurt, void, or a world's own hazard id), `@clock` when it
 *                  keeps a named clock's beat (`:#pods@beat`)
 *   `:+seed`       reward: what the find is (the `+` mark says there is one)
 *   `:$8`          reward: how many pickups the node lays
 */
export interface CodeDials {
  rating?: number;
  points?: number;
  beat?: number;
  threat?: Array<{ kind: string; count: number; state?: 'awake' | 'asleep' }>;
  hazard?: { kind: string; clock?: string };
  reward?: { find?: string; pickups?: number };
}

/** the content letters (§8.0): the first eight are the mix's types; the rest are the building blocks any world's node can name
 *  (R-165.198): s swing vine, v vine field (two hands), p beat pieces on a clock, t gate, x trap */
export const CONTENT_OF: Readonly<Record<string, string>> = {
  g: 'ground', f: 'floating', c: 'climb', b: 'bounce', r: 'rope', k: 'crumble', w: 'water', h: 'hazard',
  s: 'swing', v: 'field', p: 'beat', t: 'gate', x: 'trap',
};

/** the job letters (§8.0's key) */
export const JOB_OF: Readonly<Record<string, NodeJob>> = {
  A: 'arrive', T: 'teach', P: 'practise', X: 'test', C: 'combine', W: 'twist', R: 'rest', S: 'signature', F: 'fork', U: 'climb', D: 'descent',
  M: 'flow', E: 'exit', L: 'finale', H: 'reward', K: 'pressure', Z: 'puzzle', B: 'arena', Y: 'story', V: 'preview', G: 'change',
  // (the pick, `?[a|b]`: a walked choice lays ONE of two stretches, the card road)
  '?': 'pick',
};
export const LETTER_OF: Readonly<Partial<Record<NodeJob, string>>> = Object.fromEntries(Object.entries(JOB_OF).map(([k, v]) => [v, k]));
/** the structural jobs: no content letter, flat, outside the mix (§7.1, V1) */
export const STRUCTURAL = new Set(['A', 'R', 'Y', 'L', 'E']);
/** the jobs not built yet (§6 LATER, §8.0) */
const LATER = new Set(['K', 'Z', 'B', 'Y', 'V', 'G']);
export const SHAPE_OF: Readonly<Record<CodeToken['shape'], NodeShape | 'shaft' | 'loop-back' | 'hub'>> = { '': 'flat', '^': 'rising', '_': 'falling', '^^': 'shaft', '@': 'loop-back', '*': 'hub' };
export const MARK_OF: Readonly<Record<NodeShape, CodeToken['shape']>> = { flat: '', rising: '^', falling: '_', 'two-road': '' };

const ONE = /^([A-Z])([a-z])?([12])?(\^\^|\^|_|@|\*)?(\+)?(&&|&)?([<>])?$/;

/** a token's long-form dials, from the text after its head (`:7:p5.5:&snake*2!`); a sign that is none of them fails by name */
function dialsOf(tail: string, t: string, at: number): CodeDials | undefined {
  if (!tail) return undefined;
  const bad = (why: string): never => { throw new Error(`node code: token ${at} "${t}": ${why}`); };
  if (tail[0] !== ':') bad(`"${tail}" after the token is not a dial (":7", ":p5.5", ":t0.9", ":&kind*n!", ":#hazard", ":+find", ":$n")`);
  const d: CodeDials = {};
  const num = (x: string, what: string) => { const v = Number(x); if (!x || !Number.isFinite(v)) bad(`${what} needs a number, not "${x}"`); return v; };
  for (const part of tail.slice(1).split(':')) {
    const sign = part[0], rest = part.slice(1);
    if (/^\d+$/.test(part)) d.rating = Number(part);
    else if (sign === 'p') d.points = num(rest, 'the points dial (":p5.5")');
    else if (sign === 't') d.beat = num(rest, 'the beat dial (":t0.9")');
    else if (sign === '&') {
      d.threat = rest.split(',').map((one) => {
        // (asleep is written after the count, "snake*1z": a bare trailing z would be a letter of the kind's own name)
        const m = /^([a-z][a-z0-9_-]*)(?:\*(\d+)([!z])?|(!))?$/.exec(one);
        if (!m) return bad(`"${one}" is not a threat ("kind", "kind*2", "kind!" or "kind*2!" awake, "kind*2z" asleep)`);
        const mark = m[3] ?? m[4];
        return { kind: m[1], count: m[2] ? Number(m[2]) : 1, ...(mark ? { state: mark === '!' ? ('awake' as const) : ('asleep' as const) } : {}) };
      });
    } else if (sign === '#') {
      const m = /^([a-z][a-z0-9_-]*)(?:@([a-z][a-z0-9_-]*))?$/.exec(rest);
      if (!m) return bad(`"${part}" is not a hazard (":#hurt", ":#pods@beat")`);
      d.hazard = { kind: m[1], ...(m[2] ? { clock: m[2] } : {}) };
    } else if (sign === '+') {
      if (!/^[a-z][a-z0-9_-]*$/.test(rest)) bad(`"${part}" is not a find (":+seed")`);
      d.reward = { ...d.reward, find: rest };
    } else if (sign === '$') d.reward = { ...d.reward, pickups: num(rest, 'the pickups dial (":$8")') };
    else bad(`":${part}" is not a dial (":7", ":p5.5", ":t0.9", ":&kind*n!", ":#hazard", ":+find", ":$n")`);
  }
  return d;
}

/** a token's dials written back (the parser's inverse) */
function formatDials(d: CodeDials | undefined): string {
  if (!d) return '';
  const out: string[] = [];
  if (d.rating !== undefined) out.push(`${d.rating}`);
  if (d.points !== undefined) out.push(`p${d.points}`);
  if (d.beat !== undefined) out.push(`t${d.beat}`);
  if (d.threat) out.push(`&${d.threat.map((k) => `${k.kind}${k.count !== 1 || k.state === 'asleep' ? `*${k.count}` : ''}${k.state === 'awake' ? '!' : k.state === 'asleep' ? 'z' : ''}`).join(',')}`);
  if (d.hazard) out.push(`#${d.hazard.kind}${d.hazard.clock ? `@${d.hazard.clock}` : ''}`);
  if (d.reward?.find) out.push(`+${d.reward.find}`);
  if (d.reward?.pickups !== undefined) out.push(`$${d.reward.pickups}`);
  return out.map((x) => `:${x}`).join('');
}

/** splits a run of tokens on its top-level spaces (a fork's brackets hold spaces of their own) */
function split(s: string): string[] {
  const out: string[] = [];
  let depth = 0, cur = '';
  for (const ch of s.trim()) {
    if (ch === '[') depth++;
    if (ch === ']') depth--;
    if (depth < 0) throw new Error(`node code: a ']' with no '[' in "${s}"`);
    if (ch === ' ' && depth === 0) { if (cur) out.push(cur); cur = ''; } else cur += ch;
  }
  if (depth !== 0) throw new Error(`node code: an unclosed '[' in "${s}"`);
  if (cur) out.push(cur);
  return out;
}

/** one token, or a fork `F[high|low]` with its marks after the bracket */
function token(t: string, at: number): CodeToken {
  if (t.startsWith('F[') || t.startsWith('?[')) {
    const close = t.lastIndexOf(']');
    const inner = t.slice(2, close);
    let depth = 0, bar = -1;
    for (let i = 0; i < inner.length; i++) {
      if (inner[i] === '[') depth++;
      else if (inner[i] === ']') depth--;
      else if (inner[i] === '|' && depth === 0) { bar = i; break; }
    }
    const pick = t[0] === '?';
    if (bar < 0) throw new Error(`node code: token ${at} "${t}": ${pick ? 'a pick needs two stretches, "?[a|b]"' : 'a fork needs two roads, "F[high|low]"'}`);
    const tail = t.slice(close + 1);
    const tm = /^([<>]?)((?::.*)?)$/.exec(tail);
    if (!tm) throw new Error(`node code: token ${at} "${t}": after a ${pick ? "pick's" : "fork's"} bracket only its tempo mark${pick ? '' : ' (and its dials)'}`);
    const high = parseCode(inner.slice(0, bar)), low = parseCode(inner.slice(bar + 1));
    const dials = dialsOf(tm[2], t, at);
    return { job: pick ? '?' : 'F', shape: '', roads: [high, low], ...(tm[1] ? { tempo: tm[1] as '<' | '>' } : {}), ...(dials ? { dials } : {}) };
  }
  const colon = t.indexOf(':');
  const head = colon < 0 ? t : t.slice(0, colon);
  const dials = dialsOf(colon < 0 ? '' : t.slice(colon), t, at);
  const m = ONE.exec(head);
  if (!m || !JOB_OF[m[1]]) throw new Error(`node code: token ${at} "${t}" is not a token (JOB content move shape find creatures tempo)`);
  return {
    job: m[1],
    shape: (m[4] ?? '') as CodeToken['shape'],
    ...(m[2] ? { content: m[2] } : {}),
    ...(m[3] ? { move: m[3] as '1' | '2' } : {}),
    ...(m[5] ? { find: true } : {}),
    ...(m[6] ? { creatures: true } : {}),
    ...(m[6] === '&&' ? { formation: true } : {}),
    ...(m[7] ? { tempo: m[7] as '<' | '>' } : {}),
    ...(dials ? { dials } : {}),
  };
}

/** a stage string's tokens (a fork is one token, its roads inside) */
export function parseCode(s: string): CodeToken[] {
  return split(s).map((t, i) => token(t, i + 1));
}

/** a token written back (the inverse of the parser) */
export function formatToken(t: CodeToken): string {
  if (t.roads) return `${t.job === '?' ? '?' : 'F'}[${t.roads[0].map(formatToken).join(' ')}|${t.roads[1].map(formatToken).join(' ')}]${t.tempo ?? ''}${formatDials(t.dials)}`;
  return `${t.job}${t.content ?? ''}${t.move ?? ''}${t.shape}${t.find ? '+' : ''}${t.creatures ? (t.formation ? '&&' : '&') : ''}${t.tempo ?? ''}${formatDials(t.dials)}`;
}

/** what a check of a string needs to know about its stage */
export interface CodeRules {
  /** the brief's teach count: one T per move (V2) */
  teaches?: number;
  /** the stage's lessons of shapes it owns: '^^' (1-4's shaft), '@', '*' (V8, V10) */
  owns?: ReadonlyArray<'^^' | '@' | '*'>;
  /** at least one fork (V17: every 1-1 graph) */
  needsFork?: boolean;
  /** the windows by content letter, as a share of the stage's nodes (V12: 1-1's f in [0.67, 1]) */
  windows?: Readonly<Record<string, readonly [number, number]>>;
  /** the stage's deal, by content letter (V14: give or take 1) */
  deal?: Readonly<Record<string, number>>;
  /** creatures are taught by this stage (V16) */
  creatures?: boolean;
  /** the stage's place in its world (V13: K never at 1; V only at 9; G only at 6) */
  mini?: number;
  /** the ending fork is allowed (V15: LATER) */
  endingFork?: boolean;
  /** the jobs this stage may use beyond the 1-1 NOW set (V13 / §6: K, Z, B, Y, V, G are LATER) */
  later?: boolean;
  /** the brief's trend (V19: in a trend-up stage a descent in the last third is followed, before the exit, by a rising node) */
  trend?: 'up' | 'down' | 'level';
  /** the moves an earlier stage taught (the world's `lessons`, V3): 'double' and 'bounce' count as taught with no T for them here */
  known?: readonly string[];
}

/**
 * The validity rules (§8.3) a string breaks, each "V<n> at token <i>: why" (1-based, a fork's roads counted inside it). Empty when
 * the string is valid. V18 (realised pieces against the key's PIECES column) reads the laid stage, not the string: pipeline's own check.
 */
export function checkCode(tokens: readonly CodeToken[], rules: CodeRules = {}): string[] {
  const errs: string[] = [];
  const at = (i: number, v: string, why: string) => errs.push(`${v} at token ${i + 1}: ${why}`);
  const n = tokens.length;
  // (moves taught so far, as content+digit signatures: Tg1 teaches 'g1', Tb teaches 'b')
  const taught = new Set<string>();
  const sig = (t: CodeToken) => `${t.content ?? ''}${t.move ?? ''}`;
  const uses = (t: CodeToken, i: number, inFork = false) => {
    // (V3: a content job uses only moves taught earlier: the double, and a bounce, once a T for them came before)
    if (['P', 'X', 'C', 'W', 'M', 'U', 'S'].includes(t.job)) {
      if (t.move === '2' && !rules.known?.includes('double') && ![...taught].some((s) => s.endsWith('2'))) at(i, 'V3', `${formatToken(t)} uses the double before its teach`);
      if (t.content === 'b' && !rules.known?.includes('bounce') && ![...taught].some((s) => s.startsWith('b'))) at(i, 'V3', `${formatToken(t)} bounces before the bounce is taught`);
    }
    if (t.job === 'T') {
      // (V2: T is flat or rising, never in a fork, its move new)
      if (inFork) at(i, 'V2', 'a teach inside a fork');
      if (t.shape !== '' && t.shape !== '^') at(i, 'V2', `a teach is flat or rising, not "${t.shape}"`);
      if (t.content || t.move) {
        if (taught.has(sig(t))) at(i, 'V2', `${formatToken(t)} teaches a move already taught`);
        taught.add(sig(t));
      }
    }
    // (V1: content letters only on content jobs; structural ones are flat)
    if (STRUCTURAL.has(t.job) && (t.content || t.move || t.shape)) at(i, 'V1', `${t.job} is structural: no content, move or shape`);
    // (V8, V9: a climb is c and rising, a descent falling)
    if (t.job === 'U' && ((t.content && t.content !== 'c') || (t.content && t.shape !== '^' && t.shape !== '^^'))) at(i, 'V8', `a climb is c and rising, not ${formatToken(t)}`);
    if (t.job === 'D' && t.shape !== '_') at(i, 'V9', `a descent is falling ("D_"), not ${formatToken(t)}`);
    // (V10: the shapes this stage may use)
    if ((t.shape === '^^' || t.shape === '@' || t.shape === '*') && !rules.owns?.includes(t.shape)) at(i, 'V10', `the shape "${t.shape}" is not this stage's`);
    // (V13 / §6: the LATER jobs; V16: creatures only where taught)
    if (LATER.has(t.job) && !rules.later) at(i, 'V13', `${JOB_OF[t.job]} is a LATER node (NODES §6)`);
    if (t.job === 'K' && rules.mini === 1) at(i, 'V13', "a chase never in a world's first stage");
    if (t.job === 'V' && rules.mini !== undefined && rules.mini !== 9) at(i, 'V13', 'a boss preview only at X-9');
    if (t.job === 'G' && rules.mini !== undefined && rules.mini !== 6) at(i, 'V13', 'a change of pace only at X-6');
    if (t.creatures && !rules.creatures) at(i, 'V16', 'creatures before the stage that teaches them');
    // (V22, §8.9: a content letter is one of the key's; a dial holds what it can mean; a threat or a find's name goes with its mark)
    if (t.content && !CONTENT_OF[t.content]) at(i, 'V22', `"${t.content}" is no content letter (${Object.keys(CONTENT_OF).join(' ')})`);
    const d = t.dials;
    if (d) {
      if (d.rating !== undefined && (d.rating < 1 || d.rating > 10)) at(i, 'V22', `a rating is 1-10, not ${d.rating}`);
      if (d.points !== undefined && (d.points <= 0 || d.points > 10)) at(i, 'V22', `a difficulty target is over 0 and at most 10 meter points, not ${d.points}`);
      if (d.beat !== undefined && (d.beat < 0.3 || d.beat > 4)) at(i, 'V22', `a beat is 0.3-4 s, not ${d.beat}`);
      if (d.threat) {
        if (!t.creatures) at(i, 'V22', `${formatToken(t)} names a threat with no creatures mark ("&")`);
        if (!rules.creatures) at(i, 'V16', 'creatures before the stage that teaches them');
        for (const k of d.threat) if (k.count < 1 || k.count > 6) at(i, 'V22', `${k.count} of ${k.kind} (1-6 on a node)`);
      }
      if (d.reward?.find && !t.find && !t.roads) at(i, 'V22', `${formatToken(t)} names a find with no find mark ("+")`);
      if (d.reward?.pickups !== undefined && (d.reward.pickups < 0 || d.reward.pickups > 40)) at(i, 'V22', `${d.reward.pickups} pickups (0-40 on a node)`);
      if (STRUCTURAL.has(t.job) && (d.threat || d.hazard)) at(i, 'V1', `${t.job} is structural: no threat and no hazard`);
    }
  };
  let sawX = false, forks = 0;
  // (V23, §8.9: one pick a stage, two stretches that both hold nodes, no teach inside, and a rest before it: the pick is held from
  // the flag before its signs)
  const picks = tokens.map((t, i) => (t.job === '?' ? i : -1)).filter((i) => i >= 0);
  if (picks.length > 1) at(picks[1], 'V23', `${picks.length} picks (one a stage)`);
  for (const i of picks) {
    const [a, b] = tokens[i].roads!;
    if (!a.length || !b.length) at(i, 'V23', 'a pick needs two stretches');
    if ([...a, ...b].some((r) => r.job === 'T')) at(i, 'V23', 'a teach inside a pick');
    if ([...a, ...b].some((r) => r.roads)) at(i, 'V23', 'a fork or a pick inside a pick');
    if (tokens[i - 1]?.job !== 'R') at(i, 'V23', 'a pick follows a rest (its flag holds the pick through a set-back)');
  }
  tokens.forEach((t, i) => {
    if (t.job === '?') { for (const r of [...t.roads![0], ...t.roads![1]]) uses(r, i, true); return; }
    if (t.roads) {
      forks++;
      // (V7: two roads that both finish; the high road holds the find; no teach inside)
      const [hi, lo] = t.roads;
      if (!hi.length || !lo.length) at(i, 'V7', 'a fork needs two roads');
      if (hi.length && lo.length && !hi.some((r) => r.find) && hi.some((r) => r.content)) at(i, 'V7', "the high road carries the find ('+')");
      for (const r of [...hi, ...lo]) uses(r, i, true);
    } else uses(t, i);
    if (t.job === 'F' && !t.roads) forks++;
    // (V4: a twist only after a test)
    if (t.job === 'W' && !sawX) at(i, 'V4', 'a twist before any test');
    if (t.job === 'X') sawX = true;
    // (V5: right after X, W or S comes R, or E as the last node)
    if (['X', 'W', 'S'].includes(t.job)) {
      const next = tokens[i + 1];
      if (!next || !(next.job === 'R' || (next.job === 'E' && i + 1 === n - 1))) at(i, 'V5', `${t.job} is not followed by a rest (or the exit, last)`);
    }
    // (V15: the ending fork, LATER)
    if (t.roads && tokens[i + 1]?.job === 'E' && t.roads[0].some((r) => r.job === 'L') && !rules.endingFork) at(i, 'V15', 'the ending fork is LATER');
  });
  // (V19, NODES.md §8.3 at 0e8807dbd: in a trend-up stage, a D in the last third is followed before E by a node that rises)
  if (rules.trend === 'up') tokens.forEach((t, i) => {
    if (t.job !== 'D' || (i + 0.5) / n < 2 / 3) return;
    const after = tokens.slice(i + 1).filter((q) => q.job !== 'E' && q.job !== 'R');
    if (!after.some((q) => q.shape === '^' || q.shape === '^^')) at(i, 'V19', 'a descent in the last third with nothing rising after it before the exit');
  });
  // (V6: exactly one S, in the last third)
  const ss = tokens.map((t, i) => (t.job === 'S' ? i : -1)).filter((i) => i >= 0);
  if (ss.length !== 1) errs.push(`V6 at token ${(ss[1] ?? ss[0] ?? n - 1) + 1}: ${ss.length} signatures (exactly one)`);
  else if ((ss[0] + 0.5) / n < 2 / 3) at(ss[0], 'V6', 'the signature is not in the last third');
  // (V2: one T per move in the brief's teaches)
  const ts = tokens.filter((t) => t.job === 'T').length;
  if (rules.teaches !== undefined && ts !== rules.teaches) errs.push(`V2 at token ${tokens.findIndex((t) => t.job === 'T') + 1 || 1}: ${ts} teaches for the brief's ${rules.teaches}`);
  // (V17: a fork in every graph that needs one)
  if (rules.needsFork && forks === 0) errs.push('V17 at token 1: no fork');
  // (V11, V12, V14: the content mix, on the content tokens: a fork counts as its low road's type; S, the H find (a reward job, never
  // content: NODES.md §7.3) and the structural ones never)
  const content = tokens.map((t, i) => ({ i, t, c: t.roads ? t.roads[1].find((r) => r.content)?.content : t.job === 'S' || t.job === 'H' ? undefined : t.content }))
    .filter((x) => x.c && !STRUCTURAL.has(x.t.job));
  if (content.length) {
    const count = new Map<string, number>();
    for (const x of content) count.set(x.c!, (count.get(x.c!) ?? 0) + 1);
    const cap = Math.round(0.4 * content.length);
    for (const [c, k] of count) if (k > cap) at(content.findLast((x) => x.c === c)!.i, 'V11', `${k} of ${content.length} content nodes are '${c}' (cap ${cap})`);
    for (let k = 1; k < content.length; k++) {
      const a = content[k - 1], b = content[k];
      if (a.c !== b.c) continue;
      const teachThenPractise = a.t.job === 'T' && b.t.job === 'P';
      if (teachThenPractise || b.t.job === 'T') continue;
      at(b.i, 'V11', `'${b.c}' on two neighbouring content nodes`);
    }
    for (const x of content) {
      const w = rules.windows?.[x.c!];
      if (w && ((x.i + 0.5) / n < w[0] || (x.i + 0.5) / n > w[1])) at(x.i, 'V12', `'${x.c}' outside its window [${w[0]}, ${w[1]}]`);
    }
    if (rules.deal) for (const [c, want] of Object.entries(rules.deal)) {
      const got = count.get(c) ?? 0;
      if (Math.abs(got - want) > 1) errs.push(`V14 at token 1: ${got} '${c}' nodes for a deal of ${want}`);
    }
  }
  return errs;
}
