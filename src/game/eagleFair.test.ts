/**
 * 1-7 A Very Good Bush's eagle, made fair for World 1 (the watcher's rules below; 1-7 itself is held on the kit's eagle since BUILD-17) (QA 2026-10-28, build 39fc3db: "It saw you! Slide down in a bush!" came after
 * the first hit; steering down mid-slide did not hide; the "HIDE!" sign was in the world only; it came about every 3 s, often from off
 * screen; an expert took 16 hits and lost 3 lives).
 *   - the first calm is a whole calm of the zone (not the 3 s a new watch started with), and the first pass is a warning that cannot
 *     hurt: seen in the open, it dives and pulls up short;
 *   - the hide is said before the first pass can see him;
 *   - every later warning while he is in the open is also Dot's line;
 *   - inside a bush, a thumb that is still running and slides down hides him (touchGestures.ts inCover).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { TouchGestures, type GestureSink } from './touchGestures.ts';
import { harmlessPass, newWatch, stepWatch, type WatchZone } from './watcher.ts';
import { isKitSweeper } from './gen2/stillLay.ts';
import { LINES_17 } from './gen2/worlds/w1Arc17.ts';
import { EAGLE } from './predators/world1.ts';
import type { Enemy } from './types.ts';

test('the watcher: the first calm is a whole calm of the zone, and the first pass is harmless', () => {
  const s = newWatch();
  const z: WatchZone = { x0: 0, x1: 9999, calm: [9, 11] };
  let warnedAt = -1;
  for (let i = 0; i < 30 * 12 && warnedAt < 0; i++) if (stepWatch(s, 1 / 30, z, () => 0.5).warned) warnedAt = i / 30;
  assert.ok(warnedAt >= 9 - 0.05, `the first screech came at ${warnedAt.toFixed(2)} s`);
  assert.ok(harmlessPass(s), 'the first pass is harmless');
  for (let i = 0; i < 30 * 6; i++) stepWatch(s, 1 / 30, z, () => 0.5);
  assert.ok(!harmlessPass(s), 'the second is not');
});

/** 1-7 in the real engine, real damage: he stands in the open in its FIRST watched stretch (the kit's eagle over it, gen2/stillLay
 *  castWatches: the hand-built 1-7 and its watcher.ts eagle were deleted, BUILD-17) through the passes */
function standInOpen(seed: number) {
  try {
    localStorage.removeItem('sloth_tips_1-7');
  } catch {
    /* no storage */
  }
  const sim = new RealPlay('1-7', seed);
  const e = sim.e;
  sim.safe = false;
  sim.p.invincibleTimer = 0;
  const eagle = (e.enemies as Enemy[]).filter((q) => isKitSweeper(q)).sort((a, b) => a.patrolMinX - b.patrolMinX)[0];
  const bushes = (e.proto.bushes as Array<{ x: number; w: number }>).filter((b) => b.x + b.w > eagle.patrolMinX && b.x < eagle.patrolMaxX).sort((a, b) => a.x - b.x);
  // in the open: the middle of the widest bare run inside its stretch
  const cuts = [eagle.patrolMinX, ...bushes.flatMap((b) => [b.x, b.x + b.w]), eagle.patrolMaxX];
  let sx = eagle.patrolMinX, best = -1;
  for (let i = 0; i + 1 < cuts.length; i += 2) if (cuts[i + 1] - cuts[i] > best) (best = cuts[i + 1] - cuts[i]), (sx = (cuts[i] + cuts[i + 1]) / 2);
  sim.stand(sx, sim.p.y);
  sim.p.invincibleTimer = 0;
  const log: Array<{ t: number; what: string }> = [];
  let hp = sim.p.hp;
  let wasPhase = eagle.kit!.phase;
  for (let i = 0; i < 30 * 40; i++) {
    sim.frame();
    sim.p.invincibleTimer = Math.min(sim.p.invincibleTimer, 0.5);
    const s = eagle.kit!;
    // (a pass is called when its eye leaves 'rest' for 'hunt': the screech, engine.ts playEagleScreech)
    if (s.phase === 'hunt' && wasPhase === 'rest') log.push({ t: sim.t, what: `warn ${s.passes}` });
    wasPhase = s.phase;
    if (sim.p.hp < hp) log.push({ t: sim.t, what: `hit at pass ${s.passes}` });
    hp = sim.p.hp;
  }
  return { log, said: sim.said, eagle, sx };
}

test("1-7: the hide is said before the first pass, the first pass cannot hurt, the next one can, and the calms are the taught stretch's", () => {
  for (const seed of [1, 2, 3]) {
    const { log, said, eagle } = standInOpen(seed);
    const firstWarn = log.find((l) => l.what.startsWith('warn'));
    assert.ok(firstWarn, `seed ${seed}: the eagle came`);
    // (Dot's teach line for the bush, the keeper's own words: w1Arc17.ts LINES_17.bush)
    const hide = said.find((s) => s.text === LINES_17.bush);
    assert.ok(hide && hide.t < firstWarn!.t + 0.1, `seed ${seed}: the hide was said (${hide?.t.toFixed(1)}) before or at the first screech (${firstWarn!.t.toFixed(1)})`);
    const hits = log.filter((l) => l.what.startsWith('hit'));
    assert.ok(hits.length > 0, `seed ${seed}: out in the open he is hit in the end`);
    // (the taught stretch's first pass is free: it dives and pulls up short, core.ts sparedPass)
    assert.ok(eagle.kitFree, `seed ${seed}: the first stretch is laid with its first pass free`);
    assert.ok(hits.every((h) => !h.what.endsWith('pass 0')), `seed ${seed}: the first pass hit him: ${JSON.stringify(log)}`);
    // (and the calms are its own, the taught band's: no two screeches closer than its calm, the warn and the eye's crossing apart)
    const warns = log.filter((l) => l.what.startsWith('warn'));
    assert.ok(warns.length >= 2, `seed ${seed}: two passes in 40 s: ${JSON.stringify(log)}`);
    for (let i = 1; i < warns.length; i++) assert.ok(warns[i].t - warns[i - 1].t >= eagle.kitCool! + EAGLE.warn! - 0.5, `seed ${seed}: screeches ${warns[i - 1].t.toFixed(1)} and ${warns[i].t.toFixed(1)}`);
  }
});

function touchRig(cover: boolean) {
  const log: string[] = [];
  const sink: GestureSink = {
    move: (d) => log.push(`move:${d}`), duck: (on) => log.push(`duck:${on}`), jumpPress: () => log.push('jump'), jumpRelease: () => log.push('jumpUp'),
    punch: () => log.push('punch'), kick: () => log.push('kick'), mega: () => log.push('mega'), feedback: () => {},
  };
  const g = new TouchGestures(sink, () => 390, { assist: () => true, air: () => false, refined: () => true, inCover: () => cover });
  return { g, log };
}

test('inside a bush, a thumb still running right that slides down hides him; out in the open the same slide keeps running', () => {
  for (const cover of [true, false]) {
    const { g, log } = touchRig(cover);
    let now = 1000;
    g.down(1, 80, 600, now);
    // run right
    for (let i = 1; i <= 10; i++) {
      now += 40;
      g.move(1, 80 + i * 8, 600, now);
      g.tick(now);
    }
    // slide down while still running right (about 50 degrees down: a running thumb needs 63 to duck in the open)
    for (let i = 1; i <= 8; i++) {
      now += 40;
      g.move(1, 160 + i * 6, 600 + i * 7, now);
      g.tick(now);
    }
    assert.equal(log.includes('duck:true'), cover, `${cover ? 'in' : 'out of'} a bush: ${log.join(' ')}`);
  }
});
