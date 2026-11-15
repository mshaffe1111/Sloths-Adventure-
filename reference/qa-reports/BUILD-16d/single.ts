// BUILD-16d: does the chain's last perch link on a SINGLE let-go (heldLandings dbl=false) or only with the double? (SEED, SET)
import { RealPlay } from '/home/user/Sloths-Adventure-/src/game/realPlay.ts';
import { setDifficulty } from '/home/user/Sloths-Adventure-/src/game/difficulty.ts';
import { heldLandings } from '/home/user/Sloths-Adventure-/src/game/levelCheck.ts';
for (const set of ['normal', 'easy'] as const) for (let seed = 1; seed <= 6; seed++) {
  setDifficulty(set);
  const st: any = new RealPlay('1-6', seed).stage;
  const sec = st.gen2.sections.find((s: any) => s.template === 'w1-16-chain');
  const tag = (k: string) => `${sec.uid}:${k}`;
  const out: string[] = [];
  for (const [last, perch] of [['cl2', 'cb'], ['dl3', 'db']]) {
    const v = st.vines.find((q: any) => q.tag === tag(last)); const p = st.platforms.find((q: any) => q.tag === tag(perch));
    if (!v || !p) continue;
    const plats = st.platforms.filter((q: any) => Math.abs(q.x - p.x) < 1500);
    const n2 = heldLandings(v, 1, plats, 1e9, true).get(p.id) ?? 0, n1 = heldLandings(v, 1, plats, 1e9, false).get(p.id) ?? 0;
    out.push(`${last}->${perch} dx ${Math.round(p.x - v.x)} amp ${v.swingAmp.toFixed(2)} lines double ${n2} single ${n1}`);
  }
  console.log(set, seed, out.join(' | '));
}
