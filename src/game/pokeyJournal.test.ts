/**
 * Pokey's journal voice (Matt, 2026-11-01: "Too many 'I didn't write it down, the ending was good.' That is worthless and doesn't sound
 * like Pokey, a slow smart-ass"): every released stage has its own line, no page repeats a line, and no filler is ever written.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BANNED_FILLER, BEATS, LINES, POKEY_JOURNAL, QUIET_STAGES, RECORD_MAX, STAGE_LINES, plainOf, worldEntries, type EntryNames } from './pokeyJournal.ts';
import { generateAllLevels } from './worldsData.ts';
import { withExtraStages } from './extraStages.ts';
import { THORNBARK_LEVEL } from './secret.ts';
import { dotPresent } from './wayside.ts';
import type { PlayRecord, FirstClear } from './playRecords.ts';

/** the released worlds (9 and 10 are not out yet) */
const RELEASED = 8;
const stages = [...withExtraStages(generateAllLevels(), true), THORNBARK_LEVEL].filter((l) => l.worldIndex <= RELEASED);
const words = (s: string) => s.trim().split(/\s+/).length;
const names: EntryNames = {
  creature: (id, n) => (n === 1 ? id : `${id}s`),
  find: (id) => ({ w1_note: 'A note in plain sight', w1_key: 'A tiny iron key' } as Record<string, string>)[id],
  medal: (id) => ({ flawless: 'Flawless', first_steps: 'First Steps' } as Record<string, string>)[id],
};

test('every released stage has its own line, and no two stages share one', () => {
  for (const l of stages) assert.ok(STAGE_LINES[l.id], `${l.id} ${l.name} has no line`);
  const seen = new Map<string, string>();
  for (const [id, line] of Object.entries(STAGE_LINES)) {
    assert.ok(!seen.has(line), `${id} repeats ${seen.get(line)}`);
    seen.set(line, id);
  }
  assert.ok(stages.some((l) => l.id === '4-D') && stages.some((l) => l.id === '5-M') && stages.some((l) => l.id === 'S-1'));
});

test('stage lines are a beat long, never start with the name, and never comment on the journal', () => {
  for (const l of stages) {
    const line = STAGE_LINES[l.id];
    const n = words(line);
    assert.ok(n >= 8 && n <= 23, `${l.id}: ${n} words`);
    assert.ok(!line.startsWith(l.name), `${l.id} starts with its name`);
    assert.doesNotMatch(line, BANNED_FILLER, l.id);
    assert.doesNotMatch(line, /\{\w+\}/, l.id);
  }
});

test('no filler anywhere: the unrecorded lines are gone, and no template or beat is filler', () => {
  assert.equal((LINES as Record<string, unknown>).unrecorded, undefined);
  const all = [...Object.values(LINES).flat(), ...Object.values(BEATS).flatMap((b) => Object.values(b)), ...Object.values(POKEY_JOURNAL)];
  for (const t of all) assert.doesNotMatch(t as string, BANNED_FILLER, t as string);
  for (const [k, v] of Object.entries(LINES)) {
    assert.ok(v.length >= 6, `${k}: ${v.length} variants`);
    assert.equal(new Set(v).size, v.length, `${k} repeats a variant`);
    for (const t of v) assert.doesNotMatch(t, /\{s\}/, `${k}: the name is in the heading now`);
  }
});

const full = (o: Partial<FirstClear>, w = 1): PlayRecord => ({
  v: 1, n: w, w,
  first: { t: 150, ll: 0, hl: 0, fl: 40, ft: 40, st: 3, k: 6, kt: 'snake', ch: 3, fr: 0, sw: 4, fd: [], md: [], d: 0, ...o },
});
/** a record for every stage, cycling through every kind of run: clean, a fall, many falls, flowers, finds, medals, cages, replays */
function mixed(): Record<string, PlayRecord> {
  const kinds: Array<Partial<FirstClear>> = [
    { ll: 0, hl: 0, fd: ['w1_note'] },
    { ll: 1, hl: 2, fl: 12, ft: 40, t: 80 },
    { ll: 5, hl: 9, t: 300, md: ['flawless'] },
    { ll: 0, hl: 0, fr: 5, md: ['first_steps'] },
    { ll: 2, hl: 1, fl: 30, ft: 40 },
    { ll: 0, hl: 1, fl: 40, ft: 40, fd: ['w1_key'] },
    { ll: 3, hl: 3, ft: 0, fl: 0, k: 9 },
  ];
  const out: Record<string, PlayRecord> = {};
  stages.forEach((l, i) => (out[l.id] = full(kinds[i % kinds.length], 1 + (i % 3))));
  return out;
}
const cleared = stages.map((l) => ({ ...l, completed: true }));

for (const [label, recs] of [
  ['an old save with no records', {} as Record<string, PlayRecord>],
  ['a full set of records', mixed()],
  ['every stage a clean run with every flower', Object.fromEntries(stages.map((l) => [l.id, full({}, 4)]))],
] as const) {
  test(`every world page reads clean for ${label}: no line twice, no filler, no empty slot, Dot only where she is`, () => {
    for (let w = 1; w <= RELEASED; w++) {
      const page = worldEntries(w, cleared, recs, names);
      assert.equal(page.length, cleared.filter((l) => l.worldIndex === w).length);
      const lines = page.flatMap((e) => e.lines);
      const dup = lines.find((l, i) => lines.indexOf(l) !== i);
      assert.equal(dup, undefined, `World ${w} repeats: ${dup}`);
      for (const e of page) {
        assert.equal(e.lines[0], STAGE_LINES[e.id], `${e.id} opens with its own line`);
        assert.ok(e.lines.length >= 1);
        const extra = e.notes.length;
        assert.deepEqual(e.lines, [...e.story, ...e.notes, ...(e.close ? [e.close] : [])]);
        assert.equal(e.close, stage(e.id).miniIndex === 10 ? POKEY_JOURNAL[w] : undefined);
        assert.ok(extra <= RECORD_MAX, `${e.id}: ${extra} record lines`);
        if (!Object.keys(recs).length) assert.equal(extra, 0, `${e.id}: an old save gets no record lines`);
        for (const l of e.lines) {
          assert.doesNotMatch(l, BANNED_FILLER, `${e.id}: ${l}`);
          assert.doesNotMatch(l, /\{\w+\}|undefined|NaN/, `${e.id}: ${l}`);
        }
        const s = stage(e.id);
        if (!dotPresent(s.worldIndex, s.miniIndex) || /\bno Dot\b/i.test(e.story.join(' '))) {
          for (const l of e.notes) assert.doesNotMatch(l, /\bDot\b/, `${e.id}: a record line about Dot while she is away`);
        }
      }
      // the same page reads the same each time it is opened
      assert.deepEqual(worldEntries(w, cleared, recs, names), page);
    }
  });
}
function stage(id: string) {
  return stages.find((l) => l.id === id)!;
}

test('a record gives the most notable lines: a clean run, a find, a medal come before the time and the creatures', () => {
  const page = worldEntries(1, cleared, { '1-3': full({ ll: 0, hl: 0, fd: ['w1_note'], md: ['flawless'], t: 60 }) }, names);
  const e = page.find((x) => x.id === '1-3')!;
  assert.equal(e.lines.length, 3);
  assert.ok(e.lines.some((l) => l.includes('A note in plain sight')), e.lines.join(' | '));
  assert.equal(e.plain, false);
  const old = page.find((x) => x.id === '1-2')!;
  assert.deepEqual(old.lines, [STAGE_LINES['1-2']]);
  assert.equal(old.plain, true);
});

test("at a real moment the joke doesn't come: a quiet stage gets one plain note, its line's first sentence", () => {
  assert.equal(plainOf('Fell three times. Every one of them was educational.'), 'Fell three times.');
  assert.equal(plainOf('Found “A note”, right where I\'d have missed it.'), 'Found “A note”, right where I\'d have missed it.');
  const recs = mixed();
  for (let w = 1; w <= RELEASED; w++) {
    for (const e of worldEntries(w, cleared, recs, names)) {
      if (!QUIET_STAGES.has(e.id)) continue;
      assert.ok(e.notes.length <= 1, `${e.id}: ${e.notes.length} notes`);
      for (const n of e.notes) assert.equal(n, plainOf(n), `${e.id}: ${n}`);
    }
  }
  for (const id of QUIET_STAGES) assert.ok(stages.some((l) => l.id === id), id);
});

test('no flower line opens on a bare number (times and small counts read as words)', () => {
  for (const [k, v] of Object.entries(LINES)) for (const t of v) if (!['manyFalls', 'freed', 'foes'].includes(k)) assert.doesNotMatch(t, /^\{(f|ft)\}/, `${k}: ${t}`);
});
