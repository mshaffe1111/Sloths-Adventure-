import { test } from 'node:test';
import assert from 'node:assert/strict';
import { snakeKind, snakePose } from './snakeSprite.ts';
import { SNAKE_FRAMES } from './snakeAtlasData.ts';
import { SNAKE2_FRAMES } from './snake2AtlasData.ts';

test('the three kinds of snake are told apart by id and all three show up', () => {
  const kinds = new Set([1, 2, 3, 4, 5, 6].map(snakeKind));
  assert.deepEqual([...kinds].sort(), ['cobra', 'coiler', 'tree']);
  assert.equal(snakeKind(-4), snakeKind(-1 + 3 * 5), 'negative ids still land on a kind');
});

test('every kind has a painted frame for every part of its attack', () => {
  for (const kind of ['tree', 'cobra', 'coiler'] as const) {
    for (const mode of ['rear', 'strike', 'recover'] as const) {
      for (const t of [0, 0.1, 0.3]) {
        const p = snakePose(kind, mode, t);
        const frames = p.sheet === 2 ? SNAKE2_FRAMES : SNAKE_FRAMES;
        assert.ok(frames[p.name], `${kind} ${mode}: no frame ${p.name}`);
      }
    }
  }
});

test('a cobra warns with its hood, a coiler winds then unwinds, and neither looks like the plain snake', () => {
  assert.equal(snakePose('cobra', 'rear', 0.2).name, 'cobra');
  assert.equal(snakePose('coiler', 'rear', 0.05).name, 'coilup');
  assert.equal(snakePose('coiler', 'rear', 0.3).name, 'reared');
  for (const mode of ['rear', 'strike', 'recover'] as const) {
    assert.notEqual(snakePose('cobra', mode, 0.3).name, snakePose('tree', mode, 0.3).name);
  }
});
