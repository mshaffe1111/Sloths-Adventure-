// VAR-19c probe: on the LISTED layouts (Play's build), each roost beat's boa within the roost's reach (w1Arc19.test.ts test 3's rule).
// usage: npx tsx roostlist.ts <from> <to>
import '../../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../../src/game/difficulty.ts';
import { W1_LURE } from '../../../../src/game/gen2/worlds/w1.ts';
const [a, z] = [Number(process.argv[2] ?? 1), Number(process.argv[3] ?? 100)];
let bad = 0;
for (const d of ['normal', 'easy'] as const) {
  setDifficulty(d);
  for (let v = a; v <= z; v++) {
    const st: any = new RealPlay('1-9', v).stage;
    for (const q of st.gen2.sections.filter((q: any) => /roost/.test(q.template))) {
      const b = st.enemies.find((e: any) => e.type === 'boa' && e.x >= q.x0 && e.x < q.x1);
      const ok = b && (st.proto.gen2?.roosts ?? []).some((r: any) => Math.abs(r.x - (b.x + b.width / 2)) <= W1_LURE['w1-roost'].reach);
      if (!ok) { bad++; console.log(`L${v} ${d} ${q.template}: boa ${b ? Math.round(b.x) : 'none'} not in a roost's reach`); }
    }
  }
}
console.log(`roost boas out of reach: ${bad} (layouts ${a}-${z}, both settings)`);
