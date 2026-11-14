import { layLocal, lianaRelease, planBudget, rngFor } from '../../../src/game/gen2/pipeline.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { w1World } from '../../../src/game/gen2/worlds/w1.ts';
import { w6Kit } from '../../../src/game/gen2/worlds/w6.ts';
import { W1_SWING_SECTIONS, withSwing } from '../../../src/game/gen2/worlds/w1Swing.ts';
const all = generateAllLevels();
for (const [id, kit] of [['1-6', withSwing(w1World())], ['6-3', withSwing(w6Kit(3))]] as const) {
  const cfg = { ...all.find((l) => l.id === id)!, unlocked: true };
  for (const d of ['normal', 'easy'] as const) {
    const b = planBudget(cfg, kit.manifest, d);
    for (const t of W1_SWING_SECTIONS) {
      const out: string[] = [];
      for (let i = 1; i <= 4; i++) {
        try {
          const L = layLocal(t, b, rngFor(i));
          const [a, l, p] = ['a', 'l', 'b'].map((k) => L.pieces.find((q) => q.key === k)!);
          const v = { x: l.x, topY: l.y, bottomY: l.y + l.h }, far = { x: p.x, y: p.y, w: p.w }, sw = l.hang!.swing!;
          const w = (g?: 'low' | 'high') => Math.round(1000 * lianaRelease(v, { amp: sw.amp, period: sw.period, ...(g ? { grip: g } : {}) }, far, d));
          out.push(`gap ${Math.round(p.x - l.x)} dy ${Math.round(p.y - a.y)} len ${Math.round(l.h)} win def/low/high ${w()}/${w('low')}/${w('high')}`);
        } catch (e) { out.push('THROW ' + String(e).slice(0, 140)); }
      }
      console.log(id, d, t.id, '\n  ' + out.join('\n  '));
    }
  }
}
