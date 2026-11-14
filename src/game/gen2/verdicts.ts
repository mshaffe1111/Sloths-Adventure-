/**
 * The roll verdicts (R-165.61, ADR-001; types in verdicts.types.ts): every check returns verdicts BY NAME, judged on the flown reach and
 * bands (reach.ts), never on physics.ts's closed form (no reachJump, JUMP_RISE, DOUBLE_RISE or BOUNCE_REACH in this file: the test reads
 * the file and proves it). A roll is accepted only when every check that ran returned nothing, and the checks that did not run are named
 * in `notJudged`.
 *
 * THE BOUNDARY (packet E0a): these gate 1-1 only. Every other stage carries NOT_JUDGED_ALL (pipeline applyVerdicts).
 */
import type { Difficulty } from '../difficulty.ts';
import type { Platform } from '../types.ts';
import { APEX, arc, BAND_SOURCE, BANDS, BLOCK_H, BODY_H, chainBand, lesserArcs, linkArcs, scopeFor, scopeOf, SPARE, TAKEOFF } from './reach.ts';
import type {
  Drop, FirstRunLayout, HurtLook, JudgedStage, LethalLook, Measure, PromiseRegistry, ReachMove, RollVerdict, SectionKind, SoftLook, Verdict, VerdictName,
} from './verdicts.types.ts';

/** every name, in the union's order (the test checks this list against verdicts.types.ts, so a new name can't be missed here) */
export const ALL_VERDICTS: readonly VerdictName[] = [
  'reach.unflown', 'arc.single-gap-over', 'arc.single-rise-over', 'block.lesser-passes', 'block.taught-fails', 'block.spare-thin', 'band.out',
  'headroom.cuts-arc', 'floor.unmarked', 'drop.lethal-in-no-lethal', 'drop.unwarned', 'drop.look-lies', 'drop.untyped', 'hazard.untaught', 'chain.mount',
  'teach.double-no-gap-after', 'teach.double-gap-unsafe', 'landing.dead-zone', 'bounce.no-purpose', 'first-run.drift',
];
/** the checks that need a flown arc: not judged (with `reach.unflown`) where the setting and place have none (ADR-001 §3) */
export const ARC_VERDICTS: readonly VerdictName[] = ['arc.single-gap-over', 'arc.single-rise-over', 'block.lesser-passes', 'block.taught-fails', 'block.spare-thin', 'band.out', 'headroom.cuts-arc'];
/** what a stage outside THE BOUNDARY carries: nothing judged, every name stated (5-7, 5-9, Worlds 6-8) */
export const NOT_JUDGED_ALL = (setting: Difficulty): RollVerdict => ({ accepted: true, setting, notJudged: [...ALL_VERDICTS] });

const R = Math.round;
const meas = (measured: number, limit: number, upper: boolean, source: string): Measure =>
  ({ measured: R(measured), limit: R(limit), spare: R(upper ? limit - measured : measured - limit), source });

// ───────────────────────── the asks: classified, then judged on the arcs ─────────────────────────

/** a jump the builder laid, world px, before it is classified (pipeline LocalAsk with its section) */
export interface RouteAsk { x0: number; x1: number; yTake: number; yLand: number; move: 'single' | 'double' | 'bounce'; block?: 'double' | 'bounce'; thin: boolean; key: string; section: string }

/** the move each kind is BUILT for (the flick, bands.md §1) and the lesser move it must keep out (a block's) */
export const TAUGHT: Record<SectionKind, ReachMove> = {
  'single-gap': 'single-flick', 'single-rise': 'single-flick', 'double-teach-rise': 'double-flick', 'double-teach-rise-thin': 'double-flick', 'double-teach-first': 'double-flick',
  'double-test-gap': 'double-flick', 'bounce-teach': 'bounce', 'bounce-air-test': 'bounce-air', 'chain-hop': 'bounce',
};

/**
 * A laid jump as a section kind (ADR-001 `asks`): a bounce lip is the bounce teach in a teach node, else the bounce + air jump test; a
 * double that rises more than a block's 50 px is the rise form (thin under a thin lip), a level one the double gap; a single that rises
 * more than 20 px is a single rise, else a single gap. The figure: the rise for a rise kind, the gap lip to lip for a gap kind.
 * A 'double' PLACE that is not a declared double block (pieces' `block`) and whose figure fits the single band on this setting is a
 * single section (w1-leap-stones' 50-60 px stones: the place is the builder's envelope, not a lesson; the Critic, E0a attempt 1).
 */
export function classify(a: RouteAsk, inTeach: boolean, setting: Difficulty): { kind: SectionKind; figure: number } {
  const rise = a.yTake - a.yLand, gap = a.x1 - a.x0;
  if (a.move === 'bounce' || a.block === 'bounce') return { kind: inTeach ? 'bounce-teach' : 'bounce-air-test', figure: rise };
  const single = (): { kind: SectionKind; figure: number } => (rise > 20 ? { kind: 'single-rise', figure: rise } : { kind: 'single-gap', figure: gap });
  if (a.move === 'double' && a.block !== 'double') {
    const s = single(), band = BANDS[s.kind][setting];
    if (band !== 'none' && s.figure <= band.hi) return s;
  }
  if (a.move === 'double' || a.block === 'double') return rise > 50 ? { kind: a.thin ? 'double-teach-rise-thin' : 'double-teach-rise', figure: rise } : { kind: 'double-test-gap', figure: gap };
  return single();
}

/**
 * The clear height over the take-off floor along a jump: the lowest underside of a solid block (BLOCK_H, 50 px or taller: a bough or a
 * stone is no ceiling, he passes through or lands on it) wholly above both lips, over the take-off run (TAKEOFF.easy, 70 px before the
 * lip, the longer rule) and the flight up to the far lip; never over the landing, whose next piece is the route's next step
 */
export function headroomOf(a: Pick<RouteAsk, 'x0' | 'x1' | 'yTake' | 'yLand'>, platforms: readonly Platform[]): number {
  const top = Math.min(a.yTake, a.yLand);
  let low = -Infinity;
  for (const p of platforms) {
    if (p.type !== 'solid' || p.height < BLOCK_H.px || p.x >= a.x1 || p.x + p.width <= a.x0 - TAKEOFF.easy) continue;
    const under = p.y + p.height;
    if (under < top - 1 && under > low) low = under;
  }
  return low === -Infinity ? 9999 : R(a.yTake - low);
}

/** one ask's verdicts (a JudgedStage `asks` row), on the bands and the judged stage's own flown arcs on the setting */
export function askVerdicts(q: JudgedStage['asks'][number], setting: Difficulty, stageId: string): Verdict[] {
  const out: Verdict[] = [];
  const at = { x0: R(q.x0), x1: R(q.x1), section: q.section };
  const v = (name: VerdictName, line: string, measure?: Measure) => out.push({ name, setting, at, ...(measure ? { measure } : {}), line });
  // (a chain hop's band goes by the step between its two caps, chain.md §3; every other kind's by the setting)
  const band = q.kind === 'chain-hop' ? chainBand(q.step ?? 0) : BANDS[q.kind][setting];
  const where = `${q.kind}${q.step ? `, a step of ${R(q.step)} px,` : ''} at x ${R(q.x0)} (${q.section})`;
  if (band === 'none') v('band.out', `${where}: ${setting} has no ${q.kind} (band 'none')`, meas(q.figure, 0, true, BAND_SOURCE[q.kind]));
  else if (q.figure > band.hi) v('band.out', `${where}: ${R(q.figure)} px, over the band's ${band.hi}`, meas(q.figure, band.hi, true, BAND_SOURCE[q.kind]));
  else if (q.figure < band.lo) v('band.out', `${where}: ${R(q.figure)} px, under the band's ${band.lo}`, meas(q.figure, band.lo, false, BAND_SOURCE[q.kind]));
  const scope = scopeFor(setting, stageId);
  const link = linkArcs(setting, stageId), lesser = lesserArcs(setting, stageId);
  const thin = q.kind === 'double-teach-rise-thin';
  if (q.kind === 'single-gap' && q.figure > link.single.gap) {
    v('arc.single-gap-over', `${where}: ${R(q.figure)} px, past a flick's ${link.single.gap}`, meas(q.figure, link.single.gap, true, setting === 'normal' ? BAND_SOURCE['single-gap'] + ' (a flick from 55 px)' : arc('single-flick', scope).source + ' from 70 px'));
  }
  // (a single rise: judged against the thin climb, 117, the lower of the two: an ask does not say whether its lip is a block)
  if (q.kind === 'single-rise' && q.figure > link.single.climb.thin) v('arc.single-rise-over', `${where}: ${R(q.figure)} px, over a flick's climb ${link.single.climb.thin}`, meas(q.figure, link.single.climb.thin, true, arc('single-flick', scope).source + ' climb, thin'));
  // (a block: the lesser move at its best must fail with SPARE to spare; the taught move must clear it)
  const lesserOf = (): { px: number; what: string; source: string } | undefined => {
    if (q.kind === 'double-teach-rise' || q.kind === 'double-teach-rise-thin' || q.kind === 'double-teach-first') return { px: thin ? lesser.single.climb.thin : lesser.single.climb.block, what: 'one jump climbs', source: arc('single-hold', scope).source + ' climb' };
    if (q.kind === 'double-test-gap') return { px: lesser.single.gap, what: 'one jump crosses', source: arc('single-hold', scope).source + ' any timing' };
    // (the bounce teach teaches, it does not block (bands.md §4 "the other way", POLISH-7): one jump must not climb it; a double may)
    if (q.kind === 'bounce-teach') return { px: lesser.single.climb.block, what: 'one jump climbs', source: arc('single-hold', scope).source + ' climb' };
    if (q.kind === 'bounce-air-test') {
      const b = arc('bounce', scope).climb.block, d = lesser.double.climb.block;
      return b >= d ? { px: b, what: 'a bounce alone climbs', source: arc('bounce', scope).source + ' climb' } : { px: d, what: 'a plain double climbs', source: arc('double-hold', scope).source + ' climb' };
    }
    return undefined;
  };
  const L = lesserOf();
  if (L) {
    if (q.figure <= L.px) v('block.lesser-passes', `${where}: ${L.what} ${L.px}, the block is ${R(q.figure)}`, meas(q.figure, L.px, false, L.source));
    else if (q.figure - L.px < SPARE.px) v('block.spare-thin', `${where}: ${R(q.figure - L.px)} px over what ${L.what.replace(/ \w+$/, '')} reaches (${L.px}), under ${SPARE.px}`, meas(q.figure, L.px + SPARE.px, false, SPARE.source));
    const t = arc(TAUGHT[q.kind], scope);
    const can = q.kind === 'double-test-gap' ? t.gap.from70 : thin ? t.climb.thin : t.climb.block;
    if (q.figure > can) v('block.taught-fails', `${where}: ${R(q.figure)} px, past the taught ${TAUGHT[q.kind]}'s ${can}`, meas(q.figure, can, true, t.source));
  }
  const need = APEX[q.move].px + BODY_H.px;
  if (q.headroom < need) v('headroom.cuts-arc', `${where}: ${R(q.headroom)} px clear over the take-off, the ${q.move} needs ${R(need)}`, meas(q.headroom, need, false, `${APEX[q.move].source} + ${BODY_H.source}`));
  return out;
}

// ───────────────────────── the drops ─────────────────────────

const SOFT_LOOKS: readonly string[] = ['ground', 'pit-floor-art'] satisfies readonly SoftLook[];
const LETHAL_LOOKS: readonly string[] = ['water-art', 'void-dark'] satisfies readonly LethalLook[];
const isLethal = (d: Drop): boolean => d.ends.kind === 'life';
/** each kind of end and the looks that are true of it: a soft look, a lethal look and the hurt look never stand in for one another */
const LOOKS: Record<string, readonly string[]> = { lethal: LETHAL_LOOKS, soft: SOFT_LOOKS, heart: ['hurt-art'] satisfies readonly HurtLook[] };

/** the drops' verdicts: a lethal drop on a no-lethal stage, a lethal drop unwarned, a drop drawn with the other kind's look */
export function dropVerdicts(st: Pick<JudgedStage, 'setting' | 'policy' | 'drops'>): Verdict[] {
  const out: Verdict[] = [];
  for (const d of st.drops as readonly Drop[]) {
    const at = { x0: R(d.x0), x1: R(d.x1) };
    if (isLethal(d) && st.policy === 'no-lethal') out.push({ name: 'drop.lethal-in-no-lethal', setting: st.setting, at, line: `a fall into ${(d.ends as { cause: string }).cause} costs a life at x ${at.x0}..${at.x1} on a no-lethal stage` });
    const w = (d as { warn?: { dotLine?: string; sign?: boolean } }).warn;
    if (isLethal(d) && (!w || !w.dotLine || w.sign !== true)) out.push({ name: 'drop.unwarned', setting: st.setting, at, line: `the lethal drop at x ${at.x0}..${at.x1} has ${!w || !w.dotLine ? "no Dot line" : 'no sign'}` });
    const end = isLethal(d) ? 'lethal' : d.ends.kind === 'heart' ? 'heart' : 'soft';
    if (!LOOKS[end].includes(d.look)) out.push({ name: 'drop.look-lies', setting: st.setting, at, line: `the ${end} drop at x ${at.x0}..${at.x1} is drawn as ${d.look}` });
  }
  return out;
}

/** every gap on the route has a Drop record (never inferred): `routeGaps` the gaps the built stage shows (w1Pits on World 1) */
export function untypedVerdicts(st: Pick<JudgedStage, 'setting' | 'drops'>, routeGaps: ReadonlyArray<readonly [number, number]>): Verdict[] {
  return routeGaps.filter(([x0, x1]) => !(st.drops as readonly Drop[]).some((d) => d.x0 < x1 - 2 && d.x1 > x0 + 2))
    .map(([x0, x1]) => ({ name: 'drop.untyped' as const, setting: st.setting, at: { x0: R(x0), x1: R(x1) }, line: `a gap at x ${R(x0)}..${R(x1)} the builder laid with no Drop record` }));
}

// ───────────────────────── the first run (ADR-002) ─────────────────────────

/** the fixed first layout against its recorded lock: each setting whose built parts' hash moved fails `first-run.drift` */
export function firstRunVerdicts(layout: Pick<FirstRunLayout, 'seed' | 'lock'>, built: Readonly<Partial<Record<Difficulty, string>>>): Verdict[] {
  return (['normal', 'easy'] as const).filter((d) => built[d] !== layout.lock[d]).map((d) => ({
    name: 'first-run.drift' as const, setting: d, at: { x0: 0, x1: 0 }, line: `the first run (seed ${layout.seed}) builds ${built[d] ?? 'nothing'} on ${d}, recorded ${layout.lock[d]}`,
  }));
}

// ───────────────────────── a roll ─────────────────────────

/** what judgeRoll reads: the judged stage, the gaps the built stage shows, and the promise registry (promises11.ts) */
export interface Judged11 extends JudgedStage { routeGaps: ReadonlyArray<readonly [number, number]> }

/**
 * A roll's verdict on one setting: the arcs (unless the scope is unflown: then `reach.unflown` and the arc names are notJudged), the
 * drops, the untyped gaps and every promise of the registry judged on this setting. `first-run.drift` is judged on the first layout
 * (firstRunVerdicts, by the seed list's check), never on a roll: a roll states it notJudged.
 */
export function judgeRoll(st: Judged11, promises: PromiseRegistry = []): RollVerdict {
  const failed: Verdict[] = [];
  const notJudged: VerdictName[] = ['first-run.drift'];
  if (scopeOf(st.stageId, st.setting)) for (const q of st.asks) failed.push(...askVerdicts(q, st.setting, st.stageId));
  else notJudged.push('reach.unflown', ...ARC_VERDICTS);
  failed.push(...dropVerdicts(st), ...untypedVerdicts(st, st.routeGaps));
  for (const p of promises) {
    if (p.stages !== 'all' && !p.stages.includes(st.stageId)) continue;
    if (!p.settings.includes(st.setting)) { if (!notJudged.includes(p.id)) notJudged.push(p.id); continue; }
    failed.push(...p.judge(st));
  }
  const nj = notJudged.filter((n) => !failed.some((f) => f.name === n));
  return failed.length ? { accepted: false, setting: st.setting, failed: failed as unknown as [Verdict, ...Verdict[]], notJudged: nj } : { accepted: true, setting: st.setting, notJudged: nj };
}

/** a refused roll's failed verdicts as the errors' lines (`Gen2Meta.errors` derived: "verdict <name>: <line>") */
export const verdictLines = (v: RollVerdict | undefined): string[] => (v && !v.accepted ? v.failed.map((f) => `verdict ${f.name} (${f.setting}): ${f.line}`) : []);

