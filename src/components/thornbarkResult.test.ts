/**
 * Audit C saves #12 (2026-11-11): the Satchel's journal reads Thornbark's result from sloth_lvl_S-1 (Satchel.tsx journalStages), but
 * App.tsx's onVictory returned for the secret stage before saveLevelProgress, so nothing wrote it: his journal entry was always three
 * stars, whatever was earned, and his best score and time were never kept. App.tsx has no harness, so this reads its source.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { THORNBARK_LEVEL } from '../game/secret.ts';
import { isSaveKey } from '../game/saveFile.ts';

test("the secret guardian's clear is saved like any stage's, so the journal shows what was earned", () => {
  const app = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
  const at = app.indexOf('onVictory: (stars, timeSec, finalScore) => {');
  assert.ok(at >= 0, 'App.tsx onVictory');
  const secret = app.slice(app.indexOf('if (lvl.secret) {', at), app.indexOf('return;', app.indexOf('if (lvl.secret) {', at)));
  assert.match(secret, /saveLevelProgress\(lvl\.id, stars, finalScore, timeSec\)/, "the secret stage's result is not written (sloth_lvl_S-1)");
  const satchel = readFileSync(new URL('./Satchel.tsx', import.meta.url), 'utf8');
  assert.match(satchel, /sloth_lvl_\$\{THORNBARK_LEVEL\.id\}/, 'the journal reads it');
  assert.ok(isSaveKey(`sloth_lvl_${THORNBARK_LEVEL.id}`), 'and a save file carries it');
});
