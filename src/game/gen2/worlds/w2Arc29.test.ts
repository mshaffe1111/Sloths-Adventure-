/**
 * 2-9 The River King's Court (BUILD-29; reference/design/2-9.md on origin/t-design-29): the built stage, read the way the game builds it
 * (its stage-table row, kit 'w2-29', then World 2's finish), on both settings. The story keeper's words verbatim and where the game says
 * them; the hand build gone; the court lianas' far-bank stone where a plain walk climbs it. Each test names the fault that turns it red.
 */
import '../../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGen2Stage } from '../pipeline.ts';
import { listedStage, playFinish, worldFinish } from '../listed.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { W2_STAGES } from '../../w2Stages.ts';
import { STAGE_LINES } from '../../pokeyJournal.ts';
import { countWord, goalLine, sealedLine } from '../../stagePlan.ts';
import { generateStage, setLayoutVariant } from '../../stageGenerator.ts';
import { DECOR_CLEAR, dressClear } from '../../protoStage.ts';
import { shadowRetint } from '../../riverArt.ts';
import { W2_FRAMES } from '../../w2PropsData.ts';
import { COURT_29, DRUM_CARD_29, KICK_29, LINES_29, MISSION_29, STAGE_29 } from './w2Arc29.ts';
import { DOT_LINES } from '../../dotLinesData.ts';
/** the kick line's words as the kit says them (its row's old words; dotLines.ts swaps the new look's in where it is said) */
const LINES_KICK = (): string => { const r = DOT_LINES.find((q) => q[0] === KICK_29)!; return (r[4] ?? r[5])!; };
import { STAGE_TABLE } from './stageTable.ts';
import { loadSeedList, provenSeeds } from '../seedList.ts';
import { riverFaults } from '../riverLay.ts';
import { goalCounts, withGoals } from '../../goals.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const read = (f: string): string => fs.readFileSync(path.join(root, f), 'utf8');
const cfg = generateAllLevels().find((c) => c.id === STAGE_29 && !c.secret)!;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const memo = new Map<string, Any>();
/** the stage as the game builds it: its listed kit, then World 2's finish */
function built(seed: number, d: 'normal' | 'easy'): Any {
  const k = `${seed}:${d}`;
  if (!memo.has(k)) {
    const row = listedStage(STAGE_29)!;
    const st = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d });
    memo.set(k, worldFinish(row)(st as never, false, d));
  }
  return memo.get(k)!;
}
const SEEDS = [1, 2, 3];
/** 2-9's proven seeds (the list Play rolls from): the kick line and the posted guard are counted on every one */
await loadSeedList(STAGE_29);
const LISTED = provenSeeds(STAGE_29);
test('2-9 has its proven seed list (100 seeds)', () => assert.ok(LISTED.length >= 100, `${LISTED.length} listed seeds`));
const BOTH = ['normal', 'easy'] as const;
/** Matt's goal band on Normal (groundwork.test.ts "goals: every hand-built stage ..."): a gauntlet asks 70-80% of the animals it counts,
 *  with the same slack for a small count's nearest whole number; Easy asks no more than Normal. A fault line, or '' in the band */
function goalBandFault(g: Any): string {
  const have = goalCounts(g).animals;
  if (!have) return `no animals counted for a ${cfg.objectiveType} goal`;
  const share = g.config.targetCount / have;
  const slack = 0.5 / have + 0.005;
  if (share < 0.7 - slack || share > 0.8 + slack) return `goal ${g.config.targetCount} of ${have} animals, outside 70-80%`;
  if ((g.easyGoal ?? 0) > g.config.targetCount) return `Easy asks ${g.easyGoal}, more than Normal's ${g.config.targetCount}`;
  return '';
}
test("2-9's Normal goal lands in Matt's band (70-80% of the animals) on EVERY listed seed, as Play builds it (withGoals), and an off-band goal is named", () => {
  // (the check MOVED here from groundwork.test.ts:71, Law 22, BUILD-29-o: the hand-built 2-9 (23 of 30) was one of the six stages that
  //  test counted, and its deletion (2cb7b0a4a, BUILD-29-f) left the gen2 2-9's goal judged nowhere; on t-build-29 f4e77273 it checked 5)
  assert.equal(cfg.objectiveType, 'gauntlet');
  let judged = 0;
  for (const s of LISTED) {
    const g = withGoals(built(s, 'normal'));
    assert.equal(goalBandFault(g), '', `normal seed ${s}`);
    judged++;
  }
  assert.equal(judged, LISTED.length, `${judged} listed seeds judged`);
  // (the plants: the same build asking all seven, or three; the band must name both)
  const g = withGoals(built(1, 'normal'));
  const have = goalCounts(g).animals;
  for (const n of [have, 3]) {
    const planted = { ...g, config: { ...g.config, targetCount: n } };
    assert.match(goalBandFault(planted), /outside 70-80%/, `a goal of ${n} of ${have} is named`);
  }
  assert.match(goalBandFault({ ...g, easyGoal: g.config.targetCount + 1 }), /more than Normal/, 'an Easy goal over Normal is named');
});

test("2-9's lines are the story keeper's, word for word (reference/story/lines-2-9.md, KEEPER-23-29 t-keeper-23-29), and the game says them", () => {
  const md = read('reference/story/lines-2-9.md');
  const rows = new Map<string, string>();
  for (const m of md.matchAll(/^\| \d+ \| `([A-Za-z]+)` \|[^|]*\| (.+?) \| \d+ \|$/gm)) rows.set(m[1], m[2].trim());
  for (const [k, v] of Object.entries(LINES_29)) assert.equal(v, rows.get(k), `line ${k}`);
  assert.equal(MISSION_29, rows.get('mission'), 'the stage card');
  assert.equal(DRUM_CARD_29.tip, rows.get('drumCard'), "the drum's journal tip");
  assert.ok(md.includes(`**${DRUM_CARD_29.name}**`), 'the card name');
  const page = /^\| `page` \|[^|]*\|[^|]*\| (.+?) \|$/m.exec(md)?.[1].trim();
  assert.equal(STAGE_LINES['2-9'], page, 'the journal page');
  // (where the game says them: the card (stagePlan.ts), the locked shrine, Dot's goal lines and the HUD's count word)
  assert.ok(read('src/game/stagePlan.ts').includes(`S('gauntlet', "The River King's Court", "${MISSION_29}")`), 'stagePlan.ts says MISSION_29');
  assert.equal(sealedLine(2, 'gauntlet'), LINES_29.sealed, "SEALED_LINES '2:gauntlet'");
  assert.equal(goalLine('start', 2, 'gauntlet', 5), LINES_29.goalStart.replace('{n}', '5'), 'goalStart at 5');
  assert.equal(goalLine('late', 2, 'gauntlet', 3), LINES_29.goalLate.replace('{n}', '3'), 'goalLate at 3');
  assert.equal(goalLine('late', 2, 'gauntlet', 1), 'Still 1 snapper to chase off', "goalLate says 'snapper' at 1");
  assert.equal(countWord(2, 'gauntlet'), 'snappers', "the HUD counts 'snappers'");
  // (the old rows: the court's two retired, the posted guard's teach, the float, the wayside line and the clue kept, lines-2-9.md :102-104)
  const dot = read('src/game/dotLinesData.ts');
  assert.ok(!/"hint\.2-9\.(court|guards)"/.test(dot), "the hand-built court's hints are gone");
  for (const id of ['hint.2-9.kick', 'float.blocked', 'way.2-9']) assert.ok(dot.includes(`["${id}", "2-9"`), `${id} is kept`);
  assert.ok(read('src/components/stageClue.ts').includes("'2-9': C('A Crooked Crown',"), 'the clue stays');
});

test("2-9 is gen2's: its own row and kit, the hand build deleted (new replaces old)", () => {
  assert.equal(STAGE_TABLE['2-9']?.kit, 'w2-29');
  assert.equal(W2_STAGES['2-9'], undefined, 'w2Stages.ts holds no 2-9 plan');
});

test("2-9: the court lianas' far-bank moss stone stands in its bank's middle, never at the lip he lands on (plainWalk's 50 px step, BUILD-29-f)", () => {
  for (const d of BOTH) for (const s of SEEDS) {
    const st = built(s, d);
    assert.deepEqual(st.gen2.errors ?? [], [], `${d} seed ${s}: no errors`);
    for (const q of st.gen2.sections.filter((q: Any) => /-(let-go|double)$/.test(q.template))) {
      const stones = st.platforms.filter((p: Any) => p.style === 'moss_stone' && p.x >= q.x0 && p.x + p.width <= q.x1);
      const far = stones.at(-1);
      assert.ok(far, `${d} seed ${s} ${q.template}: a far-bank stone`);
      const under = st.platforms.find((p: Any) => p !== far && Math.abs(p.y - (far.y + far.height)) <= 2 && p.x <= far.x && p.x + p.width >= far.x + far.width);
      assert.ok(under, `${d} seed ${s} ${q.template}: the stone at x ${Math.round(far.x)} stands on a bank`);
      const mid = (far.x + far.width / 2 - under.x) / under.width;
      assert.ok(mid > 0.4 && mid < 0.6, `${d} seed ${s} ${q.template}: the stone at ${mid.toFixed(2)} of its ${Math.round(under.width)} px bank`);
    }
  }
});

test("2-9: Dot's kick line (hint.2-9.kick) is laid on EVERY listed seed, both settings, said 800 px+ before the posted guard (level.md rule 6; a ruled socket the engine refuses vanishes silently, R-165.518: BUILD-29-j)", () => {
  const words = LINES_KICK();
  for (const d of BOTH) for (const s of LISTED) {
    const st = built(s, d);
    const fill = st.gen2.fills.filter((f: Any) => f.role === 'tip' && f.what === KICK_29);
    assert.equal(fill.length, 1, `${d} seed ${s}: one kick socket filled (found ${fill.length})`);
    assert.ok(!fill[0].unsaid, `${d} seed ${s}: the kit has words for ${KICK_29}`);
    const hint = ((st.proto?.hints ?? []) as Any[]).filter((h) => h.text === words);
    assert.equal(hint.length, 1, `${d} seed ${s}: Dot says "${words}" once (found ${hint.length})`);
    const guard = st.enemies.find((e: Any) => e.royal && e.post !== undefined);
    assert.ok(guard, `${d} seed ${s}: the posted guard`);
    const ahead = guard.x - hint[0].x;
    assert.ok(ahead >= 800, `${d} seed ${s}: the kick line at x ${Math.round(hint[0].x)} is ${Math.round(ahead)} px before the guard at x ${Math.round(guard.x)} (800 px+)`);
  }
});

/** the log rivers riverFaults judges (a moving current he hops or boards; still, open, raft and flood water are judged elsewhere) */
const logRivers = (st: Any): Any[] => (st.rivers ?? []).filter((r: Any) => r.speed > 0 && !r.open && !r.raft && !r.flood);
const onRiver = (st: Any, r: Any): Any[] => st.platforms.filter((p: Any) => p.type === 'drift' && p.drift && p.drift.x0 >= r.x0 - 1 && p.drift.x0 <= r.x1);

test("2-9's log rivers are fair on every listed seed, both settings (riverFaults == []), and a barge's gap widened past the reach is named (R-165.544)", () => {
  // (the check MOVED here from riverLay.test.ts, Law 22: the hand-built 2-9 held the last log rivers that test counted, and its deletion
  //  (2cb7b0a4a, BUILD-29-f) left the gen2 2-9's rivers judged nowhere. Floor: every build lays its five log rivers, the last the King's Barge)
  let judged = 0;
  for (const d of BOTH) for (const s of LISTED) {
    const st = built(s, d);
    assert.deepEqual(riverFaults(st, d), [], `${d} seed ${s}`);
    const rv = logRivers(st);
    assert.ok(rv.length >= 5, `${d} seed ${s}: ${rv.length} log rivers, under 5`);
    assert.equal(rv.filter((r) => onRiver(st, r).some((p) => p.drift.look === 'barge')).length, 1, `${d} seed ${s}: one barge row`);
    judged += rv.length;
  }
  assert.ok(judged >= 5 * 2 * LISTED.length, `${judged} log rivers judged`);
  // (the plant: the barge river and its row's window stretched 900 px, so its three barges' gap grows 300 px, past a hop; riverFaults
  //  must name it)
  for (const d of BOTH) {
    const st = built(1, d);
    const barge = logRivers(st).find((r) => onRiver(st, r).some((p) => p.drift.look === 'barge'))!;
    const mine = new Set(onRiver(st, barge));
    const platforms = st.platforms.map((p: Any) => (mine.has(p) ? { ...p, drift: { ...p.drift, x1: p.drift.x1 + 900 } } : p));
    const rivers = st.rivers.map((r: Any) => (r === barge ? { ...r, x1: r.x1 + 900 } : r));
    const planted = riverFaults({ ...st, platforms, rivers }, d);
    assert.ok(planted.some((f) => /between logs, past a hop/.test(f)), `${d}: the widened barge gap is named (${planted.join(' | ')})`);
  }
});

test("2-9: the king's posted guard is laid on EVERY seed, both settings, on the barge's landing past the river (a ruled socket the engine refuses vanishes silently: BUILD-29-i, two barges refused him at t 0.5-0.8)", () => {
  // (the list's seeds, BUILD-29-j: 2-9's seed list exists)
  for (const d of BOTH) for (const s of LISTED) {
    const st = built(s, d);
    const guards = st.enemies.filter((e: Any) => e.royal && e.post !== undefined);
    assert.equal(guards.length, 1, `${d} seed ${s}: one posted guard (found ${guards.length})`);
    const barge = (st.rivers ?? []).find((r: Any) => st.platforms.some((p: Any) => p.drift?.look === 'barge' && p.drift.x0 >= r.x0 - 1 && p.drift.x0 <= r.x1));
    assert.ok(barge, `${d} seed ${s}: the barge's river`);
    assert.ok(guards[0].x > barge.x1, `${d} seed ${s}: the guard at x ${Math.round(guards[0].x)} stands past the barge's river (ends x ${Math.round(barge.x1)})`);
  }
});

test("2-9: the King's Court is dressed before the shrine on EVERY listed seed, both settings, as Play finishes it: the lily carpet, the dais, the throne on it, each whole on the shrine's ground, the shrine past the throne (all the art used, BUILD-29-o)", () => {
  let laid = 0;
  for (const d of BOTH) for (const s of LISTED) {
    const row = listedStage(STAGE_29)!;
    const st = playFinish(row, buildGen2Stage({ config: cfg, kit: row.kit(), seed: s, difficulty: d }) as never, d) as Any;
    const court = (st.proto?.decor ?? []).filter((q: Any) => ['lilyCarpet', 'dais', 'throne'].includes(q.n));
    const of = (n: string) => court.filter((q: Any) => q.n === n);
    assert.equal(of('throne').length, 1, `${d} seed ${s}: one throne`);
    assert.equal(of('dais').length, 1, `${d} seed ${s}: one dais`);
    assert.ok(of('lilyCarpet').length >= 2, `${d} seed ${s}: ${of('lilyCarpet').length} carpets, under 2`);
    const [throne] = of('throne'), [dais] = of('dais');
    assert.equal(throne.x, dais.x, `${d} seed ${s}: the throne on its dais`);
    assert.equal(st.exitTotemX - throne.x, COURT_29.throneToShrine, `${d} seed ${s}: the shrine past the throne`);
    for (const q of court) {
      // (each piece whole on solid ground at the shrine's height: never over the barge's river)
      const G = q.b - (q.n === 'throne' ? -COURT_29.throneLift : q.n === 'dais' ? COURT_29.daisSink : COURT_29.carpetSink);
      // (a carpet is a LOW clump he walks through: drawn under half his height, never a stepped heap to climb, BUILD-29-p)
      if (q.n === 'lilyCarpet') assert.ok(!tooTall(q), `${d} seed ${s}: a carpet ${carpetH(q).toFixed(1)} px tall, over half Pokey's ${POKEY_UNITS}`);
      const L = q.x - q.w / 2, R = q.x + q.w / 2;
      const under = st.platforms.filter((p: Any) => p.type === 'solid' && Math.abs(p.y - G) <= 2 && p.x < R && p.x + p.width > L);
      const covered = under.reduce((a: number, p: Any) => a + Math.min(R, p.x + p.width) - Math.max(L, p.x), 0);
      assert.ok(covered >= q.w - 1, `${d} seed ${s}: ${q.n} at ${q.x} stands on ${covered} of its ${q.w} px`);
    }
    laid++;
  }
  assert.equal(laid, 2 * LISTED.length);
});

// ---- BUILD-29-p: the court's polish (the lead's stills-o judgement): low carpets, the dais's pale shadow, and nothing laid in the court ----
const POKEY_UNITS: number = JSON.parse(fs.readFileSync(path.join(root, 'src/game/art/inventory/w2.json'), 'utf8')).pokey_units;
const carpetH = (q: { w: number }) => (q.w * W2_FRAMES.lilyCarpet.h) / W2_FRAMES.lilyCarpet.w;
const tooTall = (q: { w: number }) => carpetH(q) > POKEY_UNITS / 2;
const COURT_N = ['lilyCarpet', 'dais', 'throne'];

test('2-9 court, the bar: a carpet under half Pokey\'s height passes; the old court\'s 200 px heap (1.4x him) is named (plant)', () => {
  assert.ok(!tooTall({ w: COURT_29.clumpW }), `the clump ${carpetH({ w: COURT_29.clumpW }).toFixed(1)} px`);
  assert.ok(tooTall({ w: 200 }), 'PLANT: the old 200 px carpet must be named too tall');
  assert.ok(carpetH({ w: 200 }) / POKEY_UNITS > 1.3, 'the old heap was over 1.3x his height');
});

test('2-9 court: the dais\'s and throne\'s pale painted ground shadow is re-tinted dark, the painted piece kept (plant: a pale grey kept)', () => {
  const t = shadowRetint(210, 200, 190, 250)!;
  assert.ok(t && t[0] < 60 && t[1] < 60 && t[2] < 60 && t[3] > 0 && t[3] < 250, `the pale band ${t}`);
  assert.equal(shadowRetint(130, 145, 95, 255), null, 'a green pad is kept');
  assert.equal(shadowRetint(150, 125, 95, 255), null, 'the bamboo is kept');
  assert.equal(shadowRetint(240, 240, 240, 10), null, 'an empty pixel is kept');
  assert.notDeepEqual(shadowRetint(226, 219, 211, 237), [226, 219, 211, 237], 'PLANT: the band\'s own mean colour (measured) is changed');
});

/** every piece laid in the court on a stage as Play builds it: dressing within DECOR_CLEAR of a court piece's side, a creature's box over it */
function courtFaults(st: Any): string[] {
  const court = (st.proto?.decor ?? []).filter((q: Any) => COURT_N.includes(q.n));
  const out: string[] = [];
  for (const q of court) {
    const L = q.x - q.w / 2 - DECOR_CLEAR, R = q.x + q.w / 2 + DECOR_CLEAR;
    for (const d of [...(st.proto?.dress ?? []), ...(st.dress ?? [])]) if (d.x > L && d.x < R && Math.abs(d.b - q.b) < 80) out.push(`dress ${d.n}@${Math.round(d.x)} in ${q.n}@${q.x}`);
    for (const e of st.enemies ?? []) if (e.x + (e.width ?? 0) > L && e.x < R && Math.abs(e.y + (e.height ?? 0) - q.b) < 120) out.push(`${e.type}@${Math.round(e.x)} in ${q.n}@${q.x}`);
  }
  return out;
}

test('2-9 court: nothing is laid in it, on EVERY listed seed, both settings, as Play builds it (dressing and creatures clear by a margin; plants: a frog on the dais, the court unmarked)', () => {
  const c = { ...cfg, unlocked: true };
  let built = 0, withCourt = 0;
  for (const d of BOTH) for (let v = 0; v < LISTED.length; v++) {
    setLayoutVariant(v);
    let st: Any;
    try { st = generateStage(c, d); } finally { setLayoutVariant(null); }
    built++;
    const court = (st.proto?.decor ?? []).filter((q: Any) => COURT_N.includes(q.n));
    if (!court.length) continue;
    withCourt++;
    assert.deepEqual(courtFaults(st), [], `${d} layout ${v} (seed ${st.seed ?? '?'})`);
    if (built === 1) {
      // (PLANTS, on the first: a frog set on the dais is named; dressClear refuses it while the court is marked, and lets it be unmarked)
      const dais = court.find((q: Any) => q.n === 'dais');
      const frog = { n: 'w2Frog', x: dais.x, b: dais.b };
      assert.ok(courtFaults({ ...st, proto: { ...st.proto, dress: [frog] } }).length > 0, 'PLANT: a frog on the dais is named');
      assert.equal(dressClear(frog, st), false, 'the marked dais refuses dressing');
      const bare = { ...st, proto: { ...st.proto, decor: st.proto.decor.map((q: Any) => ({ ...q, clear: false })) } };
      assert.equal(dressClear(frog, bare), true, 'PLANT: with the court unmarked, the frog would be laid (the rule is what clears it)');
    }
  }
  console.log(`  court clearance: ${built} stages built as Play builds them, the court on ${withCourt}, nothing laid in it on any`);
  assert.equal(built, 2 * LISTED.length);
  assert.ok(withCourt >= built * 0.9, `the court on ${withCourt} of ${built}`);
});
