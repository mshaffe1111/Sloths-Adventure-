// ENG-26o: the shape at a spot: every climbable vine and every platform within 160 px of x0, y band
const [root, setting, seedS, x0S] = process.argv.slice(2);
await import(`${root}/src/game/headlessDom.ts`);
const { freshPhone } = await import(`${root}/tools/inspect/firsttimer.ts`);
const { RealPlay } = await import(`${root}/src/game/realPlay.ts`);
freshPhone(setting as never);
const sim: any = new RealPlay('1-4', Number(seedS)); const x0 = Number(x0S);
const vs = sim.stage.vines.filter((v: any) => v.vineType === 'tree_climb' && Math.abs(v.x - x0) < 160);
for (const v of vs) console.log(`  vine ${v.id} x ${Math.round(v.x)} ${Math.round(v.topY)}-${Math.round(v.bottomY)} field ${!!v.field}`);
for (const v of vs) for (const q of sim.stage.platforms.filter((q: any) => q.x < x0 + 200 && q.x + q.width > x0 - 200 && Math.abs(q.y - v.topY) < 40)) console.log(`  near top of vine ${v.id}: ${q.tag ?? '-'} ${Math.round(q.x)}-${Math.round(q.x + q.width)} @${Math.round(q.y)} (top ${Math.round(v.x - (q.x + q.width))} px past its right end, ${Math.round(q.x - v.x)} px before its left)`);
