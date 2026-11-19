// BUILD-24c Root B: beat 6's (no-land) log clock against its lianas' swing. For each liana over the river and each candidate row, the
// judge's own flights (physics pressLaunches, riverLay letGoFall/fallOnLog) give G[press][river phase]. Two waits, both clocks running
// together from every pair of moments: ANY (lianaDrops' wait: a press at any moment) and SWEET (only the sweet-spot leaps of the
// forward swing: what the bot and a first-timer who lets go 'on the swing' do). Prints swings of wait (the bar: <= 2).
//   npx tsx rootB.ts <setting> <seed> [speed:gap ...]
import '../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { layRiver, letGoFall, fallOnLog } from '../../../src/game/gen2/riverLay.ts';
import { pressLaunches, vinePeriod } from '../../../src/game/physics.ts';
import { LIANA_RIVER } from '../../../src/game/gen2/riverLay.ts';
import { RIVERS_24 } from '../../../src/game/gen2/worlds/w2Arc24.ts';
const [setting, seed, ...cands] = process.argv.slice(2);
setDifficulty(setting as never);
const easy = setting === 'easy';
const sim: any = new RealPlay('2-4', Number(seed));
const st: any = sim.stage;
const sec = (st.gen2?.sections ?? []).find((s: any) => /no-land/.test(s.template));
const zone = (st.rivers ?? []).find((r: any) => r.x0 >= sec.x0 && r.x1 <= sec.x1);
const vines = (st.vines ?? []).filter((v: any) => v.isSwingingVine && v.x > sec.x0 && v.x < zone.x1);
const row0 = easy ? RIVERS_24.noLand24Easy : RIVERS_24.noLand24;
const FR = 1 / 30;
const rows = [['now', row0], ...cands.map((c) => { const [sp, gap, logW] = c.split(':').map(Number); return [c, { ...row0, speed: sp, gap, ...(logW ? { logW } : {}) }]; })] as Array<[string, any]>;
for (const [name, row] of rows) {
  let id = 1;
  const bankTop = zone.surfaceY - 42;
  const laid = layRiver(row, zone.x0, bankTop, () => id++);
  const logs = laid.logs.map((p: any) => p.drift);
  const d0 = logs[0];
  const spacing = (d0.x1 - d0.x0 + d0.width) / logs.length / d0.speed;
  const out: string[] = [];
  for (const v of vines) {
    const period = vinePeriod(v);
    let anyW = 0, sweetW = 0;
    for (const g of LIANA_RIVER.grips) {
      const L = pressLaunches(v, g);
      const n = L.length, m = Math.max(1, Math.round(spacing / FR));
      const G = new Uint8Array(n * m), S = new Uint8Array(n * m);
      L.forEach((l: any, k) => {
        const f = letGoFall(l, d0);
        for (let j = 0; j < m; j++) {
          const ok = f.far || fallOnLog(f, logs, (j * spacing) / m, easy);
          if (ok) { G[k * m + j] = 1; if (l.call === 'sweet' && l.vx > 0) S[k * m + j] = 1; }
        }
      });
      const worst = (A: Uint8Array) => { let w = 0; const cap = 12 * Math.max(n, m); for (let k0 = 0; k0 < n; k0++) for (let j0 = 0; j0 < m; j0++) { let t = 0; while (t < cap && !A[((k0 + t) % n) * m + ((j0 + t) % m)]) t++; w = Math.max(w, t); } return w * FR; };
      anyW = Math.max(anyW, worst(G)); sweetW = Math.max(sweetW, worst(S));
    }
    out.push(`liana x${Math.round(v.x)} T ${period.toFixed(2)}: any ${(anyW / period).toFixed(2)} sw, sweet ${(sweetW / period).toFixed(2)} sw (${sweetW.toFixed(1)} s)`);
  }
  console.log(`${setting} s${seed} row ${name} (speed ${row.speed}, logW ${row.logW}, gap ${row.gap ?? 'default'}; log clock ${spacing.toFixed(2)} s): ${out.join(' | ')}`);
}
