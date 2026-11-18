/**
 * R-165.157: the testers' link (#ctest) plays playRecorder.ts CTEST_LEVEL_ID (1-5, Matt 11-13 8:48 PM ET), so a brand-new tester starts there, not on 1-1. The
 * first-play coach (touchCoach.ts: slide to run, slide up to jump) was 1-1's alone, so a new tester there got no coaching at all.
 * Planted: with coachWanted's old rule (1-1 only) the #ctest case is false and this fails.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { headlessCanvas } from './headlessDom.ts';
import { GameEngine } from './engine.ts';
import { InputEngine } from './inputEngine.ts';
import { generateAllLevels } from './worldsData.ts';
import { coachWanted } from './touchCoach.ts';
import { CTEST_LEVEL_ID } from './playRecorder.ts';
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

test("the testers' stage is the one Matt named (1-5, Where She Walked: 11-13 8:48 PM ET), and it builds and plays", () => {
  assert.equal(CTEST_LEVEL_ID, '1-5');
  for (const setting of ['normal', 'easy'] as const) {
    setDifficulty(setting);
    const r = new RealPlay(CTEST_LEVEL_ID, 1);
    assert.ok(r.platforms.length > 20, `${CTEST_LEVEL_ID} ${setting}: a stage was built`);
    // (he moves off the spawn: a walk on a run, up the vines on a climb)
    const [x0, y0] = [r.p.x, r.p.y];
    for (let i = 0; i < 90; i++) r.frame({ right: i < 45, up: i >= 45 });
    const moved = Math.hypot(r.p.x - x0, r.p.y - y0);
    assert.ok(!r.died && moved > 30, `${CTEST_LEVEL_ID} ${setting}: he moved ${Math.round(moved)} px`);
    (r.e as unknown as { stop(): void }).stop();
  }
  setDifficulty('normal');
});

test('a new tester on the #ctest link is coached on its stage; off the link the coach stays on 1-1 alone', () => {
  try {
    freshPhone('#ctest');
    assert.equal(coachWanted(CTEST_LEVEL_ID, undefined), true, 'the #ctest stage coaches a brand-new tester');
    assert.equal(coachWanted('1-1', undefined), true, '1-1 still coaches');
    assert.equal(coachWanted('1-2', undefined), false, 'no other stage');
    freshPhone('');
    assert.equal(coachWanted(CTEST_LEVEL_ID, undefined), false, 'the full game: the testers\' stage is not a first stage');
    assert.equal(coachWanted('1-1', undefined), true);
  } finally {
    freshPhone('');
    loc.location.search = '';
  }
});

test('on the real engine, starting the #ctest stage on a new phone makes the coach (and only with #ctest)', () => {
  const coachOn = (hash: string) => {
    freshPhone(hash);
    const e = new GameEngine(headlessCanvas(), lvl(CTEST_LEVEL_ID), new InputEngine(), {} as never);
    e.start();
    const on = (e as unknown as { coach: unknown }).coach != null;
    e.stop();
    return on;
  };
  try {
    assert.equal(coachOn('#ctest'), true, `no coach on ${CTEST_LEVEL_ID} for a new tester`);
    assert.equal(coachOn(''), false, `the full game coaches ${CTEST_LEVEL_ID} too`);
  } finally {
    freshPhone('');
    loc.location.search = '';
  }
});
