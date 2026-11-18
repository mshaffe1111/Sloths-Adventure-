// INT-10b: dump the solid pieces around a joined soft-pit floor on a built stage (args: stage seed difficulty x0 x1)
import '../../../src/game/headlessDom.ts';
import { buildStage } from '../../../tools/engine/libstage.ts';
import type { Platform } from '../../../src/game/types.ts';
const [id = '1-6', seed = '1', d = 'normal', a = '27700', b = '28900'] = process.argv.slice(2);
const st = buildStage(id, Number(seed), d as 'normal' | 'easy');
const x0 = Number(a), x1 = Number(b);
for (const p of (st.platforms as Platform[]).filter((p: Platform) => p.x < x1 && p.x + p.width > x0).sort((p: Platform, q: Platform) => p.x - q.x))
  console.log(`${p.type.padEnd(8)} x ${Math.round(p.x)}..${Math.round(p.x + p.width)} (w ${Math.round(p.width)}) y ${Math.round(p.y)} h ${Math.round(p.height)}${p.lift ? ' lift' : ''}${(p as { style?: string }).style ? ' ' + (p as { style?: string }).style : ''}${(p as { crumble?: unknown }).crumble ? ' crumble' : ''}`);
