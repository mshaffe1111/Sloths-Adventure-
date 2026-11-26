const [root, setting, seedS, ...xs] = process.argv.slice(2);
await import(`${root}/src/game/headlessDom.ts`);
const { freshPhone } = await import(`${root}/tools/inspect/firsttimer.ts`);
const { RealPlay } = await import(`${root}/src/game/realPlay.ts`);
freshPhone(setting as never);
for (const xS of xs) {
  const sim: any = new RealPlay('1-4', Number(seedS));
  const gate = sim.stage.platforms.find((q: any) => q.tag === 's17:top') ?? sim.stage.platforms.find((q: any) => Math.round(q.y) === 3342 && q.x < 900 && q.x + q.width > 700);
  sim.stand(Number(xS), gate.y); const y0 = sim.p.y;
  let took: string = 'none';
  for (let f = 0; f < 60; f++) { sim.frame({ up: true }); if (sim.p.climbing && took === 'none') { const v = sim.stage.vines.find((q: any) => q.id === sim.p.climbingVineId); took = `vine x ${Math.round(v.x)} ${Math.round(v.topY)}-${Math.round(v.bottomY)} at f${f}`; } }
  console.log(`${setting} ${seedS} stand x ${xS} on ${Math.round(gate.x)}-${Math.round(gate.x + gate.width)} @${Math.round(gate.y)}: took ${took}; after 60 up-frames x ${Math.round(sim.p.x)} y ${Math.round(sim.p.y)} climbing ${sim.p.climbing} y0 ${Math.round(y0)} h ${sim.p.height} grounded ${sim.p.grounded}`);
}
