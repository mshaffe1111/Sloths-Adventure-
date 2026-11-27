import '../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { towerCfg } from '../../../src/game/gen2/toyTower.ts';
import { homeKit } from '../../../src/game/gen2/toyHome.ts';
for (const code of ['A Pg1> Xw1> R Pf1> Pw1> Mg1> Ww1> R Sw1> E', 'A Pg1> Xw1> R /D Dc_ /R Pf1> Pw1> Mg1> Ww1> R Sw1> E', 'A Pg1> Xw1> R /D Dc_ /L Pf1< Pw1> Mg1> Ww1> R Sw1> E']) {
  const st = buildGen2Stage({ config: { ...towerCfg('2-97', 'sprint'), unlocked: true }, kit: homeKit('2-97', code), seed: 1, difficulty: 'normal' });
  console.log(code, '| fills', st.gen2.fills.filter((f) => f.role === 'pickup').length, 'flowers', st.collectibles.filter((c) => c.type === 'flower').length, 'errs', (st.gen2.errors ?? []).slice(0, 2).join(' | ').slice(0, 200));
}
