// ENG-26 probe: the bots' wheel crossings, skill on and off (OFF=1), via wheelToys.wheelCrossing (relative imports, D83)
import { fixtureSeed, wheelCrossing, type WheelToy } from '../../../tools/inspect/wheelToys.ts';
import { SKILLS } from '../../../tools/inspect/firsttimer.ts';
if (process.env.OFF) SKILLS.rideWheel = false;
for (const row of (process.argv[2] ?? 'sparse,top').split(',') as WheelToy[]) {
  const seed = fixtureSeed(row)!;
  for (const [tier, s] of [['child', 'easy'], ['child', 'normal'], ['middle', 'normal'], ['middle', 'easy'], ['expert', 'normal']] as const) {
    const res = (process.argv[3] ?? '1,2,3').split(',').map(Number).map((v) => wheelCrossing(row, tier, s, seed, v));
    console.log(`${process.env.OFF ? 'OFF' : 'ON '} ${row} ${tier} ${s}: ${res.map((x) => `${x.run.end}/${x.seconds}s/sc${x.scrambles}/pond${x.pond}`).join('  ')}`);
  }
}
