/**
 * World 8 as the game plays it (DESIGN.md B12 step 6, gen2/game.ts, worlds/w8Game.ts): every shipped roll of 8-1 to 8-3, 8-5, 8-6, 8-8 and 8-9,
 * Normal and Easy, built through the game's own entry (generateStage, withGoals, easyStage). Each roll holds its stage's room (8-1, 8-2,
 * 8-5) and its dark stretch; the dark is lit over every gap and holds no animal and no flag (levelCheck); the inspector's quick route
 * swings every liana; nothing can hurt in the opening seconds; the dark, the glides, the shut shrine and the night harpy are
 * each taught before they are met (Dot's line); a crumbling piece is never on the way; each vine climbs straight up and down; flags are
 * at most FLAG_SPAN.max px apart; the quick player takes 2:00 or more. No water anywhere in World 8 (soft falls).
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateStage, setLayoutVariant } from '../stageGenerator.ts';
import { easyStage } from '../easyMode.ts';
import { withGoals } from '../goals.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { LevelConfig } from '../types.ts';
import { GEN2_STAGES } from './game.ts';
import { GEN2_SEEDS } from './seeds.ts';
import { W8_GAME_STAGES } from './worlds/w8Game.ts';
import { checkW8Roll, type Played } from './w8Harness.ts';

const levels = generateAllLevels();
const lv = (id: string): LevelConfig => ({ ...levels.find((l) => l.id === id)!, unlocked: true });
const STAGES = Object.keys(GEN2_STAGES).filter((id) => id.startsWith('8-'));

function played(id: string, variant: number, easy: boolean): Played {
  setLayoutVariant(variant);
  try {
    const st = withGoals(generateStage(lv(id), easy ? 'easy' : 'normal'));
    return (easy ? easyStage(st) : st) as Played;
  } finally {
    setLayoutVariant(null);
  }
}

const cache = new Map<string, Played>();
const each = (f: (st: Played, at: string, id: string, easy: boolean) => void) => {
  for (const id of STAGES) {
    for (let i = 0; i < (GEN2_SEEDS[id]?.seeds.length ?? 0); i++) {
      for (const easy of [false, true]) {
        const k = `${id}:${i}:${easy}`;
        if (!cache.has(k)) cache.set(k, played(id, i, easy));
        f(cache.get(k)!, `${id} roll ${i} (${easy ? 'Easy' : 'Normal'})`, id, easy);
      }
    }
  }
};

test('World 8 ships 16 rolls of each gen2 stage (8-7 and 8-10 are hand-built), curated on the kit the game builds with', () => {
  assert.deepEqual(STAGES.sort(), [...W8_GAME_STAGES]);
  for (const id of STAGES) {
    assert.equal(GEN2_SEEDS[id]?.seeds.length, 16, id);
    assert.equal(GEN2_SEEDS[id].kit, GEN2_STAGES[id].kitName, id);
  }
});

test('every shipped roll: its room and its dark, taught first, every liana swung, 2:00 or more, nothing in the opening seconds, flags close enough', () => {
  each((st, at, id) => checkW8Roll(st, at, id));
});
