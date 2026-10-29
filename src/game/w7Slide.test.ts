import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCourse, buildSlideStage, checkSlide, CRUMBLE_X0, CRUMBLE_X1, KINDS, SLIDE, SlideSim, slideSeconds, type SlideCourse } from './w7Slide.ts';
import type { LevelConfig } from './types.ts';

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

test('7-4 side-on: the crumble drops into the chute, a back wall stops him walking past, a catch floor under it, the shrine in the chamber', () => {
  const st = buildSlideStage(cfg, 1);
  const slide = st.proto.slide!;
  const crumble = st.platforms.filter((p) => slide.crumbleIds.includes(p.id));
  assert.equal(crumble.length, 2);
  assert.ok(crumble.every((p) => p.x >= CRUMBLE_X0 && p.x + p.width <= CRUMBLE_X1));
  assert.ok(st.platforms.some((p) => p.x === CRUMBLE_X1 && p.height > 400), 'the back wall');
  assert.ok(st.platforms.some((p) => p.x < CRUMBLE_X0 && p.x + p.width > CRUMBLE_X1 && p.y > 580), 'the catch floor');
  assert.ok(st.exitTotemX > slide.outAt.x);
  assert.equal(st.config.objectiveType, 'sprint');
});
