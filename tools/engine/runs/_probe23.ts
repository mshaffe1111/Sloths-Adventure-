// BUILD-23d trace tool (not a gate): 2-3's watched stretches as built (zones, reeds, platforms): npx tsx tools/engine/runs/_probe23.ts 5,8
import '../../../src/game/headlessDom.ts';
import { buildStage } from '../libstage.ts';
import { listedStage, playFinish } from '../../../src/game/gen2/listed.ts';
import { W2_FOLLOW } from '../../../src/game/gen2/worlds/w2.ts';
const seeds = (process.argv[2] ?? '5,8').split(',').map(Number);
console.log('row', JSON.stringify(W2_FOLLOW));
for (const seed of seeds) for (const d of ['normal', 'easy'] as const) {
  const st: any = playFinish(listedStage('2-3')!, buildStage('2-3', seed, d), d);
  console.log(`== seed ${seed} ${d}`);
  for (const z of st.proto.watch) {
    console.log(` zone ${Math.round(z.x0)}-${Math.round(z.x1)} calm ${z.calm} warn ${z.warn ?? '-'} pass ${z.pass ?? '-'} lag ${z.lag ?? '-'} first ${z.firstWarnOnly ?? z.firstPassWarns ?? ''}`);
    const bs = st.proto.bushes.filter((b: any) => b.x + b.w > z.x0 && b.x < z.x1 && !b.secret && !b.hanging);
    console.log('   reeds', bs.map((b: any) => `${Math.round(b.x)}+${Math.round(b.w)}@${Math.round(b.y)}`).join(' '));
    const pls = st.platforms.filter((p: any) => p.x + p.width > z.x0 && p.x < z.x1);
    console.log('   plats', pls.map((p: any) => `${p.type}${p.pad ? 'P' : ''} ${Math.round(p.x)}+${Math.round(p.width)} y${Math.round(p.y)} h${Math.round(p.height ?? 0)} ${p.style ?? p.look ?? ''}`).join(' | '));
  }
}
