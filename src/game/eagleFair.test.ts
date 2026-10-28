/**
 * 1-7 A Very Good Bush's eagle, made fair for World 1 (QA 2026-10-28, build 39fc3db: "It saw you! Slide down in a bush!" came after
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

/** 1-7 in the real engine, real damage: he walks into the watched stretch and stands in the open through the passes */
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
  const zones = e.proto.watch as WatchZone[];
  const z = zones[0];
  const bushes = e.proto.bushes as Array<{ x: number; w: number }>;
  // in the open: between the first two bushes
  const sx = (bushes[0].x + bushes[0].w + bushes[1].x) / 2;
  sim.stand(sx, sim.p.y);
  sim.p.invincibleTimer = 0;
  const log: Array<{ t: number; what: string }> = [];
  let hp = sim.p.hp;
  let wasPhase = e.watch.phase;
  for (let i = 0; i < 30 * 40; i++) {
    sim.frame();
    sim.p.invincibleTimer = Math.min(sim.p.invincibleTimer, 0.5);
    if (e.watch.phase !== wasPhase) log.push({ t: sim.t, what: `${e.watch.phase} ${e.watch.passes}` });
    wasPhase = e.watch.phase;
    if (sim.p.hp < hp) log.push({ t: sim.t, what: `hit at pass ${e.watch.passes}` });
    hp = sim.p.hp;
  }
  return { log, said: sim.said, z, sx };
}

test('1-7: the hide is said before the first pass, the first pass cannot hurt, the next one can, and its warning is Dot\'s line too', () => {
  for (const seed of [1, 2, 3]) {
    const { log, said } = standInOpen(seed);
    const firstWarn = log.find((l) => l.what.startsWith('warn'));
    assert.ok(firstWarn, `seed ${seed}: the eagle came`);
    const hide = said.find((s) => /bush to hide/i.test(s.text));
    assert.ok(hide && hide.t < firstWarn!.t + 0.1, `seed ${seed}: the hide was said (${hide?.t.toFixed(1)}) before or at the first screech (${firstWarn!.t.toFixed(1)})`);
    const hits = log.filter((l) => l.what.startsWith('hit'));
    assert.ok(hits.length > 0, `seed ${seed}: out in the open he is hit in the end`);
    assert.ok(hits.every((h) => !h.what.endsWith('pass 0')), `seed ${seed}: the first pass hit him: ${JSON.stringify(log)}`);
    const warns = log.filter((l) => l.what.startsWith('warn'));
    assert.ok(warns.length >= 2 && said.some((s) => s.text === 'Hide! Into a bush!' && s.t >= warns[1].t - 0.1), `seed ${seed}: the second warning was Dot's line too`);
    // (and the calms are long for World 1: no two screeches closer than 9 s apart while it teaches)
    for (let i = 1; i < warns.length; i++) assert.ok(warns[i].t - warns[i - 1].t >= 9 + 2 + 2.6 - 0.5, `seed ${seed}: screeches ${warns[i - 1].t.toFixed(1)} and ${warns[i].t.toFixed(1)}`);
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
