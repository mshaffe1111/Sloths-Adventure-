/**
 * 1-7 A Very Good Bush (BUILD-17; reference/design/1-7.md on t-1718-design): the built stage, read the way the game builds it (its
 * stage-table row: kitLib17 then finish17, listed.ts), on both settings. The keeper's words verbatim; the arc beat for beat; the eagle
 * laid one a watched beat, taught free, perched once; the mossy lianas; every teach line 800 px or more before what it teaches with no
 * eagle between; green close enough to reach inside the warn on an upright phone; Easy never harder than Normal.
 * Planted faults: reference/qa-reports/BUILD-17/planted-faults.py (each one turns a named test here red).
 */
import '../../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGen2Stage } from '../pipeline.ts';
import { listedStage } from '../listed.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { STAGE_PLAN, sealedLine } from '../../stagePlan.ts';
import { LINES_17, MISSION_17, SEALED_17, STAGE_17, W17_MOSSY } from './w1Arc17.ts';
import type { Enemy, Platform, Vine } from '../../types.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const cfg = generateAllLevels().find((c) => c.id === STAGE_17 && !c.secret)!;
type Built = { platforms: Platform[]; vines: Vine[]; enemies: Enemy[]; proto: { bushes?: Array<{ x: number; w: number; y: number; kind: string; hanging?: boolean }>; hints?: Array<{ x: number; text: string }> }; gen2: { errors: string[]; plan: Array<{ template: string }>; sections: Array<{ uid: string; template: string }> } };
const memo = new Map<string, Built>();
/** the stage as the game builds it: its listed kit, then its finish */
function built(seed: number, d: 'normal' | 'easy'): Built {
  const k = `${seed}:${d}`;
  if (!memo.has(k)) {
    const row = listedStage(STAGE_17)!;
    const st = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d });
    memo.set(k, row.finish!(st, d) as unknown as Built);
  }
  return memo.get(k)!;
}
const SEEDS = [1, 2, 3, 4];
const eagles = (st: Built) => st.enemies.filter((e) => e.type === 'eagle');
const sec = (st: Built, id: string) => st.gen2.sections.find((s) => s.template === id)!;
const piecesOf = <T extends { tag?: string }>(xs: readonly T[], uid: string) => xs.filter((x) => x.tag?.startsWith(`${uid}:`));
const hintX = (st: Built, line: string) => st.proto.hints!.find((h) => h.text === line)?.x;

test("1-7's lines are the story keeper's, word for word (reference/story/lines-1-7.md, KEEPER-17 approved 11-14), and the stage says them", () => {
  const md = fs.readFileSync(path.join(root, 'reference/story/lines-1-7.md'), 'utf8');
  const rows = new Map<string, string>();
  for (const m of md.matchAll(/^\| [0-9b]+ \| `?([A-Za-z_0-9]+)`? \|[^|]*\| (.+) \|$/gm)) rows.set(m[1], m[2].trim());
  for (const [k, v] of Object.entries(LINES_17)) assert.equal(v, rows.get(k), `line ${k}`);
  assert.equal(SEALED_17, rows.get('sealed'));
  assert.equal(MISSION_17, rows.get('MISSION_17'));
  // (the keeper's rulings: "keep still", never "hold still"; no line says "it only sees what moves")
  for (const v of [...Object.values(LINES_17), SEALED_17, MISSION_17]) {
    assert.ok(!/hold still/i.test(v) && !/only sees what moves/i.test(v), v);
  }
  assert.equal(STAGE_PLAN[1][6].desc, MISSION_17, "stagePlan's mission line for 1-7");
  assert.equal(sealedLine(1, 'stealth'), SEALED_17, 'the locked exit line, keyed to World 1 stealth (1-7 alone)');
  assert.equal(sealedLine(1, 'harvest'), null, "never '1:harvest' (it would speak at 1-2's locked exit)");
  for (const d of ['normal', 'easy'] as const) {
    const said = new Set(built(1, d).proto.hints!.map((h) => h.text));
    for (const v of Object.values(LINES_17)) assert.ok(said.has(v), `${d}: Dot says "${v}"`);
  }
});

test('1-7 is the arc beat for beat on every roll, both settings, and builds clean', () => {
  const ARC = ['arrival', 'bush', 'red-green', 'rest', 'bare-bark', 'rest', 'moss', 'creak', 'rest', 'mossy-lianas', 'rest', 'eagle-lands', 'rest', 'light-gap', 'exit'];
  for (const d of ['normal', 'easy'] as const) for (const s of SEEDS) {
    const st = built(s, d);
    assert.deepEqual(st.gen2.errors, [], `${d} ${s}`);
    assert.deepEqual(st.gen2.plan.map((p) => p.template.replace('w1-17-', '')), ARC, `${d} seed ${s}`);
  }
});

test('the eagle: one a watched stretch (9), the kit kind; taught free on Normal, free first everywhere on Easy; perched once, at the perch beat', () => {
  for (const d of ['normal', 'easy'] as const) for (const s of SEEDS) {
    const st = built(s, d);
    const es = eagles(st);
    assert.equal(es.length, 9, `${d} ${s}: eagles`);
    assert.deepEqual((st.proto as { cast?: { kinds: string[] } }).cast?.kinds, ['eagle']);
    const perched = es.filter((e) => e.kitPerch);
    assert.equal(perched.length, 1, 'one perched eagle');
    const lands = sec(st, 'w1-17-eagle-lands');
    const ps = piecesOf(st.platforms, lands.uid);
    assert.ok(perched[0].x > Math.min(...ps.map((p) => p.x)) && perched[0].x < Math.max(...ps.map((p) => p.x + p.width)), 'on its own beat');
    const free = es.filter((e) => e.kitFree).length;
    assert.equal(free, d === 'easy' ? 9 : 2, `${d}: first passes free`);
    assert.ok(es.every((e) => (e.kitCool ?? 0) >= 5), 'every calm 5 s or more (STILL_RULE)');
  }
});

test('the mossy lianas: only in the twist and the finale, every one there mossy (Normal 2 + 2, Easy 1 + 1)', () => {
  for (const d of ['normal', 'easy'] as const) for (const s of SEEDS) {
    const st = built(s, d);
    const mossy = st.vines.filter((v) => v.mossy);
    assert.equal(mossy.length, d === 'easy' ? 2 : 4, `${d} ${s}`);
    for (const id of W17_MOSSY) assert.ok(piecesOf(st.vines, sec(st, id).uid).every((v) => v.mossy), id);
    assert.equal(st.vines.length, mossy.length, 'no other liana in the stage');
  }
});

test('Dot teaches BEFORE the thing (level.md rule 6): each teach line 800 px or more before what it teaches, no eagle watching between', () => {
  for (const d of ['normal', 'easy'] as const) for (const s of SEEDS) {
    const st = built(s, d);
    const es = eagles(st).sort((a, b) => a.patrolMinX - b.patrolMinX);
    const zoneIn = (id: string, k = 0) => { const ps = piecesOf(st.platforms, sec(st, id).uid); const x0 = Math.min(...ps.map((p) => p.x)), x1 = Math.max(...ps.map((p) => p.x + p.width)); return es.filter((e) => e.patrolMinX >= x0 && e.patrolMinX <= x1)[k].patrolMinX; };
    // (what each line teaches is met where that beat's eagle starts watching: the creaky limb and the lianas lie inside their beat's eye)
    const limb = st.platforms.find((p) => p.tag?.startsWith(`${sec(st, 'w1-17-creak').uid}:k`))!;
    const liana = piecesOf(st.vines, sec(st, 'w1-17-mossy-lianas').uid).sort((a, b) => a.x - b.x)[0];
    const things: Array<[keyof typeof LINES_17, number]> = [
      ['bush', zoneIn('w1-17-bush', 0)], ['shake', zoneIn('w1-17-bush', 1)], ['bark', zoneIn('w1-17-bare-bark')], ['moss', zoneIn('w1-17-moss')],
      ['creak', Math.min(limb.x, zoneIn('w1-17-creak'))], ['swing', Math.min(liana.x, zoneIn('w1-17-mossy-lianas'))], ['lands', zoneIn('w1-17-eagle-lands')],
    ];
    for (const [line, at] of things) {
      const tx = hintX(st, LINES_17[line]);
      assert.ok(tx !== undefined, `${line} said`);
      assert.ok(at - tx! >= 800, `${d} ${s}: '${line}' ${Math.round(at - tx!)} px before what it teaches`);
      // (nothing that hurts between: no eagle watches any ground between the line and its thing)
      const between = es.filter((e) => e.patrolMaxX > tx! && e.patrolMinX < at);
      assert.deepEqual(between.map((e) => Math.round(e.patrolMinX)), [], `${d} ${s}: an eagle watches between '${line}' and its thing`);
    }
  }
});

test('green close enough (1-7.md "The phone both ways"): open bark between two covers on a watched beat at most 360 px (Easy 300), bare bark 400-480 (Easy at most 320)', () => {
  const OPEN = { normal: 360, easy: 300 }, BARK = { normal: [400, 480], easy: [0, 320] };
  for (const d of ['normal', 'easy'] as const) for (const s of SEEDS) {
    const st = built(s, d);
    const bark = sec(st, 'w1-17-bare-bark');
    const bps = piecesOf(st.platforms, bark.uid);
    const bx0 = Math.min(...bps.map((p) => p.x)), bx1 = Math.max(...bps.map((p) => p.x + p.width));
    for (const e of eagles(st)) {
      const hides = (st.proto.bushes ?? []).filter((b) => !b.hanging && b.x + b.w > e.patrolMinX && b.x < e.patrolMaxX).sort((a, b) => a.x - b.x);
      for (let i = 1; i < hides.length; i++) {
        const gap = hides[i].x + 10 - (hides[i - 1].x + hides[i - 1].w - 10);
        if (e.patrolMinX >= bx0 && e.patrolMinX <= bx1) assert.ok(gap >= BARK[d][0] && gap <= BARK[d][1], `${d} ${s}: bare bark ${gap} px`);
        else if (gap > 0) {
          // (the creaky limb (Easy: its sound bough) and the lianas: the eye runs over the gap, and the green past it is reached by the limb or the
          //  swing; the beat's question is crossing it, measured by the bots)
          const across = st.platforms.some((p) => p.x > hides[i - 1].x + hides[i - 1].w && p.x + p.width < hides[i].x && (p.type === 'fragile' || p.creak || p.style === 'branch')) || st.vines.some((v) => v.x > hides[i - 1].x && v.x < hides[i].x);
          if (!across) assert.ok(gap <= OPEN[d], `${d} ${s}: ${gap} px of open bark at x ${hides[i - 1].x}`);
        }
      }
    }
  }
});

test('Easy is never harder than Normal (level.md rule 4): no more lianas, no creaky limb, calms no shorter, the same eagles', () => {
  for (const s of SEEDS) {
    const n = built(s, 'normal'), e = built(s, 'easy');
    assert.ok(e.vines.length <= n.vines.length);
    assert.equal(e.platforms.filter((p) => p.creak).length, 0, 'Easy lays sound boughs for the creaky limbs');
    assert.ok(n.platforms.filter((p) => p.creak).length >= 2, 'Normal has its two creaky limbs');
    assert.equal(eagles(e).length, eagles(n).length);
  }
});
