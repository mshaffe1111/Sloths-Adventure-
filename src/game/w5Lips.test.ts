/**
 * World 5's lips, played in the real engine the way one thumb plays them (QA gate on v198, 2026-10-26: "the Jen bot", 918 x 370
 * sideways, one thumb). At the soft pits' far side in 5-3, 5-4 and 5-5 she could not get from below onto the ledge, and Pokey ended up
 * "hanging on its side"; the same input worked one try and failed the next. Three causes, each fixed in engine.ts:
 *
 *   1. A thumb's flick leans 20 to 40 degrees off straight up, either way by chance (her p50 is 29). One that leaned away from the step
 *      he faced turned the step help (STEP_UP) the wrong way: straight up and back down, one flick in two. Now the lean is tried first
 *      and the way he faces after it.
 *   2. The lip's hoist set his feet on the ledge but left only a pixel or two of him over its edge, too little for the floor to take
 *      him: he hung in the air at the corner, dropped and was hoisted again, frame after frame. Now it puts a foot on it (LIP_IN).
 *   3. A face stopped him dead, and a thumb lifted after it rose him past the top and straight back down. Now, by touch, a jump into a
 *      face carries him on over its top unless the thumb steers away.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { G } from './protoStage.ts';
import type { Platform } from './types.ts';

/** a thumb on the glass: the touch jump help is the game's own */
function touch(sim: RealPlay) {
  (sim.input as unknown as { source: string }).source = 'gesture';
  return sim;
}

/** a soft pit's far side, bare: the floor (710), the step at the far wall's foot (55 px, 70 wide), the bank (at G) from FAR */
const FAR = 2000;
function pitSide() {
  const sim = touch(new RealPlay('5-4', 1));
  sim.bare([
    { id: 1, x: 0, y: 710, width: 4000, height: 90, type: 'solid', style: 'moss_stone' } as Platform,
    { id: 2, x: FAR - 70, y: 655, width: 70, height: 55, type: 'solid', style: 'moss_stone' } as Platform,
    { id: 3, x: FAR, y: 670, width: 60, height: 44, type: 'solid', style: 'moss_stone' } as Platform,
    { id: 4, x: FAR, y: G, width: 2000, height: 90, type: 'solid', style: 'log' } as Platform,
  ]);
  return sim;
}

/**
 * one or two flicks (`k`: the second this many frames after the first; 0, none), each held 7 frames (MIN_TOUCH_JUMP_HOLD_MS), each
 * leaning `lean` (the flick's slant: -1 up-left, 0 straight, 1 up-right), the thumb off the glass. The height he lands at.
 */
function flicks(sim: RealPlay, lean: -1 | 0 | 1, k: number): number {
  for (let i = 0; i < 120; i++) {
    const press = i === 0 || (k > 0 && i === k);
    if (press) sim.input.state.jumpLean = lean;
    sim.frame({ press, jump: i < 7 || (k > 0 && i >= k && i < k + 7) });
    if (i > 3 && sim.p.grounded) return Math.round(sim.p.y);
  }
  return NaN;
}

test('the lip\'s hoist puts a foot on the ledge: caught at its corner with only a pixel over the edge, he stands, never hangs there', () => {
  const bad: string[] = [];
  for (const over of [0.5, 1, 2, 3, 5, 7]) {
    for (const vx of [0, 10, 30]) {
      for (const feet of [7, 12, 20]) {
        const sim = pitSide();
        // (falling at the bank's face, his body `over` px past it, his feet just under its top: the lip's hoist catches him)
        sim.fly(FAR - 19 + over, G + feet, vx, 50, 0);
        let air = 0;
        for (let i = 0; i < 30; i++) {
          sim.frame();
          if (!sim.p.grounded) air++;
        }
        if (!sim.p.grounded || Math.abs(sim.p.y - G) > 0.5 || air > 3) bad.push(`${over} px over, ${vx} px/s, feet ${feet} under: at ${sim.p.x.toFixed(1)}, ${sim.p.y.toFixed(1)}, ${air} frames in the air`);
      }
    }
  }
  assert.deepEqual(bad, []);
});

test('at a soft pit\'s far side, a flick that leans either way climbs: one up each step, two from the floor up onto the bank', () => {
  const bad: string[] = [];
  for (const lean of [-1, 0, 1] as const) {
    for (const gap of [0, 4, 8, 12]) {
      for (const walked of [false, true]) {
        // (standing right at the face he looks at, or having walked up to it and lifted his thumb)
        const at = (faceX: number, y: number) => {
          const sim = pitSide();
          if (walked) {
            sim.stand(faceX - 19 - gap - 50, y);
            for (let i = 0; i < 40 && sim.p.x < faceX - 19 - gap; i++) sim.frame({ right: true });
          } else {
            sim.stand(faceX - 19 - gap, y);
            sim.p.facing = 1;
            sim.frame();
          }
          return sim;
        };
        const one = flicks(at(FAR - 70, 710), lean, 0);
        if (one !== 655) bad.push(`floor to step, lean ${lean}, ${gap} px off${walked ? ', walked up' : ''}: landed at ${one}`);
        const two = flicks(at(FAR, 655), lean, 0);
        if (two !== G) bad.push(`step to bank, lean ${lean}, ${gap} px off${walked ? ', walked up' : ''}: landed at ${two}`);
        for (const k of [3, 4, 5, 6, 8, 10, 12]) {
          const dbl = flicks(at(FAR - 70, 710), lean, k);
          if (dbl !== G) bad.push(`floor to bank, double flick ${k} frames apart, lean ${lean}, ${gap} px off${walked ? ', walked up' : ''}: landed at ${dbl}`);
        }
      }
    }
  }
  assert.deepEqual(bad, []);
});

test('a jump into a face carries him over its top with the thumb lifted after it, and steering away still drops him back', () => {
  // (a 125 px block: only the second jump climbs it. He steers to it and into it with the first flick, lifts, and flicks again)
  const block = () => {
    const sim = touch(new RealPlay('5-4', 1));
    sim.bare([
      { id: 1, x: 0, y: G, width: 4000, height: 90, type: 'solid', style: 'log' } as Platform,
      { id: 2, x: 1000, y: G - 125, width: 120, height: 125, type: 'solid', style: 'moss_stone' } as Platform,
    ]);
    sim.stand(1000 - 19 - 4, G);
    sim.p.facing = 1;
    sim.frame();
    return sim;
  };
  const bad: string[] = [];
  for (const k of [2, 3, 4, 6, 8, 10]) {
    for (const until of [2, 3, 5, 8]) {
      const sim = block();
      let y = NaN;
      for (let i = 0; i < 90; i++) {
        sim.frame({ press: i === 0 || i === k, jump: i < 7 || (i >= k && i < k + 7), right: i < Math.max(until, k + 1) });
        if (i > 3 && sim.p.grounded) {
          y = Math.round(sim.p.y);
          break;
        }
      }
      if (y !== G - 125) bad.push(`second flick ${k} frames on, steering until frame ${until}: landed at ${y}`);
    }
  }
  assert.deepEqual(bad, []);
  // (steering away after it: he comes back down on the ground, not carried on up)
  const sim = block();
  let y = NaN;
  for (let i = 0; i < 90; i++) {
    sim.frame({ press: i === 0 || i === 5, jump: i < 12, right: i < 4, left: i >= 6 });
    if (i > 3 && sim.p.grounded) {
      y = Math.round(sim.p.y);
      break;
    }
  }
  assert.equal(y, G);
});

/** every face in a stage he could stand beside, below its top: the block, and the floor just left of it (orchids aside) */
function lipsOf(sim: RealPlay): Array<{ q: Platform; floor: number }> {
  const P = sim.platforms;
  const out: Array<{ q: Platform; floor: number }> = [];
  for (const q of P) {
    if (q.type !== 'solid' || q.height < 30 || q.art === 'orchid') continue;
    const xs = q.x - 25;
    const under = P.filter((f) => f.type === 'solid' && f.art !== 'orchid' && f.x <= xs - 10 && f.x + f.width >= xs + 6 && f.y > q.y && f.y - q.y <= 170);
    if (under.length) out.push({ q, floor: Math.min(...under.map((f) => f.y)) });
  }
  return out;
}

for (const id of ['5-3', '5-4', '5-5']) {
  test(`${id} in the real engine: every lip in the stage (its soft pits' steps and banks, its stumps) is climbed by a flick leaning either way`, () => {
    const bad: string[] = [];
    let n = 0;
    for (const seed of [1, 38]) {
      const sim = touch(new RealPlay(id, seed));
      const lips = lipsOf(sim);
      assert.ok(lips.length > 20, `${id} seed ${seed}: ${lips.length} lips`);
      for (const { q, floor } of lips) {
        const rise = floor - q.y;
        // (built for one plain jump, all of them: World 5's tall stumps are 5-1's and 5-2's, w5Fair.test.ts)
        assert.ok(rise <= 96, `${id} seed ${seed}: the lip at ${q.x} is ${rise} px`);
        for (const lean of [-1, 0, 1] as const) {
          for (const gap of [0, 8]) {
            for (const walked of [false, true]) {
              const x0 = q.x - 19 - gap;
              if (walked) {
                sim.stand(x0 - 50, floor);
                for (let i = 0; i < 40 && sim.p.x < x0; i++) sim.frame({ right: true });
              } else {
                sim.stand(x0, floor);
                sim.p.facing = 1;
                sim.frame();
              }
              n++;
              const y = flicks(sim, lean, 0);
              if (!(y <= q.y)) bad.push(`seed ${seed}: the ${rise} px lip at ${q.x} (${q.style}), lean ${lean}, ${gap} px off${walked ? ', walked up' : ''}: landed at ${y}`);
            }
          }
        }
      }
    }
    assert.ok(n > 400, `${n} tries`);
    assert.deepEqual(bad, []);
  });
}
