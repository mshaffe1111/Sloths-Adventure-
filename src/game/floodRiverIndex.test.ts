// R-165.583 (ENG-OUTBACK): a SAFE marsh splashes him back, on a laid flood's stage, either way he crosses it. The flood's waters name their
// river by its INDEX in the stage's rivers (flood.ts FloodWater.river; the engine raises rivers[w.river] to the water's level each frame,
// engine.ts floodClock). World 2's finish (worlds/w2.ts w2Finish) sorted the rivers by x AFTER the pipeline laid the flood (pipeline.ts
// layFlood), so on 2-8 every water named another river: the parade home's safe marsh took the teach marsh's level (y 941, 700 px over its
// own floor), riverAt's depth window (river.ts RIVER_DEPTH) never held his fall through a dip, and the child lost 92 lives there as 'pit'
// in 40 runs. GREEN: every water names the river it was laid from, on every listed stage with a flood, both settings; and in the REAL
// engine a drop through every dip of every safe marsh splashes him back with no life lost. RED on be2ebe7d2 (the parade's dips, frame named).
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEngine, step } from './engineCoreHarness.ts';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { loadSeedList } from './gen2/seedList.ts';
import { LISTED } from './gen2/listed.ts';
import { setDifficulty } from './difficulty.ts';
import type { RiverZone } from './river.ts';

const levels = generateAllLevels();
const SETTINGS = ['normal', 'easy'] as const;
/** the layouts each listed stage is built on (layout n plays the list's seed n % its length) */
const LAYOUTS = [1, 2, 3];

/** every listed stage that lays a flood, by its built rolls */
async function floodStages(): Promise<Array<{ id: string; setting: 'normal' | 'easy'; layout: number; st: any }>> {
  const out: Array<{ id: string; setting: 'normal' | 'easy'; layout: number; st: any }> = [];
  for (const id of Object.keys(LISTED)) {
    const cfg = levels.find((l) => l.id === id && !(l as { secret?: boolean }).secret);
    if (!cfg) continue;
    await loadSeedList(id);
    for (const setting of SETTINGS) for (const layout of LAYOUTS) {
      setDifficulty(setting);
      setLayoutVariant(layout);
      const st: any = generateStage(cfg, setting);
      setLayoutVariant(null);
      if (st.flood?.waters?.length) out.push({ id, setting, layout, st });
    }
  }
  return out;
}

test('R-165.583: every flood water names the river it was laid from (x0, x1), on every listed stage with a flood, both settings', async () => {
  const stages = await floodStages();
  assert.ok(stages.length > 0, 'no listed stage lays a flood: the test proves nothing');
  const bad: string[] = [];
  for (const { id, setting, layout, st } of stages)
    st.flood.waters.forEach((w: { river: number; x0: number; x1: number }, i: number) => {
      const r: RiverZone | undefined = st.rivers?.[w.river];
      if (!r || r.x0 !== w.x0 || r.x1 !== w.x1) bad.push(`${id} ${setting} layout ${layout}: water ${i} (x ${w.x0}-${w.x1}) names river ${w.river} (x ${r?.x0}-${r?.x1})`);
    });
  assert.deepEqual(bad, []);
});

/** the dips of a marsh: the gaps between its floor's pieces (solids whose top is the marsh floor, inside its window) */
function dipsOf(platforms: Array<{ x: number; y: number; width: number; type?: string }>, r: RiverZone): Array<[number, number]> {
  const floor = platforms.filter((p) => p.type === 'solid' && p.y === r.marsh!.floor && p.x >= r.x0 - 1 && p.x + p.width <= r.x1 + 1).sort((a, b) => a.x - b.x);
  const dips: Array<[number, number]> = [];
  for (let i = 0; i + 1 < floor.length; i++) if (floor[i + 1].x - (floor[i].x + floor[i].width) > 20) dips.push([floor[i].x + floor[i].width, floor[i + 1].x]);
  return dips;
}

test('R-165.583: in the real engine, a drop through every dip of every SAFE marsh on a flood stage splashes him back, no life lost, either way', async () => {
  const stages = (await floodStages()).filter((s) => s.layout === 1);
  let dropped = 0;
  const bad: string[] = [];
  const ways = new Set<number>();
  for (const { id, setting } of stages) {
    const probe = makeEngine(id, setting, 1).e;
    const n = (probe.currentStage.rivers ?? []).length;
    for (let ri = 0; ri < n; ri++) {
      const r0: RiverZone = probe.currentStage.rivers[ri];
      if (!r0.safe || !r0.marsh) continue;
      for (const [a, b] of dipsOf(probe.platforms, r0)) {
        const { e, events } = makeEngine(id, setting, 1);
        const r: RiverZone = e.currentStage.rivers[ri];
        const lives = e.lives;
        Object.assign(e.player, { x: (a + b) / 2, y: r.marsh!.floor - 4, vx: 0, vy: 0, grounded: false, climbing: false, isVineSwinging: false, hanging: false });
        e.player.invincibleTimer = 0;
        let frame = -1, deepest = e.player.y, back = false;
        for (let f = 0; f < 90 && !back; f++) {
          step(e, 1);
          deepest = Math.max(deepest, e.player.y);
          if (e.player.x === r.safe!.backX && e.player.y === r.safe!.backY) back = true;
          else if (frame < 0 && e.player.y > r0.surfaceY + 120) frame = f;
        }
        dropped++;
        ways.add(r.way ?? 1);
        if (!back || e.lives !== lives || events.some((s) => s.startsWith('lives')))
          bad.push(`${id} ${setting}: marsh x ${r.x0}-${r.x1} (way ${r.way ?? 1}) dip ${a}-${b}: not set back (deepest y ${Math.round(deepest)}, floor ${r.marsh!.floor}, live surface ${r.surfaceY}; past the water's depth at frame ${frame}; lives ${lives} -> ${e.lives})`);
      }
    }
  }
  assert.ok(dropped > 0, 'no safe marsh dip on any flood stage: the test proves nothing');
  assert.deepEqual(bad, []);
});
