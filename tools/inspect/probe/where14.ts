// POLISH-1 probe (scratch, not committed): each failing castBots run's stuck points, mapped to the 1-4 section they stand in.
import { readFileSync } from 'node:fs';
import { RealPlay } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { firstTimer } from '../firsttimer.ts';
import { CAST_BOTS } from '../castBots.ts';
const [file, stage] = [process.argv[2], process.argv[3] ?? '1-4'];
const rows = readFileSync(file, 'utf8').split('\n').filter((l) => l.startsWith('{')).map((l) => JSON.parse(l)).filter((r) => !r.pass);
const lim = Number(process.argv[4] ?? 12);
const cache = new Map<string, any>();
function stageOf(seed: number, setting: string) {
  const k = `${seed}:${setting}`;
  if (!cache.has(k)) { setDifficulty(setting as never); cache.set(k, new RealPlay(stage, seed).stage); }
  return cache.get(k);
}
function sectionAt(st: any, x: number, y: number) {
  // the platform under (x,y): nearest top at or below y within its span
  let best: any = null;
  for (const p of st.platforms) if (x >= p.x - 20 && x <= p.x + p.width + 20 && p.y >= y - 10 && (!best || p.y < best.y)) best = p;
  return best ? `${String(best.tag ?? '?')} w${Math.round(best.width)} y${Math.round(best.y)}` : 'none';
}
for (const r of rows.slice(0, lim)) {
  const who = CAST_BOTS[r.bot][r.setting];
  const run = firstTimer(stage, r.seed, who, { cap: 1200, dotSetting: true });
  const st = stageOf(r.seed, r.setting);
  for (const s of run.stuck as any[]) console.log(`${r.bot} ${r.setting} s${r.seed} t${s.t} (${s.x},${s.y}) ${s.what.slice(0, 60)} | on ${sectionAt(st, s.x, s.y)}`);
}
