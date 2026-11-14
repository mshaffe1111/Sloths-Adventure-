import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { listedStage } from '../../src/game/gen2/listed.ts';
import { levelConfig } from '../../src/game/realPlay.ts';
import { topRoom } from '../../src/game/vineTop.ts';
const st: any = buildGen2Stage({ config: levelConfig('1-4'), kit: listedStage('1-4')!.kit(), seed: +process.argv[2], difficulty: 'normal' });
for (const u of st.gen2.tower.turns) { const v = st.vines.find((w: any) => w.x === u.x && w.topY === Math.min(u.from, u.to)); console.log(JSON.stringify(u), v ? JSON.stringify(topRoom(v, st.platforms, 1280)) : 'NO VINE'); }
for (const p of st.platforms) if ((p as any).tb) console.log('TBP', p.x, p.x + p.width, p.y);
