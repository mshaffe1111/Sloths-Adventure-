/** The ids the clip check's seeded saves need (tools/perf/clipcheck.mjs runs this with tsx and reads the JSON it prints). */
import { FINDS } from '../../src/game/finds.ts';
import { BADGES } from '../../src/game/badges.ts';
import { MEMORY_ORDER } from '../../src/game/storyChapters.ts';
import { PREDATOR_ORDER, ROAD_ENTRIES } from '../../src/game/journal.ts';

console.log(JSON.stringify({
  finds: FINDS.map((f) => f.id),
  badges: BADGES.map((b) => b.id),
  memories: [...MEMORY_ORDER],
  creatures: [...PREDATOR_ORDER, ...ROAD_ENTRIES.map((e) => e.id)],
}));
