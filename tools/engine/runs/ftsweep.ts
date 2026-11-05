// RUNS: the real-engine first-timer bot (tools/inspect/firsttimer.ts) over many layouts, adult on Normal and kid on Easy, with each run's
// harms, jump tries, goal, rescues and stuck spots, beside the stage's node plan (meta.mix.explain) so the rows can be read per node.
// cp3-ft.ts / cp4-ft.ts print 4 layouts; this keeps the raw runs for 16.
//   SID=1-5 npx tsx tools/engine/runs/ftsweep.ts <from> <to> > out.json
import '../../../src/game/headlessDom.ts';
import { firstTimer, FT_ADULT, FT_KID } from '../../inspect/firsttimer.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../../src/game/stageGenerator.ts';
import { easyStage } from '../../../src/game/easyMode.ts';
import { withGoals } from '../../../src/game/goals.ts';
const id = process.env.SID ?? '1-5';
const [from, to] = process.argv.slice(2).map(Number);
const c = generateAllLevels().find((l) => l.id === id)!;
const out: unknown[] = [];
for (let v = from; v <= to; v++) for (const who of [FT_ADULT, FT_KID]) {
  setLayoutVariant(v);
  const st: any = who.setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
  setLayoutVariant(null);
  const t0 = Date.now();
  const r = firstTimer(id, v, who, { fresh: true });
  out.push({ id, layout: v, who: who.name, setting: who.setting, end: r.end, time: r.time, progress: r.progress, goal: r.goal, rescues: r.rescues, softFalls: r.softFalls ?? 0,
    gameOvers: r.gameOvers, harms: r.harms.map((h) => ({ kind: h.kind, t: Math.round(h.t * 10) / 10, x: Math.round(h.x), y: Math.round(h.y), cause: h.cause })),
    tries: r.tries.map((q) => ({ x: Math.round(q.x), y: Math.round(q.y), t0: Math.round(q.t0 * 10) / 10, kind: q.kind, ok: q.ok, hurt: q.hurt })),
    stuck: r.stuck.map((s: any) => ({ x: Math.round(s.x), y: Math.round(s.y), what: s.what ?? s.why ?? '' })),
    mix: st.meta?.mix?.explain ?? null, hearts: (st.collectibles ?? []).filter((q: any) => q.type === 'heart' || q.type === 'super_heart').map((q: any) => Math.round(q.x)),
    checkpoints: (st.checkpoints ?? []).map((q: any) => Math.round(q.x)), ms: Date.now() - t0 });
  process.stderr.write(`${id} L${v} ${who.name} ${r.end} ${Math.round(r.time)}s ${Date.now() - t0}ms\n`);
}
process.stdout.write(JSON.stringify(out));
