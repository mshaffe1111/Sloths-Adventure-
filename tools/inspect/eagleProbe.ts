/**
 * eagleProbe (ENG-WATCH, R-165.267, 11-14): what a cast sweeper (World 1's eagle) really does to a player who does NOT hide, frame by
 * frame, in the REAL engine (realPlay.ts at 30 fps, real damage: safe off). No stage is named in this file: it is handed one.
 *   npx tsx tools/inspect/eagleProbe.ts --stage 1-7 [--seed 1] [--setting normal|easy] [--modes walk,stand,back,approach] [--frames]
 * For each sweeper over the stage it puts him on the ground just outside its stretch (or, for `stand`, in the widest open spot inside it)
 * with full hearts and no shield, and plays:
 *   walk      hold right straight through the stretch, never stopping (Matt 11-14 9:32 PM: "I didn't even really hide")
 *   back      hold left through it from its far end (against the way its eye first crosses)
 *   stand     stand in the open in the middle of the widest bare run, 25 s
 *   approach  (a perched one) walk at its post and stand under it
 *   sneak     hold still in the ground cover nearest before its post (or its stretch's middle) until a pass has gone by, then, the frame
 *             its look ends (its head turned away), walk right on through, never stopping (Matt: "once it moved its head, you could
 *             literally just walk right up to it")
 * and prints each event with its frame number (f = frames since the run began, 30 a second): the screech (its look called), its eye
 * passing within sight of him, the tell, the act, a heart lost, a spared dive, the pass's end; then one line a run: hearts lost.
 */
import path from 'node:path';
import { RealPlay } from '../../src/game/realPlay.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
import { isKitSweeper } from '../../src/game/gen2/stillLay.ts';
import type { Enemy, Platform } from '../../src/game/types.ts';

type Mode = 'walk' | 'back' | 'stand' | 'approach' | 'sneak';
export interface ProbeEvent { f: number; t: number; what: string }
export interface ProbeRun { stage: string; seed: number; setting: string; eagle: number; perched: boolean; stretch: [number, number]; mode: Mode; hits: number; events: ProbeEvent[]; walk: number }

/** the top of the ground he would stand on at x, nearest the eagle's own ground (its kit post) */
function groundAt(platforms: readonly Platform[], x: number, near: number): number | null {
  let best: number | null = null;
  for (const p of platforms) {
    if ((p as { type?: string }).type === 'hazard' || x < p.x + 8 || x > p.x + p.width - 8) continue;
    if (best === null || Math.abs(p.y - near) < Math.abs(best - near)) best = p.y;
  }
  return best;
}

export function probe(stage: string, seed: number, setting: 'normal' | 'easy', mode: Mode, which: number, frames = false): ProbeRun | null {
  setDifficulty(setting);
  try {
    localStorage.removeItem(`sloth_tips_${stage}`);
  } catch {
    /* no storage */
  }
  const sim = new RealPlay(stage, seed);
  const e = sim.e as unknown as { enemies: Enemy[]; proto: { bushes?: Array<{ x: number; w: number; hanging?: boolean }> }; cast: { calmNow(easy: boolean): number } | null; easy: boolean };
  const eagles = e.enemies.filter((q) => isKitSweeper(q)).sort((a, b) => a.patrolMinX - b.patrolMinX);
  const eagle = eagles[which];
  if (!eagle) return null;
  const k = eagle.kit!;
  const kitGround = k.perched ? k.homeY + 300 : k.homeY;
  const [x0, x1] = [eagle.patrolMinX, eagle.patrolMaxX];
  const bushes = (e.proto.bushes ?? []).filter((b) => !b.hanging && b.x + b.w > x0 && b.x < x1).sort((a, b) => a.x - b.x);
  let sx: number;
  if (mode === 'walk') sx = x0 - 120;
  else if (mode === 'back') sx = x1 + 120;
  else if (mode === 'approach') sx = Math.max(x0 + 20, k.homeX - 900);
  else if (mode === 'sneak') {
    const aim = k.perched ? k.homeX : (x0 + x1) / 2;
    const before = bushes.filter((b) => b.x + b.w / 2 < aim);
    const c = before.length ? before[before.length - 1] : bushes[0];
    if (!c) return null;
    sx = c.x + c.w / 2;
  } else {
    const cuts = [x0, ...bushes.flatMap((b) => [b.x, b.x + b.w]), x1];
    let best = -1;
    sx = x0;
    for (let i = 0; i + 1 < cuts.length; i += 2) if (cuts[i + 1] - cuts[i] > best) (best = cuts[i + 1] - cuts[i]), (sx = (cuts[i] + cuts[i + 1]) / 2);
  }
  const gy = groundAt(sim.platforms, sx, kitGround);
  if (gy === null) return null;
  sim.safe = false;
  sim.stand(sx, gy);
  sim.p.invincibleTimer = 0;
  // (as though he had come along the stage at this pace: the kit's clocks are not reset by putting him here, so its cool is long run out)
  const events: ProbeEvent[] = [];
  const say = (f: number, what: string) => events.push({ f, t: Math.round(sim.t * 100) / 100, what });
  let hp = sim.p.hp;
  let was = k.phase;
  let seenNear = false;
  let hits = 0;
  let walkFrom = NaN, walkF = 0;
  const END = 30 * 25;
  // (a walking player hops what blocks him: held against a step or a log for 4 frames on the ground, he presses jump and holds it 8 frames)
  const xs: number[] = [];
  let hop = 0;
  let go = -1;
  for (let f = 0; f < END; f++) {
    const dir = mode === 'walk' || (mode === 'sneak' && go >= 0) ? 1 : mode === 'back' ? -1 : mode === 'approach' && Math.abs(sim.p.x - k.homeX) > 10 ? (sim.p.x < k.homeX ? 1 : -1) : 0;
    xs.push(sim.p.x);
    if (dir && hop <= 0 && sim.p.grounded && xs.length > 4 && Math.abs(sim.p.x - xs[xs.length - 5]) < 3) hop = 8;
    const pad: Record<string, boolean> = dir > 0 ? { right: true } : dir < 0 ? { left: true } : {};
    if (hop > 0) {
      pad.jump = true;
      if (hop === 8) pad.press = true;
      hop--;
    }
    sim.frame(pad as never);
    // (a hit gives him the game's own 1.2 s shield, engine.ts damagePlayer: nothing shortens it here)
    if (sim.died) {
      say(f, 'fell (stage hazard): run ends');
      break;
    }
    if (f === 15) (walkFrom = sim.p.x), (walkF = f);
    const ph = k.phase;
    const near = Math.abs(k.eyeX - sim.p.x) <= 70;
    if (mode === 'sneak' && go < 0 && ph === 'rest' && was !== 'rest') {
      go = f + 1;
      say(f, `its look is over (head away): he walks out of cover at x ${Math.round(sim.p.x)}`);
    }
    if (ph !== was) say(f, `${was}->${ph} (eye ${Math.round(k.eyeX)}, him ${Math.round(sim.p.x)}, passes ${k.passes}${k.free ? ', free' : ''})`);
    if (near && !seenNear && ph === 'hunt') say(f, `eye over him (eye ${Math.round(k.eyeX)}, him ${Math.round(sim.p.x)})`);
    seenNear = near && ph === 'hunt';
    if (sim.p.hp < hp) {
      hits++;
      say(f, `HEART LOST (hp ${sim.p.hp}) at x ${Math.round(sim.p.x)}`);
    }
    if (frames && f % 15 === 0) say(f, `. ${ph} t${k.t.toFixed(2)} eye ${Math.round(k.eyeX)} him ${Math.round(sim.p.x)} cool ${k.cool.toFixed(2)}${k.gl ? ` head ${k.gl.phase}${k.gl.re ? ' (re-check)' : ''} ${k.gl.t.toFixed(2)}/${k.gl.dur.toFixed(2)}` : ''}`);
    hp = sim.p.hp;
    was = ph;
    if (mode === 'sneak' && go >= 0 && k.perched && Math.abs(sim.p.x - k.homeX) < 4) say(f, `under its post (x ${Math.round(k.homeX)}), ${((f - go) / 30).toFixed(2)} s after he left cover, phase ${k.phase}`);
    if (((mode === 'walk' || (mode === 'sneak' && go >= 0)) && sim.p.x > x1 + 400) || (mode === 'back' && sim.p.x < x0 - 400)) {
      say(f, `out of the stretch by 400 px: run ends (him ${Math.round(sim.p.x)})`);
      break;
    }
  }
  const walk = Number.isFinite(walkFrom) && events.length ? Math.abs(sim.p.x - walkFrom) / Math.max(1, (events[events.length - 1].f - walkF) / 30) : 0;
  return { stage, seed, setting, eagle: which, perched: !!k.perched, stretch: [x0, x1], mode, hits, events, walk: Math.round(walk) };
}

const arg = (k: string) => {
  const i = process.argv.indexOf(k);
  return i > 0 ? process.argv[i + 1] : undefined;
};

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const stage = arg('--stage');
  if (!stage) throw new Error('--stage <id>');
  const seed = Number(arg('--seed') ?? 1);
  const setting = (arg('--setting') ?? 'normal') as 'normal' | 'easy';
  const modes = (arg('--modes') ?? 'walk,back,stand').split(',') as Mode[];
  const only = arg('--eagle');
  const frames = process.argv.includes('--frames');
  for (let i = 0; i < 40; i++) {
    if (only !== undefined && Number(only) !== i) continue;
    for (const m of modes) {
      const r = probe(stage, seed, setting, m, i, frames);
      if (!r) {
        if (m === modes[0]) i = 99;
        break;
      }
      if (m === 'approach' && !r.perched) continue;
      console.log(`${stage} seed ${seed} ${setting} eagle#${i}${r.perched ? ' PERCHED' : ''} stretch ${r.stretch[0]}-${r.stretch[1]} (${r.stretch[1] - r.stretch[0]} px) ${m}: hearts lost ${r.hits}${m === 'walk' || m === 'back' ? `, walk ${r.walk} px/s` : ''}`);
      for (const ev of r.events) console.log(`    f${ev.f} t${ev.t} ${ev.what}`);
    }
  }
}
