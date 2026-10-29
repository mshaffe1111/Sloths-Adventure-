/**
 * The reach model (physics.ts, levelCheck.ts) against the real engine at its locked 30 fps: what the stage checks assume Pokey can do,
 * measured by playing the engine itself (realPlay.ts) in a bare world. Each number the checks lean on is checked to be no more than
 * the engine gives. Also the fixes that came out of the World 4 audit (2026-10-25), each tested in the engine.
 */
import { RealPlay } from './realPlay.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { DOUBLE_RISE, reachGlide, reachJump, setTimedSwing, swingClockAt, TIMED } from './physics.ts';
import { buildProtoStage, HAND_STAGES, PIT_CLIMB, PIT_ESCAPE } from './protoStage.ts';
import { buildW2Stage, W2_STAGES } from './w2Stages.ts';
import { levelConfig } from './realPlay.ts';
import { validateStage } from './levelCheck.ts';
import { PAST_SHRINE, SHRINE_STOP } from './rules.ts';
import { learnedSkills } from './skills.ts';
import type { Platform, Vine } from './types.ts';

const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
const G = 2000;
const ground = (x: number, w: number, y = G, h = 300): Platform => ({ id: 1, x, y, width: w, height: h, type: 'solid' });

/** a bare world with the leaf, one ledge ending at x = 1000 */
function bareSim(withGlide = true) {
  const sim = new RealPlay('4-2', 1);
  sim.bare([ground(0, 1000)]);
  if (withGlide) sim.e.skills.add('glide');
  else sim.e.skills.delete('glide');
  return sim;
}

/** run at the ledge's end and jump there (the second jump `dbl` frames after leaving it); his path from the take-off */
function flight(sim: RealPlay, dbl?: number) {
  sim.stand(900, G);
  const path: Array<{ x: number; y: number; vy: number }> = [];
  let took = -1;
  for (let f = 0; f < 200; f++) {
    const air = took >= 0 ? f - took : -1;
    const press = (took < 0 && sim.p.x >= 975) || (dbl !== undefined && air === dbl);
    const jump = !(dbl !== undefined && air === dbl - 1);
    sim.frame({ right: true, jump: jump || press, press });
    if (took < 0 && !sim.p.grounded) {
      took = f;
      path.push({ x: sim.p.x - sim.p.vx / 30, y: G, vy: 0 });
    }
    if (took >= 0) path.push({ x: sim.p.x, y: sim.p.y, vy: sim.p.vy });
  }
  return path;
}
/** how far across he comes down through a surface dy above the take-off (as physics.ts flightReach measures it) */
function across(path: Array<{ x: number; y: number; vy: number }>, dy: number) {
  const target = G - dy;
  for (let i = 1; i < path.length; i++) if (path[i].vy >= 0 && path[i - 1].y <= target + 14 && path[i].y >= target) return path[i].x - path[0].x;
  return -1;
}

test('the engine at 30 fps carries a jump, a double jump and a glide at least as far as the reach model says', () => {
  const plain = bareSim(false);
  const leaf = bareSim(true);
  const dbls = Array.from({ length: 36 }, (_, i) => i + 1);
  const best = (sim: RealPlay, dy: number, two: boolean) => Math.max(...(two ? dbls : [undefined]).map((d) => across(flight(sim, d), dy)));
  for (const dy of [100, 60, 0, -100, -300, -700]) {
    const single = best(plain, dy, false), double = best(plain, dy, true), glide = best(leaf, dy, true);
    assert.ok(reachJump(dy, false) <= single + 2, `${dy}: a jump goes ${single}, the model says ${reachJump(dy, false)}`);
    assert.ok(reachJump(dy, true) <= double + 2, `${dy}: a double jump goes ${double}, the model says ${reachJump(dy, true)}`);
    assert.ok(reachGlide(dy, true) <= glide + 2, `${dy}: a glide goes ${glide}, the model says ${reachGlide(dy, true)}`);
  }
});

test('the highest he gets: a jump lifts his feet 97 px and a double jump about 170 at 30 fps (less than the formulas JUMP_RISE and DOUBLE_RISE)', () => {
  const sim = bareSim(false);
  const rise = (d?: number) => G - Math.min(...flight(sim, d).map((q) => q.y));
  assert.ok(Math.abs(rise() - 97.8) < 2, `${rise()}`);
  const dbl = Math.max(...Array.from({ length: 25 }, (_, i) => rise(i + 1)));
  // (the second jump adds to what the first still had, physics.ts secondJumpV: about 170 whenever it is taken, under DOUBLE_RISE)
  assert.ok(dbl > 160 && dbl < 175 && dbl < DOUBLE_RISE, `${dbl}`);
});

/** the tallest wall he climbs from a standstill beside it, with or without the second jump */
function wallClimb(two: boolean) {
  const sim = bareSim(false);
  let best = 0;
  for (let H = 100; H <= 220; H += 2) {
    sim.bare([ground(0, 2000), { id: 2, x: 1000, y: G - H, width: 300, height: H + 300, type: 'solid' }]);
    let ok = false;
    for (const d of two ? [5, 7, 9, 10, 11, 12, 14] : [-1]) {
      sim.stand(970, G);
      let took = -1;
      for (let f = 0; f < 80 && !ok; f++) {
        const air = took >= 0 ? f - took : -1;
        const press = f === 0 || (d >= 0 && air === d);
        sim.frame({ right: true, jump: !(d >= 0 && air === d - 1) || press, press });
        if (took < 0 && !sim.p.grounded) took = f;
        ok = sim.p.grounded && sim.standingOn === 2;
      }
      if (ok) break;
    }
    if (ok) best = H;
  }
  return best;
}

test('a soft pit is never deeper than he can climb out of: the engine climbs a 190 px wall with the second jump, 122 with one', () => {
  const two = wallClimb(true), one = wallClimb(false);
  assert.ok(two >= PIT_ESCAPE + 15, `a double jump climbs ${two}`);
  assert.ok(one >= PIT_CLIMB + 15, `a jump climbs ${one}`);
});

test('a liana is caught as close as the timed swing says: 60 px on Normal, 76 on Easy (it was a fixed 48 in the engine)', () => {
  const sim = bareSim(false);
  const liana: Vine = { id: 7, x: 1000, topY: G - 500, bottomY: G - 100, swaySpeed: 1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true };
  sim.bare([ground(0, 600)], [liana]);
  const caught = (dx: number) => {
    // flying past it at its middle height, moving sideways (as a jump would carry him)
    sim.fly(liana.x - dx, G - 300, 0, 0);
    sim.p.vx = 60;
    // (the vines swing on their own clock, physics.ts the self-swing: this one hangs straight down on the frame he passes it)
    sim.vineClock = swingClockAt(liana, 0, 1) - 1 / 30;
    sim.frame({});
    return !!sim.p.isVineSwinging;
  };
  try {
    setTimedSwing(false);
    assert.equal(TIMED.grabX, 60);
    assert.ok(caught(56), 'Normal: 56 px away is caught');
    assert.ok(!caught(64), 'Normal: 64 px away is not');
    setTimedSwing(true);
    assert.ok(caught(72), 'Easy: 72 px away is caught');
  } finally {
    setTimedSwing(false);
  }
});

test('the leaf is his from 4-2 on, even when no stage was cleared on this device (the tester\'s switch opens stages without clearing them)', () => {
  assert.ok(!learnedSkills('4-1').has('glide'));
  for (const id of ['4-2', '4-3', '4-4', '4-5', '4-6', '4-7', '4-8']) assert.ok(learnedSkills(id).has('glide'), id);
  assert.ok(new RealPlay('4-2', 1).e.skills.has('glide'), 'the engine in 4-2 has the leaf');
});

test('the engine stops him at the shrine, so nothing in a hand-built stage lies past it (one flower did, in every one)', () => {
  // the engine's stop, in the engine
  const sim = new RealPlay('4-5', 1);
  const exitX = sim.stage.exitTotemX;
  const floor = sim.platforms.find((q) => exitX >= q.x && exitX <= q.x + q.width && Math.abs(q.y - sim.stage.exitTotemY) < 8)!;
  sim.e.currentStage.config = { ...sim.e.currentStage.config, targetCount: 99, objectiveType: 'harvest' }; // (a sealed door, so he stays)
  sim.stand(exitX - 400, floor.y);
  for (let f = 0; f < 120; f++) sim.frame({ right: true });
  assert.ok(sim.p.x <= exitX + SHRINE_STOP + 0.5, `${sim.p.x}`);
  // and every hand-built stage that is not a climb, every roll
  for (const [id, plan] of [...Object.entries(HAND_STAGES), ...Object.entries(W2_STAGES)]) {
    for (const s of SEEDS) {
      const st = id.startsWith('2-') ? buildW2Stage(levelConfig(id), s, plan as never) : buildProtoStage(levelConfig(id), s, plan as never);
      if (st.config.objectiveType === 'ascent' || !(st.exitTotemX > 0)) continue;
      const past = st.collectibles.filter((c) => c.type !== 'exit_totem' && c.x > st.exitTotemX + PAST_SHRINE);
      assert.equal(past.length, 0, `${id} seed ${s}: ${past.map((c) => `${c.type} at ${Math.round(c.x)}`).join(', ')} past the shrine at ${Math.round(st.exitTotemX)}`);
    }
  }
  // the level check says so when one is
  const st = buildProtoStage(levelConfig('4-5'), 1, '4-5');
  st.collectibles.push({ id: 9999, type: 'flower', x: st.exitTotemX + 180, y: st.exitTotemY - 34, collected: false, bobPhase: 0 });
  assert.ok(validateStage(st).errors.some((e) => /past the shrine/.test(e)));
});

/**
 * Pits a fall can strand him in: a stretch of floor with a wall on each side (solid blocks at least 50 tall, which he cannot walk
 * through) whose lower side is deeper than the engine climbs with a second jump, and nothing in it to climb or bounce on.
 */
function strandingPits(st: ReturnType<typeof buildProtoStage>): string[] {
  const out: string[] = [];
  const walls = st.platforms.filter((w) => !w.broken && w.type === 'solid' && w.height >= 50);
  for (const fl of st.platforms) {
    if (fl.broken || fl.type !== 'solid') continue;
    // the walls standing on (or through) this floor, his body's half width each side
    const ws = walls.filter((w) => w !== fl && w.y < fl.y - 6 && w.y + w.height >= fl.y && w.x < fl.x + fl.width && w.x + w.width > fl.x).sort((a, b) => a.x - b.x);
    for (let i = 0; i + 1 < ws.length; i++) {
      const a = ws[i], b = ws[i + 1];
      const x0 = a.x + a.width, x1 = b.x;
      if (x1 - x0 < 24) continue;
      const deep = fl.y - Math.max(a.y, b.y);
      if (deep <= PIT_ESCAPE + 15) continue;
      // something to get out by: a raised floor in the gap (a climb onto it, and from it out), a trunk, a liana, a rope
      const raised = st.platforms.some((q) => q !== fl && q !== a && q !== b && q.y < fl.y && fl.y - q.y <= PIT_ESCAPE && q.y - Math.max(a.y, b.y) <= PIT_ESCAPE && q.x < x1 && q.x + q.width > x0);
      const climb = st.vines.some((v) => v.x > x0 - 30 && v.x < x1 + 30 && v.bottomY > fl.y - 200);
      const rope = (st.ropes ?? []).some((r) => r.x0 < x1 && r.x1 > x0);
      if (!raised && !climb && !rope) out.push(`a ${Math.round(x1 - x0)} px pit at x ${Math.round(x0)} (floor ${fl.y}, ${Math.round(deep)} deep)`);
    }
  }
  return out;
}

test('no pit between stepping stones strands him (4-2\'s stones left gaps between two tall stones deeper than any jump climbs out of)', () => {
  for (const [id, plan] of Object.entries(HAND_STAGES)) {
    for (const s of SEEDS) {
      const st = buildProtoStage(levelConfig(id), s, plan);
      assert.deepEqual(strandingPits(st), [], `${id} seed ${s}`);
    }
  }
});
