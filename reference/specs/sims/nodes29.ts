/**
 * nodes29 — 2-9's node string (reference/design/2-9.md) through the validator the pipeline runs (gen2/nodeCode.ts parseCode + checkCode,
 * the V-rules of reference/engine/NODES.md §8) with the rules pipeline.ts passes a stage: its teach count, its place in the world (mini 9,
 * V13), World 2's known moves (V3), creatures (the snappers, V16). Prints the string, its token count and its errors (none = valid);
 * also the pitches' sketches, so the record shows why the final string differs. As nodes2425.ts (DESIGN-24-25).
 * Run (from a checkout of origin/main): npx tsx reference/specs/sims/nodes29.ts
 */
import { checkCode, parseCode } from '../../../src/game/gen2/nodeCode.ts';

const CODES: Array<{ id: string; code: string; mini: number; creatures?: boolean }> = [
  { id: '2-9 final', mini: 9, creatures: true, code: 'A Tp1<:#soft Pw1> Pf1> Xs1>:#water R Pp1&>:&turtle*2 Ws1>:#water R Uc^< Cp1&>:#water:&turtle*2 R Pb1^< Sw1> E' },
  { id: '2-9 PITCH-29B', mini: 9, creatures: true, code: 'A Tp1<:#soft Pw1> Pf1> Xs1>:#water R Pp1&>:&turtle*2 Cw1>:#water R Ws1>:#water:t0.36 R Uc^< Pf1&>:&turtle*2 Ss1>:#water E' },
  { id: '2-9 PITCH-29A', mini: 9, creatures: true, code: 'A Tw1&<:#soft:&royal_guard*1 Pg1< Pw1&>:&royal_guard*2 Pf1< Xw2&>:#water:&royal_guard*1 R Pg1< Ws1&>:#water:&royal_guard*1 R Pp1> Cw1&>:#water:&royal_guard*2 R Pb1^< V Sw1&<:#water:&royal_guard*3 E' },
];
let bad = 0;
for (const c of CODES) {
  const tokens = parseCode(c.code);
  const errs = checkCode(tokens, { teaches: tokens.filter((t) => t.job === 'T').length, mini: c.mini, known: ['double', 'bounce', 'climb', 'swing'], creatures: !!c.creatures, later: true });
  if (c.id.endsWith('final')) bad += errs.length;
  console.log(`${c.id}: ${c.code}\n  ${tokens.length} tokens; ${errs.length ? errs.join('; ') : 'checkCode: no errors'}`);
}
process.exitCode = bad ? 1 : 0;
