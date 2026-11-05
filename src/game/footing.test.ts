// footingOf: what a platform is drawn as and how far its drawn body reaches, read from terrain's own decision (terrainLook), so E3's
// support check agrees with the screen. Held here: (1) terrainLook decides exactly as terrain's draw chain did before it was extracted,
// on a stage of every world (the old chain's conditions, frozen below); (2) engine-render's four rules (11-05) on known pieces.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { footingOf, footingsFor, terrainLook } from './terrain.ts';
import { planStage } from './platformPlan.ts';
import { lookFor } from './scenery.ts';
import { bankPainted, rockPainted } from './protoArt.ts';
import type { Platform } from './types.ts';

/** terrain's draw chain as it stood before terrainLook (terrain.ts, 11-05), decision only */
function oldChain(p: Platform, plan: ReturnType<typeof planStage>, look: ReturnType<typeof lookFor>): string {
  if (p.type === 'bouncy') return 'bounce';
  if (p.type === 'fragile') return 'fragile';
  if (p.type === 'drift' && p.drift) return 'drift';
  if (p.type === 'moving') return 'moving';
  if (p.style === 'canopy_bridge') return 'bridge';
  if (rockPainted(p)) return 'painted-rock';
  if ((p.height >= 50 || p.soil) && bankPainted(p)) return 'painted-bank';
  if (p.height >= 50) { const gp = plan.ground.get(p); return gp && gp.role === 'ground' ? 'ground' : gp && gp.role === 'step' ? 'step' : gp && gp.role === 'pillar' ? 'pillar' : 'earth'; }
  const tp = plan.thin.get(p);
  if (tp?.look === 'island') { const v = Math.abs(p.id * 7 + Math.floor(p.width / 40)) % 6; return v === 3 ? 'island-log' : v === 4 || (v === 5 && look.ground.kind === 'stone') ? 'island-slab' : 'island-earth'; }
  return 'thin';
}

test('terrainLook decides as the draw chain did, on a stage of every world', () => {
  const levels = generateAllLevels();
  let n = 0;
  for (const id of ['1-1', '1-3', '1-5', '2-1', '3-2', '4-1', '5-3', '6-2', '7-2', '8-2', '9-1', '10-1']) {
    const c = levels.find((l) => l.id === id)!;
    setLayoutVariant(1); const st = generateStage({ ...c, unlocked: true }, 'normal'); setLayoutVariant(null);
    const plan = planStage(st.platforms, c.worldIndex, 0), look = lookFor(c.worldIndex);
    for (const p of st.platforms) { assert.equal(terrainLook(p, plan, look, false), oldChain(p, plan, look), `${id} piece ${p.id}`); n++; }
  }
  assert.ok(n > 1000, `${n} pieces`);
});

test("footingOf follows engine-render's four rules", () => {
  const P = (o: Partial<Platform>): Platform => ({ id: 1, x: 0, y: 500, width: 200, height: 24, type: 'solid', style: 'branch', ...o } as Platform);
  const plan = planStage([], 1, 0), look = lookFor(1);
  const f = (p: Platform, painted = false, rivers = false) => footingOf(p, { painted: new Set(painted ? [p.id] : []), plan, look, rivers });
  // (1) the painted layer first: a painted rock's body ends at its boulder, 3 px under it; a painted thin bough at its own underside
  assert.equal(f(P({ style: 'moss_stone', height: 50 }), true).bodyBottom, 553);
  assert.equal(f(P({ height: 24 }), true).bodyBottom, 524);
  // (2) a bank of earth runs down out of sight
  assert.equal(f(P({ style: 'moss_stone', height: 120 })).bodyBottom, Infinity);
  // (3) a lily pad goes to the river art when it draws
  assert.equal(f(P({ lily: true, height: 12 } as Partial<Platform>), false, true).drawn, 'river art');
  // (4) a piece with its own art keeps its own drawer
  assert.match(f(P({ art: 'kit' } as Partial<Platform>)).drawn, /own art/);
});

test('footingsFor gives every platform of a built stage a footing', () => {
  const c = generateAllLevels().find((l) => l.id === '1-5')!;
  setLayoutVariant(1); const st = generateStage({ ...c, unlocked: true }, 'normal'); setLayoutVariant(null);
  const fs = footingsFor(st, 1);
  assert.equal(fs.size, st.platforms.length);
});
