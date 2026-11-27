// the lead's ruling 1 on box 8 (ENG-DARK-i): per roll of the 3-1 draft, the glowworm dark zones where EVERY landing is awake (the
// light each rim's landing is read by is laid awake: stillness is never needed there). Run from the tree under test:
//   GEN2_DRAFT=3-1 npx tsx <this> <from> <to>
// Prints one line per such zone (roll, setting, box, rims, lights) and the totals; a zone with no rim at all is counted apart.
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const { darkRims } = await import(path.join(root, 'src/game/gen2/dark.ts'));
const { generateStage, setLayoutVariant } = await import(path.join(root, 'src/game/stageGenerator.ts'));
const { generateAllLevels } = await import(path.join(root, 'src/game/worldsData.ts'));
const [a, b] = process.argv.slice(2).map(Number);
const tot = { rolls: 0, zones: 0, allAwake: 0, allLightsAwake: 0, noRim: 0, unlitRim: 0 }, per: string[] = [];
// (zones by the share of their rims whose landing light is awake: none, under half, half or more, all)
const share = { none: 0, underHalf: 0, halfUp: 0, all: 0 };
// (PLANT_AWAKE=1: every glowworm laid awake, so every zone must count: the probe's own planted check)
const plant = !!process.env.PLANT_AWAKE;
for (let seed = a; seed <= b; seed++) for (const d of ['normal', 'easy'] as const) {
  setLayoutVariant(seed);
  let st: any;
  try { st = generateStage({ ...generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!, unlocked: true }, d); } finally { setLayoutVariant(null); }
  tot.rolls++;
  let n = 0;
  for (const z of st.zones ?? []) {
    if (z.kind !== 'dark' || !z.lights?.some((l: any) => l.id !== undefined)) continue;
    tot.zones++;
    if (plant) for (const l of z.lights) if (l.id !== undefined) l.sleep = false;
    const rims = darkRims({ platforms: st.platforms, zones: [z] });
    const ids = z.lights.filter((l: any) => l.id !== undefined);
    if (ids.every((l: any) => !l.sleep)) tot.allLightsAwake++;
    if (!rims.length) { tot.noRim++; console.log(seed, d, 'NO RIM', z.x0, z.x1, z.top, z.bottom, 'lights', ids.length); continue; }
    tot.unlitRim += rims.filter((r: any) => !r.light).length;
    const aw = rims.filter((r: any) => r.light && !r.light.sleep).length / rims.length;
    share[aw === 0 ? 'none' : aw < 0.5 ? 'underHalf' : aw < 1 ? 'halfUp' : 'all']++;
    if (rims.every((r: any) => r.light && !r.light.sleep)) {
      n++; tot.allAwake++;
      console.log(seed, d, 'ALL AWAKE', `box ${z.x0}..${z.x1} y ${z.top}..${z.bottom}`, 'rims', rims.length, 'lights', ids.length, 'asleep', ids.filter((l: any) => l.sleep).length);
    }
  }
  if (n) per.push(`${seed}${d[0].toUpperCase()}:${n}`);
}
console.log('totals', JSON.stringify(tot), 'share', JSON.stringify(share), 'per roll', per.join(' ') || 'none');
