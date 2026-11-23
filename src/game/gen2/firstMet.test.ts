// The order he MEETS things (ENG-HUD27b, R-165.414, D130). Three engine rules took a stage's first or last thing by x order and broke
// on 2-7's stacked out-and-back, where the way home is laid UNDER the way out at the same x: w2.ts's finish, Easy's flag fill and the
// verdict 'drop.unwarned' (verdicts.ts dropVerdicts: Dot's line is owed at the stage's FIRST painted water). ONE helper, gen2/tower.ts
// alongOf / firstMet / lastMet / inMetOrder: along the laid route on a stage with one (routeAt, the order flagFurther takes flags in),
// x order on every other stage, exactly as the old picks.
// Proven on the out-and-back toy (gen2/toyHome.ts, both codes): the first water by x is the way home's LAST river, so the verdict asked
// Dot's line of the wrong river (RED on the x pick: "the first water at x 1231..1927 has no Dot line"); now it asks it of the first
// river he meets, on the way out, and a judged stage (judgeRoll, the path pipeline applyVerdicts takes) reads the built stage's route.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { homeKit, HOME_CODE, POST_CODE } from './toyHome.ts';
import { alongOf, firstMet, inMetOrder, lastMet, routeAt, type Route } from './tower.ts';
import { dropVerdicts, judgeRoll, type Judged11 } from './verdicts.ts';
import type { Drop } from './verdicts.types.ts';
import { homeCfg, HOME_ID } from '../../../tools/inspect/homeToys.ts';

const isWater = (d: Drop): boolean => d.ends.kind === 'life' && d.look === 'water-art';
const DOT = { dotLine: 'Water ahead!', leadPx: 300, sign: true as const };
/** the stage's drops with Dot's line on the waters `warned` says, and none on the rest */
const warnOnly = (drops: readonly Drop[], warned: (d: Drop) => boolean): Drop[] =>
  drops.map((d) => (isWater(d) ? ({ ...d, warn: warned(d) ? DOT : { ...DOT, dotLine: '' } } as Drop) : d));

const toys = () => {
  const out: { at: string; st: ReturnType<typeof buildGen2Stage> }[] = [];
  for (const [name, code] of [['home', HOME_CODE], ['post', POST_CODE]] as const) {
    for (let seed = 1; seed <= 4; seed++) {
      const st = buildGen2Stage({ config: homeCfg, kit: homeKit(HOME_ID, code), seed, difficulty: 'normal' });
      if (!st.gen2.errors.length) out.push({ at: `${name} seed ${seed}`, st });
    }
  }
  return out;
};

test("the first water is the first river he MEETS on a stacked out-and-back (the way out's), not the least x (the way home's last): Dot's line is asked of it, and a judged stage reads its built stage's route; RED on the x pick", () => {
  const laid = toys();
  assert.ok(laid.length >= 6, `the toy lays on most rolls (${laid.length} of 8)`);
  for (const { at, st } of laid) {
    const route = (st as { gen2: { tower?: { route?: Route } } }).gen2.tower!.route!;
    const waters = (st.gen2.drops ?? []).filter(isWater);
    // (the first met, by the route measure the engine already takes flags by: a drop is met at the lip he reaches first)
    const met = (d: Drop) => Math.min(routeAt(route, d.x0, d.lipY), routeAt(route, d.x1, d.lipY));
    const first = waters.reduce((a, b) => (met(b) < met(a) ? b : a));
    const leastX = waters.reduce((a, b) => (b.x0 < a.x0 ? b : a));
    assert.notEqual(first, leastX, `${at}: the toy is the trap (the least x is not the first met)`);
    // (Dot's line on the first river he meets only: nothing is unwarned)
    const right = dropVerdicts({ setting: 'normal', policy: 'per-gap', drops: warnOnly(st.gen2.drops ?? [], (d) => d === first) }, st);
    assert.deepEqual(right.filter((v) => v.name === 'drop.unwarned').map((v) => v.line), [], `${at}: Dot's line on the way out's first river is the warning owed`);
    // (and none on it, every other river warned: that river, and only it, is unwarned)
    const wrong = dropVerdicts({ setting: 'normal', policy: 'per-gap', drops: warnOnly(st.gen2.drops ?? [], (d) => d !== first) }, st).filter((v) => v.name === 'drop.unwarned');
    assert.deepEqual(wrong.map((v) => v.at), [{ x0: Math.round(first.x0), x1: Math.round(first.x1) }], `${at}: the first river met, unwarned, is the one named`);
    // (the path a judged stage takes: pipeline applyVerdicts -> judgeRoll(judged11(st)), which hands over the built stage)
    const judged = { stageId: HOME_ID, setting: 'normal', policy: 'per-gap', drops: warnOnly(st.gen2.drops ?? [], (d) => d === first), asks: [], routeGaps: [], built: st } as unknown as Judged11;
    const v = judgeRoll(judged, []);
    assert.deepEqual(v.accepted ? [] : v.failed.filter((f) => f.name === 'drop.unwarned').map((f) => f.line), [], `${at}: judgeRoll reads the built stage's route`);
  }
});

test('a stage with no route reads x order exactly as before: firstMet / lastMet / inMetOrder are the x sort\'s [0] / at(-1) / order (ties kept), and the first water is the least x0', () => {
  const run = { gen2: { tower: undefined } };
  let r = 7;
  const rnd = () => ((r = (r * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let k = 0; k < 200; k++) {
    const items = Array.from({ length: 1 + Math.floor(rnd() * 9) }, (_, i) => ({ i, x: Math.floor(rnd() * 6) * 100, y: Math.floor(rnd() * 900) }));
    const byX = [...items].sort((a, b) => a.x - b.x);
    for (const stage of [{}, run]) {
      assert.equal(firstMet(stage, items, (t) => t), byX[0]);
      assert.equal(lastMet(stage, items, (t) => t), byX.at(-1));
      assert.deepEqual(inMetOrder(stage, items, (t) => t), byX);
      assert.equal(alongOf(stage)(items[0].x, items[0].y), items[0].x);
    }
  }
  assert.equal(firstMet({}, [], (t: { x: number; y: number }) => t), undefined);
  // (the verdict with no laid stage, or one with no route: the least x0, the way 1-1 to 2-5 have always been judged)
  const water = (x0: number, dot: boolean): Drop => ({ x0, x1: x0 + 300, lipY: 500, ends: { kind: 'life', cause: 'water' }, look: 'water-art', warn: { ...DOT, dotLine: dot ? DOT.dotLine : '' } } as unknown as Drop);
  const drops = [water(3000, true), water(1000, false), water(2000, true)];
  for (const laid of [undefined, {}, run]) {
    const v = dropVerdicts({ setting: 'normal', policy: 'per-gap', drops }, laid).filter((d) => d.name === 'drop.unwarned');
    assert.deepEqual(v.map((d) => d.at.x0), [1000], 'the least x0 is the first water on a stage with no route');
  }
});
