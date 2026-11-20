// ENG-24g: one bot run on 2-4 with every board/let-go of a log and catch/let-go of a liana, and the time spent by x (250 px buckets).
//   npx tsx reference/qa-reports/ENG-24e/g/trace24.mts <child|middle|expert|kid|adult> <seed> [normal|easy] [cap s]
import '../../../../src/game/headlessDom.ts';
import { firstTimer } from '../../../../tools/inspect/firsttimer.ts';
import { CAST_BOTS } from '../../../../tools/inspect/castBots.ts';
import type { RealPlay } from '../../../../src/game/realPlay.ts';
const [bot, seedS, setting = 'normal', capS = '1200'] = process.argv.slice(2);
const who = (CAST_BOTS as any)[bot][setting];
let printedRivers = false;
const buckets = new Map<number, number>();
let fr = 0; const evs: string[] = [];
let prevState = '';
const r = firstTimer('2-4', Number(seedS), who, { cap: Number(capS), dotSetting: true, onFrame: (rp: RealPlay) => {
  const e: any = (rp as any).e;
  if (!printedRivers) {
    printedRivers = true;
    for (const z of e.stage?.rivers ?? e.rivers ?? []) console.log('river', Math.round(z.x0), Math.round(z.x1), 'tail', z.tail ?? 0, 'surf', z.surfaceY, z.deep ? 'deep' : '', z.safe ? 'safe' : '');
    for (const v of rp.vines) if (v.vineType !== 'tree_climb') console.log('vine', v.id, Math.round(v.x), Math.round(v.y), 'len', Math.round(v.length ?? 0), v.vineType);
  }
  fr++; const p: any = rp.p;
  const b = Math.floor(p.x / 250) * 250; buckets.set(b, (buckets.get(b) ?? 0) + 1);
  const on = rp.platforms.find((q: any) => q.id === rp.standingOn) as any;
  const st = p.isVineSwinging ? 'vine:' + p.swingVineId : on ? on.type : 'air';
  const sk = st.startsWith('vine') ? st : st;
  if (sk !== prevState && (sk.startsWith('vine') || sk === 'drift' || prevState.startsWith('vine') || prevState === 'drift')) {
    evs.push(`${(fr / 30).toFixed(2)}s x${Math.round(p.x)} y${Math.round(p.y)} ${prevState}->${sk}`);
  }
  prevState = sk;
} });
console.log('end', r.end, 'time', r.time, 'x', Math.round(r.x), 'lives', r.harms.filter((h: any) => h.kind === 'life').map((h: any) => `${Math.round(h.x)}@${Math.round(h.t ?? 0)}`).join(' '));
console.log('fromLog', r.fromLog, 'ontoLog', r.ontoLog, 'rescues', r.rescues, 'stuck', JSON.stringify(r.stuck).slice(0, 400));
console.log('loops', JSON.stringify(r.loops).slice(0, 800));
const top = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([x, n]) => `${x}:${(n / 30).toFixed(0)}s`);
console.log('time by x (250 px buckets):', top.join(' '));
console.log('events (first 60, last 40):'); console.log(evs.slice(0, 60).join('\n')); console.log('...'); console.log(evs.slice(-40).join('\n'));
