// ENG-CATCH-d (R-165.534): THE DOWN TOWER'S INVARIANT kept by the lay's mend (towerCatches mend), on toy towers. Each toy is a band of
// storeys cut from one of the drafted 3-1's captured reds (kit tree 1b300ebc3, seeds 1-40 x both; probe/crop.mts in
// reference/qa-reports/ENG-CATCH-c), a floor laid under it, and judged by the down verdicts the stage is judged by. Each shape toy is
// RED on d49de60f0's tower.ts (before the mend) and green with it; the clean toy pins that a lay with no miss is never touched.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import type { Platform, Vine } from '../types.ts';
import { withSetting } from '../settingDials.ts';
import { clearClimbs } from './pipeline.ts';
import { stopVines, towerCatches, towerFalls, towerHandOns, towerLids, towerVineCuts } from './tower.ts';

/** a toy tower: pieces [id, x, y, width, height, type (0 solid), storey, sealed], vines [id, x, topY, bottomY, type], turns [vine id,
 *  from, to], the sections' gaps [x0, x1, y] and kept-out boxes [x0, x1, y0, y1]; `roll` names the setting (n normal, e easy) */
type Toy = { roll: string; W: number; floorY: number; P: Array<Array<number | string>>; V: Array<Array<number | string>>; turns: number[][]; Gp: number[][]; keepOut: number[][] };
const TOYS: Record<string, Toy> = {
  'trim-n7': {"roll":"n7","W":1280,"floorY":1861,"P":[[88,1097,1086,159,24,0,21,0],[89,859,1153,142,24,0,21,0],[90,634,1230,143,24,0,21,0],[91,355,1290,193,24,0,21,0],[92,1001,1223,96,24,0,21,0],[93,777,1300,82,24,0,21,0],[94,548,1360,86,24,0,21,0],[95,309,1641,381,90,0,22,0],[99999,0,1861,1280,24,0,0,0]],"V":[[21,1210,1000,1086,"tree_climb"],[22,355,1290,1641,"tree_climb"],[23,690,1641,1861,"tree_climb"]],"turns":[[22,1290,1641]],"Gp":[[1001,1097,1086],[777,859,1153],[548,634,1230]],"keepOut":[]},
  'trim-n9': {"roll":"n9","W":1280,"floorY":1870,"P":[[84,1103,1091,153,24,0,21,0],[85,879,1156,144,24,0,21,0],[86,645,1230,144,24,0,21,0],[87,373,1299,190,24,0,21,0],[88,1023,1226,80,24,0,21,0],[89,789,1300,90,24,0,21,0],[90,563,1369,82,24,0,21,0],[91,327,1650,366,90,0,22,0],[99999,0,1870,1280,24,0,0,0]],"V":[[21,1210,1000,1091,"tree_climb"],[22,373,1299,1650,"tree_climb"],[23,693,1650,1870,"tree_climb"]],"turns":[[22,1299,1650]],"Gp":[[1023,1103,1091],[789,879,1156],[563,645,1230]],"keepOut":[]},
  'runon-n2': {"roll":"n2","W":1280,"floorY":1871,"P":[[47,1099,1012,157,24,0,13,0],[48,877,1088,141,24,0,13,0],[49,647,1165,145,24,0,13,0],[50,354,1230,195,24,0,13,0],[51,1018,1158,81,24,0,13,0],[52,792,1235,85,24,0,13,0],[53,549,1300,98,24,0,13,0],[54,308,1581,239,24,0,14,0],[55,675,1581,323,24,0,14,0],[56,547,1651,128,24,0,14,0],[99999,0,1871,1280,24,0,0,0]],"V":[[13,1210,1000,1012,"tree_climb"],[14,354,1230,1581,"tree_climb"],[15,998,1581,1871,"tree_climb"]],"turns":[[14,1230,1581]],"Gp":[[1018,1099,1012],[792,877,1088],[549,647,1165],[547,675,1581]],"keepOut":[]},
  'pass-joined': {"roll":"n12","W":1280,"floorY":2178,"P":[[57,723,1076,228,24,0,18,0],[58,764,1046,70,30,"bouncy",18,0],[60,326,1047,240,24,0,18,0],[61,280,1357,233,24,0,19,0],[62,637,1357,303,24,0,19,0],[63,513,1427,124,24,0,19,0],[64,756,1708,230,24,0,20,0],[65,511,1825,228,24,0,20,0],[66,293,1958,207,24,0,20,0],[99999,0,2178,1280,24,0,0,0]],"V":[[19,326,1047,1357,"tree_climb"],[20,940,1357,1708,"tree_climb"],[21,293,1958,2178,"tree_climb"]],"turns":[[19,1047,1357],[20,1357,1708]],"Gp":[[513,637,1357],[739,756,1708],[500,511,1825]],"keepOut":[]},
  'pass-walled': {"roll":"n38","W":1280,"floorY":2092,"P":[[76,722,1059,141,24,0,21,0],[77,944,1127,190,24,0,21,0],[78,408,1060,82,24,0,21,0],[79,635,1129,87,24,0,21,0],[80,863,1197,81,24,0,21,0],[81,979,1478,201,24,0,22,0],[82,550,1478,301,24,0,22,0],[83,851,1548,128,24,0,22,0],[84,70,1478,480,24,0,22,0],[85,24,1759,227,24,0,23,0],[86,268,1872,210,24,0,23,0],[99999,0,2092,1280,24,0,0,0]],"V":[[22,1134,1127,1478,"tree_climb"],[23,70,1478,1759,"tree_climb"],[24,1210,1999,2092,"tree_climb"]],"turns":[[22,1127,1478],[23,1478,1759]],"Gp":[[863,944,1059],[851,979,1478],[251,268,1759],[478,493,1872]],"keepOut":[]},
  'bridge-e2': {"roll":"e2","W":1280,"floorY":1801,"P":[[67,24,1023,154,24,0,18,0],[68,259,1094,191,24,0,18,0],[69,544,1165,190,24,0,18,0],[70,822,1230,245,24,0,18,0],[71,178,1164,81,24,0,18,0],[72,450,1235,94,24,0,18,0],[73,734,1300,88,24,0,18,0],[74,727,1581,386,90,0,19,0],[99999,0,1801,1280,24,0,0,0]],"V":[[23,70,1000,1023,"tree_climb"],[24,1067,1230,1581,"tree_climb"],[25,727,1581,1801,"tree_climb"]],"turns":[[24,1230,1581]],"Gp":[[178,259,1023],[450,544,1094],[734,822,1165]],"keepOut":[]},
  'dip-n12': {"roll":"n12","W":1280,"floorY":1871,"P":[[57,1100,1008,156,24,0,18,0],[58,867,1077,145,24,0,18,0],[59,645,1152,140,24,0,18,0],[60,364,1230,197,24,0,18,0],[61,1012,1147,88,24,0,18,0],[62,785,1222,82,24,0,18,0],[63,561,1300,84,24,0,18,0],[64,318,1581,233,24,0,19,0],[65,675,1581,303,24,0,19,0],[66,551,1651,124,24,0,19,0],[99999,0,1871,1280,24,0,0,0]],"V":[[18,1210,1000,1008,"tree_climb"],[19,364,1230,1581,"tree_climb"],[20,978,1581,1871,"tree_climb"]],"turns":[[19,1230,1581]],"Gp":[[1012,1100,1008],[785,867,1077],[561,645,1152],[551,675,1581]],"keepOut":[]},
  'pass-n7': {"roll":"n7","W":1280,"floorY":1919,"P":[[13,595,1061,141,24,0,4,0],[14,830,1127,190,24,0,4,0],[15,276,1060,93,24,0,4,0],[16,511,1131,84,24,0,4,0],[17,736,1197,94,24,0,4,0],[18,918,1478,148,24,0,5,0],[19,759,1598,159,24,0,5,0],[21,568,1697,70,30,"bouncy",5,0],[22,384,1549,142,24,0,5,0],[23,153,1699,231,24,0,5,0],[99999,0,1919,1280,24,0,0,0]],"V":[[6,1020,1127,1478,"tree_climb"],[7,153,1699,1919,"tree_climb"]],"turns":[[6,1127,1478]],"Gp":[[736,830,1061]],"keepOut":[]},
  'clean': {"roll":"n12","W":1280,"floorY":1878,"P":[[61,280,1057,233,24,0,19,0],[62,637,1057,303,24,0,19,0],[63,513,1127,124,24,0,19,0],[64,756,1408,230,24,0,20,0],[65,511,1525,228,24,0,20,0],[66,293,1658,207,24,0,20,0],[99999,0,1878,1280,24,0,0,0]],"V":[[19,326,1000,1057,"tree_climb"],[20,940,1057,1408,"tree_climb"],[21,293,1658,1878,"tree_climb"]],"turns":[[20,1057,1408]],"Gp":[[513,637,1057],[739,756,1408],[500,511,1525]],"keepOut":[]},
};

/** the catches joined end to end to no level wood (the toy's or the lay's): a run-on (rule 1, a bridge, the mend's remedy 2) may be
 *  short, as it lengthens the wood it joins; a catch of its own keeps a footing */
const alone = (out: ReadonlyArray<{ x: number; y: number; w: number }>, P: Toy['P']) => {
  const wood = [...P.filter((r) => !r[5]).map((r) => ({ x: r[1] as number, y: r[2] as number, w: r[3] as number })), ...out];
  return out.filter((c) => !wood.some((q) => q !== c && Math.abs(q.y - c.y) <= 1 && (Math.abs(q.x + q.w - c.x) <= 2 || Math.abs(q.x - (c.x + c.w)) <= 2)));
};

/** the toy laid (towerCatches going down, with its turns), the vines hung and stopped as the stage does, and the down verdicts' lines */
function lay(t: Toy) {
  const P = t.P.map((r) => ({ id: r[0], x: r[1], y: r[2], width: r[3], height: r[4], type: r[5] || 'solid' }) as Platform);
  const lv = new Map(t.P.map((r) => [r[0] as number, r[6] as number])), sealed = new Set(t.P.filter((r) => r[7]).map((r) => r[0] as number));
  const V = t.V.map((r) => ({ id: r[0], x: r[1], topY: r[2], bottomY: r[3], swaySpeed: 1, swayPhase: 0, vineType: r[4] }) as Vine);
  const turns = t.turns.map((r) => ({ id: r[0], from: r[1], to: r[2] }));
  return withSetting(t.roll[0] === 'e' ? 'easy' : 'normal', () => {
    const out = towerCatches('down', P, V, t.floorY, t.W, t.Gp.map((g) => ({ x0: g[0], x1: g[1], y: g[2] })), (q) => lv.get(q.id) ?? 0, (q) => sealed.has(q.id), t.keepOut.map((k) => ({ x0: k[0], x1: k[1], y0: k[2], y1: k[3] })), turns);
    const all = [...P, ...out.map((o, k) => ({ id: 90000 + k, x: o.x, y: o.y, width: o.w, height: 24, type: 'solid' }) as Platform)];
    clearClimbs(V, all);
    stopVines(V, all);
    const hung = turns.map((q) => ({ x: V.find((v) => v.id === q.id)!.x, from: q.from, to: q.to }));
    return { out, errs: [...towerFalls('down', all, t.floorY, t.W), ...towerVineCuts(V, all), ...towerLids(V, all), ...towerHandOns(hung, all, t.W)] };
  });
}

test("going down, the mend keeps the down tower's invariant: remedy 4: a dip floor's far end over a storey hole, the tower's own catch overhanging that end 4 px and cramping every run-on under its fall line; laid with that catch trimmed back (shelf-hops alone, normal 7), ENG-CATCH-d", () => {
  const { out, errs } = lay(TOYS['trim-n7']);
  assert.deepEqual(errs, [], 'no blind drop, give-way, pass or lid is left');
  assert.deepEqual(alone(out, TOYS['trim-n7'].P).filter((c) => c.w < 60), [], 'every catch that stands alone keeps a footing (a run-on joins wood)');
});

test("going down, the mend keeps the down tower's invariant: remedy 4: the same shape with a 6 px overhang (shelf-hops alone, normal 9), ENG-CATCH-d", () => {
  const { out, errs } = lay(TOYS['trim-n9']);
  assert.deepEqual(errs, [], 'no blind drop, give-way, pass or lid is left');
  assert.deepEqual(alone(out, TOYS['trim-n9'].P).filter((c) => c.w < 60), [], 'every catch that stands alone keeps a footing (a run-on joins wood)');
});

test("going down, the mend keeps the down tower's invariant: a dip floor's end whose run-on left an open end under it (shelf-hops alone, normal 2), ENG-CATCH-d", () => {
  const { out, errs } = lay(TOYS['runon-n2']);
  assert.deepEqual(errs, [], 'no blind drop, give-way, pass or lid is left');
  assert.deepEqual(alone(out, TOYS['runon-n2'].P).filter((c) => c.w < 60), [], 'every catch that stands alone keeps a footing (a run-on joins wood)');
});

test("going down, the mend keeps the down tower's invariant: a catch joined both ways, run on from 581 to the wall over its storey: re-laid with free ends, a slot's margin off the wood it ran on with (cap-steps alone, normal 12), ENG-CATCH-d", () => {
  const { out, errs } = lay(TOYS['pass-joined']);
  assert.deepEqual(errs, [], 'no blind drop, give-way, pass or lid is left');
  assert.deepEqual(alone(out, TOYS['pass-joined'].P).filter((c) => c.w < 60), [], 'every catch that stands alone keeps a footing (a run-on joins wood)');
});

test("going down, the mend keeps the down tower's invariant: a catch walled on one side and at the wall on the other: no way off, so no trail; the mend still re-lays it (shelf-hops alone, normal 38), ENG-CATCH-d", () => {
  const { out, errs } = lay(TOYS['pass-walled']);
  assert.deepEqual(errs, [], 'no blind drop, give-way, pass or lid is left');
  assert.deepEqual(alone(out, TOYS['pass-walled'].P).filter((c) => c.w < 60), [], 'every catch that stands alone keeps a footing (a run-on joins wood)');
});

test("going down, the mend keeps the down tower's invariant: a 454 px blind drop off a bridge (all five, Easy 2), ENG-CATCH-d", () => {
  const { out, errs } = lay(TOYS['bridge-e2']);
  assert.deepEqual(errs, [], 'no blind drop, give-way, pass or lid is left');
  assert.deepEqual(alone(out, TOYS['bridge-e2'].P).filter((c) => c.w < 60), [], 'every catch that stands alone keeps a footing (a run-on joins wood)');
});

test("going down, the mend keeps the down tower's invariant: a dip floor's end with no catch in view (shelf-hops alone, normal 12), ENG-CATCH-d", () => {
  const { out, errs } = lay(TOYS['dip-n12']);
  assert.deepEqual(errs, [], 'no blind drop, give-way, pass or lid is left');
  assert.deepEqual(alone(out, TOYS['dip-n12'].P).filter((c) => c.w < 60), [], 'every catch that stands alone keeps a footing (a run-on joins wood)');
});

test("going down, the mend keeps the down tower's invariant: a turn's catch that passes its storey (all five, normal 7), ENG-CATCH-d", () => {
  const { out, errs } = lay(TOYS['pass-n7']);
  assert.deepEqual(errs, [], 'no blind drop, give-way, pass or lid is left');
  assert.deepEqual(alone(out, TOYS['pass-n7'].P).filter((c) => c.w < 60), [], 'every catch that stands alone keeps a footing (a run-on joins wood)');
});

test("going down, a lay with no miss of the invariant is never touched by the mend: the toy's lay as laid before it, piece for piece, ENG-CATCH-d", () => {
  const { out, errs } = lay(TOYS.clean);
  assert.deepEqual(errs, []);
  assert.deepEqual(out.map((c) => [c.x, c.y, c.w, c.level]), [[166, 1344, 180, 19], [874, 1230, 180, 19], [346, 1344, 233, 19], [581, 1300, 180, 19], [739, 1525, 361, 20], [500, 1658, 353, 20], [52, 1631, 180, 19], [853, 1658, 361, 20]]);
});
