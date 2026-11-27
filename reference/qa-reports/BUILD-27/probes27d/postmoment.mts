// BUILD-27d: on 2-7, when (frame, x) does the engine name 'post:letter' in a bot's natural run, and when does the race verdict land
// usage: npx tsx postmoment.mts <bot> <setting> <seeds a-b>
import '../../../../src/game/headlessDom.ts';
import { firstTimer } from '../../../../tools/inspect/firsttimer.ts';
import { CAST_BOTS } from '../../../../tools/inspect/castBots.ts';
const [bot = 'adult', setting = 'normal', range = '1-3'] = process.argv.slice(2);
const [a, b] = range.split('-').map(Number);
for (let seed = a; seed <= b; seed++) {
  let n = 0, postAt = '', verdictAt = ''; const seen = new Map<string, string>();
  const r: any = firstTimer('2-7', seed, (CAST_BOTS as any)[bot][setting], { cap: 1200, dotSetting: true, onFrame: (sim: any) => {
    const e = sim.e as any;
    if (!postAt && (e.moments as string[] | undefined)?.includes('post:letter')) postAt = `frame ${n} x ${Math.round(e.player.x)}`;
    for (const m of (e.moments as string[] | undefined) ?? []) if (!seen.has(m)) seen.set(m, `f${n} t${(n / 30).toFixed(1)} x${Math.round(e.player.x)}`);
    const v = e.pieces?.find?.((q: any) => q.kind === 'pacer')?.verdict;
    if (v && !verdictAt) verdictAt = `frame ${n} x ${Math.round(e.player.x)} ${JSON.stringify(v)}`;
    n++;
  } });
  console.log(`${bot} ${setting} seed ${seed}: end ${r.end} ${r.time}s; post:letter ${postAt || 'NEVER'}; race verdict ${verdictAt || 'none'}`);
  console.log('  moments', JSON.stringify([...seen]));
}
