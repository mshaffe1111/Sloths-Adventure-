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
  assert.equal(weakRect(mk('rec'), { ...drake, weak: undefined, weakByMove: undefined, weakStun: undefined }, floor), null, 'a boss without a weak point can be hit anywhere');
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
import { PILLAR } from './sovereignFight.ts';

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

// ───────────── Venom Fang (world 1): the gentlest boss (rebuilt 2026-10-24) ─────────────
const venom = bossDefFor(1);
import { VF, lungeReach, venomHurt, venomWeak } from './venomFang.ts';
import { playerHurtRect } from './fight.ts';

const venomStage = () => generateStage(generateAllLevels().find((l) => l.id === '1-10')!);
const venomAt = (stage: ReturnType<typeof venomStage>, state: 'idle' | 'tell' | 'act' | 'rec', t: number) => {
  const b = { ...stage.boss!, ai: { ...newBrain(), state, move: 'sweep', t, d: { reach: lungeReach(-1, stage.arena!.left, stage.arena!.right) } } } as BossEntity;
  return b;
};

test('Venom Fang is the gentlest boss: one move to learn, six hits, two an opening', () => {
  assert.equal(venom.hits, 6);
  assert.equal(venom.hp, 12);
  assert.equal(venom.openCap, 4, 'each opening takes two full hits, then he pulls back');
  const p1 = Object.keys(venom.moves).filter((n) => (venom.moves[n].phase ?? 1) <= 1);
  assert.deepEqual(p1, ['sweep'], 'phase 1 has the sweep and nothing else');
  assert.ok(venom.moves.sweep.tell >= 1.0, 'a long warning');
  assert.ok(venom.moves.sweep.rec >= 2.4, 'a long opening');
  assert.ok(venom.lair === 'venom' && venom.entrance);
  const stage = venomStage();
  assert.equal(stage.boss!.maxHp, venom.hp);
  assert.equal(validateStage(stage).ok, true);
});

test('his lunge sweeps the whole floor: standing anywhere on it is hit', () => {
  const stage = venomStage();
  const a = stage.arena!;
  for (let x = a.left + 14; x <= stage.boss!.x - 200; x += 20) {
    const me = playerHurtRect({ x, y: a.floor });
    let hit = false;
    for (let t = 0; t <= VF.act; t += 1 / 60) {
      for (const r of venomHurt(venomAt(stage, 'act', t), a.floor, 0)) {
        if (me.x < r.x + r.w && me.x + me.w > r.x && me.y < r.y + r.h && me.y + me.h > r.y) hit = true;
      }
    }
    assert.ok(hit, `standing at ${x - a.left} from the fence is hit`);
  }
});

test('every way off the floor clears the lunge: the stump, the liana, the vine up the wall', () => {
  const stage = venomStage();
  const a = stage.arena!;
  const top = Math.min(...[0.3, 0.6, 0.9].flatMap((u) => venomHurt(venomAt(stage, 'act', VF.act * u), a.floor, 0).map((r) => r.y)));
  const stump = stage.platforms.find((p) => p.crackFrom === 3)!;
  assert.ok(stump && stump.y < top - 5, 'feet on the stump are above everything that hurts');
  const liana = stage.vines.find((v) => v.vineType === 'swing_liana')!;
  assert.ok(liana.bottomY < top - 20, 'hanging from the liana\'s end clears it');
  const climb = stage.vines.find((v) => v.vineType === 'tree_climb' && v.x > a.left && v.x < a.left + 60)!;
  assert.ok(climb, 'a vine to climb inside the fence');
  assert.ok(climb.topY < top - 150, 'and it goes well above');
  // the stump is a double jump up, the liana's end within a jump and a reach
  assert.ok(a.floor - stump.y <= DOUBLE_RISE - 20);
});

test('the punch target is his dazed head on the floor, open only after the lunge', () => {
  const stage = venomStage();
  const a = stage.arena!;
  const rec = venomAt(stage, 'rec', 0.5);
  const r = venomWeak(rec, a.floor)!;
  assert.ok(r.y + r.h >= a.floor - 2 && r.y >= a.floor - 110, 'at Pokey\'s height');
  assert.ok(r.x < a.left + 120, 'at the far end, where the head landed');
  assert.equal(weakOpen(rec, venom), true);
  assert.equal(weakOpen(venomAt(stage, 'idle', 3), venom), false);
  const call = { ...rec, ai: { ...rec.ai!, move: 'call' } } as BossEntity;
  assert.equal(weakOpen(call, venom), false, 'calling the snakes leaves no opening');
});

test('each phase adds one World 1 move: little snakes, then the stump cracks; a heart each time', () => {
  const drops: number[] = [];
  const hearts: number[] = [];
  const cracks: number[] = [];
  const ctx = {
    arena: { left: 760, right: 2060, floor: 560 }, hazards: [], text: () => {}, shake: () => {},
    dropMinion: (_k: string, x: number) => drops.push(x), dropHeart: (x: number) => hearts.push(x), crackPerches: (p: number) => cracks.push(p),
  } as unknown as import('./bossAI.ts').BossCtx;
  venom.onPhase!(2, mk('idle'), ctx);
  assert.equal(drops.length, 2);
  assert.deepEqual(cracks, []);
  venom.onPhase!(3, mk('idle'), ctx);
  assert.equal(drops.length, 2, 'no more snakes from the phase change itself');
  assert.deepEqual(cracks, [3]);
  assert.equal(hearts.length, 2);
  assert.ok(venom.moves.call.phase === 2 && venom.moves.call.when!(mk('idle'), { minionsAlive: 1 } as never) === false, 'he calls more only when the last are gone');
});


// no two lairs share a layout: the ledges of every giant differ from the others'
test('every giant boss has its own layout', () => {
  const sig = (w: number) => JSON.stringify((bossDefFor(w).perches ?? []).map((p) => [Math.round(p.dx / 100), Math.round(p.up / 50), p.kind ?? (p.moving ? 'm' : 's')]));
  const giants = [1, 2, 3, 9].filter((w) => bossDefFor(w).perches?.length);
  assert.equal(new Set(giants.map(sig)).size, giants.length);
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

// ───────────────────────────── Shadow Prowler (world 3): the fourth giant ─────────────────────────────
import { inMoonPool, PROWLER_POOLS, POOL_HALF } from './prowlerPools.ts';

const prowler = bossDefFor(3);
const pb = (state: 'idle' | 'rec' | 'stun' | 'act', move?: string, facing: 1 | -1 = 1): BossEntity => {
  const b = { ...mk(state, facing), x: 1500, width: prowler.w, height: prowler.h } as BossEntity;
  if (move) b.ai!.move = move;
  return b;
};

test('the Shadow Prowler is a giant with a fourteen-hit bar, his own lair and room to run', () => {
  assert.ok((prowler.scale ?? 1) >= 2.4 && prowler.w >= 380);
  assert.equal(prowler.hits, 14);
  assert.equal(prowler.hp, (prowler.hits ?? 0) * 2);
  assert.ok(prowler.lair === 'prowler' && prowler.entrance && prowler.aimText);
  assert.equal(lairOwnsScene('prowler'), true);
  const stage = generateStage(generateAllLevels().find((l) => l.id === '3-10')!);
  const a = stage.arena!;
  assert.ok(a.right - a.left >= prowler.w + 700);
  assert.equal(stage.boss!.maxHp, prowler.hp);
  assert.ok(stage.boss!.x + prowler.w / 2 <= a.right, 'it starts inside the fence');
  assert.equal(validateStage(stage).ok, true);
});

test('the Prowler is weak in a different place after each move, and every one can be reached', () => {
  const spots: Record<string, { x: number; y: number; w: number; h: number }> = {};
  for (const m of ['shadowStep', 'clawCombo', 'pounce', 'streak']) {
    const r = weakRect(pb('rec', m), prowler, floor)!;
    assert.ok(r, m);
    spots[m] = r;
    assert.ok(floor - (r.y + r.h) <= DOUBLE_RISE, `${m}: bottom of the spot is within a double jump of the floor`);
    assert.ok(floor - r.y > 0, `${m}: the spot is above the floor`);
  }
  const keys = Object.keys(spots).map((m) => `${Math.round(spots[m].x)}/${Math.round(spots[m].y)}`);
  assert.equal(new Set(keys).size, keys.length, 'no two moves open the same spot');
  // the dash leaves the tail toward you: the spot is behind his middle; the others are forward
  assert.ok(spots.streak.x + spots.streak.w / 2 < 1500 && spots.shadowStep.x + spots.shadowStep.w / 2 > 1500);
  // stunned he shows his belly, and a move that has no entry falls back to the default
  const st = weakRect(pb('rec', undefined), prowler, floor)!;
  const def = prowler.weak!;
  assert.equal(Math.round(st.x + st.w / 2), 1500 + def.dx);
  const stun = weakRect({ ...pb('stun', 'pounce') } as BossEntity, prowler, floor)!;
  assert.equal(Math.round(stun.x + stun.w / 2), 1500 + prowler.weakStun!.dx);
  // it follows the way he faces
  const left = weakRect(pb('rec', 'clawCombo', -1), prowler, floor)!;
  assert.ok(left.x + left.w / 2 < 1500);
});

test('the Prowler lair: every ledge can be reached, from the floor or one before it, and there is a rope', () => {
  const ps = prowler.perches ?? [];
  assert.ok(ps.length >= 3);
  const spans = ps.map((p) => ({ x0: p.dx - (p.moving?.range ?? 0), x1: p.dx + p.w + (p.moving?.range ?? 0), up: p.up }));
  const reached = [{ x0: -1e9, x1: 1e9, up: 0 }];
  for (const sp of spans) {
    const ok = reached.some((r) => {
      const rise = sp.up - r.up;
      const gap = Math.max(0, sp.x0 - r.x1, r.x0 - sp.x1);
      return (rise <= SAFE.rise1 && gap <= SAFE.gap1) || (rise <= SAFE.rise2 && gap <= SAFE.gap2 * 0.7);
    });
    assert.ok(ok, `ledge at ${sp.x0}-${sp.x1}, ${sp.up} up, cannot be reached`);
    reached.push(sp);
  }
  assert.ok((prowler.vines ?? []).length >= 1);
});

test('the moon pools sit inside the arena and are wide enough to stand in', () => {
  for (const dx of PROWLER_POOLS) {
    assert.ok(dx - POOL_HALF > 0 && dx + POOL_HALF < (prowler.arenaW ?? 0));
    assert.equal(inMoonPool(1000 + dx, 1000), true);
    assert.equal(inMoonPool(1000 + dx + POOL_HALF + 1, 1000) && inMoonPool(1000 + dx - POOL_HALF - 1, 1000), false);
  }
  assert.equal(inMoonPool(1000 + 750, 1000), false, 'the middle of the arena is in shadow');
});

test('a shadow step that comes out in a moon pool is caught and stunned; one in the dark is not', () => {
  const left = 1000;
  const half = prowler.w / 2;
  const run = (px: number) => {
    const b = pb('act', 'shadowStep');
    b.ai!.d = {};
    const ctx = { px, arena: { left, right: left + (prowler.arenaW ?? 1500), floor }, debris: () => {}, shake: () => {}, text: () => {}, hazards: [] } as unknown as import('./bossAI.ts').BossCtx;
    prowler.moves.shadowStep.onAct!(b, ctx);
    return b;
  };
  // he comes out one stride behind the hero, so with the far pool at the hero's back he is put right in the light
  const caught = run(left + PROWLER_POOLS[1] - (half + 20));
  assert.ok(inMoonPool(caught.x, left));
  assert.ok(caught.ai!.d.crashed, 'caught by the light');
  assert.equal(prowler.moves.shadowStep.stunAfter!(caught), 3.0); // (2.1 until the fairness pass: bossFair.test.ts)
  assert.ok(half > 0);
  // the hero in the shadows in the middle: he comes out in the dark and is not caught
  const free = run(left + 750);
  assert.equal(inMoonPool(free.x, left), false);
  assert.ok(!free.ai!.d.crashed);
});

test('the glowcaps go dark at 35%, and only then', () => {
  const texts: string[] = [];
  const ctx = { arena: { left: 760, right: 2260, floor: 560 }, text: (t: string) => texts.push(t), shake: () => {} } as unknown as import('./bossAI.ts').BossCtx;
  prowler.onPhase!(2, mk('idle'), ctx);
  assert.equal(texts.length, 0);
  prowler.onPhase!(3, mk('idle'), ctx);
  assert.equal(texts.length, 1);
});

// ───────────────────────────── Sky Sovereign (world 4): the fifth giant ─────────────────────────────
const sov = bossDefFor(4);
const sb = (state: 'idle' | 'rec' | 'stun' | 'act', move?: string, facing: 1 | -1 = 1): BossEntity => {
  const b = { ...mk(state, facing), x: 1500, width: sov.w, height: sov.h } as BossEntity;
  if (move) b.ai!.move = move;
  // in the opening she hangs a little above the floor
  b.ai!.air = state === 'stun' ? 0 : (sov.hover ?? 0) * 0.35;
  return b;
};

test('the Sky Sovereign is a giant with a sixteen-hit bar, her own lair and room to fly', () => {
  assert.ok((sov.scale ?? 1) >= 2.2 && sov.w >= 240);
  assert.equal(sov.hits, 16);
  assert.equal(sov.hp, (sov.hits ?? 0) * 2);
  assert.ok(sov.lair === 'sovereign' && sov.entrance && sov.aimText);
  assert.equal(lairOwnsScene('sovereign'), true);
  const stage = generateStage(generateAllLevels().find((l) => l.id === '4-10')!);
  const a = stage.arena!;
  assert.ok(a.right - a.left >= sov.w + 700);
  assert.equal(stage.boss!.maxHp, sov.hp);
  assert.ok(stage.boss!.x + sov.w / 2 <= a.right, 'she starts inside the fence');
  assert.equal(validateStage(stage).ok, true);
});

test('the Sovereign is weak somewhere different after each move, and each spot can be reached', () => {
  const spots: Record<string, { x: number; y: number; w: number; h: number }> = {};
  for (const m of ['featherVolley', 'skySweep', 'snatch', 'talonRake', 'wingGust']) {
    const r = weakRect(sb('rec', m), sov, floor)!;
    assert.ok(r, m);
    spots[m] = r;
    assert.ok(floor - (r.y + r.h) <= DOUBLE_RISE, `${m}: bottom of the spot is within a double jump of the floor`);
    assert.ok(floor - r.y > 0, `${m}: the spot is above the floor`);
  }
  const keys = Object.keys(spots).map((m) => `${Math.round(spots[m].x)}/${Math.round(spots[m].y)}`);
  assert.equal(new Set(keys).size, keys.length, 'no two moves open the same spot');
  // the back (after the snatch) is behind her middle, the head (after the beak lunge) is in front
  assert.ok(spots.snatch.x + spots.snatch.w / 2 < 1500 && spots.talonRake.x + spots.talonRake.w / 2 > 1500);
  // after a crash she is on the floor with her head within reach; a move with no entry falls back to the default
  const stun = weakRect(sb('stun', 'diveBomb'), sov, floor)!;
  assert.equal(Math.round(stun.x + stun.w / 2), 1500 + sov.weakStun!.dx);
  const def = weakRect(sb('rec', undefined), sov, floor)!;
  assert.equal(Math.round(def.x + def.w / 2), 1500 + sov.weak!.dx);
  const left = weakRect(sb('rec', 'talonRake', -1), sov, floor)!;
  assert.ok(left.x + left.w / 2 < 1500);
});

test('the Aerie: every ledge and rock top can be reached, there is a rope, and the storm breaks at the last phase only', () => {
  const ps = sov.perches ?? [];
  assert.ok(sov.pillars, 'the rock pillars are its other perches');
  // the rock tops first (a double jump from the floor), then the high ledge from a rock
  const spans = [
    ...PILLAR.at.map((dx) => ({ x0: dx - PILLAR.w / 2, x1: dx + PILLAR.w / 2, up: PILLAR.h })),
    ...ps.map((p) => ({ x0: p.dx - (p.moving?.range ?? 0), x1: p.dx + p.w + (p.moving?.range ?? 0), up: p.up })),
  ];
  const reached = [{ x0: -1e9, x1: 1e9, up: 0 }];
  for (const sp of spans) {
    const ok = reached.some((r) => {
      const rise = sp.up - r.up;
      const gap = Math.max(0, sp.x0 - r.x1, r.x0 - sp.x1);
      return (rise <= SAFE.rise1 && gap <= SAFE.gap1) || (rise <= SAFE.rise2 && gap <= SAFE.gap2 * 0.7);
    });
    assert.ok(ok, `ledge at ${sp.x0}-${sp.x1}, ${sp.up} up, cannot be reached`);
    reached.push(sp);
  }
  assert.ok((sov.vines ?? []).length >= 1);
  const made: { look?: string }[] = [];
  const ctx = { arena: { left: 1000, right: 2500, floor }, hazards: made, text: () => {}, shake: () => {} } as unknown as import('./bossAI.ts').BossCtx;
  sov.onPhase!(2, sb('idle'), ctx);
  assert.equal(made.length, 0);
  sov.onPhase!(3, sb('idle'), ctx);
  assert.equal(made.length, 2);
  assert.ok(made.every((h) => h.look === 'storm'));
});

// ───────────────────────────── Tarantula Queen (world 5): the sixth giant ─────────────────────────────
const queen = bossDefFor(5);
const qb = (state: 'idle' | 'rec' | 'stun' | 'act', move?: string, facing: 1 | -1 = 1): BossEntity => {
  const b = { ...mk(state, facing), x: 1500, width: queen.w, height: queen.h } as BossEntity;
  if (move) b.ai!.move = move;
  b.ai!.air = 0;
  return b;
};

test('the Tarantula Queen is a giant with an eighteen-hit bar, her own lair and room to move', () => {
  assert.ok((queen.scale ?? 1) >= 2.1 && queen.w >= 300);
  assert.equal(queen.hits, 18);
  assert.equal(queen.hp, (queen.hits ?? 0) * 2);
  assert.ok(queen.lair === 'queen' && queen.entrance && queen.aimText);
  assert.equal(lairOwnsScene('queen'), true);
  const stage = generateStage(generateAllLevels().find((l) => l.id === '5-10')!);
  const a = stage.arena!;
  assert.ok(a.right - a.left >= queen.w + 700);
  assert.equal(stage.boss!.maxHp, queen.hp);
  assert.ok(stage.boss!.x + queen.w / 2 <= a.right, 'she starts inside the fence');
  assert.equal(validateStage(stage).ok, true);
});

test('the Queen is weak somewhere different after each move, and every spot can be reached', () => {
  const moves = ['webShot', 'callBrood', 'pounceBite', 'legStomp', 'venomBlast', 'webCurtain', 'cocoonDrop'];
  const spots: Record<string, { x: number; y: number; w: number; h: number }> = {};
  for (const m of moves) {
    assert.ok(queen.moves[m], `${m} is a move`);
    const r = weakRect(qb('rec', m), queen, floor)!;
    assert.ok(r, m);
    spots[m] = r;
    assert.ok(floor - (r.y + r.h) <= DOUBLE_RISE, `${m}: bottom of the spot is within a double jump of the floor`);
    assert.ok(floor - r.y > 0, `${m}: the spot is above the floor`);
  }
  const keys = Object.keys(spots).map((m) => `${Math.round(spots[m].x)}/${Math.round(spots[m].y)}`);
  assert.equal(new Set(keys).size, keys.length, 'no two moves open the same spot');
  // the rear (after the stomp and the web shot) is behind her middle; the fangs and eyes are in front
  assert.ok(spots.legStomp.x + spots.legStomp.w / 2 < 1500 && spots.webShot.x + spots.webShot.w / 2 < 1500);
  assert.ok(spots.pounceBite.x + spots.pounceBite.w / 2 > 1500 && spots.venomBlast.x + spots.venomBlast.w / 2 > 1500);
  const stun = weakRect(qb('stun', 'pounceBite'), queen, floor)!;
  assert.equal(Math.round(stun.x + stun.w / 2), 1500 + queen.weakStun!.dx);
  const def = weakRect(qb('rec', undefined), queen, floor)!;
  assert.equal(Math.round(def.x + def.w / 2), 1500 + queen.weak!.dx);
  const left = weakRect(qb('rec', 'pounceBite', -1), queen, floor)!;
  assert.ok(left.x + left.w / 2 < 1500);
});

test('the Silk Hollow: every ledge can be reached, there is a rope, and the brood hatches at the last phase only', () => {
  const ps = queen.perches ?? [];
  assert.ok(ps.length >= 3);
  const spans = ps.map((p) => ({ x0: p.dx - (p.moving?.range ?? 0), x1: p.dx + p.w + (p.moving?.range ?? 0), up: p.up }));
  const reached = [{ x0: -1e9, x1: 1e9, up: 0 }];
  for (const sp of spans) {
    const ok = reached.some((r) => {
      const rise = sp.up - r.up;
      const gap = Math.max(0, sp.x0 - r.x1, r.x0 - sp.x1);
      return (rise <= SAFE.rise1 && gap <= SAFE.gap1) || (rise <= SAFE.rise2 && gap <= SAFE.gap2 * 0.7);
    });
    assert.ok(ok, `ledge at ${sp.x0}-${sp.x1}, ${sp.up} up, cannot be reached`);
    reached.push(sp);
  }
  assert.ok((queen.vines ?? []).length >= 1);
  const spawned: [string, number][] = [];
  const ctx = {
    arena: { left: 1000, right: 2600, floor }, hazards: [], text: () => {}, shake: () => {},
    spawnMinion: (k: string, x: number) => spawned.push([k, x]),
  } as unknown as import('./bossAI.ts').BossCtx;
  queen.onPhase!(2, qb('idle'), ctx);
  assert.equal(spawned.length, 0);
  queen.onPhase!(3, qb('idle'), ctx);
  assert.equal(spawned.length, 2);
  assert.ok(spawned.every(([k, x]) => k === 'spider' && x > 1000 && x < 2600));
});

test('the Queen only starts her phase-gated moves when she has the health for them', () => {
  assert.equal(queen.moves.venomBlast.phase, 2);
  assert.equal(queen.moves.webCurtain.phase, 2);
  assert.equal(queen.moves.cocoonDrop.phase, 3);
  assert.ok(!queen.moves.webShot.phase && !queen.moves.legStomp.phase);
});

// ───────────────────────────── Marsh Reaver (world 6): the seventh giant ─────────────────────────────
const reaver = bossDefFor(6);
const rb = (state: 'idle' | 'rec' | 'stun' | 'act', move?: string, facing: 1 | -1 = 1): BossEntity => {
  const b = { ...mk(state, facing), x: 1500, width: reaver.w, height: reaver.h } as BossEntity;
  if (move) b.ai!.move = move;
  b.ai!.air = 0;
  return b;
};

test('the Marsh Reaver is a giant with a twenty-hit bar, his own lair and room to move', () => {
  assert.ok((reaver.scale ?? 1) >= 1.8 && reaver.w >= 190);
  assert.equal(reaver.hits, 20);
  assert.equal(reaver.hp, (reaver.hits ?? 0) * 2);
  assert.ok(reaver.lair === 'reaver' && reaver.entrance && reaver.aimText);
  assert.equal(lairOwnsScene('reaver'), true);
  const stage = generateStage(generateAllLevels().find((l) => l.id === '6-10')!);
  const a = stage.arena!;
  assert.ok(a.right - a.left >= reaver.w + 700);
  assert.equal(stage.boss!.maxHp, reaver.hp);
  assert.ok(stage.boss!.x + reaver.w / 2 <= a.right, 'he starts inside the fence');
  assert.equal(validateStage(stage).ok, true);
});

test('the Reaver is weak somewhere different after each move, and every spot can be reached', () => {
  const moves = ['vaultSmash', 'spearThrust', 'mudSling', 'warCry', 'spearSweep', 'spearSwipe'];
  const spots: Record<string, { x: number; y: number; w: number; h: number }> = {};
  for (const m of moves) {
    assert.ok(reaver.moves[m], `${m} is a move`);
    const r = weakRect(rb('rec', m), reaver, floor)!;
    assert.ok(r, m);
    spots[m] = r;
    assert.ok(floor - (r.y + r.h) <= DOUBLE_RISE, `${m}: bottom of the spot is within a double jump of the floor`);
    assert.ok(floor - r.y > 0, `${m}: the spot is above the floor`);
  }
  const keys = Object.keys(spots).map((m) => `${Math.round(spots[m].x)}/${Math.round(spots[m].y)}`);
  assert.equal(new Set(keys).size, keys.length, 'no two moves open the same spot');
  // the back is behind his middle, the face after the swipe is in front of it
  assert.ok(spots.vaultSmash.x + spots.vaultSmash.w / 2 < 1500 && spots.spearSweep.x + spots.spearSweep.w / 2 < 1500);
  assert.ok(spots.spearSwipe.x + spots.spearSwipe.w / 2 > 1500);
  const stun = weakRect(rb('stun', 'vaultSmash'), reaver, floor)!;
  assert.equal(Math.round(stun.x + stun.w / 2), 1500 + reaver.weakStun!.dx);
  const def = weakRect(rb('rec', undefined), reaver, floor)!;
  assert.equal(Math.round(def.x + def.w / 2), 1500 + reaver.weak!.dx);
  const left = weakRect(rb('rec', 'spearSwipe', -1), reaver, floor)!;
  assert.ok(left.x + left.w / 2 < 1500);
});

test('the Blackwater Roost: every ledge can be reached, there is a rope, and the raiders come at the last phase only', () => {
  const ps = reaver.perches ?? [];
  assert.ok(ps.length >= 3);
  const spans = ps.map((p) => ({ x0: p.dx - (p.moving?.range ?? 0), x1: p.dx + p.w + (p.moving?.range ?? 0), up: p.up }));
  const reached = [{ x0: -1e9, x1: 1e9, up: 0 }];
  for (const sp of spans) {
    const ok = reached.some((r) => {
      const rise = sp.up - r.up;
      const gap = Math.max(0, sp.x0 - r.x1, r.x0 - sp.x1);
      return (rise <= SAFE.rise1 && gap <= SAFE.gap1) || (rise <= SAFE.rise2 && gap <= SAFE.gap2 * 0.7);
    });
    assert.ok(ok, `ledge at ${sp.x0}-${sp.x1}, ${sp.up} up, cannot be reached`);
    reached.push(sp);
  }
  assert.ok((reaver.vines ?? []).length >= 1);
  const spawned: [string, number][] = [];
  const ctx = {
    arena: { left: 1000, right: 2600, floor }, hazards: [], text: () => {}, shake: () => {},
    spawnMinion: (k: string, x: number) => spawned.push([k, x]),
  } as unknown as import('./bossAI.ts').BossCtx;
  reaver.onPhase!(2, rb('idle'), ctx);
  assert.equal(spawned.length, 0);
  reaver.onPhase!(3, rb('idle'), ctx);
  assert.equal(spawned.length, 2);
  assert.ok(spawned.every(([k, x]) => k === 'tayra' && x > 1000 && x < 2600));
});

test('the Reaver sweeps low, swipes high and only uses the phase-gated moves when he has the health for them', () => {
  assert.equal(reaver.moves.spearSwipe.phase, 2);
  assert.equal(reaver.moves.warCry.phase, 3);
  assert.ok(!reaver.moves.spearSweep.phase);
  // the sweep is a low band a hero can jump (it ends under 60 above the floor) and the swipe a high band a hero on the floor stands below
  const made: { y: number; h: number }[] = [];
  const ctx = { arena: { left: 1000, right: 2600, floor }, hazards: made, shake: () => {}, px: 1100, py: floor } as unknown as import('./bossAI.ts').BossCtx;
  const b = rb('act', 'spearSweep');
  reaver.moves.spearSweep.onAct!(b, ctx);
  const low = made[0];
  assert.ok(floor - (low.y - low.h / 2) <= 60, 'the sweep band stays under 60 above the floor');
  made.length = 0;
  reaver.moves.spearSwipe.onAct!(rb('act', 'spearSwipe'), ctx);
  const high = made[0];
  assert.ok(floor - (high.y + high.h / 2) >= 100, 'the swipe band starts over 100 above the floor');
  // and the sweep comes back the other way
  b.ai!.d = {};
  const facing = b.facing;
  reaver.moves.spearSweep.tick!(b, ctx, 1 / 60, 0.6);
  assert.equal(b.facing, -facing);
  assert.equal(made.length, 2);
});

// ───────────────────────────── Stone Idol Golem (world 7): the eighth giant ─────────────────────────────
const golem = bossDefFor(7);
const gb = (state: 'idle' | 'rec' | 'stun' | 'act', move?: string, facing: 1 | -1 = 1): BossEntity => {
  const b = { ...mk(state, facing), x: 1500, width: golem.w, height: golem.h } as BossEntity;
  if (move) b.ai!.move = move;
  b.ai!.air = 0;
  return b;
};

test('the Stone Idol Golem is a giant with a twenty-two-hit bar, his own lair and room to move', () => {
  assert.ok((golem.scale ?? 1) >= 1.8 && golem.w >= 180);
  assert.equal(golem.hits, 22);
  assert.equal(golem.hp, (golem.hits ?? 0) * 2);
  assert.ok(golem.lair === 'golem' && golem.entrance && golem.aimText);
  assert.equal(lairOwnsScene('golem'), true);
  const stage = generateStage(generateAllLevels().find((l) => l.id === '7-10')!);
  const a = stage.arena!;
  assert.ok(a.right - a.left >= golem.w + 700);
  assert.equal(stage.boss!.maxHp, golem.hp);
  assert.ok(stage.boss!.x + golem.w / 2 <= a.right, 'he starts inside the fence');
  assert.equal(validateStage(stage).ok, true);
});

test('the Golem is weak somewhere different after each move, and every spot can be reached', () => {
  const moves = ['rockfall', 'eyeBeam', 'quake', 'hammerSmash', 'hammerSpin', 'crystalRift'];
  const spots: Record<string, { x: number; y: number; w: number; h: number }> = {};
  for (const m of moves) {
    assert.ok(golem.moves[m], `${m} is a move`);
    const r = weakRect(gb('rec', m), golem, floor)!;
    assert.ok(r, m);
    spots[m] = r;
    assert.ok(floor - (r.y + r.h) <= DOUBLE_RISE, `${m}: bottom of the spot is within a double jump of the floor`);
    assert.ok(floor - r.y > 0, `${m}: the spot is above the floor`);
  }
  const keys = Object.keys(spots).map((m) => `${Math.round(spots[m].x)}/${Math.round(spots[m].y)}`);
  assert.equal(new Set(keys).size, keys.length, 'no two moves open the same spot');
  const stun = weakRect(gb('stun', 'fistSlam'), golem, floor)!;
  assert.equal(Math.round(stun.x + stun.w / 2), 1500 + golem.weakStun!.dx);
  const def = weakRect(gb('rec', undefined), golem, floor)!;
  assert.equal(Math.round(def.x + def.w / 2), 1500 + golem.weak!.dx);
  // facing the other way mirrors a spot that is ahead of him
  const right = weakRect(gb('rec', 'eyeBeam', 1), golem, floor)!;
  const left = weakRect(gb('rec', 'eyeBeam', -1), golem, floor)!;
  assert.equal(Math.round(left.x + left.w / 2 - 1500), -Math.round(right.x + right.w / 2 - 1500));
});

test('the Idol Sanctum: every ledge can be reached, there is a vine, and the ceiling cracks only at the last phase', () => {
  const ps = golem.perches ?? [];
  assert.ok(ps.length >= 3);
  const spans = ps.map((p) => ({ x0: p.dx - (p.moving?.range ?? 0), x1: p.dx + p.w + (p.moving?.range ?? 0), up: p.up }));
  const reached = [{ x0: -1e9, x1: 1e9, up: 0 }];
  for (const sp of spans) {
    const ok = reached.some((r) => {
      const rise = sp.up - r.up;
      const gap = Math.max(0, sp.x0 - r.x1, r.x0 - sp.x1);
      return (rise <= SAFE.rise1 && gap <= SAFE.gap1) || (rise <= SAFE.rise2 && gap <= SAFE.gap2 * 0.7);
    });
    assert.ok(ok, `ledge at ${sp.x0}-${sp.x1}, ${sp.up} up, cannot be reached`);
    reached.push(sp);
  }
  assert.ok((golem.vines ?? []).length >= 1);
  const made: unknown[] = [];
  const ctx = {
    arena: { left: 1000, right: 2600, floor }, hazards: made, text: () => {}, shake: () => {}, px: 1800, py: floor,
  } as unknown as import('./bossAI.ts').BossCtx;
  golem.onPhase!(2, gb('idle'), ctx);
  assert.equal(made.length, 0);
  golem.onPhase!(3, gb('idle'), ctx);
  assert.equal(made.length, 5);
});

test('the Golem hammers ahead of himself, spins low and only uses the phase-gated moves when he has the health for them', () => {
  assert.equal(golem.moves.eyeBeam.phase, 2);
  assert.equal(golem.moves.hammerSpin.phase, 2);
  assert.equal(golem.moves.quake.phase, 3);
  assert.equal(golem.moves.crystalRift.phase, 3);
  assert.ok(!golem.moves.fistSlam.phase && !golem.moves.rockfall.phase && !golem.moves.hammerSmash.phase);
  // the smash and the rift put crystal columns on the floor; the rift is six of them
  const made: { x: number }[] = [];
  const ctx = { arena: { left: 1000, right: 2600, floor }, hazards: made, shake: () => {}, thud: () => {}, debris: () => {}, burst: () => {}, flash: () => {}, text: () => {}, px: 1900, py: floor } as unknown as import('./bossAI.ts').BossCtx;
  golem.moves.crystalRift.onAct!(gb('act', 'crystalRift'), ctx);
  assert.ok(made.length >= 6, 'six crystals in the rift');
  assert.ok(made.every((h) => h.x > 1000 && h.x < 2600));
});

// ───────────────────────────── Night-Wing Monarch (world 8): the ninth giant ─────────────────────────────
const monarch = bossDefFor(8);
const mb = (state: 'idle' | 'rec' | 'stun' | 'act', move?: string, facing: 1 | -1 = 1): BossEntity => {
  const b = { ...mk(state, facing), x: 1500, width: monarch.w, height: monarch.h } as BossEntity;
  if (move) b.ai!.move = move;
  b.ai!.air = 0;
  return b;
};

test('the Night-Wing Monarch is a giant with a twenty-three-hit bar, her own lair and room to move', () => {
  assert.ok((monarch.scale ?? 1) >= 2.2 && monarch.w >= 240);
  assert.equal(monarch.hits, 23);
  assert.equal(monarch.hp, (monarch.hits ?? 0) * 2);
  assert.ok(monarch.lair === 'monarch' && monarch.entrance && monarch.aimText);
  assert.equal(lairOwnsScene('monarch'), true);
  const stage = generateStage(generateAllLevels().find((l) => l.id === '8-10')!);
  const a = stage.arena!;
  assert.ok(a.right - a.left >= monarch.w + 700);
  assert.equal(stage.boss!.maxHp, monarch.hp);
  assert.ok(stage.boss!.x + monarch.w / 2 <= a.right, 'she starts inside the fence');
  assert.equal(validateStage(stage).ok, true);
});

test('the Monarch is weak somewhere different after each move, and every spot can be reached', () => {
  const moves = ['screech', 'swoop', 'stalactites', 'sonicDive', 'wingBuffet', 'echoRings', 'batFlock'];
  const spots: Record<string, { x: number; y: number; w: number; h: number }> = {};
  for (const m of moves) {
    assert.ok(monarch.moves[m], `${m} is a move`);
    const r = weakRect(mb('rec', m), monarch, floor)!;
    assert.ok(r, m);
    spots[m] = r;
    assert.ok(floor - (r.y + r.h) <= DOUBLE_RISE, `${m}: bottom of the spot is within a double jump of the floor`);
    assert.ok(floor - r.y > 0, `${m}: the spot is above the floor`);
  }
  const keys = Object.keys(spots).map((m) => `${Math.round(spots[m].x)}/${Math.round(spots[m].y)}`);
  assert.equal(new Set(keys).size, keys.length, 'no two moves open the same spot');
  // the wing joint after the swoop is behind her, the mouth after the screech in front
  assert.ok(spots.swoop.x + spots.swoop.w / 2 < 1500 && spots.screech.x + spots.screech.w / 2 > 1500);
  const stun = weakRect(mb('stun', 'wingBuffet'), monarch, floor)!;
  assert.equal(Math.round(stun.x + stun.w / 2), 1500 + monarch.weakStun!.dx);
  const def = weakRect(mb('rec', undefined), monarch, floor)!;
  assert.equal(Math.round(def.x + def.w / 2), 1500 + monarch.weak!.dx);
  const left = weakRect(mb('rec', 'swoop', -1), monarch, floor)!;
  assert.ok(left.x + left.w / 2 > 1500, 'facing left, the joint behind her is on the right');
});

test('the Karst Roost: every ledge can be reached, there is a root rope, and the roost sheds four bats at the last phase only', () => {
  const ps = monarch.perches ?? [];
  assert.ok(ps.length >= 3);
  const spans = ps.map((p) => ({ x0: p.dx - (p.moving?.range ?? 0), x1: p.dx + p.w + (p.moving?.range ?? 0), up: p.up }));
  const reached = [{ x0: -1e9, x1: 1e9, up: 0 }];
  for (const sp of spans) {
    const ok = reached.some((r) => {
      const rise = sp.up - r.up;
      const gap = Math.max(0, sp.x0 - r.x1, r.x0 - sp.x1);
      return (rise <= SAFE.rise1 && gap <= SAFE.gap1) || (rise <= SAFE.rise2 && gap <= SAFE.gap2 * 0.7);
    });
    assert.ok(ok, `ledge at ${sp.x0}-${sp.x1}, ${sp.up} up, cannot be reached`);
    reached.push(sp);
  }
  assert.ok((monarch.vines ?? []).length >= 1);
  const made: { look?: string }[] = [];
  const ctx = { arena: { left: 1000, right: 2600, floor }, hazards: made, text: () => {}, shake: () => {} } as unknown as import('./bossAI.ts').BossCtx;
  monarch.onPhase!(2, mb('idle'), ctx);
  assert.equal(made.length, 0);
  monarch.onPhase!(3, mb('idle'), ctx);
  assert.equal(made.length, 4);
  assert.ok(made.every((h) => h.look === 'bat'));
});

test('the Monarch gates her moves by phase, and the wing buffet grounds her', () => {
  assert.equal(monarch.moves.stalactites.phase, 2);
  assert.equal(monarch.moves.echoRings.phase, 2);
  assert.equal(monarch.moves.sonicDive.phase, 3);
  assert.equal(monarch.moves.batFlock.phase, 3);
  assert.ok(!monarch.moves.screech.phase && !monarch.moves.swoop.phase && !monarch.moves.wingBuffet.phase);
  // the buffet ends on the floor with her winded
  assert.equal(monarch.moves.wingBuffet.stunAfter!(mb('rec', 'wingBuffet')), 1.8);
  const made: { x: number; vx: number; kind: string }[] = [];
  const ctx = { arena: { left: 1000, right: 2600, floor }, hazards: made, shake: () => {}, thud: () => {}, debris: () => {}, px: 1900, py: floor, roar: () => {} } as unknown as import('./bossAI.ts').BossCtx;
  const b = mb('act', 'wingBuffet');
  b.ai!.air = 140;
  monarch.moves.wingBuffet.onAct!(b, ctx);
  assert.equal(b.ai!.air, 0);
  assert.equal(made.filter((h) => h.kind === 'shock').length, 2, 'a gust each way');
  assert.ok(!b.ai!.d.crashed, 'she is not winded yet: there is a second beat to come');
  monarch.moves.wingBuffet.tick!(b, ctx, 1 / 60, 0.55);
  assert.equal(made.filter((h) => h.kind === 'shock').length, 4, 'the second, faster beat');
  monarch.moves.wingBuffet.tick!(b, ctx, 1 / 60, 0.96);
  assert.equal(b.ai!.d.crashed, 1);
});

test('the echo rings alternate low and high, and the bat flock is three low bats then three high', () => {
  const made: { kind: string; y: number; vx: number; look?: string }[] = [];
  const ctx = { arena: { left: 1000, right: 2600, floor }, hazards: made, shake: () => {}, px: 1900, py: floor } as unknown as import('./bossAI.ts').BossCtx;
  const e = mb('act', 'echoRings');
  monarch.moves.echoRings.onAct!(e, ctx);
  for (const t of [0.05, 0.55, 1.05]) monarch.moves.echoRings.tick!(e, ctx, 1 / 60, t);
  assert.deepEqual(made.map((h) => h.kind), ['shock', 'shock', 'wave', 'wave', 'shock', 'shock']);
  made.length = 0;
  const f = mb('act', 'batFlock');
  f.ai!.d.dir = 1;
  monarch.moves.batFlock.onAct!(f, ctx);
  for (const t of [0.05, 0.35, 0.65, 1.25, 1.55, 1.85]) monarch.moves.batFlock.tick!(f, ctx, 1 / 60, t);
  assert.equal(made.length, 6);
  assert.ok(made.every((h) => h.look === 'bat' && h.vx > 0));
  const heights = made.map((h) => floor - h.y);
  assert.ok(heights.slice(0, 3).every((y) => y < 60) && heights.slice(3).every((y) => y > 100), 'low run, then high run');
});

// ───────────────────────────── General Iron-Claw (world 10): the tenth and last giant ─────────────────────────────
const general = bossDefFor(10);
const ib = (state: 'idle' | 'tell' | 'rec' | 'stun' | 'act', move?: string, facing: 1 | -1 = 1): BossEntity => {
  const b = { ...mk(state, facing), x: 1500, width: general.w, height: general.h } as BossEntity;
  if (move) b.ai!.move = move;
  b.ai!.air = 0;
  return b;
};

test('General Iron-Claw is a giant with a twenty-six-hit bar, his own lair and room to move', () => {
  assert.ok((general.scale ?? 1) >= 1.9 && general.w >= 180);
  assert.equal(general.hits, 26);
  assert.equal(general.hp, (general.hits ?? 0) * 2);
  assert.ok(general.lair === 'warcamp' && general.entrance && general.aimText);
  assert.equal(lairOwnsScene('warcamp'), true);
  const stage = generateStage(generateAllLevels().find((l) => l.id === '10-10')!);
  const a = stage.arena!;
  assert.ok(a.right - a.left >= general.w + 700);
  assert.equal(stage.boss!.maxHp, general.hp);
  assert.ok(stage.boss!.x + general.w / 2 <= a.right, 'he starts inside the fence');
  assert.equal(validateStage(stage).ok, true);
});

test('the General is weak somewhere different after each move, and every spot can be reached', () => {
  const moves = ['staffSlam', 'spearThrow', 'warCry', 'groundPound', 'clawCombo', 'quakeStride', 'warlordSlam'];
  const spots: Record<string, { x: number; y: number; w: number; h: number }> = {};
  for (const m of moves) {
    assert.ok(general.moves[m], `${m} is a move`);
    const r = weakRect(ib('rec', m), general, floor)!;
    assert.ok(r, m);
    spots[m] = r;
    assert.ok(floor - (r.y + r.h) <= DOUBLE_RISE, `${m}: bottom of the spot is within a double jump of the floor`);
    assert.ok(floor - r.y > 0, `${m}: the spot is above the floor`);
  }
  const keys = Object.keys(spots).map((m) => `${Math.round(spots[m].x)}/${Math.round(spots[m].y)}`);
  assert.equal(new Set(keys).size, keys.length, 'no two moves open the same spot');
  // the cape after the stride is behind him, the knuckles after the combo in front of him
  assert.ok(spots.quakeStride.x + spots.quakeStride.w / 2 < 1500 && spots.clawCombo.x + spots.clawCombo.w / 2 > 1500);
  // and a low spot (the foot) as well as high ones
  assert.ok(floor - (spots.groundPound.y + spots.groundPound.h / 2) < 80 && floor - (spots.staffSlam.y + spots.staffSlam.h / 2) > 150);
  const stun = weakRect(ib('stun', 'ironCharge'), general, floor)!;
  assert.equal(Math.round(stun.x + stun.w / 2), 1500 + general.weakStun!.dx);
  const def = weakRect(ib('rec', undefined), general, floor)!;
  assert.equal(Math.round(def.x + def.w / 2), 1500 + general.weak!.dx);
  const left = weakRect(ib('rec', 'clawCombo', -1), general, floor)!;
  assert.ok(left.x + left.w / 2 < 1500, 'facing left, the knuckles in front of him are on the left');
});

test('the War Camp: every ledge can be reached, there is a chain, and the palisade burns at the last phase only', () => {
  const ps = general.perches ?? [];
  assert.ok(ps.length >= 3);
  const spans = ps.map((p) => ({ x0: p.dx - (p.moving?.range ?? 0), x1: p.dx + p.w + (p.moving?.range ?? 0), up: p.up }));
  const reached = [{ x0: -1e9, x1: 1e9, up: 0 }];
  for (const sp of spans) {
    const ok = reached.some((r) => {
      const rise = sp.up - r.up;
      const gap = Math.max(0, sp.x0 - r.x1, r.x0 - sp.x1);
      return (rise <= SAFE.rise1 && gap <= SAFE.gap1) || (rise <= SAFE.rise2 && gap <= SAFE.gap2 * 0.7);
    });
    assert.ok(ok, `ledge at ${sp.x0}-${sp.x1}, ${sp.up} up, cannot be reached`);
    reached.push(sp);
  }
  assert.ok((general.vines ?? []).length >= 1);
  const made: { kind: string; look?: string; dir?: number }[] = [];
  const ctx = { arena: { left: 1000, right: 2800, floor }, hazards: made, text: () => {}, shake: () => {} } as unknown as import('./bossAI.ts').BossCtx;
  general.onPhase!(2, ib('idle'), ctx);
  assert.equal(made.length, 0);
  general.onPhase!(3, ib('idle'), ctx);
  assert.equal(made.length, 2);
  assert.ok(made.every((h) => h.kind === 'strip' && h.look === 'blaze'));
  assert.deepEqual(made.map((h) => h.dir).sort(), [-1, 1], 'one from each end');
});

test('the General gates his moves by phase, and the quake stride and the claw combo have their beats', () => {
  assert.equal(general.moves.ironCharge.phase, 2);
  assert.equal(general.moves.quakeStride.phase, 2);
  assert.equal(general.moves.groundPound.phase, 3);
  assert.equal(general.moves.warlordSlam.phase, 3);
  assert.ok(!general.moves.staffSlam.phase && !general.moves.spearThrow.phase && !general.moves.warCry.phase && !general.moves.clawCombo.phase);
  const made: { kind: string; look?: string; vx?: number }[] = [];
  const ctx = {
    arena: { left: 1000, right: 2800, floor }, hazards: made, shake: () => {}, thud: () => {}, debris: () => {}, text: () => {}, roar: () => {}, px: 1900, py: floor,
  } as unknown as import('./bossAI.ts').BossCtx;
  // four stamps, a shock each, all going the way he faces
  const q = ib('act', 'quakeStride');
  general.moves.quakeStride.onAct!(q, ctx);
  for (const t of [0.25, 0.75, 1.25, 1.7]) general.moves.quakeStride.tick!(q, ctx, 1 / 60, t);
  assert.equal(made.filter((h) => h.kind === 'shock').length, 4);
  assert.ok(made.every((h) => (h.vx ?? 0) > 0));
  // the combo's third swing throws a slash along the floor, once
  made.length = 0;
  const c = ib('act', 'clawCombo');
  general.moves.clawCombo.tick!(c, ctx, 1 / 60, 0.2);
  assert.equal(made.length, 0);
  general.moves.clawCombo.tick!(c, ctx, 1 / 60, 1.0);
  general.moves.clawCombo.tick!(c, ctx, 1 / 60, 1.05);
  assert.equal(made.length, 1);
});

test('the warlord slam: a column at the mark and four more either side of it, and a shock each way', () => {
  const made: { id: number; kind: string; x: number; look?: string }[] = [];
  const ctx = {
    arena: { left: 1000, right: 2800, floor }, hazards: made, shake: () => {}, thud: () => {}, debris: () => {}, text: () => {}, roar: () => {}, px: 1900, py: floor,
  } as unknown as import('./bossAI.ts').BossCtx;
  const b = ib('tell', 'warlordSlam');
  general.moves.warlordSlam.onTell!(b, ctx);
  assert.equal(made.length, 1);
  assert.equal(made[0].kind, 'mark');
  b.ai!.t = 0.3;
  ctx.px = 2000;
  general.moves.warlordSlam.tellTick!(b, ctx, 0.2);
  assert.ok(made[0].x > 1900, 'the mark follows the hero for the first part of the wind-up');
  b.ai!.t = 1.2;
  const lock = made[0].x;
  ctx.px = 1200;
  general.moves.warlordSlam.tellTick!(b, ctx, 0.2);
  assert.equal(made[0].x, lock, 'and then it stays where it is');
  general.moves.warlordSlam.onAct!(b, ctx);
  const cols = made.filter((h) => h.kind === 'column');
  assert.equal(cols.length, 5);
  assert.ok(cols.every((h) => h.look === 'lightning'));
  assert.equal(made.filter((h) => h.kind === 'shock').length, 2);
});
