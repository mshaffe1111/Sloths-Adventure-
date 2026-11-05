// The rolled stage graph (NODES.md §4, §6 "1-1 NOW"; CHUNK-POOL-BRIEF step 3): a world that lists its graphs rolls one per stage under
// the stage's brief, in place of the one fixed SPINE, and lays the brief's rules by construction. On the toy world, 16 seeds: the
// graphs vary; every roll keeps the order rules (teach before use, a rest after every test, twist and signature, never two quiet nodes
// side by side, the fork count the brief's branching asks, no finale on a quiet brief); a teach node holds the section that teaches its
// move and a fork node a two-road section; Easy keeps Normal's graph; a stage with no brief takes the SPINE. That every shipped stage
// builds as before is the every-stage lock's proof (tools/engine/lockall.ts).
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { SPRINT_GRAPHS } from './graphs.ts';
import { formatToken, parseCode } from './nodeCode.ts';
import { cfg, kit, manifest } from './toyWorld.ts';
import type { GraphBrief, MissionNode, SectionTemplate, WorldKit, WorldManifest } from './types.ts';

const twoRoad: SectionTemplate = {
  id: 'toy-two-road', name: 'high and low', archetypes: 'any', phases: ['sho', 'ten'], difficulty: 4, jobs: ['fork'],
  pieces: [
    { key: 'bank', shape: 'bank', w: [700, 800], place: { kind: 'start' } },
    { key: 'high', shape: 'branch', w: [260, 300], place: { kind: 'over', on: 'bank', at: [0.4, 0.5], dy: [-150, -150] }, main: false },
  ],
  entry: { piece: 'bank', kind: 'ground' }, exit: { piece: 'bank', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: true,
};
const ID = '1-3';
const withGraphs = (brief: GraphBrief): WorldKit => ({
  ...kit,
  manifest: { ...manifest, sections: [...manifest.sections, twoRoad], graphs: { list: [...SPRINT_GRAPHS], briefs: { [ID]: brief }, terrains: ['floor', 'logs'] } } as WorldManifest,
});
const SEEDS = Array.from({ length: 16 }, (_, i) => 5 + i * 53);
const build = (k: WorldKit, seed: number, difficulty: 'normal' | 'easy' = 'normal') => buildGen2Stage({ config: cfg(ID, 'sprint'), kit: k, seed, difficulty });
const jobs = (ns: MissionNode[]) => ns.map((n) => n.job);

const QUIET = new Set(['rest']);
function orderRules(ns: MissionNode[], brief: GraphBrief, what: string) {
  const js = jobs(ns);
  assert.equal(js[0], 'arrive', `${what}: ${js.join(' ')}`);
  assert.equal(js[js.length - 1], 'exit', `${what}: ${js.join(' ')}`);
  for (let i = 0; i < js.length - 1; i++) {
    if (js[i] === 'test' || js[i] === 'twist' || js[i] === 'signature') assert.ok(QUIET.has(js[i + 1]!) || js[i + 1] === 'exit', `${what}: no rest after ${js[i]}: ${js.join(' ')}`);
    assert.ok(!(QUIET.has(js[i]!) && QUIET.has(js[i + 1]!)), `${what}: two quiet nodes side by side: ${js.join(' ')}`);
  }
  const forks = js.filter((j) => j === 'fork').length;
  const band = brief.branching === 'none' ? [0, 0] : brief.branching === 'some' ? [1, 2] : [3, 4];
  assert.ok(forks >= band[0] && forks <= band[1], `${what}: ${forks} forks on branching '${brief.branching}'`);
  if (brief.ends === 'quiet') assert.ok(!js.includes('finale'), `${what}: a finale on a quiet brief`);
  else assert.ok(js.includes('finale'), `${what}: no finale on a finale brief`);
  const teaches = ns.filter((n) => n.job === 'teach').map((n) => n.teaches);
  if (brief.teaches) assert.deepEqual(teaches, brief.teaches, `${what}: the teach nodes`);
  for (const n of ns) {
    assert.ok(n.dials && n.shape, `${what}: node ${n.id} has no dials`);
    assert.ok(n.dials.rating >= 1 && n.dials.rating <= 10);
    if (n.job === 'fork') assert.equal(n.shape, 'two-road');
  }
}

test('the graphs vary roll to roll, and every roll keeps the order rules and the brief', () => {
  const briefs: GraphBrief[] = [
    { ends: 'quiet', trend: 'up', branching: 'some', teaches: ['carry'] },
    { ends: 'finale', trend: 'level', branching: 'none' },
    { ends: 'quiet', trend: 'down', branching: 'lots', teaches: ['carry'] },
  ];
  for (const brief of briefs) {
    const ids = new Set<string>(), shapes = new Set<string>();
    for (const s of SEEDS) {
      const st = build(withGraphs(brief), s);
      const g = st.gen2.graph;
      assert.ok(g.id, `seed ${s}: no graph rolled`);
      ids.add(g.id!);
      shapes.add(jobs(g.nodes).join(' '));
      orderRules(g.nodes, brief, `${JSON.stringify(brief)} seed ${s}`);
      // (the realised node code: one token per node, a string that reads back, and the rules it breaks named in the meta)
      assert.equal(st.gen2.code?.length, g.nodes.length, `seed ${s}: ${st.gen2.codeString}`);
      assert.equal(parseCode(st.gen2.codeString!).map(formatToken).join(' '), st.gen2.codeString);
      assert.ok(Array.isArray(st.gen2.codeErrors));
      assert.ok(!st.gen2.codeErrors!.some((e) => /^V(1|2|4|5|6|7|9|10|13|16|17) /.test(e)), `seed ${s}: ${st.gen2.codeString}: ${st.gen2.codeErrors!.join('; ')}`);
    }
    assert.ok(ids.size >= 3, `${ids.size} graphs over 16 rolls`);
    assert.ok(shapes.size >= 4, `${shapes.size} skeletons over 16 rolls`);
  }
});

test('a teach node holds the section that teaches its move, a fork node a two-road section; nothing uses a move before its teach', () => {
  const brief: GraphBrief = { ends: 'quiet', trend: 'up', branching: 'lots', teaches: ['carry'] };
  let forksSeen = 0;
  for (const s of SEEDS) {
    const st = build(withGraphs(brief), s);
    const node = new Map(st.gen2.graph.nodes.map((n) => [n.id, n]));
    const byId = new Map(withGraphs(brief).manifest.sections.map((t) => [t.id, t]));
    let taught = false;
    st.gen2.plan.forEach((slot, i) => {
      const n = node.get(slot.node)!, t = byId.get(slot.template)!;
      // (the teach node opens on the section that teaches its move; any slot after it there teaches nothing new)
      if (n.job === 'teach' && st.gen2.plan[i - 1]?.node !== slot.node) assert.equal(t.teaches, 'carry', `seed ${s}: the teach node opens on ${t.id}`);
      if (t.teaches === 'carry') {
        assert.equal(n.job, 'teach', `seed ${s}: carry taught in a ${n.job} node`);
        taught = true;
      }
      if ((t.uses ?? []).includes('carry')) assert.ok(taught, `seed ${s}: ${t.id} uses carry before its teach`);
      if (n.job === 'fork') {
        forksSeen++;
        assert.ok(t.jobs?.includes('fork'), `seed ${s}: the fork node holds ${t.id}`);
      }
      // (and the length repair never grows the quiet end: the exit holds its one section)
      if (n.role === 'goal') assert.equal(st.gen2.plan.filter((p) => p.node === n.id).length, 1, `seed ${s}: the exit holds ${st.gen2.plan.filter((p) => p.node === n.id).length}`);
    });
  }
  assert.ok(forksSeen > 0, 'no fork laid');
});

test('Easy lays Normal\'s graph', () => {
  const k = withGraphs({ ends: 'quiet', trend: 'up', branching: 'some', teaches: ['carry'] });
  for (const s of SEEDS.slice(0, 6)) assert.deepEqual(jobs(build(k, s, 'easy').gen2.graph.nodes), jobs(build(k, s).gen2.graph.nodes), `seed ${s}`);
});

test('a stage with no brief, or a world with no graphs, takes the SPINE', () => {
  const k = withGraphs({ ends: 'quiet', trend: 'up', branching: 'some' });
  const other = buildGen2Stage({ config: cfg('1-4', 'sprint'), kit: k, seed: 7, difficulty: 'normal' });
  assert.equal(other.gen2.graph.id, undefined);
  assert.ok(other.gen2.graph.nodes.every((n) => !n.job));
  const plain = build(kit, 7);
  assert.equal(plain.gen2.graph.id, undefined);
  assert.equal(plain.gen2.graph.nodes.length, 9);
});

// (chunkSeconds: the toy sections' measured mean on the fast player's clock, about 4.6 s each (the clock the length floor holds). A pool big enough for a hard no-repeat: the toy sections sixteen times over, under their own ids, at spread difficulties; one late
// section held to the last third by its window)
const late: SectionTemplate = { ...twoRoad, id: 'toy-late', jobs: undefined, phases: ['sho', 'ten', 'ketsu'], window: [0.67, 1], weight: 6 };
const pool: SectionTemplate[] = [
  ...[...manifest.sections, twoRoad].flatMap((t) => Array.from({ length: 16 }, (_, k) => ({
    ...t, id: `${t.id}-${k}`, difficulty: Math.max(1, Math.min(9, t.difficulty + (k % 5) - 2)),
    // (the working sections take every working phase, so the toy pool is not the bottleneck the test would otherwise measure)
    ...(t.phases.includes('sho') || t.phases.includes('ten') ? { phases: [...new Set([...t.phases, 'ki', 'sho', 'ten', 'ketsu'] as const)] } : {}),
  }))),
  late,
];
const chunked = (brief: GraphBrief): WorldKit => ({
  ...kit,
  manifest: { ...manifest, sections: pool, graphs: { list: [...SPRINT_GRAPHS], briefs: { [ID]: brief }, terrains: ['floor', 'logs'], chunkSeconds: 4.6, maxPerStage: 1 } } as WorldManifest,
});

test('length from the chunk count: quiet nodes and forks hold one section, every node at least one, no section twice (the hard no-repeat)', () => {
  const brief: GraphBrief = { ends: 'quiet', trend: 'up', branching: 'some', teaches: ['carry-0'] };
  for (const s of SEEDS) {
    const st = build(chunked({ ...brief, teaches: undefined }), s);
    const g = st.gen2.graph;
    const want = g.nodes.reduce((a, n) => a + n.count!, 0);
    assert.ok(g.nodes.every((n) => n.count! >= 1), `seed ${s}: a node with no count`);
    for (const n of g.nodes) {
      const held = st.gen2.plan.filter((p) => p.node === n.id).length;
      assert.ok(held >= 1, `seed ${s}: ${n.job} ${n.id} holds nothing`);
      if (n.role === 'start' || n.role === 'goal' || n.role === 'rest' || n.job === 'fork') assert.equal(held, 1, `seed ${s}: ${n.job} ${n.id} holds ${held}`);
    }
    // (the first plan holds exactly the count; the length repair then adds or takes whole sections where the clock misses)
    const grown = st.gen2.repairs.filter((r) => r.kind === 'length' && /^one more section|^room for/.test(r.note ?? '')).length;
    const cut = st.gen2.repairs.filter((r) => r.kind === 'length' && /^one section fewer/.test(r.note ?? '')).length;
    assert.equal(st.gen2.plan.length - grown + cut, want, `seed ${s}: ${st.gen2.plan.length} sections, ${grown} grown, ${cut} cut, against a count of ${want}`);
    const ids = st.gen2.plan.map((p) => p.template);
    assert.equal(new Set(ids).size, ids.length, `seed ${s}: a repeat in ${ids.join(' ')}`);
  }
});

test('a windowed section stands only in its stretch of the stage', () => {
  let seen = 0;
  for (const s of SEEDS) {
    const st = build(chunked({ ends: 'quiet', trend: 'up', branching: 'some' }), s);
    const plan = st.gen2.plan;
    plan.forEach((p, i) => {
      if (p.template !== 'toy-late') return;
      seen++;
      assert.ok((i + 0.5) / plan.length >= 0.67, `seed ${s}: toy-late at slot ${i + 1} of ${plan.length}`);
    });
  }
  assert.ok(seen > 0, 'the windowed section never laid');
});

test('the cadence: a hard node climbs, then its last section cools', () => {
  let lastD = 0, lastN = 0, peakD = 0, peakN = 0;
  for (const s of SEEDS) {
    const st = build(chunked({ ends: 'quiet', trend: 'up', branching: 'some' }), s);
    const byId = new Map(pool.map((t) => [t.id, t]));
    for (const n of st.gen2.graph.nodes) {
      if (!n.dials || n.dials.rating < 5 || (n.count ?? 0) < 3) continue;
      const ds = st.gen2.plan.filter((p) => p.node === n.id).map((p) => byId.get(p.template)!.difficulty);
      lastD += ds[ds.length - 1]; lastN++;
      peakD += ds[ds.length - 2]; peakN++;
    }
  }
  assert.ok(lastN > 5, `${lastN} hard nodes of three or more`);
  assert.ok(lastD / lastN < peakD / peakN - 0.5, `last section ${(lastD / lastN).toFixed(2)}, the one before it ${(peakD / peakN).toFixed(2)}`);
});

// (the content deal, NODES.md §7.5: the toy pool's working clones typed in turn ground, floating, climb, bounce; 1-1's deal and window)
const TYPES = ['ground', 'floating', 'climb', 'bounce'] as const;
// (the carry teachers stand in for 1-1's bounce: bounce sections come only after the carry is taught, `typeNeeds`)
const typed: SectionTemplate[] = pool.map((t, k) => (t.teaches === 'carry' ? { ...t, content: 'bounce' as const } : t.phases.includes('sho') || t.phases.includes('ten') ? { ...t, content: TYPES[k % 4] } : { ...t, content: 'structural' as const }));
const dealt = (brief: GraphBrief): WorldKit => ({
  ...kit,
  manifest: { ...manifest, sections: typed, graphs: { list: [...SPRINT_GRAPHS], briefs: { [ID]: brief }, chunkSeconds: 4.6, maxPerStage: 1, windows: { floating: [0.67, 1] }, typeNeeds: { bounce: 'carry' } } } as WorldManifest,
});

test('the content deal: every content node typed, the counts the deal\'s give or take 1, no type over 40% or on two neighbours, floating only late', () => {
  const brief: GraphBrief = { ends: 'quiet', trend: 'up', branching: 'some', teaches: ['carry'], deal: { ground: 40, floating: 25, climb: 20, bounce: 15 } };
  const strings = new Set<string>();
  let loose = 0, slots = 0, clean = 0;
  for (const s of SEEDS) {
    const st = build(dealt(brief), s);
    slots += st.gen2.plan.length;
    const g = st.gen2.graph;
    assert.ok(g.deal, `seed ${s}: no deal`);
    for (const n of g.nodes) {
      const content = ['teach', 'practise', 'fork', 'flow', 'combine', 'climb', 'descent', 'twist', 'test'].includes(n.job!);
      assert.equal(!!n.content, content, `seed ${s}: ${n.job} ${n.id} typed ${n.content}`);
      if (n.job === 'climb') assert.equal(n.content, 'climb');
      // (each section laid in a typed node is of its type, or the meta names the slot the pool ran out at)
      st.gen2.plan.forEach((p, i) => {
        if (p.node !== n.id) return;
        const t = typed.find((q) => q.id === p.template)!;
        if (n.content && t.content !== 'structural' && t.content !== n.content) {
          assert.ok(st.gen2.loosened?.some((l) => l.startsWith(`slot ${i + 1} `)), `seed ${s}: ${t.id} (${t.content}) in a ${n.content} node, unnamed`);
          loose++;
        }
      });
    }
    // (the mix's rules hold on every roll the pool did not run out on; a loosened slot is named, and rare)
    if (!st.gen2.loosened) {
      clean++;
      assert.ok(!st.gen2.codeErrors!.some((e) => /^V(3|1[124]) /.test(e)), `seed ${s}: ${st.gen2.codeString}: ${st.gen2.codeErrors!.join('; ')}`);
    }
    strings.add(st.gen2.codeString!);
  }
  assert.equal(strings.size, SEEDS.length, 'two rolls with the same code string');
  // (the toy pool holds every type, so loosening is the rare case, never the rule)
  assert.ok(loose <= 0.1 * slots, `${loose} of ${slots} slots loosened`);
  // (and enough rolls ran clean for the rules above to have been checked: the toy pool is small for 40% ground at no repeats, which is
  // the kit's sizing, measured by the loosened share, not the deal's)
  assert.ok(clean >= 4, `${clean} of 16 rolls with no slot loosened`);
});
