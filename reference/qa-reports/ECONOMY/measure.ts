/**
 * ECONOMY measurement (R-165.194): fly the real engine (RealPlay, 30 fps) with the R-165.59 tier bots and tally what a run costs.
 * Per run: end, seconds, hits (hearts lost), lives lost, Game Overs (the bot takes Continue like a player), Easy put-backs, rescues.
 * Per stage: heart pickups laid, checkpoints (flags), flowers laid / goal, from the built stage itself.
 * Run: npx tsx reference/qa-reports/ECONOMY/measure.ts --stages 1-1,1-2,1-3 --seeds 1-10 > reference/qa-reports/ECONOMY/runs.jsonl
 */
import { RealPlay } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { firstTimer } from '../../../tools/inspect/firsttimer.ts';
import { BOTS } from '../../../tools/inspect/tierBots.ts';

const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const range = (s: string) => { const [a, b] = s.split('-').map(Number); return Array.from({ length: (b ?? a) - a + 1 }, (_, i) => a + i); };
const stages = (arg('--stages') ?? '1-1').split(',');
const seeds = range(arg('--seeds') ?? '1-5');
const tiers = (arg('--tiers') ?? 'child,middle,expert').split(',') as Array<keyof typeof BOTS>;
const settings = (arg('--settings') ?? 'easy,normal').split(',') as Array<'easy' | 'normal'>;

for (const stage of stages) for (const setting of settings) for (const v of seeds) {
  setDifficulty(setting);
  const st = new RealPlay(stage, v).stage as unknown as { collectibles?: Array<{ type: string }>; checkpoints?: unknown[]; config: { targetCount: number; objectiveType: string } };
  const laid = (t: string) => (st.collectibles ?? []).filter((c) => c.type === t).length;
  console.log(JSON.stringify({ kind: 'stage', stage, setting, variant: v, hearts: laid('heart'), flowers: laid('flower') + laid('fruit') + laid('leaf'), goal: st.config.targetCount, objective: st.config.objectiveType, checkpoints: (st.checkpoints ?? []).length }));
  for (const tier of tiers) {
    const who = BOTS[tier]?.[setting];
    if (!who) continue;
    try {
      const r = firstTimer(stage, v, who, { cap: 1200 });
      const hits = r.harms.filter((h) => h.kind === 'hit').length;
      const lives = r.harms.filter((h) => h.kind === 'life');
      console.log(JSON.stringify({ kind: 'run', stage, setting, tier, variant: v, end: r.end, seconds: Math.round(r.time), hits, lives: lives.length, lifeCauses: lives.map((h) => h.cause), gameOvers: r.gameOvers, putbacks: r.softFalls ?? 0, rescues: r.rescues, goal: r.goal }));
    } catch (err) {
      console.log(JSON.stringify({ kind: 'error', stage, setting, tier, variant: v, error: String(err).slice(0, 200) }));
    }
  }
}
