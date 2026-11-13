/**
 * probe12b.ts: the Critic's proof runs for the 1-2 packet audit (2026-11-11). Nothing in the game imports it.
 *   npx tsx reference/qa-reports/CRITIC-1-2-packet/probe12b.ts iso              1-1 built with and without every kit row the packet adds
 *   npx tsx reference/qa-reports/CRITIC-1-2-packet/probe12b.ts supply 120       1-2 rolled on THE PACKET'S brief (teaches thorns, deal 30/35/25/10)
 *   npx tsx reference/qa-reports/CRITIC-1-2-packet/probe12b.ts supply 60 1-2 6  ... with ONLY=harvest-12-B (one graph), NOARR=1 (meadow rest-only), XREST=n
 *   npx tsx reference/qa-reports/CRITIC-1-2-packet/probe12b.ts v3               the node-code rule V3 on a double with no double teach in the stage
 * STAND-INS: the 16 reused sections are the real ones. The 28 own and new sections do not exist yet, so each is a copy of a real
 * section carrying the packet's id, job, content type and feel (table NEW below). So this run proves what follows from the TAGS and
 * the COUNTS (which job and type the deal asks for, what the pool can answer, V-rules on the node code); it proves nothing about heights.
 */
import '../../../src/game/headlessDom.ts';
import { buildGen2Stage, rollErrors } from '../../../src/game/gen2/pipeline.ts';
import { w1World } from '../../../src/game/gen2/worlds/w1.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { createHash } from 'node:crypto';
const HARVEST: Record<string, string> = { 'harvest-12-A': 'A T P F R M X R F C R S E', 'harvest-12-B': 'A T F P R U D_ F R X R W R S E', 'harvest-12-C': 'A T M F R C X R D_ F P S E' };
const REUSE_ADD = ['w1-stair-run', 'w1-bank-run', 'w1-zigzag-run', 'w1-stump-descent', 'w1-log-steps-descent', 'w1-stair-test-back', 'w1-bank-stair-test-back', 'w1-stair-gap-twist'];
// stand-ins: [new id, source id, jobs, content, extra]
const NEW: Array<[string, string, string[], string, any?]> = [
  ['w1-knot-bank-12', 'w1-knot-bank', ['practise'], 'ground'], ['w1-mushroom-fork-12', 'w1-mushroom-fork', ['fork'], 'bounce'], ['w1-root-stair-fork-12', 'w1-root-stair-fork', ['fork'], 'climb'],
  ['w1-two-lifts-12', 'w1-two-lifts', ['test'], 'bounce'], ['w1-bounce-wall-12', 'w1-bounce-wall', ['combine'], 'bounce'], ['w1-mushroom-log-12', 'w1-mushroom-log', ['combine'], 'ground'],
  ['w1-drop-bounce-12', 'w1-two-lifts', ['twist'], 'bounce'], ['w1-dip-bounce-12', 'w1-cache-stones', ['twist'], 'bounce'], ['w1-two-answers-12', 'w1-stone-dips', ['twist'], 'ground'], ['w1-log-walk-12', 'w1-log-walk', ['rest'], 'structural'],
  ['w1-rain-path', 'w1-home-banks', ['arrive'], 'structural'], ['w1-root-walk', 'w1-home-banks', ['arrive'], 'structural'],
  ['w1-thorn-hollow-teach', 'w1-mushroom-lift', ['teach'], 'bounce', { teaches: 'thorns' }],
  ['w1-cap-hop', 'w1-cache-stones', ['practise'], 'bounce'], ['w1-cap-run', 'w1-cache-stones', ['flow'], 'bounce'], ['w1-root-hops', 'w1-stump-stones', ['practise'], 'ground'], ['w1-root-run', 'w1-stone-dips', ['flow'], 'ground'],
  ['w1-thorn-leap', 'w1-stone-dips', ['test'], 'ground'], ['w1-under-roots-fork', 'w1-hollow-twoway', ['fork'], 'ground'], ['w1-thorn-fork', 'w1-mushroom-fork', ['fork'], 'bounce'],
  ['w1-root-overhang', 'w1-meadow', ['rest'], 'structural'], ['w1-petal-bank', 'w1-log-walk', ['rest'], 'structural'], ['w1-note-hollow', 'w1-seed-perch', ['reward'], 'structural'],
  ['w1-thorn-chain', 'w1-cache-stones', ['signature'], 'bounce', { maxPerStage: 1 }], ['w1-thorn-chain-rise', 'w1-cache-stones', ['signature'], 'bounce', { maxPerStage: 1 }], ['w1-thorn-chain-isles', 'w1-cache-stones', ['signature'], 'bounce', { maxPerStage: 1 }],
  ['w1-low-bark-arrival', 'EXIT', ['exit'], 'structural'], ['w1-root-bridge-out', 'EXIT', ['exit'], 'structural'],
];
function kit12(mode: 'rows' | 'full') {
  const kit: any = w1World(); const M = kit.manifest;
  M.graphs.list.push(...Object.entries(HARVEST).map(([id, code]) => ({ id, archetype: 'harvest', code })));
  M.graphs.briefs['1-2'] = { ends: 'quiet', trend: 'level', branching: 'lots', teaches: ['thorns'], deal: { ground: 30, bounce: 35, climb: 25, floating: 10 } };
  M.lessons = { jump: '1-1', double: '1-1', bounce: '1-1' };
  M.required = { ...M.required, '1-2': [{ section: 'w1-note-hollow' }] };
  const by = new Map<string, any>(M.sections.map((s: any) => [s.id, s]));
  for (const id of REUSE_ADD) { const s = by.get(id); if (!s) throw new Error('no ' + id); s.feel = [...s.feel, '1-2']; }
  const exitSrc = M.sections.find((s: any) => (s.jobs ?? []).includes('exit') && (s.feel ?? []).includes('1-1'));
  if (mode === 'full') by.get('w1-knot-bank').feel = by.get('w1-knot-bank').feel.filter((f: string) => f !== '1-2');
  for (const [id, src, jobs, content, extra] of NEW) {
    const s0 = src === 'EXIT' ? exitSrc : by.get(src); if (!s0) throw new Error('no src ' + src);
    const c = JSON.parse(JSON.stringify(s0));
    Object.assign(c, { id, jobs, content, feel: ['1-2'], window: undefined, teaches: undefined, maxPerStage: undefined, parked: undefined }, extra ?? {});
    // strip 1-1 tips
    for (const v of c.subBlocks[0].versions) v.sockets = (v.sockets ?? []).filter((k: any) => k.role !== 'tip');
    c.sockets = (c.sockets ?? []).filter((k: any) => k.role !== 'tip');
    M.sections.push(c);
  }
  for (let i = 0; i < Number(process.env.XREST ?? 0); i++) { const c = JSON.parse(JSON.stringify(by.get('w1-log-walk'))); Object.assign(c, { id: 'w1-xrest-' + i, jobs: ['rest'], content: 'structural', feel: ['1-2'], window: undefined, parked: undefined }); M.sections.push(c); }
  if (process.env.NOARR) by.get('w1-meadow').jobs = ['rest'];
  if (process.env.ONLY) M.graphs.list = M.graphs.list.filter((g: any) => g.archetype !== 'harvest' || g.id === process.env.ONLY);
  return kit;
}
const cfgs = generateAllLevels();
const mode = process.argv[2];
if (mode === 'v3') { const { parseCode, checkCode } = await import('../../../src/game/gen2/nodeCode.ts'); for (const c of ['A Tb Pg1 R Xc2 R Sb E', 'A Tb Pg1 R Xc R Sb E']) console.log(c, '=>', JSON.stringify(checkCode(parseCode(c), {}).filter((e: string) => e.startsWith('V3')))); process.exit(0); }
const sig = (st: any) => createHash('sha1').update(JSON.stringify([st.platforms, st.collectibles, st.gen2?.plan ?? st.gen2?.sections, st.config?.levelWidth])).digest('hex').slice(0, 10);
if (mode === 'iso') {
  const c11 = cfgs.find((c: any) => c.id === '1-1')!; let diff = 0, n = 0;
  for (const difficulty of ['normal', 'easy'] as const) for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 4106, 1025, 1136, 77, 301, 999]) {
    let a = '', b = '';
    try { a = sig(buildGen2Stage({ config: c11, kit: w1World(), seed, difficulty })); } catch (e) { a = 'T:' + (e as Error).message.slice(0, 60); }
    try { b = sig(buildGen2Stage({ config: c11, kit: kit12('full'), seed, difficulty })); } catch (e) { b = 'T:' + (e as Error).message.slice(0, 60); }
    n++; if (a !== b) { diff++; console.log('DIFF', difficulty, seed, a, b); }
  }
  console.log(`1-1 isolation: ${n} builds, ${diff} differ`);
} else {
  const c12 = cfgs.find((c: any) => c.id === (process.argv[4] ?? '1-2'))!; const mk = () => (process.argv[4] === '1-1' ? w1World() : kit12('full')); const N = Number(process.argv[3] ?? 60);
  const kinds = new Map<string, number>(); const perRoll = { built: 0, floating: 0, poolShort: 0, v3: 0, cleanButV: 0 }; const graphs = new Map<string, number[]>(); const useAll = new Map<string, number>(); let throws = 0; const lens: number[] = []; const arr = new Map<string, number>();
  for (let seed = 1; seed <= N; seed++) {
    try {
      const st: any = buildGen2Stage({ config: c12, kit: mk(), seed, difficulty: 'normal' });
      const g = st.gen2; const errs: string[] = rollErrors(g);
      const structural = [...new Set(errs.filter((e) => /pool short|fits no node|node code|no section/.test(e)))];
      perRoll.built++; if (structural.some((e) => /no floating section left/.test(e))) perRoll.floating++; if (structural.some((e) => /pool short/.test(e))) perRoll.poolShort++; if (structural.some((e) => /V3/.test(e))) perRoll.v3++; if (!structural.some((e) => /pool short/.test(e))) perRoll.cleanButV++;
      const gid = (g.graph?.id) ?? '?';
      const rec = graphs.get(gid) ?? [0, 0]; rec[0]++; if (!structural.length) rec[1]++; graphs.set(gid, rec);
      for (const e of structural) { const k = e.replace(/n\d+/g, 'n#').replace(/slot \d+/, 'slot #').slice(0, 110); kinds.set(k, (kinds.get(k) ?? 0) + 1); }
      const plan = g.plan ?? []; lens.push(plan.length);
      for (const p of plan) useAll.set(p.template, (useAll.get(p.template) ?? 0) + 1);
      if (plan[0]) arr.set(plan[0].template, (arr.get(plan[0].template) ?? 0) + 1);
      if (seed <= 0) console.log(seed, gid, g.codeString ?? '', '|', plan.map((p: any) => p.template.replace('w1-', '')).join(' '));
    } catch (e) { throws++; const k = 'THROW ' + (e as Error).message.replace(/n\d+/g, 'n#').replace(/slot \d+/, 'slot #').slice(0, 120); kinds.set(k, (kinds.get(k) ?? 0) + 1); }
  }
  console.log('rolls: ' + JSON.stringify(perRoll) + ' (floating = a roll with "no floating section left"; poolShort = any pool-short; cleanButV = no pool-short, V-rule lines apart)');
  console.log('throws', throws, 'of', N, 'sections per roll', Math.min(...lens), '-', Math.max(...lens));
  console.log('graphs [rolled, structurally clean]', JSON.stringify([...graphs]));
  console.log('first section', JSON.stringify([...arr]));
  for (const [k, v] of [...kinds].sort((a, b) => b[1] - a[1]).slice(0, Number(process.argv[5] ?? 6))) console.log(v, k);
  const ids = [...new Set([...kit12('full').manifest.sections.filter((s: any) => (s.feel ?? []).includes('1-2')).map((s: any) => s.id)])];
  console.log('pool', ids.length, 'never laid:', ids.filter((i) => !useAll.get(i)).join(', '));
  console.log('use counts', [...useAll].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k.replace('w1-', '')}:${v}`).join(' '));
}
