import '/home/user/Sloths-Adventure-/src/game/headlessDom.ts';
import { SKILLS } from '/home/user/Sloths-Adventure-/tools/inspect/firsttimer.ts';
import { castRun } from '/home/user/Sloths-Adventure-/tools/inspect/castBots.ts';
const [skill, bot, setting, from, to] = process.argv.slice(2);
(SKILLS as any)[skill] = false;
for (let s = Number(from); s <= Number(to); s++) {
  const r: any = castRun(bot, setting as any, process.env.STAGE || '2-1', s);
  console.log(JSON.stringify({ skill, bot, setting, seed: s, end: r.end, rescues: r.rescues, lives: r.lives, time: r.time }));
}
