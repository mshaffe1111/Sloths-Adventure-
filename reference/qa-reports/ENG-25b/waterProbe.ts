// npx tsx reference/qa-reports/ENG-25b/waterProbe.ts   (ENG-25b: ENG-25's "3 of 24 held toy runs lost a life to water": which, where, how)
import { atPond, fixtureSeed, pondOf, snapRun, snapStage, TOY_SNAPS, type ToySnap } from '../../../tools/inspect/snapToys.ts';
import type { Setting, Tier } from '../../../tools/inspect/tierBots.ts';

const HELD: Array<[Tier, Setting]> = [['middle', 'normal'], ['middle', 'easy'], ['child', 'easy']];
for (const row of Object.keys(TOY_SNAPS) as ToySnap[]) {
  const seed = fixtureSeed(row);
  const st = snapStage(row, seed);
  const pond = pondOf(st);
  const stones = st.platforms.filter((p) => p.pad?.on === 'bites').map((p) => `${p.x}-${p.x + p.width}`);
  console.log(`${row}: pond ${pond.x0}-${pond.x1}, stones ${stones.join(' ')}, top y ${st.platforms.find((p) => p.pad?.on === 'bites')!.y}`);
  for (const [tier, setting] of HELD) for (const v of [1, 2, 3, 4]) {
    const r = snapRun(row, tier, setting, seed, v);
    const a = atPond(r, pond);
    const lives = r.harms.filter((h) => h.kind === 'life');
    console.log(`  ${tier} ${setting} v${v}: bites ${a.bites} lives@pond ${a.lives} ${lives.map((h) => `[life ${h.cause} x ${Math.round(h.x)} y ${Math.round(h.y)} t ${h.t.toFixed(1)}]`).join(' ')}`);
  }
}
