import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, G, HAND_STAGES, stageSeconds } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';
import { catchWindow, earlyCatch, jumpGrab, jumpReaches, landWindow, maxRise } from './protoCheck.ts';
import { reachJump } from './physics.ts';
import { rockFits } from './rockfall.ts';
import { tiedBottom, W4Play } from './w4Play.ts';
import { dotAtKnot, DOT_HELP, KNOT_MARK_FADE, KNOT_TEACH, knotMark, knotSpotX, newKnot, stepKnot } from './w4Kit.ts';
import { windPush } from './zones.ts';
import { gustBand } from './zoneArt.ts';
import type { LevelConfig, Platform, Vine } from './types.ts';

const cfg = (): LevelConfig =>
  ({
    worldIndex: 4, miniIndex: 4, id: '4-4', name: 'Crosswind', objectiveType: 'vine_runner', targetCount: 1, timeLimit: 0, levelWidth: 9000,
    levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
  }) as LevelConfig;
const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
const build = (s: number) => buildProtoStage(cfg(), s, '4-4');
type Stage = ReturnType<typeof build>;

/** the lianas, grouped into the chains they make (a vine within 460 px of the last one is the same chain) */
function chains(st: Stage): Vine[][] {
  const vs = st.vines.filter((v) => v.isSwingingVine).sort((a, b) => a.x - b.x);
  const out: Vine[][] = [];
  for (const v of vs) {
    const l = out[out.length - 1];
    if (l && v.x - l[l.length - 1].x < 460) l.push(v);
    else out.push([v]);
  }
  return out;
}
/** the knot that frees the secret's vine (the one over open floor, with the seed's branch beyond it) */
const secretKnot = (st: Stage) => (st.proto.w4?.knots ?? []).find((k) => st.collectibles.some((c) => c.type === 'seed' && c.x > k.x && c.x - k.x < 450));

/**
 * 4-4's liana chains are checked as they are built (protoCheck.ts: every vine catches the next, in the calm and with the gust behind),
 * not by the reachability check, which models one liana from ledge to ledge: for that check a stand-in bridge spans each chain, as
 * w3Stages.test.ts does for 3-8. The secret's knot vine is left out (it hangs over open floor), and its seed is checked on its own below.
 */
function bridged(st: Stage, without: Vine[] = []) {
  const secret = secretKnot(st);
  const spans = chains(st).filter((c) => !c.some((v) => without.includes(v)) && !(secret && c.length === 1 && c[0].id === secret.releases.id));
  const bridges: Platform[] = spans.map((c, i) => ({ id: 90000 + i, x: c[0].x - 260, y: G, width: c[c.length - 1].x - c[0].x + 520, height: 20, type: 'solid' }));
  return { stage: { ...st, platforms: [...st.platforms, ...bridges] }, bridges };
}
function check(st: Stage, without: Vine[] = []) {
  const { stage, bridges } = bridged(st, without);
  const res = validateStage(stage);
  const seed = st.collectibles.find((c) => c.type === 'seed');
  res.errors = res.errors.filter((e) => {
    // (the flowers along a swing are on its flight, not on the stand-in bridge)
    const m = e.match(/^flower #\d+ at \((\d+), \d+\) is out of reach$/);
    if (m && bridges.some((b) => Number(m[1]) > b.x - 60 && Number(m[1]) < b.x + b.width + 60)) return false;
    // (the secret's seed is reached from the freed knot vine: checked by its own test)
    return !(seed && e.startsWith(`seed #${seed.id} `) && e.endsWith('is out of reach'));
  });
  res.ok = res.errors.length === 0;
  return res;
}

test('4-4 is hand-built', () => {
  assert.equal(HAND_STAGES['4-4'], '4-4');
});

test('4-4: every roll can be finished, has one exit, and takes a quick player its full length (STAGE_SECONDS)', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const res = check(st);
    assert.ok(res.ok, `seed ${s}: ${res.errors.join('; ')}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1, `seed ${s}`);
    assert.ok(st.meta!.timing!.layoutSeconds >= stageSeconds('4-4'), `seed ${s}: ${Math.round(st.meta!.timing!.layoutSeconds)} s`);
    assert.ok((st.proto.movedPickups ?? 0) <= 2, `seed ${s}: ${st.proto.movedPickups} pickups had to be moved`);
    assert.deepEqual(st.proto.beats.map((b) => b[2].split(':')[0]), ['Start', 'Learn', 'Develop', 'Twist', 'Twist again', 'Finish'], `seed ${s}`);
  }
});

test('4-4: every gust lane has its chimes at the gorge edge, over a chain and no ground, and gusts blow both ways', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const winds = (st.zones ?? []).map((z, i) => ({ z, i })).filter(({ z }) => z.kind === 'wind');
    const chimes = st.proto.w4?.chimes ?? [];
    // (the two lanes of the Learn, the headwind, the rocks, the headwind over the rocks and the knot in the wind; a windy roll has more)
    assert.ok(winds.length >= 6, `seed ${s}: ${winds.length} gust lanes`);
    for (const { z, i } of winds) {
      const mine = chimes.filter((c) => c.zone === i);
      assert.ok(mine.length >= 1, `seed ${s}: a gust lane at ${z.x0} without chimes`);
      // the chimes stand on the bank just before the lane
      for (const c of mine) assert.ok(c.x < z.x0 && z.x0 - c.x < 320 && st.platforms.some((p) => p.y === G && p.x <= c.x && p.x + p.width >= c.x + 40), `seed ${s}: chimes off their bank`);
      assert.ok(z.force <= 160 && z.force >= 100, `seed ${s}: gust ${z.force}`);
      // over lianas, never over ground he stands on
      assert.ok(st.vines.some((v) => v.isSwingingVine && v.x > z.x0 && v.x < z.x1), `seed ${s}: a lane with no vine`);
      assert.ok(!st.platforms.some((p) => p.y === G && p.x < z.x1 && p.x + p.width > z.x0), `seed ${s}: ground in a gust lane`);
    }
    assert.ok(winds.some(({ z }) => z.dir === 1) && winds.some(({ z }) => z.dir === -1), `seed ${s}`);
  }
});

test('4-4: every liana chain is crossable in the calm: each vine catches the next, and the last lands on the far bank', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const secret = secretKnot(st);
    for (const c of chains(st)) {
      if (secret && c.length === 1 && c[0].id === secret.releases.id) continue;
      assert.ok(c.length >= 2, `seed ${s}: a lone liana at ${c[0].x}`);
      for (let k = 0; k + 1 < c.length; k++) assert.ok(catchWindow(c[k], c[k + 1]) > 0.6 && earlyCatch(c[k], c[k + 1]), `seed ${s}: vine at ${c[k].x} misses the next`);
      const far = st.platforms.filter((p) => p.y === G && p.x > c[c.length - 1].x).sort((a, b) => a.x - b.x)[0];
      assert.ok(landWindow(c[c.length - 2], c[c.length - 1], far) >= 8, `seed ${s}: the chain at ${c[0].x} does not land`);
    }
  }
});

test('4-4: the wide gap of each lane needs the wind behind him or the second jump, and the gust behind never overshoots', () => {
  for (const s of SEEDS) {
    const st = build(s);
    for (const z of (st.zones ?? []).filter((q) => q.kind === 'wind')) {
      const vs = st.vines.filter((v) => v.isSwingingVine && v.x > z.x0 && v.x < z.x1).sort((a, b) => a.x - b.x);
      assert.ok(vs.length >= 2, `seed ${s}`);
      const [A, B] = vs;
      assert.ok(B.x - A.x >= 370, `seed ${s}: the first gap is only ${B.x - A.x}`);
      const calm = catchWindow(A, B), tail = catchWindow(A, B, z.force), head = catchWindow(A, B, -z.force);
      assert.ok(calm > 0.6, `seed ${s}: the calm catch is ${calm}`);
      assert.ok(tail >= calm && head < calm - 0.15, `seed ${s}: the wind makes no difference (${head} / ${calm} / ${tail})`);
      for (let k = 0; k + 1 < vs.length; k++) assert.ok(catchWindow(vs[k], vs[k + 1], z.force) > 0.6, `seed ${s}: a gust behind carries him past a vine`);
    }
  }
});

test('4-4: Dot frees the knotted vine, and it is the only way across its gorge; the knot is taught', () => {
  const RISE = maxRise();
  for (const s of SEEDS) {
    const st = build(s);
    const knots = st.proto.w4?.knots ?? [];
    // the Develop beat's knot, the knot in the wind (Twist again) and the secret's; a roll whose flavour is the knots has more
    assert.ok(knots.length >= 3, `seed ${s}: ${knots.length} knots`);
    const secret = secretKnot(st);
    assert.ok(secret, `seed ${s}`);
    for (const main of knots.filter((k) => k !== secret)) {
      const v = st.vines.find((q) => q.id === main.releases.id && main.releases.kind === 'vine');
      assert.ok(v && v.isSwingingVine, `seed ${s}: the knot frees no vine`);
      const bank = st.platforms.find((p) => p.y === G && p.x + p.width >= main.x1 && p.x <= main.x0)!;
      assert.ok(bank, `seed ${s}: he cannot stand under the knot`);
      const edge = bank.x + bank.width;
      // freed, a jump from the bank grabs it; rolled up, nothing does, nor the next vine; and the gorge is far wider than any jump
      // it hangs over the end of the bank, and wherever he waits under it a jump straight up grabs it once it is free (hands within 48 px)
      // he waits between the vine and the edge, a step from the vine (so the knot is a little left of him on screen)
      assert.ok(main.x0 > v.x && main.x1 < edge && main.x1 - v.x < 130, `seed ${s}: the spot is not beside the vine`);
      assert.ok(jumpGrab(v.x + 60, G, v) >= 6, `seed ${s}: the freed vine is hard to grab`);
      const tied = tiedBottom(v.topY, v.bottomY, main.y);
      assert.ok(!jumpReaches(bank.x, edge, G, { ...v, bottomY: tied }), `seed ${s}: the tied-up vine can be grabbed`);
      assert.ok(tied + 30 < G - RISE - 20, `seed ${s}: the tied-up vine is within a jump`);
      // and low enough to be seen: no more than 260 px above his feet
      assert.ok(G - main.y <= 260, `seed ${s}: the knot is ${G - main.y} px up`);
      const chain = chains(st).find((c) => c.includes(v))!;
      assert.equal(chain[0], v, `seed ${s}: the knotted vine is not the first of its chain`);
      assert.ok(!jumpReaches(bank.x, edge, G, chain[1]), `seed ${s}: the second vine can be jumped to`);
      const far = st.platforms.filter((p) => p.y === G && p.x > edge).sort((a, b) => a.x - b.x)[0];
      assert.ok(far.x - edge > reachJump(0, true) + 200, `seed ${s}: the gorge can be jumped`);
      // with no way over this gorge (the knot left tied), the exit cannot be reached
      assert.equal(check(st, [v]).ok, false, `seed ${s}: the exit is reachable without the knot`);
      // the engine side: the vine hangs rolled up until he stands still under the knot, then drops to its full length
      const vines = st.vines.map((q) => ({ ...q }));
      const w = new W4Play(st.proto.w4!, st.platforms.map((p) => ({ ...p })), vines);
      const mine = vines.find((q) => q.id === v.id)!;
      assert.equal(mine.bottomY, tied, `seed ${s}`);
      const player = { x: (main.x0 + main.x1) / 2, y: G, vx: 0, vy: 0, grounded: true, invincibleTimer: 0 } as never;
      const host = {
        player, platforms: [], vines, collectibles: [], zones: st.zones ?? [], punch: null, hidden: false,
        hurt() {}, tip() {}, float() {}, screech() {}, sfx() {},
      };
      for (let t = 0; t < 5; t += 1 / 30) w.step(1 / 30, { ...host, t });
      assert.equal(mine.bottomY, v.bottomY, `seed ${s}: Dot did not free the vine`);
      assert.ok(st.proto.hints.some((h) => h.text === KNOT_TEACH && h.x < main.x0), `seed ${s}: the knot is not taught`);
    }
  }
});

test('4-4: the secret seed sits on a branch no jump reaches, behind leaves, and the second knot\'s vine lands on it', () => {
  const RISE = maxRise();
  for (const s of SEEDS) {
    const st = build(s);
    const seeds = st.collectibles.filter((c) => c.type === 'seed');
    assert.equal(seeds.length, 1, `seed ${s}`);
    const k = secretKnot(st)!;
    const v = st.vines.find((q) => q.id === k.releases.id)!;
    const ledge = st.platforms.find((p) => p.style === 'branch' && seeds[0].x > p.x && seeds[0].x < p.x + p.width && p.y - seeds[0].y < 60)!;
    assert.ok(ledge, `seed ${s}: no branch under the seed`);
    assert.ok(ledge.y < G - RISE - 20, `seed ${s}: the branch can be jumped to from the floor`);
    assert.ok(landWindow(null, v, ledge) >= 8, `seed ${s}: the freed vine does not reach the branch`);
    assert.ok(!jumpReaches(k.x - 420, k.x + 420, G, { ...v, bottomY: tiedBottom(v.topY, v.bottomY, k.y) }), `seed ${s}: the tied-up vine can be grabbed`);
    assert.ok(k.x0 > v.x && k.x1 - v.x < 130, `seed ${s}: the spot is not beside the vine`);
    assert.ok(st.proto.covers.some((c) => seeds[0].x > c.x && seeds[0].x < c.x + c.w && seeds[0].y > c.y && seeds[0].y < c.y + c.h), `seed ${s}: the seed is not behind leaves`);
    // the floor runs on under it
    // (the floor, or a mossy rock sunk into it, all the way: World 4's rocks break the bank around them, 2026-10-28)
    const ground = st.platforms.filter((p) => p.y <= G && p.y >= G - 50 && p.x + p.width > k.x0 && p.x < ledge.x + ledge.width).sort((a, b) => a.x - b.x);
    let to = k.x0;
    for (const p of ground) if (p.x <= to + 1) to = Math.max(to, p.x + p.width);
    assert.ok(to >= ledge.x + ledge.width, `seed ${s}`);
  }
});

test('4-4: the rocks over the landing are fair and taught, and the wind and the headwind are taught first', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const rocks = st.proto.w4?.rocks ?? [];
    assert.ok(rocks.length >= 1, `seed ${s}: no rocks`);
    for (const r of rocks) {
      assert.ok(rockFits(r) && r.warn >= 1, `seed ${s}`);
      assert.ok(st.platforms.some((p) => p.y === r.land && p.x <= r.x && p.x + p.width >= r.x), `seed ${s}: a rock that lands on nothing`);
      for (const cp of st.checkpoints ?? []) assert.ok(Math.abs(cp.x - r.x) > 200, `seed ${s}: a flag under the rocks`);
      for (const v of st.vines) assert.ok(Math.abs(v.x - r.x) > 120, `seed ${s}: a rock falls where he swings`);
    }
    const hintAt = (re: RegExp) => st.proto.hints.find((h) => re.test(h.text))?.x ?? Infinity;
    const lanes = (st.zones ?? []).filter((z) => z.kind === 'wind').sort((a, b) => a.x0 - b.x0);
    assert.ok(hintAt(/The chimes swing the way the wind will blow/) < lanes[0].x0, `seed ${s}`);
    assert.ok(hintAt(/swinging back at you/) < lanes.find((z) => z.dir === -1)!.x0, `seed ${s}`);
    assert.ok(hintAt(/Rocks fall on the next landing/) < Math.min(...rocks.map((r) => r.x)) - 600, `seed ${s}`);
  }
});

test('4-4: the second twist puts Dot\'s knots in the wind and the headwind over the rocks, each taught as it first comes', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const names = st.proto.beats.map((b) => b[2]);
    const at = names.findIndex((n) => n.startsWith('Twist again'));
    assert.ok(at > names.findIndex((n) => n.startsWith('Twist:')) && at < names.findIndex((n) => n === 'Finish'), `seed ${s}: ${names.join(' / ')}`);
    const [b0, b1] = st.proto.beats[at];
    const lanes = (st.zones ?? []).map((z, i) => ({ z, i })).filter(({ z }) => z.kind === 'wind');
    const chimes = st.proto.w4?.chimes ?? [];
    // a knot in the beat (two when the roll's flavour is the knots), each over a gorge with a gust lane across it, and its chimes
    // behind the knotted vine, clear of his spot
    const knots = (st.proto.w4?.knots ?? []).filter((k) => k.x > b0 && k.x < b1);
    assert.ok(knots.length >= 1 && knots.length <= 2, `seed ${s}: ${knots.length} knots in the second twist`);
    for (const k of knots) {
      const v = st.vines.find((q) => q.id === k.releases.id)!;
      const chain = chains(st).find((c) => c.includes(v))!;
      const lane = lanes.find(({ z }) => z.x0 > k.x1 && z.x0 < chain[1].x && z.x1 > chain[chain.length - 1].x);
      assert.ok(lane, `seed ${s}: the knot at ${k.x} has no wind over its gorge`);
      const c = chimes.find((q) => q.zone === lane.i)!;
      assert.ok(c && c.x + 40 < v.x, `seed ${s}: the chimes are not behind the knotted vine`);
    }
    const first = knots.sort((a, b) => a.x - b.x)[0];
    assert.ok(st.proto.hints.some((h) => /Another knot, and wind over the gorge/.test(h.text) && h.x > b0 && h.x < first.x0), `seed ${s}: the knot in the wind is not taught`);
    // the headwind over a landing the rocks fall on
    const rock = (st.proto.w4?.rocks ?? []).find((r) => r.x > b0 && r.x < b1);
    assert.ok(rock, `seed ${s}: no rocks in the second twist`);
    const over = lanes.find(({ z }) => z.x1 < rock.x && rock.x - z.x1 < 200)!;
    assert.ok(over && over.z.dir === -1, `seed ${s}: the rocks' gorge is not into the wind`);
    assert.ok(st.proto.hints.some((h) => /Wind in your face and rocks on the landing/.test(h.text) && h.x < over.z.x0), `seed ${s}: the headwind over the rocks is not taught`);
  }
});

/** the bank (ground at G) a knot's spot is on */
const bankUnder = (st: Stage, x0: number, x1: number) => st.platforms.find((p) => p.y === G && p.x <= x0 && p.x + p.width >= x1);

test('4-4: standing still on a knot\'s spot through a whole gust cycle never moves him off the ledge, and Dot still frees the vine', () => {
  // his middle may hang this far past a ledge and still stand on it (engine.ts: 0.26 of his 44 px, and the assist's 0.1 more)
  const OVERHANG = 44 * 0.36;
  for (const s of SEEDS) {
    const st = build(s);
    const zones = st.zones ?? [];
    const lanes = zones.filter((z) => z.kind === 'wind');
    const period = Math.max(...lanes.map((z) => z.period));
    for (const k of st.proto.w4?.knots ?? []) {
      const bank = bankUnder(st, k.x0, k.x1);
      assert.ok(bank, `seed ${s}: the knot at ${k.x} has no ground under its spot`);
      const edge = bank.x + bank.width;
      // the spot ends a sloth's length short of the drop (a step past it is still on the bank), and no gust lane comes near it, even for
      // a hop in place
      assert.ok(edge - k.x1 >= 36, `seed ${s}: the knot's spot ends ${Math.round(edge - k.x1)} px from the edge`);
      assert.ok(k.x1 - k.x0 >= 40, `seed ${s}: the knot's spot is only ${Math.round(k.x1 - k.x0)} px wide`);
      for (const z of lanes) assert.ok(z.x0 > k.x1 + 40 || z.x1 < k.x0 - 40, `seed ${s}: a gust lane at ${z.x0} reaches the knot's spot (${k.x0}..${k.x1})`);
      // stand still anywhere on it, starting anywhere in the gust cycle, for a whole cycle and more: the wind never moves him
      for (const from of [k.x0, knotSpotX(k), k.x1]) {
        for (let start = 0; start < period; start += 0.4) {
          let px = from;
          for (let t = start; t < start + period + 1; t += 1 / 30) {
            px += windPush(zones, px, G - 30, t, true) * (1 / 30);
            assert.ok(px >= k.x0 && px <= k.x1 && px + OVERHANG < edge, `seed ${s}: standing still at ${Math.round(from)}, the wind moved him to ${Math.round(px)}`);
          }
        }
      }
      // and the engine side, with the wind blowing: he stands still at the spot's end nearest the edge until Dot has freed the vine
      const vines = st.vines.map((q) => ({ ...q }));
      const w = new W4Play(st.proto.w4!, st.platforms.map((p) => ({ ...p })), vines);
      const player = { x: k.x1, y: G, vx: 0, vy: 0, grounded: true, invincibleTimer: 0 };
      const host = {
        player, platforms: [], vines, collectibles: [], zones, punch: null, hidden: false,
        hurt() {}, tip() {}, float() {}, screech() {}, sfx() {},
      };
      for (let t = 0; t < period + 4; t += 1 / 30) {
        w.step(1 / 30, { ...host, t } as never);
        player.x += windPush(zones, player.x, G - 30, t, true) * (1 / 30);
      }
      assert.ok(player.x + OVERHANG < edge, `seed ${s}: blown off the ledge`);
      const v = st.vines.find((q) => q.id === k.releases.id)!;
      assert.equal(vines.find((q) => q.id === v.id)!.bottomY, v.bottomY, `seed ${s}: Dot did not free the vine`);
    }
  }
});

test('4-4: the knot\'s spot is marked on the ground until it is freed, and Dot flies up from beside him to the knot', () => {
  const st = build(SEEDS[0]);
  const k = st.proto.w4!.knots![0];
  let ks = newKnot();
  assert.equal(knotMark(ks, 0), 1, 'the mark shows while the knot is tied');
  assert.equal(dotAtKnot(k, ks, 0), null, 'Dot is not out before he waits');
  const path: Array<{ x: number; y: number }> = [];
  for (let t = 0; ks.phase !== 'free'; t += 1 / 30) {
    ks = stepKnot(ks, true, 1 / 30);
    if (ks.phase === 'free') break;
    assert.equal(knotMark(ks, 0), 1, `the mark fades while ${ks.phase}`);
    const d = dotAtKnot(k, ks, t);
    assert.ok(d, `Dot is not drawn while ${ks.phase}`);
    assert.equal(d.face, k.x < knotSpotX(k) ? -1 : 1, 'Dot looks toward the knot');
    if (ks.phase === 'flying') path.push(d);
  }
  // she sets off from by his head over the spot, and ends beside the knot
  const first = path[0], last = path[path.length - 1];
  assert.ok(Math.abs(first.x - knotSpotX(k)) < 40 && k.ground - first.y > 60 && k.ground - first.y < 130, `Dot starts at ${Math.round(first.x)}, ${Math.round(first.y)}`);
  assert.ok(Math.hypot(last.x - k.x, last.y - k.y) < 40, 'Dot does not reach the knot');
  // freed, the mark fades and is gone
  assert.ok(knotMark(ks, KNOT_MARK_FADE / 2) > 0 && knotMark(ks, KNOT_MARK_FADE + 0.01) === 0, 'the mark stays after the knot is freed');
  // the whole wait, from standing still to the vine free, is the "about three seconds" Dot promises
  const wait = DOT_HELP.ask + DOT_HELP.fly + DOT_HELP.pick;
  assert.ok(wait >= 2 && wait <= 3.5, `${wait} s`);
});

test('4-4: what Dot says about the knots and the wind is the same everywhere, and says what to look for', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const lines = st.proto.hints.flatMap((h) => [h.text, h.pad, h.keys]);
    // (Dot says these lines herself: never "wait for Dot"; no "until it drops"; no chimes that "say go")
    for (const l of lines) assert.ok(!/wait for dot/i.test(l) && !/until it drops/i.test(l) && !/say go/i.test(l), `seed ${s}: "${l}"`);
    // the first knot's lesson is the line she says on its spot (w4Play.ts), and it names the mark and the wait
    assert.ok(lines.includes(KNOT_TEACH), `seed ${s}`);
    assert.match(KNOT_TEACH, /glowing spot/);
    assert.match(KNOT_TEACH, /three seconds/);
    const windKnot = st.proto.hints.find((h) => /Another knot/.test(h.text));
    assert.ok(windKnot && /glowing spot/.test(windKnot.text) && /three seconds/.test(windKnot.text) && /chimes swing your way/.test(windKnot.text), `seed ${s}: ${windKnot?.text}`);
    assert.ok(st.proto.hints.some((h) => /until the wind dies down/.test(h.text)), `seed ${s}: the headwind line`);
  }
});

test('4-4: the first gust lane blows softer over a mossy floor, and the later ones keep their full strength', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const lanes = (st.zones ?? []).filter((z) => z.kind === 'wind').sort((a, b) => a.x0 - b.x0);
    assert.ok(lanes[0].force < lanes[lanes.length - 1].force && lanes[0].force >= 100, `seed ${s}: first gust ${lanes[0].force}`);
    // a miss in the first gorge drops onto its mossy floor (a climb back, not a life)
    // (the floor rises a low step halfway along each gap, so it is a few pieces: together they cover the lane, 2026-10-28)
    const floor = st.platforms.filter((p) => p.y > G + 60 && p.x < lanes[0].x1 && p.x + p.width > lanes[0].x0).sort((a, b) => a.x - b.x);
    let to = lanes[0].x0;
    for (const p of floor) if (p.x <= to + 1) to = Math.max(to, p.x + p.width);
    assert.ok(to >= lanes[0].x1, `seed ${s}: no soft floor under the first gorge`);
    for (const z of lanes.slice(3)) assert.equal(z.force, 140, `seed ${s}: a later gust at ${z.force}`);
  }
});

test('4-4: the wind streaks keep to the air he swings through, not the sky behind', () => {
  const st = build(SEEDS[0]);
  for (const z of (st.zones ?? []).filter((q) => q.kind === 'wind')) {
    const b = gustBand(z);
    assert.ok(b.top >= z.top && b.bottom <= z.bottom && b.bottom - b.top <= 380 && b.bottom >= G, `band ${b.top}..${b.bottom}`);
  }
});
