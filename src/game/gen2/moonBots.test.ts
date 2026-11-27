// THE MOON'S STAIR, flown by the bot (ENG-MOON item 4/5, 3-4.md NEW 2; firsttimer.ts SKILLS.waitForLight): one storey, one RISING
// beam (a swing in this stacked fixture never leaves its stairs: see REPORT), three moonflower steps, in the up tower fixture (toyTower.ts), played in the REAL engine (RealPlay). With the skill he waits for
// each next flower to open and climbs in the light: no step taken into a closed flower. Planted: the skill off, he climbs into a
// closed flower and falls through it (RED).
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGen2Stage, keptFoes } from './pipeline.ts';
import { towerCfg, upManifest } from './toyTower.ts';
import { withTestStage } from './listed.ts';
import { packPlan, plantSeedList } from './seedList.ts';
import { withFixtureConfig } from '../realPlay.ts';
import { setDifficulty } from '../difficulty.ts';
import { moonFlowers } from '../moon.ts';
import type { SectionTemplate, WorldKit } from './types.ts';
import type { Platform } from '../types.ts';

const ID = '5-94';
const storey: SectionTemplate = {
  id: 'moon-bot', name: "the moon's storey (rise), for the bot", archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, content: 'climb',
  pieces: [
    { key: 'foot', shape: 'stone', w: [600, 620], place: { kind: 'start' } },
    { key: 'top', shape: 'stone', w: [240, 260], place: { kind: 'over', on: 'foot', at: [1, 1], dy: [-400, -400] }, landing: true },
  ],
  entry: { piece: 'foot', kind: 'ledge' }, exit: { piece: 'top', kind: 'ledge' }, exitDy: -400, sockets: [],
  zones: [{ kind: 'moon', on: 'foot', n: 3, rise: 100, step: 120, w: 120, band: 'rise' }],
  mirrorable: false,
};
const kit: WorldKit = { manifest: { ...upManifest, name: 'Toy tower, moon bot', sections: [...upManifest.sections, storey], verdicts: ['moon'] }, emit: {} };
const cfg = towerCfg(ID, 'ascent');

/** the first clean roll (seeds 1-12) that lays the storey, packed for the seed list */
function roll() {
  for (let seed = 1; seed <= 12; seed++) {
    const st = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
    if (st.gen2.errors.length || !moonFlowers(st, 'normal').length) continue;
    const dict: string[] = [];
    return { seed, dict, packed: packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict) };
  }
  throw new Error('no clean roll laid the moon storey');
}

async function fly(skill: boolean) {
  const { firstTimer, FT_ADULT, SKILLS } = await import('../../../tools/inspect/firsttimer.ts');
  const r0 = roll();
  setDifficulty('normal');
  SKILLS.waitForLight = skill;
  try {
    return withTestStage({ [ID]: { kit: () => kit, seeds: [] } }, () => {
      const undo = plantSeedList(ID, { dict: r0.dict, seeds: [r0.seed], plans: [r0.packed] });
      try {
        return withFixtureConfig(cfg, () => {
          let through = 0, lastY = NaN, waits = 0, topY = Infinity, placed = false;
          const run = firstTimer(ID, r0.seed, { ...FT_ADULT, setting: 'normal' }, { cap: 30, onFrame(sim, b) {
            const p = sim.p;
            const fl = (sim as unknown as { platforms: Platform[] }).platforms.filter((q) => q.moonflower);
            // (the fixture's tower is tall: he starts on the lowest storey's stone, 200 px short of its first step,
            //  the frame its first step is closed (the beam away): he arrives in the dark)
            if (!placed) {
              const low = fl.reduce((a, q) => (q.y > a.y ? q : a));
              if (!low.broken) return;
              placed = true;
              (b as unknown as { placeAt(x: number, y: number): void }).placeAt(low.x - 200, low.y + 100);
              lastY = sim.p.y;
              return;
            }
            // (a step into a closed flower: his feet go down through its top while over it, the flower not solid)
            for (const q of fl) if (q.broken && lastY <= q.y && p.y > q.y && p.x >= q.x && p.x <= q.x + q.width) through++;
            topY = Math.min(topY, p.y);
            lastY = p.y;
            waits = (b as unknown as { moonWaitFrames: number }).moonWaitFrames;
          } });
          return { through, waits, end: run.end, progress: run.progress, topY };
        });
      } finally { undo(); }
    });
  } finally { SKILLS.waitForLight = true; }
}

test('the moon stair in the real engine: with waitForLight he waits on stone for the bloom and climbs in the light; planted: the skill off, he steps into a closed flower and falls through (RED)', async () => {
  const on = await fly(true);
  const off = await fly(false);
  console.log('# moon toy', JSON.stringify({ on, off }));
  assert.ok(on.waits > 0, `he waited for the light (${on.waits} frames)`);
  assert.equal(on.through, 0, `no step into a closed flower (${on.through}); end ${on.end}, progress ${on.progress}`);
  assert.ok(off.through > 0, `the plant: without the skill he falls through a closed flower (${off.through}); end ${off.end}`);
});
