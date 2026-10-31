/**
 * World 8's heart falls (Matt, 2026-10-31: "hurt, then cost a life"): on Normal a missed swing or glide costs a heart, not a life, and sets
 * Pokey back on the ledge he left; his last heart is a life lost as any fall. One rule (w8.ts heartFalls, pipeline.ts): every gap under a
 * liana and every glide gap outside the dark is a heart fall on Normal, with no pit laid under it; Easy keeps its soft pits. Lit hops and
 * jumps stay deadly on Normal.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { generateAllLevels } from '../worldsData.ts';
import { generateStage, setLayoutVariant } from '../stageGenerator.ts';
import { RealPlay } from '../realPlay.ts';

const build = (id: string, layout: number, diff: 'normal' | 'easy') => {
  const cfg = generateAllLevels().find((l) => l.id === id)!;
  setLayoutVariant(layout);
  try {
    return generateStage({ ...cfg, unlocked: true }, diff);
  } finally {
    setLayoutVariant(null);
  }
};

test("World 8 Normal: every swing's and glide's gap outside the dark is a heart fall with no pit under it; Easy has none", () => {
  for (const id of ['8-3', '8-6']) {
    for (const layout of [0, 1, 2]) {
      const st = build(id, layout, 'normal');
      const hearts = st.heartFalls ?? [];
      assert.ok(hearts.length >= 3, `${id} layout ${layout}: only ${hearts.length} heart falls`);
      const dark = (st.zones ?? []).filter((z) => z.kind === 'dark');
      // (a liana's gap: under the vine; its heart fall spans it)
      for (const v of st.vines.filter((q) => q.vineType !== 'tree_climb')) {
        if (dark.some((z) => v.x > z.x0 && v.x < z.x1)) continue;
        assert.ok(hearts.some((h) => v.x > h.x0 - 200 && v.x < h.x1 + 200), `${id} layout ${layout}: the liana at ${Math.round(v.x)} has no heart fall`);
      }
      for (const h of hearts) {
        // (no floor in the gap: a fall drops out of the stage, where the heart is taken)
        const floor = st.platforms.filter((p) => p.x > h.x0 + 4 && p.x + p.width < h.x1 - 4 && p.y > 0);
        assert.deepEqual(floor.map((p) => [Math.round(p.x), Math.round(p.y)]), [], `${id} layout ${layout}: a pit floor under the heart fall ${h.x0}-${h.x1}`);
      }
      assert.equal(build(id, layout, 'easy').heartFalls, undefined, `${id} layout ${layout}: Easy has heart falls`);
    }
  }
});

test('World 8 Normal in the real engine: a fall at a glide costs a heart and sets him back on his ledge; his last heart is a life', () => {
  const r = new RealPlay('8-6', 0);
  const st = r.stage;
  const h = st.heartFalls![0];
  for (let i = 0; i < 30; i++) r.frame();
  assert.ok(r.p.grounded, 'standing at the start');
  const start = { x: r.p.x, y: r.p.y, hp: r.p.hp };
  const fall = () => {
    r.p.x = (h.x0 + h.x1) / 2;
    r.p.y = st.config.levelHeight + 200;
    r.p.vy = 400;
    r.p.grounded = false;
    r.frame();
  };
  fall();
  assert.equal(r.died, false, 'a heart, not a life');
  assert.equal(r.p.hp, start.hp - 1, 'one heart taken');
  assert.ok(Math.abs(r.p.x - start.x) < 40 && Math.abs(r.p.y - start.y) < 120, `set back on the ledge he left (${Math.round(r.p.x)},${Math.round(r.p.y)})`);
  assert.ok(r.p.invincibleTimer > 0, 'blinking a moment');
  for (let i = 0; i < 60; i++) r.frame();
  r.p.hp = 1;
  fall();
  assert.equal(r.died, true, 'his last heart: a life lost');
});
