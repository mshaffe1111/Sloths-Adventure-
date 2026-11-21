import '../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { towerCfg } from '../../../src/game/gen2/toyTower.ts';
import { legsKit, DOWN_CODE } from '../../../src/game/gen2/toyLegs.ts';
import { homeKit } from '../../../src/game/gen2/toyHome.ts';
for (const [name, kit, type] of [['legs-sprint', legsKit('5-95', DOWN_CODE), 'sprint'], ['home-sprint', homeKit('2-97'), 'sprint'], ['home-harvest', homeKit('2-97'), 'harvest']] as const) {
  const id = name.startsWith('legs') ? '5-95' : '2-97';
  const st = buildGen2Stage({ config: { ...towerCfg(id, type as 'sprint'), unlocked: true }, kit, seed: 1, difficulty: 'normal' });
  const pickups = st.gen2.fills.filter((f) => f.role === 'pickup');
  console.log(name, 'pickup fills', pickups.length, 'flowers', st.collectibles.filter((c) => c.type === 'flower').length, 'errs', (st.gen2.errors ?? []).slice(0, 2).join(' | ').slice(0, 200));
}
