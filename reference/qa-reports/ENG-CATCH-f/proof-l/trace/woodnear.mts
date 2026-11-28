// read-only scratch: the solid wood of <stage> <seed> <setting> in a box, on the tree at ROOT
const ROOT = process.env.ROOT!;
const [stage, seed, setting, x0, x1, y0, y1] = process.argv.slice(2);
await import(ROOT + '/src/game/headlessDom.ts');
const { buildStage } = await import(ROOT + '/tools/engine/libstage.ts');
const st: any = buildStage(stage, Number(seed), setting);
const P = (st.platforms as any[]).filter((p) => p.type !== 'drift' && p.y >= +y0 && p.y <= +y1 && p.x < +x1 && p.x + p.width > +x0);
console.log(`${stage} ${setting} ${seed} on ${ROOT.split('/').pop()}: ${P.length} pieces in x ${x0}-${x1}, y ${y0}-${y1}`);
for (const p of P.sort((a, b) => a.y - b.y || a.x - b.x)) console.log(`  ${Math.round(p.x)}-${Math.round(p.x + p.width)} @ ${Math.round(p.y)} ${p.type} ${p.style ?? '-'} h ${p.height}`);
