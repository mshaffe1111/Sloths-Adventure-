// BUILD-16d: every petal with no tagged piece under it (a pit floor: the shared fill pass's pick), by 1-6 section and the pieces round it
import { RealPlay } from '/home/user/Sloths-Adventure-/src/game/realPlay.ts';
import { setDifficulty } from '/home/user/Sloths-Adventure-/src/game/difficulty.ts';
const T: Record<string, number> = {};
for (const set of ['normal', 'easy'] as const) for (let seed = 1; seed <= 6; seed++) {
  setDifficulty(set);
  const st: any = new RealPlay('1-6', seed).stage;
  const fl = st.collectibles.filter((c: any) => c.type === 'flower' || c.type === 'leaf');
  const under = (c: any) => st.platforms.filter((q: any) => c.x >= q.x && c.x <= q.x + q.width && q.y >= c.y - 4 && q.y < c.y + 200).sort((a: any, b: any) => a.y - b.y)[0];
  const out: string[] = [];
  for (const c of fl) {
    if (under(c)?.tag) continue;
    const near = st.platforms.filter((q: any) => q.tag).sort((a: any, b: any) => Math.min(Math.abs(a.x - c.x), Math.abs(a.x + a.width - c.x)) - Math.min(Math.abs(b.x - c.x), Math.abs(b.x + b.width - c.x)))[0];
    const [uid, key] = near.tag.split(':'); const tpl = (st.gen2.sections.find((s: any) => s.uid === uid)?.template ?? uid).replace('w1-16-', '');
    out.push(`${Math.round(c.x)}@${tpl}:${key}`); T[`${set} ${tpl}:${key}`] = (T[`${set} ${tpl}:${key}`] ?? 0) + 1;
  }
  console.log(set, seed, 'petals', fl.length, 'in pits', out.length, out.join(' '));
}
for (const k of Object.keys(T).sort()) console.log(k, T[k]);
