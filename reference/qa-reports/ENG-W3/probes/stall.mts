// probe (ENG-DOWNBOT): where a bot stalls on a drafted way down, and the wood around it.
// TREE=<worktree> BOT=kid SET=normal SEED=1 [ID=3-1] [R=420] GEN2_DRAFT=3-1 npx tsx <this>
const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { firstTimer } = await import(`${T}/tools/inspect/firsttimer.ts`);
const { CAST_BOTS } = await import(`${T}/tools/inspect/castBots.ts`);
const { generateAllLevels } = await import(`${T}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${T}/src/game/gen2/pipeline.ts`);
const { LISTED } = await import(`${T}/src/game/gen2/listed.ts`);
const { towerRoutePts } = await import(`${T}/tools/inspect/towerRoute.ts`);
const ID = process.env.ID ?? '3-1', BOT = process.env.BOT ?? 'kid', SET = process.env.SET ?? 'normal', SEED = Number(process.env.SEED ?? 1);
const R = Number(process.env.R ?? 420);
readyDraft(ID);
const r: any = firstTimer(ID, SEED, CAST_BOTS[BOT][SET], { cap: 1200, dotSetting: true });
console.log(`${BOT} ${SET} ${SEED}: ${r.end} ${r.time}s rescues ${r.rescues}`);
const cfg = generateAllLevels().find((c: any) => c.id === ID && !c.secret)!;
const st: any = buildGen2Stage({ config: cfg, kit: LISTED[ID].kit(), seed: SEED, difficulty: SET });
const route = towerRoutePts(st, st.spawn ?? st.playerStart ?? { x: 100, y: 0 }, 24) ?? [];
for (const s of r.stuck) {
  console.log(`-- t ${s.t} (${s.x},${s.y}) dur ${s.dur} rescued ${s.rescued}: ${s.what}`);
  const near = st.platforms.filter((p: any) => p.x < s.x + R && p.x + p.width > s.x - R && p.y > s.y - 160 && p.y < s.y + 460)
    .sort((a: any, b: any) => a.y - b.y || a.x - b.x);
  for (const p of near) console.log(`   ${p.type[0]} ${p.x}-${p.x + p.width} @${p.y}${p.height ? ' h' + p.height : ''}`);
  const rp = route.filter((q: any) => q.y > s.y - 120 && q.y < s.y + 420);
  const turns = rp.filter((q: any, i: number) => i === 0 || i === rp.length - 1 || Math.sign(rp[i + 1].x - q.x) !== Math.sign(q.x - rp[i - 1].x) || Math.sign(rp[i + 1].y - q.y) !== Math.sign(q.y - rp[i - 1].y));
  console.log(`   route: ${turns.slice(0, 16).map((q: any) => `(${Math.round(q.x)},${Math.round(q.y)})`).join(' ')}`);
}
