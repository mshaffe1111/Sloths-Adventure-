// probe: head room on the drafted 3-1 (scratch; reads the tree named by TREE)
// probe (ENG-DOWNBOT): head room and refusals over the drafted rolls. TREE=<worktree> N=24 [V=1] npx tsx <this>
const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { generateAllLevels } = await import(`${T}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${T}/src/game/gen2/pipeline.ts`);
const { LISTED } = await import(`${T}/src/game/gen2/listed.ts`);
const ID = process.env.ID ?? '3-1';
readyDraft(ID);
const cfg = generateAllLevels().find((c: any) => c.id === ID && !c.secret)!;
const HEAD = 84;
const n = Number(process.env.N ?? 24);
let tot = 0, rollsBad = 0, errs = 0;
for (const d of ['normal', 'easy']) for (let seed = 1; seed <= n; seed++) {
  (globalThis as any).__CL = [];
  const st: any = buildGen2Stage({ config: cfg, kit: LISTED[ID].kit(), seed, difficulty: d });
  if (st.gen2?.errors?.length) { errs++; console.log(`${d} ${seed} ERR ${st.gen2.errors.slice(0, 2).join(' | ').slice(0, 200)}`); }
  const P = st.platforms.filter((p: any) => p.type !== 'fragile' && p.type !== 'block' && p.y < (st.gen2?.tower?.floorY ?? 1e9) - 1);
  const bad: string[] = [];
  for (const a of P) for (const b of P) {
    if (a === b) continue;
    const ov = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    const dy = a.y - b.y; // b above a
    if (ov > 30 && dy > 1 && dy < HEAD) bad.push(`${a.x}-${a.x + a.width}@${a.y}(${a.type}) under ${b.x}-${b.x + b.width}@${b.y}(${b.type}) ${dy}px`);
  }
  if (process.env.CL && seed === Number(process.env.CL) && d === (process.env.D ?? 'normal')) console.log((globalThis as any).__CL.join('\n'));
  if (bad.length) { rollsBad++; tot += bad.length; if (process.env.V) console.log(`${d} ${seed}: ${bad.join('; ')}`); }
}
console.log(`HEAD-ROOM: ${tot} squeezed pairs on ${rollsBad}/${2 * n} rolls; ${errs} refused`);
