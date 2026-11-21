// BUILD-26: the bot's tower route points (towerRoute.ts) on the built 2-6, between two heights
import '../../../src/game/headlessDom.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { RealPlay } from '../../../src/game/realPlay.ts';
import { towerRoutePts } from '../towerRoute.ts';
const [d, seedS, y0S, y1S] = process.argv.slice(2);
setDifficulty(d as 'normal');
const r = new RealPlay('2-6', Number(seedS));
const st: any = r.stage;
const pts: any[] = towerRoutePts(st, r.p) ?? [];
console.log('pts', pts.length, 'stage y', st.spawnY);
for (const q of pts) if (q.y >= Number(y0S) && q.y <= Number(y1S)) console.log(`  ${Math.round(q.x)},${Math.round(q.y)}${q.climb ? ' climb' : ''}${q.rope ? ' rope' : ''} ${Object.keys(q).filter((k) => k !== 'x' && k !== 'y').join(',')}`);
