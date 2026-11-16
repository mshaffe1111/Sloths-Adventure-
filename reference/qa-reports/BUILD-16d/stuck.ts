// BUILD-16d: a bot's stuck spots and rescues with what he was doing (BOT=kid SET=normal SEED=2)
import { firstTimer, FT_CHILD, FT_MIDDLE, FT_EXPERT, FT_KID, FT_ADULT } from '/home/user/Sloths-Adventure-/tools/inspect/firsttimer.ts';
const bots: Record<string, any> = { child: FT_CHILD, middle: FT_MIDDLE, expert: FT_EXPERT, kid: FT_KID, adult: FT_ADULT };
const r: any = firstTimer('1-6', Number(process.env.SEED ?? 2), { ...bots[process.env.BOT ?? 'kid'], setting: (process.env.SET ?? 'normal') as any });
console.log('rescueXs', r.rescueXs.map(Math.round).join(' '));
for (const s of r.stuck) console.log(JSON.stringify(s));
for (const l of r.loops) console.log('LOOP', JSON.stringify(l));
