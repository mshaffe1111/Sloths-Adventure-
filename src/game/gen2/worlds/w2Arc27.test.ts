/**
 * 2-7 The Mailman's Route (BUILD-27; reference/design/2-7.md): the built stage, read the way the game builds it (its stage-table row, kit
 * 'w2-27', then World 2's finish), on both settings. The keeper's words verbatim and where the game says them; the hand build gone; the arc
 * beat for beat (out right, the weir down, home left); the rivers by the beat (out AT him, home WITH him; Easy's home rivers `ride`); the
 * mail boat, the post's doors and the weir's dress on every roll. Each test names the fault that turns it red.
 */
import '../../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGen2Stage } from '../pipeline.ts';
import { listedStage, worldFinish } from '../listed.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { W2_STAGES } from '../../w2Stages.ts';
import { STAGE_LINES } from '../../pokeyJournal.ts';
import { PHYS } from '../../physics.ts';
import { DOORS_27, LINES_27, MISSION_27, STAGE_27 } from './w2Arc27.ts';
import { STAGE_TABLE } from './stageTable.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const cfg = generateAllLevels().find((c) => c.id === STAGE_27 && !c.secret)!;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const memo = new Map<string, Any>();
/** the stage as the game builds it: its listed kit, then World 2's finish */
function built(seed: number, d: 'normal' | 'easy'): Any {
  const k = `${seed}:${d}`;
  if (!memo.has(k)) {
    const row = listedStage(STAGE_27)!;
    const st = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d });
    memo.set(k, worldFinish(row)(st as never, false, d));
  }
  return memo.get(k)!;
}
// (seed 1 is refused: World 2's finish throws on the weir column's catch ledge ("the fall ... has no bank at one end"), an engine gap
//  reported by BUILD-27; a refused roll is never listed)
const SEEDS = [2, 3, 4];
const BOTH = ['normal', 'easy'] as const;
const BEATS = ['jetty', 'doors', 'at-him', 'porches', 'upstream', 'rest', 'weir', 'reed-bank', 'with', 'bend', 'keep-running', 'rest', 'stilts', 'rest', 'neck', 'home-jetty'];
const beatAt = (st: Any, x: number): string | undefined => st.gen2.sections.find((s: Any) => x >= s.x0 && x < s.x1 && s.template !== 'w2-27-weir')?.template.replace('w2-27-', '');

test("2-7's lines are the story keeper's, word for word (reference/story/lines-2-7.md, KEEPER-27 t-keeper-27@0614ae0a), and the game says them", () => {
  const md = fs.readFileSync(path.join(root, 'reference/story/lines-2-7.md'), 'utf8');
  const rows = new Map<string, string>();
  for (const m of md.matchAll(/^\| \d+ \| (?:journal )?`([a-z]+)` \|[^|]*\| (.+?) \| \d+ \|$/gm)) rows.set(m[1], m[2].trim());
  for (const [k, v] of Object.entries(LINES_27)) assert.equal(v, rows.get(k), `line ${k}`);
  assert.equal(MISSION_27, rows.get('mission'), 'the stage card');
  // (where the game says them: the card (stagePlan.ts), the journal page, the Stage Cleared find; the old 2-7 hints are gone)
  assert.ok(fs.readFileSync(path.join(root, 'src/game/stagePlan.ts'), 'utf8').includes(`S('sprint', "The Mailman's Route", '${MISSION_27}')`), 'stagePlan.ts says MISSION_27');
  assert.equal(STAGE_LINES['2-7'], rows.get('page'), 'the journal page');
  const clue = fs.readFileSync(path.join(root, 'src/components/stageClue.ts'), 'utf8');
  assert.ok(clue.includes(`'2-7': C('${rows.get('cluetitle')}', '${rows.get('cluetext')}')`), 'the Stage Cleared find');
  assert.ok(!/"hint\.2-7\.(basket|frames|open|porches)"/.test(fs.readFileSync(path.join(root, 'src/game/dotLinesData.ts'), 'utf8')), "the hand-built 2-7's hints are gone");
  assert.ok(/"way\.2-7"/.test(fs.readFileSync(path.join(root, 'src/game/dotLinesData.ts'), 'utf8')), 'way.2-7 is kept');
});

test('2-7 is gen2\'s: its own row and kit, the hand build deleted (new replaces old)', () => {
  assert.equal(STAGE_TABLE['2-7']?.kit, 'w2-27');
  assert.equal(W2_STAGES['2-7'], undefined, 'w2Stages.ts holds no 2-7 plan');
});

test('2-7: every roll lays the arc beat for beat, out right, down the weir, home left, on both settings', () => {
  for (const d of BOTH) for (const s of SEEDS) {
    const st = built(s, d);
    assert.deepEqual(st.gen2.errors ?? [], [], `${d} seed ${s}: no errors`);
    assert.deepEqual(st.gen2.sections.map((q: Any) => q.template.replace('w2-27-', '')), BEATS, `${d} seed ${s}: the beats in order`);
    const legs = st.gen2.tower?.legs ?? [];
    assert.deepEqual(legs.map((g: Any) => g.travel), ['right', 'down', 'left'], `${d} seed ${s}: the legs`);
    assert.ok(legs[2].ground > legs[0].ground + 200, `${d} seed ${s}: home is below the out leg (the river under the mill-race)`);
  }
});

test('2-7: out, every river flows AT him; home, every river flows WITH him (left); Easy lays no deep river home', () => {
  for (const d of BOTH) for (const s of SEEDS) {
    const st = built(s, d);
    const legs = st.gen2.tower.legs;
    // (the rivers with logs: World 2's finish also fills each pit between banks with still water, no logs, which flows nowhere)
    const flowing = (st.rivers ?? []).filter((r: Any) => st.platforms.some((p: Any) => p.drift && p.drift.x0 >= r.x0 - 2 && p.drift.x1 <= r.x1 + 2));
    assert.ok(flowing.length >= 8, `${d} seed ${s}: ${flowing.length} rivers with logs (out 4, home 5)`);
    for (const r of flowing) {
      const home = r.surfaceY > legs[0].ground + 100;
      const logs = st.platforms.filter((p: Any) => p.drift && p.drift.x0 >= r.x0 - 2 && p.drift.x1 <= r.x1 + 2);
      // (out he travels right and the logs come at him (dir -1); home he travels left and they carry him (dir -1 too, the row mirrored))
      assert.equal(logs[0].drift.dir, -1, `${d} seed ${s}: river at ${Math.round(r.x0)} flows left (${home ? 'with him' : 'at him'})`);
      if (d === 'easy' && home) assert.ok(r.safe, `easy seed ${s}: the home river at ${Math.round(r.x0)} splashes back`);
    }
  }
});

test('2-7: the mail boat waits on the home leg and docks before the jetty; the post lays its doors on the way out; the weir dresses the column', () => {
  for (const d of BOTH) for (const s of SEEDS) {
    const st = built(s, d);
    const legs = st.gen2.tower.legs;
    assert.ok(st.pacer, `${d} seed ${s}: a mail boat`);
    assert.equal(st.pacer.dir, -1, `${d} seed ${s}: it runs home, left`);
    assert.ok(st.pacer.x0 > st.pacer.x1 && st.pacer.x1 >= st.exitTotemX - 2000, `${d} seed ${s}: it sets off up-river and docks near the jetty`);
    assert.ok(st.post?.doors?.length === DOORS_27, `${d} seed ${s}: ${DOORS_27} doors`);
    for (const q of st.post.doors) assert.ok(q.x > legs[0].x0 && q.x < legs[0].x1, `${d} seed ${s}: the door at ${Math.round(q.x)} is on the way out`);
    assert.ok(beatAt(st, st.post.doors[0].x) !== undefined, `${d} seed ${s}: the doors stand in beats`);
    assert.ok((st.columnDress ?? []).some((q: Any) => /weir/.test(q.art ?? '')), `${d} seed ${s}: the weir dresses the column`);
  }
});

test("2-7: Dot's `handover` starts 3 s at a full run after any other line (Normal's WATER_WARN at the spawn), `race` after it", () => {
  // (lead, 11-23: WATER_WARN at t0.2 and the handover at t2.4 crowded the opening on Normal; WATER_WARN stays, the handover moves)
  const gap = 3 * PHYS.maxRun;
  for (const d of BOTH) for (const s of SEEDS) {
    const hints = (built(s, d).proto?.hints ?? []) as Any[];
    const h = hints.find((q) => q.text === LINES_27.handover), r = hints.find((q) => q.text === LINES_27.race);
    assert.ok(h && r, `${d} seed ${s}: handover and race are said`);
    assert.ok(r.x > h.x, `${d} seed ${s}: race (x ${Math.round(r.x)}) after handover (x ${Math.round(h.x)})`);
    for (const q of hints) if (q !== h && q !== r && q.x <= h.x) assert.ok(h.x - q.x >= gap, `${d} seed ${s}: "${String(q.text).slice(0, 30)}" at x ${Math.round(q.x)} is ${Math.round(h.x - q.x)} px before the handover (under ${gap})`);
  }
});

test("2-7: Dot's `turn` is said on the weir, 800+ px of his path before the first river home, nothing that hurts between (rule 6)", () => {
  for (const d of BOTH) for (const s of SEEDS) {
    const st = built(s, d);
    const legs = st.gen2.tower.legs;
    const h = (st.proto?.hints ?? []).find((q: Any) => q.text === LINES_27.turn);
    assert.ok(h, `${d} seed ${s}: Dot says turn`);
    assert.ok(h.x > legs[0].x0 && h.x <= legs[1].frame.x1, `${d} seed ${s}: turn is said on the way out, at the weir (x ${Math.round(h.x)})`);
    // (his path: right from the line to the column's far side, then left along the home leg to the first river's near end)
    const home = (st.rivers ?? []).filter((r: Any) => r.surfaceY > legs[0].ground + 100 && st.platforms.some((p: Any) => p.drift && p.drift.x0 >= r.x0 - 2 && p.drift.x1 <= r.x1 + 2));
    const first = home.sort((a: Any, b: Any) => b.x1 - a.x1)[0];
    const path = (legs[1].frame.x1 - h.x) + (legs[1].frame.x1 - first.x1);
    assert.ok(path >= 800, `${d} seed ${s}: turn ${Math.round(path)} px of path before the first river home`);
    // (nothing that hurts between: no deep river on the home leg before the first one, no foe)
    assert.equal((st.enemies ?? []).length, 0, `${d} seed ${s}: 2-7 lays no foe`);
  }
});

test("2-7's race ends at the home jetty with the keeper's lines (`win` Dot's, `lose` Pokey's), and the hand-over and race challenge are story lines (Dot's), on every roll", () => {
  // (red if the brief drops raceEnd, a tip id loses its words, who is swapped, or storyTips loses either line: a plain tip is dropped on
  //  Normal's default Tips, so the stage's goal would go unsaid)
  for (const d of BOTH) for (const s of SEEDS) {
    const st = built(s, d);
    assert.deepEqual(st.pacer?.ends, { win: { text: LINES_27.win, who: 'Dot' }, lose: { text: LINES_27.lose, who: 'Pokey' } }, `${d} seed ${s}: the race ends`);
    const hints = (st.proto?.hints ?? []) as Any[];
    for (const k of ['handover', 'race'] as const) {
      const h = hints.find((q) => q.text === LINES_27[k]);
      assert.ok(h, `${d} seed ${s}: ${k} is laid`);
      assert.equal(h.story, 'Dot', `${d} seed ${s}: ${k} is Dot's story line`);
    }
    for (const k of ['win', 'lose'] as const) assert.ok(!hints.some((q) => q.text === LINES_27[k]), `${d} seed ${s}: ${k} is the race end's alone, never a mid-stage tip`);
  }
});
