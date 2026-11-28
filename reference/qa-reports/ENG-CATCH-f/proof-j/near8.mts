// read-only: 3-1 easy roll 8's solid wood near the rim x 515, y 4375 (darkBots.test.ts:576), on the tree at ROOT
const ROOT = process.env.ROOT!;
await import(ROOT + '/src/game/headlessDom.ts');
await import(ROOT + '/tools/engine/draft.ts');
const { buildStage } = await import(ROOT + '/tools/engine/libstage.ts');
const st: any = buildStage('3-1', 8, 'easy');
const P = (st.platforms as any[]).filter((p) => p.type === 'solid' && p.y > 4200 && p.y < 4800 && p.x < 800 && p.x + p.width > 250);
console.log(`solid ${st.platforms.filter((p: any) => p.type === 'solid').length}; near the rim:`);
for (const p of P.sort((a, b) => a.y - b.y || a.x - b.x)) console.log(`  ${Math.round(p.x)}-${Math.round(p.x + p.width)} @ ${Math.round(p.y)} ${p.style ?? '-'} id ${p.id}`);
