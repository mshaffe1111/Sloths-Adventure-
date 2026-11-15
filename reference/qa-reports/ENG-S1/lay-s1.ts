import { layLocal, lianaRelease, planBudget, rngFor } from '../../../src/game/gen2/pipeline.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { w1World } from '../../../src/game/gen2/worlds/w1.ts';
import { W1_SWING_SECTIONS, withSwing } from '../../../src/game/gen2/worlds/w1Swing.ts';
const kit = withSwing(w1World());
const cfg = { ...generateAllLevels().find((l) => l.id === '1-6')!, unlocked: true };
for (const d of ['normal', 'easy'] as const) {
  const b = planBudget(cfg, kit.manifest, d);
  for (const t of W1_SWING_SECTIONS) for (let i = 1; i <= 4; i++) {
    const L = layLocal(t, b, rngFor(i));
    const [a, l, p] = ['a', 'l', 'b'].map((k) => L.pieces.find((q) => q.key === k)!);
    const sw = l.hang!.swing!;
    const w = lianaRelease({ x: l.x, topY: l.y, bottomY: l.y + l.h }, sw, { x: p.x, y: p.y, w: p.w }, d);
    console.log(d, t.id, i, 'near', Math.round(p.x - l.x), 'w', p.w, 'far end', Math.round(p.x + p.w - l.x), 'rec', l.hang!.window!.toFixed(3), 'now', w.toFixed(3), 'gap', JSON.stringify(l.hang!.gap?.map((g) => Math.round(g - l.x))));
  }
}
