/**
 * nodes3335: PITCH-33A's node strings for 3-3, 3-4, 3-5 (reference/design/pitches/PITCH-33A.md) through the validator the pipeline runs
 * (gen2/nodeCode.ts parseCode + checkCode, NODES.md §8's V-rules), with the rules pipeline.ts passes a stage: its teach count, its place in
 * the world (mini), the moves Worlds 1-2 taught (double, bounce, climb, swing count as known, V3) and creatures where the stage has them.
 * The same form as nodes3132.ts (origin/t-design-31-32). Run (from a checkout of origin/main): npx tsx reference/specs/sims/nodes3335.ts
 * Override a string with C33=... / C34=... / C35=...
 */
import { checkCode, parseCode } from '../../../src/game/gen2/nodeCode.ts';

const CODES: Array<{ id: string; code: string; mini: number; creatures?: boolean }> = [
  { id: '3-3', mini: 3, creatures: true, code: process.env.C33 ?? '' },
  { id: '3-4', mini: 4, code: process.env.C34 ?? '' },
  { id: '3-5', mini: 5, code: process.env.C35 ?? '' },
];
let bad = 0;
for (const c of CODES) {
  if (!c.code) continue;
  const tokens = parseCode(c.code);
  const errs = checkCode(tokens, { teaches: tokens.filter((t) => t.job === 'T').length, mini: c.mini, known: ['double', 'bounce', 'climb', 'swing'], creatures: !!c.creatures, later: true });
  bad += errs.length;
  console.log(`${c.id}: ${c.code}\n  ${tokens.length} tokens; ${errs.length ? errs.join('; ') : 'checkCode: no errors'}`);
}
process.exitCode = bad ? 1 : 0;
