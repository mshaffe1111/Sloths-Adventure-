/**
 * R-165.124 (REPORTED BY MATT 11-06 and 11-11: the dead-zone landing) and R-165.126's bounce part (REPORTED BY MATT 11-11: three
 * mushrooms in a row on flat ground), judged by landings.ts on the engine's flown flights.
 *
 * Planted from Matt's own seeds: 21537, 15406 and 15458 as 0.9.5 laid them (v0.9.5-37, the build he played on 11-06; the pieces around
 * each case copied here, so the case stays when the generator moves on). Then the rule on toy pieces (each refusal with its clean twin),
 * and the real engine: every refused landing is flown at from every ledge beside it (walk-offs and full jumps, every take-off), and no
 * plain flight lands on it with margin; every clean way the judge names, flown, lands on it.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { RealPlay } from '../realPlay.ts';
import { setDifficulty, type Difficulty } from '../difficulty.ts';
import { cleanWay, deadZones, JUMP_WINDOW, LAND_IN, Landings, purposelessBounces, type LandPickup, type LandPiece } from './landings.ts';

type Fix = { platforms: Array<[number, number, number, number, string]>; pickups: Array<[number, number, string]> };
const TYPE: Record<string, string> = { s: 'solid', b: 'bouncy' };
const pieces = (f: Fix): LandPiece[] => f.platforms.map(([x, y, width, height, t]) => ({ x, y, width, height, type: TYPE[t] ?? t }));
const pickups = (f: Fix): LandPickup[] => f.pickups.map(([x, y, type]) => ({ x, y, type }));

// ───────────────────────── Matt's seeds, as 0.9.5 laid them (v0.9.5-37, the pieces around each case) ─────────────────────────
const MATT: Record<string, Fix & { seed: number; setting: Difficulty; dead: Array<[number, number]>; what: string }> = {
  // the log under a log (Matt's words, 11-06): petals on a log 72 px under the take-off block, a log 70 px over the block across it;
  // walking off the block falls short of it, a full jump rises past the log above and lands on that
  '15458 normal': { seed: 15458, setting: 'normal', dead: [[28782, 1019]], what: 'the petal log under the log',
    platforms: [[27002, 853, 1531, 525, 's'], [27923, 773, 194, 80, 's'], [28163, 800, 214, 53, 's'], [28533, 947, 108, 120, 's'], [28641, 877, 470, 24, 's'], [28782, 1019, 207, 24, 's'], [29173, 740, 414, 24, 's'], [29649, 604, 446, 24, 's'], [28503, 967, 188, 24, 's'], [29081, 967, 142, 24, 's'], [29557, 830, 142, 24, 's']],
    pickups: [[28270, 766, 'flower'], [28852, 985, 'flower'], [28969, 985, 'flower'], [28551, 758, 'flower'], [28623, 758, 'flower'], [29204, 700, 'flower'], [29379, 700, 'flower'], [29554, 700, 'flower']] },
  '15406 easy': { seed: 15406, setting: 'easy', dead: [[34793, 971]], what: 'the petal log under the log',
    platforms: [[33491, 848, 1111, 743, 's'], [33935, 771, 215, 77, 's'], [34233, 796, 236, 52, 's'], [34602, 893, 86, 120, 's'], [34678, 833, 528, 24, 's'], [34793, 971, 233, 24, 's'], [35270, 719, 471, 24, 's'], [34572, 938, 166, 24, 's'], [35176, 923, 144, 24, 's']],
    pickups: [[34351, 762, 'flower'], [34868, 937, 'flower'], [35006, 937, 'flower']] },
  // (21537: its petal logs under logs have a clean walk-off at 0.9.5, from a low log beside them; its dead zone is the find's high log,
  // 205 px over the mushroom under it: the bounce + air jump carries him past it, reachable only by steering back in the air)
  '21537 normal': { seed: 21537, setting: 'normal', dead: [[32210, 430]], what: "the find's high log over the mushroom",
    platforms: [[31465, 854, 233, 708, 's'], [31698, 784, 311, 778, 's'], [32009, 706, 663, 856, 's'], [32164, 665, 203, 41, 's'], [32226, 635, 70, 30, 'b'], [32210, 430, 202, 24, 's'], [32368, 650, 211, 56, 's'], [32672, 781, 293, 781, 's'], [32965, 857, 383, 705, 's']],
    pickups: [[32311, 360, 'seed'], [31878, 750, 'flower'], [32398, 610, 'flower'], [32549, 610, 'flower'], [31506, 657, 'flower'], [31604, 650, 'flower']] },
  '21537 easy': { seed: 21537, setting: 'easy', dead: [[34586, 430]], what: "the find's high log over the mushroom",
    platforms: [[33767, 832, 233, 673, 's'], [34000, 769, 359, 736, 's'], [34359, 706, 711, 799, 's'], [34530, 665, 251, 41, 's'], [34615, 635, 70, 30, 'b'], [34586, 430, 250, 24, 's'], [34756, 650, 259, 56, 's'], [35070, 781, 341, 724, 's']],
    pickups: [[34711, 360, 'seed'], [34208, 735, 'flower'], [34621, 390, 'flower'], [34796, 390, 'flower'], [33906, 633, 'flower']] },
};

for (const [k, f] of Object.entries(MATT)) {
  test(`Matt's seed ${k} (0.9.5): ${f.what} is refused as a dead zone, and nothing else around it`, (t) => {
    const dz = deadZones(pieces(f), pickups(f), f.setting);
    assert.deepEqual(dz.map((p) => [p.x, p.y]), f.dead);
    t.diagnostic(`red: ${dz.map((p) => `x ${p.x}..${p.x + p.width}, top ${p.y}`).join('; ')}`);
  });
}

// ───────────────────────── the rule on toy pieces: each refusal and its clean twin ─────────────────────────
const S = (x: number, y: number, width: number, height = 24): LandPiece => ({ x, y, width, height, type: 'solid' });
const cap = (x: number, y: number): LandPiece => ({ x, y: y - 30, width: 70, height: 30, type: 'bouncy' });
const petal = (x: number, y: number): LandPickup => ({ x, y: y - 34, type: 'flower' });
for (const s of ['normal', 'easy'] as const) {
  test(`toy, ${s}: a petal log 72 px under a ledge with a log over the gap: the walk-off falls short, the jump lands on the log above`, () => {
    const ledge = S(0, 900, 1000, 300), far = S(1600, 900, 600, 300), over = S(1000, 830, 400);
    const low = S(1080, 972, 90);
    assert.deepEqual(deadZones([ledge, far, over, low], [petal(1120, 972)], s), [low]);
    // (twin: the low log out to where the walk-off lands, its middle LAND_IN inside)
    const near = S(1040, 972, 140);
    const w = cleanWay(near, [ledge, far, over, near], s);
    assert.equal(w?.how, 'walk-off');
    // (twin: no log above, the full jump comes down on it)
    const j = cleanWay(low, [ledge, far, low], s);
    assert.ok(j && j.how === 'jump' && (j.window ?? 0) >= JUMP_WINDOW.px, JSON.stringify(j));
  });
  test(`toy, ${s}: Matt's three mushrooms in a row on flat ground have no purpose; under a high ledge (and a chain into it) they have`, () => {
    const floor = S(0, 900, 2000, 300);
    const caps = [cap(300, 900), cap(500, 900), cap(700, 900)];
    assert.deepEqual(purposelessBounces([floor, ...caps], [], s), caps.slice().sort((a, b) => a.x - b.x));
    // (a bank 210 px up just past the last: the bounce + air jump lands on it; the first two bounce onto the next cap, a chain)
    const bank = S(800, 690, 500, 510);
    assert.deepEqual(purposelessBounces([floor, ...caps, bank], [], s), []);
    // (one alone on the floor, nothing it lands on but the floor: refused; with a find on a log it lands on: kept)
    const one = cap(300, 900), log = S(420, 760, 200);
    assert.deepEqual(purposelessBounces([floor, one], [], s), [one]);
    assert.deepEqual(purposelessBounces([floor, one, log], [{ x: 500, y: 720, type: 'find' }], s), []);
  });
}

// ───────────────────────── the real engine agrees ─────────────────────────
/** fly at T from every standable piece near it on the real engine: walk-offs from each end, full single and double jumps from every
 *  `step` px of take-off both ways; the widest window of take-offs that land on T first, and whether a walk-off lands with margin */
function flyAt(all: LandPiece[], T: LandPiece, setting: Difficulty, step = 4): { walk: boolean; window: number } {
  setDifficulty(setting);
  const r = new RealPlay('1-1', 1);
  const e = r.e as unknown as { platforms: unknown[]; enemies: unknown[]; vines: unknown[]; stop?: () => void };
  const ps = all.map((p, i) => ({ id: 9100 + i, ...p }));
  const tId = 9100 + all.indexOf(T);
  const fresh = () => { e.platforms.length = 0; e.platforms.push(...ps.map((p) => ({ ...p }))); e.enemies.length = 0; e.vines.length = 0; };
  const landed = (pad: (k: number) => object, frames = 90): { id: number; x: number } | null => {
    for (let k = 0; k < frames; k++) {
      r.frame(pad(k));
      if (r.p.grounded && k > 0) return { id: (r.e as unknown as { standingOnId: number }).standingOnId, x: r.p.x };
    }
    return null;
  };
  let walk = false, best = 0;
  for (const S0 of all) {
    if (S0 === T || S0.type === 'bouncy' || S0.x > T.x + T.width + 700 || S0.x + S0.width < T.x - 700) continue;
    for (const dir of [1, -1] as const) {
      const pad = dir > 0 ? { right: true } : { left: true };
      const edge = dir > 0 ? S0.x + S0.width : S0.x;
      fresh(); r.stand(edge - dir * 30, S0.y); r.p.vx = dir * 285;
      // (walk off: past the end, the first landing)
      let l: { id: number; x: number } | null = null;
      for (let k = 0; k < 90 && !l; k++) { r.frame(pad); if (Math.abs(r.p.x - edge) > 14 && dir * (r.p.x - edge) > 0) l = landed(() => pad); }
      if (l && l.id === tId && l.x >= T.x + LAND_IN.px && l.x <= T.x + T.width - LAND_IN.px) walk = true;
      for (const dbl of [false, true]) {
        let run = 0;
        for (let x = S0.x; x <= S0.x + S0.width; x += step) {
          fresh(); r.stand(x, S0.y); r.p.vx = dir * 285;
          let second = !dbl;
          const got = landed((k) => {
            if (k === 0) return { ...pad, press: true, jump: true };
            const top = !second && r.p.vy >= 0;
            if (top) second = true;
            return top ? { ...pad, press: true, jump: true } : { ...pad, jump: true };
          });
          run = got && got.id === tId ? run + step : 0;
          best = Math.max(best, run);
        }
      }
    }
  }
  e.stop?.();
  setDifficulty('normal');
  return { walk, window: best };
}

test("the real engine: no plain walk-off or full jump reaches Matt's petal logs with margin (15458 normal, 15406 easy)", () => {
  for (const k of ['15458 normal', '15406 easy']) {
    const f = MATT[k], all = pieces(f);
    for (const [x, y] of f.dead) {
      const T = all.find((p) => p.x === x && p.y === y)!;
      const r = flyAt(all, T, f.setting);
      assert.equal(r.walk, false, `${k}: a walk-off lands on x ${x}`);
      assert.ok(r.window < JUMP_WINDOW.px, `${k}: a ${r.window} px window of full jumps lands on x ${x}`);
    }
  }
});
test('the real engine: the clean ways the judge names land (the toy twins, and every petal log of 15458 the judge passes)', () => {
  const ledge = S(0, 900, 1000, 300), far = S(1600, 900, 600, 300), over = S(1000, 830, 400), near = S(1040, 972, 140), low = S(1080, 972, 90);
  assert.equal(flyAt([ledge, far, over, near], near, 'normal').walk, true, 'the walk-off twin');
  assert.ok(flyAt([ledge, far, low], low, 'normal').window >= JUMP_WINDOW.px, 'the jump twin');
  const f = MATT['15458 normal'], all = pieces(f), L = new Landings(all, 'normal');
  const passed = all.filter((p) => f.pickups.some(([x, y]) => x >= p.x && x <= p.x + p.width && p.y >= y && p.y - y <= 110) && L.cleanWay(p));
  assert.ok(passed.length >= 3, `${passed.length} petal pieces passed`);
  for (const T of passed) {
    const w = L.cleanWay(T)!;
    if (w.how === 'walked-on' || w.how.startsWith('bounce')) continue;
    const r = flyAt(all, T, 'normal');
    assert.ok(w.how === 'walk-off' ? r.walk : r.window >= JUMP_WINDOW.px, `x ${T.x}: the judge's ${w.how} from x ${w.from.x}, flown: ${JSON.stringify(r)}`);
  }
});
