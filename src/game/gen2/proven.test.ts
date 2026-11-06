// The game plays only proven rolls (the red team, 11-05, RT-ENGINE #3): buildGen2Stage hands back a failed roll with gen2.errors for the
// report, so the game's road (stageGenerator) goes through provenGen2Stage, which never returns one. The asked seed is played only when
// BOTH settings lay it cleanly (Easy is Normal's stage); else the next seed on a fixed walk that does; none in the walk, it throws (a
// failure is never played quietly). Planted: 1-1 seed 3 on Normal fails its build (pool short at the bounce teach).
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage, provenGen2Stage, rollErrors } from './pipeline.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';

const c = generateAllLevels().find((l) => l.id === '1-1')!;

test("a seed whose build fails is never played: the game's road plays a clean seed, the same stage on both settings", () => {
  // (the planted case: the first seed whose raw Normal build fails; seed 3 was one until the deal moved, so it is found, never assumed)
  let bad = -1;
  for (let s = 1; s <= 400 && bad < 0; s += 2) if (buildGen2Stage({ config: c, kit: w1World(), seed: s, difficulty: 'normal' }).gen2.errors?.length) bad = s;
  assert.ok(bad > 0, 'no seed of 200 fails its build: the planted case is gone');
  const n = provenGen2Stage({ config: c, kit: w1World(), seed: bad, difficulty: 'normal' });
  const e = provenGen2Stage({ config: c, kit: w1World(), seed: bad, difficulty: 'easy' });
  assert.deepEqual(n.gen2.errors ?? [], []);
  assert.deepEqual(e.gen2.errors ?? [], []);
  assert.ok(n.gen2.proven && n.gen2.proven.used !== bad, `seed ${bad} was played`);
  assert.equal(e.gen2.proven?.used, n.gen2.proven?.used, 'Easy played another seed than Normal');
  assert.deepEqual(e.gen2.plan.map((p) => p.template), n.gen2.plan.map((p) => p.template), "Easy is not Normal's stage");
  assert.equal(n.gen2.proven?.asked, bad);
});

test('a clean seed is played as asked', () => {
  // (Roll A, 79191: clean on both)
  const n = provenGen2Stage({ config: c, kit: w1World(), seed: 79191, difficulty: 'normal' });
  assert.equal(n.gen2.proven, undefined, 'the walk moved off a clean seed');
  assert.deepEqual(n.gen2.errors ?? [], []);
});

test('the game\'s road never builds a gen2 roll without the guard', async () => {
  const fs = await import('node:fs');
  for (const f of ['src/game/stageGenerator.ts', 'src/game/gen2/game.ts']) {
    const src = fs.readFileSync(f, 'utf8');
    assert.ok(!/\bbuildGen2Stage\(/.test(src), `${f} calls buildGen2Stage directly: the game must use provenGen2Stage`);
  }
});

// (the red team, RT-ENGINE #4: on 16 of 200 seeds Easy planned its own stage, and on seed 124 its plan dropped the bounce teach: a pad
// widened a take-off into the bounce block's double reach. Easy is Normal's stage: Normal's loop takes a plan only when Easy lays it
// cleanly too, an Easy-only breach banning that section at that slot for both; Easy never plans its own)
test("Easy is Normal's stage or fails by name: never a plan of its own (the red team's seeds)", () => {
  for (const seed of [124, 110, 138, 143, 8, 18, 60]) {
    const n = buildGen2Stage({ config: c, kit: w1World(), seed, difficulty: 'normal' });
    const e = buildGen2Stage({ config: c, kit: w1World(), seed, difficulty: 'easy' });
    assert.ok(!e.gen2.repairs.some((r) => /Easy plans its own/.test(r.note)), `seed ${seed}: Easy planned its own stage`);
    if (!e.gen2.errors?.length) assert.deepEqual(e.gen2.plan.map((p) => p.template), n.gen2.plan.map((p) => p.template), `seed ${seed}: Easy clean on a plan that is not Normal's`);
    if (n.gen2.errors?.length) assert.ok(e.gen2.errors?.length, `seed ${seed}: Normal fails but Easy is called clean`);
  }
});

// (the red team, RT-ENGINE #6: realisedCode writes the V-rule breaches to gen2.codeErrors, but only `loosened` and `missing` were folded
// into gen2.errors, so a roll breaking V1-V20 with every slot filled would reach the game as clean. Each breach fails the roll, by name)
test('every V-rule breach is a roll error (planted: never left to whether the data happens to carry one)', () => {
  // (the porter, 11-06: on Round 7's data no seed of 40 broke a V-rule, so a search for one proved nothing)
  const g = { errors: [] as string[], fills: [], codeErrors: ['V2 at token 4: Tg2< teaches a move already taught', 'V17 at token 1: no fork'] };
  const e = rollErrors(g);
  for (const v of g.codeErrors) assert.ok(e.some((x) => x.includes(v)), `the breach "${v}" is not a roll error: ${JSON.stringify(e)}`);
  assert.deepEqual(rollErrors({ errors: [], fills: [] }), [], 'a roll with nothing wrong has no errors');
  assert.ok(rollErrors({ errors: [], fills: [], loosened: ['slot 4 (n4 teach: no section for the job left, filled by its phase)'] })[0].startsWith('pool short at slot 4'));
});

// (11-06: a build can THROW, not only fail by name: "no section fits node n8: the pool is spent". The guard let the throw through, so a
// play on that seed would crash; a seed that throws is a failed seed, and the walk goes on)
test('a seed whose build throws is walked past, never thrown to the player', () => {
  const real = w1World();
  let calls = 0;
  const flaky = { ...real, get manifest() { if (calls++ === 0) throw new Error('planted: the pool is spent'); return real.manifest; } } as typeof real;
  const st = provenGen2Stage({ config: c, kit: flaky, seed: 79191, difficulty: 'normal' });
  assert.deepEqual(st.gen2.errors ?? [], []);
  // (how far the walk goes after the throw is the data's: a next seed may itself fail a rule by name; what is planted is the throw)
  assert.ok((st.gen2.proven?.tried ?? 1) >= 2, 'the walk did not move past the seed that threw');
  assert.notEqual(st.gen2.seed, 79191, 'the stage is the seed that threw');
});
