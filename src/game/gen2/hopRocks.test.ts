/**
 * R-165.122 (ENGINE-AUDIT-B B-04, B-05): 1-1's hop rocks. A rock under the engine's wall (physics.ts WALL_H, 50 px) was walked straight
 * through (about 13 a stage, 27% of the 'h' beats), and an `on` piece pushed no ask, so the verdicts never judged a hop (Easy laid 76-80 px
 * stumps over its 63 px band in the first lesson). pipeline.ts hopLay lays every hop rock (an `on` block he lands on; a perch, a post, a
 * mushroom and the hollow log are not hop rocks) at WALL_H or taller, finds where he really climbs it from (the highest lower surface a
 * single reaches the face from, the floor included; none when he comes to it level or from above), keeps that climb in the setting's
 * single band (a rock whose range starts in the double teach's band is a double obstacle, judged as one), and pushes the ask the verdicts
 * judge. Planted: the toy rocks below are laid and asked otherwise without hopLay; the listed seeds and the real engine prove the rest.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { RealPlay } from '../realPlay.ts';
import { setDifficulty } from '../difficulty.ts';
import { withPlaySeed } from '../testlink1_1.ts';
import { WALL_H } from '../physics.ts';
import { generateAllLevels } from '../worldsData.ts';
import { layLocal, layStage, missionGraph, planBudget, rngFor, stagePool, type Laid } from './pipeline.ts';
import { provenPlan, provenSeeds } from './seedList.ts';
import { BANDS } from './reach.ts';
import { w1World } from './worlds/w1.ts';
import type { SectionPiece, SectionTemplate } from './types.ts';
import type { Difficulty } from '../difficulty.ts';

const cfg11 = () => ({ ...generateAllLevels().find((l) => l.id === '1-1')!, unlocked: true });
const M = w1World().manifest;
const hi = (s: Difficulty) => (BANDS['single-rise'][s] as { hi: number }).hi;

// ───────────────────────── the rule on toy sections (planted: each is laid otherwise without hopLay) ─────────────────────────
const floor: SectionPiece = { key: 'f', shape: 'bank', w: [900, 900], place: { kind: 'start' }, main: true, landing: true };
const stumpOn = (key: string, at: number, h: [number, number], w: [number, number] = [150, 150]): SectionPiece => ({ key, shape: 'block', w, place: { kind: 'on', on: 'f', at: [at, at], h }, landing: true });
const toy = (pieces: SectionPiece[]): SectionTemplate => ({ id: 'toy-hops', name: 'toy', archetypes: 'any', phases: ['ki'], difficulty: 1, pieces: [floor, ...pieces], entry: { piece: 'f', kind: 'ground' }, exit: { piece: 'f', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: false });
const lay = (pieces: SectionPiece[], s: Difficulty) => {
  const L = layLocal(toy(pieces), planBudget(cfg11(), M, s), rngFor(7, 1));
  const f = L.pieces.find((p) => p.key === 'f')!;
  return { L, f, at: (k: string) => L.pieces.find((p) => p.key === k)!, ask: (k: string) => L.asks?.find((a) => a.key === k) };
};

for (const s of ['normal', 'easy'] as const) {
  test(`toy, ${s}: a 34-46 px rock is laid a wall (50-56 px), and its hop from the floor is asked`, () => {
    const t = lay([stumpOn('r', 0.4, [34, 46])], s);
    const r = t.at('r');
    assert.ok(r.h >= WALL_H && r.h <= WALL_H + 6, `the rock is ${r.h} px`);
    const a = t.ask('r');
    assert.ok(a, 'the hop is asked');
    assert.equal(a.move, 'single');
    assert.equal(R(a.yTake - a.yLand), R(r.h), 'from the floor, its own height');
  });
  test(`toy, ${s}: a 76-80 px stump alone on the floor is kept in the single band (${hi(s)} px)`, () => {
    const t = lay([stumpOn('s', 0.4, [76, 80])], s);
    const a = t.ask('s')!;
    assert.ok(a.yTake - a.yLand <= hi(s) + 0.5, `${a.yTake - a.yLand} px`);
    assert.ok(t.at('s').h <= hi(s) + 0.5);
  });
  test(`toy, ${s}: a stair's step is climbed from the step before it, not the floor`, () => {
    const t = lay([stumpOn('a', 0.1, [50, 56], [160, 160]), stumpOn('b', 0.3, [76, 80], [160, 160])], s);
    const a = t.at('a'), b = t.at('b'), ask = t.ask('b')!;
    assert.equal(ask.yTake, a.y, 'its take-off is the step before');
    assert.ok(b.h >= 76 - 0.5 || s === 'easy', `Normal keeps the step: ${b.h}`);
    assert.ok(ask.yTake - ask.yLand <= hi(s) + 0.5);
  });
  test(`toy, ${s}: a fallen trunk (137-140) is a double obstacle, judged as a double; a perch stump and a post are no hop rocks`, () => {
    const t = lay([
      stumpOn('T', 0.3, [137, 140], [240, 240]),
      stumpOn('p', 0.7, [40, 46], [180, 180]), { key: 'm', shape: 'bouncy', w: [70, 70], place: { kind: 'on', on: 'p', at: [0.5, 0.5], h: [30, 30] } },
      { key: 'post', shape: 'block', w: [50, 50], place: { kind: 'on', on: 'f', at: [0.9, 0.9], h: [46, 50] }, style: 'moss_stone' },
    ], s);
    assert.equal(t.ask('T')?.move, 'double');
    assert.ok(t.at('T').h >= (s === 'easy' ? 128 : 137) - 0.5, `the trunk ${t.at('T').h}`);
    assert.ok(t.at('p').h < WALL_H, 'the perch keeps the Designer\'s FR9b exception (under 50)');
    assert.equal(t.ask('p'), undefined);
    assert.ok(t.at('post').h < WALL_H, 'a post under a log is not a landing');
    assert.equal(t.ask('post'), undefined);
  });
}
const R = Math.round;

// ───────────────────────── every listed seed, both settings ─────────────────────────
function relay(seed: number, setting: Difficulty): { laid: Laid; byId: Map<string, SectionTemplate> } {
  const kit0 = w1World();
  const kit = { ...kit0, manifest: { ...kit0.manifest, sections: stagePool(kit0.manifest, '1-1') } };
  const budget = planBudget(cfg11(), kit.manifest, setting);
  const r = provenPlan('1-1', seed)!;
  return { laid: layStage(budget, missionGraph(budget, kit.manifest, seed), kit, r.seed, { plan: r.plan }), byId: new Map(kit.manifest.sections.map((t) => [t.id, t])) };
}
function hopRocks(seed: number, setting: Difficulty) {
  const { laid, byId } = relay(seed, setting);
  const out: Array<{ uid: string; template: string; key: string; h: number; asked: boolean; rise?: number; move?: string }> = [];
  laid.sections.forEach((sec, si) => {
    const t = byId.get(sec.template)!;
    const vs = laid.plan[si].versions ?? {};
    const all = [...t.pieces, ...(t.subBlocks ?? []).flatMap((sb) => sb.versions.filter((v) => v.id === vs[sb.id]).flatMap((v) => v.pieces))];
    for (const q of sec.pieces) {
      const spec = all.find((p) => p.key === q.key);
      if (!spec || spec.place.kind !== 'on' || spec.shape !== 'block' || !spec.landing) continue;
      if (all.some((m) => m.shape === 'bouncy' && m.place.kind === 'on' && m.place.on === spec.key)) continue;
      const a = laid.asks.find((k) => k.section === sec.uid && k.key === q.key);
      out.push({ uid: sec.uid, template: sec.template, key: q.key, h: q.platform.height, asked: !!a, ...(a ? { rise: a.yTake - a.yLand, move: a.move } : {}) });
    }
  });
  return out;
}

for (const setting of ['normal', 'easy'] as const) {
  test(`every hop rock on every listed 1-1 seed is a wall, and every climbed one is asked inside the band (${setting})`, () => {
    const low: string[] = [], over: string[] = [];
    let rocks = 0, asked = 0;
    for (const seed of provenSeeds('1-1')) for (const h of hopRocks(seed, setting)) {
      rocks++;
      if (h.h < WALL_H) low.push(`seed ${seed} ${h.template}/${h.key}: ${h.h} px`);
      if (!h.asked) continue;
      asked++;
      if (h.move === 'single' && h.rise! > hi(setting) + 0.5) over.push(`seed ${seed} ${h.template}/${h.key}: ${R(h.rise!)} px`);
    }
    assert.deepEqual(low.slice(0, 5), [], `${low.length} of ${rocks} hop rocks under ${WALL_H} px`);
    assert.deepEqual(over.slice(0, 5), [], `${over.length} hops over the single band`);
    assert.ok(asked > rocks * 0.8, `${asked} of ${rocks} hop rocks asked (the rest are come to level or from above)`);
  });
}

test('the real engine: every hop rock with floor either side stops a plain walk (the first 3 listed seeds, both settings)', () => {
  const through: string[] = [];
  let walls = 0;
  for (const setting of ['normal', 'easy'] as const) for (const seed of provenSeeds('1-1').slice(0, 3)) {
    setDifficulty(setting);
    const r = withPlaySeed(seed, () => new RealPlay('1-1', 1));
    const P = r.platforms.filter((p) => p.type === 'solid');
    const perchIds = new Set(P.filter((p) => r.platforms.some((m) => m.type === 'bouncy' && Math.abs(m.y + m.height - p.y) <= 1 && m.x >= p.x - 2 && m.x + m.width <= p.x + p.width + 2)).map((p) => p.id));
    for (const k of P) {
      if (perchIds.has(k.id) || k.width > 240 || k.height < 20 || k.height > 90) continue;
      const fl = P.find((f) => f !== k && Math.abs(f.y - (k.y + k.height)) <= 1 && f.x <= k.x - 60 && f.x + f.width >= k.x + k.width + 60);
      if (!fl) continue;
      walls++;
      r.stand(k.x - 58, fl.y);
      let passed = false;
      for (let i = 0; i < 70 && !passed; i++) { r.frame({ right: true }); passed = r.p.x > k.x + k.width + 20; }
      if (passed) through.push(`${setting} seed ${seed} x ${k.x}: ${k.height} px`);
    }
    (r.e as unknown as { stop(): void }).stop();
  }
  setDifficulty('normal');
  assert.ok(walls > 30, `${walls} rocks walked at`);
  assert.deepEqual(through, [], `${through.length} of ${walls} rocks walked straight through`);
});
