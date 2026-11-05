// The gen2 regression lock for Worlds 6-8 (gen2-water, 2026-11-05): every gen2 stage of W6, W7 and W8 built on its 16 shipped rolls x
// Normal and Easy, the way the game builds it (stageGenerator.generateStage, then withGoals / easyStage as tools/engine/snapshot.ts
// does), and a fingerprint of everything laid: platforms, vines, pickups, flags, enemies, zones, water, the kit's rooms, size and spawn,
// and gen2's own record (its plan, its sections' spans and its falls: which gaps are deadly water, soft or void).
// Per build it also keeps a part-by-part fingerprint, so a change names WHAT moved (platforms, enemies, ...), not just that it moved.
//   npx tsx tools/engine/gen2snap.ts            compare with tools/engine/gen2snap.json (exit 1 on any change, naming the build and part)
//   npx tsx tools/engine/gen2snap.ts --write    record the current fingerprints
//   npx tsx tools/engine/gen2snap.ts --only 6-7 just these stages (compare only)
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import { withGoals } from '../../src/game/goals.ts';
import { GEN2_STAGES } from '../../src/game/gen2/game.ts';

const FILE = new URL('./gen2snap.json', import.meta.url);
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1].split(',') : null;
const STAGES = Object.keys(GEN2_STAGES).filter((id) => /^[678]-/.test(id) && (!only || only.includes(id))).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
const levels = generateAllLevels();
const h = (o: unknown) => createHash('sha256').update(JSON.stringify(o) ?? 'null').digest('hex').slice(0, 12);
const out: Record<string, Record<string, string>> = {};
for (const id of STAGES) {
  const c = levels.find((l) => l.id === id)!;
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= 16; v++) {
    setLayoutVariant(v);
    const st: any = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
    setLayoutVariant(null);
    const { gen2: extras, ...proto } = st.proto ?? {};
    const meta = st.gen2 ?? null;
    const parts: Record<string, unknown> = {
      platforms: st.platforms, vines: st.vines, ropes: st.ropes, pickups: st.collectibles, flags: st.checkpoints, enemies: st.enemies,
      size: [st.config.levelWidth, st.config.levelHeight, st.spawnX, st.spawnY, st.exitTotemX, st.config.targetCount, st.easyGoal],
      water: [st.waterY, st.zones, st.heartFalls, st.config.waterLevel], kit: st.kit, proto,
      extras: extras ?? null, falls: meta?.falls ?? null, plan: meta?.plan ?? null, sections: meta?.sections ?? null,
    };
    const fp: Record<string, string> = {};
    for (const [k, val] of Object.entries(parts)) fp[k] = h(val);
    fp.all = h(fp);
    out[`${id} ${setting} ${v}`] = fp;
  }
}
if (process.argv.includes('--write')) {
  fs.writeFileSync(FILE, JSON.stringify(out, null, 0).replace(/},"/g, '},\n"') + '\n');
  console.log(`gen2snap: wrote ${Object.keys(out).length} fingerprints (${STAGES.length} stages: ${STAGES.join(' ')})`);
} else {
  const was: Record<string, Record<string, string>> = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const changed = Object.keys(out).filter((k) => was[k]?.all !== out[k].all);
  for (const id of STAGES) {
    const ch = changed.filter((k) => k.startsWith(id + ' '));
    if (!ch.length) continue;
    const parts = new Map<string, number>();
    for (const k of ch) for (const p of Object.keys(out[k])) if (p !== 'all' && was[k]?.[p] !== out[k][p]) parts.set(p, (parts.get(p) ?? 0) + 1);
    console.log(`  ${id}: ${ch.length}/32 changed; parts: ${[...parts].map(([p, n]) => `${p} ${n}`).join(', ')}`);
  }
  console.log(`gen2snap: ${Object.keys(out).length - changed.length}/${Object.keys(out).length} unchanged (${STAGES.length} stages)`);
  if (changed.length) process.exit(1);
}
