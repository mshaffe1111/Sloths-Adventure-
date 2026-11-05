// Modelled clean-run seconds for every stage of the worlds asked, built the way the inspector builds them (tools/inspect/stages.ts).
// usage: npx tsx lengths.ts 1-10 [seed]
import { stageList } from '/home/user/Sloths-Adventure-/tools/inspect/stages.ts';
import { modelStage, MODEL_FAST, MODEL_TYPICAL, targetSeconds } from '/home/user/Sloths-Adventure-/src/game/stageTime.ts';
const [lo, hi] = (process.argv[2] ?? '1-10').split('-').map(Number);
const seed = Number(process.argv[3] ?? 1);
const worlds: number[] = []; for (let w = lo; w <= (hi ?? lo); w++) worlds.push(w);
const { stages, skipped } = stageList(worlds, seed);
console.log(['id', 'world', 'source', 'type', 'normal_fast_s', 'normal_typical_s', 'easy_fast_s', 'easy_typical_s', 'target_typical_s', 'name'].join('\t'));
for (const s of stages) {
  const row: (string | number)[] = [s.id, s.world, s.source, s.type];
  for (const easy of [false, true]) {
    try {
      const st = s.build(easy);
      row.push(Math.round(modelStage(st, MODEL_FAST).total), Math.round(modelStage(st, MODEL_TYPICAL).total));
    } catch (e) { row.push('ERR', String((e as Error).message).slice(0, 60)); }
  }
  row.push(targetSeconds(s.world, s.mini, s.type), s.name);
  console.log(row.join('\t'));
}
for (const k of skipped) console.log(['#skipped', k.id, k.name, k.why.slice(0, 80)].join('\t'));
