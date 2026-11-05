// The render-stone lock (R-stone, 2026-11-05): the floating-stone fix is render-only, so every stage of the game must build exactly as
// before. snapshot.ts's fingerprint (pieces, vines, pickups, flags, hints, trunks, leaves, size and spawn), over ALL 102 stages,
// 16 layouts x 2 settings, the way engine.ts builds them.
//   npx tsx tools/engine/stonelock.ts            compare with tools/engine/stonelock.json (exit 1 on any change, naming the builds)
//   npx tsx tools/engine/stonelock.ts --write    record the current fingerprints
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import { withGoals } from '../../src/game/goals.ts';
const FILE = new URL('./stonelock.json', import.meta.url);
const levels = generateAllLevels();
const out: Record<string, string> = {};
for (const c of levels) {
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= 16; v++) {
    setLayoutVariant(v);
    let key = `${c.id} ${setting} ${v}`;
    try {
      const st: any = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
      const body = JSON.stringify({ p: st.platforms, v: st.vines, c: st.collectibles, f: st.checkpoints, w: st.config.levelWidth, h: st.config.levelHeight, s: [st.spawnX, st.spawnY, st.exitTotemX], t: st.config.targetCount,
        hints: st.proto?.hints, trunks: st.proto?.trunks, leaves: st.proto?.leaves, dress: st.proto?.mixDress, glints: st.proto?.glints, trees: st.trees, decor: st.proto?.decor, gen2: st.proto?.gen2 });
      out[key] = createHash('sha256').update(body).digest('hex').slice(0, 16);
    } catch (e) { out[key] = 'error ' + String((e as Error).message).slice(0, 60); }
    setLayoutVariant(null);
  }
}
if (process.argv.includes('--write')) { fs.writeFileSync(FILE, JSON.stringify(out, null, 1) + '\n'); console.log(`stonelock: wrote ${Object.keys(out).length} fingerprints over ${levels.length} stages`); }
else {
  const was: Record<string, string> = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const keys = [...new Set([...Object.keys(was), ...Object.keys(out)])];
  const changed = keys.filter((k) => was[k] !== out[k]);
  console.log(`stonelock: ${keys.length - changed.length}/${keys.length} identical over ${levels.length} stages`);
  if (changed.length) { console.log('  changed: ' + changed.slice(0, 20).join(', ')); process.exit(1); }
}
