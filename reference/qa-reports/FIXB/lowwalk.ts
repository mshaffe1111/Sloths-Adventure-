/**
 * FIX-B probe (R-165.122 / R-165.150): on the REAL engine (RealPlay, the game's own stage build for a listed seed), every solid block
 * standing on a floor with floor 60 px either side is walked at from 58 px before its face with a plain walk (no jump).
 * Prints how many were walked straight through (feet under its top, out the far side) and lists each with its height.
 * Usage: npx tsx reference/qa-reports/FIXB/lowwalk.ts <stage> <nSeeds|seed,seed>
 */
import '../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { withPlaySeed } from '../../../src/game/testlink1_1.ts';
import { WALL_H } from '../../../src/game/physics.ts';
import { provenSeeds } from '../../../src/game/gen2/seedList.ts';

const stage = process.argv[2] ?? '1-1';
const arg = process.argv[3] ?? '3';
const listed = provenSeeds(stage);
const seeds = arg.includes(',') ? arg.split(',').map(Number) : stage === '1-1' ? listed.slice(0, Number(arg)) : Array.from({ length: Number(arg) }, (_, i) => i + 1);
console.log(`stage ${stage}, seeds (1-1: listed seeds; else layout variants) ${seeds.join(',')} (listed ${listed.length}), WALL_H ${WALL_H}`);
for (const setting of ['normal', 'easy'] as const) {
  let walked = 0, through = 0, low = 0;
  const bad: string[] = [];
  const kinds = new Map<string, number[]>();
  for (const seed of seeds) {
    setDifficulty(setting);
    const r = stage === '1-1' ? withPlaySeed(seed, () => new RealPlay(stage, 1)) : new RealPlay(stage, seed);
    const plats = r.platforms.slice();
    for (const k of plats) {
      if (k.type !== 'solid' || k.height <= 0 || k.width <= 0) continue;
      const fl = plats.find((f) => f !== k && f.type === 'solid' && Math.abs(f.y - (k.y + k.height)) <= 1 && f.x <= k.x - 60 && f.x + f.width >= k.x + k.width + 60);
      if (!fl) continue;
      if (plats.some((m) => m.type === 'bouncy' && m.x < k.x && m.x + m.width > k.x - 100)) continue;
      // (nothing else standing on the floor in the 60 px before its face: a clean walk at it)
      if (plats.some((q) => q !== k && q !== fl && q.type === 'solid' && q.x < k.x && q.x + q.width > k.x - 60 && q.y < fl.y && q.y + q.height >= fl.y - 1)) continue;
      walked++;
      if (k.height < WALL_H) low++;
      r.stand(k.x - 58, fl.y);
      let passed = false, onTop = false;
      for (let i = 0; i < 70 && !passed; i++) { r.frame({ right: true }); onTop ||= Math.abs(r.p.y - k.y) < 2; passed = r.p.x > k.x + k.width + 20; }
      if (passed && !onTop) {
        through++;
        const topped = plats.some((m) => m.type === 'bouncy' && Math.abs(m.y + m.height - k.y) <= 2 && m.x >= k.x - 2 && m.x + m.width <= k.x + k.width + 2);
        const cut = (k as { cut?: string }).cut ?? (k as { style?: string }).style ?? '?';
        kinds.set(`${cut}${topped ? ' +mushroom on top' : ''}`, [...(kinds.get(`${cut}${topped ? ' +mushroom on top' : ''}`) ?? []), k.height]);
        bad.push(`seed ${seed} x ${Math.round(k.x)} h ${k.height} w ${k.width} ${cut}${topped ? ' (mushroom on top)' : ''}`);
      }
    }
    (r.e as unknown as { stop(): void }).stop();
  }
  console.log(`${setting}: ${walked} floor blocks walked at (${low} under ${WALL_H} px); walked straight through: ${through}`);
  for (const [k, hs] of kinds) console.log(`  by look: ${k}: ${hs.length} (h ${Math.min(...hs)}-${Math.max(...hs)} px)`);
  if (process.env.LIST) for (const b of bad) console.log('  THROUGH ' + b);
}
setDifficulty('normal');
