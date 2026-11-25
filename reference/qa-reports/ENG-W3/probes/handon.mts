// probe (ENG-DOWNBOT, LAY finding 2): per down turn whose vine stops on a catch, where stepping off each end of the catch's run lands,
// against the turn's own storey (t.to). TREE=<worktree> [N=24] [V=1] GEN2_DRAFT=3-1 npx tsx <this>
const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { generateAllLevels } = await import(`${T}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${T}/src/game/gen2/pipeline.ts`);
const { LISTED } = await import(`${T}/src/game/gen2/listed.ts`);
readyDraft('3-1');
const cfg = generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!;
let turnsStopped = 0, past = 0; const rolls = new Set<string>();
for (const d of ['normal', 'easy']) for (let seed = 1; seed <= Number(process.env.N ?? 24); seed++) {
  const st: any = buildGen2Stage({ config: cfg, kit: LISTED['3-1'].kit(), seed, difficulty: d });
  const tw = st.gen2.tower; const W = Math.max(...st.platforms.map((p: any) => p.x + p.width));
  const solid = st.platforms.filter((p: any) => p.type === 'solid');
  const under = (x: number, y: number) => { let b: number | undefined; for (const p of st.platforms) { if (p.type === 'fragile' || x < p.x || x > p.x + p.width || p.y <= y + 1) continue; if (b === undefined || p.y < b) b = p.y; } return b; };
  for (const t of tw.turns ?? []) {
    if (!(t.to > t.from)) continue;
    const c = solid.filter((p: any) => p.x + 6 < t.x && p.x + p.width - 6 > t.x && p.y > t.from + 10 && p.y < t.to - 10).sort((a: any, b: any) => a.y - b.y)[0];
    if (!c) continue;
    turnsStopped++;
    let x0 = c.x, x1 = c.x + c.width, grew = true;
    while (grew) { grew = false; for (const q of solid) if (Math.abs(q.y - c.y) <= 1 && q.x <= x1 + 2 && q.x + q.width >= x0 - 2 && (q.x < x0 || q.x + q.width > x1)) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x + q.width); grew = true; } }
    const ends = [x0 - 24, x1 + 24].filter((x) => x >= 20 && x <= W - 20).map((x) => ({ x, land: under(x, c.y) }));
    const ok = ends.some((e) => e.land !== undefined && Math.abs(e.land - t.to) <= 2);
    if (!ok) { past++; rolls.add(`${d} ${seed}`); if (process.env.V) console.log(d, seed, `turn x${t.x} ${t.from}->${t.to}: catch run ${x0}-${x1} @${c.y}; ends ${ends.map((e) => `${e.x}->${e.land ?? 'none'}`).join(' ')}`); }
  }
}
console.log(`STOPPED TURNS ${turnsStopped}; catch passes its storey: ${past} on ${rolls.size} rolls`);
