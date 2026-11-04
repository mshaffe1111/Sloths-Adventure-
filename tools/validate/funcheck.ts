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

export const LAYOUTS = 16;
const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'funknown.json');

export interface FunKnown { stage: string; setting: 'normal' | 'easy'; rule: string; layouts: number; owner: string }
export const keyOf = (k: { stage: string; setting: string; rule: string }) => `${k.stage}|${k.setting}|${k.rule}`;

/** each (stage, setting, rule) the structure checks flag, with the layouts it is flagged on and the first flag's words and x */
export function measure(layouts = LAYOUTS): Map<string, { stage: string; setting: 'normal' | 'easy'; rule: string; on: number[]; what: string; x?: number }> {
  const out = new Map<string, { stage: string; setting: 'normal' | 'easy'; rule: string; on: number[]; what: string; x?: number }>();
  for (let v = 1; v <= layouts; v++) {
    for (const setting of ['normal', 'easy'] as const) {
      for (const ev of world(v, setting, W1)) {
        for (const f of ev.flags) {
          const k = keyOf({ stage: ev.id, setting, rule: f.rule });
          const e = out.get(k) ?? { stage: ev.id, setting, rule: f.rule, on: [], what: f.what, x: f.x };
          if (!e.on.includes(v)) e.on.push(v);
          out.set(k, e);
        }
      }
    }
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
  let now: ReturnType<typeof measure>;
  try {
    now = measure();
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
  const total = file.known.reduce((a, k) => a + k.layouts, 0);
  const secs = Math.round((Date.now() - t0) / 1000);
  if (worse.length || stale.length) {
    console.log(`FAIL (${worse.length} worse or new, ${stale.length} to lower or delete; ${file.known.length} known, ${total} stage-layout flags; ${secs} s)`);
    process.exit(1);
  }
  console.log(`PASS (${file.known.length} known, ${total} stage-layout flags, World 1, ${LAYOUTS} layouts, Normal and Easy; ${secs} s)`);
}
