// trace one bot on one roll of draft 3-1 through a band of y: one line per 0.5 s, (x,y) grounded standingOn, climbing, vx
// TREE=<frozen tree> BOT=kid SET=easy SEED=7 Y0=4000 Y1=4600 GEN2_DRAFT=3-1 npx tsx probes/trace.mts (ENG-DOWNBOT box 9)
const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { firstTimer } = await import(`${T}/tools/inspect/firsttimer.ts`);
const { CAST_BOTS } = await import(`${T}/tools/inspect/castBots.ts`);
readyDraft('3-1');
const y0 = Number(process.env.Y0 ?? -1e9), y1 = Number(process.env.Y1 ?? 1e9);
let f = 0; const out: string[] = [];
const r: any = firstTimer('3-1', Number(process.env.SEED ?? 13), CAST_BOTS[process.env.BOT ?? 'kid'][process.env.SET ?? 'normal'], { cap: 1200, dotSetting: true, onFrame: (sim: any) => {
  f++; const p = sim.p;
  if (p.y > y0 && p.y < y1 && f % 15 === 0) out.push(`${(f / 30).toFixed(1)} ${Math.round(p.x)},${Math.round(p.y)} ${p.grounded ? 'g' + (sim.standingOn ?? '') : 'a'}${p.climbing ? 'C' : ''} vx${Math.round(p.vx)}`);
} });
console.log(r.time, 'R', r.rescues, r.stuck.map((s: any) => `${s.what} @${Math.round(s.x)},${Math.round(s.y)}`).join(' | '));
console.log(out.join(' | '));
