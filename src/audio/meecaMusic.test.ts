/**
 * Audit C (audio) #7, 2026-11-11. Meeca's stage ('5-M') is a special case in scenes.ts: its music id is found by composing up to 600
 * whole pieces (composer.ts composeStageFull) on the main thread the first time the stage's music is asked for, i.e. in App.tsx's
 * screen effect as the stage starts. The answer is a constant: the only recording that can play is the manifest's 'gen-5-8-s'
 * (recordings.ts recordingFor: any other id silently falls back to World 5's stage loop). The music is recorded now; nothing else in
 * the game composes at run time.
 * Asserts the lookup is the cheap constant it should be; fails today (about 0.4 s on a desktop, several times that on a phone).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { meecaStageMusic, sceneForScreen } from './scenes.ts';
import { recordingFor } from './recordings.ts';

test('5-M: choosing Meeca\'s music costs no more than any other stage\'s (no composing at run time)', () => {
  // (warm the module's shared tables with an ordinary stage first, so only Meeca's own work is timed)
  const t0 = performance.now();
  sceneForScreen('playing', 5, false, '5-5', 5, 1, 'sprint');
  const other = performance.now() - t0;
  const t1 = performance.now();
  const pick = meecaStageMusic();
  const ms = performance.now() - t1;
  const manifest = JSON.parse(readFileSync(new URL('../assets/music/manifest.json', import.meta.url), 'utf8'));
  assert.equal(recordingFor(manifest, pick.id, pick.seed), 'gen-5-8-s', 'the one recording it can be');
  assert.ok(ms < 50, `Meeca's music took ${ms.toFixed(0)} ms on the main thread to pick (another stage: ${other.toFixed(1)} ms)`);
});

test('5-M: the fixed roll is still her song (the search it replaces: the first World 5 sneak roll with the lament on the clarinet, else the first with the lament)', async () => {
  const { composeStageFull } = await import('./composer.ts');
  const { MEECA_SEED } = await import('./scenes.ts');
  let pick: number | null = null;
  let any: number | null = null;
  for (let seed = 1; seed < 600 && pick === null; seed++) {
    const c = composeStageFull(5, seed, 'sneak');
    if (c.info.tune !== 'lament') continue;
    any ??= seed;
    if (c.info.lead === 'clarinet') pick = seed;
  }
  assert.equal(MEECA_SEED, pick ?? any ?? 1, 'the roll her recording was made from');
  assert.equal(meecaStageMusic().id, 'gen-5-8-s');
});
