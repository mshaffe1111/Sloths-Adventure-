// INT-10b: lianas whose own swing carries the hanging hero into a solid bank (the 1-6 s23 child death: let go inside the bank's face,
// fell through it). For each swinging vine after the engine's swingSetup: its foot at the far ends of its swing (x +- L sin amp, y top +
// L cos amp) and his 48 px collider hung under it; any solid 40 px or taller whose box that overlaps is a hit. Args: stages layouts setting
import '../../../src/game/headlessDom.ts';
import { generateStage, setLayoutVariant } from '../../../src/game/stageGenerator.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { swingSetup } from '../../../src/game/physics.ts';
import type { Platform } from '../../../src/game/types.ts';
const [ids = '1-6', n = '40', d = 'normal'] = process.argv.slice(2);
for (const id of ids.split(',')) {
  let hit = 0, total = 0;
  for (let v = 1; v <= Number(n); v++) {
    setLayoutVariant(v);
    const st = generateStage({ ...generateAllLevels().find((l) => l.id === id)!, unlocked: true }, d as 'normal' | 'easy') as unknown as { platforms: Platform[]; vines: Array<{ x: number; topY: number; bottomY: number; vineType?: string; swingAmp?: number }> };
    setLayoutVariant(null);
    const vines = st.vines.map((q) => ({ ...q }));
    swingSetup(vines as Parameters<typeof swingSetup>[0]);
    total++;
    const out: string[] = [];
    for (const q of vines) {
      if (q.vineType === 'tree_climb' || !q.swingAmp) continue;
      const L = q.bottomY - q.topY;
      for (const s of [-1, 1]) {
        const fx = q.x + s * L * Math.sin(q.swingAmp), fy = q.topY + L * Math.cos(q.swingAmp);
        const b = st.platforms.find((p) => p.type === 'solid' && !p.lift && p.height >= 40 && fx + 15 > p.x && fx - 15 < p.x + p.width && fy + 48 > p.y + 4 && fy < p.y + p.height);
        if (b) out.push(`vine ${Math.round(q.x)} foot ${Math.round(fx)},${Math.round(fy)} into the bank ${Math.round(b.x)}..${Math.round(b.x + b.width)} top ${Math.round(b.y)} (${Math.round(fy + 48 - b.y)} px under its top)`);
      }
    }
    if (out.length) { hit++; console.log(`${id} L${v} ${d}: ${out.join(' ; ')}`); }
  }
  console.log(`== ${id} ${d}: ${hit}/${total} layouts with a liana swinging into a bank`);
}
