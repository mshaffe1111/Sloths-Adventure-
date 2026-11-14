// ENG-16F (from BUILD-16d's, with castBots' run options: cap 1200, dotSetting): each petal a bot missed, by the piece under it (section:key) and where on that piece (0..1), totals by section:key
// BOTS=expert SEEDS=1-6 npx tsx reference/qa-reports/BUILD-16d/petalmiss.ts   (one process per bot: R-165.244)
import { firstTimer, FirstTimerRun, FT_CHILD, FT_MIDDLE, FT_EXPERT, FT_KID, FT_ADULT } from '/home/user/Sloths-Adventure-/tools/inspect/firsttimer.ts';
const proto: any = FirstTimerRun.prototype; const op = proto.play; let last: any = null;
proto.play = function () { last = this; return op.call(this); };
const bots: Record<string, any> = { child: FT_CHILD, middle: FT_MIDDLE, expert: FT_EXPERT, kid: FT_KID, adult: FT_ADULT };
const seeds = (process.env.SEEDS ?? '1-6').split('-').map(Number);
const T: Record<string, number> = {};
for (const name of (process.env.BOTS ?? 'expert').split(',')) for (let seed = seeds[0]; seed <= seeds[1]; seed++) {
  const r: any = firstTimer('1-6', seed, { ...bots[name], setting: (process.env.SET ?? 'normal') as any }, { cap: 1200, dotSetting: true } as any);
  const st = last.sim.stage; const secs = st.gen2.sections;
  const out: string[] = [];
  for (const c of last.sim.collectibles as any[]) {
    if (c.collected || (c.type !== 'flower' && c.type !== 'leaf')) continue;
    const q = last.sim.platforms.filter((q: any) => c.x >= q.x && c.x <= q.x + q.width && q.y >= c.y - 4 && q.y < c.y + 200).sort((a: any, b: any) => a.y - b.y)[0];
    let where = 'AIR';
    if (q) { const [uid, key] = (q.tag ?? 'pit:pit').split(':'); const tpl = (secs.find((s: any) => s.uid === uid)?.template ?? uid).replace('w1-16-', ''); where = `${tpl}:${key}${q.tag ? '' : ''}@${((c.x - q.x) / q.width).toFixed(2)}`; }
    out.push(`${Math.round(c.x)}:${where}`); const k = where.replace(/@.*/, ''); T[k] = (T[k] ?? 0) + 1;
  }
  console.log(name, seed, r.end, JSON.stringify(r.goal), 'missed', out.length, out.join(' '));
}
console.log('\nBY PIECE'); for (const [k, v] of Object.entries(T).sort((a, b) => b[1] - a[1])) console.log(k, v);
