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

/** a Normal row of 1-3's own scope (P13, 11-12) */
const n13 = (move: ReachMove, climb: [number, number], n: [number, number, number], source: string): FlownArc[] => [
  { move, scope: 'normal-1-3', climb: { block: climb[0], thin: climb[1] }, gap: { from70: n[0], lastGround: n[1], any: n[2] }, source },
];

/** a Normal row of 1-5's own scope (B15, 11-13) */
const n15 = (move: ReachMove, climb: [number, number], n: [number, number, number], source: string): FlownArc[] => [
  { move, scope: 'normal-1-5', climb: { block: climb[0], thin: climb[1] }, gap: { from70: n[0], lastGround: n[1], any: n[2] }, source },
];

/** a Normal row of 1-6's own scope (BUILD-16, 11-14) */
const n16 = (move: ReachMove, climb: [number, number], n: [number, number, number], source: string): FlownArc[] => [
  { move, scope: 'normal-1-6', climb: { block: climb[0], thin: climb[1] }, gap: { from70: n[0], lastGround: n[1], any: n[2] }, source },
];

/** a Normal row of 1-7's own scope (INT-9, 11-14: BUILD-17's step 2, flown on the merged engine) */
const n17 = (move: ReachMove, climb: [number, number], n: [number, number, number], source: string): FlownArc[] => [
  { move, scope: 'normal-1-7', climb: { block: climb[0], thin: climb[1] }, gap: { from70: n[0], lastGround: n[1], any: n[2] }, source },
];

/** a Normal row of 1-8's own scope (BUILD-18c 11-15: flown on 1-8, reference/qa-reports/BUILD-18c/fly/flight-1-8-normal.txt; judged since FIX-GATES' bounce-reuse kind, 11-15) */
const n18 = (move: ReachMove, climb: [number, number], n: [number, number, number], source: string): FlownArc[] => [
  { move, scope: 'normal-1-8', climb: { block: climb[0], thin: climb[1] }, gap: { from70: n[0], lastGround: n[1], any: n[2] }, source },
];

/** a Normal row of 1-9's own scope (BUILD-19 11-18: flown on 1-9, reference/qa-reports/BUILD-19/fly/flight-1-9-normal.txt; within 0-1 px
 *  of 1-8's flight but the double flick's widest, 385 for 391) */
const n19 = (move: ReachMove, climb: [number, number], n: [number, number, number], source: string): FlownArc[] => [
  { move, scope: 'normal-1-9', climb: { block: climb[0], thin: climb[1] }, gap: { from70: n[0], lastGround: n[1], any: n[2] }, source },
];

/** a Normal row of 1-4's own scope (INT-3, 11-13: flown on the tower once RealPlay.bare opened its walls) */
const n14 = (move: ReachMove, climb: [number, number], n: [number, number, number], source: string): FlownArc[] => [
  { move, scope: 'normal-1-4', climb: { block: climb[0], thin: climb[1] }, gap: { from70: n[0], lastGround: n[1], any: n[2] }, source },
];

/** a Normal row of a World 2 stage's own scope (ENG-W2, 11-14: 2-1 and 2-2 flown on World 2's kit, FLIGHT_STAGE=<id>
 *  reference/specs/sims/flight.ts normal all on t-eng-w2 @ aca656aa2, entered in chain.md §1 "Rows ... Normal 2-1 and Normal 2-2"; logs in
 *  reference/qa-reports/ENG-W2/fly-2-1.txt, fly-2-2.txt) */
const nW2 = (stage: string) => (move: ReachMove, climb: [number, number], n: [number, number, number], source: string): FlownArc[] => [
  { move, scope: `normal-${stage}`, climb: { block: climb[0], thin: climb[1] }, gap: { from70: n[0], lastGround: n[1], any: n[2] }, source },
];
const n21 = nW2('2-1'), n22 = nW2('2-2');

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
  // 1-3 on Normal (P13, 11-12): flown on stage 1-3 on t-w1-creatures + t-12-fly, `FLIGHT_STAGE=1-3 npx tsx reference/specs/sims/flight.ts
  // normal <rise|dist|ddist|bdist|chain>` (reference/qa-reports/P13/fly/). Its help is easeAssist(3): every row the block column's figure,
  // as 1-2's are. Against 1-2: the doubles and the bounce + air jump climb 1 px less, the from-70 gaps of the flick, the doubles and the
  // single hold 1 px less, the double flick's any 1 px less, the bounce + air jump's gap 335 (5 less). The single hold's any is the
  // flown 244, not 1-1's "design to 246" (no finer flight of 1-3 has been made: the measured figure, never a looser one).
  // Easy on 1-3 flies exactly as easy-any (every table identical to 1-2's Easy).
  ...n13('single-hold', [123, 117], [137, 223, 244], 'chain.md §1 "1-3: single-hold 123 / 117, gap 137 / 223 / 244"'),
  ...n13('single-flick', [123, 116], [127, 213, 239], 'chain.md §1 "1-3: single-flick 123 / 116, gap 127 / 213 / 239"'),
  ...n13('single-tap', [87, 81], [77, 163, 184], 'chain.md §1 "1-3: single-tap 87 / 81, gap 77 / 163 / 184"'),
  ...n13('double-hold', [213, 206], [291, 379, 409], 'chain.md §1 "1-3: double-hold 213 / 206, gap 291 / 379 / 409"'),
  ...n13('double-flick', [211, 204], [282, 370, 395], 'chain.md §1 "1-3: double-flick 211 / 204, gap 282 / 370 / 395"'),
  ...n13('double-tap-tap', [149, 143], [190, 278, 299], 'chain.md §1 "1-3: double-tap-tap 149 / 143, gap 190 / 278 / 299"'),
  ...n13('bounce', [223, 217], [178, 178, 178], 'chain.md §1 "1-3: bounce 223 / 217, gap 178"'),
  ...n13('bounce-air', [315, 306], [335, 335, 335], 'chain.md §1 "1-3: bounce-air 315 / 306, gap 335"'),
  // 1-5 on Normal (B15, 11-13): flown on stage 1-5, `FLIGHT_STAGE=1-5 npx tsx reference/specs/sims/flight.ts normal <rise|dist|ddist|bdist>`
  // (reference/qa-reports/B15/fly/; chain.md §1 "Rows ... scope Normal 1-5"). Its help is easeAssist(5): every gap the block column's
  // figure, as 1-2's and 1-3's are. The single hold's any is the flown 244 (never a looser figure). Easy on 1-5 flies as easy-any
  ...n15('single-hold', [123, 116], [137, 222, 244], 'chain.md §1 "1-5: single-hold 123 / 116, gap 137 / 222 / 244"'),
  ...n15('single-flick', [123, 116], [127, 212, 239], 'chain.md §1 "1-5: single-flick 123 / 116, gap 127 / 212 / 239"'),
  ...n15('single-tap', [87, 80], [77, 162, 183], 'chain.md §1 "1-5: single-tap 87 / 80, gap 77 / 162 / 183"'),
  ...n15('double-hold', [211, 204], [291, 377, 409], 'chain.md §1 "1-5: double-hold 211 / 204, gap 291 / 377 / 409"'),
  ...n15('double-flick', [210, 203], [278, 363, 391], 'chain.md §1 "1-5: double-flick 210 / 203, gap 278 / 363 / 391"'),
  ...n15('double-tap-tap', [149, 142], [190, 275, 299], 'chain.md §1 "1-5: double-tap-tap 149 / 142, gap 190 / 275 / 299"'),
  ...n15('bounce', [223, 216], [178, 178, 178], 'chain.md §1 "1-5: bounce 223 / 216, gap 178"'),
  ...n15('bounce-air', [313, 304], [335, 335, 335], 'chain.md §1 "1-5: bounce-air 313 / 304, gap 335"'),
  // 1-6 on Normal (BUILD-16, 11-14): flown on stage 1-6, `FLIGHT_STAGE=1-6 npx tsx reference/specs/sims/flight.ts normal all`
  // (reference/qa-reports/BUILD-16/fly/normal-all.txt: [rise] best spot, [dist] / [ddist] block column >=70 / last ground / ANY, [bdist]
  // d 0). Each gap the block column's figure, as 1-2's to 1-5's are. Easy on 1-6 flies as easy-any (fly/easy-all.txt)
  ...n16('single-hold', [123, 116], [136, 222, 244], 'chain.md §1 "1-6: single-hold 123 / 116, gap 136 / 222 / 244"'),
  ...n16('single-flick', [123, 115], [127, 212, 238], 'chain.md §1 "1-6: single-flick 123 / 115, gap 127 / 212 / 238"'),
  ...n16('single-tap', [87, 80], [77, 162, 183], 'chain.md §1 "1-6: single-tap 87 / 80, gap 77 / 162 / 183"'),
  ...n16('double-hold', [210, 203], [291, 376, 409], 'chain.md §1 "1-6: double-hold 210 / 203, gap 291 / 376 / 409"'),
  ...n16('double-flick', [209, 202], [278, 363, 391], 'chain.md §1 "1-6: double-flick 209 / 202, gap 278 / 363 / 391"'),
  ...n16('double-tap-tap', [149, 142], [190, 275, 299], 'chain.md §1 "1-6: double-tap-tap 149 / 142, gap 190 / 275 / 299"'),
  ...n16('bounce', [223, 216], [178, 178, 178], 'chain.md §1 "1-6: bounce 223 / 216, gap 178"'),
  ...n16('bounce-air', [312, 303], [335, 335, 335], 'chain.md §1 "1-6: bounce-air 312 / 303, gap 335"'),
  // 1-4 on Normal (INT-3, 11-13): flown on stage 1-4, `FLIGHT_STAGE=1-4 npx tsx reference/specs/sims/flight.ts normal all`
  // (reference/qa-reports/INT-3/fly14/; chain.md §1 "Rows ... scope Normal 1-4"). Each gap the block column's figure, as 1-2's, 1-3's and
  // 1-5's are; the single hold's any is the flown 244. Easy on 1-4 flies as easy-any (fly14/easy-all.txt)
  ...n14('single-hold', [123, 117], [137, 222, 244], 'chain.md §1 "1-4: single-hold 123 / 117, gap 137 / 222 / 244"'),
  ...n14('single-flick', [123, 116], [127, 212, 239], 'chain.md §1 "1-4: single-flick 123 / 116, gap 127 / 212 / 239"'),
  ...n14('single-tap', [87, 80], [77, 162, 184], 'chain.md §1 "1-4: single-tap 87 / 80, gap 77 / 162 / 184"'),
  ...n14('double-hold', [212, 205], [291, 378, 409], 'chain.md §1 "1-4: double-hold 212 / 205, gap 291 / 378 / 409"'),
  ...n14('double-flick', [210, 203], [278, 365, 395], 'chain.md §1 "1-4: double-flick 210 / 203, gap 278 / 365 / 395"'),
  ...n14('double-tap-tap', [149, 142], [190, 277, 299], 'chain.md §1 "1-4: double-tap-tap 149 / 142, gap 190 / 277 / 299"'),
  ...n14('bounce', [223, 216], [178, 178, 178], 'chain.md §1 "1-4: bounce 223 / 216, gap 178"'),
  ...n14('bounce-air', [314, 305], [335, 335, 335], 'chain.md §1 "1-4: bounce-air 314 / 305, gap 335"'),
  // 1-7 on Normal (INT-9, 11-14, BUILD-17's step 2): flown on stage 1-7 on t-int-9@3ad51f04, `FLIGHT_STAGE=1-7 npx tsx
  // reference/specs/sims/flight.ts normal all` (reference/qa-reports/INT-9/fly/; chain.md §1 "Rows ... scope Normal 1-7").
  // Each gap the block column's figure, as 1-2's to 1-5's are; the single hold's any is the flown 244. Easy flies as easy-any
  ...n17('single-hold', [123, 116], [136, 221, 244], 'chain.md §1 "1-7: single-hold 123 / 116, gap 136 / 221 / 244"'),
  ...n17('single-flick', [123, 115], [127, 211, 238], 'chain.md §1 "1-7: single-flick 123 / 115, gap 127 / 211 / 238"'),
  ...n17('single-tap', [87, 80], [77, 162, 183], 'chain.md §1 "1-7: single-tap 87 / 80, gap 77 / 162 / 183"'),
  ...n17('double-hold', [209, 202], [291, 376, 404], 'chain.md §1 "1-7: double-hold 209 / 202, gap 291 / 376 / 404"'),
  ...n17('double-flick', [208, 201], [272, 358, 391], 'chain.md §1 "1-7: double-flick 208 / 201, gap 272 / 358 / 391"'),
  ...n17('double-tap-tap', [149, 141], [190, 275, 299], 'chain.md §1 "1-7: double-tap-tap 149 / 141, gap 190 / 275 / 299"'),
  ...n17('bounce', [223, 216], [177, 177, 177], 'chain.md §1 "1-7: bounce 223 / 216, gap 177"'),
  ...n17('bounce-air', [312, 302], [334, 334, 334], 'chain.md §1 "1-7: bounce-air 312 / 302, gap 334"'),
  // 1-8 on Normal (BUILD-18c, 11-15): flown on stage 1-8 (`FLIGHT_STAGE=1-8 npx tsx reference/specs/sims/flight.ts normal all`), log
  // reference/qa-reports/BUILD-18c/fly/flight-1-8-normal.txt; its help eases a little past 1-7's (the tap and the doubles 1 px less)
  ...n18('single-hold', [123, 116], [136, 221, 244], 'chain.md §1 "1-8: single-hold 123 / 116, gap 136 / 221 / 244"'),
  ...n18('single-flick', [123, 115], [127, 211, 238], 'chain.md §1 "1-8: single-flick 123 / 115, gap 127 / 211 / 238"'),
  ...n18('single-tap', [87, 79], [77, 162, 183], 'chain.md §1 "1-8: single-tap 87 / 79, gap 77 / 162 / 183"'),
  ...n18('double-hold', [208, 201], [290, 376, 403], 'chain.md §1 "1-8: double-hold 208 / 201, gap 290 / 376 / 403"'),
  ...n18('double-flick', [207, 200], [272, 358, 391], 'chain.md §1 "1-8: double-flick 207 / 200, gap 272 / 358 / 391"'),
  ...n18('double-tap-tap', [148, 141], [189, 274, 299], 'chain.md §1 "1-8: double-tap-tap 148 / 141, gap 189 / 274 / 299"'),
  ...n18('bounce', [223, 215], [177, 177, 177], 'chain.md §1 "1-8: bounce 223 / 215, gap 177 / 177 / 177"'),
  ...n18('bounce-air', [311, 301], [334, 334, 334], 'chain.md §1 "1-8: bounce-air 311 / 301, gap 334 / 334 / 334"'),
  // 1-9 on Normal (BUILD-19, 11-18): `FLIGHT_STAGE=1-9 npx tsx reference/specs/sims/flight.ts normal all` on t-build-19 (reference/qa-reports/BUILD-19/fly/flight-1-9-normal.txt)
  ...n19('single-hold', [123, 115], [136, 220, 244], 'reference/qa-reports/BUILD-19/fly/flight-1-9-normal.txt: single-hold 123 / 115, gap 136 / 220 / 244'),
  ...n19('single-flick', [123, 115], [126, 210, 238], 'reference/qa-reports/BUILD-19/fly/flight-1-9-normal.txt: single-flick 123 / 115, gap 126 / 210 / 238'),
  ...n19('single-tap', [87, 79], [77, 161, 183], 'reference/qa-reports/BUILD-19/fly/flight-1-9-normal.txt: single-tap 87 / 79, gap 77 / 161 / 183'),
  ...n19('double-hold', [208, 200], [290, 376, 403], 'reference/qa-reports/BUILD-19/fly/flight-1-9-normal.txt: double-hold 208 / 200, gap 290 / 376 / 403'),
  ...n19('double-flick', [207, 199], [272, 357, 385], 'reference/qa-reports/BUILD-19/fly/flight-1-9-normal.txt: double-flick 207 / 199, gap 272 / 357 / 385'),
  ...n19('double-tap-tap', [148, 140], [189, 274, 299], 'reference/qa-reports/BUILD-19/fly/flight-1-9-normal.txt: double-tap-tap 148 / 140, gap 189 / 274 / 299'),
  ...n19('bounce', [223, 215], [177, 177, 177], 'reference/qa-reports/BUILD-19/fly/flight-1-9-normal.txt: bounce 223 / 215, gap 177 / 177 / 177'),
  ...n19('bounce-air', [310, 300], [334, 334, 334], 'reference/qa-reports/BUILD-19/fly/flight-1-9-normal.txt: bounce-air 310 / 300, gap 334 / 334 / 334'),
  // 2-1 and 2-2 on Normal (ENG-W2, 11-14): flown on their own stages on World 2's kit (nW2 above). Their help eases a little past 1-7's
  // (the doubles climb 1-2 px less), so each has its own block
  ...n21('single-hold', [123, 115], [135, 220, 244], 'chain.md §1 "2-1: single-hold 123 / 115, gap 135 / 220 / 244"'),
  ...n21('single-flick', [123, 114], [126, 210, 238], 'chain.md §1 "2-1: single-flick 123 / 114, gap 126 / 210 / 238"'),
  ...n21('single-tap', [87, 79], [77, 161, 182], 'chain.md §1 "2-1: single-tap 87 / 79, gap 77 / 161 / 182"'),
  ...n21('double-hold', [206, 198], [290, 375, 403], 'chain.md §1 "2-1: double-hold 206 / 198, gap 290 / 375 / 403"'),
  ...n21('double-flick', [205, 197], [271, 357, 384], 'chain.md §1 "2-1: double-flick 205 / 197, gap 271 / 357 / 384"'),
  ...n21('double-tap-tap', [148, 139], [189, 274, 299], 'chain.md §1 "2-1: double-tap-tap 148 / 139, gap 189 / 274 / 299"'),
  ...n21('bounce', [223, 215], [177, 177, 177], 'chain.md §1 "2-1: bounce 223 / 215, gap 177"'),
  ...n21('bounce-air', [308, 298], [334, 334, 334], 'chain.md §1 "2-1: bounce-air 308 / 298, gap 334"'),
  ...n22('single-hold', [123, 115], [135, 219, 244], 'chain.md §1 "2-2: single-hold 123 / 115, gap 135 / 219 / 244"'),
  ...n22('single-flick', [123, 114], [126, 210, 237], 'chain.md §1 "2-2: single-flick 123 / 114, gap 126 / 210 / 237"'),
  ...n22('single-tap', [87, 78], [77, 161, 182], 'chain.md §1 "2-2: single-tap 87 / 78, gap 77 / 161 / 182"'),
  ...n22('double-hold', [205, 197], [290, 375, 403], 'chain.md §1 "2-2: double-hold 205 / 197, gap 290 / 375 / 403"'),
  ...n22('double-flick', [204, 196], [271, 357, 384], 'chain.md §1 "2-2: double-flick 204 / 196, gap 271 / 357 / 384"'),
  ...n22('double-tap-tap', [148, 139], [189, 274, 299], 'chain.md §1 "2-2: double-tap-tap 148 / 139, gap 189 / 274 / 299"'),
  ...n22('bounce', [223, 214], [177, 177, 177], 'chain.md §1 "2-2: bounce 223 / 214, gap 177"'),
  ...n22('bounce-air', [307, 296], [333, 333, 333], 'chain.md §1 "2-2: bounce-air 307 / 296, gap 333"'),
];

