// ENG-CATCH-i probe: build stages exactly as lockall.ts does (ROOT's tree, STAGES ids, layouts 1..N, both settings) and list every
// pair of solid wood at one height (|dy| <= 1) that overlaps strictly, plus exact duplicates; one line per build with any
const ROOT = process.env.ROOT!;
await import(ROOT + '/src/game/headlessDom.ts');
const { generateAllLevels } = await import(ROOT + '/src/game/worldsData.ts');
const { generateStage, setLayoutVariant } = await import(ROOT + '/src/game/stageGenerator.ts');
const { easyStage } = await import(ROOT + '/src/game/easyMode.ts');
const { withGoals } = await import(ROOT + '/src/game/goals.ts');
const only = (process.env.STAGES ?? '').split(',');
const N = Number(process.env.N ?? 16);
let total = 0, builds = 0, withAny = 0;
for (const c of generateAllLevels().filter((c: any) => !c.secret && only.includes(c.id))) {
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= N; v++) {
    setLayoutVariant(v);
    let st: any;
    try { st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal')); }
    catch (e) { console.log(`${c.id} ${setting} ${v} THROW ${String((e as Error).message).slice(0, 120)}`); setLayoutVariant(null); continue; }
    setLayoutVariant(null); builds++;
    const P = (st.platforms as any[]).filter((p) => p.type === 'solid');
    const pairs: string[] = [];
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
      const a = P[i], b = P[j];
      if (Math.abs(a.y - b.y) > 1 || !(a.x < b.x + b.width && b.x < a.x + a.width)) continue;
      const dup = a.x === b.x && a.width === b.width && a.y === b.y;
      pairs.push(`${dup ? 'DUP ' : ''}${a.x}-${a.x + a.width} over ${b.x}-${b.x + b.width} at y ${a.y}`);
    }
    total += pairs.length; if (pairs.length) withAny++;
    console.log(`${c.id} ${setting} ${v}: solid ${P.length}, pairs ${pairs.length}${pairs.length ? ' | ' + pairs.join('; ') : ''}`);
  }
}
console.log(`lockscan: ${total} pairs in ${withAny} of ${builds} builds`);
