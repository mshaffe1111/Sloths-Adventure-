/**
 * 2-6's ARC TEST (BUILD-26: the listed row; first ENG-26c's readiness check on the draft, level.md rule 23, D101): the design's own node string (2-6.md:43) laid by gen2 on a DRAFT row (w2Arc26.ts:
 * not listed, not shipped), rolled the way a listed row is rolled (listed.ts withTestStage, World 2's finish), seeds 1-12 on both settings,
 * every designed object COUNTED per beat: each wheel with its jetty, street, pond and buckets (both ways round), the millrace's logs, the
 * bounce, the house's ladder, the crest. RED on the base 0eefc707e: 24 of 24 rolls threw at the millrace (G2), and every roll's four wheel
 * nodes failed their 'p' ask (G1).
 */
import '../../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from '../../worldsData.ts';
import { onRiver, type RiverZone } from '../../river.ts';
import type { Platform, Vine } from '../../types.ts';
import type { TempoSpec } from '../../tempo.ts';
import { WHEEL, type Wheel } from '../../wheel.ts';
import { listedStage, playFinish } from '../listed.ts';
import { buildGen2Stage } from '../pipeline.ts';
import { riverFaults } from '../riverLay.ts';
import { W2_WHEELS } from './w2.ts';
import { BEATS_26, CLUE_26, JOURNAL_26, LINES_26, MISSION_26, NORIA_PAGE_26, SIGN_26, STAGE_26 } from './w2Arc26.ts';

const cfg = generateAllLevels().find((c) => c.id === STAGE_26 && !c.secret)!;
type Rolled = { platforms: Platform[]; vines: Vine[]; rivers?: RiverZone[]; exitTotemX: number; gen2: { errors?: string[]; sections: Array<{ template: string }>; brief?: { tempo?: TempoSpec } } };
const SEEDS = Array.from({ length: 12 }, (_, i) => i + 1);
const BOTH = ['normal', 'easy'] as const;

/** every roll, as Play finishes the listed row (its kit 'w2-26', World 2's finish, 2-6's own) */
const row = listedStage(STAGE_26)!;
const rolls = BOTH.flatMap((d) => SEEDS.map((seed) => ({ d, seed, st: playFinish(row, buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d }) as never, d) as unknown as Rolled })));

/** the beats in order (the arc's node string), by the draft's brick names */
const ORDER = ['millpond', 'first-wheel', 'first-street', 'through-house', 'millrace', 'edge-wheel', 'rest', 'porches', 'top-wheel', 'rest', 'wheel-bounce', 'rest', 'great-wheel', 'crest'];
/** the wheels he meets going up, by row: beat 1 the teach, 5 the edge, 8 the jump off the top, 10 the wheel before the bounce, 12 the great wheel */
const WHEELS = ['teach', 'edge', 'top', 'edge', 'great'] as const;

test("2-6's draft row lays its node string beat for beat on every roll, both settings, with no error", () => {
  assert.equal(ORDER.length, 14);
  assert.ok(BEATS_26.length >= 11);
  for (const { d, seed, st } of rolls) {
    assert.deepEqual(st.gen2.errors ?? [], [], `${d} ${seed}`);
    assert.deepEqual(st.gen2.sections.map((s) => s.template.replace('w2-26-', '')), ORDER, `${d} ${seed}`);
  }
});

test('every wheel the design names lays with its jetty, its street, its pond and its buckets, and wheels turn both ways round', () => {
  let right = 0, left = 0;
  for (const { d, seed, st } of rolls) {
    const at = `${d} ${seed}`;
    const wheels = [...new Set(st.platforms.flatMap((p) => (p.wheel ? [p.wheel.w as Wheel] : [])))].sort((a, b) => b.cy - a.cy);
    assert.deepEqual(wheels.map((w) => w.lay?.row), [...WHEELS], `${at}: the wheels in the order he meets them`);
    for (const w of wheels) {
      const row = W2_WHEELS[w.lay!.row as keyof typeof W2_WHEELS];
      assert.equal(w.R, row.R, `${at} ${w.lay!.row}: its rim`);
      assert.equal(w.V, d === 'easy' ? row.easyV : row.V, `${at} ${w.lay!.row}: its speed`);
      assert.equal(st.platforms.filter((p) => p.wheel?.w === w).length, row.N, `${at} ${w.lay!.row}: its buckets`);
      assert.ok(st.platforms.some((p) => p.id === w.lay!.jetty && p.type === 'solid'), `${at} ${w.lay!.row}: its jetty`);
      assert.ok(st.platforms.some((p) => p.id === w.lay!.streetId && p.type === 'solid'), `${at} ${w.lay!.row}: its street`);
      assert.equal((st.rivers ?? []).filter((r) => r.wheelPond && r.x0 <= w.cx && r.x1 >= w.cx && Math.abs(r.surfaceY - (w.cy + w.R + WHEEL.pond)) <= 1).length, 1, `${at} ${w.lay!.row}: its pond under the sweep`);
      if (w.way > 0) right++; else left++;
    }
  }
  // (the rightward lay on a rolled graph, which ENG-26 proved on the engine only: beats 5, 8 and 10 on this draft, every roll)
  assert.ok(right >= rolls.length && left >= rolls.length, `right ${right}, left ${left} over ${rolls.length} rolls`);
});

test("beat 4's millrace lays 2-1's ride logs (soft), crossed either way, fair; beat 10 its bounce; the crest its totem", () => {
  for (const { d, seed, st } of rolls) {
    const at = `${d} ${seed}`;
    const rivers = (st.rivers ?? []).filter((r) => !r.wheelPond);
    assert.equal(rivers.length, 1, `${at}: one millrace`);
    const r = rivers[0];
    assert.ok(r.safe, `${at}: the millrace is soft (:#soft): a splash back`);
    // (the draft always crossed it right to left (G2's proof); the real bricks lay it either way round by the storey it falls on)
    assert.ok(r.way === -1 || r.way === 1 || r.way === undefined, `${at}: crossed one way`);
    assert.ok(st.platforms.filter((p) => p.type === 'drift' && p.drift && onRiver(p.drift, r)).length >= 2, `${at}: its logs`);
    assert.deepEqual(riverFaults(st), [], at);
    assert.equal(st.platforms.filter((p) => p.type === 'bouncy').length, 1, `${at}: the bounce`);
    assert.ok(Number.isFinite(st.exitTotemX), `${at}: the crest's totem`);
  }
});

// (moved from w2Stages.test.ts when the hand build was deleted, BUILD-26: the village's look, its assertions kept on the listed stage; its
//  hearts are the live rule's, laid as the stage is played, so they are counted on the played stage)
test('2-6: the climb up the bank village, with the bank behind it, doors on the porches and Gruntlewick at the top', async () => {
  const { RealPlay } = await import('../../realPlay.ts');
  for (const seed of SEEDS.slice(0, 8)) {
    const st = playFinish(row, buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: 'normal' }) as never, 'normal') as unknown as Rolled & { proto: { bankWall?: object; ladders?: boolean; decor?: Array<{ n?: string; cel?: string; text?: string[] }>; hollows?: unknown[] } };
    assert.ok(st.proto.bankWall, `seed ${seed}`);
    assert.ok(st.proto.decor!.filter((d) => d.n === 'doorRoof').length >= 5, `seed ${seed}: doors`);
    assert.ok(st.proto.ladders, 'the climbs are ladders');
    assert.ok(st.proto.decor!.some((d) => d.cel?.startsWith('tc.')), `seed ${seed}: Gruntlewick`);
    assert.ok(st.vines.some((v) => v.vineType === 'tree_climb'));
    assert.deepEqual(st.proto.decor!.find((d) => d.n === 'sign')?.text, [...SIGN_26], `seed ${seed}: the top house's sign`);
    assert.equal(st.proto.hollows?.length ?? 0, 0, 'the lit window stands in for the hollow');
    // (hearts, the lead's ruling (BUILD-26b; level.md rule 3 over the design's "heart after beat 10"): Normal lays a heart only where a
    // heart can be lost (stageGenerator.ts `risky`, Matt 11-05 "a heart only after real risk"). Nothing on Normal 2-6 costs one: no
    // creature, no deadly water, every pond and fall soft; so it lays none, and one that could never be needed would be filler)
    const r = new RealPlay(STAGE_26, seed);
    // (BUILD-26c, the lead's ruling: every way a heart is lost is counted, so 0 is the rule's answer, not a loose one: a river without
    // `safe` costs a life (engine.ts loseLife('water')), as a gen2 pit that is not soft does; 2-6's six rivers are all safe)
    const played = r.stage as typeof r.stage & { heartFalls?: Array<{ soft?: boolean }>; proto?: { water?: Array<{ kind?: string }> }; gen2?: { budget?: { pit?: string } } };
    const costs = played.enemies.length + (played.waterY !== undefined ? 1 : 0) + (played.heartFalls ?? []).filter((z) => !z.soft).length + (played.proto?.water ?? []).filter((z) => z.kind === 'deadly').length
      + (played.rivers ?? []).filter((v) => !v.safe).length + ((played.gen2?.budget?.pit ?? 'soft') !== 'soft' ? 1 : 0);
    assert.equal(costs, 0, `seed ${seed}: nothing on Normal 2-6 costs a heart`);
    assert.equal(played.collectibles.filter((c) => c.type === 'heart').length, 0, `seed ${seed}: so Normal lays no heart`);
  }
});

test("2-6's words are the story keeper's, verbatim (reference/story/lines-2-6.md, KEEPER-26 @19f90520b)", async () => {
  const fs = await import('node:fs');
  const md = fs.readFileSync(new URL('../../../../reference/story/lines-2-6.md', import.meta.url), 'utf8');
  for (const line of [...Object.values(LINES_26), MISSION_26, NORIA_PAGE_26, JOURNAL_26, CLUE_26.text]) assert.ok(md.includes(line), line);
  assert.ok(md.includes(CLUE_26.title));
});
