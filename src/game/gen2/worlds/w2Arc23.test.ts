/**
 * 2-3 Stuck in the Reeds: Walk Them Home (BUILD-23; reference/design/2-3.md, the lead's GO 8:05 PM ET 11-20): the built stage, read the
 * way the game builds it (its stage-table row, kit 'w2-23', World 2's finish then 2-3's), on both settings. The keeper's words verbatim;
 * the arc beat for beat; the five cages with their little ones (the hand-built 2-3's test held five, the three kinds, none by an animal);
 * the post; each teach line 800+ px before what it teaches; the line's rules (lineFaults) on the stage as played; Easy never harder.
 */
import '../../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGen2Stage } from '../pipeline.ts';
import { listedStage, playFinish } from '../listed.ts';
import { lineFaults } from '../lineFaults.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { STAGE_TABLE } from './stageTable.ts';
import { W2_FOLLOW } from './w2.ts';
import { ARC_23, GOAL_LINES_23, HERON_CARD_23, LAG_23, LINES_23, MISSION_23, PADS_23, STAGE_23, kitLib23 } from './w2Arc23.ts';
import type { Bush, WatchZone } from '../../watcher.ts';
import type { Collectible, Platform, Vine } from '../../types.ts';
import type { RiverZone } from '../../river.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const cfg = generateAllLevels().find((c) => c.id === STAGE_23 && !c.secret)!;
type Played = {
  platforms: Platform[]; vines: Vine[]; rivers?: RiverZone[]; enemies: unknown[]; collectibles: Collectible[]; exitTotemX: number;
  proto: { hints?: Array<{ x: number; text: string }>; bushes?: Bush[]; watch?: WatchZone[]; follow?: unknown };
  gen2: { errors?: string[]; sections: Array<{ template: string; x0: number; x1: number }> };
};
const memo = new Map<string, Played>();
/** the stage as Play finishes it: its listed kit, World 2's finish, then 2-3's (playFinish) */
function played(seed: number, d: 'normal' | 'easy'): Played {
  const k = `${seed}:${d}`;
  if (!memo.has(k)) {
    const row = listedStage(STAGE_23)!;
    const st = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d });
    memo.set(k, playFinish(row, st as never, d) as unknown as Played);
  }
  return memo.get(k)!;
}
const SEEDS = [1, 2, 3];
const BOTH = ['normal', 'easy'] as const;
const BEATS = ['marsh', 'first-cage', 'first-heron', 'rest', 'parade', 'clumps', 'rest', 'post', 'pond', 'rest', 'everything', 'rest', 'home', 'gate'];
const hintX = (st: Played, line: string) => st.proto.hints?.find((h) => h.text === line)?.x;
const cages = (st: Played) => st.collectibles.filter((c) => c.type === 'cage').sort((a, b) => a.x - b.x);
const beatAt = (st: Played, x: number) => st.gen2.sections.find((s) => x >= s.x0 && x < s.x1)?.template.replace('w2-23-', '');

test("2-3's lines are the story keeper's, word for word (reference/story/lines-2-3.md, KEEPER-23-29 t-keeper-23-29@e5f754d8), and the stage says them", () => {
  const md = fs.readFileSync(path.join(root, 'reference/story/lines-2-3.md'), 'utf8');
  const rows = new Map<string, string>();
  for (const m of md.matchAll(/^\| \d+ \| `([A-Za-z]+)` \|[^|]*\| (.+?) \| \d+ \|$/gm)) rows.set(m[1], m[2].trim());
  for (const [k, v] of Object.entries(LINES_23)) assert.equal(v, rows.get(k), `line ${k}`);
  assert.equal(HERON_CARD_23.tip, rows.get('heronCard'), "the heron's journal tip");
  assert.ok(md.includes(`**${HERON_CARD_23.name}**`), 'the card name');
  assert.equal(MISSION_23, rows.get('mission'), 'the stage card');
  const goals = new Map<string, string>();
  for (const m of md.matchAll(/^\| `(goal[A-Za-z]+)` \| '[a-z]+' \| (.+?) \| \d+ \|$/gm)) goals.set(m[1], m[2].trim());
  for (const [k, v] of Object.entries(GOAL_LINES_23)) assert.equal(v, goals.get(k), `goal line ${k}`);
  // (where the game says them: the card (stagePlan.ts), the journal page and the clue; the hand-built 2-3's hints are gone, its wayside stays)
  assert.ok(fs.readFileSync(path.join(root, 'src/game/stagePlan.ts'), 'utf8').includes(`S('rescue', 'Stuck in the Reeds', '${MISSION_23}', 5)`), 'stagePlan.ts says MISSION_23');
  assert.ok(fs.readFileSync(path.join(root, 'src/game/pokeyJournal.ts'), 'utf8').includes("'2-3': \"Led a line of little ones home past a heron. For once I was the fast one. I waited for them anyway.\""), "Pokey's page");
  assert.ok(fs.readFileSync(path.join(root, 'src/components/stageClue.ts'), 'utf8').includes("'2-3': C('Wet Footprints', 'Little wet footprints run up the jetty, very fast, very grateful.')"), 'the clue');
  const lines = fs.readFileSync(path.join(root, 'src/game/dotLinesData.ts'), 'utf8');
  assert.ok(!/"hint\.2-3\.(cage|post|open)"/.test(lines), "the hand-built 2-3's hints are gone");
  assert.ok(lines.includes('"way.2-3"'), 'its wayside line stays (the keeper)');
  // (Dot's teach lines are laid on both settings)
  for (const d of BOTH) {
    const said = new Set(played(1, d).proto.hints!.map((h) => h.text));
    for (const k of ['follow', 'heron', 'look'] as const) assert.ok(said.has(LINES_23[k]), `${d}: "${LINES_23[k]}" is said`);
  }
});

test('the row: 2-3 rolls from its own kit (World 2 with 2-3 rows), CLEAN on both settings, the arc beat for beat, only its own bricks', () => {
  assert.equal(STAGE_TABLE[STAGE_23].kit, 'w2-23');
  assert.equal(kitLib23().manifest.world, 2);
  assert.equal(Object.values(ARC_23)[0].split(' ').length, BEATS.length);
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = played(seed, d);
    assert.deepEqual(st.gen2.errors ?? [], [], `${seed} ${d}`);
    assert.deepEqual(st.gen2.sections.map((s) => s.template.replace('w2-23-', '')), BEATS, `${seed} ${d}`);
  }
});

test('five little ones in reed cages (a duckling, an otter pup, a capybara pup, an otter up the post, a capybara), every one laid where the design puts it, none past the exit, no animal anywhere', () => {
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = played(seed, d);
    const cs = cages(st);
    assert.deepEqual(cs.map((c) => c.critter), ['duck', 'otter', 'capy', 'otter', 'capy'], `${seed} ${d}`);
    assert.deepEqual(new Set(cs.map((c) => c.critter)), new Set(['capy', 'duck', 'otter']));
    assert.deepEqual(cs.map((c) => beatAt(st, c.x)), ['first-cage', 'parade', 'clumps', 'post', 'everything'], `${seed} ${d}`);
    assert.ok(cs.every((c) => c.x < st.exitTotemX), `${seed} ${d}: every cage before the exit`);
    // (the first is taught: nothing that hurts on the stage at all; the heron never takes a heart)
    assert.equal(st.enemies.length, 0, `${seed} ${d}: no animal`);
    // (the post's cage hangs up its climbing vine, nothing to step off onto at the top: the line waits at its foot)
    const up = cs[3];
    const post = st.vines.find((v) => v.vineType === 'tree_climb' && Math.abs(v.x - up.x) < 40);
    assert.ok(post && up.y < post.bottomY - 120 && up.y > post.topY - 10, `${seed} ${d}: the fourth cage hangs up the post`);
    assert.ok(st.proto.follow, `${seed} ${d}: the little ones follow him (proto.follow)`);
  }
});

test("Dot teaches before the thing: `follow` 800+ px before the first cage, `heron` and `look` 800+ px before the first reeds' near edge", () => {
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = played(seed, d);
    const fx = hintX(st, LINES_23.follow)!, hx = hintX(st, LINES_23.heron)!, lx = hintX(st, LINES_23.look)!;
    const c1 = cages(st)[0].x;
    const r1 = Math.min(...st.proto.bushes!.map((b) => b.x));
    assert.ok(c1 - fx >= 800, `${seed} ${d}: follow ${Math.round(c1 - fx)} px before cage 1`);
    assert.ok(r1 - hx >= 800 && hx < lx && lx < r1, `${seed} ${d}: heron ${Math.round(r1 - hx)} px before the reeds, look after it`);
  }
});

test('the line on the stage as played: lineFaults clean on both settings (reeds wide enough, open mud and pond short enough, two herons leave a window); Easy one heron, its reeds 340', () => {
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = played(seed, d);
    const water = (safe: boolean) => (st.rivers ?? []).filter((r) => !!r.safe === safe).map((r) => ({ x0: r.x0, x1: r.x1, y: r.surfaceY }));
    const f = lineFaults({ platforms: st.platforms, vines: st.vines, collectibles: st.collectibles, exitTotemX: st.exitTotemX, bushes: st.proto.bushes, watch: st.proto.watch, safeWater: water(true), deepWater: water(false), dir: 1 }, W2_FOLLOW, d === 'easy');
    assert.deepEqual(f, [], `${seed} ${d}`);
    const lagged = st.proto.watch!.filter((z) => z.lag);
    if (d === 'easy') {
      assert.equal(lagged.length, 0, `${seed}: Easy lays one heron`);
      assert.ok(st.proto.bushes!.every((b) => b.w >= 340), `${seed}: Easy's reeds are 340 px`);
    } else assert.deepEqual(lagged.map((z) => z.lag), [LAG_23], `${seed}: beat 7's second heron, ${LAG_23} s out of step`);
    // (the first heron's first look only warns)
    assert.ok(st.proto.watch![0].freeFirst, `${seed} ${d}: the first heron's first look is free`);
  }
  // (the ponds splash him back on both settings: nobody is lost to the parade or the pond)
  assert.ok(Object.values(PADS_23).every((r) => r.safe));
});
