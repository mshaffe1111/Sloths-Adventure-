// VAR-19d probe: raw seeds laid as the list's search lays them (BuildRequest.also = listRules.ts listJudge, the row's finish), each
// setting: its rerolls, errors and lure lines as played; and the same seed with no judge. usage: npx tsx judged.ts <from> <to>
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { listedStage, playFinish } from '../../../../src/game/gen2/listed.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { listJudge, lureBreaches } from '../../../../tools/engine/listRules.ts';
const cfg = generateAllLevels().find((c) => c.id === '1-9' && !c.secret)!;
const row = listedStage('1-9')!;
const played = (st: any, d: 'normal' | 'easy') => playFinish(row, st, d);
const also = listJudge(cfg, played);
const [a, z] = [Number(process.argv[2] ?? 1), Number(process.argv[3] ?? 6)];
for (let seed = a; seed <= z; seed++) for (const d of ['normal', 'easy'] as const) {
  const raw: any = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d });
  const j: any = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d, also });
  const lr = (s: any) => lureBreaches(played(structuredClone(s), d), d, cfg.worldIndex).length;
  console.log(`seed ${seed} ${d}: no judge rerolls ${raw.gen2.rerolls} lure ${lr(raw)} | judged rerolls ${j.gen2.rerolls} lure ${lr(j)} errors ${(j.gen2.errors ?? []).length}`);
}
