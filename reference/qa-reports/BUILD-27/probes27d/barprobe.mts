// BUILD-27d: the HUD route bar (engine.routeBar.ratio) through a real bot run on 2-7: every 10 s, and at the race verdict and the end
import '../../../../src/game/headlessDom.ts';
import { firstTimer } from '../../../../tools/inspect/firsttimer.ts';
import { CAST_BOTS } from '../../../../tools/inspect/castBots.ts';
const [bot = 'adult', setting = 'normal', seedS = '1'] = process.argv.slice(2);
let n = 0, said = false; const out: string[] = [];
const r: any = firstTimer('2-7', Number(seedS), (CAST_BOTS as any)[bot][setting], { cap: 1200, dotSetting: true, onFrame: (sim: any) => {
  const e = sim.e as any; const b = e.routeBar?.ratio?.() ?? NaN;
  const v = e.pieces?.find?.((q: any) => q.kind === 'pacer')?.verdict;
  if (n % 300 === 0 || (v && !said)) out.push(`f${n} x${Math.round(e.player.x)} y${Math.round(e.player.y)} bar ${b.toFixed(3)}${v && !said ? ' VERDICT' : ''}`);
  if (v) said = true; n++;
  (globalThis as any).__last = `f${n} x${Math.round(e.player.x)} bar ${b.toFixed(3)}`;
} });
console.log(`${bot} ${setting} seed ${seedS}: end ${r.end} ${r.time}s\n${out.join('\n')}\nlast ${(globalThis as any).__last}`);
