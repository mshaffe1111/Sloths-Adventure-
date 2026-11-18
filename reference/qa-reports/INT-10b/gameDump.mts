// INT-10b: the pieces, vines and route near an x on a stage as the GAME builds it (its n-th listed layout). Args: stage layout setting x0 x1
import '../../../src/game/headlessDom.ts';
import { generateStage, setLayoutVariant } from '../../../src/game/stageGenerator.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import type { Platform } from '../../../src/game/types.ts';
const [id = '1-6', v = '23', d = 'normal', a = '32000', b = '33200'] = process.argv.slice(2);
setLayoutVariant(Number(v));
const st = generateStage({ ...generateAllLevels().find((l) => l.id === id)!, unlocked: true }, d as 'normal' | 'easy') as unknown as { platforms: Platform[]; vines?: Array<{ x: number; topY: number; bottomY: number; kind?: string; swing?: unknown }>; gen2?: { sections?: Array<{ template: string; x0: number; x1: number }>; falls?: Array<{ x0: number; x1: number; y: number; kind: string }> } };
setLayoutVariant(null);
const x0 = Number(a), x1 = Number(b);
for (const s of st.gen2?.sections ?? []) if (s.x1 > x0 && s.x0 < x1) console.log(`section ${s.template} ${Math.round(s.x0)}..${Math.round(s.x1)}`);
for (const p of st.platforms.filter((p) => p.x < x1 && p.x + p.width > x0).sort((p, q) => p.x - q.x))
  console.log(`${p.type.padEnd(8)} id ${p.id} x ${Math.round(p.x)}..${Math.round(p.x + p.width)} (w ${Math.round(p.width)}) y ${Math.round(p.y)} h ${Math.round(p.height)}${p.style ? ' ' + p.style : ''}${p.broken ? ' broken' : ''}${p.lift ? ' lift' : ''}`);
for (const vn of (st.vines ?? []).filter((q) => q.x > x0 && q.x < x1)) console.log(`vine x ${Math.round(vn.x)} top ${Math.round(vn.topY)} bottom ${Math.round(vn.bottomY)} ${vn.kind ?? ''}${vn.swing ? ' swing' : ''}`);
for (const f of (st.gen2?.falls ?? []).filter((q) => q.x1 > x0 && q.x0 < x1)) console.log(`fall ${f.kind} ${Math.round(f.x0)}..${Math.round(f.x1)} y ${Math.round(f.y)}`);
