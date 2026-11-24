// ENG-27 probe: does a left leg overlay the out leg? (/R then /L on one ground vs /D then /L)
import '../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { towerCfg } from '../../../src/game/gen2/toyTower.ts';
import { legsKit } from '../../../src/game/gen2/toyLegs.ts';
import { validateStage } from '../../../src/game/levelCheck.ts';
const ID = '5-95';
for (const code of process.argv.slice(2)) {
  for (let seed = 1; seed <= 4; seed++) {
    try {
      const st = buildGen2Stage({ config: towerCfg(ID, 'sprint'), kit: legsKit(ID, code), seed, difficulty: 'normal' });
      const T = st.gen2.tower;
      const legs = T?.legs ?? [];
      const errs = [...(st.gen2.errors ?? []), ...validateStage(st).errors];
      const box = (g: { x0: number; x1: number; y0: number; y1: number }) => `${g.x0}..${g.x1} y${g.y0}..${g.y1}`;
      console.log(code, 's' + seed, 'legs', legs.map((g) => `${g.travel}[${box(g)} gnd ${g.ground ?? g.floorY}]`).join(' '), 'errs', errs.length, errs.filter((e) => !e.includes("V11")).map((e) => e.slice(0, 160)).slice(0, 4).join(' | '));
    } catch (e) { console.log(code, 's' + seed, 'THROW', String(e).slice(0, 200)); }
  }
}
