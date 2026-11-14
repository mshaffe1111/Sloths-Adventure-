import '../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { towerCfg, upKit } from '../../src/game/gen2/toyTower.ts';
const st: any = buildGen2Stage({ config: towerCfg('5-93', 'ascent'), kit: upKit, seed: +process.argv[2], difficulty: 'normal' });
const y = +process.argv[3];
for (const p of st.platforms) if (p.y >= y - 50 && p.y <= y + 700) console.log('P', p.x, p.x + p.width, p.y, p.type, (p as any).tag ?? '');
for (const v of st.vines) if (v.topY >= y - 50 && v.topY <= y + 700) console.log('V', v.x, v.topY, v.bottomY);
console.log(JSON.stringify(st.gen2.tower.turns.filter((t: any) => Math.min(t.from, t.to) >= y - 50 && Math.min(t.from, t.to) <= y + 700)));
