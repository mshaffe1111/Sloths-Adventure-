/**
 * chaseFixtureStage — a REAL laid chase the page can load before 1-8 exists (ENG-B5, packet c): `?fixture=chase` (or
 * `window.__play('1-98')`) in a DEV build only, so the draw check and the clips play a gen2 chase with its nuts and fruit on the real
 * page. It is chaseLay.test.ts's own fixture (World 1's real kit, 1-1's brief and reach row, the graph `A T P F R K R K R S E`; the
 * test lists it as 1-98, the page builds it under 1-1's own row, game code never touching the listing), rolled by buildGen2Stage, and then laid with rolling hazards by data: a teach
 * nut and a teach fruit before the first crack (1-8.md beats 1-2), and on each stretch one hazard to each run of unbroken ground long
 * enough for it, nut and fruit in turn (one threat at a time, 1-8.md).
 *
 * Elsewhere it does not exist: chaseFixtureConfig() is null outside a dev build and generateStage never sees its id; a shipped build
 * drops this module (import.meta.env.DEV is false there). No stage id of the game's, no seed of the game's.
 */
import type { LevelConfig } from './types.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import { buildGen2Stage } from './gen2/pipeline.ts';
import { w1Finish, w1World } from './gen2/worlds/w1.ts';
import { generateAllLevels } from './worldsData.ts';
import type { WorldKit } from './gen2/types.ts';
import { layStillFork } from './gen2/stillFork.ts';
import { layTip, readyStillFork } from './gen2/chaseTip.ts';
import { W1_ROLL, W1_STILL_FORK, W1_TIP } from './gen2/worlds/w1Cast.ts';

/** the fixture's id: late in World 1 (V13: a chase is never in a world's first stage), in no world's list */
export const CHASE_FIXTURE_ID = '1-98';
/** its graph: two chase stretches between rests, a sprint finish (chaseLay.test.ts) */
export const CHASE_FIXTURE_CODE = 'A T P F R K R K R S E';

/** the fixture's config: 1-1's, renamed, eighth in World 1 */
export function chaseFixtureLevel(): LevelConfig {
  return { ...generateAllLevels().find((l) => l.id === '1-1')!, id: CHASE_FIXTURE_ID, miniIndex: 8 };
}

/**
 * World 1's real kit with the fixture on 1-1's pool and 1-1's brief (no fork added, no deal: 1-1's mix rules are not a chase's), under
 * the id `as`: the fixture's own (a test lists it for the build, gen2/listed.ts, judged on 1-1's reach row) or '1-1' itself (the page: game code
 * never touches the listing, listed.test.ts; it is judged on that same row by its own id)
 */
export function chaseFixtureKit(code = CHASE_FIXTURE_CODE, as = CHASE_FIXTURE_ID): WorldKit {
  const W1 = w1World();
  const G = W1.manifest.graphs!;
  const brief = { ...G.briefs['1-1'], branching: 'none' as const, deal: undefined };
  const sections = as === '1-1' ? W1.manifest.sections : W1.manifest.sections.map((t) => (t.feel?.includes('1-1') ? { ...t, feel: [...t.feel, as] } : t));
  const owns = as !== '1-1' && W1.manifest.owns?.['1-1'] ? { owns: { ...W1.manifest.owns, [as]: W1.manifest.owns['1-1'] } } : {};
  return { ...W1, manifest: { ...W1.manifest, sections, ...owns, graphs: { ...G, list: [{ id: 'k', archetype: 'sprint', code }], briefs: { ...G.briefs, [as]: brief } } } };
}

/** the dev build's fixture config, or null (a shipped build never has it) */
export function chaseFixtureConfig(): LevelConfig | null {
  return devBuild() ? chaseFixtureLevel() : null;
}

function devBuild(): boolean {
  try {
    return !!import.meta.env.DEV;
  } catch {
    return false;
  }
}

/** the fixture built: the game's own gen2 build of 1-98 at this seed and setting, its hazards laid; the built config, under the id asked for */
export function buildChaseFixtureStage(config: LevelConfig, seed: number, difficulty: 'normal' | 'easy'): GeneratedStage {
  // (World 1's own finish, as the game's gen2 build gives every World 1 stage: gen2/game.ts buildGen2ForGame)
  // (built under 1-1's own id and reach row, eighth in the world: nothing in the game touches the stage listing, listed.test.ts)
  // (its nuts and fruit laid by the pipeline once its chase is (gen2/rollLay.ts rollsOf): no 'roll' socket on 1-1's pool, so World 1's look
  // lays them by the chase's own ground, the teach pair before the first crack and one to each run of ground on a stretch. ENG-CL (6))
  const kit = chaseFixtureKit(CHASE_FIXTURE_CODE, '1-1');
  const st = w1Finish(buildGen2Stage({ config: { ...chaseFixtureLevel(), id: '1-1' }, kit: { ...kit, manifest: { ...kit.manifest, rolls: W1_ROLL } }, seed, difficulty })) as unknown as GeneratedStage;
  // (ENG-B6: the chase's last engine pieces laid by data, so the page plays them: the still fork, the tip and a runner liana off it)
  layFixturePieces(st);
  // (the built stage's own config, its size and pit line its own: 1-1's config laid over it put the pit line above his ground)
  st.config = { ...st.config, id: config.id };
  return st;
}


/**
 * ENG-B6 (1-8 NEW 4, 7, 8) on the fixture, by its own data, with the gen2 lays every chase stage uses (ENG-CL (6)): the still fork on the
 * first fork (gen2/chaseTip.ts readyStillFork, then gen2/stillFork.ts layStillFork), and the last stretch made the branch's tip with a
 * gap off it and a runner liana to the far branch (chaseTip.ts layTip). Anything that cannot be laid is said in the console and left out,
 * never laid broken.
 */
export function layFixturePieces(st: GeneratedStage): void {
  const lay = st.chase;
  if (!lay?.stretches.length) return;
  if (lay.stretches.length > 1) {
    const bad = [...readyStillFork(st, 0, W1_STILL_FORK), ...layStillFork(st as unknown as Parameters<typeof layStillFork>[0], 0, W1_STILL_FORK, 1)];
    if (bad.length) console.warn(`fixture: no still fork: ${bad.join('; ')}`);
  }
  // (a PLAIN liana off the tip: 1-1's ground, which the fixture's stretches are cut from, steps 47-51 px every ~200 px and carries hop
  // rocks, so no seed gives the runner's 1,188 px of level run to the lip (243-562 px: runnerLiana.ts runTo). ENG-B6 laid a runner here
  // and filtered that line out; a runner tip is 1-8's, on its own long level branch, ENG-CL (8))
  const tip = layTip(st, { ...W1_TIP, liana: { ...W1_TIP.liana, runner: false } });
  if (tip.length) console.warn(`fixture: no tip: ${tip.join('; ')}`);
}
