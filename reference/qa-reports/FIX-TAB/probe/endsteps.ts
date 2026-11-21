// FIX-TAB (R-165.344) reach probe: every stage of every world, both settings, layouts 0..N-1 (as __play(stage, v) builds them), painted
// ground only (stagePaintInput, not a bough stage): every bank end that is OPEN (drawGround's own test: no bank meets it at its height,
// not a wall's left, not over a hollow) whose step down changes from the first lower bank listed (before) to the highest (stepDownTo,
// after). Those are the only ends the change redraws: their face and soil cut-back stop at the new step's top.
//   npx tsx reference/qa-reports/FIX-TAB/probe/endsteps.ts [--layouts 4] [--stages 1-6,2-1] [--json out.json]
import fs from 'node:fs';
import '../../../../src/game/headlessDom.ts';
(globalThis as Record<string, unknown>).Image = class {
  onload: null | (() => void) = null; onerror: null | (() => void) = null;
  width = 1; height = 1; naturalWidth = 1; naturalHeight = 1; complete = true;
  set src(_u: string) { this.onload?.(); }
  decode() { return { then: (ok: () => void) => ok() }; }
};
const { generateAllLevels } = await import('../../../../src/game/worldsData.ts');
const { generateStage, setLayoutVariant } = await import('../../../../src/game/stageGenerator.ts');
const { easyStage } = await import('../../../../src/game/easyMode.ts');
const { withGoals } = await import('../../../../src/game/goals.ts');
const { loadSeedList } = await import('../../../../src/game/gen2/seedList.ts');
const { PROVEN_INDEX } = await import('../../../../src/game/gen2/provenIndex.ts');
const { stagePaintInput } = await import('../../../../tools/engine/paintStage.ts');
const { paintedBank, sideOverHollow } = await import('../../../../src/game/w1Pits.ts');
const P = await import('../../../../src/game/protoArt.ts');
type Pl = import('../../../../src/game/types.ts').Platform;
const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const N = Number(arg('--layouts') ?? 4);
const only = arg('--stages')?.split(',');
const levels = generateAllLevels().filter((c) => !c.secret && (!only || only.includes(c.id)));
const first = (p: Pl, banks: Pl[], side: 'l' | 'r') => banks.find((q) => q !== p && q.y > p.y + 2 && (side === 'l' ? Math.abs(q.x + q.width - p.x) < 2 : Math.abs(p.x + p.width - q.x) < 2))?.y;
const out: Array<Record<string, unknown>> = [];
const perWorld = new Map<number, { builds: number; ends: number; stages: Set<string> }>();
for (const c of levels) {
  if (PROVEN_INDEX[c.id as keyof typeof PROVEN_INDEX]) await loadSeedList(c.id);
  for (const setting of ['normal', 'easy'] as const) for (let v = 0; v < N; v++) {
    setLayoutVariant(v);
    let st: ReturnType<typeof generateStage>;
    try { st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal')); }
    catch { setLayoutVariant(null); continue; }
    setLayoutVariant(null);
    const w = c.worldIndex;
    const row = perWorld.get(w) ?? { builds: 0, ends: 0, stages: new Set<string>() };
    perWorld.set(w, row);
    row.builds++;
    if (!stagePaintInput(st, c) || st.groundLook === 'bough') continue;
    const g2 = st as { gen2?: { seed?: number }; proto?: { gen2?: { seed?: number } } };
    const seed = (g2.gen2 ?? g2.proto?.gen2)?.seed ?? `L${v}`;
    const banks = (st.platforms as Pl[]).filter(paintedBank);
    for (const p of banks) {
      if (p.soil && banks.some((q) => q !== p && !q.soil && Math.abs(q.y + q.height - p.y) < 3 && q.x <= p.x + 2 && q.x + q.width >= p.x + p.width - 2)) continue;
      const touches = (side: 'l' | 'r') => { const ex = side === 'l' ? p.x : p.x + p.width; return banks.some((q) => q !== p && ((q.y <= p.y + 2 && (side === 'l' ? Math.abs(q.x + q.width - p.x) < 2 : Math.abs(p.x + p.width - q.x) < 2)) || (q.y < p.y && q.y + q.height >= p.y - 4 && q.x <= ex + 1 && q.x + q.width >= ex - 1))); };
      const isWall = banks.some((q) => q !== p && q.pit !== 'hurt' && Math.abs(q.x + q.width - p.x) < 2 && q.y - p.y > 150);
      for (const side of ['l', 'r'] as const) {
        const open = !touches(side) && !(side === 'l' && isWall) && !sideOverHollow(p, banks, side);
        if (!open) continue;
        const was = first(p, banks, side), now = P.stepDownTo(p, banks, side);
        if (was === now || was === undefined) continue;
        row.ends++; row.stages.add(c.id);
        out.push({ world: w, stage: c.id, setting, v, seed, bank: p.id, side, x: Math.round(side === 'l' ? p.x : p.x + p.width), top: Math.round(p.y), was: Math.round(was), now: Math.round(now!), cutWas: Math.round(P.faceCut(p.y, was)), cutNow: Math.round(P.faceCut(p.y, now!)) });
      }
    }
  }
  process.stderr.write(`${c.id} `);
}
process.stderr.write('\n');
for (const [w, r] of [...perWorld].sort((a, b) => a[0] - b[0])) console.log(`world ${w}: ${r.builds} builds, ${r.ends} open ends change step, stages: ${[...r.stages].join(' ') || '-'}`);
console.log(`TOTAL changed ends: ${out.length}`);
const j = arg('--json'); if (j) fs.writeFileSync(j, JSON.stringify(out, null, 0).replace(/},{/g, '},\n{'));
