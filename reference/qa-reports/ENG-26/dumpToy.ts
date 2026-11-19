// ENG-26: the wheel toy's laid stage as JSON for the page stills (stills.mjs); relative imports (D83)
import { writeFileSync } from 'node:fs';
import { fixtureSeed, toyStage, type WheelToy } from '../../../tools/inspect/wheelToys.ts';
const row = (process.argv[2] ?? 'teach') as WheelToy, d = (process.argv[3] ?? 'normal') as 'normal';
const st = toyStage(row, fixtureSeed(row)!, d);
const strip = (p: Record<string, unknown>) => ({ ...p, wheel: p.wheel ? { i: (p.wheel as { i: number }).i, w: (p.wheel as { w: unknown }).w } : undefined });
writeFileSync(process.argv[4], JSON.stringify({ platforms: st.platforms.map((p) => strip(p as never)), rivers: st.rivers ?? [], vines: st.vines, spawnX: st.spawnX, spawnY: st.spawnY, levelWidth: st.config.levelWidth }));
console.log('dumped', row, d, st.platforms.length);
