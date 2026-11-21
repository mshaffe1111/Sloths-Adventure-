// The OUT-AND-BACK shape (ENG-27; reference/design/2-7.md "READY before the builder", PICKS-26-28 ruling 1): a run right, a way down, a run
// back LEFT on the column's foot with its rivers flowing left, laid by gen2 on the toy (toyHome.ts, World 2's ground and river rows).
// No stage of the game is built here; the toy's id is the test's own.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { towerCfg } from './toyTower.ts';
import { HOME_CODE, homeKit, SAME_GROUND_CODE } from './toyHome.ts';
import { LEG_CLEAR, reflectLeg } from './legs.ts';
import { layRiver, riverFaults } from './riverLay.ts';
import { validateStage } from '../levelCheck.ts';
import { W2_RIVERS } from './worlds/w2.ts';

const ID = '2-97';
const build = (code: string, seed: number, difficulty: 'normal' | 'easy' = 'normal') => buildGen2Stage({ config: { ...towerCfg(ID, 'sprint'), unlocked: true }, kit: homeKit(ID, code), seed, difficulty });
const errorsOf = (st: ReturnType<typeof build>) => [...(st.gen2.errors ?? []), ...validateStage(st).errors.map((e) => `levelCheck: ${e}`)];

test('home toy (planted RED): turned back LEFT at the out leg\'s own ground, the home leg lies on top of it: refused by name on every roll', () => {
  for (let seed = 1; seed <= 4; seed++) {
    const st = build(SAME_GROUND_CODE, seed);
    assert.match(errorsOf(st).join('\n'), /legs: leg 2 \(left\) overlays leg 1 \(right\) at x \d+-\d+: .* needs its own ground/, `seed ${seed}`);
  }
});

test('home toy (GREEN): out right, down the column, home left: clean on 6 seeds and both settings, the same stage from the same seed', () => {
  for (const difficulty of ['normal', 'easy'] as const) {
    for (let seed = 1; seed <= 6; seed++) {
      const st = build(HOME_CODE, seed, difficulty);
      const at = `${difficulty} seed ${seed}`;
      assert.deepEqual(errorsOf(st), [], at);
      const T = st.gen2.tower!;
      assert.deepEqual(T.legs!.map((g) => g.travel), ['right', 'down', 'left'], at);
      const [out, col, home] = T.legs!;
      // (the home leg on its own ground: its top a jump and his height under the out leg's foot, on the column's floor)
      assert.ok(home.y0 - out.y1 >= LEG_CLEAR, `${at}: home top ${home.y0}, out foot ${out.y1}`);
      assert.equal(home.ground, col.floorY, `${at}: home stands on the column's floor`);
      // (it runs back under the out leg: home begins at the column's near wall and lies left of it)
      assert.ok(home.x1 <= col.x0 && home.x0 < out.x0, at);
      // (the stage ends LEFT: its last leg names the travel, and its shrine is at the home leg's left end)
      assert.equal(st.config.travel, 'left', at);
      assert.ok(st.exitTotemX < out.x0, `${at}: shrine at ${st.exitTotemX}`);
      // (every river on the home leg flows LEFT, with him, and is marked as crossed right to left; the out leg's flow left, AT him)
      const homeRivers = (st.rivers ?? []).filter((r) => r.x1 <= home.x1 + 1 && r.surfaceY > out.y1);
      const outRivers = (st.rivers ?? []).filter((r) => r.x0 >= out.x0 - 1 && r.surfaceY < out.y1);
      assert.ok(homeRivers.length >= 3 && outRivers.length >= 1, `${at}: ${homeRivers.length} home rivers, ${outRivers.length} out`);
      for (const r of homeRivers) assert.deepEqual([r.dir, r.way], [-1, -1], `${at}: home river at ${r.x0}`);
      for (const r of outRivers) assert.deepEqual([r.dir, r.way], [-1, undefined], `${at}: out river at ${r.x0}`);
      // (flags lie along the home leg too, and petals: the shrine at the left end strips none, levelCheck's 'past the shrine' reads the
      //  way he travels; planted RED before ENG-27: every petal of the stage was refused as past a shrine at x ~0)
      const homeFlags = (st.checkpoints ?? []).filter((c) => c.x < home.x1 && c.y > out.y1);
      const homePetals = st.collectibles.filter((c) => c.type === 'flower' && c.x < home.x1 && c.y > out.y1);
      assert.ok(homeFlags.length >= 3, `${at}: ${homeFlags.length} flags on the home leg`);
      assert.ok(homePetals.length >= 10, `${at}: ${homePetals.length} petals on the home leg`);
      if (seed <= 2) assert.deepEqual(build(HOME_CODE, seed, difficulty).platforms, st.platforms, `${at}: the same stage from the same seed`);
    }
  }
});

test('home toy (planted): a river crossed right to left is judged in its own frame: the mirror of a fair river is fair, unmarked it is not', () => {
  // (a river with him laid rightwards between two banks; then the same river turned, as a leg laid left turns it)
  let id = 1;
  const near = { id: id++, x: 4000, y: 580, width: 300, height: 200, type: 'solid' as const };
  const r = layRiver(W2_RIVERS.ride, near.x + near.width, near.y, () => id++);
  const far = { id: id++, x: r.zone.x1, y: 580, width: 300, height: 200, type: 'solid' as const };
  const st = { platforms: [near, ...r.logs, far], rivers: [r.zone], vines: [] };
  assert.deepEqual(riverFaults(st), []);
  const sum = 2 * 4000;
  reflectLeg({ platforms: st.platforms, vines: [], ropes: [], zones: [], gaps: [], asks: [], heartFalls: [], rivers: st.rivers, sections: [] }, sum);
  assert.deepEqual([r.zone.dir, r.zone.way], [-1, -1]);
  assert.deepEqual(riverFaults(st), [], 'the turned river, judged in its own frame');
  // (planted: the way mark taken off, the judge reads the river as flowing back at a player running right, and refuses it)
  delete r.zone.way;
  assert.match(riverFaults(st).join(), /flows back at him/);
});

test('home toy (planted): the start\'s back is walled when the home leg runs on past it, and the way on never leaves the out leg but by the column', async () => {
  const { findRoute } = await import('../../../tools/inspect/route.ts');
  const { WALL } = await import('./legs.ts');
  for (const seed of [1, 2]) {
    const st = build(HOME_CODE, seed);
    const [out, col, home] = st.gen2.tower!.legs!;
    assert.ok(home.x0 < out.x0, `seed ${seed}: the home leg runs on past the start`);
    // (a wall behind the spawn, from over the out leg to its foot: he cannot walk off the start's back onto the home leg)
    const wall = st.platforms.find((p) => p.x === out.x0 - WALL.w && p.width === WALL.w);
    assert.ok(wall && wall.y <= out.y0 - WALL.over && wall.y + wall.height >= out.y1 - 1, `seed ${seed}: the start's back wall`);
    // (the inspector's way on: no move from the out leg lands on the home leg; it comes down in the column's frame (its floor runs out
    //  through the doorway from col.x0 - WALL.w). Planted RED before ENG-27: 'walk 12274 -> 12167, drop to 1605' off the start's back,
    //  then every bank of the out leg linked down to the home leg through itself. OPEN (ENG-27 REPORT): the inspector still hops from the
    //  out leg's last bank to the column's floor through the column's wall (a way-down column's own, legsLay's DOWN_CODE too); the bots
    //  follow the lay's own route on a stage of legs (firsttimer.ts, towerRoute.ts))
    const r = findRoute(st as never, [], { spurs: true });
    assert.notEqual(r.traced, 'failed');
    for (const g of r.segs) {
      const fromOut = g.y0 <= out.y1 + 1, toHome = g.y1 >= home.y0 - 1;
      if (fromOut && toHome) assert.ok(g.x1 >= col.x0 - WALL.w - 1, `seed ${seed}: ${g.kind} ${Math.round(g.x0)},${Math.round(g.y0)} -> ${Math.round(g.x1)},${Math.round(g.y1)} lands on the home leg from the out leg`);
    }
  }
});

test('home toy (planted): the river he is in is found by where he is, never by x alone; a splash on the home leg sets him back on the bank he came from', async () => {
  const { riverAt, RIVER_DEPTH } = await import('../river.ts');
  const { w2Finish } = await import('./worlds/w2.ts');
  // (two rivers sharing x: the out leg's over the home leg's. Planted RED: by x alone (the engine before ENG-27) the higher one is found
  //  wherever he is, and on the home leg he was 'under its surface' and lost a life every frame there)
  const up = { x0: 1000, x1: 1600, surfaceY: 700 }, down = { x0: 900, x1: 1500, surfaceY: 1500 };
  assert.equal(riverAt([up, down], 1200, 650), up, 'on the out leg, over its river');
  assert.equal(riverAt([up, down], 1200, 1450), down, 'on the home leg, under the out leg\'s river');
  assert.equal(riverAt([up, down], 1550, 1450), undefined, 'on the home leg where only the out leg\'s river is over him');
  assert.equal(riverAt([up], 1200, 700 + RIVER_DEPTH - 1), up, 'fallen into it: caught');
  assert.equal([up, down].find((r) => 1550 > r.x0 && 1550 < r.x1), up, 'the plant: by x alone the out leg\'s river is found on the home leg');
  // (World 2's finish fills a soft dip with a splash-back pond: on the home leg (laid left) its splash sets him on the RIGHT bank)
  for (const seed of [1, 2]) {
    const st = build(HOME_CODE, seed);
    const home = st.gen2.tower!.legs![2];
    const done = w2Finish(st as never) as typeof st;
    const ponds = (done.rivers ?? []).filter((r) => r.speed === 0 && r.safe && r.x1 <= home.x1 + 1 && r.surfaceY > home.y0 - 100);
    assert.ok(ponds.length >= 1, `seed ${seed}: a splash pond on the home leg`);
    for (const r of ponds) assert.ok(r.safe!.backX > r.x1, `seed ${seed}: pond ${r.x0}-${r.x1} sets him back at ${r.safe!.backX}, on the bank he came from (right)`);
  }
});

test('home toy (planted): a splash pond sets him back on its own storey, never on the leg laid over it (its banks are the solids at its lips on the fall\'s height, never the topmost solid at that x)', async () => {
  const { w2Finish, LIP_RISE } = await import('./worlds/w2.ts');
  const { surfaceBelowBank } = await import('../river.ts');
  // (planted RED on w2.ts banks() before ENG-27e, the topmost solid at each lip: on Easy seeds 2 and 5 and Normal seed 5 the out leg's
  //  ground starts at a home-leg pond's far lip, and the splash set him 790 px up on the out leg in the middle of the race)
  let under = 0;
  for (const difficulty of ['normal', 'easy'] as const) {
    for (let seed = 1; seed <= 6; seed++) {
      const done = w2Finish(build(HOME_CODE, seed, difficulty) as never, difficulty) as ReturnType<typeof build>;
      const solids = done.platforms.filter((p) => p.type === 'solid');
      for (const r of done.rivers ?? []) {
        if (!r.safe) continue;
        const { backX, backY } = r.safe, bank = r.surfaceY - surfaceBelowBank;
        const at = `${difficulty} seed ${seed}: the pond at ${r.x0}-${r.x1} (its lower bank's top ${bank}) sets him back at (${backX}, ${backY})`;
        assert.ok(backY <= bank && backY >= bank - LIP_RISE, `${at}: on its own storey`);
        assert.ok(solids.some((p) => p.y === backY && p.x <= backX && p.x + p.width >= backX), `${at}: on a solid`);
        if (solids.some((p) => p.x <= backX && p.x + p.width >= backX && p.y < bank - LIP_RISE)) under++;
      }
    }
  }
  assert.ok(under >= 3, `the plant's case is laid: ${under} ponds have another leg's ground over their set-back`);
});

test('home toy (planted): the column\'s last turn is climbed at the column\'s foot, and the bots walk home: every seed finishes, no rescue', async () => {
  const { towerCorners } = await import('../../../tools/inspect/towerRoute.ts');
  const { homeRun } = await import('../../../tools/inspect/homeToys.ts');
  for (const seed of [1, 2, 3]) {
    const st = build(HOME_CODE, seed);
    const T = st.gen2.tower!;
    const col = T.legs!.find((L) => L.frame)!, home = T.legs!.at(-1)!;
    const foot = col.turns!.at(-1)!;
    const spawn = { x: st.spawnX, y: st.spawnY };
    const at = (c: Array<{ x: number; y: number }>) => c.findIndex((q) => q.x === foot.x && q.y === foot.to);
    // GREEN: down the column's last vine, then home: past that corner the way never runs back right of the column's foot
    const c = towerCorners(st as never, spawn)!;
    const i = at(c);
    assert.ok(i > 0, `seed ${seed}: the column's last turn (x ${foot.x}, ${foot.from} -> ${foot.to}) is on the way`);
    const onHome = (q: { x: number; y: number }) => q.y >= foot.to - 80 && q.x < (col.frame as { x0: number }).x0 - 200;
    assert.ok(!c.slice(0, i).some(onHome), `seed ${seed}: the column's foot comes before the home leg`);
    assert.ok(c.slice(i + 1).every((q) => q.x <= foot.x && q.y >= foot.to - 80 && q.x <= home.x1 + 1), `seed ${seed}: after the column's foot the way stays on the home leg`);
    // planted RED: read as a tower with no legs (the route before ENG-27b), that turn is left for after the stage's last leg, and the way
    // runs from the home leg's end back to the column
    const { legs: _legs, ...bare } = T;
    const old = towerCorners({ ...st, gen2: { ...st.gen2, tower: bare } } as never, spawn)!;
    assert.ok(old.slice(0, at(old)).some((q) => onHome(q) && q.x < home.x0 + 2000), `seed ${seed}: the plant: the old way climbs the column's last turn after the home leg`);
  }
  // (the bots on the home leg: before ENG-27b seeds 2 and 3 drowned 56-94 times, walked back from the home leg's end to the column, and
  //  every seed stood ~13 s on the column's last storey until rescued)
  const RIGHT = HOME_CODE.replace('/L Pf1<', '/R Pf1>');
  // (and once on the race leg nothing lifts him back over it in one frame but a life lost: planted RED on w2.ts banks() before ENG-27e,
  //  Easy seed 2's splash pond at the dip set him on the out leg, 846 px up, at frames 2584 and 4112, no life lost)
  const lifts: string[] = [];
  let watched = 0;
  const watch = (at: string) => {
    let f = 0, y0 = NaN, lost = -1e9, n0 = 0;
    return { onFrame: (sim: import('../realPlay.ts').RealPlay) => {
      f++;
      const e = sim.e as unknown as { player: { x: number; y: number }; statLivesLost: number; pieces: Array<{ kind?: string; pacer?: { yMin: number } }> };
      const yMin = e.pieces.find((q) => q.kind === 'pacer')?.pacer?.yMin;
      if (e.statLivesLost !== n0) { n0 = e.statLivesLost; lost = f; }
      const p = e.player;
      if (yMin !== undefined && p.y >= yMin) watched++;
      if (yMin !== undefined && y0 >= yMin && p.y < yMin && y0 - p.y > 150 && f - lost > 150) lifts.push(`${at} frame ${f}: at x ${Math.round(p.x)} from y ${Math.round(y0)} to ${Math.round(p.y)}`);
      y0 = p.y;
    } };
  };
  for (const [tier, setting] of [['middle', 'normal'], ['middle', 'easy'], ['expert', 'normal']] as const) {
    for (const seed of [1, 2, 3]) {
      const r = homeRun(tier, setting, seed, 1, watch(`${tier} ${setting} seed ${seed}`));
      assert.equal(r.end, 'shrine', `${tier} ${setting} seed ${seed}: finishes`);
      assert.equal(r.rescues, 0, `${tier} ${setting} seed ${seed}: no rescue`);
      if (tier === 'middle' && setting === 'normal' && seed === 2) {
        const right = homeRun(tier, setting, seed, 1, {}, RIGHT);
        assert.ok(r.lives <= 2 * Math.max(1, right.lives), `seed 2 laid left: ${r.lives} lives, laid right ${right.lives} (within 2x)`);
      }
    }
  }
  assert.ok(watched > 0, 'the race leg is watched (its pacer laid)');
  assert.deepEqual(lifts, [], 'on the race leg he is never lifted back over it but by a life lost');
});
