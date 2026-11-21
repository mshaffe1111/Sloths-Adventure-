// BUILD-25d scratch: where the new rest and the moved boulders stand in play (RealPlay, the listed seed), for stills
import '../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../src/game/realPlay.ts';
import { loadSeedList } from '../../../src/game/gen2/seedList.ts';
await loadSeedList('2-5');
const sim = new RealPlay('2-5', Number(process.argv[2] ?? 1));
const R = Math.round;
const P = sim.platforms;
for (const p of P.filter((q: any) => q.style === 'moss_stone')) console.log(`boulder ${R(p.x)}..${R(p.x + p.width)} y${R(p.y)}`);
for (const p of P.filter((q: any) => q.type === 'solid' && Math.abs(q.width - 420) < 2)) console.log(`420-bank ${R(p.x)}..${R(p.x + p.width)} y${R(p.y)}`);
console.log('flags', (sim.stage as any).checkpoints.map((c: any) => R(c.x)).join(' '));
