/**
 * Petals on the arcs of a stage's REQUIRED hops (INT-10, 11-15; the lead's ruling 11:10 AM ET): gen2/walkedSpan.ts hopArcs finds each
 * hop every run must take (a gap or a rise more than a seam, no liana between) and flies it as the middle tier does; petals.ts arcPetals
 * lays a petal at its apex where the stage's brief asks (GraphBrief.petalArcs: 1-6 only), so 1-6 reads inside World 1's built band
 * instead of empty (0.22 petals an upright screen before). Planted: python3 reference/qa-reports/INT-10/planted.py (each plant RED).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { hopArcs, TAKEOFF_MID } from './walkedSpan.ts';
import { withSetting } from '../settingDials.ts';
import type { Platform, Vine } from '../types.ts';

const P = (id: number, x: number, y: number, width: number, height = 120): Platform => ({ id, x, y, width, height, type: 'solid' } as Platform);
const L = (id: number, x: number, topY: number, bottomY: number): Vine =>
  ({ id, x, topY, bottomY, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true } as Vine);

test('a toy: a rise and a gap are required hops, each flown from the middle tier take-off to a touchdown on the next piece; a seam and a walk-off drop are not', () => {
  withSetting('normal', () => {
    const a = P(1, 0, 600, 300), up = P(2, 300, 540, 260), gap = P(3, 660, 540, 300), down = P(4, 960, 600, 300), flat = P(5, 1260, 600, 300);
    const arcs = hopArcs({ platforms: [a, up, gap, down, flat], vines: [] });
    const pairs = arcs.map((h) => `${h.from.id}>${h.to.id}`);
    assert.deepEqual(pairs, ['1>2', '2>3'], `the rise (1>2) and the gap (2>3) only; the drop he walks off (3>4) and the seam (4>5) are walked (${pairs})`);
    for (const h of arcs) {
      assert.equal(h.takeoffX, h.from.x + h.from.width - TAKEOFF_MID, 'taken off the middle tier aim before the edge (a 100 px gap, a rise)');
      assert.ok(h.landX >= h.to.x && h.landX <= h.to.x + h.to.width, `comes down on the next piece (${h.landX})`);
      const [apex] = h.points;
      assert.ok(apex.x > h.takeoffX && apex.x < h.landX, 'the apex lies between the take-off and the touchdown');
      assert.ok(apex.y < Math.min(h.from.y, h.to.y) - 20, `the apex row hangs over both pieces (${apex.y})`);
    }
  });
});

test('a toy: a gap the middle tier aim falls short of is taken off nearer the edge, where the hop is made', () => {
  withSetting('normal', () => {
    const a = P(1, 0, 600, 300), b = P(2, 440, 600, 300);
    const [h] = hopArcs({ platforms: [a, b], vines: [] });
    assert.ok(h, 'a 140 px gap is a required hop');
    assert.ok(h.takeoffX > a.x + a.width - TAKEOFF_MID && h.takeoffX <= a.x + a.width, `taken off nearer the edge (${h.takeoffX})`);
    assert.ok(h.landX >= b.x, `and it lands (${h.landX})`);
  });
});

test('a toy: a liana between two pieces is a swing, never a hop: no arc over a liana gap (BUILD-16b)', () => {
  withSetting('normal', () => {
    const a = P(1, 0, 600, 300), b = P(2, 400, 560, 280);
    assert.equal(hopArcs({ platforms: [a, b], vines: [] }).length, 1, 'the gap alone is a hop');
    assert.equal(hopArcs({ platforms: [a, b], vines: [L(9, 350, 180, 560)] }).length, 0, 'with a liana over it, none');
  });
});

test('a toy: a piece off the path (a pit floor) is never a hop end', () => {
  withSetting('normal', () => {
    const a = P(1, 0, 600, 300), floor = P(2, 400, 700, 200), b = P(3, 700, 600, 300);
    const away = (p: Platform) => p === floor;
    const pairs = hopArcs({ platforms: [a, floor, b], vines: [], away }).map((h) => `${h.from.id}>${h.to.id}`);
    assert.ok(!pairs.some((s) => s.includes('2')), `the pit's floor is no hop's end (${pairs})`);
  });
});

/** petals per upright screen (440 px, cameraFollow.test VIEWS.upright) and the share of bare screens, Normal layouts 1-5 as Play builds them */
async function band(id: string): Promise<{ per: number; bare: number; arcs: number }> {
  const { generateStage, setLayoutVariant } = await import('../stageGenerator.ts');
  const { generateAllLevels } = await import('../worldsData.ts');
  const { isPetal } = await import('../petals.ts');
  let per = 0, bare = 0, arcs = 0;
  for (let v = 1; v <= 5; v++) {
    setLayoutVariant(v);
    const st = generateStage({ ...generateAllLevels().find((l) => l.id === id)!, unlocked: true }, 'normal');
    setLayoutVariant(null);
    const xs = st.collectibles.filter((c) => isPetal(c, st)).map((c) => c.x);
    const x0 = st.spawnX, x1 = st.exitTotemX ?? Math.max(...st.platforms.map((p) => p.x + p.width));
    const n = Math.max(1, Math.floor((x1 - x0) / 440));
    let e = 0;
    for (let k = 0; k < n; k++) if (!xs.some((x) => x >= x0 + k * 440 && x < x0 + (k + 1) * 440)) e++;
    per += xs.length / n; bare += e / n;
    arcs += st.collectibles.filter((c) => isPetal(c, st) && !st.platforms.some((p) => c.x >= p.x && c.x <= p.x + p.width && p.y - c.y > 0 && p.y - c.y <= 60)).length;
  }
  return { per: per / 5, bare: bare / 5, arcs };
}

test("1-6 reads inside World 1's built band (1-3 0.86 and 1-5 1.04 petals an upright screen, INT-10 measured): it read 0.22, 85% bare", async () => {
  const b = await band('1-6');
  assert.ok(b.arcs > 0, 'its brief asks for the hops\' arcs: some petals hang over a hop');
  assert.ok(b.per >= 0.86 && b.per <= 1.2, `1-6: ${b.per.toFixed(2)} petals an upright screen (band 0.86-1.04, at most 1-1's 1.25)`);
  assert.ok(b.bare <= 0.51, `1-6: ${(100 * b.bare).toFixed(0)}% of upright screens bare (1-3: 51%)`);
});

test("1-6's arc petals are a bonus: picked like any petal, never counted by the door's share (goals.ts goalCounts; INT-10)", async () => {
  const { generateStage, setLayoutVariant } = await import('../stageGenerator.ts');
  const { generateAllLevels } = await import('../worldsData.ts');
  const { goalCounts } = await import('../goals.ts');
  setLayoutVariant(1);
  const st = generateStage({ ...generateAllLevels().find((l) => l.id === '1-6')!, unlocked: true }, 'normal');
  setLayoutVariant(null);
  const arcs = st.collectibles.filter((c) => c.arc);
  assert.ok(arcs.length > 0 && arcs.every((c) => c.type === 'flower'), `1-6 layout 1 holds arc petals (${arcs.length})`);
  const all = st.collectibles.filter((c) => c.type === 'flower' || c.type === 'leaf').length;
  assert.ok(goalCounts(st as never).petals <= all - arcs.length, 'the door counts none of them');
});
