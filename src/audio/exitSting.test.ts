/**
 * SN-5 (polish report 1, 2026-10-29): reaching the shrine plays a short chime in the level, and the full victory sting plays when the
 * Stage Cleared card has landed (its pop-in, index.css clr-pop), not over the last moment of play.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SFX } from './sfx.ts';
import { stingLength } from './stingers.ts';

const src = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');

test('SN-5: the shrine plays the short chime; the victory sting waits for the card', () => {
  assert.ok(SFX.exitChime, 'the chime exists');
  const engine = src('../game/engine.ts');
  const at = engine.indexOf('this.exitTotemReached = true;');
  const block = engine.slice(at, at + 400);
  assert.match(block, /sound\.playExitChime\(\)/);
  assert.doesNotMatch(block, /playVictory/);
  assert.doesNotMatch(engine, /sound\.playVictory\(\)/, 'nothing in play starts the full sting');
  // the card plays it once its pop-in is over
  const modals = src('../components/StatusModals.tsx');
  const ms = Number(/CARD_LANDS_MS = (\d+)/.exec(modals)![1]);
  const pop = Number(/\.clr-card \{[^}]*animation: clr-pop ([\d.]+)s/.exec(src('../index.css'))![1]) * 1000;
  assert.equal(ms, pop, 'the sting lands with the card');
  assert.match(modals, /<VictorySting \/>/);
  assert.ok(stingLength('victory') > 1, 'the full sting is still the long one');
});
