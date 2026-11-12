/**
 * P12S: the bots fly the REAL game's 1-2 (RealPlay: the game's own build, the listed road) end to end on both settings, one JSON line a run.
 *   npx tsx reference/qa-reports/P12S/bots12.ts <bots: adult,kid,expert,middle,child> <layouts: 1-8> <settings: normal,easy>
 * The first-timers (ADULT, KID) play each setting; the tiers play the settings their testers played (expert Normal; middle, child both).
 * Fresh phone each run (what 1-1 taught is not carried in: a first-timer meets 1-2 cold).
 */
import { firstTimer, FT_ADULT, FT_KID, FT_EXPERT, FT_MIDDLE, FT_MIDDLE_EASY, FT_CHILD, FT_CHILD_EASY, type FirstTimer } from '../../../tools/inspect/firsttimer.ts';
const [botsArg = 'adult,kid', layArg = '1-4', setArg = 'normal,easy'] = process.argv.slice(2);
const [l0, l1] = layArg.split('-').map(Number);
const WHO: Record<string, Partial<Record<'normal' | 'easy', FirstTimer>>> = {
  adult: { normal: FT_ADULT, easy: { ...FT_ADULT, setting: 'easy' } },
  kid: { easy: FT_KID, normal: { ...FT_KID, setting: 'normal' } },
  expert: { normal: FT_EXPERT },
  middle: { normal: FT_MIDDLE, easy: FT_MIDDLE_EASY },
  child: { normal: FT_CHILD, easy: FT_CHILD_EASY },
};
for (const b of botsArg.split(',')) for (const s of setArg.split(',') as Array<'normal' | 'easy'>) {
  const who = WHO[b]?.[s];
  if (!who) continue;
  for (let v = l0; v <= (l1 ?? l0); v++) {
    const t0 = Date.now();
    const r = firstTimer('1-2', v, who, { fresh: true });
    const causes: Record<string, number> = {};
    for (const h of r.harms) causes[`${h.kind}:${h.cause}`] = (causes[`${h.kind}:${h.cause}`] ?? 0) + 1;
    console.log(JSON.stringify({ bot: b, setting: s, layout: v, end: r.end, time: Math.round(r.time), progress: Math.round(r.progress * 100), goal: r.goal, harms: r.harms.length, causes, gameOvers: r.gameOvers, rescues: r.rescues, rescueXs: r.rescueXs, stuck: r.stuck.slice(0, 4).map((q: any) => ({ x: Math.round(q.x), what: q.what ?? q.why })), firstHarm: r.firstHarm.slice(0, 3).map((h: any) => ({ cause: h.cause, t: Math.round(h.t ?? 0), x: Math.round(h.x ?? 0), taught: h.taught })), tips: (r.dot as any)?.lines?.length ?? undefined, ms: Date.now() - t0 }));
  }
}
