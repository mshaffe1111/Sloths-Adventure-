/**
 * nodes2628b — PITCH-26B's node strings for 2-6, 2-7, 2-8 (reference/design/pitches/PITCH-26B.md) through the validator the pipeline runs:
 * gen2/legs.ts legMarks (the /R /L leg marks, R-165.196) then gen2/nodeCode.ts parseCode + checkCode (the V-rules of NODES.md §8), with the
 * rules pipeline.ts passes a stage, as nodes2425.ts does for 2-4/2-5: its teach count, its slot (mini, V13), World 2's known moves (V3).
 * The strings are the pitch's (C26/C27/C28 in the environment try another). Prints each string, its token count and its errors (none = valid).
 * Run (from a checkout of origin/main 6e7b85f8): npx tsx reference/specs/sims/nodes2628b.ts
 */
import { checkCode, parseCode } from '../../../src/game/gen2/nodeCode.ts';
import { legMarks } from '../../../src/game/gen2/legs.ts';

const CODES: Array<{ id: string; code: string; mini: number; creatures?: boolean }> = [
  { id: '2-6', mini: 6, code: process.env.C26 ?? 'A Tp1^:#soft Pg1< Uc1^ Pw1>:#soft Xp1^ R Pf1< Wp1> R Cb1^ R Sp1^< E' },
  { id: '2-7', mini: 7, code: process.env.C27 ?? 'A Pg1> Pw1>:#soft Pf1> Xw1> R /L Tg1<:#soft Pw1> Pb1> Ww1> R Cs1> R Sw1> E' },
  { id: '2-8', mini: 8, code: process.env.C28 ?? 'A Pg1+:+cage Tw1:#soft@flood Pp1+:+cage Xf1+:+cage R /L Kg1>:#water@flood R F[Pf1+|Pw1] Kg1> R Sg1< E' },
];
let bad = 0;
for (const c of CODES) {
  if (!c.code) continue;
  const m = legMarks(c.code);
  const tokens = parseCode(m.code);
  const errs = checkCode(tokens, { teaches: tokens.filter((t) => t.job === 'T').length, mini: c.mini, known: ['double', 'bounce', 'climb', 'swing'], creatures: !!c.creatures, later: true });
  bad += errs.length;
  console.log(`${c.id}: ${c.code}\n  ${tokens.length} tokens, legs ${m.marked ? [...new Set(m.travel.filter(Boolean))].join('/') : 'none'}; ${errs.length ? errs.join('; ') : 'checkCode: no errors'}`);
}
process.exitCode = bad ? 1 : 0;
