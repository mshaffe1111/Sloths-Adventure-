/**
 * The kit boa's coil hurts on touch (the lead's ruling, 11:20 AM ET 11-15, on ENG-19b's question; 1-9.md "the rear is the only door"):
 * the language every foe in the game already speaks. Its data (PredatorDef.coil) says so, for every kit boa in every world; the 18
 * old-brain boa stages are untouched (predatorAI.ts, D40). While it watches or rears (rest, hunt, tell) its coil is a box that hurts;
 * while it strikes, its strike's box; never while its head is out after a strike (recover: the punch's window), dazed, fleeing or gone,
 * so punching the miss and walking past a beaten boa stay safe. Easy keeps the hurt (gentler by timing: its x1.3 rear). The real engine.
 */
import './headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DT, makeEngine, standOn, step } from './engineCoreHarness.ts';
import { BOA } from './predators/world1.ts';
import { beat, hurt } from './predators/core.ts';
import type { Enemy, Platform } from './types.ts';

const Y = 500;
const boaAt = (x: number): Enemy => ({
  id: 700, type: 'boa', x, y: Y - 16, vx: 0, vy: 0, width: 58, height: 26, hp: 1, maxHp: 1, facing: -1, patrolMinX: x, patrolMaxX: x,
  attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
} as Enemy);

/** the real engine, one long bough with a boa at 1000; `prep` sets its state before he moves. He runs right from 600 to 1400 and on */
function walkThrough(setting: 'normal' | 'easy', prep?: (s: { phase: string; t: number; leaving: boolean }, t: number) => void) {
  const { e, input } = makeEngine('1-3', setting);
  const ledge = { id: 9001, x: 200, y: Y, width: 2400, height: 40, type: 'solid' } as Platform;
  e.platforms.length = 0;
  e.platforms.push(ledge);
  const b = boaAt(1000);
  e.enemies.length = 0;
  e.enemies.push(b);
  e.vines.length = 0;
  e.collectibles.length = 0;
  e.proto ??= { hints: [], covers: [], beats: [] };
  e.proto.cast = { kinds: ['boa'], traps: [] };
  e.startCast();
  e.checkpoint = { x: 260, y: Y };
  standOn(e, ledge, 600);
  e.player.hp = e.player.maxHp;
  const m = e.cast.members[0];
  prep?.(m.s, e.gameTime);
  let lost = 0;
  for (let i = 0; i < 150; i++) {
    input.state.right = true;
    const hp = e.player.hp;
    step(e, 1);
    if (e.player.hp < hp) lost += hp - e.player.hp;
  }
  input.state.right = false;
  return { lost, past: e.player.x > 1100 };
}

/** the coil switched off for the plant (the data is the switch: no coil, no contact) */
function coilOff<T>(f: () => T): T {
  const was = BOA.coil;
  (BOA as { coil?: unknown }).coil = undefined;
  try { return f(); } finally { (BOA as { coil?: unknown }).coil = was; }
}

test('walking through a watching boa takes a heart, Normal and Easy (its rear starts as he comes in: he runs through the coil inside it)', () => {
  for (const setting of ['normal', 'easy'] as const) {
    const r = walkThrough(setting);
    assert.equal(r.lost, 1, `${setting}: one heart (the hurt's own grace after it)`);
  }
});

test('PLANTED: the coil off, the same walk through costs nothing (the strike aims where he was): the coil is what hurts', () => {
  for (const setting of ['normal', 'easy'] as const) {
    const r = coilOff(() => walkThrough(setting));
    assert.deepEqual([r.lost, r.past], [0, true], setting);
  }
});

test('never through a beaten boa: dazed (stunned), fleeing or gone, he walks through unhurt', () => {
  // (dazed by the kit's own punch from its open recover: 2.5 s, longer than his 1.4 s run to it)
  const dazed = walkThrough('normal', (s, t) => { s.phase = 'recover'; assert.ok(beat(BOA, s as never, 'punch', t, 600), 'the punch took'); });
  assert.equal(dazed.lost, 0, 'stunned');
  for (const phase of ['flee', 'gone'] as const) {
    const r = walkThrough('normal', (s) => { s.phase = phase; s.t = 0; s.leaving = true; });
    assert.equal(r.lost, 0, phase);
  }
});

test("the kit's hurt box by phase: its coil while it watches or rears, its strike's box while it strikes, none with its head out or beaten", () => {
  const s = { x: 1000, y: Y, facing: -1, phase: 'rest', leaving: false } as Parameters<typeof hurt>[1];
  const box = (phase: string, leaving = false) => hurt(BOA, { ...s, phase, leaving } as typeof s);
  for (const ph of ['rest', 'hunt', 'tell']) assert.deepEqual(box(ph), { x: 1000, y: Y - BOA.coil!.tall, w: BOA.coil!.w, h: BOA.coil!.tall }, ph);
  assert.equal(box('act')!.w, BOA.act.reach, 'the strike');
  for (const ph of ['recover', 'stunned', 'flee', 'gone']) assert.equal(box(ph), null, ph);
  assert.equal(box('rest', true), null, 'leaving');
});
