// P13 (the lead, 11-12): a bot run that ends STRANDED short of a purge's goal: is it the bot, or a softlock? From the run's exact end
// state (the same engine, nothing reset), for every animal of the cast still out: (1) can he get onto its ground from where he is
// (a plain held jump, the pad's controls, at each face between, the real engine); (2) once there, can he clear it (walk at it and
// punch, again and again, up to 12 s: a shove dazes it 2 s and a punch at its branch end sends it gliding). He is kept from harm for
// the check (a hit costs time, never the way on, realPlay.ts's rule). Prints one line per animal; "SOFTLOCK" if either fails.
//   npx tsx tools/engine/runs/strand.ts <stage> <seed> <normal|easy> <bot>
import { FirstTimerRun, freshPhone, rng } from '../../inspect/firsttimer.ts';
import { CAST_BOTS } from '../../inspect/castBots.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const [stage, seedS, setting, bot] = process.argv.slice(2);
const seed = Number(seedS), who = CAST_BOTS[bot][setting as 'normal' | 'easy']!;
freshPhone(who.setting);
setDifficulty(who.setting);
Math.random = rng(seed * 104729);
const run: Any = new FirstTimerRun(stage, seed, who, { cap: 1200 });
run.play();
const sim = run.sim, e = run.e, p = sim.p;
console.log(`${stage} seed ${seed} ${setting} ${bot}: ${run.end} at x ${Math.round(p.x)}, goal ${JSON.stringify(run.goalNow())}, ${run.t.toFixed(0)} s`);
e.damagePlayer = () => {};
e.loseLife = () => {};
const frame = (pad: Any, n = 1) => { for (let i = 0; i < n; i++) sim.frame(pad); };
const ground = () => sim.platforms.find((q: Any) => q.id === e.standingOnId);
const full = () => { const g = run.goalNow(); return !!g && g.got >= g.need; };
let soft = 0;
// (the nearest animal still out first, each given time for the walk to it, 20 s + 1 s per 200 px, and 12 s to clear it; until the goal
// is full, as a player goes back for what he passed)
const tried = new Set<number>();
for (;;) {
  if (full()) break;
  const m = e.cast.members.filter((q: Any) => !q.cleared && !tried.has(q.e.id)).sort((a: Any, b: Any) => Math.abs(a.e.x - p.x) - Math.abs(b.e.x - p.x))[0];
  if (!m) break;
  tried.add(m.e.id);
  const s = m.e;
  const under = sim.platforms.filter((q: Any) => !q.broken && q.x <= s.x && q.x + q.width >= s.x && Math.abs(q.y - (s.y + m.foot)) < 8)[0];
  const t0 = sim.t, budget = 20 + Math.abs(s.x - p.x) / 200;
  let on = false;
  while (sim.t - t0 < budget && !m.cleared) {
    const g = ground();
    if (g && g === under && Math.abs(s.x - p.x) < 300) { on = true; break; }
    const dir = s.x > p.x ? 1 : -1;
    const x0 = p.x;
    frame(dir > 0 ? { right: true } : { left: true }, 6);
    // (stopped at a face: a plain jump, held, toward it)
    if (Math.abs(p.x - x0) < 4 && p.grounded) frame(dir > 0 ? { right: true, jump: true, press: true } : { left: true, jump: true, press: true }, 9);
  }
  const t1 = sim.t;
  while (sim.t - t1 < 12 && !m.cleared) {
    const dir = s.x > p.x ? 1 : -1;
    if (Math.abs(s.x - p.x) > 40) frame(dir > 0 ? { right: true } : { left: true }, 3);
    else { frame(dir > 0 ? { right: true } : { left: true }, 1); frame({ punch: true }, 1); frame({}, 8); }
  }
  for (let i = 0; i < 20; i++) frame({}, 1);
  if (!m.cleared) soft++;
  console.log(`  animal ${s.id} at x ${Math.round(s.x)}: reached ${on || m.cleared ? 'yes' : 'NO'} (${(t1 - t0).toFixed(1)} s), cleared ${m.cleared ? `yes, by ${m.s.beatenBy}` : 'NO'}; goal ${JSON.stringify(run.goalNow())}`);
}
for (let i = 0; i < 30; i++) frame({}, 1);
console.log(full() ? `NOT a softlock: from the stranded state the goal fills (${JSON.stringify(run.goalNow())}); ${soft} animal(s) tried and not cleared on the way` : `SOFTLOCK?: the goal does not fill from the stranded state (${JSON.stringify(run.goalNow())}): look at the animals marked NO`);
