/**
 * nodes36b — PITCH-36B's node strings (reference/design/pitches/PITCH-36B.md: 3-6, 3-7, 3-8, 3-9 and World 3's hidden stage) through
 * the validator the pipeline runs (gen2/nodeCode.ts parseCode + checkCode, NODES.md §8 V-rules), with nodes2425.ts's rules: the teach
 * count from the string, the stage's place in its world (mini; the hidden stage as 11), the moves taught before World 3 (double, bounce,
 * climb, swing) and creatures (World 3 meets its prowlers by 3-2). Prints each string, its token count and its errors (none = valid).
 * Run (from a checkout of origin/main 6e7b85f8): npx tsx reference/specs/sims/nodes36b.ts
 */
import { checkCode, parseCode } from '../../../src/game/gen2/nodeCode.ts';

const CODES: Array<{ id: string; code: string; mini: number }> = [
  { id: '3-6', mini: 6, code: 'A Tg1+<:#dark Pc1^+<:#dark Pf1+<:#soft Xg1>:#dark R Wc1^+<:#dark R Cf1+>:#dark Pg1< Ss1< E' },
  { id: '3-7', mini: 7, code: 'A Tg1+<:#dark Pf1+< Pm1+&<:&eyes Xg1&>:&eyes:#dark R Wc1^+<:#dark R Cm1+&>:&eyes:#dark Pf1< Sg1+< E' },
  { id: '3-8', mini: 8, code: 'A Ts1<:#soft Ps1<:#thornvine@doze Pg1< Xs1>:#thornvine@doze R Wf1<:#thornvine@doze R Cr1>:#thornvine@doze Pc1^< Ss1< E' },
  { id: '3-9', mini: 9, code: 'A Pg1&<:&prowler*1z:#dark Pr1&<:&prowler*2 Xg1&>:&prowler*3:#dark R Ws1>:#thornvine@doze R Cc1^&>:&prowler*2:#dark Pf1< Sg1&<:&prowler*4 E' },
  { id: 'hidden', mini: 11, code: 'A Tw1<:#water Pw1< Pf1< Xg1>:#water R Ww1<:#water R Cr1>:#water Pc1^< Sw1+< E' },
];
let bad = 0;
for (const c of CODES) {
  const tokens = parseCode(c.code);
  const errs = checkCode(tokens, { teaches: tokens.filter((t) => t.job === 'T').length, mini: c.mini, known: ['double', 'bounce', 'climb', 'swing'], creatures: true, later: true });
  bad += errs.length;
  console.log(`${c.id}: ${c.code}\n  ${tokens.length} tokens; ${errs.length ? errs.join('; ') : 'checkCode: no errors'}`);
}
process.exitCode = bad ? 1 : 0;
