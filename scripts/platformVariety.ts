/**
 * platformVariety — how varied the rendered platforms are, measured on generated stages from every world.
 *
 *   node --import tsx scripts/platformVariety.ts [variantsPerStage=3] [worldsCsv=1,2,...,10]
 *
 * For each sampled stage (the designed layout plus N random layouts, as a player gets) it plans the looks exactly as the
 * renderer does and reports, over the thin platforms (height < 50):
 *   - the share of each rendered look and the largest share (bridges are a span, so they are left out of the maximum);
 *   - how many different looks the stage shows;
 *   - whether the same look ever shows three times in a row (bridges excepted: a run of bridge spans is one rope walk,
 *     and they alternate between three variants);
 * and, for comparison, the same numbers if every platform were drawn straight from the generator's `style` tag.
 * Targets: at least 4 looks in a stage with 8 or more thin platforms, no look above 40%, never 3 in a row.
 */
import { generateAllLevels } from '../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../src/game/stageGenerator.ts';
import { planStage, lookShares, longestRun, baseLook, type ThinLook } from '../src/game/platformPlan.ts';
import type { Platform } from '../src/game/types.ts';

const nVar = Number(process.argv[2] ?? 3);
const worlds = (process.argv[3] ?? '1,2,3,4,5,6,7,8,9,10').split(',').map(Number);

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Row {
  id: string;
  thin: number;
  strictMax: number;
  strictLook: string;
  strictDistinct: number;
  strictRun: number;
  max: number;
  maxLook: string;
  distinct: number;
  run: number;
  counts: Record<string, number>;
  order: ThinLook[];
}

const rows: Row[] = [];
const levels = generateAllLevels().filter((l) => worlds.includes(l.worldIndex));
/** the random-layout numbers a stage gets in this sample: the same ones every run, whatever else is sampled */
function variantsFor(id: string, n: number): number[] {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  const r = mulberry32((h >>> 0) ^ 20261021);
  const out: number[] = [];
  while (out.length < n) {
    const v = Math.floor(r() * 1_000_000) + 1;
    if (!out.includes(v)) out.push(v);
  }
  return out;
}
for (const l of levels) {
  const variants: Array<number | null> = [null, ...variantsFor(l.id, nVar)];
  for (const v of variants) {
    setLayoutVariant(v);
    const stage = generateStage(l);
    const plan = planStage(stage.platforms as Platform[], l.worldIndex, 12345);
    const thin = stage.platforms.filter((p: Platform) => p.height < 50).sort((a: Platform, b: Platform) => (a.baseX ?? a.x) - (b.baseX ?? b.x) || a.id - b.id);
    const strict: ThinLook[] = thin.map(baseLook);
    const ss = lookShares(strict);
    const ps = lookShares(plan.order);
    rows.push({
      id: `${l.id}${v === null ? '' : '#' + v}`,
      thin: thin.length,
      strictMax: ss.maxShare,
      strictLook: ss.maxLook,
      strictDistinct: ss.distinct,
      strictRun: longestRun(strict),
      max: ps.maxShare,
      maxLook: ps.maxLook,
      distinct: ps.distinct,
      run: longestRun(plan.order),
      counts: ps.counts,
      order: plan.order,
    });
  }
}
setLayoutVariant(null);

const pct = (x: number) => `${Math.round(x * 100)}%`;
console.log('world  stages  thin(avg)  [generator style tags: max share / looks / 3-in-a-row stages]  [rendered looks: max share / looks / 3-in-a-row stages]');
let bad = 0;
for (const w of worlds) {
  const rs = rows.filter((x) => x.id.startsWith(`${w}-`));
  const big = rs.filter((x) => x.thin >= 8);
  const avg = rs.reduce((s, x) => s + x.thin, 0) / (rs.length || 1);
  const f = (key: 'strictMax' | 'max') => Math.max(...big.map((x) => x[key]), 0);
  const minLooks = (key: 'strictDistinct' | 'distinct') => Math.min(...big.map((x) => x[key]), 99);
  const runs = (key: 'strictRun' | 'run') => big.filter((x) => x[key] >= 3).length;
  console.log(
    `W${w}  ${rs.length}  ${avg.toFixed(1)}  [tags: ${pct(f('strictMax'))} / min ${minLooks('strictDistinct')} / ${runs('strictRun')}]  [rendered: ${pct(f('max'))} / min ${minLooks('distinct')} / ${runs('run')}]`,
  );
  for (const x of big) {
    if (x.max > 0.4 || x.distinct < 4 || x.run >= 3) {
      bad++;
      console.log(`   MISS ${x.id}: thin ${x.thin}, max ${pct(x.max)} ${x.maxLook}, looks ${x.distinct}, run ${x.run}`, JSON.stringify(x.counts));
      if (process.env.ORDER) console.log('      ', x.order.join(' '));
    }
  }
}
const big = rows.filter((x) => x.thin >= 8);
console.log(`\nstages sampled ${rows.length}, with 8+ thin platforms ${big.length}`);
console.log(`tags only    : max share ${pct(Math.max(...big.map((x) => x.strictMax)))}, fewest looks ${Math.min(...big.map((x) => x.strictDistinct))}, stages with 3-in-a-row ${big.filter((x) => x.strictRun >= 3).length}, stages over 40% ${big.filter((x) => x.strictMax > 0.4).length}, stages under 4 looks ${big.filter((x) => x.strictDistinct < 4).length}`);
console.log(`rendered     : max share ${pct(Math.max(...big.map((x) => x.max)))}, fewest looks ${Math.min(...big.map((x) => x.distinct))}, stages with 3-in-a-row ${big.filter((x) => x.run >= 3).length}, stages over 40% ${big.filter((x) => x.max > 0.4).length}, stages under 4 looks ${big.filter((x) => x.distinct < 4).length}`);
console.log(`stages missing a target: ${bad}`);
