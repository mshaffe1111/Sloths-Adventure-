// BUILD-25d scratch: one seed's flags, falls and the quickening's ground (not committed)
import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { buildGen2Stage, lethalSpans } from '../../../src/game/gen2/pipeline.ts';
import { listedStage, playFinish } from '../../../src/game/gen2/listed.ts';
import { listJudge } from '../listRules.ts';
const id = process.argv[2], seeds = process.argv[3].split(',').map(Number), d = (process.argv[4] ?? 'normal') as 'normal';
const row = listedStage(id)!; const cfg = generateAllLevels().find((l) => l.id === id)!;
const R = Math.round;
const also = process.argv.includes('--also') ? listJudge(cfg, (st: any, dd: any) => playFinish(row, st, dd)) : undefined;
for (const seed of seeds) {
  const st: any = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d, ...(also ? { also } : {}) });
  console.log(`  errors: ${JSON.stringify(st.gen2.errors ?? [])}`);
  console.log(`seed ${seed} ${d}: flags ${st.checkpoints.map((c: any) => R(c.x)).join(' ')}`);
  console.log('  sections: ' + st.gen2.sections.filter((s: any) => s.x1 > 18000).map((s: any) => `${s.template}[${R(s.x0)}-${R(s.x1)}]`).join(' '));
  console.log('  lethal: ' + lethalSpans(st, st.gen2.falls).filter(([a]) => a > 18000).map(([a, b]) => `${R(a)}-${R(b)}`).join(' '));
  console.log('  solids: ' + st.platforms.filter((p: any) => p.x > 19000 && p.x < 25000 && p.type === 'solid').map((p: any) => `${R(p.x)}+${R(p.width)}@${R(p.y)}`).join(' '));
  console.log('  pieces: ' + (st.gen2.pieces ?? []).filter((p: any) => p.x0 > 19000 && p.x0 < 25000).map((p: any) => `${p.key ?? p.id}[${R(p.x0)}-${R(p.x1)}]`).join(' '));
}
