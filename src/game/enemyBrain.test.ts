import test from 'node:test';
import assert from 'node:assert/strict';
import type { Enemy } from './types.ts';
import { FEET, stepPredator, stepSpider, type Box, type PredatorType } from './predatorAI.ts';
import { PERSONALITY, SPIDER, type PlayerRef } from './enemyBrain.ts';

const GROUND = 1000;
const mk = (type: PredatorType | 'spider', over: Partial<Enemy> = {}): Enemy => ({
  id: 1, type, x: 1000, y: GROUND - (type === 'spider' ? 12 : FEET[type]), vx: type === 'spider' ? SPIDER.nominal : PERSONALITY[type].nominal, vy: 0, width: 60, height: 30, hp: 3, maxHp: 3, facing: 1,
  patrolMinX: 600, patrolMaxX: 1400, attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0,
  hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, ...over,
});

const DT = 1 / 30;
const hits = (hurt: Box[], p: PlayerRef) =>
  hurt.some((h) => h.x < p.x + 13 && h.x + h.w > p.x - 13 && h.y < p.y && h.y + h.h > p.y - 38);

/** a player who stands still at `at`; returns what the animal did over `secs` */
function stand(type: PredatorType, at: number, secs: number, over: Partial<Enemy> = {}, player: Partial<PlayerRef> = {}) {
  const e = mk(type, over);
  const p: PlayerRef = { x: at, y: GROUND, ...player };
  const states = new Set<string>();
  let noticed = -1;
  let hitAt = -1;
  let minGap = Infinity;
  let minX = e.x;
  let maxX = e.x;
  for (let i = 0; i < secs * 30; i++) {
    const { ev, hurt } = stepPredator(e, p, DT);
    states.add(e.state ?? '');
    if (ev.notice && noticed < 0) noticed = i;
    if (hitAt < 0 && e.state !== 'patrol' && hits(hurt, p)) hitAt = i;
    minGap = Math.min(minGap, Math.abs(p.x - e.x));
    minX = Math.min(minX, e.x);
    maxX = Math.max(maxX, e.x);
  }
  return { e, states, noticed, hitAt, minGap, minX, maxX };
}

test('every hunter that walks goes after a player standing still, then its attack lands on him', () => {
  // each stands well outside its attack range but inside what it can sense
  for (const [type, at] of [['jaguar', 1300], ['tayra', 1300], ['ocelot', 1190], ['caiman', 1170]] as Array<[PredatorType, number]>) {
    for (const side of [1, -1]) {
      const r = stand(type, 1000 + (at - 1000) * side, 8, { facing: side as 1 | -1 });
      assert.ok(r.noticed >= 0, `${type} never noticed him (${side})`);
      assert.ok(r.hitAt >= 0, `${type} locked on but its attack never reached him (${side})`);
    }
  }
});

test('hunters actually close the distance (the old AI patrolled back and forth and ignored the player)', () => {
  for (const type of ['jaguar', 'tayra', 'ocelot', 'caiman'] as PredatorType[]) {
    const gap0 = PERSONALITY[type].engage + 60;
    const e = mk(type, { attackCooldown: 99 }); // not ready to attack: it still has to come and wait near him
    const p: PlayerRef = { x: e.x + gap0, y: GROUND };
    for (let i = 0; i < 150; i++) stepPredator(e, p, DT);
    assert.ok(Math.abs(p.x - e.x) < gap0 - 20, `${type} did not come closer (gap ${Math.abs(p.x - e.x)})`);
    assert.ok(Math.abs(p.x - e.x) >= PERSONALITY[type].keep - 40, `${type} walked into him instead of pacing`);
  }
});

test('personalities differ: jaguar and tayra run, the caiman crawls', () => {
  const speed = (type: PredatorType) => {
    const e = mk(type, { attackCooldown: 99 });
    const p: PlayerRef = { x: e.x + 330, y: GROUND };
    stepPredator(e, p, DT); // initialise
    const x0 = e.x;
    for (let i = 0; i < 30; i++) stepPredator(e, p, DT);
    return Math.abs(e.x - x0);
  };
  assert.ok(speed('jaguar') > 120, 'jaguar should sprint');
  assert.ok(speed('tayra') > 110, 'tayra should be quick');
  assert.ok(speed('caiman') < 50, 'caiman should crawl');
  assert.ok(speed('jaguar') > speed('ocelot'));
});

test('a hunter stays on its own ground, however far away the player is', () => {
  for (const type of ['jaguar', 'tayra', 'ocelot', 'caiman', 'snake'] as PredatorType[]) {
    for (const at of [200, 2300]) {
      const e = mk(type, { patrolMinX: 900, patrolMaxX: 1100, x: 1000 });
      const p: PlayerRef = { x: at, y: GROUND };
      let lo = e.x;
      let hi = e.x;
      for (let i = 0; i < 600; i++) {
        stepPredator(e, p, DT);
        lo = Math.min(lo, e.x);
        hi = Math.max(hi, e.x);
      }
      assert.ok(lo >= 900 - 15 && hi <= 1100 + 15, `${type} left its patch (${lo}..${hi})`);
    }
  }
});

test('the snake is shy: it backs away while you are not close, and strikes when you are', () => {
  const e = mk('snake', { facing: 1 });
  const p: PlayerRef = { x: e.x + 160, y: GROUND }; // inside what it senses, outside its strike range
  let struck = false;
  let startGap = 160;
  for (let i = 0; i < 90; i++) {
    stepPredator(e, p, DT);
    if (e.state === 'rear' || e.state === 'strike') struck = true;
  }
  assert.ok(!struck, 'a shy snake should not strike from this far');
  assert.ok(Math.abs(p.x - e.x) > startGap + 20, `it did not back away (gap ${Math.abs(p.x - e.x)})`);
  // now he steps up to it: it rears, strikes, and the strike reaches him
  p.x = e.x + 80;
  let reached = false;
  const seen = new Set<string>();
  for (let i = 0; i < 120; i++) {
    const { hurt } = stepPredator(e, p, DT);
    seen.add(e.state ?? '');
    if (e.state === 'strike' && hits(hurt, p)) reached = true;
  }
  for (const s of ['rear', 'strike', 'recover']) assert.ok(seen.has(s), `snake never reached ${s}`);
  assert.ok(reached, 'the strike did not reach a player standing 80px away');
});

test('a cornered shy snake holds its ground at the edge of its patch instead of backing off the ledge', () => {
  const e = mk('snake', { x: 1000, patrolMinX: 900, patrolMaxX: 1100, facing: 1 });
  const p: PlayerRef = { x: 1000 + 170, y: GROUND };
  for (let i = 0; i < 300; i++) stepPredator(e, p, DT);
  assert.ok(e.x >= 900 - 15 && e.x <= 1100 + 15);
});

test('the snake warns with a visible rear before it strikes', () => {
  const e = mk('snake');
  const p: PlayerRef = { x: e.x + 70, y: GROUND };
  let tell = -1;
  let strike = -1;
  for (let i = 0; i < 120 && strike < 0; i++) {
    const { ev } = stepPredator(e, p, DT);
    if (ev.telegraph && tell < 0) tell = i;
    if (e.state === 'strike') strike = i;
  }
  assert.ok(tell >= 0 && strike > tell);
  assert.ok((strike - tell) / 30 >= 0.33, 'not enough warning');
});

test('an animal loses interest once the player is gone; the tayra holds on longer than the caiman', () => {
  const lose = (type: PredatorType) => {
    const e = mk(type, { attackCooldown: 99 });
    const near: PlayerRef = { x: e.x + 140, y: GROUND };
    for (let i = 0; i < 20; i++) stepPredator(e, near, DT);
    assert.ok((e.alertT ?? 0) > 0, `${type} never locked on`);
    const gone: PlayerRef = { x: e.x + 5000, y: GROUND };
    let secs = 0;
    while ((e.alertT ?? 0) > 0 && secs < 30) {
      stepPredator(e, gone, DT);
      secs += DT;
    }
    return secs;
  };
  assert.ok(lose('tayra') > lose('caiman') + 2);
  assert.ok(lose('caiman') < 3.5);
});

test('a ducking sloth is harder to notice', () => {
  const d = PERSONALITY.jaguar.sense * 0.8;
  const standing = stand('jaguar', 1000 + d, 1);
  const ducking = stand('jaguar', 1000 + d, 1, {}, { ducking: true });
  assert.ok(standing.noticed >= 0, 'a standing sloth at 80% of its range should be noticed');
  assert.equal(ducking.noticed, -1, 'a ducking sloth at 80% of its range should not be');
});

test('an ocelot creeps up when your back is turned and slows when you face it', () => {
  const pace = (facing: 1 | -1) => {
    const e = mk('ocelot', { attackCooldown: 99 });
    const p: PlayerRef = { x: e.x + 230, y: GROUND, facing };
    stepPredator(e, p, DT);
    const x0 = e.x;
    for (let i = 0; i < 20; i++) stepPredator(e, p, DT);
    return e.x - x0;
  };
  // the player stands to the ocelot's right: facing right = his back is turned to it, facing left = he is looking at it
  const backTurned = pace(1);
  const facingIt = pace(-1);
  assert.ok(backTurned > facingIt * 2, `turned ${backTurned} vs watched ${facingIt}`);
});

test('the boa never slithers, but its head follows you once it has noticed', () => {
  const e = mk('boa', { vx: 0, facing: -1 });
  const p: PlayerRef = { x: e.x + 240, y: GROUND };
  stepPredator(e, p, DT);
  const x0 = e.x;
  for (let i = 0; i < 90; i++) stepPredator(e, p, DT);
  assert.ok(Math.abs(e.x - x0) < 1, 'a coil must not move');
  assert.equal(e.facing, 1, 'it should be watching him');
  // its strike reaches a player standing at its engage distance, on either side of it
  for (const side of [1, -1]) {
    const r = stand('boa', 1000 + side * (PERSONALITY.boa.engage - 3), 4, { vx: 0, facing: side as 1 | -1 });
    assert.ok(r.hitAt >= 0, `a boa should strike a player standing ${PERSONALITY.boa.engage}px ${side > 0 ? 'right' : 'left'} of it`);
  }
});

test('spiders wait until they sense you, then rush in bursts with a pause between', () => {
  const e = mk('spider', { vx: 0, patrolMinX: 0, patrolMaxX: 3000 });
  const far: PlayerRef = { x: e.x + 2000, y: GROUND };
  for (let i = 0; i < 60; i++) stepSpider(e, far, DT);
  assert.equal(e.state, 'wait');
  assert.equal(e.x, 1000);
  const near: PlayerRef = { x: e.x + 300, y: GROUND };
  const seen = new Set<string>();
  let moved = 0;
  for (let i = 0; i < 90; i++) {
    const x = e.x;
    stepSpider(e, near, DT);
    seen.add(e.state ?? '');
    moved += e.x - x;
  }
  for (const s of ['run', 'pause']) assert.ok(seen.has(s), `spider never ${s}`);
  assert.ok(moved > 100, `spider barely moved (${moved})`);
  // average speed in the same ballpark as the old constant scuttle (80 px/s) so boss fights keep their difficulty
  const avg = (SPIDER.speed * SPIDER.burst) / (SPIDER.burst + SPIDER.pause);
  assert.ok(avg > 60 && avg < 110, `average ${avg}`);
});

// ---------------------------------------------------------------------------------------------- hunting grounds

import { assignTerritories, groundRun, keepOnLedge, separateHunters } from './enemyBrain.ts';

const solid = (x: number, width: number, y = GROUND) => ({ x, y, width, type: 'solid' as const });

test('groundRun joins touching platforms at the same height and stops at a pit', () => {
  const plats = [solid(0, 400), solid(400, 300), solid(760, 200), solid(0, 300, GROUND - 120)];
  assert.deepEqual(groundRun(plats, 100, GROUND), [0, 700]);
  assert.deepEqual(groundRun(plats, 800, GROUND), [760, 960]);
  assert.equal(groundRun(plats, 730, GROUND), null); // standing in the pit
  assert.deepEqual(groundRun(plats, 100, GROUND - 120), [0, 300]);
});

test('a hunter may chase past its patch but never past the end of the ground, and a shy snake stays home', () => {
  const plats = [solid(0, 1100)];
  const jag = mk('jaguar', { x: 500, patrolMinX: 450, patrolMaxX: 550 });
  const snake = mk('snake', { x: 500, patrolMinX: 450, patrolMaxX: 550 });
  const narrow = mk('tayra', { x: 1000, patrolMinX: 960, patrolMaxX: 1060 });
  assignTerritories([jag, snake, narrow], plats, (e) => e.y + FEET[e.type as PredatorType]);
  assert.equal(jag.huntMinX, 450 - PERSONALITY.jaguar.reach);
  assert.equal(jag.huntMaxX, 550 + PERSONALITY.jaguar.reach);
  assert.deepEqual([snake.huntMinX, snake.huntMaxX], [450, 550]);
  assert.equal(narrow.huntMaxX, 1100 - 16, 'it must keep off the lip of the ground');
});

test('a hunter really does leave its patch to catch a player who stands in its hunting ground', () => {
  const e = mk('tayra', { x: 1000, patrolMinX: 950, patrolMaxX: 1050, attackCooldown: 99 });
  assignTerritories([e], [solid(0, 3000)], (q) => q.y + FEET.tayra);
  const p: PlayerRef = { x: 1000 + 280, y: GROUND };
  for (let i = 0; i < 200; i++) stepPredator(e, p, DT);
  assert.ok(e.x > 1100, `it should have run out of its patch (x=${e.x})`);
  assert.ok(e.x <= (e.huntMaxX ?? 0) + 15);
  // the player walks away: it loses interest and walks back to its patch
  const gone: PlayerRef = { x: 9000, y: GROUND };
  for (let i = 0; i < 30 * 12; i++) stepPredator(e, gone, DT);
  assert.ok(e.x <= 1050 + 15, `it should be home again (x=${e.x})`);
});

test('two hunters at the same spot ease apart instead of standing inside each other', () => {
  const a = mk('jaguar', { id: 1, x: 800, alertT: 3, state: 'patrol', huntMinX: 600, huntMaxX: 1000 });
  const b = mk('jaguar', { id: 2, x: 802, alertT: 3, state: 'patrol', huntMinX: 600, huntMaxX: 1000 });
  for (let i = 0; i < 60; i++) separateHunters([a, b], DT);
  assert.ok(Math.abs(a.x - b.x) >= Math.min(a.width, b.width) * 0.6 - 1, `still ${Math.abs(a.x - b.x)}px apart`);
});

test('no animal can ever stand past the edge of its ground, even with a bad patrol range, a knockback or a shy retreat', () => {
  // ground from 500 to 900 with a pit on both sides; the patrol range wrongly runs out over the pits
  const plats = [solid(500, 400)];
  for (const type of ['snake', 'ocelot', 'jaguar', 'caiman', 'tayra', 'boa'] as PredatorType[]) {
    for (const at of [0, 1500]) {
      const e = mk(type, { x: 700, patrolMinX: 300, patrolMaxX: 1100, vx: type === 'boa' ? 0 : PERSONALITY[type].nominal });
      assignTerritories([e], plats, (q) => q.y + FEET[type]);
      const p: PlayerRef = { x: at, y: GROUND };
      for (let i = 0; i < 600; i++) {
        stepPredator(e, p, DT);
        if (i === 100) e.x = 1300; // a huge knockback over the pit
        keepOnLedge(e);
        assert.ok(e.x >= 500 && e.x <= 900, `${type} was over the pit at x=${e.x}`);
      }
    }
  }
});
