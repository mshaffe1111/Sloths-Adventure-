// No fall in 1-1 costs a life, on Easy or Normal (R-165.86): the rule as stage data. The 1-1 brief's `softFalls` (types.ts GraphBrief,
// worlds/w1.ts) reaches the built stage (Gen2Meta.softFalls) and the engine asks softFallStage (pipeline.ts) as these tests do.
// Laid on the 11-10 play window's seeds; planted without the brief's word (origin/main's 1-1); and proof nothing else moved: 1-1's
// own ground, zones and floorless-gap verdicts with and without the word, and 1-2's and 8-3 Normal's lay against origin/main's.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import '../headlessDom.ts';
import { buildGen2Stage, earthHoles, keptFoes, softFallStage } from './pipeline.ts';
import { buildPlayStage } from './seedList.ts';
import { floorlessGaps } from './promises11.ts';
import { provenPlan, provenSeeds } from './seedList.ts';
import { w1Finish, w1World } from './worlds/w1.ts';
import { generateStage, setLayoutVariant } from '../stageGenerator.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { Gen2Stage, WorldKit } from './types.ts';

const cfg = (id: string) => ({ ...generateAllLevels().find((l) => l.id === id)!, unlocked: true });
/**
 * the first 16 listed seeds of the re-laid 1-1 (4106, the first run, among them). Changed, INT-1-1: these were the 11-10 play window's
 * seeds (reference/qa-reports/window-2026-11-10), which are no longer listed and no longer build on the re-lay
 */
const WINDOW = provenSeeds('1-1').slice(0, 16);

/** a listed seed's roll built without the word: the word's own build's plan replayed, so it is the same roll (never searched: without the
 *  word the per-gap ruler refuses 1-1's earth holes, so a search finds no clean seed; R-165.221) */
function listedWithout(seed: number, setting: 'normal' | 'easy'): Gen2Stage {
  const a = buildPlayStage(cfg('1-1'), w1World(), seed, setting);
  return buildGen2Stage({ config: cfg('1-1'), kit: kitWithout(), seed, difficulty: setting, replay: { seed: a.gen2.seed, rerolls: a.gen2.rerolls, plan: a.gen2.plan, foes: [...keptFoes(a)] } });
}

/** World 1's kit as it was before the 1-1 brief said `softFalls` (origin/main's) */
function kitWithout(): WorldKit {
  const k = w1World();
  const { softFalls: _, ...brief } = k.manifest.graphs!.briefs['1-1'];
  return { ...k, manifest: { ...k.manifest, graphs: { ...k.manifest.graphs!, briefs: { ...k.manifest.graphs!.briefs, '1-1': brief } } } };
}

/** the gaps a fall into is NOT a soft set-back: not water, the stage not soft as a whole, and no soft zone over the gap */
function hardFalls(st: Gen2Stage): Array<[number, number]> {
  if (softFallStage(st)) return [];
  const soft = (st.heartFalls ?? []).filter((z) => z.soft);
  return (st.gen2.falls ?? []).filter((f) => f.kind !== 'water' && !soft.some((z) => f.x0 >= z.x0 - 4 && f.x1 <= z.x1 + 4)).map((f) => [f.x0, f.x1]);
}

for (const setting of ['normal', 'easy'] as const) {
  test(`1-1 ${setting}: on the first 16 listed seeds a fall into any gap that is not water is a soft set-back, and water stays water`, () => {
    for (const seed of WINDOW) {
      const st = w1Finish(buildPlayStage(cfg('1-1'), w1World(), seed, setting));
      // (as listed: the list's own replay, whose seed is the reroll's when the list rerolled it; POLISH-9b: 769, first since POLISH-7's
      // relist, is listed with 2 rerolls, so its build's seed was never 769. Not the walk's fallback, which would build another seed)
      assert.equal(st.gen2.seed, provenPlan('1-1', seed)!.seed, `seed ${seed} is laid as listed`);
      assert.ok((st.gen2.falls ?? []).length >= 10, `seed ${seed} lays gaps`);
      assert.deepEqual(hardFalls(st), [], `seed ${seed}: gaps that still cost a life`);
      // (the word turns no water gap soft: the engine's water checks come before the fall check, and no zone is added for it)
      assert.equal(st.gen2.softFalls, true);
      assert.ok((st.heartFalls ?? []).every((z) => z.soft), `seed ${seed}: 1-1's zones are the level blocks' soft ones only`);
    }
  });
}

test('planted: without the brief\'s word (origin/main\'s 1-1) the same check finds gaps that cost a life, on Normal and on Easy', () => {
  for (const setting of ['normal', 'easy'] as const) {
    for (const seed of WINDOW.slice(0, 4)) {
      const st = w1Finish(listedWithout(seed, setting));
      assert.equal(softFallStage(st), false);
      assert.ok(hardFalls(st).length >= 3, `${setting} seed ${seed}: ${hardFalls(st).length} gaps outside a soft zone`);
    }
  }
});

// (changed by POLISH-3, R-165.221: the word now marks its earth's holes, pipeline.ts softHoles; it still lays no ground, and the zones,
// falls and verdicts it adds are exactly one soft zone and one soft fall per hole, lip to lip)
test('the word lays no ground: 1-1\'s ground is the same with and without it, and its zones, gaps and floorless-gap verdicts differ only by its holes\' soft marks (listed seeds and raw rolls)', () => {
  const same = (a: Gen2Stage, b: Gen2Stage, what: string) => {
    assert.deepEqual(a.platforms, b.platforms, `${what}: the ground`);
    const holes = earthHoles(a.platforms), was = b.heartFalls ?? [];
    const fresh = holes.filter((h) => !was.some((z) => z.soft && z.x0 <= h.x0 + 4 && z.x1 >= h.x1 - 4));
    assert.deepEqual(a.heartFalls ?? [], [...was, ...fresh.map((h) => ({ x0: h.x0, x1: h.x1, soft: true }))], `${what}: the soft zones, plus one per hole`);
    assert.deepEqual(a.gen2.falls, [...(b.gen2.falls ?? []), ...holes.map((h) => ({ x0: h.x0, x1: h.x1, y: a.gen2.falls!.find((f) => f.x0 === h.x0 && f.x1 === h.x1 && f.site === 'hole-under-route')?.y, kind: 'soft', site: 'hole-under-route' }))], `${what}: the gaps, plus one soft fall per hole, typed a hole under the route`);
    const inHole = ([x0, x1]: [number, number]) => holes.some((h) => x0 >= h.x0 - 4 && x1 <= h.x1 + 4);
    assert.deepEqual(floorlessGaps(a), floorlessGaps(b).filter((g) => !inHole(g)), `${what}: floorlessGaps, less the holes'`);
  };
  for (const setting of ['normal', 'easy'] as const) {
    for (const seed of WINDOW.slice(0, 4)) same(buildPlayStage(cfg('1-1'), w1World(), seed, setting), listedWithout(seed, setting), `listed ${seed} ${setting}`);
    // (raw rolls, as tools/engine/seedlist.ts tries them before its filter: listed or not)
    // (the same roll: the word's marks change which roll a search accepts, R-165.221, so the one without it is replayed with it)
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const b = buildGen2Stage({ config: cfg('1-1'), kit: kitWithout(), seed, difficulty: setting });
      const replay = { seed: b.gen2.seed, rerolls: b.gen2.rerolls, plan: b.gen2.plan, foes: [...keptFoes(b)] };
      // (and both sides replayed: a roll the search refused comes back built as its first phase built it, the landing repair off
      // (pipeline.ts, Y2's two phases), while every replay runs the repair on. POLISH-9b: raw roll 5 Normal is refused since POLISH-7's
      // bounce cap and keeps an idle mushroom (x 21928) the replay takes up, so comparing the search's build to a replay read the repair as
      // the word. Replaying the same plan without the word compares the word alone)
      same(buildGen2Stage({ config: cfg('1-1'), kit: w1World(), seed, difficulty: setting, replay }), buildGen2Stage({ config: cfg('1-1'), kit: kitWithout(), seed, difficulty: setting, replay }), `roll ${seed} ${setting}`);
    }
  }
});

test('floorlessGaps does not read the word: an unmarked floorless gap is still a breach on a stage that has it (planted)', () => {
  const P = (id: number, x: number) => ({ id, x, y: 700, width: 600, height: 300, type: 'solid' as const, style: 'moss_stone' as const });
  const st = { platforms: [P(1, 0), P(2, 800)], gen2: { softFalls: true } };
  assert.equal(softFallStage(st), true);
  assert.equal(floorlessGaps(st).length, 1);
});

// origin/main at 181d2846 (sha256 of the stage's platforms, heartFalls and gen2.falls, first 16 hex)
const MAIN: Record<string, string[]> = {
  '8-3': ['d7097751a77b9452', 'daacff5017ec0ef8', 'fcfa0af041aee16c'],
};
// (1-2's pin was the hand-built 1-2's, deleted 11-12 (P12S: the game rolls 1-2 on gen2, its change named by the lock); what the pin
// guarded still holds: 1-2 is not a soft-fall stage)
test('1-2, rolled on gen2, is not a soft-fall stage on Normal (layouts 1-3): its thorn hollows cost a heart', () => {
  for (let v = 1; v <= 3; v++) {
    setLayoutVariant(v);
    const st = generateStage(cfg('1-2'), 'normal') as ReturnType<typeof generateStage>;
    setLayoutVariant(null);
    assert.equal(softFallStage(st), false, `layout ${v}`);
    assert.ok((st.heartFalls ?? []).length && (st.heartFalls ?? []).every((z) => !z.soft), `layout ${v}: its hollows are hard on Normal`);
  }
});
for (const [id, pins] of Object.entries(MAIN)) {
  test(`${id} Normal lays the same ground, gaps and heartFalls as origin/main, byte for byte (layouts 1-3), and is not a soft-fall stage`, () => {
    pins.forEach((pin, i) => {
      setLayoutVariant(i + 1);
      const st = generateStage(cfg(id), 'normal') as ReturnType<typeof generateStage> & { gen2?: { falls?: unknown } };
      setLayoutVariant(null);
      assert.equal(softFallStage(st), false);
      if (id === '8-3') assert.ok((st.heartFalls ?? []).some((z) => !z.soft), 'World 8 Normal keeps its heart falls');
      assert.equal(createHash('sha256').update(JSON.stringify({ platforms: st.platforms, heartFalls: st.heartFalls ?? null, falls: st.gen2?.falls ?? null })).digest('hex').slice(0, 16), pin, `${id} layout ${i + 1}`);
    });
  });
}
