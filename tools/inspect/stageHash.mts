/**
 * stageHash: a hash of every stage's build (platforms, vines, ropes, collectibles, enemies, zones, checkpoints, heartFalls), per stage,
 * setting (Normal, Easy) and layout 1-16, as the engine builds it (generateStage, withGoals, easyStage). Run on two branches and diff the
 * outputs to prove which stages a change touches (stage-fix.md step 6).
 *   npx tsx tools/inspect/stageHash.mts > /tmp/hash-branch.txt
 */
import '../../src/game/headlessDom.ts';
import { createHash } from 'node:crypto';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
import { withGoals } from '../../src/game/goals.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';

const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
const cfgs = generateAllLevels().filter((c) => !only || only.has(c.id));
const KEYS = ['platforms', 'vines', 'ropes', 'collectibles', 'enemies', 'zones', 'checkpoints', 'heartFalls', 'easyGoal', 'normalGoal'] as const;
let n = 0;
for (const cfg of cfgs) {
  for (const diff of ['normal', 'easy'] as const) {
    for (let v = 1; v <= 16; v++) {
      let line: string;
      try {
        setDifficulty(diff);
        setLayoutVariant(v);
        const st = diff === 'easy' ? easyStage(withGoals(generateStage(cfg, 'easy'))) : withGoals(generateStage(cfg, 'normal'));
        const pick: Record<string, unknown> = {};
        for (const k of KEYS) pick[k] = (st as unknown as Record<string, unknown>)[k];
        line = createHash('sha1').update(JSON.stringify(pick)).digest('hex').slice(0, 16);
      } catch (e) {
        line = `ERROR ${(e as Error).message.slice(0, 80)}`;
      } finally {
        setLayoutVariant(null);
      }
      console.log(`${cfg.id} ${diff} ${v} ${line}`);
      n++;
    }
  }
}
console.error(`${n} builds hashed`);
