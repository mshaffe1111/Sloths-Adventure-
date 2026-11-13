/**
 * ONE roll tool for any stage gen2 rolls from data (ADD-LEVEL, R-165.187; ENGINE-NEEDS.md §3 item 1). It reads the stage's row in the ONE
 * stage table (gen2/worlds/stageTable.ts, through listed.ts: its kit) and its config (worldsData.ts), and builds each seed the way the
 * stage's seed-list search builds it (tools/engine/seedlist.ts: buildGen2Stage with the quiet line, listRules.ts quietJudge), on both
 * settings. No stage is named in this file: it is handed one. It replaces copying library13.ts per stage (level.md step 3); a stage's own
 * counts (1-3's traps and snakes) stay in its own test, read from the build this tool returns.
 *   npx tsx tools/engine/libstage.ts --stage 1-3 [--seeds 24] [--from 1] [--par 4] [--json]
 * Prints, per setting: how many rolls are CLEAN (no gen2.errors, the verdict accepted: seedList.ts seedListBreaches' rule), thrown, every
 * refusing line counted by kind, the graphs and beat orders laid, the cast kinds and creature counts, the modelled seconds and the width;
 * then how many seeds are clean on BOTH settings (what a seed list keeps) and which of the kit's sections were never laid.
 * Exit 1 when no seed is clean on both settings (a stage the list search cannot list), 2 on a stage with no row.
 */
import '../../src/game/headlessDom.ts';
import { fileURLToPath } from 'node:url';
import { buildGen2Stage, stagePool } from '../../src/game/gen2/pipeline.ts';
import { listedStage } from '../../src/game/gen2/listed.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { quietJudge } from './listRules.ts';
import type { LevelConfig } from '../../src/game/types.ts';
import type { WorldKit } from '../../src/game/gen2/types.ts';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
export type Setting = 'normal' | 'easy';
export const SETTINGS: readonly Setting[] = ['normal', 'easy'];

/** the stage's kit and config from its row; throws, by name, on a stage with no row or no config */
export function stageSource(stageId: string): { kit: () => WorldKit; cfg: LevelConfig } {
  const row = listedStage(stageId);
  if (!row) throw new Error(`libstage: no row for "${stageId}" in the stage table (src/game/gen2/worlds/stageTable.ts)`);
  if (typeof row.kit !== 'function') throw new Error(`libstage: ${stageId}'s row names a kit listed.ts KITS does not hold`);
  const cfg = generateAllLevels().find((c) => c.id === stageId);
  if (!cfg) throw new Error(`libstage: no config for "${stageId}" (src/game/worldsData.ts)`);
  return { kit: row.kit, cfg };
}

/** one seed on one setting, built as the seed-list search builds it (seedlist.ts: the quiet line as `also`) */
export function buildStage(stageId: string, seed: number, difficulty: Setting): Any {
  const { kit, cfg } = stageSource(stageId);
  return buildGen2Stage({ config: cfg, kit: kit(), seed, difficulty, also: quietJudge(cfg) });
}

export interface StageRoll {
  seed: number; d: Setting; clean: boolean; thrown?: string; errors: string[]; graph?: string; plan: string[];
  kinds: string[]; foes: Record<string, number>; seconds?: number; width?: number;
}

/** the stage's modelled seconds (the time model's typical player; else the sections' own seconds, summed, as library13.ts reads them) */
const secondsOf = (st: Any): number | undefined => {
  if (typeof st.gen2.modelled?.typical === 'number') return st.gen2.modelled.typical;
  const xs = (st.gen2.sections ?? []).map((q: Any) => q.seconds).filter((x: Any) => typeof x === 'number');
  return xs.length ? Math.round(xs.reduce((a: number, b: number) => a + b, 0)) : undefined;
};

/** a refusing line with its numbers and seeds blanked, so the same refusal on two rolls counts once each (library.ts tidy's idea) */
export const kindOf = (line: string): string => line.replace(/-?\d+(\.\d+)?/g, '#').replace(/\s+/g, ' ').slice(0, 110);

/** one roll: clean is seedListBreaches' rule (a refused verdict, or any gen2.errors, is not clean; a throw is not clean) */
export function rollStage(stageId: string, seed: number, d: Setting): StageRoll {
  try {
    const st: Any = buildStage(stageId, seed, d);
    const v = st.gen2.verdicts?.[d];
    const errors: string[] = [...(v && !v.accepted ? v.failed.map((f: Any) => `verdict ${f.name}: ${f.line}`) : []), ...(st.gen2.errors ?? [])];
    const foes: Record<string, number> = {};
    for (const e of (st.enemies ?? []) as Any[]) foes[e.type] = (foes[e.type] ?? 0) + 1;
    return {
      seed, d, clean: !errors.length, errors, graph: st.gen2.graph?.id ?? st.gen2.graphId, plan: (st.gen2.plan ?? []).map((p: Any) => p.template),
      kinds: st.proto?.cast?.kinds ?? [], foes, seconds: secondsOf(st), width: st.exitTotemX ?? st.gen2.exitX,
    };
  } catch (e) {
    return { seed, d, clean: false, thrown: String((e as Error).message), errors: [], plan: [], kinds: [], foes: {} };
  }
}

/** seeds `from`..`from+n-1` on both settings */
export function rollMany(stageId: string, n: number, from = 1): StageRoll[] {
  const out: StageRoll[] = [];
  for (let s = from; s < from + n; s++) for (const d of SETTINGS) out.push(rollStage(stageId, s, d));
  return out;
}

export interface StageSummary {
  stage: string; seeds: number;
  per: Record<Setting, { rolls: number; clean: number; thrown: number; refusals: Array<[string, number]>; graphs: Array<[string, number]>; orders: number; kinds: Array<[string, number]>; foes: Record<string, [number, number]>; seconds: [number, number] | null; width: [number, number] | null }>;
  /** seeds clean on BOTH settings: what the seed-list search keeps (before its own extra rules: squirrels, the first run) */
  both: number[];
  /** the kit's sections in the stage's pool that no roll laid */
  neverLaid: string[];
}

const range = (xs: number[]): [number, number] | null => (xs.length ? [Math.min(...xs), Math.max(...xs)] : null);
const counted = (xs: string[]): Array<[string, number]> => { const m = new Map<string, number>(); for (const x of xs) m.set(x, (m.get(x) ?? 0) + 1); return [...m].sort((a, b) => b[1] - a[1]); };

export function summarize(stageId: string, rows: StageRoll[]): StageSummary {
  const per = {} as StageSummary['per'];
  for (const d of SETTINGS) {
    const R = rows.filter((r) => r.d === d), C = R.filter((r) => r.clean);
    const foes: Record<string, [number, number]> = {};
    for (const t of new Set(C.flatMap((r) => Object.keys(r.foes)))) foes[t] = range(C.map((r) => r.foes[t] ?? 0))!;
    per[d] = {
      rolls: R.length, clean: C.length, thrown: R.filter((r) => r.thrown).length,
      refusals: counted(R.flatMap((r) => [...new Set((r.thrown ? [`THROW ${r.thrown}`] : r.errors).map(kindOf))])),
      graphs: counted(C.map((r) => r.graph ?? '(none)')), orders: new Set(C.map((r) => r.plan.join(' '))).size,
      kinds: counted(C.map((r) => r.kinds.join('+') || '(no cast)')), foes,
      seconds: range(C.map((r) => r.seconds).filter((x): x is number => typeof x === 'number')),
      width: range(C.map((r) => r.width).filter((x): x is number => typeof x === 'number')),
    };
  }
  const seeds = [...new Set(rows.map((r) => r.seed))].sort((a, b) => a - b);
  const both = seeds.filter((s) => SETTINGS.every((d) => rows.some((r) => r.seed === s && r.d === d && r.clean)));
  const laid = new Set(rows.flatMap((r) => r.plan));
  let neverLaid: string[] = [];
  try { const { kit } = stageSource(stageId); neverLaid = stagePool(kit().manifest as Any, stageId).map((t) => t.id).filter((id) => !laid.has(id)); } catch { /* no row: rollStage already says so */ }
  return { stage: stageId, seeds: seeds.length, per, both, neverLaid };
}

export function printSummary(s: StageSummary, log: (l: string) => void = console.log): void {
  log(`${s.stage}: ${s.seeds} seeds x both settings, built from its stage-table row as the seed-list search builds it`);
  for (const d of SETTINGS) {
    const p = s.per[d];
    log(`== ${d}: CLEAN ${p.clean} of ${p.rolls} (${Math.round((100 * p.clean) / Math.max(1, p.rolls))}%), thrown ${p.thrown}; ${p.orders} distinct beat orders; graphs ${p.graphs.map(([g, n]) => `${g} ${n}`).join(', ') || 'none'}`);
    log(`   cast ${p.kinds.map(([k, n]) => `${k} ${n}`).join(', ') || 'none'}; creatures per clean roll ${Object.entries(p.foes).map(([t, [a, b]]) => `${t} ${a}-${b}`).join(', ') || 'none'}; seconds ${p.seconds ? p.seconds.join('-') : 'n/a'}; width ${p.width ? p.width.join('-') : 'n/a'} px`);
    for (const [k, n] of p.refusals.slice(0, 12)) log(`   ${String(n).padStart(4)}  ${k}`);
  }
  log(`clean on BOTH settings: ${s.both.length} of ${s.seeds} seeds${s.both.length ? ` (first: ${s.both.slice(0, 12).join(', ')})` : ''}`);
  log(`pool sections never laid: ${s.neverLaid.join(', ') || 'none'}`);
}

/** `par` > 1: the seeds split across child processes (each `--json`), merged in seed order */
export async function rollPar(stageId: string, n: number, from: number, par: number): Promise<StageRoll[]> {
  if (par <= 1) return rollMany(stageId, n, from);
  const { spawn } = await import('node:child_process');
  const per = Math.ceil(n / par), rows: StageRoll[] = [], self = fileURLToPath(import.meta.url);
  await Promise.all(Array.from({ length: par }, (_, i) => new Promise<void>((res, rej) => {
    const k = Math.min(per, n - i * per); if (k <= 0) return res();
    const ch = spawn(process.execPath, ['--import', 'tsx', self, '--stage', stageId, '--json', '--seeds', String(k), '--from', String(from + i * per)], { stdio: ['ignore', 'pipe', 'inherit'] });
    let buf = ''; ch.stdout.on('data', (b) => (buf += b));
    ch.on('close', (code) => { if (code) return rej(new Error(`libstage worker ${i} exited ${code}`)); for (const l of buf.split('\n')) if (l.startsWith('{')) rows.push(JSON.parse(l)); res(); });
  })));
  return rows.sort((a, b) => a.seed - b.seed || SETTINGS.indexOf(a.d) - SETTINGS.indexOf(b.d));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const argv = process.argv.slice(2);
  const val = (k: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const stage = val('--stage');
  if (!stage) { console.error('usage: npx tsx tools/engine/libstage.ts --stage <id> [--seeds 24] [--from 1] [--par 4] [--json]'); process.exit(2); }
  try { stageSource(stage); } catch (e) { console.error(String((e as Error).message)); process.exit(2); }
  const n = Number(val('--seeds') ?? 24), from = Number(val('--from') ?? 1), par = Number(val('--par') ?? 1);
  if (argv.includes('--json')) { for (const r of rollMany(stage, n, from)) console.log(JSON.stringify(r)); process.exit(0); }
  const s = summarize(stage, await rollPar(stage, n, from, par));
  printSummary(s);
  process.exit(s.both.length ? 0 : 1);
}
