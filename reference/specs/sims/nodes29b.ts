/**
 * nodes29b: PITCH-29B's node strings for 2-9, 3-1 and 3-2 (reference/design/pitches/PITCH-29B.md) through the validator the pipeline
 * runs (gen2/nodeCode.ts parseCode + checkCode, the V-rules of reference/engine/NODES.md §8), with the rules nodes2425.ts passed 2-4/2-5
 * (origin/t-design-24): the teach count, the stage's place in its world (mini, V13), the moves earlier worlds taught (V3), creatures (V16)
 * where the world has taught them, and later (the later content letters r, p, s, w, k, m are named, laid by their own emitters).
 * Prints each string, its token count and its errors (none = valid); exits 1 on any error.
 * Run (from a checkout of origin/main 6e7b85f8): npx tsx reference/specs/sims/nodes29b.ts
 */
import { checkCode, parseCode } from '../../../src/game/gen2/nodeCode.ts';

const CODES: Array<{ id: string; code: string; mini: number; creatures?: boolean }> = [
  // 2-9 The King's Drum: every World 2 toy on the court's one beat; the snappers (2-5's cast) are the court's guards (gauntlet)
  { id: '2-9', mini: 9, creatures: true, code: 'A Tp1<:#soft Pw1> Pf1> Xs1>:#water R Pp1&>:&turtle*2 Cw1>:#water R Ws1>:#water:t0.36 R Uc^< Pf1&>:&turtle*2 Ss1>:#water E' },
  // 3-1 The Roof Road: hang under the roots and slide down them into the grotto, the lit glowworms showing the way (sprint)
  { id: '3-1', mini: 1, code: 'A Tr1<:#soft Pg1 Pr1_:#soft Xf1> R Pg1<:#dark Cr1_> R Pc1^ Wr1>:#dark R Pf1 Sr1_> E' },
  // 3-2 Don't Stop Where They Glow: stillness wakes the glowworms and the watching eyes see what is lit (stealth)
  { id: '3-2', mini: 2, creatures: true, code: 'A Tm1<:#dark Pr1> Pg1&<:&oilbird*1 Xm1&>:&oilbird*1:#dark R Pr1_ Cg1&>:&oilbird*2:#dark R Wr1&>:&oilbird*2:#dark R Pm1< Sr1&>:&oilbird*3:#dark E' },
];
let bad = 0;
for (const c of CODES) {
  const tokens = parseCode(c.code);
  const errs = checkCode(tokens, { teaches: tokens.filter((t) => t.job === 'T').length, mini: c.mini, known: ['double', 'bounce', 'climb', 'swing'], creatures: !!c.creatures, later: true });
  bad += errs.length;
  console.log(`${c.id}: ${c.code}\n  ${tokens.length} tokens; ${errs.length ? errs.join('; ') : 'checkCode: no errors'}`);
}
process.exitCode = bad ? 1 : 0;
