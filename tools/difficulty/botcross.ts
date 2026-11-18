// METER-1 cross-check driver (npx tsx tools/difficulty/botcross.ts --stages 1-1,1-6 --seeds 1-4 [--bots kid,adult,child,middle,expert] > runs.jsonl; read by reference/qa-reports/METER-1/rank.py): each bot on each stage and setting, the misses it pays (hits, lives, put-backs = soft falls,
// rescues) and its time, one JSON line a run; read by the meter's rank check
import { firstTimer } from '../inspect/firsttimer.ts';
import { CAST_BOTS } from '../inspect/castBots.ts';
const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const stages = (arg('--stages') ?? '1-1').split(',');
const seeds = (arg('--seeds') ?? '1-4').split('-').map(Number);
const bots = (arg('--bots') ?? 'kid,adult,child,middle,expert').split(',');
for (const stage of stages) for (const bot of bots) for (const setting of ['normal', 'easy'] as const) {
  const who = CAST_BOTS[bot]?.[setting];
  if (!who) continue;
  for (let seed = seeds[0]; seed <= (seeds[1] ?? seeds[0]); seed++) {
    try {
      const r = firstTimer(stage, seed, who, { cap: 1200, dotSetting: true });
      const goalFull = !r.goal || r.goal.got >= r.goal.need;
      console.log(JSON.stringify({ stage, bot, setting, seed, end: r.end, pass: r.end === 'shrine' && goalFull && r.rescues === 0, time: r.time,
        hits: r.harms.filter((h) => h.kind === 'hit').length, lives: r.harms.filter((h) => h.kind === 'life').length, putbacks: r.softFalls ?? 0, rescues: r.rescues }));
    } catch (e) { console.log(JSON.stringify({ stage, bot, setting, seed, error: String(e).slice(0, 200) })); }
  }
}
