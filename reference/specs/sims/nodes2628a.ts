/**
 * nodes2628a — PITCH-26A's node strings for 2-6, 2-7, 2-8 (reference/design/pitches/PITCH-26A.md) through the validator the pipeline
 * runs (gen2/nodeCode.ts parseCode + checkCode, NODES.md §8 V-rules), with the rules pipeline.ts passes a stage: its teach count, its
 * place in the world (mini, V13), the moves World 1 taught (double, bounce, climb, swing count as known, V3), creatures (V16) where the
 * world has taught them. Leg marks (/U, /L: gen2/legs.ts legMarks) are checked by legMarks. Prints each string, its token count, its
 * legs and its errors (none = valid).
 * Run (from a checkout of origin/main 6e7b85f8): npx tsx reference/specs/sims/nodes2628a.ts
 */
import { checkCode, parseCode } from '../../../src/game/gen2/nodeCode.ts';
import { legMarks } from '../../../src/game/gen2/legs.ts';

const CODES: Array<{ id: string; code: string; mini: number; creatures?: boolean }> = [
  { id: '2-6', mini: 6, code: process.argv[2] ?? '' },
  { id: '2-7', mini: 7, code: process.argv[3] ?? '' },
  { id: '2-8', mini: 8, code: process.argv[4] ?? '' },
];
let bad = 0;
for (const c of CODES) {
  if (!c.code) continue;
  let legs = '';
  let body = c.code;
  try {
    const m = legMarks(c.code);
    legs = m.travel.map((t) => (t ?? "-")[0]).join("");
    if (m && typeof m === 'object' && 'code' in m && typeof m.code === 'string') body = m.code;
  } catch (e) {
    legs = `legMarks threw: ${(e as Error).message}`;
    bad++;
  }
  const tokens = parseCode(body);
  const errs = checkCode(tokens, { teaches: tokens.filter((t) => t.job === 'T').length, mini: c.mini, known: ['double', 'bounce', 'climb', 'swing'], creatures: !!c.creatures, later: true });
  bad += errs.length;
  console.log(`${c.id}: ${c.code}\n  ${tokens.length} tokens; legs ${legs}\n  ${errs.length ? errs.join('; ') : 'checkCode: no errors'}`);
}
process.exitCode = bad ? 1 : 0;
