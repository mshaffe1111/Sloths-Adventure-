// The page buildcheck.mjs opens (served by vite): builds 1-1 on its proven seeds as Play does at stage start (buildPlayStage: the seed's
// proven plan replayed), one build a play, and
// hands back each build's milliseconds (window.buildTimes)
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { w1World } from '../../src/game/gen2/worlds/w1.ts';
import { buildPlayStage, loadSeedList, provenSeeds, seedListError } from '../../src/game/gen2/seedList.ts';

declare global { interface Window { buildTimes: (n: number, difficulty: 'normal' | 'easy') => number[] } }
const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
window.buildTimes = (n, difficulty) => {
  const seeds = provenSeeds('1-1');
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const seed = seeds[Math.floor((i * seeds.length) / n)];
    const t0 = performance.now();
    buildPlayStage(cfg, w1World(), seed, difficulty);
    out.push(performance.now() - t0);
  }
  return out;
};
// (the stage's proven list is its own file, loaded on its own since R-165.112: in memory before the page says 'ready')
void loadSeedList('1-1').then((ok) => { document.getElementById('s')!.textContent = ok ? 'ready' : `the list did not load: ${seedListError('1-1')}`; });
