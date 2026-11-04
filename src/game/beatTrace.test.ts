/**
 * The beat tracer's proofs (w1-rhythm, 2026-11-04). The brief's three:
 *   1. every landing is reachable by a clumsy thumb (15% less air speed, a 100 ms late take-off, feet 6-8 px inside the edge);
 *   2. the landing is on screen at take-off, upright and sideways;
 *   3. each node has a flat, safe 200 px apron at its entrance and its exit, and a checkpoint at its entrance.
 * And the ruler checked first (D15, D19): the tracer's flight is the real engine's (a jump in the engine lands where the tracer says),
 * and each check fails a layout built to fail it.
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { PHYS, TAKEOFF_SLACK } from './physics.ts';
import type { Platform } from './types.ts';
import { APRON, CLUMSY, DEAD_WALK, GAP_REPEAT, INSIDE, SLOP, VIEWS, checkTrace, deadWalks, easyNode, flight, gridHits, hazardSpots, landingInView, stageBpm, traceNode, type Move, type NodeSpec, type Step } from './beatTrace.ts';
import { stageMusic } from '../audio/scenes.ts';
import { themeById } from '../audio/themes.ts';
import { generateAllLevels } from './worldsData.ts';

const J = (dy = 0, surface: Step['surface'] = 'bank'): Step => ({ move: 'jump', dy, surface });
const H = (dy = 0, surface: Step['surface'] = 'bank'): Step => ({ move: 'hop', dy, surface });
const D = (dy = 0, surface: Step['surface'] = 'bank'): Step => ({ move: 'double', dy, surface });

/** the patterns the proofs run over: every hit kind, every move, rises, drops, branches, stumps, crumbling ledges, three tempos */
const NODES: Array<Omit<NodeSpec, 'x' | 'y'>> = [
  { bpm: 130, bars: ['x...x...', 'x...x...'], steps: [J(), J(-40), J(), J(40, 'branch')] },
  { bpm: 127, bars: ['x.....x.', 'x.....x.'], steps: [J(0, 'branch'), H(-40, 'branch'), J(30, 'branch'), H(-30)] },
  { bpm: 88, bars: ['x.x.x.x.'], steps: [J(), J(30, 'branch'), J(), J(-30)] },
  { bpm: 92, bars: ['x..o..x.'], steps: [J(50, 'stump'), H(-50), J()] },
  { bpm: 92, bars: ['h.......', 'h.......'], steps: [D(), D(-60)] },
  { bpm: 92, bars: ['x...x...', 'x...x...'], steps: [J(60, 'stump'), J(-60), J(80, 'branch'), J(-80)] },
  { bpm: 134, bars: ['x...x...', 'h.......', 'x...x...'], steps: [J(0, 'crumble'), H(-40, 'branch'), D(60, 'branch'), J(-60), J(0, 'branch')] },
  { bpm: 96, bars: ['x...x...', 'h...x...'], steps: [J(0, 'crumble'), J(0, 'crumble'), D(40, 'branch'), J(-40)] },
  { bpm: 96, bars: ['x..o....', 'h.......', 'x...x..o'], steps: [J(0, 'branch'), H(-30, 'branch'), D(90, 'branch'), J(-90), J(), J(30, 'stump')] },
  { bpm: 85, bars: ['x.......', 'x.......', 'h.......'], steps: [J(-120), J(70, 'bank'), D(-60)] },
];
const traced = NODES.map((n) => ({ spec: n, tr: traceNode({ ...n, x: 1000, y: 580 }) }));
const tracedEasy = NODES.map((n) => { const spec = easyNode({ ...n, x: 1000, y: 580 }); return { spec, tr: traceNode(spec) }; });

// ------------------------------------------------------------------ the ruler ------------------------------------------------------------------

/** a bare world in the real engine: Pokey runs from rest on a long ledge at 1000 and jumps at `at` with the move; where does he land? */
function realJump(move: Move, dy: number): { from: number; to: number } {
  const r = new RealPlay('3-5', 1);
  // (the take-off ledge ends just past where he jumps; the landing starts 40 px short of where the tracer says he comes down)
  const model = flight({ move, dy, vx: PHYS.maxRun })!;
  const run: Platform = { id: 1, x: 0, y: 1000, width: 1112, height: 24, type: 'solid', style: 'branch' };
  const land: Platform = { id: 2, x: Math.round(1100 + model.dx - 40), y: 1000 - dy, width: 900, height: 24, type: 'solid', style: 'branch' };
  r.bare([run, land]);
  r.stand(300, 1000);
  let from = NaN;
  let t = 0, pressed = false, doubled = false;
  for (let i = 0; i < 300; i++) {
    const before = r.p.x;
    if (!pressed && r.p.x >= 1100) {
      pressed = true;
      from = before;
      r.frame({ right: true, press: true });
      t = 0;
      continue;
    }
    if (!pressed) {
      r.frame({ right: true });
      continue;
    }
    t += 1 / 30;
    const hold = move !== 'hop' || t < 0.05;
    if (move === 'double' && !doubled && r.p.vy >= 0) {
      doubled = true;
      r.frame({ right: true, press: true });
      continue;
    }
    r.frame({ right: true, jump: hold });
    if (r.p.grounded && r.standingOn === 2) return { from, to: r.p.x };
    if (r.p.y > 1400) break;
  }
  return { from, to: NaN };
}

test('the tracer flies as the real engine does: a jump, a hop and a double jump land where it says (within a frame of running)', () => {
  for (const move of ['jump', 'hop', 'double'] as const) {
    for (const dy of move === 'hop' ? [0, 30] : [0, 60, -100]) {
      const real = realJump(move, dy);
      const model = flight({ move, dy, vx: PHYS.maxRun, dt: 1 / 60 });
      assert.ok(model, `${move} ${dy}: the tracer finds a landing`);
      assert.ok(Number.isFinite(real.to), `${move} ${dy}: the engine lands him`);
      const dx = real.to - real.from;
      // (the engine lands him inside a frame and moves him on for the rest of it: up to a frame's run past the crossing, and the press is
      // read at a frame's start)
      assert.ok(Math.abs(dx - model!.dx) <= PHYS.maxRun / 30 + 6, `${move} ${dy}: engine ${dx.toFixed(0)} px, tracer ${model!.dx.toFixed(0)} px`);
      // the trace's shortest landing (its 30 Hz flight, less SLOP) is never further than the engine's: the margin is real
      const slow = flight({ move, dy, vx: PHYS.maxRun, dt: 1 / 30 })!;
      assert.ok(dx >= Math.min(model!.dx, slow.dx) - SLOP, `${move} ${dy}: engine ${dx.toFixed(1)} px under the trace's ${(Math.min(model!.dx, slow.dx) - SLOP).toFixed(1)}`);
    }
  }
});

/**
 * A traced node played in the real engine: its ledges as platforms, Pokey running from the entrance apron holding the way on, taking each
 * jump `late` s after the planned take-off (or at the slack's point, TAKEOFF_SLACK before the ledge's end), with `air` of his air speed
 * (as tools/validate/play.ts's clumsy thumb, applied to the distance each air frame covers). Returns the step he fell at, or -1.
 */
function engineRun(tr: ReturnType<typeof traceNode>, steps: readonly Step[], o: { late: number | 'slack'; air: number }, path?: Array<[number, number]>): number {
  const r = new RealPlay('3-5', 1);
  const plats: Platform[] = tr.ledges.map((q, i) => ({
    id: i + 1, x: q.x0, y: q.y, width: q.x1 - q.x0, height: q.surface === 'stump' ? 900 : q.surface === 'branch' ? 24 : 90, type: 'solid',
    style: q.surface === 'branch' ? 'branch' : q.surface === 'stump' ? 'moss_stone' : 'log',
  }));
  r.bare(plats);
  r.stand(tr.x0 + 20, tr.ledges[0].y);
  const lowest = Math.max(...tr.ledges.map((q) => q.y));
  let i = 0, inAir = 0, doubled = true, held = 0;
  for (let f = 0; f < 30 * 40 && r.p.x < tr.x1 - 40; f++) {
    const l = tr.landings[i];
    let press = false;
    if (l && r.p.grounded) {
      const from = tr.ledges.find((q) => q.x0 <= l.fromX + 1 && q.x1 >= l.fromX - 1 && q.y === l.fromY)!;
      const at = o.late === 'slack' ? from.x1 - TAKEOFF_SLACK : l.fromX + PHYS.maxRun * o.late;
      if (r.p.x >= at) {
        press = true;
        held = 0;
        doubled = steps[i].move !== 'double';
        inAir = i;
        i++;
      }
    }
    const s = steps[inAir];
    held++;
    let second = false;
    if (!press && !doubled && !r.p.grounded && r.p.vy >= 0) {
      second = true;
      doubled = true;
    }
    const hold = press || second || (s && (s.move !== 'hop' || held < 2));
    const x0 = r.p.x;
    r.frame({ right: true, press: press || second, jump: !!hold });
    if (!r.p.grounded) r.p.x = x0 + (r.p.x - x0) * o.air;
    path?.push([r.p.x, r.p.y]);
    if (r.p.y > lowest + 120) return inAir;
  }
  return r.p.x >= tr.x1 - 40 ? -1 : 99;
}

test('every traced node is crossed in the real engine by the clumsy thumb: on time, 100 ms late with 15% less air, 100 ms early, at the slack', () => {
  for (const { spec, tr } of traced) {
    for (const o of [{ late: 0, air: 1 }, { late: CLUMSY.late, air: CLUMSY.air }, { late: 0, air: CLUMSY.air }, { late: -CLUMSY.late, air: 1 }, { late: 'slack' as const, air: 1 }]) {
      assert.equal(engineRun(tr, spec.steps, o), -1, `${spec.bars.join('|')} ${JSON.stringify(o)}: fell (step index) or stuck (99)`);
    }
  }
});

test('... and the engine run fails a node built to fail it: each landing ledge pulled 60 px further out (past the margins and its own landing forgiveness), taken at the slack (the tightest try)', () => {
  let fell = 0;
  for (const { spec, tr } of traced) {
    if (!tr.gaps.length) continue;
    const bad = { ...tr, ledges: tr.ledges.map((q) => (tr.gaps.some((g) => g.step === q.step) ? { ...q, x0: q.x0 + 60 } : q)) };
    if (engineRun(bad, spec.steps, { late: 'slack', air: 1 }) !== -1) fell++;
  }
  assert.ok(fell >= traced.length - 1, `only ${fell} of ${traced.length} bad nodes failed`);
});

test('the grid reads the beat, the off-beat and the half-note, and refuses a mark on the wrong slot', () => {
  assert.deepEqual(gridHits(['x..o..h.'].map((b) => b.replace('h', '.'))).map((h) => h.hit), ['beat', 'off']);
  assert.deepEqual(gridHits(['h...x..o']).map((h) => [h.slot, h.hit]), [[0, 'half'], [4, 'beat'], [7, 'off']]);
  assert.throws(() => gridHits(['.x......']), /off-beat slot/);
  assert.throws(() => gridHits(['o.......']), /on-beat slot/);
  assert.throws(() => gridHits(['..h.....']), /half/);
  assert.throws(() => gridHits(['x.x']), /8 eighths/);
});

test('a pattern that cannot be danced is refused: a move still in the air at the next hit, a flat "jump" with no gap', () => {
  // (a double jump is in the air about a second and a half beats: it can't take off again a beat later)
  assert.throws(() => traceNode({ bpm: 92, bars: ['h.x.....'], steps: [D(), J()], x: 0, y: 580 }), /still in the air/);
  // (a hop on the flat goes about 126 px: with the take-off slack and the clumsy thumb there's no gap left to jump)
  assert.throws(() => traceNode({ bpm: 92, bars: ['x.......'], steps: [H()], x: 0, y: 580 }), /no jump at all/);
});

// ------------------------------------------------------------------ 1. the clumsy thumb ------------------------------------------------------------------

test('every landing holds the clumsy thumb: 15% less air speed, 100 ms late, feet at least 8 px inside, on Normal and Easy', () => {
  for (const { spec, tr } of traced) assert.deepEqual(checkTrace(tr, spec.steps), [], spec.bars.join('|'));
  for (const { spec, tr } of tracedEasy) assert.deepEqual(checkTrace(tr, spec.steps, true), [], `easy ${spec.bars.join('|')}`);
  // (and by hand, for the plainest case: late and slow from the planned take-off lands 8 px or more inside)
  const { tr } = traced[0];
  const l = tr.landings[0];
  const slow = flight({ move: 'jump', dy: 0, vx: PHYS.maxRun, air: CLUMSY.air })!;
  const to = tr.ledges.find((q) => q.step === 0)!;
  assert.ok(l.fromX + slow.dx >= to.x0 + INSIDE, 'on time, slow air');
  assert.ok(l.fromX + PHYS.maxRun * CLUMSY.late + slow.dx >= to.x0 + INSIDE, 'late, slow air');
  // the game's own rule too: from TAKEOFF_SLACK before the edge, a full jump still lands
  const from = tr.ledges[0];
  assert.ok(from.x1 - TAKEOFF_SLACK + flight({ move: 'jump', dy: 0, vx: PHYS.maxRun })!.dx >= to.x0 + INSIDE, 'the take-off slack');
});

test('the clumsy check fails a layout built to fail it: each landing ledge pulled 20 px further out', () => {
  for (const { spec, tr } of traced) {
    const bad = { ...tr, ledges: tr.ledges.map((q) => (q.step >= 0 && tr.gaps.some((g) => g.step === q.step) ? { ...q, x0: q.x0 + 20 } : q)) };
    assert.ok(checkTrace(bad, spec.steps).some((m) => /inside/.test(m)), spec.bars.join('|'));
  }
});

test('Easy is gentler than Normal: its landing pads start sooner (a shorter jump), never later', () => {
  for (let i = 0; i < traced.length; i++) {
    const n = traced[i].tr, e = tracedEasy[i].tr;
    for (const g of e.gaps) {
      const ng = n.gaps.find((q) => q.step === g.step);
      if (ng) assert.ok(g.x1 - g.x0 <= ng.x1 - ng.x0 + 1, `${NODES[i].bars.join('|')} step ${g.step + 1}: easy gap ${g.x1 - g.x0} vs normal ${ng.x1 - ng.x0}`);
    }
  }
});

// ------------------------------------------------------------------ 2. on screen at take-off ------------------------------------------------------------------

test('every landing is on screen at take-off, upright and sideways, from the planned, the latest and the slack take-off', () => {
  for (const { tr } of [...traced, ...tracedEasy]) {
    for (const l of tr.landings) {
      const to = tr.ledges.find((q) => q.step === l.step)!;
      const from = tr.ledges.find((q) => q.x0 <= l.fromX + 1 && q.x1 >= l.fromX - 1 && q.y === l.fromY)!;
      for (const v of Object.values(VIEWS)) {
        for (const px of [l.fromX, l.lateX, from.x1 - TAKEOFF_SLACK]) assert.ok(landingInView(px, l.fromY, to.x0, to.y, v.vw, v.vh), `landing ${to.x0} from ${px}`);
      }
    }
  }
});

test('the view check fails what is off screen: a landing 420 px ahead upright, 300 px up, or 600 px down', () => {
  const u = VIEWS.upright, s = VIEWS.sideways;
  assert.ok(landingInView(1000, 580, 1300, 580, u.vw, u.vh), 'a 300 px jump fits upright');
  assert.ok(!landingInView(1000, 580, 1420, 580, u.vw, u.vh), '420 px ahead is off an upright screen');
  assert.ok(landingInView(1000, 580, 1420, 580, s.vw, s.vh), '... and on a sideways one');
  assert.ok(!landingInView(1000, 580, 1200, 230, s.vw, s.vh), '350 px up is past what the camera looks for');
  assert.ok(!landingInView(1000, 580, 1200, 1180, s.vw, s.vh), '600 px down too');
  // and the tracer refuses a node whose landing would be off screen: a double jump down a long drop goes too far for an upright phone
  assert.throws(() => traceNode({ bpm: 85, bars: ['h.......', '........'], steps: [D(-300)], x: 0, y: 580 }), /on screen/);
});

// ------------------------------------------------------------------ 3. aprons and checkpoints ------------------------------------------------------------------

test('every node starts and ends on a flat, safe 200 px apron, with its checkpoint on the entrance apron', () => {
  for (const { tr } of [...traced, ...tracedEasy]) {
    const first = tr.ledges[0], last = tr.ledges[tr.ledges.length - 1];
    assert.equal(first.surface, 'apron');
    assert.ok(first.x1 - first.x0 >= APRON, `entrance ${first.x1 - first.x0}`);
    assert.equal(first.x0, tr.x0);
    // the exit: 200 px of solid footing at the last landing's height, nothing that breaks
    assert.ok(last.surface === 'apron' || last.surface === 'bank' || last.surface === 'branch', last.surface);
    assert.ok(last.x1 - Math.max(last.x0, tr.landings[tr.landings.length - 1].longX) >= APRON, 'exit apron past the furthest landing');
    assert.equal(last.x1, tr.x1);
    assert.equal(last.y, tr.yOut);
    // no gap inside either apron
    for (const g of tr.gaps) assert.ok(g.x0 >= first.x0 + APRON && g.x1 <= tr.x1 - APRON, 'a gap in an apron');
    assert.ok(tr.checkpoint.x >= first.x0 && tr.checkpoint.x <= first.x1 && tr.checkpoint.y === first.y, 'checkpoint on the entrance apron');
  }
});

test('from the checkpoint, standing still, he is at a full run before the first take-off (a respawn is not a weaker jump)', () => {
  for (const { tr } of traced) {
    const run = tr.landings[0].fromX - tr.checkpoint.x;
    // (groundAcc 2600: full speed after 285^2 / 5200 = 16 px)
    assert.ok(run >= (PHYS.maxRun * PHYS.maxRun) / (2 * PHYS.groundAcc) + 40, `${run} px to the first take-off`);
  }
});

// ------------------------------------------------------------------ the beat ------------------------------------------------------------------

test('take-offs sit on the grid: each one at its slot of the BPM, beats on even eighths, off-beats on odd ones', () => {
  for (const { spec, tr } of traced) {
    const eighth = 30 / spec.bpm;
    for (const l of tr.landings) {
      const k = (l.t - APRON / PHYS.maxRun) / eighth;
      assert.ok(Math.abs(k - Math.round(k)) < 1e-6, 'on an eighth');
      assert.equal(l.hit === 'off', Math.round(k) % 2 === 1);
    }
  }
});

test("the stage's BPM is read from its music, as the game picks it (stageMusic, themeById(id).bpm x tempo), never typed", () => {
  const levels = generateAllLevels().filter((l) => l.worldIndex === 1 && l.objectiveType !== 'boss_lair');
  assert.ok(levels.length >= 9);
  for (const l of levels) {
    // (salt 0: the piece and tempo the stage was built to; every other salt plays at the same beat, src/audio/beatMusic.test.ts)
    const m = stageMusic(1, l.id, l.miniIndex, 0, l.objectiveType);
    const want = themeById(m.id)!.bpm * (m.tempo ?? 1);
    const got = stageBpm(l);
    assert.ok(Math.abs(got - want) < 0.06, `${l.id}: ${got} vs the music's ${want}`);
    // (World 1's music: styles.ts world 1 bpm [126, 134], a stage nudged up to 3%)
    assert.ok(got >= 122 && got <= 139, `${l.id}: ${got} BPM`);
  }
});

test("at World 1's music tempo the moves fit its notes: a jump inside a half note, a double inside a whole bar's half and a beat", () => {
  for (const bpm of [126, 130, 136]) {
    const beat = 60 / bpm;
    assert.ok(flight({ move: 'jump', dy: 0, vx: PHYS.maxRun })!.t < 2 * beat, `${bpm}: a jump fits a half note`);
    assert.ok(flight({ move: 'double', dy: 0, vx: PHYS.maxRun })!.t < 3 * beat, `${bpm}: a double fits a dotted half`);
    assert.ok(flight({ move: 'hop', dy: -40, vx: PHYS.maxRun })!.t < 2 * beat, `${bpm}: a hop down fits a half note`);
  }
});

test('the same gap four times running is refused (research 11-04 line 585)', () => {
  assert.throws(() => traceNode({ bpm: 130, bars: ['x...x...', 'x...x...'], steps: [J(), J(), J(), J()], x: 0, y: 580 }), new RegExp(`${GAP_REPEAT} times in a row`));
  // (three, then a change, is fine)
  assert.doesNotThrow(() => traceNode({ bpm: 130, bars: ['x...x...', 'x...x...'], steps: [J(), J(), J(), J(-40)], x: 0, y: 580 }));
});

test('dead walks are found: a run with no input over 2.5 s is listed for the builder to fill', () => {
  const tr = traceNode({ bpm: 130, bars: ['x.......', '........', '........', 'x.......'], steps: [J(), J(-40)], x: 0, y: 580 });
  const w = deadWalks(tr);
  assert.equal(w.length, 1);
  assert.ok(w[0].s > DEAD_WALK && w[0].x1 > w[0].x0);
  for (const { tr } of traced) assert.ok(tr.walks.every((q) => q.s > 1));
});

test('density: take-offs a second over the bars (the intro at 0.4, the research line 533)', () => {
  // (one take-off every 2.5 s at 130 BPM: about one every 5.4 beats; 3 in 4 bars is 0.41 a second)
  const tr = traceNode({ bpm: 130, bars: ['x.......', '......x.', '........', '....x...'], steps: [J(), J(-40), J(40, 'branch')], x: 0, y: 580 });
  assert.ok(Math.abs(tr.density - 3 / (16 * 60 / 130)) < 0.01, `${tr.density}`);
});

// ------------------------------------------------------------------ the avoided lines ------------------------------------------------------------------

test('every take-off has its avoided lines: a beat early, the beat skipped, a hop held or a jump let go', () => {
  for (const { spec, tr } of traced) {
    for (const l of tr.landings) {
      const kinds = tr.avoided.filter((a) => a.step === l.step).map((a) => a.kind).sort();
      assert.deepEqual(kinds, (spec.steps[l.step].move === 'hop' ? ['early', 'held', 'skip'] : ['early', 'skip', 'tapped']).sort());
    }
    // skipping a beat over a gap to a ledge as high or higher drops him into it: the path ends below the take-off (over a drop he may
    // walk off onto the lower ledge, which is no hazard line)
    for (const a of tr.avoided.filter((q) => q.kind === 'skip' && spec.steps[q.step].dy >= 0 && tr.gaps.some((g) => g.step === q.step))) {
      const end = a.path[a.path.length - 1];
      assert.ok(end[1] > tr.landings[a.step].fromY + 40, `skip at step ${a.step + 1} should fall: ends at ${end}`);
    }
  }
});

test('hazard spots on the avoided lines never touch Pokey on the beat, in the real engine, on any clumsy try', () => {
  let n = 0;
  for (const { spec, tr } of traced) {
    const spots = hazardSpots(tr);
    n += spots.length;
    for (const o of [{ late: 0, air: 1 }, { late: CLUMSY.late, air: CLUMSY.air }, { late: -CLUMSY.late, air: 1 }, { late: 'slack' as const, air: 1 }]) {
      const path: Array<[number, number]> = [];
      assert.equal(engineRun(tr, spec.steps, o, path), -1);
      for (const s of spots) {
        // (his body in the engine: 56 x 116 around his feet; a hazard's own body is its spot)
        const hit = path.find(([px, py]) => Math.abs(px - s.x) < 28 && s.y > py - 104 && s.y < py + 12);
        assert.ok(!hit, `${spec.bars.join('|')} ${JSON.stringify(o)}: spot ${s.kind} at ${s.x},${s.y} meets him at ${hit}`);
      }
    }
  }
  assert.ok(n > 20, `${n} spots in all`);
});

test('a held hop has a spot over it (a thorn overhang), and an early jump one where the on-beat run never goes', () => {
  const tr = traced.find((q) => q.spec.steps.some((s) => s.move === 'hop'))!.tr;
  assert.ok(hazardSpots(tr, ['held']).length > 0, 'held');
  assert.ok(traced.some(({ tr }) => hazardSpots(tr, ['early']).length > 0), 'early');
});
