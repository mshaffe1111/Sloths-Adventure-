import { firstTimer } from '../firsttimer.ts';
import { CAST_BOTS } from '../castBots.ts';
const [stage, bot, setting, seed] = process.argv.slice(2);
const r = firstTimer(stage, Number(seed), CAST_BOTS[bot][setting as 'normal'], { cap: 1200, dotSetting: true });
console.log(JSON.stringify({ end: r.end, time: r.time, rescues: r.rescues, stuck: r.stuck, harms: r.harms.slice(-12) }));
