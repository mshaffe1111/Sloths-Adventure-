import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSave, parseSave, applySave, resetProgress, isSaveKey, checksum, saveFileName, SAVE_FORMAT, type Store } from './saveFile.ts';

function memStore(init: Record<string, string> = {}): Store & { m: Map<string, string> } {
  const m = new Map(Object.entries(init));
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), keys: () => [...m.keys()] };
}

const sample = {
  'sloth_lvl_1-1': JSON.stringify({ completed: true, stars: 3, highScore: 900, bestTime: 41 }),
  'sloth_lvl_1-2': JSON.stringify({ completed: true, stars: 2, highScore: 700, bestTime: 55 }),
  'sloth_lvl_S-1': JSON.stringify({ completed: true, stars: 0, highScore: 0, bestTime: 0 }),
  sloth_story_w1: '1',
  sloth_thorn_heart: '1',
  sloth_music_vol: '0.6',
  sloth_hint_v3: '1', // not part of a save
  some_other_site_key: 'nope',
};

test('a save holds only the game entries, with a truthful summary', () => {
  const s = buildSave(memStore(sample), new Date('2026-10-18T12:00:00Z'));
  assert.equal(s.format, SAVE_FORMAT);
  assert.ok(!('sloth_hint_v3' in s.data) && !('some_other_site_key' in s.data));
  assert.equal(s.summary.stagesCleared, 3);
  assert.equal(s.summary.stars, 5);
  assert.equal(s.summary.worldsStarted, 1);
  assert.equal(s.summary.secret, true);
});

test('save → file text → load round-trips exactly', () => {
  const s = buildSave(memStore(sample));
  const r = parseSave(JSON.stringify(s, null, 2));
  assert.ok(r.ok);
  if (!r.ok) return;
  const target = memStore({ 'sloth_lvl_5-5': JSON.stringify({ completed: true, stars: 1 }), sloth_hint_v3: '1' });
  applySave(target, r.save);
  assert.equal(target.getItem('sloth_lvl_1-1'), sample['sloth_lvl_1-1']);
  assert.equal(target.getItem('sloth_lvl_5-5'), null, 'old progress is replaced, not merged');
  assert.equal(target.getItem('sloth_hint_v3'), '1', 'unrelated entries are left alone');
});

test('damaged, edited, foreign and oversized files are refused', () => {
  const good = JSON.stringify(buildSave(memStore(sample)));
  assert.ok(parseSave(good).ok);
  assert.ok(!parseSave('not json at all').ok);
  assert.ok(!parseSave('{"hello":1}').ok);
  assert.ok(!parseSave(good.slice(0, good.length - 40)).ok, 'truncated');
  const edited = JSON.parse(good);
  edited.data['sloth_lvl_1-1'] = JSON.stringify({ completed: true, stars: 3, highScore: 999999, bestTime: 1 });
  assert.ok(!parseSave(JSON.stringify(edited)).ok, 'edited without fixing the checksum');
  const newer = JSON.parse(good);
  newer.version = 99;
  assert.ok(!parseSave(JSON.stringify(newer)).ok, 'from a newer game');
  assert.ok(!parseSave('x'.repeat(300_000)).ok, 'too big');
});

test('unknown keys inside a save are never written', () => {
  const s = buildSave(memStore(sample));
  const sneaky = JSON.parse(JSON.stringify(s));
  sneaky.data['evil_key'] = '1';
  sneaky.data['sloth_lvl_../../x'] = '1';
  sneaky.checksum = checksum(sneaky.data);
  const r = parseSave(JSON.stringify(sneaky));
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.ok(!('evil_key' in r.save.data));
  assert.ok(!('sloth_lvl_../../x' in r.save.data));
});

test('only game entries count as save keys', () => {
  for (const k of ['sloth_lvl_1-1', 'sloth_lvl_10-10', 'sloth_lvl_S-1', 'sloth_story_w3', 'sloth_secret_gate', 'sloth_game_muted']) assert.ok(isSaveKey(k), k);
  for (const k of ['sloth_hint_v3', 'sloth_lvl_', 'sloth_lvl_1-1; drop', 'token', '__proto__']) assert.ok(!isSaveKey(k), k);
});

test('file name carries the date', () => {
  assert.equal(saveFileName(new Date(2026, 9, 18)), 'sloths-save-2026-10-18.json');
});

test('a new game forgets progress and the secret but keeps sound settings and unrelated keys', () => {
  const st = memStore({ ...sample, sloth_secret_gate: '1', sloth_sfx_vol: '0.4', sloth_game_muted: '1' });
  resetProgress(st);
  assert.equal(st.m.has('sloth_lvl_1-1'), false);
  assert.equal(st.m.has('sloth_story_w1'), false);
  assert.equal(st.m.has('sloth_thorn_heart'), false);
  assert.equal(st.m.has('sloth_secret_gate'), false);
  assert.equal(st.m.get('sloth_music_vol'), '0.6');
  assert.equal(st.m.get('sloth_sfx_vol'), '0.4');
  assert.equal(st.m.get('sloth_game_muted'), '1');
  assert.equal(st.m.get('sloth_hint_v3'), '1');
  assert.equal(st.m.get('some_other_site_key'), 'nope');
});

test('a new game can skip the story: every world story beat is marked seen', () => {
  const st = memStore(sample);
  resetProgress(st, { skipStory: true });
  for (let w = 1; w <= 10; w++) assert.equal(st.m.get(`sloth_story_w${w}`), '1');
  assert.equal(st.m.has('sloth_lvl_1-1'), false);
});
