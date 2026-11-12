/**
 * A rolled stage's proven seeds (the lead, 11-06, approving the planner's build-time fix): Play draws its seed from this list and builds
 * that seed's proven PLAN (plan replay: one lay and its check, about a third of a full search), so a play never searches and never walks;
 * provenGen2Stage stays the guard for a seed off the list. Each seed on the list was built at build time and laid cleanly on BOTH settings
 * (no gen2.errors: every slot filled by its rule, the required sections placed, no V-rule broken, Easy laying Normal's plan), and its
 * replay is identical to its full search (every part of the stage the lock hashes). tools/engine/seedlist.ts writes the list; its --check,
 * in CI, holds every seed to both, so an engine or kit change that stales the list fails until the list is rebuilt.
 *
 * WHERE A LIST LIVES (R-165.112): each stage's list is its own file, gen2/proven/seeds-<stage>.ts, loaded on its own (a lazy chunk the
 * service worker precaches, so it is there offline) and NEVER imported by name from the game's main script: the main script holds only
 * provenIndex.ts (a stage's count, version and loader: the same few bytes whatever the list's length), so a list can hold thousands of
 * layouts. loadSeedList fetches a stage's list (the game: when the stage's card opens, a stage starts, and before its engine is built,
 * App.tsx launchEngine, which waits for it); the readers below are plain and answer from the list in memory. A stage whose list is not
 * in memory (the load failed or is still on its way) plays its STAND-IN: one listed seed whose proven plan is in the main script (1-1:
 * the fixed first run, firstRun11.ts), so Play still only ever builds a proven layout, and never waits on the network to do it.
 * Under Node (the tests and the tools: no page, no build, nothing to fetch) a reader that finds a list never asked for reads the
 * stage's file on the spot (loadNow), so a test builds 1-1 as it always has; seedListLoad.test.ts plants the page's side.
 */
import { buildGen2Stage, provenGen2Stage } from './pipeline.ts';
import { PROVEN_INDEX } from './provenIndex.ts';
import { FIRST_RUN_11 } from './firstRun11.ts';
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

/** a list as a version: its seeds and packed plans hashed (FNV-1a, 8 hex digits). The index holds it (seedlist.ts writes it), so a run can
 *  say which list it was drawn from without the list in hand (testRound.ts) */
export function listVersion(l: PackedList): string {
  const s = JSON.stringify(l);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** where a stage's list comes from (provenIndex.ts: a dynamic import of the stage's list file; a test plants its own) */
export type SeedListSource = () => Promise<{ LIST: PackedList }>;
/** where a stage's list is: never asked for; on its way; in memory; or its last load failed (the next loadSeedList tries again) */
export type SeedListState = 'unloaded' | 'loading' | 'ready' | 'failed';
const sources = new Map<string, SeedListSource>(Object.entries(PROVEN_INDEX).map(([id, e]) => [id, e.load]));
const lists = new Map<string, PackedList>();
const loading = new Map<string, Promise<boolean>>();
const failed = new Map<string, string>();

/** the ways a loaded list is not the one the index names (a cut-off or stale file is never played from) */
function listFaults(stageId: string, l: PackedList | undefined): string | null {
  if (!l || !Array.isArray(l.seeds) || !Array.isArray(l.plans) || !Array.isArray(l.dict)) return 'no list in the file';
  if (l.plans.length !== l.seeds.length) return `${l.seeds.length} seeds but ${l.plans.length} plans`;
  const e = PROVEN_INDEX[stageId];
  if (e && l.seeds.length !== e.n) return `${l.seeds.length} seeds, the index says ${e.n}`;
  return null;
}
/**
 * Fetch a stage's list. Resolves true once it is in memory (at once when it already is), false when the stage has no list or the load
 * failed; never rejects. One fetch at a time a stage; a failed load is not kept, so the next call tries again.
 */
export function loadSeedList(stageId: string): Promise<boolean> {
  if (lists.has(stageId)) return Promise.resolve(true);
  const src = sources.get(stageId);
  if (!src) return Promise.resolve(false);
  let p = loading.get(stageId);
  if (!p) {
    p = Promise.resolve().then(src).then((m) => {
      const fault = listFaults(stageId, m?.LIST);
      if (fault) throw new Error(fault);
      lists.set(stageId, m.LIST);
      failed.delete(stageId);
      return true;
    }).catch((e: unknown) => {
      failed.set(stageId, e instanceof Error ? e.message : String(e));
      return false;
    }).finally(() => { loading.delete(stageId); });
    loading.set(stageId, p);
  }
  return p;
}
export function seedListState(stageId: string): SeedListState {
  return lists.has(stageId) ? 'ready' : loading.has(stageId) ? 'loading' : failed.has(stageId) ? 'failed' : 'unloaded';
}
/** why the last load failed (the recorder and the tests), or null */
export const seedListError = (stageId: string): string | null => failed.get(stageId) ?? null;
/** does this stage draw from a list at all (the index: known without the list) */
export const hasSeedList = (stageId: string): boolean => sources.has(stageId);
/** how long a stage start waits for a list that is still loading before it plays the stand-in (ms) */
export const SEED_LIST_WAIT_MS = 3000;
/**
 * The wait before a stage is built (App.tsx launchEngine): resolves as soon as the stage's list is in memory, its load has failed, or
 * `capMs` has passed with the load still on its way (a stalled network never holds Play long: the stand-in plays). A stage waits ONCE:
 * after a failed or stalled load, later starts go straight in (the stand-in again) while the load is tried again behind them, until the
 * list arrives. true: the list is ready
 */
const gaveUp = new Set<string>();
export function seedListSettled(stageId: string, capMs = SEED_LIST_WAIT_MS): Promise<boolean> {
  if (!hasSeedList(stageId) || lists.has(stageId)) return Promise.resolve(lists.has(stageId));
  const load = loadSeedList(stageId).then((ok) => { if (ok) gaveUp.delete(stageId); else gaveUp.add(stageId); return ok; });
  if (gaveUp.has(stageId)) return Promise.resolve(false);
  return new Promise((resolve) => {
    const t = setTimeout(() => { gaveUp.add(stageId); resolve(lists.has(stageId)); }, capMs);
    void load.then((ok) => { clearTimeout(t); resolve(ok); });
  });
}
/** tests: plant a stage's source (a failing one, a cut-off one, a stalled one) and forget what was loaded: from here the stage's list
 *  comes only from that source, as on a page (no reading the file on the spot); returns the undo */
const planted = new Set<string>();
export function plantSeedListSource(stageId: string, src: SeedListSource | null): () => void {
  const was = { src: sources.get(stageId), list: lists.get(stageId), err: failed.get(stageId), planted: planted.has(stageId) };
  if (src) sources.set(stageId, src); else sources.delete(stageId);
  lists.delete(stageId); loading.delete(stageId); failed.delete(stageId); gaveUp.delete(stageId);
  planted.add(stageId);
  return () => {
    gaveUp.delete(stageId);
    if (was.src) sources.set(stageId, was.src); else sources.delete(stageId);
    loading.delete(stageId);
    if (was.list) lists.set(stageId, was.list); else lists.delete(stageId);
    if (was.err !== undefined) failed.set(stageId, was.err); else failed.delete(stageId);
    if (!was.planted) planted.delete(stageId);
  };
}

/** tests (listed.ts withTestStage): a fixture stage's list put in memory at once, as if loaded (its source planted too, so the stage
 *  has a list); returns the undo, plantSeedListSource's */
export function plantSeedList(stageId: string, l: PackedList): () => void {
  const undo = plantSeedListSource(stageId, () => Promise.resolve({ LIST: l }));
  lists.set(stageId, l);
  return undo;
}

/**
 * Node only (the tests and the tools run the game's code with no page and nothing to fetch): read the stage's list file on the spot.
 * A page never comes here (no Node `process`): there the list arrives by loadSeedList alone. Returns the list, or undefined
 */
function loadNow(stageId: string): PackedList | undefined {
  const node = (globalThis as { process?: { versions?: { node?: string }; getBuiltinModule?: (id: string) => unknown } }).process;
  if (planted.has(stageId) || !node?.versions?.node || !node.getBuiltinModule) return undefined;
  const { createRequire } = node.getBuiltinModule('node:module') as { createRequire: (from: string) => (id: string) => unknown };
  const l = (createRequire(import.meta.url)(`./proven/seeds-${stageId}.ts`) as { LIST?: PackedList }).LIST;
  const fault = listFaults(stageId, l);
  if (fault) throw new Error(`gen2 ${stageId}: its proven seed list file is not the one provenIndex.ts names (${fault}): tools/engine/seedlist.ts ${stageId}`);
  lists.set(stageId, l!);
  return l;
}

/**
 * A stage's stand-in: ONE listed seed with its proven plan, kept in the main script, played when the stage's list cannot be had. 1-1's
 * is the fixed first run (firstRun11.ts, locked by `seedlist 1-1 --check`; seedList.test.ts holds it to the list's own entry)
 */
const STAND_INS: Record<string, Replay> = {
  '1-1': { seed: FIRST_RUN_11.seed, rerolls: FIRST_RUN_11.rerolls, plan: FIRST_RUN_11.plan, foes: FIRST_RUN_11.foes ?? [] },
};
export const standIn = (stageId: string): Replay | undefined => STAND_INS[stageId];

/**
 * The list of a stage, when it is in memory; undefined for a stage with none, or one whose list is not here (yet). A list nobody has
 * asked for: under Node it is read on the spot; on a page it is asked for now (the callers' own wait, launchEngine, should have: this
 * keeps a path that skipped it from standing on the stand-in for good) and this answer is "not here"
 */
function list(stageId: string): PackedList | undefined {
  const l = lists.get(stageId);
  if (l || !sources.has(stageId) || seedListState(stageId) !== 'unloaded') return l;
  const now = loadNow(stageId);
  if (!now) void loadSeedList(stageId);
  return now;
}
/** is the stage's list in memory (as `list` has it: read on the spot under Node, asked for on a page) */
export const seedListReady = (stageId: string): boolean => !!list(stageId);
/** the stage's whole packed list (the list tool and the tests); undefined for a stage with none, or one whose load failed */
export const provenList = (stageId: string): PackedList | undefined => list(stageId);
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
/** a listed seed's proven plan; undefined off the list. With the list not in memory (a failed load), the stand-in's own plan */
export function provenPlan(stageId: string, seed: number): Replay | undefined {
  const L = list(stageId);
  if (!L) { const s = STAND_INS[stageId]; return s && sources.has(stageId) && s.seed === seed ? s : undefined; }
  const i = L.seeds.indexOf(seed);
  return i >= 0 ? unpackPlan(L.plans[i], L.dict) : undefined;
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
export function seedListBreaches(config: LevelConfig, kit: () => WorldKit, seeds: readonly number[], min = SEED_LIST_MIN, plans?: { dict: readonly string[]; plans: readonly string[] }, also?: BuildRequest['also']): string[] {
  const out: string[] = [];
  if (seeds.length < min) out.push(`${config.id}: ${seeds.length} proven seeds, under ${min}`);
  if (new Set(seeds).size !== seeds.length) out.push(`${config.id}: a seed is listed twice`);
  seeds.forEach((seed, i) => {
    for (const difficulty of ['normal', 'easy'] as const) {
      // (`also`: the rules the list was built under beyond the pipeline's own, so the search here is the search that listed the seed)
      const full = buildGen2Stage({ config, kit: kit(), seed, difficulty, ...(also ? { also } : {}) });
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
