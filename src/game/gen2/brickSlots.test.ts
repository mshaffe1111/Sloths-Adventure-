// One brick library across worlds (GAME-MAP A13; done-test "one brick laid in two worlds' art"): a brick's piece names the inventory's
// engine slot, the lay takes the look from the world's own row for it (WorldManifest.slots, built from that world's inventory file).
// Proved test-side on 1-1's OWN sections and proven plans: the same template objects laid by the real layStage in World 1's kit and in
// a World 2 art kit (World 2 has no gen2 kit: it is World 1's kit with World 2's inventory rows). Nothing in the game sets a slot yet.
//   npx tsx --test src/game/gen2/brickSlots.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import '../headlessDom.ts';
import { layStage, missionGraph, planBudget, stagePool, type Laid } from './pipeline.ts';
import { provenPlan, provenSeeds } from './seedList.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';
import { Inventory, type InventoryFile } from '../art/inventory.ts';
import { asBrick, slotOf, worldSlots } from './brickSlots.ts';
import type { SectionPiece, SectionTemplate, WorldKit } from './types.ts';

const cfg = { ...generateAllLevels().find((l) => l.id === '1-1')!, unlocked: true };
const inv = (w: number) => new Inventory(JSON.parse(readFileSync(new URL(`../art/inventory/w${w}.json`, import.meta.url), 'utf8')) as InventoryFile);
const INV = { 1: inv(1), 2: inv(2) } as const;
const K0 = w1World(), M0 = K0.manifest, POOL = stagePool(M0, '1-1'), GROUND = M0.ground.style;
const piecesOf = (t: SectionTemplate): SectionPiece[] => [...t.pieces, ...(t.subBlocks ?? []).flatMap((b) => b.versions.flatMap((v) => v.pieces))];
const slotsOf = (t: SectionTemplate) => [...new Set(piecesOf(t).map((p) => slotOf(p, GROUND)).filter((s): s is string => !!s))];
const ALL_SLOTS = [...new Set(POOL.flatMap(slotsOf))].sort();
const ROWS = { 1: worldSlots(INV[1], 1, ALL_SLOTS), 2: worldSlots(INV[2], 2, ALL_SLOTS) } as const;
/** a 1-1 section both worlds can dress: every slot its pieces fill has a row in World 1's AND World 2's inventory */
const both = (t: SectionTemplate) => slotsOf(t).every((s) => ROWS[1].slots[s] && ROWS[2].slots[s]);
/** the bricks: 1-1's own sections that both worlds can dress, each piece naming its slot (ONE object a section, laid in both kits) */
const BRICKS = new Map(POOL.filter(both).map((t) => [t.id, asBrick(t, GROUND)] as const));
/** World 1's kit for 1-1 as it is (`plain`), or with the bricks in the pool and world `w`'s slot rows */
const kit = (w?: 1 | 2): WorldKit => ({ ...K0, manifest: { ...M0, sections: w ? POOL.map((t) => BRICKS.get(t.id) ?? t) : POOL, ...(w ? { slots: ROWS[w].slots } : {}) } });
const lay = (seed: number, k: WorldKit): Laid => {
  const budget = planBudget(cfg, k.manifest, 'normal'), r = provenPlan('1-1', seed)!;
  return layStage(budget, missionGraph(budget, k.manifest, seed), k, r.seed, { plan: r.plan });
};
const geo = (L: Laid) => L.sections.map((q) => [q.template, ...q.pieces.map((p) => [p.key, p.platform.x, p.platform.y, p.platform.width, p.platform.height, p.platform.type])]);
const SEEDS = provenSeeds('1-1').slice(0, 8);

test('the inventory has what the proof needs: slots both worlds dress, with different art, and bricks to lay', () => {
  const shared = ALL_SLOTS.filter((s) => ROWS[1].slots[s] && ROWS[2].slots[s]);
  console.log(`1-1's pool fills ${ALL_SLOTS.length} slots: ${ALL_SLOTS.map((s) => `"${s}" (W1 ${ROWS[1].slots[s]?.art.length ?? 0}, W2 ${ROWS[2].slots[s]?.art.length ?? 0} pieces)`).join('; ')}`);
  console.log(`no row: World 1 ${JSON.stringify(ROWS[1].missing)}, World 2 ${JSON.stringify(ROWS[2].missing)}; ${BRICKS.size} of ${POOL.length} 1-1 sections are bricks both worlds can dress`);
  assert.ok(shared.length >= 2, `only ${shared.length} slot both worlds have a row for`);
  assert.ok(BRICKS.size >= 5, `only ${BRICKS.size} 1-1 sections both worlds can dress`);
  for (const s of shared) {
    const a = ROWS[1].slots[s], b = ROWS[2].slots[s];
    // (each world's row is its own art: no piece is in both rows, no made thing in World 1's, and every id is in that world's file)
    assert.deepEqual(a.art.filter((id) => b.art.includes(id)), [], `"${s}": the two worlds' rows share a piece`);
    for (const id of a.art) assert.ok(INV[1].byId(id) && !INV[1].byId(id)!.made_thing && INV[1].byId(id)!.engine_slot === s, `World 1 "${s}": ${id}`);
    for (const id of b.art) assert.ok(INV[2].byId(id)?.engine_slot === s && INV[2].byId(id)!.worlds.includes(2), `World 2 "${s}": ${id}`);
  }
});

test("one brick, two worlds' art: 1-1's own sections on proven plans, the same pieces where they stood, each in its own world's inventory row", () => {
  const seen = new Map<string, { w1: Set<string>; w2: Set<string> }>();
  let bricksLaid = 0;
  for (const seed of SEEDS) {
    const plain = lay(seed, kit()), a = lay(seed, kit(1)), b = lay(seed, kit(2));
    // (the same plan and the same pieces as today, in both worlds: a slot changes the look, never the geometry)
    assert.deepEqual(a.plan, plain.plan); assert.deepEqual(b.plan, plain.plan);
    assert.deepEqual(geo(a), geo(plain), `seed ${seed}: World 1's bricks moved a piece`);
    assert.deepEqual(geo(b), geo(plain), `seed ${seed}: World 2's bricks moved a piece`);
    for (const [i, sa] of a.sections.entries()) {
      const tpl = BRICKS.get(sa.template), sb = b.sections[i];
      if (!tpl) { assert.ok(sa.pieces.every((p) => p.slot === undefined && p.art === undefined), `seed ${seed}: ${sa.template} is no brick and carries a slot`); continue; }
      bricksLaid++;
      const named = new Map(piecesOf(tpl).map((p) => [p.key, p.slot] as const));
      for (const [j, pa] of sa.pieces.entries()) {
        const pb = sb.pieces[j], slot = named.get(pa.key);
        if (!slot) { assert.equal(pa.art, undefined); continue; }
        const r1 = ROWS[1].slots[slot], r2 = ROWS[2].slots[slot];
        assert.equal(pa.slot, slot); assert.equal(pb.slot, slot);
        assert.ok(pa.art && r1.art.includes(pa.art), `seed ${seed} ${sa.template}.${pa.key}: "${pa.art}" is not World 1's row for "${slot}"`);
        assert.ok(pb.art && r2.art.includes(pb.art), `seed ${seed} ${sb.template}.${pb.key}: "${pb.art}" is not World 2's row for "${slot}"`);
        assert.notEqual(pa.art, pb.art, `seed ${seed} ${sa.template}.${pa.key}: the two worlds drew the same piece`);
        assert.equal(pa.platform.style, r1.style); assert.equal(pb.platform.style, r2.style);
        const s = seen.get(slot) ?? { w1: new Set<string>(), w2: new Set<string>() };
        s.w1.add(pa.art); s.w2.add(pb.art); seen.set(slot, s);
      }
    }
  }
  assert.ok(bricksLaid >= SEEDS.length * 3, `only ${bricksLaid} bricks laid over ${SEEDS.length} proven stages`);
  assert.ok(seen.size >= 2, `only ${seen.size} slot was laid`);
  for (const [slot, s] of seen) console.log(`"${slot}": World 1 laid ${[...s.w1].sort().slice(0, 4).join(', ')}${s.w1.size > 4 ? ` (+${s.w1.size - 4})` : ''}; World 2 laid ${[...s.w2].sort().slice(0, 4).join(', ')}${s.w2.size > 4 ? ` (+${s.w2.size - 4})` : ''}`);
  console.log(`${bricksLaid} bricks laid over ${SEEDS.length} proven 1-1 plans, twice each`);
});

test('a world that gives the slot its own style lays the brick in that style (the row decides, not the section)', () => {
  const seed = SEEDS[0], log = 'landing/platforms solid log';
  const k = kit(2), ruin: WorldKit = { ...k, manifest: { ...k.manifest, slots: { ...k.manifest.slots, [log]: { style: 'ruin', art: ['a-ruin-beam'] } } } };
  const plain = lay(seed, kit(2)), L = lay(seed, ruin);
  const logs = L.sections.flatMap((q) => q.pieces).filter((p) => p.slot === log);
  assert.ok(logs.length > 0, `seed ${seed} lays no log brick piece`);
  for (const p of logs) { assert.equal(p.platform.style, 'ruin'); assert.equal(p.art, 'a-ruin-beam'); }
  assert.deepEqual(geo(L), geo(plain));
});

test('a brick that asks a slot the world has no row for fails by name (never a silent stand-in)', () => {
  const seed = SEEDS[0], k = kit(1), laid = lay(seed, k).sections.find((q) => BRICKS.has(q.template))!;
  const slot = slotsOf(BRICKS.get(laid.template)!)[0];
  const { [slot]: _gone, ...rest } = k.manifest.slots!;
  assert.throws(() => lay(seed, { ...k, manifest: { ...k.manifest, slots: rest } }), new RegExp(`${laid.template}.*asks slot "${slot}".*world 1 has no row`));
  // (and a world with no slot table at all: the same failure, by name)
  assert.throws(() => lay(seed, { ...k, manifest: { ...k.manifest, slots: undefined } }), /asks slot .* has no row/);
});

test('a section with no slot lays as it does today, whatever rows the world carries (nothing shipped moves)', () => {
  for (const seed of SEEDS.slice(0, 4)) {
    const plain = lay(seed, kit()), rows = lay(seed, { ...kit(), manifest: { ...kit().manifest, slots: ROWS[2].slots } });
    assert.deepEqual(rows.platforms, plain.platforms, `seed ${seed}`);
    assert.deepEqual(rows.sections.map((q) => q.pieces), plain.sections.map((q) => q.pieces), `seed ${seed}`);
  }
});
