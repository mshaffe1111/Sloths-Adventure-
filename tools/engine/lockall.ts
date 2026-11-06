// The regression lock for every stage of every world (the critic's finding, 11-05: engine-mixer changed 1-2, 1-3, 1-4, 1-6 and 1-9 with
// no lock): each stage built the way the game builds it, on N layouts x both settings, fingerprinted part by part (every list the stage
// and its proto carry, and its size, spawn and goal), so a change names the stage, the build and the part it changed.
//   npx tsx tools/engine/lockall.ts --layouts 16 --out tools/engine/lockall.json     record
//   npx tsx tools/engine/lockall.ts --layouts 16 --check tools/engine/lockall.json   compare (exit 1 on any change not in --intended)
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import { withGoals } from '../../src/game/goals.ts';
const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const N = Number(arg('--layouts') ?? 16);
const only = arg('--stages')?.split(',');
const levels = generateAllLevels().filter((c) => !c.secret && (!only || only.includes(c.id)));
const h = (x: unknown) => createHash('sha256').update(JSON.stringify(x) ?? 'undefined').digest('hex').slice(0, 12);
const out: Record<string, Record<string, string>> = {};
for (const c of levels) {
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= N; v++) {
    setLayoutVariant(v);
    let st: any;
    try { st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal')); }
    catch (e) { out[`${c.id} ${setting} ${v}`] = { error: String((e as Error).message).slice(0, 120) }; setLayoutVariant(null); continue; }
    setLayoutVariant(null);
    const parts: Record<string, string> = { size: h([st.config.levelWidth, st.config.levelHeight, st.config.targetCount, st.spawnX, st.spawnY, st.exitTotemX]) };
    for (const [k, val] of Object.entries(st)) if (k !== 'meta' && k !== 'config' && k !== 'proto') parts[k] = h(val);
    for (const [k, val] of Object.entries(st.proto ?? {})) parts['proto.' + k] = h(val);
    out[`${c.id} ${setting} ${v}`] = parts;
  }
  process.stderr.write(`${c.id} `);
}
const file = arg('--out');
if (file) { fs.writeFileSync(file, JSON.stringify(out) + '\n'); console.log(`\nlock: wrote ${Object.keys(out).length} builds of ${levels.length} stages`); }
const chk = arg('--check');
if (chk) {
  const was: Record<string, Record<string, string>> = JSON.parse(fs.readFileSync(chk, 'utf8'));
  const intended = new Set((arg('--intended') ?? '').split(',').filter(Boolean));
  const byStage: Record<string, Set<string>> = {};
  for (const [k, parts] of Object.entries(out)) {
    const w = was[k]; if (!w) continue;
    const diff = [...new Set([...Object.keys(parts), ...Object.keys(w)])].filter((p) => parts[p] !== w[p]);
    if (diff.length) for (const p of diff) (byStage[k.split(' ')[0]] ??= new Set()).add(p);
  }
  const bad = Object.keys(byStage).filter((s) => !intended.has(s));
  console.log(`\nlock: ${levels.length - Object.keys(byStage).length}/${levels.length} stages unchanged`);
  for (const [s, ps] of Object.entries(byStage)) console.log(`  ${s}${intended.has(s) ? ' (intended)' : ''}: ${[...ps].join(', ')}`);
  if (bad.length) process.exit(1);
}
