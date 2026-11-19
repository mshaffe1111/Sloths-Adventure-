/**
 * PITCH-33B's node strings (3-3, 3-4, 3-5, the open lens) run through the real validator: gen2/nodeCode.ts checkCode with the stage's
 * slot in its world (mini, V13), the moves earlier worlds taught (V3: double, bounce, climb, swing), and later jobs allowed (K, D).
 * `thornvine`: the threat dial's kind pattern (nodeCode.ts:91, lower case only) refuses the roster's id `thornVine` (PITCH-33B Pushback 1).
 * Prints each string, its token count and its errors (none = valid). Try another string with C33=/C34=/C35= in the environment.
 * Run (from a checkout of origin/main): npx tsx reference/specs/sims/nodes3335b.ts
 */
import { checkCode, parseCode } from '../../../src/game/gen2/nodeCode.ts';
import { legMarks } from '../../../src/game/gen2/legs.ts';

const CODES: Array<{ id: string; code: string; mini: number; creatures?: boolean; trend?: 'up' | 'down' | 'level' }> = [
  { id: '3-3', mini: 3, creatures: true, code: process.env.C33 ?? 'A Tf1&:&ocelot*1!:#spore Pg1&< Xr1&:&ocelot*2! R Pc1^ Wg1&:&ocelot*1z R Cf1&:&ocelot*2! R Sg1&:&ocelot*3! E' },
  { id: '3-4', mini: 4, trend: 'up', code: process.env.C34 ?? 'A Uc1^ Tp1^:#soft Pf1^ R Xp1^ R Pc1^ Wp1^ R Cf1^ R Sp1^ E' },
  { id: '3-5', mini: 5, creatures: true, code: process.env.C35 ?? 'A Tg1&:&thornvine*1z Dc1_ Pg1< R Xr1&:&thornvine*3z R Wm1< R Cc1_&:&thornvine*2z R Sc1_&<:&thornvine*4z E' },
];
let bad = 0;
for (const c of CODES) {
  if (!c.code) continue;
  const m = legMarks(c.code);
  const tokens = parseCode(m.code);
  const errs = checkCode(tokens, {
    teaches: tokens.filter((t) => t.job === 'T').length, mini: c.mini, known: ['double', 'bounce', 'climb', 'swing'],
    creatures: !!c.creatures, later: true, ...(c.trend ? { trend: c.trend } : {}),
  });
  bad += errs.length;
  console.log(`${c.id}: ${c.code}\n  ${tokens.length} tokens; ${errs.length ? errs.join('; ') : 'checkCode: no errors'}`);
}
process.exitCode = bad ? 1 : 0;
