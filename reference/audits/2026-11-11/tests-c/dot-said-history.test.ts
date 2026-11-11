/**
 * ENGINE-AUDIT-C finding C-09 (2026-11-11). Asserts the CORRECT behaviour; FAILS on t-int-1-1 @ fa5ad9d1.
 * Run: npx tsx --test reference/audits/2026-11-11/tests-c/dot-said-history.test.ts
 *
 * The pause menu's "Dot said:" list (menuParts.tsx DotHelpSetting) reads a module-level array in dotGuide.ts (`lastLines`). Nothing
 * ever empties it: not a new stage, not a New Game, not a loaded save. And the menu labels any speaker who is not Dot or Pokey
 * "The petal", though a guide line can be Flicker's (GuideWho).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import '../../../../src/game/headlessDom.ts';
import { dotSaid, noteSaid } from '../../../../src/game/dotGuide.ts';
import { resetProgress, type Store } from '../../../../src/game/saveFile.ts';

test('C-09: a New Game starts with an empty "Dot said" list', () => {
  noteSaid({ key: 'engine:x', text: 'Jump the gaps. Fall, and you lose a life!', kind: 'teach', who: 'Dot', source: 'engine' });
  assert.equal(dotSaid().length, 1);
  const m = new Map<string, string>();
  const store: Store = { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), keys: () => [...m.keys()] };
  resetProgress(store); // New Game (NewGameDialog -> resetProgress): Dot's memory is cleared, "a new adventure is taught again"
  assert.equal(dotSaid().length, 0, 'the last adventure\'s lines are still listed under "Dot said:" in the new game\'s menu');
});

test('C-09: the "Dot said" list names Flicker when the line was his', () => {
  const src = readFileSync(new URL('../../../../src/components/menuParts.tsx', import.meta.url), 'utf8');
  const row = /s\.who === 'Dot' \? '' : `\$\{([^`]*)\}: `/.exec(src);
  assert.ok(row, 'menuParts.tsx no longer builds the speaker label this way (update this test)');
  assert.match(row[1], /Flicker/, `a line whose who is 'Flicker' is labelled by: ${row[1]}`);
});
