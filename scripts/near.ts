import { generateAllLevels } from '../src/game/worldsData.ts';
import { generateStage } from '../src/game/stageGenerator.ts';
const [id, x0s, x1s] = process.argv.slice(2);
const s = generateStage(generateAllLevels().find((x) => x.id === id)!);
const x0 = +x0s, x1 = +x1s;
console.log(s.meta!.chunks.join(' '));
console.log('plats:', s.platforms.filter((p) => p.x + p.width > x0 && p.x < x1).sort((a,b)=>a.x-b.x).map((p) => `${p.type[0]}${p.height>=50?'G':''}:${Math.round(p.x)}-${Math.round(p.x + p.width)}@${Math.round(p.y)}`).join(' '));
console.log('vines:', s.vines.filter((v) => v.x > x0 && v.x < x1).map((v) => `${v.vineType}@${Math.round(v.x)} ${Math.round(v.topY)}..${Math.round(v.bottomY)}`).join(' '));
console.log('cps', s.checkpoints?.map(c=>Math.round(c.x)).join(','), 'water', s.waterY);
