/**
 * "Add a level" in one step (ADD-LEVEL, R-165.187; ENGINE-NEEDS.md §3 item 2). Run it once the stage's arc file is hooked into its world's
 * kit and its row is in the stage table (gen2/worlds/stageTable.ts): it does every plumbing step a builder did by hand for 1-3 (P13: ~3 h
 * 50 m), in order, each timed, and ends with one checklist of what is done and what is still missing, by file:
 *   1. the row      the stage's row, kit and config resolve (registrycheck.ts: row, kit, config)
 *   2. the rolls    libstage.ts: --seeds (24) seeds x both settings from its row; CLEAN counts, refusals, beats, cast, seconds.
 *                   Stops here when no seed is clean on both settings (nothing to list)
 *   3. the list     tools/engine/seedlist.ts <id> [--count N]: written only when the stage has none (or --relist), then --check
 *   4. the bots     tools/inspect/castBots.ts --stage <id> --seeds 1-40 (--bots-seeds), both settings; every bot's PASS line
 *   5. the flight   the flight-sim command for its flown rows when its row is not judged, or its scope lacks a move Easy flies
 *   6. the registry every place it is still missing from (registrycheck.ts --stage): drawcheck, sheets, levelSeeds, CI, ...
 * No stage is named in this file: it is handed one.
 *   npx tsx tools/engine/addlevel.ts <id> [--seeds 24] [--count N] [--relist] [--no-list] [--bots-seeds 1-40] [--no-bots] [--par 4]
 * Exit 0 only when every step passed and nothing is missing; 1 otherwise (the checklist says what); 2 with no row.
 * A DRAFT (ENG-W3a, the lead's ruling 11-23: a stage's next build readied while the game plays its live stage; stageTable.ts DRAFT_TABLE):
 *   GEN2_DRAFT=<id> npx tsx tools/engine/addlevel.ts <id>    the draft readied in this process and every step's (tools/engine/draft.ts).
 * A draft writes no list and joins no registry: those ARE listing it. Its READY is DRAFT READY (the lead's ruling 11-23): its row,
 * kit and config (with the row's travel) resolve, its rolls are clean on both settings, its sheets are preloaded. The bots run and their
 * lines are printed as OWED (a draft's bots are its build's job: 3-1's way down, the down-bot lane); what listing it adds (the routing past
 * the live stage, its list, its flown rows, drawcheck, CI) is printed as LISTING. Neither is counted missing.
 */
import '../../src/game/headlessDom.ts';
import { readied } from './draft.ts';
import { draftRow } from '../../src/game/gen2/worlds/stageTable.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { printSummary, rollPar, summarize } from './libstage.ts';
import { realInputs, stageMisses } from './registrycheck.ts';
import { PROVEN_INDEX } from '../../src/game/gen2/provenIndex.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const argv = process.argv.slice(2);
const id = argv[0];
const val = (k: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const has = (k: string) => argv.includes(k);
if (!id || id.startsWith('--')) { console.error('usage: npx tsx tools/engine/addlevel.ts <id> [--seeds 24] [--count N] [--relist] [--no-list] [--bots-seeds 1-40] [--no-bots] [--par 4]'); process.exit(2); }
const par = Number(val('--par') ?? 4);
const done: string[] = [], left: string[] = [], listing: string[] = [], owed: string[] = [];
/** a draft readied in this process (GEN2_DRAFT=<id>, draft.ts): its steps are the draft's */
const draft = readied === id;
const t0 = Date.now();
const clock = () => `${Math.round((Date.now() - t0) / 1000)} s`;
const step = (n: number, what: string) => console.log(`\n== ${n}. ${what} (at ${clock()})`);
/** a child tool run in the foreground, its output shown and kept */
const run = (args: string[], env: Record<string, string> = {}): { code: number; out: string } => {
  const r = spawnSync(process.execPath, ['--import', 'tsx', ...args], { cwd: root, encoding: 'utf8', env: { ...process.env, ...env }, maxBuffer: 64 << 20 });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  process.stdout.write(out.split('\n').slice(-40).join('\n') + '\n');
  return { code: r.status ?? 1, out };
};

// 1. the row
step(1, 'the row');
const real = realInputs();
// (a draft's row is its DRAFT_TABLE row; the game still plays its live stage, so it is not routed until its build lists it)
const I = draft ? { ...real, row: (s: string) => (s === id ? { ...draftRow(id)! } : real.row(s)), routed: (s: string) => (s === id ? false : real.routed(s)) } : real;
const first = (await stageMisses(id, { ...I, sheetMisses: async () => [] })).filter((m) => m.need === 'row' || m.need === 'kit' || m.need === 'config');
if (draft) {
  const cfg = generateAllLevels().find((c) => c.id === id && !c.secret);
  const want = draftRow(id)!.travel;
  if (want && cfg?.travel !== want) first.push({ stage: id, need: 'config', line: `its config travels ${cfg?.travel ?? 'right'}, its draft row ${want} (tools/engine/draft.ts sets it)` });
  console.log(`  a DRAFT (GEN2_DRAFT=${id}): row ${JSON.stringify(draftRow(id))}, the live stage stays what the game plays`);
}
if (first.length) {
  for (const m of first) console.log(`  MISSING ${m.need}: ${m.line}`);
  console.log(`\naddlevel ${id}: stopped at the row. Give it a row in src/game/gen2/worlds/stageTable.ts (its kit by name, listed.ts KITS) and its arc in its world's kit (level.md step 2), then run this again.`);
  process.exit(2);
}
done.push('row, kit and config resolve');

// 2. the rolls
const N = Number(val('--seeds') ?? 24);
step(2, `the rolls: ${N} seeds x both settings (libstage.ts)`);
const S = summarize(id, await rollPar(id, N, 1, par));
printSummary(S);
if (!S.both.length) {
  console.log(`\naddlevel ${id}: stopped at the rolls: no seed of ${N} is clean on both settings, so there is nothing to list. Read the refusals above.`);
  process.exit(1);
}
done.push(`rolls: ${S.per.normal.clean}/${N} Normal, ${S.per.easy.clean}/${N} Easy clean; ${S.both.length}/${N} on both`);
if (S.per.normal.clean < N || S.per.easy.clean < N) left.push(`rolls: ${N - S.per.normal.clean} Normal and ${N - S.per.easy.clean} Easy of ${N} not clean (the list search skips them; read why above)`);

// 3. the list
step(3, 'the seed list (tools/engine/seedlist.ts)');
const hadList = Object.hasOwn(PROVEN_INDEX, id);
if (draft) { console.log('  a draft writes no list (its build lists it)'); listing.push(`seed list: npx tsx tools/engine/seedlist.ts ${id}, with its row in STAGE_TABLE`); }
else if (has('--no-list')) { console.log('  skipped (--no-list)'); left.push(`seed list: not written (--no-list): npx tsx tools/engine/seedlist.ts ${id}`); }
else {
  if (!hadList || has('--relist')) {
    const w = run(['tools/engine/seedlist.ts', id, ...(val('--count') ? ['--count', val('--count')!] : [])]);
    if (w.code) { left.push(`seed list: seedlist.ts ${id} failed (output above)`); }
    else done.push(`seed list written: ${w.out.match(/seedlist \S+: (\d+ proven of \d+ tried[^\n]*)/)?.[1] ?? 'see above'}`);
  } else console.log(`  ${id} already has a list (${PROVEN_INDEX[id].n} seeds, version ${PROVEN_INDEX[id].version}); --relist rebuilds it`);
  // (checked in a fresh process: the list file just written is loaded as the game loads it)
  const c = run(['tools/engine/seedlist.ts', id, '--check']);
  if (c.code) left.push(`seed list: seedlist.ts ${id} --check FAILS (output above)`); else done.push('seed list: --check PASS');
}

// 4. the bots
const botSeeds = val('--bots-seeds') ?? '1-40';
step(4, `the bots (tools/inspect/castBots.ts --seeds ${botSeeds}, both settings)`);
if (has('--no-bots')) { console.log('  skipped (--no-bots)'); (draft ? owed : left).push(`bots: not run (--no-bots): npx tsx tools/inspect/castBots.ts --stage ${id} --seeds ${botSeeds} --par ${par}`); }
else {
  const b = run(['tools/inspect/castBots.ts', '--stage', id, '--seeds', botSeeds, '--par', String(par)]);
  // (castBots prints fields between the PASS and the time, e.g. LEN-14's 'under the floor N': read past them)
  const lines = [...b.out.matchAll(/^(\w+)\s+(normal|easy)\s+PASS (\d+)\/(\d+);.*?time median ([\d.-]+) s \(min ([\d.-]+)\)/gm)];
  // (a draft's bot lines are owed, never missing: its READY is its row, rolls and sheets)
  const miss = draft ? owed : left;
  if (b.code || !lines.length) miss.push('bots: castBots did not run to its summary (output above)');
  for (const m of lines) {
    const [, bot, setting, pass, of, , min] = m;
    if (pass !== of) miss.push(`bots: ${bot} ${setting} passes ${pass}/${of} (fails above, by cause)`);
    if (Number(min) < 120) miss.push(`bots: ${bot} ${setting} ran it in ${min} s, under STAGE-RULES' 2 minutes`);
  }
  if (lines.length && lines.every((m) => m[3] === m[4])) done.push(`bots: every bot passes ${lines[0][4]}/${lines[0][4]} on both settings`);
}

// 5. the flight
step(5, 'the flown rows');
const flown = (await stageMisses(id, { ...I, sheetMisses: async () => [] })).filter((m) => m.need === 'flown');
if (!flown.length) { console.log(`  judged on "${I.judged[id]}", every move Easy flies has its row`); done.push(`flown: judged on ${I.judged[id]}`); }
else if (draft) { for (const m of flown) listing.push(`flown: ${m.line}`); flown.length = 0; }
else {
  for (const m of flown) console.log(`  MISSING: ${m.line}`);
  console.log(`  fly it:  FLIGHT_STAGE=${id} npx tsx reference/specs/sims/flight.ts normal all\n  then enter its Normal rows in src/game/gen2/worlds/flownArcs.ts (a block under scope 'normal-${id}', as 1-3's n13 rows) and give its row \`judged: 'normal-${id}'\` in stageTable.ts`);
}

// 6. the registry (fresh inputs: a list written in step 3 is on disk, not in this process's index, so it is read again in a child)
step(6, 'every other registration (tools/engine/registrycheck.ts --stage)');
// (a draft: the same needs, read here with its draft row: a sheet it lacks is the draft's to fix; the rest is listing it)
const LISTING_NEEDS = new Set(['routed', 'attempts', 'drawcheck', 'seeds', 'flown', 'ci-seedlist']);
if (draft) {
  const ms = await stageMisses(id, I);
  for (const m of ms) (LISTING_NEEDS.has(m.need) ? listing : left).push(`${m.need}: ${m.line}`);
  if (!ms.some((m) => !LISTING_NEEDS.has(m.need))) done.push('the draft\'s own needs (row, kit, config, sheets) all met');
} else {
const r = run(['tools/engine/registrycheck.ts', '--stage', id]);
const regMisses = [...r.out.matchAll(/^ {2}(\S+)\s+(.+)$/gm)].map((m) => ({ need: m[1], line: m[2] }));
for (const m of regMisses) if (m.need !== 'flown') left.push(`${m.need}: ${m.line}`);
if (!r.code) done.push('registered everywhere registrycheck looks');
}

console.log(`\n== addlevel ${id}: ${clock()}`);
for (const d of done) console.log(`  DONE     ${d}`);
for (const l of [...new Set([...left, ...flown.map((m) => `flown: ${m.line}`)])]) console.log(`  MISSING  ${l}`);
for (const l of owed) console.log(`  OWED     ${l}`);
for (const l of listing) console.log(`  LISTING  ${l}`);
if (draft) console.log(left.length ? `addlevel ${id}: DRAFT NOT READY (${left.length} missing above)` : `addlevel ${id}: DRAFT READY: its row, rolls and sheets; ${owed.length} OWED (the bots) and ${listing.length} LISTING lines above are its build's`);
else console.log(left.length || flown.length ? `addlevel ${id}: NOT READY (${left.length + flown.length} missing above)` : `addlevel ${id}: READY: every step passed and it is registered everywhere`);
process.exit(left.length || flown.length ? 1 : 0);
