import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { POWER_UP_SECS } from './powerUps.ts';

const src = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');

test('UI-8: the engine runs each power-up for the time the HUD pod empties over, from one table', () => {
  const engine = src('./engine.ts');
  for (const k of Object.keys(POWER_UP_SECS)) {
    assert.match(engine, new RegExp(`p\\.powerUpTimer = POWER_UP_SECS\\.${k};`), `${k} runs by the table`);
  }
  assert.doesNotMatch(engine, /p\.powerUpTimer = [1-9]/, 'no power-up time written by hand');
  const hud = src('../components/hud/VineHud.tsx');
  assert.doesNotMatch(hud, /secs: \d/, 'the pod reads the same table');
  assert.match(hud, /POWER_UP_SECS\.speed/);
});
