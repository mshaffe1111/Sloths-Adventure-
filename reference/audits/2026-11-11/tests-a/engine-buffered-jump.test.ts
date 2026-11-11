/**
 * AUDIT A-04 (2026-11-11): the engine has TWO ground-jump paths and only one got the later fixes.
 *   engine.ts ~2241 (a press on the ground):   p.vy = -PHYS.jumpV * drowsyJump(this.drowsy) * this.dragJump
 *   engine.ts ~2471 (a press just before landing, "Jump Buffering"):   p.vy = -PHYS.jumpV
 * The buffered path ignores World 5's webs (WEB_JUMP), World 3's spore clouds (drowsyJump) and every later jump modifier; it also
 * skips the landing step below it, so a crumbling platform landed on with a buffered press never starts to crumble.
 *
 * Proves, on the real 5-6 inside one of its webs: the same jump is weaker pressed on the ground than pressed 2 frames before landing.
 * Fixed looks like: one take-off function used by both paths (same vy for the same place and state), and the landing effects
 * (crumble timer, bounce) run before a buffered jump leaves.
 *
 * Run: npx tsx --test reference/audits/2026-11-11/tests-a/engine-buffered-jump.test.ts
 */
import { makeEngine, standOn, step, type Eng } from './_harness.ts';
import { zoneDrag, inZone } from '../../../../src/game/zones.ts';
import { PHYS } from '../../../../src/game/physics.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';

/** a solid platform of 5-6 whose top is inside a web, and an x on it inside that web */
function webSpot(e: Eng) {
  const zones = e.currentStage.zones;
  for (const z of zones.filter((q: any) => q.kind === 'web')) {
    for (const pl of e.platforms) {
      if (pl.type !== 'solid' || pl.width < 80) continue;
      for (let x = pl.x + 30; x < pl.x + pl.width - 30; x += 10) {
        if (inZone(z, x, pl.y - 30) && zoneDrag(zones, x, pl.y - 30, 0).jump < 1) return { pl, x, k: zoneDrag(zones, x, pl.y - 30, 0).jump };
      }
    }
  }
  throw new Error('5-6 has no platform inside a web');
}

test('A-04 a jump pressed just before landing in a web is the same jump as one pressed standing in it', () => {
  // pressed standing on the ground
  const a = makeEngine('5-6');
  const sa = webSpot(a.e);
  standOn(a.e, sa.pl, sa.x);
  step(a.e, 3);
  a.input.state.jumpPressed = true;
  a.input.state.jumpHeld = true;
  let vyGround = 0;
  for (let i = 0; i < 3 && vyGround === 0; i++) {
    step(a.e, 1);
    if (!a.e.player.grounded && a.e.player.vy < 0) vyGround = a.e.player.vy;
  }

  // pressed in the air just above the same spot, with no second jump left: the press is buffered and fires as he lands
  const b = makeEngine('5-6');
  const sb = webSpot(b.e);
  standOn(b.e, sb.pl, sb.x);
  step(b.e, 3);
  Object.assign(b.e.player, { y: sb.pl.y - 6, vy: 120, grounded: false, jumpsLeft: 0 });
  b.e.coyoteTimer = 0;
  b.input.state.jumpPressed = true;
  b.input.state.jumpHeld = true;
  let vyBuffered = 0;
  for (let i = 0; i < 6 && vyBuffered === 0; i++) {
    step(b.e, 1);
    if (b.e.player.vy < -200) vyBuffered = b.e.player.vy;
  }

  assert.ok(vyGround < 0 && vyBuffered < 0, `both jumps left the ground (ground ${vyGround}, buffered ${vyBuffered})`);
  // (one frame of gravity may separate the two readings: allow it)
  assert.ok(
    Math.abs(vyGround - vyBuffered) < PHYS.gravUp / 30 + 1,
    `in a web (jump x${sa.k}): pressed on the ground he leaves at ${Math.round(vyGround)} px/s, pressed just before landing at ${Math.round(vyBuffered)} px/s (the full ${-PHYS.jumpV})`,
  );
});

test('A-04b a crumbling platform landed on with a buffered jump still starts to crumble', () => {
  const { e, input } = makeEngine('10-2');
  const frag = e.platforms.find((p: any) => p.type === 'fragile')!;
  // five landings in a row, each with the jump pressed just before his feet touch
  for (let n = 0; n < 5; n++) {
    Object.assign(e.player, { x: frag.x + frag.width / 2, y: frag.y - 6, vx: 0, vy: 120, grounded: false, jumpsLeft: 0, climbing: false });
    e.coyoteTimer = 0;
    input.state.jumpPressed = true;
    step(e, 3);
    input.state.jumpPressed = false;
  }
  assert.notEqual(frag.fragileTimer, undefined, 'five buffered landings on a crumbling platform never started its crumble timer');
});
