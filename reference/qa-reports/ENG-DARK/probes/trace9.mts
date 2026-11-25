// trace box 7's 9 dark-rim drops (ENG-DARK-h): GEN2_DRAFT=3-1 npx tsx <this>: on each named roll, every dark-rim drop darkLandings would
// name with EVERY light asleep (the base's lay); for each, why the laid roll passes now: its target rim's light is the cave mouth's
// (awake, ruling (ii): which outside rim steps onto its piece), or the edge lies inside the drop rim's own light (ruling (i)), or neither
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const { darkLandings, darkRims, entryPieces } = await import(path.join(root, 'src/game/gen2/dark.ts'));
const { generateStage, setLayoutVariant } = await import(path.join(root, 'src/game/stageGenerator.ts'));
const { generateAllLevels } = await import(path.join(root, 'src/game/worldsData.ts'));
const list: Array<[number, 'normal' | 'easy']> = [[9, 'easy'], [13, 'normal'], [13, 'easy'], [19, 'normal'], [22, 'normal'], [26, 'easy'], [27, 'easy'], [32, 'normal'], [33, 'normal']];
const re = /him (-?\d+) px.*?its light asleep(, the rim he left outside the dark)?: the rim at x (\d+), y (\d+) \((left|right).*?onto the rim at x (\d+), y (\d+)/;
for (const [seed, d] of list) {
  setLayoutVariant(seed);
  let st: any;
  try { st = generateStage({ ...generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!, unlocked: true }, d); } finally { setLayoutVariant(null); }
  const asleep = { ...st, zones: st.zones.map((z: any) => (z.kind === 'dark' && z.lights ? { ...z, lights: z.lights.map((l: any) => ({ ...l, sleep: true })) } : z)) };
  const rims = darkRims(st);
  for (const h of darkLandings(asleep, d)) {
    const m = re.exec(h); if (!m || m[2]) continue;
    const ux = +m[3], uy = +m[4], udir = m[5] === 'right' ? 1 : -1, nx = +m[6], ny = +m[7];
    const ud = rims.find((r: any) => Math.abs(r.x - ux) <= 1 && Math.abs(r.y - uy) <= 1 && r.dir === udir);
    const n = rims.find((r: any) => Math.abs(r.x - nx) <= 1 && Math.abs(r.y - ny) <= 1);
    const edgeIn = ud?.light && Math.hypot(ud.light.x - nx, ud.light.y - ny) <= ud.light.r;
    if (edgeIn) continue;
    const z = st.zones.find((q: any) => q.kind === 'dark' && q.lights?.includes(n?.light));
    const mouth = z && entryPieces(st.platforms, z).has(n.piece);
    console.log(seed, d, `u ${ux},${uy} ${m[5]} -> n ${nx},${ny} (${n?.dir > 0 ? 'right' : 'left'} end) room ${m[1]}`, n?.dir === udir ? 'AHEAD' : 'BEHIND', `ud.light ${ud?.light ? `${Math.round(ud.light.x)},${Math.round(ud.light.y)} ${ud.drop ? 'drop' : 'hop'} to ${ud.land.x},${Math.round(ud.land.y)}` : 'none'}`, `n.light ${n?.light ? (n.light.sleep ? 'asleep' : 'AWAKE') : 'none'}`, mouth ? 'n.piece = cave mouth' : '', `in laid: ${darkLandings(st, d).some((x: string) => x.includes(`the rim at x ${ux}, y ${uy}`) && x.includes(`onto the rim at x ${nx}, y ${ny}`)) ? 'NAMED' : 'passes'}`);
  }
}
