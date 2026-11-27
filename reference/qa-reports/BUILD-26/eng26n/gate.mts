const [root, stage, setting, ...seeds] = process.argv.slice(2);
await import(`${root}/src/game/headlessDom.ts`);
const { freshPhone } = await import(`${root}/tools/inspect/firsttimer.ts`);
const { RealPlay } = await import(`${root}/src/game/realPlay.ts`);
freshPhone(setting as never);
for (const s of seeds) {
  try {
    const st: any = new RealPlay(stage, Number(s)).stage;
    const T = st.gen2?.tower;
    const lay = new Set(T?.lay ?? []);
    const roofs = (st.gen2?.towerMiss ?? []).filter((m: string) => m.includes('in its band'));
    const near = st.platforms.filter((p: any) => lay.has(p.id) && p.y > 2900 && p.y < 3800 && p.x < 1100 && p.x + p.width > 200).map((p: any) => `${Math.round(p.x)}-${Math.round(p.x + p.width)}@${Math.round(p.y)}`);
    console.log(`${setting} ${s}: gen2.seed ${st.gen2?.seed} towerMiss ${(st.gen2?.towerMiss ?? []).length} roofs ${roofs.length} ${roofs.join(' | ')} lay-near ${near.join(' ')}`);
  } catch (e: any) { console.log(`${setting} ${s}: THROW ${String(e.message).slice(0, 300)}`); }
}
