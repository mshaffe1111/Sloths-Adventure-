import test from 'node:test';
import assert from 'node:assert/strict';
import { CELS, CEL_ACTS, CEL_ATLAS_SIZES, CEL_CAST, CEL_FACES, celPoses, celTrack, isCelCode, HEADS } from './storyCels.ts';
import { chapter, N } from './storyDsl.ts';

test('every frame sits inside its atlas and no two frames overlap', () => {
  const by: Record<number, Array<[string, (typeof CELS)[string]]>> = {};
  for (const [k, c] of Object.entries(CELS)) {
    const size = CEL_ATLAS_SIZES[c.a];
    assert.ok(c.x >= 0 && c.y >= 0 && c.x + c.w <= size.w && c.y + c.h <= size.h, `${k} is inside atlas ${c.a}`);
    (by[c.a] ??= []).push([k, c]);
  }
  for (const list of Object.values(by)) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const [ka, a] = list[i];
        const [kb, b] = list[j];
        // the young grandfather (gy.*) is the plain sloth: the same rectangle under a second name
        if (a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h) continue;
        const apart = a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
        assert.ok(apart, `${ka} and ${kb} do not overlap`);
      }
    }
  }
});

test('every cast code has frames, a resting pose that exists and acts made of real frames', () => {
  for (const code of Object.keys(CEL_CAST)) {
    assert.ok(celPoses(code).length > 0, `${code} has poses`);
    assert.doesNotThrow(() => celTrack(code, undefined), `${code} rests`);
  }
  for (const [name, act] of Object.entries(CEL_ACTS)) {
    assert.ok(isCelCode(name.split(':')[0]), `${name} belongs to a code`);
    for (const k of act) for (const fr of Array.isArray(k.frame) ? k.frame : [k.frame]) assert.ok(fr && CELS[fr], `${name} uses ${fr}`);
    for (let i = 1; i < act.length; i++) assert.ok(act[i].at > act[i - 1].at, `${name} is in time order`);
  }
});

test('a pose that does not exist is an error naming the choices', () => {
  assert.throws(() => celTrack('GR', 'dance'), /not a pose of Grandma/);
  assert.throws(() => celTrack('ZZ', 'x'), /not a story-sheet figure/);
});

test('the cast string reaches the painted figures and the speaker frames them', () => {
  const [p] = chapter({ name: 't', w: 1, m: 'day' }, [N('Hello.', 'MS:chair_wait@.3 GR:water@.7*.9 PH:hug_a@.5')]);
  const kinds = (p.scene.actors ?? []).map((a) => a.kind);
  assert.deepEqual(kinds, ['cel', 'cel', 'cel']);
  assert.equal(p.scene.actors![1].cel, 'GR');
  assert.equal(p.scene.actors![1].facing, -1);
  assert.throws(() => chapter({ name: 't', w: 1, m: 'day' }, [N('x', 'GR:nope')]), /not a pose of Grandma/);
});

test("Meeca's face busts are a portrait, change expression in a run, and speak as Meeca", () => {
  // (the story-art repaint, 2026-10-29, kept the faces a story shows: the others went with the old sheets)
  assert.ok(CEL_FACES.includes('beam') && CEL_FACES.includes('weary') && CEL_FACES.includes('drowsy'));
  const [p] = chapter({ name: 't', w: 1, m: 'day' }, [N('Hm.', 'MF:drowsy+weary@.4')]);
  const [a] = p.scene.actors!;
  assert.equal(a.kind, 'cel');
  assert.equal(a.portrait, true);
  assert.deepEqual(a.seq!.map((k) => k.frame), ['face.drowsy', 'face.weary']);
  assert.ok(CEL_CAST.MF.who.includes('Meeca'));
  assert.throws(() => chapter({ name: 't', w: 1, m: 'day' }, [N('x', 'MF:nope')]), /not a pose of Meeca, face/);
});

test('the pink #07 sheets are Meeca and the satchel sheets are Pokey', () => {
  assert.deepEqual(CEL_CAST.MS.who, ['Meeca']);
  for (const code of ['PN', 'PV', 'PX']) assert.deepEqual(CEL_CAST[code].who, ['Pokey'], code);
  assert.ok(!isCelCode('PC') && !isCelCode('MC') && !isCelCode('MB') && !isCelCode('MX'), 'the old, swapped codes are gone');
});

test('the painted speaker heads point at frames that exist', () => {
  for (const [who, h] of Object.entries(HEADS)) assert.ok(CELS[h.key], `${who} head frame`);
});
