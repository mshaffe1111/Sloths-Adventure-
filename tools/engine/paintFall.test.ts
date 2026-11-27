// R-165.292 planted: the fall-through rule (paintFall.ts) on hand-built stages, read through the engine's own painters (protoArt.ts
// paintedPlatforms, terrain.ts footingOf/terrainLook) with the paint state engine.ts sets (paintStage.ts). Red without the rule's cause,
// green where a painter draws the size; and the repo's look-alikes (D88): pieces with their own art, hollow and pushed logs, a chase
// section, a bounce plant, a crumbling limb and a boss lair, none of which a size can push into code terrain.
import '../../src/game/headlessDom.ts';
// (every sheet "in": the painters decide as they do once the art has loaded; set before the game modules load)
(globalThis as Record<string, unknown>).Image = class {
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;
  width = 1; height = 1; naturalWidth = 1; naturalHeight = 1; complete = true;
  set src(_u: string) { this.onload?.(); }
  decode() { return { then: (ok: () => void) => ok() }; }
};
import test from 'node:test';
import assert from 'node:assert/strict';
import type { Platform } from '../../src/game/types.ts';

const { stagePaintInput } = await import('./paintStage.ts');
const { paintFalls, ranges, CODE_TERRAIN } = await import('./paintFall.ts');
const { footingOf } = await import('../../src/game/terrain.ts');
const { setGroundPaint, setKitWorld, setGroundLook } = await import('../../src/game/protoArt.ts');
const cutArt = await import('../../src/game/w1CutArt.ts');

let nid = 1;
/** a stage: a long painted bank (moss_stone, 120 tall) with the pieces under test standing on it, as gen2's `on` blocks stand */
function stage(...pieces: Array<Partial<Platform>>): { platforms: Platform[]; groundLook?: 'bough' } {
  const G = 1000;
  const bank: Platform = { id: nid++, x: 0, y: G, width: 4000, height: 120, type: 'solid', style: 'moss_stone' } as Platform;
  let x = 200;
  const ps = pieces.map((o) => {
    const h = o.height ?? 50;
    const p = { id: nid++, x, y: G - h, width: 240, type: 'solid', style: 'moss_stone', ...o, height: h } as Platform;
    x += 600;
    return p;
  });
  return { platforms: [bank, ...ps] };
}
const W1 = { worldIndex: 1, objectiveType: 'collect' };
const W5 = { worldIndex: 5, objectiveType: 'collect' };
function judge(st: { platforms: Platform[] }, c: { worldIndex: number; objectiveType?: string }) {
  const inp = stagePaintInput(st, c);
  assert.ok(inp, 'the painted kit is on for this stage');
  return paintFalls(st.platforms, inp.f);
}

test('RED: 1-7\'s case, a 53 px landing:true log in World 1, draws as code terrain; its painter (the bank) starts at 90', () => {
  const st = stage({ style: 'log', height: 53, landing: true } as Partial<Platform>);
  const r = judge(st, W1);
  assert.equal(r.breaches.length, 1, JSON.stringify(r));
  const b = r.breaches[0];
  assert.equal(b.style, 'log');
  assert.equal(b.h, 53);
  assert.ok(CODE_TERRAIN.has(b.drawn), b.drawn);
  assert.equal(b.painter, `90-420`);
  assert.equal(b.nearest, 90);
});

test('49 px log: GREEN where the world\'s own kit paints thin pieces (World 5, protoArt.ts paintedPlatforms ownKit && thinKit); RED in World 1, whose kit paints only a branch thin', () => {
  // (the packet's premise "a log paints under 50" is protoArt.ts:1165's `ownKit() && thinKit(p)`: true for a world with its own kit,
  // not World 1, whose thin painter is the branch alone; World 1's thin log is terrain's code sprite, platformArt.ts drawThin)
  const w5 = judge(stage({ style: 'log', height: 49 }), W5);
  assert.equal(w5.breaches.length, 0, JSON.stringify(w5));
  const w1 = judge(stage({ style: 'log', height: 49 }), W1);
  assert.equal(w1.breaches.length, 1, JSON.stringify(w1));
  assert.equal(w1.breaches[0].drawn, 'thin');
});

test('the rock\'s edge (isPaintedRock: a moss stone exactly 50): 50 GREEN, 51 and 49 RED with the painter\'s sizes printed', () => {
  const at50 = judge(stage({ height: 50 }), W1);
  assert.equal(at50.breaches.length, 0, JSON.stringify(at50));
  const at51 = judge(stage({ height: 51 }), W1);
  assert.equal(at51.breaches.length, 1, JSON.stringify(at51));
  assert.equal(at51.breaches[0].painter, '50, 90-420');
  assert.equal(at51.breaches[0].nearest, 50);
  const at49 = judge(stage({ height: 49 }), W1);
  assert.equal(at49.breaches.length, 1, JSON.stringify(at49));
  assert.equal(at49.breaches[0].nearest, 50);
  // (a branch under 50 is World 1's painted thin piece; at 53 it falls to the bank's code terrain too)
  assert.equal(judge(stage({ style: 'branch', height: 24 }), W1).breaches.length, 0);
  assert.equal(judge(stage({ style: 'branch', height: 53 }), W1).breaches.length, 1);
});

test('no painter at all is not a breach (listed as unpainted): no size would paint it, so the size is not the cause; it is missing art', () => {
  // (with the painted ground off, World 1 paints a log at no height: neither the bank painter nor a thin one takes it)
  setKitWorld(1);
  setGroundLook(undefined);
  setGroundPaint(false);
  const st = stage({ style: 'log', height: 53 });
  const inp = stagePaintInput(st, W1)!;
  setGroundPaint(false);
  const r = paintFalls(st.platforms, inp.f);
  // (the log: no breach. The moss bank under it does breach here, at 120: with the ground off its only painter is the 50 px rock)
  assert.ok(!r.breaches.some((b) => b.style === 'log'), JSON.stringify(r));
  assert.ok(r.unpainted.some((u) => u.style === 'log' && u.h === 53), JSON.stringify(r.unpainted));
});

test('a stage whose painted kit is off (a boss lair) is not judged: no painter runs there (engine.ts paintKit)', () => {
  const st = stage({ style: 'log', height: 53 });
  assert.equal(stagePaintInput(st, { worldIndex: 1, objectiveType: 'boss_lair' }), null);
});

test('look-alikes (D88): own art, a hollow log, a pushed log, a chase section, a bounce plant, a crumbling limb and a painted bank never breach', () => {
  const st = stage(
    { style: 'moss_stone', height: 60, art: 'rock' } as Partial<Platform>,
    { style: 'log', height: 124, hollow: true } as Partial<Platform>,
    { style: 'log', height: 60, push: true } as Partial<Platform>,
    { style: 'moss_stone', height: 70, chase: true } as Partial<Platform>,
    { style: 'moss_stone', height: 30, type: 'bouncy' },
    { style: 'branch', height: 24, type: 'fragile', creak: 1.2 } as Partial<Platform>,
    { style: 'moss_stone', height: 140 },
  );
  const r = judge(st, W1);
  assert.equal(r.breaches.length, 0, JSON.stringify(r.breaches));
});

test('the rule reads the screen\'s own decision: every breach is a footing terrain draws by code', () => {
  const st = stage({ style: 'log', height: 53 }, { style: 'moss_stone', height: 70 }, { height: 50 });
  const inp = stagePaintInput(st, W1)!;
  const r = paintFalls(st.platforms, inp.f);
  for (const b of r.breaches) assert.ok(CODE_TERRAIN.has(footingOf(st.platforms.find((p) => p.id === b.id)!, inp.f).drawn));
  assert.deepEqual(r.breaches.map((b) => b.h).sort(), [53, 70]);
});

test('a World 1 stone keeps its cut piece up to STONE_W_MAX wide (PAINT-292; before it, 260): 255 and 266 wide (an Easy-widened stone, 1-1 seed 791759 Easy x15238) GREEN, one wider RED', () => {
  const { pickCut, STONE_W_MAX } = cutArt;
  const mk = (w: number) => { const st = stage({ style: 'moss_stone', height: 55, width: w }); const q = st.platforms[1]; const c = pickCut(q); if (c) q.cut = c; return st; };
  assert.equal(judge(mk(255), W1).breaches.length, 0);
  assert.equal(judge(mk(266), W1).breaches.length, 0, 'PAINT-292: a stone cut');
  const wide = judge(mk(STONE_W_MAX + 1), W1);
  assert.equal(wide.breaches.length, 1, JSON.stringify(wide));
  assert.equal(wide.breaches[0].w, STONE_W_MAX + 1);
});

test('PAINT-292: a World 1 log 50-89 px tall is drawn by the thick painted planks (538x50 GREEN; before it, code ground); a 49 px one keeps a ledge', () => {
  const { pickCut } = cutArt;
  const mk = (w: number, h: number) => { const st = stage({ style: 'log', height: h, width: w }); const q = st.platforms[1]; const c = pickCut(q); if (c) q.cut = c; return st; };
  for (const [w, h] of [[538, 50], [276, 55], [229, 79], [262, 49]]) assert.equal(judge(mk(w, h), W1).breaches.length, 0, `${w}x${h}`);
});

test('1-8\'s reverted knots (VAR-1b, w1Arc18 knot(): moss_stone 50-56 on a bough) are painted, not level A: the cut slab on a bough stage', () => {
  // (their "grey slabs" were the art director's painted slab cut, w1-rock-slabs-*, the wrong object for a burl: a level-B look, named in
  // the report, never a code fill; VAR-1b's still reference/qa-reports/GATE-292/var1b-1-8-knots-x10041-normal-sideways-PAINTED-cut.jpg)
  const { pickCut } = cutArt;
  const st = { ...stage({ style: 'moss_stone', height: 53, width: 130 }), groundLook: 'bough' as const };
  const q = st.platforms[1]; const c = pickCut(q); if (c) q.cut = c;
  assert.ok(q.cut, 'a 53 px moss stone gets a cut');
  assert.equal(judge(st, W1).breaches.length, 0);
});

test('ranges prints whole heights as runs', () => {
  assert.equal(ranges([1, 2, 3, 50, 90, 91, 92]), '1-3, 50, 90-92');
  assert.equal(ranges([]), '');
});

// R-165.441 planted: a painted bank's top under a LATER-painted bank's soil (paintFall.ts soilOvers over protoArt.ts groundSoil, the
// soil drawGround paints). The plant is SHIPPED 1-4's pair: a summit bank (y 360, h 120) high over the start floor.
const { soilOvers } = await import('./paintFall.ts');
const { bankOpen, groundSoil, soilOutline, SOIL_ROOM } = await import('../../src/game/protoArt.ts');
const bank = (x: number, y: number, w: number, h: number): Platform => ({ id: nid++, x, y, width: w, height: h, type: 'solid', style: 'moss_stone' }) as Platform;
function paintOn(platforms: Platform[]) {
  assert.ok(stagePaintInput({ platforms }, W1), 'the painted kit is on');
}

test('R-165.441 RED: a high bank\'s soil run on down out of sight (main\'s draw) covers the floor under it; GREEN: drawn, it stops at its own bottom', () => {
  const top = bank(484, 360, 420, 120), floor = bank(0, 3000, 1280, 200);
  const st = [top, floor];
  paintOn(st);
  // (the plant: the summit's soil as main drew it, to the view's bottom, every other region as drawn)
  const old = groundSoil(st).map((r) => (r.p === top ? { p: top, pts: soilOutline(1, top, { left: true, right: true }, 3300).pts } : r));
  const red = soilOvers(st, old);
  assert.equal(red.length, 1, JSON.stringify(red));
  assert.equal(red[0].over.id, top.id);
  assert.equal(red[0].under.id, floor.id);
  assert.ok(red[0].covered > 200, `the column (narrowed by its end faces) covers most of the summit's width: ${red[0].covered}`);
  // (drawn: the summit is hung, its soil no lower than its own bottom, and the floor's top is clear)
  assert.equal(bankOpen(top, st)!.open.underside, true);
  assert.equal(bankOpen(floor, st)!.open.underside, undefined);
  const drawn = groundSoil(st).find((r) => r.p === top)!;
  assert.ok(Math.max(...drawn.pts.map((q) => q[1])) <= top.y + top.height, 'the underside never hangs under the collider');
  assert.deepEqual(soilOvers(st), []);
});

test('R-165.441: a tuck (a pit\'s floor under its wall, a gap under his height) and a step down beside a bank (the soils\' join) are not breaches and stay unhung', () => {
  const wall = bank(0, 500, 400, 200), pitFloor = bank(380, 500 + 200 + SOIL_ROOM - 10, 300, 120);
  const tuck = [wall, pitFloor];
  paintOn(tuck);
  assert.equal(bankOpen(wall, tuck)!.open.underside, undefined);
  assert.deepEqual(soilOvers(tuck), []);
  const hill = bank(0, 500, 400, 90), below = bank(401, 900, 600, 200);
  const step = [hill, below];
  paintOn(step);
  assert.equal(bankOpen(hill, step)!.open.underside, undefined, 'a step down: the two soils meet, the hill stands on its own soil');
  assert.deepEqual(soilOvers(step), []);
});

test('R-165.441: the gate reads the soil as drawn, not the blocks: a bank whose end face curves in clear of a floor under its end is not over it', () => {
  // (the floor starts 4 units under the bank's open end: the painted face is well in from there at that depth, so no soil reaches it)
  const ledge = bank(0, 400, 600, 120), floor = bank(596, 1400, 600, 200);
  const st = [ledge, floor];
  paintOn(st);
  assert.deepEqual(soilOvers(st), []);
  assert.equal(bankOpen(ledge, st)!.open.underside, undefined);
});

test('R-165.441: a hung bank is not the ground: the soil\'s darkening line under it is the floor\'s own (1-4\'s start: a shade step at the summit\'s reach)', async () => {
  const { groundLine } = await import('../../src/game/protoArt.ts');
  const top = bank(484, 360, 420, 120), floor = bank(0, 11265, 1280, 200);
  const st = [top, floor];
  paintOn(st);
  const line = groundLine(st);
  // (the plant: the same line with the summit standing as ground, as before, steps where the summit's reach starts)
  assert.notDeepEqual(groundLine([floor, { ...top, height: 11265 - 360 + 200 } as Platform])(500), line(500));
  assert.deepEqual(line(500), line(0), 'under the summit the line is the floor\'s');
  assert.deepEqual(line(700), line(1200));
});

// INT-R5d planted (R-165.441 x the stacked legs): a bank a stacked leg's ceiling runs under is never hung; the ceiling owns its end. The
// plant is 2-7's normal layout 0 bank #1 (x 3881-4521, y 747, h 170) over the race leg (y 1500), its ceiling's line at about 1040-1270:
// hung, its soil stopped at 917 over the backdrop, 120+ over the line where the ceiling's own underside is drawn (INT-R5d's stills).
const { soilShorts } = await import('./paintFall.ts');
const { STEP } = await import('../../src/game/groundStack.ts');
test('stacked legs RED: a hung bank over a ceiling stops short of its line (soilShorts); GREEN: with the ceilings it is not hung, its soil reaches the line, and the leg under the line is clear (soilOvers)', () => {
  const up = bank(3881, 747, 640, 170), race = bank(3700, 1500, 1100, 190);
  const st = [up, race];
  paintOn(st);
  const n = Math.floor((4700 - 3800) / STEP) + 1;
  const cs = [{ x0: 3800, x1: 3800 + (n - 1) * STEP, ys: Array.from({ length: n }, () => 1100), lower: [race] }];
  // (the plant: the soil fix alone, no ceilings: hung, short of the line by 1100 - 917 = 183)
  assert.equal(bankOpen(up, st)!.open.underside, true, 'without the ceilings the soil fix hangs it (the gap is 583)');
  const red = soilShorts(st, cs, groundSoil(st));
  assert.equal(red.length, 1, JSON.stringify(red));
  assert.equal(red[0].bank.id, up.id);
  assert.ok(red[0].gap >= 150 && red[0].short > 400, JSON.stringify(red[0]));
  // (drawn with the ceilings: not hung, its soil runs on to the line and past it, where drawGround clips it)
  assert.equal(bankOpen(up, st, undefined, cs)!.open.underside, undefined);
  assert.deepEqual(soilShorts(st, cs), []);
  // (the race leg's top is under the line: the clipped air, no soil over it)
  assert.deepEqual(soilOvers(st, groundSoil(st, undefined, cs), cs), []);
  // (and the clip is what clears it: the same soil judged with no ceiling covers the race leg's top)
  assert.equal(soilOvers(st, groundSoil(st, undefined, cs), []).length, 1);
});

// R-165.451 planted on the SHIPPED case: 2-6's beat A (seed 1, Normal), the start floor's soil under the storeys hung over it. The gate
// (paintFall.ts depthSteps) reads the darkening's bands as the square painter draws them. RED: the line t-build-26 drew, with the hung
// banks standing in it as ground (the storeys thousands of px up pulled it, a 192-224 px jump at x 1040-1056, the straight edge Matt's
// still showed); GREEN: the line drawn now (FIX-SOIL-b c22702edc: a hung bank leaves the line, R-165.441).
test('R-165.451 RED: the depth line with the hung storeys in it steps under 2-6\'s start floor; GREEN: as drawn, no straight-sided block', async () => {
  const { depthSteps } = await import('./paintFall.ts');
  const { groundBanks } = await import('../../src/game/protoArt.ts');
  const { generateAllLevels } = await import('../../src/game/worldsData.ts');
  const { listedStage, playFinish } = await import('../../src/game/gen2/listed.ts');
  const { buildGen2Stage } = await import('../../src/game/gen2/pipeline.ts');
  const cfg = generateAllLevels().find((c) => c.id === '2-6' && !c.secret)!;
  const row = listedStage('2-6')!;
  const st = playFinish(row, buildGen2Stage({ config: cfg, kit: row.kit(), seed: 1, difficulty: 'normal' }) as never, 'normal') as { platforms: Platform[] };
  assert.deepEqual(depthSteps(st.platforms), [], 'drawn: no step in the soil\'s darkening');
  // (the plant: every bank standing as ground down to the deepest floor, as t-build-26's line took them, and the line it drew then: the
  // weighed mean, not yet eased, R-165.487)
  const banks = groundBanks(st.platforms), foot = Math.max(...banks.map((b) => b.y + b.height));
  const old = await meanAt(banks.map((b) => ({ ...b, height: foot - b.y })).filter((b) => !b.soil));
  const red = depthSteps(st.platforms, old);
  assert.ok(red.some((d) => d.x >= 1024 && d.x <= 1072 && d.jump > 150), `the old line steps at beat A's edge: ${JSON.stringify(red.slice(0, 3))}`);
});

/** the line as drawn before R-165.487 (protoArt.ts meanLine, not eased), as the square painter lays it out at the gate's view (900) */
async function meanAt(tops: Platform[]): Promise<(x: number) => [number, number]> {
  const { meanLine } = await import('../../src/game/protoArt.ts');
  return (x) => { const y = meanLine(tops, x); return [y - 0.55 * 900, y + 0.45 * 900]; };
}

// R-165.487 planted on the SHIPPED case: 2-7's bank starts (INT-R5-b's paint1: 49-73 px DEPTH STEPs at x 3420-3780 and 15500-16900, the
// faint straight line the lead judged on strip-Jm50-0-48). The weighed mean alone moves the darkening's start 49-73 px in one 16 px strip
// where a bank starts with only a sliver of another top in reach. The bar is the largest of the lead's planted steps that shows nothing
// (24: 24 nothing, 32-48 faint, 64 plain). RED: the mean line on the first 2-7 Normal layout where it steps past the old bar (48) at a
// bank (found by what the line does, never an x); GREEN: the same build as drawn, no strip moves more than 24.
test('R-165.487 RED: the mean depth line steps past 48 at a 2-7 bank start; GREEN: as drawn (eased), no strip moves more than 24', async () => {
  const { depthSteps, DEPTH_STEP_MAX } = await import('./paintFall.ts');
  const { groundBanks, groundCeilings, setGroundStacks, DEPTH_EASE } = await import('../../src/game/protoArt.ts');
  const { stackZonesOf } = await import('../../src/game/groundStack.ts');
  const { generateAllLevels } = await import('../../src/game/worldsData.ts');
  const { generateStage, setLayoutVariant } = await import('../../src/game/stageGenerator.ts');
  const { withGoals } = await import('../../src/game/goals.ts');
  const { loadSeedList } = await import('../../src/game/gen2/seedList.ts');
  assert.equal(DEPTH_STEP_MAX, 24, 'the bar is the largest planted step that shows nothing');
  assert.ok(DEPTH_EASE < DEPTH_STEP_MAX, 'the line eases under the bar, a unit for the strip\'s rounding');
  const cfg = generateAllLevels().find((c) => c.id === '2-7' && !c.secret)!;
  assert.ok(await loadSeedList('2-7'));
  let found = false;
  for (let v = 0; v < 40 && !found; v++) {
    setLayoutVariant(v);
    const st = withGoals(generateStage({ ...cfg, unlocked: true }, 'normal')) as { platforms: Platform[]; rivers?: never; gen2?: { tower?: { legs?: never } } };
    setLayoutVariant(null);
    setGroundStacks(stackZonesOf(st.gen2?.tower?.legs), st.rivers);
    const banks = groundBanks(st.platforms);
    const cs = groundCeilings(st.platforms, banks);
    const tops = banks.filter((b) => !b.soil && !bankOpen(b, banks, undefined, cs)?.open.underside);
    const red = depthSteps(st.platforms, await meanAt(tops)).filter((d) => d.jump > 48);
    if (!red.length) continue;
    found = true;
    // (each red step is within LINE_REACH and a strip of a top's edge: where that top's reach starts to take in a sliver)
    assert.ok(red.every((d) => tops.some((b) => Math.abs(d.x - b.x) <= 256 || Math.abs(d.x - b.x - b.width) <= 256)), JSON.stringify(red.slice(0, 3)));
    assert.deepEqual(depthSteps(st.platforms), [], `drawn on layout ${v}: no strip moves the darkening more than ${DEPTH_STEP_MAX}`);
  }
  setGroundStacks([], undefined);
  assert.ok(found, 'a 2-7 Normal layout where the mean line steps past 48 (the plant is live)');
});

test('R-165.487: the eased line is the mean wherever the mean already eases, and a ramp of at most DEPTH_EASE a strip across a step', async () => {
  const { groundLine, meanLine, DEPTH_EASE } = await import('../../src/game/protoArt.ts');
  const { DEPTH_STRIP } = await import('../../src/game/groundPaint.ts');
  // (a wide pit: a high bank, 900 of gap, a bank 700 lower: in the pit's middle no top is in reach and the mean jumps to the nearer one)
  const hi = bank(0, 800, 2000, 300), lo = bank(2900, 1500, 2000, 300);
  const st = [hi, lo];
  paintOn(st);
  const line = groundLine(st), mean = await meanAt(st);
  const mid = (x: number) => (line(x)[0] + line(x)[1]) / 2;
  let worstMean = 0, worst = 0;
  for (let x = DEPTH_STRIP / 2; x < 5000; x += DEPTH_STRIP) {
    worstMean = Math.max(worstMean, Math.abs((mean(x + DEPTH_STRIP)[0] - mean(x)[0])));
    worst = Math.max(worst, Math.abs(mid(x + DEPTH_STRIP) - mid(x)));
  }
  assert.ok(worstMean > 48, `the plant: the mean steps ${worstMean} in a strip`);
  assert.ok(worst <= DEPTH_EASE + 1e-9 && worst <= 24, `eased: ${worst} a strip (the bar: 24, the largest planted step that shows nothing)`);
  // (far from the step, the line is the bank's own top, as before)
  assert.equal(Math.round(mid(200 + DEPTH_STRIP / 2) - mid(200 + DEPTH_STRIP / 2 - 16)), 0);
  assert.equal(Math.round(line(400)[0]), Math.round(meanLine(st, 400) - 0.55 * 900));
  assert.equal(Math.round(line(4600)[0]), Math.round(meanLine(st, 4600) - 0.55 * 900));
});
