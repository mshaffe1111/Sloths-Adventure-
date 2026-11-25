// one rim's darkLandings numbers (ENG-DARK-f): GEN2_DRAFT=3-1 npx tsx <this> <seed> <setting> <rimX> <rimY>
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const D: any = await import(path.join(root, 'src/game/gen2/dark.ts'));
const { generateStage, setLayoutVariant } = await import(path.join(root, 'src/game/stageGenerator.ts'));
const { generateAllLevels } = await import(path.join(root, 'src/game/worldsData.ts'));
const [seed, d, rx, ry] = process.argv.slice(2);
setLayoutVariant(Number(seed));
let st: any;
try { st = generateStage({ ...generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!, unlocked: true }, d); } finally { setLayoutVariant(null); }
const rims = D.darkRims(st);
const pr = (r: any) => r && `rim ${r.x},${r.y} dir ${r.dir} piece ${r.piece.x}-${r.piece.x + r.piece.width} land ${r.land.x},${r.land.y} drop ${r.drop} onto ${r.onto.x}-${r.onto.x + r.onto.width}@${r.onto.y} light ${r.light ? `${Math.round(r.light.x)},${Math.round(r.light.y)} id ${r.light.id} sleep ${r.light.sleep}` : '-'}`;
for (const r of rims.filter((r: any) => Math.abs(r.x - Number(rx)) <= 2 && Math.abs(r.y - Number(ry)) <= 2)) {
  console.log('R', pr(r));
  for (const n of rims.filter((m: any) => m.piece === r.onto)) console.log('  onto-rim', pr(n));
}
const ty = Number(ry);
console.log('pieces one storey up:');
for (const q of st.platforms.filter((q: any) => q.y > ty - 330 && q.y < ty - 40 && q.x < 700)) console.log('  ', q.type, Math.round(q.x), Math.round(q.x + q.width), Math.round(q.y));
console.log('rims onto the rim\'s piece:');
for (const r of rims.filter((r: any) => r.onto && Math.abs(r.onto.y - ty) <= 2 && r.onto.x <= Number(rx) && r.onto.x + r.onto.width >= Number(rx))) console.log('  ', pr(r));
console.log('dark zones:', (st.zones ?? []).filter((z: any) => z.kind === 'dark' && z.top <= ty && z.bottom >= ty - 330).map((z: any) => `${z.x0}-${z.x1} y ${z.top}-${z.bottom} lights ${z.lights?.length}`).join(' | '));
