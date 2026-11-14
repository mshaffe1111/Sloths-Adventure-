// ENG-S5: lay beat 4's chain rows (w1Swing.ts W1_CHAIN_SECTIONS) on World 1's kit (1-6) and World 6's (6-3), both settings, 4 rolls:
// each liana's anchor spacing, swing, the chain window (pipeline chainRelease) and the walk's link (levelCheck chainLines), the perch.
// npx tsx reference/qa-reports/ENG-S5/lay.ts
import { chainRelease, layLocal, lianaRelease, planBudget, rngFor } from '../../../src/game/gen2/pipeline.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { w1World } from '../../../src/game/gen2/worlds/w1.ts';
import { w6Kit } from '../../../src/game/gen2/worlds/w6.ts';
import { THORN_ROW } from '../../../src/game/gen2/worlds/w1Arc12.ts';
import { W1_CHAIN_SECTIONS, withSwing } from '../../../src/game/gen2/worlds/w1Swing.ts';
const all = generateAllLevels();
const k1 = withSwing(w1World());
const kits = [['1-6', { ...k1, manifest: { ...k1.manifest, hurtFloor: THORN_ROW } }], ['6-3', withSwing(w6Kit(3))]] as const;
for (const [id, kit] of kits) {
  const cfg = { ...all.find((l) => l.id === id)!, unlocked: true };
  for (const d of ['normal', 'easy'] as const) {
    const b = planBudget(cfg, kit.manifest, d);
    for (const t of W1_CHAIN_SECTIONS) {
      const out: string[] = [];
      for (let i = 1; i <= 4; i++) {
        try {
          const L = layLocal(t, b, rngFor(i));
          const ls = L.pieces.filter((q) => q.hang?.kind === 'liana');
          const a = L.pieces.find((q) => q.key === 'a')!, p = L.pieces.find((q) => q.key === 'b')!;
          const parts = [`l1 ${Math.round(ls[0].x - a.x - a.w)} past a`];
          for (let k = 1; k < ls.length; k++) {
            const A = ls[k - 1], B = ls[k];
            const w = chainRelease({ x: A.x, topY: A.y, bottomY: A.y + A.h }, A.hang!.swing!, { x: B.x, topY: B.y, bottomY: B.y + B.h }, B.hang!.swing!, d);
            parts.push(`l${k}->l${k + 1} dx ${Math.round(B.x - A.x)} amps ${A.hang!.swing!.amp.toFixed(2)}/${B.hang!.swing!.amp.toFixed(2)} win ${Math.round(w * 1000)}`);
          }
          const C = ls[ls.length - 1];
          const pw = lianaRelease({ x: C.x, topY: C.y, bottomY: C.y + C.h }, C.hang!.swing!, { x: p.x, y: p.y, w: p.w }, d);
          parts.push(`perch ${Math.round(p.x - C.x)} past l${ls.length} w ${Math.round(p.w)} dy ${Math.round(p.y - a.y)} win ${Math.round(pw * 1000)}; gaps ${JSON.stringify(L.gaps.map((g) => [Math.round(g.x0), Math.round(g.x1), g.hurt ? 'hurt' : g.back ? 'soft-back' : 'pit']))}`);
          out.push(parts.join(' | '));
        } catch (e) { out.push('THROW ' + String(e).slice(0, 200)); }
      }
      console.log(id, d, t.id, '\n  ' + out.join('\n  '));
    }
  }
}
