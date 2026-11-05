// CP3: the real-engine first-timer bot on the mixed 1-5, adult on Normal and kid on Easy, layouts 1-4 (the end, time, lives, harms by
// cause, rescues), and the R-164.1 check (P3): no harm from a fall that lands on a standable ledge.
import { firstTimer, FT_ADULT, FT_KID } from '../inspect/firsttimer.ts';
for (const who of [FT_ADULT, FT_KID]) for (const seed of [1, 2, 3, 4]) {
  const r = firstTimer('1-5', seed, who, { fresh: true });
  const lives = r.harms.filter((h) => h.kind === 'life').length;
  const causes = [...new Set(r.harms.map((h) => h.cause))].join(', ');
  console.log(`${who.name} ${who.setting.padEnd(6)} layout ${seed}: end ${r.end} in ${Math.round(r.time)} s, goal ${r.goal ? r.goal.got + '/' + r.goal.need : '-'}, harms ${r.harms.length} (lives ${lives}) ${causes ? '[' + causes + ']' : ''}, rescues ${(r as any).rescues ?? '-'}, stuck ${r.stuck.length}`);
}
