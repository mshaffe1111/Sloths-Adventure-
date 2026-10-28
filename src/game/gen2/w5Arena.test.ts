/**
 * 5-9 "The Queen's Garden" on gen2 (gen2/worlds/w5Arena.ts), and World 5's two puzzle-room sections:
 *   - 5-9 built through buildGen2Stage on 20 seeds, Normal and Easy: levelCheck (and puzzleCheck through it) passes on every one, every
 *     roll is 2:00+ for the quick player, no quiet stretch over 4 s (the inspector's own dead-time measure), the animals laid well past
 *     what the goal asks, Dot's line for the shut shrine said before the first spider, the arena's arches standing in the scene;
 *   - each room on its own: the checker solves it (Normal and Easy), it fails without its key piece, it cannot be walked past (its gate or
 *     arch stands on the floor, taller than a double jump), it fits an upright phone at half scale, nothing in it can hurt;
 *   - each room played through in the real engine (realPlay.ts), upright and sideways, Normal and Easy, with no heart or life lost; and the
 *     wrong ways (standing on the plate yourself, tipping the pot from the floor, manners with the Butler) lead nowhere and cost nothing.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStage } from '../levelCheck.ts';
import { addKitPlatforms, kitPlatId, roomBox, type Anchor, type RoomSpec } from '../puzzleKit.ts';
import { KitPlay } from '../puzzlePlay.ts';
import { DOUBLE_RISE } from '../physics.ts';
import { G } from '../protoStage.ts';
import { RealPlay } from '../realPlay.ts';
import { setDifficulty } from '../difficulty.ts';
import { fastFloor, MODEL_FAST, modelStage } from '../stageTime.ts';
import { generateAllLevels } from '../worldsData.ts';
import { findRoute } from '../../../tools/inspect/route.ts';
import { findBeats, sampleRoute } from '../../../tools/inspect/beats.ts';
import { deadTime, EASY_GAP, NORMAL_GAP } from '../../../tools/inspect/analyze.ts';
import type { GeneratedStage } from '../stageGenerator.ts';
import type { Gen2Stage } from './types.ts';
import type { Difficulty } from '../difficulty.ts';
import type { LevelConfig, Platform } from '../types.ts';
import { buildGen2Stage, checkStage, layLocal, placeRoom, planBudget, rngFor } from './pipeline.ts';
import type { SectionTemplate } from './types.ts';
import { W5_MANIFEST } from './worlds/w5.ts';
import { ARENA, cakeRoom, teaRoom, TEA_RISE, W5_ARENA_SECTIONS, W5_ROOM_SECTIONS, W5A_ROOM_HINTS, W5A_TIPS, w5ArenaKit } from './worlds/w5Arena.ts';

const LEVEL = generateAllLevels().find((l) => l.id === '5-9')!;
/** 5-9's own config: the gauntlet's designed goal (worldsData: 26), which the pipeline's top-up lays for; Easy is held to easyMode's 60% */
const cfg = (_d?: Difficulty): LevelConfig => ({ ...LEVEL, unlocked: true });
const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const kit = w5ArenaKit();
type Gen2Built = Gen2Stage;
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

// ───────────────────────────── 5-9 through the pipeline ─────────────────────────────

test("5-9 on 20 seeds, Normal and Easy: levelCheck passes, 2:00+ for the quick player, the arena's sections in it, enough spiders, both rooms in some rolls", () => {
  const rooms = new Map<string, number>();
  for (const seed of SEEDS) {
    for (const d of ['normal', 'easy'] as const) {
      const st = buildGen2Stage({ config: cfg(d), kit, seed, difficulty: d });
      const res = checkStage(st, st.gen2.budget);
      assert.deepEqual(res.errors, [], `seed ${seed} ${d}: ${res.errors.join('; ')}`);
      assert.equal(st.config.targetCount, LEVEL.targetCount, 'the designed goal stays');
      const fast = modelStage(st, MODEL_FAST).total;
      assert.ok(fast >= 120 && fast >= fastFloor(5, 9, 'gauntlet'), `seed ${seed} ${d}: ${fast.toFixed(0)} s for the quick player`);
      assert.ok(st.gen2.sections.filter((s) => s.template.startsWith('w5a-')).length >= 6, `seed ${seed} ${d}: few arena sections`);
      // (the goal, Normal's 26 or Easy's 60% of it, with a margin, all before the shrine)
      const before = st.enemies.filter((e) => e.x < st.exitTotemX).length;
      assert.ok(before >= st.gen2.budget.quota.check + (d === 'normal' ? 2 : 0), `seed ${seed} ${d}: ${before} animals before the shrine`);
      if (d === 'normal') for (const r of st.kit?.rooms ?? []) rooms.set(r.id.replace(/^s\d+-/, ''), (rooms.get(r.id.replace(/^s\d+-/, '')) ?? 0) + 1);
      // (a puzzle moment, not a puzzle stage: one room a roll at most, STAGE-RULES §3)
      assert.ok((st.kit?.rooms ?? []).length <= 1, `seed ${seed} ${d}: ${(st.kit?.rooms ?? []).length} rooms`);
    }
  }
  // (the rooms come through the pipeline itself, placed on the stitched pieces and proven by levelCheck above)
  assert.ok((rooms.get('cake') ?? 0) >= 1 && (rooms.get('tea') ?? 0) >= 1, JSON.stringify([...rooms]));
});

/**
 * the quiet stretches of a stage's route (the inspector's own route, beats and dead time), each split at the stumps standing on a bank
 * along it: in the game a stump is a hop, but the check's graph walks the bank under it, so the inspector does not count it (reported)
 */
function quietStretches(st: Gen2Built, d: Difficulty): Array<{ sec: number; x0: number; x1: number }> {
  const route = findRoute(st, []);
  assert.equal(route.traced, 'check', `${st.gen2.seed} ${d}: the route is the check's own`);
  const samples = sampleRoute(route);
  const br = findBeats(st, route, samples);
  const dead = deadTime(br.beats, br.total, d === 'easy' ? EASY_GAP : NORMAL_GAP, samples);
  const P = st.platforms;
  const stumps = P.filter((p) => P.some((q) => q !== p && Math.abs(q.y - (p.y + p.height)) < 2 && q.x <= p.x && p.x + p.width <= q.x + q.width)).map((p) => p.x);
  return dead.list.flatMap((q) => {
    const xs = [q.x0, ...stumps.filter((x) => x > q.x0 && x < q.x1).sort((m, n) => m - n), q.x1];
    return xs.slice(1).map((x, i) => ({ sec: (q.sec * (x - xs[i])) / Math.max(1, q.x1 - q.x0), x0: xs[i], x1: x }));
  });
}

test("5-9: no quiet stretch over 4 s in the arena's own sections on any roll, rests aside (the inspector's dead time)", () => {
  let worst = 0;
  for (const seed of SEEDS) {
    for (const d of ['normal', 'easy'] as const) {
      const st = buildGen2Stage({ config: cfg(d), kit, seed, difficulty: d });
      // (a deliberate rest may be quiet, STAGE-RULES §2: the rests and the walk to the shrine, as the pipeline's barren report; and the
      // stretches that run into World 5's own sections are theirs, measured in the report)
      const over = (q: { x0: number; x1: number }) => st.gen2.sections.filter((s) => Math.min(q.x1, s.x1) > Math.max(q.x0, s.x0));
      for (const q of quietStretches(st, d)) {
        const secs = over(q);
        if (!secs.length || secs.some((s) => !s.template.startsWith('w5a-') || s.phase === 'start' || s.phase === 'rest' || s.phase === 'goal')) continue;
        worst = Math.max(worst, q.sec);
        assert.ok(q.sec <= 4, `seed ${seed} ${d}: ${q.sec.toFixed(1)} s quiet at x ${Math.round(q.x0)} (${secs.map((s) => s.template).join(', ')})`);
      }
    }
  }
  assert.ok(worst > 0, 'measured something');
});

test('5-9: Dot explains the shut shrine once, before the first spider when the garden gate starts the stage (nearly always); the arches stand in the scene; Easy and Normal are the same stage', () => {
  let gate = 0;
  let shared = 0;
  for (const seed of SEEDS) {
    const n = buildGen2Stage({ config: cfg('normal'), kit, seed, difficulty: 'normal' });
    const e = buildGen2Stage({ config: cfg('easy'), kit, seed, difficulty: 'easy' });
    const lines = n.proto.hints.filter((h) => h.text === W5A_TIPS[ARENA]);
    assert.equal(lines.length, 1, `seed ${seed}: the shrine's line, once`);
    // (World 5's own garden starts are 'any' and may open a roll: then the line comes with the first arena section, and the engine still
    // explains the sealed shrine at its door, engine.ts goalLine 'sealed')
    if (n.gen2.sections[0].template === 'w5a-gate-in') {
      gate++;
      const first = Math.min(...n.enemies.map((x) => x.patrolMinX));
      assert.ok(lines[0].x < first, `seed ${seed}: the line at ${lines[0].x}, the first spider at ${first}`);
    }
    const arches = (n.proto.w5?.decor ?? []).filter((d) => d.n.startsWith('arch'));
    assert.ok(arches.length >= 1, `seed ${seed}: no arch`);
    assert.equal(n.proto.w5?.mood, 'twilight');
    // (Easy lays Normal's plan built from the same request: here Easy's own quota)
    // (when Normal's plan laid by Easy's rules falls under the quick player's floor, Easy plans its own: the pipeline's fallback, still a
    // checked 2:00+ stage. Easy keeps fewer spiders and each is two of the quick player's seconds, so a Normal roll near the bottom of its
    // clock can do that: it must stay rare)
    const same = buildGen2Stage({ config: cfg('easy'), kit, seed, difficulty: 'normal' });
    if (e.gen2.sections.map((s) => s.template).join() === same.gen2.sections.map((s) => s.template).join()) shared++;
    assert.ok(e.enemies.length < same.enemies.length);
  }
  assert.ok(gate >= SEEDS.length * 0.85, `the garden gate opened ${gate} of ${SEEDS.length} rolls`);
  assert.ok(shared >= SEEDS.length * 0.9, `Easy laid Normal's plan on ${shared} of ${SEEDS.length} rolls`);
});

test("the arena's sections: every beat is ground the route crosses, each ends level with where it began, Dot's lines are short", () => {
  for (const t of [...W5_ARENA_SECTIONS, ...W5_ROOM_SECTIONS]) {
    assert.ok(!t.pieces.some((p) => p.place.kind === 'on'), `${t.id}: a stump on a bank is no beat to the route (the check walks under it)`);
    for (const d of ['normal', 'easy'] as const) {
      const L = layLocal(t, planBudget(cfg(d), W5_MANIFEST, d), rngFor(3), false);
      assert.equal(L.exit.y, t.exitDy, `${t.id} ${d}: ends ${L.exit.y} px from where it began`);
    }
    assert.ok(t.archetypes !== 'any' && t.archetypes.every((a) => a === 'gauntlet'), `${t.id}: 5-9's own (W5_ROOM_STAGES)`);
  }
  for (const line of Object.values(W5A_TIPS)) assert.ok(words(line) < 10, line);
  for (const r of [cakeRoom, teaRoom]) for (const l of Object.values(r.room!.tips ?? {})) assert.ok(words(String(l)) < 10, String(l));
  for (const [id, steps] of Object.entries(W5A_ROOM_HINTS)) for (const h of steps) assert.ok(words(h) < 10, `${id}: ${h}`);
});

// ───────────────────────────── each room on its own ─────────────────────────────

const RUNWAY = 700;
/**
 * A stage of one room section between two plain banks: the section laid by the pipeline's own layLocal, its room placed by placeRoom.
 */
function roomStage(tpl: SectionTemplate, d: Difficulty, keep: (p: RoomSpec['pieces'][number]) => boolean = () => true): GeneratedStage & { room: RoomSpec } {
  const L = layLocal(tpl, planBudget(cfg(d), W5_MANIFEST, d), rngFor(1), false);
  const base = G + 400;
  const plats: Platform[] = [{ id: 1, x: 0, y: G, width: RUNWAY, height: base - G, type: 'solid', style: 'log' }];
  const ids = new Map<string, number>();
  for (const lp of L.pieces) {
    const id = plats.length + 1;
    ids.set(lp.key, id);
    plats.push({ id, x: RUNWAY + lp.x, y: G + lp.y, width: lp.w, height: base - (G + lp.y), type: 'solid', style: 'log' });
  }
  const end: Platform = { id: plats.length + 1, x: RUNWAY + L.exit.x, y: G + L.exit.y, width: 600, height: base - (G + L.exit.y), type: 'solid', style: 'log' };
  plats.push(end);
  const idOf = (k: string) => ids.get(k)!;
  const room = placeRoom(tpl.room!, 's1', idOf);
  room.pieces = room.pieces.filter(keep);
  addKitPlatforms(plats, { rooms: [room] });
  const exitX = end.x + 300;
  return {
    config: { ...cfg(d), objectiveType: 'sprint', targetCount: 1, levelWidth: end.x + 640, levelHeight: base + 100 },
    trees: [], platforms: plats, vines: [], ropes: [], enemies: [], boss: null,
    collectibles: [{ id: 1, type: 'exit_totem', x: exitX, y: end.y - 30, collected: false, bobPhase: 0 }],
    spawnX: 140, spawnY: G, exitTotemX: exitX, exitTotemY: end.y, checkpoints: [], kit: { rooms: [room] }, room,
  } as unknown as GeneratedStage & { room: RoomSpec };
}

const ROOMS = [cakeRoom, teaRoom] as const;
/** each room's key pieces: without them its way on never opens */
const KEY: Record<string, string[]> = { cake: ['source', 'item'], tea: ['teapot'] };

test('the rooms: the checker solves each, Normal and Easy; each fails without its key piece', () => {
  for (const t of ROOMS) {
    for (const d of ['normal', 'easy'] as const) {
      const st = roomStage(t, d);
      assert.deepEqual(validateStage(st).errors, [], `${t.id} ${d}`);
      const bare = roomStage(t, d, (p) => !KEY[t.room!.id].includes(p.kind));
      assert.ok(validateStage(bare).errors.some((e) => e.startsWith(`room s1-${t.room!.id}:`)), `${t.id} ${d}: solved without its key`);
    }
  }
});

test('the rooms: none can be walked past (the gate and the arch stand on the floor, taller than a double jump), each fits an upright phone', () => {
  for (const t of ROOMS) {
    const st = roomStage(t, 'normal');
    const room = st.room;
    const gate = room.pieces.find((p) => p.kind === 'gate')!;
    const door = st.platforms.find((p) => p.id === kitPlatId(0, gate.id, 0))!;
    const wall = st.platforms.find((p) => p.id === kitPlatId(0, gate.id, 1))!;
    const floor = st.platforms.find((p) => p.id === (gate as { at: Anchor }).at.on)!;
    assert.equal(door.y + door.height, floor.y, `${t.id}: the door reaches the floor`);
    // (the highest ground before it he can stand on unaided is the floor: the wall's top is out of a double jump's reach)
    assert.ok(floor.y - wall.y > DOUBLE_RISE + 20, `${t.id}: the wall is ${floor.y - wall.y} px over the floor`);
    // upright at half scale (a 360 px wide phone, puzzleCamera.ts roomFloor 0.50) the whole room is in view
    const b = roomBox(room, st.platforms);
    assert.ok(b.x1 - b.x0 <= 720 && b.y1 - b.y0 <= 844 / 0.5, `${t.id}: ${b.x1 - b.x0} x ${b.y1 - b.y0}`);
    assert.ok(room.pieces.some((p) => p.kind === 'reset'), `${t.id}: a reset post`);
    // nothing hurts: no creature socket, no pit beside it (the pipeline keeps a room's join quiet), its floors solid
    assert.ok(!t.sockets.some((s) => s.role === 'enemy') && t.maxPerStage === 1 && !t.mirrorable);
  }
  // the tea room's arch: from the lift left down it is out of reach too; from the lift risen, it is a step across
  const st = roomStage(teaRoom, 'normal');
  const lift = st.platforms.find((p) => p.id === kitPlatId(0, 's1-lift', 0))!;
  const wall = st.platforms.find((p) => p.id === kitPlatId(0, 's1-butler', 1))!;
  assert.ok(lift.y - wall.y > DOUBLE_RISE + 20);
  assert.equal(lift.y - TEA_RISE, wall.y, 'risen, the plank is level with the top of the arch');
});

// ───────────────────────────── each room in the real engine ─────────────────────────────

/** the real engine on this room's stage, on a screen this size (css px), on this difficulty */
function play(t: SectionTemplate, d: Difficulty, w: number, h: number): { sim: RealPlay; kit: KitPlay; st: ReturnType<typeof roomStage> } {
  setDifficulty(d);
  const st = roomStage(t, d);
  const sim = new RealPlay('kit', 1);
  sim.bare(st.platforms);
  const e = sim.e;
  const kp = new KitPlay(st.kit!, st.platforms, { world: 5, stage: 9, vines: e.vines, collectibles: e.collectibles });
  Object.assign(e, { kit: kp, enemies: [], w5: null });
  e.currentStage.kit = st.kit;
  e.viewCssW = w;
  e.viewCssH = h;
  e.introT = 99;
  e.applyZoom();
  sim.safe = false;
  sim.stand(RUNWAY - 120, G);
  sim.frame();
  return { sim, kit: kp, st };
}
const walkTo = (sim: RealPlay, x: number, tol = 8) => {
  for (let i = 0; i < 600 && Math.abs(sim.p.x - x) > tol; i++) sim.frame(sim.p.x < x ? { right: true } : { left: true });
  sim.frame();
};
const face = (sim: RealPlay, dir: 1 | -1) => {
  sim.frame(dir > 0 ? { right: true } : { left: true });
  sim.frame();
};
const at = (st: ReturnType<typeof roomStage>, id: string) => {
  const pc = st.room.pieces.find((p) => p.id === `s1-${id}`) as { at: Anchor };
  const pl = st.platforms.find((p) => p.id === pc.at.on)!;
  return pl.x + pc.at.at * pl.width + (pc.at.dx ?? 0);
};

const SCREENS = [['sideways', 844, 390], ['upright', 390, 844]] as const;

for (const d of ['normal', 'easy'] as const) {
  for (const [name, w, h] of SCREENS) {
    test(`the cake room in the real engine (${d}, ${name}): the dozer shows what a cake does; a cake on the plate, the beetle asleep on it, through the gate`, () => {
      const { sim, kit, st } = play(cakeRoom, d, w, h);
      const lives = sim.e.lives;
      const hp = sim.p.hp;
      const r = kit.rooms[0];
      const [dozer, beetle] = r.beetles;
      const gate = r.gates[0];
      // the dozer by the door eats its crumb and falls asleep as he comes in
      walkTo(sim, at(st, 'dozer') - 150);
      for (let i = 0; i < 30 * 6 && dozer.st.mode !== 'sleep'; i++) sim.frame();
      assert.equal(dozer.st.mode, 'sleep', 'the dozer ate the crumb and slept');
      // standing on the plate himself, the gate opens; it shuts again before he gets to it
      walkTo(sim, at(st, 'plate'), 6);
      sim.wait(0.3);
      assert.equal(gate.open, true, 'his own weight opens it');
      walkTo(sim, at(st, 'gate') + 60);
      assert.ok(sim.p.x < at(st, 'gate'), `the gate shut in front of him (${sim.p.x.toFixed(0)})`);
      // the cake from the stool onto the plate
      walkTo(sim, at(st, 'stool') - 40);
      face(sim, 1);
      sim.frame({ punch: true });
      assert.ok(kit.holding, 'a tap by the stool picks a cake up');
      walkTo(sim, at(st, 'plate') - 50);
      face(sim, 1);
      sim.frame({ punch: true });
      sim.wait(0.5);
      assert.ok(!kit.holding);
      walkTo(sim, at(st, 'plate') - 200);
      for (let i = 0; i < 30 * 10 && beetle.st.mode !== 'sleep'; i++) sim.frame();
      assert.equal(beetle.st.mode, 'sleep', 'the beetle ate it and fell asleep');
      assert.equal(r.plates[0].down, true, 'asleep on the plate');
      assert.equal(gate.open, true);
      walkTo(sim, at(st, 'gate') + 120);
      assert.ok(sim.p.x > at(st, 'gate') + 100, `through the gate (${sim.p.x.toFixed(0)})`);
      assert.equal(sim.e.lives, lives);
      assert.equal(sim.p.hp, hp);
      setDifficulty('normal');
    });

    test(`the tea room in the real engine (${d}, ${name}): manners get nothing; tipped from the floor the lift goes up alone; tipped from the lift, up and over the arch`, () => {
      const { sim, kit, st } = play(teaRoom, d, w, h);
      const lives = sim.e.lives;
      const hp = sim.p.hp;
      const r = kit.rooms[0];
      const butler = r.gates[0];
      const lift = r.lifts[0];
      const pot = r.teapots[0];
      const floor2 = st.platforms.find((p) => p.id === (st.room.beyond.on))!;
      // the arch: he cannot jump it from the floor, double jump and all
      walkTo(sim, butler.wall.x - 140);
      for (let k = 0; k < 3; k++) {
        sim.frame({ right: true, press: true });
        for (let i = 0; i < 8; i++) sim.frame({ right: true, jump: true });
        sim.frame({ right: true, press: true });
        for (let i = 0; i < 20; i++) sim.frame({ right: true, jump: true });
      }
      sim.wait(1);
      assert.ok(sim.p.x < butler.wall.x, `the arch is shut to him (${sim.p.x.toFixed(0)})`);
      // tipped from the floor, the lift goes up without him; the post sets the table again
      walkTo(sim, pot.x - 50);
      face(sim, 1);
      sim.frame({ punch: true });
      assert.ok(pot.tipped, 'tipped');
      sim.wait(4);
      assert.ok(lift.level > 0.99 && Math.abs(sim.p.y - G) < 2, 'up, and he is not on it');
      walkTo(sim, r.resets[0].x + 40);
      face(sim, -1);
      sim.frame({ punch: true });
      sim.wait(4);
      assert.ok(!pot.tipped && lift.level < 0.01, 'the table set again, the lift down');
      // onto the plank, tip the pot from there: the tea fills the basket and the lift takes him up level with the arch's top
      walkTo(sim, lift.plat.x + 20, 6);
      face(sim, -1);
      sim.frame({ punch: true });
      assert.ok(pot.tipped, 'tipped from the plank');
      sim.wait(4.5);
      assert.ok(sim.p.y < G - TEA_RISE + 10, `up with the lift (${sim.p.y.toFixed(0)})`);
      walkTo(sim, floor2.x + 200);
      sim.wait(0.5);
      assert.ok(sim.p.grounded && sim.p.x > butler.wall.x + 100 && Math.abs(sim.p.y - floor2.y) < 2, `over the arch (${sim.p.x.toFixed(0)}, ${sim.p.y.toFixed(0)})`);
      assert.equal(sim.e.lives, lives);
      assert.equal(sim.p.hp, hp);
      setDifficulty('normal');
    });
  }
}
