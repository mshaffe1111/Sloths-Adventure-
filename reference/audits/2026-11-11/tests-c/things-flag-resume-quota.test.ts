/**
 * Audit C (things): the Android app's flag resume (flagResume.ts; engine.ts start() -> startAtFlag). A run the phone cut off starts the
 * stage again AT the last flag he had reached, but only the flag's place is kept ({ id, x, y, at }): nothing he had picked up, beaten or
 * freed. On a stage with a goal (gather, beat, free, find) the door is sealed until the goal is met, and nearly all of it lies behind
 * the flag he is put at. Meeca's stage is the one case that puts the progress back (engine.ts startAtFlag: this.mc?.resumeAt).
 *
 * Correct: wherever a resumed run puts him, the goal he still owes can be met from there going forward (progress restored, or a goal
 * stage resumed at its start).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { flagFor, saveFlag } from '../../../../src/game/flagResume.ts';

test('a gather stage resumed at its last flag does not leave the goal behind him', () => {
  const id = '1-2';
  const r = new RealPlay(id, 1);
  assert.equal(r.stage.config.objectiveType, 'harvest');
  const cps = r.stage.checkpoints ?? [];
  const last = cps[cps.length - 1];
  assert.ok(last, 'the stage has flags');

  // the cut-off run reached the last flag (what engine.ts saves there on the Android app), and the app is opened again
  const mem = new Map<string, string>();
  const store = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
  saveFlag(id, last.x, last.y, 1000, store);
  const back = flagFor(id, 2000, store);
  assert.ok(back, 'the flag is kept for the next start of this stage');
  r.e.startAtFlag(back);
  assert.ok(Math.abs(r.p.x - last.x) < 2, 'he starts at the flag');

  const need = r.stage.config.targetCount - r.p.fruitsCollected;
  const petals = r.collectibles.filter((c) => !c.collected && (c.type === 'flower' || c.type === 'leaf' || c.type === 'fruit'));
  const ahead = petals.filter((c) => c.x >= last.x - 200).length;
  assert.ok(need <= ahead, `at the last flag (x ${Math.round(last.x)} of ${Math.round(r.stage.exitTotemX)}) he owes ${need} petals and ${ahead} lie ahead: ${petals.length - ahead} are behind him`);
});
