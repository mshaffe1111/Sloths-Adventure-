// A kit's teach tips (WorldManifest.teachTips, P13 11-12): a tip the kit lists there is laid as the stage's own TEACH line
// (StageHint.teach: Dot waits for a clear moment, keeps it up its reading time, and no stock lesson cuts it); every other tip as before.
// Rolled on the test-side 1-3 (tools/engine/library13.ts), the one roll today with a tip for a drop trap. No stage id in engine code.
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGen2Stage } from './pipeline.ts';
import { config13, kitLib13 } from '../../../tools/engine/library13.ts';

const hintsOf = (teachTips?: string[]) => {
  const kit = kitLib13();
  if (teachTips) kit.manifest = { ...kit.manifest, teachTips };
  const st = buildGen2Stage({ config: config13() as never, kit, seed: 1, difficulty: 'normal' }) as unknown as { proto: { hints: Array<{ text: string; teach?: true }> } };
  return st.proto.hints;
};

test('a tip the kit lists in teachTips is laid as a teach line; with none listed, no hint is', () => {
  const words = kitLib13().manifest.tips!.traps;
  assert.ok(words, 'the kit has a trap tip');
  // (World 1's kit lists `traps` itself since W1C's 7d9efa0d: the plain case is the kit with the list emptied)
  const plain = hintsOf([]);
  assert.ok(plain.some((h) => h.text === words), 'the trap tip is laid');
  assert.ok(plain.every((h) => !h.teach), 'none is a teach line unless the kit says so');
  const taught = hintsOf(['traps']);
  assert.deepEqual(taught.filter((h) => h.teach).map((h) => h.text), [words], 'the trap tip, and only it, is a teach line');
});

test("World 1's kit as shipped: 1-3's teaching cards are teach lines, the lesson ONE card with both of the keeper's lines, then the first branch with no vine, on both settings", () => {
  const T = kitLib13().manifest.tips!;
  // (the lesson's two lines on one card, so the second can never be lost behind the first: the lead, 11-12)
  assert.equal(T.traps, "Snake napping under a hive ahead! Punch the vine! Don't worry, it only gives him a fright.", "the keeper's card, verbatim");
  const want = [T.traps, T.bare];
  for (const difficulty of ['normal', 'easy'] as const) {
    const st = buildGen2Stage({ config: config13() as never, kit: kitLib13(), seed: 1, difficulty }) as unknown as { proto: { hints: Array<{ text: string; teach?: true }> } };
    const taught = st.proto.hints.filter((h) => h.teach).map((h) => h.text);
    assert.deepEqual(taught, want, `${difficulty}: the lesson card, then the bare branch, each a teach line, and nothing else`);
    assert.ok(!st.proto.hints.some((h) => h.text === T['traps.then']), `${difficulty}: the lesson's second line is never a tip alone`);
  }
});
