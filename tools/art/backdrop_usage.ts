/**
 * backdrop_usage — prints, as JSON, which stages draw each painted backdrop strip set (art catalog part B3, 2026-11-11). Read from the
 * engine's own tables (stageBackdrops.ts FAR_BY_STAGE, w5Backdrop.ts, paintedBackdrops.ts stageUsesCanopy, the 6-8 reveal), not guessed.
 *   npx tsx tools/art/backdrop_usage.ts > usage.json
 */
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { stageBackdropStem } from '../../src/game/stageBackdrops.ts';
import { stageUsesCanopy } from '../../src/game/paintedBackdrops.ts';

const out: Record<string, { stem: string[]; canopy: string[] }> = {};
const add = (k: string, field: 'stem' | 'canopy', id: string) => {
  out[k] ??= { stem: [], canopy: [] };
  if (!out[k][field].includes(id)) out[k][field].push(id);
};
const levels = generateAllLevels();
for (const l of levels) {
  const w = l.worldIndex;
  const own = stageBackdropStem(l.id);
  add(own ?? `w${w}`, 'stem', l.id);
  if (stageUsesCanopy(l)) add(`w${w}c`, 'canopy', l.id);
}
console.log(JSON.stringify({ stages: levels.map((l) => ({ id: l.id, w: l.worldIndex, kind: l.objectiveType })), usage: out }, null, 1));
