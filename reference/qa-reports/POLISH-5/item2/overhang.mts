// a stone or stump's DRAWN box past the edge of the ground it stands on (its footing: tops within 3 px of its foot), at a drop
import '/home/user/Sloths-Adventure-/src/game/headlessDom.ts';
import { RealPlay } from '/home/user/Sloths-Adventure-/src/game/realPlay.ts';
import { setDifficulty } from '/home/user/Sloths-Adventure-/src/game/difficulty.ts';
import { loadSeedList } from '/home/user/Sloths-Adventure-/src/game/gen2/seedList.ts';
import { cutBox, W1_CUT, LAID } from '/home/user/Sloths-Adventure-/src/game/w1CutArt.ts';
const [id, a, b, set] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4]), process.argv[5] ?? 'normal'];
await loadSeedList(id); setDifficulty(set as never); const R = Math.round; let n = 0, stones = 0, fixable = 0; const by: Record<string, number> = {};
for (let v = a; v <= b; v++) {
  const st: any = new RealPlay(id, v).stage;
  const S = st.platforms.filter((q: any) => q.type === 'solid' && !q.broken);
  for (const p of S.filter((p: any) => p.cut && W1_CUT[p.cut] && W1_CUT[p.cut].kind !== 'log')) {
    stones++;
    const footY = p.y + p.height;
    const ground = S.filter((q: any) => q !== p && Math.abs(q.y - footY) <= 3);
    const covered = (x: number) => ground.some((q: any) => x >= q.x - 1 && x <= q.x + q.width + 1);
    // the ground run under the stone: extend left/right over joined pieces at the foot's level
    let L0 = p.x, L1 = p.x + p.width;
    while (covered(L0 - 2)) L0 -= 2; while (covered(L1 + 2)) L1 += 2;
    const over = (bx: { x: number; w: number }) => Math.max(0, L0 - bx.x, bx.x + bx.w - L1);
    const o = over(cutBox(p, W1_CUT[p.cut]));
    if (o > 6) {
      n++; by[p.cut] = (by[p.cut] ?? 0) + 1;
      const alt = Object.keys(LAID).filter((k) => W1_CUT[k] && W1_CUT[k].kind === W1_CUT[p.cut].kind && over(cutBox(p, W1_CUT[k])) <= 6);
      if (alt.length) fixable++;
      if (n <= 12 || process.env.ALL) console.log(`v${v} ${set} ${p.id} ${p.cut} x${R(p.x)}..${R(p.x + p.width)} foot run ${R(L0)}..${R(L1)} drawn past it ${R(o)} px; cuts that fit: ${alt.join(',') || 'none'}`);
    }
  }
}
console.log(`${id} ${set} layouts ${a}-${b}: ${stones} stones/stumps, ${n} drawn past their ground's edge (>6 px), ${fixable} of them have a cut of the same kind that fits; by cut ${JSON.stringify(by)}`);
