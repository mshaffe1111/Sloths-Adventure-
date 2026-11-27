// ENG-DARK box 14: real-row anchors for dark.test's toys on the merged lay: per roll, (w) wall-side rims whose landing light would hang
// past GLOW_REACH.down; (h) hop rims whose step-off landing goes RED in darkLandings without the lay's second lights.
// GEN2_DRAFT=3-1 npx tsx <this> <from> <to>
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const { darkLandings, darkRims, DARK_ZONE } = await import(path.join(root, 'src/game/gen2/dark.ts'));
const { GLOW_REACH } = await import(path.join(root, 'src/game/zones.ts'));
const { generateStage, setLayoutVariant } = await import(path.join(root, 'src/game/stageGenerator.ts'));
const { generateAllLevels } = await import(path.join(root, 'src/game/worldsData.ts'));
const [a, b] = process.argv.slice(2).map(Number);
for (let seed = a; seed <= b; seed++) for (const d of ['normal', 'easy'] as const) {
  setLayoutVariant(seed);
  let st: any;
  try { st = generateStage({ ...generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!, unlocked: true }, d); } finally { setLayoutVariant(null); }
  const rims = darkRims(st);
  const wall = rims.filter((r: any) => r.light?.sleep && r.land.y - DARK_ZONE.lightUp > r.y + GLOW_REACH.down).map((r: any) => `${r.x},${Math.round(r.y)}`);
  const own = new Set(rims.map((r: any) => r.light));
  const zones = (st.zones ?? []).map((z: any) => (z.kind !== 'dark' || !z.lights?.length ? z : { ...z, lights: z.lights.filter((l: any) => own.has(l)) }));
  const hops = rims.filter((r: any) => !r.drop).map((r: any) => `${r.x},${Math.round(r.y)}`);
  const red = darkLandings({ ...st, zones }, d).filter((m: string) => hops.some((h: string) => m.includes(`the rim at x ${h.split(',')[0]}, y ${h.split(',')[1]} `)));
  let trunk = 0;
  for (const v of st.vines ?? []) if (v.vineType === 'tree_climb') for (const q of st.platforms) if (q.x <= v.x && v.x <= q.x + q.width && v.topY < q.y - 14 && v.bottomY > q.y + 60) trunk++;
  console.log(seed, d, 'trunk', trunk, 'wall', wall.length, wall[0] ?? '', '| hopRed', red.length, (red[0] ?? '').slice(0, 230));
}
