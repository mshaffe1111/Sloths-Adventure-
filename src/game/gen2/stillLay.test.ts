/**
 * STILL as a piece any world lays (stillLay.ts): the rows, the emitters, the clip and the fairness check, each with a planted fault;
 * then three worlds' kits through the real pipeline (World 6's watched water and World 8's roosts as the game builds them, and the toy
 * world given nothing but a table), and what is laid played against the watcher's own rule (watcher.ts hidden / sees).
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import type { Platform } from '../types.ts';
import { hidden, newWatch, sees, stepWatch, zoneAt, type Bush, type WatchZone } from '../watcher.ts';
import { generateStage, setLayoutVariant } from '../stageGenerator.ts';
import { easyStage } from '../easyMode.ts';
import { withGoals } from '../goals.ts';
import { generateAllLevels } from '../worldsData.ts';
import { buildGen2Stage } from './pipeline.ts';
import { cfg, kit as toyKit, manifest as toyManifest } from './toyWorld.ts';
import type { FilledSocket, PropDef, SectionTemplate, StageSink, WorldKit } from './types.ts';
import { STILL, STILL_RULE, STILL_TAG, calmFor, clipWatches, hideSocket, stillEmitters, stillFaults, stillProps, watchSocket, watchedRun, type CalmBand, type StillRow } from './stillLay.ts';
import { W6_CALM, W6_STILL } from './worlds/w6.ts';
import { W8_STILL } from './worlds/w8.ts';

const G = 580;
const plat = (id: number, x: number, width: number, y = G, type: Platform['type'] = 'solid'): Platform => ({ id, x, y, width, height: 90, type });
const sink = (platforms: Platform[]): StageSink => {
  let n = 100;
  return { platforms, enemies: [], collectibles: [], proto: { hints: [], covers: [], beats: [] }, extras: {}, zones: [], nextPlatformId: () => n++, nextCollectibleId: () => n++, nextEnemyId: () => n++ };
};
const fill = (socket: string, what: string, x: number, y = G): FilledSocket => ({ section: 's', socket, role: 'prop', what, x, y });
const def = (rows: Record<string, StillRow>, id: string): PropDef => stillProps(rows).find((p) => p.id === id)!;

test('the calm between passes: World 6 and World 8 keep the numbers they shipped with, and a world writes its own band', () => {
  // (w6.ts watchCalm before stillLay: [9, 11] taught; 7 to 8.5 at stage 2 down to 5.5 to 7 at stage 9; World 8 as World 6's stage + 2)
  assert.deepEqual(calmFor(W6_CALM, 2, true), [9, 11]);
  assert.deepEqual(calmFor(W6_CALM, 2, false), [7, 8.5]);
  assert.deepEqual(calmFor(W6_CALM, 5, false), [6.4, 7.9]);
  assert.deepEqual(calmFor(W6_CALM, 9, false), [5.5, 7]);
  assert.deepEqual(calmFor(W6_CALM, 10, false), [5.5, 7]);
  const w8 = (W8_STILL.roost as Extract<StillRow, { role: 'watch' }>).calm;
  assert.deepEqual(calmFor(w8, 1, false), [6.8, 8.3]);
  assert.deepEqual(calmFor(w8, 8, false), [5.5, 7]);
  // (1-7's hand-built rows: [9, 11] where it is taught, [6.5, 8] after: a flat band)
  const w1: CalmBand = { teach: [9, 11], early: [6.5, 8], late: [6.5, 8] };
  assert.deepEqual(calmFor(w1, 7, false), [6.5, 8]);
  for (let s = 1; s <= 10; s++) assert.ok(calmFor(W6_CALM, s, false)[0] >= STILL_RULE.calmMin && calmFor(w8, s, false)[0] >= STILL_RULE.calmMin);
});

test("a world's table gives its props by tag, and the sockets any section lists ask by the same tags", () => {
  assert.deepEqual(stillProps(W6_STILL), [
    { id: 'rootHide', tags: ['hide', 'cover'], w: 176, minApart: 260, looks: ['rootDen', 'rootArch'] },
    { id: 'reedHide', tags: ['hide', 'cover'], w: 124, minApart: 260, looks: ['reeds', 'seagrass'] },
    { id: 'watch', tags: ['watch'], w: 120, minApart: 500, hazard: true, beat: true },
  ]);
  assert.deepEqual(stillProps(W8_STILL).map((p) => [p.id, p.tags.join('+'), p.w]), [['hollowHide', 'hide+cover', 170], ['curtainHide', 'hide+cover', 124], ['roost', 'roost', 120]]);
  assert.deepEqual(hideSocket('h1', 'bank', 0.4), { id: 'h1', role: 'prop', on: 'bank', t: 0.4, allow: [STILL_TAG.hide, STILL_TAG.cover] });
  assert.deepEqual(watchSocket('roostLesson', 'b', 0.03, 'roost'), { id: 'roostLesson', role: 'prop', on: 'b', t: 0.03, allow: ['roost'] });
});

const ROWS: Record<string, StillRow> = {
  den: { role: 'hide', bush: 'wide', w: 160, looks: ['denA', 'denB'] },
  eye: { role: 'watch', calm: W6_CALM, lesson: ['eyeLesson'], own: ['eyeHere'], scare: ['run'] },
};

test('a hide lays a bush centred on its spot; a watcher looks along its bank and the pieces joined to it, never past a gap', () => {
  // (a bank, a knee root 30 px up joined to it, a gap, then another bank)
  const out = sink([plat(1, 0, 600), plat(2, 600, 200, G - 30), plat(3, 800, 500), plat(4, 1500, 400), plat(5, 1300, 200, G, 'fragile')]);
  const noted: string[] = [];
  const emit = stillEmitters(ROWS, 2, { hide: (_o, at) => noted.push(`hide ${at.x} ${at.look}`), watch: (_o, at) => noted.push(`watch ${at.run.join('-')} ${at.scare}`) });
  emit.den(fill('h1', 'den', 300), def(ROWS, 'den'), out);
  assert.deepEqual(out.proto.bushes, [{ x: 220, w: 160, y: G, kind: 'wide' }]);
  emit.eye(fill('eye', 'eye', 20), def(ROWS, 'eye'), out);
  assert.deepEqual(out.proto.watch, [{ x0: STILL.inset, x1: 1300 - STILL.inset, calm: [7, 8.5] }]);
  // (a second watcher on the same stretch makes no second zone and is not noted)
  emit.eye(fill('eye2', 'eye', 700, G - 30), def(ROWS, 'eye'), out);
  assert.equal(out.proto.watch!.length, 1);
  // (the next bank has its own: taught slow by its socket's name)
  emit.eye(fill('eyeLesson', 'eye', 1510), def(ROWS, 'eye'), out);
  assert.deepEqual(out.proto.watch![1], { x0: 1540, x1: 1860, calm: [9, 11] });
  assert.match(noted[0], /^hide 220 den[AB]$/);
  assert.deepEqual(noted.slice(1), ['watch 0-1300 false', 'watch 1500-1900 false']);
  assert.deepEqual(watchedRun(out.platforms, 20, G, 700), [0, 700]);
  assert.equal(watchedRun(out.platforms, 20, G - 200), null);
});

test("a watcher's own-bank socket watches the piece it stands on only; a scare run sets him back to its start and keeps no hides", () => {
  const out = sink([plat(1, 0, 600), plat(2, 600, 400), plat(3, 1000, 500)]);
  const emit = stillEmitters(ROWS, 9);
  emit.eye(fill('eyeHere1', 'eye', 620), def(ROWS, 'eye'), out);
  assert.deepEqual(out.proto.watch, [{ x0: 640, x1: 960, calm: [5.5, 7] }]);
  const run = sink([plat(1, 0, 600), plat(2, 600, 400)]);
  emit.eye(fill('run1', 'eye', 20), def(ROWS, 'eye'), run);
  assert.deepEqual(run.proto.watch, [{ x0: 40, x1: 560, calm: [5.5, 7], setback: STILL.setback }]);
  clipWatches(run);
  assert.equal(run.proto.watch!.length, 1, 'a scare run has no hides by design and stays whole');
});

test('the clip: a watched stretch ends a little past its last hide, and one with nowhere to hide is no watched stretch', () => {
  const bushes: Bush[] = [{ x: 200, w: 160, y: G, kind: 'wide' }, { x: 700, w: 124, y: G, kind: 'tall' }];
  const out = sink([]);
  out.proto.bushes = bushes;
  out.proto.watch = [{ x0: 40, x1: 1360, calm: [7, 8.5] }, { x0: 2000, x1: 2600, calm: [7, 8.5] }];
  clipWatches(out);
  assert.deepEqual(out.proto.watch, [{ x0: 40, x1: 700 + 124 + STILL.past, calm: [7, 8.5] }]);
});

test('the fairness check names each planted fault, and passes the same stretch laid fair', () => {
  const platforms = [plat(1, 0, 3000)];
  const zone: WatchZone = { x0: 40, x1: 1400, calm: [7, 8.5] };
  const fair: Bush[] = [{ x: 300, w: 160, y: G, kind: 'wide' }, { x: 1100, w: 160, y: G, kind: 'wide' }];
  assert.deepEqual(stillFaults({ bushes: fair, watch: [zone], platforms }), []);
  // planted: nowhere to hide
  assert.deepEqual(stillFaults({ bushes: [], watch: [zone], platforms }), ['watch 40-1400: nowhere to hide along it']);
  // planted: a calm under the floor
  assert.match(stillFaults({ bushes: fair, watch: [{ ...zone, calm: [4, 6] }], platforms })[0], /its calm is 4 s, under 5 s/);
  // planted: a calm written backwards
  assert.match(stillFaults({ bushes: fair, watch: [{ ...zone, calm: [8, 7] }], platforms })[0], /runs backwards/);
  // planted: open ground no calm crosses (a 5 s calm at half his run covers about 712 px; these hides stand 1,300 apart)
  const far = stillFaults({ bushes: [fair[0], { ...fair[1], x: 1780 }], watch: [{ ...zone, x1: 2100, calm: [5, 7] }], platforms });
  assert.equal(far.length, 1);
  assert.match(far[0], /1340 px in the open from hide 300/);
  // planted: the hide's secret twin does not count, and a hide with no ground under it is named
  assert.deepEqual(stillFaults({ bushes: fair.map((b) => ({ ...b, secret: true })), watch: [zone], platforms }), ['watch 40-1400: nowhere to hide along it']);
  assert.deepEqual(stillFaults({ bushes: [...fair, { x: 3200, w: 160, y: G, kind: 'wide' }], watch: [zone], platforms }), ['hide 3200: no ground under it']);
  // (a scare run needs no hide, but its calm is held to the same floor)
  assert.deepEqual(stillFaults({ watch: [{ ...zone, setback: 20 }], platforms }), []);
  assert.equal(stillFaults({ watch: [{ ...zone, setback: 20, calm: [3, 4] }], platforms }).length, 1);
});

// ───────────────────────────── three worlds' kits, through the real pipeline ─────────────────────────────

const levels = generateAllLevels();
type Built = { platforms: Platform[]; proto?: { bushes?: Bush[]; watch?: WatchZone[] } };
const played = (id: string, d: 'normal' | 'easy', v: number): Built => {
  const l = { ...levels.find((q) => q.id === id)!, unlocked: true };
  setLayoutVariant(v);
  try {
    return (d === 'easy' ? easyStage(withGoals(generateStage(l, 'easy'))) : withGoals(generateStage(l, 'normal'))) as unknown as Built;
  } finally {
    setLayoutVariant(null);
  }
};

/** hold a laid stage to the rule, and to the watcher itself: crouched in any hide he is never seen; out in the open in a pass he is */
function proveStill(name: string, st: Built): { zones: number; hides: number } {
  const bushes = st.proto?.bushes ?? [], watch = st.proto?.watch ?? [];
  assert.deepEqual(stillFaults({ bushes, watch, platforms: st.platforms }), [], name);
  for (const z of watch) {
    assert.equal(zoneAt(watch, (z.x0 + z.x1) / 2), z, `${name}: no two watched stretches overlap`);
    const inside = bushes.filter((b) => !b.secret && b.x + b.w > z.x0 && b.x < z.x1);
    if (z.setback !== undefined) continue;
    const b = inside[0];
    const hero = { x: b.x + b.w / 2, y: b.y, ducking: true, grounded: true, hanging: false };
    assert.ok(hidden(bushes, hero), `${name}: crouched in the hide at ${b.x} he is hidden`);
    // (the watcher's own steps: two whole passes over the stretch with the shadow right on him)
    const s = newWatch();
    let passes = 0, seenHidden = false, seenOpen = false;
    for (let t = 0; t < 60 && passes < 2; t += 1 / 30) {
      if (stepWatch(s, 1 / 30, z, () => 0.5).passed) passes++;
      if (sees(s, hero.x, bushes, hero)) seenHidden = true;
      if (sees(s, hero.x, bushes, { ...hero, ducking: false })) seenOpen = true;
    }
    assert.equal(passes, 2, `${name}: the watcher passes`);
    assert.equal(seenHidden, false, `${name}: hidden, he is not seen`);
    assert.equal(seenOpen, true, `${name}: standing up in a pass, he is seen`);
  }
  return { zones: watch.length, hides: bushes.length };
}

for (const [id, what] of [['6-2', "World 6's watched water"], ['8-2', "World 8's roosts"], ['8-1', "World 8's sleeping-bat run"]] as const) {
  test(`${what} (${id}, as the game builds it, 6 rolls, both settings): every stretch is fair and the watcher's rule holds on it`, () => {
    let zones = 0;
    for (const d of ['normal', 'easy'] as const) for (let v = 1; v <= 6; v++) zones += proveStill(`${id} ${d} ${v}`, played(id, d, v)).zones;
    assert.ok(zones > 0, 'the stage lays watched stretches');
  });
}

/** a world that brings nothing but a table: a fern to hide in and an owl that watches (1-7's flat calm), on the toy world's pipeline */
const TOY_STILL: Record<string, StillRow> = {
  fern: { role: 'hide', bush: 'fern', w: 150, looks: ['fernA', 'fernB'] },
  owl: { role: 'watch', calm: { teach: [9, 11], early: [6.5, 8], late: [6.5, 8] }, lesson: ['owlLesson'] },
};
const covert: SectionTemplate = {
  id: 'toy-covert', name: 'under the owl', archetypes: 'any', phases: ['start', 'rest', 'ki', 'sho', 'ten', 'ketsu', 'goal'], difficulty: 1,
  pieces: [{ key: 'bank', shape: 'bank', w: [1100, 1300], place: { kind: 'start' } }],
  entry: { piece: 'bank', kind: 'ground' }, exit: { piece: 'bank', kind: 'ground' }, exitDy: 0,
  sockets: [watchSocket('owlLesson', 'bank'), hideSocket('h1', 'bank', 0.25), hideSocket('h2', 'bank', 0.6), hideSocket('h3', 'bank', 0.9)],
  mirrorable: false, weight: 9,
};
const stillKit = (rows: Record<string, StillRow>): WorldKit => ({
  manifest: { ...toyManifest, sections: [...toyManifest.sections, covert], props: [...toyManifest.props, ...stillProps(rows)] },
  emit: { ...toyKit.emit, ...stillEmitters(rows, 7, { hide: (out, at) => void ((out.extras.hides ??= []) as unknown[]).push(at) }) },
  decorate: (_items, out) => clipWatches(out),
});

test('a world that brings only a table (the toy world, 8 seeds, both settings): its hides and its watcher are laid, clipped and fair', () => {
  let zones = 0, hides = 0;
  for (const d of ['normal', 'easy'] as const) for (let seed = 1; seed <= 8; seed++) {
    const st = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: stillKit(TOY_STILL), seed, difficulty: d });
    const got = proveStill(`toy ${d} ${seed}`, st as unknown as Built);
    zones += got.zones;
    hides += got.hides;
    for (const z of st.proto.watch ?? []) assert.deepEqual(z.calm, [9, 11], 'taught where its socket says');
    for (const b of st.proto.bushes ?? []) assert.equal(b.kind, 'fern', "the world's own cover");
  }
  assert.ok(zones >= 8 && hides >= 16, `watched stretches ${zones}, hides ${hides}`);
});

test('planted: the same table with its calm under the floor is refused by the check on the laid stage', () => {
  const bad: Record<string, StillRow> = { ...TOY_STILL, owl: { role: 'watch', calm: { teach: [3, 4], early: [3, 4], late: [3, 4] }, lesson: ['owlLesson'] } };
  let named = 0;
  for (let seed = 1; seed <= 8; seed++) {
    const st = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: stillKit(bad), seed, difficulty: 'normal' });
    named += stillFaults({ bushes: st.proto.bushes, watch: st.proto.watch, platforms: st.platforms }).filter((f) => /under 5 s/.test(f)).length;
  }
  assert.ok(named > 0);
});
