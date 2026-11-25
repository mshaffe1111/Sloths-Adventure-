// the tower route's corners (towerCorners) of draft 3-1 in a band of y: TREE= SET= SEED= Y0= Y1= GEN2_DRAFT=3-1
const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { FirstTimerRun } = await import(`${T}/tools/inspect/firsttimer.ts`);
const { CAST_BOTS } = await import(`${T}/tools/inspect/castBots.ts`);
const { towerCorners } = await import(`${T}/tools/inspect/towerRoute.ts`);
readyDraft('3-1');
const run: any = new FirstTimerRun('3-1', Number(process.env.SEED), CAST_BOTS.kid[process.env.SET!], { cap: 1 });
const st = run.sim.stage;
const c = towerCorners(st, { x: st.spawnX, y: st.spawnY }) ?? [];
const y0 = Number(process.env.Y0), y1 = Number(process.env.Y1);
console.log(c.filter((p: any) => p.y >= y0 && p.y <= y1).map((p: any) => `${Math.round(p.x)},${Math.round(p.y)}`).join(' '));
const g = st.gen2;
console.log('legs', g.tower.route.legs.filter((l: any) => l.entry.y >= y0 && l.entry.y <= y1).map((l: any) => `${l.entry.x},${l.entry.y}->${l.exit.x},${l.exit.y}`).join(' '));
