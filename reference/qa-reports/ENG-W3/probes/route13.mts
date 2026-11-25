// the real route points and pieces of draft 3-1 seed 13 normal between y 9800 and 10400
const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { FirstTimerRun } = await import(`${T}/tools/inspect/firsttimer.ts`);
const { CAST_BOTS } = await import(`${T}/tools/inspect/castBots.ts`);
readyDraft('3-1');
const run: any = new FirstTimerRun('3-1', 13, CAST_BOTS.kid.normal, { cap: 1 });
const pts = run.prog.pts;
console.log('pts', pts.filter((q: any) => q.y > 9800 && q.y < 10400).map((q: any) => `${Math.round(q.x)},${Math.round(q.y)}`).join(' '));
const e = run.e;
console.log("p130", JSON.stringify(e.platforms.find((q: any) => q.x === 424 && q.y === 10055)), JSON.stringify(e.platforms.find((q: any) => q.x === 71 && q.y === 10055)));
console.log('vines', e.vines.filter((v: any) => v.bottomY > 9800 && v.topY < 10400).map((v: any) => `${v.id}:${v.vineType}:x${v.x} ${v.topY}-${v.bottomY}`).join(' '));
