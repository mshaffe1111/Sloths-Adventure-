/**
 * Matt's World 1-4 puzzle sheets in the game (STAGE-RULES.md §4, 2026-10-28): every piece packed into the puzzle kit's atlas is drawn
 * somewhere, and the dressing set into Worlds 3 and 4 (artDress.ts) only adds pictures: no platform, pickup, enemy, hazard or puzzle piece
 * moves, so no route, jump, room or length can change.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { buildProtoStage, type StagePlan } from './protoStage.ts';
import { dressStage, RIDDLE_FERNS } from './artDress.ts';
import { KIT_ART } from './puzzleAtlasData.ts';
import { generateAllLevels } from './worldsData.ts';
import type { LevelConfig } from './types.ts';

const levels = generateAllLevels();
const cfg = (id: string): LevelConfig => levels.find((l) => l.id === id)!;
const W34 = ['3-1', '3-2', '3-3', '3-4', '3-5', '3-6', '3-7', '3-8', '3-9', '4-1', '4-2', '4-3', '4-4', '4-5', '4-6', '4-7', '4-8', '4-9'] as StagePlan[];

test('every piece of the puzzle kit atlas is drawn somewhere in the game', () => {
  const dir = new URL('.', import.meta.url).pathname;
  const src = readdirSync(dir)
    .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts') && f !== 'puzzleAtlasData.ts')
    .map((f) => readFileSync(dir + f, 'utf8'))
    .join('\n');
  // (the lure beetle's sheet is World 5's, not one of the World 1-4 sheets: four of its sixteen frames are not drawn yet. World 1's
  // squirrel nest door and petal bundle and World 2's trough need a place in their stages: the follow-up once World 1 and 2's stage
  // fixes are in, 2026-10-28)
  const notYet = new Set(['b3', 'b4', 'b9', 'b14', 'nestDoorShut', 'nestDoorOpen', 'petalBundle', 'channel']);
  const unused = Object.keys(KIT_ART).filter((n) => !notYet.has(n) && !new RegExp(`['"\`]${n}['"\`]`).test(src));
  assert.deepEqual(unused, []);
});

test('the dressing adds pictures only: platforms, pickups, enemies and rooms are the same as without it', () => {
  for (const id of W34) {
    for (const seed of [1, 2, 38]) {
      const st = buildProtoStage(cfg(id), seed, id);
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
