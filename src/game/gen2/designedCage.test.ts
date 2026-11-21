/**
 * ENGINE PIECE (designed cage socket; BUILD-23 3f958e630, the lead's ruling (a) 8:10 PM ET 11-20): gen2 lays a DESIGNED cage (a socket
 * whose allow holds 'cage' and its little one) where the designer put it, every one, with its little one; a rolled graph's nodes carry no
 * objective quota, so without the piece a rolled stage lays NO cage. Proven on the first stage that designs its cages, 2-3, as Play builds
 * it (RealPlay, the real engine): Normal 5 cages and a goal of 5, Easy 5 cages and a goal of 3, each with its little one; and a burst
 * designed cage's little one joins the line that follows him (engine.ts freeCritter -> followPlay.ts free).
 * Planted: pipeline.ts fillSockets' `s.allow?.includes('cage')` branch removed -> 0 cages on both settings, this test RED.
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../realPlay.ts';
import { buildGen2Stage } from './pipeline.ts';
import { listedStage } from './listed.ts';
import { generateAllLevels } from '../worldsData.ts';
import { setDifficulty } from '../difficulty.ts';
import type { Collectible } from '../types.ts';

type Eng = { collectibles: Collectible[]; follow?: { line: Array<{ kind: string }> }; freeCritter(c: Collectible): void; currentStage: { normalGoal?: number; easyGoal?: number; config: { targetCount?: number } } };

function roll(setting: 'normal' | 'easy', seed: number) {
  setDifficulty(setting);
  try {
    const r = new RealPlay('2-3', seed);
    const e = r.e as never as Eng;
    return { e, cages: e.collectibles.filter((c) => c.type === 'cage').sort((a, b) => a.x - b.x) };
  } finally {
    setDifficulty('normal');
  }
}

test('ENGINE PIECE (designed cage socket): a rolled 2-3 lays every designed cage with its little one (Normal 5 / goal 5, Easy 5 / goal 3), and a burst one joins the line', () => {
  const cfg = generateAllLevels().find((c) => c.id === '2-3' && !c.secret)!;
  for (const seed of [1, 2]) {
    for (const [setting, goal] of [['normal', 5], ['easy', 3]] as const) {
      // (the laying itself, before Play finishes it: one roll of its own kit)
      const laid = buildGen2Stage({ config: cfg, kit: listedStage('2-3')!.kit(), seed, difficulty: setting }) as unknown as { collectibles: Collectible[] };
      assert.equal(laid.collectibles.filter((c) => c.type === 'cage').length, 5, `${seed} ${setting}: the roll lays every designed cage`);
      const { e, cages } = roll(setting, seed);
      assert.equal(cages.length, 5, `${seed} ${setting}: ${cages.length} designed cages laid`);
      assert.ok(cages.every((c) => c.critter && c.critter !== 'eaglet'), `${seed} ${setting}: every cage holds its little one`);
      const st = e.currentStage;
      assert.equal(setting === 'easy' ? st.easyGoal ?? st.config.targetCount : st.normalGoal ?? st.config.targetCount, goal, `${seed} ${setting}: the goal`);
      // (a designed cage's little one joins the line when it bursts: the line was empty, now it holds that one)
      assert.ok(e.follow, `${seed} ${setting}: the stage's little ones follow him`);
      assert.equal(e.follow!.line.length, 0);
      e.freeCritter(cages[0]);
      assert.deepEqual(e.follow!.line.map((f) => f.kind), [cages[0].critter], `${seed} ${setting}: the freed one is in the line`);
    }
  }
});
