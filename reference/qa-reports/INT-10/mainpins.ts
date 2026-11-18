// INT-10: 5-7 and 7-1 (verdicts.test.ts MAIN pins) built as the test builds them, each gen2 field hashed, so two heads diff field by field.
// Run from the root of the tree under test: npx tsx reference/qa-reports/INT-10/mainpins.ts out.json
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { buildGen2ForGame } from '../../../src/game/gen2/game.ts';
const h = (x: unknown) => createHash('sha256').update(JSON.stringify(x) ?? 'undefined').digest('hex').slice(0, 16);
const out: Record<string, unknown> = {};
for (const id of ['5-7', '7-1']) for (const d of ['normal', 'easy'] as const) {
  const st: any = buildGen2ForGame(generateAllLevels().find((l) => l.id === id)!, d, 1);
  const { verdicts, drops, ...g } = st.gen2;
  out[`${id} ${d}`] = { pins: [h({ platforms: st.platforms, falls: st.gen2.falls, errors: st.gen2.errors, plan: st.gen2.plan }), h(g)], fields: Object.fromEntries(Object.entries(g).map(([k, v]) => [k, h(v)])), fills: g.fills };
}
fs.writeFileSync(process.argv[2], JSON.stringify(out));
for (const [k, v] of Object.entries(out)) console.log(k, (v as any).pins.join(' '));
