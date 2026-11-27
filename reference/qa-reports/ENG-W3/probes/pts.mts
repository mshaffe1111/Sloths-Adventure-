// the route points of draft 3-1 for one bot, setting and roll in a band of y: TREE= BOT= SET= SEED= Y0= Y1= GEN2_DRAFT=3-1 (ENG-DOWNBOT box 9)
const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { FirstTimerRun } = await import(`${T}/tools/inspect/firsttimer.ts`);
const { CAST_BOTS } = await import(`${T}/tools/inspect/castBots.ts`);
readyDraft('3-1');
const run: any = new FirstTimerRun('3-1', Number(process.env.SEED), CAST_BOTS[process.env.BOT!][process.env.SET!], { cap: 1 });
const y0 = Number(process.env.Y0), y1 = Number(process.env.Y1);
console.log(run.prog.pts.filter((q: any) => q.y > y0 && q.y < y1).map((q: any) => `${Math.round(q.x)},${Math.round(q.y)}`).join(' '));
