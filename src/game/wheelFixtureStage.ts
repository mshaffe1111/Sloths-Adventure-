/**
 * wheelFixtureStage — a REAL laid water wheel the page can load before 2-6 is built (ENG-26b; the chase fixture's pattern,
 * chaseFixtureStage.ts): `?fixture=wheel` (the toy tower: World 2's ground, one wheel laid by place `wheel`, the storey he leaves running
 * LEFT, so the wheel travels left) or `?fixture=wheel-right` (the toy run: the same wheel travelling RIGHT), each with `&wheel=<row>`
 * (default 'edge'; teach, top, great, sparse), in a DEV build only, so stills, clips and the draw check play a gen2 wheel on the real page.
 *
 * It is the wheel toys' own stage (wheel.test.ts, wheelRide.test.ts and tools/inspect/wheelToys.ts read the same kit from here: one
 * definition): a toy tower (gen2/toyTower.ts's plain storeys and climbing vine) or toy run on World 2's ground with ONE wheel section (a
 * jetty, the wheel of a World 2 row, w2.ts W2_WHEELS, laid by place `wheel`, and its street), rolled by gen2 at the first seed that lays the
 * one wheel clean on the setting, World 2's finish over it.
 *
 * Elsewhere it does not exist: wheelFixtureConfig() is null outside a dev build and generateStage never sees its ids; the game's stage
 * lists never name them. No stage id of the game's, no seed of the game's.
 */
import type { LevelConfig } from './types.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import { buildGen2Stage } from './gen2/pipeline.ts';
import { landing, towerCfg, upManifest, vineUp } from './gen2/toyTower.ts';
import { cfg as toyCfg, kit as toyKit, meadow } from './gen2/toyWorld.ts';
import { w2Finish, W2_GROUND, W2_WHEELS } from './gen2/worlds/w2.ts';
import type { WheelRow } from './gen2/wheelLay.ts';
import type { Gen2Stage, SectionTemplate, WorldKit } from './gen2/types.ts';

/** the toys' rows: World 2's, and `sparse` (no row of the design): the edge wheel with five buckets (226 px apart on the rim), too far
 *  apart to scramble up hopping bucket to bucket, so only a ride and a step-off at the edge takes him up (the bot skill's planted toy) */
export const TOY_WHEELS = {
  ...W2_WHEELS,
  sparse: { R: 180, V: 70, easyV: 50, N: 5, street: 'edge' },
} as const satisfies Record<string, WheelRow>;
export type WheelToy = keyof typeof TOY_WHEELS;

/** the wheel section: a jetty (a storey's bough), the wheel, its street (the next storey's bough) */
export const wheelSection = (row: WheelToy): SectionTemplate => ({
  id: `toy-wheel-${row}`, name: `a water wheel (${row})`, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, maxPerStage: 1,
  pieces: [
    // (rolled widths: a narrow roll fits on the way the storey runs, a wide one turns it back first, so the toy lays the wheel both ways round)
    { key: 'jetty', shape: 'branch', w: [120, 300], place: { kind: 'start' }, main: true },
    { key: 'street', shape: 'branch', w: [180, 340], place: { kind: 'wheel', after: 'jetty', row }, main: true, landing: true },
  ],
  entry: { piece: 'jetty', kind: 'ledge' }, exit: { piece: 'street', kind: 'ledge' }, exitDy: -300, sockets: [], mirrorable: false,
});

/** the toy RUN's kit (a stage laid right, never turned: the wheel turned the other way round from the tower's leftward storeys) */
export const runKitFor = (row: WheelToy): WorldKit => ({
  ...toyKit,
  manifest: {
    ...toyKit.manifest, world: 2, wheels: TOY_WHEELS, creatures: [], props: [], pairs: [], tips: {},
    sections: [{ ...meadow, phases: ['start', 'rest', 'ki', 'sho', 'ten', 'ketsu', 'goal'], mirrorable: false, sockets: meadow.sockets.filter((k) => k.role !== 'prop') }, wheelSection(row)],
  },
});
/** the toy run's id (World 2, in no world's list) */
export const RUN_ID = '2-96';
export const runCfg: LevelConfig = { ...toyCfg(RUN_ID, 'sprint'), unlocked: true };

/** the toy tower's id (World 2, in no world's list) */
export const ID = '2-95';
/** the toy tower's kit: World 2's ground and wheels, the toy tower's landing and climbing vine, and the wheel */
export const kitFor = (row: WheelToy): WorldKit => ({
  manifest: {
    ...upManifest, world: 2, name: `Toy wheel tower (${row})`, ground: { y: W2_GROUND.y, bankH: W2_GROUND.bankH, style: 'log' }, wheels: TOY_WHEELS,
    creatures: [], props: [], pairs: [], tips: {},
    sections: [landing, vineUp, wheelSection(row)],
    required: { [ID]: [{ section: `toy-wheel-${row}` }] },
  },
  emit: {},
});
export const cfg: LevelConfig = { ...towerCfg(ID, 'ascent'), unlocked: true };

/** the toy's stage as built */
export const toyStage = (row: WheelToy, seed: number, difficulty: 'normal' | 'easy' = 'normal', flow: 'up' | 'right' = 'up'): Gen2Stage =>
  flow === 'up' ? buildGen2Stage({ config: cfg, kit: kitFor(row), seed, difficulty }) : buildGen2Stage({ config: runCfg, kit: runKitFor(row), seed, difficulty });

/** the toy's wheels laid (each once) */
export const wheelsOf = (st: { platforms: ReadonlyArray<{ wheel?: { w: unknown } }> }) => new Set(st.platforms.filter((p) => p.wheel).map((p) => p.wheel!.w)).size;

/** the first seed of 1-60 whose roll lays the one wheel and builds clean on both settings (or null: none does) */
export function fixtureSeed(row: WheelToy, settings: ReadonlyArray<'normal' | 'easy'> = ['normal', 'easy'], flow: 'up' | 'right' = 'up'): number | null {
  for (let seed = 1; seed <= 60; seed++) {
    const ok = settings.every((d) => {
      const st = toyStage(row, seed, d, flow);
      return !st.gen2.errors?.length && wheelsOf(st) === 1;
    });
    if (ok) return seed;
  }
  return null;
}

// ───────────────────────────── the page's fixture (a dev build only) ─────────────────────────────

/** the page's fixture ids: the toy tower (travelling left) and the toy run (travelling right) */
export const WHEEL_FIXTURE_IDS: readonly string[] = [ID, RUN_ID];
const isRow = (r: string | null): r is WheelToy => !!r && Object.prototype.hasOwnProperty.call(TOY_WHEELS, r);
/** the row the page asked for (`&wheel=`), else 'edge' */
let pageRow: WheelToy = 'edge';

/** the dev build's fixture config for `?fixture=wheel` / `wheel-right` (and `&wheel=<row>`), or null (a shipped build never has it) */
export function wheelFixtureConfig(which: string | null, row: string | null = null): LevelConfig | null {
  if (!devBuild() || (which !== 'wheel' && which !== 'wheel-right')) return null;
  pageRow = isRow(row) ? row : 'edge';
  return which === 'wheel' ? cfg : runCfg;
}
/** the fixture config for one of its ids (window.__play), or null */
export const wheelFixtureFor = (id: string): LevelConfig | null => (!devBuild() ? null : id === ID ? cfg : id === RUN_ID ? runCfg : null);

function devBuild(): boolean {
  try {
    return !!import.meta.env.DEV;
  } catch {
    return false;
  }
}

/** the fixture built: the toy at the first seed that lays its one wheel clean on this setting, World 2's finish over it */
export function buildWheelFixtureStage(config: LevelConfig, difficulty: 'normal' | 'easy'): GeneratedStage {
  const flow = config.id === RUN_ID ? 'right' : 'up';
  const seed = fixtureSeed(pageRow, [difficulty], flow);
  if (seed === null) console.warn(`fixture: no seed of 1-60 lays the ${pageRow} wheel clean (${difficulty}, ${flow})`);
  return w2Finish(toyStage(pageRow, seed ?? 1, difficulty, flow), difficulty) as unknown as GeneratedStage;
}
