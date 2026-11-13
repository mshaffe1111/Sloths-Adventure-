import test from 'node:test';
import assert from 'node:assert/strict';
import { clipPick, edgeClip, flipU, footfallsBetween, heroClipsLive, isCalm, IDLE_CLIPS, moveIndex, RUN_FOOTFALLS } from './heroClips.ts';
import { HERO_CLIPS } from './heroClipsData.ts';
import type { PlayerState } from './types.ts';

const ev = { isHurt: () => false, isLanding: () => false, hurtUntil: 0 };
const still = { grounded: true, vx: 0, climbing: false, hanging: false, isVineSwinging: false, punching: false, kicking: false, ducking: false } as PlayerState;

test('clips: only standing quietly counts as calm', () => {
  assert.equal(isCalm(still, 1, ev), true);
  assert.equal(isCalm({ ...still, vx: 40 }, 1, ev), false);
  assert.equal(isCalm({ ...still, grounded: false }, 1, ev), false);
  assert.equal(isCalm({ ...still, climbing: true }, 1, ev), false);
  assert.equal(isCalm(still, 1, { ...ev, isHurt: () => true }), false);
});

test('clips: off by default, so the hero draws as before', () => {
  heroClipsLive(true);
  for (let t = 0; t < 20; t += 0.5) assert.equal(clipPick(still, t, ev), null);
  heroClipsLive(false);
});

test('clips: every sheet is cut at the standard hero size, feet inside the frame', () => {
  for (const [name, c] of Object.entries(HERO_CLIPS)) {
    assert.ok(c.n > (name.startsWith('move-') ? 4 : 8) && c.cols > 0 && c.fps > 0, name); // a strike sheet is a handful of hand-picked frames
    assert.ok(c.ax > 0 && c.ax < c.w && c.ay > c.h * 0.8 && c.ay <= c.h, `${name}: feet at ${c.ax},${c.ay} in ${c.w}x${c.h}`);
    assert.ok(c.h < 320, `${name}: ${c.h} px tall, the standing hero is 200`);
  }
  assert.ok(IDLE_CLIPS.some((n) => HERO_CLIPS[n]), 'at least one idle clip');
});

test('clips: at a ledge end he steps back once, then teeters in a loop; arriving already settled, he teeters at once (X-14)', () => {
  const all = () => true;
  const sb = HERO_CLIPS['step-back'];
  const te = HERO_CLIPS.teeter;
  assert.ok(sb && te, 'both sheets are cut');
  assert.deepEqual(edgeClip(0, true, all), { name: 'step-back', i: 0, blend: 0 });
  assert.equal(edgeClip((sb.n - 0.5) / sb.fps, true, all)?.name, 'step-back');
  const after = sb.n / sb.fps;
  assert.equal(edgeClip(after + 0.01, true, all)?.name, 'teeter');
  // the loop wraps
  assert.equal(edgeClip(after + te.n / te.fps + 0.01, true, all)?.i, 0);
  assert.equal(edgeClip(0.01, false, all)?.name, 'teeter');
  assert.equal(edgeClip(0.01, true, (n) => n !== 'step-back')?.name, 'teeter', 'no step-back sheet: straight to the teeter');
  assert.equal(edgeClip(5, true, () => false), null);
});

test('footsteps land on the run frames\' footfalls: three a loop, none twice, none when he stands still', () => {
  const loop = (Math.PI * 2) / 0.6; // walkCycle per turn of the 15-frame run sheet
  assert.equal(RUN_FOOTFALLS.length, 3);
  assert.equal(footfallsBetween(0, loop), 3, 'one loop passes each footfall once');
  assert.equal(footfallsBetween(0, loop * 10), 30);
  assert.equal(footfallsBetween(1, 1), 0, 'standing still: none');
  assert.equal(footfallsBetween(2, 1), 0, 'a reset cycle (a restart): none');
  // walked a tick at a time (a full run at 30 fps), the ticks add up to the whole: no footfall counted twice or skipped
  let c = 0;
  let k = 0;
  const d = (285 / 30) * 0.08;
  for (let i = 0; i < 300; i++) {
    k += footfallsBetween(c, c + d);
    c += d;
  }
  assert.equal(k, footfallsBetween(0, c));
  // at a full run (285 px/s) about 6.5 footfalls a second: every other one is the 3.3 a second Matt's calmer steps want
  assert.ok(Math.abs(k / 10 - 6.5) < 0.2, `${k / 10} a second`);
});

test('the painted flip runs through its sheet once, eased, and holds its last frame (AN-13)', () => {
  assert.equal(flipU(0), 0);
  assert.ok(flipU(Math.PI) > 0.49 && flipU(Math.PI) < 0.51);
  assert.ok(flipU(Math.PI * 0.2) < 0.1, 'a gentle start');
  assert.equal(flipU(Math.PI * 2), 0.999);
  assert.equal(flipU(40), 0.999, 'the engine may keep counting: the flip stays done');
  assert.equal(moveIndex(12, flipU(40)), 11);
});



test('two-hand climb (R-165.178): his paws land on two strands 70-90 apart, the 4 reaches run one climb cycle, held still he hangs', async () => {
  const { climb2Choice, climb2Frame, CLIMB2_K, CLIMB2_GAP, CLIMB2_TOP, CLIMB2_SX_MIN, CLIMB2_SX_MAX } = await import('./heroClips.ts');
  const { HERO_UNITS, HERO_SPRITE_SCALE } = await import('./heroSprite.ts');
  const C = (await import('../assets/hero/hero-climb2.json')).default as unknown as { stand_px: number; cycle: string[]; still: string; frames: Record<string, { w: number; h: number; grips: number[][]; ax: number }> };
  // drawn at his own height (D41: 89.1 units, read from the code), and the painted gap is FEEL-LATTICE's 80
  assert.ok(Math.abs(C.stand_px * CLIMB2_K - HERO_UNITS * HERO_SPRITE_SCALE) < 0.01);
  assert.ok(Math.abs(CLIMB2_GAP - 80) < 1.5, `painted gap ${CLIMB2_GAP}`);
  // the cycle: four different reaches in order over one cycle; the still hang when held
  const seen = [0.05, 0.3, 0.55, 0.8].map((u) => climb2Choice(u, true, 80).name);
  assert.deepEqual(seen, C.cycle);
  assert.equal(climb2Choice(0.3, false, 80).name, C.still);
  // the width follows the strands so each paw closes on its own vine (both ends of the field's 70-90 reach), clamped beyond it
  for (const pair of [70, 80, 90]) {
    const { sx } = climb2Choice(0, true, pair);
    for (const n of [...C.cycle, C.still]) {
      const f = C.frames[n];
      const gx = Math.abs(f.grips[1][0] - f.grips[0][0]) * CLIMB2_K * sx;
      assert.ok(Math.abs(gx - pair) < 3, `${n}: paws ${gx.toFixed(1)} apart on strands ${pair} apart`);
      // and the body hangs between them: the anchor is the paws' midpoint
      assert.ok(Math.abs((f.grips[0][0] + f.grips[1][0]) / 2 - f.ax) < 1, `${n} not centred between its paws`);
    }
  }
  assert.equal(climb2Choice(0, true, 400).sx, CLIMB2_SX_MAX);
  assert.equal(climb2Choice(0, true, 10).sx, CLIMB2_SX_MIN);
  // the frame top (his highest paw) sits where the single climb's paws were; every frame's feet stay above his feet line
  for (const n of [...C.cycle, C.still]) {
    const f = climb2Frame(n)!;
    assert.ok(Math.abs(f.ay * CLIMB2_K - CLIMB2_TOP) < 1e-6);
    assert.ok(f.ay >= f.h, `${n}: toes below his feet line`);
  }
  assert.equal(climb2Frame('nope'), null);
});
