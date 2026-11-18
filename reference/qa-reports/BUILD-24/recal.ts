// BUILD-24b: re-run every committed 1-1 calibration line (calibration-main.jsonl) on this head and count the lines that moved
import '../../../src/game/headlessDom.ts';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { runTier } from '../../../tools/inspect/tierBots.ts';
const f = new URL('../R-165.59/calibration-main.jsonl', import.meta.url);
const lines = fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).filter((l) => l.tier && l.setting);
let same = 0;
const moved: string[] = [];
for (const want of lines) {
  const got = runTier(want.tier, want.setting, want.variant, want.stage);
  try { assert.deepEqual(JSON.parse(JSON.stringify(got)), want); same++; } catch { moved.push(`${want.tier} ${want.setting} v${want.variant}: end ${want.end}->${got.end} t ${want.finishSeconds}->${got.finishSeconds} rescues ${want.rescues}->${got.rescues}`); }
}
console.log(`calibration-main.jsonl: ${same}/${lines.length} lines identical; moved ${moved.length}`);
for (const m of moved) console.log('  ' + m);
