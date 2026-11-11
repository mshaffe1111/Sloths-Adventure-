// A rolled stage's YIELD (R-165.120, audit B-02): of N fresh seeds, how many lay cleanly (no gen2.errors) on each setting, and how many
// rolls each refusing rule stops. A fresh seed is one the proven list never saw: the range starts above the list's highest by default.
// Easy is Normal's stage under Easy's rules (pipeline.buildRolled), so an Easy roll carries every Normal error; the Easy column counts a
// rule when the Easy build names it, and "Easy only" when the Normal build of the same seed does not name that rule.
//   npx tsx tools/engine/yield.ts 1-1 [--from 50001] [--count 200] [--json out.json] [--min 50]
//   --min P: exit 1 when either setting's clean rate is under P percent (a gate's floor; the default 0 only reports)
// Counted: `clean` = gen2.errors empty; `stopped by` = rolls where the rule appears at least once (a roll with three V19b lines counts
// once); `first` = rolls where the rule is the roll's first error. yield.test.ts proves each counter on planted lines.
import fs from 'node:fs';
import type { Gen2Stage, WorldKit } from '../../src/game/gen2/types.ts';

/** a refusal line's rule, by name: the part of the line that says WHICH rule refused, never its numbers */
export function ruleOf(line: string): string {
  let m: RegExpExecArray | null;
  if (/^V19b/.test(line)) return 'V19b: the end is not above the bough window';
  if ((m = /^pool short at slot \d+ \(n\d+ (\w+): (.*)\)$/.exec(line))) {
    return /\(V19\)$/.test(m[2]) || /late rise/.test(m[2]) ? `pool short: ${m[1]}, the late rise ends short (V19)` : `pool short: ${m[1]}, ${m[2].replace(/\d+(\.\d+)?/g, '#')}`;
  }
  if (/^pool short/.test(line)) return 'pool short: other';
  if ((m = /^verdict (\S+) \((normal|easy)\)/.exec(line))) return `verdict ${m[1]}`;
  if ((m = /^node code: (V\d+\w*)/.exec(line))) return `node code ${m[1]}`;
  if (/^Easy could not lay Normal's plan/.test(line)) return "Easy could not lay Normal's plan";
  if (/^Easy's quick player under the floor/.test(line)) return "Easy's quick player under the floor";
  if (/^THREW/.test(line)) return `threw: ${line.slice(7).replace(/\d+(\.\d+)?/g, '#').slice(0, 70)}`;
  return line.replace(/\(s\d+\)/g, '').replace(/\d+(\.\d+)?/g, '#').slice(0, 70);
}

export interface YieldRow { rule: string; stopped: number; first: number }
export interface YieldTable { rolls: number; clean: number; rows: YieldRow[] }

/** the table for one setting: `rolls[i]` is roll i's error lines (empty: clean) */
export function tally(rolls: ReadonlyArray<readonly string[]>): YieldTable {
  const by = new Map<string, YieldRow>();
  const row = (rule: string) => { let r = by.get(rule); if (!r) by.set(rule, (r = { rule, stopped: 0, first: 0 })); return r; };
  let clean = 0;
  for (const errs of rolls) {
    if (!errs.length) { clean++; continue; }
    row(ruleOf(errs[0])).first++;
    for (const rule of new Set(errs.map(ruleOf))) row(rule).stopped++;
  }
  return { rolls: rolls.length, clean, rows: [...by.values()].sort((a, b) => b.stopped - a.stopped || b.first - a.first || a.rule.localeCompare(b.rule)) };
}

/** rolls a single rule stops ALONE (clean but for it): what fixing only that rule would win */
export function alone(rolls: ReadonlyArray<readonly string[]>): Map<string, number> {
  const out = new Map<string, number>();
  for (const errs of rolls) {
    const rules = new Set(errs.map(ruleOf));
    if (rules.size === 1) for (const r of rules) out.set(r, (out.get(r) ?? 0) + 1);
  }
  return out;
}

/** the lines of a seed's Easy roll whose RULE its Normal roll does not name (the same rule at other numbers is not Easy's own) */
export function easyOnly(normal: readonly string[], easy: readonly string[]): string[] {
  const rules = new Set(normal.map(ruleOf));
  return easy.filter((l) => !rules.has(ruleOf(l)));
}

const pct = (n: number, of: number) => `${of ? Math.round((100 * n) / of) : 0}%`;

export function printTable(title: string, t: YieldTable, soleBy: Map<string, number>): string {
  const lines = [`${title}: clean ${t.clean} of ${t.rolls} (${pct(t.clean, t.rolls)})`, '  stopped | first | alone | rule'];
  for (const r of t.rows) lines.push(`  ${String(r.stopped).padStart(7)} | ${String(r.first).padStart(5)} | ${String(soleBy.get(r.rule) ?? 0).padStart(5)} | ${r.rule}`);
  return lines.join('\n');
}

async function main(): Promise<void> {
  await import('../../src/game/headlessDom.ts');
  const { buildGen2Stage } = await import('../../src/game/gen2/pipeline.ts');
  const { w1World } = await import('../../src/game/gen2/worlds/w1.ts');
  const { generateAllLevels } = await import('../../src/game/worldsData.ts');
  // (the rolled kits, as tools/engine/seedlist.ts names them: a per-stage tool's table, not engine code)
  const KITS: Record<string, () => WorldKit> = { '1-1': w1World };
  const id = process.argv[2];
  const arg = (k: string, d: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
  const kit = KITS[id];
  if (!kit) { console.error(`yield: no rolled kit for "${id}" (KITS)`); process.exit(2); }
  const config = { ...generateAllLevels().find((l) => l.id === id)!, unlocked: true };
  const from = Number(arg('--from', '50001')), count = Number(arg('--count', '200')), min = Number(arg('--min', '0'));
  const errs = { normal: [] as string[][], easy: [] as string[][], easyOnly: [] as string[][] };
  const sections = { all: new Map<string, number>(), refused: new Map<string, number>() };
  const t0 = Date.now();
  for (let seed = from; seed < from + count; seed++) {
    const one = (difficulty: 'normal' | 'easy'): { errors: string[]; st?: Gen2Stage } => {
      try { const st = buildGen2Stage({ config, kit: kit(), seed, difficulty }); return { errors: st.gen2.errors ?? [], st }; } catch (e) { return { errors: [`THREW: ${(e as Error).message}`] }; }
    };
    const n = one('normal'), e = one('easy');
    errs.normal.push(n.errors); errs.easy.push(e.errors);
    errs.easyOnly.push(easyOnly(n.errors, e.errors));
    for (const p of e.st?.gen2.plan ?? []) {
      sections.all.set(p.template, (sections.all.get(p.template) ?? 0) + 1);
      if (e.errors.length) sections.refused.set(p.template, (sections.refused.get(p.template) ?? 0) + 1);
    }
  }
  const N = tally(errs.normal), E = tally(errs.easy), EO = tally(errs.easyOnly);
  console.log(`yield ${id}: seeds ${from}..${from + count - 1}, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  console.log(printTable('NORMAL', N, alone(errs.normal)));
  console.log(printTable('EASY (carries Normal\'s errors)', E, alone(errs.easy)));
  console.log(`EASY ONLY (rules a seed's Easy roll breaks and its Normal roll does not): ${EO.rolls - EO.clean} rolls\n${EO.rows.map((r) => `  ${String(r.stopped).padStart(7)} | ${r.rule}`).join('\n')}`);
  const out = arg('--json', '');
  if (out) fs.writeFileSync(out, JSON.stringify({ id, from, count, normal: N, easy: E, easyOnly: EO, sections: { all: [...sections.all], refused: [...sections.refused] } }, null, 1));
  if (100 * N.clean < min * N.rolls || 100 * E.clean < min * E.rolls) { console.log(`yield ${id}: FAIL (under ${min}% clean)`); process.exit(1); }
}

if (process.argv[1] && /yield\.ts$/.test(process.argv[1])) await main();
