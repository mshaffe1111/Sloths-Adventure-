/**
 * supply12.ts: 1-2 rolled on THE PACKET'S OWN brief in the real pipeline, to prove the pool can answer every job and type the deal asks
 * (the Designer; built on the Critic's probe12b.ts of the packet audit, t-critic-1-2-packet). Nothing in the game imports it.
 *   npx tsx reference/specs/sims/supply12.ts [seeds=120] [graph id]
 * STAND-INS: the reused sections are the real ones. The own and new sections do not exist yet, so each is a copy of a real section
 * carrying the packet's id, jobs, content type and feel (table POOL, the same rows as the packet's section tables). So this proves what
 * follows from TAGS and COUNTS: which job and type each graph's deal asks for, what the pool answers, and the node-code rules. It proves
 * nothing about heights or reach: those are the builder's raw builds.
 * Prints, per graph and setting: rolls built, throws, rolls with a pool-short, each structural error kind, the V-rule lines apart, and
 * for every job the types dealt against the sections that answer them; then the sections never laid.
 */
import '../../../src/game/headlessDom.ts';
import { buildGen2Stage, rollErrors } from '../../../src/game/gen2/pipeline.ts';
import { w1World } from '../../../src/game/gen2/worlds/w1.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';

export const HARVEST_12: Record<string, string> = {
  'harvest-12-A': 'A T P F R M X R F C R S E',
  'harvest-12-B': 'A T F P R U D_ F R X R W R S E',
  'harvest-12-C': 'A T M F R C X R D_ F P S E',
};
export const BRIEF_12 = { ends: 'quiet', trend: 'level', branching: 'lots', teaches: ['thorns'], deal: { ground: 35, bounce: 35, climb: 30 } };
/** '1-2' comes OFF these three (the lead's ruling 11-11: the meadow is also an arrival, the knot bank carries a 1-1 line; the log road is
 *  floating, which 1-2's deal no longer holds) */
export const FEEL_OFF = ['w1-meadow', 'w1-knot-bank', 'w1-log-road'];
/** reused as they are, '1-2' ADDED to feel */
export const FEEL_ADD = ['w1-stair-run', 'w1-bank-run', 'w1-zigzag-run', 'w1-stump-descent', 'w1-stair-test-back', 'w1-bank-stair-test-back', 'w1-stair-gap-twist'];
/** own and new sections: [id, stand-in source, jobs, content, extra] */
type Row = [string, string, string[], string, Record<string, unknown>?];
export const POOL: Row[] = [
  // own versions (13)
  ['w1-knot-bank-12', 'w1-knot-bank', ['practise'], 'ground'], ['w1-mushroom-fork-12', 'w1-mushroom-fork', ['fork'], 'bounce'], ['w1-root-stair-fork-12', 'w1-bank-stair-fork', ['fork'], 'climb'],
  ['w1-two-lifts-12', 'w1-two-lifts', ['test'], 'bounce'], ['w1-bounce-wall-12', 'w1-bounce-wall', ['combine'], 'bounce'], ['w1-mushroom-log-12', 'w1-mushroom-log', ['combine'], 'ground'],
  ['w1-drop-bounce-12', 'w1-drop-bounce-twist', ['twist'], 'bounce'], ['w1-dip-bounce-12', 'w1-dip-bounce-twist', ['twist'], 'bounce'], ['w1-two-answers-12', 'w1-two-answers', ['twist'], 'ground'],
  ['w1-log-walk-12', 'w1-log-walk', ['rest'], 'structural'], ['w1-root-meadow-12', 'w1-log-walk', ['rest'], 'structural'], ['w1-fern-bank-12', 'w1-fern-bank', ['rest'], 'structural'], ['w1-clearing-12', 'w1-clearing', ['rest'], 'structural'],
  // new (25)
  ['w1-rain-path', 'w1-home-banks', ['arrive'], 'structural'], ['w1-root-walk', 'w1-home-banks', ['arrive'], 'structural'], ['w1-rain-banks', 'w1-home-banks', ['arrive'], 'structural'],
  ['w1-thorn-hollow-teach', 'w1-stone-dips', ['teach'], 'bounce', { teaches: 'thorns' }],
  ['w1-cap-hop', 'w1-stone-dips', ['practise'], 'bounce'], ['w1-root-hops', 'w1-stump-stones', ['practise'], 'ground'], ['w1-root-steps', 'w1-bank-stair-test-back', ['practise'], 'climb'],
  ['w1-cap-run', 'w1-stone-dips', ['flow', 'practise'], 'bounce'], ['w1-root-run', 'w1-stone-dips', ['flow'], 'ground'],
  ['w1-thorn-leap', 'w1-stone-dips', ['test'], 'ground'],
  ['w1-stair-lift', 'w1-bank-stair-test-back', ['combine'], 'climb'], ['w1-cap-lift', 'w1-bounce-wall', ['combine'], 'bounce'],
  ['w1-cap-steps-down', 'w1-stump-descent', ['descent'], 'bounce'],
  ['w1-under-roots-fork', 'w1-hollow-twoway', ['fork'], 'ground'], ['w1-thorn-fork', 'w1-mushroom-fork', ['fork'], 'bounce'], ['w1-root-ledge-fork', 'w1-bank-stair-fork', ['fork'], 'climb'],
  ['w1-log-shelter', 'w1-log-walk', ['rest'], 'structural'], ['w1-petal-bank', 'w1-log-walk', ['rest'], 'structural'], ['w1-hollow-log-rest', 'w1-log-walk', ['rest'], 'structural'],
  ['w1-note-hollow', 'w1-clearing', ['reward'], 'structural', { hasFind: true, phases: ['sho', 'ten'] }],
  ['w1-thorn-chain', 'w1-stone-dips', ['signature'], 'bounce', { maxPerStage: 1 }], ['w1-thorn-chain-rise', 'w1-stone-dips', ['signature'], 'bounce', { maxPerStage: 1 }], ['w1-thorn-chain-isles', 'w1-stone-dips', ['signature'], 'bounce', { maxPerStage: 1 }],
  ['w1-low-bark-arrival', 'EXIT', ['exit'], 'structural'], ['w1-root-bridge-out', 'EXIT', ['exit'], 'structural'],
];
type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
/** `as11`: the same kit with 1-2's rows filed under the id '1-1' (see FLOWN below) */
export function kit12(only?: string, as11 = false) {
  const ID = as11 ? '1-1' : '1-2';
  const kit: Any = w1World(); const M = kit.manifest;
  M.graphs.list.push(...Object.entries(HARVEST_12).map(([id, code]) => ({ id, archetype: 'harvest', code })));
  M.graphs.briefs[ID] = BRIEF_12;
  M.lessons = as11 ? { jump: '0-9', double: '0-9', bounce: '0-9' } : { jump: '1-1', double: '1-1', bounce: '1-1' };
  M.required = { ...M.required, [ID]: [{ section: 'w1-note-hollow' }] };
  // (w1World hands out the same section objects every call: copy each before its tags are touched)
  M.sections = M.sections.map((s: Any) => ({ ...s, feel: [...(s.feel ?? [])] }));
  const by = new Map<string, Any>(M.sections.map((s: Any) => [s.id, s]));
  for (const id of FEEL_OFF) by.get(id).feel = by.get(id).feel.filter((f: string) => f !== '1-2');
  for (const id of FEEL_ADD) by.get(id).feel = [...by.get(id).feel, '1-2'];
  const exitSrc = by.get('w1-quiet-arrival');
  for (const [id, src, jobs, content, extra] of POOL) {
    const s0 = src === 'EXIT' ? exitSrc : by.get(src);
    if (!s0) throw new Error(`supply12: no stand-in ${src}`);
    const c = JSON.parse(JSON.stringify(s0));
    const { hasFind, ...ex } = (extra ?? {}) as { hasFind?: boolean };
    Object.assign(c, { id, jobs, content, feel: ['1-2'], window: undefined, teaches: undefined, maxPerStage: undefined, parked: undefined, versionJobs: undefined, answers: undefined }, ex);
    for (const v of c.subBlocks[0].versions) {
      v.sockets = (v.sockets ?? []).filter((k: Any) => k.role !== 'tip' && k.role !== 'find' && !(k.allow ?? []).some((a: string) => /squirrel|bootprint/.test(a)));
      if (hasFind) v.sockets.push({ id: 'note', role: 'find', on: v.pieces[v.pieces.length - 1].key, t: 0.5, dn: 34 });
    }
    c.sockets = (c.sockets ?? []).filter((k: Any) => k.role !== 'tip' && !(k.allow ?? []).some((a: string) => /squirrel|bootprint/.test(a)));
    M.sections.push(c);
  }
  // (FLOWN: 1-1's own sections out of the pool, 1-2's in under its id)
  if (as11) for (const q of M.sections) q.feel = (q.feel ?? []).includes('1-2') ? ['1-1'] : [];
  if (only) M.graphs.list = M.graphs.list.filter((g: Any) => g.archetype !== 'harvest' || g.id === only);
  if (as11) M.graphs.list = M.graphs.list.filter((g: Any) => g.archetype === 'harvest');
  return kit;
}
if (process.argv[1]?.endsWith('supply12.ts')) {
  const N = Number(process.argv[2] ?? 120);
  /**
   * FLOWN=1: 1-2 is not judged on the flown arcs until Engine's scope item lands (reach.ts:83 `judgedOnArcs` is 1-1 only), so today a
   * 253-256 px double gap throws on it ("past the double's reach 230 px") and its blocks are judged closed-form. To see the pool as it
   * will roll AFTER that item, this mode gives the pipeline 1-2's config under the id '1-1' (the flown rows; 1-2's are within 1 px,
   * chain.md §1), with only 1-2's sections, graphs, brief and required row in the kit. It also sets the stage number to 1, because
   * the level check counts the double jump only on 1-1 and from 1-6 (levelCheck.ts:132-134 `EARLY_DOUBLE`, `doubleAllowed`): on 1-2
   * today every piece that needs a double or a bounce plus an air jump reads as unreachable and its section is swapped out (the
   * Engine packet's item for it). Without FLOWN: today's engine, as it is.
   */
  const FLOWN = !!process.env.FLOWN;
  const c12 = generateAllLevels().find((c) => c.id === '1-2')!;
  const config = FLOWN ? { ...c12, id: '1-1', miniIndex: 1 } : c12;
  console.log(FLOWN ? 'FLOWN=1: judged on the flown arcs, as after Engine item 2' : 'today\'s engine: 1-2 judged closed-form (not on the flown arcs)');
  const used = new Map<string, number>();
  const tidy = (e: string) => e.replace(/n\d+/g, 'n#').replace(/slot \d+/, 'slot #').replace(/token \d+/, 'token #').slice(0, 120);
  for (const gid of process.argv[3] ? [process.argv[3]] : Object.keys(HARVEST_12)) for (const difficulty of ['normal', 'easy'] as const) {
    let built = 0, throws = 0, short = 0, clean = 0, cleanBarV3 = 0;
    const kinds = new Map<string, number>(), asked = new Map<string, number>(), lens: number[] = [];
    for (let seed = 1; seed <= N; seed++) {
      try {
        const st: Any = buildGen2Stage({ config, kit: kit12(gid, FLOWN), seed, difficulty });
        const g = st.gen2;
        const errs = [...new Set((rollErrors(g) as string[]).filter((e) => /pool short|fits no node|node code|no section/.test(e)))];
        built++;
        if (errs.some((e) => /pool short/.test(e))) short++;
        if (!errs.length) clean++;
        if (!errs.filter((e) => !/V3/.test(e)).length) cleanBarV3++;
        for (const e of errs) kinds.set(tidy(e), (kinds.get(tidy(e)) ?? 0) + 1);
        const plan = g.plan ?? [];
        lens.push(plan.length);
        for (const p of plan) used.set(p.template, (used.get(p.template) ?? 0) + 1);
        for (const n of g.nodes ?? []) { const k = String(n.token ?? '').replace(/[0-9^_+<>]/g, ''); asked.set(k, (asked.get(k) ?? 0) + 1); }
      } catch (e) { throws++; const k = 'THROW ' + tidy((e as Error).message); kinds.set(k, (kinds.get(k) ?? 0) + 1); }
    }
    console.log(`== ${gid} ${difficulty}: ${N} seeds: built ${built}, throws ${throws}, rolls with a pool-short ${short}, structurally clean ${clean}, clean but for V3 ${cleanBarV3}; sections a roll ${Math.min(...lens)}-${Math.max(...lens)}`);
    for (const [k, v] of [...kinds].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`   ${String(v).padStart(4)}  ${k}`);
    console.log(`   job+type tokens laid: ${[...asked].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `${k}:${v}`).join(' ')}`);
  }
  const ids = kit12().manifest.sections.filter((s: Any) => (s.feel ?? []).includes('1-2')).map((s: Any) => s.id as string);
  console.log(`pool ${ids.length}; never laid: ${ids.filter((i: string) => !used.get(i)).join(', ') || 'none'}`);
  console.log(`laid, fewest first: ${[...ids].sort((a, b) => (used.get(a) ?? 0) - (used.get(b) ?? 0)).slice(0, 12).map((i) => `${i.replace('w1-', '')}:${used.get(i) ?? 0}`).join(' ')}`);
  const sup = new Map<string, string[]>();
  for (const s of kit12().manifest.sections.filter((q: Any) => (q.feel ?? []).includes('1-2'))) for (const j of s.jobs ?? []) { const k = `${j}/${s.content}`; sup.set(k, [...(sup.get(k) ?? []), s.id.replace('w1-', '')]); }
  console.log('supply by job/type:'); for (const [k, v] of [...sup].sort()) console.log(`   ${k.padEnd(22)} ${v.length}  ${v.join(', ')}`);
}
