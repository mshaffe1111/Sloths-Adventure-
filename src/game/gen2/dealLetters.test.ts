// The deal follows the code's letters (R-165.541, ENG-DEAL): a node whose code writes a content letter has EVERY one of its slots
// dealt that letter's type, whatever its job (a signature too, which sits outside the mix), and never a section of another kind or
// one with no kind; a node with no letter is dealt freely, as ever; a letter no section of the pool serves refuses the roll by name
// (each such slot's 'pool short' note names the letter; the roll goes on, so the other nodes are still laid and judged).
// Planted on the toy legs world (toyLegs.ts): the signature job is served by floating AND ground sections, so an untyped signature
// node rolls a mix.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { towerCfg } from './toyTower.ts';
import { logRun, mixKit, stepRun } from './toyLegs.ts';
import type { SectionTemplate, WorldKit } from './types.ts';

const ID = '5-95';
const sig = (of: SectionTemplate, id: string, content: 'ground' | 'floating'): SectionTemplate => {
  const { teaches: _t, uses: _u, ...plain } = of;
  return { ...plain, id, name: id, jobs: ['signature'], content, phases: ['ki', 'sho', 'ten', 'ketsu'] };
};
/** the mix kit, its signature node three slots long, served by three ground and two floating sections (or the pool with no floating one) */
const kit = (code: string, floating = true): WorldKit => {
  const k = mixKit(ID, code);
  const more = [
    ...['a', 'b', 'c'].map((x) => sig(stepRun, `deal-sig-ground-${x}`, 'ground')),
    ...(floating ? ['a', 'b'].map((x) => sig(logRun, `deal-sig-log-${x}`, 'floating')) : []),
  ];
  const sections = [...k.manifest.sections.filter((t) => floating || t.content !== 'floating'), ...more];
  return { ...k, manifest: { ...k.manifest, sections, graphs: { ...k.manifest.graphs!, chunkSeconds: 4 } } };
};
const build = (code: string, seed: number, floating = true) => buildGen2Stage({ config: towerCfg(ID, 'sprint'), kit: kit(code, floating), seed, difficulty: 'normal' });
const SEEDS = [1, 2, 3, 4, 5, 6];
const kindsIn = (code: string, seed: number, floating = true) => {
  const st = build(code, seed, floating);
  const n = st.gen2.graph.nodes.find((q) => q.job === 'signature')!;
  const byId = new Map(kit(code, floating).manifest.sections.map((t) => [t.id, t]));
  return { st, n, kinds: st.gen2.sections.filter((q) => q.node === n.id).map((q) => byId.get(q.template)?.content ?? 'untyped') };
};

test('the deal (planted): a lettered node of three slots is dealt three of its letter, a signature too', () => {
  for (const seed of SEEDS) {
    const { st, n, kinds } = kindsIn('A P R Sf E', seed);
    assert.ok(kinds.length >= 3, `seed ${seed}: the toy's signature node holds ${kinds.length} slots (the toy needs three)`);
    assert.equal(n.content, 'floating', `seed ${seed}: node ${n.id} asks f and is dealt ${n.content ?? 'nothing'}`);
    assert.deepEqual(kinds, kinds.map(() => 'floating'), `seed ${seed}: node ${n.id} (Sf) laid ${kinds.join(', ')}`);
    assert.deepEqual(st.gen2.errors.filter((e) => /^ask: .*content/.test(e)), [], `seed ${seed}`);
  }
});

test('the deal: a letterless node is dealt freely (its slots take either kind the job holds)', () => {
  const seen = new Set<string>();
  for (const seed of SEEDS) {
    const { n, kinds } = kindsIn('A P R S E', seed);
    assert.equal(n.content, undefined, `seed ${seed}: the letterless signature is left untyped`);
    for (const k of kinds) seen.add(k);
  }
  assert.deepEqual([...seen].sort(), ['floating', 'ground'], 'over six seeds the free node lays both kinds');
});

test('the deal (planted): a letter no section of the pool serves refuses the roll by name, never quietly with another kind', () => {
  for (const seed of SEEDS) {
    const { st, n, kinds } = kindsIn('A P R Sf E', seed, false);
    assert.equal(n.content, 'floating', `seed ${seed}: the node keeps its letter's type`);
    const named = st.gen2.errors.filter((e) => /^pool short at slot \d+ \(n4 signature: asks 'f' \(floating\): no f section in the pool\)$/.test(e));
    assert.equal(named.length, kinds.length, `seed ${seed}: each of the ${kinds.length} slots refused by name (${st.gen2.errors.slice(0, 3).join(' | ')})`);
    // (and the roll goes on: every other node is laid)
    assert.ok(st.gen2.graph.nodes.every((q) => st.gen2.sections.some((x) => x.node === q.id)), `seed ${seed}: every node laid`);
  }
});
