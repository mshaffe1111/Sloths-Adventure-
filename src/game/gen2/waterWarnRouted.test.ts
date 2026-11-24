// Dot's water warning on a stacked out-and-back (ENG-HUD27b, the fourth site of D130, R-165.414; found by BUILD-27d on 2-7). The lay
// (pipeline.ts fillSockets, WATER_WARN) warned on Normal at the first water BY X, and placed every warning WATER_WARN.lead px left of a
// river's x0, so on 2-7 (the way home laid under the way out, running left) Normal's one line went to the way home's LAST river and was
// clamped to the spawn, and Easy's home-leg lines all stood at the spawn: Dot warned at the wrong river, and the first river he meets
// had no line ('drop.unwarned (normal): the first water at x 12948..13508 has no Dot line', every 2-7 roll). Now the lay takes the
// rivers in the order he MEETS them (gen2/tower.ts) and lays each line before the lip he reaches first, in either direction, and the
// drop record (dropsOf) matches it the same way.
// Proven on the out-and-back toy, both codes, seeds 1-4: Normal's single line lies before the first wet gap he meets, and that gap
// is warned; on Easy every line lies before its own river's near lip along the route. RED on the x lay. On the real 2-7 (rolls 1-12,
// judged flipped) no roll is drop.unwarned: reference/qa-reports/ENG-HUD27/REPORT.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { homeKit, HOME_CODE, POST_CODE } from './toyHome.ts';
import { routeAt, type Route } from './tower.ts';
import { WATER_WARN } from './types.ts';
import type { Drop } from './verdicts.types.ts';
import { homeCfg, HOME_ID } from '../../../tools/inspect/homeToys.ts';

const isWater = (d: Drop): boolean => d.ends.kind === 'life' && d.look === 'water-art';
type Hint = { x: number; text: string; beforeX?: number; band?: readonly [number, number] };

function laidToys(difficulty: 'normal' | 'easy') {
  const out: { at: string; st: ReturnType<typeof buildGen2Stage> }[] = [];
  for (const [name, code] of [['home', HOME_CODE], ['post', POST_CODE]] as const) {
    for (let seed = 1; seed <= 4; seed++) {
      const st = buildGen2Stage({ config: homeCfg, kit: homeKit(HOME_ID, code), seed, difficulty });
      if (!st.gen2.errors.length) out.push({ at: `${name} seed ${seed} ${difficulty}`, st });
    }
  }
  assert.ok(out.length >= 6, `the toy lays on most rolls (${out.length} of 8)`);
  return out;
}

/** the water lines laid, each with the route px where it starts to be said (the start of its window: beforeX on a leftward one) */
function waterLines(st: ReturnType<typeof buildGen2Stage>, route: Route) {
  const hints = ((st as { proto?: { hints?: readonly Hint[] } }).proto?.hints ?? []) as readonly Hint[];
  const fills = st.gen2.fills.filter((f) => f.what === 'water' && f.role === 'tip');
  return hints.filter((h) => fills.some((f) => f.x === h.x)).map((h) => ({ h, s: (y: number) => routeAt(route, h.beforeX ?? h.x, y) }));
}

/** where along the route he meets a drop: the lip he reaches first */
const metAt = (route: Route, d: Drop) => Math.min(routeAt(route, d.x0, d.lipY), routeAt(route, d.x1, d.lipY));

test("Normal's one water line on a stacked out-and-back is laid before the first WET GAP he meets, and that gap's drop is warned (the toy, both codes); RED on the x lay", () => {
  for (const { at, st } of laidToys('normal')) {
    const route = (st as { gen2: { tower?: { route?: Route } } }).gen2.tower!.route!;
    // (the gaps the lay warns: falls into water (kind 'water', 20 px or more). A river crossing he rides is not one of them: on this toy
    // the first water he meets is the way out's river, a ride; see the REPORT, the lead's call)
    const wet = (st.gen2.falls ?? []).filter((f) => f.kind === 'water' && f.x1 - f.x0 >= 20);
    const drops = (st.gen2.drops ?? []).filter(isWater);
    const firstWet = wet.map((f) => drops.find((d) => Math.abs(d.x0 - f.x0) <= 1 && Math.abs(d.x1 - f.x1) <= 1)!).filter(Boolean)
      .reduce((a, b) => (metAt(route, b) < metAt(route, a) ? b : a));
    const lines = waterLines(st, route);
    assert.equal(lines.length, 1, `${at}: Normal says the water line once`);
    const s = lines[0].s(firstWet.lipY), m = metAt(route, firstWet);
    assert.ok(s <= m && s >= m - 2 * WATER_WARN.lead, `${at}: the line starts ${Math.round(m - s)} px of route before the first wet gap he meets (x ${Math.round(firstWet.x0)}..${Math.round(firstWet.x1)}), within ${2 * WATER_WARN.lead}`);
    assert.ok((firstWet as { warn?: { dotLine?: string } }).warn?.dotLine, `${at}: the first wet gap he meets (x ${Math.round(firstWet.x0)}..${Math.round(firstWet.x1)}) is warned`);
  }
});

test("Easy's water lines on a stacked out-and-back each start before their own river's near lip along the route, way out and way home, and each is matched to its river (the toy, both codes); RED on the x lay", () => {
  for (const { at, st } of laidToys('easy')) {
    const route = (st as { gen2: { tower?: { route?: Route } } }).gen2.tower!.route!;
    const warned = (st.gen2.drops ?? []).filter((d) => isWater(d) && (d as { warn?: { dotLine?: string } }).warn?.dotLine);
    const lines = waterLines(st, route);
    assert.ok(lines.length >= 2, `${at}: Easy warns more than once (${lines.length})`);
    for (const { h, s } of lines) {
      const before = warned.find((d) => { const m = metAt(route, d), a = s(d.lipY); return a <= m && a >= m - 2 * WATER_WARN.lead; });
      assert.ok(before, `${at}: the line at x ${h.x}${h.beforeX !== undefined ? `..${h.beforeX}` : ''} starts before a warned river's near lip along the route`);
    }
    assert.equal(warned.length, lines.length, `${at}: every line is matched to its river (${warned.length} warned, ${lines.length} lines)`);
  }
});
