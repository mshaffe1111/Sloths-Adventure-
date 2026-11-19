/**
 * nodes3639: PITCH-36A's node strings (3-6, 3-7, 3-8, 3-9, the Cave Slide) through the validator the pipeline runs (gen2/nodeCode.ts
 * parseCode + checkCode, NODES.md §8's V-rules), with each stage's place in World 3 (mini), the moves Worlds 1-2 taught (V3) and
 * creatures where the stage casts them (V16). Same rules as nodes3132.ts (DESIGN-31-32).
 * The Cave Slide is not laid by gen2 (its course is w7Slide.ts's seeded chute), so it is checked as a GRAPH (graph: true: V11/V12/V14's mix
 * rules read a realised gen2 roll, which a slide has none of).
 * Run (from a checkout of origin/main): npx tsx reference/specs/sims/nodes3639.ts   (override one: C36='...' npx tsx ...)
 */
import { checkCode, parseCode } from '../../../src/game/gen2/nodeCode.ts';

const CODES: Array<{ id: string; code: string; mini: number; creatures?: boolean; graph?: boolean }> = [
  { id: '3-6', mini: 6, code: process.env.C36 ?? 'A Tg1+<:#dark:+keepsake Pf1>:#dark Pc1^+<:#dark:+keepsake Xf1>:#dark R Wg1+<:#dark:+keepsake R Pb1> Cf1+>:#dark:+keepsake R Sg1+<:#dark:+keepsake E' },
  { id: '3-7', mini: 7, creatures: true, code: process.env.C37 ?? 'A Tg1+<:+keepsake Pg1+<:+keepsake Pf1> Xg1+>:#spore@puff:+keepsake R Pc1_< Wr1+<:#dark:+keepsake R Hr1+<:+guarana Cm1+&>:&ocelot*2:+keepsake R Sg1+<:+keepsake E' },
  { id: '3-8', mini: 8, code: process.env.C38 ?? 'A Ts1<:#thorn@beat Ps1>:#thorn@beat Pg1< Xs1>:#thorn@beat R Pc1^< Wf1<:#thorn@beat R Pb1> Cf1>:#thorn@beat R Ss1>:#thorn@beat E' },
  { id: '3-9', mini: 9, creatures: true, code: process.env.C39 ?? 'A Pg1<:#dark Pr1&<:#dark:&ocelot*1 Pc1^> Xs1>:#thorn@beat R Pm1&<:&ocelot*2 Wf1>:#dark R Pb1> Cr1&>:#dark:&ocelot*2 R Vg1&<:#dark:&jaguar*1 R Sg1&<:#dark:&jaguar*1 E' },
  { id: 'cave-slide', mini: 7, graph: true, code: process.env.CSL ?? 'A Tw1>:#dark Pw1> Xw1>:#dark R Ww1>:#dark@splash R Pw1> Cw1>:#dark R Sw1_>:#dark E' },
];
let bad = 0;
for (const c of CODES) {
  const tokens = parseCode(c.code);
  const errs = checkCode(tokens, { teaches: tokens.filter((t) => t.job === 'T').length, mini: c.mini, known: ['double', 'bounce', 'climb', 'swing'], creatures: !!c.creatures, later: true, ...(c.graph ? { graph: true } : {}) });
  bad += errs.length;
  console.log(`${c.id}: ${c.code}\n  ${tokens.length} tokens; ${errs.length ? errs.join('; ') : 'checkCode: no errors'}`);
}
process.exitCode = bad ? 1 : 0;
