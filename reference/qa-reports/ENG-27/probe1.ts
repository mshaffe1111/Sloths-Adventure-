// ENG-27 probe: the toy out-and-back on World 2's ground (toyHome.ts): legs, rivers, errors, per seed
import '../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { towerCfg } from '../../../src/game/gen2/toyTower.ts';
import { homeKit, HOME_CODE, SAME_GROUND_CODE } from '../../../src/game/gen2/toyHome.ts';
import { validateStage } from '../../../src/game/levelCheck.ts';
const ID = '2-97';
const code = process.argv[2] === 'same' ? SAME_GROUND_CODE : HOME_CODE;
const n = Number(process.argv[3] ?? 4);
for (const difficulty of ['normal', 'easy'] as const) for (let seed = 1; seed <= n; seed++) {
  try {
    const st = buildGen2Stage({ config: { ...towerCfg(ID, 'sprint'), unlocked: true }, kit: homeKit(ID, code), seed, difficulty });
    const legs = st.gen2.tower?.legs ?? [];
    const errs = [...(st.gen2.errors ?? []), ...validateStage(st).errors];
    const rv = (st.rivers ?? []).map((r) => `${Math.round(r.x0)}-${Math.round(r.x1)}@${Math.round(r.surfaceY)} d${r.dir}${r.way ? ' way' + r.way : ''}`).join(', ');
    const flags = (st as unknown as { checkpoints?: Array<{ x: number }> }).checkpoints?.map((c) => Math.round(c.x)).join(',');
    const petals = JSON.stringify(st.collectibles.reduce((m: Record<string, number>, c) => { m[c.type] = (m[c.type] ?? 0) + 1; return m; }, {})) + ' left-leg ' + st.collectibles.filter((c) => c.x < (legs[2]?.x1 ?? 0)).length;
    console.log(difficulty, 's' + seed, 'legs', legs.map((g) => `${g.travel}[${Math.round(g.x0)}..${Math.round(g.x1)} y${Math.round(g.y0)}..${Math.round(g.y1)}]`).join(' '), '| rivers', rv, '| flags', flags, '| petals', petals, '| exit', Math.round(st.exitX ?? -1), '| errs', errs.length, errs.map((e) => e.slice(0, 150)).slice(0, 5).join(' || '));
  } catch (e) { console.log(difficulty, 's' + seed, 'THROW', String(e).slice(0, 300)); }
}
