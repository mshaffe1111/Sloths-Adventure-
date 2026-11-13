// P13: a bot's run of a stage that names a cast, in the real engine, and its moments for ft-stills.mjs: the first animal in view, the
// first trap mid-fall, the first trap sprung (the moment a trap sends one off), the first punch that sends one off, a section named on the command line (its
// first frame), and the shrine. Each moment carries the run's state (where he is, his hearts, the goal count, what is gone, what fell).
//   npx tsx tools/engine/runs/ft-moments.ts <stage> <seed> <normal|easy> <bot: kid|adult|child|middle|expert> <section id> <out.json>
import fs from 'node:fs';
import { FirstTimerRun, freshPhone, rng } from '../../inspect/firsttimer.ts';
import { CAST_BOTS } from '../../inspect/castBots.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const [stage, seedS, setting, bot, section, out] = process.argv.slice(2);
const seed = Number(seedS), who = CAST_BOTS[bot][setting as 'normal' | 'easy']!;
freshPhone(who.setting);
setDifficulty(who.setting);
Math.random = rng(seed * 104729);
const run: Any = new FirstTimerRun(stage, seed, who, { cap: 1200 });
const e = run.e, secs: Any[] = e.currentStage.gen2?.sections ?? [];
const states: Any[] = [];
const mark = (name: string) => {
  if (states.some((s) => s.name === name)) return;
  const p = run.sim.p;
  states.push({ name, t: +run.t.toFixed(1), x: p.x, y: p.y, facing: p.facing, hp: p.hp, n: p.enemiesDefeated,
    gone: e.enemies.filter((m: Any) => m.defeated || m.kit?.leaving).map((m: Any) => m.id),
    down: (e.cast?.traps ?? []).map((t: Any, i: number) => (t.phase !== 'set' ? i : -1)).filter((i: number) => i >= 0),
    traps: (e.cast?.traps ?? []).map((t: Any) => ({ phase: t.phase, y: t.y, t: t.t })) });
};
const frame = run.sim.frame.bind(run.sim);
run.sim.frame = (pad: Any) => {
  frame(pad);
  const p = run.sim.p;
  // (the first animal as it comes into view, an upright phone's 400 px ahead: its trap still set over it)
  if (e.enemies.some((m: Any) => !m.defeated && Math.abs(m.x - p.x) < 400 && Math.abs(m.y - p.y) < 120)) mark('first-snake');
  // (at the first trap, still set: him by its handle, the load hanging over the animal)
  if ((e.cast?.traps ?? []).some((t: Any) => t.phase === 'set' && Math.abs(t.post.x - p.x) < 90 && Math.abs(t.post.y - p.y) < 30) && !(e.cast?.traps ?? []).some((t: Any) => t.phase !== 'set')) mark('trap-set');
  if ((e.cast?.traps ?? []).some((t: Any) => t.phase === 'falling' && t.y > t.post.loadY + 30)) mark('trap-falling');
  if (e.moments.includes('cast:trap')) mark('first-trap');
  if (e.moments.includes('cast:punch')) mark('first-punch');
  if (secs.find((s: Any) => p.x >= s.x0 && p.x < s.x1)?.template === section && p.grounded) mark(section);
};
run.play();
if (run.end === 'shrine') mark('end');
const order = ['first-snake', 'trap-set', 'trap-falling', 'first-trap', 'first-punch', section, 'end'];
states.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
fs.writeFileSync(out, JSON.stringify(states));
console.log(run.end, run.t.toFixed(1), states.map((s) => `${s.name} ${s.t}s x ${Math.round(s.x)} n ${s.n}`).join('; '));
