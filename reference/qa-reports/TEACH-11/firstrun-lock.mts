// TEACH-11 first-run lock proof (1-1's fixed first run, src/game/gen2/firstRun11.ts, ADR-002): build it on a tree, both settings, as
// tools/engine/seedlist.ts firstRunBreaches does; print each part's hash, the whole hash, and the whole hash with every hint's `teach`
// mark taken off the three lines TEACH-11 changed (coach.jump, hint.1-1.gaps, hint.1-1.double). Run from the tree:
//   cd <tree> && npx tsx <this file> <tree>
import { createHash } from 'node:crypto';
const T = process.argv[2];
await import(T + '/src/game/headlessDom.ts');
const { buildGen2Stage } = await import(T + '/src/game/gen2/pipeline.ts');
const { stageParts } = await import(T + '/src/game/gen2/seedList.ts');
const { listedStage } = await import(T + '/src/game/gen2/listed.ts');
const { generateAllLevels } = await import(T + '/src/game/worldsData.ts');
const { FIRST_RUN_11: L } = await import(T + '/src/game/gen2/firstRun11.ts');
const { W1_TIPS } = await import(T + '/src/game/gen2/worlds/w1.ts');
const row = listedStage('1-1');
const cfg = generateAllLevels().find((l: { id: string }) => l.id === '1-1');
const h = (x: unknown) => createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
const three = new Set(['coach.jump', 'hint.1-1.gaps', 'hint.1-1.double'].map((k) => W1_TIPS[k]));
for (const difficulty of ['normal', 'easy'] as const) {
  const st = buildGen2Stage({ config: cfg, kit: row.kit(), seed: L.seed, difficulty, replay: { seed: L.seed, plan: L.plan, rerolls: L.rerolls, foes: L.foes } });
  const parts = stageParts(st);
  const teach = (st.proto?.hints ?? []).filter((q: { teach?: true; text: string }) => q.teach).map((q: { text: string }) => q.text);
  for (const q of st.proto?.hints ?? []) if (three.has(q.text)) delete q.teach;
  const stripped = h(stageParts(st));
  console.log(`${difficulty}: whole ${h(parts)}; with the three lines' teach mark off ${stripped}; teach lines: ${JSON.stringify(teach)}`);
  console.log(`  parts: ${Object.entries(parts).map(([k, v]) => `${k}=${h(v).slice(0, 8)}`).join(' ')}`);
}
