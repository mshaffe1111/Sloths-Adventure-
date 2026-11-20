// VAR-19d probe: every notch narrower than Pokey (w1Arc19.test.ts's rule, copied) on a stage's listed layouts in the real engine, both
// settings, with the section it lies in. usage: npx tsx notches.ts <stage> <from> <to>
import '../../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../../src/game/difficulty.ts';
type Built = { platforms: any[] };
const NOTCH_RISE = 40;
function notches(st: Pick<Built, 'platforms'>, pw: number): string[] {
  const solid = st.platforms.filter((p) => !p.broken && p.type !== 'drift' && p.type !== 'moving');
  const out: string[] = [];
  for (const f of solid) {
    // (a wall: a solid whose top is 40 px or more above f's and whose body reaches down to f, standing on it or beside its ends)
    const walls = solid.filter((q) => q !== f && q.y <= f.y - NOTCH_RISE && q.y + q.height >= f.y - 2 && q.x < f.x + f.width + 2 && q.x + q.width > f.x - 2)
      .map((q) => [q.x, q.x + q.width] as const).sort((a, b) => a[0] - b[0]);
    let x = f.x, walledLeft = walls.some(([a, b]) => a <= f.x + 1 && b >= f.x - 2 && b <= f.x + 2) || walls.some(([a, b]) => a < f.x && b > f.x);
    for (const [a, b] of walls) {
      if (b <= x) continue;
      if (a > x) { const w = Math.min(a, f.x + f.width) - x; if (walledLeft && w < pw && a <= f.x + f.width + 2) out.push(`a ${Math.round(w)} px notch at x ${Math.round(x)} on ${f.tag ?? 'a floor'}`); }
      x = Math.max(x, b); walledLeft = true;
    }
  }
  return out;
}
const [stage, a, z] = [process.argv[2], Number(process.argv[3] ?? 1), Number(process.argv[4] ?? 16)];
let n = 0;
for (const d of ['normal', 'easy'] as const) {
  setDifficulty(d);
  for (let v = a; v <= z; v++) {
    const sim: any = new RealPlay(stage, v);
    for (const l of notches(sim.stage, sim.p.width)) {
      n++;
      const x = Number(/at x (\d+)/.exec(l)![1]);
      const q = sim.stage.gen2.sections.find((s: any) => x >= s.x0 - 1 && x < s.x1);
      console.log(`${d} L${v}: ${l} (${q?.template})`);
    }
  }
}
console.log(`notches: ${n} (layouts ${a}-${z}, both settings)`);
