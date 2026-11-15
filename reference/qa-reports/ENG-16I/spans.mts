// ENG-16I: one piece's walked span (gen2/walkedSpan.ts) read off 1-6 as the LAY built it (buildPlayStage, with its laidAsks) and off the
// stage the ENGINE plays (RealPlay: its platforms and lianas, the swing as play sets it), side by side; a petal sits by the lay's span.
//   npx tsx reference/qa-reports/ENG-16I/spans.ts <variant> <section-template:key,...>
import '../../../src/game/headlessDom.ts';
import { RealPlay, levelConfig } from '../../../src/game/realPlay.ts';
import { walkedSpan } from '../../../src/game/gen2/walkedSpan.ts';
import { laidAsks } from '../../../src/game/gen2/pipeline.ts';
import { buildPlayStage, loadSeedList, provenSeedFor } from '../../../src/game/gen2/seedList.ts';
import { listedStage } from '../../../src/game/gen2/listed.ts';
const [vs, keys] = process.argv.slice(2);
const v = Number(vs);
await loadSeedList('1-6');
const seed = provenSeedFor('1-6', v);
const lay = buildPlayStage(levelConfig('1-6'), listedStage('1-6')!.kit(), seed, 'normal') as any;
const rp = new RealPlay('1-6', v);
const play = rp.stage as any;
const tagOf = (st: any, k: string) => { const [tpl, key] = k.split(':'); const s = st.gen2.sections.find((x: any) => x.template === `w1-16-${tpl}`); return s ? `${s.uid}:${key}` : '?'; };
const R = Math.round;
console.log(`variant ${v} = seed ${seed}; lay asks ${laidAsks(lay).length}, play asks ${laidAsks(play).length}; lay lianas ${lay.vines.length}, play ${rp.vines.length}`);
for (const k of keys.split(',')) {
  const a = lay.platforms.find((p: any) => p.tag === tagOf(lay, k)), b = rp.platforms.find((p: any) => (p as any).tag === tagOf(play, k));
  const sa = a ? walkedSpan(a, { platforms: lay.platforms, vines: lay.vines, asks: laidAsks(lay) }) : null;
  const sb = b ? walkedSpan(b as any, { platforms: rp.platforms as any, vines: rp.vines as any, asks: laidAsks(play) }) : null;
  const fl = (st: any, p: any) => p ? st.collectibles.filter((c: any) => c.type === 'flower' && c.x >= p.x - 2 && c.x <= p.x + p.width + 2 && p.y - c.y >= 0 && p.y - c.y <= 90).map((c: any) => R(c.x)).join(',') : '';
  console.log(`${k}: lay piece ${a ? `${R(a.x)}..${R(a.x + a.width)}` : '-'} span ${sa ? `${R(sa.lo)}..${R(sa.hi)}${sa.next ? ' next' : ''}` : '-'} petals ${fl(lay, a)} | play piece ${b ? `${R(b.x)}..${R(b.x + b.width)}` : '-'} span ${sb ? `${R(sb.lo)}..${R(sb.hi)}${sb.next ? ' next' : ''}` : '-'} petals ${fl(play, b)}`);
}
