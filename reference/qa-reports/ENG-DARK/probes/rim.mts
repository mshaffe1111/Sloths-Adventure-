// one dark rim on one roll of the 3-1 draft (ENG-DARK-i): GEN2_DRAFT=3-1 npx tsx <this> <seed> <normal|easy> <rimX> <rimY>
// prints every DarkRim at that spot (its landing, the light the verdicts read, drop or hop, the piece it lands on), the zone's box, whether
// the piece is a cave-mouth piece, and every light of the zone within 500 px of the landing
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const { darkRims, entryPieces } = await import(path.join(root, 'src/game/gen2/dark.ts'));
const { generateStage, setLayoutVariant } = await import(path.join(root, 'src/game/stageGenerator.ts'));
const { generateAllLevels } = await import(path.join(root, 'src/game/worldsData.ts'));
const [seed, d, rx, ry] = process.argv.slice(2);
setLayoutVariant(Number(seed));
let st: any;
try { st = generateStage({ ...generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!, unlocked: true }, d); } finally { setLayoutVariant(null); }
const P = (p: any) => p && `${Math.round(p.x)}-${Math.round(p.x + p.width)}@${Math.round(p.y)}${p.kind ? ' ' + p.kind : ''}`;
for (const z of st.zones ?? []) {
  if (z.kind !== 'dark') continue;
  const rims = darkRims({ platforms: st.platforms, zones: [z] }).filter((r: any) => Math.abs(r.x - Number(rx)) <= 2 && Math.abs(r.y - Number(ry)) <= 2);
  if (!rims.length) continue;
  const mouth = entryPieces(st.platforms, z);
  console.log('zone', z.x0, z.x1, 'y', z.top, z.bottom, 'lights', z.lights.length);
  for (const r of rims) {
    console.log(' rim', r.x, r.y, r.dir > 0 ? 'right' : 'left', 'piece', P(r.piece), 'mouth', mouth.has(r.piece), '| land', r.land.x, r.land.y, r.drop ? 'DROP' : 'HOP', 'onto', P(r.onto), 'onto mouth', mouth.has(r.onto));
    console.log('  light', r.light ? JSON.stringify(r.light) : 'NONE');
    for (const l of z.lights) if (Math.hypot(l.x - r.land.x, l.y - r.land.y) <= 500) console.log('  near', JSON.stringify(l), 'dist', Math.round(Math.hypot(l.x - r.land.x, l.y - r.land.y)));
  }
  // (what stands under and beside the rim: pieces within 300 px)
  for (const p of st.platforms) if (Math.abs(p.x - Number(rx)) < 400 && p.y > Number(ry) - 200 && p.y < Number(ry) + 500) console.log('  piece', P(p));
}
