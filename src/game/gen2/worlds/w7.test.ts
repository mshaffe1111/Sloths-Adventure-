/**
 * World 7 on gen2: 7-1, 7-3, 7-5, 7-6, 7-7 and 7-9 built through buildGen2Stage on raw rolls, Normal and Easy (the game's kit,
 * w7Game.ts). Every roll passes the check as its difficulty plays it, including the check WITHOUT its crumbling tiles (they are never
 * needed: STAGE-RULES §1); every tile keeps levelCheck's tile rules; it is long enough; it never goes quiet for over 4 s; no animal
 * stands by a jump; 7-1 teaches the tiles (Pokey's line) before the first tile; Pokey says every line (no Dot in World 7) under 10
 * words; the water is warned first; the rooms come once in their stages; the rolls differ.
 * And the tiles in the real engine: run across and they hold; stand still and he drops into the hall, soft, and hops out.
 */
import '../../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_FAST, modelStage } from '../../stageTime.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { validateStage } from '../../levelCheck.ts';
import { measureStage } from '../../stageMetrics.ts';
import { CRUMBLE_TILE_W, crumbleTime } from '../../zones.ts';
import { G } from '../../protoStage.ts';
import { RealPlay } from '../../realPlay.ts';
import type { Difficulty } from '../../difficulty.ts';
import { buildGen2Stage, checkStage, layLocal, planBudget, rngFor } from '../pipeline.ts';
import type { Gen2Stage } from '../types.ts';
import { pickRoute, RULES } from '../../../../tools/inspect/eraRoll.ts';
import { actionTokens, cosine, deadTime, EASY_GAP, NORMAL_GAP, profile } from '../../../../tools/inspect/analyze.ts';
import { W7_CREATURES, W7_GEN2_STAGES, W7_MANIFEST, W7_NEW_LINES, W7_PROPS, W7_TIPS } from './w7.ts';
import { HALL, W7_GROUND_SECTIONS, W7_STAGE_ONLY, W7_THEME, W7_TILE_SECTIONS } from './w7Ground.ts';
import { W7_GAME_STAGES, W7_REQUIRED, w7GameKit } from './w7Game.ts';
import { W7R_NEW_LINES } from './w7Rooms.ts';

const LEVELS = generateAllLevels();
const cfgOf = (id: string) => LEVELS.find((c) => c.id === id)!;
const SEEDS = Array.from({ length: 8 }, (_, i) => i + 1);
const cache = new Map<string, Gen2Stage>();
const build = (id: string, seed: number, difficulty: Difficulty) => {
  const k = `${id}:${seed}:${difficulty}`;
  if (!cache.has(k)) {
    const config = cfgOf(id);
    cache.set(k, buildGen2Stage({ config, kit: w7GameKit(config.miniIndex, difficulty), seed, difficulty }));
  }
  return cache.get(k)!;
};
const each = (f: (id: string, seed: number, difficulty: Difficulty) => void) => {
  for (const id of W7_GAME_STAGES) for (const difficulty of ['normal', 'easy'] as const) for (const seed of SEEDS) f(id, seed, difficulty);
};
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

test('the manifest: ids unique, every socket asks for something the world has, every section laid in its own space, tiles by the rules', () => {
  const ids = (xs: Array<{ id: string }>) => new Set(xs.map((x) => x.id)).size === xs.length;
  assert.ok(ids(W7_PROPS) && ids(W7_CREATURES) && ids(W7_GROUND_SECTIONS));
  assert.deepEqual([...W7_GAME_STAGES], [...W7_GEN2_STAGES]);
  const tags = new Set([...W7_PROPS.flatMap((p) => p.tags), ...W7_PROPS.map((p) => p.id)]);
  const creatures = new Set(W7_CREATURES.flatMap((c) => [c.id, ...(c.tags ?? [])]));
  const themes = new Set<string>(Object.values(W7_THEME));
  const taughtBy = new Set(W7_GROUND_SECTIONS.flatMap((s) => (s.teaches ? [s.teaches] : [])));
  for (const d of ['normal', 'easy'] as const) {
    const budget = planBudget(cfgOf('7-6'), W7_MANIFEST, d);
    for (const s of W7_GROUND_SECTIONS) {
      const L = layLocal(s, budget, rngFor(3));
      const keys = new Set(L.pieces.map((p) => p.key));
      for (const k of L.sockets) {
        assert.ok(keys.has(k.on), `${s.id}.${k.id} sits on a piece it has`);
        if (k.role === 'prop') assert.ok(k.allow!.some((a) => tags.has(a)), `${s.id}.${k.id}`);
        if (k.role === 'enemy') assert.ok(k.allow!.length && k.allow!.every((a) => creatures.has(a)), `${s.id}.${k.id}`);
        if (k.role === 'tip') assert.ok(W7_TIPS[k.allow![0]], `${s.id}.${k.id}: Pokey has a line for ${k.allow![0]}`);
        // (nothing stands on a tile: no animal, no flag, no relic)
        if (k.role !== 'pickup') assert.ok(!L.pieces.find((p) => p.key === k.on)?.crumble, `${s.id}.${k.id} stands on a tile`);
      }
      for (const m of s.uses ?? []) if (themes.has(m)) assert.ok(taughtBy.has(m), `${s.id} uses ${m}, which no gate opens`);
      assert.ok(L.width >= 600 && L.width <= 1800, `${s.id}: ${L.width} px`);
      if (!L.mirrored) assert.ok(Math.abs(L.exit.y - s.exitDy) <= 25, `${s.id}: exitDy ${s.exitDy}, laid ${L.exit.y}`);
      if (s.exitDy !== 0) assert.equal(s.mirrorable, false, s.id);
      // the tiles: a tile's width, never main, over a hall HALL.depth down whose floor runs under them all, never mirrored
      const tiles = L.pieces.filter((p) => p.crumble);
      if (tiles.length) {
        assert.ok(W7_TILE_SECTIONS.includes(s.id) && !s.mirrorable && (s.uses ?? []).concat(s.teaches ?? []).includes('crumble'), s.id);
        for (const t of tiles) {
          assert.equal(t.w, CRUMBLE_TILE_W, `${s.id}.${t.key}`);
          assert.ok(!t.main, `${s.id}.${t.key} is on the main route`);
          const under = L.pieces.find((p) => p.key.endsWith('hall') && p.x <= t.x + 1 && p.x + p.w >= t.x + t.w - 1);
          assert.ok(under && under.y - (t.y + t.h) >= 80 && t.h === 40, `${s.id}.${t.key}: no hall walked under it (${under ? under.y - t.y : 'none'})`);
        }
      }
    }
  }
  assert.ok(W7_GROUND_SECTIONS.length >= 30, `${W7_GROUND_SECTIONS.length} sections`);
  assert.equal(HALL.step * 2, HALL.depth);
  // (the chasms are deep on Normal, soft on Easy: the pipeline's rule; the halls under the tiles are floors, never pits)
  assert.equal(W7_MANIFEST.pit, 'void');
  for (const id of Object.keys(W7_STAGE_ONLY)) assert.ok(W7_GROUND_SECTIONS.some((s) => s.id === id), id);
  // (Pokey's lines: under 10 words, his own: Dot is gone in World 7)
  for (const l of [...W7_NEW_LINES, ...W7R_NEW_LINES]) assert.ok(words(l) < 10 && !/\bDot\b|Pokey/.test(l), l);
});

test('World 7 on raw rolls, Normal and Easy: the check passes, and passes without the crumbling tiles; long enough; never quiet; no animal by a jump', () => {
  each((id, seed, difficulty) => {
    const st = build(id, seed, difficulty);
    const at = `${id} ${difficulty} ${seed}`;
    const b = st.gen2.budget;
    assert.deepEqual(checkStage(st, b).errors, [], at);
    // (crumbling is never needed: with every tile gone the shrine and the goal are still reached; checkStage holds it too)
    const bare = { ...st, platforms: st.platforms.filter((p) => p.type !== 'fragile'), config: { ...st.config, targetCount: b.quota.check } };
    assert.deepEqual(validateStage(bare).errors.filter((e) => !/^(flower|leaf|heart) #/.test(e)), [], `${at}: without the tiles`);
    const tiles = st.platforms.filter((p) => p.type === 'fragile');
    for (const t of tiles) {
      assert.equal(t.crumbleAfter, crumbleTime(st.config.miniIndex), at);
      assert.ok((st.zones ?? []).some((z) => z.kind === 'crumble' && t.x >= z.x0 && t.x + t.width <= z.x1), `${at}: a tile outside a crumble zone`);
    }
    const fast = modelStage(st, MODEL_FAST).total;
    assert.ok(fast >= b.seconds.fastFloor, `${at}: fast ${fast.toFixed(0)} s`);
    const R = pickRoute(st.config.objectiveType, st as never);
    assert.ok(R.quick.time >= 120, `${at}: quick ${R.quick.time.toFixed(0)} s`);
    const q = measureStage(st as never);
    assert.equal(q.takeoffsNearEnemy + q.landingsNearEnemy, 0, `${at}: an animal by a jump`);
    // (every climb and every swing is needed: the quick route climbs each brown vine and swings each liana, STAGE-RULES §6)
    const segs = R.used.route.segs;
    for (const v of st.vines) {
      const kind = v.vineType === 'swing_liana' ? 'swing' : 'climb';
      assert.ok(segs.some((s) => s.kind === kind && Math.min(s.x0, s.x1) <= v.x + 40 && Math.max(s.x0, s.x1) >= v.x - 40), `${at}: the ${kind} at ${v.x} is walked past`);
    }
    // (the rooms and the tiles' lesson, once)
    for (const r of W7_REQUIRED[id] ?? []) assert.equal(st.gen2.sections.filter((s) => s.template === r.section).length, 1, `${at}: ${r.section}`);
  });
});

test('quiet and dead time stay under the rules on most raw rolls (curation drops the rest)', () => {
  for (const id of W7_GAME_STAGES) {
    let bad = 0;
    for (const seed of SEEDS) {
      for (const d of ['normal', 'easy'] as const) {
        const st = build(id, seed, d);
        const R = pickRoute(st.config.objectiveType, st as never);
        const dn = deadTime(R.used.br.beats, R.used.br.total, d === 'easy' ? EASY_GAP : NORMAL_GAP, R.used.samples);
        if (Math.max(0, ...dn.list.map((x) => x.counted)) > RULES.quietMax || dn.total > RULES.deadShare * R.used.br.total) bad++;
      }
    }
    assert.ok(bad < SEEDS.length, `${id}: ${bad} of ${SEEDS.length * 2} rolls quiet`);
  }
});

test("7-1 teaches the tiles first: Pokey's line before the first tile, nothing that hurts near it; every line is Pokey's", () => {
  for (const seed of SEEDS) {
    for (const d of ['normal', 'easy'] as const) {
      const st = build('7-1', seed, d);
      const first = Math.min(...st.platforms.filter((p) => p.type === 'fragile').map((p) => p.x));
      const said = st.proto.hints.filter((h) => h.text === W7_TIPS.crumble).map((h) => h.x);
      assert.ok(said.length === 1 && said[0] < first - 150, `7-1 ${d} ${seed}: the tiles' line at ${said} before ${first}`);
      for (const e of st.enemies) assert.ok(Math.abs(e.x - first) > 600, `7-1 ${d} ${seed}: a ${e.type} by the first tiles`);
    }
  }
  const lines = new Set([...Object.values(W7_TIPS), ...W7R_NEW_LINES]);
  each((id, seed, d) => {
    const st = build(id, seed, d);
    for (const h of st.proto.hints) assert.ok(lines.has(h.text), `${id} ${d} ${seed}: "${h.text}" is not one of Pokey's lines`);
    const creek = (st.gen2.falls ?? []).filter((f) => f.kind === 'water').sort((a, b) => a.x0 - b.x0)[0];
    if (creek) assert.ok(st.proto.hints.some((h) => h.x < creek.x0 && h.text === W7_TIPS.water), `${id} ${d} ${seed}: no warning before the drain`);
    // (a search, a purge and a gauntlet: Pokey explains the sealed shrine at the start)
    const shut = { relic_hunt: W7_TIPS.relics, purge: W7_TIPS.hunt, gauntlet: W7_TIPS.fight }[st.config.objectiveType as string];
    if (shut) assert.ok(st.proto.hints.some((h) => h.text === shut && h.x < st.spawnX + 1500), `${id} ${d} ${seed}: the sealed shrine is not explained`);
  });
});

test('the rolls differ (action 3-grams)', () => {
  for (const id of W7_GAME_STAGES) {
    const profs = SEEDS.map((s) => {
      const st = build(id, s, 'normal');
      const R = pickRoute(st.config.objectiveType, st as never);
      return profile(actionTokens(R.used.br.beats, R.used.br.total));
    });
    let sum = 0;
    let n = 0;
    for (let i = 0; i < profs.length; i++) for (let j = i + 1; j < profs.length; j++) (sum += 1 - cosine(profs[i], profs[j])), n++;
    assert.ok(sum / n >= 0.15, `${id}: raw diversity ${(sum / n).toFixed(2)}`);
  }
});

// ───────────────────────────── the tiles in the real engine ─────────────────────────────

/** 7-1's lesson section laid alone: the bank, two tiles over the hall, the floor past */
function tileStage() {
  const st = build('7-1', 1, 'normal');
  const sec = st.gen2.sections.find((s) => s.template === 'w7-first-tiles')!;
  return { st, sec };
}

test('the tiles in the real engine: run across and they hold him; stand still and he drops into the hall, soft, and hops out', () => {
  const { st, sec } = tileStage();
  const tiles = st.platforms.filter((p) => p.type === 'fragile' && p.x >= sec.x0 && p.x < sec.x1).sort((a, b) => a.x - b.x);
  const last = tiles[tiles.length - 1];
  const floorPast = st.platforms.find((p) => p.type === 'solid' && Math.abs(p.y - tiles[0].y) < 2 && p.x > last.x + last.width && p.x < last.x + last.width + 200)!;
  assert.ok(floorPast, 'the floor past the hall, level with the tiles');
  // (a run across: he never drops below the tiles' top)
  {
    const sim = new RealPlay('kit', 1);
    sim.bare(st.platforms);
    sim.safe = false;
    sim.stand(tiles[0].x - 160, tiles[0].y);
    sim.frame();
    const lives = sim.e.lives;
    let low = -Infinity;
    for (let i = 0; i < 90 && sim.p.x < floorPast.x + 60; i++) {
      // (the short jump from the last tile to the floor past: a flick at its end)
      const press = sim.p.grounded && sim.p.x > last.x + last.width - 30 && sim.p.x < last.x + last.width;
      sim.frame(press ? { right: true, press: true } : { right: true, jump: true });
      if (sim.p.grounded) low = Math.max(low, sim.p.y);
    }
    assert.ok(sim.p.x > floorPast.x + 40, `across (${sim.p.x.toFixed(0)})`);
    assert.ok(low <= tiles[0].y + 2, `he stayed on the tiles (lowest ${low}, the tiles ${tiles[0].y})`);
    assert.equal(sim.e.lives, lives);
  }
  // (standing still: the tile gives, he lands on the hall's floor with no life or heart lost, walks on and hops out)
  {
    const sim = new RealPlay('kit', 1);
    sim.bare(st.platforms);
    sim.safe = false;
    sim.stand(tiles[0].x + 50, tiles[0].y);
    const lives = sim.e.lives;
    const hp = sim.p.hp;
    sim.wait(2.5);
    assert.ok(sim.p.grounded && sim.p.y > tiles[0].y + HALL.depth - 5, `in the hall (${sim.p.y}, the tiles ${tiles[0].y})`);
    assert.equal(sim.e.lives, lives);
    assert.equal(sim.p.hp, hp);
    for (let k = 0; k < 600 && !(sim.p.grounded && Math.abs(sim.p.y - tiles[0].y) < 2); k++) {
      const stuck = sim.p.grounded && k % 12 === 0;
      sim.frame(stuck ? { right: true, press: true } : { right: true, jump: true });
    }
    assert.ok(Math.abs(sim.p.y - tiles[0].y) < 2, `hopped out (${sim.p.y})`);
    assert.equal(sim.e.lives, lives);
    assert.equal(sim.p.y > G + 400, false);
  }
});

test("the pipeline's check catches tiles that are needed: with a hall's floor and step taken out from under a run of four, it fails", () => {
  // (7-6's tile stair and run: its second hall has four tiles in a row, 440 px and the step past: too far to jump without them)
  let found: { st: Gen2Stage; x0: number; x1: number } | null = null;
  for (let seed = 1; seed <= 40 && !found; seed++) {
    const st = build('7-6', seed, 'normal');
    const sec = st.gen2.sections.find((x) => x.template === 'w7-stair-flat');
    if (!sec) continue;
    const tiles = st.platforms.filter((p) => p.type === 'fragile' && p.x >= sec.x0 && p.x < sec.x1).sort((a, b) => a.x - b.x).slice(-4);
    found = { st, x0: tiles[0].x, x1: tiles[3].x + tiles[3].width };
  }
  assert.ok(found, 'a roll of 7-6 with the tile stair and run');
  const { st, x0, x1 } = found!;
  const y = st.platforms.find((p) => p.type === 'fragile' && p.x === x0)!.y;
  const holed = { ...st, platforms: st.platforms.filter((p) => p.type === 'fragile' || !(p.x >= x0 - 1 && p.x < x1 + HALL.stepW + 1 && p.y > y + 1)) };
  const res = checkStage(holed as Gen2Stage, st.gen2.budget);
  assert.ok(res.errors.some((e) => e.startsWith('crumbling tiles needed:')), res.errors.slice(0, 3).join('; '));
});
