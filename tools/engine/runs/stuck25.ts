import '../../../src/game/headlessDom.ts';
import fs from 'node:fs';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { listedStage } from '../../../src/game/gen2/listed.ts';
import { buildPlayStage, loadSeedList, provenSeeds } from '../../../src/game/gen2/seedList.ts';
await loadSeedList('2-5');
const row = listedStage('2-5')!; const cfg = generateAllLevels().find((l) => l.id === '2-5' && !l.secret)!;
const rows = fs.readFileSync(process.argv[2], 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const bots = process.argv[3].split(',');
const seeds = provenSeeds('2-5');
const tally = new Map<string, number>();
const ex = new Map<string, string[]>();
for (const r of rows) {
  if (!bots.includes(r.bot)) continue;
  const st = buildPlayStage(cfg, row.kit(), seeds[Number(r.seed) - 1], r.setting);
  for (const s of r.stuck ?? []) {
    const sec = st.gen2.sections.find((q) => s.x >= q.x0 && s.x < q.x1);
    const k = `${r.bot} ${r.setting} ${sec?.template.replace('w2-25-', '') ?? '?'} | ${s.what}`;
    tally.set(k, (tally.get(k) ?? 0) + 1);
    if (!ex.has(k)) ex.set(k, []);
    if (ex.get(k)!.length < 4) ex.get(k)!.push(`L${r.seed} x${Math.round(s.x)}${sec ? ` (+${Math.round(s.x - sec.x0)})` : ''}`);
  }
}
for (const [k, n] of [...tally].sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(4)}  ${k}   e.g. ${ex.get(k)!.join(', ')}`);
