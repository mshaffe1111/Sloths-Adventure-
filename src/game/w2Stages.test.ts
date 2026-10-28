import test from 'node:test';
import assert from 'node:assert/strict';
import { buildW2Stage, CAGES_23, CAGES_28, COURT_GOAL_29, FLOWER_GOAL_22, ISLAND_TOP, SNAPPER_GOAL_25, type W2Plan } from './w2Stages.ts';
import { floodLevel } from './river.ts';
import { turtleGuard } from './predatorAI.ts';
import type { Enemy } from './types.ts';
import { EXPERT_SECONDS } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';
import type { LevelConfig } from './types.ts';

const cfg = (id: W2Plan): LevelConfig =>
  ({
    worldIndex: 2, miniIndex: Number(id.split('-')[1]), id, name: id, objectiveType: id === '2-1' || id === '2-7' ? 'sprint' : id === '2-2' ? 'harvest' : id === '2-4' ? 'vine_runner' : id === '2-5' ? 'purge' : id === '2-9' ? 'gauntlet' : 'rescue',
    targetCount: 1, timeLimit: 0, levelWidth: 9000, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
  }) as LevelConfig;
const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
const PLANS: W2Plan[] = ['2-1', '2-2', '2-3', '2-4', '2-5', '2-7', '2-8', '2-9'];

test('World 2 trio: every roll passes the reachability check, keeps its beats in order, has one exit and hearts on the way', () => {
  for (const plan of PLANS) {
    for (const s of SEEDS) {
      const st = buildW2Stage(cfg(plan), s, plan);
      // (the reachability check models a single liana from ledge to ledge, not a chain of them: 2-4's chains are checked as they are
      // built instead, with World 1's swing checks, protoCheck.ts, and its pickups by flowerReach.ts below)
      if (plan !== '2-4') {
        // (2-7's vine crossings are chains too: a bridge stands in for each, checked by the swing tests, and the rest is checked here)
        const bridged = plan === '2-7'
          ? { ...st, platforms: [...st.platforms, ...(st.rivers ?? []).filter((r) => r.open && st.vines.some((v) => v.x > r.x0 && v.x < r.x1)).map((r, i) => ({ id: 90000 + i, x: r.x0, y: 580, width: r.x1 - r.x0, height: 20, type: 'solid' as const }))] }
          : st;
        const res = validateStage(bridged);
        if (plan === '2-7') {
          // the flowers along a swing are checked with the swings (flowerReach.ts), not from the stand-in bridge
          const spans = (st.rivers ?? []).filter((r) => r.open && st.vines.some((v) => v.x > r.x0 && v.x < r.x1));
          res.errors = res.errors.filter((e) => {
            const m = e.match(/^flower #\d+ at \((\d+), \d+\) is out of reach$/);
            return !(m && spans.some((r) => Number(m[1]) > r.x0 - 60 && Number(m[1]) < r.x1 + 60));
          });
          res.ok = res.errors.length === 0;
        }
        assert.ok(res.ok, `${plan} seed ${s}: ${res.errors.join('; ')}`);
      }
      assert.deepEqual(st.proto.beats.map((b) => b[2].split(':')[0]), ['Learn', 'Develop', 'Twist', 'Finish'], `${plan} seed ${s}`);
      assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1);
      assert.equal(st.collectibles.filter((c) => c.type === 'seed').length, 1, `${plan}: one golden seed`);
      assert.ok(st.collectibles.filter((c) => c.type === 'heart').length >= 2, `${plan} seed ${s}: hearts on the hard stretches`);
      assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS - 15, `${plan} seed ${s}: ${st.meta!.timing!.layoutSeconds.toFixed(0)} s`);
      assert.equal(st.proto.movedPickups, 0, `${plan} seed ${s}: every pickup placed where he can get it`);
      // every river has a bank at both ends and logs (a lily pond has pads instead)
      for (const r of st.rivers ?? []) {
        const logs = st.platforms.filter((p) => p.drift?.x0 === r.x0);
        const pads = st.platforms.filter((p) => p.lily && p.x >= r.x0 && p.x <= r.x1);
        const vines = st.vines.filter((v) => v.vineType === 'swing_liana' && v.x > r.x0 && v.x < r.x1);
        const porches = st.platforms.filter((p) => p.art === 'porch' && p.x > r.x0 && p.x < r.x1);
        const islands = st.platforms.filter((p) => p.y === ISLAND_TOP && p.x > r.x0 && p.x < r.x1);
        // (still water is crossed on lily pads or stepping stones, or it is a pool a hop across: a hanging cage's; 2-2's ferry has one raft)
        const stones = st.platforms.filter((p) => p.style === 'moss_stone' && p.x >= r.x0 && p.x + p.width <= r.x1);
        const still = pads.length >= 3 || stones.length >= 3 || r.x1 - r.x0 <= 180;
        assert.ok(r.open ? vines.length >= 2 || porches.length >= 2 : r.flood ? islands.length >= 2 : r.speed === 0 ? still : r.raft ? logs.length === 1 : logs.length >= 2, `${plan} seed ${s}: river at ${r.x0}`);
      }
    }
  }
});

test('2-1: the first rivers cost no life (a splash puts him back on the bank); the rest are deep; one flows back at him', () => {
  for (const s of SEEDS) {
    const st = buildW2Stage(cfg('2-1'), s, '2-1');
    const rv = st.rivers!;
    assert.ok(rv[0].safe && rv[1].safe && rv[2].safe, `seed ${s}: the teaching rivers`);
    assert.ok(rv.slice(3).every((r) => !r.safe), `seed ${s}: only the first three are safe`);
    // (2-1 is the logs' stage: no puzzle rooms, no cages)
    assert.equal(st.kit, undefined);
    // the safe river puts him back on the bank he jumped from
    assert.ok(st.platforms.some((p) => p.type === 'solid' && p.x <= rv[0].safe!.backX && p.x + p.width >= rv[0].safe!.backX && p.y === rv[0].safe!.backY));
    assert.ok(rv.some((r) => r.dir === -1), `seed ${s}: a river against the current`);
    // the village at the end: the sign says it, and the mailman walks
    assert.ok(st.proto.decor!.some((d) => d.text?.join(' ') === 'PLEASE BE PATIENT'));
    assert.ok(st.proto.decor!.some((d) => d.cel?.startsWith('po.') && d.walk));
  }
});

test('2-2: about one and a half times the flowers the crown needs, the note on the way, and lily ponds', () => {
  for (const s of SEEDS) {
    const st = buildW2Stage(cfg('2-2'), s, '2-2');
    const flowers = st.collectibles.filter((c) => c.type === 'flower').length;
    assert.equal(st.config.targetCount, FLOWER_GOAL_22);
    assert.ok(flowers >= FLOWER_GOAL_22 * 1.35 && flowers <= FLOWER_GOAL_22 * 1.9, `seed ${s}: ${flowers} flowers`);
    assert.equal(st.collectibles.filter((c) => c.type === 'find').length, 1, `seed ${s}: the note`);
    assert.ok(st.rivers!.filter((r) => r.speed === 0).length >= 3, `seed ${s}: lily ponds`);
  }
});

test('2-3: five little ones, each in a reed cage hung on a pulley over the water, lifted out by stones in its counter-basket', () => {
  for (const s of SEEDS) {
    const st = buildW2Stage(cfg('2-3'), s, '2-3');
    const cages = st.collectibles.filter((c) => c.type === 'cage');
    assert.equal(cages.length, CAGES_23);
    assert.equal(st.config.targetCount, CAGES_23);
    assert.deepEqual(new Set(cages.map((c) => c.critter)), new Set(['capy', 'duck', 'otter']), `seed ${s}`);
    const rooms = st.kit!.rooms;
    assert.equal(rooms.length, CAGES_23, `seed ${s}: a room for each cage`);
    for (const c of cages) {
      // every cage hangs on a lift that a counter-basket raises (no cage to punch open in 2-3)
      const room = rooms.find((r) => r.pieces.some((p) => p.kind === 'lift' && p.cage === c.id));
      assert.ok(room, `seed ${s}: cage ${c.id} hangs on a pulley`);
      const lift = room!.pieces.find((p) => p.kind === 'lift')!;
      assert.ok(lift.kind === 'lift' && room!.pieces.some((p) => p.kind === 'basket' && p.id === lift.by), `seed ${s}: its counter-basket`);
      assert.equal(room!.exit, lift.id);
      assert.ok(room!.pieces.some((p) => p.kind === 'source' && p.variant === 'stone'), `seed ${s}: a pile of river stones`);
    }
    // the first is taught: one stone lifts it, and a splash there costs nothing
    const first = rooms[0];
    const basket = first.pieces.find((p) => p.kind === 'basket')!;
    assert.ok(basket.kind === 'basket' && (basket.need ?? 1) <= 2 && first.tips?.enter && first.tips?.hold, `seed ${s}: the teaching room`);
    assert.ok(st.rivers!.filter((r) => r.speed === 0 && r.x1 - r.x0 <= 180)[0].safe, `seed ${s}: the first pool is safe`);
    assert.equal(st.enemies.filter((e) => Math.abs(e.x - (st.rivers!.find((r) => r.safe)!.x0)) < 700).length, 0, `seed ${s}: no animal by the first cage`);
    // a heavy one (two stones), one with the stones across the water, one with its basket hung high
    const baskets = rooms.map((r) => r.pieces.find((p) => p.kind === 'basket')!).map((b) => (b.kind === 'basket' ? b : null)!);
    assert.ok(baskets.some((b) => (b.need ?? 1) >= 4), `seed ${s}: two stones`);
    assert.ok(baskets.some((b) => b.mouth >= 200), `seed ${s}: a high basket`);
    assert.ok(rooms.some((r) => r.ground.length >= 2), `seed ${s}: the stones across the water`);
    // and the mooring posts up onto the high banks
    assert.ok(st.vines.filter((v) => v.vineType === 'tree_climb').length >= 3, `seed ${s}: the posts`);
  }
});

test('2-4: the first crossings on the vines cost no life, the rest are deep, and the twist lands on an island before the logs', () => {
  for (const s of SEEDS) {
    const st = buildW2Stage(cfg('2-4'), s, '2-4');
    const open = st.rivers!.filter((r) => r.open);
    assert.ok(open[0].safe && open[1].safe && open.slice(2).every((r) => !r.safe), `seed ${s}`);
    assert.ok(open.length >= 6, `seed ${s}: ${open.length} vine crossings`);
    // an island: a vine crossing that ends where a log river begins, a short bank apart (long enough to catch his breath on)
    assert.ok(open.some((r) => st.rivers!.some((q) => !q.open && q.x0 > r.x1 && q.x0 - r.x1 < 700)), `seed ${s}: vines then logs`);
    assert.ok(st.vines.every((v) => v.vineType === 'swing_liana'));
  }
});

test('2-8: reed cages hung on pulleys off the islands, in water that rises over them (and stops under the banks); stones thrown across', () => {
  for (const s of SEEDS) {
    const st = buildW2Stage(cfg('2-8'), s, '2-8');
    const cages = st.collectibles.filter((c) => c.type === 'cage');
    assert.equal(st.config.targetCount, CAGES_28);
    assert.ok(cages.length >= CAGES_28 * 1.3, `seed ${s}: ${cages.length} cages`);
    const floods = st.rivers!.filter((r) => r.flood);
    assert.ok(floods.length >= 5, `seed ${s}: ${floods.length} basins`);
    assert.ok(floods[0].safe && floods[1].safe && floods.slice(2).every((r) => !r.safe), `seed ${s}: the first two basins are the teaching ones`);
    for (const r of floods) {
      const top = floodLevel(r.flood!, r.surfaceY, 999);
      // risen: over the islands (a cage on one is lost to the water), under the banks either side
      assert.ok(top < ISLAND_TOP - 8 + 1 && top > 580, `seed ${s}: ${top}`);
      // still: the islands stand clear of it
      assert.ok(r.surfaceY > ISLAND_TOP + 8);
      // the islands go under no sooner than 15 s after it starts
      let t = 0;
      while (floodLevel(r.flood!, r.surfaceY, t) > ISLAND_TOP - 8) t += 0.1;
      assert.ok(t >= 15, `seed ${s}: islands under after ${t.toFixed(1)} s`);
    }
    // every cage hangs on a pulley off a reed island, its stones on that island or (the twist) on the island before it
    const rooms = st.kit!.rooms;
    for (const c of cages) {
      const room = rooms.find((r) => r.pieces.some((p) => p.kind === 'lift' && p.cage === c.id));
      assert.ok(room, `seed ${s}: cage ${c.id} hangs on a pulley`);
      const isl = st.platforms.find((p) => p.id === room!.left.on)!;
      assert.equal(isl.y, ISLAND_TOP, `seed ${s}: its stones are on a reed island`);
    }
    assert.ok(rooms.filter((r) => r.ground.length >= 2).length >= 2, `seed ${s}: stones across the water`);
    // the first basins teach it: one stone, and a fall costs nothing
    assert.ok(rooms[0].tips?.enter && floods[0].safe, `seed ${s}: taught`);
  }
});

test('2-9: the court: guards (royal snappers) and snappers, about one and a half times the goal, a row close enough to bowl over', () => {
  for (const s of SEEDS) {
    const st = buildW2Stage(cfg('2-9'), s, '2-9');
    assert.equal(st.config.targetCount, COURT_GOAL_29);
    assert.ok(st.enemies.length >= COURT_GOAL_29 * 1.35, `seed ${s}: ${st.enemies.length}`);
    const guards = st.enemies.filter((e) => e.royal);
    assert.ok(guards.length >= COURT_GOAL_29 * 0.8, `seed ${s}: ${guards.length} guards`);
    assert.ok(guards.every((g) => g.type === 'turtle' && g.hp === 2 && g.height > 50));
    const xs = guards.map((e) => e.x).sort((a, b) => a - b);
    let run = 1, best = 1;
    for (let i = 1; i < xs.length; i++) {
      run = xs[i] - xs[i - 1] < 160 ? run + 1 : 1;
      best = Math.max(best, run);
    }
    assert.ok(best >= 4, `seed ${s}: a row of four guards`);
    assert.ok(st.proto.decor!.some((d) => d.n === 'throne') && st.proto.decor!.some((d) => d.n === 'archway'), `seed ${s}: the king's throne and the archway`);
  }
});

test('2-7: steps up, porches, lifts up to ground a double jump cannot reach, swing frames, and the village at the end', () => {
  for (const s of SEEDS) {
    const st = buildW2Stage({ ...cfg('2-5'), id: '2-7', miniIndex: 7, objectiveType: 'sprint' } as LevelConfig, s, '2-7');
    const lifts = st.platforms.filter((p) => p.lift);
    assert.ok(lifts.length >= 3, `seed ${s}: ${lifts.length} lifts`);
    // a lift going up climbs higher than any jump (so riding it is the way), and stops level with the ground at each end
    for (const l of lifts) {
      assert.ok(l.lift!.bottom === 580 && l.lift!.bottom - l.lift!.top >= 120, `seed ${s}: lift ${l.id}`);
      const highGround = st.platforms.some((p) => p.type === 'solid' && !p.art && Math.abs(p.y - l.lift!.top) < 2 && (Math.abs(p.x - (l.x + l.width + 6)) < 12 || Math.abs(p.x + p.width - (l.x - 6)) < 12));
      assert.ok(highGround, `seed ${s}: lift ${l.id} meets high ground at its top`);
    }
    assert.ok(lifts.some((l) => l.lift!.postRight && l.lift!.bottom - l.lift!.top > 200), `seed ${s}: a lift up past a double jump`);
    assert.ok(st.platforms.filter((p) => p.art === 'porch').length >= 6, `seed ${s}: porches`);
    assert.ok(st.platforms.some((p) => p.art === 'steps'), `seed ${s}: steps`);
    assert.ok(st.proto.decor!.filter((d) => d.n === 'swingFrame').length >= 5, `seed ${s}: swing frames`);
    assert.ok(st.proto.decor!.some((d) => d.text?.join(' ') === 'PLEASE BE PATIENT'));
    assert.ok(st.proto.decor!.some((d) => d.cel?.startsWith('po.') && d.walk), `seed ${s}: the mailman`);
  }
});

test('2-5: snappers, about one and a half times the goal, a row close enough for one kicked shell to bowl over', () => {
  for (const s of SEEDS) {
    const st = buildW2Stage(cfg('2-5'), s, '2-5');
    assert.equal(st.config.targetCount, SNAPPER_GOAL_25);
    assert.ok(st.enemies.every((e) => e.type === 'turtle'));
    assert.ok(st.enemies.length >= SNAPPER_GOAL_25 * 1.4, `seed ${s}: ${st.enemies.length} snappers`);
    const xs = st.enemies.map((e) => e.x).sort((a, b) => a - b);
    let run = 1, best = 1;
    for (let i = 1; i < xs.length; i++) {
      run = xs[i] - xs[i - 1] < 160 ? run + 1 : 1;
      best = Math.max(best, run);
    }
    assert.ok(best >= 4, `seed ${s}: a row of four`);
  }
});

test('the snapper: head-on it hides, its shell is kicked away, and from behind (or open after a snap) the blow lands', () => {
  const t = (state: string, facing: 1 | -1) => ({ x: 100, state, facing }) as unknown as Enemy;
  assert.equal(turtleGuard(t('patrol', -1), 40, false), 'shell', 'he is on the side it faces');
  assert.equal(turtleGuard(t('patrol', 1), 40, false), 'hit', 'behind it');
  assert.equal(turtleGuard(t('windup', -1), 40, true), 'shell');
  assert.equal(turtleGuard(t('recover', -1), 40, false), 'hit', 'open after the snap');
  assert.equal(turtleGuard(t('shell', -1), 40, true), 'slide');
  assert.equal(turtleGuard(t('shell', -1), 40, false), 'bump');
  assert.equal(turtleGuard(t('dizzy', -1), 40, false), 'hit');
});

test('2-6: the climb up the bank village, with the bank behind it, doors on the porches and Gruntlewick at the top', () => {
  for (const s of SEEDS.slice(0, 8)) {
    const st = buildW2Stage({ ...cfg('2-5'), id: '2-6', miniIndex: 6, objectiveType: 'ascent' } as LevelConfig, s, '2-6');
    assert.ok(st.proto.bankWall, `seed ${s}`);
    assert.ok(st.proto.decor!.filter((d) => d.n === 'doorRoof').length >= 5, `seed ${s}: doors`);
    assert.ok(st.proto.ladders, 'the climbs are ladders');
    assert.ok(st.proto.decor!.some((d) => d.cel?.startsWith('tc.')), `seed ${s}: Gruntlewick`);
    assert.ok(st.vines.some((v) => v.vineType === 'tree_climb'));
    assert.ok(st.collectibles.filter((c) => c.type === 'heart').length >= 2, `seed ${s}: hearts`);
    assert.equal(st.proto.hollows?.length ?? 0, 0, 'the lit window stands in for the hollow');
  }
});
