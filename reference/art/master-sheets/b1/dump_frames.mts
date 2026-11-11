// B1 catalog helper: prints every frame list the game's own data modules hold (read, never typed by hand).
//   npx tsx reference/art/master-sheets/b1/dump_frames.mts > <scratch>/frames.json
const R = new URL('../../../../src/game/', import.meta.url).pathname;
const mods = ['kitAtlasData', 'dressAtlasData', 'dressNewData', 'groundAtlasData', 'w2PropsData', 'w3PropsData', 'w4PropsData', 'w4FallsData', 'w4GritData', 'protoAtlasData', 'proto2AtlasData', 'proto3AtlasData', 'plantAtlasData', 'flowerAtlasData', 'leafAtlasData', 'petalData', 'puzzleAtlasData', 'ropeKitData', 'bounceAtlasData', 'dotPropsData', 'waterSignData', 'stageArtData'];
const out: Record<string, unknown> = {};
for (const m of mods) {
  const mod = await import(`${R}${m}.ts`);
  const o: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(mod)) if (typeof v === 'object') o[k] = v;
  out[m] = o;
}
console.log(JSON.stringify(out));
