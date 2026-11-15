// the exact computation of a band test (w1Arc16.test.ts: seen = 1-1 then the stage, seeds 1-4), to 3 places: npx tsx tools/difficulty/band.ts 1-6
import { scoreStage, ANCHOR } from './score.ts';
const id = process.argv[2] ?? '1-6';
const med = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2; };
const raw: Record<string, number[]> = { anchor: [], normal: [], easy: [] };
for (const setting of ['normal', 'easy'] as const) for (const seed of [1, 2, 3, 4]) {
  const seen = new Map<string, number>();
  const a = scoreStage(ANCHOR.id, setting, seed, seen);
  if (setting === ANCHOR.setting) raw.anchor.push(a.raw);
  raw[setting].push(scoreStage(id, setting, seed, seen).raw);
}
const scale = ANCHOR.score / med(raw.anchor);
console.log(id, 'Normal', (med(raw.normal) * scale).toFixed(3), raw.normal.map((r) => (r * scale).toFixed(2)).join(' '), '| Easy', (med(raw.easy) * scale).toFixed(3), raw.easy.map((r) => (r * scale).toFixed(2)).join(' '));
