// The thorn hollow stills' stage (t-pit-polish, 11-12): the library's 1-2 kit (flown rows) rolled headless and its platforms, pickups and vines
// dumped to JSON for tools/engine/runs/hollowStills.mjs. Nothing in the game imports it.
//   npx tsx tools/engine/runs/hollowKit.ts <out.json> [seed=1] [unflown]
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { config12, kitLib12 } from '../library.ts';
import fs from 'node:fs';
const seed = +(process.argv[3] ?? 1);
const O = { flown: process.argv[4] !== "unflown" };
const st: any = buildGen2Stage({ config: config12(O) as any, kit: kitLib12(O), seed, difficulty: 'normal' });
const hurt = st.platforms.filter((p: any) => p.pit === 'hurt').map((p: any) => [Math.round(p.x), Math.round(p.width), Math.round(p.y)]);
console.log('errors', st.errors?.length ?? 0, 'hurt', JSON.stringify(hurt));
fs.writeFileSync(process.argv[2], JSON.stringify({ platforms: st.platforms, collectibles: st.collectibles ?? [], vines: st.vines ?? [] }));
