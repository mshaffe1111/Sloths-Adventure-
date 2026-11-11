/**
 * Every save the game writes loads back (R-165.117).
 *
 * Engine audit C (saves #1, t-audit-engine-c@95cca895, tests-c/saves-file-limits.test.ts) and audit A's stopped save slice
 * (t-audit-engine-a@afc01365, tests-a/save-full-game-refused.test.ts) proved that parseSave refused the game's own file once Meeca's
 * stage 5-M was cleared (sloth_w5_carved, about 480 characters) or 34 things were found (sloth_finds): a per-key limit of 400 characters
 * guessed at load time, never checked against what the writers make. Their tests are brought in here unchanged in substance (imports
 * and the shared fill moved to saveFill.ts). The countermeasure: a game filled through every writer at its largest round-trips, every
 * save key has a filler (a new key without one fails here), and every entry keeps 2x room under the one entry limit.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ALLOWED, MAX_ENTRY_CHARS, MAX_SAVE_BYTES, applySave, buildSave, parseSave, summarize } from './saveFile.ts';
import { ALL_FINDS, FINDS_KEY } from './finds.ts';
import { MEECA_WARNINGS } from './meecaLines.ts';
import { CARVED_KEY, markCarvingsDone, recordCarving } from './meecaCarved.ts';
import { fillCarvings, fillFinds, fillFinishedGame, memStorage } from './saveFill.ts';

const stage = (stars: number) => JSON.stringify({ completed: true, stars, highScore: 4200, bestTime: 131, starsMode: 'normal', scoreMode: 'normal', timeMode: 'normal' });

/** the file as the Save button writes it (pretty) and as Copy save code writes it (compact): both must load */
function roundTrips(st: ReturnType<typeof memStorage>) {
  const save = buildSave(st);
  for (const text of [JSON.stringify(save, null, 2), JSON.stringify(save)]) {
    const r = parseSave(text);
    if (!r.ok) return { ok: false as const, reason: r.reason, size: text.length };
    const into = memStorage({ sloth_lvl_9_9: 'x' });
    applySave(into, r.save);
    assert.deepEqual(Object.fromEntries([...into.m].filter(([k]) => k.startsWith('sloth_') && k !== 'sloth_lvl_9_9')), save.data, 'what loads is what was saved');
  }
  return { ok: true as const, size: JSON.stringify(save, null, 2).length };
}

// ── audit C, saves-file-limits.test.ts ──
test("a save made after Meeca's stage (all five warnings cut) loads again", () => {
  const s = memStorage();
  // exactly what meecaPlay.ts writes: each warning's own lines, `along` rounded to 3 places
  MEECA_WARNINGS.forEach((w, i) => recordCarving({ id: w.id, lines: [...w.lines], along: Math.round(((i + 1) / 6) * 1000) / 1000, high: i === 3, caught: 0 }, s));
  markCarvingsDone(s);
  const raw = s.getItem(CARVED_KEY)!;
  const r = parseSave(JSON.stringify(buildSave(s)));
  assert.ok(r.ok, `sloth_w5_carved is ${raw.length} characters: ${r.ok ? '' : r.reason}`);
});

test('a save with every find collected loads again', () => {
  const s = memStorage();
  fillFinds(s);
  const raw = s.getItem('sloth_finds')!;
  const r = parseSave(JSON.stringify(buildSave(s)));
  assert.ok(r.ok, `sloth_finds is ${raw.length} characters with ${ALL_FINDS.length} finds: ${r.ok ? '' : r.reason}`);
});

// ── audit A, save-full-game-refused.test.ts ──
test("a game that has cleared Meeca's stage (5-M) can load its own save file", () => {
  const st = memStorage();
  for (let w = 1; w <= 4; w++) for (let m = 1; m <= 10; m++) st.setItem(`sloth_lvl_${w}-${m}`, stage(2));
  st.setItem('sloth_lvl_5-M', stage(3));
  fillCarvings(st);
  const r = roundTrips(st);
  assert.ok(r.ok, `the game's own save file was refused: "${r.ok ? '' : r.reason}" (sloth_w5_carved is ${st.getItem(CARVED_KEY)!.length} characters)`);
});

test('a game with every note, book and keepsake found can load its own save file, at every count (34 included)', () => {
  const st = memStorage();
  st.setItem('sloth_lvl_1-1', stage(3));
  let firstRefused = 0;
  for (let n = 1; n <= ALL_FINDS.length && !firstRefused; n++) {
    fillFinds(st, n);
    if (!roundTrips(st).ok) firstRefused = n;
  }
  assert.ok(ALL_FINDS.length >= 34, 'the 34-find case is in the range');
  assert.equal(firstRefused, 0, `the save file is refused from ${firstRefused} finds on (of ${ALL_FINDS.length}); sloth_finds is then ${st.getItem(FINDS_KEY)!.length} characters`);
});

// ── the countermeasure ──
test('the biggest finished game round-trips, as a file and as a save code, with room to grow', () => {
  const st = memStorage();
  fillFinishedGame(st);
  const r = roundTrips(st);
  assert.ok(r.ok, `a finished game's own save was refused: ${r.ok ? '' : r.reason} (${r.size} characters)`);
  assert.ok(r.size <= MAX_SAVE_BYTES * 0.6, `a finished game's file is ${r.size} characters, over 60% of the ${MAX_SAVE_BYTES} cap: raise the cap before players reach it`);
  const save = buildSave(st);
  const big = Object.entries(save.data).sort((a, b) => b[1].length - a[1].length)[0];
  assert.ok(big[1].length * 2 <= MAX_ENTRY_CHARS, `${big[0]} is ${big[1].length} characters, over half the ${MAX_ENTRY_CHARS} entry limit: raise the limit before players reach it`);
  const sum = summarize(save.data);
  assert.ok(sum.stagesCleared >= 100 && sum.secret, `the summary reads the finished game (${JSON.stringify(sum)})`);
});

test('every kind of save entry has a filler in saveFill.ts (a new save key without one fails here)', () => {
  const st = memStorage();
  fillFinishedGame(st);
  const keys = [...st.m.keys()];
  const bare = ALLOWED.filter((re) => !keys.some((k) => re.test(k)));
  assert.deepEqual(bare.map(String), [], 'save keys the finished-game fill never writes: give each its writer at its largest in saveFill.ts');
});

// ── old saves ──
for (const [file, oldLoaded] of [['save-0.9.5-mid.json', true], ['save-0.9.5-after-5M.json', false]] as const) {
  test(`a save written by 0.9.5 loads: ${file} (0.9.5 itself ${oldLoaded ? 'loaded it' : 'refused it'})`, () => {
    const text = readFileSync(new URL(`./fixtures/${file}`, import.meta.url), 'utf8');
    const r = parseSave(text);
    assert.ok(r.ok, r.ok ? '' : r.reason);
    if (!r.ok) return;
    const into = memStorage();
    applySave(into, r.save);
    const raw = JSON.parse(text);
    assert.deepEqual(Object.fromEntries(into.m), raw.data, 'every entry of the old file is restored as it was');
    assert.equal(r.save.summary.stagesCleared, 40); // (the summary counts the numbered stages: 5-M is not in it)
    assert.equal(JSON.parse(into.getItem(FINDS_KEY)!).found.length, 33);
  });
}
