/**
 * nodes3639 — the final node strings of 3-6, 3-7, 3-8, 3-9 and World 3's hidden stage (reference/design/3-6.md .. 3-hidden.md, DESIGN-36-39)
 * through the validator the pipeline runs (gen2/nodeCode.ts parseCode + checkCode, NODES.md §8 V-rules), with nodes3132.ts's rules: the teach
 * count from the string, the stage's place in its world (mini; the hidden stage 11, as PITCH-36B ran it), the moves Worlds 1-2 taught and
 * creatures. R-165.319 (the threat id refuses camelCase): the thorn vine is written as the lower-case DIAL `#thornvine@doze`, never `&thornVine`.
 * Run (from a checkout of origin/main): npx tsx reference/specs/sims/nodes3639.ts
 */
import { checkCode, parseCode } from '../../../src/game/gen2/nodeCode.ts';

const CODES: Array<{ id: string; code: string; mini: number; creatures?: boolean }> = [
  { id: '3-6', mini: 6, code: process.env.C36 ?? 'A Tg1+<:#dark:+keepsake Pf1>:#dark:#soft Pc1^+<:#dark:+keepsake Xf1>:#dark R Wg1+<:#dark:+keepsake R Pb1> Cf1+>:#dark:+keepsake R Sg1+<:#dark:+keepsake E' },
  { id: '3-7', mini: 7, creatures: true, code: process.env.C37 ?? 'A Tg1+<:+keepsake Pg1+<:+keepsake Pf1> Xg1+>:#spore@puff:+keepsake R Pc1_< Wr1+<:#dark:+keepsake R Hr1+<:+guarana Cm1+&>:&eyes*2:+keepsake R Sg1+<:+keepsake E' },
  { id: '3-8', mini: 8, code: process.env.C38 ?? 'A Ts1<:#soft:#thornvine@doze Ps1<:#thornvine@doze Pg1< Xs1>:#thornvine@doze R Wf1<:#thornvine@doze R Cr1>:#thornvine@doze Pc1^< Ss1<:#thornvine@doze E' },
  { id: '3-9', mini: 9, creatures: true, code: process.env.C39 ?? 'A Pg1&<:#dark:&ocelot*1 Pr1&<:#dark:&ocelot*2 Xg1&>:#dark:&ocelot*3 R Ws1>:#thornvine@doze R Pm1&<:&ocelot*2 Cc1^&>:#dark:&ocelot*2 R Vg1&<:#dark:&ocelot*2 Sg1&<:#dark:&ocelot*4 E' },
  { id: 'hidden', mini: 11, code: process.env.CH ?? 'A Tw1<:#dark:#water Pf1< Pw1<:#water Xf1>:#dark:#water R Ww1<:#dark:#water R Cr1>:#water Pc1^< Sw1+<:#dark:#water E' },
];
let bad = 0;
for (const c of CODES) {
  const tokens = parseCode(c.code);
  const errs = checkCode(tokens, { teaches: tokens.filter((t) => t.job === 'T').length, mini: c.mini, known: ['double', 'bounce', 'climb', 'swing'], creatures: !!c.creatures, later: true });
  bad += errs.length;
  console.log(`${c.id}: ${c.code}\n  ${tokens.length} tokens; ${errs.length ? errs.join('; ') : 'checkCode: no errors'}`);
}
// R-165.319, shown: the threat id rule refuses the roster's camelCase id
let why = 'accepted';
try {
  parseCode('A Pg1&<:&thornVine*1 E');
} catch (e) {
  why = String((e as Error).message).split(': ').slice(-2).join(': ');
}
console.log(`R-165.319 check: ':&thornVine*1' -> ${why}`);
process.exitCode = bad ? 1 : 0;
