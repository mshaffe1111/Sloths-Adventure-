// BUILD-24b: the kid and adult bots (castBots.ts BOTS: FT_KID, FT_ADULT) on 2-4, traced one line a run (npx tsx tracekid.ts kid:normal:17,...)
import '../../../src/game/headlessDom.ts';
import { firstTimer, FT_KID, FT_ADULT } from '../../../tools/inspect/firsttimer.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
for (const j of process.argv[2].split(',')) {
  const [bot, setting, seed] = j.split(':');
  setDifficulty(setting as never);
  const who = { ...(bot === 'kid' ? FT_KID : FT_ADULT), setting } as never;
  const r: any = firstTimer('2-4', Number(seed), who, { cap: 1200 });
  console.log(`${j}: end ${r.end} rescues ${r.rescues} lives ${r.lives ?? r.harms?.length} ${Math.round(r.time)} s; rescued at x ${JSON.stringify(r.rescueXs)}; deaths at ${JSON.stringify((r.harms ?? []).map((h: any) => [Math.round(h.x), Math.round(h.t), h.cause]))}; stuck ${JSON.stringify((r.stuck ?? []).filter((s: any) => s.rescued || s.dur >= 8).map((s: any) => [Math.round(s.x), Math.round(s.t), s.what, s.rescued]))}`);
}
