// INT-10b: 1-4 seed 1's paired-column petals the two-hand climb misses (fieldPetals.test): where he is each frame of the climb, and the
// petal's place and the pickup's reach. Args: seed setting
import '../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import type { Vine } from '../../../src/game/types.ts';
const [seed = '1', setting = 'normal'] = process.argv.slice(2);
setDifficulty(setting as 'normal' | 'easy');
const r = new RealPlay('1-4', Number(seed));
const e = r.e as unknown as { field: { pods: unknown[] } | null; hands: unknown; clusters: Array<{ gone?: boolean }> };
e.field!.pods = [];
// OPEN=1: every fig gate open (each cluster freed), as the walked path has the stage (vineField.ts gatesOpened)
if (process.env.OPEN) for (const c of e.clusters) c.gone = true;
const fv = (r.vines as Vine[]).filter((v) => (v as Vine & { field?: unknown }).field);
const flowers = (r.collectibles as Array<{ type: string; x: number; y: number; collected?: boolean; arc?: boolean }>).filter((c) => c.type === 'flower');
for (const [ax, bx, py] of [[574, 654, 4303], [866, 946, 7300]]) {
  const spans = (v: Vine) => py >= v.topY + 10 && py <= v.bottomY - 10;
  const a = fv.find((v) => Math.round(v.x) === ax && spans(v))!, b = fv.find((v) => Math.round(v.x) === bx && spans(v))!;
  if (!a || !b) { console.log('pair not found', ax, bx); continue; }
  const col = flowers.filter((c) => c.x > a.x && c.x < b.x && c.y >= Math.min(a.topY, b.topY) - 40 && c.y <= Math.max(a.bottomY, b.bottomY));
  console.log(`pair ${ax}/${bx}: a top ${a.topY} bottom ${a.bottomY}; b top ${b.topY} bottom ${b.bottomY}; petals ${col.map((c) => `${c.x},${c.y}${c.arc ? ' arc' : ''}`).join(' ')}`);
  for (const c of col) c.collected = false;
  e.hands = null;
  r.climb(a, a.bottomY - 4);
  let minY = Infinity;
  for (let i = 0; i < 150 && r.p.climbing; i++) { r.frame({ up: true, right: i >= 3 && b.x > a.x, left: i >= 3 && b.x < a.x }); minY = Math.min(minY, r.p.y); }
  console.log(`  climbed: top of his box reached y ${Math.round(minY)} (box ${r.p.width}x${r.p.height}), climbing ${r.p.climbing}, at ${Math.round(r.p.x)},${Math.round(r.p.y)}; missed ${col.filter((c) => !c.collected).map((c) => `${c.x},${c.y}`).join(' ') || 'none'}`);
}
