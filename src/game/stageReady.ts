/**
 * stageReady — the last step before a stage's first frame: with the engine made (the stage built) and its title card still covering the
 * screen, every sheet the stage can draw is loaded, decoded, handed to the graphics and (a creature's clips) baked, so nothing loads,
 * decodes or bakes in the middle of play (PERFORMANCE-RULES.md §2.12, §3.3).
 *
 * QA's control-test runs (2026-10-30): every run froze right after 'hud-atlas' and 'crumble' finished loading (127-761 ms); 'props2', the
 * eagle's, the turtle's and four golden snake sheets arrived mid-run with freezes of 279-730 ms; and the old OnePlus took 2-2.5 s over
 * its first frame. The sheets came from three places the earlier preloads missed:
 *   - what the built stage holds that its config could not say (stageManifest.ts builtStageKeys);
 *   - what the first frame itself asks for (a module whose sheet loads the first time something draws it): one frame is drawn here,
 *     under the card, and every sheet it asked for is waited for (atlasLoader.ts pendingSheets);
 *   - sheets a module loads as a plain picture, not through atlasLoader (Pokey's moving clips, the keepsake pickups): loaded and drawn
 *     once here by their address, which the browser shares with the module's own copy.
 * Then each is drawn once (a few pixels, 1:1, as atlasLoader.ts warmSheets does), and one more frame is drawn so the creatures on screen
 * bake their clips at the size they are really drawn (creatureAnim.ts).
 */
import { pendingSheets, unwarmedSheets, warmSheets, whenSheetsReady } from './atlasLoader.ts';
import { drawPaintedCardBoss } from './bossArt.ts';
import { warmScenery } from './scenery.ts';
import { warmStageArt } from './stageArt.ts';
import { warmBadWater } from './badWaterArt.ts';
import { creatureAnimsReady, settleCreatureBakes } from './creatureAnim.ts';
import { settleSheetBakes } from './sheetBake.ts';
import { releaseDecorPics, settleDecorBakes } from './envKit.ts';
import { loadPlain, plainUrls, warmPlain } from './plainSheets.ts';
import { backdropReady, revealSet, stageUsesCanopy } from './paintedBackdrops.ts';
import { perfNote } from './perfLog.ts';
import { builtStageKeys, revealOf, type BuiltStage, type RevealStrips } from './stageManifest.ts';
import { preloadEnabled, start } from './stagePreload.ts';
import type { LevelConfig } from './types.ts';

/** what stageReady needs of the engine (GameEngine): its built stage, where it draws, and drawing one frame (never while it plays) */
export interface ReadyEngine {
  render(): void;
  builtStage(): BuiltStage;
  viewNow(): { x: number; y: number; vw: number; vh: number; k: number };
}

/**
 * how long after a stage is picked its sheets may hold the title card (ms): the card opens by itself at 8 s (ScreenVeil.tsx), and a
 * first visit on a slow connection is the only time this is reached (the offline cache has every sheet after that)
 */
export const READY_MS = 6500;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, Math.max(0, ms)));

/**
 * Get the built stage's sheets in before its first frame. `engine` has built it; `canvas` is the game's own (the title card
 * covers it); `live` says the stage is already being played (then nothing is drawn); resolves by `deadline` (performance.now()) at the
 * latest, whatever is still on its way then arriving during play as before (sheetWarm.ts ArrivalWarm draws each the frame it lands).
 */
export async function readyBuiltStage(
  cfg: Pick<LevelConfig, 'id' | 'worldIndex' | 'objectiveType' | 'secret'>,
  engine: ReadyEngine,
  canvas: HTMLCanvasElement | null,
  live: () => boolean,
  deadline: number,
): Promise<void> {
  // (the last stage's ground-plant pictures go; this stage's are painted from its frames below)
  releaseDecorPics();
  if (typeof Image === 'undefined' || !preloadEnabled()) return;
  const t0 = performance.now();
  const ctx = canvas?.getContext('2d', { alpha: false }) ?? null;
  const stage = engine.builtStage();
  const keys = builtStageKeys(stage);
  const urls = start(keys);
  const plains = plainUrls(keys);
  const plainDone = loadPlain(plains);
  // (and the strips it reveals at its top, 6-8's crown: World 7's, decoded on their own, paintedBackdrops.ts)
  const reveal = revealOf(stage);
  const back = Promise.all([backdropReady(cfg.worldIndex, cfg.id, stageUsesCanopy(cfg)), reveal ? revealReady(reveal, deadline) : null]);
  const left = () => deadline - performance.now();
  // the first frame, drawn here under the card: whatever it asks for starts loading now (a boss and its lair, a sheet a module loads
  // the first time something draws it), and everything asked for so far is waited for
  const frame = () => {
    try {
      engine.render();
    } catch {
      /* a frame that cannot draw yet: play's own first frame will */
    }
  };
  const waitAll = (extra: readonly string[]) =>
    Promise.race([Promise.all([whenSheetsReady([...new Set([...extra, ...pendingSheets()])], Math.max(0, left())), plainDone, back]), sleep(left())]);
  // (a boss's painted sheet: a still of it drawn into a scratch pixel starts it, wherever on the stage it first shows)
  for (const k of keys) if (k.startsWith('boss:')) askBoss(Number(k.slice(5)));
  frame();
  await waitAll(urls);
  // each creature's clips baked (a clip sheet bakes as it arrives: this is a last check, for one still on its way), then shrunk to the
  // size the last stage's draws showed it needs: in play a bake only ever grows (creatureAnim.ts)
  const foes = keys.filter((k) => k.startsWith('foe:')).map((k) => k.slice(4));
  while (!creatureAnimsReady(foes) && left() > 0 && !live()) await sleep(Math.min(50, left()));
  if (live() || !ctx) return;
  settleCreatureBakes();
  // each sheet drawn once, a few pixels at its own size: its real decode and upload happen now, not on its first frame of play (up to
  // the deadline: one left over is drawn by play's first use of it, as before)
  let drawn = warm(ctx, plains, deadline);
  if (reveal) drawn += warmReveal(reveal, ctx);
  fitScenery(cfg.worldIndex, engine);
  // (the checkpoint flags and the pit water, and World 6-10's dirty water, baked at this view's scale and stamped once: stageArt.ts,
  // badWaterArt.ts; each skips a sheet not in yet)
  const k = engine.viewNow().k;
  warmStageArt(cfg.worldIndex, k, ctx);
  if (keys.includes('bad-water')) warmBadWater(k, ctx);
  // and one more frame: the creatures and pieces on screen draw from their sheets (a clip sheet bakes itself at the size it is drawn),
  // and whatever that frame asks for besides (a creature's clips once its poses are in) is got in and drawn once too
  frame();
  if (pendingSheets().length && left() > 0 && !live()) {
    await waitAll([]);
    if (live()) return;
    drawn += warm(ctx, plains, deadline);
  }
  // (the painted sprites drawn through sheetBake.ts bake their sheets at the size the frames above drew them at: only here, never in play)
  if (!live()) settleSheetBakes();
  // (and the ground plants those frames met become pictures, stamped from the first frame of play: envKit.ts)
  if (!live()) settleDecorBakes();
  const late = pendingSheets();
  const line = `ready ${cfg.id}: ${keys.length} keys, ${drawn} sheets drawn once, ${late.length} still loading, ${Math.round(performance.now() - t0)} ms`;
  perfNote(line);
  // (the dev server's console too, for the headless checks)
  if (import.meta.env?.DEV) console.info(line);
}

/**
 * The painted backdrop strips resampled once at the size this screen draws them (scenery.ts warmScenery): after the scene seed is
 * rolled (the engine's constructor) and the backdrop has decoded (the wait above), so no frame of play makes a fit.
 */
function fitScenery(world: number, engine: ReadyEngine) {
  const v = engine.viewNow();
  // (upright, the strips are drawn at the height sideways uses for the same width of world: engine.ts WORLD_VIEW_H 540 over
  // PORTRAIT_VIEW_W 440)
  warmScenery(world, v.x, v.y, v.vw, v.vh, v.k, v.vh > v.vw ? (540 * v.vw) / 440 : v.vh);
}

/** the revealed strips decoded (revealSet starts them and is null until they are in), or `deadline` */
async function revealReady(r: RevealStrips, deadline: number): Promise<void> {
  while (!revealSet(r) && performance.now() < deadline) await sleep(50);
}
/** each revealed strip drawn once, a few pixels 1:1, as the rest; how many */
function warmReveal(r: RevealStrips, ctx: CanvasRenderingContext2D): number {
  const set = revealSet(r);
  if (!set) return 0;
  let n = 0;
  for (const im of [set.far, set.mid, set.near, set.sky]) {
    if (!im) continue;
    try {
      ctx.drawImage(im, 0, 0, 4, 4, 0, 0, 4, 4);
      ctx.clearRect(0, 0, 4, 4);
      n++;
    } catch {
      /* play draws it as before */
    }
  }
  return n;
}

let scratch: CanvasRenderingContext2D | null = null;
function askBoss(world: number) {
  if (typeof document === 'undefined') return;
  if (!scratch) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 1;
    scratch = cv.getContext('2d');
  }
  if (scratch) drawPaintedCardBoss(scratch, world, false, false);
}

/** draw each loaded sheet once that has not been yet, until just after `deadline`; how many */
function warm(ctx: CanvasRenderingContext2D, plains: readonly string[], deadline: number): number {
  // (a second past the waiting's own deadline: the title card opens by itself at 8 s)
  const until = deadline + 1000;
  let n = 0;
  for (const u of unwarmedSheets()) {
    if (performance.now() > until) return n;
    n += warmSheets([u], ctx);
  }
  for (const u of plains) {
    if (performance.now() > until) return n;
    n += warmPlain([u], ctx);
  }
  return n;
}
