// No fall in 1-1 costs a life, on Easy or Normal (R-165.86; the 1-1 brief's `softFalls`, gen2/types.ts GraphBrief): flown in the real
// engine at 30 fps on seeds from the 11-10 play window. RealPlay swaps the engine's loseLife for a stub (realPlay.ts: it only notes
// `died`), which would make "no life lost" pass on any build: `real()` takes the stub off, so the engine's own loseLife runs here.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { withPlaySeed } from './testlink1_1.ts';
import { recorder } from './playRecorder.ts';
import type { Platform } from './types.ts';
import { earthHoles } from './gen2/pipeline.ts';
import { FIRST_RUN_11 } from './gen2/firstRun11.ts';
import { provenSeeds } from './gen2/seedList.ts';
import { skyline } from './helpLadder.ts';

type Eng = { lives: number; softOn: boolean; softAt: { x: number; y: number } | null; isGameOver: boolean; loseLife?: unknown; currentStage: { gen2?: { softFalls?: boolean }; meta: { pieces: Array<{ k: string; x0: number; x1: number }> } } };

/** 1-1 on a setting and a listed seed, the engine's own loseLife back in place, and every recorder event it writes */
function real(seed: number, setting: 'normal' | 'easy', brief = true) {
  setDifficulty(setting);
  const r = withPlaySeed(seed, () => new RealPlay('1-1', 1));
  const e = (r as unknown as { e: Eng }).e;
  delete e.loseLife;
  assert.equal(typeof (e as unknown as { loseLife: unknown }).loseLife, 'function', 'the engine\'s own loseLife runs');
  // (planted: the stage as it is without the brief's word, origin/main's 1-1: the engine reads the stage's data as it loads)
  if (!brief) {
    e.softOn = setting === 'easy';
    // (and without the soft zones the word lays over its earth's holes, R-165.221 pipeline.ts softHoles: lip to lip, one per hole)
    const st = e.currentStage as unknown as { platforms: Platform[]; heartFalls?: Array<{ x0: number; x1: number; soft?: boolean }> };
    const holes = earthHoles(st.platforms);
    st.heartFalls = (st.heartFalls ?? []).filter((z) => !(z.soft && holes.some((h) => h.x0 === z.x0 && h.x1 === z.x1)));
  }
  const events: string[] = [];
  const was = recorder.event;
  recorder.event = function (this: typeof recorder, what: string, detail?: string | number) {
    events.push(`${what} ${detail ?? ''}`.trim());
    return was.call(this, what, detail);
  } as typeof recorder.event;
  return { r, e, events, done: () => { recorder.event = was; setDifficulty('normal'); } };
}

/** walk him off the right edge of `pf` and fly until he is set back, stands again or 8 s pass */
function walkOff(f: ReturnType<typeof real>, pf: Platform): { fellAt: number; back: boolean; left: number } {
  const { r, events } = f;
  events.length = 0;
  r.stand(pf.x + pf.width - 40, pf.y);
  for (let i = 0; i < 6; i++) r.frame({});
  let fellAt = pf.x + pf.width, back = false, left = pf.id;
  for (let i = 0; i < 30 * 8; i++) {
    const x = r.p.x;
    // (the ledge he left: the last one he stood on before the fall)
    if (!back && r.p.grounded && r.standingOn >= 0) left = r.standingOn;
    r.frame({ right: i < 45 && !back });
    if (!back && events.some((v) => v.startsWith('softFall'))) { back = true; fellAt = x; i = Math.max(i, 30 * 8 - 45); }
    if (events.some((v) => v.startsWith('lostLife'))) break;
    if (!back && i > 60 && r.p.grounded) break;
  }
  return { fellAt, back, left };
}

const pieceAt = (e: Eng, x: number): string => e.currentStage.meta.pieces.find((q) => x >= q.x0 - 2 && x < q.x1)?.k ?? 'a seam';

/** the sweep: off the right edge of every solid piece; each life lost, by piece, and each set-back that ended somewhere wrong */
function sweep(seed: number, setting: 'normal' | 'easy', brief = true) {
  const f = real(seed, setting, brief);
  const { r, e, events } = f;
  const lives = e.lives;
  const lost: string[] = [], wrong: string[] = [];
  let backs = 0;
  const solids = r.platforms.filter((p) => p.type === 'solid' && p.width >= 60).sort((a, b) => a.x - b.x);
  for (const pf of solids) {
    const { fellAt, back } = walkOff(f, pf);
    const where = `${pieceAt(e, pf.x)}@${Math.round(pf.x + pf.width)}`;
    if (events.some((v) => v.startsWith('lostLife')) || e.lives !== lives) {
      lost.push(where);
      // (a life went: the next walk starts clean, as RealPlay's stand does for everything else)
      Object.assign(e, { lives, isGameOver: false, down: null, outOfLives: false });
      continue;
    }
    if (!back) continue;
    backs++;
    // the set-back spot: standing, on a solid ledge wide enough to stand on, never ahead of where he fell
    const on = r.platforms.find((q) => q.id === r.standingOn);
    if (!r.p.grounded || !on || on.type !== 'solid' || on.broken || on.width < 60) wrong.push(`${where}: not standing on a solid ledge`);
    else if (r.p.x > fellAt + 1) wrong.push(`${where}: set back ahead of the fall (x ${Math.round(r.p.x)} past ${Math.round(fellAt)})`);
    else if (r.p.x < on.x || r.p.x > on.x + on.width) wrong.push(`${where}: off the ledge's top`);
  }
  f.done();
  return { lost, wrong, backs, solids: solids.length };
}

// (listed seeds of 1-1: the first run and the list's first two others, read from the list. Re-pinned by POLISH-9b (R-165.228): 982 and
// 24432 left the list at POLISH-7's relist and this swept raw searches' stages, which the A/D-only graph ruling changed; 9800 is no longer
// the first run. Earlier: P11's 9800/982/24432; the 11-10 window's 3747, 15458, 19582)
const SWEEP = [FIRST_RUN_11.seed, ...provenSeeds('1-1').filter((s) => s !== FIRST_RUN_11.seed).slice(0, 2)];
for (const setting of ['normal', 'easy'] as const) {
  for (const seed of SWEEP) {
    test(`1-1 ${setting} seed ${seed}: off the right edge of every solid piece, no life is lost and every set-back stands on a ledge behind the fall`, () => {
      const s = sweep(seed, setting);
      assert.deepEqual(s.lost, [], `lives lost: ${s.lost.join(', ')}`);
      assert.deepEqual(s.wrong, [], s.wrong.join('; '));
      assert.ok(s.backs >= 5, `the sweep really fell: ${s.backs} set-backs over ${s.solids} pieces`);
    });
  }
}

test('planted: without the brief\'s word (origin/main\'s 1-1) the same sweep on Normal loses lives in the pits, through the real loseLife', () => {
  // (the first run without the word; POLISH-9b: it was raw 982, whose w1-log-chain-rise no longer lays)
  const s = sweep(FIRST_RUN_11.seed, 'normal', false);
  assert.ok(s.lost.length >= 3, `lives lost: ${s.lost.join(', ') || 'none'}`);
});

// (POLISH-9b, R-165.228: retargeted from raw 982's w1-log-chain-rise, which no listed layout lays now, to the first run's w1-last-step-up:
// the piece's first hole on its walking surface (helpLadder.ts skyline), a rise from the ledge he leaves to the top past the hole)
test('1-1 Normal, the first run, w1-last-step-up: walked off a rising gap he is set back on the ledge he left, softFall recorded, no life lost', () => {
  const f = real(FIRST_RUN_11.seed, 'normal');
  const { r, e, events } = f;
  assert.equal(e.softOn, true, 'the whole-stage soft fall is on from the stage\'s brief');
  const piece = e.currentStage.meta.pieces.find((q) => q.k === 'w1-last-step-up');
  assert.ok(piece, 'the first run lays w1-last-step-up');
  const segs = skyline(piece!, (r.e as unknown as { roadBoxes(): Parameters<typeof skyline>[1] }).roadBoxes());
  const i = segs.findIndex((a, j) => j + 1 < segs.length && a.x1 >= piece!.x0 && a.x1 <= piece!.x1 && segs[j + 1].x0 > a.x1 + 1 && a.x1 - a.x0 >= 120);
  assert.ok(i >= 0, 'the piece has a hole');
  const take = r.platforms.filter((p) => p.type === 'solid' && Math.abs(p.y - segs[i].y) < 1 && p.x < segs[i].x1 && p.x + p.width >= segs[i].x1 - 1)[0];
  const logs = [take, { x: segs[i + 1].x0, y: segs[i + 1].y } as Platform];
  assert.ok(take && logs[1].y < take.y, `the walking surface rises past the hole (${take?.y} -> ${logs[1].y})`);
  const lives = e.lives, hp = r.p.hp;
  const { back, fellAt, left } = walkOff(f, logs[0]);
  const ledge = r.platforms.find((q) => q.id === left)!;
  assert.ok(ledge.x >= piece!.x0 - 2 && ledge.x < logs[1].x, 'the ledge he left is under the rise');
  assert.ok(back, `a soft set-back, not: ${events.join(' | ')}`);
  assert.equal(events.filter((v) => v.startsWith('softFall')).length, 1, 'softFall is recorded once');
  assert.ok(!events.some((v) => v.startsWith('lostLife')), 'no lostLife is written');
  assert.equal(e.lives, lives, 'lives unchanged');
  assert.equal(r.p.hp, hp, 'hearts unchanged');
  assert.equal(r.standingOn, ledge.id, 'standing on the ledge he left');
  assert.ok(r.p.grounded && Math.abs(r.p.y - ledge.y) < 1, `feet on its top (y ${Math.round(r.p.y)} on ${ledge.y})`);
  assert.ok(r.p.x >= ledge.x && r.p.x <= fellAt && r.p.x <= ledge.x + ledge.width - Math.min(150, ledge.width / 2) + 1, `clear of the edge he left by (x ${Math.round(r.p.x)}, ledge ${ledge.x}..${ledge.x + ledge.width})`);
  f.done();
});
