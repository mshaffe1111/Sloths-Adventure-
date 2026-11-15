// npx tsx --test tools/inspect/clockRide.test.ts   (CI: gates.yml, the engine tools' tests)
/**
 * The bot toy for the clock-read skill (level.md rule 21; METER-2a step 4, R-165.272; METER-COVERAGE §2a "read a stage clock", board +
 * step-off half), before any level lays a ride on a stage beat (2-1's rides, 2-6's lifts): the real engine at 30 fps (RealPlay, its piece
 * hook moving the ride by the stage clock, ridePlay.ts), the tier bot's own run (firsttimer.ts FirstTimerRun), on a bare world of three
 * floors: a bank, a ride on a beat (ride.ts) over a pit no jump crosses (700 px: a double reaches 396), and the far bank it stands beside
 * at the far end of its trip. The middle and child bots, on both settings, board it while it stands, ride it still, step off when it
 * stands at the far bank, and never fall. Planted: with the skill off (CLOCK_SKILL.read) the bot walks off the moving ride's end into the
 * pit (the old float-wait has no rule for riding a 'moving' floor).
 */
import '../../src/game/headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { setDifficulty } from '../../src/game/difficulty.ts';
import { beatClock } from '../../src/game/beat.ts';
import { DT } from '../../src/game/realPlay.ts';
import type { ClockDef } from '../../src/game/stageKit.types.ts';
import type { Platform } from '../../src/game/types.ts';
import { CLOCK_SKILL, FirstTimerRun, FT_CHILD, FT_CHILD_EASY, FT_MIDDLE, FT_MIDDLE_EASY, freshPhone, type FirstTimer } from './firsttimer.ts';

const G = 600;
const FERRY: ClockDef = { id: 'ferry', offset: 0, easyStretch: 1.3, phases: [{ name: 'off', seconds: 1.5 }, { name: 'warn', seconds: 0.5 }, { name: 'on', seconds: 3 }, { name: 'rest', seconds: 1.5 }] } as ClockDef;
const plat = (id: number, x: number, width: number, extra: Partial<Platform> = {}): Platform => ({ id, x, y: G, width, height: 60, type: 'solid', ...extra }) as Platform;

/** one tier's crossing: did he reach the far bank without falling, and how long it took */
function cross(who: FirstTimer, seed: number): { across: boolean; fell: boolean; t: number; rode: boolean } {
  freshPhone(who.setting);
  setDifficulty(who.setting);
  const run = new FirstTimerRun('1-1', seed, who, { cap: 40, route: Array.from({ length: 29 }, (_, k) => ({ x: 100 + k * 50, y: G })) });
  const r = run as any;
  const ride = plat(3, 404, 140, { type: 'moving', ride: { clock: 'ferry', path: [{ x: 404, y: G }, { x: 956, y: G }], w: 140 } });
  run.sim.bare([plat(1, 0, 400), ride, plat(2, 1100, 600)]);
  (run.sim.stage as any).clocks = [FERRY];
  r.e.clock = beatClock([FERRY], who.setting === 'easy', 0);
  r.e.startPieces();
  run.sim.stand(150, G);
  let rode = false;
  for (let i = 0; i < Math.round(40 / DT); i++) {
    const pad = r.pad();
    run.sim.frame(pad);
    r.frames++;
    r.after();
    const p = run.sim.p;
    if (run.sim.standingOn === 3) rode = true;
    if (p.y > G + 150) return { across: false, fell: true, t: r.t, rode };
    if (p.grounded && p.x > 1120 && Math.abs(p.y - G) < 2) return { across: true, fell: false, t: r.t, rode };
  }
  return { across: false, fell: false, t: r.t, rode };
}

const TIERS: Array<[string, FirstTimer]> = [['middle Normal', FT_MIDDLE], ['middle Easy', FT_MIDDLE_EASY], ['child Normal', FT_CHILD], ['child Easy', FT_CHILD_EASY]];

test('the clock-read skill: every tier boards the ride on a beat while it stands, rides it still and steps off at the far bank (3 seeds)', (t) => {
  for (const [name, who] of TIERS) for (const seed of [1, 2, 3]) {
    const c = cross(who, seed);
    t.diagnostic(`on  ${name} seed ${seed}: ${c.across ? 'across' : c.fell ? 'FELL' : 'stuck'} at ${c.t.toFixed(1)} s${c.rode ? ', rode it' : ''}`);
    assert.ok(c.rode, `${name} seed ${seed}: he rode it`);
    assert.ok(c.across && !c.fell, `${name} seed ${seed}: across ${c.across}, fell ${c.fell} at ${c.t.toFixed(1)} s`);
  }
});

test('planted: with the skill off, the bot walks off the moving ride into the pit (the plant is RED without the skill)', (t) => {
  CLOCK_SKILL.read = false;
  try {
    let fell = 0;
    for (const [name, who] of TIERS) for (const seed of [1, 2, 3]) {
      const c = cross(who, seed);
      t.diagnostic(`off ${name} seed ${seed}: ${c.across ? 'across' : c.fell ? 'FELL' : 'stuck'} at ${c.t.toFixed(1)} s${c.rode ? ', rode it' : ''}`);
      if (!c.across) fell++;
    }
    assert.ok(fell >= 6, `without the skill ${fell} of 12 crossings fail`);
  } finally {
    CLOCK_SKILL.read = true;
  }
});
