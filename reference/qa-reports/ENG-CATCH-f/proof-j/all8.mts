// read-only: every solid piece of 3-1 easy roll 8 on the tree at ROOT, one line each, for a diff
const ROOT = process.env.ROOT!;
await import(ROOT + '/src/game/headlessDom.ts');
await import(ROOT + '/tools/engine/draft.ts');
const { buildStage } = await import(ROOT + '/tools/engine/libstage.ts');
const st: any = buildStage('3-1', 8, 'easy');
for (const p of (st.platforms as any[]).filter((p) => p.type === 'solid').sort((a, b) => a.y - b.y || a.x - b.x)) console.log(`${Math.round(p.x)}-${Math.round(p.x + p.width)} @ ${Math.round(p.y)} ${p.style ?? '-'}`);
