// ENG-26m: what the bot faced at a stuck spot: the stage as the bots build it (RealPlay, the castBots seed), the wood and vines in a box.
// usage: npx tsx near.mts <tree> <stage> <setting> <seed> <x> <y> [dx=260] [dy=480]
const [root, stage, setting, seedS, xS, yS, dxS, dyS] = process.argv.slice(2);
await import(`${root}/src/game/headlessDom.ts`);
const { freshPhone } = await import(`${root}/tools/inspect/firsttimer.ts`);
const { RealPlay } = await import(`${root}/src/game/realPlay.ts`);
freshPhone(setting as never);
const sim: any = new RealPlay(stage, Number(seedS));
const st: any = sim.stage, X = Number(xS), Y = Number(yS), dx = Number(dxS ?? 260), dy = Number(dyS ?? 480);
console.log(`${root.split('/').pop()} ${stage} ${setting} castBots seed ${seedS}: gen2.seed ${st.gen2?.seed}, size ${st.config.levelWidth}x${st.config.levelHeight}, box x ${X - dx}-${X + dx}, y ${Y - dy}-${Y + dy}`);
const P = st.platforms.filter((p: any) => p.x < X + dx && p.x + p.width > X - dx && p.y > Y - dy && p.y < Y + dy).sort((a: any, b: any) => a.y - b.y || a.x - b.x);
for (const p of P) console.log(`  wood ${Math.round(p.x)}-${Math.round(p.x + p.width)} @${Math.round(p.y)}${p.type ? ' ' + p.type : ''}${p.kind ? ' ' + p.kind : ''}${p.crumble || p.crumbling ? ' crumble' : ''}${p.tag ? " " + p.tag : ""}`);
const V = (st.vines ?? []).filter((v: any) => Math.abs(v.x - X) < dx && (v.topY ?? 0) < Y + dy && (v.bottomY ?? 0) > Y - dy);
for (const v of V) console.log(`  vine x ${Math.round(v.x)} top ${Math.round(v.topY)} bottom ${Math.round(v.bottomY)}${v.tag ? " " + v.tag : ""}`);
