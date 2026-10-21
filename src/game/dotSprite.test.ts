import test from 'node:test';
import assert from 'node:assert/strict';
import { DOT_ATLAS_SIZE, DOT_FACES, DOT_FRAMES, DOT_POSES, FACE_BOX, flyFrame, isDotFace, isDotPose, poseFrame, restFace, talkFace } from './dotSprite.ts';
import { cast } from './storyDsl.ts';
import { existsSync, statSync } from 'node:fs';

test('every painted Dot frame lies inside the atlas and the frames do not overlap', () => {
  const fr = Object.entries(DOT_FRAMES);
  for (const [n, f] of fr) {
    assert.ok(f.x >= 0 && f.y >= 0 && f.w > 0 && f.h > 0, n);
    assert.ok(f.x + f.w <= DOT_ATLAS_SIZE.w && f.y + f.h <= DOT_ATLAS_SIZE.h, `${n} inside the atlas`);
  }
  for (let i = 0; i < fr.length; i++) {
    for (let j = i + 1; j < fr.length; j++) {
      const [na, a] = fr[i];
      const [nb, b] = fr[j];
      const apart = a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
      assert.ok(apart, `${na} and ${nb} overlap`);
    }
  }
});

test('the atlas file exists and the data has every pose, face and flap frame', () => {
  const p = new URL('../assets/characters/dot-atlas.webp', import.meta.url);
  assert.ok(existsSync(p) && statSync(p).size > 10_000);
  for (const pose of DOT_POSES) assert.ok(DOT_FRAMES[poseFrame(pose, 0)], `pose ${pose}`);
  for (const f of DOT_FACES) assert.ok(DOT_FRAMES[f], `face ${f}`);
  for (let t = 0; t < 2; t += 0.05) assert.ok(DOT_FRAMES[flyFrame(t)]);
  for (let t = 0; t < 3; t += 0.05) assert.ok(isDotFace(talkFace(t)));
});

test('every portrait fits the shared box, so a talking face does not jump about', () => {
  for (const f of DOT_FACES) {
    assert.ok(DOT_FRAMES[f].w <= FACE_BOX.w && DOT_FRAMES[f].h <= FACE_BOX.h, f);
  }
});

test('the flap goes through all four hover paintings and talking uses more than one mouth', () => {
  const seen = new Set<string>();
  for (let t = 0; t < 1; t += 0.01) seen.add(flyFrame(t));
  assert.equal(seen.size, 4);
  const mouths = new Set<string>();
  for (let t = 0; t < 2; t += 0.05) mouths.add(talkFace(t));
  assert.ok(mouths.size >= 4);
});

test('Dot holds the look his line calls for', () => {
  assert.equal(restFace('Are you sure about that?'), 'side');
  assert.equal(restFace('Look out!'), 'grit');
  assert.equal(restFace('Recipient down! ...Recipient up.', true), 'surprise');
  assert.equal(restFace('I am a quiet bird, honestly.'), 'wink');
  assert.equal(restFace('Quiet stage.'), 'closed');
});

test('a cast string can pose Dot, and a pose that does not exist is an error', () => {
  const [a] = cast('D:yelp@.5^.4');
  assert.equal(a.kind, 'dot');
  assert.equal(a.dotPose, 'yelp');
  assert.equal(cast('D@.5')[0].dotPose, undefined);
  assert.equal(cast('D:hover@.5')[0].dotPose, undefined);
  assert.throws(() => cast('D:fly@.5'), /not a Dot pose/);
  assert.ok(isDotPose('cheer') && !isDotPose('cheering'));
});
