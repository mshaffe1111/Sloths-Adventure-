// read-only scan: every flush pair of solid wood, same top, same height, same kind (style + every extra field), per build
const ROOT = process.env.ROOT!;
await import(ROOT + '/src/game/headlessDom.ts');
const { generateAllLevels } = await import(ROOT + '/src/game/worldsData.ts');
const { generateStage, setLayoutVariant } = await import(ROOT + '/src/game/stageGenerator.ts');
const { easyStage } = await import(ROOT + '/src/game/easyMode.ts');
const { withGoals } = await import(ROOT + '/src/game/goals.ts');
const N = Number(process.env.N ?? 16), only = process.env.STAGES?.split(',');
const kind = (p: any) => { const { id: _i, x: _x, y: _y, width: _w, tag: _t, drawX0: _a, drawX1: _b, ...k } = p; return JSON.stringify(k); };
const tot: Record<string, number> = {};
for (const c of generateAllLevels().filter((c: any) => !c.secret && (!only || only.includes(c.id)))) {
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= N; v++) {
    setLayoutVariant(v);
    let st: any;
    try { st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal')); } catch { setLayoutVariant(null); continue; }
    setLayoutVariant(null);
    const ps = (st.platforms as any[]).filter((p) => p.type === 'solid');
    const seams: string[] = [];
    for (const a of ps) for (const b of ps) if (a !== b && Math.abs(a.x + a.width - b.x) <= 1 && a.y === b.y && kind(a) === kind(b)) seams.push(`${a.x}-${a.x + a.width}|${b.x}-${b.x + b.width}@${a.y} ${a.style ?? ''}`);
    if (seams.length) { tot[c.id] = (tot[c.id] ?? 0) + seams.length; if (process.env.V) console.log(c.id, setting, v, seams.join('  ')); }
  }
}
console.log('TOTAL', JSON.stringify(tot));
