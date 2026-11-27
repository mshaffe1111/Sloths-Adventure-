/**
 * The tempo toy's bot runs (ENG-29, 2-9's NEW 1): the court toy row (src/game/gen2/worlds/w2TempoToy.ts) rolled by gen2 the way the game
 * rolls a listed stage (listed.ts's test seam, a planted one-seed list, World 2's finish), and castBots' cast over it in the real engine.
 *   npx tsx tools/inspect/tempoToys.ts [--seeds 1-4] [--bots kid,adult,child,middle,expert] [--input fake|touch|pad] [--setting normal|easy]
 *     [--pads] (the run-pitch pads' pond, COURT_PADS, in place of the stones') [--all] (every stuck spot) [--lives] (where each life was lost)
 */
import '../../src/game/headlessDom.ts';
import { withTestStage } from '../../src/game/gen2/listed.ts';
import { buildGen2Stage, keptFoes } from '../../src/game/gen2/pipeline.ts';
import { packPlan, plantSeedList } from '../../src/game/gen2/seedList.ts';
import { withFixtureConfig } from '../../src/game/realPlay.ts';
import { COURT_PADS, TEMPO_ID, tempoCfg, tempoKit, tempoRow, type TempoToyOpts } from '../../src/game/gen2/worlds/w2TempoToy.ts';
import { CAST_BOTS, castRun, type CastInput, type CastRun } from './castBots.ts';
import { firstTimer } from './firsttimer.ts';
import type { Setting } from './tierBots.ts';

/** one bot's run over the toy rolled from `seed` (the toy's own gen2 seed; the stage played is that roll, both settings) */
export function tempoCast(bot: string, setting: Setting, seed: number, o: TempoToyOpts = {}, input: CastInput = 'fake'): CastRun {
  return onToy(seed, o, () => castRun(bot, setting, TEMPO_ID, 1, input));
}

/** where each life was lost (x, cause) in one bot's run over the toy (firstTimer as castRun runs it) */
export function tempoLives(bot: string, setting: Setting, seed: number, o: TempoToyOpts = {}): Array<{ x: number; cause: string }> {
  return onToy(seed, o, () => firstTimer(TEMPO_ID, 1, CAST_BOTS[bot][setting]!, { cap: 1200, dotSetting: true }).harms
    .filter((h) => h.kind === 'life').map((h) => ({ x: Math.round(h.x), cause: String(h.cause) })));
}

/** `fn` with the toy rolled from `seed` listed under its id, a one-seed list planted (the game's own roll of it) */
function onToy<T>(seed: number, o: TempoToyOpts, fn: () => T): T {
  const row = tempoRow(o);
  const cfg = tempoCfg();
  const st = withTestStage({ [TEMPO_ID]: row }, () => buildGen2Stage({ config: cfg, kit: tempoKit(o), seed, difficulty: 'normal' }));
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  return withTestStage({ [TEMPO_ID]: row }, () => {
    const undo = plantSeedList(TEMPO_ID, { dict, seeds: [seed], plans: [packed] });
    try {
      return withFixtureConfig(cfg, fn);
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
        const o = process.argv.includes('--pads') ? { pads: COURT_PADS } : {};
        if (process.argv.includes('--lives')) { console.log(JSON.stringify({ bot, setting, seed: s, lives: tempoLives(bot, setting, s, o) })); continue; }
        const r = tempoCast(bot, setting, s, o, input);
        console.log(JSON.stringify({ bot, setting, seed: s, pass: r.pass, time: Math.round(r.time * 10) / 10, end: r.end, goal: r.goal, rescues: r.rescues, turnBacks: r.turnBacks, lives: r.lives, hits: r.hits, hitBy: r.hitBy, stuck: process.argv.includes("--all") ? r.stuck : r.stuck.slice(0, 3), error: r.error }));
      }
    }
  }
}
