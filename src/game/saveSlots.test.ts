import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Store } from './saveFile.ts';
import {
  ACTIVE_KEY,
  JOURNAL_KEY,
  SLOT_DATA_VERSION,
  dataKey,
  eraseSlot,
  freeSlot,
  keyClass,
  listSlots,
  recoverSlots,
  renameSlot,
  switchSlot,
} from './saveSlots.ts';

/** a phone's storage; `failAfter` makes the Nth write throw (a full phone), `cut` stops the process at the Nth write (a kill) */
function memStore(init: Record<string, string> = {}, opts: { quota?: number } = {}) {
  const m = new Map(Object.entries(init));
  let writes = 0;
  const s: Store & { map: Map<string, string>; cutAt?: number } = {
    map: m,
    getItem: (k) => (m.has(k) ? m.get(k)! : null),
    setItem: (k, v) => {
      writes++;
      if (s.cutAt !== undefined && writes > s.cutAt) throw new Error('killed');
      const size = [...m.entries()].reduce((a, [kk, vv]) => a + (kk === k ? 0 : kk.length + vv.length), 0) + k.length + v.length;
      if (opts.quota !== undefined && size > opts.quota) throw new Error('QuotaExceededError');
      m.set(k, v);
    },
    removeItem: (k) => {
      writes++;
      if (s.cutAt !== undefined && writes > s.cutAt) throw new Error('killed');
      m.delete(k);
    },
    keys: () => [...m.keys()],
  };
  return s;
}

/** an old single save from before slots: Worlds 1-3 cleared, finds, Dot's memory, a seed, settings and sound */
function oldSave(): Record<string, string> {
  const d: Record<string, string> = {};
  for (let w = 1; w <= 3; w++)
    for (let st = 1; st <= 10; st++) d[`sloth_lvl_${w}-${st}`] = JSON.stringify({ completed: true, stars: 2 + (st % 2), bestTime: 90, highScore: 1200 });
  Object.assign(d, {
    sloth_story_w1: '1',
    sloth_story_w2: '1',
    sloth_finds: '["w1-note","w2-book"]',
    sloth_badges: '{"first":1}',
    sloth_difficulty: 'easy',
    sloth_tips_1_3: '1',
    sloth_lessons: '["swing"]',
    sloth_dot_help: 'tips',
    'sloth_seed_2-4_a': '1',
    sloth_dot_silk: '[1]',
    sloth_howto_seen: '1',
    sloth_ctl_hand: 'left',
    sloth_music_vol: '0.4',
    sloth_game_muted: '0',
    sloth_fullscreen: '1',
  });
  return d;
}
const player = (s: ReturnType<typeof memStore>) => Object.fromEntries([...s.map].filter(([k]) => keyClass(k) === 'player').sort());
const device = (s: ReturnType<typeof memStore>) => Object.fromEntries([...s.map].filter(([k]) => keyClass(k) === 'device' && !k.startsWith('sloth_slot')).sort());

test('an old single save is slot 1 as it stands: nothing moves, nothing is lost', () => {
  const before = oldSave();
  const s = memStore(before);
  const slots = listSlots(s);
  assert.equal(slots[0].playing, true);
  assert.equal(slots[0].name, 'Explorer 1');
  assert.equal(slots[0].summary.stagesCleared, 30);
  assert.equal(slots[0].furthest, '3-10');
  assert.deepEqual([slots[1].empty, slots[2].empty], [true, true]);
  assert.deepEqual(Object.fromEntries(s.map), before, 'reading the slots writes nothing');
});

test('a new explorer starts with nothing, and going back brings the first one back byte for byte', () => {
  const s = memStore(oldSave());
  const p1 = player(s);
  const dev = device(s);
  assert.deepEqual(switchSlot(s, 2), { ok: true });
  assert.deepEqual(player(s), {}, 'slot 2 starts fresh');
  assert.deepEqual(device(s), dev, 'the phone keeps its sound and full-screen settings');
  s.setItem('sloth_lvl_1-1', JSON.stringify({ completed: true, stars: 1 }));
  s.setItem('sloth_difficulty', 'normal');
  renameSlot(s, 2, '  Mia  ');
  assert.deepEqual(switchSlot(s, 1), { ok: true });
  assert.deepEqual(player(s), p1, 'the first explorer is exactly as they were');
  assert.equal(s.getItem(dataKey(1)), null, 'the playing explorer has no stale copy');
  const slots = listSlots(s);
  assert.equal(slots[1].name, 'Mia');
  assert.equal(slots[1].summary.stagesCleared, 1);
  assert.equal(s.getItem(JOURNAL_KEY), null);
});

test('a switch killed at every single step is finished on the next start, and nobody loses anything', () => {
  // count the writes a full switch makes, then cut it after each one in turn
  const probe = memStore(oldSave());
  switchSlot(probe, 2);
  const total = [...Array(400).keys()].length; // upper bound; the loop stops once a switch completes untouched
  let cuts = 0;
  for (let cut = 0; cut < total; cut++) {
    cuts = cut;
    const s = memStore(oldSave());
    const p1 = player(s);
    s.cutAt = cut;
    let done = false;
    try {
      // (a kill during step 1 is caught by switchSlot like a full phone: it returns 'full' and changes nothing)
      done = switchSlot(s, 2).ok;
    } catch {
      done = false;
    }
    s.cutAt = undefined;
    recoverSlots(s);
    const on = Number(s.getItem(ACTIVE_KEY) ?? '1');
    if (on === 1) assert.deepEqual(player(s), p1, `cut at write ${cut}: still explorer 1, unchanged`);
    else {
      assert.deepEqual(player(s), {}, `cut at write ${cut}: explorer 2 is fresh`);
      assert.deepEqual(switchSlot(s, 1), { ok: true });
      assert.deepEqual(player(s), p1, `cut at write ${cut}: explorer 1 comes back whole`);
    }
    assert.equal(s.getItem(JOURNAL_KEY), null, `cut at write ${cut}: no journal left`);
    if (done) break;
  }
  assert.ok(cuts >= 40, `the switch was cut at ${cuts} different writes (an old save has ~50 player keys)`);
  if (process.env.SLOT_CUTS) console.log(`cut points: ${cuts}`);
});

test('a full phone stops the switch before anything is cleared', () => {
  const init = oldSave();
  const used = Object.entries(init).reduce((a, [k, v]) => a + k.length + v.length, 0);
  const s = memStore(init, { quota: used + 200 });
  const before = Object.fromEntries(s.map);
  assert.deepEqual(switchSlot(s, 2), { ok: false, reason: 'full' });
  assert.deepEqual(Object.fromEntries(s.map), before);
});

test('a copy made by a newer game is shown but never opened, changed or erased', () => {
  const s = memStore({ ...oldSave(), [dataKey(3)]: JSON.stringify({ v: SLOT_DATA_VERSION + 1, data: { sloth_lvl_9_9: 'x' } }), sloth_slots: '[{"name":"Dad"},{"name":""},{"name":"Gran"}]' });
  const raw = s.getItem(dataKey(3));
  assert.equal(listSlots(s)[2].newer, true);
  assert.deepEqual(switchSlot(s, 3), { ok: false, reason: 'newer' });
  assert.equal(eraseSlot(s, 3), false);
  assert.equal(s.getItem(dataKey(3)), raw);
  assert.equal(listSlots(s)[0].name, 'Dad');
});

test('an unreadable copy is left alone, not taken for an empty slot', () => {
  const s = memStore({ ...oldSave(), [dataKey(2)]: '{oops' });
  assert.equal(listSlots(s)[1].empty, false);
  assert.equal(freeSlot(s), 3);
  assert.deepEqual(switchSlot(s, 2), { ok: false, reason: 'newer' });
});

test('a journal pointing nowhere is dropped without touching the game', () => {
  const s = memStore({ ...oldSave(), [JOURNAL_KEY]: '{"from":1,"to":2}' }); // no copy of slot 1: the journal is not trusted
  const before = player(s);
  assert.equal(recoverSlots(s), 'none');
  assert.deepEqual(player(s), before);
  assert.equal(s.getItem(JOURNAL_KEY), null);
});

test('erase removes only that explorer, never the one playing', () => {
  const s = memStore(oldSave());
  switchSlot(s, 2);
  s.setItem('sloth_lvl_1-1', '{"completed":true,"stars":3}');
  switchSlot(s, 1);
  assert.equal(eraseSlot(s, 1), false);
  assert.equal(eraseSlot(s, 2), true);
  assert.equal(listSlots(s)[1].empty, true);
  assert.equal(listSlots(s)[0].summary.stagesCleared, 30);
});

test('names are trimmed, kept short, and an empty one falls back to the slot number', () => {
  const s = memStore(oldSave());
  renameSlot(s, 1, '   ');
  assert.equal(listSlots(s)[0].name, 'Explorer 1');
  renameSlot(s, 1, 'Grandma   Jo the Great Explorer');
  assert.equal(listSlots(s)[0].name, 'Grandma Jo the');
});

/** every storage key the game writes, found in the source: each must belong to an explorer or to the phone (no third kind) */
test('every storage key in the source has a class', () => {
  const root = new URL('../', import.meta.url).pathname;
  const files: string[] = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(f) && !/\.test\.ts$/.test(f)) files.push(p);
    }
  };
  walk(root);
  const found = new Set<string>();
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(/['"`](sloth_[a-z0-9_]+)(\$\{)?/g)) {
      // a template key (`sloth_lvl_${id}`) is checked with a sample id in its place
      found.add(m[2] ? `${m[1]}${/lvl_|play_|layout_$/.test(m[1]) ? '1-1' : m[1].endsWith('seed_') ? '1-1_a' : m[1].endsWith('tips_') ? '1_1' : m[1].endsWith('way_') ? '1-1' : m[1].endsWith('story_') ? 'w1' : '1'}` : m[1]);
    }
  }
  // (prefixes used to build keys, not keys themselves)
  for (const p of ['sloth_', 'sloth_lvl_', 'sloth_play_', 'sloth_tips_', 'sloth_story_', 'sloth_slot_data_']) found.delete(p);
  const unknown = [...found].filter((k) => keyClass(k) === 'unknown');
  assert.deepEqual(unknown, [], `storage keys with no class (add each to saveSlots.ts keyClass): ${unknown.join(', ')}`);
});
