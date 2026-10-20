import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { BossEntity } from './types.ts';
import { BOSS_DEFS, bossDefFor } from './bossDefs.ts';
import { bodyHurts, bossMaxHp, hazardBox, interruptBoss, newBrain, phaseFor, stepBoss, stepHazards, vulnerability } from './bossAI.ts';
import type { BossCtx, BossHazard } from './bossAI.ts';

const ARENA = { left: 760, right: 1840, floor: 560 };

function makeBoss(world: number): BossEntity {
  const def = bossDefFor(world);
  const maxHp = bossMaxHp(world);
  return {
    id: 1, type: 'boss', x: ARENA.right - 160, y: ARENA.floor - def.h / 2, vx: 0, vy: 0, width: def.w, height: def.h, hp: maxHp, maxHp,
    facing: -1, patrolMinX: ARENA.left, patrolMaxX: ARENA.right, attackCooldown: 0, telegraphTimer: 0, isAttacking: false,
    animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, phase: 1, phaseMax: 3,
    specialAttackTimer: 0, shieldActive: false, dialogueIntro: '', dialogueDefeat: '', ai: newBrain(),
  };
}

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeCtx(px: number, rnd = seeded(7)) {
  const log = { roars: 0, texts: [] as string[], minions: 0, shakes: 0 };
  const ctx: BossCtx = {
    px, py: ARENA.floor, pGrounded: true, pDucking: false, arena: ARENA, rnd, hazards: [], minionsAlive: 0,
    spawnMinion: () => { log.minions++; },
    shake: () => { log.shakes++; },
    roar: () => { log.roars++; },
    thud: () => {},
    debris: () => {},
    text: (m) => { log.texts.push(m); },
  };
  return { ctx, log };
}

const noEv = { land: () => {} };

test('there is a boss definition for every world, each with moves that make sense', () => {
  for (let w = 1; w <= 10; w++) {
    const def = BOSS_DEFS[w];
    assert.ok(def, `world ${w}`);
    assert.equal(def.world, w);
    const names = Object.keys(def.moves);
    assert.ok(names.length >= 3, `${def.name} has ${names.length} moves`);
    for (const n of names) {
      const m = def.moves[n];
      assert.ok(m.tell >= 0.45, `${def.name}.${n} warns for at least 0.45 s (fair)`);
      assert.ok(m.act > 0 && m.rec >= 0.3, `${def.name}.${n} has an attack and an opening`);
    }
    // something is available in every phase, from any distance
    for (const phase of [1, 2, 3]) {
      assert.ok(names.some((n) => (def.moves[n].phase ?? 1) <= phase && def.moves[n].min === undefined), `${def.name} phase ${phase} has an always-available move`);
    }
  }
  // every boss has a different move set
  const sets = new Set(Object.values(BOSS_DEFS).map((d) => Object.keys(d.moves).sort().join(',')));
  assert.equal(sets.size, 10);
});

test('boss hit points grow with the world and phases fall at 70% and 35%', () => {
  for (let w = 2; w <= 10; w++) assert.ok(bossMaxHp(w) > bossMaxHp(w - 1));
  assert.equal(phaseFor(100, 100), 1);
  assert.equal(phaseFor(71, 100), 1);
  assert.equal(phaseFor(70, 100), 2);
  assert.equal(phaseFor(36, 100), 2);
  assert.equal(phaseFor(35, 100), 3);
});

test('a boss roars, walks, winds up, attacks, then gives you an opening', () => {
  const b = makeBoss(1);
  const { ctx } = makeCtx(900);
  const seen: string[] = [];
  for (let i = 0; i < 60 * 14; i++) {
    stepBoss(b, bossDefFor(1), ctx, 1 / 60);
    stepHazards(ctx.hazards, ARENA, 1 / 60, noEv);
    const s = b.ai!.state;
    if (seen[seen.length - 1] !== s) seen.push(s);
  }
  assert.equal(seen[0], 'roar');
  assert.ok(seen.includes('idle') && seen.includes('tell') && seen.includes('act') && seen.includes('rec'), seen.join('>'));
  // the order is always tell -> act -> rec
  for (let i = 0; i < seen.length - 1; i++) {
    if (seen[i] === 'tell') assert.equal(seen[i + 1], 'act');
    if (seen[i] === 'act') assert.ok(seen[i + 1] === 'rec' || seen[i + 1] === 'stun');
  }
});

test('light hits bounce off an attacking boss; heavy ones break the attack; openings are open', () => {
  const b = makeBoss(1);
  const def = bossDefFor(1);
  const { ctx } = makeCtx(900);
  b.ai!.state = 'roar';
  assert.equal(vulnerability(b), 'closed');
  b.ai!.state = 'tell';
  b.ai!.move = 'spit';
  assert.equal(vulnerability(b), 'armored');
  assert.equal(bodyHurts(b), false, 'the first moment of a wind-up is grace');
  b.ai!.t = 0.5;
  assert.equal(bodyHurts(b), true);
  assert.equal(interruptBoss(b, def, ctx), false, 'one heavy hit only rattles it');
  assert.equal(b.ai!.state, 'tell');
  assert.equal(interruptBoss(b, def, ctx), true, 'a second one breaks the attack');
  assert.equal(b.ai!.state, 'stun');
  assert.equal(vulnerability(b), 'stunned');
  assert.equal(interruptBoss(b, def, ctx), false, 'cannot interrupt a boss that is already down');
  // after a break it holds firm for a few seconds: no stun loop
  b.ai!.state = 'tell';
  interruptBoss(b, def, ctx);
  assert.equal(interruptBoss(b, def, ctx), false, 'poise holds right after a break');
  b.ai!.state = 'rec';
  assert.equal(vulnerability(b), 'open');
  assert.equal(bodyHurts(b), false, 'walking up to hit it in its opening is safe');
  b.ai!.state = 'idle';
  assert.equal(bodyHurts(b), false);
});

test('the golem cannot be interrupted out of its fist slam', () => {
  const b = makeBoss(7);
  const def = bossDefFor(7);
  const { ctx } = makeCtx(900);
  b.ai!.state = 'tell';
  b.ai!.move = 'fistSlam';
  assert.equal(interruptBoss(b, def, ctx), false);
});

test('dropping hp across a threshold makes the boss roar and enter the next phase', () => {
  const b = makeBoss(3);
  const { ctx, log } = makeCtx(900);
  for (let i = 0; i < 60 * 3; i++) stepBoss(b, bossDefFor(3), ctx, 1 / 60);
  b.hp = Math.floor(b.maxHp * 0.6);
  stepBoss(b, bossDefFor(3), ctx, 1 / 60);
  assert.equal(b.phase, 2);
  assert.equal(b.ai!.state, 'roar');
  assert.ok(log.roars >= 1);
  b.hp = 2;
  stepBoss(b, bossDefFor(3), ctx, 1 / 60);
  assert.equal(b.phase, 3);
});

test('the croc crashes into the wall at the end of its death roll and is left stunned', () => {
  const b = makeBoss(2);
  const def = bossDefFor(2);
  const { ctx } = makeCtx(900);
  b.ai!.state = 'idle';
  b.ai!.idle = 0;
  b.ai!.d = {};
  // force the move
  b.ai!.state = 'tell';
  b.ai!.move = 'deathRoll';
  b.ai!.t = 0;
  let stunned = false;
  for (let i = 0; i < 60 * 6 && !stunned; i++) {
    stepBoss(b, def, ctx, 1 / 60);
    if ((b.ai!.state as string) === 'stun') stunned = true;
  }
  assert.ok(stunned, 'the roll ends in a stun');
  assert.ok(b.x <= ARENA.left + b.width / 2 + 3 || b.x >= ARENA.right - b.width / 2 - 3, 'against a wall');
  assert.ok(b.ai!.hold >= 1.5);
});

test('warnings come first: a column or a drop cannot hurt until its warning is over', () => {
  const { ctx } = makeCtx(1000);
  const b = makeBoss(1);
  b.ai!.state = 'tell';
  b.ai!.move = 'tailSlam';
  b.ai!.t = 0;
  bossDefFor(1).moves.tailSlam.onTell!(b, ctx);
  const col = ctx.hazards[0];
  assert.ok(col.warn >= 0.9, 'long warning');
  assert.equal(hazardBox(col), null);
  for (let i = 0; i < 80; i++) stepHazards(ctx.hazards, ARENA, 1 / 60, noEv);
  assert.ok(hazardBox(col), 'now it is live');
  assert.ok(hazardBox(col)!.h >= 100);
});

test('spit lands as a puddle that slows but does not hurt', () => {
  const { ctx } = makeCtx(1000);
  const b = makeBoss(1);
  b.x = 1500;
  bossDefFor(1).moves.spit.onAct!(b, ctx);
  assert.equal(ctx.hazards.length, 1);
  for (let i = 0; i < 180 && ctx.hazards.some((h) => h.kind === 'glob'); i++) stepHazards(ctx.hazards, ARENA, 1 / 60, noEv);
  const puddle = ctx.hazards.find((h) => h.kind === 'puddle');
  assert.ok(puddle, 'a puddle was left behind');
  assert.equal(puddle!.eff, 'slow');
  assert.equal(puddle!.dmg, 0);
});

test('an hour of fighting every boss never breaks anything', () => {
  for (let w = 1; w <= 10; w++) {
    const def = bossDefFor(w);
    const b = makeBoss(w);
    const rnd = seeded(w * 31);
    const { ctx } = makeCtx(900, rnd);
    let peak = 0;
    const moves = new Set<string>();
    for (let i = 0; i < 60 * 240; i++) {
      // a player who wanders about the arena
      ctx.px = ARENA.left + 40 + (Math.sin(i / 97) * 0.5 + 0.5) * (ARENA.right - ARENA.left - 80);
      if (i === 60 * 80) b.hp = Math.floor(b.maxHp * 0.6);
      if (i === 60 * 160) b.hp = Math.floor(b.maxHp * 0.3);
      stepBoss(b, def, ctx, 1 / 60);
      stepHazards(ctx.hazards, ARENA, 1 / 60, noEv);
      if (b.ai!.move) moves.add(b.ai!.move);
      peak = Math.max(peak, ctx.hazards.length);
      assert.ok(Number.isFinite(b.x) && Number.isFinite(b.y), `${def.name} stays a number`);
      assert.ok(b.x >= ARENA.left && b.x <= ARENA.right, `${def.name} stays in the arena (x=${b.x})`);
      assert.ok(b.y <= ARENA.floor, `${def.name} never sinks into the floor`);
    }
    assert.ok(peak < 40, `${def.name} hazards pile up (${peak})`);
    assert.equal(b.phase, 3);
    // by the last phase it has used most of what it has
    assert.ok(moves.size >= Object.keys(def.moves).length - 1, `${def.name} used ${[...moves].join(',')}`);
  }
});

test('hazards that leave the arena or run out are removed', () => {
  const list: BossHazard[] = [];
  const { ctx } = makeCtx(900);
  ctx.hazards = list;
  const h = bossDefFor(10).moves.spearThrow;
  const b = makeBoss(10);
  b.x = 1700;
  b.facing = 1;
  h.onAct!(b, ctx);
  assert.ok(ctx.hazards.length >= 1);
  for (let i = 0; i < 60 * 5; i++) stepHazards(ctx.hazards, ARENA, 1 / 60, noEv);
  assert.equal(ctx.hazards.length, 0);
});

// ---------------------------------------------------------------------------
// The secret boss
// ---------------------------------------------------------------------------

import { THORNBARK_DEF, bossDefForLevel } from './bossDefs.ts';
import { THORNBARK_LEVEL, SECRET_GATE_LEVEL, maxHearts } from './secret.ts';
import { generateStage } from './stageGenerator.ts';
import { generateAllLevels } from './worldsData.ts';

const getLevelConfig = (id: string) => generateAllLevels().find((l) => l.id === id)!;

test('Thornbark has his own tougher move set, and the secret level picks him', () => {
  assert.equal(bossDefForLevel(THORNBARK_LEVEL), THORNBARK_DEF);
  assert.notEqual(bossDefForLevel(getLevelConfig('7-10')), THORNBARK_DEF);
  const names = Object.keys(THORNBARK_DEF.moves);
  assert.ok(names.length >= 6);
  for (const n of names) assert.ok(THORNBARK_DEF.moves[n].tell >= 0.45, `${n} warns first`);
  for (const phase of [1, 2, 3]) assert.ok(names.some((n) => (THORNBARK_DEF.moves[n].phase ?? 1) <= phase && THORNBARK_DEF.moves[n].min === undefined));
  assert.ok((THORNBARK_DEF.hp ?? 0) > bossMaxHp(10));
});

test('the secret level builds an arena fight with Thornbark and no Daisy', () => {
  const stage = generateStage(THORNBARK_LEVEL);
  assert.ok(stage.boss);
  assert.equal(stage.boss!.maxHp, THORNBARK_DEF.hp);
  assert.ok(stage.arena);
  assert.equal(stage.daisyX, undefined);
});

test('stage 7-7 hides a reachable Thorn Gate, and no other stage does', () => {
  const stage = generateStage(getLevelConfig(SECRET_GATE_LEVEL));
  const gates = stage.collectibles.filter((c) => c.type === 'thorn_gate');
  assert.equal(gates.length, 1);
  const gate = gates[0];
  const ledge = stage.platforms.find((p) => gate.x >= p.x && gate.x <= p.x + p.width && Math.abs(p.y - (gate.y + 40)) < 2);
  assert.ok(ledge, 'the gate sits on a ledge');
  // a mushroom close to the start lets the hero bounce up
  assert.ok(stage.platforms.some((p) => p.type === 'bouncy' && Math.abs(p.x - stage.spawnX) < 200));
  for (const id of ['1-1', '7-6', '7-8', '10-10']) {
    assert.equal(generateStage(getLevelConfig(id)).collectibles.filter((c) => c.type === 'thorn_gate').length, 0, id);
  }
});

test('hearts: five to start, six with the Thorn Heart', () => {
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
  };
  assert.equal(maxHearts(), 5);
  store.set('sloth_thorn_heart', '1');
  assert.equal(maxHearts(), 6);
  delete (globalThis as { localStorage?: unknown }).localStorage;
});
