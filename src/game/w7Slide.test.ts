import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCourse, buildSlideStage, checkSlide, CRUMBLE_X0, CRUMBLE_X1, KINDS, SLIDE, SlideSim, slideSeconds, type SlideCourse } from './w7Slide.ts';
import type { LevelConfig } from './types.ts';
import { buildScene, lightAt, POKEY_MIN } from './w7SlideScene.ts';
import { pokeyLight } from './w7SlideArt.ts';
import { measure } from '../../tools/art/slide74/jumps.ts';

const cfg: LevelConfig = {
  worldIndex: 7, miniIndex: 4, id: '7-4', name: 'The Way Down', objectiveType: 'ascent', targetCount: 1, timeLimit: 0, levelWidth: 8000,
  levelHeight: 1000, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
};

/** a sure player: in a lane clear of the next heads and columns, jumps what must be jumped, ducks the beams */
function play(c: SlideCourse, miss = -1) {
  const s = new SlideSim(c);
  const dt = 1 / 30;
  for (let f = 0; f < 30 * 200 && !s.done; f++) {
    const ahead = s.sorted.filter((o, i) => i !== miss && o.z + o.len > s.z && o.z < s.z + c.speed * 1.3);
    const block = ahead.find((o) => o.kind === 'head' || o.kind === 'column');
    let want = Math.round(s.x / SLIDE.lane) + 1;
    if (block?.lanes.includes(want)) want = [0, 1, 2].filter((l) => !block.lanes.includes(l)).sort((a, b) => Math.abs(a - want) - Math.abs(b - want))[0];
    const tx = (want - 1) * SLIDE.lane;
    const inp = { left: tx < s.x - 0.1, right: tx > s.x + 0.1, jumpPressed: false, down: false };
    for (const o of ahead) {
      const dz = o.z - s.z;
      if ((KINDS[o.kind].beat === 'jump' || (o.kind === 'column' && o.lanes.includes(want))) && dz > 0 && dz < c.speed * 0.2) inp.jumpPressed = true;
      if (o.kind === 'beam' && dz < c.speed * 0.35) inp.down = true;
    }
    s.step(dt, inp);
  }
  return s;
}

test('every roll on both settings has a clear lane he can reach, room between obstacles, and time to read them', () => {
  for (const easy of [false, true]) for (let seed = 1; seed <= 200; seed++) assert.deepEqual(checkSlide(buildCourse(seed, easy)), [], `seed ${seed} ${easy ? 'Easy' : 'Normal'}`);
});

test('a sure player slides the whole chute without a hit, on both settings, and it takes about 110 s', () => {
  for (const easy of [false, true]) for (const seed of [1, 2, 3, 17]) {
    const c = buildCourse(seed, easy);
    const s = play(c);
    assert.ok(s.done, `seed ${seed}`);
    assert.equal(s.hits + s.stumbles, 0, `seed ${seed} ${easy ? 'Easy' : 'Normal'}: ${s.hits} hits`);
    assert.ok(s.clock > 105 && s.clock < 118, `${s.clock}`);
    assert.ok(slideSeconds(c) >= 120, 'the stage is at least 2 minutes');
  }
});

test('Easy is slower with fewer obstacles, never two lanes of heads at once', () => {
  const n = buildCourse(1, false), e = buildCourse(1, true);
  assert.ok(e.speed < n.speed);
  assert.ok(e.obstacles.length < n.obstacles.length * 0.85);
  assert.ok(e.obstacles.every((o) => o.kind !== 'head' || o.lanes.length === 1));
});

test('the first of each kind is taught: his line comes before it, and running into it costs no heart', () => {
  const c = buildCourse(1, false);
  for (const k of Object.keys(KINDS)) {
    const first = c.obstacles.filter((o) => o.kind === k).sort((a, b) => a.z - b.z)[0];
    assert.ok(first?.taught, k);
    const line = c.lines.find((l) => l.id === k)!;
    assert.ok(line.z < first.z - c.speed * 2 && line.z > first.z - (SLIDE.far - SLIDE.fade), `${k}: the line comes while it is in view, 2 s ahead`);
    assert.ok(line.text.split(/\s+/).length < 10, line.text);
  }
  // doing nothing at all: every taught one is a stumble, and the rest cost hearts
  const s = new SlideSim(c);
  let hearts = 0;
  for (let f = 0; f < 30 * 200 && !s.done; f++) {
    s.step(1 / 30, { left: false, right: false, jumpPressed: false, down: false });
    for (const e of s.events) if ((e.k === 'hit' && !e.taught) || e.k === 'fall') hearts++;
  }
  assert.ok(s.done, 'even doing nothing, the chute ends: nothing strands him');
  assert.ok(s.stumbles >= 3 && s.stumbles <= 5, `${s.stumbles}`); // (the first heads may be in another lane than his)
  assert.equal(hearts, s.hits);
  assert.ok(s.hits > 5);
});

test('a hit costs one heart and a moment of safety, not a life; a life lost goes back to the last flag', () => {
  const c = buildCourse(1, false);
  const s = new SlideSim(c);
  const o = s.sorted.find((o) => o.kind === 'head' && !o.taught)!;
  s.z = o.z - 3;
  s.x = (o.lanes[0] - 1) * SLIDE.lane;
  const still = { left: false, right: false, jumpPressed: false, down: false };
  for (let f = 0; f < 20; f++) s.step(1 / 30, still);
  assert.equal(s.hits, 1, 'one heart');
  assert.ok(s.safeT > 0.5, 'and safe for a moment after');
  const r = new SlideSim(c);
  r.z = c.flags[1] + 30;
  r.flagZ = c.flags[1];
  r.respawn();
  assert.equal(r.z, c.flags[1]);
  assert.ok(r.safeT > SLIDE.safe);
});

test('7-4 side-on: the crumble drops into the chute, the hall floor runs on past it, a hidden catch floor under it, the shrine in the chamber', () => {
  const st = buildSlideStage(cfg, 1);
  const slide = st.proto.slide!;
  const crumble = st.platforms.filter((p) => slide.crumbleIds.includes(p.id));
  assert.equal(crumble.length, 2);
  assert.ok(crumble.every((p) => p.x >= CRUMBLE_X0 && p.x + p.width <= CRUMBLE_X1));
  assert.ok(st.platforms.some((p) => p.x === CRUMBLE_X1 && p.y === 580), 'the hall floor runs on past the crumble (no cut-out back wall)');
  assert.ok(st.platforms.some((p) => p.art === 'hidden' && p.y > 580), 'the catch floor, never drawn');
  assert.ok(st.platforms.some((p) => p.x < CRUMBLE_X0 && p.x + p.width > CRUMBLE_X1 && p.y > 580), 'the catch floor');
  assert.ok(st.exitTotemX > slide.outAt.x);
  assert.equal(st.config.objectiveType, 'sprint');
});

test('every move is needed (Matt: "everything can be done just by avoiding objects"): a player who only steers is hit by every wall, gap and doorway after the taught ones', () => {
  for (const easy of [false, true]) for (const seed of [1, 2, 3]) {
    const c = buildCourse(seed, easy);
    const across = c.obstacles.filter((o) => o.lanes.length === 3);
    assert.ok(across.length >= c.obstacles.length * 0.4, `${across.length} of ${c.obstacles.length} across the whole chute`);
    for (const k of ['rubble', 'gap', 'beam'] as const) assert.ok(across.filter((o) => o.kind === k).length >= 3, `${k} on ${easy ? 'Easy' : 'Normal'}`);
    // a steerer: always in a lane clear of statues and columns, never jumps or ducks
    const s = new SlideSim(c);
    for (let f = 0; f < 30 * 200 && !s.done; f++) {
      const block = s.sorted.find((o) => (o.kind === 'head' || o.kind === 'column') && o.z + o.len > s.z && o.z < s.z + c.speed * 1.3);
      let want = Math.round(s.x / SLIDE.lane) + 1;
      if (block?.lanes.includes(want)) want = [0, 1, 2].filter((l) => !block.lanes.includes(l)).sort((a, b) => Math.abs(a - want) - Math.abs(b - want))[0];
      const tx = (want - 1) * SLIDE.lane;
      s.step(1 / 30, { left: tx < s.x - 0.1, right: tx > s.x + 0.1, jumpPressed: false, down: false });
    }
    // (each across-the-chute thing he meets costs a heart, unless it came in the moment of safety after the one before)
    assert.ok(s.hits + s.stumbles >= across.length * 0.6, `${easy ? 'Easy' : 'Normal'} roll ${seed}: only ${s.hits + s.stumbles} of ${across.length}`);
  }
});

test('the dark under the temple: every obstacle has its own light, well above the ambient, and Pokey never goes below 60%', () => {
  const ambient = lightAt({ lights: [], props: [], beats: [] }, 0, 0, 0);
  for (const easy of [false, true]) for (const seed of [1, 2, 3]) {
    const c = buildCourse(seed, easy);
    const sc = buildScene(c);
    for (const o of c.obstacles) {
      const y = o.kind === 'beam' ? 1.0 : o.kind === 'gap' ? 0 : 0.5;
      for (const l of o.kind === 'head' || o.kind === 'column' ? o.lanes : [0, 1, 2]) {
        const lit = lightAt(sc, (l - 1) * SLIDE.lane, y, o.z);
        assert.ok(lit >= ambient * 2, `${easy ? 'Easy' : 'Normal'} roll ${seed}: ${o.kind} at ${o.z} lane ${l} is lit ${lit.toFixed(2)} (ambient ${ambient.toFixed(2)})`);
      }
    }
    // the colour script: torch-lit, then the fungus cavern, then the narrow dark, then the way out
    assert.deepEqual([...new Set(sc.beats.map((b) => b.beat))], ['torch', 'fungus', 'dark', 'end']);
    for (let z = 0; z < c.length; z += 2) for (const k of pokeyLight(sc, 0, 0.6, z)) assert.ok(k >= POKEY_MIN - 1e-9);
  }
});

test('every jump is makeable by a real thumb (Matt, 2026-10-29: "Couldn\'t make it thru... let\'s make sure it\'s possible")', () => {
  // each jump's frame-exact window, from the real SlideSim at 30 fps, against the house thumb plus judgement noise: the adult on Normal
  // clears every one at least 90% of the time (the house bar is 70%), the kid on Easy at least 85%; and every one is readable on screen
  // at least 0.8 s to react + 0.6 s to act before the last good press (tools/art/slide74/jumps.ts)
  for (const easy of [false, true]) {
    const rows = measure(buildCourse(1, easy));
    assert.ok(rows.length >= 15);
    for (const r of rows) {
      assert.ok(r.read >= 1.4, `${easy ? 'Easy' : 'Normal'} ${r.kind} at ${r.t.toFixed(1)} s: readable only ${r.read.toFixed(2)} s`);
      assert.ok(r.thumb >= (easy ? 0.85 : 0.9), `${easy ? 'Easy' : 'Normal'} ${r.kind} at ${r.t.toFixed(1)} s: the thumb makes it ${(r.thumb * 100).toFixed(0)}%`);
    }
  }
});
