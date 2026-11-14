import { layLocal, lianaRelease, planBudget, rngFor } from '../../../src/game/gen2/pipeline.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { w1World } from '../../../src/game/gen2/worlds/w1.ts';
import { THORN_ROW } from '../../../src/game/gen2/worlds/w1Arc12.ts';
import { W1_CHAIN_SECTIONS, withSwing } from '../../../src/game/gen2/worlds/w1Swing.ts';
const k1 = withSwing(w1World()); const kit = { ...k1, manifest: { ...k1.manifest, hurtFloor: THORN_ROW } };
const cfg = { ...generateAllLevels().find((l) => l.id === '1-6')!, unlocked: true };
for (const d of ['normal', 'easy'] as const) for (let i = 1; i <= 4; i++) {
  const L = layLocal(W1_CHAIN_SECTIONS[1], planBudget(cfg, kit.manifest, d), rngFor(i));
  const C = L.pieces.filter((q) => q.hang?.kind === 'liana').pop()!, b = L.pieces.find((q) => q.key === 'b')!;
  const w = (g?: 'high' | 'low') => Math.round(1000 * lianaRelease({ x: C.x, topY: C.y, bottomY: C.y + C.h }, { ...C.hang!.swing!, ...(g ? { grip: g } : {}) }, { x: b.x, y: b.y, w: b.w }, d, true));
  console.log(d, i, 'perch', Math.round(b.x - C.x), 'w', Math.round(b.w), 'low holds', w(), 'top', w('high'), 'foot', w('low'));
}
