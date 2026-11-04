/**
 * The fun gate (fun-validator, the lead 2026-11-04: "the validator as a gate, a world's flags may only shrink, like the known lists").
 * The validator's structure checks (evaluate.ts: dead walks, repeats, pacing, nothing bites, padding, one tempo, enemies by a landing,
 * like / looks like the stage before or an earlier one, nothing new) on every World 1 stage, layouts 1-16, Normal and Easy, the world in
 * order, from the real engine (D19). Each (stage, setting, rule) is flagged on some number of layouts; `funknown.json` holds those counts as
 * they were when the gate was built (World 1's debt, the defect behind it D26 "everything feels the same", owner the World 1 rebuild).
 *   - a count over its known number, or a flag with no entry: FAIL (a change made World 1 worse by the stick);
 *   - a count under its known number: FAIL until the entry is lowered (the list only shrinks; lower it in the same commit);
 *   - knowncheck.mjs fails any entry added to the list, or any count raised (each layout counted is one id there).
 *     npx tsx tools/validate/funcheck.ts               (about 1 minute; exit 0 pass, 1 breach, 2 could not run)
 *     FUNCHECK_WRITE=1 npx tsx tools/validate/funcheck.ts   (rewrites the counts from this run: only to lower them, knowncheck guards it)
 * Not in the gate: the play checks (the hold-right probes, the first-timer and clumsy bots: minutes per stage, and they rest on the bot);
 * they stay on the pages (world1.ts). Worlds 2-10 join when the validator reads them (its builders' meta, W1 in evaluate.ts).
 */
import '../../src/game/headlessDom.ts';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { world, W1, MOVE_RULES } from './evaluate.ts';
import type { StageEval } from './evaluate.ts';

/**
 * The stages rebuilt from 2026-11-04 on, gated on the truer move rule (movesAlike: the terrain's own moves, so petals moved around never
 * read as a new stage). The lead's ruling, 11-04: the truer rule is the validator's rule, printed for every stage; a stage rebuilt from
 * today on is gated on it; one not yet rebuilt (1-6 to 1-9 today) is gated on the old rule (the goal route's moves alone) at its listed
 * counts, with the truer count printed beside. 1-1 to 1-5 are marked from 11-04, ahead of their rebuilds tonight (their counts are the same on
 * both rules today, so the rebuilds are held to the truer rule from their first commit); 1-6 to 1-9 join as each is rebuilt. A stage is
 * never taken off.
 */
export const REBUILT: readonly string[] = ['1-1', '1-2', '1-3', '1-4', '1-5'];

/** the flags a stage is gated on: the truer rule's if it was rebuilt, else the old rule's for the move rules and the truer for the rest */
export function gatedFlags(ev: StageEval, rebuilt: readonly string[] = REBUILT) {
  if (rebuilt.includes(ev.id)) return ev.flags;
  const moves = new Set<string>(MOVE_RULES);
  return [...ev.flags.filter((f) => !moves.has(f.rule)), ...(ev.oldFlags ?? [])];
}

export const LAYOUTS = 16;
const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'funknown.json');

export interface FunKnown { stage: string; setting: 'normal' | 'easy'; rule: string; layouts: number; owner: string }
export const keyOf = (k: { stage: string; setting: string; rule: string }) => `${k.stage}|${k.setting}|${k.rule}`;

type Measured = Map<string, { stage: string; setting: 'normal' | 'easy'; rule: string; on: number[]; what: string; x?: number }>;

/**
 * each (stage, setting, rule) the structure checks flag, with the layouts it is flagged on and the first flag's words and x: `gated`, what
 * the gate holds each stage to (gatedFlags), and `truer`, every stage by the truer rule (printed beside the old rule's counts)
 */
export function measureBoth(layouts = LAYOUTS, rebuilt: readonly string[] = REBUILT): { gated: Measured; truer: Measured } {
  const gated: Measured = new Map(), truer: Measured = new Map();
  const add = (out: Measured, ev: StageEval, setting: 'normal' | 'easy', v: number, f: { rule: string; what: string; x?: number }) => {
    const k = keyOf({ stage: ev.id, setting, rule: f.rule });
    const e = out.get(k) ?? { stage: ev.id, setting, rule: f.rule, on: [], what: f.what, x: f.x };
    if (!e.on.includes(v)) e.on.push(v);
    out.set(k, e);
  };
  for (let v = 1; v <= layouts; v++) {
    for (const setting of ['normal', 'easy'] as const) {
      for (const ev of world(v, setting, W1)) {
        for (const f of gatedFlags(ev, rebuilt)) add(gated, ev, setting, v, f);
        for (const f of ev.flags) add(truer, ev, setting, v, f);
      }
    }
  }
  return { gated, truer };
}

/** what the gate holds World 1 to (measureBoth's `gated`) */
export function measure(layouts = LAYOUTS, rebuilt: readonly string[] = REBUILT): Measured {
  return measureBoth(layouts, rebuilt).gated;
}

/** for the stages gated on the old rule: each move rule whose truer count differs, printed beside the gated one */
export function truerBeside(gated: Measured, truer: Measured, rebuilt: readonly string[] = REBUILT): string[] {
  const out: string[] = [];
  const keys = new Set([...gated.keys(), ...truer.keys()]);
  for (const k of [...keys].sort()) {
    const e = truer.get(k) ?? gated.get(k)!;
    if (rebuilt.includes(e.stage) || !(MOVE_RULES as readonly string[]).includes(e.rule)) continue;
    const a = gated.get(k)?.on.length ?? 0, b = truer.get(k)?.on.length ?? 0;
    if (a !== b) out.push(`  (truer rule) ${e.stage} ${e.setting} "${e.rule}": gated on the old rule at ${a} layouts, ${b} by the truer rule`);
  }
  return out;
}

/** the gate's verdict: what grew (or is new), and what shrank but is still listed at its old count */
export function judgeAgainst(now: ReturnType<typeof measure>, known: FunKnown[]) {
  const byKey = new Map(known.map((k) => [keyOf(k), k]));
  const worse: string[] = [], stale: string[] = [];
  for (const [k, e] of now) {
    const kn = byKey.get(k);
    if (!kn) worse.push(`✗ new: ${e.stage} ${e.setting} "${e.rule}" on ${e.on.length} of ${LAYOUTS} layouts (${e.on.join(',')}); e.g. ${e.what}${e.x !== undefined ? ` at x ${e.x}` : ''}`);
    else if (e.on.length > kn.layouts) worse.push(`✗ worse: ${e.stage} ${e.setting} "${e.rule}" on ${e.on.length} layouts, known ${kn.layouts} (${e.on.join(',')}); e.g. ${e.what}${e.x !== undefined ? ` at x ${e.x}` : ''}`);
    else if (e.on.length < kn.layouts) stale.push(`✗ better, lower the entry: ${e.stage} ${e.setting} "${e.rule}" on ${e.on.length} layouts, known ${kn.layouts} (funknown.json: set layouts to ${e.on.length})`);
  }
  for (const [k, kn] of byKey) if (!now.has(k)) stale.push(`✗ gone, delete the entry: ${kn.stage} ${kn.setting} "${kn.rule}" (known on ${kn.layouts} layouts, now none)`);
  return { worse, stale };
}

const main = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (main) {
  const t0 = Date.now();
  let now: Measured, truer: Measured;
  try {
    ({ gated: now, truer } = measureBoth());
  } catch (err) {
    console.log(`fun gate: could not run (${String(err).slice(0, 300)}): FAIL`);
    process.exit(2);
  }
  const file = JSON.parse(fs.readFileSync(FILE, 'utf8')) as { known: FunKnown[] };
  if (process.env.FUNCHECK_WRITE) {
    const owner = (k: string) => file.known.find((q) => keyOf(q) === k)?.owner ?? 'World 1 rebuild (D26)';
    file.known = [...now].map(([k, e]) => ({ stage: e.stage, setting: e.setting, rule: e.rule, layouts: e.on.length, owner: owner(k) })).sort((a, b) => keyOf(a).localeCompare(keyOf(b)));
    fs.writeFileSync(FILE, JSON.stringify(file, null, 1) + '\n');
    console.log(`fun gate: wrote ${file.known.length} entries to funknown.json`);
  }
  const { worse, stale } = judgeAgainst(now, file.known);
  for (const l of [...worse, ...stale]) console.log(l);
  console.log(`the truer move rule gates: ${REBUILT.join(', ')}; the rest on the old rule, the truer count beside:`);
  for (const l of truerBeside(now, truer)) console.log(l);
  const total = file.known.reduce((a, k) => a + k.layouts, 0);
  const secs = Math.round((Date.now() - t0) / 1000);
  if (worse.length || stale.length) {
    console.log(`FAIL (${worse.length} worse or new, ${stale.length} to lower or delete; ${file.known.length} known, ${total} stage-layout flags; ${secs} s)`);
    process.exit(1);
  }
  console.log(`PASS (${file.known.length} known, ${total} stage-layout flags, World 1, ${LAYOUTS} layouts, Normal and Easy; ${secs} s)`);
}
