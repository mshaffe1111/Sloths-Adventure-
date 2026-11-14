import { firstTimer, FT_MIDDLE, FT_MIDDLE_EASY, FT_CHILD, FT_CHILD_EASY } from '/home/user/fix14/tools/inspect/firsttimer.ts';
const [seed, set, bot] = [+(process.argv[2] ?? 4), process.argv[3] ?? 'easy', process.argv[4] ?? 'middle'];
const who = bot === 'child' ? (set === 'easy' ? FT_CHILD_EASY : FT_CHILD) : set === 'easy' ? FT_MIDDLE_EASY : FT_MIDDLE;
const r: any = firstTimer('1-4', seed, who, { cap: 1200, dotSetting: true });
console.log(bot, set, seed, r.end, r.pass, r.time);
for (const s of r.stuck ?? []) console.log('STUCK', s.x, s.y, s.t, s.what);
