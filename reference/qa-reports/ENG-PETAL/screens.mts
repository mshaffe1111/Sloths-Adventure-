// petals per upright screen (440 world px wide, cameraFollow.test VIEWS.upright) along x from spawn to the shrine, and the share of
// 440 px windows with no petal; Normal, castBots layouts 1-5, as the game builds them
const root = process.argv[2];
await import(`${root}/src/game/headlessDom.ts`);
const { generateStage, setLayoutVariant } = await import(`${root}/src/game/stageGenerator.ts`);
const { generateAllLevels } = await import(`${root}/src/game/worldsData.ts`);
const { isPetal } = await import(`${root}/src/game/petals.ts`);
for (const id of ['1-5', '1-6', '1-7']) {
  let per = 0, empty = 0, n = 0;
  for (let v = 1; v <= 5; v++) {
    setLayoutVariant(v);
    const st: any = generateStage({ ...generateAllLevels().find((l: any) => l.id === id)!, unlocked: true }, 'normal');
    setLayoutVariant(null);
    const xs = st.collectibles.filter((c: any) => isPetal(c, st)).map((c: any) => c.x);
    const x0 = st.spawnX, x1 = st.exitTotemX ?? Math.max(...st.platforms.map((p: any) => p.x + p.width));
    const screens = Math.max(1, Math.floor((x1 - x0) / 440));
    let e = 0;
    for (let k = 0; k < screens; k++) if (!xs.some((x: number) => x >= x0 + k * 440 && x < x0 + (k + 1) * 440)) e++;
    per += xs.length / screens; empty += e / screens; n++;
  }
  console.log(`${id}: ${(per / n).toFixed(2)} petals per upright screen, ${(100 * empty / n).toFixed(0)}% of upright screens empty`);
}
