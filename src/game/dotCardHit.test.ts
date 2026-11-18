import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CardTrail, TRAIL_MS } from './dotCardHit.ts';

// R-165.201: Dot's card perched, sliding with the camera at a mushroom bounce (1-2): FIX-A's real-page runs had it move about 30 px a
// frame; the finger aimed at where the player SAW it lands a few frames later, beside the box it is drawn in now.
function bounce(trail: CardTrail, t0: number) {
  // 12 frames at 30 fps, the card 220 x 70 sliding up 30 px a frame from y 400
  for (let i = 0; i < 12; i++) trail.note(100, 400 - 30 * i, 220, 70, t0 + i * 33.3);
  return t0 + 11 * 33.3;
}

test('dotCardHit: a finger on where the card was drawn a moment ago is the card\'s, mid-bounce (the planted case: 3 of 10 punched)', () => {
  const trail = new CardTrail();
  const now = bounce(trail, 1000);
  // the card is now at y 70..140; the finger lands at y 250, where the card was 6 frames (200 ms) ago: the card's, not a punch
  assert.equal(trail.hit(210, 250, now + 5), true);
  // where it was 11 frames (371 ms) ago is past the trail: the game's
  assert.equal(trail.hit(210, 420, now + 5), false);
  // where it is now: the card's too (the DOM box takes it first on the page; the trail agrees)
  assert.equal(trail.hit(210, 100, now + 5), true);
  // beside every box it was in: the game's
  assert.equal(trail.hit(20, 420, now + 5), false);
  assert.equal(trail.hit(210, 600, now + 5), false);
});

test('dotCardHit: only the last TRAIL_MS counts, so a real jump or punch near a card is not eaten', () => {
  const trail = new CardTrail();
  trail.note(100, 400, 220, 70, 1000);
  trail.note(100, 100, 220, 70, 1000 + 33);
  // the box at y 400 was last drawn at 1000: a finger there TRAIL_MS later is the game's again
  assert.equal(trail.hit(210, 420, 1000 + TRAIL_MS - 1), true);
  assert.equal(trail.hit(210, 420, 1000 + TRAIL_MS + 1), false);
  // a card that stays put stays the card's for as long as it is up (its box's time moves on with each frame)
  for (let t = 1100; t < 5000; t += 33) trail.note(100, 100, 220, 70, t);
  assert.equal(trail.hit(210, 120, 5000), true);
  assert.ok(TRAIL_MS <= 300, 'a reaction, not longer');
});

test('dotCardHit: a claimed finger never reaches the game; its lift taps the card once, a cancel taps nothing; a card taken down frees the spot', () => {
  const trail = new CardTrail();
  let taps = 0;
  trail.setTap(() => taps++);
  // (every box in these tests is card 0's)
  const now = bounce(trail, 1000);
  assert.equal(trail.claim(7, 210, 250, now), true);
  assert.equal(trail.owns(7), true);
  trail.release(7, true);
  assert.equal(taps, 1);
  assert.equal(trail.owns(7), false);
  // released twice (a duplicate lift): one tap
  trail.release(7, true);
  assert.equal(taps, 1);
  // a system gesture took it: no tap
  assert.equal(trail.claim(8, 210, 250, now), true);
  trail.release(8, false);
  assert.equal(taps, 1);
  // a finger beside the card is the game's
  assert.equal(trail.claim(9, 20, 250, now), false);
  assert.equal(trail.owns(9), false);
  // a finger whose lift was never reported (CT-16) is let go when the glass no longer has it, and a new finger with its number starts fresh
  assert.equal(trail.claim(10, 210, 250, now), true);
  trail.keepOnly([]);
  assert.equal(trail.owns(10), false);
  assert.equal(trail.claim(11, 210, 250, now), true);
  assert.equal(trail.claim(11, 20, 900, now + 10), false);
  assert.equal(trail.owns(11), false);
  // the card is down (gone, paused): its old spots are the game's at once
  trail.clear();
  assert.equal(trail.hit(210, 100, now + 1), false);
});

test('dotCardHit: the touch layer asks the trail before any gesture, on every down, move, lift and cancel (TouchController.tsx)', () => {
  // (the component's own handlers: the safety net's window listener above them has an onEnd of its own)
  const all = readFileSync(new URL('../components/TouchController.tsx', import.meta.url), 'utf8');
  const src = all.slice(all.indexOf('const onStart'));
  // the claim comes before the finger is handed to the gestures or the recorder
  const start = src.slice(src.indexOf('const onStart'), src.indexOf('const onMove'));
  assert.ok(start.indexOf('cardTrail.claim(') > 0 && start.indexOf('cardTrail.claim(') < start.indexOf('G.down('), 'claim before G.down');
  assert.ok(start.includes('cardTrail.keepOnly('), 'stale claims let go with the gestures\' own');
  const move = src.slice(src.indexOf('const onMove'), src.indexOf('const onCancel'));
  assert.ok(move.indexOf('cardTrail.owns(') < move.indexOf('G.move('), 'a claimed finger never steers');
  const cancel = src.slice(src.indexOf('const onCancel'), src.indexOf('const onEnd'));
  assert.ok(cancel.includes('cardTrail.release(') && cancel.indexOf('cardTrail.owns(') < cancel.indexOf('G.cancelFinger('));
  const end = src.slice(src.indexOf('const onEnd'), src.indexOf('return ('));
  assert.ok(end.indexOf('cardTrail.owns(') < end.indexOf('G.up('), 'a claimed finger never jumps or punches on its lift');
  // and the card's view feeds the trail with every box it draws the card in, and clears it when the card is down
  const dg = readFileSync(new URL('../components/dot/DotGuide.tsx', import.meta.url), 'utf8');
  assert.ok(dg.includes('cardTrail.note(bx, by, run.bw, run.bh, now, cur.n)'), 'each frame the card is drawn');
  // (and each frame of its fade, where it last stood: the second case the real page found, a card fading at its reading time)
  const fade = dg.slice(dg.indexOf('!cur && now < run.fadeUntil'));
  assert.ok(fade.indexOf('cardTrail.note(run.lastBx, run.lastBy, run.bw, run.bh, now, run.trailN)') > 0 && fade.indexOf('cardTrail.note(') < fade.indexOf('} else {'));
  assert.ok((dg.match(/cardTrail\.clear\(\)/g) ?? []).length >= 2, 'paused or unmounted: nothing is the card\'s');
  assert.ok(dg.includes('cardTrail.setTap((n)') && dg.includes('c.n !== n'), 'a trail tap taps only the card the finger went down on');
});

test('dotCardHit: a card fading out at its reading time is still the card\'s under the finger (the real page\'s second case: 3 of 20 runs)', () => {
  const trail = new CardTrail();
  const tapped: number[] = [];
  trail.setTap((n) => tapped.push(n));
  // card 4 up at (134, 160) until 5000, then its 0.3 s fade where it stood (DotGuide notes each frame of it), then gone
  for (let t = 4000; t <= 5000; t += 33) trail.note(100, 160, 220, 70, t, 4);
  for (let t = 5033; t <= 5300; t += 33) trail.note(100, 160, 220, 70, t, 4);
  // the finger lands 150 ms after the fade ended, where the player saw the fading card: the card's, not a punch
  assert.equal(trail.claim(1, 134, 195, 5450), true);
  trail.release(1, true);
  assert.deepEqual(tapped, [4]);
  // past the trail it is the game's again
  assert.equal(trail.claim(2, 134, 195, 5300 + TRAIL_MS + 1), false);
});

test('dotCardHit: a finger on where the last card stood taps that card, never the one that has just replaced it elsewhere', () => {
  const trail = new CardTrail();
  const tapped: number[] = [];
  trail.setTap((n) => tapped.push(n));
  trail.note(100, 160, 220, 70, 1000, 7);
  trail.note(500, 600, 220, 70, 1033, 8);
  assert.equal(trail.claim(1, 134, 195, 1100), true);
  trail.release(1, true);
  assert.equal(trail.claim(2, 600, 620, 1100), true);
  trail.release(2, true);
  assert.deepEqual(tapped, [7, 8]);
});
