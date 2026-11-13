/**
 * R-165.163 (1-1's stage build 3x over its 150 ms budget, buildcheck): the landing judge (landings.ts) flies each flight once a stage.
 *   - One Landings per piece set (landingsOf): a build's repair and its verdicts judge the same pieces, kept only while they are the same
 *     objects, in the same order, with every field the judge reads unchanged; a piece moved, broken or taken out is judged afresh.
 *   - A landing asks only for the flights whose events on it can meet a ledge's take-off span (Landings.windowOnto, mayWalkOnto): every
 *     answer is the one the full flights give, proven here against the judge written out with no skip, on 1-1's real built stages.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from '../worldsData.ts';
import { w1World } from './worlds/w1.ts';
import { buildPlayStage, loadSeedList, provenSeeds } from './seedList.ts';
import { cleanWay, deadZones, JUMP_WINDOW, LAND_IN, Landings, landingsOf, MANTLE, type CleanWay, type LandPickup, type LandPiece } from './landings.ts';

const S = (x: number, y: number, width: number, height = 24): LandPiece => ({ x, y, width, height, type: 'solid' });
const petal = (x: number, y: number): LandPickup => ({ x, y: y - 34, type: 'flower' });

for (const s of ['normal', 'easy'] as const) {
  test(`${s}: the same pieces are flown once; a piece moved, broken or taken out after a judge is judged afresh`, () => {
    // (landings.test.ts's toy: a log the walk-off reaches; moved in place to 72 px under the ledge with a log over the gap, it is a dead zone)
    const ledge = S(0, 900, 1000, 300), far = S(1600, 900, 600, 300), over = S(1000, 830, 400), log = S(1040, 972, 140);
    const ps = [ledge, far, over, log], pk = [petal(1120, 972)];
    assert.deepEqual(deadZones(ps, pk, s), []);
    assert.equal(cleanWay(log, ps, s)?.how, 'walk-off');
    assert.equal(landingsOf(ps, s), landingsOf([...ps], s), 'the same pieces in the same order: one Landings');
    assert.notEqual(landingsOf(ps, s), landingsOf(ps, s === 'normal' ? 'easy' : 'normal'), 'another setting: its own');
    log.x = 1080;
    log.width = 90;
    assert.deepEqual(deadZones(ps, pk, s), [log], 'moved in place: judged afresh');
    log.x = 1040;
    log.width = 140;
    assert.deepEqual(deadZones(ps, pk, s), []);
    ledge.broken = true;
    assert.notEqual(cleanWay(log, ps, s)?.how, 'walk-off', 'the ledge broken in place: judged afresh');
    ledge.broken = false;
    assert.notEqual(landingsOf(ps, s), landingsOf([ledge, far, log], s), 'a piece taken out: not the kept set');
    // (the ledge under the walk-off taken out: nothing walks onto the log any more)
    assert.notEqual(cleanWay(log, [far, over, log], s)?.how, 'walk-off');
  });
}

/** the judge written out with no skip and nothing kept between landings: every ledge's walks and every flight's windows, as before R-165.163 */
function fullWay(L: Landings, T: LandPiece): CleanWay | null {
  const near = L.near(T.x, T.x + T.width);
  const standable = (p: LandPiece) => !p.broken && p.type !== 'bouncy';
  for (const S of near) {
    if (S === T || !standable(S)) continue;
    const touch = S.x <= T.x + T.width + 2 && S.x + S.width >= T.x - 2;
    if (touch && S.y - T.y >= -2 && S.y - T.y <= MANTLE.px) return { how: 'walked-on', from: S };
  }
  for (const S of near) {
    if (S === T || !standable(S)) continue;
    for (const w of L.walk(S)) if (w.piece === T && w.mid >= T.x + LAND_IN.px && w.mid <= T.x + T.width - LAND_IN.px) return { how: 'walk-off', from: S };
  }
  for (const S of near) {
    if (S === T || S.broken) continue;
    const w = L.windows(S).get(T) ?? 0;
    if (w >= JUMP_WINDOW.px) return { how: S.type === 'bouncy' ? 'bounce' : 'jump', from: S, window: Math.round(w) };
  }
  return null;
}

test("1-1's built stages (3 proven seeds, both settings): every piece's clean way is the full flights' answer", async () => {
  assert.ok(await loadSeedList('1-1'));
  const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
  const seeds = provenSeeds('1-1');
  let judged = 0, jumps = 0;
  for (const seed of [seeds[0], seeds[Math.floor(seeds.length / 2)], seeds[seeds.length - 1]]) for (const s of ['normal', 'easy'] as const) {
    const ps = buildPlayStage(cfg, w1World(), seed, s).platforms.map((p) => ({ ...p })) as LandPiece[];
    const full = new Landings(ps, s), lazy = new Landings(ps, s);
    for (const T of ps) {
      const want = fullWay(full, T), got = lazy.cleanWay(T);
      assert.deepEqual(got, want, `seed ${seed} ${s}: the piece at x ${T.x}, top ${T.y}`);
      judged++;
      if (want?.how === 'jump' || want?.how === 'bounce') jumps++;
    }
  }
  assert.ok(jumps > 50, `the jumps judged (${jumps} of ${judged}) prove the skip`);
});
