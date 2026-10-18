// Finds the first valid generator attempt for every shipped level and writes src/game/levelSeeds.ts
import { writeFileSync } from 'node:fs';
import { generateAllLevels } from '../src/game/worldsData.ts';
import { findValidAttempt } from '../src/game/stageGenerator.ts';

const out: Record<string, number> = {};
for (const l of generateAllLevels()) {
  const r = findValidAttempt(l);
  if (r.attempt < 0) throw new Error(`${l.id}: no valid layout found: ${r.errors.slice(0, 3).join('; ')}`);
  out[l.id] = r.attempt;
}
const body = Object.entries(out).map(([k, v]) => `  '${k}': ${v},`).join('\n');
writeFileSync(new URL('../src/game/levelSeeds.ts', import.meta.url), `/**
 * Which generator attempt to use per level. Written by scripts/seed-levels.ts after the
 * validator has proven the layout; missing entries are searched for at runtime.
 * Regenerate with: npx tsx scripts/seed-levels.ts
 */
export const LEVEL_ATTEMPTS: Record<string, number> = {
${body}
};
`);
console.log('wrote', Object.keys(out).length, 'seeds;', Object.values(out).filter((v) => v > 0).length, 'need a retry');
