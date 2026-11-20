/**
 * nodes3335d — the FINAL node strings of 3-3, 3-4, 3-5 (reference/design/3-3.md, 3-4.md, 3-5.md; DESIGN-33-35) through the validator the
 * pipeline runs (gen2/nodeCode.ts parseCode + checkCode, NODES.md §8's V-rules), with the rules pipeline.ts passes a stage: its teach count,
 * its place in the world (mini), the moves Worlds 1-2 taught (double, bounce, climb, swing count as known, V3) and creatures where the stage
 * has them. The same form as nodes3132.ts (origin/t-design-31-32) and PITCH-33A's nodes3335.ts. Also R-165.319's proof: the roster's own id
 * `thornVine` refused by the creature dial today, and the workaround string accepted.
 * Run (from a checkout of origin/main): npx tsx reference/specs/sims/nodes3335d.ts   (override with C33= / C34= / C35=)
 */
import { checkCode, parseCode } from '../../../src/game/gen2/nodeCode.ts';

const CODES: Array<{ id: string; code: string; mini: number; creatures?: boolean; expectBad?: boolean }> = [
  { id: '3-3', mini: 3, creatures: true, code: process.env.C33 ?? '' },
  { id: '3-4', mini: 4, code: process.env.C34 ?? '' },
  { id: '3-5', mini: 5, creatures: true, code: process.env.C35 ?? '' },
  { id: '3-5 with the roster id (R-165.319)', mini: 5, creatures: true, expectBad: true, code: process.env.C35R ?? '' },
];
let bad = 0;
for (const c of CODES) {
  if (!c.code) continue;
  let errs: string[];
  let n = 0;
  try {
    const tokens = parseCode(c.code);
    n = tokens.length;
    errs = checkCode(tokens, { teaches: tokens.filter((t) => t.job === 'T').length, mini: c.mini, known: ['double', 'bounce', 'climb', 'swing'], creatures: !!c.creatures, later: true });
  } catch (e) {
    errs = [`parseCode refused: ${(e as Error).message}`];
  }
  if (!c.expectBad) bad += errs.length;
  else if (!errs.length) bad++;
  console.log(`${c.id}: ${c.code}\n  ${n} tokens; ${errs.length ? errs.join('; ') : 'checkCode: no errors'}${c.expectBad ? (errs.length ? '  (refused, as R-165.319 says)' : '  (EXPECTED a refusal)') : ''}`);
}
process.exitCode = bad ? 1 : 0;
