import test from 'node:test';
import assert from 'node:assert/strict';
import { BONUS_FIND, FINDS, FIND_BY_ID, FIND_STAGE, FIND_STAGE_IN, allFound, findForStage, findStage, parseFinds, withFind, type FindKind } from './finds.ts';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { validateStage } from './levelCheck.ts';

const levels = generateAllLevels();

test('every find is well formed', () => {
  assert.equal(new Set(FINDS.map((f) => f.id)).size, FINDS.length, 'ids are unique');
  for (const f of FINDS) {
    assert.equal(f.id, `w${f.world}_${f.kind}`, `${f.id} is named for its world and kind`);
    assert.ok(f.world >= 1 && f.world <= 10);
    assert.ok(f.pages.length >= 1, `${f.id} has a page`);
    assert.ok(f.title.length > 0 && f.hint.length > 0);
    if (f.kind === 'book') for (const p of f.pages) assert.ok(p.photo && p.caption, `${f.id}: every book page has a photo and a caption`);
    if (f.kind === 'keepsake') assert.ok(f.icon, `${f.id} has an icon`);
    if (f.kind === 'note') assert.ok(f.paper, `${f.id} has a paper`);
  }
});

test('finds never share a stage with a boss or the Thorn Gate', () => {
  for (const mini of Object.values(FIND_STAGE)) {
    assert.ok(mini >= 1 && mini <= 9, 'not the boss stage');
    assert.notEqual(mini, 7, 'stage 7 hides the Thorn Gate in World 7');
  }
  assert.equal(new Set(Object.values(FIND_STAGE)).size, Object.keys(FIND_STAGE).length, 'a different stage for each kind');
  for (const [w, kinds] of Object.entries(FIND_STAGE_IN)) {
    const at = Object.keys(FIND_STAGE).map((k) => findStage(Number(w), k as FindKind));
    assert.equal(new Set(at).size, at.length, `world ${w}: a different stage for each kind`);
    for (const m of Object.values(kinds)) assert.ok(m! >= 1 && m! <= 9 && m !== 7, `world ${w}: not the boss or the Thorn Gate`);
  }
});

test('each find sits in its own stage, on ground the player can reach, clear of the start and exit', () => {
  for (const l of levels) {
    const expected = findForStage(l.worldIndex, l.miniIndex);
    const stage = generateStage(l);
    const here = stage.collectibles.filter((c) => c.type === 'find');
    if (!expected) {
      assert.equal(here.length, 0, `${l.id} should hide nothing`);
      continue;
    }
    assert.equal(here.length, 1, `${l.id} hides exactly one find`);
    const c = here[0];
    assert.equal(c.findId, expected.id);
    assert.equal(c.hidden, expected.kind !== 'note');
    const res = validateStage(stage);
    assert.equal(res.ok, true, `${l.id} still passes the validator: ${res.errors.slice(0, 2).join('; ')}`);
    const plat = stage.platforms.find((p) => p.type === 'solid' && c.x >= p.x && c.x <= p.x + p.width && Math.abs(p.y - (c.y + 26)) < 1);
    assert.ok(plat, `${l.id}: the find stands on a solid platform`);
    assert.ok(res.reachableIds.includes(plat!.id), `${l.id}: the platform is reachable`);
    assert.ok(Math.abs(c.x - stage.spawnX) > 320 && Math.abs(c.x - stage.exitTotemX) > 320, `${l.id}: away from the start and the exit`);
  }
});

test('random layouts still place the find almost every time and stay beatable', () => {
  const sample = levels.filter((l) => findForStage(l.worldIndex, l.miniIndex)).filter((_, i) => i % 3 === 0);
  let placed = 0;
  try {
    for (const l of sample) {
      setLayoutVariant(11);
      const stage = generateStage(l);
      assert.equal(validateStage(stage).ok, true, l.id);
      if (stage.collectibles.some((c) => c.type === 'find')) placed++;
    }
  } finally {
    setLayoutVariant(null);
  }
  assert.ok(placed >= sample.length * 0.9, `placed ${placed} of ${sample.length}`);
});

test('what has been found is read back safely', () => {
  assert.deepEqual(parseFinds(null), []);
  assert.deepEqual(parseFinds('not json'), []);
  assert.deepEqual(parseFinds(JSON.stringify({ v: 2, found: ['w1_note'] })), []);
  assert.deepEqual(parseFinds(JSON.stringify({ v: 1, found: ['w1_note', 'w1_note', 'nope', 7] })), ['w1_note']);
  assert.deepEqual(withFind([], 'w1_book'), ['w1_book']);
  assert.deepEqual(withFind(['w1_book'], 'w1_book'), ['w1_book']);
  assert.deepEqual(withFind([], 'nope'), []);
  assert.ok(FIND_BY_ID['w2_keepsake']);
});

test('the bonus token opens only when all 30 are found, and is never stored or hidden in a stage', () => {
  assert.equal(FINDS.length, 30);
  assert.equal(allFound([]), false);
  assert.equal(allFound(FINDS.slice(1).map((f) => f.id)), false);
  assert.equal(allFound(FINDS.map((f) => f.id)), true);
  assert.equal(FIND_BY_ID[BONUS_FIND.id], BONUS_FIND, 'the reader can look it up');
  assert.equal(FINDS.some((f) => f.id === BONUS_FIND.id), false, 'it is not one of the hidden finds');
  assert.deepEqual(withFind([], BONUS_FIND.id), [], 'it is never added to the found list');
  assert.deepEqual(parseFinds(JSON.stringify({ v: 1, found: [BONUS_FIND.id, 'w1_note'] })), ['w1_note']);
  for (let w = 1; w <= 10; w++) for (let m = 1; m <= 10; m++) assert.notEqual(findForStage(w, m)?.id, BONUS_FIND.id);
});
