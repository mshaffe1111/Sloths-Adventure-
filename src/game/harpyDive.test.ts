import test from 'node:test';
import assert from 'node:assert/strict';
import { startDive, stepDive, stepGlide, DIVE } from './harpyDive.ts';

function fly(player: { x: number; y: number; vx: number }, bird = { x: 1000, y: 320 }, secs = 4) {
  const s = startDive(bird, player);
  let best = 1e9;
  let result: false | 'passed' | 'timeout' = false;
  for (let i = 0; i < secs * 60 && !result; i++) {
    const p = { ...player, x: player.x + player.vx * (i / 60) };
    result = stepDive(bird, s, p, 1 / 60).done;
    best = Math.min(best, Math.hypot(bird.x - p.x, bird.y - (p.y - 28)));
  }
  return { best, result, s, bird };
}

test('the dive goes to the player, wherever the player stands (not to a fixed spot)', () => {
  for (const dx of [-260, -120, 0, 120, 260]) {
    const r = fly({ x: 1000 + dx, y: 600, vx: 0 });
    assert.ok(r.best < 40, `player ${dx}px away: closest ${Math.round(r.best)}px`);
  }
});

test('it follows a player who is running, with a short lead', () => {
  const r = fly({ x: 900, y: 600, vx: 140 });
  assert.ok(r.best < 55, `closest ${Math.round(r.best)}px`);
});

test('it locks its line before contact, so a last-moment jump or duck still dodges', () => {
  const r = fly({ x: 1000, y: 600, vx: 0 });
  assert.equal(r.s.locked, true);
  const bird = { x: 1000, y: 320 };
  const s = startDive(bird, { x: 1000, y: 600, vx: 0 });
  let lockedAt = -1;
  for (let i = 0; i < 300; i++) {
    stepDive(bird, s, { x: 1000, y: 600, vx: 0 }, 1 / 60);
    if (s.locked) { lockedAt = Math.hypot(bird.x - 1000, bird.y - 572); break; }
  }
  assert.ok(lockedAt >= DIVE.lockDist * 0.6 && lockedAt <= DIVE.lockDist + 30, `locked ${Math.round(lockedAt)}px out`);
});

test('a player who runs away makes it give up instead of chasing forever', () => {
  const r = fly({ x: 1000, y: 600, vx: 285 }, { x: 1000, y: 320 }, 6);
  assert.ok(r.result === 'timeout' || r.result === 'passed');
});

test('it never dives below the player\'s feet', () => {
  const bird = { x: 1000, y: 320 };
  const s = startDive(bird, { x: 1000, y: 600, vx: 0 });
  for (let i = 0; i < 400; i++) { stepDive(bird, s, { x: 1000, y: 600, vx: 0 }, 1 / 60); assert.ok(bird.y <= 594.001); }
});

test('after the pass it glides to the player\'s height and closes to punching range', () => {
  const bird = { x: 1300, y: 450 };
  const player = { x: 1000, y: 600 };
  for (let i = 0; i < 180; i++) stepGlide(bird, player, 1 / 60);
  assert.ok(Math.abs(bird.x - player.x) < 110, `${Math.round(Math.abs(bird.x - player.x))}px away`);
  assert.ok(Math.abs(bird.y - (player.y - 30)) < 6);
});
