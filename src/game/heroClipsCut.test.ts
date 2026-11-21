/**
 * R-165.382 (ART-CHEER, 11-21): a switch into or out of one of Pokey's clips is a CUT, never a cross-fade. A cross-fade of two different
 * poses draws two see-through sloths at once (the cheer at the exit showed two heads and two sets of arms for 6-7 frames; hurt, step-back
 * and teeter did the same; the lead's rule after R-165.373: a cross-fade of two poses is never the answer). Where a clip meets his plain
 * pose, it meets it on a painted frame (the idle clips' ends, heroClipsEnds.test.ts), so the cut does not pop.
 * The clip sheets are stubbed as loaded (node has no Image), then every kind of clip moment is sampled frame by frame at 30 fps.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { PlayerState } from './types.ts';

class FakeImage {
  onload: (() => void) | null = null;
  complete = true;
  naturalWidth = 1;
  set src(_v: string) {
    this.onload?.();
  }
}
(globalThis as unknown as { Image: unknown }).Image = FakeImage;
const { clipPick, heroClipsLive, resetHeroClips, warmHeroClips, IDLE_CLIPS } = await import('./heroClips.ts');

const calm = { isHurt: () => false, isLanding: () => false, hurtUntil: 0 };
const still = { grounded: true, vx: 0, facing: 1, climbing: false, hanging: false, isVineSwinging: false, punching: false, kicking: false, ducking: false } as PlayerState;

/** every frame clipPick gives for `secs` seconds from `t0` at the game's 30 fps: the clip's name and whether it draws alone */
function sample(p: PlayerState, t0: number, secs: number, ev = calm) {
  resetHeroClips();
  const out: { t: number; name: string; layered: boolean }[] = [];
  for (let k = 0; k <= secs * 30; k++) {
    const t = t0 + k / 30;
    const c = clipPick(p, t, ev);
    if (c) out.push({ t, name: c.name, layered: 'blend' in c && (c as { blend?: number }).blend !== 1 });
  }
  return out;
}
function assertCut(what: string, frames: ReturnType<typeof sample>) {
  assert.ok(frames.length > 0, `${what}: no clip played (the sheets are stubbed as loaded)`);
  const bad = frames.filter((f) => f.layered);
  assert.equal(bad.length, 0, `${what}: ${bad.length} frames drawn over a second pose (first ${bad[0]?.name} at t ${bad[0]?.t.toFixed(2)})`);
}

test('every clip switch is a cut: the cheer, the idles, the ouch, the step-back and the teeter each draw alone', () => {
  heroClipsLive(true);
  warmHeroClips();
  // the cheer at the exit, arriving at a run and standing
  assertCut('cheer (arriving at a run)', sample({ ...still, vx: 120, cheerAt: 100 }, 100, 2));
  assertCut('cheer (standing)', sample({ ...still, cheerAt: 100 }, 100, 2));
  // standing still: the idle clips one after another, their starts and ends included
  const idle = sample(still, 200, 60);
  assertCut('idle clips', idle);
  for (const n of IDLE_CLIPS) assert.ok(idle.some((f) => f.name.startsWith(`${n}#`)), `${n}: did not play in a minute of standing`);
  // just hit and standing still: the ouch
  assertCut('ouch', sample(still, 300, 4, { ...calm, hurtUntil: 300.01 }));
  // at a ledge's end facing the drop: the step back, then the teeter
  assertCut('step-back and teeter', sample({ ...still, edgeSide: 1 } as PlayerState, 400, 5));
  heroClipsLive(false);
});

test('the hero draw never layers the plain pose under a clip (no see-through second sloth)', () => {
  const src = readFileSync(new URL('./heroSprite.ts', import.meta.url), 'utf8');
  assert.ok(!/1\s*-\s*clip\.blend/.test(src), 'heroSprite.ts draws the ordinary pose at (1 - clip.blend) under a clip: a cross-fade of two poses');
  assert.ok(!/clip\.blend/.test(src), 'heroSprite.ts still fades a clip in by clip.blend');
});
