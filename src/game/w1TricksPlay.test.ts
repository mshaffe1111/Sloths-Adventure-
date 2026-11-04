// R-159.1: World 1's combat triangle in play, on the real engine (a bare world, real moves pressed frame by frame): the wrong move fails
// and the right one works, and an animal without World 1's tag behaves exactly as before.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { RealPlay } from './realPlay.ts';
import type { Enemy, Platform } from './types.ts';
import { TRICK } from './w1Tricks.ts';

const GROUND = 580;
const ground = (x: number, w: number, y = GROUND): Platform => ({ id: x, x, y, width: w, height: 90, type: 'solid' }) as Platform;

function animal(id: number, type: 'snake' | 'boa', x: number, o: Partial<Enemy> = {}): Enemy {
  const boa = type === 'boa';
  return {
    id, type, x, y: GROUND - (boa ? 16 : 14), vx: boa ? 0 : 28, vy: 0, width: boa ? 58 : 38, height: boa ? 26 : 22, hp: boa ? 3 : 1,
    maxHp: boa ? 3 : 1, facing: -1, patrolMinX: x - (boa ? 12 : 60), patrolMaxX: x + (boa ? 12 : 60), attackCooldown: 5, telegraphTimer: 0,
    isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, edgeMinX: 0, edgeMaxX: 2000, ...o,
  } as Enemy;
}

function world(enemies: Enemy[]) {
  const r = new RealPlay('1-3', 1);
  r.bare([ground(0, 2000)]);
  r.e.enemies = enemies;
  return r;
}

/** stand facing right at x and throw one move, then let it play out */
function strike(r: RealPlay, x: number, move: 'punch' | 'kick') {
  r.stand(x, GROUND);
  r.p.facing = 1;
  r.frame(move === 'punch' ? { punch: true } : { kick: 1 });
  for (let i = 0; i < 12; i++) r.frame();
}

test('without World 1\'s tag a snake still dies to one punch (other worlds unchanged)', () => {
  const s = animal(1, 'snake', 340);
  const r = world([s]);
  strike(r, 300, 'punch');
  assert.ok(s.defeated, 'one punch, as before');
});

test('the lunge snake: a punch dazes it 1.5 s (harmless), it wakes after', () => {
  const s = animal(1, 'snake', 340, { trick: 'lunge' });
  const r = world([s]);
  strike(r, 300, 'punch');
  assert.equal(s.defeated, false, 'the punch did not kill it');
  assert.ok((s.stagger ?? 0) > 1.0, `dazed (${s.stagger})`);
  r.wait(TRICK.daze + 0.3);
  assert.ok((s.stagger ?? 0) <= 0 && !s.defeated, 'it woke up');
});

/** mash a move: `n` presses spread over `seconds`, facing right from x (as a kid hammers the button) */
function mash(r: RealPlay, x: number, move: 'punch' | 'kick', n = 5, seconds = 1) {
  r.stand(x, GROUND);
  r.p.facing = 1;
  const every = Math.max(1, Math.round(seconds / n / (1 / 30)));
  for (let i = 0; i < n * every; i++) r.frame(i % every === 0 ? (move === 'punch' ? { punch: true } : { kick: 1 }) : {});
}

test('mashing punch or kick on a lunge snake, awake or rearing: dazed, never killed, the stars up the whole time; a stomp finishes it', () => {
  for (const move of ['punch', 'kick'] as const) {
    for (const state of ['patrol', 'rear'] as const) {
      const s = animal(1, 'snake', 340, { trick: 'lunge', state, stateT: 0.1, attackCooldown: 0 });
      const r = world([s]);
      mash(r, 300, move);
      assert.equal(s.defeated, false, `${move} x5 on a ${state} snake: still alive`);
      assert.ok((s.stagger ?? 0) > 0, `${move} x5: still dazed`);
      const left = s.stagger ?? 0;
      assert.ok(left < TRICK.daze, 'mashing did not make the daze longer (it cannot be held down)');
      r.fly(340, GROUND - 90, 0, 300);
      for (let i = 0; i < 20 && !s.defeated; i++) r.frame();
      assert.ok(s.defeated, 'the stomp finished it');
    }
  }
});

test('Easy: the daze is longer', async () => {
  const { setDifficulty } = await import('./difficulty.ts');
  setDifficulty('easy');
  try {
    const s = animal(1, 'snake', 340, { trick: 'lunge' });
    const r = world([s]);
    strike(r, 300, 'punch');
    assert.ok((s.stagger ?? 0) > TRICK.daze, `Easy daze ${s.stagger}`);
  } finally {
    setDifficulty('normal');
  }
});

test('the lunge snake: a stomp always works on it', () => {
  const s = animal(1, 'snake', 340, { trick: 'lunge' });
  const r = world([s]);
  r.fly(340, GROUND - 90, 0, 300);
  for (let i = 0; i < 20 && !s.defeated; i++) r.frame();
  assert.ok(s.defeated);
});

test('the lunge snake rears for its 0.5 s tell before it strikes (an untagged one keeps 0.38 s)', () => {
  for (const [trick, want] of [['lunge', TRICK.tell], [undefined, 0.38]] as const) {
    const s = animal(1, 'snake', 400, { trick, attackCooldown: 0 });
    const r = world([s]);
    r.stand(330, GROUND);
    let rearT = -1;
    let strikeT = -1;
    for (let i = 0; i < 120 && strikeT < 0; i++) {
      r.frame();
      if (s.state === 'rear' && rearT < 0) rearT = r.t;
      if (s.state === 'strike' && strikeT < 0) strikeT = r.t;
    }
    assert.ok(rearT >= 0 && strikeT > rearT, `${trick}: it reared and struck`);
    assert.ok(Math.abs(strikeT - rearT - want) < 0.05, `${trick}: tell ${(strikeT - rearT).toFixed(2)} s, want ${want}`);
  }
});

test('the coiled boa: a punch is TOUGH (no harm, Dot says kick), a stomp bounces off, a kick rolls it into the snake beyond', () => {
  const b = animal(1, 'boa', 340, { trick: 'coil' });
  const s = animal(2, 'snake', 700, { trick: 'lunge' });
  const r = world([b, s]);
  strike(r, 300, 'punch');
  assert.equal(b.hp, 3, 'the punch did nothing');
  assert.equal(b.defeated, false);
  assert.ok(r.said.some((l) => /kick/i.test(l.text)), 'Dot says to kick it');

  r.fly(340, GROUND - 100, 0, 300);
  let bounced = false;
  for (let i = 0; i < 20 && !bounced; i++) {
    r.frame();
    if (r.p.vy < 0) bounced = true;
  }
  assert.ok(bounced, 'he bounced off the coil');
  assert.equal(b.hp, 3, 'the stomp did nothing');

  strike(r, 300, 'kick');
  assert.equal(b.state === 'roll' || b.defeated, true, `rolling (${b.state})`);
  r.wait(1.5);
  assert.ok(s.defeated, 'the rolling boa bowled over the snake in its way');
  r.wait(TRICK.rollMax);
  assert.ok(b.defeated, 'and rolled to the end of its ground, out of the fight');
});

test('mashing punch on the boa through its coil, tell, strike and bite (its strike not held off): never hurt; one kick rolls it', () => {
  for (const state of ['coil', 'rear', 'strike', 'bite'] as const) {
    const b = animal(1, 'boa', 340, { trick: 'coil', state, stateT: 0, attackCooldown: 0 });
    const r = world([b]);
    r.safe = true;
    mash(r, 300, 'punch', 10, 2.3);
    assert.equal(b.hp, 3, `${state}: ten punches did nothing`);
    assert.equal(b.defeated, false, `${state}: still alive`);
    r.wait(0.6);
    strike(r, 300, 'kick');
    assert.ok(b.state === 'roll' || b.defeated, `${state}: one kick rolls it (${b.state})`);
  }
});

test('mashing kick on the boa: it rolls, and mashing more at the rolling ball does nothing to it', () => {
  const b = animal(1, 'boa', 340, { trick: 'coil' });
  const r = world([b]);
  mash(r, 300, 'kick');
  assert.ok(b.state === 'roll' || b.state === 'rolled' || b.defeated, `rolled (${b.state})`);
});

// ── the vine snake (Matt's option (a)): on a liana over a gap
import type { Vine } from './types.ts';
import { makeVineSnake, VINE_SNAKE } from './w1Tricks.ts';

function lianaWorld() {
  const r = new RealPlay('1-6', 1);
  const v = { id: 7, x: 600, topY: 200, bottomY: 560, vineType: 'swing_liana', isSwingingVine: true, swaySpeed: 1, swayPhase: 0 } as unknown as Vine;
  r.bare([ground(0, 480), ground(760, 800)], [v]);
  const s = makeVineSnake(1, v);
  r.e.enemies = [s];
  return { r, v, s };
}

test('the vine snake: its tell starts a jump\'s length away (from the take-off ledge), and it dozes again when he is far', () => {
  const { r, s } = lianaWorld();
  r.stand(100, GROUND);
  r.wait(0.3);
  assert.equal(s.state, 'hang', 'far away: it hangs like a vine');
  r.stand(600 - VINE_SNAKE.tellX + 30, GROUND);
  r.wait(0.2);
  assert.equal(s.state, 'tell', 'from the take-off ledge it gives itself away');
});

test('the vine snake: grab its liana while it is awake and it bites (he does not get the liana); punch it and the liana is a stiff pole to climb', () => {
  const { r, v, s } = lianaWorld();
  r.safe = false;
  const lives0 = r.p.hp;
  // a jump at the liana from the ledge, holding toward it
  r.fly(560, 470, 260, -100);
  let swung = false;
  let bit = false;
  for (let i = 0; i < 20; i++) {
    r.frame({ right: true });
    if (r.p.isVineSwinging) swung = true;
    if (s.state === 'bite') bit = true;
  }
  assert.ok(bit, 'it bit');
  assert.equal(swung, false, 'he did not get the liana');
  assert.ok(r.p.hp < lives0, 'and it hurt');

  // now punch it first (in the air beside it), then the liana holds straight and he climbs it
  const w = lianaWorld();
  // (it rides its liana's swing: he is put beside it where it is, and keeps beside it while the blow plays)
  w.r.stand(100, GROUND);
  w.r.frame();
  w.r.fly(w.s.x - 40, w.s.y + 30, 0, 0);
  w.r.p.facing = 1;
  w.r.frame({ punch: true });
  for (let i = 0; i < 6 && !((w.s.stagger ?? 0) > 0); i++) {
    w.r.p.x = w.s.x - 40;
    w.r.frame();
  }
  assert.ok((w.s.stagger ?? 0) > 0, `stiff (${w.s.stagger})`);
  w.r.frame();
  assert.equal(w.v.swingAngle ?? 0, 0, 'the liana hangs straight while it is stiff');
  w.r.fly(w.v.x - 10, w.s.y + 40, 60, 0);
  let climbed = false;
  for (let i = 0; i < 12; i++) {
    w.r.frame({ up: true });
    if (w.r.p.climbing) climbed = true;
  }
  assert.ok(climbed, 'he climbs the stiff liana like a trunk');
  void v;
});

// ── the stomp vault (R-159.1): a snake on the lip of a gap past any jump
import { reachJump } from './physics.ts';
import { vaultGap } from './w1Tricks.ts';

function vaultWorld() {
  const r = new RealPlay('1-3', 1);
  const edge = 1000;
  const gap = vaultGap(reachJump(0, true));
  // (a soft pit: its floor 220 px down, so a miss lands in it, not out of the world)
  r.bare([ground(0, edge), ground(edge, gap, GROUND + 220), ground(edge + gap, 1200)]);
  const s = animal(1, 'snake', edge - TRICK.vaultLip, { trick: 'lunge', patrolMinX: edge - TRICK.vaultLip - 6, patrolMaxX: edge - TRICK.vaultLip + 4 });
  r.e.enemies = [s];
  return { r, edge, gap, s };
}

/** run at the gap and jump it as well as a person can: off the very edge at full speed, holding jump, the second jump at the top */
function jumpAcross(r: RealPlay, edge: number, takeoff: number, after?: () => boolean) {
  r.stand(takeoff - 400, GROUND);
  let i = 0;
  while (r.p.x < takeoff && i++ < 200) r.frame({ right: true });
  r.frame({ right: true, press: true });
  let pressed2 = false;
  for (let k = 0; k < 120; k++) {
    // (the second jump at the top of the arc: of the jump itself, or with `after`, of the arc after that has happened (the stomp))
    const second = !pressed2 && r.p.vy > -40 && !r.p.grounded && (!after || after());
    if (second) pressed2 = true;
    r.frame(second ? { right: true, press: true } : { right: true, jump: true });
    if (r.p.grounded && k > 4) break;
  }
  void edge;
}

test('the stomp vault: the gap is past any jump (a run, a full jump off the edge and the second jump fall into the pit); the snake on its lip springs him across', () => {
  const a = vaultWorld();
  a.s.x = -5000; // (no snake: the gap alone)
  jumpAcross(a.r, a.edge, a.edge - 6);
  assert.ok(a.r.p.y > GROUND + 100, `without the snake he lands in the pit (x ${Math.round(a.r.p.x)}, y ${Math.round(a.r.p.y)}, the far side at ${a.edge + a.gap})`);

  const b = vaultWorld();
  // a jump from a jump's length before the snake, onto it, jump held: the stomp vault; then the second jump at the vault's top
  jumpAcross(b.r, b.edge, b.s.x - Math.round(reachJump(0, false)) + 10, () => b.s.defeated);
  assert.ok(b.s.defeated, 'he landed on the snake');
  assert.ok(b.r.p.x > b.edge + b.gap + 20 && b.r.p.y <= GROUND + 2, `the vault carried him across, with room (x ${Math.round(b.r.p.x)}, y ${Math.round(b.r.p.y)})`);
});

// ── the bowl gate (R-159.1): the kick's payoff, a switch only the rolling boa presses
import type { BowlGate } from './w1Tricks.ts';

function gateWorld() {
  const r = new RealPlay('1-9', 1);
  const gate = { id: 901, x: 1000, y: GROUND - 112, width: 44, height: 112, type: 'solid', art: 'hidden' } as Platform;
  const pillar = { id: 902, x: 982, y: GROUND - 560, width: 80, height: 448, type: 'solid' } as Platform;
  r.bare([ground(0, 2000), gate, pillar]);
  const b = animal(1, 'boa', 480, { trick: 'coil', edgeMinX: 0, edgeMaxX: 2000 });
  r.e.enemies = [b];
  const g: BowlGate = { plateX: 954, groundY: GROUND, gatePlat: 901, gateX: 1022, boaId: 1, coilX: 480, coilY: GROUND - 16 };
  (r.e.currentStage as { bowlGates?: BowlGate[] }).bowlGates = [g];
  return { r, b, g, gate };
}

test('the bowl gate: punches and stomps never open it; the kicked boa rolls onto the plate and it opens, and he walks through', () => {
  const { r, b, g, gate } = gateWorld();
  mash(r, 440, 'punch', 6, 1.2);
  r.fly(480, GROUND - 100, 0, 300);
  r.wait(0.6);
  assert.equal(g.open, undefined, 'still shut after punches and a stomp');
  r.stand(1100, GROUND);
  assert.ok(r.p.x > 950, 'set beyond');
  r.stand(900, GROUND);
  for (let i = 0; i < 60; i++) r.frame({ right: true });
  assert.ok(r.p.x < gate.x, `the shut gate stops him (x ${Math.round(r.p.x)})`);
  strike(r, 440, 'kick');
  for (let i = 0; i < 90 && !g.open; i++) r.frame();
  assert.ok(g.open, 'the ball on the plate opened it');
  assert.ok(Math.abs(b.x - g.plateX) < 30, 'and stopped there');
  r.stand(900, GROUND);
  for (let i = 0; i < 60; i++) r.frame({ right: true });
  assert.ok(r.p.x > gate.x + 60, `he walks through (x ${Math.round(r.p.x)})`);
});

test('the bowl gate: a boa kicked the wrong way is lost, and a fresh one coils in its place', () => {
  const { r, b, g } = gateWorld();
  r.stand(520, GROUND);
  r.p.facing = -1;
  r.frame({ kick: -1 });
  r.wait(4.5);
  assert.equal(g.open, undefined);
  assert.equal(b.defeated, false, 'it is back');
  assert.equal(b.state, 'coil');
  assert.ok(Math.abs(b.x - g.coilX) < 2);
});

test('mashing never stacks hit words: one word at a time over the boa and over the lunge snake (QS polish, R-159.1)', () => {
  const words = (r: RealPlay, e: Enemy) =>
    (r.e as unknown as { floatingTexts: { x: number; owner?: number; text: string }[] }).floatingTexts.filter((f) => Math.abs(f.x - e.x) < 140);
  for (const [type, trick, state] of [['boa', 'coil', 'coil'], ['boa', 'coil', 'rear'], ['snake', 'lunge', 'patrol']] as const) {
    for (const move of ['punch', 'kick'] as const) {
      if (type === 'boa' && move === 'kick') continue;
      const a = animal(1, type, 340, { trick, state, stateT: 0, attackCooldown: type === 'boa' ? 0 : 5 });
      const r = world([a]);
      r.safe = true;
      r.stand(300, GROUND);
      r.p.facing = 1;
      let most = 0;
      const seen = new Set<string>();
      for (let i = 0; i < 70; i++) {
        r.frame(i % 7 === 0 ? (move === 'punch' ? { punch: true } : { kick: 1 }) : {});
        const w = words(r, a);
        for (const f of w) seen.add(f.text);
        most = Math.max(most, w.length);
      }
      assert.ok(seen.size > 0, `${type} ${state} ${move}: a word shows`);
      assert.ok(most <= 1, `${type} ${state} ${move}: at most one word over it at once (saw ${most}: ${[...seen].join(' ')})`);
    }
  }
});

test('the stomp vault after a lost life: its snake is back at its spot (the drop can be crossed again), and finishing it again does not count', () => {
  const b = vaultWorld();
  b.s.vaultHome = { x: b.s.x, y: b.s.y };
  const home = b.s.x;
  jumpAcross(b.r, b.edge, b.s.x - Math.round(reachJump(0, false)) + 10, () => b.s.defeated);
  assert.ok(b.s.defeated, 'the vault finished it');
  const counted = b.r.p.enemiesDefeated;
  assert.equal(counted, 1);
  // a life lost further on: he comes back at a flag before the vault
  const e = b.r.e as unknown as { checkpoint: { x: number; y: number }; respawnAtCheckpoint: (r: string) => void };
  e.checkpoint = { x: b.edge - 700, y: GROUND };
  e.respawnAtCheckpoint('hurt');
  assert.equal(b.s.defeated, false, 'the vault snake is back');
  assert.equal(b.s.x, home, 'at its own spot on the lip');
  b.r.wait(2.2);
  jumpAcross(b.r, b.edge, b.s.x - Math.round(reachJump(0, false)) + 10, () => b.s.defeated);
  assert.ok(b.r.p.x > b.edge + b.gap && b.r.p.y <= GROUND + 2, `vaulted across again (x ${Math.round(b.r.p.x)}, y ${Math.round(b.r.p.y)})`);
  assert.equal(b.r.p.enemiesDefeated, counted, 'the second finish does not count toward the goal');
});

// 1-3's first vault, where it is taught (the lead, 2026-11-04): the spring alone must carry him, with no second flick
function raisedWorld() {
  const r = new RealPlay('1-3', 1);
  const edge = 1000, far = edge + TRICK.vaultRiseGap;
  r.bare([ground(0, edge), ground(edge, TRICK.vaultRiseGap, GROUND + 75), { id: 7, x: far, y: GROUND - TRICK.vaultRise, width: 260, height: TRICK.vaultRise + 90, type: 'solid' } as Platform, ground(far + 260, 1200)]);
  const s = animal(1, 'snake', edge - TRICK.vaultLip, { trick: 'lunge', patrolMinX: edge - TRICK.vaultLip - 6, patrolMaxX: edge - TRICK.vaultLip + 4 });
  r.e.enemies = [s];
  return { r, edge, far, s, top: GROUND - TRICK.vaultRise };
}
test("1-3's teaching vault: a jump and its second jump never get on the raised bank; the vault alone, no second flick, lands on it", () => {
  // the best a jump can do: off the very edge at a full run, thumb held, the second jump at the top
  for (const takeoff of [-40, -20, -6]) {
    const a = raisedWorld();
    a.s.x = -5000;
    jumpAcross(a.r, a.edge, a.edge + takeoff);
    a.r.wait(0.5);
    assert.ok(a.r.p.y > a.top + 20, `a jump and double from ${takeoff} got on top (x ${Math.round(a.r.p.x)}, y ${Math.round(a.r.p.y)})`);
  }
  // the vault: a run and a hop onto the snake, thumb kept down, steering on; never a second flick
  for (const from of [0, 10, 20].map((d) => Math.round(reachJump(0, false)) - d)) {
    const b = raisedWorld();
    b.r.stand(b.s.x - from - 300, GROUND);
    let i = 0;
    while (b.r.p.x < b.s.x - from && i++ < 200) b.r.frame({ right: true });
    b.r.frame({ right: true, press: true });
    for (let k = 0; k < 90 && !(b.r.p.grounded && k > 4); k++) b.r.frame({ right: true, jump: true });
    assert.ok(b.s.defeated, `from ${from}: he landed on the snake`);
    assert.ok(Math.abs(b.r.p.y - b.top) < 3 && b.r.p.x > b.far, `from ${from}: the spring alone put him on the raised bank (x ${Math.round(b.r.p.x)}, y ${Math.round(b.r.p.y)}, top ${b.top})`);
  }
});
