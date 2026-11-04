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
import { world, W1 } from './evaluate.ts';
import type { StageEval } from './evaluate.ts';

export const LAYOUTS = 16;
const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'funknown.json');

export interface FunKnown { stage: string; setting: 'normal' | 'easy'; rule: string; layouts: number; owner: string }
export const keyOf = (k: { stage: string; setting: string; rule: string }) => `${k.stage}|${k.setting}|${k.rule}`;

/**
 * The stages rebuilt from 2026-11-04 on, gated on the validator's truer rules (the lead's ruling, 11-04): a stage built on the music's
 * beat (w1Rhythm.ts: its proto.rhythm) counts as rebuilt by itself, and any other rebuilt stage is listed here in the commit that lands it.
 * The truer rules (evaluate.ts judge, truer): no credit for moved pickups (movesAlike), a long fall bites, a pair counts only when both
 * meet in one move, a ride is patience only with a real wait, a dense finale may run 15-20 s, §0c's template checks, and not like the
 * stage before on tempo or map shape. A stage not yet rebuilt is gated on the old rules at its listed counts, the truer count printed
 * beside. 1-1 to 1-5 are due tonight. A stage is never taken off.
 */
export const REBUILT: readonly string[] = ['1-1', '1-4'];

/** the stage is gated on the truer rules: listed, or built on the beat */
export const isRebuilt = (ev: StageEval, rebuilt: readonly string[] = REBUILT) => rebuilt.includes(ev.id) || !!(ev.built?.stage as { proto?: { rhythm?: unknown } } | undefined)?.proto?.rhythm;

/** the flags a stage is gated on: the truer rules' if it was rebuilt, else the old rules' */
export function gatedFlags(ev: StageEval, rebuilt: readonly string[] = REBUILT) {
  return isRebuilt(ev, rebuilt) ? ev.flags : (ev.oldFlags ?? ev.flags);
}

type Measured = Map<string, { stage: string; setting: 'normal' | 'easy'; rule: string; on: number[]; what: string; x?: number }>;

/**
 * each (stage, setting, rule) the structure checks flag, with the layouts it is flagged on and the first flag's words and x: `gated`, what
 * the gate holds each stage to (gatedFlags), and `truer`, every stage by the truer rule (printed beside the old rule's counts)
 */
export function measureBoth(layouts = LAYOUTS, rebuilt: readonly string[] = REBUILT): { gated: Measured; truer: Measured } {
  const gated: Measured = new Map(), truer: Measured = new Map();
  rebuiltSeen.clear();
  const add = (out: Measured, ev: StageEval, setting: 'normal' | 'easy', v: number, f: { rule: string; what: string; x?: number }) => {
    const k = keyOf({ stage: ev.id, setting, rule: f.rule });
    const e = out.get(k) ?? { stage: ev.id, setting, rule: f.rule, on: [], what: f.what, x: f.x };
    if (!e.on.includes(v)) e.on.push(v);
    out.set(k, e);
  };
  for (let v = 1; v <= layouts; v++) {
    for (const setting of ['normal', 'easy'] as const) {
      for (const ev of world(v, setting, W1)) {
        if (isRebuilt(ev, rebuilt)) rebuiltSeen.add(ev.id);
        for (const f of gatedFlags(ev, rebuilt)) add(gated, ev, setting, v, f);
        for (const f of ev.flags) add(truer, ev, setting, v, f);
      }
    }
  }
  return { gated, truer };
}

/** the stages the last measure found rebuilt (for the gate's print) */
export const rebuiltSeen = new Set<string>();

/** what the gate holds World 1 to (measureBoth's `gated`) */
export function measure(layouts = LAYOUTS, rebuilt: readonly string[] = REBUILT): Measured {
  return measureBoth(layouts, rebuilt).gated;
}

/** for the stages gated on the old rules: each rule whose truer count differs, printed beside the gated one */
export function truerBeside(gated: Measured, truer: Measured, rebuilt: readonly string[] = [...REBUILT, ...rebuiltSeen]): string[] {
  const out: string[] = [];
  const keys = new Set([...gated.keys(), ...truer.keys()]);
  for (const k of [...keys].sort()) {
    const e = truer.get(k) ?? gated.get(k)!;
    if (rebuilt.includes(e.stage)) continue;
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
  const gatedOn = [...new Set([...REBUILT, ...rebuiltSeen])].sort();
  console.log(`the truer rules gate: ${gatedOn.length ? gatedOn.join(', ') : 'no stage yet (a stage joins when it is rebuilt: built on the beat, or listed in REBUILT)'}; the rest on the old rules, the truer count beside:`);
  for (const l of truerBeside(now, truer)) console.log(l);
  const total = file.known.reduce((a, k) => a + k.layouts, 0);
  const secs = Math.round((Date.now() - t0) / 1000);
  if (worse.length || stale.length) {
    console.log(`FAIL (${worse.length} worse or new, ${stale.length} to lower or delete; ${file.known.length} known, ${total} stage-layout flags; ${secs} s)`);
    process.exit(1);
  }
  console.log(`PASS (${file.known.length} known, ${total} stage-layout flags, World 1, ${LAYOUTS} layouts, Normal and Easy; ${secs} s)`);
}
