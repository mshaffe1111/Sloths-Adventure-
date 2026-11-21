/**
 * homeFixtureStage — the out-and-back toy (gen2/toyHome.ts: 2-7's shape, the mail boat race and the post) on the real page before 2-7
 * is built (ENG-27c): `?fixture=home[&seed=<n>]` (or `window.__play('2-97')`) in a DEV build only, so the stills and the clip show the
 * boat beside him on the race leg, a letter in a slot and an open door. It is pacerLay.test.ts's and postLay.test.ts's own toy (World 2's
 * tables, POST_CODE: the race and the post on one toy), rolled by buildGen2Stage at the asked seed (1 when none), World 2's finish over it.
 *
 * Elsewhere it does not exist: homeFixtureConfig() is null outside a dev build and generateStage never sees its id; a shipped build
 * drops this module (import.meta.env.DEV is false there). No stage id of the game's, no seed of the game's.
 */
import type { LevelConfig } from './types.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import { buildGen2Stage } from './gen2/pipeline.ts';
import { towerCfg } from './gen2/toyTower.ts';
import { POST_CODE, homeKit } from './gen2/toyHome.ts';
import { w2Finish } from './gen2/worlds/w2.ts';

/** the fixture's id: the toy's own (the tests list it as 2-97), in no world's list */
export const HOME_FIXTURE_ID = '2-97';
const cfg: LevelConfig = { ...towerCfg(HOME_FIXTURE_ID, 'sprint'), unlocked: true };
/** the roll the page asked for (`&seed=`), else 1 */
let pageSeed = 1;

function devBuild(): boolean {
  try {
    return !!import.meta.env.DEV;
  } catch {
    return false;
  }
}

/** the dev build's fixture config for `?fixture=home` (and `&seed=<n>`), or null (a shipped build never has it) */
export function homeFixtureConfig(which: string | null, seed: string | null = null): LevelConfig | null {
  if (!devBuild() || which !== 'home') return null;
  pageSeed = Number(seed) > 0 ? Math.floor(Number(seed)) : 1;
  return cfg;
}
/** the fixture config for its id (window.__play), or null */
export const homeFixtureFor = (id: string): LevelConfig | null => (devBuild() && id === HOME_FIXTURE_ID ? cfg : null);

/** the fixture built: the toy at the page's seed, World 2's finish over it */
export function buildHomeFixtureStage(_config: LevelConfig, difficulty: 'normal' | 'easy'): GeneratedStage {
  const st = buildGen2Stage({ config: cfg, kit: homeKit(HOME_FIXTURE_ID, POST_CODE), seed: pageSeed, difficulty });
  if (st.gen2.errors.length) console.warn(`fixture: the home toy's seed ${pageSeed} (${difficulty}) is refused: ${st.gen2.errors.join(' / ')}`);
  return w2Finish(st as never, difficulty) as unknown as GeneratedStage;
}
