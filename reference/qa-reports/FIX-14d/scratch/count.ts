import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { listedStage } from '../../src/game/gen2/listed.ts';
import { provenSeeds } from '../../src/game/gen2/seedList.ts';
import { levelConfig } from '../../src/game/realPlay.ts';
import { topRoomShort } from '../../src/game/vineTop.ts';
const stage = process.argv[2] ?? '1-4';
const raw = process.argv[3];
const seeds = raw ? raw.split('-').length === 2 ? Array.from({ length: +raw.split('-')[1] - +raw.split('-')[0] + 1 }, (_, i) => +raw.split('-')[0] + i) : raw.split(',').map(Number) : provenSeeds(stage);
const row = listedStage(stage)!; const cfg = levelConfig(stage);
let n = 0, bad = 0, fail = 0; const kinds = new Map<string, number>(); const ex: string[] = [];
for (const seed of seeds) for (const difficulty of ['normal', 'easy'] as const) {
  let st; try { st = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty }); } catch (e) { fail++; continue; }
  const W = st.gen2.tower?.width ?? 1280;
  for (const v of st.vines) { if (v.vineType !== 'tree_climb') continue; n++;
    const turn = st.gen2.tower?.flow === 'up' ? st.gen2.tower.turns.find((u) => u.x === v.x && Math.min(u.from, u.to) === v.topY) : undefined;
    const m = topRoomShort(v, st.platforms, W, 'top', turn?.walk) ?? topRoomShort(v, st.platforms, W, 'foot');
    if (m) { bad++; const k = ((v as any).tag ?? 'link').replace(/^s\d+:/, ''); kinds.set(k, (kinds.get(k) ?? 0) + 1); if (ex.length < 12) ex.push(`seed ${seed} ${difficulty} ${k}: ${m}`); } }
}
console.log(`${stage}: ${seeds.length} seeds, build fails ${fail}, vines ${n}, short ${bad}`, [...kinds]);
for (const e of ex) console.log(' ', e);
