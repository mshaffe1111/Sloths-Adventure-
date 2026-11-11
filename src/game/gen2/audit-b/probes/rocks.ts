// do the "hop" rocks under 50 px stop a plain walk? (engine.ts:2327 walls only at 50 px)
import '../../../headlessDom.ts';
import { RealPlay } from '../../../realPlay.ts';
import { setDifficulty } from '../../../difficulty.ts';
import { withPlaySeed } from '../../../testlink1_1.ts';
import { PROVEN_SEEDS } from '../../../gen2/provenSeeds.ts';
const seeds = PROVEN_SEEDS['1-1'].seeds.slice(0, Number(process.argv[2] ?? 6));
let low = 0, walked = 0, tall = 0, tallWalked = 0;
const ex: string[] = [];
for (const setting of ['normal', 'easy'] as const) for (const seed of seeds) {
  setDifficulty(setting);
  const r = withPlaySeed(seed, () => new RealPlay('1-1', 1));
  setDifficulty('normal');
  const P = r.platforms.filter((p) => p.type === 'solid');
  // a block standing on a wider floor: its foot on the floor's top, the floor running on both sides of it
  const rocks = P.filter((p) => p.width <= 230 && p.height >= 20 && p.height <= 90 && P.some((f) => f !== p && Math.abs(f.y - (p.y + p.height)) <= 1 && f.x <= p.x - 60 && f.x + f.width >= p.x + p.width + 60));
  for (const k of rocks) {
    const floor = P.find((f) => f !== k && Math.abs(f.y - (k.y + k.height)) <= 1 && f.x <= k.x - 60 && f.x + f.width >= k.x + k.width + 60)!;
    r.stand(k.x - 58, floor.y);
    let passed = false, topY = floor.y;
    for (let i = 0; i < 70; i++) { r.frame({ right: true }); topY = Math.min(topY, r.p.y); if (r.p.x > k.x + k.width + 20) { passed = true; break; } }
    if (k.height < 50) { low++; if (passed) { walked++; if (ex.length < 6) ex.push(`${setting} seed ${seed} rock x ${k.x} h ${k.height} w ${k.width}: a plain walk passes it (feet rose ${Math.round(floor.y - topY)} px, no jump)`); } }
    else { tall++; if (passed) tallWalked++; }
  }
  (r.e as unknown as { stop(): void }).stop?.();
}
console.log(`seeds ${seeds.length} x 2 settings: rocks under 50 px: ${low}, walked past with no jump: ${walked}; rocks 50 px+: ${tall}, walked past: ${tallWalked}`);
console.log(ex.join('\n'));
