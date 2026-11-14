import { RealPlay } from '/home/user/Sloths-Adventure-/src/game/realPlay.ts';
import { setDifficulty } from '/home/user/Sloths-Adventure-/src/game/difficulty.ts';
for (const set of ['normal', 'easy'] as const) for (let seed = 1; seed <= 6; seed++) {
  setDifficulty(set);
  const st: any = new RealPlay('1-6', seed).stage;
  const fl = st.collectibles.filter((c: any) => c.type === 'flower');
  const under = (c: any) => st.platforms.filter((q: any) => c.x >= q.x && c.x <= q.x + q.width && q.y >= c.y - 4 && q.y < c.y + 200).sort((a: any, b: any) => a.y - b.y)[0];
  const pit = fl.filter((c: any) => !under(c)?.tag);
  console.log(set, seed, 'petals', fl.length, 'in pits', pit.length, pit.map((c: any) => c.x).join(' '));
}
