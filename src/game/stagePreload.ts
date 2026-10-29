/**
 * stagePreload — load, decode and draw once the sheets a stage needs (stageSheets.ts) before it starts: while the world map shows the
 * stage picked, behind the stage-cleared card for the next stage in the same world, behind a world's story or a boss intro, and (for
 * what is still on its way) for a moment before the engine is made (App.tsx launchEngine).
 *
 * QA's control-test logs (2026-10-26) had a 472 ms freeze entering a World 3 stage ('after w3-props') and 376 ms entering 4-2 ('after
 * w4-props'), right as play began: the sheet arrived, and its first draw was the browser's real decode and upload of 10 to 20 MB.
 *
 * Memory (atlasLoader.ts): preloading a stage in another world counts as entering that world, so the last world's sheets are let go
 * first and two worlds' sheets are never held at once; only the one stage's sheets are asked for.
 */
import { enterWorld, releaseSheets, warmSheets, whenSheetsReady } from './atlasLoader.ts';
import { creatureAnimUrl, warmCreatureAnims } from './creatureAnim.ts';
import { BACK_URL, DOT_BRIDGES_URL, DOT_PROPS_URL, dotPropsReady, warmDotSheets } from './dotFlightArt.ts';
import { DOT_ATLAS_URL } from './dotSprite.ts';
import { kitUrl, paintedKitEnabled, PROTO2_URL, warmKit, warmProto2 } from './protoArt.ts';
import { protoStageEnabled } from './protoStage.ts';
import { ctestEnabled, ctestSeed } from './playRecorder.ts';
import { W2_PROPS_URL, riverArtReady } from './riverArt.ts';
import { W3_PROPS_URL, w3ArtReady } from './w3Art.ts';
import { W4_PROPS_URL, w4ArtReady } from './w4Art.ts';
import { W4_GRIT_URL, w4GritReady } from './w4Grit.ts';
import { W5_PROPS_URL, w5ArtReady } from './w5Art.ts';
import { KIT_ART_URL, kitArtReady } from './puzzleArt.ts';
import { NIGHT_ART_URL, nightArtReady } from './meecaNightArt.ts';
import { jennifurSpriteReady, MEECA_STANDARD_URL } from './jennifurSprite.ts';
import { MEECA_CARVE_URL } from './meecaCarveData.ts';
import { MEECA_BLANKET_URL } from './meecaBlanketData.ts';
import { warmMeecaArt } from './meecaArt.ts';
import { BACKDROP_WAIT_MS, backdropReady, stageUsesCanopy } from './paintedBackdrops.ts';
import { CTEST_FOES, ctestMixDraws, stageSheets } from './stageSheets.ts';
import { SPRITES, warmSprites } from './spriteSheets.ts';
import { CTEST_STAGE_ID } from './stageGenerator.ts';
import { DOT_PERCH_URL, perchArtReady } from '../components/hud/painted.tsx';
import { warmWaterSigns } from './waterSign.ts';
import { WATER_SIGN_URL } from './waterSignData.ts';
import { BAD_WATER_URL, badWaterReady } from './badWaterArt.ts';
import { W4_FALLS_URL, fallsArtReady } from './w4FallsArt.ts';
import { STILT_ART_URLS, stiltArtReady } from './w6StiltArt.ts';
import { CALM_WATER_URL, calmWaterReady } from './calmWaterArt.ts';
import { SWIM_ATLAS_URL, swimAtlasReady } from './heroSwim.ts';
import { DOT_STAGE_ID } from './extraStages.ts';
import { LEAVES_URL, warmLeaves } from './leafSprites.ts';
import { HERO_VINE_URL, warmHeroVine } from './heroVine.ts';
import { HERO_ROPE_URL, warmHeroRope } from './heroRope.ts';
import { ROPE_KIT_URL, warmRopeKit } from './ropeArt.ts';
import { BOSS_FX_URL, warmBossFx } from './bossFx.ts';
import { perfNote } from './perfLog.ts';
import { groundUrl, hasGround, warmGround } from './groundPaint.ts';
import { DRESS_URL, dressReady } from './dressArt.ts';
import { gateArtReady, gateUrl, pitWaterReady, pitWaterUrl, STAGE_ART_URL, stageArtReady } from './stageArt.ts';
import type { LevelConfig } from './types.ts';

type Cfg = Pick<LevelConfig, 'id' | 'worldIndex' | 'objectiveType' | 'secret'>;

/** start the loads for these sheet keys; the addresses to wait for */
function start(keys: readonly string[]): string[] {
  const urls: string[] = [];
  // (the painted ground goes with the stage's own kit: the highest kit asked for, World 1's only when it is the only one)
  const kits = keys.filter((k) => k.startsWith('kit:')).map((k) => Number(k.slice(4)));
  if (kits.length) {
    const gw = Math.max(...kits);
    if (hasGround(gw)) {
      warmGround(gw);
      urls.push(groundUrl(gw));
    }
  }
  for (const k of keys) {
    if (k.startsWith('kit:')) {
      const w = Number(k.slice(4));
      warmKit(w);
      urls.push(kitUrl(w));
    } else if (k === 'w2-props') {
      riverArtReady();
      urls.push(W2_PROPS_URL);
    } else if (k === 'w3-props') {
      w3ArtReady();
      urls.push(W3_PROPS_URL);
    } else if (k === 'w4-props') {
      w4ArtReady();
      urls.push(W4_PROPS_URL);
    } else if (k === 'w5-props') {
      w5ArtReady();
      urls.push(W5_PROPS_URL);
    } else if (k === 'kit-pieces') {
      kitArtReady();
      urls.push(KIT_ART_URL);
    } else if (k === 'dress') {
      dressReady();
      urls.push(DRESS_URL);
    } else if (k === 'water-signs') {
      warmWaterSigns();
      urls.push(WATER_SIGN_URL);
    } else if (k === 'bad-water') {
      badWaterReady();
      urls.push(BAD_WATER_URL);
    } else if (k === 'w6-stilt') {
      stiltArtReady();
      urls.push(...STILT_ART_URLS);
    } else if (k === 'swim') {
      calmWaterReady();
      swimAtlasReady();
      urls.push(CALM_WATER_URL, SWIM_ATLAS_URL);
    } else if (k === 'meeca-night') {
      nightArtReady();
      urls.push(NIGHT_ART_URL);
    } else if (k === 'meeca') {
      jennifurSpriteReady();
      warmMeecaArt();
      urls.push(MEECA_STANDARD_URL, MEECA_CARVE_URL, MEECA_BLANKET_URL);
    } else if (k === 'w4-falls') {
      fallsArtReady();
      urls.push(W4_FALLS_URL);
    } else if (k === 'dot-props') {
      dotPropsReady();
      urls.push(DOT_PROPS_URL);
    } else if (k === 'dot') {
      warmDotSheets();
      urls.push(DOT_PROPS_URL, DOT_ATLAS_URL, DOT_BRIDGES_URL, ...Object.values(BACK_URL));
    } else if (k.startsWith('foe:')) {
      // a creature: its clip sheet (if it has one) and its painted poses (spriteSheets.ts)
      const n = k.slice(4);
      warmCreatureAnims([n]);
      const u = creatureAnimUrl(n);
      if (u) urls.push(u);
      urls.push(...warmSprites([n]));
    } else if (k === 'props2') {
      warmProto2();
      urls.push(PROTO2_URL);
    } else if (k === 'perch') {
      perchArtReady();
      urls.push(DOT_PERCH_URL);
    } else if (k === 'stage-art') {
      stageArtReady();
      urls.push(STAGE_ART_URL);
    } else if (k.startsWith('gate:')) {
      const w = Number(k.slice(5));
      gateArtReady(w);
      urls.push(gateUrl(w));
    } else if (k.startsWith('pit-water:')) {
      const w = Number(k.slice(10));
      const u = pitWaterUrl(w);
      if (u) {
        pitWaterReady(w);
        urls.push(u);
      }
    } else if (k.startsWith('anim:')) {
      const n = k.slice(5);
      warmCreatureAnims([n]);
      const u = creatureAnimUrl(n);
      if (u) urls.push(u);
    }
  }
  return urls;
}

/** on for everyone; `?preload=0` in the address turns it off (to compare a stage's first seconds with and without it) */
export function preloadEnabled(): boolean {
  try {
    return !(typeof location !== 'undefined' && /[?&]preload=0\b/.test(location.search));
  } catch {
    return true;
  }
}

let pending: { id: string; done: Promise<void> } | null = null;

/**
 * Get the stage's sheets loaded and decoded, and draw each once on `canvas` (the game's own, which a menu covers) when it is ready.
 * Starting again for the same stage joins the one under way. Resolves when they are all in, or after `ms`. `live`: a stage is being
 * played now (a sheet that comes in after play began is left to play's own first draw, as before: nothing is drawn under live play).
 */
export function preloadStage(cfg: Cfg, canvas: HTMLCanvasElement | null, live: () => boolean = () => false, ms = 8000): Promise<void> {
  if (typeof Image === 'undefined' || !preloadEnabled()) return Promise.resolve();
  // (the control test: the mix about to be played, so only its creatures are asked for, and the others' sheets are let go)
  const mix = ctestEnabled() && cfg.id === CTEST_STAGE_ID ? ctestSeed() : undefined;
  const id = mix ? `${cfg.id}#${mix}` : cfg.id;
  if (pending?.id === id) return pending.done;
  // (a stage in another world: the last world's sheets go first, as starting the stage would do)
  enterWorld(cfg.worldIndex);
  if (mix && !live()) releaseCtestFoes(ctestMixDraws(mix).foes);
  const keys = stageSheets(cfg, { hand: protoStageEnabled(), paint: paintedKitEnabled(), ctest: ctestEnabled(), mix });
  const urls = start(keys);
  // (and two small sheets nearly every stage draws: the falling leaves, and Pokey hanging from a liana; QA's 'blank wait leaves-atlas'
  // a second into a stage, 'wait hero-vine' at the first swing)
  if (cfg.id !== DOT_STAGE_ID) {
    if (warmLeaves()) urls.push(LEAVES_URL);
    warmHeroVine();
    urls.push(HERO_VINE_URL);
    // (and Pokey on a shimmy rope with the painted rope: two small sheets, asked for like the liana one, since which stages hang a
    // rope is only known once the stage is built)
    warmHeroRope();
    warmRopeKit();
    urls.push(HERO_ROPE_URL, ROPE_KIT_URL);
    // (and the painted effects: every stage's dust puffs and hit sparks, and a boss fight's warnings and hazards)
    warmBossFx();
    urls.push(BOSS_FX_URL);
    // (and the painted grit every stage's crumbling ledges and breaking pillars throw: small, and asked for everywhere)
    w4GritReady();
    urls.push(W4_GRIT_URL);
  }
  // (the stage's painted backdrop too: World 5's light changes stage to stage, so its strips are a fresh set to decode; and the canopy
  // strips of a stage played up in the trees, which used to load on first use and pop in a second time)
  void backdropReady(cfg.worldIndex, cfg.id, stageUsesCanopy(cfg));
  const t0 = performance.now();
  const ctx = canvas?.getContext('2d', { alpha: false }) ?? null;
  const done = whenSheetsReady(urls, ms).then((n) => {
    const drawn = live() ? 0 : warmSheets(urls, ctx);
    perfNote(`preloaded ${cfg.id}: ${n}/${urls.length} sheets ready, ${drawn} drawn once, ${Math.round(performance.now() - t0)} ms`);
  });
  const mine = { id, done };
  pending = mine;
  void done.then(() => {
    if (pending === mine) pending = null;
  });
  return done;
}

/** the control test's creature sheets that this mix does not draw: let go (a decoded clip sheet is 13 to 20 MB) */
function releaseCtestFoes(keep: readonly string[]) {
  const urls: string[] = [];
  for (const n of CTEST_FOES) {
    if (keep.includes(n)) continue;
    const u = creatureAnimUrl(n);
    if (u) urls.push(u);
    urls.push(...(SPRITES[n]?.urls() ?? []));
  }
  releaseSheets(urls);
}

/**
 * The engine is about to be made for this stage: whatever of its sheets is still on its way gets up to `ms` more (behind the stage's
 * name card, before the first frame), then each is drawn once. Most of the time they arrived behind the menu and this is at once.
 * The stage's painted backdrop (and canopy) gets up to `backMs`: a stage that opened on the stand-in sky and had its painting pop in a
 * moment later was the first thing a player saw (polish report VI-3). Whatever is still later than that fades in (scenery.ts).
 */
export function readyToStart(cfg: Cfg, canvas: HTMLCanvasElement | null, live: () => boolean, ms = 900, backMs = BACKDROP_WAIT_MS): Promise<void> {
  if (typeof Image === 'undefined' || !preloadEnabled()) return Promise.resolve();
  let started = false;
  const wait = (p: Promise<void>, t: number) => Promise.race([p, new Promise<void>((r) => setTimeout(r, t))]);
  return Promise.all([
    wait(preloadStage(cfg, canvas, () => started || live()), ms),
    wait(backdropReady(cfg.worldIndex, cfg.id, stageUsesCanopy(cfg)), backMs),
  ]).then(() => {
    started = true;
  });
}
