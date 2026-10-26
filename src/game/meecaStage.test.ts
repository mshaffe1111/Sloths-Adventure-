/**
 * Meeca's stage (5-M): the stage as built (16 seeds), its words, its save record, its place in the list and its HUD. The real-engine
 * playthroughs are meecaReal.test.ts.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStage } from './levelCheck.ts';
import {
  buildMeecaStage, carveChars, carveSeconds, FILE_GAP, MARCH, MEECA_G, MEECA_STAGE_SECONDS, meecaGeneratedStage, PELL_AHEAD, TELL,
  TURN_BACK,
} from './meecaStage.ts';
import { MEECA_CARD, MEECA_CAUGHT, MEECA_ENDING, MEECA_GOAL, MEECA_THOUGHTS, MEECA_WARNINGS, PELL_CATCH, wordsIn } from './meecaLines.ts';
import { carvingsForPokey, loadCarved, markCarvingsDone, parseCarved, recordCarving } from './meecaCarved.ts';
import { EXTRA_STAGES, MEECA_STAGE_ID, meecaStageConfig, withExtraStages } from './extraStages.ts';
import { STAGE_SECONDS } from './protoStage.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { levelConfig } from './realPlay.ts';
import { isSaveKey } from './saveFile.ts';
import { goalInfo } from '../components/hud/goalInfo.ts';
import { stageMusic } from '../audio/scenes.ts';
import { composeStageFull } from '../audio/composer.ts';
import { w5Mood } from './w5Backdrop.ts';
import { maxRise } from './protoCheck.ts';

const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);

test('5-M: every seed builds a stage the checks pass, all on one unbroken path, with the branch only the climb reaches', () => {
  for (const s of SEEDS) {
    const st = meecaGeneratedStage(meecaStageConfig(), s);
    const res = validateStage(st);
    // (no shrine: the stage ends with the blanket scene, so the check's exit totem does not apply)
    const errors = res.errors.filter((e) => !/exit totem/.test(e));
    assert.deepEqual(errors, [], `seed ${s}`);
    for (const p of st.platforms) assert.ok(res.reachableIds.includes(p.id), `seed ${s}: platform ${p.id} is reachable`);
    const m = st.proto.meeca!;
    // the path: one piece of ground from end to end, nothing to fall into, nothing that crumbles, no animals, nothing to pick up
    const path = st.platforms[0];
    assert.ok(path.x <= 0 && path.x + path.width >= m.width && path.y === MEECA_G, `seed ${s}`);
    assert.ok(st.platforms.every((p) => p.type === 'solid'), `seed ${s}: no crumbling platforms`);
    assert.equal(st.enemies.length, 0);
    assert.equal(st.collectibles.length, 0);
    assert.equal(st.waterY, undefined);
    // the branch of the fourth tree: the climb reaches it, a jump does not
    const tr = m.trunks.find((t) => t.climb)!;
    assert.ok(MEECA_G - tr.standY > maxRise() + 20, `seed ${s}: the branch is above any jump`);
    const without = { ...st, vines: [] };
    assert.ok(!validateStage(without).reachableIds.includes(tr.climb!.branch), `seed ${s}: no way up without the climb`);
    assert.ok(res.reachableIds.includes(tr.climb!.branch), `seed ${s}: the climb reaches it`);
    const vine = st.vines.find((v) => v.id === tr.climb!.vine)!;
    assert.equal(vine.vineType, 'tree_climb', 'a trunk to climb: straight up and down always climbs it');
    // nothing lies past the last tree but the walk of the column (no shrine; the stage ends at the last tree)
    assert.ok(m.width - m.trunks[m.trunks.length - 1].x < 1500, `seed ${s}`);
  }
});

test('5-M: the trees in order, each a warning in turn, with room to stand and a fern where the second guard looks back', () => {
  for (const s of SEEDS) {
    const m = buildMeecaStage(s);
    assert.deepEqual(m.trunks.map((t) => t.id), MEECA_WARNINGS.map((w) => w.id));
    for (let i = 1; i < m.trunks.length; i++) assert.ok(m.trunks[i].x - m.trunks[i - 1].x > 1100, `seed ${s}: trees far enough apart for a march`);
    // the opening: the 5-1 carving with all but its "M." already cut (the same words and size as 5-1's first tree)
    const t0 = m.trunks[0];
    assert.deepEqual([...t0.lines], ['POKEY.', "DON'T", 'SIT.', 'M.']);
    assert.equal(t0.size, 32);
    assert.equal(carveChars(t0.lines) - t0.preCut, 2);
    // the second guard looks back from the third tree on, and every tree from there has a fern within a run of its stand
    for (const tr of m.trunks.slice(2)) {
      assert.ok(m.ferns.some((f) => Math.abs(f.y - tr.standY) < 1 && Math.abs(f.x - tr.standX) < 120), `seed ${s}: a fern by ${tr.id}`);
    }
    // where the column halts, the guards who look back fit on an upright screen (520 across) with her at the tree, and a margin
    for (const tr of m.trunks.slice(1)) {
      const slot = tr.x + tr.haltPast;
      const far = Math.max(...m.stretches[tr.index].watch.map((w) => slot + m.marchers[w.who].ahead)) + 40;
      assert.ok(far - (tr.standX - 50) <= 520, `seed ${s}: ${tr.id} spans ${far - tr.standX + 50}`);
    }
  }
});

test('5-M: the guards\' look-backs are fair: a tell of at least 0.6 s, windows to carve in, the opening watched by nobody', () => {
  assert.ok(TELL >= 0.6, 'the tell');
  assert.ok(TURN_BACK > 0.5);
  for (const s of SEEDS) {
    const m = buildMeecaStage(s);
    assert.equal(m.stretches[0].watch.length, 0, 'nobody looks back in the opening');
    assert.equal(m.stretches[1].watch.length, 1, 'only Pell at first');
    assert.equal(m.marchers[m.stretches[1].watch[0].who].kind, 'pell');
    for (const st of m.stretches.slice(1)) {
      for (const w of st.watch) {
        // each window with his back turned is long enough to cut several letters and get back (a run of 300 px is about a second)
        assert.ok(w.away >= 5.5, `seed ${s}: a window of ${w.away.toFixed(1)} s`);
        assert.ok(w.look <= 2.2);
      }
      if (st.watch.length === 2) assert.ok(Math.abs(st.watch[0].offset - st.watch[1].offset) >= 2.5, 'the two never turn together at first');
    }
    // windows get shorter as the stage goes on (harder, never unfair)
    const pell = m.stretches.slice(1).map((st) => st.watch[0].away);
    for (let i = 1; i < pell.length; i++) assert.ok(pell[i] <= pell[i - 1] + 0.61, `seed ${s}`);
  }
});

test('5-M: about 2.5 to 3 minutes: the march, the cutting and the ending take over two minutes even with no waiting', () => {
  assert.equal(STAGE_SECONDS[MEECA_STAGE_ID], MEECA_STAGE_SECONDS);
  for (const s of SEEDS) {
    const m = buildMeecaStage(s);
    const last = m.trunks[m.trunks.length - 1];
    const march = (last.x + last.haltPast - m.slot0) / MARCH;
    const carving = m.trunks.reduce((a, t) => a + carveSeconds(t.lines, t.preCut), 0);
    // the ending at its quickest: Pell's turn, his walk to her, the catch, six lines tapped through, the fade
    const ending = TELL + 52 / (150 * 0.8) + 1 + MEECA_ENDING.length * 0.45 + 1.4;
    assert.ok(march + carving + ending >= 120, `seed ${s}: ${(march + carving).toFixed(0)} s`);
    assert.ok(march + carving <= 200, `seed ${s}: ${(march + carving).toFixed(0)} s`);
    assert.ok(PELL_AHEAD < FILE_GAP + 10);
  }
});

test("5-M: Meeca's words: thoughts of 8 words or fewer naming the thumb move, warnings short and in capitals, Pell never contracts", () => {
  for (const th of Object.values(MEECA_THOUGHTS)) assert.ok(wordsIn(th.text) <= 8, th.text);
  for (const t of MEECA_CAUGHT) assert.ok(wordsIn(t) <= 8, t);
  // each that teaches a move names the thumb's part in it
  for (const id of ['carve', 'rejoin', 'slip', 'back', 'fern', 'climb'] as const) assert.match(MEECA_THOUGHTS[id].text, /Thumb|Slide|hold/i, id);
  // the two lines Matt approved in the mock-ups
  assert.equal(MEECA_THOUGHTS.carve.text, 'Hairpin. Good. Thumb on the trunk, and hold.');
  assert.equal(MEECA_THOUGHTS.slip.text, "Okay. His back's turned. Slide out.");
  // no Dot anywhere in her stage
  for (const t of [...Object.values(MEECA_THOUGHTS).map((x) => x.text), ...MEECA_CAUGHT]) assert.ok(!/\bDot\b/.test(t));
  assert.equal(MEECA_WARNINGS.length, MEECA_GOAL);
  for (const w of MEECA_WARNINGS) {
    for (const l of w.lines) {
      assert.equal(l, l.toUpperCase(), 'cut in capitals');
      assert.ok(l.length <= 8, `${l}: a line fits the bark`);
    }
    assert.match(w.lines[w.lines.length - 1], /M\.$/, 'signed M.');
  }
  // Pell: over-polite, no contractions (VOICE.md)
  for (const l of [...MEECA_ENDING.filter((x) => x.who === 'Lieutenant Pell').map((x) => x.text), ...PELL_CATCH]) assert.ok(!/\w'\w/.test(l), l);
  assert.ok(MEECA_ENDING.some((l) => l.text === 'It is not from the General.' && l.who === 'Lieutenant Pell'));
  assert.ok(MEECA_ENDING.some((l) => l.text === 'Please do not thank me. It is embarrassing.'));
  for (const l of MEECA_ENDING) assert.ok(wordsIn(l.text) <= 12, l.text);
  assert.deepEqual(MEECA_CARD.sub, ['The Orchid Sanctuary, at dusk.', 'You are Meeca.']);
  assert.deepEqual(MEECA_CARD.title, ['Three days', 'earlier']);
});

test('5-M: what she carves is kept with the game (a save file carries it, a new game clears it) for 5-6 to show', () => {
  const m = new Map<string, string>();
  const store = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
  assert.deepEqual(carvingsForPokey(store), []);
  recordCarving({ id: 'eat', lines: ["DON'T", 'EAT.', 'M.'], along: 0.3, high: false, caught: 1 }, store);
  recordCarving({ id: 'sit', lines: ['POKEY.', "DON'T", 'SIT.', 'M.'], along: 0.05, high: false, caught: 0 }, store);
  recordCarving({ id: 'eat', lines: ["DON'T", 'EAT.', 'M.'], along: 0.31, high: false, caught: 0 }, store);
  assert.deepEqual(carvingsForPokey(store).map((c) => [c.id, c.along]), [['sit', 0.05], ['eat', 0.31]]);
  assert.equal(loadCarved(store).done, false);
  assert.equal(markCarvingsDone(store).done, true);
  // a damaged or hand-made record is nothing carved
  assert.deepEqual(parseCarved('{nope').carvings, []);
  assert.deepEqual(parseCarved(JSON.stringify({ v: 1, carvings: [{ id: 'evil', lines: ['X'] }] })).carvings, []);
  assert.ok(isSaveKey('sloth_w5_carved'));
  assert.ok(isSaveKey('sloth_lvl_5-M') && isSaveKey('sloth_lvl_4-D'), 'the extra stages\' results go with a save too');
  assert.ok(!isSaveKey('sloth_lvl_5-X'));
});

test("5-M: it sits after 5-5 in the list (as 4-D after 4-5), is built by the generator, plays at dusk to her lullaby, and the HUD counts 'M. n/5'", () => {
  assert.ok(EXTRA_STAGES.some((e) => e.after === '5-5' && e.config().id === MEECA_STAGE_ID));
  const list = withExtraStages([levelConfig('5-5'), levelConfig('5-6')], true);
  assert.deepEqual(list.map((l) => l.id), ['5-5', '5-M', '5-6']);
  setLayoutVariant(3);
  const st = generateStage(meecaStageConfig());
  setLayoutVariant(null);
  assert.ok((st as { proto?: { meeca?: unknown } }).proto?.meeca, 'the generator hands 5-M to its builder');
  assert.equal(st.config.targetCount, MEECA_GOAL);
  assert.equal(w5Mood(MEECA_STAGE_ID), 'dusk');
  const g = goalInfo({ ...meecaStageConfig(), targetCount: 5 });
  assert.equal(g.kind, 'count');
  assert.deepEqual(g.icon, { kind: 'drawn', name: 'carving' });
  // the music: the composer's World 5 sound at the sneak pace, quoting the lament (her lullaby sung in the minor), slower
  const mus = stageMusic(5, MEECA_STAGE_ID, 0, 123);
  assert.equal(mus, stageMusic(5, MEECA_STAGE_ID, 0, 999), 'the same piece every time');
  assert.ok((mus.tempo ?? 1) < 0.95);
  const info = composeStageFull(5, mus.seed!, 'sneak').info;
  assert.equal(info.tune, 'lament');
});
