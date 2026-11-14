/**
 * FIX-A (11-13): the story keeper's final words (reference/story/STORY-KEEPER.md "Final calls, 11-13 10:47 AM ET"), copied exactly,
 * read through the same code the screen calls.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { lessonDotLine } from './lessons.ts';
import { DOT_HINTS } from './finds.ts';
import { PREDATOR_ENTRIES } from './journal.ts';
import { CREATURE_LORE } from './creatureLore.ts';

test('R-165.171: the first-jump lesson says hop up OR over (it fires at a raised step as well as a gap), in each input\'s words', () => {
  assert.equal(lessonDotLine('gap', 'screen')?.text, 'Flick up to hop up or over.');
  assert.equal(lessonDotLine('gap', 'pad')?.text, 'Press Jump to hop up or over.');
  assert.equal(lessonDotLine('gap', 'keys')?.text, 'Press Space to hop up or over.');
});

test("R-165.165: 1-2's Keeper's Bell hint matches the screen (a low ledge, not a root)", () => {
  assert.equal(DOT_HINTS.w1_note, 'Down in the hollow, on the low ledge.');
});

test('R-165.166: the snake is the Golden Eyelash Viper wherever a player reads its name; no "tree snake" left in player words', () => {
  assert.equal((PREDATOR_ENTRIES as Record<string, { name: string }>).snake.name, 'Golden Eyelash Viper');
  assert.match(CREATURE_LORE.snake, /^Golden eyelash vipers sleep in the sun all morning/);
  // (every string literal in src/ that is not a comment or a test: no player-facing "tree snake" anywhere)
  const hits: string[] = [];
  const walk = (dir: string) => {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(f.name) && !/\.test\.ts$/.test(f.name)) {
        fs.readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
          if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
          const code = line.replace(/\/\/.*$/, '');
          if (/['"`][^'"`]*tree snake[^'"`]*['"`]/i.test(code)) hits.push(`${p}:${i + 1}`);
        });
      }
    }
  };
  walk(path.join(import.meta.dirname, '..'));
  assert.deepEqual(hits, []);
});
