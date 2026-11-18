/**
 * nodes23 — 2-3's node string (reference/design/2-3.md) through the validator the pipeline runs (gen2/nodeCode.ts parseCode + checkCode,
 * the V-rules of reference/engine/NODES.md §8), with the rules pipeline.ts passes a stage (as nodes2425.ts on t-design-24): its teach
 * count, its place in the world (mini 3), the moves World 1 taught, creatures on (the heron is cast). Prints the string, its token
 * count and its errors (none = valid). Run (from a checkout of origin/main): npx tsx reference/specs/sims/nodes23.ts
 */
import { checkCode, parseCode } from '../../../src/game/gen2/nodeCode.ts';

const code = process.argv[2] ?? 'A Tg1<:&cage Pm1<:&heron R Pw1<:#soft Xm2>:&heron R Pr1< Wp1>:#soft R Lm2>:&heron Sf1< E';
const tokens = parseCode(code);
const errs = checkCode(tokens, { teaches: tokens.filter((t) => t.job === 'T').length, mini: 3, known: ['double', 'bounce', 'climb', 'swing'], creatures: true, later: true });
console.log(`2-3: ${code}\n  ${tokens.length} tokens; ${errs.length ? errs.join('; ') : 'checkCode: no errors'}`);
process.exitCode = errs.length ? 1 : 0;
