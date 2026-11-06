// The page buildcheck.mjs opens (served by vite): builds 1-1 on its proven seeds as the game does at stage start, one build a play, and
// hands back each build's milliseconds (window.buildTimes)
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { w1World } from '../../src/game/gen2/worlds/w1.ts';
import { provenSeeds } from '../../src/game/gen2/seedList.ts';

declare global { interface Window { buildTimes: (n: number, difficulty: 'normal' | 'easy') => number[] } }
const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
window.buildTimes = (n, difficulty) => {
  const seeds = provenSeeds('1-1');
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const seed = seeds[Math.floor((i * seeds.length) / n)];
    const t0 = performance.now();
    buildGen2Stage({ config: cfg, kit: w1World(), seed, difficulty });
    out.push(performance.now() - t0);
  }
  return out;
};
document.getElementById('s')!.textContent = 'ready';
