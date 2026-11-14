/**
 * R-165.226 (Matt's frame, POLISH-5 item 2: 1-1 layout 17, list seed 9652, Easy: a mossy boulder drawn ~100 px out over a dip past its
 * bank's lip). The gate: on every World 1 stage the game lists, every listed layout, both settings, no stone or stump is drawn more than
 * OVERHANG_MAX px past the ground it stands on, read off the stage the game plays (RealPlay) by the same cutBox the screen draws with
 * (w1CutArt.ts overhangs). The fix it holds: the lay settles each stone on its ground (the World 1 kit's settle, w1CutArt.ts settleCut).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { loadSeedList, provenSeeds } from './gen2/seedList.ts';
import { PROVEN_INDEX } from './gen2/provenIndex.ts';
import { buildGen2Stage } from './gen2/pipeline.ts';
import { w1Finish, w1World } from './gen2/worlds/w1.ts';
import { generateAllLevels } from './worldsData.ts';
import CASE_9652 from './w1Overhang.case9652.json';
import { groundRun, overhang, overhangs, OVERHANG_MAX, settleCut } from './w1CutArt.ts';

const cfg11 = generateAllLevels().find((l) => l.id === '1-1')!;

// (the case's plan as 1-1's list held it when Matt saw it, t-polish-5@471bd00: provenPlan('1-1', 9652), the stage RealPlay('1-1', 17)
//  plays (list index 16; POLISH-5 named it "list seed 9800", which is RealPlay 18), kept here so a relist never moves the planted case)
const replay = CASE_9652 as unknown as NonNullable<Parameters<typeof buildGen2Stage>[0]['replay']>;
/** World 1's kit with every section of the case's plan back in 1-1's pool, as it was when Matt saw it (POLISH-9b: POLISH-7 took
 *  w1-bank-stair-test out of 1-1 with the other double sections, CUT_11_DOUBLES, so the plan no longer replayed on today's pool: a crash,
 *  not a failure; the case is Matt's own, so it is replayed on the pool it was laid from, never re-picked) */
const kitAsSeen = () => {
  const k = w1World(), names = new Set(replay.plan.map((p) => p.template));
  return { ...k, manifest: { ...k.manifest, sections: k.manifest.sections.map((t) => (names.has(t.id) && !t.feel?.includes('1-1') ? { ...t, feel: [...(t.feel ?? []), '1-1'] } : t)) } };
};
test("Matt's case planted: 1-1 seed 9652 (layout 17) Easy laid WITHOUT the settle draws the boulder by x 20938 past its lip; with it, nothing", () => {
  const bare = kitAsSeen();
  delete bare.settle;
  const before = overhangs(w1Finish(buildGen2Stage({ config: cfg11, kit: bare, seed: 9652, difficulty: 'easy', replay })).platforms);
  const matt = before.find((o) => Math.abs(o.x - 20938) <= 40);
  assert.ok(matt, `the planted fault is not read: ${JSON.stringify(before.slice(0, 6))}`);
  assert.ok(matt.over > 60, `Matt's boulder reads only ${matt.over} px past its lip`);
  // (with the settle that plan cannot keep the boulder on its bank (its run is too short for any piece): the replay names it, and the
  //  search the list is built from re-lays that section, so the seed's listed stage draws every stone on its ground)
  const kept = buildGen2Stage({ config: cfg11, kit: kitAsSeen(), seed: 9652, difficulty: 'easy', replay });
  assert.ok(kept.gen2.errors?.some((e) => /drawn past its ground's lip/.test(e)), `the old plan is not refused: ${JSON.stringify(kept.gen2.errors)}`);
  const searched = buildGen2Stage({ config: cfg11, kit: w1World(), seed: 9652, difficulty: 'easy' });
  assert.deepEqual(searched.gen2.errors ?? [], []);
  assert.deepEqual(overhangs(w1Finish(searched).platforms), []);
});

test('settleCut: a stone at a lip moves back, a stone against a rising bank stays, one on too short a ground is named (dx NaN)', () => {
  const bank = (x: number, w: number, y: number) => ({ id: 1, x, y, width: w, height: 1000 - y, type: 'solid' as const, style: 'moss_stone' as const });
  const stone = (x: number) => ({ id: 7, x, y: 547, width: 200, height: 53, type: 'solid' as const, style: 'moss_stone' as const });
  // (a stone 10 px short of a 1,000 px bank's right lip, a drop past it)
  const s1 = stone(790);
  const g1 = [bank(0, 1000, 600)];
  const r1 = settleCut(s1, [...g1, s1])!;
  assert.ok(r1.dx < 0, `it moves back from the lip: ${JSON.stringify(r1)}`);
  const moved = { ...s1, x: s1.x + r1.dx };
  assert.ok(overhang(moved, r1.cut, groundRun(moved, [...g1, moved])!) <= OVERHANG_MAX);
  // (the same stone where a higher bank rises at that end: no lip, so no move)
  const g2 = [bank(0, 1000, 600), { ...bank(1000, 600, 450), id: 2 }];
  assert.equal(settleCut(s1, [...g2, s1])!.dx, 0);
  // (a stone on a 220 px step between two drops: no piece of World 1 is that narrow)
  const g3 = [bank(700, 220, 600)];
  const s3 = { ...stone(710) };
  assert.ok(Number.isNaN(settleCut(s3, [...g3, s3])!.dx));
});

const W1 = Object.keys(PROVEN_INDEX).filter((id) => id.startsWith('1-'));
for (const id of W1) {
  test(`${id}: every listed layout, both settings: no stone or stump drawn more than ${OVERHANG_MAX} px past its ground`, async () => {
    assert.ok(await loadSeedList(id));
    const n = provenSeeds(id).length;
    const bad: string[] = [];
    for (const setting of ['normal', 'easy'] as const) {
      setDifficulty(setting);
      for (let v = 0; v < n; v++) for (const o of overhangs(new RealPlay(id, v).stage.platforms as never)) bad.push(`${setting} layout ${v}: ${o.cut} at x ${o.x}, ${o.over} px past`);
    }
    setDifficulty('normal');
    assert.deepEqual(bad.slice(0, 12), [], `${bad.length} stones past their ground on ${id}`);
  });
}
