/**
 * 1-5 "Where She Walked" rolled in the real pipeline from its own rows (w1Arc15.ts kitLib15), the way the game builds it. Tool-side:
 * nothing in the game imports it.
 *   npx tsx tools/engine/library15.ts [--seeds 24] [--from 1] [--json]
 * Prints per setting how many rolls are CLEAN (no gen2.errors) with every refusing line counted, then what a clean roll holds: the
 * beats in order, her marks, snakes, traps (the falling limb's among them), creaky limbs, flags, the modelled seconds.
 */
import '../../src/game/headlessDom.ts';
import { fileURLToPath } from 'node:url';
import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { kitLib15, STAGE_15 } from '../../src/game/gen2/worlds/w1Arc15.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { isCreak } from '../../src/game/gen2/creak.ts';
import { marksHeld } from '../../src/game/goals.ts';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
export const config15 = () => generateAllLevels().find((c) => c.id === STAGE_15 && !c.secret)!;

export interface Roll15 { seed: number; setting: 'normal' | 'easy'; errors: string[]; beats: string[]; marks: number; snakes: number; traps: string[]; limbs: number; flags: number; seconds: number; width: number; st: Any }
export function roll(seed: number, setting: 'normal' | 'easy'): Roll15 {
  const st: Any = buildGen2Stage({ config: config15() as Any, kit: kitLib15(), seed, difficulty: setting });
  const g = st.gen2 ?? {};
  return {
    seed, setting, st,
    errors: g.errors ?? [],
    beats: (g.sections ?? []).map((s: Any) => s.template),
    marks: marksHeld(st),
    snakes: st.enemies.length,
    traps: (st.proto?.cast?.traps ?? []).map((t: Any) => `${t.kind}:${t.load}`),
    limbs: st.platforms.filter(isCreak).length,
    flags: (st.checkpoints ?? st.proto?.checkpoints ?? []).length,
    seconds: Math.round((g.sections ?? []).reduce((s: number, q: Any) => s + (q.seconds ?? 0), 0)),
    width: st.config.levelWidth,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (k: string, d: number) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
  const n = arg('--seeds', 24), from = arg('--from', 1);
  for (const setting of ['normal', 'easy'] as const) {
    const why = new Map<string, number>();
    let clean = 0;
    const rows: Roll15[] = [];
    for (let s = from; s < from + n; s++) {
      let r: Roll15;
      try { r = roll(s, setting); } catch (e) { const m = `threw: ${(e as Error).message.slice(0, 200)}`; why.set(m, (why.get(m) ?? 0) + 1); continue; }
      if (!r.errors.length) { clean++; rows.push(r); } else for (const e of r.errors) { const k = e.replace(/\d+/g, '#').slice(0, 160); why.set(k, (why.get(k) ?? 0) + 1); }
    }
    console.log(`\n${setting}: ${clean}/${n} clean`);
    for (const [k, v] of [...why].sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(`  ${v}x ${k}`);
    if (rows[0]) {
      const r = rows[0];
      console.log(`  e.g. seed ${r.seed}: ${r.beats.join(' > ')}`);
    }
    if (rows.length) {
      const span = (f: (r: Roll15) => number) => `${Math.min(...rows.map(f))}-${Math.max(...rows.map(f))}`;
      console.log(`  marks ${span((r) => r.marks)}, snakes ${span((r) => r.snakes)}, limbs ${span((r) => r.limbs)}, flags ${span((r) => r.flags)}, seconds ${span((r) => r.seconds)}, width ${span((r) => r.width)}`);
      const tr = new Map<string, number>();
      for (const r of rows) for (const t of r.traps) tr.set(t, (tr.get(t) ?? 0) + 1);
      console.log(`  traps: ${[...tr].map(([k, v]) => `${k} x${v}`).join(', ')}`);
    }
  }
}
