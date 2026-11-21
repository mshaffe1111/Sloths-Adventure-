/**
 * R-165.157, R-165.343: the testers' link (#ctest) plays the stage the tester picks, any of World 1 (playRecorder.ts CTEST_STAGES, Matt 11-20
 * 2:39 PM ET), so a brand-new tester can start on any of them, not on 1-1. The first-play coach (touchCoach.ts: slide to run, slide up to
 * jump) was 1-1's alone, so a new tester there got no coaching at all.
 * Planted: with coachWanted's old rule (1-1 only) the #ctest case is false and this fails.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { headlessCanvas } from './headlessDom.ts';
import { GameEngine } from './engine.ts';
import { InputEngine } from './inputEngine.ts';
import { generateAllLevels } from './worldsData.ts';
import { coachWanted } from './touchCoach.ts';
import { CTEST_STAGES } from './playRecorder.ts';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';

const loc = globalThis as unknown as { location: { search: string; hash: string } };
const lvl = (id: string) => ({ ...generateAllLevels().find((l) => l.id === id)!, unlocked: true });
/** a brand-new touch player (?coach=1 stands in for the coarse-pointer check, which the headless DOM lacks) */
function freshPhone(hash: string) {
  localStorage.clear();
  loc.location.search = '?coach=1';
  loc.location.hash = hash;
}

test("the testers' stages are all of World 1 (Matt 11-20 2:39 PM ET: the picker), and each builds and plays on both settings", () => {
  assert.deepEqual(CTEST_STAGES, ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9']);
  for (const id of CTEST_STAGES) {
    for (const setting of ['normal', 'easy'] as const) {
      setDifficulty(setting);
      const r = new RealPlay(id, 1);
      assert.ok(r.platforms.length > 20, `${id} ${setting}: a stage was built`);
      // (he moves off the spawn: a walk on a run, up the vines on a climb)
      const [x0, y0] = [r.p.x, r.p.y];
      for (let i = 0; i < 90; i++) r.frame({ right: i < 45, up: i >= 45 });
      const moved = Math.hypot(r.p.x - x0, r.p.y - y0);
      assert.ok(!r.died && moved > 30, `${id} ${setting}: he moved ${Math.round(moved)} px`);
      (r.e as unknown as { stop(): void }).stop();
    }
  }
  setDifficulty('normal');
});

test('a new tester on the #ctest link is coached on the stage picked; off the link the coach stays on 1-1 alone', () => {
  try {
    freshPhone('#ctest');
    for (const id of CTEST_STAGES) assert.equal(coachWanted(id, undefined), true, `the #ctest stage ${id} coaches a brand-new tester`);
    assert.equal(coachWanted('1-1', undefined), true, '1-1 still coaches');
    assert.equal(coachWanted('2-1', undefined), false, 'no stage the link does not offer');
    freshPhone('');
    for (const id of CTEST_STAGES.filter((x) => x !== '1-1')) assert.equal(coachWanted(id, undefined), false, `the full game: ${id} is not a first stage`);
    assert.equal(coachWanted('1-1', undefined), true);
  } finally {
    freshPhone('');
    loc.location.search = '';
  }
});

/** a stage a tester picks that is not 1-1 (1-1 coaches in the full game as well) */
const PICKED = '1-4';
test('on the real engine, starting a picked #ctest stage on a new phone makes the coach (and only with #ctest)', () => {
  const coachOn = (hash: string) => {
    freshPhone(hash);
    const e = new GameEngine(headlessCanvas(), lvl(PICKED), new InputEngine(), {} as never);
    e.start();
    const on = (e as unknown as { coach: unknown }).coach != null;
    e.stop();
    return on;
  };
  try {
    assert.equal(coachOn('#ctest'), true, `no coach on ${PICKED} for a new tester`);
    assert.equal(coachOn(''), false, `the full game coaches ${PICKED} too`);
  } finally {
    freshPhone('');
    loc.location.search = '';
  }
});
