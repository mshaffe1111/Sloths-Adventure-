/**
 * One piece, checked alone (STAGE-RULES §1c step 3), before curation: each named section forced into its stage's rolls (the kit's
 * `required`), built on Normal and Easy the way the game builds them (curate.ts buildFor), and measured as curation measures a roll:
 * levelCheck (with the safe start), the clock, quiet stretches, animals by take-offs, then the kid (Easy) and adult (Normal) jump bots.
 * A development tool: it changes nothing.
 *
 *   npx tsx tools/gen2/pieceCheck.ts --stage 10-1 --sections w10-perch-run,w10-perch-climb [--rolls 8] [--salt 20261031] [--json out.json]
 *
 * Per section: how many rolls laid it, how many passed every filter (and why the rest failed), and the bots' worst jump rate in its rolls.
 */
import '../../src/game/headlessDom.ts';
import fs from 'node:fs';
import type { Phase, WorldKit } from '../../src/game/gen2/types.ts';
import { botCheck, buildFor, measureRoll, resolveStage, type CurateStage } from './curate.ts';
import { deadTime, EASY_GAP, NORMAL_GAP } from '../inspect/analyze.ts';
import { pickRoute } from '../inspect/eraRoll.ts';
import type { Stage } from '../inspect/stages.ts';

/** the quiet stretches over 4 s of a roll on one setting, each named by the sections it lies in (is it the piece, or a neighbour?) */
function quietWhere(stage: CurateStage, seed: number, setting: 'normal' | 'easy', piece: string): string[] {
  const st = buildFor(stage, seed, [], setting);
  const R = pickRoute(stage.config.objectiveType, st as unknown as Stage);
  const dn = deadTime(R.used.br.beats, R.used.br.total, setting === 'easy' ? EASY_GAP : NORMAL_GAP, R.used.samples);
  return dn.list.filter((d) => d.counted > 4).map((d) => {
    const secs = st.gen2.sections.filter((x) => x.x1 > Math.min(d.x0, d.x1) && x.x0 < Math.max(d.x0, d.x1)).map((x) => (x.template === piece ? `*${x.template}*` : x.template));
    return `${setting} quiet ${d.counted.toFixed(1)} s in ${secs.join(' + ')}`;
  });
}

const argv = process.argv.slice(2);
const arg = (k: string, d?: string) => {
  const i = argv.indexOf(`--${k}`);
  return i >= 0 ? argv[i + 1] : d;
};
const stageId = arg('stage')!;
const ids = (arg('sections') ?? '').split(',').filter(Boolean);
const rolls = Number(arg('rolls', '8'));
const salt = Number(arg('salt', '20261031'));
const phase = arg('phase') as Phase | undefined;
const json = arg('json');

const base = await resolveStage(stageId);
const forced = (id: string): CurateStage => {
  const wrap = (k: WorldKit): WorldKit => {
    const req = { ...(k.manifest.required ?? {}) };
    // (a section of a theme needs its theme's gate: the stage's own gate that opens it, forced at the start)
    const sec = k.manifest.sections.find((s) => s.id === id);
    const type = base.config.objectiveType;
    const gates = (sec?.uses ?? []).flatMap((u) => k.manifest.sections.filter((g) => g.teaches === u && g.phases.includes('start') && (g.archetypes === 'any' || g.archetypes.includes(type as never))).slice(0, 1));
    req[stageId] = [...gates.map((g) => ({ section: g.id, phase: 'start' as Phase })), ...(req[stageId] ?? []), { section: id, ...(phase ? { phase } : {}) }];
    return { ...k, manifest: { ...k.manifest, required: req } };
  };
  return { ...base, kit: wrap(base.kit), kitFor: (d) => wrap(base.kitFor ? base.kitFor(d) : base.kit) };
};

const out: unknown[] = [];
for (const id of ids) {
  const st = forced(id);
  const fails: Record<string, number> = {};
  let laid = 0, passed = 0;
  let worstKid: number | null = null, worstAdult: number | null = null;
  const good: number[] = [];
  for (let r = 0; r < rolls; r++) {
    const seed = salt + r * 7919;
    let m;
    try {
      m = measureRoll(st, seed, [], []);
    } catch (e) {
      const k = `build: ${String((e as Error).message).slice(0, 90)}`;
      fails[k] = (fails[k] ?? 0) + 1;
      continue;
    }
    if (!m.plan.some((p) => p.replace(/~$/, '') === id)) {
      fails['not laid'] = (fails['not laid'] ?? 0) + 1;
      continue;
    }
    laid++;
    for (const f of m.fails) fails[f.slice(0, 120)] = (fails[f.slice(0, 120)] ?? 0) + 1;
    for (const side of ['normal', 'easy'] as const) if (m.fails.some((f) => f.startsWith(`${side}: quiet`))) for (const w of quietWhere(st, seed, side, id)) fails[`  ${w}`] = (fails[`  ${w}`] ?? 0) + 1;
    for (const e of [...m.normal.errors, ...m.easy.errors].slice(0, 2)) fails[`  ${e.slice(0, 110)}`] = (fails[`  ${e.slice(0, 110)}`] ?? 0) + 1;
    if (m.fails.length) continue;
    const b = botCheck(st, m, []);
    const lo = (a: number | null, v: number | null) => (v === null ? a : a === null ? v : Math.min(a, v));
    worstKid = lo(worstKid, b.worstKid);
    worstAdult = lo(worstAdult, b.worstAdult);
    passed++;
    good.push(m.seed);
  }
  const r2 = (v: number | null) => (v === null ? '-' : v.toFixed(2));
  console.log(`${id}: laid ${laid}/${rolls}, passed ${passed}; worst kid ${r2(worstKid)} (>= 0.85), worst adult ${r2(worstAdult)} (>= 0.50); good seeds ${good.join(',')}`);
  for (const [k, n] of Object.entries(fails).sort((a, b) => b[1] - a[1])) console.log(`    ${n}x ${k}`);
  out.push({ id, laid, passed, worstKid, worstAdult, fails, good });
}
if (json) fs.writeFileSync(json, JSON.stringify(out, null, 1));
