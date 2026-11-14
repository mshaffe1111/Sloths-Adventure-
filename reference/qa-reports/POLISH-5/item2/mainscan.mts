import '/tmp/claude-0/-home-user-Sloths-Adventure-/ab0e8add-8b79-5f4c-b56b-ceb1b28aca6b/scratchpad/wt-main/src/game/headlessDom.ts';
import { RealPlay } from '/tmp/claude-0/-home-user-Sloths-Adventure-/ab0e8add-8b79-5f4c-b56b-ceb1b28aca6b/scratchpad/wt-main/src/game/realPlay.ts';
import { setDifficulty } from '/tmp/claude-0/-home-user-Sloths-Adventure-/ab0e8add-8b79-5f4c-b56b-ceb1b28aca6b/scratchpad/wt-main/src/game/difficulty.ts';
import { loadSeedList } from '/tmp/claude-0/-home-user-Sloths-Adventure-/ab0e8add-8b79-5f4c-b56b-ceb1b28aca6b/scratchpad/wt-main/src/game/gen2/seedList.ts';
import { findW1Pits } from '/tmp/claude-0/-home-user-Sloths-Adventure-/ab0e8add-8b79-5f4c-b56b-ceb1b28aca6b/scratchpad/wt-main/src/game/w1Pits.ts';
import { cutBox, W1_CUT } from '/tmp/claude-0/-home-user-Sloths-Adventure-/ab0e8add-8b79-5f4c-b56b-ceb1b28aca6b/scratchpad/wt-main/src/game/w1CutArt.ts';
const [id, a, b, set] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4]), process.argv[5] ?? 'normal'];
await loadSeedList(id); setDifficulty(set as never); const R = Math.round; let n = 0;
for (let v = a; v <= b; v++) {
  const st: any = new RealPlay(id, v).stage;
  const pits = findW1Pits(st.platforms);
  for (const p of st.platforms.filter((p: any) => p.cut && W1_CUT[p.cut] && W1_CUT[p.cut].kind !== 'log')) {
    const bx = cutBox(p, W1_CUT[p.cut]);
    const foot = st.platforms.filter((q: any) => q !== p && q.type === 'solid' && Math.abs(q.y - (p.y + p.height)) <= 3 && q.x < p.x + p.width && q.x + q.width > p.x);
    for (const q of pits) {
      const over = Math.min(bx.x + bx.w, q.x1) - Math.max(bx.x, q.x0);
      if (over > 4 && p.y + p.height <= q.top + 6) { n++; console.log(`v${v} ${set} ${p.id} ${p.cut} plat x${R(p.x)}..${R(p.x + p.width)} y${R(p.y)} h${p.height} drawn x${R(bx.x)}..${R(bx.x + bx.w)} | foot ${foot.map((f: any) => `${f.id}:${f.style}:x${R(f.x)}..${R(f.x + f.width)}:y${R(f.y)}:h${f.height}`).join(',')} | PIT ${q.kind} ${R(q.x0)}..${R(q.x1)} top ${R(q.top)} | over ${R(over)}`); }
    }
  }
}
console.log(id, set, a, b, 'stones drawn over a pit:', n);
