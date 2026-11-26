/**
 * The tempo toy's bot runs (ENG-29, 2-9's NEW 1): the court toy row (src/game/gen2/worlds/w2TempoToy.ts) rolled by gen2 the way the game
 * rolls a listed stage (listed.ts's test seam, a planted one-seed list, World 2's finish), and castBots' cast over it in the real engine.
 *   npx tsx tools/inspect/tempoToys.ts [--seeds 1-4] [--bots kid,adult,child,middle,expert] [--input fake|touch|pad]
 */
import '../../src/game/headlessDom.ts';
import { withTestStage } from '../../src/game/gen2/listed.ts';
import { buildGen2Stage, keptFoes } from '../../src/game/gen2/pipeline.ts';
import { packPlan, plantSeedList } from '../../src/game/gen2/seedList.ts';
import { withFixtureConfig } from '../../src/game/realPlay.ts';
import { TEMPO_ID, tempoCfg, tempoKit, tempoRow, type TempoToyOpts } from '../../src/game/gen2/worlds/w2TempoToy.ts';
import { CAST_BOTS, castRun, type CastInput, type CastRun } from './castBots.ts';
import type { Setting } from './tierBots.ts';

/** one bot's run over the toy rolled from `seed` (the toy's own gen2 seed; the stage played is that roll, both settings) */
export function tempoCast(bot: string, setting: Setting, seed: number, o: TempoToyOpts = {}, input: CastInput = 'fake'): CastRun {
  const row = tempoRow(o);
  const cfg = tempoCfg();
  const st = withTestStage({ [TEMPO_ID]: row }, () => buildGen2Stage({ config: cfg, kit: tempoKit(o), seed, difficulty: 'normal' }));
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  return withTestStage({ [TEMPO_ID]: row }, () => {
    const undo = plantSeedList(TEMPO_ID, { dict, seeds: [seed], plans: [packed] });
    try {
      return withFixtureConfig(cfg, () => castRun(bot, setting, TEMPO_ID, 1, input));
    } finally {
      undo();
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
  const [a, b] = (arg('--seeds') ?? '1-4').split('-').map(Number);
  const bots = (arg('--bots') ?? 'kid,adult,child,middle,expert').split(',');
  const input = (arg('--input') ?? 'fake') as CastInput;
  for (const setting of (arg('--setting') ? [arg('--setting')] : ['normal', 'easy']) as Setting[]) {
    for (const bot of bots.filter((q) => CAST_BOTS[q]?.[setting])) {
      for (let s = a; s <= (b ?? a); s++) {
        const r = tempoCast(bot, setting, s, {}, input);
        console.log(JSON.stringify({ bot, setting, seed: s, pass: r.pass, time: Math.round(r.time * 10) / 10, end: r.end, goal: r.goal, rescues: r.rescues, turnBacks: r.turnBacks, lives: r.lives, hits: r.hits, hitBy: r.hitBy, stuck: process.argv.includes("--all") ? r.stuck : r.stuck.slice(0, 3), error: r.error }));
      }
    }
  }
}
