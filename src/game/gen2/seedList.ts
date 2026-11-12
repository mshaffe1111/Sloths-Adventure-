/**
 * A rolled stage's proven seeds (the lead, 11-06, approving the planner's build-time fix): Play draws its seed from this list and builds
 * that seed's proven PLAN (plan replay: one lay and its check, about a third of a full search), so a play never searches and never walks;
 * provenGen2Stage stays the guard for a seed off the list. Each seed on the list was built at build time and laid cleanly on BOTH settings
 * (no gen2.errors: every slot filled by its rule, the required sections placed, no V-rule broken, Easy laying Normal's plan), and its
 * replay is identical to its full search (every part of the stage the lock hashes). tools/engine/seedlist.ts writes the list; its --check,
 * in CI, holds every seed to both, so an engine or kit change that stales the list fails until the list is rebuilt.
 */
import { buildGen2Stage, provenGen2Stage } from './pipeline.ts';
import { PROVEN_SEEDS } from './provenSeeds.ts';
import type { BuildRequest, Gen2Stage, PlanSlot, WorldKit } from './types.ts';
import type { LevelConfig } from '../types.ts';
import type { Difficulty } from '../difficulty.ts';

/** how many seeds a stage's list holds at least (the lead: a tester never notices a repeat) */
// (the target is 300; 100 is tonight's floor for 0.9.5 only, the lead 11-06, once a roll must also keep 1-1's promises, promises11.ts,
// and the quiet line: each phone shuffles its order, so none repeats within 100 plays. Back to 300 once the soft floors land: roadmap)
export const SEED_LIST_MIN = 100;
export const SEED_LIST_TARGET = 300;
/** the quiet line a listed seed is held to (the lead 11-06: it binds in the list builder): its longest quiet stretch on Normal, the outro
 *  excluded, at most this many seconds (STAGE-RULES' dead-time line, RULES.quietMax) */
export const QUIET_MAX = 4;

/** one stage's list as stored: section ids once (`dict`), then per seed its packed plan (packPlan) */
export interface PackedList { dict: string[]; seeds: number[]; plans: string[]; quiet?: number[]; outro?: number[] }
type Replay = NonNullable<BuildRequest['replay']>;
const JOIN = { walk: 'w', step: 's', pit: 'p', jump: 'j' } as const;
const UNJOIN: Record<string, PlanSlot['join']> = { w: 'walk', s: 'step', p: 'pit', j: 'jump' };

/**
 * A seed's search result packed small: "seed:rerolls|slot;slot..|foes" (foes: Normal's kept animals, "section/socket=creature,..", empty
 * for none). A slot is "t.j[m].v+v.salt[.node]": t, the section's index in `dict`;
 * j, the join (w s p j), m when mirrored; each sub-block version "sub=ver" an index in `dict` too; the node only when it is not the
 * slot's own n(i+1)
 */
export function packPlan(r: Replay, dict: string[]): string {
  const at = (t: string) => { let i = dict.indexOf(t); if (i < 0) { dict.push(t); i = dict.length - 1; } return i; };
  return `${r.seed}:${r.rerolls}|${r.plan.map((p, i) => {
    if (p.loose) throw new Error(`seedList: a proven plan has a loosened slot (${p.loose})`);
    const v = p.versions ? Object.entries(p.versions).map(([k, x]) => at(`${k}=${x}`)).join('+') : '';
    const node = p.node === `n${i + 1}` ? '' : `.${p.node.replace(/^n/, '')}`;
    return `${at(p.template)}.${JOIN[p.join]}${p.mirrored ? 'm' : ''}.${v}.${p.salt ?? ''}${node}`;
  }).join(';')}|${(r.foes ?? []).map(([k, v]) => `${k}=${v}`).join(',')}`;
}
export function unpackPlan(s: string, dict: readonly string[]): Replay {
  const [head, body, foes = ''] = s.split('|');
  const [seed, rerolls] = head.split(':').map(Number);
  const plan = body.split(';').map((q, i): PlanSlot => {
    const [ti, jm, v, salt, node] = q.split('.');
    return {
      template: dict[Number(ti)], mirrored: jm.endsWith('m'), node: node ? `n${node}` : `n${i + 1}`, join: UNJOIN[jm[0]],
      ...(v ? { versions: Object.fromEntries(v.split('+').map((k) => dict[Number(k)].split('=') as [string, string])) } : {}),
      ...(salt ? { salt: Number(salt) } : {}),
    };
  });
  return { seed, rerolls, plan, foes: foes ? foes.split(',').map((kv) => kv.split('=') as [string, string]) : [] };
}

const list = (stageId: string): PackedList | undefined => PROVEN_SEEDS[stageId] as PackedList | undefined;
/** the proven seeds of a stage, in the order they were found */
export function provenSeeds(stageId: string): readonly number[] {
  return list(stageId)?.seeds ?? [];
}
/** the seed for a play: the n-th play draws the list's (n mod length)-th seed (a caller passes a random n for a fresh stage a play) */
export function provenSeedFor(stageId: string, n: number): number {
  const s = provenSeeds(stageId);
  if (!s.length) throw new Error(`gen2 ${stageId}: no proven seed list (tools/engine/seedlist.ts ${stageId})`);
  return s[((Math.floor(n) % s.length) + s.length) % s.length];
}
/** a listed seed's proven plan; undefined off the list */
export function provenPlan(stageId: string, seed: number): Replay | undefined {
  const L = list(stageId);
  const i = L ? L.seeds.indexOf(seed) : -1;
  return L && i >= 0 ? unpackPlan(L.plans[i], L.dict) : undefined;
}

/**
 * The stage a play builds: a listed seed by its proven plan (one lay and its check); a seed off the list goes through provenGen2Stage (the
 * guard: the search, then the walk). A replay that fails its check (a stale list: the gate should have caught it) is never played either:
 * it falls back to the guard.
 */
export function buildPlayStage(config: LevelConfig, kit: WorldKit, seed: number, difficulty: Difficulty): Gen2Stage {
  const r = provenPlan(config.id, seed);
  if (r) {
    const st = buildGen2Stage({ config, kit, seed, difficulty, replay: r });
    if (!st.gen2.errors?.length) return st;
  }
  return provenGen2Stage({ config, kit, seed, difficulty });
}

/** the parts of a built stage a replay must match: everything the lock hashes (tools/engine/lockall.ts) but the search's own record */
export function stageParts(st: Gen2Stage): Record<string, string> {
  const o: Record<string, string> = {};
  const s = st as unknown as Record<string, unknown> & { proto?: Record<string, unknown> };
  for (const [k, v] of Object.entries(s)) if (k !== 'meta' && k !== 'config' && k !== 'proto' && k !== 'gen2') o[k] = JSON.stringify(v) ?? '';
  for (const [k, v] of Object.entries(s.proto ?? {})) if (k !== 'gen2') o[`proto.${k}`] = JSON.stringify(v) ?? '';
  o['gen2.plan'] = JSON.stringify(st.gen2.plan);
  o['gen2.code'] = st.gen2.codeString ?? '';
  return o;
}

/**
 * Every way a stage's seed list breaks the rule, by name: too short, a repeat, a seed that no longer lays cleanly on a setting, or a seed
 * whose replayed plan is not its full search's stage (`plans`: the packed list's plans, checked when given)
 */
export function seedListBreaches(config: LevelConfig, kit: () => WorldKit, seeds: readonly number[], min = SEED_LIST_MIN, plans?: { dict: readonly string[]; plans: readonly string[] }): string[] {
  const out: string[] = [];
  if (seeds.length < min) out.push(`${config.id}: ${seeds.length} proven seeds, under ${min}`);
  if (new Set(seeds).size !== seeds.length) out.push(`${config.id}: a seed is listed twice`);
  seeds.forEach((seed, i) => {
    for (const difficulty of ['normal', 'easy'] as const) {
      const full = buildGen2Stage({ config, kit: kit(), seed, difficulty });
      // (R-165.61: the roll's verdict on this setting, by name: 1-1's arcs, drops and its promises, judged by the pipeline from ONE registry,
      // promises11.ts PROMISES_11, whose `settings` say where each applies; no substring filter. A refused verdict is in `errors` too)
      const v = full.gen2.verdicts?.[difficulty];
      if (v && !v.accepted) { out.push(`${config.id} seed ${seed} ${difficulty}: verdict ${v.failed[0].name}: ${v.failed[0].line}`); continue; }
      const errs = full.gen2.errors ?? [];
      if (errs.length) { out.push(`${config.id} seed ${seed} ${difficulty}: ${errs[0]}`); continue; }
      if (!plans) continue;
      const rep = buildGen2Stage({ config, kit: kit(), seed, difficulty, replay: unpackPlan(plans.plans[i], plans.dict) });
      const a = stageParts(full), b = stageParts(rep);
      const bad = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => a[k] !== b[k]);
      if (bad.length) out.push(`${config.id} seed ${seed} ${difficulty}: its replay differs from its search (${bad.slice(0, 4).join(', ')}): rebuild the list`);
    }
  });
  return out;
}
