/**
 * R-165.207 (buildcheck): the landing judge's take-off windows (landings.ts windowsOf) are found by sweeping each flight's events once in
 * their order, not by scanning every event for every run's midpoint. Every window equals the old scan's, written out here as it was, on
 * 1-1's real built stages (every ledge and cap, every flight and way, both settings), and on toys where events share ends and nest.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from '../worldsData.ts';
import { w1World } from './worlds/w1.ts';
import { buildPlayStage, loadSeedList, provenSeeds } from './seedList.ts';
import { events, LAND_SIDE, Landings, type LandPiece } from './landings.ts';
import { LAND_FLIGHTS } from './landFlights.data.ts';
import type { Flight } from './landFlights.ts';

type Ev = ReturnType<typeof events>[number];
/** windowsOf before R-165.207, frozen: the first event at each run's midpoint, scanned */
function oldWindowsOf(all: readonly Ev[], a: number, b: number): Map<LandPiece, number> {
  const out = new Map<LandPiece, number>();
  if (b <= a) return out;
  const first = (evs: readonly Ev[], x: number) => { for (const e of evs) if (x > e.lo && x < e.hi) return e; return null; };
  const evs = all.filter((e) => e.hi > a && e.lo < b);
  const cuts = [a, b, ...evs.flatMap((e) => [e.lo, e.hi])].filter((v) => v >= a && v <= b).sort((p, q) => p - q);
  let cur: LandPiece | null = null, run = 0;
  for (let i = 0; i + 1 < cuts.length; i++) {
    const [u, v] = [cuts[i], cuts[i + 1]];
    if (v - u < 1e-6) continue;
    const P = first(evs, (u + v) / 2)?.piece ?? null;
    run = P && P === cur ? run + (v - u) : v - u;
    cur = P;
    if (P && run > (out.get(P) ?? 0)) out.set(P, run);
  }
  return out;
}
const JUMPS: readonly Flight[] = ['jump', 'double', 'jump-up', 'double-up'];
const BOUNCES: readonly Flight[] = ['bounce', 'bounce-air', 'bounce-up', 'bounce-air-up'];
/** Landings.windows(S) as the old scan gives it: the widest window per piece over every flight and way */
function oldWindows(L: Landings, S: LandPiece, setting: 'normal' | 'easy'): Map<LandPiece, number> {
  const [a, b] = S.type === 'bouncy' ? [S.x - 12, S.x + S.width + 12] : [S.x - LAND_SIDE.px, S.x + S.width + LAND_SIDE.px];
  const m = new Map<LandPiece, number>();
  for (const how of S.type === 'bouncy' ? BOUNCES : JUMPS) for (const dir of [1, -1] as const) {
    for (const [P, w] of oldWindowsOf(events(LAND_FLIGHTS[setting][how], S.y, dir, L.near(S.x, S.x + S.width), S), a, b)) if (w > (m.get(P) ?? 0)) m.set(P, w);
  }
  return m;
}
const same = (got: Map<LandPiece, number>, want: Map<LandPiece, number>, what: string) => {
  assert.equal(got.size, want.size, `${what}: ${got.size} pieces landed on, the old scan ${want.size}`);
  for (const [P, w] of want) assert.ok(Object.is(got.get(P), w), `${what}: window onto x ${P.x} ${got.get(P)}, the old scan ${w}`);
};

test('R-165.207: every take-off window on 1-1\'s built stages equals the old midpoint scan (every ledge and cap, both settings)', async () => {
  assert.ok(await loadSeedList('1-1'));
  const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
  const seeds = provenSeeds('1-1');
  let judged = 0;
  for (const seed of seeds.filter((_, i) => i % 25 === 0)) for (const s of ['normal', 'easy'] as const) {
    const ps = buildPlayStage(cfg, w1World(), seed, s).platforms.map((p) => ({ ...p })) as LandPiece[];
    const L = new Landings(ps, s);
    for (const S of ps) {
      if (S.broken) continue;
      same(L.windows(S), oldWindows(L, S, s), `1-1 seed ${seed} ${s}, from x ${S.x}`);
      judged++;
    }
  }
  assert.ok(judged > 1000, `${judged} ledges judged`);
});

test('R-165.207: toys where events share ends, nest and overlap give the old scan\'s windows', () => {
  const P = (x: number, y: number, width: number, height = 24, type: LandPiece['type'] = 'solid'): LandPiece => ({ x, y, width, height, type });
  const sets: LandPiece[][] = [
    // a ledge, logs touching end to end at the same height, a wall beside them, a cap
    [P(0, 900, 300, 300), P(300, 900, 200), P(500, 900, 200), P(700, 780, 60, 200), P(820, 870, 60, 30, 'bouncy'), P(900, 900, 400, 300)],
    // stacked logs over one another (nested catches), a tall wall and a gap
    [P(0, 900, 260, 300), P(330, 860, 120), P(330, 800, 120), P(330, 740, 120), P(520, 700, 44, 400), P(700, 900, 500, 300)],
    // a narrow ledge, a log exactly a jump away, a low ceiling log
    [P(0, 900, 120, 300), P(200, 820, 300), P(420, 900, 80), P(560, 880, 160), P(800, 980, 300, 300)],
  ];
  for (const ps of sets) for (const s of ['normal', 'easy'] as const) {
    const L = new Landings(ps, s);
    for (const S of ps) same(L.windows(S), oldWindows(L, S, s), `toy ${s}, from x ${S.x}`);
  }
});
