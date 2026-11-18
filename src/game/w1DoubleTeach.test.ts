/**
 * The double TEACH's rise is comfortably doable (POLISH-8, R-165.228; the lead's ruling 11-14: Normal's teach rise in Easy's band,
 * 128-132; POLISH-7's castBots put every remaining Normal first-timer rescue at this rise, 136-140). On every listed 1-1 layout, both
 * settings, the game's own build (RealPlay): in each section that teaches the double, the teach's own rise (the first face of 100 px or
 * more straight off the floor before it, no gap) stands 128-132 px over that floor. Red at Normal's old band (TEACH_RISE = D_RISE, 137-140).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { loadSeedList, provenSeeds } from './gen2/seedList.ts';
import { w1World } from './gen2/worlds/w1.ts';

const STAGE = '1-1';
const TEACHES = new Set(w1World().manifest.sections.filter((t) => t.teaches === 'double' && (t as { feel?: string[] }).feel?.includes(STAGE)).map((t) => t.id));
type P = { x: number; y: number; width: number; height: number; type: string };

/** each double-teach section's first rise: a solid whose left edge meets the right edge of the floor before it (within 4 px) and stands
 *  100 px or more over it */
function teachRises(st: { platforms: P[]; gen2: { sections: Array<{ template: string; x0: number; x1: number }> } }) {
  const solids = st.platforms.filter((p) => p.type === 'solid');
  return st.gen2.sections.filter((q) => TEACHES.has(q.template)).map((sec) => {
    const inSec = solids.filter((p) => p.x >= sec.x0 - 1 && p.x < sec.x1).sort((a, b) => a.x - b.x);
    for (const face of inSec) {
      const floor = solids.find((f) => Math.abs(f.x + f.width - face.x) <= 4 && f.y - face.y >= 100 && f.y - face.y < 200);
      if (floor) return { sec, face, rise: Math.round(floor.y - face.y) };
    }
    return { sec, face: undefined, rise: NaN };
  });
}

test(`the double teach's rise is 128-132 px: ${STAGE}, every listed layout, both settings`, async () => {
  assert.ok(TEACHES.size >= 3, `1-1's double teaches (double, dip, bank): ${[...TEACHES].join(', ')}`);
  assert.ok(await loadSeedList(STAGE));
  const n = provenSeeds(STAGE).length;
  const bad: string[] = [];
  let seen = 0;
  const got = new Map<string, number[]>();
  for (const setting of ['normal', 'easy'] as const) {
    setDifficulty(setting);
    for (let v = 0; v < n; v++) {
      for (const { sec, face, rise } of teachRises(new RealPlay(STAGE, v).stage as never)) {
        seen++;
        if (!face) { bad.push(`${setting} layout ${v} ${sec.template}: no teach rise found`); continue; }
        (got.get(setting) ?? got.set(setting, []).get(setting)!).push(rise);
        if (rise < 128 || rise > 132) bad.push(`${setting} layout ${v} ${sec.template}: the teach rise at x ${Math.round(face.x)} is ${rise} px (128-132)`);
      }
    }
  }
  setDifficulty('normal');
  assert.ok(seen > 0, 'some layout lays a double teach');
  for (const [s, r] of got) console.log(`# ${s}: ${r.length} teach rises, ${Math.min(...r)}-${Math.max(...r)} px`);
  assert.deepEqual(bad.slice(0, 12), [], `${bad.length} of ${seen} teach rises out of 128-132`);
});
