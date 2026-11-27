import '../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { towerCfg, upManifest } from '../../../src/game/gen2/toyTower.ts';
import { moonStorey } from '../../../src/game/gen2/moonLay.test.ts';
import { moonFlowers } from '../../../src/game/moon.ts';
for (const seed of [1, 2, 3]) {
  const st = buildGen2Stage({ config: towerCfg('5-93', 'ascent'), kit: { manifest: { ...upManifest, sections: [...upManifest.sections, moonStorey('swing')] }, emit: {} }, seed, difficulty: 'normal' });
  const fl = moonFlowers(st, 'normal');
  console.log(seed, 'errors', st.gen2.errors.length, st.gen2.errors.slice(0, 2).map((e: string) => e.slice(0, 160)), 'flowers', fl.map((f) => `${Math.round(f.p.x)},${Math.round(f.p.y)}`).join(' '));
}
