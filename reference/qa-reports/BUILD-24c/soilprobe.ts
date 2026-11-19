// BUILD-24c: every pickup on 2-4 (layouts 1-16, both settings): is it inside any solid floor (in the soil), or more than 400 px over
// any floor top below it with no vine/liana near (floating)? Prints the count and each bad one. (npx tsx soilprobe.ts)
import '../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
let bad = 0, n = 0;
for (const setting of ['normal', 'easy'] as const) {
  setDifficulty(setting);
  for (let lay = 1; lay <= 16; lay++) {
    const sim: any = new RealPlay('2-4', lay);
    const st: any = sim.stage;
    const solid = sim.platforms.filter((p: any) => p.type !== 'drift' && p.type !== 'moving' && p.height > 30);
    const items = [...(st.collectibles ?? []), ...(st.petals ?? [])];
    for (const c of items) {
      n++;
      const cx = c.x + (c.width ?? 0) / 2, cy = c.y + (c.height ?? 0) / 2;
      const inside = solid.find((p: any) => cx > p.x + 2 && cx < p.x + p.width - 2 && cy > p.y + 4 && cy < p.y + p.height);
      if (inside) { bad++; console.log(`${setting} lay ${lay}: ${c.type ?? c.kind ?? 'item'} at ${Math.round(cx)},${Math.round(cy)} INSIDE floor x ${Math.round(inside.x)}-${Math.round(inside.x + inside.width)} y ${Math.round(inside.y)}`); }
    }
  }
}
console.log(`${n} pickups checked, ${bad} inside a floor`);
