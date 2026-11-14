import { CAST_BOTS } from '../inspect/castBots.ts';
import { firstTimer } from '../inspect/firsttimer.ts';
const [seed, setting, bot] = [Number(process.argv[2]), (process.argv[3] ?? 'normal') as 'normal', process.argv[4] ?? 'kid'];
const r: any = firstTimer('1-4', seed, (CAST_BOTS as any)[bot][setting], { cap: 1200, dotSetting: true });
console.log(JSON.stringify({ end: r.end, time: r.time, rescues: r.rescues, stuck: r.stuck.map((s: any) => ({ x: s.x, y: s.y, t: s.t, what: s.what })) }));
