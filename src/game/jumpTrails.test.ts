import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { buildStage, generateStage } from './stageGenerator.ts';
import { validateStage } from './levelCheck.ts';
import { addJumpTrails, routeGaps } from './jumpTrails.ts';

const levels = generateAllLevels().filter((l) => l.objectiveType !== 'boss_lair' && !l.secret && l.objectiveType !== 'ascent');
const sample = ['1-2', '2-3', '3-6', '4-4', '5-4', '6-2', '7-5', '8-5', '9-7', '10-3'].map((id) => levels.find((l) => l.id === id)).filter((l) => !!l);

test('a trail pass adds arcs only over gaps the route crosses, never inside a platform, and never twice', () => {
  for (const l of sample) {
    const st = generateStage(l!);
    // the finished stage already has its arcs: a second pass finds nothing to add
    const reach = validateStage(st).reachableIds;
    assert.equal(addJumpTrails(st, reach), 0, `${l!.id}: already trailed`);
  }
});

test('every route gap on the ground has a flower arc over it once the stage is built', () => {
  for (const l of sample) {
    const st = generateStage(l!);
    const reach = new Set(validateStage(st).reachableIds);
    for (const g of routeGaps(st, reach)) {
      const top = Math.min(g.y0, g.y1);
      const has = st.collectibles.some((c) => (c.type === 'flower' || c.type === 'leaf') && c.x > g.x0 - 30 && c.x < g.x1 + 30 && c.y < top + 20 && c.y > top - 260);
      assert.ok(has, `${l!.id}: the gap at x ${Math.round(g.x0)}-${Math.round(g.x1)} has no arc`);
    }
  }
});

test('what a pass adds sits over route gaps only (nothing leads to a side platform or a hidden fern), and the layout is untouched', () => {
  for (const l of sample) {
    const bare = buildStage(l!, 0);
    const platformsBefore = JSON.stringify(bare.platforms);
    const before = new Set(bare.collectibles.map((c) => c.id));
    const reach = new Set(validateStage(bare).reachableIds);
    const gaps = routeGaps(bare, reach);
    addJumpTrails(bare, [...reach]);
    assert.equal(JSON.stringify(bare.platforms), platformsBefore, `${l!.id}: platforms unchanged`);
    for (const c of bare.collectibles.filter((c) => !before.has(c.id))) {
      assert.ok(gaps.some((g) => c.x > g.x0 - 40 && c.x < g.x1 + 40), `${l!.id}: a trail flower at ${Math.round(c.x)} is not over a route gap`);
      const inside = bare.platforms.some((p) => p.type !== 'drift' && p.type !== 'moving' && c.x > p.x - 8 && c.x < p.x + p.width + 8 && c.y > p.y - 6 && c.y < p.y + p.height + 8);
      assert.ok(!inside, `${l!.id}: a trail flower sits inside a platform`);
    }
  }
});

test('a hidden fern is never put near a trail: no flower within the find\'s own clearance', () => {
  for (const l of levels.filter((x) => x.miniIndex === 5 || x.miniIndex === 8).slice(0, 12)) {
    const st = generateStage(l);
    const find = st.collectibles.find((c) => c.type === 'find' && c.hidden);
    if (!find) continue;
    for (const c of st.collectibles) {
      if (c === find || c.type === 'exit_totem') continue;
      assert.ok(Math.hypot(c.x - find.x, c.y - (find.y)) > 90, `${l.id}: a pickup sits right beside the fern`);
    }
  }
});
