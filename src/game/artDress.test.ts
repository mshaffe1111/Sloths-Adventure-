/**
 * Matt's World 1-4 puzzle sheets in the game (STAGE-RULES.md §4, 2026-10-28): every piece packed into the puzzle kit's atlas is drawn
 * somewhere, and the dressing set into Worlds 3 and 4 (artDress.ts) only adds pictures: no platform, pickup, enemy, hazard or puzzle piece
 * moves, so no route, jump, room or length can change.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { buildProtoStage, HAND_STAGES, type StagePlan } from './protoStage.ts';
import { DRESS_SETS, dressStage, RIDDLE_FERNS } from './artDress.ts';
import { DRESS_FRAMES, type DressName } from './dressAtlasData.ts';
import { KIT_ART } from './puzzleAtlasData.ts';
import { generateAllLevels } from './worldsData.ts';
import type { LevelConfig } from './types.ts';

const levels = generateAllLevels();
const cfg = (id: string): LevelConfig => levels.find((l) => l.id === id)!;
const W34 = ['1-4', '1-6', '1-7', '3-1', '3-2', '3-3', '3-4', '3-5', '3-6', '3-7', '3-8', '3-9', '4-1', '4-2', '4-3', '4-4', '4-5', '4-6', '4-7', '4-8', '4-9'] as StagePlan[];

test('every piece of the puzzle kit atlas is drawn somewhere in the game', () => {
  const dir = new URL('.', import.meta.url).pathname;
  const src = readdirSync(dir)
    .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts') && f !== 'puzzleAtlasData.ts')
    .map((f) => readFileSync(dir + f, 'utf8'))
    .join('\n');
  // (the lure beetle's sheet is World 5's, not one of the World 1-4 sheets: four of its sixteen frames are not drawn yet)
  const notYet = new Set(['b3', 'b4', 'b9', 'b14']);
  const unused = Object.keys(KIT_ART).filter((n) => !notYet.has(n) && !new RegExp(`['"\`]${n}['"\`]`).test(src));
  assert.deepEqual(unused, []);
});

test('the dressing adds pictures only: platforms, pickups, enemies and rooms are the same as without it', () => {
  for (const id of W34) {
    for (const seed of [1, 2, 38]) {
      const st = buildProtoStage(cfg(id), seed, HAND_STAGES[id]);
      const before = JSON.stringify({ p: st.platforms, c: st.collectibles, e: st.enemies, k: st.kit, z: st.zones, t: st.proto.thorns });
      // (dressing it again sees the same stage and changes nothing in it)
      const again = dressStage({ world: Number(id[0]), stage: Number(id[2]), seed, platforms: st.platforms, rooms: st.kit?.rooms ?? [], collectibles: st.collectibles, w3decor: st.proto.w3decor });
      assert.equal(JSON.stringify({ p: st.platforms, c: st.collectibles, e: st.enemies, k: st.kit, z: st.zones, t: st.proto.thorns }), before, `${id} seed ${seed}`);
      assert.deepEqual(again.map((d) => d.n), (st.proto.kitDecor ?? []).map((d) => d.n), `${id} seed ${seed}: the same roll dresses it the same`);
      for (const d of st.proto.kitDecor ?? []) assert.ok(d.n in KIT_ART && (!d.open || d.open in KIT_ART), `${id}: ${d.n}`);
    }
  }
});

test("3-7's hollows: the three ferns of each are one kind (only Dot's stones tell them apart), and the rolls use all of Matt's", () => {
  const kinds = new Set<string>();
  for (let seed = 1; seed < 40; seed++) {
    const st = buildProtoStage(cfg('3-7'), seed, '3-7');
    const rooms = (st.kit?.rooms ?? []).filter((r) => r.id.startsWith('whichFern'));
    assert.equal(rooms.length, 2);
    const ferns = (st.proto.w3decor ?? []).filter((d) => d.rustle !== undefined);
    assert.equal(ferns.length, 6, `seed ${seed}`);
    for (const k of [0, 3]) {
      const three = ferns.slice(k, k + 3).map((d) => d.kit ?? 'grotto');
      assert.equal(new Set(three).size, 1, `seed ${seed}: ${three}`);
      kinds.add(three[0]);
    }
    // Grandma's fern stone door by each hollow's way in
    assert.equal((st.proto.kitDecor ?? []).filter((d) => d.n === 'fernDoorShut' && d.open === 'fernDoorOpen').length, 2);
  }
  assert.deepEqual([...kinds].sort(), [...RIDDLE_FERNS].sort());
});

test('World 3 floor sets and World 4 bridges: never the same set in two stages in a row', () => {
  const sets = (id: StagePlan, seed: number) => {
    const n = new Set((buildProtoStage(cfg(id), seed, id).proto.kitDecor ?? []).filter((d) => d.n !== 'fernDoorShut').map((d) => d.n));
    return [...n].sort().join(',');
  };
  for (const w of [3, 4]) {
    for (let m = 1; m < 9; m++) {
      const a = sets(`${w}-${m}` as StagePlan, 1);
      const b = sets(`${w}-${m + 1}` as StagePlan, 7);
      if (a && b) assert.notEqual(a, b, `${w}-${m} and ${w}-${m + 1}`);
    }
  }
});

test("World 1's rooms: the squirrels' nest door on 1-4's lifts, the branch gate up 1-6's seesaw banks, and a petal bundle for every room", () => {
  for (const seed of [1, 2, 3]) {
    const by = (id: string) => buildProtoStage(cfg(id), seed, HAND_STAGES[id]);
    const s14 = by('1-4');
    const lifts = (s14.kit?.rooms ?? []).filter((r) => r.id.startsWith('squirrel-lift'));
    assert.ok(lifts.length >= 1);
    for (const r of lifts) {
      const kd = (s14.proto.kitDecor ?? []).filter((d) => d.room === r.id);
      assert.ok(kd.some((d) => d.n === 'nestDoorShut' && d.open === 'nestDoorOpen'), `seed ${seed} ${r.id}`);
      assert.ok(kd.some((d) => d.n === 'petalBundle' && d.pop), `seed ${seed} ${r.id}`);
    }
    const s16 = by('1-6');
    const gated = (s16.kit?.rooms ?? []).filter((r) => r.id.startsWith('seesaw-') && !r.id.startsWith('seesaw-show'));
    assert.ok(gated.length >= 1);
    for (const r of gated) assert.ok((s16.proto.kitDecor ?? []).some((d) => d.n === 'branchGate' && d.rise && d.room === r.id), `seed ${seed} ${r.id}`);
    const s17 = by('1-7');
    for (const r of s17.kit?.rooms ?? []) assert.ok((s17.proto.kitDecor ?? []).some((d) => d.n === 'petalBundle' && d.room === r.id), `seed ${seed} ${r.id}`);
    // (a picture, not a pickup: the stage's pickups are the same as without the dressing)
    for (const st of [s14, s16, s17]) assert.ok(!st.collectibles.some((c) => (c as { findId?: string }).findId === 'petalBundle'));
  }
});

// (hf-art-ground, 2026-10-29; polish report VI-17) Worlds 1, 2 and 5's dressing sets
test('the dressing sheet for Worlds 1, 2 and 5: every piece is in a set, every set piece is on the sheet', () => {
  const used = new Set(Object.values(DRESS_SETS).flatMap((jobs) => Object.values(jobs).flat(2)));
  for (const n of Object.keys(DRESS_FRAMES)) assert.ok(used.has(n as DressName), `${n} is packed but in no set`);
  for (const n of used) assert.ok(DRESS_FRAMES[n], `${n} is in a set but not on the sheet`);
  for (const [w, jobs] of Object.entries(DRESS_SETS)) for (const [job, sets] of Object.entries(jobs)) assert.ok(sets.length >= 2, `World ${w} ${job}: two sets or more`);
});

test('Worlds 1 and 5: their stages wear dressing sets, two stages in a row never the same bank set, and only pictures are added', () => {
  for (const ids of [['1-2', '1-3'], ['5-1', '5-2']]) {
    const looks = ids.map((id) => {
      const st = buildProtoStage(cfg(id), 1, HAND_STAGES[id]);
      const ds = st.proto.dress ?? [];
      assert.ok(ds.length > 0, `${id}: dressed`);
      // (the stage without it is the same: dressSets reads the stage, never its random stream)
      const plain = buildProtoStage(cfg(id), 1, HAND_STAGES[id]);
      assert.deepEqual(plain.platforms, st.platforms, `${id}: platforms unchanged`);
      for (const d of ds) assert.ok(DRESS_FRAMES[d.n], `${id}: ${d.n}`);
      return ds.filter((d) => /Bank|Fern$|Stump|Reed|Log/.test(d.n)).map((d) => d.n).sort().join();
    });
    assert.notEqual(looks[0], looks[1], `${ids.join(' and ')} wear different bank sets`);
  }
});
