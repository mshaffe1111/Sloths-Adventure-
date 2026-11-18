// ENG-16I: verdicts.test.ts's "builds as on main" pins for 5-7 and 7-1 (layout 1), computed exactly as the test computes them, on the
// tree it is run from: [platforms+falls+errors+plan, the whole gen2 less verdicts and drops], and which gen2 fields differ from a saved run.
//   npx tsx reference/qa-reports/ENG-16I/mainpins.ts [out.json] [compare.json]
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import '../../../src/game/headlessDom.ts';
import { buildGen2ForGame } from '../../../src/game/gen2/game.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
const h = (x: unknown) => createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
const out: Record<string, { pin: [string, string]; fields: Record<string, string> }> = {};
for (const id of ['5-7', '7-1']) for (const d of ['normal', 'easy'] as const) {
  const st = buildGen2ForGame(generateAllLevels().find((l) => l.id === id)!, d, 1);
  const { verdicts: _v, drops: _d, ...g } = st.gen2 as unknown as Record<string, unknown>;
  out[`${id} ${d}`] = { pin: [h({ platforms: st.platforms, falls: st.gen2.falls, errors: st.gen2.errors, plan: st.gen2.plan }), h(g)], fields: Object.fromEntries(Object.entries(g).map(([k, v]) => [k, h(v)])) };
}
const [save, cmp] = process.argv.slice(2);
if (save) fs.writeFileSync(save, JSON.stringify(out));
const base = cmp ? JSON.parse(fs.readFileSync(cmp, 'utf8')) : null;
for (const [k, v] of Object.entries(out)) console.log(`${k}: [${v.pin.join(', ')}]${base ? `; gen2 fields moved vs ${cmp.split('/').pop()}: ${Object.keys(v.fields).filter((f) => v.fields[f] !== base[k].fields[f]).join(', ') || 'none'}` : ''}`);
