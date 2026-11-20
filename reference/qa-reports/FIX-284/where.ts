// which pond row each water life was lost in (adult/kid, Normal), and where the rescue came
import { firstTimer, FT_KID, FT_ADULT } from '../../../tools/inspect/firsttimer.ts';
import { RealPlay } from '../../../src/game/realPlay.ts';
const [bot, inp, ...seeds] = process.argv.slice(2);
const who = bot === 'kid' ? FT_KID : FT_ADULT;
const tally: Record<string, number> = {};
for (const sd of seeds.map(Number)) {
  const st = new RealPlay('2-2', sd);
  const zones = (st.stage.rivers ?? []).map((z: any) => ({ x0: z.x0, x1: z.x1, open: z.open, speed: z.speed }));
  const pads = st.platforms.filter((p: any) => p.pad || p.art === 'crownLily');
  const rowOf = (x: number) => {
    const z = zones.find((q: any) => x >= q.x0 - 40 && x <= q.x1 + 40);
    if (!z) return `x${Math.round(x)} (no water zone)`;
    const inZ = pads.filter((p: any) => p.x >= z.x0 - 5 && p.x + p.width <= z.x1 + 5).map((p: any) => (p.pad ? (p.pad.by === 'beat' ? 'b' : '') + p.pad.look[0] : 'C')).join('');
    const k = zones.indexOf(z); return z.speed ? `river#${k}` : `pond#${k}[${inZ || "none"}]`;
  };
  const r = firstTimer('2-2', sd, { ...who, setting: 'normal' }, { cap: 1200, dotSetting: true, ...(inp === 'touch' ? { realInput: true } : {}) });
  const lost = r.harms.filter((h) => h.kind === 'life').map((h) => rowOf(h.x));
  for (const l of lost) tally[l] = (tally[l] ?? 0) + 1;
  console.log(`seed ${sd}: rescues ${r.rescues}; lives: ${lost.join(', ')}`);
}
console.log('TALLY', JSON.stringify(Object.entries(tally).sort((a, b) => b[1] - a[1])));
