/**
 * 1-4 Up the Kapok rolled (level.md step 3; the 1-3 tool library13.ts is the model): its own kit (w1Arc14.ts kitLib14) laid UP on the
 * ascent lay, then its finish (the vine fields, figs, gates, pods and beats). For each seed and setting: clean or the errors by name,
 * the beats in the designed order, and the counts READ every time (fig bunches, gates, pods, field vines, flags, the way's length).
 *   npx tsx tools/engine/library14.ts --seeds 24 [--from 1] [--setting both|normal|easy] [--json]
 */
import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { ARC_14, finish14, kitLib14, SECTIONS_14 } from '../../src/game/gen2/worlds/w1Arc14.ts';
import { levelConfig } from '../../src/game/realPlay.ts';
import type { Difficulty } from '../../src/game/difficulty.ts';
import type { Gen2Stage } from '../../src/game/gen2/types.ts';

export interface Roll14 {
  seed: number;
  setting: Difficulty;
  errors: string[];
  /** the laid sections' beats, by template id less its 'w1-14-' (rests as R) */
  beats: string[];
  inOrder: boolean;
  figs: number;
  gates: number;
  pods: number;
  fieldVines: number;
  flags: number;
  /** the way from the spawn to the exit (px, the tower's route) */
  way: number;
}

/** the designed order of the beats (the arc's content and quiet jobs, rests as R) */
export const ORDER_14 = ['roots', 'going-up', 'rotting', 'R', 'field', 'pods', 'push', 'R', 'under-fire', 'R', 'rotten-fork', 'R', 'push-two', 'R', 'columns', 'R', 'drop-one', 'R', 'hollow', 'R', 'crown', 'view-north'];
const short = (id: string) => (id.startsWith('w1-14-rest-') ? 'R' : id.replace('w1-14-', ''));

/** one roll of 1-4, built and finished (a throw from the lay or the finish is the roll's error) */
export function roll14(seed: number, setting: Difficulty): Roll14 & { st?: Gen2Stage } {
  try {
    const st = buildGen2Stage({ config: levelConfig('1-4'), kit: kitLib14(), seed, difficulty: setting });
    const errors = [...(st.gen2.errors ?? [])];
    try {
      finish14(st, setting);
    } catch (e) {
      errors.push(String((e as Error).message ?? e));
    }
    const beats = (st.gen2.sections ?? []).map((s) => short(s.template));
    return {
      seed, setting, errors, beats, inOrder: beats.join() === ORDER_14.join(),
      figs: st.clusters?.length ?? 0, gates: st.gates?.length ?? 0, pods: st.pods?.length ?? 0, fieldVines: st.vines.filter((v) => v.field).length,
      flags: st.checkpoints.length, way: Math.round(st.gen2.tower?.route.length ?? 0), st,
    };
  } catch (e) {
    return { seed, setting, errors: [String((e as Error).message ?? e)], beats: [], inOrder: false, figs: 0, gates: 0, pods: 0, fieldVines: 0, flags: 0, way: 0 };
  }
}

const ARGS = process.argv.slice(2);
const arg = (k: string, d: string) => { const i = ARGS.indexOf(k); return i >= 0 ? ARGS[i + 1] : d; };
if (import.meta.url === `file://${process.argv[1]}`) {
  const n = Number(arg('--seeds', '12')), from = Number(arg('--from', '1'));
  const settings = (arg('--setting', 'both') === 'both' ? ['normal', 'easy'] : [arg('--setting', 'normal')]) as Difficulty[];
  const json = ARGS.includes('--json');
  console.log(`1-4: ${SECTIONS_14.length} sections, graph ${Object.values(ARC_14)[0]}`);
  for (const setting of settings) {
    let clean = 0;
    for (let s = from; s < from + n; s++) {
      const r = roll14(s, setting);
      delete r.st;
      if (!r.errors.length && r.inOrder) clean++;
      if (json) console.log(JSON.stringify(r));
      else console.log(`${setting} seed ${s}: ${r.errors.length ? `ERR ${r.errors.slice(0, 2).join(' | ').slice(0, 220)}` : 'clean'}${r.inOrder ? '' : ` OUT OF ORDER ${r.beats.join(' ')}`} figs ${r.figs} gates ${r.gates} pods ${r.pods} field ${r.fieldVines} flags ${r.flags} way ${r.way}`);
    }
    console.log(`${setting}: ${clean} of ${n} clean and in order`);
  }
}
