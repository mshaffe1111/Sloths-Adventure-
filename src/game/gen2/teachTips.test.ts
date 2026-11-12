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
  const plain = hintsOf();
  assert.ok(plain.some((h) => h.text === words), 'the trap tip is laid');
  assert.ok(plain.every((h) => !h.teach), 'none is a teach line unless the kit says so');
  const taught = hintsOf(['traps']);
  assert.deepEqual(taught.filter((h) => h.teach).map((h) => h.text), [words], 'the trap tip, and only it, is a teach line');
});
