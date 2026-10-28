/**
 * Matt's swing-stage control test (2026-10-26, Android 498x1034 upright, one thumb, stage 1-6): on a liana the touch rules fired 90 jumps
 * he did not mean (65 in the Finish, 10 in the Twist, 8 in the Develop, 7 in the Learn), each one letting go of the vine. The thumb behind
 * them was steering the swing: a long slide left and right, sometimes drifting down, never a flick up. "Vines still feel unrefined. Jump
 * accidentally a lot when I'm trying to collect petals."
 *
 * These tests feed fingers shaped like his logged ones (finger travel from touch-down to the jump, and how long it had been down) through
 * the touch rules with Pokey on a liana, upright and sideways, and check that steering stays steering, while a real flick up and
 * forward (Steph's flicks: their length, speed and lean) still lets go at once.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TouchGestures, TUNING, type GestureSink } from './touchGestures.ts';

/** the two ways his phone is held: the screen width, and where his thumb rests */
const VIEWS = {
  upright: { w: 498, thumbs: [{ x: 330, y: 760 }, { x: 150, y: 760 }] },
  sideways: { w: 1034, thumbs: [{ x: 820, y: 330 }, { x: 220, y: 330 }] },
} as const;

type World = { vine?: boolean; swing?: boolean; rope?: boolean; air?: boolean };

function rig(w: number, world: World) {
  const log: string[] = [];
  const sink: GestureSink = {
    move: (d) => log.push(`move:${d}`),
    duck: (on) => log.push(`duck:${on}`),
    jumpPress: () => log.push('jump'),
    jumpRelease: () => log.push('jumpUp'),
    punch: () => log.push('punch'),
    kick: () => log.push('kick'),
    mega: () => log.push('mega'),
    climb: (d) => log.push(`climb:${d}`),
    feedback: () => {},
  };
  const g = new TouchGestures(sink, () => w, {
    assist: () => true,
    air: () => !!world.air,
    refined: () => true,
    kickNear: () => false,
    onVine: () => !!world.vine,
    onSwing: () => !!world.swing,
    onRope: () => !!world.rope,
  });
  return { g, log, jumps: () => log.filter((l) => l === 'jump').length };
}

/**
 * one finger, down at (x0, y0), following `path` (finger travel at u = 0..1 of `ms`), sampled every `step` ms (a phone reports a moving
 * finger 60 to 120 times a second), with the recogniser's clock ticking as TouchController's does; lifted at the end unless `keep`
 */
function play(t: ReturnType<typeof rig>, x0: number, y0: number, ms: number, path: (u: number) => [number, number], step = 11, keep = false, t0 = 1000) {
  t.g.down(1, x0, y0, t0);
  let jumpAt = -1;
  for (let e = step; e <= ms + 0.01; e += step) {
    const [dx, dy] = path(Math.min(1, e / ms));
    t.g.move(1, x0 + dx, y0 + dy, t0 + e);
    if (Math.floor(e / 100) !== Math.floor((e - step) / 100)) t.g.tick(t0 + e);
    if (jumpAt < 0 && t.jumps() > 0) jumpAt = e;
  }
  const [dx, dy] = path(1);
  if (!keep) t.g.up(1, x0 + dx, y0 + dy, t0 + ms + step);
  return jumpAt;
}

/** the logged fingers: travel from touch-down at the moment of the jump (px, + is down) and how long the finger had been down (ms) */
const LOGGED: [number, number, number][] = [
  [108, 0, 974],
  [120, -10, 1008],
  [94, 10, 532],
  [101, 49, 974],
  [113, 48, 908],
  [72, 145, 841],
];

/**
 * what a steering thumb does on the way there: it pumps the swing left and right (`strokes` half-strokes of `amp` px), and a thumb
 * sweeping across the glass arcs, dipping down or bowing up `arc` px at the ends of each stroke
 */
const pump = (dx: number, dy: number, strokes: number, amp: number, arc: number) => (u: number): [number, number] => {
  const k = Math.sin(u * Math.PI * strokes);
  return [dx * u + amp * k, dy * u + arc * Math.abs(k)];
};
const SHAPES: [string, (dx: number, dy: number) => (u: number) => [number, number]][] = [
  ['a straight slide', (dx, dy) => (u) => [dx * u, dy * u]],
  ['a slow pump that dips', (dx, dy) => pump(dx, dy, 3, 60, 18)],
  ['a quick pump that dips', (dx, dy) => pump(dx, dy, 5, 60, 25)],
  ['a quick pump that bows up', (dx, dy) => pump(dx, dy, 5, 60, -40)],
  ['a big quick pump that bows up', (dx, dy) => pump(dx, dy, 6, 90, -55)],
];

test("Matt's logged swing fingers: pumping a liana sideways (or drifting down) steers it and never lets go, upright and sideways", () => {
  const fired: string[] = [];
  let steered = 0;
  for (const [view, v] of Object.entries(VIEWS)) {
    for (const th of v.thumbs) {
      for (const [dx, dy, ms] of LOGGED) {
        for (const [name, shape] of SHAPES) {
          for (const step of [8, 16]) {
            for (const mirror of [1, -1]) {
              const t = rig(v.w, { vine: true, swing: true });
              play(t, th.x, th.y, ms, (u) => { const [a, b] = shape(dx, dy)(u); return [a * mirror, b]; }, step);
              if (t.jumps() > 0 || t.log.includes('duck:true')) fired.push(`${view} thumb x${th.x} (${dx * mirror},${dy},${ms}) ${name} @${step}ms: ${t.log.filter((l) => l === 'jump' || l === 'duck:true').join(' ')}`);
              if (t.log.some((l) => l === 'move:left' || l === 'move:right')) steered++;
            }
          }
        }
      }
    }
  }
  assert.deepEqual(fired, [], `${fired.length} steering fingers let go of the vine:\n${fired.slice(0, 12).join('\n')}`);
  assert.ok(steered > 0, 'the slides steer the swing');
});

test('pumping a liana left and right for a long while steers it the whole time and never lets go', () => {
  for (const [view, v] of Object.entries(VIEWS)) {
    for (const per of [300, 450, 700]) {
      const t = rig(v.w, { vine: true, swing: true });
      // eight seconds of pumping with the swing, the thumb bowing up 30 px at each end of its stroke
      play(t, v.thumbs[0].x, v.thumbs[0].y, 8000, (u) => {
        const ph = (u * 8000 * Math.PI) / per;
        return [110 * Math.sin(ph), -30 * Math.abs(Math.sin(ph))];
      }, 11);
      assert.equal(t.jumps(), 0, `${view} pumping every ${per} ms: ${t.log.filter((l) => l === 'jump').length} jumps`);
      assert.ok(t.log.includes('move:left') && t.log.includes('move:right'), `${view}: it steers both ways`);
    }
  }
});

test("a clear flick up and forward (Steph's flicks: 110 to 300 px, 0.5 to 1.8 px/ms, 20 to 48 degrees over) lets go at once", () => {
  const deg = (a: number) => (a * Math.PI) / 180;
  for (const [view, v] of Object.entries(VIEWS)) {
    for (const th of v.thumbs) {
      for (const len of [111, 203, 302]) {
        for (const speed of [0.53, 1.0, 1.83]) {
          for (const lean of [22, 27, 35, 41, 48]) {
            for (const side of [1, -1]) {
              const ms = len / speed;
              const t = rig(v.w, { vine: true, swing: true });
              const at = play(t, th.x, th.y, ms, (u) => [side * Math.sin(deg(lean)) * len * u, -Math.cos(deg(lean)) * len * u], 11);
              assert.equal(t.jumps(), 1, `${view} x${th.x} ${len}px ${speed}px/ms ${lean} degrees: ${t.log.join(' ')}`);
              // at once: as soon as the thumb has risen a flick's worth (a slow flick of 0.53 px/ms needs about 110 ms for that)
              assert.ok(at >= 0 && at <= 140, `${view} ${len}px ${speed}px/ms ${lean} degrees: let go after ${at} ms`);
            }
          }
        }
      }
    }
  }
});

test('Matt-style slides: a deliberate slide up and forward lets go; a slow creep up the liana and straight up still climb', () => {
  for (const [view, v] of Object.entries(VIEWS)) {
    const th = v.thumbs[0];
    // a slide up and forward at 0.45 px/ms, 35 degrees over: a release
    let t = rig(v.w, { vine: true, swing: true });
    play(t, th.x, th.y, 240, (u) => [62 * u, -88 * u], 11);
    assert.equal(t.jumps(), 1, `${view}: ${t.log.join(' ')}`);
    // straight up, even quickly: climbs the liana (straight up or down on a vine always climbs)
    for (const ms of [90, 400]) {
      t = rig(v.w, { vine: true, swing: true });
      play(t, th.x, th.y, ms, (u) => [6 * u, -90 * u], 11, true);
      assert.equal(t.jumps(), 0, `${view} straight up in ${ms} ms: ${t.log.join(' ')}`);
      assert.ok(t.log.includes('climb:-1'), `${view}: it climbs`);
    }
    // a slow creep up and over (0.1 px/ms): climbing, not a leap
    t = rig(v.w, { vine: true, swing: true });
    play(t, th.x, th.y, 1000, (u) => [50 * u, -100 * u], 11, true);
    assert.equal(t.jumps(), 0, `${view} creep: ${t.log.join(' ')}`);
  }
});

test('on a climbable vine or trunk: straight up and down climb, a diagonal flick up leaps off, a sideways or downward slide never does', () => {
  for (const [view, v] of Object.entries(VIEWS)) {
    const th = v.thumbs[1];
    let t = rig(v.w, { vine: true });
    play(t, th.x, th.y, 300, (u) => [4 * u, -120 * u], 11, true);
    assert.ok(t.log.includes('climb:-1') && t.jumps() === 0, `${view} up: ${t.log.join(' ')}`);
    t = rig(v.w, { vine: true });
    play(t, th.x, th.y, 300, (u) => [-4 * u, 120 * u], 11, true);
    assert.ok(t.log.includes('climb:1') && t.jumps() === 0 && !t.log.includes('duck:true'), `${view} down: ${t.log.join(' ')}`);
    t = rig(v.w, { vine: true });
    play(t, th.x, th.y, 90, (u) => [40 * u, -75 * u], 11);
    assert.equal(t.jumps(), 1, `${view} diagonal: ${t.log.join(' ')}`);
    for (const [dx, dy, ms] of LOGGED) {
      for (const [name, shape] of SHAPES) {
        t = rig(v.w, { vine: true });
        play(t, th.x, th.y, ms, shape(dx, dy), 11);
        assert.equal(t.jumps(), 0, `${view} trunk (${dx},${dy},${ms}) ${name}: ${t.log.join(' ')}`);
      }
    }
  }
});

test('hanging from a rope: a sideways slide creeps along and never hops off or drops; a flick up hops off, a slide down lets go', () => {
  for (const [view, v] of Object.entries(VIEWS)) {
    const th = v.thumbs[1];
    for (const [dx, dy, ms] of LOGGED) {
      // (the long slide down, 145 px, is the rope's own "slide down to let go": the other five are sideways)
      if (dy > dx) continue;
      for (const [name, shape] of SHAPES) {
        const t = rig(v.w, { rope: true });
        play(t, th.x, th.y, ms, shape(dx, dy), 11);
        assert.ok(t.jumps() === 0 && !t.log.includes('duck:true'), `${view} rope (${dx},${dy},${ms}) ${name}: ${t.log.join(' ')}`);
      }
    }
    let t = rig(v.w, { rope: true });
    play(t, th.x, th.y, 80, (u) => [20 * u, -90 * u], 11);
    assert.equal(t.jumps(), 1, `${view} rope flick up: ${t.log.join(' ')}`);
    t = rig(v.w, { rope: true });
    play(t, th.x, th.y, 300, (u) => [10 * u, 100 * u], 11, true);
    assert.ok(t.log.includes('duck:true'), `${view} rope slide down: ${t.log.join(' ')}`);
  }
});

test("the jump help's down-and-up wiggle: the second jump in the air, never a let-go once he holds a liana, a trunk or a rope", () => {
  for (const [view, v] of Object.entries(VIEWS)) {
    for (const hold of [{ vine: true, swing: true }, { vine: true }, { rope: true }, { air: true }] as World[]) {
      const world: World = {};
      const t = rig(v.w, world);
      const { x, y } = v.thumbs[1];
      const t0 = 1000;
      t.g.down(1, x, y, t0);
      let now = t0;
      const to = (dx: number, dy: number, ms: number) => {
        const n = Math.max(1, Math.round(ms / 11));
        const [x0, y0] = last;
        for (let k = 1; k <= n; k++) t.g.move(1, x0 + ((dx - x0) * k) / n, y0 + ((dy - y0) * k) / n, (now += ms / n));
        last = [dx, dy];
      };
      let last: [number, number] = [x, y];
      to(x + 120, y, 300); // running
      to(x + 130, y - 48, 120); // slide up: the jump that takes him up to it
      assert.equal(t.jumps(), 1, `${view}: ${t.log.join(' ')}`);
      Object.assign(world, hold); // he caught it (or, for the last, he is in the air with a second jump to spare)
      now += 80;
      // the steering thumb wiggles (down 20, up 28) while it keeps pumping sideways
      for (let k = 0; k < 4; k++) {
        to(last[0] + 50, last[1] + 20, 90);
        to(last[0] + 40, last[1] - 28, 110);
        to(last[0] - 90, last[1], 160);
      }
      if (hold.air) assert.ok(t.jumps() >= 2, `${view} in the air the wiggle jumps again: ${t.log.join(' ')}`);
      else assert.equal(t.jumps(), 1, `${view} ${JSON.stringify(hold)}: the wiggle let go (${t.log.join(' ')})`);
    }
  }
  assert.ok(TUNING.vineLeapMaxSlant <= Math.tan((50.5 * Math.PI) / 180), 'a leap off a vine leans no more than 50 degrees over');
});

/**
 * Matt's control tests on the swing stages (2026-10-26 and 27, Android sideways: 1034, 880 and 912 px wide, one thumb): Pokey "stuck" on
 * a liana while Matt flicked again and again. The touches, exactly as logged (ms since the finger went down, screen x, y; the last is the
 * lift): quick strokes up and forward, 55 to 80 degrees over, lifted at once. Every one climbed him up the vine and steered it (it leaned
 * past vineLeapMaxSlant, so it was read as pumping), 31 of them in three sessions, until one happened to lean under 50 degrees.
 */
const MATT_LIANA_FLICKS: [string, number, [number, number, number][]][] = [
  ['10-26 1275572', 1034, [[0, 182, 608], [26, 195, 601], [42, 250, 559], [59, 282, 535], [75, 319, 514], [92, 362, 497], [108, 404, 485], [125, 434, 476], [141, 448, 468], [158, 451, 465], [166, 451, 465]]],
  ['10-26 1277339', 1034, [[0, 146, 657], [41, 176, 641], [58, 207, 633], [75, 240, 622], [91, 287, 602], [108, 334, 578], [124, 366, 562], [141, 390, 555], [158, 410, 550], [174, 426, 547], [191, 437, 545], [208, 437, 545]]],
  ['10-26 1278298', 1034, [[0, 134, 517], [18, 149, 513], [34, 240, 491], [51, 310, 475], [67, 368, 463], [83, 415, 453], [100, 445, 448], [116, 458, 446], [133, 463, 446], [149, 467, 445], [166, 470, 445], [182, 472, 444], [199, 473, 445]]],
  ['10-26 1279781', 1034, [[0, 130, 527], [35, 176, 525], [51, 222, 522], [67, 275, 514], [84, 332, 505], [100, 381, 499], [117, 411, 495], [133, 434, 493], [150, 448, 492], [166, 453, 490], [175, 453, 490]]],
  ['10-26 1233797', 1034, [[0, 154, 689], [25, 168, 684], [41, 215, 665], [58, 251, 656], [75, 287, 650], [91, 306, 648], [108, 317, 647], [124, 329, 646], [141, 343, 644], [158, 361, 641], [174, 381, 639], [191, 401, 638], [208, 420, 639], [224, 430, 641], [241, 433, 641], [258, 433, 641]]],
  ['10-26 1232847', 1034, [[0, 191, 726], [41, 231, 704], [58, 259, 690], [74, 278, 679], [91, 291, 673], [108, 302, 669], [124, 312, 667], [141, 321, 664], [158, 327, 663], [174, 334, 664], [191, 340, 664], [208, 345, 662], [224, 349, 661], [241, 354, 659], [257, 358, 657], [274, 363, 656], [291, 369, 654], [308, 375, 653], [324, 381, 652], [341, 388, 649], [358, 395, 646], [374, 402, 643], [391, 409, 641], [408, 415, 639], [424, 422, 639], [441, 433, 640], [458, 433, 640]]],
  ['10-27 74115', 880, [[0, 618, 160], [26, 625, 158], [34, 651, 150], [42, 664, 146], [50, 674, 143], [59, 680, 140], [67, 686, 138], [75, 691, 135], [83, 698, 133], [91, 704, 131], [100, 711, 129], [108, 720, 127], [116, 729, 125], [124, 740, 123], [133, 753, 120], [141, 767, 118], [149, 779, 116], [157, 790, 115], [166, 799, 114], [174, 805, 114], [182, 809, 113], [191, 811, 113], [215, 812, 113]]],
  ['10-27 76165', 880, [[0, 567, 144], [33, 574, 140], [41, 599, 128], [50, 613, 120], [58, 627, 113], [66, 641, 106], [74, 654, 100], [83, 668, 94], [91, 681, 89], [99, 695, 84], [108, 709, 80], [116, 723, 76], [124, 735, 73], [132, 747, 70], [141, 757, 68], [149, 767, 66], [166, 778, 63], [174, 782, 62], [191, 782, 62]]],
  ['10-27 81300', 880, [[0, 567, 218], [34, 599, 194], [42, 617, 185], [50, 635, 176], [58, 653, 166], [66, 674, 156], [75, 698, 145], [83, 726, 134], [91, 755, 122], [99, 783, 113], [108, 803, 106], [116, 816, 103], [124, 820, 102], [149, 821, 102]]],
  ['10-27 83059', 880, [[0, 563, 193], [32, 595, 182], [41, 611, 179], [49, 625, 177], [57, 637, 175], [66, 647, 174], [74, 656, 172], [82, 666, 170], [90, 676, 166], [99, 687, 164], [107, 698, 160], [115, 710, 157], [124, 722, 153], [132, 736, 149], [140, 751, 145], [149, 764, 141], [157, 776, 139], [165, 783, 138], [174, 786, 137], [190, 786, 137]]],
  ['10-27 257990', 912, [[0, 596, 246], [33, 619, 226], [42, 632, 217], [50, 643, 210], [58, 652, 204], [67, 660, 198], [75, 669, 192], [83, 677, 188], [91, 684, 183], [100, 693, 178], [108, 701, 173], [116, 711, 168], [125, 721, 164], [133, 731, 160], [141, 741, 155], [150, 751, 151], [158, 761, 147], [166, 771, 143], [175, 781, 139], [183, 791, 136], [191, 800, 133], [200, 809, 131], [208, 817, 128], [216, 824, 125], [225, 830, 124], [233, 835, 122], [241, 839, 121], [250, 843, 120], [258, 846, 119], [266, 848, 118], [275, 850, 117], [291, 853, 116], [300, 855, 115], [308, 857, 114], [341, 858, 114]]],
  ['10-27 421493', 912, [[0, 618, 250], [41, 626, 244], [49, 644, 232], [58, 656, 225], [66, 664, 221], [74, 672, 218], [82, 679, 214], [91, 687, 211], [99, 694, 208], [107, 701, 205], [116, 706, 202], [124, 709, 201], [141, 710, 199], [157, 708, 199], [174, 706, 198], [199, 709, 199], [207, 714, 200], [216, 719, 199], [224, 726, 198], [232, 734, 196], [241, 741, 194], [249, 748, 192], [257, 753, 190], [266, 759, 187], [274, 766, 185], [282, 772, 183], [291, 778, 181], [299, 785, 178], [307, 791, 176], [316, 796, 174], [324, 801, 172], [332, 805, 171], [341, 808, 170], [349, 810, 169], [357, 812, 168], [365, 814, 167], [382, 817, 166], [391, 819, 165], [399, 821, 165], [407, 823, 164], [416, 825, 163], [424, 827, 163], [449, 828, 163]]],
];
/** in the same sessions on the same lianas: his slides down the vine (they climbed down, and must go on doing only that) */
const MATT_LIANA_DOWN: [string, number, [number, number, number][]][] = [
  ['10-26 1282573', 1034, [[0, 256, 506], [51, 255, 516], [59, 253, 526], [76, 251, 543], [92, 250, 555], [109, 251, 566], [125, 251, 575], [142, 251, 584], [158, 251, 592], [175, 251, 598], [191, 251, 602], [208, 251, 606], [225, 251, 608], [250, 252, 608]]],
  ['10-27 76815', 880, [[0, 614, 150], [42, 607, 162], [51, 601, 175], [59, 596, 181], [67, 592, 188], [75, 589, 195], [83, 586, 202], [92, 583, 208], [100, 580, 213], [108, 578, 218], [116, 578, 222], [125, 577, 226], [133, 576, 230], [141, 576, 234], [150, 575, 238], [158, 575, 242], [166, 575, 245], [174, 574, 249], [183, 574, 252], [191, 574, 256], [199, 574, 259], [208, 574, 261], [216, 574, 263], [224, 575, 265], [241, 575, 267], [249, 575, 269], [266, 575, 271], [274, 575, 273], [291, 576, 275], [308, 576, 277], [324, 577, 279], [383, 578, 281], [408, 579, 283], [549, 581, 284], [566, 583, 283], [574, 586, 281], [583, 588, 280], [599, 588, 279]]],
];

/** a logged touch replayed: down, each move at its own time (the recogniser's clock ticking every 30 ms between), lifted at the last sample */
function replay(t: ReturnType<typeof rig>, samples: [number, number, number][], t0 = 5000, mirror = 0) {
  const fx = (x: number) => (mirror ? mirror - x : x);
  t.g.down(1, fx(samples[0][1]), samples[0][2], t0);
  let tick = 30;
  for (let i = 1; i < samples.length; i++) {
    const [ms, x, y] = samples[i];
    while (tick < ms) {
      t.g.tick(t0 + tick);
      tick += 30;
    }
    if (i === samples.length - 1) t.g.up(1, fx(x), y, t0 + ms);
    else t.g.move(1, fx(x), y, t0 + ms);
  }
}

test("Matt's logged flicks up and forward off a liana (55 to 80 degrees over, lifted at once) let go, and leap the way they went", () => {
  for (const [name, w, samples] of MATT_LIANA_FLICKS) {
    for (const mirror of [0, w]) {
      for (const world of [{ vine: true, swing: true }, { vine: true }] as World[]) {
        const t = rig(w, world);
        const leans: number[] = [];
        const sink = (t.g as unknown as { sink: GestureSink }).sink;
        const press = sink.jumpPress;
        sink.jumpPress = (lean) => {
          leans.push(lean ?? 0);
          press(lean);
        };
        replay(t, samples, 5000, mirror);
        const where = `${name}${mirror ? ' mirrored' : ''} ${world.swing ? 'liana' : 'trunk'}`;
        assert.equal(t.jumps(), 1, `${where}: ${t.log.join(' ')}`);
        assert.deepEqual(leans, [mirror ? -1 : 1], `${where}: leaps the way the flick went`);
        assert.equal(t.log.filter((l) => l === 'jumpUp').length, 1, `${where}: the jump is released with the lift`);
      }
    }
  }
});

test("on the same lianas Matt's slides down still only climb down, and straight up still only climbs, however quick", () => {
  for (const [name, w, samples] of MATT_LIANA_DOWN) {
    const t = rig(w, { vine: true, swing: true });
    replay(t, samples);
    assert.equal(t.jumps(), 0, `${name}: ${t.log.join(' ')}`);
    assert.ok(t.log.includes('climb:1') && !t.log.includes('duck:true'), `${name}: ${t.log.join(' ')}`);
  }
  for (const [w, x] of [[1034, 200], [880, 600]]) {
    for (const ms of [60, 120, 200]) {
      const t = rig(w, { vine: true, swing: true });
      play(t, x, 600, ms, (u) => [8 * u, -140 * u], 11);
      assert.equal(t.jumps(), 0, `straight up in ${ms} ms, lifted: ${t.log.join(' ')}`);
      assert.ok(t.log.includes('climb:-1'), 'it climbs');
    }
  }
});
