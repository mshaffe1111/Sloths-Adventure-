/**
 * The bots on a stage that names a cast (P13, 11-12): the first-timer (FT_KID / FT_ADULT) and the tier bots (child, middle, expert) in the
 * REAL engine (firsttimer.ts on realPlay.ts), over its rolls, both settings; one JSON line a run and a summary: the pass rate (the shrine
 * with the goal full), and every failure by cause (time, stranded, a sealed door, a game over), how each animal was cleared (the kit's
 * way), the traps sprung, the hits by cause. No stage is named in this file: it is handed one.
 *   npx tsx tools/inspect/castBots.ts --stage 1-3 --seeds 1-40 [--bots kid,adult,child,middle,expert] [--setting both] [--par 6] [--json]
 * A seed is the stage's layout variant (RealPlay -> setLayoutVariant): on a listed stage its n-th proven seed, on a test-side roll its
 * gen2 seed (tools/engine/runs/page13.py's hook in a worktree).
 */
import path from 'node:path';
import { spawn } from 'node:child_process';
import { firstTimer, FT_ADULT, FT_CHILD, FT_CHILD_EASY, FT_EXPERT, FT_KID, FT_MIDDLE, FT_MIDDLE_EASY, type FirstTimer, type FTRun } from './firsttimer.ts';
import { RULES, isClimb } from './eraRoll.ts';
import { RealPlay, levelConfig } from '../../src/game/realPlay.ts';

type Setting = 'easy' | 'normal';
/** STAGE-RULES.md:77 "Every stage takes at least 2 minutes for a quick player, on every roll ... Climbs count 20 s short": the floor a run
 *  is held to, read from the one definition the stage rules' tools use (eraRoll.ts RULES and isClimb; c1judge.ts reads the same), never a
 *  number of this file's own (a flat 120 here held 1-4, a climb, to a run stage's floor: R-165.206, lead ruling 11-13 7:42 PM, D19) */
export const floorSeconds = (climb: boolean): number => RULES.minSeconds - (climb ? RULES.climbShort : 0);
/** a stage's floor as the rules read it: a climb (isClimb on the stage as built for the seed) or not */
export const stageFloor = (stage: string, seed = 1): number => floorSeconds(isClimb(levelConfig(stage), new RealPlay(stage, seed).stage as never));
/** a run that holds: the shrine with the goal full and no rescue, in no less than the stage's floor */
export const runHolds = (r: Pick<CastRun, 'pass' | 'time'>, floor: number): boolean => r.pass && r.time >= floor;
/** the bots, each on the settings it plays (the tier bots as tierBots.ts BOTS; the first-timer on both) */
export const CAST_BOTS: Record<string, Partial<Record<Setting, FirstTimer>>> = {
  kid: { normal: { ...FT_KID, setting: 'normal' }, easy: { ...FT_KID, setting: 'easy' } },
  adult: { normal: { ...FT_ADULT, setting: 'normal' }, easy: { ...FT_ADULT, setting: 'easy' } },
  child: { normal: FT_CHILD, easy: FT_CHILD_EASY },
  middle: { normal: FT_MIDDLE, easy: FT_MIDDLE_EASY },
  expert: { normal: FT_EXPERT },
};

export interface CastRun {
  bot: string; setting: Setting; stage: string; seed: number; end: FTRun['end']; pass: boolean; time: number; goal: FTRun['goal'];
  rescues: number; turnBacks: number; hits: number; lives: number; hitBy: Record<string, number>; cast: FTRun['cast'] | null; stuck: Array<{ x: number; what: string }>;
  error?: string;
}

export function castRun(bot: string, setting: Setting, stage: string, seed: number): CastRun {
  const who = CAST_BOTS[bot][setting]!;
  // (Dot as the phone's default setting lets her speak: Tips on Normal, Help on Easy)
  const r = firstTimer(stage, seed, who, { cap: 1200, dotSetting: true });
  const hitBy: Record<string, number> = {};
  for (const h of r.harms) hitBy[h.cause] = (hitBy[h.cause] ?? 0) + 1;
  const goalFull = !r.goal || r.goal.got >= r.goal.need;
  return {
    bot, setting, stage, seed, end: r.end, pass: r.end === 'shrine' && goalFull && r.rescues === 0, time: r.time, goal: r.goal, rescues: r.rescues, turnBacks: r.turnBacks ?? 0,
    hits: r.harms.filter((h) => h.kind === 'hit').length, lives: r.harms.filter((h) => h.kind === 'life').length, hitBy, cast: r.cast ?? null,
    stuck: r.stuck.map((s) => ({ x: Math.round((s as { x: number }).x), what: String((s as { what?: string }).what ?? '') })),
  };
}

const range = (s: string) => s.split(',').flatMap((p) => { const [a, b] = p.split('-').map(Number); return Array.from({ length: (b ?? a) - a + 1 }, (_, i) => a + i); });
const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const stage = arg('--stage');
  if (!stage) throw new Error('--stage <id>');
  const bots = (arg('--bots') ?? 'kid,adult,child,middle,expert').split(',');
  const seeds = range(arg('--seeds') ?? '1-20');
  const want = arg('--setting') ?? 'both';
  const settings: Setting[] = want === 'both' ? ['normal', 'easy'] : [want as Setting];
  const par = Number(arg('--par') ?? 1);
  const rows: CastRun[] = [];
  if (process.argv.includes('--json') || par <= 1) {
    for (const bot of bots) for (const setting of settings) {
      if (!CAST_BOTS[bot]?.[setting]) continue;
      for (const seed of seeds) {
        let row: CastRun;
        try { row = castRun(bot, setting, stage, seed); } catch (err) {
          row = { bot, setting, stage, seed, end: 'stranded', pass: false, time: 0, goal: null, rescues: 0, turnBacks: 0, hits: 0, lives: 0, hitBy: {}, cast: null, stuck: [], error: String(err).slice(0, 200) };
        }
        if (process.argv.includes('--json')) console.log(JSON.stringify(row));
        rows.push(row);
      }
    }
  } else {
    const chunks = Array.from({ length: par }, (_, i) => seeds.filter((_, j) => j % par === i)).filter((c) => c.length);
    await Promise.all(chunks.map((c) => new Promise<void>((res) => {
      const ch = spawn(process.execPath, ['--import', 'tsx', process.argv[1], '--json', '--stage', stage, '--bots', bots.join(','), '--setting', want, '--seeds', c.join(',')], { stdio: ['ignore', 'pipe', 'inherit'] });
      let buf = '';
      ch.stdout.on('data', (b) => (buf += b));
      ch.on('close', () => { for (const l of buf.split('\n')) if (l.startsWith('{')) rows.push(JSON.parse(l)); res(); });
    })));
  }
  // (--proven <file>: the seeds every bot played to the shrine, the goal full, no rescue, on every setting asked, and none under STAGE-RULES'
  // 2 minutes: the candidates for a stage's proven-seed list, tools/engine/seedlist.ts --merge <file>)
  const proven = arg('--proven');
  const floor = process.argv.includes('--json') ? 0 : stageFloor(stage, seeds[0]);
  if (proven && !process.argv.includes('--json')) {
    const ok = seeds.filter((sd) => { const R = rows.filter((r) => r.seed === sd); return R.length > 0 && R.every((r) => runHolds(r, floor)); });
    (await import('node:fs')).writeFileSync(proven, JSON.stringify(ok));
    console.log(`proven: ${ok.length} of ${seeds.length} seeds (every bot passes, none under ${floor} s) -> ${proven}`);
    for (const sd of seeds.filter((x) => !ok.includes(x))) {
      const why = rows.filter((r) => r.seed === sd && !runHolds(r, floor)).map((r) => `${r.bot} ${r.setting} ${r.pass ? `${r.time} s` : r.error ? 'error' : `${r.end}${r.rescues ? ` rescued x${r.rescues}` : ''}`}`);
      console.log(`   seed ${sd} out: ${why.join('; ')}`);
    }
  }
  if (!process.argv.includes('--json')) {
    console.log(`castBots ${stage}, seeds ${arg('--seeds') ?? '1-20'}; the floor ${floor} s (STAGE-RULES.md:77${floor < RULES.minSeconds ? ': a climb, 20 s short' : ''})`);
    for (const bot of bots) for (const setting of settings) {
      const R = rows.filter((r) => r.bot === bot && r.setting === setting);
      if (!R.length) continue;
      const P = R.filter((r) => r.pass);
      const ends = new Map<string, number>();
      for (const r of R) if (!r.pass) { const k = r.error ? `error ${r.error.slice(0, 80)}` : `${r.end}${r.goal && r.goal.got < r.goal.need ? ` goal ${r.goal.got}/${r.goal.need}` : ''}${r.rescues ? ` rescued x${r.rescues}` : ''}`; ends.set(k, (ends.get(k) ?? 0) + 1); }
      const sum = (f: (r: CastRun) => number) => R.reduce((s, r) => s + f(r), 0);
      const ways = new Map<string, number>();
      for (const r of R) for (const [w, n] of Object.entries(r.cast?.cleared ?? {})) ways.set(w, (ways.get(w) ?? 0) + n);
      const hitBy = new Map<string, number>();
      for (const r of R) for (const [w, n] of Object.entries(r.hitBy)) hitBy.set(w, (hitBy.get(w) ?? 0) + n);
      const times = P.map((r) => r.time).sort((a, b) => a - b);
      console.log(`${bot.padEnd(6)} ${setting.padEnd(6)} PASS ${P.length}/${R.length}; under the floor ${P.filter((r) => !runHolds(r, floor)).length}; time median ${times.length ? times[times.length >> 1] : '-'} s (min ${times[0] ?? '-'}); hits ${sum((r) => r.hits)} lives ${sum((r) => r.lives)} (${[...hitBy].map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}); cleared ${[...ways].map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}; told of traps ${R.filter((r) => r.cast?.told).length}/${R.length}; first trap sprung ${R.filter((r) => r.cast?.firstSprung).length}/${R.length}; traps sprung ${sum((r) => r.cast?.sprung ?? 0)}/${sum((r) => r.cast?.traps ?? 0)}; turned back ${sum((r) => r.turnBacks)}; left ${sum((r) => r.cast?.left ?? 0)}`);
      for (const [k, v] of [...ends].sort((a, b) => b[1] - a[1])) console.log(`        fail ${v}: ${k}  (seeds ${R.filter((r) => !r.pass && (r.error ? `error ${r.error.slice(0, 80)}` : `${r.end}${r.goal && r.goal.got < r.goal.need ? ` goal ${r.goal.got}/${r.goal.need}` : ''}${r.rescues ? ` rescued x${r.rescues}` : ''}`) === k).map((r) => r.seed).join(',')})`);
    }
  }
}
