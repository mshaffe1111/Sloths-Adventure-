// npx tsx --test tools/inspect/routeHumps.test.ts
// S1 INSPECT-ROUTE (R-165.176). The inspector's route must take the way a player takes, so the meter (tools/difficulty/score.ts) and
// every gate that reads routeJumps / inspectJumps judge real jumps:
//  1. a jump between two banks never passes over a block he stands on instead: a raised body block (he hops onto it), a stair (he steps
//     down it) or a shallow dip (he drops in and hops out). Before S1 the route jumped 1-2's 53 px hump and the inspector called the
//     space under it a 231 px pit; it jumped 1-2's stair as a double.
//  2. the inspector builds each stage as the game builds it on entry, on both settings: engine.ts:901, through generateStage for every
//     stage built on gen2 (stageGenerator.ts builtOnGen2). Before S1 stages.ts built 1-2 and 1-3 for Normal and then threw in easyStage
//     on Easy, and built 1-1 with its deleted hand-built builder.
//  3. the route is found on the check as the game judges the stage (levelCheck.ts validateAsJudged: 1-1..1-3 on their flown arcs).
//     Before S1 it asked validateStage alone, which reads 1-1's 253-256 px double test gaps as past reach, so 1-1's Normal route was
//     finished by a "presumed" hop on every layout, the meter's anchor stage included.
// The detectors below are written from the stage data alone, not from route.ts's own rule, so the test does not grade itself.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../src/game/headlessDom.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
import { RealPlay } from '../../src/game/realPlay.ts';
import type { Platform } from '../../src/game/types.ts';
import { findRoute } from './route.ts';
import { routeJumps, inspectJumps, ADULT, type JumpEdge } from './jumps.ts';
import { stageList } from './stages.ts';

type Setting = 'normal' | 'easy';
/** the highest a plain jump lifts him onto a lip, flown (reference/specs/reach.md §1; score.ts REACH.single.climb) */
const HOP = 123;
const STAGES = ['1-1', '1-2', '1-3'];
const SEEDS = [1, 2];

const built = new Map<string, { st: any; jumps: JumpEdge[]; reps: ReturnType<typeof inspectJumps> }>();
function play(id: string, seed: number, setting: Setting) {
  const k = `${id} ${seed} ${setting}`;
  if (!built.has(k)) {
    setDifficulty(setting);
    const st = new RealPlay(id, seed).stage as any;
    const route = findRoute(st, [], { steps: true });
    built.set(k, { st, jumps: routeJumps(route), reps: inspectJumps(st, route, setting === 'easy', ADULT) });
  }
  return built.get(k)!;
}

const ground = (p: Platform) => p.type !== 'bouncy' && p.type !== 'moving' && p.type !== 'drift' && !p.push && !p.broken;

/** what a jump passes over that a player would stand on instead, or '' (the stage's own blocks, judged without route.ts) */
function overBlock(st: any, e: JumpEdge): string {
  const A = e.from, B = e.to;
  const lo = Math.min(e.dir === 1 ? A.x + A.width : A.x, e.dir === 1 ? B.x : B.x + B.width);
  const hi = Math.max(e.dir === 1 ? A.x + A.width : A.x, e.dir === 1 ? B.x : B.x + B.width);
  if ((e.dir === 1 ? B.x < A.x + A.width : B.x + B.width > A.x) || hi - lo <= 40) return '';
  for (const H of st.platforms as Platform[]) {
    if (H === A || H === B || !ground(H) || (st.waterY !== undefined && H.y >= st.waterY)) continue;
    if (Math.min(hi, H.x + H.width) - Math.max(lo, H.x) < 0.5 * (hi - lo)) continue;
    const top = Math.min(A.y, B.y), bottom = Math.max(A.y, B.y);
    // a body block he would come down on: above both banks, within a hop of the take-off
    if (H.type === 'solid' && H.height >= 50 && H.y < top - 10 && A.y - H.y <= HOP) return `hump ${H.id} ${Math.round(A.y - H.y)} px up`;
    // a stair: between the banks' heights, a hop or less from each
    if (H.y > top + 10 && H.y < bottom - 10 && A.y - H.y <= HOP && H.y - B.y <= HOP) return `stair ${H.id}`;
    // a shallow dip under a long jump: a short hop out (half a jump or less) beats a jump of 150 px or more
    if (H.y > bottom + 10 && H.y - B.y <= HOP / 2 && e.gap >= 150) return `dip ${H.id} ${Math.round(H.y - B.y)} px deep`;
  }
  return '';
}

test('no route jump passes over a hump, a stair or a shallow dip (1-1, 1-2, 1-3, both settings)', () => {
  const bad: string[] = [];
  for (const id of STAGES) for (const seed of SEEDS) for (const s of ['normal', 'easy'] as Setting[]) {
    const { st, jumps } = play(id, seed, s);
    for (const e of jumps) {
      const why = overBlock(st, e);
      if (why) bad.push(`${id} seed ${seed} ${s}: ${e.kind} at x ${Math.round(e.x)} gap ${Math.round(e.gap)} over ${why}`);
    }
  }
  assert.deepEqual(bad, []);
});

test("inspectJumps reads 1-2's hump as a hop of its own height, a retry, never a pit", () => {
  for (const seed of SEEDS) {
    const { st, reps } = play('1-2', seed, 'normal');
    const P = (st.platforms as Platform[]).filter(ground);
    // a hump: a body block with ground meeting both its sides, each 30 px to a hop lower than its top
    const humps = P.filter((H) => H.type === 'solid' && H.height >= 50).map((H) => {
      const left = P.find((q) => q !== H && Math.abs(q.x + q.width - H.x) <= 2 && q.y - H.y >= 30 && q.y - H.y <= HOP);
      const right = P.find((q) => q !== H && Math.abs(q.x - (H.x + H.width)) <= 2 && q.y - H.y >= 30 && q.y - H.y <= HOP);
      return left && right ? { H, rise: left.y - H.y } : null;
    }).filter((h) => !!h);
    if (seed === 1) assert.ok(humps.length >= 1, '1-2 seed 1 has its root hump (the planted case: 53 px)');
    for (const { H, rise } of humps) {
      const at = reps.filter((j) => j.x >= H.x - 2 && j.x <= H.x + H.width + 2);
      assert.ok(at.some((j) => j.gap <= 10 && Math.abs(j.rise - rise) <= 3 && j.miss === 'retry'), `seed ${seed}: the hump at x ${H.x} (${rise} px) is read as ${JSON.stringify(at.map((j) => [j.gap, j.rise, j.miss]))}`);
      assert.ok(!at.some((j) => j.miss === 'fall'), `seed ${seed}: a pit is read at the hump at x ${H.x}`);
    }
  }
});

test('the inspector builds 1-1, 1-2 and 1-3 as the game does on entry, on both settings (engine.ts:901)', () => {
  const { stages } = stageList([1], 1);
  for (const id of STAGES) {
    const entry = stages.find((s) => s.id === id);
    assert.ok(entry, `${id} is listed`);
    assert.equal(entry!.source, 'gen2', `${id} is built on gen2, as the game builds it (stageGenerator.ts builtOnGen2)`);
    for (const s of ['normal', 'easy'] as Setting[]) {
      setDifficulty(s);
      const mine = entry!.build(s === 'easy') as any;
      const game = play(id, 1, s).st;
      assert.equal(mine.gen2?.budget?.difficulty, s, `${id} ${s}: the pipeline laid this setting`);
      const sig = (st: any) => [st.platforms.length, st.enemies.length, Math.round(st.exitTotemX), Math.round(st.spawnX), st.platforms.reduce((t: number, p: Platform) => t + p.x + p.y, 0)];
      assert.deepEqual(sig(mine), sig(game), `${id} ${s}: the inspector's stage is the game's`);
    }
  }
});

test("the route is the check's own on 1-1, 1-2 and 1-3, both settings: no presumed hop (1-1's double test gap is judged on its flown arcs)", () => {
  const bad: string[] = [];
  for (const id of STAGES) for (const seed of SEEDS) for (const s of ['normal', 'easy'] as Setting[]) {
    setDifficulty(s);
    const r = findRoute(new RealPlay(id, seed).stage as any, []);
    if (r.traced === 'presumed' || r.traced === 'failed') bad.push(`${id} seed ${seed} ${s}: ${r.traced}`);
  }
  assert.deepEqual(bad, []);
});
