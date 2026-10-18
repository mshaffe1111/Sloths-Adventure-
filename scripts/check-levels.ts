import { generateAllLevels } from '../src/game/worldsData.ts';
import { buildStage } from '../src/game/stageGenerator.ts';
import { validateStage } from '../src/game/levelCheck.ts';

const only = process.argv[2];
const levels = generateAllLevels().filter((l) => !only || l.id === only || l.id.startsWith(only + '-'));
const t0 = Date.now();
let bad = 0;
const hist: Record<number, number> = {};
const errCount = new Map<string, number>();
for (const l of levels) {
  let ok = false;
  let attempt = 0;
  let last: ReturnType<typeof validateStage> | null = null;
  let stage = buildStage(l, 0);
  for (attempt = 0; attempt < 14; attempt++) {
    stage = buildStage(l, attempt);
    last = validateStage(stage);
    if (last.ok) { ok = true; break; }
    for (const e of last.errors) {
      const k = e.replace(/[#\d.]+/g, 'N').slice(0, 70);
      errCount.set(k, (errCount.get(k) ?? 0) + 1);
    }
  }
  hist[ok ? attempt : -1] = (hist[ok ? attempt : -1] ?? 0) + 1;
  const m = stage.meta!;
  if (!ok) { bad++; console.log('FAIL', l.id, l.objectiveType, last!.errors.slice(0, 4)); }
  else if (only) console.log(l.id, l.objectiveType, 'attempt', attempt, 'w', m.width, 'plats', last!.stats.platforms, 'swing', last!.stats.swingEdges, 'climb', last!.stats.climbEdges, 'maxGap', last!.stats.maxGapUsed, '\n  ', m.chunks.join(' '));
}
console.log('attempt histogram', hist, 'failures', bad, 'of', levels.length, (Date.now() - t0) + 'ms');
console.log([...errCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12));
