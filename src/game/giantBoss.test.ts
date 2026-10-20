import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { BossEntity } from './types.ts';
import { bossDefFor } from './bossDefs.ts';
import { newBrain, weakOpen, weakRect } from './bossAI.ts';
import { DOUBLE_RISE } from './physics.ts';
import { generateStage } from './stageGenerator.ts';
import { generateAllLevels } from './worldsData.ts';
import { validateStage } from './levelCheck.ts';

const drake = bossDefFor(9);
const floor = 560;
const mk = (state: 'idle' | 'tell' | 'act' | 'rec' | 'stun' | 'roar' | 'dying', facing: 1 | -1 = 1): BossEntity => {
  const b = {
    id: 1, type: 'boss', x: 1500, y: floor - drake.h / 2, vx: 0, vy: 0, width: drake.w, height: drake.h, hp: 48, maxHp: 48,
    facing, patrolMinX: 0, patrolMaxX: 0, attackCooldown: 0, telegraphTimer: 0, isAttacking: false,
    animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, phase: 1, phaseMax: 3,
    specialAttackTimer: 0, shieldActive: false, dialogueIntro: '', dialogueDefeat: '', ai: newBrain(),
  } as BossEntity;
  b.ai!.state = state;
  return b;
};

test('the weak point is open only in the opening after a move, or while stunned', () => {
  for (const s of ['idle', 'tell', 'act', 'roar', 'dying'] as const) assert.equal(weakOpen(mk(s)), false, s);
  for (const s of ['rec', 'stun'] as const) assert.equal(weakOpen(mk(s)), true, s);
});

test('the weak point sits on the head side and follows the way the boss faces', () => {
  const r = weakRect(mk('rec', 1), drake, floor)!;
  const l = weakRect(mk('rec', -1), drake, floor)!;
  assert.ok(r.x + r.w / 2 > 1500 && l.x + l.w / 2 < 1500);
  assert.equal(weakRect(mk('rec'), bossDefFor(3), floor), null, 'a boss without a weak point can be hit anywhere');
});

test('the Drake is a giant whose head can be reached with a double jump from the floor', () => {
  assert.ok((drake.scale ?? 1) >= 3 && drake.w >= 400);
  const r = weakRect(mk('rec'), drake, floor)!;
  const bottomAboveFloor = floor - (r.y + r.h);
  assert.ok(bottomAboveFloor <= DOUBLE_RISE, `head bottom ${bottomAboveFloor} vs double jump ${DOUBLE_RISE}`);
  assert.ok(bottomAboveFloor > 60, 'it is high enough that a ledge helps');
  // the head is inside the body box, so a strike that lands on it also counts as touching the boss
  const bodyTop = floor - drake.h;
  assert.ok(r.y >= bodyTop - 20);
});

test('the Drake bar: one segment per hit, two hit points a hit, and it fits its arena', () => {
  assert.equal(drake.hp, (drake.hits ?? 0) * 2);
  const stage = generateStage(generateAllLevels().find((l) => l.id === '9-10')!);
  const a = stage.arena!;
  assert.ok(a.right - a.left >= drake.w + 700, 'room to run around a giant');
  assert.equal(stage.boss!.maxHp, drake.hp);
  assert.ok(stage.boss!.x + drake.w / 2 <= a.right, 'it starts inside the fence');
  assert.equal(validateStage(stage).ok, true);
});

import { SAFE } from './physics.ts';

test('every ledge of the Drake lair can be reached from the floor or from a ledge before it', () => {
  const spans = (drake.perches ?? []).map((p) => ({ x0: p.dx - (p.moving?.range ?? 0), x1: p.dx + p.w + (p.moving?.range ?? 0), up: p.up }));
  assert.ok(spans.length >= 4, 'several ledges, not one perch');
  const reached = [{ x0: -1e9, x1: 1e9, up: 0 }];
  for (const s of spans) {
    const ok = reached.some((r) => {
      const rise = s.up - r.up;
      const gap = Math.max(0, s.x0 - r.x1, r.x0 - s.x1);
      return (rise <= SAFE.rise1 && gap <= SAFE.gap1) || (rise <= SAFE.rise2 && gap <= SAFE.gap2 * 0.7);
    });
    assert.ok(ok, `ledge at ${s.x0}-${s.x1}, ${s.up} up, cannot be reached`);
    reached.push(s);
  }
  // the highest ledge puts a hero's feet near the head, so the weak point is reachable from it with one jump to spare
  const top = Math.max(...spans.map((s) => s.up));
  const head = drake.weak!;
  assert.ok(top >= head.dy - head.h / 2, 'the high perch reaches the head');
});

test('the lair floods at 35%: two warned lava strips that grow from the fences', () => {
  const b = mk('idle');
  const hazards: import('./bossAI.ts').BossHazard[] = [];
  const texts: string[] = [];
  const ctx = { arena: { left: 760, right: 2160, floor: 560 }, hazards, text: (m: string) => texts.push(m), shake: () => {} } as unknown as import('./bossAI.ts').BossCtx;
  drake.onPhase!(2, b, ctx);
  assert.equal(hazards.length, 0, 'nothing happens at 70%');
  drake.onPhase!(3, b, ctx);
  assert.equal(hazards.length, 2);
  assert.ok(hazards.every((h) => h.kind === 'strip' && h.warn > 1 && (h.growTo ?? 0) >= 150));
  assert.deepEqual(hazards.map((h) => h.dir).sort(), [-1, 1]);
});

import { makeHazard, stepHazards } from './bossAI.ts';

test('a lava strip waits for its warning, then grows from the fence and stays', () => {
  const arena = { left: 760, right: 2160, floor: 560 };
  const list = [makeHazard({ kind: 'strip', x: 760, y: 551, floorY: 560, w: 6, h: 18, warn: 1, warnMax: 1, life: 1e9, maxLife: 1e9, dir: 1, ox: 760, growTo: 190, growRate: 60 })];
  stepHazards(list, arena, 0.5, { land: () => {} });
  assert.equal(list[0].w, 6, 'still warning');
  for (let i = 0; i < 60; i++) stepHazards(list, arena, 0.1, { land: () => {} });
  assert.equal(list[0].w, 190);
  assert.equal(list[0].x, 760 + 95, 'it grows from the fence towards the middle');
  assert.equal(list.length, 1, 'and it stays');
});

import { ENTRANCE_LONG, ENTRANCE_SHORT, entranceBeat, takeEntranceLength } from './bossEntrance.ts';

test('the entrance goes dark, opens eyes, reveals, roars once, then names the boss', () => {
  const at = (u: number) => entranceBeat(u * ENTRANCE_LONG, ENTRANCE_LONG);
  assert.ok(at(0.15).dark > 0.5 && at(0.15).bars > 0.9 && at(0.15).reveal === 0);
  assert.ok(at(0.3).eyes > 0.9 && at(0.3).reveal === 0, 'eyes before the boss');
  assert.ok(at(0.55).reveal > 0 && at(0.55).reveal < 1);
  assert.equal(at(0.66).roaring, true);
  assert.equal(at(0.5).roaring, false);
  assert.ok(at(0.7).dark < at(0.2).dark, 'the dark lifts after the roar');
  assert.ok(at(0.79).nameIn > 0.5 && at(0.9).nameIn === 0 && at(0.9).nameAlpha > 0.9, 'the name slams down and settles');
  const end = entranceBeat(ENTRANCE_LONG, ENTRANCE_LONG);
  assert.equal(end.bars, 0);
  assert.equal(end.dark, 0);
});

test('the first meeting is long, a retry is short', () => {
  assert.equal(takeEntranceLength('t-9-10'), ENTRANCE_LONG);
  assert.equal(takeEntranceLength('t-9-10'), ENTRANCE_SHORT);
  assert.ok(ENTRANCE_LONG >= 4.5 && ENTRANCE_SHORT <= 2);
});

// ───────────── Venom Fang (world 1): the second giant ─────────────
const venom = bossDefFor(1);

test('Venom Fang is a giant with one weak point a double jump from the floor, and a ten-hit bar', () => {
  assert.ok((venom.scale ?? 1) >= 2.5 && venom.w >= 300);
  assert.equal(venom.hp, (venom.hits ?? 0) * 2);
  assert.equal(venom.hits, 10);
  const r = weakRect({ ...mk('rec'), x: 1500, width: venom.w, height: venom.h } as BossEntity, venom, floor)!;
  assert.ok(floor - (r.y + r.h) <= DOUBLE_RISE, 'reachable with a double jump');
  assert.ok(venom.lair === 'venom' && venom.entrance);
  const stage = generateStage(generateAllLevels().find((l) => l.id === '1-10')!);
  const a = stage.arena!;
  assert.ok(a.right - a.left >= venom.w + 700, 'room to run around a giant');
  assert.equal(stage.boss!.maxHp, venom.hp);
  assert.equal(validateStage(stage).ok, true);
});

import { PHYS, reachBounce } from './physics.ts';

test('every ledge of the Venom Fang lair can be reached (mushrooms count), and the crown is within a bounce', () => {
  const ps = venom.perches ?? [];
  const bouncy = ps.filter((p) => p.kind === 'bouncy');
  assert.ok(bouncy.length >= 2, 'bounce mushrooms are how you get up');
  for (const p of ps) {
    if (p.kind === 'bouncy') {
      assert.ok(p.up <= SAFE.rise1, 'a mushroom is reached from the floor');
      continue;
    }
    if (p.up <= SAFE.rise1) continue;
    // otherwise some mushroom has to launch you onto it
    const ok = bouncy.some((m) => {
      const gap = Math.max(0, p.dx - (m.dx + m.w), m.dx - (p.dx + p.w));
      return reachBounce(p.up - m.up, false) >= gap;
    });
    assert.ok(ok, `ledge at ${p.dx}, ${p.up} up, has no mushroom that reaches it`);
  }
  // a bounce from a mushroom puts a hero's feet above the bottom of the crown
  const bounceRise = (PHYS.bounceV * PHYS.bounceV) / (2 * PHYS.gravUp);
  const m = bouncy[0];
  assert.ok(m.up + bounceRise >= venom.weak!.dy - venom.weak!.h / 2, 'a bounce reaches the crown');
  assert.ok((venom.vines ?? []).length >= 1);
});

// no two lairs share a layout: the ledges of every giant differ from the others'
test('every giant boss has its own layout', () => {
  const sig = (w: number) => JSON.stringify((bossDefFor(w).perches ?? []).map((p) => [Math.round(p.dx / 100), Math.round(p.up / 50), p.kind ?? (p.moving ? 'm' : 's')]));
  const giants = [1, 2, 9].filter((w) => bossDefFor(w).perches?.length);
  assert.equal(new Set(giants.map(sig)).size, giants.length);
});

test('the bog rises at 35%: two warned strips with the venom look', () => {
  const hazards: import('./bossAI.ts').BossHazard[] = [];
  const ctx = { arena: { left: 760, right: 2060, floor: 560 }, hazards, text: () => {}, shake: () => {} } as unknown as import('./bossAI.ts').BossCtx;
  venom.onPhase!(2, mk('idle'), ctx);
  assert.equal(hazards.length, 0);
  venom.onPhase!(3, mk('idle'), ctx);
  assert.equal(hazards.length, 2);
  assert.ok(hazards.every((h) => h.kind === 'strip' && h.look === 'venom' && h.warn > 1));
});

import { lairOwnsScene } from './lairArt.ts';

test('a lair that owns its scene is never drawn on top of the world backdrop', () => {
  assert.equal(lairOwnsScene('venom'), true);
  assert.equal(venom.lair && lairOwnsScene(venom.lair), true);
});

// ───────────────────────────── Crocus Rex (world 2): the third giant ─────────────────────────────
const croc = bossDefFor(2);

test('Crocus Rex is a giant with a twelve-hit bar, a low weak point and his own lair', () => {
  assert.ok((croc.scale ?? 1) >= 2.4 && croc.w >= 380);
  assert.equal(croc.hits, 12);
  assert.equal(croc.hp, 24);
  assert.ok(croc.lair === 'croc' && croc.entrance && croc.aimText);
  const r = weakRect({ ...mk('rec'), x: 1500, width: croc.w, height: croc.h } as BossEntity, croc, floor)!;
  assert.ok(floor - (r.y + r.h) <= DOUBLE_RISE, 'the head can be reached from the floor');
  // the stunned pose has its own weak point, lower (the head hangs almost to the mud in the stagger)
  const s = weakRect({ ...mk('stun'), x: 1500, width: croc.w, height: croc.h } as BossEntity, croc, floor)!;
  assert.ok(s.y > r.y + 60);
  const stage = generateStage(generateAllLevels().find((l) => l.id === '2-10')!);
  const a = stage.arena!;
  assert.ok(a.right - a.left >= croc.w + 700, 'room to run around a giant');
  assert.equal(stage.boss!.maxHp, croc.hp);
  assert.equal(validateStage(stage).ok, true);
});

test('every ledge of the Mire can be reached, from the floor or from one before it, and one of them moves', () => {
  const ps = croc.perches ?? [];
  assert.ok(ps.some((p) => p.moving), 'a log swings through the middle');
  const spans = ps.map((p) => ({ x0: p.dx - (p.moving?.range ?? 0), x1: p.dx + p.w + (p.moving?.range ?? 0), up: p.up }));
  const reached = [{ x0: -1e9, x1: 1e9, up: 0 }];
  for (const s of spans) {
    const ok = reached.some((r) => {
      const rise = s.up - r.up;
      const gap = Math.max(0, s.x0 - r.x1, r.x0 - s.x1);
      return (rise <= SAFE.rise1 && gap <= SAFE.gap1) || (rise <= SAFE.rise2 && gap <= SAFE.gap2 * 0.7);
    });
    assert.ok(ok, `ledge at ${s.x0}-${s.x1}, ${s.up} up, cannot be reached`);
    reached.push(s);
  }
  assert.ok((croc.vines ?? []).length >= 1, 'a rope swing');
});

test('the river floods at 35%: two warned strips with the flood look', () => {
  const hazards: import('./bossAI.ts').BossHazard[] = [];
  const ctx = { arena: { left: 760, right: 2160, floor: 560 }, hazards, text: () => {}, shake: () => {} } as unknown as import('./bossAI.ts').BossCtx;
  croc.onPhase!(2, mk('idle'), ctx);
  assert.equal(hazards.length, 0);
  croc.onPhase!(3, mk('idle'), ctx);
  assert.equal(hazards.length, 2);
  assert.ok(hazards.every((h) => h.kind === 'strip' && h.look === 'flood' && h.warn > 1));
});

test('every giant lair owns its scene', () => {
  for (const w of [1, 2]) assert.equal(lairOwnsScene(bossDefFor(w).lair!), true);
});
