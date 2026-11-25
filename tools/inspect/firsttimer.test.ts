// npx tsx --test tools/inspect/firsttimer.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dotReport, edgesOf, firstHarms, firstTimer, flagsFor, flickHold, FirstTimerRun, FT_ADULT, FT_CHILD, FT_CHILD_EASY, FT_KID, FT_MIDDLE, FT_MIDDLE_EASY, gauss, LEVEL_REACH, peakStress, Progress, rng, SKILLS, SpotMemory, teaches,
  type Harm, type Shown, type Try,
} from './firsttimer.ts';
import type { Platform } from '../../src/game/types.ts';
import { PHYS } from '../../src/game/physics.ts';

const shown = (t0: number, t1: number | null, text: string, o: Partial<Shown> = {}): Shown => ({ key: `k:${text}`, text, kind: 'teach', source: 'engine', t0, t1, far: 0, near: 0, ...o });
const tryAt = (x: number, t0: number, ok: boolean, o: Partial<Try> = {}): Try => ({ x, y: 580, dir: 1, t0, t1: t0 + 0.6, kind: 'single', ok, hurt: !ok, running: true, hold: 0.15, ...o });

test('spot memory: a single jump that fails at a spot is followed by a double there; two falls back are a loop', () => {
  const m = new SpotMemory();
  assert.equal(m.plan(500, 580), 'single');
  m.result(500, 580, 'single', false);
  assert.equal(m.plan(530, 580), 'double', 'the same spot (within 60 px)');
  assert.equal(m.plan(700, 580), 'single', 'another spot');
  assert.equal(m.loops().length, 0);
  m.result(510, 580, 'double', false);
  assert.deepEqual(m.loops().map((l) => [l.n, l.doubles]), [[2, 1]]);
  // three deaths at one spot count too
  m.died(1500, 580);
  m.died(1520, 580);
  assert.ok(m.loops().some((l) => l.deaths === 2));
});

test('progress follows him along the route, never jumps to a far part of it, and finds him again after a respawn', () => {
  const pts = Array.from({ length: 101 }, (_, i) => ({ x: i * 24, y: 580 }));
  const pr = new Progress(pts);
  pr.relocate({ x: 0, y: 580 });
  assert.equal(pr.step({ x: 240, y: 580 }), true);
  assert.equal(pr.cur, 10);
  assert.equal(pr.step({ x: 240, y: 580 }), false, 'no further: no progress');
  pr.step({ x: 2400, y: 580 });
  assert.ok(pr.cur < 60, 'a point far ahead is not taken in one step');
  pr.relocate({ x: 48, y: 580 });
  assert.equal(pr.cur, 2);
  assert.ok(pr.best >= 10, 'the best so far is kept');
  assert.deepEqual(pr.target({ x: 48, y: 580 }), pts[6], 'heads for the first point over 90 px on');
});

test('after a fall, the way back up is found near him: a level point is taken only within LEVEL_REACH, else the plain nearest (ENG-285; 1-6 kid Normal layout 13 picked one 35,000 px on, BUILD-24b)', () => {
  // the route runs along a bank at y 580 over a pit floor at y 900 (no route point on it), and 35,000 px on drops to a low valley at y 900
  const pts = [...Array.from({ length: 101 }, (_, i) => ({ x: i * 24, y: 580 })), ...Array.from({ length: 20 }, (_, i) => ({ x: 37000 + i * 24, y: 900 }))];
  const pr = new Progress(pts);
  pr.relocate({ x: 1200, y: 900 }, true);
  assert.ok(Math.abs(pts[pr.cur].x - 1200) <= LEVEL_REACH, `fallen into the pit at x 1200: put at the route point x ${pts[pr.cur].x}, never the valley 35,000 px on`);
  assert.equal(pr.cur, 50, 'no level point near him: the plain nearest (the bank over him)');
  // a level point near him is still the one taken
  const near = [...pts, { x: 1500, y: 900 }];
  const pr2 = new Progress(near);
  pr2.relocate({ x: 1200, y: 900 }, true);
  assert.equal(near[pr2.cur].x, 1500, 'a point at his height 300 px on is taken');
});

test("the thumb: reaction and hold noise as the Gemini research's Stage B, never a flick under 2 frames", () => {
  const r = rng(7);
  const lag = Array.from({ length: 4000 }, () => gauss(r, FT_KID.thumb));
  const mean = lag.reduce((a, b) => a + b, 0) / lag.length;
  const sd = Math.sqrt(lag.reduce((a, b) => a + (b - mean) ** 2, 0) / lag.length);
  assert.ok(Math.abs(mean - 0.09) < 0.006 && Math.abs(sd - 0.065) < 0.006, `kid N(+90 ms, 65 ms): ${mean.toFixed(3)}, ${sd.toFixed(3)}`);
  const holds = Array.from({ length: 4000 }, () => flickHold(r, FT_KID));
  assert.ok(Math.min(...holds) >= 2 / 30 - 1e-9);
  const taps = holds.filter((h) => Math.abs(h - 2 / 30) < 1e-9).length / holds.length;
  assert.ok(taps > 0.06 && taps < 0.2, `about 8% cut to a tap (plus the low tail): ${taps.toFixed(3)}`);
  assert.ok(FT_ADULT.thumb[0] < FT_KID.thumb[0] && FT_ADULT.hold[1] < FT_KID.hold[1]);
});

test("Dot: repeats, lines too close (a warning may come at once), lines up 20 s+ with their thing out of reach, re-teaching, wordy lines", () => {
  const d = dotReport([
    shown(1, 5, 'Flick up to jump.'),
    shown(6, 10, 'Watch out!', { kind: 'danger' }),
    shown(8, 34, 'Flick up into the vine to grab it.', { far: 700, near: 80 }),
    shown(40, 44, 'Flick up to jump.', { doneBefore: true }),
    shown(60, 64, 'This is a very long line that has far more than ten words in it.', { kind: 'info' }),
  ], 100);
  assert.deepEqual(d.repeats.map((r) => [r.text, r.n]), [['Flick up to jump.', 2]]);
  assert.deepEqual(d.quick.map((q) => q.text), ['Flick up into the vine to grab it.'], 'the danger line 5 s after is allowed');
  assert.deepEqual(d.long.map((l) => [l.dur, l.outOfReach]), [[26, true]]);
  assert.deepEqual(d.reteach.map((l) => l.t), [40]);
  assert.equal(d.wordy.length, 1);
});

test('the first harm of each kind against the first tip that teaches it (on screen a reaction before it)', () => {
  const harms: Harm[] = [
    { kind: 'life', t: 1.3, x: 504, y: 640, cause: 'water', onScreen: null },
    { kind: 'hit', t: 30, x: 4000, y: 580, cause: 'foe:snake', onScreen: true },
    { kind: 'life', t: 40, x: 5000, y: 640, cause: 'water', onScreen: null },
  ];
  const lines = [shown(0.2, 3, "Gather flowers for the river king's crown!", { kind: 'goal' }), shown(20, 24, 'Tap to punch it before it gets close.', { topic: 'foe' }), shown(26, 30, 'Hop the lily pads.')];
  assert.equal(teaches('water', lines[0]), false, 'the goal line is not teaching');
  const f = firstHarms(harms, lines, 1);
  assert.deepEqual(f.map((h) => [h.cause, h.ok, h.tip?.t ?? null]), [['water', false, 26], ['foe:snake', true, 20]]);
});

test('the gates: survival per edge over the tries, and peak stress per burst before a rest', () => {
  const tries = [tryAt(500, 1, true), tryAt(510, 9, false), tryAt(520, 12, true), tryAt(900, 2, true), tryAt(905, 10, true), tryAt(910, 13, true)];
  const e = edgesOf(tries);
  assert.deepEqual(e.map((x) => [x.x, x.tries, x.sr]), [[500, 3, 0.67], [900, 3, 1]]);
  // the two edges 0.4 s apart are one burst on Normal (rest 1 s), two on Easy's 2 s? no: 1.6 - 0.4 < 2 too; both one burst
  const p = peakStress(e, 1);
  assert.equal(p.bursts, 1);
  assert.equal(p.peak, 0.33);
  assert.equal(peakStress(e, 0.2).bursts, 2);
});

test('in the real engine: a waist-high step is got over with a plain flick; a tall wall stops him and is reported with its height', () => {
  const ground = (x: number, w: number, y = 580): Platform => ({ id: 1, x, y, width: w, height: 90, type: 'solid' }) as Platform;
  const line = Array.from({ length: 160 }, (_, i) => ({ x: 100 + i * 24, y: 580 }));
  const play = (block: Platform) => {
    const run = new FirstTimerRun('1-1', 1, FT_ADULT, { route: line, cap: 16, rescueAfter: 1000 });
    run.sim.bare([ground(0, 4000), block]);
    run.sim.stand(100, 580);
    run.prog.relocate(run.sim.p);
    return run.play();
  };
  const step = play({ id: 2, x: 700, y: 520, width: 300, height: 60, type: 'solid' } as Platform);
  assert.ok(step.sim.p.x > 1000, `over the 60 px step (x ${Math.round(step.sim.p.x)})`);
  assert.ok(step.tries.length >= 1 && step.stuck.length === 0);
  const wall = play({ id: 2, x: 700, y: 250, width: 120, height: 330, type: 'solid' } as Platform);
  assert.ok(wall.stuck.length >= 1 && wall.stuck[0].x < 700, 'the 330 px wall stops him (and he is then put past it)');
  assert.ok(wall.stuck[0].step !== null && Math.abs(wall.stuck[0].step - 330) < 4, JSON.stringify(wall.stuck[0]));
  assert.ok(wall.loopsReport().some((l) => l.n >= 2 && l.doubles >= 1), 'he falls back, and tries a double after the first failure');
});

test("in the real engine: after a put-back the game's steer hold is not a wall; the adult runs up to the lip for his next jump (POLISH-9)", () => {
  // (a 255 px gap, 1-1's double test: a level put-back sets him 150 px back from the lip and the engine ignores his still-held thumb
  // for 0.35 s (engine.ts inputGrace). ADULT's stopReact 0.3 read that hold as a wall and jumped where he was set down, standing, until
  // rescued: 6 of 10 1-1 Normal layouts. Plant: drop `!graceHeld &&` from firsttimer.ts's blockedT and every seed below goes red)
  const ground = (id: number, x: number, w: number): Platform => ({ id, x, y: 580, width: w, height: 90, type: 'solid' }) as Platform;
  const line = Array.from({ length: 160 }, (_, i) => ({ x: 100 + i * 24, y: 580 }));
  for (const seed of [1, 2, 3, 4, 5]) {
    const run = new FirstTimerRun('1-1', seed, FT_ADULT, { route: line, cap: 30, rescueAfter: 1000 });
    run.sim.bare([ground(1, 0, 1000), ground(2, 1255, 3000)]);
    // (a fall out of the toy is a level put-back: 1-1 has them on both settings, gen2 softFalls)
    (run.sim as unknown as { e: { currentStage: { config: { levelHeight: number } } } }).e.currentStage.config.levelHeight = 700;
    run.sim.stand(700, 580);
    run.prog.relocate(run.sim.p);
    const r = run.play();
    const tries = r.tries.map((t) => `${t.kind}@${Math.round(t.x)}${t.running ? 'r' : 's'}${t.ok ? '+' : '-'}`).join(' ');
    assert.ok(r.softFalls.length >= 1, `seed ${seed}: he was put back at least once (${tries})`);
    assert.equal(r.rescues, 0, `seed ${seed}: never rescued (${tries})`);
    assert.ok(r.sim.p.x > 1300, `seed ${seed}: over the gap (x ${Math.round(r.sim.p.x)})`);
    for (const t of r.tries) assert.ok(t.x >= 1000 - FT_ADULT.edgeAim - 60 && t.running, `seed ${seed}: every jump from a run-up near the lip, never where he was set down (${tries})`);
  }
});

test('in the real engine: a log drifting his way across the lip is the floor his boarding hop is for: a single where a single comes down on it, never a double read past it to the next log (SKILLS.boardHop; RED with it off)', () => {
  // (SKILLS.boardLog has him wait at a bank's lip while a log his way is still mostly under it, then hop on. jumpFor skipped that log
  // (a piece starting behind the edge) and read the gap to the NEXT log: 2-2 child Normal seed 36 stood at the lip with log 79 under it,
  // took the 214 px to log 80 for a double, flew over 79 and came down in the water between them (x 20212; trace-27h.txt 9, ENG-27h).
  // Planted at the read itself: the toy is 2-2's lip, the bank's top at 600, the river's logs 28 px under it (river.ts LOG_DROP), each log
  // on its river's clock (driftX) where the platform stands at the bot's time 0)
  const bank = { id: 1, x: 0, y: 600, width: 1000, height: 90, type: 'solid' } as Platform;
  const log = (id: number, x: number, dir: 1 | -1 = 1) => ({
    id, x, y: 628, width: 200, height: 24, type: 'drift',
    drift: { x0: 1000, x1: 3000, dir, speed: 60, width: 200, baseY: 628, offset: (dir === 1 ? x - 800 : 3000 - x) / 60 },
  }) as unknown as Platform;
  const read = (under: Platform | null, on: boolean) => {
    const line = Array.from({ length: 160 }, (_, i) => ({ x: 100 + i * 24, y: 600 }));
    const run = new FirstTimerRun('1-1', 1, FT_CHILD, { route: line, cap: 1, rescueAfter: 1000 });
    run.sim.bare([bank, ...(under ? [under] : []), log(3, 1214)]);
    const was = SKILLS.boardHop;
    SKILLS.boardHop = on;
    try {
      return (run as unknown as { jumpFor(p: { x: number; y: number }, dir: 1, here: Platform): 'single' | 'double' }).jumpFor({ x: 970, y: 600 }, 1, bank);
    } finally {
      SKILLS.boardHop = was;
    }
  };
  // (a log 160 px past the lip, his single from a stand 30 px back comes down on it)
  assert.equal(read(log(2, 960), true), 'single', 'a log his way across the lip, a single comes down on it: a single');
  assert.equal(read(log(2, 960), false), 'double', 'RED: with SKILLS.boardHop off the gap to the next log (214 px) is read, a double');
  // (and nothing else moves. A log only 40 px past the lip: a single comes down past its front, in the water, so the gap read stands (2-2
  //  middle Normal seed 17 with log 79 75 px out: the double reached log 80). No log across the lip (none, one still all under the bank, one
  //  running back at him): the next log's gap, as before)
  for (const [under, why] of [[log(2, 840), 'a log only 40 px out'], [null, 'no log at the lip'], [log(2, 700), 'a log still all under the bank'], [log(2, 960, -1), 'a log running back at him']] as const) {
    assert.equal(read(under, true), 'double', `${why}: the 214 px to the next log is a double, with the skill on as off`);
    assert.equal(read(under, false), 'double', `${why}: (skill off)`);
  }
});

// (RETIRED 11-25, R-165.432 (the lead's ruling: a plant with no live case anywhere is retired with the search as evidence; the skill's code
//  stays; re-plant when a stage needs it; R-165.424 reviews whether it is still needed): the on-the-runs plant of SKILLS.boardHop (2-2
//  child Normal seed 36: no life lost within 3 s of a stand at a lip with a log his way across it, a life lost there with it off; the
//  middle Normal seed 17 check) has no live case. Searched on 36e8efe6f, every cast bot, both settings, boardHop on and off, this test's
//  own meet(): 2-2, 2-1, 2-4, 2-5 and 2-9 seeds 1-40 and 2-8's 8 river rolls (seeds 9, 14, 16, 18, 19, 22, 24, 26): 1872 rows, 858 with a
//  stand at such a lip, 0 where the skill holds; the lives lost after a stand are the same on and off on every row that ran off (2-7's
//  rivers all run back at him; 2-3 and 2-6 lay none). Search: reference/qa-reports/ENG-PLANT/data/t/board22.txt and data/u/board-*.txt. The
//  laid test above (the read itself, the toy lip) stays: it is the skill's plant)

test('in the real engine: a jump from a STAND over a laid pond reads the gap from where he stands, so a single that cannot carry his own ground to the lip and the pond is a double (SKILLS.fromTakeoff; RED with it off)', () => {
  // (re-planted by ENG-27j on its cause laid EXPLICITLY, the lead's ruling 11-21: the race plants it was first planted on (2-7's toy,
  //  post Normal seeds 4 and 5, ENG-27f) won without it once the merged ground took away the descent pools they stood on. The two
  //  misses, each laid here: (a) post Normal seed 5's middle stood 165 px before a 133 px safe pond and took a single, splashed back eight
  //  times (x 6591); (b) seed 4's stood 107 px back on a log with the bank 72 px past its front and took a single, came down on the log's
  //  end and walked off it into the water (x 2749). The bank's top at 600, a log 28 px under it (river.ts LOG_DROP), the water a river zone)
  const solid = (id: number, x: number, w: number, y = 600) => ({ id, x, y, width: w, height: 90, type: 'solid' }) as Platform;
  const log = (id: number, x: number) => ({
    id, x, y: 628, width: 240, height: 24, type: 'drift',
    drift: { x0: 0, x1: 6000, dir: 1, speed: 0.001, width: 240, baseY: 628, offset: (x + 240) / 0.001 },
  }) as unknown as Platform;
  const read = (pieces: Platform[], water: Array<[number, number]>, at: number, here: Platform, on: boolean, vx = 0) => {
    const line = Array.from({ length: 160 }, (_, i) => ({ x: 100 + i * 24, y: 600 }));
    const run = new FirstTimerRun('1-1', 1, FT_MIDDLE, { route: line, cap: 1, rescueAfter: 1000 });
    run.sim.bare(pieces);
    (run.sim.stage as unknown as { rivers: Array<{ x0: number; x1: number }> }).rivers = water.map(([x0, x1]) => ({ x0, x1 }));
    run.sim.stand(at, here.y);
    run.sim.p.vx = vx;
    const was = SKILLS.fromTakeoff;
    SKILLS.fromTakeoff = on;
    try {
      return (run as unknown as { jumpFor(p: { x: number; y: number }, dir: 1, here: Platform): 'single' | 'double' }).jumpFor({ x: at, y: here.y }, 1, here);
    } finally {
      SKILLS.fromTakeoff = was;
    }
  };
  // (a) the pond: the near bank ends at 1000, 133 px of safe water, the far bank at 1133; he stands 165 px before the lip
  const near = solid(1, 0, 1000), far = solid(2, 1133, 3000);
  assert.equal(read([near, far], [[1000, 1133]], 835, near, true), 'double', '(a) 165 px of his own ground and a 133 px pond from a stand: a double');
  assert.equal(read([near, far], [[1000, 1133]], 835, near, false), 'single', 'RED (a): with SKILLS.fromTakeoff off the 133 px gap alone is read, a single');
  // (b) the log: he stands on a log 107 px back from its front (x 1240), the bank 72 px past it (x 1312), water from the near bank on
  const lg = log(3, 1000), bank = solid(4, 1312, 3000);
  assert.equal(read([solid(1, 0, 900), lg, bank], [[900, 1312]], 1133, lg, true), 'double', '(b) 107 px of log and a 72 px gap to the bank from a stand: a double');
  assert.equal(read([solid(1, 0, 900), lg, bank], [[900, 1312]], 1133, lg, false), 'single', 'RED (b): with it off the 72 px gap alone is read, a single');
  // (and nothing else moves, the narrowing rule 28 found (ENG-27g): a RUNNING single (his own run carries it), a DRY pit the same width,
  //  and a run-up longer than a single carries (2-3: a stand 330 px before a 60 px pond) read the gap alone, a single, on as off)
  for (const on of [true, false]) {
    assert.equal(read([near, far], [[1000, 1133]], 835, near, on, 300), 'single', `running at the pond: a single (skill ${on ? 'on' : 'off'})`);
    assert.equal(read([near, far], [], 835, near, on), 'single', `a dry pit the same width: a single (skill ${on ? 'on' : 'off'})`);
    const far60 = solid(2, 1060, 3000);
    assert.equal(read([near, far60], [[1000, 1060]], 670, near, on), 'single', `a stand 330 px before a 60 px pond: a single (skill ${on ? 'on' : 'off'})`);
  }
});

test('the findings name the rule each breaks', () => {
  const base = { who: 'KID', setting: 'easy', seed: 1, end: 'shrine', time: 120, x: 9000, progress: 1, goal: null, opening: [], harms: [], perMin: { hits: 0, lives: 0 }, gameOvers: 0, firstHarm: [], stuck: [], loops: [], stops: { n: 0, firstJumpFailed: 0, heights: [] }, puzzles: [], rescues: 0, dot: dotReport([], 120), flags: [], tries: [], turns: { n: 0, lag: 0 }, backtrack: { route: 1, bot: 1 }, noRoute: false, frames: 0, ms: 0 } as const;
  const f = flagsFor({ ...base, holdOn: { hit: null, life: { kind: 'life', t: 1.3, x: 504, y: 640, cause: 'water', onScreen: null } }, stuck: [{ x: 600, y: 580, t: 10, dur: 9, what: 'a 60 px waist-high step ahead', step: 60, dip: null, puzzle: false, rescued: false }] } as never);
  assert.equal(f[0].rule, 'opening');
  assert.ok(f.some((x) => x.rule === 'plainWalk' && x.kind === 'stuck'));
});

test('set down at the same place three times, never getting further (a splash-back costs no life), is a loop: he is put past it', () => {
  // (ENG-CAGE: 2-3's sinking-pad pond set the kid Normal down at its near bank every 20 s to the 1200 s cap; each relocate wound his
  //  progress back, so the walk on to the pond counted as progress and no rescue came. Planted: before the rule this run reaches the cap
  //  at the pond's lip, set down every few seconds)
  const ground: Platform = { id: 1, x: 0, y: 580, width: 4000, height: 90, type: 'solid' } as Platform;
  const line = Array.from({ length: 160 }, (_, i) => ({ x: 100 + i * 24, y: 580 }));
  let downs = 0;
  const run = new FirstTimerRun('1-1', 1, FT_ADULT, {
    route: line, cap: 60, onFrame: (sim) => {
      // (the game's splash-back: reaching x 1500 he is set back down at x 1000, as a pond's near bank does)
      // (only as he walks in over the lip: the rescue puts him on at about x 1590, past it)
      if (sim.p.x > 1500 && sim.p.x < 1540 && downs < 12) {
        downs++;
        sim.stand(1000, 580);
      }
    },
  });
  run.sim.bare([ground]);
  run.sim.stand(100, 580);
  run.prog.relocate(run.sim.p);
  run.play();
  const loop = run.stuck.find((s) => /set down here \d+ times/.test(s.what));
  assert.ok(loop, `no set-down loop noted (set down ${downs} times): ${JSON.stringify(run.stuck)}`);
  assert.ok(run.rescues >= 1 && run.sim.p.x > 1700, `put past it: rescues ${run.rescues}, x ${Math.round(run.sim.p.x)}, set down ${downs} times`);
  assert.ok(downs <= 4, `set down ${downs} times before he was put past (three are a loop)`);
});

test('floorAt: a branch far under a high river is floor; a top in its water is not (R-165.390, the engine reads water by x AND y, river.ts riverAt)', () => {
  // (a climb stage: one river high up the stage (surface y 1239) and another at its foot (6348), their windows over the same x; the
  //  climb's branches between them stand in neither. Read by x alone, every branch under the high river's window was 'under the water':
  //  no floor under him or ahead, so he jumped 166 px short of a lip and ran off the next lip in the landing's beat, 2-6 kid N 32 and 34)
  const branch = (id: number, x: number, y: number, width: number) => ({ id, x, y, width, height: 24, type: 'solid' }) as unknown as Platform;
  const fake = {
    sim: { stage: { rivers: [{ x0: 681, x1: 1521, surfaceY: 1239 }, { x0: 766, x1: 1526, surfaceY: 6348 }] },
      platforms: [branch(1, 1333, 3738, 240), branch(2, 900, 1249, 200), branch(3, 900, 6000, 200)] },
    solid: () => true,
  };
  const floorAt = (x: number, y: number, down = 40) => (FirstTimerRun.prototype.floorAt as (this: unknown, x: number, y: number, down?: number) => Platform | null).call(fake, x, y, down);
  assert.equal(floorAt(1445, 3738)?.id, 1, 'a branch 2,500 px under the high river, over no water of its own, is floor');
  assert.equal(floorAt(1000, 1249), null, 'a top 10 px under the high river\'s surface is in its water: no floor');
  assert.equal(floorAt(1000, 6000)?.id, 3, 'a top over the low river\'s surface is floor');
});

test('on the run it was found on, 2-4 kid Easy seed 35: no jump off a drifting log comes down in the water (set down by the game before he stands again); the run-up judge counts the thumb travel still to run (c25; RED on c24: a run / pull-back / run flicker left his steer dropped, the judge pressed "held from now" and he flew on the carry alone)', () => {
  // (the real stage and bot, as castBots rolls them; read by what he meets, never where: every jump off a drifting log (on it, grounded,
  //  one frame; the next up at a jump's launch speed, PHYS.jumpV), and every set-down by the game (a step of 100 px or more in one frame,
  //  as FirstTimerRun reads one) before he stands on a floor again. RED on c24 2a2c44786 (ENG-PLANT REPORT, session 11): the run-up's
  //  jump off log #48; a walk-off after a landing is R-165.413's, not this)
  let flying = false, offs = 0, downs = 0, last: { x: number; y: number; on: boolean } | null = null;
  firstTimer('2-4', 35, { ...FT_KID, setting: 'easy' }, { cap: 180, dotSetting: true, onFrame: (sim) => {
    const e = (sim as unknown as { e: { player: { x: number; y: number; vy: number; grounded: boolean }; platforms: Platform[]; standingOnId: number | null } }).e;
    const p = e.player, here = e.platforms.find((q) => q.id === e.standingOnId);
    if (last && Math.hypot(p.x - last.x, p.y - last.y) >= 100 && flying) downs++;
    if (last?.on && !p.grounded && p.vy < -0.8 * PHYS.jumpV) { flying = true; offs++; } else if (p.grounded) flying = false;
    last = { x: p.x, y: p.y, on: p.grounded && !!here && here.type === 'drift' };
  } });
  assert.ok(offs >= 1, `he jumped off a drifting log (${offs})`);
  assert.equal(downs, 0, `no jump off a log came down in the water (${downs} of ${offs})`);
});

test('on the run it was found on, 2-1 child Easy seed 2: landing on a small log running his way (under 220 px), even inside his run-out of its front, he takes the pad pause and is never pulled back; the row ends at the shrine with no rescue (c23; RED on c22 52bcce623: the pull-back turned him on landing on a 200 px log 75 px from its front, his run-out 91, the pause and its draw skipped, and he was rescued at the back river)', () => {
  // (the real stage and bot, as castBots rolls them; read by what he meets, never where: a landing (the run's lastLand inside 0.1 s)
  //  grounded on a drifting log narrower than 220 px whose drift runs the way he landed moving; the pause is the run's padPause on that
  //  log. The proof of the RED half on c22 is in reference/qa-reports/ENG-PLANT/REPORT.md, ENG-PLANT-s)
  const P = FirstTimerRun.prototype as unknown as { play: (this: unknown) => unknown };
  const play = P.play;
  let run: { t: number; lastLand: number; padPause: { id: number } | null; runOut: () => number } | null = null;
  P.play = function (this: unknown) { run = this as typeof run; return play.call(this); };
  const lands = new Map<number, { inside: boolean; pause: boolean }>();
  let r: ReturnType<typeof firstTimer>;
  try {
    r = firstTimer('2-1', 2, FT_CHILD_EASY, { cap: 1200, dotSetting: true, onFrame: (sim) => {
      const e = (sim as unknown as { e: { player: { x: number; vx: number; grounded: boolean }; platforms: Platform[]; standingOnId: number | null } }).e;
      const p = e.player, q = e.platforms.find((k) => k.id === e.standingOnId) as (Platform & { drift?: { dir: number } }) | undefined;
      if (!run || !p.grounded || !q || q.type !== 'drift' || !q.drift || q.width >= 220 || run.t - run.lastLand >= 0.1) return;
      const key = Math.round(run.lastLand * 30);
      let row = lands.get(key);
      if (!row) {
        if (Math.sign(p.vx) !== q.drift.dir) return;
        const front = q.drift.dir > 0 ? q.x + q.width : q.x;
        row = { inside: q.drift.dir * (front - p.x) < run.runOut(), pause: false };
        lands.set(key, row);
      }
      if (run.padPause?.id === q.id) row.pause = true;
    } });
  } finally {
    P.play = play;
  }
  const all = [...lands.values()];
  assert.ok(all.some((l) => l.inside), `he landed on a small log running his way inside his run-out of its front (${JSON.stringify(all)})`);
  assert.deepEqual(all.filter((l) => !l.pause), [], `every such landing takes the pause (${all.length} landings)`);
  assert.equal(r.end, 'shrine', `he reaches the shrine (${r.end})`);
  assert.equal(r.rescues, 0, `no rescue (${r.rescues})`);
});

test('on the run it was found on, 2-4 child Normal seed 8: the run-up\'s jump (SKILLS.runUp: runPress passed at every lag, then the judged press) is held at least as long as runPress judged it; the row ends at the shrine with no rescue (c24; RED on c23 ccca3d305: flown at flickHold\'s draw, 0.065 / 0.093 / 0.114 s against the 0.16 judged, he peaked under the liana\'s foot and fell in, rescued)', () => {
  // (the real stage and bot, as castBots rolls them; read by what he does, never where: a run-up press is decide's judged single press
  //  in the frame whose last runPress was the direct one (from where he stands, s0 0) and passed; the next startJump inside 0.5 s is its
  //  jump, and this.jump.hold is what he flies. The proof of the RED half on c23 is in reference/qa-reports/ENG-PLANT/REPORT.md, ENG-PLANT-s)
  type Run = { t: number; pressJudged: boolean; sim: { p: { x: number } }; jump: { hold: number } | null };
  const P = FirstTimerRun.prototype as unknown as Record<'runPress' | 'decide' | 'startJump', (this: Run, ...a: unknown[]) => unknown>;
  const { runPress, decide, startJump } = P;
  let last: { t: number; direct: boolean; ok: boolean; hold: number } | null = null, judged: { t: number; hold: number } | null = null;
  const jumps: Array<{ t: number; judged: number; flown: number }> = [];
  P.runPress = function (...a) { const ok = runPress.apply(this, a) as boolean; last = { t: this.t, direct: a[2] === 0 && a[0] === (a[4] as { x: number }).x, ok, hold: a[9] as number }; return ok; };
  P.decide = function (...a) { if (this.pressJudged && a[1] === 'single' && a[2] === true && last && last.t === this.t && last.direct && last.ok) judged = { t: this.t, hold: last.hold }; return decide.apply(this, a); };
  P.startJump = function (...a) {
    const out = startJump.apply(this, a);
    if (judged && this.t - judged.t < 0.5 && this.jump) jumps.push({ t: +judged.t.toFixed(2), judged: judged.hold, flown: this.jump.hold });
    judged = null;
    return out;
  };
  let r: ReturnType<typeof firstTimer>;
  try {
    r = firstTimer('2-4', 8, FT_CHILD, { cap: 1200, dotSetting: true });
  } finally {
    Object.assign(P, { runPress, decide, startJump });
  }
  assert.ok(jumps.length >= 1, 'he made a run-up jump');
  assert.deepEqual(jumps.filter((j) => j.flown < j.judged - 1e-9), [], `every run-up jump held at least as judged (${JSON.stringify(jumps)})`);
  assert.equal(r.end, 'shrine', `he reaches the shrine (${r.end})`);
  assert.equal(r.rescues, 0, `no rescue (${r.rescues})`);
});

test('in the real engine, laid: a log drifting his way still mostly under the bank\'s lip when he comes at it at full run is boarded by a hop, not run onto: no life lost before he has stood 3 s on a log (SKILLS.boardLog; RED with it off: he runs off the lip onto it and off its front into the water; pacerLay\'s home Easy seed 1 plant laid explicitly)', () => {
  // (pacerLay.test.ts's boardLog race (home Easy seed 1, the careful middle player) lost its RED half when the merged ground moved its
  //  lips; its cause is laid here, as fromTakeoff's was (af127d21e). The bank's top at 600 to the lip at x 1000, a river 1000-2400 (a full
  //  RiverZone on the stage: surfaceY, dir, speed; the ride wait's floatAt reads it, the bare {x0, x1} first toy fell on and off alike,
  //  af127d21e), its 240 px logs 28 px under the lip (river.ts LOG_DROP) on its clock, 420 px apart, the far bank past it. He runs from
  //  x 100. A log's front at x f0 at time 0: at 725 and 750 the log is 0-120 px past the lip as he comes to it (checked below), the
  //  plant's shape (64 px out of 240); from 800 to 950 it is past the lip or clear of it, the read is the same on as off)
  const bank = { id: 1, x: 0, y: 600, width: 1000, height: 90, type: 'solid' } as Platform;
  const far = { id: 9, x: 2400, y: 600, width: 3000, height: 90, type: 'solid' } as Platform;
  const log = (id: number, front: number) => ({ id, x: front - 240, y: 628, width: 240, height: 24, type: 'drift',
    drift: { x0: 1000, x1: 2400, dir: 1, speed: 60, width: 240, baseY: 628, offset: (front - 1000) / 60 } }) as unknown as Platform;
  const go = (on: boolean, f0: number) => {
    const line = Array.from({ length: 200 }, (_, i) => ({ x: 100 + i * 24, y: 600 }));
    let lives0: number | null = null, lost = 0, onLog: number | null = null, past: number | null = null;
    const run = new FirstTimerRun('1-1', 1, FT_MIDDLE_EASY, { route: line, cap: 20, rescueAfter: 1000, onFrame: (sim) => {
      const e = (sim as unknown as { e: { player: { x: number; grounded: boolean }; lives: number; platforms: Platform[]; standingOnId: number | null } }).e;
      const p = e.player, q = e.platforms.find((k) => k.id === e.standingOnId);
      if (past === null && p.x >= 940) { const under = e.platforms.filter((k) => k.type === 'drift' && k.x < 1000).map((k) => k.x + k.width - 1000); past = under.length ? Math.max(...under) : -1; }
      lives0 ??= e.lives;
      if (onLog !== null && run.t - onLog >= 3) return;
      if (e.lives < lives0) { lost += lives0 - e.lives; lives0 = e.lives; }
      if (onLog === null && p.grounded && q?.type === 'drift') onLog = run.t;
    } });
    run.sim.bare([bank, log(2, f0), log(3, f0 - 420), log(4, f0 - 840), far]);
    const st = (run.sim as unknown as { e: { currentStage: { config: { levelHeight: number }; rivers: unknown[] } } }).e.currentStage;
    st.config.levelHeight = 760;
    st.rivers = [{ x0: 1000, x1: 2400, surfaceY: 640, dir: 1, speed: 60 }];
    run.sim.stand(100, 600);
    run.prog.relocate(run.sim.p);
    const was = SKILLS.boardLog;
    SKILLS.boardLog = on;
    try {
      run.play();
    } finally {
      SKILLS.boardLog = was;
    }
    return { lost, boarded: onLog !== null, past };
  };
  for (const f0 of [725, 750]) {
    const a = go(true, f0), b = go(false, f0);
    assert.ok(a.past !== null && a.past > 0 && a.past < 120 && b.past === a.past, `front ${f0}: a log 0-120 px past the lip (of 240) as he comes to it (${a.past}, ${b.past})`);
    assert.ok(a.boarded && a.lost === 0, `front ${f0}: boarded with no life lost (${JSON.stringify(a)})`);
    assert.ok(b.lost >= 1, `RED: front ${f0}, with SKILLS.boardLog off he runs onto it and into the water (${JSON.stringify(b)})`);
  }
  for (let f0 = 800; f0 <= 950; f0 += 50) {
    const a = go(true, f0), b = go(false, f0);
    assert.ok(a.boarded && a.lost === 0 && b.boarded && b.lost === 0, `front ${f0}: no log under the lip, boarded with no life lost on as off (${JSON.stringify([a, b])})`);
  }
});
