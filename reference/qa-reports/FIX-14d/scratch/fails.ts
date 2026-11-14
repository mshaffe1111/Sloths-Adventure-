import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { listedStage } from '../../src/game/gen2/listed.ts';
import { levelConfig } from '../../src/game/realPlay.ts';
const stage = process.argv[2]; const [a, b] = process.argv[3].split('-').map(Number);
const row = listedStage(stage)!; const cfg = levelConfig(stage); const m = new Map<string, number>(); let ok = 0;
for (let seed = a; seed <= b; seed++) for (const difficulty of ['normal', 'easy'] as const) {
  try { buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty }); ok++; } catch (e) { const k = String(e).replace(/\d+/g, 'N').slice(0, 160); m.set(k, (m.get(k) ?? 0) + 1); }
}
console.log(stage, 'ok', ok); for (const [k, v] of [...m].sort((x, y) => y[1] - x[1])) console.log(v, k);
