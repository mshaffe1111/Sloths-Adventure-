/**
 * PROOF-1 item 2: a first-timer bot run (tools/inspect/firsttimer.ts, the real engine one 30 fps frame at a time) of 1-1, 1-3 and one
 * stage in each world, Easy (kid's thumb) and Normal (adult's), seed fixed. Run from a repo root (head or main worktree):
 *   npx tsx <this> <repoRoot> > out.json
 * Prints one JSON line per (stage, setting) with the run's outcome; the two repos' outputs are diffed by the caller.
 */
const root = process.argv[2];
const ft = await import(root + '/tools/inspect/firsttimer.ts');
const stages = (process.argv[3] ?? '1-1,1-3,2-1,3-1,4-1,5-1,6-1,7-1,8-1,9-1,10-1').split(',');
const SEED = Number(process.env.FT_SEED ?? 1);
for (const id of stages) for (const who of [ft.FT_KID, ft.FT_ADULT]) {
  try {
    const r = ft.firstTimer(id, SEED, who, { fresh: true });
    const { ms, ...rest } = r as Record<string, unknown>;
    const pick: Record<string, unknown> = {};
    for (const k of ['end', 'time', 'frames', 'deaths', 'lives', 'hearts', 'rescues', 'gameOvers', 'stuck', 'flags', 'maxX', 'far', 'lessons', 'falls']) if (k in rest) pick[k] = (rest as any)[k];
    console.log(JSON.stringify({ id, setting: who.setting, ...pick, keys: Object.keys(rest).length, hash: hash(JSON.stringify(rest)) }));
  } catch (e) { console.log(JSON.stringify({ id, setting: who.setting, error: String((e as Error).message).slice(0, 200) })); }
}
function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); }
