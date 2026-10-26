/**
 * 5-5 Caught in Silk (w5Stages.ts, its own block): the rescue of creatures wrapped in cocoons, the pouch scene at the rest branch where
 * the orchids hang in rows (reference/STORY-REWRITE.md World 5, "The pouch"), the silk line up to the high web, the keepsake in a fern,
 * and the hook for Meeca's stage after it. Built on the 16 test rolls (1 + 37 i), checked by the level check, and played in the real
 * engine (realPlay.ts) for the punches, the scene and the silk.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, G, HAND_STAGES, STAGE_SECONDS, stageSeconds } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';
import { levelConfig, RealPlay } from './realPlay.ts';
import { reachJump, DOUBLE_RISE } from './physics.ts';
import { PAST_SHRINE } from './rules.ts';
import { findForStage } from './finds.ts';
import { COCOON, SIT, W5_TEACH, type W5Extras } from './w5Kit.ts';
import { COCOON_LOOK, cocoonWriggle } from './w5Look.ts';
import { findTarget } from './dotGuidePerch.ts';
import { emptyGuideView, type GuideView } from './dotGuideView.ts';
import { W5_POUCH } from './w5Lines.ts';
import { COCOON_GOAL_55, type W5Info } from './w5Stages.ts';
import { engineGuideLine } from './dotLines.ts';
import { GuideQueue, wordCount } from './dotGuide.ts';
import { w5BackdropStem } from './w5Backdrop.ts';
import { EXTRA_STAGES, PLANNED_STAGES, withExtraStages } from './extraStages.ts';
import { stageSpec } from './stagePlan.ts';
import type { Platform } from './types.ts';

/** a first-timer: no tip of 5-5 heard on this phone yet (tipMemory.ts; the tests before this one may have heard them) */
function forgetTips() {
  try {
    localStorage.removeItem('sloth_tips_5-5');
  } catch {
    /* no storage */
  }
}
const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
type Built = ReturnType<typeof buildProtoStage> & { w5info: W5Info; proto: { w5: W5Extras } };
const build = (s: number) => buildProtoStage(levelConfig('5-5'), s, HAND_STAGES['5-5']) as Built;
const w5Of = (sim: RealPlay) => (sim.stage as unknown as { proto: { w5: W5Extras } }).proto.w5;
/** a fist thrown standing on a platform at height y, facing the cocoon from beside it, lands by its middle (w5Kit punchReachesCocoon) */
const punchable = (c: { x: number; y: number }, p: Platform) =>
  c.x >= p.x - 10 && c.x <= p.x + p.width + 10 && Math.abs(p.y - 40 - (c.y - COCOON.mid)) < COCOON.reach * 0.6;

test('5-5 is hand-built: a rescue, about three minutes, in the dusk (the other take from 5-4), free 12 creatures', () => {
  assert.equal(HAND_STAGES['5-5'], '5-5');
  assert.ok(STAGE_SECONDS['5-5'] >= 170 && STAGE_SECONDS['5-5'] <= 200);
  const cfg = levelConfig('5-5');
  assert.equal(cfg.objectiveType, 'rescue');
  assert.equal(cfg.name, 'Caught in Silk');
  assert.match(stageSpec(5, 5)!.desc!, /Free \{n\} creatures wrapped in the silk/);
  assert.equal(build(1).config.targetCount, COCOON_GOAL_55);
  assert.equal(w5BackdropStem('5-5'), 'w5dusk1');
  assert.notEqual(w5BackdropStem('5-5'), w5BackdropStem('5-4'));
});

test('5-5: every roll can be finished, runs its full length, holds the goal half again over, and keeps nothing past the shrine', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const res = validateStage(st);
    assert.ok(res.ok, `seed ${s}: ${res.errors.join('; ')}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1);
    assert.ok(st.meta!.timing!.layoutSeconds >= stageSeconds('5-5'), `seed ${s}`);
    assert.ok((st.proto.movedPickups ?? 0) <= 2, `seed ${s}: ${st.proto.movedPickups} pickups moved`);
    const w5 = st.proto.w5;
    assert.equal(w5.mood, 'dusk');
    const lim = st.exitTotemX + PAST_SHRINE;
    for (const c of st.collectibles) assert.ok(c.x <= lim, `seed ${s}: ${c.type} past the shrine`);
    for (const c of w5.cocoons ?? []) assert.ok(c.x <= lim, `seed ${s}: a cocoon past the shrine`);
    for (const t of w5.threads ?? []) assert.ok(t.x0 <= lim);
    for (const e of st.enemies) assert.ok(e.patrolMaxX <= lim, `seed ${s}: a spider past the shrine`);
    // nothing crumbles anywhere, so nothing crumbling is ever needed
    assert.ok(!st.platforms.some((p) => p.type === 'fragile' || p.crumbleAfter !== undefined), `seed ${s}: a crumbling platform`);
    // every cocoon hangs where a standing punch lands, from a ledge the level check reaches; enough of them off the web for the goal
    const reach = new Set(res.reachableIds);
    const web = new Set(st.w5info.web55!.cocoons);
    const cocoons = w5.cocoons!;
    cocoons.forEach((c, i) => {
      assert.ok(st.platforms.some((p) => reach.has(p.id) && punchable(c, p)), `seed ${s}: the cocoon at (${c.x}, ${c.y}) cannot be punched`);
    });
    const plain = cocoons.filter((_, i) => !web.has(i)).length;
    assert.ok(plain >= Math.ceil(COCOON_GOAL_55 * 1.25), `seed ${s}: ${plain} cocoons off the web for a goal of ${COCOON_GOAL_55}`);
    assert.ok(cocoons.length >= COCOON_GOAL_55 * 1.5, `seed ${s}: ${cocoons.length} cocoons for a goal of ${COCOON_GOAL_55}`);
    // flags often, hearts on the way, the jumps makeable
    const f = st.w5info.flagSeconds;
    for (let i = 1; i < f.length; i++) assert.ok(f[i] - f[i - 1] <= 45, `seed ${s}: ${Math.round(f[i] - f[i - 1])} s between flags`);
    assert.ok(st.collectibles.filter((c) => c.type === 'heart').length >= 3);
    for (const g of st.w5info.gaps) assert.ok(g.far - g.edge <= reachJump(0, g.double) * (g.double ? 0.82 : 0.95), `seed ${s}: a ${g.far - g.edge} px gap`);
  }
});

test('5-5: the first cocoons hang low over the ground, before any that needs a branch, the web or a spider', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const cocoons = st.proto.w5.cocoons!.slice().sort((a, b) => a.x - b.x);
    for (const c of cocoons.slice(0, 3)) assert.equal(c.y, G - 18, `seed ${s}: the cocoon at ${c.x} is not on the ground`);
    const firstSpider = Math.min(...st.enemies.map((e) => e.patrolMinX));
    assert.ok(cocoons[2].x < firstSpider, `seed ${s}: a spider before the third cocoon`);
    // (room after the start for the fern's line and the goal card, before the first one)
    assert.ok(cocoons[0].x > 2700, `seed ${s}: the first cocoon at ${cocoons[0].x}`);
  }
});

test('5-5: the high web only a silk line reaches (above any jump), over ground or a soft pit, with its cocoons on top of the goal', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const web = st.w5info.web55!;
    const v = st.vines.find((q) => q.id === web.vine)!;
    assert.ok(v.silk && v.isSwingingVine, 'a silk line, swung like a liana');
    const br = st.platforms.find((p) => p.id === web.branch)!;
    assert.ok(G - br.y > DOUBLE_RISE, `seed ${s}: the web is ${G - br.y} px up, a double jump reaches it`);
    assert.ok(validateStage(st).reachableIds.includes(br.id), `seed ${s}: the silk line does not reach the web`);
    // without the silk line, it is out of reach: the line is what gets him up there
    const without = { ...st, vines: st.vines.filter((q) => q.id !== v.id) };
    assert.ok(!validateStage(without).reachableIds.includes(br.id), `seed ${s}: the web is reachable without the silk line`);
    // and the stage is finishable without the web: its cocoons are extras
    assert.ok(validateStage(without).ok, `seed ${s}`);
    assert.equal(web.cocoons.length, 3);
    assert.ok(st.proto.hints.some((h) => h.text === W5_TEACH.silk && h.x < v.x - 800), 'the silk line\'s line comes well ahead');
  }
});

test("5-5: the rest branch where the orchids hang in rows, a hop up, with nothing that bites near it, and the keepsake's fern", () => {
  for (const s of SEEDS) {
    const st = build(s);
    const rest = st.proto.w5.rest!;
    assert.ok(rest && rest.x1 - rest.x0 >= 600, `seed ${s}`);
    assert.ok(st.platforms.some((p) => p.style === 'branch' && p.y === rest.y && p.x === rest.x0), 'a branch');
    assert.ok(G - rest.y <= 95, 'a hop up (from its stump)');
    assert.ok(st.proto.w5.decor!.filter((d) => /^orchidRow/.test(d.n) && d.x > rest.x0 && d.x < rest.x1).length >= 4, 'orchids hanging in rows over it');
    // (nothing that bites for a good way either side: the scene is read in peace)
    for (const e of st.enemies) assert.ok(e.patrolMaxX < rest.x0 - 600 || e.patrolMinX > rest.x1 + 1800, `seed ${s}: a spider by the rest branch`);
    // early in the stage (it is halfway through the world): the long scene plays out well before the shrine
    assert.ok(rest.x0 > st.exitTotemX * 0.07 && rest.x0 < st.exitTotemX * 0.3, `seed ${s}: the rest branch at ${rest.x0} of ${st.exitTotemX}`);
    const fern = st.collectibles.find((c) => c.type === 'find')!;
    assert.ok(fern && fern.findId === 'w5_keepsake' && fern.hidden, 'the pressed petal, in a Hush Fern');
    assert.equal(findForStage(5, 5)?.id, 'w5_keepsake');
    assert.ok(!st.proto.w5.decor!.some((d) => d.n === 'fern' && Math.abs(d.x - fern.x) < 200), 'no other fern beside it');
  }
});

test("the pouch scene keeps the script's lines (12 words or fewer each), with its speakers, and a breath between them", () => {
  const full = [
    'They stopped to rest where the orchids hung in rows.', 'Pokey stood, because the note said so.', 'Dot touched the pouch at her side. Then she touched it again.',
    'You keep checking that pouch.', 'It\'s a thing. It isn\'t for you.', 'Who\'s it for?', 'Somebody I\'m scared of.', 'The General?',
    'It\'s not him I\'m scared of. It\'s what it says, and what he does when he reads it, and that I... that I took so—', 'She stopped.',
    'Then give it to him when you\'re ready. Not before.', 'And what if it\'s too late by then?', 'Slow isn\'t stopped.',
    'Is that true, or is that just something you say?', 'I don\'t know yet. It hasn\'t been wrong.', 'Dot let go of the pouch. A minute later her wing was back on it.',
  ].join(' ');
  assert.equal(W5_POUCH.map((l) => l.text).join(' '), full);
  const q = new GuideQueue();
  const lines = [];
  for (const l of W5_POUCH) {
    assert.ok(wordCount(l.text) <= 12, `${l.text}: ${wordCount(l.text)} words`);
    const g = engineGuideLine(l.text, '5-5', { dot: true })!;
    assert.ok(g, l.text);
    assert.equal(g.text, l.text);
    assert.equal(g.who, l.who, l.text);
    assert.equal(g.kind, 'story', 'a story line (the Story lines switch says it, as the asides)');
    assert.equal(g.scene, true);
    assert.equal(g.move, undefined);
    lines.push(g);
  }
  assert.deepEqual([...new Set(W5_POUCH.map((l) => l.who))].sort(), ['Dot', 'Petal', 'Pokey']);
  // each sent as the one before it ends (as w5Play.ts sends them), they follow one another after a breath, not a story aside's 8 s wait
  const ends: number[] = [];
  const waits: number[] = [];
  let k = 0;
  for (let t = 0; t < 300000 && waits.length < W5_POUCH.length; t += 100) {
    if (k === ends.length && k < lines.length) q.push(lines[k++], t);
    q.tick(t, { danger: false, moveCount: () => 0 });
    for (const ev of q.drain()) {
      if (ev.type === 'start') waits.push(t - (ends.at(-1) ?? t));
      else ends.push(t);
    }
  }
  assert.equal(waits.length, W5_POUCH.length);
  for (let i = 1; i < waits.length; i++) assert.ok(waits[i] <= 1000, `line ${i} waited ${waits[i]} ms after the one before`);
});

test('5-5 in the real engine: the pouch scene plays at the rest branch in order, and standing there through it the silk never creeps', () => {
  const sim = new RealPlay('5-5', 1);
  sim.safe = false;
  const rest = w5Of(sim).rest!;
  const n0 = sim.said.length;
  sim.stand(rest.x0 + 120, rest.y);
  for (let i = 0; i < 3; i++) sim.frame({ right: true });
  const hp = sim.p.hp;
  let maxSilk = 0;
  // he stands on the branch for the whole scene (about a minute and a half)
  for (let i = 0; i < 30 * 150 && (i < 30 || sim.e.w5.restPlaying(sim.e.gameTime)); i++) {
    sim.frame();
    maxSilk = Math.max(maxSilk, sim.e.w5.silk);
  }
  assert.ok(!sim.e.w5.restPlaying(sim.e.gameTime), 'the scene is over within two and a half minutes');
  const said = sim.said.slice(n0).map((s) => s.text);
  const scene = said.filter((s) => W5_POUCH.some((l) => l.text === s));
  assert.deepEqual(scene, W5_POUCH.map((l) => l.text), 'every line, in order');
  assert.equal(maxSilk, 0, 'no silk while he rests through the scene');
  assert.equal(sim.p.hp, hp);
  assert.ok(!said.includes(W5_TEACH.sit) && !said.includes(W5_TEACH.wrapped));
  // the last line comes a while after the one before it ("A minute later")
  const at = (text: string) => sim.said.find((s) => s.text === text)!.t;
  assert.ok(at(W5_POUCH.at(-1)!.text) - at(W5_POUCH.at(-2)!.text) >= 15);
  // once it is over, standing still there is sitting again: the silk comes
  sim.wait(SIT.drowse + SIT.creep);
  assert.ok(sim.e.w5.silk > 0 || sim.p.hp < hp, 'after the scene, the rule is back');
});

test('5-5 in the real engine: off the rest branch, while the scene plays, standing still still brings the silk', () => {
  const sim = new RealPlay('5-5', 1);
  sim.safe = false;
  const rest = w5Of(sim).rest!;
  sim.stand(rest.x1 + 160, G);
  for (let i = 0; i < 3; i++) sim.frame({ right: true });
  sim.wait(SIT.drowse + 1);
  assert.ok(sim.e.w5.restPlaying(sim.e.gameTime), 'the scene is playing');
  assert.ok(sim.e.w5.silk > 0, 'the silk creeps off the branch');
});

test('5-5 in the real engine: three taps free a creature, Dot says what to do first, and the goal counts it', () => {
  forgetTips();
  const sim = new RealPlay('5-5', 1);
  const cocoons = w5Of(sim).cocoons!.slice().sort((a, b) => a.x - b.x);
  const c = cocoons[0];
  // walk up to the first cocoon, then stop and tap
  sim.stand(c.x - 700, G);
  for (let i = 0; i < 200 && sim.p.x < c.x - 50; i++) sim.frame({ right: true });
  const tip = sim.said.find((s) => s.text === W5_TEACH.cocoon);
  assert.ok(tip && tip.x < c.x - 250, `Dot's cocoon line came at ${tip?.x}, the cocoon at ${c.x}`);
  assert.equal(engineGuideLine(W5_TEACH.cocoon, '5-5')!.text, 'Somebody\'s in there! Tap to punch it open.');
  assert.ok(wordCount(engineGuideLine(W5_TEACH.cocoon, '5-5')!.text) <= 8);
  assert.equal(engineGuideLine(W5_TEACH.cocoon, '5-5')!.move, 'punch');
  const before = sim.p.crittersRescued;
  for (let k = 0; k < 3; k++) {
    sim.frame({ punch: true });
    for (let i = 0; i < 14; i++) sim.frame();
  }
  assert.equal(sim.p.crittersRescued, before + 1, 'freed');
  // the creature flutters off (drawn for a moment after), and a freed cocoon takes no more
  for (let k = 0; k < 3; k++) {
    sim.frame({ punch: true });
    for (let i = 0; i < 14; i++) sim.frame();
  }
  assert.equal(sim.p.crittersRescued, before + 1);
});

test('5-5 in the real engine: every cocoon off the web is freed by three taps from where it hangs', () => {
  const st = build(1);
  const web = new Set(st.w5info.web55!.cocoons);
  const sim = new RealPlay('5-5', 1);
  const cocoons = w5Of(sim).cocoons!;
  cocoons.forEach((c, i) => {
    const p = st.platforms.filter((q) => punchable(c, q)).sort((a, b) => b.y - a.y)[0];
    const before = sim.p.crittersRescued;
    sim.stand(c.x - 45, p.y);
    sim.p.facing = 1;
    for (let k = 0; k < 3; k++) {
      sim.frame({ punch: true });
      for (let j = 0; j < 14; j++) sim.frame();
    }
    assert.equal(sim.p.crittersRescued, before + 1, `cocoon ${i} at (${c.x}, ${c.y})${web.has(i) ? ' in the web' : ''}`);
  });
});

test("Meeca's stage has its place after 5-5 in the stage list (planned, not built yet: Dot's flight 4-D sits after 4-5 the same way)", () => {
  const m = PLANNED_STAGES.find((p) => p.after === '5-5')!;
  assert.ok(m, 'a planned stage after 5-5');
  const c = m.config();
  assert.equal(c.worldIndex, 5);
  assert.ok(!EXTRA_STAGES.some((e) => e.after === '5-5'), 'not in the list until it is built');
  const list = withExtraStages([levelConfig('5-4'), levelConfig('5-5'), levelConfig('5-6')], true);
  assert.deepEqual(list.map((l) => l.id), ['5-4', '5-5', '5-6']);
  assert.equal(w5BackdropStem(c.id), 'w5dusk2', 'dusk, the other take from 5-5');
});

// ───────────────────────────── QA 4 (the expert at 320x782 upright, v198) ─────────────────────────────

test('5-5: the first cocoon is tied across the path: he cannot walk or hop past it until three taps punch it open', () => {
  for (const s of SEEDS) {
    const st = build(s);
    const cocoons = st.proto.w5.cocoons!;
    const first = cocoons.slice().sort((a, b) => a.x - b.x)[0];
    assert.equal(first.block, true, `seed ${s}: the first is tied across the path`);
    assert.equal(cocoons.filter((c) => c.block).length, 1, `seed ${s}: only the first`);
    // (on the ground, before the rest branch: taught where it is first met, World 5's way)
    assert.equal(first.y, G - 18);
    assert.ok(first.x < st.proto.w5.rest!.x0, `seed ${s}`);
  }
  for (const seed of [1, 38, 75]) {
    const sim = new RealPlay('5-5', seed);
    const c = w5Of(sim).cocoons!.find((q) => q.block)!;
    sim.stand(c.x - 400, G);
    // walking on and hopping, never punching: held where his punch lands on it
    for (let i = 0; i < 30 * 8; i++) sim.frame({ right: true, press: i % 25 === 0, jump: i % 25 < 8 });
    assert.ok(sim.p.x <= c.x - COCOON.stop + 6, `seed ${seed}: got past to ${Math.round(sim.p.x)} (the cocoon at ${c.x})`);
    assert.ok(sim.p.x > c.x - COCOON.stop - 30, `seed ${seed}: held at ${Math.round(sim.p.x)}`);
    // three taps from there (landed, still pushing at it), and on he goes
    for (let i = 0; i < 30; i++) sim.frame({ right: true });
    for (let k = 0; k < 3; k++) {
      sim.frame({ punch: true });
      for (let j = 0; j < 14; j++) sim.frame();
    }
    assert.equal(sim.p.crittersRescued, 1, `seed ${seed}: freed`);
    for (let i = 0; i < 30 * 2; i++) sim.frame({ right: true });
    assert.ok(sim.p.x > c.x + 100, `seed ${seed}: on past it (${Math.round(sim.p.x)})`);
  }
});

test("5-5: the cocoons read: at his head, wriggling, eyes looking out, and Dot's ring on the first, upright and sideways", () => {
  // (QA, v198: at 320x782 upright the cocoon could not be picked out from the orchids, stumps and grass)
  assert.equal(COCOON_LOOK.over, COCOON.mid, 'its body drawn where his punch lands');
  for (const x of [0, 3081, 5613]) {
    let most = 0;
    for (let t = 0; t < COCOON_LOOK.every; t += 1 / 30) most = Math.max(most, cocoonWriggle(t, x));
    assert.ok(most > 0.9, 'a wriggle every couple of seconds');
  }
  const l = engineGuideLine(W5_TEACH.cocoon, '5-5', { dot: true })!;
  assert.equal(l.topic, 'cocoon');
  for (const seed of [1, 38]) {
    for (const [w, h] of [[320, 782], [390, 844], [844, 390], [640, 320]] as const) {
      const sim = new RealPlay('5-5', seed);
      const c = w5Of(sim).cocoons!.find((q) => q.block)!;
      const e = sim.e as Record<string, any>;
      delete e.updateCamera;
      e.viewCssW = w;
      e.viewCssH = h;
      e.introT = 99;
      e.applyZoom();
      sim.stand(c.x - 160, G);
      sim.p.facing = 1;
      for (let i = 0; i < 40; i++) sim.frame();
      const v = e.guideView(emptyGuideView()) as GuideView;
      const t = findTarget(l.topic, v);
      assert.ok(t && Math.abs(t.x - c.x) < 2 && Math.abs(t.y - (c.y - COCOON.mid)) < 2, `seed ${seed} ${w}x${h}: the ring at ${t ? `${Math.round(t.x)}, ${Math.round(t.y)}` : 'nothing'}`);
      // (its body is on the screen there, at his height)
      assert.ok(c.x < e.camera.x + e.camera.viewportWidth - 20 && c.y - 80 > e.camera.y, `seed ${seed} ${w}x${h}: off the screen`);
    }
  }
});

test('5-5 in the real engine: walking on from the rest branch while the pouch scene plays, no spider rouses and no heart is lost', () => {
  // (QA, v198: he took two or three hits reading the scene as he went on. While it plays the garden holds its breath)
  for (const seed of [1, 38, 75]) {
    forgetTips();
    const sim = new RealPlay('5-5', seed);
    sim.safe = false;
    const w5 = w5Of(sim);
    const rest = w5.rest!;
    sim.stand(rest.x0 - 200, G);
    const hp = sim.p.hp;
    const gates = (sim.e as Record<string, any>).w5.gates as Map<number, { phase: string }>;
    let hold = 0, jab = 0, playedTo = 0, roused = '';
    for (let i = 0; i < 30 * 200 && (i < 60 || sim.e.w5.restPlaying(sim.e.gameTime)); i++) {
      const p = sim.p;
      let press = false;
      const ahead = (x: number, lo: number, hi: number) => x - p.x > lo && x - p.x < hi;
      if (p.grounded && hold <= 0) {
        const face = sim.platforms.some((q) => q.type === 'solid' && ahead(q.x, 0, 70) && q.y < p.y - 12 && q.y > p.y - 220 && q.y + q.height > p.y - 4);
        const floor = sim.platforms.some((q) => Math.abs(q.y - p.y) < 3 && q.x <= p.x + 40 && q.x + q.width >= p.x + 40);
        if (face || !floor) {
          press = true;
          hold = 9;
        }
      }
      const punch = jab-- <= 0 && (w5.cocoons ?? []).some((c) => ahead(c.x, 20, 80) && Math.abs(c.y + 18 - p.y) < 40);
      if (punch) jab = 14;
      sim.frame({ right: true, press, jump: hold > 0, punch });
      hold--;
      // (he keeps walking: a still moment would bring the silk, which is the stage's rule and not what this is about)
      sim.e.w5.calm();
      if (sim.e.w5.restPlaying(sim.e.gameTime)) {
        playedTo = sim.p.x;
        for (const [id, g] of gates) if (g.phase !== 'calm' && !roused) roused = `spider ${id} ${g.phase} at x ${Math.round(sim.p.x)}`;
        assert.equal(sim.p.hp, hp, `seed ${seed}: a heart lost at x ${Math.round(sim.p.x)} while the scene plays`);
      }
    }
    assert.equal(roused, '', `seed ${seed}`);
    // (the scene played over a long stretch, past spiders and a humming thread)
    const passed = sim.stage.enemies.filter((e) => e.x < playedTo).length;
    assert.ok(passed >= 2, `seed ${seed}: the scene played to x ${Math.round(playedTo)}, past ${passed} spiders`);
    // once it is over, they are spiders again: one that sees him crouches and comes
    const sp = sim.e.enemies.find((e: { x: number; defeated: boolean }) => !e.defeated && e.x > sim.p.x + 300)!;
    sim.stand(sp.x - 320, sp.y);
    let woke = false;
    for (let i = 0; i < 30 * 4 && !woke; i++) {
      sim.frame({ right: i < 6 });
      woke = gates.get(sp.id)?.phase !== 'calm';
    }
    assert.ok(woke, `seed ${seed}: after the scene the spider at ${sp.x} never stirred`);
  }
});
