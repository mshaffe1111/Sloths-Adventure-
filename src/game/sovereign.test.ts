import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { BossEntity } from './types.ts';
import { bossDefFor } from './bossDefs.ts';
import { bodyHurts, hazardBox, newBrain, stepBoss, stepHazards, weakOpen, weakRect } from './bossAI.ts';
import type { BossCtx, BossHazard } from './bossAI.ts';
import { GUST, PILLAR, SCREECH, fadeShove, gustPush, inCover, makePillars, pillarFor, rockShower, screechShove, slamPillar, standing, type SkyPillar } from './sovereignFight.ts';
import { SCREECH_FRAMES, screechFrame } from './sovereignSprite.ts';
import { SOVEREIGN_FRAMES } from './sovereignAtlasData.ts';
import { generateStage } from './stageGenerator.ts';
import { generateAllLevels } from './worldsData.ts';
import { validateStage } from './levelCheck.ts';
import { PHYS, SAFE } from './physics.ts';
import { DIVE_LOCK, RAKE_COMMIT, SKY_CLIMB, SKY_LOW, SWEEP_PAST, screechLanding } from './bossDefs.ts';
import { heroReach, openingNeeds, type ReachGoal, type Rock } from './sovereignReach.ts';
import { HUD_SHARE, SKY_TOP, bossViewWidth, bossViewX } from './bossCamera.ts';

const sov = bossDefFor(4);
const ARENA = { left: 760, right: 2260, floor: 560 };
const FLOOR = ARENA.floor;
const DT = 1 / 30;

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeBoss(x = ARENA.left + (sov.startDx ?? 1030)): BossEntity {
  return {
    id: 1, type: 'boss', x, y: FLOOR - sov.h / 2, vx: 0, vy: 0, width: sov.w, height: sov.h, hp: sov.hp!, maxHp: sov.hp!,
    facing: -1, patrolMinX: ARENA.left, patrolMaxX: ARENA.right, attackCooldown: 0, telegraphTimer: 0, isAttacking: false,
    animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, phase: 1, phaseMax: 3,
    specialAttackTimer: 0, shieldActive: false, dialogueIntro: '', ai: newBrain(),
  };
}

function makeCtx(px: number, pillars: SkyPillar[] | undefined, rnd = seeded(11)) {
  const log = { texts: [] as string[], lines: [] as string[], slams: 0, breaks: 0 };
  const said = new Set<string>();
  const ctx: BossCtx = {
    px, py: FLOOR, pGrounded: true, pDucking: false, arena: ARENA, rnd, hazards: [], minionsAlive: 0,
    spawnMinion: () => {}, shake: () => {}, roar: () => {}, thud: () => {}, debris: () => {},
    text: (m) => { log.texts.push(m); },
    pillars,
    onPillar: (_p, broke) => { log.slams++; if (broke) log.breaks++; },
    guide: (key, line) => {
      if (said.has(key)) return false;
      said.add(key);
      log.lines.push(line);
      return true;
    },
  };
  return { ctx, log };
}

const noEv = { land: () => {} };

/** run the boss (and its hazards) until `until` holds or the time runs out; the player stands still at ctx.px */
function runUntil(b: BossEntity, c: BossCtx, until: () => boolean, secs = 30): boolean {
  for (let i = 0; i < secs * 30; i++) {
    stepBoss(b, sov, c, DT);
    stepHazards(c.hazards, c.arena, DT, noEv);
    if (until()) return true;
  }
  return false;
}

// ───────────────────────────── the moves ─────────────────────────────

test('every one of her moves warns for at least 0.8 s, and Dot has a line for the first time each one comes', () => {
  const names = Object.keys(sov.moves);
  for (const n of ['diveBomb', 'featherVolley', 'talonRake', 'screech', 'skySweep', 'snatch', 'wingGust']) assert.ok(names.includes(n), n);
  for (const n of names) {
    const m = sov.moves[n];
    assert.ok(m.tell >= 0.8, `${n} warns for ${m.tell} s`);
    assert.ok(m.guide && m.guide.length < 90, `${n}: Dot says one short line`);
  }
  // the dive (with the rocks) is the first thing she does, so the lure is the first thing taught
  assert.equal(sov.opener, 'diveBomb');
  const b = makeBoss();
  const { ctx, log } = makeCtx(ARENA.left + 300, makePillars(ARENA.left));
  assert.ok(runUntil(b, ctx, () => b.ai!.state === 'tell'));
  assert.equal(b.ai!.move, 'diveBomb');
  assert.equal(log.lines[0], sov.moves.diveBomb.guide);
});

test('the screech pose: two frames named in one place, and the open-beak stand-in until they are painted', () => {
  assert.ok(SOVEREIGN_FRAMES[SCREECH_FRAMES.fallback], 'the stand-in is in the atlas');
  for (const perched of [true, false]) {
    const n = screechFrame(perched);
    assert.ok(SOVEREIGN_FRAMES[n], `${n} is a frame she has`);
    if (!SOVEREIGN_FRAMES[perched ? SCREECH_FRAMES.perch : SCREECH_FRAMES.air]) assert.equal(n, SCREECH_FRAMES.fallback);
  }
});

// ───────────────────────────── the pillars ─────────────────────────────

test('the stage builds the three rock pillars where the fight expects them, and every ledge and rock top can be reached', () => {
  const stage = generateStage(generateAllLevels().find((l) => l.id === '4-10')!);
  const a = stage.arena!;
  const ps = makePillars(a.left);
  const plats = stage.platforms.filter((p) => p.pillar !== undefined).sort((x, y) => x.pillar! - y.pillar!);
  assert.equal(plats.length, PILLAR.at.length);
  plats.forEach((p, i) => {
    assert.equal(p.x + p.width / 2, ps[i].x);
    assert.equal(a.floor - p.y, PILLAR.h);
    assert.ok(p.type === 'solid' && p.height >= 50, 'a rock is a wall with a top');
  });
  // she starts clear of every rock, inside the fence
  const bx = stage.boss!.x;
  for (const p of ps) assert.ok(Math.abs(p.x - bx) >= sov.w / 2 + p.w / 2, 'her wings clear the rocks at the start');
  assert.ok(bx + sov.w / 2 <= a.right && bx - sov.w / 2 >= a.left);
  // the storm (170 from each fence) never covers a rock
  for (const p of ps) assert.ok(p.x - p.w / 2 > a.left + 170 && p.x + p.w / 2 < a.right - 170);
  assert.equal(validateStage(stage).ok, true);
  // the high ledge can be reached from a rock top, and still from its stump when the rock is gone
  const ledge = sov.perches![0];
  const near = ps.reduce((m, p) => (Math.abs(p.x - (a.left + ledge.dx)) < Math.abs(m.x - (a.left + ledge.dx)) ? p : m));
  const gap = Math.max(0, a.left + ledge.dx - (near.x + near.w / 2));
  for (const h of [PILLAR.h, PILLAR.stump]) {
    const rise = ledge.up - h;
    assert.ok((rise <= SAFE.rise1 && gap <= SAFE.gap1) || (rise <= SAFE.rise2 && gap <= SAFE.gap2 * 0.7), `ledge from a ${h} rock: rise ${rise}, gap ${gap}`);
  }
  assert.ok(PILLAR.h <= SAFE.rise2, 'a rock top is a double jump from the floor');
});

test('a pillar cracks on the first slam and breaks on the second, leaving a stump and a shower of stones that warns first', () => {
  const p = makePillars(ARENA.left)[0];
  assert.equal(slamPillar(p), false);
  assert.equal(p.cracks, 1);
  assert.equal(p.broken, false);
  assert.equal(slamPillar(p), true);
  assert.equal(p.broken, true);
  assert.equal(p.h, PILLAR.stump);
  assert.equal(slamPillar(p), false, 'a broken rock takes no more');
  const rocks = rockShower(p, 1, ARENA, 1);
  assert.ok(rocks.length >= 2);
  // they fall on the far side from her (she lies on +1)
  for (const r of rocks) assert.ok(r.x < p.x && r.warn >= 0.8);
});

/** stand by the rock, let the mark lock on him, step off it: returns what happened */
function lure(b: BossEntity, c: BossCtx, p: SkyPillar, side: -1 | 1) {
  // wait for a dive
  c.px = p.x + side * 60;
  assert.ok(runUntil(b, c, () => b.ai!.state === 'tell' && b.ai!.move === 'diveBomb', 60), 'she dives');
  let stepped = false;
  let hurt = false;
  const ok = runUntil(b, c, () => {
    const br = b.ai!;
    if (br.state === 'tell' && br.t > 0.75 && !stepped) {
      stepped = true;
      // off the mark, away from the rock
      c.px = p.x + side * 230;
    }
    const box = { x: c.px - 13, y: FLOOR - 38, w: 26, h: 38 };
    const hits = (r: { x: number; y: number; w: number; h: number } | null) => !!r && r.x < box.x + box.w && r.x + r.w > box.x && r.y < box.y + box.h && r.y + r.h > box.y;
    if (br.hurt.some(hits) || (bodyHurts(b) && hits({ x: b.x - b.width / 2, y: b.y - b.height / 2, w: b.width, h: b.height })) || c.hazards.some((h) => hits(hazardBox(h)))) hurt = true;
    return br.state !== 'tell' && br.state !== 'act';
  }, 10);
  return { ok, hurt, state: b.ai!.state };
}

test('lured into a rock: she slams into it, is stunned with her head open, and the rock cracks; the second slam breaks it', () => {
  const ps = makePillars(ARENA.left);
  const b = makeBoss();
  const { ctx, log } = makeCtx(ps[1].x - 60, ps);
  const first = lure(b, ctx, ps[1], -1);
  assert.ok(first.ok);
  assert.equal(first.state, 'stun', 'a slam leaves her stunned');
  assert.equal(first.hurt, false, 'stepping off the mark in time is safe');
  for (let i = 0; i < 15; i++) stepBoss(b, sov, ctx, DT);
  assert.equal(ps[1].cracks, 1);
  assert.equal(log.slams, 1);
  assert.ok(weakOpen(b, sov), 'her head is open');
  const w = weakRect(b, sov, FLOOR)!;
  // she lies beside the rock, her head toward it, with room between for him to stand and punch
  assert.ok(Math.abs(b.x - (ps[1].x - PILLAR.rest)) < 30, `she rests beside the rock (${Math.round(b.x)})`);
  assert.equal(b.facing, 1);
  assert.ok(w.x + w.w < ps[1].x - ps[1].w / 2 + 10, 'her head is clear of the rock');
  assert.ok(FLOOR - (w.y + w.h) < 60, 'her head is low enough to punch from the floor');
  assert.ok(log.lines.some((l) => /hit the rock/i.test(l)), 'Dot says what to do the first time');
  // wait out the stun, then the same again
  assert.ok(runUntil(b, ctx, () => b.ai!.state === 'idle'));
  const second = lure(b, ctx, ps[1], -1);
  assert.equal(second.state, 'stun');
  assert.equal(ps[1].broken, true, 'two slams break it');
  assert.equal(log.breaks, 1);
  assert.ok(b.ai!.hold >= PILLAR.stunBreak - 0.01, 'longer, so the stones fall first');
  const stones = ctx.hazards.filter((h) => h.kind === 'drop' && h.look === 'rock');
  assert.ok(stones.length >= 2 && stones.every((h) => h.warn >= 0.8), 'a shower of stones, with grit warning first');
});

test('while a rock stands, a dive on open floor only pulls up; with every rock down it crashes (there is always a way in)', () => {
  const ps = makePillars(ARENA.left);
  const b = makeBoss();
  // far from every rock
  const { ctx } = makeCtx(ARENA.left + 80, ps);
  assert.ok(runUntil(b, ctx, () => b.ai!.state === 'act' && b.ai!.move === 'diveBomb', 60));
  ctx.px = ARENA.left + 300 + 260; // step off the mark (away from rock A, onto open floor)
  assert.ok(runUntil(b, ctx, () => b.ai!.state === 'rec' || b.ai!.state === 'stun'));
  assert.equal(b.ai!.state, 'rec', 'a miss on open floor pulls up');
  assert.equal(weakOpen(b, sov), false, 'and leaves nothing open');
  // every rock down: now the floor crash stuns her, as it always did
  for (const p of ps) {
    slamPillar(p);
    slamPillar(p);
  }
  assert.equal(standing(ps).length, 0);
  const b2 = makeBoss();
  const { ctx: c2 } = makeCtx(ARENA.left + 80, ps);
  assert.ok(runUntil(b2, c2, () => b2.ai!.state === 'act' && b2.ai!.move === 'diveBomb', 60));
  c2.px += 260;
  assert.ok(runUntil(b2, c2, () => b2.ai!.state === 'rec' || b2.ai!.state === 'stun'));
  assert.equal(b2.ai!.state, 'stun', 'with no rocks left, she crashes');
  assert.ok(weakOpen(b2, sov));
  // and a stump is never slammed
  assert.equal(pillarFor(ps, ps[0].x), null);
});

// ───────────────────────────── the screech and the gust ─────────────────────────────

test('the screech shoves him hard away; behind a rock he is in cover, crouched he is pushed much less, on a rock top he is not safe', () => {
  const ps = makePillars(ARENA.left);
  const p = ps[1];
  const src = p.x + 400;
  const dir = -1 as const;
  const open = screechShove({ ps, srcX: src, dir, px: p.x + 250, bodyTop: FLOOR - 38, floor: FLOOR, ducking: false, grounded: true });
  assert.equal(open, -SCREECH.push, 'in the open he is shoved hard, away from her');
  const ducked = screechShove({ ps, srcX: src, dir, px: p.x + 250, bodyTop: FLOOR - 24, floor: FLOOR, ducking: true, grounded: true });
  assert.ok(Math.abs(ducked) < Math.abs(open) * 0.5 && ducked !== 0, 'crouched, much less');
  const behind = screechShove({ ps, srcX: src, dir, px: p.x - 70, bodyTop: FLOOR - 38, floor: FLOOR, ducking: false, grounded: true });
  assert.equal(behind, 0, 'behind the rock he is in cover');
  const onTop = screechShove({ ps, srcX: src, dir, px: p.x, bodyTop: FLOOR - PILLAR.h - 38, floor: FLOOR, ducking: false, grounded: true });
  assert.notEqual(onTop, 0, 'on top of the rock he is in the open');
  // cover only reaches so far behind a rock
  assert.equal(inCover(ps, src, p.x - 380, FLOOR - 38, FLOOR), false);
  // the shove fades out over about half a second: about 150 px, enough to throw him off a ledge's edge
  let v = open;
  let dist = 0;
  for (let i = 0; i < 30; i++) {
    dist += v * DT;
    v = fadeShove(v, DT);
  }
  assert.equal(v, 0);
  assert.ok(Math.abs(dist) > 120 && Math.abs(dist) < 220, `shoved ${Math.round(dist)} px`);
});

test('the screech in a fight: she rears back for a second, then a wave rolls out of her beak the way she faces', () => {
  const ps = makePillars(ARENA.left);
  const b = makeBoss();
  const { ctx } = makeCtx(ARENA.left + 1350, ps);
  // past the opener, until she screeches
  let tellAt = -1;
  let t = 0;
  let wave: BossHazard | undefined;
  assert.ok(runUntil(b, ctx, () => {
    t += DT;
    if (b.ai!.move === 'screech' && b.ai!.state === 'tell' && tellAt < 0) tellAt = t;
    wave = ctx.hazards.find((h) => h.kind === 'push' && h.look === 'screech');
    return !!wave;
  }, 120), 'she screeches');
  assert.ok(t - tellAt >= 0.8 - 1e-6, `the tell lasts ${(t - tellAt).toFixed(2)} s`);
  assert.equal(hazardBox(wave!), null, 'a shove, not a blow');
  const x0 = wave!.x;
  stepHazards(ctx.hazards, ctx.arena, 0.2, noEv);
  assert.equal(Math.sign(wave!.x - x0), Math.sign(wave!.dir), 'it rolls out the way she faces');
});

test('the gust blows him away from her, rock is cover, the leaf rides it further, and the storm blows harder', () => {
  const ps = makePillars(ARENA.left);
  const base = { ps, srcX: ps[2].x - 120, dir: -1 as const, phase: 2, px: ps[1].x + 150, bodyTop: FLOOR - 120, floor: FLOOR, grounded: false, gliding: false };
  const air = gustPush(base);
  assert.ok(air < 0);
  assert.ok(Math.abs(gustPush({ ...base, grounded: true, bodyTop: FLOOR - 38 })) < Math.abs(air), 'less on the ground');
  assert.ok(Math.abs(gustPush({ ...base, gliding: true })) > Math.abs(air) * 1.4, 'the leaf rides it');
  assert.ok(Math.abs(gustPush({ ...base, phase: 3 })) > Math.abs(air), 'the storm blows harder');
  assert.equal(gustPush({ ...base, px: ps[1].x - 80, bodyTop: FLOOR - 38, grounded: true }), 0, 'behind a rock');
  assert.ok(GUST.last[2] > GUST.last[0], 'and longer');
  assert.ok(sov.moves.wingGust.act >= GUST.last[2]);
});

// ───────────────────────────── openings: long enough to get to (Matt, 2026-10-26) ─────────────────────────────

/** her, at rest in a state, for measuring where an opening is */
function posed(state: 'stun' | 'rec' | 'act', x: number, facing: 1 | -1, move: string, air = 0): BossEntity {
  const b = makeBoss(x);
  b.facing = facing;
  b.ai!.state = state;
  b.ai!.move = move;
  b.ai!.air = air;
  b.ai!.d = {};
  return b;
}
const up = (r: { x: number; y: number; w: number; h: number }) => ({ x: r.x, y: FLOOR - (r.y + r.h), w: r.w, h: r.h });
const backBox = (b: BossEntity) => {
  const k = sov.stompSpot!;
  return { x: b.x + b.facing * k.dx - k.w / 2, y: b.ai!.air + k.dy - k.h / 2, w: k.w, h: k.h };
};
const rocksOf = (ps: SkyPillar[]) => ps.filter((p) => p.h > 0).map((p) => ({ x: p.x, w: p.w, h: p.h }));
/** how far the screech's shove carries him on open ground */
const shoveDist = (v0: number) => {
  let v = v0;
  let d = 0;
  while (v !== 0) {
    d += v * DT;
    v = fadeShove(v, DT);
  }
  return d;
};

interface Opening { name: string; open: number; reach: number; from: number; b: BossEntity; box: { x: number; y: number; w: number; h: number } }

let opened: Opening[] | null = null;
/** every opening of the fight, with where a player would be once he has dodged what opened it */
function openings(): Opening[] {
  if (opened) return opened;
  const out: Opening[] = [];
  const add = (name: string, open: number, from: number, b: BossEntity, goal: ReachGoal, rocks: Rock[]) => {
    out.push({ name, open, from, b, box: goal.box, reach: heroReach(from, 0, goal, rocks) });
  };
  for (const broke of [false, true]) {
    for (const side of [-1, 1] as const) {
      for (const pi of [0, 1, 2]) {
        for (const m of [0, 50, PILLAR.reach]) {
          const ps = makePillars(ARENA.left);
          const p = ps[pi];
          if (broke) slamPillar(p);
          slamPillar(p);
          const mark = p.x + side * m;
          // she lies where the slam leaves her (the same numbers skySlam uses)
          const rest = Math.max(ARENA.left + sov.w / 2, Math.min(ARENA.right - sov.w / 2, p.x + side * PILLAR.rest));
          const b = posed('stun', rest, side > 0 ? -1 : 1, 'diveBomb');
          const head = { kind: 'punch' as const, box: up(weakRect(b, sov, FLOOR)!) };
          const back = { kind: 'stomp' as const, box: backBox(b) };
          const open = broke ? PILLAR.stunBreak : PILLAR.stun;
          // he stepped off the mark, away from the rock (the way that is not a wall), or hopped over the rock to its far side
          const off = mark + side * (75 + 19 + 10);
          const over = p.x - side * (p.w / 2 + 19 + 6);
          const rocks = rocksOf(ps);
          const tag = `rock ${pi} ${broke ? 'breaking' : 'cracking'}, mark ${m} ${side > 0 ? 'right' : 'left'}`;
          for (const [how, from] of [['off the mark', off], ['behind the rock', over]] as const) {
            if (from < ARENA.left + 14 || from > ARENA.right - 14) continue;
            add(`${tag}, ${how}: her head`, open, from, b, head, rocks);
            add(`${tag}, ${how}: her back`, open, from, b, back, rocks);
          }
        }
      }
    }
  }
  // every rock down: she crashes on the mark, and her head may be facing away from him
  for (const facing of [-1, 1] as const) {
    for (const dodge of [-1, 1] as const) {
      const mark = ARENA.left + 700;
      const b = posed('stun', mark, facing, 'diveBomb');
      const from = mark + dodge * (75 + 19 + 10);
      add(`floor crash, head ${facing > 0 ? 'right' : 'left'}, he stepped ${dodge > 0 ? 'right' : 'left'}: her head`, PILLAR.crash, from, b, { kind: 'punch', box: up(weakRect(b, sov, FLOOR)!) }, []);
    }
  }
  // the screech: she screamed hovering or from a rock; he was shoved from where she likes him (prefer), shoved less crouched, or sat it
  // out behind a rock. She comes down off the rock toward him, head low
  const shove = shoveDist(SCREECH.push);
  const crouched = shoveDist(SCREECH.push * SCREECH.duck);
  for (const pi of [-1, 0, 1, 2]) {
    for (const dir of [-1, 1] as const) {
      const ps = makePillars(ARENA.left);
      const bx = pi >= 0 ? ps[pi].x : ARENA.left + 700;
      const starts: Array<[string, number]> = [
        ['shoved', bx + dir * (sov.prefer + shove)],
        ['crouched', bx + dir * (sov.prefer + crouched)],
      ];
      // (she screams only at him within 420, so a rock he can reach in the wind-up is within about 460 of her)
      for (const q of standing(ps)) if ((q.x - bx) * dir > q.w / 2 + 150 && Math.abs(q.x + dir * (q.w / 2 + 25) - bx) <= 460) starts.push(['behind a rock', q.x + dir * (q.w / 2 + 25)]);
      for (const [how, from] of starts) {
        if (from < ARENA.left + 14 || from > ARENA.right - 14) continue;
        const { ctx } = makeCtx(from, ps);
        const land = screechLanding(makeBoss(bx), ctx);
        const b = posed('rec', land, from >= land ? 1 : -1, 'screech');
        add(`screech from ${pi >= 0 ? 'rock ' + pi : 'the air'}, he is ${how} to the ${dir > 0 ? 'right' : 'left'}: her head`, sov.moves.screech.rec, from, b, { kind: 'punch', box: up(weakRect(b, sov, FLOOR)!) }, rocksOf(ps));
      }
    }
  }
  // the moves that leave her open: she is where the move left her, settled to her low hover (or on the rock under her), facing him; he
  // is where dodging it leaves him. With the rocks whole and with every rock a stump
  const lowAt = (ps: SkyPillar[], x: number) => Math.max(SKY_LOW, ...standing(ps).filter((p) => Math.abs(x - p.x) < p.w / 2 + 70).map((p) => p.h));
  const gustPushed = GUST.force[2] * GUST.ground * GUST.last[2];
  for (const broke of [false, true]) {
    const ps = makePillars(ARENA.left);
    if (broke) for (const p of ps) { slamPillar(p); slamPillar(p); }
    const rocks = rocksOf(ps);
    const half = sov.w / 2;
    const clampX = (x: number) => Math.max(ARENA.left + half, Math.min(ARENA.right - half, x));
    const inRock = (x: number) => ps.find((p) => Math.abs(x - p.x) < p.w / 2 + 19);
    const moveOpen = (m: string, bx: number, from: number, how: string) => {
      if (from < ARENA.left + 14 || from > ARENA.right - 14) return;
      const onRock = inRock(from);
      const fromUp = onRock ? onRock.h : 0;
      const b = posed('rec', bx, from >= bx ? 1 : -1, m, lowAt(ps, bx));
      out.push({ name: `${m}, ${broke ? 'stumps' : 'rocks whole'}, she is at ${Math.round(bx - ARENA.left)}, he ${how} at ${Math.round(from - ARENA.left)}`, open: sov.moves[m].rec, from, b, box: up(weakRect(b, sov, FLOOR)!), reach: heroReach(from, fromUp, { kind: 'punch', box: up(weakRect(b, sov, FLOOR)!) }, rocks) });
    };
    for (let bx = ARENA.left + half; bx <= ARENA.right - half; bx += 75) {
      for (const side of [-1, 1] as const) {
        // the feathers: thrown from her range, he dodged where he stood or behind a rock
        for (const d of [sov.moves.featherVolley.min!, sov.prefer, sov.moves.featherVolley.max!]) moveOpen('featherVolley', bx, bx + side * d, `dodged feathers ${d} away`);
        // the gust: from her range, and blown on along the ground for the whole of it (the strongest, longest one)
        for (const d of [sov.moves.wingGust.min!, sov.prefer, sov.moves.wingGust.max!]) moveOpen('wingGust', bx, bx + side * (d + gustPushed), `blown from ${d} away`);
        // the snatch: she ends on the mark, and he stepped off it (or ran on further)
        // (a mark by a rock slams her into it instead: that is the stun, measured above)
        if (!pillarFor(ps, bx)) for (const d of [75 + 19 + 10, 200]) moveOpen('snatch', bx, bx + side * d, `stepped ${d} off the mark`);
      }
    }
    // the sweep: over him wherever he stands, pulling up SWEEP_PAST beyond him (or at the fence)
    for (let px = ARENA.left + 40; px <= ARENA.right - 40; px += 60) {
      for (const dir of [-1, 1] as const) moveOpen('skySweep', clampX(px + dir * SWEEP_PAST), px, 'ducked under her');
    }
    // the beak lunge: from her range she lunges to a beak's reach of him (stopped short by a rock); he jumped up where he stood or
    // backed off a stride
    for (let px = ARENA.left + 40; px <= ARENA.right - 40; px += 60) {
      for (const side of [-1, 1] as const) {
        for (const d0 of [sov.moves.talonRake.min!, 400, sov.moves.talonRake.max!]) {
          const bx0 = px - side * d0;
          if (bx0 < ARENA.left + half || bx0 > ARENA.right - half) continue;
          const b = posed('act', bx0, side, 'talonRake');
          const { ctx } = makeCtx(px, ps);
          if (!sov.moves.talonRake.when!(b, ctx)) continue;
          sov.moves.talonRake.onAct!(b, ctx);
          const bx = clampX(bx0 + side * b.ai!.d.go);
          moveOpen('talonRake', bx, px, `jumped from a lunge from ${d0}`);
          moveOpen('talonRake', bx, px + side * 100, `backed off a lunge from ${d0}`);
          // (or ran back from the moment she stopped turning, through the rest of the wind-up and the lunge)
          moveOpen('talonRake', bx, px + side * Math.round(PHYS.maxRun * (sov.moves.talonRake.tell - RAKE_COMMIT + 0.36)), `ran back from a lunge from ${d0}`);
        }
      }
    }
  }
  opened = out;
  return out;
}

test('every opening stays open long enough to get there from where he dodged, see it (0.8 s) and land the hit (0.6 s)', (t) => {
  const all = openings();
  const tight = [...all].sort((a, z) => a.open - openingNeeds(a.reach) - (z.open - openingNeeds(z.reach)))[0];
  t.diagnostic(`${all.length} openings; the tightest: ${tight.name}, open ${tight.open} s for a ${tight.reach.toFixed(2)} s reach`);
  assert.ok(all.length > 50, `${all.length} openings`);
  // the measured window for each kind of opening: how long it is open, and the most any of its cases needs
  const kinds = new Map<string, { open: number; need: number; name: string }>();
  for (const o of all) {
    const k = o.name.startsWith('rock') ? 'rock slam' : o.name.split(/[ ,]/)[0];
    const w = kinds.get(k);
    if (!w || openingNeeds(o.reach) - o.open > w.need - w.open) kinds.set(k, { open: o.open, need: openingNeeds(o.reach), name: o.name });
  }
  for (const [k, w] of kinds) t.diagnostic(`${k}: open ${w.open.toFixed(2)} s, needs ${w.need.toFixed(2)} s at most (${w.name})`);
  for (const o of all) {
    assert.ok(Number.isFinite(o.reach), `${o.name}: can be reached at all`);
    assert.ok(o.open >= openingNeeds(o.reach), `${o.name}: open ${o.open} s, needs ${openingNeeds(o.reach).toFixed(2)} s (reach ${o.reach.toFixed(2)} s)`);
  }
  // the glide onto her back from a rock is one of the ways: from the top of the rock she hit, with the leaf
  const ps = makePillars(ARENA.left);
  const p = ps[1];
  const b = posed('stun', p.x - PILLAR.rest, 1, 'diveBomb');
  const leaf = heroReach(p.x, PILLAR.h, { kind: 'stomp', box: backBox(b), leaf: true }, rocksOf(ps));
  assert.ok(PILLAR.stun >= openingNeeds(leaf), `the leaf from the rock top: ${leaf.toFixed(2)} s`);
  // every move but the dive opens her up after it (a dive that pulls up on open floor leaves nothing: the rocks are the way in), and
  // every opening was measured above
  for (const m of Object.keys(sov.moves)) {
    assert.equal(weakOpen(posed('rec', 1000, 1, m), sov), m !== 'diveBomb', m);
    if (m !== 'diveBomb') assert.ok(all.some((o) => o.name.startsWith(m) || o.name.startsWith(m === 'screech' ? 'screech' : m)), `${m} measured`);
  }
  // each opening glows only after a wind-up he can see coming (0.8 s or more)
  for (const m of Object.keys(sov.moves)) assert.ok(sov.moves[m].tell >= 0.8, `${m} warns first`);
});

test('the camera shows her, the opening and Pokey, in portrait (400x720) and landscape (844x390)', () => {
  const all = openings();
  const fa = sov.floorAt ?? 0.7;
  for (const [w, h] of [[400, 720], [844, 390]]) {
    for (const o of all) {
      const vw = bossViewWidth({ w, h, levelH: 900, px: o.from, bx: o.b.x, bw: sov.w, bh: sov.h, air: o.b.ai!.air, arenaW: ARENA.right - ARENA.left, frameAir: sov.frameAir, floorAt: fa, worldViewH: 540, portraitViewW: 440 });
      const vh = (vw * h) / w;
      const x0 = bossViewX(o.from, o.b.x, vw);
      const x1 = x0 + vw;
      // height above the floor the screen shows under the bar at its top
      const shown = vh * (fa - HUD_SHARE);
      const tag = `${w}x${h} ${o.name}`;
      assert.ok(o.from - 20 >= x0 && o.from + 20 <= x1, `${tag}: Pokey in view`);
      assert.ok(o.box.x >= x0 - 1 && o.box.x + o.box.w <= x1 + 1, `${tag}: the opening in view (${Math.round(o.box.x)}..${Math.round(o.box.x + o.box.w)} vs ${Math.round(x0)}..${Math.round(x1)})`);
      assert.ok(o.box.y + o.box.h <= shown, `${tag}: the opening under the bar`);
      assert.ok(o.b.x >= x0 && o.b.x <= x1, `${tag}: her body in view`);
    }
  }
});

test('the camera keeps her under the boss bar and the hearts at the top of her climb, upright and sideways, on short and long phones', () => {
  const fa = sov.floorAt ?? 0.7;
  for (const [w, h] of [[400, 720], [320, 782], [844, 390], [918, 370], [640, 320]]) {
    for (let bx = ARENA.left + 125; bx <= ARENA.right - 125; bx += 100) {
      for (const d of [-500, -150, 150, 500]) {
        const px = Math.max(ARENA.left + 20, Math.min(ARENA.right - 20, bx + d));
        const vw = bossViewWidth({ w, h, levelH: 900, px, bx, bw: sov.w, bh: sov.h, air: SKY_CLIMB, arenaW: ARENA.right - ARENA.left, frameAir: sov.frameAir, floorAt: fa, worldViewH: 540, portraitViewW: 440 });
        const vh = (vw * h) / w;
        // her painted top, wings up, under the bar
        assert.ok(SKY_CLIMB + sov.h * SKY_TOP <= vh * (fa - HUD_SHARE), `${w}x${h}: her top ${SKY_CLIMB + sov.h * SKY_TOP} vs ${Math.round(vh * (fa - HUD_SHARE))} shown`);
      }
    }
  }
});

// ───────────────────────────── a whole fight ─────────────────────────────

/**
 * A scripted hero who only ever uses the rocks and the screech: he stands by the nearest standing rock, steps off the mark `dodge` s
 * after it locks, and when she opens up he waits `react` s before moving, then `hit` s more before his first jab lands (2 hit points on a
 * stunned boss, 1 otherwise, the engine's caps applied). Easy: her warnings last 1.3 times as long and she has about two thirds the hits
 * (difficulty.ts, engine.ts). Returns how the fight went.
 */
function scriptedFight(seed: number, o: { react?: number; hit?: number; dodge?: number; easy?: boolean } = {}) {
  const react = o.react ?? 0;
  const hitT = o.hit ?? 0;
  const dodgeT = o.dodge ?? 0.3;
  const ps = makePillars(ARENA.left);
  const b = makeBoss();
  if (o.easy) {
    const per = b.maxHp / sov.hits!;
    b.maxHp = Math.round(per * Math.max(4, Math.round(sov.hits! * 0.7)));
    b.hp = b.maxHp;
  }
  const { ctx, log } = makeCtx(ARENA.left + 90, ps, seeded(seed));
  ctx.tellMul = o.easy ? 1.3 : 1;
  let t = 0;
  let hurt = 0;
  let iframes = 0;
  let punchCd = 0;
  let px = ARENA.left + 90;
  let target = px;
  let lastPillar: SkyPillar | null = null;
  let stunsOnRock = 0;
  let screechHits = 0;
  let prevState = b.ai!.state;
  let openSince = -1;
  let arrived = -1;
  while (b.hp > 0 && t < 600) {
    t += DT;
    const br = b.ai!;
    const stand = standing(ps);
    const open = weakOpen(b, sov);
    if (open && openSince < 0) openSince = t;
    if (!open) {
      openSince = -1;
      arrived = -1;
    }
    // where to be
    if (open) {
      // he sees it, then goes
      if (t - openSince >= react) {
        const w = weakRect(b, sov, FLOOR)!;
        target = w.x + w.w / 2 - b.facing * 30;
      }
    } else if (br.state === 'tell' && (br.move === 'diveBomb' || br.move === 'snatch') && br.t > DIVE_LOCK + dodgeT) {
      // step off the mark, away from the rock
      const p = lastPillar ?? stand[0];
      target = p ? p.x + Math.sign(px - p.x || -1) * 240 : px + 240 * (px < (ARENA.left + ARENA.right) / 2 ? 1 : -1);
    } else if (br.state === 'idle' || (br.state === 'tell' && br.t < DIVE_LOCK)) {
      const p = stand.sort((a, z) => Math.abs(a.x - px) - Math.abs(z.x - px))[0];
      lastPillar = p ?? null;
      // by the rock, on her side of it
      target = p ? p.x + (b.x >= p.x ? 60 : -60) : px;
    }
    const mv = Math.max(-285 * DT, Math.min(285 * DT, target - px));
    let nx = px + mv;
    // he never stands inside a rock (he jumps over one to get past it)
    for (const p of ps) {
      const half = p.w / 2 + 13;
      if (Math.abs(nx - p.x) < half && Math.abs(target - p.x) < half) nx = px < p.x ? p.x - half : p.x + half;
    }
    px = Math.max(ARENA.left + 14, Math.min(ARENA.right - 14, nx));
    ctx.px = px;
    stepBoss(b, sov, ctx, DT);
    stepHazards(ctx.hazards, ctx.arena, DT, noEv);
    if (b.ai!.state === 'stun' && prevState !== 'stun' && b.ai!.d.slam) stunsOnRock++;
    prevState = b.ai!.state;
    // what hits him
    if (iframes > 0) iframes -= DT;
    const box = { x: px - 13, y: FLOOR - 38, w: 26, h: 38 };
    const hits = (r: { x: number; y: number; w: number; h: number } | null) => !!r && r.x < box.x + box.w && r.x + r.w > box.x && r.y < box.y + box.h && r.y + r.h > box.y;
    if (iframes <= 0 && (b.ai!.hurt.some(hits) || (bodyHurts(b, sov) && hits({ x: b.x - b.width / 2, y: b.y - b.height / 2, w: b.width, h: b.height })) || ctx.hazards.some((h) => h.dmg > 0 && hits(hazardBox(h))))) {
      hurt++;
      iframes = 1.2;
    }
    // jab the opening once he is there (the first lands `hit` s after he arrives)
    punchCd -= DT;
    if (weakOpen(b, sov)) {
      const w = weakRect(b, sov, FLOOR)!;
      const reach = { x: px - 64, y: FLOOR - 54, w: 128, h: 46 };
      const there = reach.x < w.x + w.w && reach.x + reach.w > w.x && reach.y < w.y + w.h && reach.y + reach.h > w.y;
      if (there && arrived < 0) arrived = t;
      if (there && t - arrived >= hitT && punchCd <= 0) {
        punchCd = 0.4;
        const stunned = b.ai!.state === 'stun';
        const dmg = stunned ? 2 : 1;
        b.hp = Math.max(0, b.hp - dmg);
        if (stunned) {
          b.ai!.d.stunTaken = (b.ai!.d.stunTaken ?? 0) + dmg;
          if (b.ai!.d.stunTaken >= sov.stunCap!) b.ai!.t = Math.max(b.ai!.t, b.ai!.hold - 0.4);
        } else {
          screechHits++;
          b.ai!.d.taken = (b.ai!.d.taken ?? 0) + dmg;
          if (b.ai!.d.taken >= sov.openCap!) b.ai!.t = Math.max(b.ai!.t, sov.moves.screech.rec - 0.35);
        }
      }
    }
  }
  return { won: b.hp <= 0, t: Math.round(t), hurt, stunsOnRock, screechHits, broken: ps.filter((p) => p.broken).length, phase: b.phase, slams: log.slams };
}

test('a scripted fight is won using the rocks, in about two to three minutes, and never soft-locks once the rocks are gone', (t) => {
  const runs = [3, 7, 21, 42, 99].map((sd) => scriptedFight(sd));
  t.diagnostic(runs.map((r) => `${r.t} s, ${r.stunsOnRock} slams, ${r.broken} rocks broken`).join('; '));
  for (const r of runs) {
    assert.ok(r.won, `won (${JSON.stringify(r)})`);
    assert.ok(r.stunsOnRock >= 4, `the rocks did the work: ${r.stunsOnRock} slams`);
    assert.ok(r.t < 300, `took ${r.t} s`);
  }
  const avg = runs.reduce((s, r) => s + r.t, 0) / runs.length;
  // the bot is a perfect lurer who only ever hits her when she is open (and never dodges anything else). A good player lures less
  // perfectly: with the entrance and the roars, about two to three minutes
  assert.ok(avg > 60 && avg < 200, `about ${Math.round(avg)} s on average`);
});

test('a player with human reaction times (0.8 s to see an opening, 0.6 s to land the hit, 0.3 s to step off a locked mark) wins on Normal and on Easy', (t) => {
  for (const easy of [false, true]) {
    const runs = [3, 7, 21, 42, 99, 5, 8].map((sd) => scriptedFight(sd, { react: 0.8, hit: 0.6, dodge: 0.3, easy }));
    t.diagnostic(`${easy ? 'Easy' : 'Normal'}: ${runs.map((r) => r.t + ' s').join(', ')}`);
    for (const r of runs) {
      assert.ok(r.won, `${easy ? 'Easy' : 'Normal'}: won (${JSON.stringify(r)})`);
      assert.ok(r.t < 360, `${easy ? 'Easy' : 'Normal'}: took ${r.t} s`);
    }
  }
});
