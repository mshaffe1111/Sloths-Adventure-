// VAR-19b probe: a stage's modelled time (gen2.modelled: typical, fast) over its listed layouts, both settings: min and median.
// usage: npx tsx times.ts <stage> <layouts>   Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../../src/game/difficulty.ts';
const [id, n] = [process.argv[2] ?? '1-9', Number(process.argv[3] ?? 100)];
for (const s of ['normal', 'easy'] as const) {
  setDifficulty(s);
  const ty: number[] = [], fa: number[] = [];
  for (let v = 1; v <= n; v++) { const m = (new RealPlay(id, v).stage as any).gen2?.modelled; if (m) { ty.push(m.typical); fa.push(m.fast); } }
  const st = (a: number[]) => { const b = [...a].sort((p, q) => p - q); return `min ${b[0]?.toFixed(0)} s, median ${b[Math.floor(b.length / 2)]?.toFixed(0)} s, under 120 s: ${b.filter((x) => x < 120).length}`; };
  console.log(`${id} ${s} (${ty.length} layouts): typical ${st(ty)}; fast ${st(fa)}`);
}
