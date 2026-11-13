/**
 * Audit C saves #3 / things #5 (2026-11-11): New Game and Load replace the game in storage, but App.tsx keeps a copy of it in React
 * state. onSaveLoaded and onNewGame each re-read a hand-kept list that left out the journal records (playRecords) and the flashbacks
 * seen (memoriesSeen); with no page reload the old game's were shown and then written back into the new one (withRun keeps an
 * existing `first`; markMemorySeen saves the stale list).
 *
 * App.tsx is a React screen with no test harness, so this reads its source: every state it loads from storage when it starts (a
 * `useState(() => load())`) must be re-read by reloadGameState, and both handlers must go through it. A new stored state fails here
 * until it is re-read, or named below as kept on purpose.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

/** states App.tsx starts from something that is not the adventure in storage, and why a New Game or a Load keeps them */
const KEPT: Record<string, string> = {
  setCtestGate: "the testers' control test, from the address",
  setMusicSalt: 'the tune picked for this visit',
  setCoachStyle: "the device's touch controls",
  setSlowTip: "the device's slow-phone tip",
};

/** the body of a `function name(` or `const name = useCallback(` in App.tsx, up to its closing brace at the same indent */
function body(head: string): string {
  const at = app.indexOf(head);
  assert.ok(at >= 0, `App.tsx has ${head}`);
  const indent = app.slice(app.lastIndexOf('\n', at) + 1, at);
  const end = app.indexOf(`\n${indent}}`, at);
  return app.slice(at, end);
}

test('a New Game and a Load both re-read the game through one list', () => {
  assert.match(body('const onSaveLoaded = useCallback('), /reloadGameState\(\)/);
  assert.match(body('const onNewGame = useCallback('), /reloadGameState\(\)/);
});

test('every state App.tsx loads from storage is re-read after a New Game or a Load (the journal and the flashbacks included)', () => {
  const reload = body('function reloadGameState(');
  const setters = [...app.matchAll(/const \[\w+, (set\w+)\] = useState(?:<.+?>)?\(\(\) =>/g)].map((m) => m[1]);
  assert.ok(setters.includes('setPlayRecords') && setters.includes('setMemoriesSeen'), 'the reader finds the stored states');
  const missed = setters.filter((s) => !(s in KEPT) && !new RegExp(`\\b${s}\\(`).test(reload));
  assert.deepEqual(missed, [], 'states loaded from storage that a New Game or a Load leaves as the old game had them');
});

test("the last game's run is forgotten too (its result card, medals and Game Over count)", () => {
  const reload = body('function reloadGameState(');
  for (const s of ['setLastStats(null)', 'setFreshBadges([])', 'failsRef.current = {}', 'pendingStats.current = null']) assert.ok(reload.includes(s), s);
});
