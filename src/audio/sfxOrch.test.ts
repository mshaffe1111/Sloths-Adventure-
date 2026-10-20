import test from 'node:test';
import assert from 'node:assert/strict';
import { ANIMAL_FIGURES, CLASSIC_WITH_BELLS, DEFAULT_ORCH_SFX, degree, figureFor, fold, isPingySample, ORCH_SFX_GROUPS, orchSfxEnabled, swapMallet, type MalletKind } from './sfxOrch.ts';
import { ENEMY_ORDER } from './combat.ts';
import { SFX } from './sfx.ts';
import { readdirSync } from 'node:fs';
import { SCALES } from './theory.ts';

const KINDS: MalletKind[] = ['bell', 'kalimba', 'steelpan', 'marimba'];

test('the orchestral effects are off unless switched on', () => {
  assert.equal(DEFAULT_ORCH_SFX, false);
  assert.equal(orchSfxEnabled(), false);
});

test('a mallet note is played by an orchestral voice in a friendly range, and the four versions do not all use the same instrument', () => {
  for (const kind of KINDS) {
    const voices = new Set<unknown>();
    for (let variant = 0; variant < 4; variant++) {
      for (let midi = 30; midi <= 110; midi += 3) {
        const s = swapMallet(kind, variant, midi);
        assert.ok(s.midi >= 48 && s.midi <= 84, `${kind} v${variant} midi ${midi} -> ${s.midi}`);
        assert.ok(s.gain > 0 && s.gain <= 1);
        assert.equal(typeof s.voice, 'function');
        voices.add(s.voice);
      }
    }
    assert.ok(voices.size >= 3, `${kind} should use at least three different instruments across its versions`);
  }
});

test('folding keeps the pitch class', () => {
  for (let m = 20; m <= 120; m++) assert.equal(((fold(m) % 12) + 12) % 12, ((m % 12) + 12) % 12);
});

test('an animal has a figure, every figure ends lower than it starts, and every note is in the key', () => {
  assert.equal(ANIMAL_FIGURES.length, ENEMY_ORDER.length);
  const key = { tonic: 62, scale: SCALES.major ?? [0, 2, 4, 5, 7, 9, 11] };
  for (const [i, f] of ANIMAL_FIGURES.entries()) {
    assert.ok(f.steps[f.steps.length - 1] < f.steps[0], `${ENEMY_ORDER[i]}: the figure ends lower than it starts`);
    for (const d of f.steps) {
      const m = degree(key, d, f.low);
      assert.ok(key.scale.includes((((m - key.tonic) % 12) + 12) % 12), `${ENEMY_ORDER[i]}: degree ${d} is in the key`);
    }
  }
  assert.ok(figureFor(-1) && figureFor(99));
});

test('the instruments the set draws on are all recorded, and its pingy-sample list names real groups', () => {
  const known = new Set(readdirSync(new URL('../assets/orch/', import.meta.url)).map((f) => f.split('_')[0]));
  for (const g of ORCH_SFX_GROUPS) assert.ok(known.has(g), `${g} is a recorded orchestra group`);
  for (const g of ['uiGlass', 'glassL', 'bellH']) assert.ok(isPingySample(g));
  assert.ok(!isPingySample('punchM') && !isPingySample('stepGrass'));
});

test('every effect that leaves the old recipes has a new recipe to take over', () => {
  for (const n of CLASSIC_WITH_BELLS) assert.ok(SFX[n], `${n} has a new recipe`);
});
