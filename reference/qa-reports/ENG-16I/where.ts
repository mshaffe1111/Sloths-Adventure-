// ENG-16I: what 1-6 (Normal) builds around an x where a bot was rescued: the section, its platforms and lianas, world px.
//   npx tsx reference/qa-reports/ENG-16I/where.ts <variant> <x> [half-width]
import '../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../src/game/realPlay.ts';
const [v, x, hw = 700] = process.argv.slice(2).map(Number);
const rp = new RealPlay('1-6', v);
const st = rp.stage as unknown as { gen2?: { sections?: Array<{ uid: string; template: string; x0?: number; x1?: number; x?: number; width?: number }> }; proto?: { gen2?: unknown } };
const g = (st.gen2 ?? (st.proto as { gen2?: typeof st.gen2 })?.gen2)!;
const secs = (g.sections ?? []) as Array<Record<string, unknown>>;
console.log('sections keys', Object.keys(secs[0] ?? {}).join(','));
for (const s of secs) { const x0 = Number(s.x0 ?? s.x ?? s.start ?? 0), x1 = Number(s.x1 ?? (Number(s.x ?? 0) + Number(s.width ?? 0))); if (x1 >= x - hw && x0 <= x + hw) console.log('section', s.uid, s.template, x0, x1); }
for (const p of rp.platforms) if (p.x + p.width >= x - hw && p.x <= x + hw) console.log('plat', (p as { tag?: string }).tag ?? '-', 'x', Math.round(p.x), '..', Math.round(p.x + p.width), 'y', Math.round(p.y), 'h', Math.round(p.height), (p as { type?: string }).type ?? '', (p as { creak?: unknown }).creak ? 'CREAK' : '');
for (const l of rp.vines) if (l.x >= x - hw && l.x <= x + hw) console.log('vine', (l as { tag?: string }).tag ?? '-', 'x', Math.round(l.x), 'top', Math.round(l.topY), 'bottom', Math.round(l.bottomY), 'amp', (l as { swingAmp?: number }).swingAmp);
console.log('levelHeight', (rp.stage as { config?: { levelHeight?: number } }).config?.levelHeight, 'easy', !!(rp.e as unknown as { easy?: boolean }).easy);
