// A stage's cast on the creature kit (castPlay.ts) and its drop traps (dropTrap.ts), with no engine: the Golden Tree Snake on a
// branch as 1-3 lays it. Read top to bottom it says what the player can do about a snake, and what each thing costs him: nothing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CastPlay, groundUnder, type CastHero } from './castPlay.ts';
import type { CastData, TrapPost } from './castPlay.types.ts';
import { TRAP, handleBox, newTrap, scares, shake, stepTrap } from './dropTrap.ts';
import { LOUD } from './heroNoise.ts';
import { GONE_AFTER, TELL_MIN, touches } from './predators/core.ts';
import { SNAKE } from './predators/world1.ts';
import type { Enemy, Platform } from './types.ts';

const DT = 1 / 30;
const ledge = { id: 1, x: 0, y: 400, width: 380, height: 30, type: 'solid' } as Platform;
const branch = { id: 2, x: 400, y: 400, width: 320, height: 24, type: 'solid' } as Platform;
const lower = { id: 3, x: 0, y: 700, width: 900, height: 30, type: 'solid' } as Platform;
const snake = (over: Partial<Enemy> = {}): Enemy => ({
  id: 500, type: 'snake', x: 600, y: 386, vx: 0, vy: 0, width: 38, height: 22, hp: 1, maxHp: 1, facing: -1, patrolMinX: 420, patrolMaxX: 700,
  attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, ...over,
} as Enemy);
const trap = (over: Partial<TrapPost> = {}): TrapPost => ({ id: 1, kind: 'vine', load: 'hive', x: 330, y: 400, loadX: 560, loadY: 190, landY: 400, ...over });
const hero = (over: Partial<CastHero> = {}): CastHero => ({ x: 100, y: 400, vx: 0, vy: 0, facing: 1, grounded: true, holding: false, ...over });
const cast = (e: Enemy[], traps: TrapPost[] = [], kinds = ['snake']) => new CastPlay({ kinds, traps } as CastData, e, [ledge, branch, lower], 1);
/** run the cast for `seconds`, Pokey as `at` says; returns every hurt box that touched him and the events by name */
function play(c: CastPlay, seconds: number, at: (t: number) => CastHero, o: { t0?: number; easy?: boolean } = {}) {
  const seen = { told: 0, struck: 0, hit: 0, cleared: 0, woke: 0, landed: 0, fell: 0, tellAt: NaN, actAt: NaN };
  for (let i = 0, t = o.t0 ?? 0; i < Math.round(seconds / DT); i++, t += DT) {
    const h = at(t);
    const r = c.step(h, DT, t, !!o.easy);
    if (r.told.length && Number.isNaN(seen.tellAt)) seen.tellAt = t;
    if (r.struck.length && Number.isNaN(seen.actAt)) seen.actAt = t;
    seen.told += r.told.length; seen.struck += r.struck.length; seen.cleared += r.cleared.length; seen.woke += r.woke; seen.fell += r.fell.length;
    if (r.landed) seen.landed++;
    for (const k of r.hurts) if (touches(k.box, h)) seen.hit++;
  }
  return seen;
}

test('a cast animal stands on the ground under it, and only the kinds the stage names are the kit\'s', () => {
  const s = snake(), other = snake({ id: 501, type: 'ocelot' });
  const c = cast([s, other]);
  assert.equal(groundUnder([ledge, branch, lower], s), 400);
  assert.equal(c.members.length, 1);
  assert.ok(s.kit && !other.kit, 'the ocelot is not in this cast: the engine plays it as it always has');
  assert.deepEqual([s.kit!.y, s.kit!.minX, s.kit!.maxX, s.y], [400, 420, 700, 386], 'the kit stands it on its branch; the art still draws it from its middle');
  assert.equal(cast([snake()], [], []).members.length, 0, 'a stage that names no cast has none');
});

test('the snake is shy: he walks at it, it backs away; crowded, it rears for half a second or more, THEN strikes, on both settings', () => {
  for (const easy of [false, true]) {
    const s = snake(), c = cast([s]);
    const r = play(c, 6, (t) => hero({ x: Math.min(300 + 70 * t, 640), vx: 70 }), { easy });
    assert.ok(r.told >= 1 && r.struck >= 1, 'it told, then it struck');
    assert.ok(r.actAt - r.tellAt >= TELL_MIN - 1e-9, `the rear lasted ${(r.actAt - r.tellAt).toFixed(2)} s before the strike (${easy ? 'Easy' : 'Normal'})`);
    if (easy) assert.ok(r.actAt - r.tellAt >= TELL_MIN * 1.3 - DT, 'Easy rears for longer');
    assert.ok(r.hit >= 1, 'standing in its reach through the whole rear, he is struck');
  }
  const s = snake(), c = cast([s]);
  let sawRear = false;
  const r = play(c, 6, (t) => { sawRear ||= s.state === 'rear'; return hero({ x: sawRear ? 380 : Math.min(300 + 70 * t, 640), vx: 70 }); });
  assert.ok(sawRear && r.hit === 0, 'the rear is a real warning: he backs off when it rears and is never touched');
  assert.equal(s.isAttacking, false);
});

test('the art reads the kit: asleep, rearing with its warning counting down, striking, dazed', () => {
  const z = snake({ asleep: true }), c = cast([z]);
  assert.equal(z.state, 'sleep');
  play(c, 2, () => hero({ x: 300 }));
  assert.equal(z.state, 'sleep', 'he stands and watches from the ledge: it sleeps on');
  play(c, 1, (t) => hero({ x: 520 + 30 * t, vx: 30 }), { t0: 2 });
  assert.ok(z.state !== 'sleep' && (z.wakeT ?? 0) > 0, 'he walks up close: it wakes, drowsy');
  const s = snake(), c2 = cast([s]);
  let rear = 0;
  play(c2, 6, (t) => { if (s.state === 'rear') { rear++; assert.ok(s.telegraphTimer >= 0 && s.isAttacking); } return hero({ x: Math.min(300 + 70 * t, 640), vx: 70 }); });
  assert.ok(rear >= 14, 'it was drawn rearing for the whole tell');
  assert.equal(c2.beat(s, 'punch', 6, 500), true);
  c2.step(hero({ x: 500 }), DT, 6, false);
  assert.ok((s.stagger ?? 0) > 1.8, 'punched: it sits dazed for its 2 s');
});

test('punch: shoved along its branch and dazed; at the branch end it is knocked off, glides away and is cleared once', () => {
  const s = snake({ x: 690 }), c = cast([s]);
  assert.equal(c.beat(s, 'punch', 0, 650), true);
  const r = play(c, GONE_AFTER + 0.2, () => hero({ x: 650 }));
  assert.equal(r.cleared, 1, 'counted once');
  assert.equal(r.hit, 0);
  assert.equal(s.defeated, true, 'it is out of the stage');
  assert.equal(c.beat(s, 'punch', 3, 650), false, 'nothing left to hit');
  const m = snake({ x: 500 }), c2 = cast([m]);
  c2.beat(m, 'punch', 0, 460);
  const r2 = play(c2, 1.9, () => hero({ x: 470 }));
  assert.deepEqual([r2.cleared, r2.hit, m.defeated, m.x], [0, 0, false, 570], 'mid-branch: shoved 70 px and dazed, he stands beside it unhurt');
});

test('stomp: he vaults it. It goes home and leaves him be for 5 s, and is not cleared', () => {
  const s = snake(), c = cast([s]);
  assert.equal(c.beat(s, 'stomp', 0, 600), true);
  const r = play(c, 4.8, () => hero({ x: 580, vx: 60 }));
  assert.deepEqual([r.hit, r.told, r.cleared, s.defeated], [0, 0, 0, false]);
});

test('the glide: a chased-off snake lifts, then goes out and down, fading (glide 0..1), and never back', () => {
  const s = snake(), c = cast([s], [trap()]);
  assert.ok(c.strike(handleBox(trap())), 'a blow on the vine lets the hive go');
  const ys: number[] = [], gs: number[] = [];
  play(c, 3, () => { if (s.glide !== undefined && !s.defeated) { ys.push(s.y); gs.push(s.glide); } return hero({ x: 330 }); });
  assert.ok(gs.length >= 30 && gs.every((g, i) => i === 0 || g >= gs[i - 1]) && gs[gs.length - 1] > 0.9, 'the glide runs 0 to 1');
  assert.ok(Math.min(...ys) < 386 && ys[ys.length - 1] > 386 + 100, 'up a little, then well down: to a lower tree');
  assert.equal(s.defeated, true);
});

// ───────────────────────────── drop traps ─────────────────────────────

test('a drop trap: a blow on its handle, a creak of 0.3 s, the load falls to the branch and lies there; it works once', () => {
  const t = newTrap(trap());
  assert.equal(stepTrap(t, DT), false, 'set, it hangs');
  assert.equal(shake(t), true);
  assert.equal(shake(t), false, 'already going');
  let steps = 0, landed = false;
  while (!landed && steps < 90) { landed = stepTrap(t, DT); steps++; if (steps * DT < TRAP.warn - 1e-9) assert.equal(t.y, 190, 'it sways before it lets go'); }
  assert.ok(landed && t.phase === 'down' && t.y === 400, 'down on the branch');
  assert.ok(steps * DT > TRAP.warn + 0.3 && steps * DT < 1.2, `it takes ${(steps * DT).toFixed(2)} s: seen falling, not a blink and not a wait`);
  assert.equal(shake(t), false, 'a sprung trap stays sprung');
  assert.equal(scares(trap(), 560 + TRAP.scare, 400), true);
  assert.equal(scares(trap(), 560 + TRAP.scare + 1, 400), false, 'out of its reach');
  assert.equal(scares(trap(), 560, 700), false, 'another branch, far below: not that one');
});

test('the trap on a snake: he shakes the vine from the ledge, out of its reach; the hive comes down; the snake glides off; he is never hurt', () => {
  for (const easy of [false, true]) {
    const s = snake({ x: 560 }), c = cast([s], [trap()]);
    assert.ok(Math.abs(trap().x - 420) > SNAKE.engage - 20 && c.handleNear(300, 400), 'the handle is where the snake cannot strike');
    assert.equal(c.strike({ x: 0, y: 0, w: 10, h: 10 }), null, 'a blow that misses the vine does nothing');
    assert.ok(c.strike({ x: 310, y: 340, w: 40, h: 30 }));
    const r = play(c, 4, () => hero({ x: 320 }), { easy });
    assert.deepEqual([r.fell, r.cleared, r.hit, s.defeated], [1, 1, 0, true]);
  }
});

test('chased off reads as fleeing: whichever side of the hive the snake stood, it glides AWAY from him, never past him', () => {
  for (const sx of [470, 520, 560, 600, 650]) {
    const s = snake({ x: sx, asleep: true }), c = cast([s], [trap()]);
    c.strike(handleBox(trap()));
    const xs: number[] = [];
    play(c, 3, () => { if (s.glide !== undefined && !s.defeated) xs.push(s.x); return hero({ x: 300 }); });
    assert.ok(xs.length > 20 && xs.every((x, i) => i === 0 || x >= xs[i - 1]) && xs[xs.length - 1] > sx + 150, `from ${sx} (the hive is at 560, he is at 300) it goes right, away from him`);
  }
  const s = snake({ x: 520, asleep: true }), c = cast([s], [trap()]);
  c.strike(handleBox(trap()));
  const xs: number[] = [];
  play(c, 3, () => { if (s.glide !== undefined && !s.defeated) xs.push(s.x); return hero({ x: 800, y: 700 }); });
  assert.ok(xs[xs.length - 1] < 520 - 150, 'and with him on the far side, it goes left');
});

test('a trap only clears what is under it: a snake further along the branch stays', () => {
  const near = snake({ x: 560 }), far = snake({ id: 501, x: 560 + TRAP.scare + 60, patrolMinX: 700, patrolMaxX: 900 });
  const c = new CastPlay({ kinds: ['snake'], traps: [trap()] }, [near, far], [ledge, { ...branch, width: 600 } as Platform], 1);
  c.strike(handleBox(trap()));
  const r = play(c, 3, () => hero({ x: 320 }));
  assert.deepEqual([r.cleared, near.defeated, far.defeated], [1, true, false]);
});

test('the lesson is safe: the first snake sleeps under the first hive; the trap clears it before it can do a thing', () => {
  const z = snake({ x: 560, asleep: true }), c = cast([z], [trap()]);
  c.strike(handleBox(trap()));
  const r = play(c, 3, () => hero({ x: 320 }));
  assert.deepEqual([r.told, r.struck, r.hit, r.cleared], [0, 0, 0, 1]);
});

test('his stillness reaches the cast: a boa rears at a moving sloth and strikes; he goes still inside its rear and it settles back', () => {
  const boa = () => snake({ type: 'boa', x: 600, patrolMinX: 600, patrolMaxX: 600 } as Partial<Enemy>);
  const walkIn = (stop: boolean) => {
    const b = boa(), c = cast([b], [], ['boa']);
    let reared = false;
    const r = play(c, 5, (t) => { reared ||= b.state === 'rear'; return reared && stop ? hero({ x: 480 }) : hero({ x: Math.min(300 + 90 * t, 500) + 6 * Math.sin(t * 20), vx: 90 }); });
    return { told: r.told > 0, hit: r.hit > 0, still: c.isStill(false) };
  };
  assert.deepEqual(walkIn(false), { told: true, hit: true, still: false }, 'he keeps moving in its reach: struck');
  assert.deepEqual(walkIn(true), { told: true, hit: false, still: true }, 'he holds still when it rears: he is a branch, and it never strikes');
});

// ───────────────────────────── his noise ─────────────────────────────

test('landing noise: a hard landing near a sleeper wakes it; a soft one, or a hard one far off, does not', () => {
  const fallFrom = (px: number, x: number) => {
    const z = snake({ asleep: true }), c = cast([z]);
    const r = play(c, 1.2, (t) => (t < 0.5 ? hero({ x, y: 400 - px, grounded: false, vy: 300 }) : hero({ x, y: 400 })));
    return { asleep: !!z.kit!.asleep, landed: r.landed, woke: r.woke };
  };
  assert.deepEqual(fallFrom(LOUD.landing.soft + 80, 370), { asleep: false, landed: 1, woke: 1 }, 'a long drop onto the ledge beside it (230 px off; it carries 252): it wakes');
  assert.deepEqual(fallFrom(LOUD.landing.soft - 20, 370), { asleep: true, landed: 0, woke: 0 }, 'a jump\'s landing is silent');
  assert.deepEqual(fallFrom(LOUD.landing.soft + 80, 300), { asleep: true, landed: 1, woke: 0 }, 'the same hard landing 300 px off: out of earshot, heard by nobody');
  const z = snake({ asleep: true }), c = cast([z]);
  play(c, 1.2, (t) => (t < 0.5 ? hero({ x: 300, y: 100, grounded: false, holding: true }) : hero({ x: 300, y: 400 })));
  assert.equal(z.kit!.asleep, true, 'let go of a vine just above the ground: measured from where he held');
});

test('back at a flag: whatever was after him stands down with a full beat before it may tell again; what is gone stays gone', () => {
  const s = snake(), gone = snake({ id: 501, x: 690 }), c = cast([s, gone]);
  c.beat(gone, 'punch', 0, 650);
  play(c, 2.6, (t) => hero({ x: Math.min(300 + 70 * t, 640), vx: 70 }));
  c.calm(false);
  assert.equal(s.kit!.phase, 'rest');
  assert.ok(s.kit!.cool >= SNAKE.cool);
  const r = play(c, SNAKE.cool - 0.1, () => hero({ x: s.x - 60 }), { t0: 2.6 });
  assert.deepEqual([r.struck, r.hit, gone.defeated], [0, 0, true]);
});
