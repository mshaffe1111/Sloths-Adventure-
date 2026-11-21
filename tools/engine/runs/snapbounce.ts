// ENG-SNAP: every tier on the awake snapper toy (snapToys.ts snapperWatch), one line a run: bonks, how far past, far-side landings, the kick
// npx tsx tools/engine/runs/snapbounce.ts [bots e.g. child:normal,kid:easy] [variants e.g. 1-6] [skill-off]
import '../../../src/game/headlessDom.ts';
import { SKILLS } from '../../inspect/firsttimer.ts';
import { CAST_BOTS } from '../../inspect/castBots.ts';
import { snapperSeed, snapperWatch } from '../../inspect/snapToys.ts';
const [botsArg, vArg, offArg] = process.argv.slice(2);
const bots = (botsArg ?? 'child:normal,child:easy,kid:normal,kid:easy,middle:normal,middle:easy,expert:normal,adult:normal,adult:easy').split(',').map((b) => b.split(':') as [string, 'normal' | 'easy']);
const [v0, v1] = (vArg ?? '1-6').split('-').map(Number);
for (const k of (offArg ?? '').split(',').filter(Boolean)) (SKILLS as Record<string, boolean>)[k] = false;
const seed = snapperSeed('snapper');
for (const [bot, setting] of bots) {
  for (let v = v0; v <= (v1 ?? v0); v++) {
    const a = snapperWatch('snapper', CAST_BOTS[bot][setting]!, seed, v);
    console.log(`${bot} ${setting} v${v}: ${a.cleared.kick ? 'K' : '-'} shrine ${a.shrine ? 1 : 0} hits ${a.hits + a.lives} bonks ${a.bonks} (hops ${a.bonkHops}, adopted ${a.adopted}) past ${a.past}${a.farLand ? ' FAR' : ''} | ${a.events}`);
  }
}
