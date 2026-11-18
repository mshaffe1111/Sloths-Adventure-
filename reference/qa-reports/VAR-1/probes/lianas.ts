// VAR-1b probe: real lianas (swinging, not the false one) per section on a layout. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../../src/game/difficulty.ts';
const [id, from, to, d] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4]), process.argv[5] as 'normal' | 'easy'];
setDifficulty(d);
for (let v = from; v <= to; v++) {
  const st: any = new RealPlay(id, v).stage;
  const g = st.gen2 ?? st.proto?.gen2;
  const sec = (x: number) => g.sections.find((s: any) => x >= s.x0 && x < s.x1)?.template ?? '-';
  const c = new Map<string, number>();
  for (const q of st.vines ?? []) if (q.isSwingingVine || q.vineType === 'swing_liana') { const k = sec(q.x) + ((q.swingAmp ?? 1) < 0.05 ? '(still)' : ''); c.set(k, (c.get(k) ?? 0) + 1); }
  console.log(`L${v}`, [...c].map(([k, n]) => `${k.replace('w1-16-', '')}:${n}`).join(' '), 'total', [...c].filter(([k]) => !k.includes('still')).reduce((a, [, n]) => a + n, 0));
}
