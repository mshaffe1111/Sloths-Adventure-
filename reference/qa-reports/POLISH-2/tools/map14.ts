// POLISH-2 probe: 1-4's sections (by platform tag, y range), gates, clusters, pods, as RealPlay builds it.  npx tsx <this> [stage] [seed] [easy]
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../../src/game/difficulty.ts';
const [stage = '1-4', seed = '1', easy] = process.argv.slice(2);
if (easy) setDifficulty('easy' as never);
const st: any = new RealPlay(stage, +seed).stage;
const tags = new Map<string, { y0: number; y1: number; x0: number; x1: number; n: number }>();
for (const p of st.platforms) { const k = String(p.tag ?? '?'); const t = tags.get(k) ?? { y0: 1e9, y1: -1e9, x0: 1e9, x1: -1e9, n: 0 }; t.y0 = Math.min(t.y0, p.y); t.y1 = Math.max(t.y1, p.y); t.x0 = Math.min(t.x0, p.x); t.x1 = Math.max(t.x1, p.x + p.width); t.n++; tags.set(k, t); }
console.log('W', st.config?.levelWidth, 'H', st.config?.levelHeight, 'spawn', st.spawnX ?? st.playerStart?.x, st.spawnY ?? st.playerStart?.y);
for (const [k, t] of [...tags].sort((a, b) => b[1].y1 - a[1].y1)) console.log('sec', k, 'y', Math.round(t.y0), '..', Math.round(t.y1), 'x', Math.round(t.x0), '..', Math.round(t.x1), 'n', t.n);
for (const g of st.gates ?? []) { const b = st.platforms.find((q: any) => q.id === g.platform); console.log('gate', g.id, 'bough', b && [Math.round(b.x), Math.round(b.y), Math.round(b.width), b.tag, b.art], 'clusters', g.clusters, 'with', g.with, 'ways', g.ways, 'far', g.far); }
for (const c of st.clusters ?? []) console.log('cluster', c.id, 'vine', c.vine, 'y', Math.round(c.y));
for (const p of st.pods ?? []) console.log('pod', p.id, 'x', Math.round(p.x), 'top', Math.round(p.top), 'land', Math.round(p.land));
