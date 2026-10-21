import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setSceneSeed } from './sceneSeed.ts';
import { lookFor } from './scenery.ts';
import { paletteFor, lipReport, awayFromFur, LIP_MIN, BARK_MIN } from './platformPalette.ts';
import { deltaE00, FUR, lightness } from './colorMetrics.ts';

const WORLDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SEEDS = [1, 7, 42, 1234, 99991];

test('awayFromFur leaves far colours alone and moves near ones past the limit', () => {
  assert.equal(awayFromFur('#ffffff'), '#ffffff');
  const moved = awayFromFur('#a66b43');
  assert.ok(deltaE00(moved, FUR) >= LIP_MIN, `${moved} must be at least ${LIP_MIN} away`);
  const near = awayFromFur('#b07a50');
  assert.ok(deltaE00(near, FUR) >= LIP_MIN);
});

test('in every world and every scene seed the lit lip of every standable surface is clearly away from the fur', () => {
  for (const seed of SEEDS) {
    setSceneSeed(seed);
    for (const w of WORLDS) {
      for (const [name, col] of lipReport(lookFor(w), w)) {
        const d = deltaE00(col, FUR);
        assert.ok(d >= LIP_MIN - 1e-6, `world ${w} seed ${seed} ${name}: ${col} is only ${d.toFixed(1)} from the fur`);
      }
    }
  }
});

test('wood bodies are never fur-coloured, and are darker (or bleached paler) than the hero', () => {
  const fur = lightness(FUR);
  for (const seed of SEEDS) {
    setSceneSeed(seed);
    for (const w of WORLDS) {
      const pal = paletteFor(lookFor(w), w);
      const d = deltaE00(pal.bark.mid, FUR);
      assert.ok(d >= 15, `world ${w} seed ${seed}: bark ${pal.bark.mid} is only ${d.toFixed(1)} from the fur`);
      assert.ok(Math.abs(lightness(pal.bark.mid) - fur) > 8, `world ${w}: bark is as light as the fur`);
      for (const step of ['hi', 'light', 'mid', 'dark', 'deep'] as const) {
        const ds = deltaE00(pal.bark[step], FUR);
        assert.ok(ds >= BARK_MIN - 1e-6, `world ${w} seed ${seed}: bark.${step} ${pal.bark[step]} is only ${ds.toFixed(1)} from the fur`);
      }
      assert.ok(lightness(pal.bark.deep) < fur - 8, `world ${w}: the underside of wood is not darker than the fur`);
    }
  }
});

test('the palette is cached per look, so a stage keeps its colours', () => {
  setSceneSeed(5);
  const look = lookFor(3);
  assert.equal(paletteFor(look, 3), paletteFor(look, 3));
});
