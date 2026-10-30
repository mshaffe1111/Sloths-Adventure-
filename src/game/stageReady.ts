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
import { creatureAnimsReady, settleCreatureBakes } from './creatureAnim.ts';
import { loadPlain, plainUrls, warmPlain } from './plainSheets.ts';
import { backdropReady, stageUsesCanopy } from './paintedBackdrops.ts';
import { perfNote } from './perfLog.ts';
import { builtStageKeys, type BuiltStage } from './stageManifest.ts';
import { preloadEnabled, start } from './stagePreload.ts';
import type { LevelConfig } from './types.ts';

/** what stageReady needs of the engine: its built stage, and drawing one frame (never while it plays) */
export interface ReadyEngine {
  render(): void;
}

/**
 * how long after a stage is picked its sheets may hold the title card (ms): the card opens by itself at 8 s (ScreenVeil.tsx), and a
 * first visit on a slow connection is the only time this is reached (the offline cache has every sheet after that)
 */
export const READY_MS = 6500;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, Math.max(0, ms)));

/**
 * Get the built stage's sheets in before its first frame. `stage` is the engine's built stage; `canvas` the game's own (the title card
 * covers it); `live` says the stage is already being played (then nothing is drawn); resolves by `deadline` (performance.now()) at the
 * latest, whatever is still on its way then arriving during play as before (sheetWarm.ts ArrivalWarm draws each the frame it lands).
 */
export async function readyBuiltStage(
  cfg: Pick<LevelConfig, 'id' | 'worldIndex' | 'objectiveType' | 'secret'>,
  stage: BuiltStage,
  engine: ReadyEngine,
  canvas: HTMLCanvasElement | null,
  live: () => boolean,
  deadline: number,
): Promise<void> {
  if (typeof Image === 'undefined' || !preloadEnabled()) return;
  const t0 = performance.now();
  const ctx = canvas?.getContext('2d', { alpha: false }) ?? null;
  const keys = builtStageKeys(stage);
  const urls = start(keys);
  const plains = plainUrls(keys);
  const plainDone = loadPlain(plains);
  const back = backdropReady(cfg.worldIndex, cfg.id, stageUsesCanopy(cfg));
  const left = () => deadline - performance.now();
  // the first frame, drawn here under the card: whatever it asks for starts loading now (a boss and its lair, a sheet a module loads
  // the first time something draws it); then everything asked for so far is waited for, the frame drawn again (it may ask for more
  // once the first sheets are in: a creature's clips once its poses are), up to three rounds
  let rounds = 0;
  for (; rounds < 3 && left() > 0 && !live(); rounds++) {
    try {
      engine.render();
    } catch {
      /* a frame that cannot draw yet: play's own first frame will */
    }
    const wait = [...new Set([...urls, ...pendingSheets()])];
    if (!pendingSheets().length && rounds > 0) break;
    await Promise.race([Promise.all([whenSheetsReady(wait, Math.max(0, left())), plainDone, back]), sleep(left())]);
  }
  // each creature's clips baked (a clip sheet bakes as it arrives: this is a last check, for one still on its way), then shrunk to the
  // size the last stage's draws showed it needs: in play a bake only ever grows (creatureAnim.ts)
  const foes = keys.filter((k) => k.startsWith('foe:')).map((k) => k.slice(4));
  while (!creatureAnimsReady(foes) && left() > 0 && !live()) await sleep(Math.min(50, left()));
  if (live() || !ctx) return;
  settleCreatureBakes();
  // each sheet drawn once, a few pixels at its own size: its real decode and upload happen now, not on its first frame of play
  const all = unwarmedSheets();
  const drawn = warmSheets(all, ctx) + warmPlain(plains, ctx);
  // and one more frame: the creatures and pieces on screen draw from their sheets (a clip sheet bakes itself at the size it is drawn)
  try {
    engine.render();
  } catch {
    /* as above */
  }
  const late = pendingSheets();
  perfNote(`ready ${cfg.id}: ${keys.length} keys, ${rounds} rounds, ${drawn} sheets drawn once, ${late.length} still loading, ${Math.round(performance.now() - t0)} ms`);
}
