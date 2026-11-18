// npx tsx reference/qa-reports/METER-3/lianaBots.ts: the tier bots on ENG-24's liana toys (real input, five variants), the evidence the
// liana-drop price is checked against (METER-3, R-165.287): per toy and tier, the misses at the river (lives + put-backs), let-gos onto a
// log, catches off one, and the seconds in the toy's piece
import '../../../src/game/headlessDom.ts';
import { fixtureSeed, lianaRun, type LianaToy, type ToyRiver } from '../../../tools/inspect/lianaRiverToys.ts';
const setting = (process.argv[2] ?? 'normal') as 'normal' | 'easy';
for (const [toy, row, easy] of [['drop', 'long', 'long'], ['drop', 'ride', 'deep'], ['drop', 'twin', 'deep'], ['drop', 'gap280', 'deep'], ['catch', 'twin', 'long']] as Array<[LianaToy, ToyRiver, ToyRiver]>) {
  const seed = fixtureSeed(toy, row, ['normal', 'easy'], easy)!;
  for (const tier of ['child', 'middle', 'expert'] as const) {
    let miss = 0, onto = 0, from = 0, secs = 0, shrine = 0;
    for (const v of [1, 2, 3, 4, 5]) {
      const r = lianaRun(toy, row, tier, setting, seed, v, easy, { realInput: true });
      const p = r.pieces.find((q) => q.id === `toy-liana-${toy}`);
      miss += (p?.lives ?? 0) + (p?.putbacks ?? 0); onto += r.ontoLog; from += r.fromLog; secs += p?.seconds ?? 0; shrine += r.end === 'shrine' ? 1 : 0;
    }
    console.log(`${toy}/${setting === 'easy' ? easy : row} ${setting} ${tier}: misses ${miss}/5 runs, onto-log ${onto}, from-log ${from}, piece ${(secs / 5).toFixed(1)} s, shrine ${shrine}/5`);
  }
}
