import '../../../src/game/headlessDom.ts';
import { runTier } from '../../../tools/inspect/tierBots.ts';
const jobs = (process.argv[2] ?? 'middle:normal:12').split(',');
for (const j of jobs) {
  const [tier, setting, seed] = j.split(':');
  const r: any = runTier(tier as never, setting as never, Number(seed), '2-4');
  console.log(`${tier} ${setting} s${seed}: end ${r.end} rescues ${r.rescues} lives ${r.lives} ontoLog ${r.ontoLog} fromLog ${r.fromLog} ${r.finishSeconds ?? r.time} s; stuck ${JSON.stringify((r.stuck ?? []).map((s: any) => ({ x: Math.round(s.x), t: Math.round(s.t), piece: s.piece, what: s.what, rescued: s.rescued })))}; lives by piece ${JSON.stringify((r.pieces ?? []).filter((p: any) => p.lives || p.putbacks).map((p: any) => [p.id.replace('w2-24-', ''), p.lives, p.putbacks]))}`);
}
