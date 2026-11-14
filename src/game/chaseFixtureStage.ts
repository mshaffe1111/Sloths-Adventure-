/**
 * chaseFixtureStage — a REAL laid chase the page can load before 1-8 exists (ENG-B5, packet c): `?fixture=chase` (or
 * `window.__play('1-98')`) in a DEV build only, so the draw check and the clips play a gen2 chase with its nuts and fruit on the real
 * page. It is chaseLay.test.ts's own fixture (World 1's real kit, 1-1's brief, the graph `A T P F R K R K R S E`, listed as 1-98 for the
 * build only: gen2/listed.ts withTestStage), rolled by the game's own buildGen2Stage, and then laid with rolling hazards by data: a teach
 * nut and a teach fruit before the first crack (1-8.md beats 1-2), and on each stretch one hazard to each run of unbroken ground long
 * enough for it, nut and fruit in turn (one threat at a time, 1-8.md).
 *
 * Elsewhere it does not exist: chaseFixtureConfig() is null outside a dev build and generateStage never sees its id; a shipped build
 * drops this module (import.meta.env.DEV is false there). No stage id of the game's, no seed of the game's.
 */
import type { LevelConfig } from './types.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { RollSpec } from './rolling.ts';
import { ROLL, rollAhead } from './rolling.ts';
import { buildGen2Stage } from './gen2/pipeline.ts';
import { withTestStage } from './gen2/listed.ts';
import { JUDGED } from './gen2/reach.ts';
import { w1Finish, w1World } from './gen2/worlds/w1.ts';
import { generateAllLevels } from './worldsData.ts';
import type { WorldKit } from './gen2/types.ts';

/** the fixture's id: late in World 1 (V13: a chase is never in a world's first stage), in no world's list */
export const CHASE_FIXTURE_ID = '1-98';
/** its graph: two chase stretches between rests, a sprint finish (chaseLay.test.ts) */
export const CHASE_FIXTURE_CODE = 'A T P F R K R K R S E';

/** the fixture's config: 1-1's, renamed, eighth in World 1 */
export function chaseFixtureLevel(): LevelConfig {
  return { ...generateAllLevels().find((l) => l.id === '1-1')!, id: CHASE_FIXTURE_ID, miniIndex: 8 };
}

/** World 1's real kit with the fixture listed on 1-1's pool and 1-1's brief (no fork added, no deal: 1-1's mix rules are not a chase's) */
export function chaseFixtureKit(code = CHASE_FIXTURE_CODE): WorldKit {
  const W1 = w1World();
  const G = W1.manifest.graphs!;
  const brief = { ...G.briefs['1-1'], branching: 'none' as const, deal: undefined };
  const sections = W1.manifest.sections.map((t) => (t.feel?.includes('1-1') ? { ...t, feel: [...t.feel, CHASE_FIXTURE_ID] } : t));
  const owns = W1.manifest.owns?.['1-1'] ? { owns: { ...W1.manifest.owns, [CHASE_FIXTURE_ID]: W1.manifest.owns['1-1'] } } : {};
  return { ...W1, manifest: { ...W1.manifest, sections, ...owns, graphs: { ...G, list: [{ id: 'k', archetype: 'sprint', code }], briefs: { ...G.briefs, [CHASE_FIXTURE_ID]: brief } } } };
}

/** run `fn` with the fixture listed (judged on 1-1's reach scope), as chaseLay.test.ts does */
export function inChaseFixture<T>(fn: () => T, code = CHASE_FIXTURE_CODE): T {
  return withTestStage({ [CHASE_FIXTURE_ID]: { kit: () => chaseFixtureKit(code), seeds: [], scope: JUDGED['1-1'] } }, fn);
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

/** the fixture's hazards' pace and arcs (px/s, px): a nut's under his walk, a fruit's top well over his drawn head */
const NUT = { speed: 140, bounce: 8 } as const;
const FRUIT = { speed: 140, bounce: 165 } as const;
/** a hazard needs this much unbroken ground before where it lands (px): from where it is set off (rolling.ts rollAhead, 350-370 at a
 *  full run) to its landing, and a little more; and AFTER px past it */
const RUN_NEED = 440;
const AFTER = 80;
/** two hazards on one run of ground are this far apart (px): one threat at a time, 1.5 s+ at a run (1-8.md) */
const STEP = 560;

/**
 * nuts and fruit on a laid chase, by its own ground: the teach pair on the ground before the first crack, then one hazard to each run
 * of unbroken ground on a stretch at least RUN_NEED + AFTER px long, landing RUN_NEED into it, nut and fruit in turn
 */
export function layFixtureRolling(st: Pick<GeneratedStage, 'chase' | 'platforms'>): RollSpec[] {
  const lay = st.chase;
  if (!lay?.stretches.length) return [];
  const out: RollSpec[] = [];
  const solid = st.platforms.filter((p) => p.type === 'solid' && p.width >= 40).sort((a, b) => a.x - b.x);
  // (runs of ground: platforms that meet edge to edge at one height; a rock or a step standing on a run does not break it)
  const runs: Array<{ x0: number; x1: number; y: number }> = [];
  for (const p of solid) {
    const on = runs.find((r) => Math.abs(p.y - r.y) < 2 && p.x <= r.x1 + 1 && p.x + p.width >= r.x0 - 1);
    if (on) on.x1 = Math.max(on.x1, p.x + p.width);
    else runs.push({ x0: p.x, x1: p.x + p.width, y: p.y });
  }
  runs.sort((a, b) => a.x0 - b.x0);
  const first = lay.stretches[0].start;
  // (spots along a stretch of ground [x0, x1): RUN_NEED in, then every STEP while AFTER is left past it)
  const spots = (x0: number, x1: number): number[] => {
    const at: number[] = [];
    for (let x = x0 + RUN_NEED; x <= x1 - AFTER; x += STEP) at.push(x);
    return at;
  };
  // (the teach pair: the last two spots before the crack, a nut then a fruit, each its own beat)
  const before = runs.flatMap((r) => spots(r.x0, Math.min(r.x1, first))).sort((a, b) => a - b).slice(-2);
  const teach: RollKind[] = before.length === 2 ? ['low', 'high'] : ['low'];
  before.forEach((x, i) => out.push(spec(teach[i], x, true)));
  let k = 0;
  for (const s of lay.stretches) {
    for (const r of runs) {
      const x0 = Math.max(r.x0, s.start), x1 = Math.min(r.x1, s.end);
      for (const x of spots(x0, x1)) out.push(spec(k++ % 2 ? 'high' : 'low', x, false));
    }
  }
  out.sort((a, b) => a.dropX - b.dropX);
  return out.filter((h, i) => i === 0 || h.dropX - out[i - 1].dropX >= rollAhead(h, true) + ROLL.lowR);
}

type RollKind = RollSpec['kind'];
const spec = (kind: RollKind, dropX: number, teach: boolean): RollSpec => ({ kind, dropX: Math.round(dropX), ...(kind === 'low' ? NUT : FRUIT), teach });

/** the fixture built: the game's own gen2 build of 1-98 at this seed and setting, its hazards laid; the built config, under the id asked for */
export function buildChaseFixtureStage(config: LevelConfig, seed: number, difficulty: 'normal' | 'easy'): GeneratedStage {
  // (World 1's own finish, as the game's gen2 build gives every World 1 stage: gen2/game.ts buildGen2ForGame)
  const st = w1Finish(inChaseFixture(() => buildGen2Stage({ config: chaseFixtureLevel(), kit: chaseFixtureKit(), seed, difficulty }))) as unknown as GeneratedStage;
  st.rolling = layFixtureRolling(st);
  // (the built stage's own config, its size and pit line its own: 1-1's config laid over it put the pit line above his ground)
  st.config = { ...st.config, id: config.id };
  return st;
}

