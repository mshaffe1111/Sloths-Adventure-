/**
 * The first-timer re-baseline (bot-fix, 2026-11-01): every non-boss stage of the worlds asked, kid (Easy) and adult (Normal), seeds asked,
 * one JSON line a run: how it ended, the goal, lives, hits, rescues, game overs.
 *   npx tsx tools/inspect/botBaseline.ts --worlds 1-3 --seeds 1-3 [--stages 1-3,1-5] [--who kid,adult] [--detail] > out.jsonl
 * (--detail adds every stuck spot, with what was in front of him, where each life was lost, and the run's flags against STAGE-RULES §1b)
 */
import { firstTimer, FT_ADULT, FT_KID } from './firsttimer.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';

const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const range = (s: string) => s.split(',').flatMap((p) => { const [a, b] = p.split('-').map(Number); return Array.from({ length: (b ?? a) - a + 1 }, (_, i) => a + i); });
const worlds = range(arg('--worlds') ?? '1-10');
const seeds = range(arg('--seeds') ?? '1-3');
const detail = process.argv.includes('--detail');
const only = arg('--stages')?.split(',');
const who = (arg('--who') ?? 'kid,adult').split(',').map((w) => (w === 'kid' ? FT_KID : FT_ADULT));
const ids = generateAllLevels().filter((c) => worlds.includes(c.worldIndex) && c.objectiveType !== 'boss_lair' && (!only || only.includes(c.id))).map((c) => c.id);
for (const id of ids) for (const w of who) for (const seed of seeds) {
  try {
    const r = firstTimer(id, seed, w);
    console.log(JSON.stringify({ id, who: r.who, seed, end: r.end, time: r.time, progress: r.progress, goal: r.goal, lives: r.harms.filter((h) => h.kind === 'life').length, hits: r.harms.filter((h) => h.kind === 'hit').length, livesPerMin: r.perMin.lives, rescues: r.rescues, gameOvers: r.gameOvers, stops: r.stops.n, tries: r.tries.length, noRoute: r.noRoute, causes: r.harms.filter((h) => h.kind === 'life').map((h) => h.cause), ms: r.ms, x: r.x, ...(detail ? { stuck: r.stuck.map((q) => ({ x: q.x, y: q.y, t: q.t, what: q.what, puzzle: q.puzzle, rescued: q.rescued })), lifeAt: r.harms.filter((h) => h.kind === 'life').map((h) => [h.x, h.y, h.cause]), flags: r.flags.filter((g) => !g.kind.startsWith('dot-')) } : {}) }));
  } catch (err) {
    console.log(JSON.stringify({ id, who: w.name, seed, error: String(err).slice(0, 300) }));
  }
}
