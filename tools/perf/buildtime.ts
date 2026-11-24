// The page buildcheck.mjs opens (served by vite): builds a listed stage (`?stage=`, 1-1 when none is given) on its proven seeds as Play
// does at stage start (buildPlayStage on the stage's own kit, gen2/listed.ts: the seed's proven plan replayed), one build a play, and
// hands back each build's milliseconds (window.buildTimes)
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { w1World } from '../../src/game/gen2/worlds/w1.ts';
import { buildPlayStage, loadSeedList, provenSeeds, seedListError } from '../../src/game/gen2/seedList.ts';
import { listedStage } from '../../src/game/gen2/listed.ts';

declare global { interface Window { buildTimes: (n: number, difficulty: 'normal' | 'easy') => number[] } }
const stage = new URLSearchParams(location.search).get('stage') ?? '1-1';
const cfg = generateAllLevels().find((l) => l.id === stage)!;
const kit = listedStage(stage)?.kit ?? w1World;
window.buildTimes = (n, difficulty) => {
  const seeds = provenSeeds(stage);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const seed = seeds[Math.floor((i * seeds.length) / n)];
    const t0 = performance.now();
    buildPlayStage(cfg, kit(), seed, difficulty);
    out.push(performance.now() - t0);
  }
  return out;
};
// (the stage's proven list is its own file, loaded on its own since R-165.112: in memory before the page says 'ready')
void loadSeedList(stage).then((ok) => { document.getElementById('s')!.textContent = !cfg ? `no stage ${stage}` : ok ? 'ready' : `the list did not load: ${seedListError(stage)}`; });
