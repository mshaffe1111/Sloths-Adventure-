/**
 * nodes2425 — 2-4's and 2-5's node strings (reference/design/2-4.md, 2-5.md) through the validator the pipeline runs (gen2/nodeCode.ts
 * parseCode + checkCode, the V-rules of reference/engine/NODES.md §8), with the rules pipeline.ts:1082 passes a stage: its teach count,
 * its place in the world (mini, V13), the moves World 1 taught (World 2's lessons: the double and the bounce count as taught, V3) and,
 * for 2-5, creatures (V16). Prints each string, its token count and its errors (none = valid).
 * Run (from a checkout of origin/main 6e7b85f8): npx tsx reference/specs/sims/nodes2425.ts
 */
import { checkCode, parseCode } from '../../../src/game/gen2/nodeCode.ts';

const CODES: Array<{ id: string; code: string; mini: number; creatures?: boolean }> = [
  { id: '2-4', mini: 4, code: 'A Ts1<:#soft Pg1< Ps1>:#soft Xw1> R Pf1< Ws1>:#water R Pb1^< Cw1>:#water R Ss1< E' },
  { id: '2-5', mini: 5, creatures: true, code: 'A Tp1<:#soft Pg1&<:&turtle*1z Pp1> Xw1&>:&turtle R Pr1< Wp1>:#water R Pg1&>:&turtle*3 Cw1&>:#water:&turtle*2 R Sw1< E' },
];
let bad = 0;
for (const c of CODES) {
  const tokens = parseCode(c.code);
  const errs = checkCode(tokens, { teaches: tokens.filter((t) => t.job === 'T').length, mini: c.mini, known: ['double', 'bounce', 'climb', 'swing'], creatures: !!c.creatures, later: true });
  bad += errs.length;
  console.log(`${c.id}: ${c.code}\n  ${tokens.length} tokens; ${errs.length ? errs.join('; ') : 'checkCode: no errors'}`);
}
process.exitCode = bad ? 1 : 0;
