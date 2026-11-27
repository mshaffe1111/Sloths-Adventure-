// INT-R5-c: the re-plant search (the lead's ruling 2). Over 2-6's listed seeds, each skill OFF vs ON:
//   board: rowWheelRuns child normal/easy v1 v2, every way +1 wheel: off scrambles, on scrambles/pond (wheelBoard.test #4's property)
//   step:  castRun adult easy: off rescues vs on end/rescues/lives (wheelStepOff.test's property)
// npx tsx reference/qa-reports/INT-R5/replant/search.ts board|step <from> <to>
import '../../../../src/game/headlessDom.ts';
import { SKILLS } from '../../../../tools/inspect/firsttimer.ts';
import { castRun } from '../../../../tools/inspect/castBots.ts';
import { rowWheelRuns, runLine } from '../../../../tools/inspect/rowWheels.ts';
import { w2Finish } from '../../../../src/game/gen2/worlds/w2.ts';
import { kitLib26, STAGE_26 } from '../../../../src/game/gen2/worlds/w2Arc26.ts';
import { loadSeedList } from '../../../../src/game/gen2/seedList.ts';
await loadSeedList('2-6');
const [mode, a, b] = process.argv.slice(2);
const ROW = { stage: STAGE_26, kit: kitLib26, world: w2Finish as never };
for (let seed = Number(a); seed <= Number(b); seed++) {
  if (mode === 'board') {
    for (const [tier, set] of [['child', 'normal'], ['child', 'easy'], ['middle', 'normal'], ['middle', 'easy']] as const) {
      SKILLS.boardWatch = false;
      const off = rowWheelRuns(ROW, seed, [[tier, set]], [1, 2]);
      SKILLS.boardWatch = true;
      const on = rowWheelRuns(ROW, seed, [[tier, set]], [1, 2]);
      off.forEach((o, i) => {
        const n = on[i];
        const hits = o.wheels.map((w, j) => ({ w, j, nw: n.wheels.length === o.wheels.length ? n.wheels[j] : undefined }))
          .filter(({ w, nw }) => w.way > 0 && w.scrambles >= 2 && nw && nw.scrambles === 0 && nw.pond === 0);
        console.log(`${hits.length ? 'HIT ' : '    '}seed ${seed} ${tier} ${set} v${o.v} ${hits.map((h) => `${h.w.row}#${h.j}`).join(',')} | OFF ${runLine(o)} || ON ${runLine(n)}`);
      });
    }
  } else {
    SKILLS.stepOff = false;
    const off = castRun('adult', 'easy', '2-6', seed);
    SKILLS.stepOff = true;
    const on = castRun('adult', 'easy', '2-6', seed);
    const hit = off.rescues >= 1 && on.end === 'shrine' && on.rescues === 0 && on.lives === 0;
    console.log(`${hit ? 'HIT ' : '    '}seed ${seed} | OFF ${off.end} ${off.time} s r${off.rescues} l${off.lives} || ON ${on.end} ${on.time} s r${on.rescues} l${on.lives}`);
  }
}
