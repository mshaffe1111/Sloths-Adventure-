/**
 * BUILD-29's READY on the 2-9 DRAFT (src/game/gen2/worlds/w2Arc29.ts, test seam only until the lead's GO): the draft rolled by gen2 the
 * way the game rolls a listed stage (listed.ts's test seam, a planted one-seed list, World 2's finish; tempoToys.ts's onToy), and
 * castBots' cast over it in the real engine. One JSON line a run.
 *   npx tsx tools/inspect/draft29.ts [--seeds 1-40] [--bots kid,adult,child,middle,expert] [--setting normal|easy] [--input fake|touch|pad]
 *     [--barge-stand-in] (the barge a `court` river until ENG-29-e's carrier rule lands)
 */
import '../../src/game/headlessDom.ts';
import { withTestStage } from '../../src/game/gen2/listed.ts';
import { buildGen2Stage, keptFoes } from '../../src/game/gen2/pipeline.ts';
import { packPlan, plantSeedList } from '../../src/game/gen2/seedList.ts';
import { withFixtureConfig } from '../../src/game/realPlay.ts';
import { DRAFT_ID_29 as STAGE_29, draft29Cfg, draft29Row, kitLib29 } from '../../src/game/gen2/worlds/w2Arc29.ts';
import { CAST_BOTS, castRun, type CastInput, type CastRun } from './castBots.ts';
import type { Setting } from './tierBots.ts';
import { W2_RIVERS } from '../../src/game/gen2/worlds/w2.ts';

const BARGE_STAND_IN = process.argv.includes('--barge-stand-in');

/** `fn` with the draft rolled from `seed` listed under the draft's fixture id (DRAFT_ID_29), a one-seed list planted (the game's own roll of it) */
export function onDraft29<T>(seed: number, fn: () => T): T {
  const kit = kitLib29(STAGE_29);
  // (--barge-stand-in: the King's Barge rides as a `court` river, a log a bar, until ENG-29-e's carrier rule (G3, the lead's (vii) A) lands:
  //  the river judge refuses the barge's 5.7 s wait today; READY's numbers taken with it say so)
  if (BARGE_STAND_IN) (kit.manifest as { rivers: Record<string, unknown> }).rivers = { ...kit.manifest.rivers, barge29: W2_RIVERS.court };
  const row = { ...draft29Row([], STAGE_29), kit: () => kit };
  const cfg = draft29Cfg(STAGE_29);
  const st = withTestStage({ [STAGE_29]: row }, () => buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' }));
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  return withTestStage({ [STAGE_29]: row }, () => {
    const undo = plantSeedList(STAGE_29, { dict, seeds: [seed], plans: [packed] });
    try {
      return withFixtureConfig(cfg, fn);
    } finally {
      undo();
    }
  });
}

/** one bot's run over the draft rolled from `seed` (seed 1 of its planted list) */
export const draft29Cast = (bot: string, setting: Setting, seed: number, input: CastInput = 'fake'): CastRun =>
  onDraft29(seed, () => castRun(bot, setting, STAGE_29, seed, input));

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
  const [a, b] = (arg('--seeds') ?? '1-4').split('-').map(Number);
  const bots = (arg('--bots') ?? 'kid,adult,child,middle,expert').split(',');
  const input = (arg('--input') ?? 'fake') as CastInput;
  for (const setting of (arg('--setting') ? [arg('--setting')] : ['normal', 'easy']) as Setting[]) {
    for (const bot of bots.filter((q) => CAST_BOTS[q]?.[setting])) {
      for (let s = a; s <= (b ?? a); s++) {
        const r = draft29Cast(bot, setting, s, input);
        console.log(JSON.stringify({ bot, setting, seed: s, pass: r.pass, time: Math.round(r.time * 10) / 10, end: r.end, goal: r.goal, lives: r.lives, hits: r.hits, hitBy: r.hitBy, stuck: r.stuck.slice(0, 3), error: r.error }));
      }
    }
  }
}
