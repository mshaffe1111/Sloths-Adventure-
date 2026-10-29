import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STAGE_DRAWS, genFoes, stageSheets } from './stageSheets.ts';
import { buildProtoStage, HAND_STAGES } from './protoStage.ts';
import { buildW2Stage, W2_STAGES } from './w2Stages.ts';
import { generateAllLevels } from './worldsData.ts';
import { DOT_STAGE_ID, MEECA_STAGE_ID, dotStageConfig } from './extraStages.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { stageAnims, stageExtras } from './sheetWarm.ts';
import { SPRITES } from './spriteSheets.ts';
import { THORNBARK_LEVEL } from './secret.ts';
import { isGen2Stage } from './gen2/game.ts';
import { whenSheetsReady, warmSheets, trackAtlas, releaseWorldArt, enterWorld, sheetReady } from './atlasLoader.ts';

const on = { hand: true, paint: true, ctest: false };
const levels = generateAllLevels();
const lvl = (id: string) => levels.find((l) => l.id === id)!;

test('4-2 gets World 4 ready: both kit sheets, the World 4 props and the puzzle sheets it is dressed with, nothing else', () => {
  assert.deepEqual(stageSheets(lvl('4-2'), on), ['kit:1', 'kit:4', 'w4-props', 'kit-pieces', 'perch']);
});

test('every hand-built World 3 stage gets the World 3 props and kit; 3-3 its cats too', () => {
  for (let m = 1; m <= 9; m++) {
    const s = stageSheets(lvl(`3-${m}`), on);
    assert.deepEqual(s.slice(0, 3), ['kit:1', 'kit:3', 'w3-props'], `3-${m}`);
  }
  assert.deepEqual(stageSheets(lvl('3-3'), on).slice(3), ['foe:jaguar', 'foe:ocelot', 'kit-pieces', 'water-signs', 'perch']);
});

test("Dot's flight gets her own sheets only (it draws no platforms)", () => {
  assert.deepEqual(stageSheets(dotStageConfig(), on), ['dot']);
});

test('a boss lair and a generated stage get only what they draw', () => {
  // a boss lair draws no painted platforms and is not hand-built: its boss's minions (3-10's Prowler calls none) and Dot's perch
  assert.deepEqual(stageSheets(lvl('3-10'), on), ['perch']);
  assert.deepEqual(stageSheets(lvl('1-10'), on), ['foe:goldsnake', 'perch']);
  // a generated stage: the kit when painting is on, and every creature its world's generator can place (rolled with the stage)
  // (5-8: 5-1 to 5-4 are hand-built now)
  const five = stageSheets(lvl('5-8'), on);
  // (and World 5's water sign: its stages' first water has one, waterTeach.ts)
  assert.deepEqual(five, ['kit:1', 'kit:5', ...genFoes(5).map((f) => `foe:${f}`), 'water-signs', 'perch']);
  assert.deepEqual(stageSheets(lvl('5-8'), { ...on, paint: false }), [...genFoes(5).map((f) => `foe:${f}`), 'water-signs', 'perch']);
  // with the hand-built stages switched off (?proto=0), 3-1 is a generated stage: no World 3 props
  assert.deepEqual(stageSheets(lvl('3-1'), { ...on, hand: false }).slice(0, 3), ['kit:1', 'kit:3', 'foe:goldsnake']);
});

test('every sheet a built stage draws is in its preload list, for every stage and roll 1-3 (QA 2026-10-29: blank waits at 80, 179, 201 and 650 s)', () => {
  // (the game's stages, as a browser builds them: protoStage.ts protoStageEnabled reads `location`)
  const g = globalThis as { location?: unknown };
  const had = 'location' in g;
  g.location ??= { search: '' };
  const misses: string[] = [];
  // what each hand-built stage draws over its three rolls (STAGE_DRAWS should be just that: no sheet loaded for nothing)
  const drawn = new Map<string, Set<string>>();
  try {
    for (const l of [...levels, THORNBARK_LEVEL]) {
      const list = new Set(stageSheets(l, on));
      // Dot perches in every stage but her own flight and Meeca's
      if (l.id !== DOT_STAGE_ID && l.id !== MEECA_STAGE_ID && !list.has('perch')) misses.push(`${l.id}: Dot's perch`);
      for (const v of [1, 2, 3]) {
        setLayoutVariant(v);
        for (const d of isGen2Stage(l) ? (['normal', 'easy'] as const) : (['normal'] as const)) {
          const st = generateStage(l, d);
          const keys = [...stageAnims(st).map((n) => `foe:${n}`), ...(stageExtras(st).props2 ? ['props2'] : [])];
          for (const k of keys) if (!list.has(k)) misses.push(`${l.id} roll ${v} ${d}: ${k}`);
          // (World 6 on gen2 on asks for its world's whole set, stageSheets.ts: its animals change from roll to roll)
          if (!l.secret && (HAND_STAGES[l.id] || W2_STAGES[l.id] || (isGen2Stage(l) && l.worldIndex < 6))) {
            const set = drawn.get(l.id) ?? new Set<string>();
            for (const k of keys) set.add(k);
            drawn.set(l.id, set);
          }
        }
      }
    }
  } finally {
    setLayoutVariant(null);
    if (!had) delete g.location;
  }
  assert.deepEqual(misses, []);
  for (const [id, set] of drawn) assert.deepEqual([...(STAGE_DRAWS[id] ?? [])].sort(), [...set].sort(), `${id}: STAGE_DRAWS lists more than it draws`);
  // every creature named has painted-pose sheets the preload knows how to ask for
  for (const keys of [...Object.values(STAGE_DRAWS), ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => genFoes(w).map((f) => `foe:${f}`))]) {
    for (const k of keys) if (k.startsWith('foe:')) assert.ok(SPRITES[k.slice(4)], k);
  }
});

/** just enough of an <img> for trackAtlas */
const fakeImage = () => ({ onload: null as null | (() => void), onerror: null as null | (() => void), src: '', naturalWidth: 2048, naturalHeight: 1024 }) as unknown as HTMLImageElement;

test('a stage waits for its sheets, then each is drawn once at its own size into a corner', async () => {
  releaseWorldArt();
  enterWorld(4);
  const img = fakeImage();
  trackAtlas(img, 'w4-props.webp', () => {}, () => {}, () => {});
  const wait = whenSheetsReady(['w4-props.webp', 'never-asked.webp'], 5000);
  assert.equal(sheetReady('w4-props.webp'), false);
  img.onload!.call(img, {} as Event); // (no decode() on the fake: ready at once)
  assert.equal(await wait, 1);
  const draws: number[][] = [];
  const clears: number[][] = [];
  const ctx = { drawImage: (...a: unknown[]) => draws.push(a.slice(1) as number[]), clearRect: (...a: number[]) => clears.push(a) } as unknown as CanvasRenderingContext2D;
  assert.equal(warmSheets(['w4-props.webp'], ctx), 1);
  assert.deepEqual(draws, [[0, 0, 4, 4, 0, 0, 4, 4]], '1:1, a few pixels');
  assert.deepEqual(clears, [[0, 0, 4, 4]]);
  assert.equal(warmSheets(['w4-props.webp'], ctx), 0, 'only the first time');
  // let go with its world: no longer counted as ready
  enterWorld(5);
  assert.equal(sheetReady('w4-props.webp'), false);
});

test('waiting gives up after its time', async () => {
  releaseWorldArt();
  trackAtlas(fakeImage(), 'slow.webp', () => {}, () => {}, () => {});
  const t0 = Date.now();
  assert.equal(await whenSheetsReady(['slow.webp'], 60), 0);
  assert.ok(Date.now() - t0 < 1000);
  releaseWorldArt();
});
