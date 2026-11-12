/**
 * Audit C (audio) #11, 2026-11-11: paths "new replaces old" should have deleted. sound.cue() (the in-key cue pipeline, whose voices were
 * still fetched at every start), sound.scene(), startAmbient(), stopAmbient() had no caller, and setTempo() was a no-op the boss fight
 * still called (the enraged boss had no faster music, and nothing said so). This gate keeps the sound's front door free of them: every
 * method on it has a caller in the game or its tools.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const g = globalThis as unknown as Record<string, unknown>;
g.window ??= { setTimeout: () => 0, clearTimeout: () => {}, addEventListener: () => {}, location: { search: '' } };
g.localStorage ??= { getItem: () => null, setItem: () => {} };
g.document ??= { hidden: false, addEventListener: () => {} };
const { sound } = await import('./audio.ts');
const { Conductor } = await import('../audio/conductor.ts');

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return n === 'node_modules' ? [] : files(p);
    return /\.(ts|tsx|mjs)$/.test(n) && !/\.test\.ts$/.test(n) ? [p] : [];
  });
}

test('every method on the sound\'s front door (game/audio.ts) is called by the game or its tools', () => {
  const others = [...files(join(ROOT, 'src')), ...files(join(ROOT, 'tools'))]
    .filter((f) => !f.endsWith(join('src', 'game', 'audio.ts')))
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');
  const names = Object.getOwnPropertyNames(Object.getPrototypeOf(sound)).filter((n) => n !== 'constructor');
  const own = readFileSync(join(ROOT, 'src/game/audio.ts'), 'utf8');
  const uncalled = names.filter((n) => !new RegExp(`\\.${n}\\b`).test(others) && !new RegExp(`this\\.${n}\\(`).test(own));
  assert.deepEqual(uncalled, []);
});

test('no no-op left standing in for a feature: the conductor has no setTempo', () => {
  assert.equal('setTempo' in Conductor.prototype, false);
  assert.equal('cue' in Conductor.prototype, false);
});
