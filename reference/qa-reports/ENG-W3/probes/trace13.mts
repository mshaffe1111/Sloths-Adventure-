// trace kid/adult normal seed 13 through y 9850..10350: one line per 0.5 s, (x,y) grounded standingOn, pad
const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { firstTimer } = await import(`${T}/tools/inspect/firsttimer.ts`);
const { CAST_BOTS } = await import(`${T}/tools/inspect/castBots.ts`);
readyDraft('3-1');
let f = 0; const out: string[] = [];
const r: any = firstTimer('3-1', Number(process.env.SEED ?? 13), CAST_BOTS[process.env.BOT ?? 'kid'].normal, { cap: 1200, dotSetting: true, onFrame: (sim: any) => {
  f++; const p = sim.p;
  if (p.y > 9850 && p.y < 10360 && f % 15 === 0) out.push(`${(f / 30).toFixed(1)} ${Math.round(p.x)},${Math.round(p.y)} ${p.grounded ? 'g' + (sim.standingOn ?? '') : 'a'}${p.climbing ? 'C' : ''} vx${Math.round(p.vx)}`);
} });
console.log(r.time, 'R', r.rescues, r.stuck.map((s: any) => `${Math.round(s.x)},${Math.round(s.y)}`).join(' '));
console.log(out.join(' | '));
