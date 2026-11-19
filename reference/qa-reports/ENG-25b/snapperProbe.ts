// npx tsx reference/qa-reports/ENG-25b/snapperProbe.ts [skill-off]   (ENG-25b: the tier bots over the snapper fixture, both rows)
import { SKILLS } from '../../../tools/inspect/firsttimer.ts';
import { atSnapper, snapperRun, snapperSeed, snapperStage, type ToySnapper } from '../../../tools/inspect/snapToys.ts';
import type { Setting, Tier } from '../../../tools/inspect/tierBots.ts';

if (process.argv[2] === 'skill-off') (SKILLS as Record<string, boolean>).bonkAfterSnap = false;
const ROWS: ToySnapper[] = ['snapper-asleep', 'snapper'];
const WHO: Array<[Tier, Setting]> = [['child', 'easy'], ['child', 'normal'], ['middle', 'easy'], ['middle', 'normal'], ['expert', 'normal']];
for (const which of ROWS) {
  const seed = snapperSeed(which);
  const st = snapperStage(which, seed);
  const m = st.enemies.find((e) => e.type === 'turtle')!;
  console.log(`${which}: seed ${seed}, snapper at x ${Math.round(m.x)} y ${Math.round(m.y)}, kitBeat ${JSON.stringify(m.kitBeat)}, asleep ${!!m.asleep}`);
  for (const [tier, setting] of WHO) {
    for (const v of [1, 2, 3, 4]) {
      const r = snapperRun(which, tier, setting, seed, v);
      const a = atSnapper(r, st);
      console.log(`  ${tier} ${setting} v${v}: end ${a.end} cleared ${JSON.stringify(a.cleared)} left ${a.left} hits ${a.hits} lives ${a.lives} ${a.causes.join(' ')} (${r.time} s)`);
    }
  }
}
