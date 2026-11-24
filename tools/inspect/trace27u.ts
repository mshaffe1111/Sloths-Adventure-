// ENG-27u scratch: the frames around a boat move over the ease's bound with the view live (pacerRespawn's iris assert).
//   npx tsx tools/inspect/trace27u.ts <home|post> <middle|expert|ride> <normal|easy> <seed> <frame>
import '../../src/game/headlessDom.ts';
import { homeRun } from './homeToys.ts';
import { SKILLS } from './firsttimer.ts';
import { HOME_CODE, POST_CODE } from '../../src/game/gen2/toyHome.ts';
import { pacerX } from '../../src/game/pacer.ts';
const [code, bot, setting, seedS, frameS] = process.argv.slice(2);
if (bot === 'ride') Object.assign(SKILLS, { race: false, rideOnly: true });
const at = Number(frameS);
let frame = 0;
homeRun(bot === 'expert' ? 'expert' : 'middle', setting as never, Number(seedS), 1, { onFrame: (sim: any) => {
  const e = sim.e, p = e.player;
  const pc = e.pieces.find((q: any) => q.kind === 'pacer');
  if (pc && Math.abs(frame - at) <= 4)
    console.log(JSON.stringify({ frame, lives: e.lives, down: e.down ? { t: +e.down.t.toFixed(3), reason: e.down.reason } : null, iris: +e.irisOpen.toFixed(3), px: Math.round(p.x), py: Math.round(p.y), gr: !!p.grounded, clock: pc.clock === null ? null : +pc.clock.toFixed(3), owed: +(pc.owed ?? 0).toFixed(3), bx: pc.clock === null ? null : Math.round(pacerX(pc.pacer, pc.clock)), cp: e.checkpoint ? Math.round(e.checkpoint.x) : null }));
  frame++;
} } as never, code === 'post' ? POST_CODE : HOME_CODE);
