/**
 * Audit C (audio) #10, 2026-11-11: the story's thunder buzz (StoryPlayer, the finale's "let go" beat) called navigator.vibrate itself, so
 * it buzzed for a player who never turned Vibration on (the default) or turned it off. Every buzz goes through haptics.ts, which obeys the
 * setting: this gate fails if any file in src calls navigator.vibrate directly.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HAPTIC } from './haptics.ts';

const SRC = fileURLToPath(new URL('..', import.meta.url));
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return files(p);
    return /\.(ts|tsx)$/.test(n) && !/\.test\.ts$/.test(n) ? [p] : [];
  });
}

test('every buzz goes through haptics.ts (the Vibration setting): no direct navigator.vibrate call anywhere else', () => {
  const direct: string[] = [];
  for (const f of files(SRC)) {
    const rel = relative(SRC, f).replaceAll('\\', '/');
    if (rel === 'game/haptics.ts') continue;
    readFileSync(f, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (/navigator\.vibrate\s*(\?\.)?\s*\(/.test(line)) direct.push(`${rel}:${i + 1}`);
      });
  }
  assert.deepEqual(direct, []);
});

test('the story\'s thunder has its own named buzz', () => {
  assert.deepEqual([...HAPTIC.thunder], [140]);
});
