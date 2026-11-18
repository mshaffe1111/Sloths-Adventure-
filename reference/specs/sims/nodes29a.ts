/**
 * nodes29a — PITCH-29A's node strings for 2-9, 3-1 and 3-2 (reference/design/pitches/PITCH-29A.md) through the validator the pipeline
 * runs (gen2/nodeCode.ts parseCode + checkCode, the V-rules of reference/engine/NODES.md §8), with each stage's rules: its teach count,
 * its place in the world (mini, V13), the moves taught before it (V3), creatures (V16), later jobs allowed (as nodes2425.ts does).
 * Run (from a checkout of origin/main): npx tsx reference/specs/sims/nodes29a.ts
 */
import { checkCode, parseCode } from '../../../src/game/gen2/nodeCode.ts';

const KNOWN = ['double', 'bounce', 'climb', 'swing'];
const CODES: Array<{ id: string; code: string; mini: number; creatures?: boolean }> = [
  { id: '2-9', mini: 9, creatures: true, code: 'A Tw1&<:#soft:&royal_guard*1 Pg1< Pw1&>:&royal_guard*2 Pf1< Xw2&>:#water:&royal_guard*1 R Pg1< Ws1&>:#water:&royal_guard*1 R Pp1> Cw1&>:#water:&royal_guard*2 R Pb1^< V Sw1&<:#water:&royal_guard*3 E' },
  { id: '3-1', mini: 1, code: 'A Tg1:#dark D_ Pf1<:#dark Xg1>:#dark R Dc1_ Wf1>:#dark@puff R Pb1< Cg1>:#dark@puff R Sg1_<:#dark E' },
  { id: '3-2', mini: 2, creatures: true, code: 'A Tr1<:#soft Pg1> Pr1<:#dark Pc1> Xr1&<:#dark:&ocelot*1 R Pf1< Wm1&>:#dark:&ocelot*1 R Pg1&<:&ocelot*1 Cr1&>:#dark:&ocelot*2 R Sr1&<:#dark:&ocelot*3 E' },
];
let bad = 0;
for (const c of CODES) {
  const tokens = parseCode(c.code);
  const errs = checkCode(tokens, { teaches: tokens.filter((t) => t.job === 'T').length, mini: c.mini, known: KNOWN, creatures: !!c.creatures, later: true });
  bad += errs.length;
  console.log(`${c.id}: ${c.code}\n  ${tokens.length} tokens; ${errs.length ? errs.join('; ') : 'checkCode: no errors'}`);
}
process.exitCode = bad ? 1 : 0;
