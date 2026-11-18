import { firstTimer, FirstTimerRun, FT_CHILD, FT_MIDDLE, FT_EXPERT, FT_KID, FT_ADULT } from '/home/user/Sloths-Adventure-/tools/inspect/firsttimer.ts';
const proto: any = FirstTimerRun.prototype;
const op = proto.play; let last: any = null;
proto.play = function () { last = this; return op.call(this); };
const seeds = (process.env.SEEDS ?? '1-6').split('-').map(Number);
const bots: Record<string, any> = { child: FT_CHILD, middle: FT_MIDDLE, expert: FT_EXPERT, kid: FT_KID, adult: FT_ADULT };
const missed = new Map<string, number>();
for (const name of (process.env.BOTS ?? 'child,middle,expert').split(',')) for (let seed = seeds[0]; seed <= seeds[1]; seed++) {
  const r = firstTimer('1-6', seed, { ...bots[name], setting: 'normal' });
  const st = last.sim;
  const plats = st.platforms;
  const out: string[] = [];
  for (const c of st.collectibles as any[]) {
    if (c.collected || (c.type !== 'flower' && c.type !== 'leaf')) continue;
    const under = plats.filter((q: any) => c.x >= q.x && c.x <= q.x + q.width && q.y >= c.y - 4 && q.y < c.y + 200).sort((a: any, b: any) => a.y - b.y)[0];
    const dy = under ? Math.round(under.y - c.y) : 999; const where = (dy > 45 ? 'AIR' : dy < 30 ? 'LOW' : 'GROUND') + (under && !under.tag ? '-pit' : '');
    out.push(`${Math.round(c.x)}:${where}`);
    const k = `seed ${seed} ${where}`; missed.set(k, (missed.get(k) ?? 0) + 1);
  }
  console.log(name, seed, r.end, JSON.stringify(r.goal), 'missed', out.length, out.join(' '));
}
console.log('\nBY PIECE (seed piece: missed count over the bots)');
for (const [k, v] of [...missed].sort()) console.log(k, v);
