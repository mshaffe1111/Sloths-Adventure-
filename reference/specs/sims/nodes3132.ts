/**
 * nodes3132 — 3-1's and 3-2's node strings (reference/design/3-1.md, 3-2.md) through the validator the pipeline runs (gen2/nodeCode.ts
 * parseCode + checkCode, NODES.md §8's V-rules), with the rules pipeline.ts passes a stage: its teach count, its place in the world (mini),
 * the moves Worlds 1-2 taught (double, bounce, climb, swing count as known, V3) and, for 3-2, creatures (V16).
 * Run (from a checkout of origin/main): npx tsx reference/specs/sims/nodes3132.ts
 */
import { checkCode, parseCode } from '../../../src/game/gen2/nodeCode.ts';

const CODES: Array<{ id: string; code: string; mini: number; creatures?: boolean }> = [
  { id: '3-1', mini: 1, code: process.env.C31 ?? 'A Tg1:#soft D_ Pf1<:#dark Xg1>:#dark R Dc1_ Wf1>:#dark@puff R Pb1< Cg1>:#dark@puff R Sg1_<:#dark E' },
  { id: '3-2', mini: 2, creatures: true, code: process.env.C32 ?? 'A Tr1<:#soft Pg1> Pr1<:#dark Pc1> Xr1&<:#dark:&ocelot*1 R Pf1< Wm1&>:#dark:&ocelot*1 R Pg1&<:&ocelot*1 Cr1&>:#dark:&ocelot*2 R Sr1&<:#dark:&ocelot*3 E' },
];
let bad = 0;
for (const c of CODES) {
  const tokens = parseCode(c.code);
  const errs = checkCode(tokens, { teaches: tokens.filter((t) => t.job === 'T').length, mini: c.mini, known: ['double', 'bounce', 'climb', 'swing'], creatures: !!c.creatures, later: true });
  bad += errs.length;
  console.log(`${c.id}: ${c.code}\n  ${tokens.length} tokens; ${errs.length ? errs.join('; ') : 'checkCode: no errors'}`);
}
process.exitCode = bad ? 1 : 0;
