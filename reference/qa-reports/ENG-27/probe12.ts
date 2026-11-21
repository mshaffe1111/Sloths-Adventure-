import { homeStage } from '../../../tools/inspect/homeToys.ts';
const st = homeStage(1);
for (const p of st.platforms.filter((q) => q.x + q.width > 11700 && q.x < 12500 && q.y > 1100).sort((a, b) => a.x - b.x)) console.log('plat', p.id, p.type, p.style, Math.round(p.x), Math.round(p.x + p.width), 'y', Math.round(p.y), 'h', Math.round(p.height));
for (const r of st.rivers ?? []) if (r.x1 > 11700 && r.x0 < 12500) console.log('river', JSON.stringify(r));
const s = st as unknown as { heartFalls?: Array<{ x0: number; x1: number; y?: number }>; zones?: Array<{ kind: string; x0: number; x1: number }>; gen2: { drops?: Array<{ x0: number; x1: number; ends: unknown }> } };
console.log('heartFalls', JSON.stringify((s.heartFalls ?? []).filter((h) => h.x1 > 11700 && h.x0 < 12500)));
console.log('drops', JSON.stringify((s.gen2.drops ?? []).filter((h) => h.x1 > 11700 && h.x0 < 12500)));
console.log('checkpoints', JSON.stringify((st.checkpoints ?? []).filter((c) => c.x > 11000 && c.x < 14000)));
