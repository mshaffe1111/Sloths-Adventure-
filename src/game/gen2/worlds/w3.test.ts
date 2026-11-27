/**
 * World 3's gen2 kit (ENG-W3a, 11-23; gen2/worlds/w3.ts) and its first stage DRAFTED on it, travelling DOWN (stageTable.ts DRAFT_TABLE,
 * the lead's ruling 11-23: a general draft state). The kit's art is World 3's own from the inventory, in game and in scale with Pokey;
 * its cast rows are the creature kit's ocelot and jaguar; the draft is readied as the tools ready it (tools/engine/draft.ts) and the
 * game builds it (generateStage) going down, storey under storey, the shrine on the grotto floor, every roll clean on both settings;
 * the draft state is general (no stage named in the readying) and no game path reads it (the live 3-1 stays the old section maker).
 * Planted faults: reference/qa-reports/ENG-W3/planted-faults.py (each one turns a named test here red).
 */
import '../../headlessDom.ts';
import { readied, readyDraft } from '../../../../tools/engine/draft.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { castDef } from '../../predators/registry.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { generateStage, setLayoutVariant } from '../../stageGenerator.ts';
import { validateStage } from '../../levelCheck.ts';
import { footingsFor } from '../../terrain.ts';
import { MODEL_FAST, modelStage } from '../../stageTime.ts';
import { routeAt, towerHandOns, towerVineCuts } from '../tower.ts';
import type { Platform, Vine } from '../../types.ts';
import { buildGen2Stage } from '../pipeline.ts';
import { LISTED, playFinish } from '../listed.ts';
import { DRAFT_TABLE, STAGE_TABLE, draftRow } from './stageTable.ts';
import { W3_ART, W3_CAST, w3Manifest } from './w3.ts';
import { BOUNCE_FRAMES } from '../../bounceAtlasData.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const DRAFT = '3-1';
const SEEDS = [1, 2, 3, 4, 5, 6];
const BOTH = ['normal', 'easy'] as const;
/** how the engine draws World 3's pieces (terrain.ts footingsFor): its painted kit's bank and branch, the floor */
const W3_DRAWN = new Set(['ground', 'painted-bank', 'painted thin piece', 'step', 'pillar']);
/** World 3's bounce cap (w3.ts w3Cap; KIT-W3a): 70 px, its top 30 px up on the shelf it stands on, drawn by World 3's own plant
 *  (W3_ART.bounce, bounceArt.ts's atlas frame cap-w3; a world with no frame of its own would get World 1's mushroom) */
const W3_CAP = { w: 70, up: 30, art: 'bounce#cap-w3', frame: 'cap-w3' };
/** the shelf a World 3 cap stands on (none: p is no cap of the kit's) */
const capShelf = (p: Platform, all: readonly Platform[]) =>
  p.type === 'bouncy' && Math.round(p.width) === W3_CAP.w
    ? all.find((q) => q !== p && q.type !== 'bouncy' && Math.abs(q.y - (p.y + W3_CAP.up)) <= 1 && q.x <= p.x && q.x + q.width >= p.x + p.width)
    : undefined;
/** why piece p, drawn `drawn`, is not World 3's own kit (null: it is): its bank and branch, or its cap on its shelf in World 3's cap art */
function offKit(p: Platform, drawn: string, all: readonly Platform[], frames: Record<string, unknown> = BOUNCE_FRAMES): string | null {
  if (W3_DRAWN.has(drawn)) return null;
  if (drawn !== 'bounce') return `drawn as ${drawn}`;
  if (!(W3_ART.bounce as readonly string[]).includes(W3_CAP.art) || !frames[W3_CAP.frame]) return "drawn as a bounce with no World 3 cap art (World 1's mushroom)";
  return capShelf(p, all) ? null : `drawn as a bounce but no World 3 cap (${Math.round(p.width)} px, on no shelf ${W3_CAP.up} px under it)`;
}

test('the kit: every World 3 art row it names is in the World 3 inventory, in game, usable and in scale with Pokey (R-165.107)', () => {
  const inv = JSON.parse(fs.readFileSync(path.join(root, 'src/game/art/inventory/w3.json'), 'utf8')) as { cols: string[]; rows: unknown[][] };
  const rows = new Map(inv.rows.map((r) => { const o = Object.fromEntries(inv.cols.map((c, i) => [c, r[i]])) as { id: string; status: string; worlds: number[]; scale_ok: boolean | null }; return [o.id, o]; }));
  for (const [job, ids] of Object.entries(W3_ART)) for (const id of ids) {
    const r = rows.get(id);
    assert.ok(r, `${job}: ${id} is not in the World 3 inventory`);
    assert.ok(r.worlds.includes(3), `${job}: ${id} does not fit World 3`);
    assert.ok(r.status.startsWith('in game'), `${job}: ${id} is not drawn by the game (${r.status})`);
    assert.ok(!r.status.includes('needs fix'), `${job}: ${id} waits on a fix (${r.status})`);
    assert.notEqual(r.scale_ok, false, `${job}: ${id} is out of scale with Pokey`);
  }
});

test("the cast rows: World 3's ocelot and jaguar, each a creature kit animal (predators/world3.ts) with Worlds 6-8's body", () => {
  assert.deepEqual(W3_CAST.map((c) => c.enemy), ['ocelot', 'jaguar']);
  for (const c of W3_CAST) assert.ok(castDef(c.enemy, 3), `${c.enemy} has World 3's kit def (predators/world3.ts)`);
  assert.deepEqual(w3Manifest().creatures.map((c) => c.id), W3_CAST.map((c) => c.id));
  // (the way down casts none: no brick of it has an animal socket, so none is laid from the list)
  for (const q of w3Manifest().sections) assert.ok(!q.sockets.some((k) => k.role === 'enemy'), `${q.id} has no animal socket`);
});

test('the draft row: 3-1 drafted on World 3\'s kit going down; no game path reads it (not listed, the live 3-1 is the old section maker)', () => {
  assert.deepEqual(draftRow(DRAFT), { kit: 'w3', travel: 'down' });
  assert.ok(!Object.hasOwn(STAGE_TABLE, DRAFT), 'a draft is no STAGE_TABLE row');
  for (const id of Object.keys(DRAFT_TABLE)) assert.ok(!Object.hasOwn(STAGE_TABLE, id), `${id}: a listed stage leaves DRAFT_TABLE`);
  // (before any tool readies it: the game's 3-1 is not gen2's, and travels the plan's way, not the draft's)
  if (readied !== DRAFT) {
    assert.ok(!Object.hasOwn(LISTED, DRAFT));
    assert.notEqual(generateAllLevels().find((c) => c.id === DRAFT)?.travel, 'down');
  }
});

// (readied as the tools ready it, for the rest of this file's process: the game's own generateStage then builds it on gen2)
const built = new Map<string, ReturnType<typeof generateStage>>();
const draftBuilt = (seed: number, d: (typeof BOTH)[number]) => {
  if (readied !== DRAFT) readyDraft(DRAFT);
  const k = `${seed}:${d}`;
  if (!built.has(k)) {
    setLayoutVariant(seed);
    try { built.set(k, generateStage({ ...generateAllLevels().find((c) => c.id === DRAFT && !c.secret)!, unlocked: true }, d)); } finally { setLayoutVariant(null); }
  }
  return built.get(k)! as unknown as Built;
};
type Built = {
  platforms: Array<{ id: number; x: number; y: number; width: number; type: string; cut?: string }>; checkpoints?: Array<{ x: number; y: number }>; exitTotemX: number; exitTotemY: number; spawnY: number;
  config: { travel?: string }; gen2: { errors?: string[]; graph: { flow: string }; tower?: { route: Parameters<typeof routeAt>[0]; floorY: number } };
};
/** a RAW roll of the readied draft, its verdicts as the roll made them (the game's build rerolls a roll that fails one, so the faults a
 *  verdict names are judged here, as the seed-list search judges them: libstage.ts buildStage) */
const raw = new Map<string, Built>();
const draftRaw = (seed: number, d: (typeof BOTH)[number]): Built => {
  if (readied !== DRAFT) readyDraft(DRAFT);
  const k = `${seed}:${d}`;
  if (!raw.has(k)) raw.set(k, buildGen2Stage({ config: generateAllLevels().find((c) => c.id === DRAFT && !c.secret)!, kit: LISTED[DRAFT].kit(), seed, difficulty: d }) as unknown as Built);
  return raw.get(k)!;
};

test('the way DOWN: readied, the game builds 3-1 on gen2 storey under storey, the shrine on the grotto floor far below the start', () => {
  for (const d of BOTH) for (const seed of SEEDS) {
    const st = draftBuilt(seed, d);
    assert.equal(st.config.travel, 'down', `${d} ${seed}: the engine is told the way on is down`);
    assert.equal(st.gen2.graph.flow, 'down', `${d} ${seed}: laid down`);
    const T = st.gen2.tower!;
    assert.ok(T, `${d} ${seed}: laid as a tower`);
    assert.ok(st.exitTotemY - st.spawnY > 8 * 280, `${d} ${seed}: the shrine ${Math.round(st.exitTotemY - st.spawnY)} px under the start (8+ storeys)`);
    assert.ok(Math.abs(st.exitTotemY - T.floorY) <= 1, `${d} ${seed}: the shrine stands on the floor`);
    // (the route goes on down: each section's exit lower than or level with the one before)
    const legs = T.route.legs;
    for (let k = 1; k < legs.length; k++) assert.ok(legs[k].exit.y >= legs[k - 1].exit.y - 1, `${d} ${seed}: leg ${k} climbs back up`);
  }
});

test('every roll of the draft is clean on both settings (gen2 verdicts and levelCheck), two minutes or more for a quick player', () => {
  for (const d of BOTH) for (const seed of SEEDS) {
    const st = draftRaw(seed, d);
    assert.deepEqual(st.gen2.errors ?? [], [], `${d} ${seed}`);
    assert.deepEqual(validateStage(st as never).errors, [], `levelCheck ${d} ${seed}`);
    assert.ok(modelStage(st as never, MODEL_FAST).total >= 120, `${d} ${seed}: a quick player takes ${Math.round(modelStage(st as never, MODEL_FAST).total)} s`);
  }
});

test("the last flag is within 2000 px of way of the shrine, the floor's walk to it measured (tower.ts routeAt, down) and a spot", () => {
  // (24 rolls: the floor as a flag spot is wanted on about 1 in 12, seeds 17 and 22 when it was planted out)
  for (const d of BOTH) for (const seed of Array.from({ length: 24 }, (_, i) => i + 1)) {
    const st = draftRaw(seed, d);
    assert.ok(!(st.gen2.errors ?? []).some((e) => e.startsWith('flags:')), `${d} ${seed}: ${(st.gen2.errors ?? []).find((e) => e.startsWith('flags:'))}`);
    const R = st.gen2.tower!.route;
    const at = (st.checkpoints ?? []).map((c) => routeAt(R, c.x, c.y));
    assert.ok(R.length - Math.max(...at) <= 2000, `${d} ${seed}: ${Math.round(R.length - Math.max(...at))} px`);
    assert.equal(Math.round(routeAt(R, st.exitTotemX, st.exitTotemY)), Math.round(R.length), `${d} ${seed}: the shrine is the route's end`);
  }
});

test('head room on the way down: no piece of 24 raw rolls has wood across it less than his body over it, none refused for a blind drop (ENG-DOWNBOT)', () => {
  // (before ENG-DOWNBOT: 1,156 such pairs on 48 of 48 rolls: bridges run on 70 px under a shelf, catches 51-60 px over the next storey,
  //  a run-on across the whole tower; head room alone then refused 7 of 48 for blind drops of 301-382 px, so the catch search widened)
  for (const d of BOTH) for (const seed of Array.from({ length: 24 }, (_, i) => i + 1)) {
    const st = draftRaw(seed, d);
    assert.ok(!(st.gen2.errors ?? []).some((e) => e.includes('blind drop')), `${d} ${seed}: ${(st.gen2.errors ?? []).find((e) => e.includes('blind drop'))}`);
    const P = st.platforms.filter((p) => p.type !== 'fragile' && p.type !== 'block' && p.y < st.gen2.tower!.floorY - 1);
    assert.deepEqual(headRoomHits(P as unknown as Platform[]), [], `${d} ${seed}`);
  }
});

/** each pair of pieces with wood across one less than his body over it (World 3's cap on its own shelf is stood on, never walked under) */
function headRoomHits(P: readonly Platform[]): string[] {
  const out: string[] = [];
  for (const a of P) for (const b of P) {
    const across = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x), over = a.y - b.y;
    if (across > 30 && over > 1 && over < 84 && capShelf(b, P) !== a) out.push(`x ${a.x}-${a.x + a.width}, y ${a.y} lies ${over} px under x ${b.x}-${b.x + b.width}, y ${b.y}`);
  }
  return out;
}

test('PLANTED: head room knows only a World 3 cap on its own shelf: a 70 px piece of wood 30 px over a shelf, or a cap over another shelf, is caught', () => {
  const shelf = { id: 1, x: 300, y: 1000, width: 240, height: 20, type: 'solid' } as Platform;
  const cap = { id: 2, x: 460, y: 1000 - W3_CAP.up, width: W3_CAP.w, height: 20, type: 'bouncy' } as Platform;
  assert.deepEqual(headRoomHits([shelf, cap]), [], 'the cap on its shelf');
  assert.equal(headRoomHits([shelf, { ...cap, type: 'solid' } as Platform]).length, 1, 'wood 30 px over a shelf passes');
  const under = { ...shelf, id: 3, y: 1000 + 40 } as Platform;
  assert.equal(headRoomHits([shelf, cap, under]).length, 2, 'a shelf 40 px under the cap and its shelf passes');
});

test("a catch crosses a vine: going down no wood lies across a climb vine; the vine stops ON the catch, whose ends hand him on within TOWER.see (the lead's ruling (b), ENG-DOWNBOT)", () => {
  // (before: 247 vines cut on 24 of 24 rolls (seeds 1-12 x both): a turn's drop is 347-351 px, past TOWER.see, so a catch is owed under
  //  the end the turn's vine hangs from, and the catch, 173 px down and 180 px wide, lay across the vine)
  for (const d of BOTH) for (const seed of Array.from({ length: 12 }, (_, i) => i + 1)) {
    const st = draftRaw(seed, d);
    const floorY = st.gen2.tower!.floorY;
    const { vines, platforms } = st as unknown as { vines: Vine[]; platforms: Platform[] };
    assert.deepEqual(towerVineCuts(vines, platforms), [], `${d} ${seed}`);
    assert.ok(!(st.gen2.errors ?? []).some((e) => e.includes('a catch crosses a vine') || e.includes('blind drop')), `${d} ${seed}: ${(st.gen2.errors ?? []).find((e) => e.includes('a catch crosses a vine') || e.includes('blind drop'))}`);
    // (every climb vine over the floor ends ON wood: he climbs down onto it, never off its foot into the air)
    for (const v of vines.filter((q) => q.vineType === 'tree_climb' && q.bottomY < floorY - 1)) {
      assert.ok(platforms.some((p) => p.type === 'solid' && Math.abs(p.y - v.bottomY) <= 2 && p.x - 2 < v.x && p.x + p.width + 2 > v.x), `${d} ${seed}: the vine at x ${v.x} (y ${v.topY}-${v.bottomY}) ends on no wood`);
    }
  }
});

test("a catch hands on to its storey: going down, a stopped vine's catch is never run on over ALL of its storey; off one of its ends he lands on that storey, so its leg is never skipped (the lead's ruling on LAY finding 2, ENG-DOWNBOT)", () => {
  // (before: 69 stopped turns on 33 of 48 rolls (seeds 1-24 x both) passed their storey, normal 1's catch 581-1280 at y 11711 among
  //  them (off it onto 11825, over the storey but beside it, then on to 12062, past its storey 729-1144 at y 11889); 11 of the 69 ran
  //  wall to wall, with no way off)
  for (const d of BOTH) for (const seed of Array.from({ length: 12 }, (_, i) => i + 1)) {
    const st = draftRaw(seed, d);
    const T = st.gen2.tower as unknown as { turns: Array<{ x: number; from: number; to: number }>; width: number };
    assert.deepEqual(towerHandOns(T.turns, st.platforms as Platform[], T.width), [], `${d} ${seed}`);
  }
});

test("every piece of the draft is drawn by World 3's painted kit (terrain.ts footingsFor, world 3), none by World 1's cut art", () => {
  for (const d of BOTH) {
    const st = draftBuilt(1, d);
    const feet = footingsFor(st as never, 3);
    // (World 3's finish is its own and lays nothing yet: never World 1's cut art, squirrels or marks; read on the raw roll)
    const r = draftRaw(1, d);
    assert.deepEqual(playFinish(LISTED[DRAFT], structuredClone(r), d), structuredClone(r), `${d}: World 3's finish changed the roll (World 1's?)`);
    for (const p of st.platforms) {
      const f = feet.get(p.id);
      assert.ok(f, `${d}: piece ${p.id} at x ${Math.round(p.x)} y ${p.y} has a footing`);
      const off = offKit(p as Platform, f.drawn, st.platforms as unknown as Platform[]);
      assert.equal(off, null, `${d}: piece ${p.id} at x ${Math.round(p.x)} y ${p.y}: ${off}`);
      assert.equal(p.cut, undefined, `${d}: piece ${p.id} carries World 1's cut art`);
    }
  }
});

test("PLANTED: a piece drawn as a bounce that is no World 3 cap on its shelf, or a cap with no World 3 frame, is caught", () => {
  const st = draftBuilt(1, 'normal');
  const feet = footingsFor(st as never, 3);
  const all = st.platforms as unknown as Platform[];
  const caps = all.filter((p) => feet.get(p.id)?.drawn === 'bounce');
  assert.ok(caps.length > 0, "the roll lays World 3's cap (the plant needs one)");
  for (const p of caps) assert.equal(offKit(p, 'bounce', all), null, `cap ${p.id} is World 3's own`);
  // (a shelf typed bouncy: drawn as a bounce, no cap of the kit's)
  const shelf = all.find((p) => feet.get(p.id)?.drawn !== 'bounce' && p.width >= 140)!;
  const fake = { ...shelf, type: 'bouncy' } as Platform;
  assert.notEqual(offKit(fake, 'bounce', all.map((p) => (p === shelf ? fake : p))), null, 'a shelf drawn as a bounce passes');
  // (World 3's frame gone: the cap would be World 1's mushroom)
  const noW3 = Object.fromEntries(Object.entries(BOUNCE_FRAMES).filter(([k]) => k !== W3_CAP.frame));
  assert.notEqual(offKit(caps[0], 'bounce', all, noW3), null, 'a cap with no World 3 frame passes');
});
