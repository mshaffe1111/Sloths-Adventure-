import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { listedStage } from '../../src/game/gen2/listed.ts';
import { levelConfig } from '../../src/game/realPlay.ts';
const [stage, seed, diff, vx, vy] = process.argv.slice(2);
const st: any = buildGen2Stage({ config: levelConfig(stage), kit: listedStage(stage)!.kit(), seed: +seed, difficulty: diff as any });
for (const p of st.platforms) if (Math.abs(p.y - +vy) < 420) console.log('P', p.x, p.x + p.width, 'y', p.y, p.type, p.creak ? 'creak' : '', p.style);
for (const v of st.vines) if (Math.abs(v.topY - +vy) < 420) console.log('V', v.x, v.topY, v.bottomY, v.tag ?? '', v.field ? 'field' : '');
