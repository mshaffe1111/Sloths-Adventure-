// BUILD-24c Root B's measure: each bot's longest continuous hold on each 2-4 liana (seconds and swings), per run. The bar (packet item 2):
// the bots' longest liana wait <= 2 swings. Prints one line per run and the worst per liana.
//   npx tsx lianaWait.ts <setting> <seed0-seed1> [tiers: child,middle,expert,kid,adult]
import '../../../src/game/headlessDom.ts';
import { firstTimer, FT_KID, FT_ADULT } from '../../../tools/inspect/firsttimer.ts';
import { BOTS } from '../../../tools/inspect/tierBots.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { vinePeriod } from '../../../src/game/physics.ts';
import { RIVERS_24 } from '../../../src/game/gen2/worlds/w2Arc24.ts';
// (ROWS=noLand24:speed:gap[:logW],...: a candidate row flown in place of the data's, before any stage is built)
for (const c of (process.env.ROWS ?? '').split(',').filter(Boolean)) {
  const [k, sp, gap, logW] = c.split(':');
  Object.assign((RIVERS_24 as any)[k], { speed: +sp, gap: +gap, ...(logW ? { logW: +logW } : {}) });
  console.log('ROW', k, JSON.stringify((RIVERS_24 as any)[k]));
}
const [setting, range, tierList = 'child,middle,expert,kid,adult'] = process.argv.slice(2);
const [a, b] = range.split('-').map(Number);
setDifficulty(setting as never);
const xs = new Map<number, number>();
const worst = new Map<number, { s: number; who: string }>();
for (const tier of tierList.split(',')) {
  const who: any = tier === 'kid' ? { ...FT_KID, setting } : tier === 'adult' ? { ...FT_ADULT, setting } : (BOTS as any)[tier][setting];
  if (!who) continue;
  for (let seed = a; seed <= b; seed++) {
    let cur: number | null = null, since = 0, frame = 0;
    const longest = new Map<number, number>();
    const period = new Map<number, number>();
    const r: any = firstTimer('2-4', seed, who, { cap: 1200, onFrame: (sim: any) => {
      frame++;
      const p = sim.p, id = p.isVineSwinging ? p.swingVineId : null;
      if (id !== cur) {
        if (cur !== null) longest.set(cur, Math.max(longest.get(cur) ?? 0, (frame - since) / 30));
        cur = id; since = frame;
        if (id !== null && !period.has(id)) { const v = sim.vines.find((q: any) => q.id === id); period.set(id, vinePeriod(v)); xs.set(id, Math.round(v.x)); }
      }
    } });
    const top = [...longest.entries()].sort((x, y) => y[1] - x[1]).slice(0, 2);
    for (const [id, s] of longest) { const w = worst.get(id); if (!w || s > w.s) worst.set(id, { s, who: `${tier} s${seed}` }); }
    console.log(`${setting} ${tier} s${seed} end ${r.end} ${Math.round(r.time)} s: longest holds ${top.map(([id, s]) => `vine ${id} ${s.toFixed(1)} s = ${(s / (period.get(id) ?? 2.85)).toFixed(2)} sw`).join(', ')}`);
  }
}
console.log('WORST per vine:', [...worst.entries()].sort((x, y) => y[1].s - x[1].s).slice(0, 6).map(([id, w]) => `vine ${id} x${xs.get(id)} ${w.s.toFixed(1)} s (${w.who})`).join('; '));
