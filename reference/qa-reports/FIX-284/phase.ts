import { firstTimer, FT_KID, FT_ADULT } from '../../../tools/inspect/firsttimer.ts';
const [bot, ...seeds] = process.argv.slice(2);
const who = bot === 'kid' ? FT_KID : FT_ADULT;
for (const sd of seeds.map(Number)) {
  const r = firstTimer('2-2', sd, { ...who, setting: 'normal' }, { cap: 1200, dotSetting: true });
  const L = r.harms.filter((h) => h.kind === 'life');
  const parts = L.map((h, i) => `t ${h.t.toFixed(1)} x ${Math.round(h.x)}` + (i && Math.abs(h.x - L[i - 1].x) < 400 ? ` (dt ${(h.t - L[i - 1].t).toFixed(2)}, mod 3.0 = ${((h.t - L[i - 1].t) % 3).toFixed(2)})` : ''));
  console.log(`seed ${sd} rescues ${r.rescues}: ${parts.join(' | ')}`);
}
