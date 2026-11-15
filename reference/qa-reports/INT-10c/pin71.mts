import { createHash } from 'node:crypto';
await import('/home/user/Sloths-Adventure-/src/game/headlessDom.ts');
const { buildGen2ForGame } = await import('/home/user/Sloths-Adventure-/src/game/gen2/game.ts');
const { generateAllLevels } = await import('/home/user/Sloths-Adventure-/src/game/worldsData.ts');
const h = (x: unknown) => createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
for (const id of ['5-7', '7-1']) for (const d of ['normal', 'easy'] as const) {
  const st: any = buildGen2ForGame(generateAllLevels().find((l: any) => l.id === id)!, d, 1);
  const { verdicts, drops, ...g } = st.gen2;
  const { fills, ...rest } = g;
  console.log(id, d, h({ platforms: st.platforms, falls: st.gen2.falls, errors: st.gen2.errors, plan: st.gen2.plan }), h(g), 'fills', fills?.length, 'rest', h(rest));
}
