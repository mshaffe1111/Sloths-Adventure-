import test from 'node:test';
import assert from 'node:assert/strict';
import type { Collectible, Platform } from './types.ts';
import { badPickups, fixPickups, reachable } from './flowerReach.ts';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { buildProtoStage } from './protoStage.ts';
import { skillHeldAt } from './skills.ts';
import { validateStage } from './levelCheck.ts';

const plat = (id: number, x: number, y: number, width: number, height = 26): Platform => ({ id, x, y, width, height, type: 'solid' });
const flower = (id: number, x: number, y: number): Collectible => ({ id, type: 'flower', x, y, collected: false, bobPhase: 0 });

test('a flower tucked under a low branch moves up onto the branch', () => {
  const ground = plat(1, 0, 580, 2000, 90);
  const branch = plat(2, 600, 512, 120, 28);
  const items = [flower(1, 650, 548)];
  const w = { platforms: [ground, branch], vines: [] };
  assert.equal(badPickups(w, items).length, 1);
  assert.equal(fixPickups(w, items), 1);
  assert.equal(items[0].y, 512 - 34);
  assert.ok(items[0].x >= 616 && items[0].x <= 704);
  assert.equal(badPickups(w, items).length, 0);
});

test('a flower under a branch over the water, with nothing to land on, is out of reach', () => {
  const left = plat(1, 0, 580, 500, 90);
  const right = plat(2, 1500, 580, 500, 90);
  const branch = plat(3, 700, 420, 400);
  const w = { platforms: [left, right, branch], vines: [], waterY: 730 };
  // well under the branch and below the banks: he could only get it by falling in
  assert.equal(reachable(w, 900, 650), false);
  // on the branch, and beside the bank on a jump's arc: fine
  assert.equal(reachable(w, 900, 420 - 34), true);
  assert.equal(reachable(w, 600, 520), true);
});

test('a jump arc over a gap and a let-go arc off a swing count as reachable', () => {
  const w = { platforms: [plat(1, 0, 580, 500, 90), plat(2, 800, 580, 500, 90)], vines: [], waterY: 730 };
  assert.equal(reachable(w, 650, 470), true);
  const vine = { id: 1, x: 760, topY: 200, bottomY: 610, swaySpeed: 0, swayPhase: 0, vineType: 'swing_liana' as const };
  const swing = { platforms: [plat(1, 0, 580, 500, 90), plat(2, 1100, 580, 500, 90)], vines: [vine], waterY: 730 };
  assert.equal(reachable(swing, 1060, 420), true);
});

test('every flower, fruit and leaf in every stage is somewhere he can get it', () => {
  const levels = generateAllLevels();
  const bad: string[] = [];
  for (const l of levels) {
    for (const v of [1, 2]) {
      setLayoutVariant(v);
      const st = generateStage(l);
      const w = { platforms: st.platforms, vines: st.vines, ropes: st.ropes, waterY: st.waterY, glide: skillHeldAt('glide', (l.worldIndex - 1) * 10 + l.miniIndex) };
      for (const c of badPickups(w, st.collectibles)) bad.push(`${l.id}/${v} ${c.type} (${Math.round(c.x)}, ${Math.round(c.y)})`);
      if (v === 1) {
        const errs = validateStage(st).errors.filter((e) => /out of reach|inside platform|overlap/.test(e));
        if (errs.length) bad.push(`${l.id}: ${errs[0]}`);
      }
    }
  }
  setLayoutVariant(null);
  for (const [id, plan] of [['1-2', 'ctest'], ['1-6', 'proto'], ['1-1', '1-1']] as const) {
    for (const seed of [1, 2, 7]) {
      const st = buildProtoStage(levels.find((l) => l.id === id)!, seed, plan);
      for (const c of badPickups({ platforms: st.platforms, vines: st.vines, waterY: st.waterY }, st.collectibles)) bad.push(`${plan}/${seed} ${c.type} (${Math.round(c.x)}, ${Math.round(c.y)})`);
    }
  }
  assert.deepEqual(bad.slice(0, 12), []);
});
