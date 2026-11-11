/**
 * R-165.115 (Matt 11-11, R-165.108: "things that are worth value all over the place"; Exploring always pays): every high road of 1-1 ends
 * in something worth the climb. A `find` socket the golden seed does not take (a fork's high-road end, the hollow log's top, a log
 * road's last log) holds a cache of CACHE_N petals over its piece (pipeline.ts fillSockets); before, it was laid bare (540 bare ends over
 * the 200 listed seeds, reference/specs/sims/finds11.ts). Read on the stage the GAME builds (generateStage, D19: the petal pass and the
 * pickup fixes run after the fill and could thin a cache out), on every listed seed, both settings. The seed stays alone on its perch.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { generateStage, type GeneratedStage } from '../stageGenerator.ts';
import { generateAllLevels } from '../worldsData.ts';
import { withPlaySeed } from '../testlink1_1.ts';
import { seedPromise } from '../storyChecks.ts';
import { provenSeeds } from './seedList.ts';
import { w1World } from './worlds/w1.ts';
import { CACHE_N } from './pipeline.ts';
import type { SectionTemplate } from './types.ts';

const cfg = generateAllLevels().find((c) => c.id === '1-1')!;
const M = w1World().manifest;
const required = new Set((M.required?.['1-1'] ?? []).map((r) => r.section));
const holdsFind = (t: SectionTemplate) => [...t.sockets, ...(t.subBlocks ?? []).flatMap((sb) => sb.versions.flatMap((v) => v.sockets ?? []))].some((s) => s.role === 'find');
/** the sections whose find socket is never the seed's: every one of their finds is a cache */
const CACHE_HOMES = new Set(M.sections.filter((t) => !required.has(t.id) && holdsFind(t)).map((t) => t.id));

type Built = Pick<GeneratedStage, 'platforms' | 'collectibles'> & { gen2: { sections: Array<{ uid: string; template: string }>; fills: Array<{ section: string; role: string; what: string | null; x: number; y: number }> } };

/** the high-road ends that hold less than a cache, by name (empty: every one holds CACHE_N petals or more over its piece) */
export function cacheBreaches(st: Built): string[] {
  const out: string[] = [];
  const finds = st.gen2.fills.filter((f) => f.role === 'find');
  for (const sec of st.gen2.sections) {
    if (!CACHE_HOMES.has(sec.template)) continue;
    const here = finds.filter((f) => f.section === sec.uid);
    if (!here.length) out.push(`${sec.template} (${sec.uid}): its find socket was left empty`);
    for (const f of here) {
      if (f.what !== 'cache') { out.push(`${sec.template} (${sec.uid}): its find holds ${f.what}, not a cache`); continue; }
      // (the piece the cache stands over: the highest top under the cache row within 110 px, the finds11 reach)
      const piece = st.platforms.filter((p) => f.x >= p.x && f.x <= p.x + p.width && p.y >= f.y && p.y - f.y <= 110).sort((a, b) => a.y - b.y)[0];
      if (!piece) { out.push(`${sec.template} (${sec.uid}): no piece under the cache at x ${Math.round(f.x)}`); continue; }
      const n = st.collectibles.filter((c) => c.type === 'flower' && c.x >= piece.x && c.x <= piece.x + piece.width && c.y < piece.y && c.y >= piece.y - 110).length;
      if (n < CACHE_N) out.push(`${sec.template} (${sec.uid}): the high-road end at x ${Math.round(piece.x)}-${Math.round(piece.x + piece.width)} holds ${n} petals (a cache is ${CACHE_N})`);
    }
  }
  return out;
}

const build = (seed: number, setting: 'easy' | 'normal') => withPlaySeed(seed, () => generateStage(cfg, setting)) as unknown as Built & GeneratedStage;

test('the kit lays caches: fork, hollow and log-road sections hold a find the seed never takes', () => {
  assert.ok(CACHE_HOMES.has('w1-mushroom-fork') && CACHE_HOMES.has('w1-bank-stair-fork') && CACHE_HOMES.has('w1-mushroom-fork-dip'), [...CACHE_HOMES].join(', '));
  assert.ok(!CACHE_HOMES.has('w1-seed-perch'), 'the seed perch is the seed\'s home');
});

test('planted: a high-road end stripped of its petals is named (the check reads the built stage, not the sockets)', () => {
  const seed = provenSeeds('1-1').find((s) => build(s, 'normal').gen2.fills.some((f) => f.what === 'cache'))!;
  const st = build(seed, 'normal');
  assert.deepEqual(cacheBreaches(st), []);
  const f = st.gen2.fills.find((q) => q.what === 'cache')!;
  const stripped = { ...st, collectibles: st.collectibles.filter((c) => !(c.type === 'flower' && Math.abs(c.x - f.x) <= 60 && Math.abs(c.y - f.y) <= 30)) };
  assert.equal(cacheBreaches(stripped).length, 1, 'the bare end is named');
  const empty = { ...st, gen2: { ...st.gen2, fills: st.gen2.fills.filter((q) => q !== f) } };
  assert.ok(cacheBreaches(empty).some((l) => /left empty|holds \d petals/.test(l)), 'a find socket with no fill is named');
});

for (const setting of ['normal', 'easy'] as const) {
  test(`every high road ends in a cache of ${CACHE_N} petals, and the seed stays alone on its perch (every listed 1-1 seed, ${setting}, the game's build; the seed's promise on Normal)`, () => {
    const bad: string[] = [];
    let caches = 0;
    for (const seed of provenSeeds('1-1')) {
      const st = build(seed, setting);
      caches += st.gen2.fills.filter((f) => f.what === 'cache').length;
      // (the seed's promise as storyChecks.test holds it: Normal's; on Easy its 260 px reach to the mushroom misses on 4 listed seeds
      // as it did before this change, a finding in REPORT.md, not this test's)
      for (const l of [...cacheBreaches(st), ...(setting === 'normal' ? seedPromise(st) : [])]) bad.push(`seed ${seed}: ${l}`);
    }
    assert.ok(caches >= provenSeeds('1-1').length, `${caches} caches laid`);
    assert.deepEqual(bad.slice(0, 8), [], `${bad.length} breaches`);
  });
}
