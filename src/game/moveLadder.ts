/**
 * The move table's World 1 row, as far as 1-1 reads it (engine-core, 11-05): where the live game (main) teaches each move, by the
 * designer's rule, a move's taught-at is the first lesson card, Dot tip or skill that teaches it. A spec's known moves are the moves
 * taught at stages before its own (mixer/spec.ts). Measured on main 68b31e66:
 *   run, jump    coach.run, coach.jump (dotLinesData.ts, stage 1-1, the touch coach's first lines)
 *   double       coach.nice and hint.1-1.double (stage 1-1)
 *   bounce       lesson.bounce, the card on a mushroom's first sight: main's 1-1 lays a mushroom on 16 of 16 layouts
 *                (tools/validate/mechanics.ts 'mushroom', Normal; gaps likewise 16 of 16)
 * Only these four rows: the rest of the table (climb, creaky, crumble, swim, glide) is not measured yet, so a spec that needs them keeps
 * its own list (SPEC_15).
 */
import type { Move } from './mixer/spec.ts';

export const TAUGHT_AT: Readonly<Partial<Record<Move, string>>> = { run: '1-1', jump: '1-1', double: '1-1', bounce: '1-1' };
/** a stage's place in play order (1-1 is 1, 2-1 is 11) */
const order = (id: string) => { const [w, m] = id.split('-').map(Number); return (w - 1) * 10 + m; };
/** the moves the table says are taught before this stage */
export function taughtBefore(id: string): Move[] {
  return (Object.entries(TAUGHT_AT) as Array<[Move, string]>).filter(([, at]) => order(at) < order(id)).map(([m]) => m);
}
