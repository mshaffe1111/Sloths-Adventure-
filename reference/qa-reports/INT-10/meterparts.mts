// INT-10: 1-6's meter by challenge kind (score.ts challenges), Normal and Easy, seeds 1-4, scaled as the band test scales
const root = process.argv[2]; const id = process.argv[3] ?? '1-6';
await import(`${root}/src/game/headlessDom.ts`);
const { scoreStage, ANCHOR } = await import(`${root}/tools/difficulty/score.ts`);
for (const setting of ['normal', 'easy'] as const) {
  const by = new Map<string, { n: number; bits: number }>();
  let raw = 0, minutes = 0;
  for (const seed of [1, 2, 3, 4]) {
    const seen = new Map<string, number>();
    scoreStage(ANCHOR.id, setting, seed, seen);
    const s: any = scoreStage(id, setting, seed, seen);
    raw += s.raw / 4; minutes += s.minutes / 4;
    for (const c of s.challenges) { const k = `${c.kind}${c.cost ? ':' + c.cost : ''}`; const e = by.get(k) ?? { n: 0, bits: 0 }; e.n += 0.25; e.bits += (c.bits ?? 0) / 4; by.set(k, e); }
  }
  console.log(`${setting}: raw ${raw.toFixed(2)}, minutes ${minutes.toFixed(2)}; ` + [...by].sort((a, b) => b[1].bits - a[1].bits).map(([k, e]) => `${k} x${e.n.toFixed(1)} ${e.bits.toFixed(1)}b`).join(', '));
}
