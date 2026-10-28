import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { animOf, ArrivalWarm, stageAnims, stageExtras } from './sheetWarm.ts';
import { trackAtlas, releaseWorldArt } from './atlasLoader.ts';
import { buildProtoStage, HAND_STAGES } from './protoStage.ts';
import { stageSheets } from './stageSheets.ts';
import { generateAllLevels } from './worldsData.ts';

// (QA's control-test logs, 2026-10-26/27: 'blank wait goldsnake / eagle / hero-vine / props2' as each first came on screen, on every
// phone, and freezes over 100 ms after a sheet arrived mid-stage)

const levels = generateAllLevels();
const sheetFile = (name: string) => existsSync(new URL(`../assets/enemies/${name}-anim.webp`, import.meta.url));

test("a snake asks for the golden snake's clips, a royal turtle the guard's, the rest their own", () => {
  assert.equal(animOf('snake'), 'goldsnake');
  assert.equal(animOf('turtle', true), 'guard');
  assert.equal(animOf('turtle'), 'turtle');
  for (const t of ['snake', 'turtle', 'boa', 'eagle', 'ocelot', 'jaguar']) assert.ok(sheetFile(animOf(t)), `${t}: ${animOf(t)}-anim.webp`);
});

test('every creature of every control-test mix and hand-built World 1 stage is asked for as it starts, the eagle and the ring drops too', () => {
  const ct = levels.find((l) => l.id === '1-2')!;
  const stages = [
    ...Array.from({ length: 40 }, (_, i) => buildProtoStage(ct, i + 1, 'ctest')),
    ...levels.filter((l) => l.worldIndex === 1 && HAND_STAGES[l.id]).map((l) => buildProtoStage(l, 1, HAND_STAGES[l.id])),
  ];
  let eagles = 0;
  let rings = 0;
  for (const st of stages) {
    const asked = new Set(stageAnims(st));
    for (const e of st.enemies) assert.ok(asked.has(animOf(e.type, e.royal)), `${st.proto?.mix ?? ''}: ${e.type}`);
    if (st.proto?.watch?.length) {
      eagles++;
      assert.ok(asked.has('eagle'), `${st.proto?.mix ?? ''}: the eagle over the watched stretch`);
    }
    for (const w of st.proto?.ring?.waves ?? []) {
      rings++;
      for (const d of w) assert.ok(asked.has(animOf(d.kind)), `${st.proto?.mix ?? ''}: the ring's ${d.kind}`);
    }
    // nothing asked for by a name that has no sheet when its creature has one under another name (the old 'snake')
    assert.ok(!asked.has('snake'));
    // Pokey on a liana, and the bushes' sheet where there are bushes
    const x = stageExtras(st);
    if (st.vines.some((v) => v.vineType !== 'tree_climb' && !v.rope)) assert.ok(x.vine);
    if (st.proto?.bushes?.length) assert.ok(x.props2);
  }
  assert.ok(eagles > 0 && rings > 0, `the mixes held eagles (${eagles}) and rings (${rings})`);
});

test("the control test's stage gets World 2's river sheet ready (every mix has River logs or Lily pads)", () => {
  const ct = levels.find((l) => l.id === '1-2')!;
  assert.ok(stageSheets(ct, { hand: true, paint: true, ctest: true }).includes('w2-props'));
  for (let s = 1; s <= 40; s++) {
    const mix = buildProtoStage(ct, s, 'ctest').proto?.mix ?? '';
    assert.ok(/River logs|Lily pads/.test(mix), mix);
  }
  // (and not outside the control test)
  assert.ok(!stageSheets(ct, { hand: true, paint: true, ctest: false }).includes('w2-props'));
});

/** just enough of an <img> for trackAtlas */
const fakeImage = () => ({ onload: null as null | (() => void), onerror: null as null | (() => void), src: '', naturalWidth: 2048, naturalHeight: 1024 }) as unknown as HTMLImageElement;

test('a sheet that arrives during play is drawn once the next frame, one a frame, and then never again', () => {
  releaseWorldArt();
  const a = fakeImage();
  const b = fakeImage();
  trackAtlas(a, 'a-anim.webp', () => {}, () => {}, () => {});
  trackAtlas(b, 'b-anim.webp', () => {}, () => {}, () => {});
  const warm = new ArrivalWarm(['a-anim.webp', 'b-anim.webp', 'a-anim.webp']);
  const draws: unknown[] = [];
  const ctx = { drawImage: (img: unknown) => draws.push(img), clearRect: () => {} } as unknown as CanvasRenderingContext2D;
  warm.frame(ctx);
  assert.equal(draws.length, 0, 'nothing has arrived yet');
  a.onload!.call(a, {} as Event);
  b.onload!.call(b, {} as Event);
  warm.frame(ctx);
  assert.deepEqual(draws, [a], 'one a frame');
  warm.frame(ctx);
  assert.deepEqual(draws, [a, b]);
  assert.equal(warm.waiting, 0);
  for (let i = 0; i < 5; i++) warm.frame(ctx);
  assert.equal(draws.length, 2, 'each only once');
  releaseWorldArt();
});
