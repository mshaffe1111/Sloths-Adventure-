// INT-10: 1-6 on the difficulty meter as w1Arc16.test.ts reads it (score.ts, 1-1 = its ANCHOR score, seeds 1-4): Normal, Easy, Easy/Normal
const root = process.argv[2]; const id = process.argv[3] ?? '1-6';
await import(`${root}/src/game/headlessDom.ts`);
const { scoreStage, ANCHOR } = await import(`${root}/tools/difficulty/score.ts`);
const { setDifficulty } = await import(`${root}/src/game/difficulty.ts`);
const med = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2; };
const raw: Record<string, number[]> = { anchor: [], normal: [], easy: [] };
const parts: Record<string, any[]> = { normal: [], easy: [] };
for (const setting of ['normal', 'easy'] as const) for (const seed of [1, 2, 3, 4]) {
  const seen = new Map<string, number>();
  const a = scoreStage(ANCHOR.id, setting, seed, seen);
  if (setting === ANCHOR.setting) raw.anchor.push(a.raw);
  const s = scoreStage(id, setting, seed, seen);
  raw[setting].push(s.raw); parts[setting].push(s);
}
setDifficulty('normal');
const scale = ANCHOR.score / med(raw.anchor);
const n = med(raw.normal) * scale, e = med(raw.easy) * scale;
console.log(`${id}: Normal ${n.toFixed(2)}, Easy ${e.toFixed(2)}, Easy/Normal ${(e / n).toFixed(2)}`);
const keys = Object.keys(parts.normal[0]).filter((k) => typeof parts.normal[0][k] !== 'object');
console.log('fields:', keys.join(','));
if (process.argv[4]) for (const st of ['normal', 'easy']) console.log(st, JSON.stringify(parts[st][0]).slice(0, 1500));
