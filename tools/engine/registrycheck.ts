/**
 * The registry gate (ADD-LEVEL, R-165.187; ENGINE-NEEDS.md §3 item 3; D51: "a new stage joins every stage-walking gate the day it is
 * built"). A stage gen2 rolls from data is registered in several places by hand; nothing failed when one was skipped. This fails, by stage
 * and by name, for every row of the ONE stage table (gen2/worlds/stageTable.ts) that is missing any of:
 *   row        it has a row in the stage table (asked of one stage: `--stage`)
 *   kit        its row's kit is one listed.ts KITS holds (the game can build it)
 *   config     worldsData.ts has the stage (its number, name, objective)
 *   routed     the game builds it on gen2 (stageGenerator.ts builtOnGen2, the game's one definition: a listed row with no hand-built plan
 *              in protoStage.ts HAND_STAGES shadowing it, new replaces old)
 *   attempts   levelSeeds.ts LEVEL_ATTEMPTS has it
 *   sheets     every creature and the bush sheet its rolls draw, both settings, is in its preload list (stageSheets.ts): the first 3 seeds
 *              of its list (else the first 3 of seeds 1-24 that build), as the seed-list search builds them (libstage.ts buildStage)
 *   drawcheck  it is a scenario of tools/perf/limits.json (drawcheck plays it, PERFORMANCE-RULES §8; D51)
 *   seeds      a proven seed list (provenIndex.ts) or a stand-in seed (its row's `standIn`, seedList.ts standIn)
 *   flown      its row is judged on a Normal scope (reach.ts JUDGED) and that scope has a flown row for every move Easy's rows fly
 *              (flownArcs.ts); a stage with no judged scope lays to the unflown reach (`reach.unflown`) and is a miss until it is flown
 * and, once for the table: CI runs `seedlist.ts <id> --check` for EVERY proven list (.github/workflows/gates.yml), by name or through
 * this tool's `--lists` loop.
 * The misses that existed when the gate was built are in registry.known.json (LAWS law 5: shrink-only; knowncheck.mjs fails an added
 * entry, and this gate fails an entry that is no longer a miss, so it is deleted the day it is fixed).
 *   npx tsx tools/engine/registrycheck.ts                 the gate (seconds; exit 1 on a miss not known, or a known entry fixed)
 *   npx tsx tools/engine/registrycheck.ts --stage 1-4     one stage's misses, known or not (addlevel.ts prints these); exit 1 if any
 *   npx tsx tools/engine/registrycheck.ts --lists         the stages with a proven list, one a line (gates.yml loops seedlist over them)
 */
import '../../src/game/headlessDom.ts';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { STAGE_TABLE } from '../../src/game/gen2/worlds/stageTable.ts';
import { listedStage } from '../../src/game/gen2/listed.ts';
import { FLOWN_ARCS, JUDGED } from '../../src/game/gen2/reach.ts';
import { PROVEN_INDEX } from '../../src/game/gen2/provenIndex.ts';
import { loadSeedList, provenSeeds } from '../../src/game/gen2/seedList.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import type { LevelConfig } from '../../src/game/types.ts';
import { LEVEL_ATTEMPTS } from '../../src/game/levelSeeds.ts';
import { builtOnGen2 } from '../../src/game/stageGenerator.ts';
import { stageSheets } from '../../src/game/stageSheets.ts';
import { stageAnims, stageExtras } from '../../src/game/sheetWarm.ts';
import { buildStage, SETTINGS } from './libstage.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const NEEDS = ['row', 'kit', 'config', 'routed', 'attempts', 'sheets', 'drawcheck', 'seeds', 'flown'] as const;
export type Need = (typeof NEEDS)[number];
export interface Miss { stage: string; need: Need | 'ci-seedlist'; line: string }

/** what the gate reads, all of it overridable so a test can plant a fault without touching a shipped file */
export interface RegistryInputs {
  stages: string[];
  row: (id: string) => { kit?: unknown; judged?: string; standIn?: unknown } | undefined;
  hasKit: (id: string) => boolean;
  config: (id: string) => LevelConfig | undefined;
  routed: (id: string) => boolean;
  attempts: Record<string, number>;
  scenarios: string[];
  lists: string[];
  judged: Record<string, string>;
  flown: ReadonlyArray<{ move: string; scope: string }>;
  /** the sheet keys a stage's rolls draw that its preload list lacks (the slow part: builds; a test stubs it) */
  sheetMisses: (id: string) => Promise<string[]>;
  gatesYml: string;
}

const readJson = (rel: string) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const levels = () => generateAllLevels();
const SHEETS_ON = { hand: true, paint: true, ctest: false } as const;

/** the sheet keys the stage's first three listed seeds (else seeds 1-3) draw on either setting that stageSheets does not preload */
export async function realSheetMisses(id: string, preload: (cfg: Parameters<typeof stageSheets>[0]) => string[] = (cfg) => stageSheets(cfg, SHEETS_ON)): Promise<string[]> {
  const cfg = levels().find((l) => l.id === id);
  if (!cfg) return [];
  if (PROVEN_INDEX[id]) await loadSeedList(id);
  const listed = provenSeeds(id);
  // (its first 3 listed seeds; with no list, the first 3 of seeds 1-24 that build on both settings: a roll that throws checks nothing)
  const tries = listed.length ? listed.slice(0, 3) : Array.from({ length: 24 }, (_, i) => i + 1);
  const want = new Set(preload(cfg));
  const out = new Set<string>();
  let checked = 0;
  for (const seed of tries) {
    if (checked >= 3) break;
    let both;
    try { both = SETTINGS.map((d) => [d, buildStage(id, seed, d)] as const); } catch (e) { if (listed.length) out.add(`(listed seed ${seed} threw: ${String((e as Error).message).slice(0, 80)})`); continue; }
    checked++;
    for (const [d, st] of both) for (const k of [...stageAnims(st).map((n) => `foe:${n}`), ...(stageExtras(st).props2 ? ['props2'] : [])]) if (!want.has(k)) out.add(`${k} (seed ${seed} ${d})`);
  }
  if (!checked) out.add(`(no seed of ${tries[0]}-${tries[tries.length - 1]} builds on both settings: its sheets are unchecked)`);
  return [...out];
}

/** the shipped inputs */
export function realInputs(): RegistryInputs {
  const lv = levels();
  return {
    stages: Object.keys(STAGE_TABLE),
    row: (id) => (Object.hasOwn(STAGE_TABLE, id) ? STAGE_TABLE[id] : undefined),
    hasKit: (id) => typeof listedStage(id)?.kit === 'function',
    config: (id) => lv.find((l) => l.id === id),
    routed: (id) => { const c = lv.find((l) => l.id === id); return !!c && builtOnGen2(c); },
    attempts: LEVEL_ATTEMPTS,
    scenarios: readJson('tools/perf/limits.json').scenarios,
    lists: Object.keys(PROVEN_INDEX),
    judged: JUDGED,
    flown: FLOWN_ARCS,
    sheetMisses: (id) => realSheetMisses(id),
    gatesYml: fs.readFileSync(path.join(root, '.github/workflows/gates.yml'), 'utf8'),
  };
}

/** the loop gates.yml runs: seedlist --check over every stage this tool lists (`--lists`) */
export const CI_LOOP = 'tools/engine/registrycheck.ts --lists';
/** does CI check this stage's list: a `seedlist.ts <id> --check` line, or the loop over `--lists` that also runs `seedlist.ts ... --check` */
export function ciChecks(yml: string, id: string): boolean {
  const lines = yml.split('\n').filter((l) => /^\s*-?\s*run:/.test(l) && !/^\s*#/.test(l));
  return lines.some((l) => (l.includes(CI_LOOP) && /seedlist\.ts\s+\S+\s+--check/.test(l)) || new RegExp(`seedlist\\.ts\\s+${id.replace(/[-]/g, '\\-')}\\s+--check`).test(l));
}

/** every miss for one stage */
export async function stageMisses(id: string, I: RegistryInputs): Promise<Miss[]> {
  const out: Miss[] = [];
  const miss = (need: Need, line: string) => out.push({ stage: id, need, line });
  const row = I.row(id);
  if (!row) { miss('row', `${id} has no row in src/game/gen2/worlds/stageTable.ts`); return out; }
  if (!I.hasKit(id)) miss('kit', `its row's kit "${String(row.kit)}" is not one src/game/gen2/listed.ts KITS holds`);
  const cfg = I.config(id);
  if (!cfg) miss('config', `src/game/worldsData.ts has no "${id}"`);
  else if (!I.routed(id)) miss('routed', `the game does not build it on gen2 (stageGenerator.ts builtOnGen2): a hand-built plan (protoStage.ts HAND_STAGES) or a secret shadows its row`);
  if (!Object.hasOwn(I.attempts, id)) miss('attempts', `src/game/levelSeeds.ts LEVEL_ATTEMPTS has no "${id}"`);
  if (!I.scenarios.includes(id)) miss('drawcheck', `tools/perf/limits.json "scenarios" does not list "${id}" (drawcheck never plays it; D51)`);
  if (!I.lists.includes(id) && !row.standIn) miss('seeds', `no proven seed list (src/game/gen2/provenIndex.ts; write it: npx tsx tools/engine/seedlist.ts ${id}) and no standIn in its row`);
  const scope = I.judged[id];
  if (!scope) miss('flown', `its row is not judged (no \`judged\` scope): it lays to the unflown reach (reach.unflown). Fly it: FLIGHT_STAGE=${id} npx tsx reference/specs/sims/flight.ts normal all`);
  else {
    const easyMoves = new Set(I.flown.filter((r) => r.scope === 'easy-any').map((r) => r.move));
    const have = new Set(I.flown.filter((r) => r.scope === scope).map((r) => r.move));
    const lacking = [...easyMoves].filter((m) => !have.has(m));
    if (!have.size) miss('flown', `judged on "${scope}" but flownArcs.ts has no row of that scope`);
    else if (lacking.length) miss('flown', `"${scope}" has no flown row for ${lacking.join(', ')} (Easy's rows fly them; flownArcs.ts)`);
  }
  if (cfg) { const s = await I.sheetMisses(id); if (s.length) miss('sheets', `its rolls draw sheets its preload list (stageSheets.ts) lacks: ${s.slice(0, 6).join(', ')}`); }
  return out;
}

/** every miss in the table, and CI's seed-list check for every list */
export async function allMisses(I: RegistryInputs): Promise<Miss[]> {
  const out: Miss[] = [];
  for (const id of I.stages) out.push(...(await stageMisses(id, I)));
  for (const id of I.lists) if (!ciChecks(I.gatesYml, id)) out.push({ stage: id, need: 'ci-seedlist', line: `.github/workflows/gates.yml does not run \`seedlist.ts ${id} --check\` (nor the loop over \`${CI_LOOP}\`)` });
  return out;
}

export interface KnownEntry { stage: string; need: string; why: string }
export const KNOWN_FILE = 'tools/engine/registry.known.json';
export const readKnown = (): KnownEntry[] => (fs.existsSync(path.join(root, KNOWN_FILE)) ? readJson(KNOWN_FILE).known : []);
const key = (x: { stage: string; need: string }) => `${x.stage}|${x.need}`;

/** the gate's verdict: misses not known fail; known entries that are no longer a miss fail (shrink-only: delete them) */
export function judge(misses: Miss[], known: KnownEntry[]): { fail: string[]; knownHeld: number } {
  const k = new Set(known.map(key)), m = new Set(misses.map(key));
  const fail = [
    ...misses.filter((x) => !k.has(key(x))).map((x) => `${x.stage} ${x.need}: ${x.line}`),
    ...known.filter((x) => !m.has(key(x))).map((x) => `${x.stage} ${x.need}: fixed, but still in ${KNOWN_FILE}: delete the entry (shrink-only)`),
  ];
  return { fail, knownHeld: misses.filter((x) => k.has(key(x))).length };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const argv = process.argv.slice(2);
  if (argv.includes('--lists')) { for (const id of Object.keys(PROVEN_INDEX)) console.log(id); process.exit(0); }
  const I = realInputs();
  const one = argv.includes('--stage') ? argv[argv.indexOf('--stage') + 1] : undefined;
  if (one) {
    const ms = await stageMisses(one, I);
    if (I.lists.includes(one) && !ciChecks(I.gatesYml, one)) ms.push({ stage: one, need: 'ci-seedlist', line: `gates.yml does not check its list` });
    const known = new Set(readKnown().map(key));
    console.log(ms.length ? `registrycheck ${one}: ${ms.length} missing\n${ms.map((x) => `  ${x.need.padEnd(11)} ${x.line}${known.has(key(x)) ? '  [known]' : ''}`).join('\n')}` : `registrycheck ${one}: registered everywhere (${NEEDS.join(', ')})`);
    process.exit(ms.length ? 1 : 0);
  }
  const t0 = Date.now();
  const { fail, knownHeld } = judge(await allMisses(I), readKnown());
  console.log(fail.length ? `registrycheck: FAIL\n  ${fail.join('\n  ')}` : `registrycheck: PASS (${I.stages.length} stages: ${I.stages.join(', ')}; ${I.lists.length} lists checked in CI; ${knownHeld} known misses held, ${KNOWN_FILE}; ${Math.round((Date.now() - t0) / 1000)} s)`);
  process.exit(fail.length ? 1 : 0);
}
