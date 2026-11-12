/**
 * Audit C (things-2): the Android app's flag resume (flagResume.ts; engine.ts start() -> startAtFlag). A run the phone cut off starts the
 * stage again AT the last flag he had reached. On a stage with a goal (gather, beat, free, find) the door is sealed until the goal is met,
 * and nearly all of it lies behind that flag: the resume must bring back what the run had picked up, or the goal cannot be met going
 * forward.
 *
 * Correct: wherever a resumed run puts him, the goal he still owes can be met from there going forward.
 *
 * (The audit's first version saved a bare flag by hand; here the cut-off run is a real engine run on the Android app that picks every
 * petal behind the last flag and then touches it, so the flag in storage is the one engine.ts writes.)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { clearFlag, flagFor } from './flagResume.ts';

const native = (on: boolean) => {
  const g = globalThis as { Capacitor?: unknown };
  if (on) g.Capacitor = { isNativePlatform: () => true };
  else delete g.Capacitor;
};
const flora = (c: { type: string }) => c.type === 'flower' || c.type === 'leaf' || c.type === 'fruit';

test('a gather stage resumed at its last flag does not leave the goal behind him', () => {
  const id = '1-2';
  native(true);
  clearFlag();
  try {
    // the run the phone cut off: every petal behind the last flag picked, then the flag
    const a = new RealPlay(id, 1);
    a.e.isRunning = true;
    assert.equal(a.stage.config.objectiveType, 'harvest');
    const cps = a.stage.checkpoints ?? [];
    const last = cps[cps.length - 1];
    assert.ok(last, 'the stage has flags');
    const behind = a.collectibles.filter((c) => flora(c) && c.x < last.x - 200).sort((p, q) => p.x - q.x);
    for (const c of behind) {
      a.stand(c.x, c.y + 20);
      a.frame();
    }
    const picked = a.p.fruitsCollected;
    assert.ok(picked >= behind.length * 0.9, `set-up: the cut-off run picked the petals behind the flag (${picked} of ${behind.length})`);
    a.stand(last.x, last.y);
    a.frame();
    const back = flagFor(id);
    assert.ok(back, 'the flag is kept for the next start of this stage');

    // the app is opened again and the stage starts at the flag
    const r = new RealPlay(id, 1);
    r.e.startAtFlag(back);
    assert.ok(Math.abs(r.p.x - last.x) < 2, 'he starts at the flag');

    const need = r.stage.config.targetCount - r.p.fruitsCollected;
    const petals = r.collectibles.filter((c) => !c.collected && flora(c));
    const ahead = petals.filter((c) => c.x >= last.x - 200).length;
    assert.ok(need <= ahead, `at the last flag (x ${Math.round(last.x)} of ${Math.round(r.stage.exitTotemX)}) he owes ${need} petals and ${ahead} lie ahead: ${petals.length - ahead} are behind him`);
    assert.equal(r.p.fruitsCollected, picked, 'the petals the run had picked are counted again');
  } finally {
    native(false);
    clearFlag();
  }
});
