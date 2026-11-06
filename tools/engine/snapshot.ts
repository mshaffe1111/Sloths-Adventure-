// The engine's regression lock: every mixed stage built on 16 rolls x 2 settings, the way the game builds it, and a fingerprint of
// everything the mixer lays (pieces, vines, pickups, flags, hints, trunks, leaves, size and spawn). A refactor of the engine must leave
// every fingerprint unchanged; a change meant to alter a stage must say so and record the new ones.
//   npx tsx tools/engine/snapshot.ts            compare with tools/engine/snapshot.json (exit 1 on any change, naming the build)
//   npx tsx tools/engine/snapshot.ts --write    record the current fingerprints
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import { withGoals } from '../../src/game/goals.ts';
const STAGES = ['1-1', '1-5'];
const FILE = new URL('./snapshot.json', import.meta.url);
const levels = generateAllLevels();
const out: Record<string, string> = {};
for (const id of STAGES) {
  const c = levels.find((l) => l.id === id)!;
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= 16; v++) {
    setLayoutVariant(v);
    const st: any = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
    setLayoutVariant(null);
    const body = JSON.stringify({ p: st.platforms, v: st.vines, c: st.collectibles, f: st.checkpoints, w: st.config.levelWidth, h: st.config.levelHeight, s: [st.spawnX, st.spawnY, st.exitTotemX], t: st.config.targetCount,
      hints: st.proto?.hints, trunks: st.proto?.trunks, leaves: st.proto?.leaves, dress: st.proto?.mixDress, glints: st.proto?.glints });
    out[`${id} ${setting} ${v}`] = createHash('sha256').update(body).digest('hex').slice(0, 16);
  }
}
// (a build depends only on its stage, seed and setting, never on what was built before it: each stage's first roll built again after
// every other stage's last roll must match the fingerprint recorded above)
const orderBad: string[] = [];
for (const id of STAGES) for (const other of STAGES) {
  const fp = (sid: string, v: number) => { const c = levels.find((l) => l.id === sid)!; setLayoutVariant(v); const st: any = withGoals(generateStage({ ...c, unlocked: true }, 'normal')); setLayoutVariant(null);
    return createHash('sha256').update(JSON.stringify({ p: st.platforms, v: st.vines, c: st.collectibles, f: st.checkpoints, w: st.config.levelWidth, h: st.config.levelHeight, s: [st.spawnX, st.spawnY, st.exitTotemX], t: st.config.targetCount,
      hints: st.proto?.hints, trunks: st.proto?.trunks, leaves: st.proto?.leaves, dress: st.proto?.mixDress, glints: st.proto?.glints })).digest('hex').slice(0, 16); };
  fp(other, 16);
  if (fp(id, 1) !== out[`${id} normal 1`]) orderBad.push(`${id} after ${other}`);
}
if (orderBad.length) { console.log(`snapshot: a build depends on the build before it: ${orderBad.join(', ')}`); process.exit(1); }
if (process.argv.includes('--write')) { fs.writeFileSync(FILE, JSON.stringify(out, null, 1) + '\n'); console.log(`snapshot: wrote ${Object.keys(out).length} fingerprints`); }
else {
  const was: Record<string, string> = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const changed = Object.keys(out).filter((k) => was[k] !== out[k]);
  const byStage = (id: string) => changed.filter((k) => k.startsWith(id + ' ')).length;
  console.log(`snapshot: ${Object.keys(out).length - changed.length}/${Object.keys(out).length} unchanged` + STAGES.map((id) => `; ${id} changed ${byStage(id)}`).join(''));
  if (changed.length) { console.log('  changed: ' + changed.slice(0, 12).join(', ')); process.exit(1); }
}
