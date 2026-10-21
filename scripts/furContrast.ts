/**
 * furContrast — how clearly every material a platform is built from stands apart from Pokey's fur (#a66b43).
 *
 *   node --import tsx scripts/furContrast.ts [seed=7]
 *
 * For each world prints CIEDE2000 distances from the fur for the lit top lips (every standable surface: wood, moss, stone,
 * ruin), the wood body (bark) at its lit, mid and shadow tones, and the ground cap's own highlight. The lips are what the
 * hero's feet sit on, so they must be >= 18; wood bodies must not be fur-coloured (>= 15) and their undersides darker than
 * the fur. Anything below target is flagged.
 */
import { setSceneSeed } from '../src/game/sceneSeed.ts';
import { lookFor } from '../src/game/scenery.ts';
import { paletteFor, LIP_MIN, BARK_MIN } from '../src/game/platformPalette.ts';
import { deltaE00, FUR, lightness } from '../src/game/colorMetrics.ts';

const seed = Number(process.argv[2] ?? 7);
setSceneSeed(seed);
const fmt = (n: number) => n.toFixed(1).padStart(5);
const flag = (ok: boolean) => (ok ? ' ' : '!');
console.log(`fur ${FUR} (L* ${lightness(FUR).toFixed(1)}), scene seed ${seed}; lip target >= ${LIP_MIN}, bark >= ${BARK_MIN}`);
console.log('world | lip: wood  moss stone  ruin |  bark: light   mid  dark | bark L* mid/dark | cap highlight (baked, for reference)');
let bad = 0;
const rows: number[][] = [];
for (let w = 1; w <= 10; w++) {
  const look = lookFor(w);
  const p = paletteFor(look, w);
  const lips = [p.lip.wood, p.lip.moss, p.lip.stone, p.lip.ruin].map((c) => deltaE00(c, FUR));
  const bark = [p.bark.light, p.bark.mid, p.bark.dark].map((c) => deltaE00(c, FUR));
  const capHi = deltaE00(look.ground.capHi, FUR);
  const okLips = lips.every((d) => d >= LIP_MIN - 1e-6);
  const okBark = bark.every((d) => d >= BARK_MIN - 1e-6);
  const darker = lightness(p.bark.deep) < lightness(FUR) - 8;
  if (!okLips || !okBark || !darker) bad++;
  rows.push([w, ...lips, ...bark, capHi]);
  console.log(
    `${String(w).padStart(5)} |      ${lips.map((d, i) => fmt(d) + flag(d >= LIP_MIN - 1e-6) + (i < 3 ? ' ' : '')).join('')}|        ${bark.map(fmt).join(' ')} |  ${lightness(p.bark.mid).toFixed(0).padStart(3)} / ${lightness(p.bark.dark).toFixed(0).padStart(3)} / deep ${lightness(p.bark.deep).toFixed(0).padStart(3)} ${flag(okBark && darker)}| ${fmt(capHi)}${capHi < LIP_MIN ? '  (lit line laid over it)' : ''}`,
  );
}
const min = (i: number) => Math.min(...rows.map((r) => r[i]));
console.log(`\nminimum over the ten worlds: lips wood ${min(1).toFixed(1)} moss ${min(2).toFixed(1)} stone ${min(3).toFixed(1)} ruin ${min(4).toFixed(1)}; bark steps ${Math.min(min(5), min(6), min(7)).toFixed(1)}`);
console.log(bad ? `${bad} world(s) below target` : 'all worlds meet the targets');
process.exitCode = bad ? 1 : 0;
