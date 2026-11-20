// VAR-19e probe: funcheck's 4-runs (validate/core.ts repeats) on layouts 1..16 of a stage, both settings, each occurrence by the sections
// its four moves lie in. usage: npx tsx runs.ts <stage> [run]   (run: only that 4-move run; none: every flagged one)
import '../../../../src/game/headlessDom.ts';
import { build, moveString, repeats, RUN4_MAX } from '../../../../tools/validate/core.ts';
const [id, only] = [process.argv[2], process.argv[3]];
const pairs = new Map<string, number>();
for (const d of ['normal', 'easy'] as const) for (let v = 1; v <= 16; v++) {
  const b: any = build(id, v, d);
  const str = moveString(b.quick);
  const moves = b.quick.filter((s: any) => s.m !== 'h');
  const secs = (b.stage.gen2?.sections ?? []) as Array<{ template: string; x0: number; x1: number }>;
  const sec = (x: number) => secs.find((s) => x >= s.x0 && x < s.x1)?.template.replace('w1-19-', '') ?? '?';
  const flagged = repeats(str, b.quick, b.stage.proto?.bpm).filter((r) => r.kind === '4-run');
  const counts: string[] = [];
  for (const r of flagged) counts.push(`${r.run}x${r.n}`);
  // (every occurrence of each run that is flagged, or of `only`)
  const runs = only ? [only] : flagged.map((r) => r.run);
  for (const run of runs) {
    let n = 0;
    for (let i = 0; i + 4 <= str.length; i++) if (str.slice(i, i + 4) === run) {
      n++;
      const k = `${d} ${run}: ${[0, 1, 2, 3].map((j) => sec(moves[i + j].x)).join(' > ')}`;
      pairs.set(k, (pairs.get(k) ?? 0) + 1);
    }
    if (only && n > RUN4_MAX) counts.push(`(${run} ${n} incl. overlaps)`);
  }
  console.log(`${d} L${v}: ${counts.join(' ') || '-'}`);
}
for (const [k, n] of [...pairs].sort((a, b) => b[1] - a[1])) console.log(`${n}\t${k}`);
