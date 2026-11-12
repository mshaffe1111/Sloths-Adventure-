/**
 * The flown arcs, every scope's row (R-165.61; F12 11-12 moved them here from reach.ts): WORLD DATA (tools/engine/generalitycheck.ts
 * EXEMPT: src/game/gen2/worlds/), since a Normal scope is one stage's flight and names it. reach.ts reads them as FLOWN_ARCS; a stage's
 * table row (stageTable.ts `judged`) picks its Normal scope; Easy's rows are easy-any (full help on every stage).
 * Sources: reach.md §2 (1-1 and Easy, flown on 1-1 by reference/specs/sims/flight.ts) and chain.md §1 (1-2's Normal, flown on 1-2 with
 * FLIGHT_STAGE=1-2). Flying the next stage is a block of rows here under its own scope and its table row's `judged`.
 */
import type { FlownArc, ReachMove } from '../verdicts.types.ts';

const row = (move: ReachMove, climb: [number, number], n: [number, number, number], e: [number, number, number], source: string): FlownArc[] => [
  { move, scope: 'normal-1-1', climb: { block: climb[0], thin: climb[1] }, gap: { from70: n[0], lastGround: n[1], any: n[2] }, source },
  { move, scope: 'easy-any', climb: { block: climb[0], thin: climb[1] }, gap: { from70: e[0], lastGround: e[1], any: e[2] }, source },
];

/** a Normal row of one stage's own scope (its Easy rows are easy-any's) */
const n12 = (move: ReachMove, climb: [number, number], n: [number, number, number], source: string): FlownArc[] => [
  { move, scope: 'normal-1-2', climb: { block: climb[0], thin: climb[1] }, gap: { from70: n[0], lastGround: n[1], any: n[2] }, source },
];

/** every flown row: reach.md §2 ("Normal 1-1 and Easy are the same unless two figures are given"), then 1-2's Normal (chain.md §1) */
export const FLOWN_ROWS: readonly FlownArc[] = [
  // (N any 246, not the table's 244: the same row's "the Critic's finer flight found 246 on Normal too: design to 246")
  ...row('single-hold', [123, 117], [137, 223, 246], [141, 227, 246], 'reach.md §2 "Single, hold" (N any: "design to 246")'),
  ...row('single-flick', [123, 117], [128, 213, 239], [132, 217, 243], 'reach.md §2 "Single, flick"'),
  ...row('single-tap', [87, 81], [77, 163, 184], [77, 163, 184], 'reach.md §2 "Single, Pad tap" (one figure: the same on Easy)'),
  ...row('double-hold', [214, 208], [292, 379, 409], [296, 383, 411], 'reach.md §2 "Double, hold"'),
  ...row('double-flick', [212, 206], [283, 370, 396], [287, 374, 400], 'reach.md §2 "Double, flick"'),
  ...row('double-tap-tap', [150, 144], [191, 278, 299], [195, 282, 299], 'reach.md §2 "Double, Pad tap,tap"'),
  // (the bounce's gap is one figure, mushroom at the lip, for every take-off column)
  ...row('bounce', [223, 217], [179, 179, 179], [183, 183, 183], 'reach.md §2 "Bounce (floor mushroom, cap 30 px up)"'),
  ...row('bounce-air', [317, 309], [340, 340, 340], [340, 340, 340], 'reach.md §2 "Bounce + air jump"'),
  // 1-2 on Normal (F12, 11-12): flown on stage 1-2, `FLIGHT_STAGE=1-2 npx tsx reference/specs/sims/flight.ts normal <rise|dist|ddist|bdist>`,
  // the Designer's chain.md §1 "Rows for src/game/gen2/reach.ts, scope Normal 1-2", re-flown on the merged engine with every table the
  // same (reference/qa-reports/F12/fly/). Its help is easeAssist(2) = 0.958 of 1-1's: the double and the bounce + air jump climb 1-2 px
  // less, the bounce's level gap 1 px less; every other gap figure is 1-1's (the single hold's "any" kept at the 246 1-1 designs to).
  ...n12('single-hold', [123, 117], [137, 223, 246], 'chain.md §1 "single-hold 123 / 117" (any: 1-1\'s "design to 246")'),
  ...n12('single-flick', [123, 116], [128, 213, 239], 'chain.md §1 "single-flick 123 / 116"'),
  ...n12('single-tap', [87, 81], [77, 163, 184], 'chain.md §1 "single-tap 87 / 81"'),
  ...n12('double-hold', [213, 207], [292, 379, 409], 'chain.md §1 "double-hold 213 / 207"'),
  ...n12('double-flick', [211, 205], [283, 370, 396], 'chain.md §1 "double-flick 211 / 205"'),
  ...n12('double-tap-tap', [150, 143], [191, 278, 299], 'chain.md §1 "double-tap-tap 150 / 143"'),
  ...n12('bounce', [223, 217], [178, 178, 178], 'chain.md §1 "bounce 223 / 217, gap 178"'),
  ...n12('bounce-air', [316, 307], [340, 340, 340], 'chain.md §1 "bounce-air 316 / 307, gap 340"'),
];

