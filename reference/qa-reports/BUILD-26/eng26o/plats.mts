const [root, setting, seedS, x0, x1, y0, y1] = process.argv.slice(2);
await import(`${root}/src/game/headlessDom.ts`);
const { freshPhone } = await import(`${root}/tools/inspect/firsttimer.ts`);
const { RealPlay } = await import(`${root}/src/game/realPlay.ts`);
freshPhone(setting as never);
const sim: any = new RealPlay('1-4', Number(seedS));
for (const q of sim.stage.platforms.filter((q: any) => q.x < +x1 && q.x + q.width > +x0 && q.y > +y0 && q.y < +y1)) console.log(`  plat ${q.tag ?? '-'} ${Math.round(q.x)}-${Math.round(q.x + q.width)} @${Math.round(q.y)} ${q.crumble ? 'crumble' : ''}${q.slope ? ' slope ' + q.slope : ''}`);
for (const v of sim.stage.vines.filter((v: any) => v.x > +x0 && v.x < +x1 && v.bottomY > +y0 && v.topY < +y1)) console.log(`  vine ${v.id} x ${Math.round(v.x)} ${Math.round(v.topY)}-${Math.round(v.bottomY)} ${v.vineType}`);
