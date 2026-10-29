/**
 * scenery — layered, pre-painted parallax backdrops + weather for all ten worlds.
 *
 * Every layer is painted once into an offscreen tile (cached per world) and composited with
 * parallax each frame. That lets the layers carry far more detail than we could afford to
 * draw live, which is what gives the scenes their depth and richness.
 */
import { getSceneSeed, onSceneSeedChange } from './sceneSeed.ts';
import { drawPaintedLeaf } from './leafSprites.ts';
import { renderLifeBack, renderLifeFront } from './life.ts';
import { setHeroScreen, clearHeroScreen, heroScreen, laneClear } from './heroLane.ts';
import { glowPic } from './glow.ts';
import { getScratch } from './scratch.ts';
import { composeClusters } from './placement.ts';
import { warmFloraArt, sceneryFlowers, paintShrub } from './paintedScenery.ts';
import { isRich } from './rainforest.ts';
import { backdropStage, canopyFor, paintedFor, peekPainted, onPaintedReady, hasPainted, FADE_IN_MS, type PaintedSet } from './paintedBackdrops.ts';
import { w5Mood, type W5Mood } from './w5Backdrop.ts';
import { paintBiomeMid } from './biomes.ts';
import { hasKit, paintNearPlant, paintFrontClump, paintFrontHang } from './envKit.ts';
import { polishEnabled, polishTier, pskip, rigFor, polishBack, polishFront, swayWeight, swayAmount, gustAt, type LayerName, type Rig } from './polish.ts';
import {
  rng, tone, mix, mixToHex, lighten, darken, rgba, drawCrown, drawFrond, drawMonstera, drawBananaLeaf,
  drawGrass, drawFlower, drawMushroom, drawRock, drawCloud, drawRays, drawLiana,
  type RNG, type Tone,
} from './artKit.ts';

export type Weather = 'leaves' | 'petals' | 'fireflies' | 'rain' | 'embers' | 'mist' | 'storm' | 'spores' | 'ash';
export type FarKind = 'peaks' | 'cliffs' | 'karst' | 'ruins' | 'volcano' | 'fortress' | 'shrooms' | 'orchid' | 'mangrove' | 'dusk' | 'palms';
export type TreeKind = 'jungle' | 'palm' | 'umbrella' | 'willow' | 'shroom' | 'dead';

export interface Look {
  sky: [string, string, string, string];
  sun?: { x: number; y: number; r: number; core: string; glow: string };
  stars?: boolean;
  clouds: { top: string; bottom: string; n: number } | null;
  far: FarKind;
  farCols: [string, string, string]; // back, front, rim
  haze: string;
  hills: [string, string, string];
  trunk: [string, string];
  crowns: string[];
  trees: TreeKind[];
  leaves: string[];
  flora: string[];
  rays: string;
  rayA: number;
  weather: Weather;
  grade: [string, number];
  glow?: string;
  ground: {
    cap: string; capHi: string; capDark: string; dirt: string; dirtDark: string; stone: string; outline: string;
    kind: 'grass' | 'moss' | 'stone' | 'ash' | 'sand' | 'fungus';
  };
  water: { top: string; bottom: string; foam: string };
  vine: { main: string; leaf: string; flower: string };
}

export const LOOKS: Record<number, Look> = {
  // 1 — Emerald Canopy: bright toucan-postcard day
  1: {
    sky: ['#4cb7ff', '#8fd8ff', '#d4f6ff', '#fff6c8'],
    sun: { x: 0.7, y: 0.2, r: 46, core: '#fffbe0', glow: '#fff1a0' },
    clouds: { top: '#ffffff', bottom: '#cfe9ff', n: 5 },
    far: 'peaks', farCols: ['#7cc6c8', '#4fae9c', '#d8ffe8'], haze: '#e6fbd8',
    hills: ['#7fd957', '#4fc04a', '#2a9d4a'],
    trunk: ['#74784a', '#34361c'], crowns: ['#5ed140', '#35b84a', '#8be04a', '#27a56a'],
    trees: ['jungle', 'palm', 'jungle', 'umbrella'],
    leaves: ['#2fbf4a', '#1c9a47', '#7ad94b', '#0f7d4d'], flora: ['#ff5d73', '#ffb02e', '#ff7ad9', '#fff06a'],
    rays: '#fff2a0', rayA: 0.16, weather: 'leaves', grade: ['#ffe08a', 0.05],
    ground: { cap: '#4fa03e', capHi: '#86c86a', capDark: '#2e6e2c', dirt: '#5a3e30', dirtDark: '#2a1812', stone: '#c9bfa8', outline: '#3b1f0c', kind: 'grass' },
    water: { top: '#59d6ff', bottom: '#1d8fd0', foam: '#e8fbff' },
    vine: { main: '#2f9a3a', leaf: '#6fe05a', flower: '#ff5d73' },
  },
  // 2 — Sunlit Riverbank: golden hour, turquoise river
  2: {
    sky: ['#ff8c5a', '#ffb870', '#ffe29a', '#fff4cf'],
    sun: { x: 0.5, y: 0.34, r: 78, core: '#fff6cf', glow: '#ffb050' },
    clouds: { top: '#ffe0b8', bottom: '#ff9a7a', n: 4 },
    far: 'palms', farCols: ['#c07ab0', '#7a5aa0', '#ffd7a0'], haze: '#ffd2a0',
    hills: ['#46c9a0', '#25a88c', '#127f78'],
    trunk: ['#ecd08c', '#8a6a46'], crowns: ['#2fc08a', '#7ed95a', '#1fa888', '#b6e04a'],
    trees: ['palm', 'willow', 'palm', 'jungle'],
    leaves: ['#18b58c', '#7ed95a', '#0e8f7a', '#c4e24a'], flora: ['#ff8a2a', '#ff5a5a', '#ffd23a', '#ff9ad0'],
    rays: '#ffd08a', rayA: 0.2, weather: 'petals', grade: ['#ff9a40', 0.08],
    ground: { cap: '#7fae46', capHi: '#b6d07a', capDark: '#4a7a30', dirt: '#c5a568', dirtDark: '#6a4a3a', stone: '#e8d4a8', outline: '#4a2a10', kind: 'grass' },
    // the river is "wide, brown, and in no hurry" (the story, and the painted backdrop): slow green-brown water, not turquoise
    water: { top: '#8a7d55', bottom: '#3a3220', foam: '#efe4c4' },
    vine: { main: '#3aa84a', leaf: '#a8e85a', flower: '#ff8a2a' },
  },
  // 3 — Mossy Grotto: bioluminescent cave forest
  3: {
    sky: ['#030f17', '#06222b', '#0b3d42', '#1c6b60'],
    sun: { x: 0.55, y: 0.38, r: 30, core: '#e8ffe0', glow: '#6affc0' },
    clouds: null,
    far: 'shrooms', farCols: ['#0a3c44', '#062a34', '#4fd8b0'], haze: '#12605a',
    hills: ['#0e5a52', '#0a4244', '#062e3a'],
    trunk: ['#5a4636', '#1d1522'], crowns: ['#127a68', '#1a9478', '#0c5a52', '#3fb886'],
    trees: ['jungle', 'willow', 'jungle', 'willow'],
    leaves: ['#10907a', '#0a6a70', '#4fc890', '#12607a'], flora: ['#ff5ad0', '#5ae6ff', '#ffb02e', '#b06aff'],
    rays: '#7affc8', rayA: 0.12, weather: 'spores', glow: '#7dffe0', grade: ['#00121e', 0.32],
    ground: { cap: '#24806a', capHi: '#50aa8b', capDark: '#0a4a40', dirt: '#223f46', dirtDark: '#0a1a26', stone: '#6a8e8a', outline: '#040f16', kind: 'moss' },
    // cave water: dark, with a cold teal glow (the painted grotto has no bright blue)
    water: { top: '#2a6a6e', bottom: '#04161e', foam: '#9ae0d8' },
    vine: { main: '#0e8a70', leaf: '#4fd8a8', flower: '#ff5ad0' },
  },
  // 4 — Mist Cascades: waterfalls, rain, rainbow
  4: {
    sky: ['#5b86b8', '#8fb4d6', '#c6dcea', '#eaf3ea'],
    clouds: { top: '#eef4fa', bottom: '#9ab4cc', n: 5 },
    far: 'cliffs', farCols: ['#6f9a9a', '#4f8484', '#e6fff5'], haze: '#dff0ee',
    hills: ['#5fb89a', '#3aa080', '#1f8068'],
    trunk: ['#7f8a92', '#343c44'], crowns: ['#3fb890', '#5fd0a0', '#2a9a7a', '#8ae0b0'],
    trees: ['jungle', 'willow', 'palm', 'jungle'],
    leaves: ['#2fb58a', '#1a9a7a', '#7fe0b0', '#2a8aa0'], flora: ['#ff6a8a', '#ffb8c8', '#fff06a', '#8ad0ff'],
    rays: '#ffffff', rayA: 0.14, weather: 'mist', grade: ['#4a78a8', 0.1],
    ground: { cap: '#5f9486', capHi: '#a2c8bc', capDark: '#408071', dirt: '#7e8a8e', dirtDark: '#3a464e', stone: '#b4c0c4', outline: '#1c262c', kind: 'moss' },
    // the water runs cloudy: the Heartbloom has stayed closed too long (the story)
    water: { top: '#a8bcc4', bottom: '#4a5e6a', foam: '#ffffff' },
    vine: { main: '#2aa07a', leaf: '#7fe8b8', flower: '#ff6a8a' },
  },
  // 5 — Orchid Sanctuary: a lovely golden afternoon (5-1 to 5-3, and the world's face on the map). The light goes down through the
  // world as the orchids close: W5_MOOD_LOOKS below has the dusk (5-4 to 5-6) and the misty violet twilight (5-7 to 5-9), w5Backdrop.ts
  // says which stage plays in which. Warm honey sky, gold haze, sunlit moss and warm earth, amber pond water, matched to the gold strips.
  5: {
    sky: ['#f2b36e', '#f8cd8e', '#ffe2b2', '#fff1d4'],
    sun: { x: 0.24, y: 0.3, r: 70, core: '#fff8dc', glow: '#ffd290' },
    clouds: { top: '#fff1dc', bottom: '#f4c494', n: 4 },
    far: 'orchid', farCols: ['#d9a878', '#b98a5e', '#fff0d2'], haze: '#ffe2b8',
    hills: ['#b9a45e', '#8f8048', '#5f5a34'],
    trunk: ['#8e6a48', '#3e2a1c'], crowns: ['#f0a8c4', '#e6c0e8', '#f8cc8c', '#7cb860'],
    trees: ['umbrella', 'jungle', 'palm', 'willow'],
    leaves: ['#6aa84a', '#a8b850', '#f0a0c0', '#3f8a4a'], flora: ['#ff8ac0', '#ffffff', '#ffc040', '#e0a8ff'],
    rays: '#ffe2a0', rayA: 0.22, weather: 'petals', grade: ['#ffb45a', 0.06],
    // sunlit moss and warm honey earth, to sit inside the gold strips' afternoon (it was a dim violet for the old backdrop)
    ground: { cap: '#8c9c4c', capHi: '#cdd08a', capDark: '#56642e', dirt: '#6e5236', dirtDark: '#2e2014', stone: '#cbb78e', outline: '#24170c', kind: 'grass' },
    // a still pond catching the gold
    water: { top: '#a9a46e', bottom: '#4a4a2c', foam: '#fff4d8' },
    vine: { main: '#6a8a3a', leaf: '#b8d878', flower: '#ffb8d8' },
  },
  // 6 — Deep Mangrove: chartreuse swamp haze, fireflies
  6: {
    // a blackwater peat swamp: heavy overcast mist, tall dark trees standing in tea-brown water, fireflies after dusk
    sky: ['#24342a', '#3e5442', '#6e8462', '#b4ba90'],
    sun: { x: 0.35, y: 0.3, r: 46, core: '#f4f0d0', glow: '#c8d49a' },
    clouds: { top: '#8a9c7c', bottom: '#34463a', n: 4 },
    far: 'mangrove', farCols: ['#4a5c46', '#2e4034', '#a8b88a'], haze: '#8a9c7a',
    hills: ['#40593a', '#2f4a36', '#1f3a2e'],
    trunk: ['#5a4a34', '#1a120a'], crowns: ['#4a7a3a', '#6a9a44', '#34603a', '#8ab048'],
    trees: ['willow', 'jungle', 'willow', 'umbrella'],
    leaves: ['#3f7a34', '#2a6030', '#6a9a3a', '#1f4a30'], flora: ['#ffd23a', '#ff8a3a', '#e8e08a', '#c85a7a'],
    rays: '#d8e0a0', rayA: 0.12, weather: 'fireflies', glow: '#d8ff7a', grade: ['#3a5a2a', 0.12],
    ground: { cap: '#6e8a57', capHi: '#adc489', capDark: '#384a2f', dirt: '#4a3e30', dirtDark: '#1a1208', stone: '#8a8a70', outline: '#14100a', kind: 'moss' },
    // "the water between them lay flat and gray" (the story, and the painted swamp)
    water: { top: '#4a4e4c', bottom: '#0e1010', foam: '#b8bcb4' },
    vine: { main: '#4a6a2a', leaf: '#9ac04a', flower: '#e8e08a' },
  },
  // 7 — Ancient Ruins: amber stone, golden light
  7: {
    sky: ['#e6803a', '#f5a85a', '#fcd48a', '#fff0c0'],
    sun: { x: 0.72, y: 0.3, r: 62, core: '#fff8d8', glow: '#ffc060' },
    clouds: { top: '#ffe2b0', bottom: '#f09a5a', n: 4 },
    far: 'ruins', farCols: ['#d8c490', '#7b6c7a', '#ffe0a8'], haze: '#ffd8a0',
    hills: ['#8fb04a', '#5f9a3f', '#3a7a3a'],
    trunk: ['#d8c490', '#4a3a2e'], crowns: ['#c8b83a', '#8fc03f', '#e0a032', '#58a040'],
    trees: ['jungle', 'umbrella', 'palm', 'jungle'],
    leaves: ['#4fa83a', '#d8b83a', '#2f8a3a', '#e08a32'], flora: ['#ffb030', '#ff6a3a', '#fff06a', '#ff9ad0'],
    rays: '#ffe0a0', rayA: 0.22, weather: 'leaves', grade: ['#ffa040', 0.08],
    ground: { cap: '#8eaa62', capHi: '#bbcb83', capDark: '#587241', dirt: '#8b7153', dirtDark: '#3e3340', stone: '#e8d2a8', outline: '#3a2410', kind: 'stone' },
    // old temple water, green-grey under the dusk (it was bright turquoise)
    water: { top: '#5a7a70', bottom: '#1a2a26', foam: '#dfe8d8' },
    vine: { main: '#4a8a2a', leaf: '#a8d84a', flower: '#ffb030' },
  },
  // 8 — Twilight Treetops: purple dusk, moon, glow flowers
  8: {
    // a limestone karst forest at dusk: violet-to-rose sky and a moon, night-green foliage, pale night-blooming flowers
    sky: ['#0b1238', '#1d3470', '#74559a', '#f0a088'],
    sun: { x: 0.72, y: 0.22, r: 44, core: '#fffaf0', glow: '#cfe0ff' },
    stars: true, clouds: { top: '#6a78b0', bottom: '#232d5c', n: 4 },
    far: 'karst', farCols: ['#5a6a8a', '#3a4868', '#f0b0a0'], haze: '#8a80b8',
    hills: ['#4a6a7a', '#34526a', '#223a50'],
    trunk: ['#7a6a5a', '#2a2018'], crowns: ['#2f7a6a', '#3f9a78', '#245a5a', '#6aaa6a'],
    trees: ['umbrella', 'willow', 'jungle', 'palm'],
    leaves: ['#2f7a6a', '#3f9a78', '#245a6a', '#1c4a52'], flora: ['#f4ecd4', '#5ae0c0', '#ffb25a', '#e8c0e0'],
    rays: '#d8e0ff', rayA: 0.14, weather: 'fireflies', glow: '#8aff9a', grade: ['#2a3a8a', 0.12],
    ground: { cap: '#2d8564', capHi: '#61a680', capDark: '#1a4a3a', dirt: '#66625a', dirtDark: '#403c38', stone: '#cfc8b8', outline: '#0e1418', kind: 'moss' },
    water: { top: '#4a8aa8', bottom: '#14304a', foam: '#e0f0f4' },
    vine: { main: '#2a6a5a', leaf: '#5ae0c0', flower: '#f4ecd4' },
  },
  // 9 — Volcanic Jungle: lava glow, embers
  9: {
    sky: ['#3a0a18', '#a8261a', '#ee6a1e', '#ffbf4a'],
    sun: { x: 0.62, y: 0.4, r: 70, core: '#fff0b0', glow: '#ff7a1a' },
    clouds: { top: '#c85a3a', bottom: '#4a1418', n: 4 },
    far: 'volcano', farCols: ['#5a1a22', '#3a1218', '#ff9a3a'], haze: '#ff8a3a',
    hills: ['#6a2a22', '#4a1a1a', '#2a0f12'],
    trunk: ['#5a3a2a', '#1a1010'], crowns: ['#4a2a22', '#6a3a2a', '#2a1a18', '#ffa030'],
    trees: ['dead', 'palm', 'dead', 'jungle'],
    leaves: ['#5a3a2a', '#6a2a3a', '#2a1a14', '#7a8a2a'], flora: ['#ff6a1a', '#ffd23a', '#ff3a3a', '#fff0a0'],
    rays: '#ff9a4a', rayA: 0.2, weather: 'embers', glow: '#ff7a1a', grade: ['#ff4a10', 0.1],
    ground: { cap: '#4a3a3a', capHi: '#8a7a74', capDark: '#241818', dirt: '#3a2a2a', dirtDark: '#160e0e', stone: '#7a6a66', outline: '#0a0505', kind: 'ash' },
    water: { top: '#ffd23a', bottom: '#e8400a', foam: '#fff4b0' },
    vine: { main: '#7a3a22', leaf: '#ff8a2a', flower: '#ffd23a' },
  },
  // 10 — Stormy Highlands Fortress: thunderstorm over a crimson-lit iron keep
  10: {
    sky: ['#06050e', '#171030', '#3a1a46', '#9a3a58'],
    clouds: { top: '#6a3a6a', bottom: '#1a0e2a', n: 6 },
    far: 'fortress', farCols: ['#2a1a3a', '#150d24', '#ff6a7a'], haze: '#5a2a58',
    hills: ['#2c1c3c', '#1e1230', '#140c20'],
    trunk: ['#4a3a50', '#150f1e'], crowns: ['#4a3556', '#5e3052', '#38304e', '#6e3a54'],
    trees: ['dead', 'jungle', 'dead', 'palm'],
    leaves: ['#4a3556', '#6e2a48', '#38304e', '#7e3a54'], flora: ['#ff5a72', '#ff9aa8', '#e8d0ff', '#ffd05a'],
    rays: '#ff8aa0', rayA: 0.07, weather: 'storm', grade: ['#3a0f3a', 0.13],
    ground: { cap: '#4a4e5e', capHi: '#8a90a4', capDark: '#22242e', dirt: '#33303f', dirtDark: '#15121c', stone: '#7c7690', outline: '#06040a', kind: 'stone' },
    // rain pooled in the rock: cold slate, not the old crimson
    water: { top: '#4a5468', bottom: '#0e1220', foam: '#c8d0dc' },
    vine: { main: '#5a2e44', leaf: '#c8708a', flower: '#ff7a96' },
  },
};

// ───────────────────────────── seeded variants ─────────────────────────────

/**
 * World 5's light by stage (Matt, 2026-10-26): the gold above is 5-1 to 5-3; these turn the screen tint, the water and the drawn ground
 * duskier as the orchids close (5-4 to 5-6), then to a misty violet twilight (5-7 to 5-9: still a lit sky, never night, World 8 is
 * the night). The one night is Meeca's own stage (5-M), the night she got away. Which stage is which comes from w5Backdrop.ts (w5Mood), the same as the painted strips.
 */
export const W5_MOOD_LOOKS: Record<W5Mood, Partial<Look>> = {
  gold: {},
  dusk: {
    sky: ['#c98a7c', '#e0a28c', '#efc0a2', '#f6d8bc'],
    sun: { x: 0.2, y: 0.46, r: 74, core: '#ffe8c8', glow: '#f0a080' },
    clouds: { top: '#f6d2c0', bottom: '#c98a90', n: 4 },
    farCols: ['#a8848c', '#86687a', '#f2d2c8'], haze: '#ecc8bc',
    hills: ['#8e8470', '#6c6458', '#4a4440'],
    crowns: ['#e8a0b8', '#c0a0d0', '#f0b890', '#6aa060'],
    leaves: ['#5e9a4c', '#9a9a58', '#e898b0', '#3a7a48'],
    rays: '#ffc8a0', rayA: 0.16, grade: ['#e08a70', 0.07],
    ground: { cap: '#7a8656', capHi: '#bcbc94', capDark: '#4a5236', dirt: '#5e463a', dirtDark: '#281a18', stone: '#bba292', outline: '#1e1212', kind: 'grass' },
    water: { top: '#93807a', bottom: '#3a2c30', foam: '#f8e4dc' },
  },
  twilight: {
    sky: ['#7e6cb4', '#a48ccc', '#cab4de', '#e6dcf0'],
    sun: { x: 0.18, y: 0.5, r: 60, core: '#f4ecff', glow: '#c0a8e8' },
    clouds: { top: '#e4daf4', bottom: '#9a88c4', n: 4 },
    farCols: ['#7a6ea6', '#5e5488', '#e2d8f4'], haze: '#d6cae8',
    hills: ['#6e7076', '#545866', '#3a3c50'],
    crowns: ['#c8a0d8', '#a898d8', '#e0b0c8', '#5a8a68'],
    leaves: ['#4e8a5a', '#7a84a0', '#d0a0c8', '#2f6a50'],
    rays: '#e0d0ff', rayA: 0.12, grade: ['#8a74c8', 0.08],
    ground: { cap: '#6e7a70', capHi: '#b0b8b4', capDark: '#3e4646', dirt: '#4c4450', dirtDark: '#1e1a26', stone: '#a8a2b8', outline: '#14101c', kind: 'grass' },
    water: { top: '#7a729a', bottom: '#2a2646', foam: '#ece6fa' },
  },
  // Meeca's night (5-M): moonlight, matched to the night camp painting and the moonlit strips (tools/art/w5puzzle/night.py)
  night: {
    sky: ['#0e1430', '#1a2450', '#2c3a6e', '#41508a'],
    sun: { x: 0.26, y: 0.42, r: 56, core: '#eef2ff', glow: '#7c8cd0' },
    clouds: { top: '#4a5890', bottom: '#1c2448', n: 3 },
    farCols: ['#2a3466', '#1c2450', '#8a98d0'], haze: '#3a4680',
    hills: ['#2a3060', '#1e2450', '#141a3a'],
    crowns: ['#5a5aa0', '#4a6a9a', '#7a6ab0', '#2e4a60'],
    leaves: ['#2e5a5a', '#3e4a7a', '#6a5a9a', '#1e3a40'],
    rays: '#c8d4ff', rayA: 0.05, grade: ['#1a2460', 0.12],
    ground: { cap: '#44546a', capHi: '#8a9ab8', capDark: '#222c3e', dirt: '#2e2c44', dirtDark: '#12101e', stone: '#6e7094', outline: '#08060e', kind: 'grass' },
    water: { top: '#3a4670', bottom: '#10142a', foam: '#c8d0f0' },
  },
};
/** the light of the World 5 stage being played (gold off the stages: the map, a story, another world's stage) */
const w5MoodNow = (): W5Mood => w5Mood(backdropStage() ?? '') ?? 'gold';

interface Mood {
  tint: string;
  amt: number;
  /** extra brightness for the sky/haze */
  lift: number;
}
/** the light a stage can roll: the same world on a golden evening, a cool morning, in thick mist, or vivid midday */
const MOODS: Record<string, Mood> = {
  vivid: { tint: '#ffffff', amt: 0, lift: 0 },
  golden: { tint: '#ffb050', amt: 0.17, lift: 0.02 },
  cool: { tint: '#6aa8ff', amt: 0.13, lift: 0 },
  mist: { tint: '#eef6f0', amt: 0.2, lift: 0.05 },
  rose: { tint: '#ff8ab0', amt: 0.12, lift: 0 },
};
const WORLD_MOODS: Record<number, string[]> = {
  1: ['vivid', 'golden', 'mist', 'cool'],
  2: ['golden', 'vivid', 'rose', 'mist'],
  3: ['vivid', 'cool', 'rose'],
  4: ['mist', 'cool', 'vivid'],
  5: ['vivid', 'golden', 'vivid'],
  6: ['mist', 'golden', 'vivid'],
  7: ['golden', 'vivid', 'mist', 'cool'],
  8: ['vivid', 'cool', 'rose'],
  9: ['vivid', 'golden'],
  10: ['vivid', 'cool', 'mist'],
};

function tintAll(c: string, m: Mood): string {
  return m.amt > 0 ? mixToHex(c, m.tint, m.amt) : c;
}

/** the rolls each World 5 light may take (the gold stays gold; the dusk may blush; the twilight may mist) */
const W5_ROLLS: Record<W5Mood, string[]> = { gold: ['vivid', 'golden', 'vivid'], dusk: ['vivid', 'rose', 'golden'], twilight: ['vivid', 'mist', 'cool'], night: ['vivid'] };

function makeVariant(base: Look, world: number, seed: number, w5?: W5Mood): Look {
  const r = rng(world * 8191 + seed * 31 + 7);
  const moods = (w5 && W5_ROLLS[w5]) || (WORLD_MOODS[world] ?? ['vivid']);
  const m = MOODS[moods[(r() * moods.length) | 0]];
  const T = (c: string) => tintAll(c, m);
  const L = (c: string) => (m.lift ? mixToHex(c, '#ffffff', m.lift) : c);
  const flora = base.flora.slice();
  // rotate the palette so a different flower colour leads each time
  const rot = (r() * flora.length) | 0;
  const rotated = flora.map((_, i) => flora[(i + rot) % flora.length]);
  return {
    ...base,
    sky: base.sky.map((c) => L(T(c))) as Look['sky'],
    hills: base.hills.map(T) as Look['hills'],
    farCols: base.farCols.map(T) as Look['farCols'],
    haze: L(T(base.haze)),
    rays: T(base.rays),
    rayA: base.rayA * (0.8 + r() * 0.5),
    sun: base.sun ? { ...base.sun, x: Math.min(0.9, Math.max(0.1, base.sun.x + (r() - 0.5) * 0.25)), y: Math.min(0.5, Math.max(0.12, base.sun.y + (r() - 0.5) * 0.12)) } : base.sun,
    crowns: base.crowns.map((c) => mixToHex(c, m.tint, m.amt * 0.5)),
    leaves: base.leaves.map((c) => mixToHex(c, m.tint, m.amt * 0.35)),
    flora: rotated,
    grade: [T(base.grade[0]), base.grade[1]],
    clouds: base.clouds ? { ...base.clouds, n: Math.max(2, base.clouds.n + ((r() * 3) | 0) - 1) } : null,
  };
}

const looks = new Map<string, Look>();
onSceneSeedChange(() => looks.clear());

export function lookFor(worldId: number): Look {
  const world = LOOKS[worldId] ? worldId : 1;
  const seed = getSceneSeed();
  // (World 5 follows the stage's light: gold, dusk, twilight)
  const mood = world === 5 ? w5MoodNow() : null;
  const key = mood ? `${world}:${seed}:${mood}` : `${world}:${seed}`;
  let v = looks.get(key);
  if (!v) {
    v = makeVariant(mood ? { ...LOOKS[5], ...W5_MOOD_LOOKS[mood] } : LOOKS[world], world, seed, mood ?? undefined);
    looks.set(key, v);
  }
  return v;
}

// ───────────────────────────── layer cache ─────────────────────────────

const H = 720; // design height every layer is authored at
const TW = 2400; // tile width in design space

/** a baked layer, or a painted strip (paintedBackdrops.ts) */
type Layer = HTMLCanvasElement | HTMLImageElement;
/** a layer's width in design units: a baked tile is TW wide; a painted strip keeps its own proportions at the design height */
const tileW = (cv: Layer) => (cv instanceof HTMLCanvasElement ? TW : (cv.naturalWidth * H) / cv.naturalHeight);
const layerH = (cv: Layer) => (cv instanceof HTMLCanvasElement ? cv.height : cv.naturalHeight);
const layerWpx = (cv: Layer) => (cv instanceof HTMLCanvasElement ? cv.width : cv.naturalWidth);

interface LayerSet {
  world: number;
  seed: number;
  far: Layer;
  /** null when the world is painted (its middle strip stands where the hills and the drawn trees were) */
  hills: Layer | null;
  mid: Layer;
  /** null only for a painted world whose near strip is still to come */
  near: Layer | null;
  /** the painted sky above a painted far strip (seen upright only: drawStrip) */
  sky?: Layer | null;
  front: HTMLCanvasElement;
  /** the world's painted strips are in use */
  painted?: boolean;
  /** when the painted strips decoded: they fade in from the stand-in sky over FADE_IN_MS when that was just now */
  at?: number;
  /** a painted world whose strips are still decoding: a plain sky stands in (the drawn layers are never built for it, they would only be thrown away) */
  waiting?: boolean;
  clouds: HTMLCanvasElement[];
  /** the three haze veils are already painted into far, hills and mid (gameplay sets only), so they are not drawn again every frame */
  hazed: boolean;
}
/**
 * Baked layer sets, keyed by world, seed and bake scale. Gameplay always bakes at full resolution and keeps one set;
 * menus, cutscenes and the map bake at a fraction of it (a world vista in ~1/10 of the time and memory) and may
 * keep several, so flipping between worlds is instant.
 */
const sets = new Map<string, LayerSet>();
let bakeScale = 1;
/** a bake this small is a map thumbnail (VistaCanvas bakes them at 0.2) */
const THUMB_BAKE = 0.25;
onSceneSeedChange(() => sets.clear());
// when a world's painted strips finish loading, its drawn stand-in is dropped and the next frame builds the painted set; when they are
// dropped to save memory (paintedBackdrops.ts keeps only a couple of worlds), the sets holding them go too, so the pictures can be freed
onPaintedReady((world) => {
  const strips = peekPainted(world);
  for (const [k, v] of [...sets.entries()]) if (v.world === world && (!v.painted || v.waiting || v.far !== strips?.far)) sets.delete(k);
});

/** a sky-coloured stand-in for a painted world whose strips are still decoding: a few pixels wide, drawn stretched across the tile */
const skies = new WeakMap<Look, HTMLCanvasElement>();
function waitingSky(look: Look): HTMLCanvasElement {
  const hit = skies.get(look);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = 4;
  cv.height = H;
  const c = cv.getContext('2d')!;
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, look.sky[0]);
  g.addColorStop(1, look.sky[look.sky.length - 1]);
  c.fillStyle = g;
  c.fillRect(0, 0, 4, H);
  skies.set(look, cv);
  return cv;
}

/** how far a painted set (or canopy) that decoded at `at` has faded in: 0 just in, 1 after FADE_IN_MS (VI-3: no pop-in) */
const fadeIn = (at: number | undefined): number => {
  if (at === undefined) return 1;
  const t = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - at;
  return t >= FADE_IN_MS ? 1 : Math.max(0, t / FADE_IN_MS);
};
const clearStrip = (() => {
  let cv: HTMLCanvasElement | null = null;
  return () => {
    if (!cv) {
      cv = document.createElement('canvas');
      cv.width = 1;
      cv.height = 1;
    }
    return cv;
  };
})();

/** run fn with every layer baked (and drawn) at `scale` of full resolution */
export function withBakeScale<T>(scale: number, fn: () => T): T {
  const prev = bakeScale;
  bakeScale = scale;
  try {
    return fn();
  } finally {
    bakeScale = prev;
  }
}

function makeLayer(res: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const r = res * bakeScale;
  const cv = document.createElement('canvas');
  cv.width = Math.round(TW * r);
  cv.height = Math.round(H * r);
  const c = cv.getContext('2d')!;
  c.scale(r, r);
  return [cv, c];
}

/** Run fn at x and at the wrapped copies so tiles join seamlessly. */
function wrap(x: number, radius: number, fn: (x: number) => void) {
  fn(x);
  if (x < radius) fn(x + TW);
  if (x > TW - radius) fn(x - TW);
}

function ridge(ctx: CanvasRenderingContext2D, baseY: number, amp: number, step: number, seed: number, fill: CanvasGradient | string, rim?: string) {
  const r = rng(seed);
  const pts: Array<[number, number]> = [];
  for (let x = 0; x <= TW + step; x += step) {
    const k = x / step;
    const wob = Math.sin(k * 0.9 + seed) * 0.5 + Math.sin(k * 2.3 + seed * 2) * 0.3 + r() * 0.35;
    pts.push([x, baseY - amp * (0.45 + wob * 0.55)]);
  }
  // make it seamless
  pts[pts.length - 1][1] = pts[0][1];
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    ctx.quadraticCurveTo(px + step * 0.5, py - (py - y) * 0.15 - 8, x, y);
  }
  ctx.lineTo(TW, H);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (rim) {
    ctx.strokeStyle = rim;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = pts[i - 1];
      const [x, y] = pts[i];
      ctx.quadraticCurveTo(px + step * 0.5, py - (py - y) * 0.15 - 8, x, y);
    }
    ctx.stroke();
  }
}

function hazeBand(ctx: CanvasRenderingContext2D, y0: number, y1: number, col: string, a: number) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, rgba(col, 0));
  g.addColorStop(1, rgba(col, a));
  ctx.fillStyle = g;
  ctx.fillRect(0, y0, TW, y1 - y0);
}

// ───────────────────────────── far layer ─────────────────────────────

function peak(ctx: CanvasRenderingContext2D, x: number, base: number, w: number, h: number, col: Tone, snow = false) {
  const g = ctx.createLinearGradient(x - w / 2, base - h, x + w / 2, base);
  g.addColorStop(0, col.light);
  g.addColorStop(0.5, col.mid);
  g.addColorStop(1, col.dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, base);
  ctx.quadraticCurveTo(x - w * 0.28, base - h * 0.35, x - w * 0.06, base - h * 0.92);
  ctx.quadraticCurveTo(x, base - h * 1.04, x + w * 0.07, base - h * 0.9);
  ctx.quadraticCurveTo(x + w * 0.3, base - h * 0.36, x + w / 2, base);
  ctx.closePath();
  ctx.fill();
  // shaded right face
  ctx.fillStyle = rgba(col.deep, 0.35);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.02, base - h * 0.98);
  ctx.quadraticCurveTo(x + w * 0.3, base - h * 0.36, x + w / 2, base);
  ctx.lineTo(x + w * 0.1, base);
  ctx.quadraticCurveTo(x + w * 0.12, base - h * 0.4, x + w * 0.02, base - h * 0.98);
  ctx.fill();
  if (snow) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.moveTo(x - w * 0.1, base - h * 0.78);
    ctx.quadraticCurveTo(x, base - h * 1.03, x + w * 0.1, base - h * 0.78);
    ctx.lineTo(x + w * 0.04, base - h * 0.72);
    ctx.lineTo(x - w * 0.02, base - h * 0.8);
    ctx.lineTo(x - w * 0.07, base - h * 0.7);
    ctx.closePath();
    ctx.fill();
  }
}

function waterfall(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number, w: number, foam: string) {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.6, 'rgba(200,240,255,0.85)');
  g.addColorStop(1, 'rgba(160,220,250,0.7)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, top);
  ctx.lineTo(x + w / 2, top);
  ctx.lineTo(x + w * 0.62, bottom);
  ctx.lineTo(x - w * 0.62, bottom);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * w * 0.16, top + 10);
    ctx.lineTo(x + i * w * 0.2, bottom - 10);
    ctx.stroke();
  }
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = rgba(foam, 0.55);
    ctx.beginPath();
    ctx.arc(x + (i - 3) * w * 0.22, bottom + 2, w * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function buildFar(look: Look, world: number): HTMLCanvasElement {
  const [cv, ctx] = makeLayer(1);
  const r = rng(world * 101 + 7 + getSceneSeed() * 1013);
  const back = tone(look.farCols[0]);
  const front = tone(look.farCols[1]);

  const ranges = (base: number, count: number, minH: number, maxH: number, col: Tone, snow: boolean) => {
    for (let i = 0; i < count; i++) {
      const x = (i / count) * TW + r() * 80;
      const w = 360 + r() * 300;
      const h = minH + r() * (maxH - minH);
      wrap(x, w, (xx) => peak(ctx, xx, base, w, h, col, snow));
    }
  };

  switch (look.far) {
    case 'peaks':
    case 'palms':
    case 'orchid': {
      ranges(500, 9, 170, 290, back, false);
      hazeBand(ctx, 280, 520, look.haze, 0.55);
      ranges(560, 8, 110, 200, front, false);
      if (look.far === 'palms') {
        // silhouetted palms along the horizon
        for (let i = 0; i < 18; i++) {
          const x = r() * TW;
          const hh = 90 + r() * 80;
          wrap(x, 90, (xx) => {
            ctx.strokeStyle = rgba(darken(look.farCols[1], 0.2), 0.9);
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(xx, 585);
            ctx.quadraticCurveTo(xx + 14, 585 - hh * 0.5, xx + 6, 585 - hh);
            ctx.stroke();
            const t = tone(darken(look.farCols[1], 0.25));
            for (let f = 0; f < 6; f++) drawFrond(ctx, xx + 6, 585 - hh, 46 + r() * 16, -Math.PI / 2 + (f - 2.5) * 0.62, 12, t, 7, 0.3);
          });
        }
      }
      if (look.far === 'orchid') {
        // giant distant orchids
        for (let i = 0; i < 6; i++) {
          const x = (i / 6) * TW + r() * 160;
          wrap(x, 140, (xx) => {
            const y = 540 - r() * 40;
            ctx.strokeStyle = rgba('#7a3a90', 0.8);
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(xx, 600);
            ctx.quadraticCurveTo(xx - 20, y - 60, xx, y - 150);
            ctx.stroke();
            ctx.globalAlpha = 0.85;
            drawFlower(ctx, xx, y - 160, 70 + r() * 30, '#ff7ad8', '#ffe66a', r() * 3, 5);
            ctx.globalAlpha = 1;
          });
        }
      }
      break;
    }
    case 'cliffs': {
      ranges(520, 7, 200, 320, back, false);
      // tall cliff towers with waterfalls and a rainbow
      for (let i = 0; i < 4; i++) {
        const x = (i / 4) * TW + 200 + r() * 120;
        const w = 300 + r() * 120;
        const top = 150 + r() * 80;
        wrap(x, w, (xx) => {
          const g = ctx.createLinearGradient(xx - w / 2, top, xx + w / 2, 620);
          g.addColorStop(0, front.light);
          g.addColorStop(1, front.dark);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(xx - w / 2, 640);
          ctx.lineTo(xx - w * 0.46, top + 30);
          ctx.quadraticCurveTo(xx - w * 0.4, top - 8, xx - w * 0.22, top);
          ctx.lineTo(xx + w * 0.3, top - 4);
          ctx.quadraticCurveTo(xx + w * 0.47, top + 6, xx + w * 0.46, top + 40);
          ctx.lineTo(xx + w / 2, 640);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = 'rgba(30,60,60,0.25)';
          ctx.fillRect(xx + w * 0.18, top, w * 0.32, 640 - top);
          // moss crown
          const tc = tone('#3fb070');
          drawCrown(ctx, xx - w * 0.05, top + 6, w * 0.46, 44, tc, r, 9, false);
          waterfall(ctx, xx - w * 0.1, top + 20, 640, 46 + r() * 22, look.water.foam);
        });
      }
      // rainbow
      const rb = ['#ff5a5a', '#ffa84a', '#ffe85a', '#6adf6a', '#5ab8ff', '#8a6aff'];
      rb.forEach((c, i) => {
        ctx.strokeStyle = rgba(c, 0.22);
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(1500, 640, 520 - i * 11, Math.PI * 1.08, Math.PI * 1.92);
        ctx.stroke();
      });
      hazeBand(ctx, 330, 600, look.haze, 0.6);
      break;
    }
    case 'karst': {
      // limestone tower karst: sheer grey spires with a forest cap and a cave mouth at the foot, no waterfalls
      ranges(530, 7, 190, 300, back, false);
      for (let i = 0; i < 6; i++) {
        const x = (i / 6) * TW + 120 + r() * 120;
        const w = 150 + r() * 90;
        const top = 120 + r() * 120;
        wrap(x, w, (xx) => {
          const g = ctx.createLinearGradient(xx - w / 2, top, xx + w / 2, 620);
          g.addColorStop(0, front.light);
          g.addColorStop(1, front.dark);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(xx - w * 0.52, 640);
          ctx.lineTo(xx - w * 0.44, top + 50);
          ctx.quadraticCurveTo(xx - w * 0.38, top - 6, xx - w * 0.1, top);
          ctx.lineTo(xx + w * 0.2, top - 4);
          ctx.quadraticCurveTo(xx + w * 0.44, top + 6, xx + w * 0.42, top + 56);
          ctx.lineTo(xx + w * 0.52, 640);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = 'rgba(20,30,50,0.22)';
          ctx.fillRect(xx + w * 0.12, top, w * 0.3, 640 - top);
          ctx.strokeStyle = 'rgba(20,30,50,0.2)';
          ctx.lineWidth = 3;
          for (let k = 0; k < 5; k++) {
            const gx = xx - w * 0.36 + k * w * 0.18;
            ctx.beginPath();
            ctx.moveTo(gx, top + 30);
            ctx.lineTo(gx + (r() - 0.5) * 6, 620);
            ctx.stroke();
          }
          ctx.fillStyle = '#06060e';
          ctx.beginPath();
          ctx.moveTo(xx - w * 0.2, 640);
          ctx.quadraticCurveTo(xx - w * 0.2, 560, xx, 556);
          ctx.quadraticCurveTo(xx + w * 0.2, 560, xx + w * 0.2, 640);
          ctx.fill();
          drawCrown(ctx, xx - w * 0.04, top + 6, w * 0.5, 38, tone('#2f7a6a'), r, 8, false);
        });
      }
      hazeBand(ctx, 330, 600, look.haze, 0.55);
      break;
    }
    case 'ruins': {
      ranges(520, 8, 130, 240, back, false);
      hazeBand(ctx, 300, 540, look.haze, 0.5);
      for (let i = 0; i < 3; i++) {
        const x = 300 + i * 800 + r() * 150;
        wrap(x, 260, (xx) => {
          const tiers = 6;
          const bw = 300 + r() * 70;
          const bh = 38;
          for (let t = 0; t < tiers; t++) {
            const w = bw * (1 - t * 0.14);
            const y = 600 - t * bh;
            const g = ctx.createLinearGradient(xx - w / 2, y - bh, xx + w / 2, y);
            g.addColorStop(0, front.light);
            g.addColorStop(1, front.dark);
            ctx.fillStyle = g;
            ctx.fillRect(xx - w / 2, y - bh, w, bh);
            ctx.fillStyle = rgba(front.deep, 0.35);
            ctx.fillRect(xx - w / 2, y - 6, w, 6);
          }
          // stair + temple
          ctx.fillStyle = rgba(front.deep, 0.35);
          ctx.fillRect(xx - 16, 600 - tiers * bh, 32, tiers * bh);
          const ty = 600 - tiers * bh;
          ctx.fillStyle = front.mid;
          ctx.fillRect(xx - 44, ty - 46, 88, 46);
          ctx.fillStyle = front.light;
          ctx.fillRect(xx - 52, ty - 56, 104, 12);
          ctx.fillStyle = rgba('#ffd870', 0.9);
          ctx.fillRect(xx - 12, ty - 36, 24, 36);
          const tc = tone('#4f9a3a');
          drawCrown(ctx, xx - 60, 600 - 3 * bh, 60, 36, tc, r, 6, false);
        });
      }
      ranges(580, 7, 70, 130, front, false);
      break;
    }
    case 'volcano': {
      ranges(560, 8, 120, 230, back, false);
      const vx = 1260;
      wrap(vx, 500, (xx) => {
        const g = ctx.createLinearGradient(xx, 200, xx, 640);
        g.addColorStop(0, '#5a1a22');
        g.addColorStop(1, '#2a0c12');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(xx - 440, 640);
        ctx.quadraticCurveTo(xx - 160, 420, xx - 86, 250);
        ctx.lineTo(xx + 86, 250);
        ctx.quadraticCurveTo(xx + 170, 420, xx + 440, 640);
        ctx.closePath();
        ctx.fill();
        // lava glow + rivers
        const lg = ctx.createRadialGradient(xx, 250, 6, xx, 250, 150);
        lg.addColorStop(0, 'rgba(255,230,120,1)');
        lg.addColorStop(0.4, 'rgba(255,130,30,0.8)');
        lg.addColorStop(1, 'rgba(255,60,10,0)');
        ctx.fillStyle = lg;
        ctx.fillRect(xx - 160, 100, 320, 300);
        ctx.strokeStyle = '#ff9a2a';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(xx + s * 40, 256);
          ctx.quadraticCurveTo(xx + s * 90, 340, xx + s * 70 + s * r() * 40, 440);
          ctx.quadraticCurveTo(xx + s * 140, 520, xx + s * 200, 600);
          ctx.stroke();
        }
        // smoke plume
        for (let i = 0; i < 9; i++) {
          ctx.fillStyle = rgba(i < 3 ? '#8a3a2a' : '#3a1a1a', 0.5 - i * 0.03);
          ctx.beginPath();
          ctx.arc(xx + Math.sin(i * 1.3) * 40 + i * 14, 230 - i * 22, 40 + i * 9, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ranges(600, 7, 60, 120, front, false);
      hazeBand(ctx, 380, 640, look.haze, 0.35);
      break;
    }
    case 'fortress': {
      ranges(540, 8, 170, 280, back, false);
      for (let i = 0; i < 2; i++) {
        const x = 500 + i * 1300;
        wrap(x, 320, (xx) => {
          // crag
          ctx.fillStyle = front.mid;
          ctx.beginPath();
          ctx.moveTo(xx - 320, 640);
          ctx.lineTo(xx - 220, 420);
          ctx.lineTo(xx - 120, 380);
          ctx.lineTo(xx + 140, 370);
          ctx.lineTo(xx + 250, 440);
          ctx.lineTo(xx + 330, 640);
          ctx.fill();
          // keep
          ctx.fillStyle = front.deep;
          ctx.fillRect(xx - 120, 270, 240, 112);
          for (const [dx, h] of [[-150, 150], [-60, 190], [40, 210], [130, 160]]) {
            ctx.fillRect(xx + dx - 26, 380 - h, 52, h);
            ctx.beginPath();
            ctx.moveTo(xx + dx - 34, 380 - h);
            ctx.lineTo(xx + dx, 380 - h - 56);
            ctx.lineTo(xx + dx + 34, 380 - h);
            ctx.fill();
          }
          ctx.fillStyle = '#ffd86a';
          for (let w = 0; w < 9; w++) {
            ctx.globalAlpha = 0.5 + r() * 0.5;
            ctx.fillRect(xx - 130 + w * 30, 300 + (w % 3) * 24, 8, 14);
          }
          ctx.globalAlpha = 1;
        });
      }
      ranges(600, 7, 80, 150, front, false);
      hazeBand(ctx, 360, 640, look.haze, 0.4);
      break;
    }
    case 'shrooms': {
      ranges(560, 8, 120, 240, back, false);
      hazeBand(ctx, 300, 560, look.haze, 0.5);
      if (world === 3) {
        // a real cave glows with glowworm silk, not giant mushrooms: threads hung from the roof, each strung with cold light
        for (let i = 0; i < 44; i++) {
          const x = r() * TW;
          const len = 70 + r() * 230;
          wrap(x, 20, (xx) => {
            ctx.strokeStyle = 'rgba(190,240,230,0.35)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(xx, 0);
            ctx.lineTo(xx + (r() - 0.5) * 4, len);
            ctx.stroke();
            for (let y = 14; y < len; y += 11 + r() * 9) {
              const gg = ctx.createRadialGradient(xx, y, 0, xx, y, 7);
              gg.addColorStop(0, rgba(look.glow ?? '#7dffe0', 0.6));
              gg.addColorStop(1, rgba(look.glow ?? '#7dffe0', 0));
              ctx.fillStyle = gg;
              ctx.fillRect(xx - 7, y - 7, 14, 14);
            }
          });
        }
      } else {
        for (let i = 0; i < 9; i++) {
          const x = (i / 9) * TW + r() * 100;
          const s = 70 + r() * 90;
          wrap(x, s * 2, (xx) => {
            const cols = ['#3ad8c0', '#b05ad8', '#58b8ff'];
            drawMushroom(ctx, xx, 600, s * 1.3, cols[i % 3], '#ffffff', true);
          });
        }
      }
      // hanging stalactites
      for (let i = 0; i < 14; i++) {
        const x = r() * TW;
        const hh = 70 + r() * 120;
        wrap(x, 40, (xx) => {
          ctx.fillStyle = rgba(front.deep, 0.8);
          ctx.beginPath();
          ctx.moveTo(xx - 22, 0);
          ctx.lineTo(xx + 22, 0);
          ctx.lineTo(xx + 3, hh);
          ctx.fill();
        });
      }
      break;
    }
    case 'mangrove': {
      ranges(540, 8, 90, 170, back, false);
      hazeBand(ctx, 300, 560, look.haze, 0.6);
      for (let i = 0; i < 26; i++) {
        const x = r() * TW;
        wrap(x, 120, (xx) => {
          const h = 130 + r() * 150;
          ctx.strokeStyle = rgba(front.deep, 0.85);
          ctx.lineWidth = 6 + r() * 5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(xx, 600);
          ctx.quadraticCurveTo(xx + (r() - 0.5) * 40, 600 - h * 0.5, xx + (r() - 0.5) * 30, 600 - h);
          ctx.stroke();
          // arching prop roots
          ctx.lineWidth = 3;
          for (const s of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(xx + s * 4, 600 - h * 0.45);
            ctx.quadraticCurveTo(xx + s * 40, 600 - h * 0.3, xx + s * 50, 604);
            ctx.stroke();
          }
          drawCrown(ctx, xx, 600 - h - 10, 70, 40, tone(darken(look.farCols[1], 0.1)), r, 8, false);
        });
      }
      break;
    }
    case 'dusk': {
      ranges(540, 9, 160, 270, back, false);
      hazeBand(ctx, 300, 560, look.haze, 0.5);
      ranges(590, 8, 100, 180, front, false);
      // tiny lantern lights on the hills
      for (let i = 0; i < 40; i++) {
        const x = r() * TW;
        const y = 440 + r() * 160;
        const gl = ctx.createRadialGradient(x, y, 0, x, y, 12);
        gl.addColorStop(0, 'rgba(255,230,150,0.95)');
        gl.addColorStop(1, 'rgba(255,200,100,0)');
        ctx.fillStyle = gl;
        ctx.fillRect(x - 12, y - 12, 24, 24);
      }
      break;
    }
  }
  return cv;
}

// ───────────────────────────── hills layer ─────────────────────────────

/**
 * Flowers as a gardener would plant them: a few patches of three to five (one colour to a patch, the lead biggest, no two touching, a
 * long bare stretch left between them). Every third patch is led by one of the world's painted flowers, drawn large and in the haze so
 * it reads as a bloom in the meadow and not as a pickup. When the painted art is not ready the vector bloom stands in.
 */
function meadowPatches(ctx: CanvasRenderingContext2D, look: Look, world: number, r: RNG, y0: number, ySpan: number, patches: number, painted: number, stems = false) {
  const spots = composeClusters(r, { width: TW, wrap: true, clusters: patches, members: [3, 4], gap: 340, spread: [64, 14], minDist: 24, size: [9, 17], y: [y0, y0 + ySpan], calm: 640 });
  const species = sceneryFlowers(world);
  const dark = tone(look.leaves[0]).dark;
  for (const s of spots) {
    const col = look.flora[((s.tint * 977) | 0) % look.flora.length];
    wrap(s.x, 80, (xx) => {
      if (s.k === 0 && s.tint < painted) {
        const num = species[((s.tint / painted) * species.length) | 0];
        if (paintShrub(ctx, 'flower', num, xx, s.y + 30, 54 + s.size * 1.6, look.haze, 0.2, r() > 0.5)) return;
      }
      if (stems) {
        ctx.strokeStyle = dark;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(xx, s.y + 30);
        ctx.quadraticCurveTo(xx + (r() - 0.5) * 16, s.y + 12, xx, s.y);
        ctx.stroke();
        drawFlower(ctx, xx, s.y, s.size * 1.3, col, '#fff0a0', r() * 3, 5 + (s.k % 2));
      } else drawFlower(ctx, xx, s.y, s.size * 0.7, col, '#fff0a0', r() * 3);
    });
  }
}

function buildHills(look: Look, world: number): HTMLCanvasElement {
  const [cv, ctx] = makeLayer(1);
  const r = rng(world * 211 + 3 + getSceneSeed() * 1013);
  const rows: Array<[number, number, string, number]> = [
    [430, 130, look.hills[0], 0.35],
    [500, 120, look.hills[1], 0.18],
    [580, 110, look.hills[2], 0.0],
  ];
  rows.forEach(([base, size, col, hazeMix], ri) => {
    const c = mix(col, look.haze, hazeMix);
    const t = tone(c);
    // solid fill under the row so there are no gaps
    ctx.fillStyle = t.dark;
    ctx.fillRect(0, base + 30, TW, H);
    const step = size * 0.62;
    for (let x = -step; x < TW + step; x += step) {
      const k = Math.round(x / step);
      const bump = Math.sin(k * 0.8 + ri * 2) * 28 + Math.sin(k * 2.1) * 12;
      wrap(x, size * 1.5, (xx) => {
        drawCrown(ctx, xx, base + bump, size * (0.95 + r() * 0.3), size * (0.62 + r() * 0.2), t, r, 9, true);
      });
    }
    // flowers on the nearest row, in a few patches (one colour to a patch, the biggest in the middle) with grass between, not sprinkled
    if (ri === 2) meadowPatches(ctx, look, world, r, base - 10, 70, 4, 0.34);
    hazeBand(ctx, base - 120, base + 90, look.haze, 0.22 - ri * 0.06);
  });
  return cv;
}

// ───────────────────────────── mid layer (trees) ─────────────────────────────

function trunkShape(
  ctx: CanvasRenderingContext2D, x: number, baseY: number, topY: number, wBase: number, wTop: number, lean: number, col: [string, string]
) {
  const tt = tone(col[0]);
  const g = ctx.createLinearGradient(x - wBase, 0, x + wBase, 0);
  g.addColorStop(0, tt.light);
  g.addColorStop(0.45, col[0]);
  g.addColorStop(1, col[1]);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - wBase * 1.7, baseY);
  ctx.quadraticCurveTo(x - wBase * 0.6, baseY - 70, x - wBase * 0.5 + lean * 0.4, (baseY + topY) / 2);
  ctx.quadraticCurveTo(x - wTop * 0.5 + lean, topY + 80, x - wTop * 0.5 + lean, topY);
  ctx.lineTo(x + wTop * 0.5 + lean, topY);
  ctx.quadraticCurveTo(x + wTop * 0.5 + lean, topY + 80, x + wBase * 0.5 + lean * 0.4, (baseY + topY) / 2);
  ctx.quadraticCurveTo(x + wBase * 0.6, baseY - 70, x + wBase * 1.7, baseY);
  ctx.closePath();
  ctx.fill();
  // rim light + bark strokes
  ctx.strokeStyle = rgba(tt.hi, 0.35);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - wBase * 0.42, baseY - 60);
  ctx.quadraticCurveTo(x - wBase * 0.4 + lean * 0.4, (baseY + topY) / 2, x - wTop * 0.38 + lean, topY + 10);
  ctx.stroke();
  ctx.strokeStyle = rgba(darken(col[1], 0.3), 0.35);
  ctx.lineWidth = 2;
  for (let i = 1; i < 4; i++) {
    const o = (i - 2) * wBase * 0.22;
    ctx.beginPath();
    ctx.moveTo(x + o, baseY - 40);
    ctx.quadraticCurveTo(x + o + lean * 0.4, (baseY + topY) / 2, x + o * 0.6 + lean, topY + 20);
    ctx.stroke();
  }
}

function midTree(ctx: CanvasRenderingContext2D, look: Look, kind: TreeKind, x: number, r: RNG, glowOn: boolean) {
  const baseY = 700;
  const cols = look.crowns;
  const crownT = (i: number) => tone(cols[i % cols.length]);
  switch (kind) {
    case 'jungle': {
      const topY = 160 + r() * 140;
      const w = 52 + r() * 30;
      const lean = (r() - 0.5) * 60;
      trunkShape(ctx, x, baseY, topY, w, w * 0.55, lean, look.trunk);
      // limbs
      ctx.strokeStyle = look.trunk[0];
      ctx.lineCap = 'round';
      for (const s of [-1, 1]) {
        ctx.lineWidth = w * 0.3;
        ctx.beginPath();
        ctx.moveTo(x + lean * 0.8, topY + 90);
        ctx.quadraticCurveTo(x + lean + s * 90, topY + 60, x + lean + s * 170, topY - 10 + r() * 30);
        ctx.stroke();
        drawCrown(ctx, x + lean + s * 170, topY - 10, 130 + r() * 30, 86, crownT(r() * 4 | 0), r, 10);
      }
      drawCrown(ctx, x + lean, topY - 30, 190 + r() * 40, 120, crownT(r() * 4 | 0), r, 12);
      for (let i = 0; i < 5; i++) drawLiana(ctx, x + lean + (r() - 0.5) * 300, topY + 30 + r() * 40, 120 + r() * 180, tone(look.vine.main), r, r() > 0.6 ? look.flora[0] : undefined);
      break;
    }
    case 'palm': {
      const topY = 200 + r() * 120;
      const lean = (r() - 0.5) * 120;
      ctx.strokeStyle = look.trunk[0];
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.quadraticCurveTo(x + lean * 0.2, (baseY + topY) / 2, x + lean, topY);
      ctx.stroke();
      ctx.strokeStyle = rgba(look.trunk[1], 0.45);
      ctx.lineWidth = 3;
      for (let y = topY + 20; y < baseY; y += 26) {
        const u = (y - topY) / (baseY - topY);
        const px = x + lean * (1 - u) * (1 - u) + 0;
        ctx.beginPath();
        ctx.moveTo(px - 12, y);
        ctx.lineTo(px + 12, y + 3);
        ctx.stroke();
      }
      const t = crownT(r() * 4 | 0);
      for (let f = 0; f < 9; f++) drawFrond(ctx, x + lean, topY, 120 + r() * 30, -Math.PI / 2 + (f - 4) * 0.5, 26 + Math.abs(f - 4) * 8, t, 13, 0.4);
      ctx.fillStyle = look.trunk[1];
      for (let c = 0; c < 3; c++) {
        ctx.beginPath();
        ctx.arc(x + lean - 10 + c * 10, topY + 16, 9, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'umbrella': {
      const topY = 250 + r() * 100;
      const w = 34 + r() * 14;
      const lean = (r() - 0.5) * 70;
      trunkShape(ctx, x, baseY, topY, w, w * 0.6, lean, look.trunk);
      for (let layer = 0; layer < 3; layer++) {
        const t = crownT(layer + (r() * 3 | 0));
        const lw = 230 - layer * 40;
        const ly = topY - layer * 30;
        drawCrown(ctx, x + lean, ly - 8, lw, 58, t, r, 13);
      }
      break;
    }
    case 'willow': {
      const topY = 220 + r() * 100;
      const w = 48 + r() * 20;
      trunkShape(ctx, x, baseY, topY, w, w * 0.6, (r() - 0.5) * 40, look.trunk);
      const t = crownT(r() * 4 | 0);
      drawCrown(ctx, x, topY - 20, 190, 110, t, r, 11);
      for (let i = 0; i < 16; i++) {
        const sx = x - 170 + (i / 15) * 340;
        drawLiana(ctx, sx, topY + 10 + Math.sin(i) * 20, 150 + r() * 160, t, r);
      }
      // prop roots
      ctx.strokeStyle = look.trunk[1];
      ctx.lineWidth = 7;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(x + s * w * 0.4, baseY - 140);
        ctx.quadraticCurveTo(x + s * w * 1.8, baseY - 90, x + s * w * 2.2, baseY + 10);
        ctx.stroke();
      }
      break;
    }
    case 'shroom': {
      const topY = 260 + r() * 140;
      const capW = 130 + r() * 80;
      const sw = 24 + r() * 12;
      const sg = ctx.createLinearGradient(x - sw, 0, x + sw, 0);
      sg.addColorStop(0, '#fff2d4');
      sg.addColorStop(1, '#b49a78');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(x - sw * 1.4, baseY);
      ctx.quadraticCurveTo(x - sw * 0.5, (baseY + topY) / 2, x - sw * 0.6, topY);
      ctx.lineTo(x + sw * 0.6, topY);
      ctx.quadraticCurveTo(x + sw * 0.5, (baseY + topY) / 2, x + sw * 1.4, baseY);
      ctx.fill();
      const cc = cols[(r() * 3) | 0];
      const ct = tone(cc, '#2a0a40');
      if (glowOn && look.glow) {
        const gg = ctx.createRadialGradient(x, topY - 30, 10, x, topY - 30, capW * 1.5);
        gg.addColorStop(0, rgba(look.glow, 0.45));
        gg.addColorStop(1, rgba(look.glow, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(x - capW * 1.6, topY - capW * 1.6, capW * 3.2, capW * 3.2);
      }
      const cg = ctx.createRadialGradient(x - capW * 0.3, topY - capW * 0.5, 10, x, topY - 20, capW * 1.1);
      cg.addColorStop(0, ct.hi);
      cg.addColorStop(0.4, ct.light);
      cg.addColorStop(1, ct.dark);
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.ellipse(x, topY, capW, capW * 0.55, 0, Math.PI, 0);
      ctx.quadraticCurveTo(x, topY + capW * 0.2, x - capW, topY);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (let s = 0; s < 6; s++) {
        ctx.beginPath();
        ctx.ellipse(x + (r() - 0.5) * capW * 1.5, topY - capW * (0.12 + r() * 0.36), 8 + r() * 8, 6 + r() * 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'dead': {
      const topY = 200 + r() * 140;
      const w = 30 + r() * 16;
      trunkShape(ctx, x, baseY, topY, w, w * 0.4, (r() - 0.5) * 50, look.trunk);
      ctx.strokeStyle = look.trunk[1];
      ctx.lineCap = 'round';
      const branch = (bx: number, by: number, ang: number, len: number, wd: number, depth: number) => {
        const ex = bx + Math.cos(ang) * len;
        const ey = by + Math.sin(ang) * len;
        ctx.lineWidth = wd;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo((bx + ex) / 2 + (r() - 0.5) * 16, (by + ey) / 2, ex, ey);
        ctx.stroke();
        if (depth > 0) {
          branch(ex, ey, ang - 0.5 - r() * 0.3, len * 0.7, wd * 0.65, depth - 1);
          branch(ex, ey, ang + 0.5 + r() * 0.3, len * 0.7, wd * 0.65, depth - 1);
        } else {
          drawCrown(ctx, ex, ey, 40, 26, crownT(r() * 4 | 0), r, 5, false);
        }
      };
      branch(x, topY + 6, -Math.PI / 2 - 0.2, 110, w * 0.4, 3);
      branch(x, topY + 70, -Math.PI / 2 + 0.9, 90, w * 0.3, 2);
      branch(x, topY + 110, -Math.PI / 2 - 1.0, 90, w * 0.3, 2);
      break;
    }
  }
}

/** worlds that use the new hand-built rainforest (grown world by world) */
const RICH_MID = (_look: Look, world: number) => isRich(world);

/** the rich backdrop: every world's own cast of trees in three rows, its forest floor and what hangs overhead */
function buildMidRich(look: Look, world: number): HTMLCanvasElement {
  const res = 1.2;
  const [cv, ctx] = makeLayer(res);
  const r = rng(world * 307 + 11 + getSceneSeed() * 1013);
  paintBiomeMid(ctx, world, look, r, TW, res * bakeScale, (y0, y1, col, a) => hazeBand(ctx, y0, y1, col, a));
  drawRays(ctx, TW, H, look.rays, look.rayA, r, 12, 0.3);
  hazeBand(ctx, 430, 720, look.haze, 0.3);
  return cv;
}

function jitter(r: RNG, a: number) {
  return (r() - 0.5) * 2 * a;
}

function buildMid(look: Look, world: number): HTMLCanvasElement {
  if (RICH_MID(look, world)) return buildMidRich(look, world);
  const [cv, ctx] = makeLayer(1.2);
  const r = rng(world * 307 + 11 + getSceneSeed() * 1013);
  const n = 7;
  for (let i = 0; i < n; i++) {
    const x = (i / n) * TW + 40 + r() * 140;
    const kind = look.trees[i % look.trees.length];
    wrap(x, 340, (xx) => midTree(ctx, look, kind, xx, r, true));
  }
  // dense leafy canopy hanging from the top edge
  for (let x = 0; x < TW; x += 300) {
    if (r() < 0.3) continue;
    wrap(x, 220, (xx) => drawCrown(ctx, xx + r() * 90, -80 + r() * 40, 150 + r() * 60, 80, tone(look.crowns[(x / 300) % look.crowns.length | 0]), r, 9));
  }
  // light shafts pour through the canopy
  drawRays(ctx, TW, H, look.rays, look.rayA, r, 12, 0.3);
  // ground-level mist so layers separate
  hazeBand(ctx, 430, 720, look.haze, 0.38);
  return cv;
}

// ───────────────────────────── near layer (undergrowth) ─────────────────────────────

function buildNear(look: Look, world: number): HTMLCanvasElement {
  const [cv, ctx] = makeLayer(1.35);
  const r = rng(world * 419 + 5 + getSceneSeed() * 1013);
  const L = look.leaves.map((c) => tone(c));
  // a world with its own plant kit (see envKit.ts) grows what belongs there instead of the shared jungle undergrowth
  if (hasKit(world)) {
    for (let x = 0; x < TW; x += 110) {
      wrap(x, 170, (xx) => {
        paintNearPlant(ctx, world, look, xx + (r() - 0.5) * 60, 694 + r() * 26, 56 + r() * 40, r);
      });
    }
    for (let i = 0; i < 10; i++) {
      const x = r() * TW;
      wrap(x, 70, (xx) => drawRock(ctx, xx, 712, 56 + r() * 44, 24 + r() * 16, tone(look.ground.stone)));
    }
    for (let x = 0; x < TW; x += 300) {
      if (r() < 0.3) continue;
      wrap(x, 100, (xx) => drawLiana(ctx, xx + r() * 80, 4, 100 + r() * 120, tone(look.vine.main), r, undefined));
    }
    return cv;
  }
  // low undergrowth: ferns, grass, monstera and the odd banana leaf — kept short so play stays readable
  for (let x = 0; x < TW; x += 72) {
    wrap(x, 130, (xx) => {
      const y = 690 + r() * 30;
      const pick = r();
      const t = L[(r() * L.length) | 0];
      if (pick < 0.16) drawBananaLeaf(ctx, xx, y, 90 + r() * 70, 36 + r() * 16, (r() - 0.5) * 1.6, t);
      else if (pick < 0.42) for (let f = 0; f < 6; f++) drawFrond(ctx, xx, y, 60 + r() * 30, -Math.PI / 2 + (f - 2.5) * 0.46, 10, t, 9, 0.3);
      else if (pick < 0.6) drawMonstera(ctx, xx, y - 16, 56 + r() * 30, (r() - 0.5) * 1.5, t);
      else drawGrass(ctx, xx, y + 8, 48 + r() * 38, t, r, 8);
    });
  }
  meadowPatches(ctx, look, world, r, 646, 56, 5, 0.34, true);
  for (let i = 0; i < 4; i++) {
    const x = r() * TW;
    wrap(x, 60, (xx) => {
      if (world !== 3 && r() > 0.5) drawMushroom(ctx, xx, 706, 22 + r() * 14, look.flora[(i + 1) % look.flora.length], '#fff', false);
      else drawRock(ctx, xx, 710, 54 + r() * 40, 24 + r() * 16, tone(look.ground.stone));
    });
  }
  // hanging leaves + lianas from the top (kept thin)
  for (let x = 0; x < TW; x += 260) {
    if (r() < 0.25) continue;
    wrap(x, 140, (xx) => {
      const t = L[(r() * L.length) | 0];
      const px = xx + r() * 80;
      if (r() > 0.4) drawMonstera(ctx, px, -30 + r() * 30, 90 + r() * 40, Math.PI + (r() - 0.5) * 0.8, t);
      else drawBananaLeaf(ctx, px, -20, 130, 44, Math.PI + (r() - 0.5) * 0.7, t);
      drawLiana(ctx, px + 40, 10, 110 + r() * 120, tone(look.vine.main), r, r() > 0.5 ? look.flora[1 % look.flora.length] : undefined);
    });
  }
  return cv;
}

// ───────────────────────────── front layer (frame) ─────────────────────────────

/** `hangs`: the big leaves hanging into the top corners (off over a painted backdrop: drawn leaves that size clash with the painting) */
function buildFront(look: Look, world: number, hangs = true): HTMLCanvasElement {
  const [cv, ctx] = makeLayer(1.2);
  const r = rng(world * 523 + 9 + getSceneSeed() * 1013);
  const dark = look.leaves.map((c) => tone(mix(c, '#04120c', 0.6)));
  const rim = look.leaves.map((c) => tone(mix(c, '#04120c', 0.38)));
  // low clumps at the bottom edge: just the tips peek in. They sit a little lower than they used to, so they stay in the ground
  // band of the frame and never reach up over the platform lips, the pickups or the hero (this layer is drawn over everything)
  for (let x = 60; x < TW; x += 800) {
    wrap(x, 220, (xx) => {
      if (paintFrontClump(ctx, world, look, xx, 832, r)) return;
      for (let k = 0; k < 3; k++) {
        const t = k % 2 ? rim[(r() * rim.length) | 0] : dark[(r() * dark.length) | 0];
        drawBananaLeaf(ctx, xx + (k - 1) * 46, 826, 160 + r() * 40, 52 + r() * 16, (k - 1) * 0.55 + (r() - 0.5) * 0.2, t);
      }
    });
  }
  // a few big leaves hanging into the top corners
  for (let x = 240; hangs && x < TW; x += 760) {
    wrap(x, 220, (xx) => {
      if (paintFrontHang(ctx, world, look, xx, (xx / 760) | 0, r)) return;
      drawMonstera(ctx, xx, -50, 110 + r() * 30, Math.PI + (r() - 0.5) * 0.5, dark[(r() * dark.length) | 0]);
      drawBananaLeaf(ctx, xx + 80, -40, 110, 36, Math.PI + 0.4, rim[(r() * rim.length) | 0]);
    });
  }
  return cv;
}

// ───────────────────────────── clouds ─────────────────────────────

function buildClouds(look: Look, world: number): HTMLCanvasElement[] {
  if (!look.clouds) return [];
  const r = rng(world * 617 + 1 + getSceneSeed() * 1013);
  const out: HTMLCanvasElement[] = [];
  for (let i = 0; i < look.clouds.n; i++) {
    const cv = document.createElement('canvas');
    cv.width = 520;
    cv.height = 220;
    const c = cv.getContext('2d')!;
    drawCloud(c, 260, 130, 90 + r() * 60, look.clouds.top, look.clouds.bottom, r);
    out.push(cv);
  }
  return out;
}

// ───────────────────────────── receding layers and the calm lane ─────────────────────────────

/**
 * How far each distant layer is pushed back into the air, per world: `far`, `hills` and `mid` are extra haze (a share of the world's own
 * haze colour laid over what is already painted, never over the sky), and `sat` is how much colour the far and hill layers lose.
 * Far layers losing contrast, saturation and sharpness while the middle ground stays clear is what lets the eye rest behind the hero.
 */
interface Recede { far: number; hills: number; mid: number; sat: number }
const RECEDE_DEFAULT: Recede = { far: 0.2, hills: 0.1, mid: 0.04, sat: 0.2 };
const RECEDE: Record<number, Partial<Recede>> = {
  1: { far: 0.22, hills: 0.12, mid: 0.05, sat: 0.22 },
  2: { far: 0.2, hills: 0.12, mid: 0.05, sat: 0.28 },
  3: { far: 0.12, hills: 0.08, mid: 0.02, sat: 0.18 },
  5: { far: 0.24, hills: 0.14, mid: 0.06, sat: 0.28 },
  7: { far: 0.2, hills: 0.12, mid: 0.05, sat: 0.3 },
};

/** take colour out of a baked layer (grey in 'saturation' mode, then the layer's own shape put back), at bake time only */
function desaturate(cv: HTMLCanvasElement, amount: number) {
  if (amount < 0.02) return;
  const c = cv.getContext('2d');
  if (!c) return;
  const w = cv.width;
  const h = cv.height;
  const [tmp, t] = getScratch(w, h);
  t.drawImage(cv, 0, 0);
  t.globalCompositeOperation = 'saturation';
  t.globalAlpha = Math.min(1, amount);
  t.fillStyle = '#808080';
  t.fillRect(0, 0, w, h);
  t.globalAlpha = 1;
  t.globalCompositeOperation = 'destination-in';
  t.drawImage(cv, 0, 0);
  t.globalCompositeOperation = 'source-over';
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'copy';
  c.drawImage(tmp, 0, 0, w, h, 0, 0, w, h);
  c.restore();
}

/** lay a haze veil over what a layer has painted, leaving its transparent parts (the sky showing through) alone: stronger toward the horizon */
function veilAtop(cv: HTMLCanvasElement, col: string, a: number) {
  if (a < 0.005) return;
  const c = cv.getContext('2d');
  if (!c) return;
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'source-atop';
  const g = c.createLinearGradient(0, 0, 0, cv.height);
  g.addColorStop(0, rgba(col, a * 0.55));
  g.addColorStop(1, rgba(col, a));
  c.fillStyle = g;
  c.fillRect(0, 0, cv.width, cv.height);
  c.restore();
}

function recede(cache: { far: HTMLCanvasElement; hills: HTMLCanvasElement; mid: HTMLCanvasElement }, look: Look, world: number) {
  const R = { ...RECEDE_DEFAULT, ...(RECEDE[world] ?? {}) };
  desaturate(cache.far, R.sat);
  veilAtop(cache.far, look.haze, R.far);
  desaturate(cache.hills, R.sat * 0.6);
  veilAtop(cache.hills, look.haze, R.hills);
  veilAtop(cache.mid, look.haze, R.mid);
}

/**
 * A very soft pool of calm behind the lane the hero plays in. Light worlds get a pale wash of their own haze (his brown fur sits dark
 * against it), dark worlds a deeper one (the glow and the detail fall back, he stays the brightest thing there). It is a smooth
 * oval fall-off, never an edge, and it follows him, so the busiest backdrop is always at its quietest right where he is.
 */
/**
 * Which way each world's pool leans, chosen from where the hero's fur (a mid-light brown, lightness about 55) sits against the world's
 * own backdrop: a bright world (sunny canopy, golden hour, mist, orchid dawn, amber ruins) gets a pale pool the fur reads dark against;
 * a dark or smouldering one (grotto, blackwater swamp, dusk karst, lava, storm keep) gets a deep smoky one he reads light against. The
 * swamp, the dusk and the lava have backdrops whose lightness is already close to his, so theirs are the strongest.
 */
const POOL: Record<number, { light: boolean; a: number }> = {
  1: { light: true, a: 0.34 },
  2: { light: true, a: 0.34 },
  3: { light: false, a: 0.3 },
  4: { light: true, a: 0.34 },
  5: { light: true, a: 0.3 },
  6: { light: false, a: 0.42 },
  7: { light: true, a: 0.36 },
  8: { light: false, a: 0.42 },
  9: { light: false, a: 0.44 },
  10: { light: false, a: 0.32 },
};
/** keyed weakly: every run rolls a fresh Look, and a strong Map here kept each old one (and its palette) alive for the whole session */
const poolCache = new WeakMap<Look, { col: string; a: number }>();
export function poolFor(look: Look, world: number): { col: string; a: number } {
  let p = poolCache.get(look);
  if (p) return p;
  const cfg = POOL[world] ?? POOL[1];
  p = cfg.light ? { col: mixToHex(look.haze, '#fff8ec', 0.55), a: cfg.a } : { col: mixToHex(look.hills[2], '#000000', 0.55), a: cfg.a };
  poolCache.set(look, p);
  return p;
}

/** the pool's soft fall-off, painted once per colour and opacity (a gradient built and filled for every frame was the dearest part of it) */
const poolSprites = new Map<string, HTMLCanvasElement>();
function poolSprite(col: string, a: number): HTMLCanvasElement {
  const key = col + '|' + a;
  let cv = poolSprites.get(key);
  if (cv) return cv;
  const N = 160;
  cv = document.createElement('canvas');
  cv.width = N;
  cv.height = N;
  const c = cv.getContext('2d')!;
  const g = c.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
  g.addColorStop(0, rgba(col, a));
  g.addColorStop(0.5, rgba(col, a * 0.62));
  g.addColorStop(1, rgba(col, 0));
  c.fillStyle = g;
  c.fillRect(0, 0, N, N);
  poolSprites.set(key, cv);
  return cv;
}

/** a soft round puff of mist, painted once per colour: opaque in the middle, feathered to nothing at its rim */
const puffSprites = new Map<string, HTMLCanvasElement>();
export function mistPuff(col: string): HTMLCanvasElement {
  let cv = puffSprites.get(col);
  if (cv) return cv;
  const N = 128;
  cv = document.createElement('canvas');
  cv.width = N;
  cv.height = N;
  const c = cv.getContext('2d')!;
  const g = c.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
  g.addColorStop(0, rgba(col, 1));
  g.addColorStop(0.35, rgba(col, 0.75));
  g.addColorStop(0.7, rgba(col, 0.25));
  g.addColorStop(1, rgba(col, 0));
  c.fillStyle = g;
  c.fillRect(0, 0, N, N);
  puffSprites.set(col, cv);
  return cv;
}

/** a world with mist in the air (World 4): wide soft banks drifting slowly across the lower half, behind the playfield */
function mistDrift(ctx: CanvasRenderingContext2D, look: Look, vw: number, vh: number, time: number) {
  if (look.weather !== 'mist') return;
  const pic = mistPuff(look.haze);
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const x = (((i * 0.3 + time * 0.01 * (1 + i * 0.2)) % 1.4) - 0.2) * vw;
    const rx = vw * 0.42;
    const ry = vh * 0.13;
    ctx.globalAlpha = 0.22;
    ctx.drawImage(pic, x - rx, vh * (0.55 + i * 0.07) - ry, rx * 2, ry * 2);
  }
  ctx.restore();
}

function lanePool(ctx: CanvasRenderingContext2D, look: Look, world: number, vw: number, vh: number) {
  const hs = heroScreen();
  if (!hs) return;
  const { col, a } = poolFor(look, world);
  const rx = Math.min(vw * 0.42, 360);
  const ry = Math.min(vh * 0.36, 190);
  ctx.drawImage(poolSprite(col, a), hs.x - rx, hs.y - 36 - ry, rx * 2, ry * 2);
}

function ensure(world: number): LayerSet {
  // (World 5's layers are baked in the stage's light, so a change of light is a fresh set)
  const key = `${world}:${getSceneSeed()}${world === 5 ? `:${w5MoodNow()}` : ''}:${bakeScale}`;
  const hit = sets.get(key);
  if (hit) {
    // keep recently used sets at the end so the oldest is the one to evict
    sets.delete(key);
    sets.set(key, hit);
    return hit;
  }
  // gameplay keeps one full-resolution set; low-resolution vistas keep a handful
  const sameKind = [...sets.entries()].filter(([k]) => k.endsWith(`:${bakeScale}`));
  const limit = bakeScale >= 1 ? 1 : bakeScale > 0.45 ? 2 : 6;
  while (sameKind.length >= limit) {
    const [old] = sameKind.shift()!;
    sets.delete(old);
  }
  // the painted plants and flowers stand in the scenery too: start loading them now (a bake that finds them not ready keeps the vector foliage)
  warmFloraArt();
  const look = lookFor(world);
  // a world painted as strips needs nothing baked but the foreground frame
  // (a map thumbnail, baked at THUMB_BAKE or smaller, uses only strips already decoded: it is baked before any could arrive)
  const painted = paintedFor(world, bakeScale > THUMB_BAKE);
  if (painted) {
    const set: LayerSet = {
      world, seed: getSceneSeed(), far: painted.far, hills: null, mid: painted.mid, near: painted.near, sky: painted.sky,
      front: buildFront(look, world, false), clouds: [], hazed: true, painted: true, at: painted.at,
    };
    sets.set(key, set);
    return set;
  }
  if (hasPainted(world)) {
    const set: LayerSet = {
      world, seed: getSceneSeed(), far: waitingSky(look), hills: null, mid: clearStrip(), near: null,
      front: buildFront(look, world, false), clouds: [], hazed: true, painted: true, waiting: true,
    };
    sets.set(key, set);
    return set;
  }
  const cache: LayerSet = {
    world,
    seed: getSceneSeed(),
    far: buildFar(look, world),
    hills: buildHills(look, world),
    mid: buildMid(look, world),
    near: buildNear(look, world),
    front: buildFront(look, world),
    clouds: buildClouds(look, world),
    hazed: false,
  };
  // the far layers are pushed back into the air (less contrast, less colour) so the middle ground, and the hero in it, stay the clearest
  recede(cache as { far: HTMLCanvasElement; hills: HTMLCanvasElement; mid: HTMLCanvasElement }, look, world);
  // Gameplay paints a haze veil over each of the three distant layers, every frame: three more full-screen blends on a phone. A veil laid
  // over a layer and then over what is behind it is the same picture as the veil baked into that layer ("over" is associative), so it is
  // baked once here. Menu vistas (small bake scale) keep drawing theirs live, because they skip the veils on purpose.
  if (bakeScale >= 1) {
    bakeHaze(cache.far as HTMLCanvasElement, look.haze, HAZE_FAR);
    bakeHaze(cache.hills as HTMLCanvasElement, look.haze, HAZE_HILLS);
    bakeHaze(cache.mid as HTMLCanvasElement, look.haze, HAZE_MID);
    cache.hazed = true;
  }
  sets.set(key, cache);
  return cache;
}

export function disposeScenery() {
  sets.clear();
}

// ───────────────────────────── compositing ─────────────────────────────

interface TileOpt {
  layer: LayerName;
  rig: Rig;
  time: number;
  /** sway the foliage (off in menus and on slow screens) */
  sway: boolean;
}

/** device pixels per scene unit, from the transform the caller set (the engine scales by dpr × zoom; a story canvas by its own) */
export function devScale(ctx: CanvasRenderingContext2D): number {
  const t = typeof ctx.getTransform === 'function' ? ctx.getTransform() : null;
  const k = t ? Math.hypot(t.a, t.b) : 1;
  return k > 0 && Number.isFinite(k) ? k : 1;
}
/** `v` (scene units) moved onto the nearest whole device pixel: flooring to whole units left the far layer still for two frames, then
 * jumping two device pixels, while the ground moved every frame, so the layers shuddered against each other (polish report AN-4) */
export const snapDev = (v: number, k: number): number => Math.round(v * k) / k;

function drawTile(ctx: CanvasRenderingContext2D, cv: Layer, par: number, camX: number, vw: number, vh: number, s: number, yOff = 0, alpha = 1, o?: TileOpt) {
  const pitch = tileW(cv) * s;
  const k = devScale(ctx);
  const lv = o ? o.rig.layers[o.layer] : null;
  const shift = lv ? lv.shift * pitch : 0;
  let x0 = -((camX * par + shift) % pitch);
  if (x0 > 0) x0 -= pitch;
  const prev = ctx.globalAlpha;
  ctx.globalAlpha = alpha;
  const shiftY = yOff + (lv ? lv.dy * s : 0);
  // a layer that has slid up or down with the camera would leave its bare edge showing (a band of the layer behind, or of sky), so it is
  // stretched by the distance it slid and pinned to the side it slid toward: it always covers the whole view, and has nothing to show at the edge
  const dh = H * s + 2 * Math.abs(shiftY);
  const y0 = shiftY > 0 ? 0 : 2 * shiftY;
  const amp = o && o.sway && !pskip('sway') ? swayAmount(o.rig, o.layer) * s : 0;
  if (amp > 0 && o) {
    // wind: draw the tile in horizontal rows, each slid a little, more toward the loose tips than the roots
    const N = 16;
    const gust = gustAt(o.rig, o.time) * amp;
    const sp = o.rig.wind.spd;
    const rowH = layerH(cv) / N;
    const dH = dh / N;
    for (let x = x0 - pitch; x < vw; x += pitch) {
      if (x + pitch < -amp - 4) continue;
      const px = snapDev(x, k);
      const pw = snapDev(x + pitch, k) - px + 1 / k;
      const flip = !!(lv && lv.flip);
      if (flip) {
        ctx.save();
        ctx.translate(px + pw, 0);
        ctx.scale(-1, 1);
      }
      for (let i = 0; i < N; i++) {
        const w = swayWeight(o.layer, (i + 0.5) / N);
        if (w <= 0.001) continue;
        const dx = Math.sin(o.time * sp + i * 0.42 + (camX * par) * 0.0016 + o.rig.wind.phase) * gust * w;
        const sy = Math.floor(i * rowH);
        const sh = Math.min(layerH(cv) - sy, Math.floor((i + 1) * rowH) - sy + 1);
        ctx.drawImage(cv, 0, sy, layerWpx(cv), sh, flip ? -dx : px + dx, y0 + i * dH, pw, dH + 1);
      }
      if (flip) ctx.restore();
    }
  } else {
    for (let x = x0; x < vw; x += pitch) {
      const px = snapDev(x, k);
      const pw = snapDev(x + pitch, k) - px + 1 / k;
      if (lv && lv.flip) {
        ctx.save();
        ctx.translate(px + pw, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(cv, 0, y0, pw, dh);
        ctx.restore();
      } else ctx.drawImage(cv, px, y0, pw, dh);
    }
  }
  ctx.globalAlpha = prev;
}

/**
 * Where a painted strip sits on screen: it is drawn `k` times the design height, with the row `a` of the picture (0 top, 1 bottom: the
 * line where its land meets its floor) placed at `at` of the view height, just above the ground Pokey runs on. Without this the
 * strips' land would sit behind the ground blocks and only their sky would show.
 */
export const STRIP_FIT: Record<'far' | 'mid' | 'near', { k: number; a: number; at: number }> = {
  far: { k: 1.2, a: 0.72, at: 0.6 },
  mid: { k: 1.0, a: 0.69, at: 0.58 },
  near: { k: 1.05, a: 0.72, at: 0.63 },
};

/**
 * The scale the painted strips are drawn at: `stripVh` / H. Sideways that is the view's own height; upright the engine passes the
 * height sideways would show for the same width of world (Matt, 2026-10-29: fitted to the tall upright view the strips were drawn 2.2x
 * closer than sideways, a soft crop of their misty middle, and the screen read faded). The strips keep their ground line (STRIP_FIT
 * `at`, a share of the real view height), and the room upright leaves above the far strip is its painted sky.
 */
export function stripTop(part: keyof typeof STRIP_FIT, vh: number, s: number, yOff = 0): { top: number; dh: number } {
  const f = STRIP_FIT[part];
  const dh = H * s * f.k;
  return { top: vh * f.at - f.a * dh + yOff, dh };
}

/** how much of its far strip a sky overlaps at the bottom, fading into it (tools/art/hfbatch/skycut.py makes them so). The middle strips
 * whose top is solid paint fade out over their top 7% in the file instead (tools/art/edges/defringe.py --topfade): sideways those rows
 * are always off screen, upright the trees dissolve into the far strip's sky */
export const SKY_OVERLAP = 0.05;

/** a painted strip, repeated across the view at its own parallax and placed by STRIP_FIT. The strip files are made seamless
 * (scripts/strip-seamless.py: the right edge crossfaded into the left), so every copy is drawn the same way round: no mirrored
 * twins (polish report VI-4). A far strip with its painted sky `above` has it drawn above when there is room (upright), as wide as
 * the strip and at the same scale: its bottom SKY_OVERLAP of the strip's height lies over the strip's top and fades into it. */
function drawStrip(ctx: CanvasRenderingContext2D, img: Layer, part: keyof typeof STRIP_FIT, par: number, camX: number, vw: number, vh: number, s: number, yOff = 0, above: Layer | null = null) {
  const pl = stripTop(part, vh, s, yOff);
  const dh = pl.dh;
  const iw = layerWpx(img);
  const ih = layerH(img);
  const pitch = tileW(img) * s * STRIP_FIT[part].k;
  const k = devScale(ctx);
  const top = snapDev(pl.top, k);
  // the sky, when the strip leaves room above it (upright): its rows at the strip's own scale
  const sh = above && top > 0 ? (dh * layerH(above)) / ih : 0;
  const skyTop = top + dh * SKY_OVERLAP - sh;
  let x0 = -((camX * par) % pitch);
  if (x0 > 0) x0 -= pitch;
  for (let x = x0; x < vw; x += pitch) {
    // (each copy starts on a whole device pixel and overlaps the next by one: AN-4)
    const px = snapDev(x, k);
    const pw = snapDev(x + pitch, k) - px + 1 / k;
    ctx.drawImage(img, 0, 0, iw, ih, px, top, pw, dh);
    if (sh > 0 && above) {
      const sw = layerWpx(above), skh = layerH(above);
      ctx.drawImage(above, 0, 0, sw, skh, px, skyTop, pw, sh);
      // (a screen taller than any phone: the sky's top row carries on up to the edge)
      if (skyTop > 0) ctx.drawImage(above, 0, 0, sw, 1, px, 0, pw, skyTop + 1 / k);
    }
    // the strip is fitted to end a little above the bottom of the view, where the ground usually covers it; up a climb (1-4, the
    // ascents) the camera is in the air and that band showed the bare sky, so the strip's last rows carry on down to the edge
    const gap = vh - (top + dh);
    if (gap > 0) {
      const rows = Math.max(1, Math.round(ih * 0.03));
      ctx.drawImage(img, 0, ih - rows, iw, rows, px, top + dh - 1 / k, pw, gap + 2);
    }
  }
}

/** how strong the haze is over the far, hill and mid layers (top of the veil is a fifth of this) */
const HAZE_FAR = 0.09;
const HAZE_HILLS = 0.07;
const HAZE_MID = 0.05;

function veil(ctx: CanvasRenderingContext2D, col: string, a: number, vw: number, vh: number) {
  const g = ctx.createLinearGradient(0, 0, 0, vh);
  g.addColorStop(0, rgba(col, a * 0.2));
  g.addColorStop(1, rgba(col, a));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, vw, vh);
}

/** the same veil, painted once over a whole layer tile (the tile spans exactly the view height when it is drawn) */
function bakeHaze(cv: HTMLCanvasElement, col: string, a: number) {
  const c = cv.getContext('2d');
  if (c) veil(c, col, a, cv.width, cv.height);
}

export function renderSky(ctx: CanvasRenderingContext2D, world: number, vw: number, vh: number, time: number, camX: number) {
  const look = lookFor(world);
  const set = ensure(world);
  const s = vh / H;
  const g = ctx.createLinearGradient(0, 0, 0, vh);
  g.addColorStop(0, look.sky[0]);
  g.addColorStop(0.4, look.sky[1]);
  g.addColorStop(0.72, look.sky[2]);
  g.addColorStop(1, look.sky[3]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, vw, vh);

  if (look.stars) {
    const r = rng(world * 13);
    for (let i = 0; i < 90; i++) {
      const x = r() * vw;
      const y = r() * vh * 0.5;
      const tw = 0.5 + 0.5 * Math.sin(time * (1 + r() * 2) + i);
      ctx.fillStyle = `rgba(255,255,255,${0.25 + tw * 0.6})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.8 + r() * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (look.sun) {
    const sx = vw * look.sun.x;
    const sy = vh * look.sun.y;
    const R = look.sun.r * s;
    const glow = ctx.createRadialGradient(sx, sy, R * 0.5, sx, sy, R * 7);
    glow.addColorStop(0, rgba(look.sun.glow, 0.7));
    glow.addColorStop(0.35, rgba(look.sun.glow, 0.22));
    glow.addColorStop(1, rgba(look.sun.glow, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, vw, vh);
    ctx.fillStyle = rgba(look.sun.glow, 0.35);
    ctx.beginPath();
    ctx.arc(sx, sy, R * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = look.sun.core;
    ctx.beginPath();
    ctx.arc(sx, sy, R, 0, Math.PI * 2);
    ctx.fill();
  }
  // drifting clouds
  set.clouds.forEach((c, i) => {
    const speed = 5 + i * 2.3;
    const span = vw + 700;
    const x = ((i * span * 0.37 + time * speed - camX * (0.015 + i * 0.004)) % span + span) % span - 350;
    const y = vh * (0.07 + ((i * 0.17) % 0.3));
    const k = 0.8 + (i % 3) * 0.25;
    ctx.globalAlpha = 0.95;
    ctx.drawImage(c, x - 260 * k * s, y, 520 * k * s, 220 * k * s);
    ctx.globalAlpha = 1;
  });
}

/** Everything behind the playfield. */
let canopyK = 0;
/** how far up in the trees the view is, 0 (the forest floor) to 1 (the canopy): the painted middle and near strips fade over */
export function setCanopy(k: number): void {
  canopyK = Math.max(0, Math.min(1, k));
}

let revealK = 0;
let revealStrips: PaintedSet | null = null;
/**
 * The top of a climb that opens onto another world (6-8: the ruins of World 7 past the mangrove): `k` 0 (not yet) to 1 (there). The
 * world's own middle and near strips fade out, the revealed set's far, middle and near fade in, and the light turns golden.
 */
export function setReveal(k: number, strips: PaintedSet | null): void {
  revealK = strips ? Math.max(0, Math.min(1, k)) : 0;
  revealStrips = strips;
}

/** `stripVh`: the view height the painted strips are fitted to (stripTop); upright the engine passes the sideways one */
export function renderScenery(ctx: CanvasRenderingContext2D, world: number, camX: number, camY: number, vw: number, vh: number, time: number, lite = false, stripVh = vh) {
  const look = lookFor(world);
  const set = ensure(world);
  const s = vh / H;
  // (the painted strips' scale: s sideways, the sideways scale upright)
  const ps = set.painted ? Math.min(vh, stripVh) / H : s;
  renderSky(ctx, world, vw, vh, time, camX);
  // how far the layers slide with the climb: gentle, so the stretch that keeps their edges covered stays unnoticeable
  const yo = -Math.min(30, Math.max(-30, camY * 0.03)) * ps;
  // the polish pass (prototype, off by default): per-stage layer shifts/flips, wind, mist and light shafts
  const rig = polishEnabled() && polishTier() < 2 ? rigFor(look, world, getSceneSeed()) : null;
  const to = (layer: LayerName): TileOpt | undefined => (rig ? { layer, rig, time, sway: !lite && polishTier() < 1 } : undefined);
  const live = !lite && !set.hazed;
  if (set.painted) {
    // (strips that decoded a moment ago, after the stage was already on screen, fade in over the stand-in sky: VI-3)
    const fa = fadeIn(set.at);
    // (the stand-in sky is a plain gradient: it still fills the whole view, at the view's own scale)
    if (fa < 1) drawStrip(ctx, waitingSky(look), 'far', 0.05, camX, vw, vh, s, yo * 0.3);
    ctx.globalAlpha = fa;
    drawStrip(ctx, set.far, 'far', 0.05, camX, vw, vh, ps, yo * 0.3, set.sky ?? null);
    const rv = revealK > 0.01 && revealStrips ? revealStrips : null;
    const rk = rv ? revealK : 0;
    if (rv) {
      ctx.globalAlpha = rk;
      drawStrip(ctx, rv.far, 'far', 0.05, camX, vw, vh, ps, yo * 0.3, rv.sky);
      ctx.globalAlpha = 1;
    }
    // high in the trees the middle and near strips fade over to the canopy ones (setCanopy: 1-8's branch, the top of 1-4's climb)
    const cano = canopyK > 0.01 && !set.waiting ? canopyFor(world) : null;
    const k = cano ? canopyK * fadeIn(cano.at) : 0;
    if (k < 0.99 && rk < 0.99) {
      ctx.globalAlpha = (1 - k) * fa * (1 - rk);
      drawStrip(ctx, set.mid, 'mid', 0.2, camX, vw, vh, ps, yo * 0.8);
      if (set.near) drawStrip(ctx, set.near, 'near', 0.42, camX, vw, vh, ps, yo);
      ctx.globalAlpha = 1;
    }
    if (cano && k > 0.01 && rk < 0.99) {
      ctx.globalAlpha = k * fa * (1 - rk);
      drawStrip(ctx, cano.mid, 'mid', 0.2, camX, vw, vh, ps, yo * 0.8);
      drawStrip(ctx, cano.near, 'near', 0.42, camX, vw, vh, ps, yo);
      ctx.globalAlpha = 1;
    }
    if (rv) {
      ctx.globalAlpha = rk;
      drawStrip(ctx, rv.mid, 'mid', 0.2, camX, vw, vh, ps, yo * 0.8);
      if (rv.near) drawStrip(ctx, rv.near, 'near', 0.42, camX, vw, vh, ps, yo);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = rgba(look.grade[0], look.grade[1] * (1 - rk));
    ctx.fillRect(0, 0, vw, vh);
    if (rv) {
      // golden light from the low sun over the ruins
      const g = ctx.createLinearGradient(0, 0, 0, vh);
      g.addColorStop(0, `rgba(255, 196, 110, ${0.3 * rk})`);
      g.addColorStop(0.6, `rgba(255, 170, 80, ${0.16 * rk})`);
      g.addColorStop(1, 'rgba(255, 170, 80, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, vw, vh);
    }
    mistDrift(ctx, look, vw, vh, time);
    lanePool(ctx, look, world, vw, vh);
    return;
  }
  drawTile(ctx, set.far, 0.05, camX, vw, vh, s, yo * 0.3, 1, to('far'));
  if (live) veil(ctx, look.haze, HAZE_FAR, vw, vh);
  if (set.hills) drawTile(ctx, set.hills, 0.12, camX, vw, vh, s, yo * 0.5, 1, to('hills'));
  if (live) veil(ctx, look.haze, HAZE_HILLS, vw, vh);
  drawTile(ctx, set.mid, 0.26, camX, vw, vh, s, yo * 0.8, 1, to('mid'));
  if (live) veil(ctx, look.haze, HAZE_MID, vw, vh);
  if (set.near) drawTile(ctx, set.near, 0.5, camX, vw, vh, s, yo, 1, to('near'));
  if (rig && !lite) polishBack(ctx, look, rig, world, camX, vw, vh, time);
  if (RICH_MID(look, world) && !set.painted) renderLifeBack(ctx, look, world, camX, vw, vh, time, lite);
  // colour grade pulls every layer into one mood
  // plain alpha tint (blend modes force a full-canvas flush on software/mobile GPUs)
  ctx.fillStyle = rgba(look.grade[0], look.grade[1]);
  ctx.fillRect(0, 0, vw, vh);
  mistDrift(ctx, look, vw, vh, time);
  lanePool(ctx, look, world, vw, vh);
}

let vigPic: HTMLCanvasElement | null = null;
let vigKey = '';
/** the screen-edge darkening: painted once into a small canvas, then stretched (smooth, so it needs no detail) */
function drawVignette(ctx: CanvasRenderingContext2D, col: string, vw: number, vh: number) {
  const key = `${col}|${Math.round(vw)}x${Math.round(vh)}`;
  const bw = Math.max(16, Math.round(vw / 8));
  const bh = Math.max(16, Math.round(vh / 8));
  if (!vigPic) vigPic = document.createElement('canvas');
  if (key !== vigKey) {
    vigPic.width = bw;
    vigPic.height = bh;
    const g = vigPic.getContext('2d');
    if (!g) return;
    g.clearRect(0, 0, bw, bh);
    // the same gradient as before, in the small canvas's own units
    const k = bw / vw;
    const vg = g.createRadialGradient(bw / 2, bh / 2, vh * 0.55 * k, bw / 2, bh / 2, vw * 0.78 * k);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, rgba(col, 0.3));
    g.fillStyle = vg;
    g.fillRect(0, 0, bw, bh);
    vigKey = key;
  }
  const prev = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(vigPic, 0, 0, bw, bh, 0, 0, vw, vh);
  ctx.imageSmoothingEnabled = prev;
}

/** Frame leaves + vignette + weather — drawn over the playfield. */
export function renderOverlay(ctx: CanvasRenderingContext2D, world: number, camX: number, vw: number, vh: number, time: number, lite = false) {
  const look = lookFor(world);
  const set = ensure(world);
  const s = vh / H;
  const rig = polishEnabled() && polishTier() < 2 ? rigFor(look, world, getSceneSeed()) : null;
  drawTile(ctx, set.front, 1.25, camX, vw, vh, s, 0, 0.96, rig ? { layer: 'front', rig, time, sway: !lite && polishTier() < 1 } : undefined);
  if (RICH_MID(look, world)) renderLifeFront(ctx, look, world, camX, vw, vh, time);
  if (rig && !lite) polishFront(ctx, rig, world, camX, vw, vh, time);
  // the dark edge vignette stays on at every quality (it is one small cached picture stretched over the screen): dropping it at lower
  // quality made the whole picture suddenly lighter when the quality governor stepped down
  drawVignette(ctx, darken(look.sky[0], 0.6), vw, vh);
  renderWeather(ctx, look, world, camX, vw, vh, time, lite);
}

/**
 * A world's scenery at menu quality: baked at a fraction of gameplay resolution (so a world appears in a few frames,
 * not a few hundred ms) and cached, so flipping between worlds is instant. `front` adds the foreground leaves + weather.
 */
export const VISTA_SCALE = 0.4;
export function renderVista(ctx: CanvasRenderingContext2D, world: number, camX: number, vw: number, vh: number, time: number, front = true, scale = VISTA_SCALE) {
  clearHeroScreen(); // menus have no hero
  withBakeScale(scale, () => {
    renderScenery(ctx, world, camX, 0, vw, vh, time, true);
    if (front) renderOverlay(ctx, world, camX, vw, vh, time, true);
  });
}

/** bake a world's vista ahead of time (call from idle callbacks); returns true when it had to bake */
export function warmVista(world: number, scale = VISTA_SCALE): boolean {
  return withBakeScale(scale, () => {
    const had = sets.has(`${world}:${getSceneSeed()}:${bakeScale}`);
    if (!had) ensure(world);
    return !had;
  });
}

/** forget a baked vista (used after a tiny one-shot bake such as a map thumbnail) */
export function dropVista(world: number, scale = VISTA_SCALE) {
  sets.delete(`${world}:${getSceneSeed()}:${scale}`);
}

// ───────────────────────────── weather ─────────────────────────────

interface Mote { x: number; y: number; s: number; p: number; c: number }
const motes: Record<number, Mote[]> = {};
/** every world's motes are made once, at the most any weather asks for, and a world that wants fewer takes the first n of them */
const MOTES_MADE = 260;
function getMotes(world: number, n: number): Mote[] {
  if (!motes[world]) {
    const r = rng(world * 977);
    motes[world] = Array.from({ length: MOTES_MADE }, () => ({ x: r(), y: r(), s: 0.4 + r() * 0.9, p: r() * 6.28, c: (r() * 1000) | 0 }));
  }
  return motes[world].slice(0, n);
}

/**
 * How many drifting things each world's weather has. Worlds that stacked a lot of them on top of a busy backdrop (the glow orbs of
 * World 3, the petals of World 5, the leaves of World 1) carry fewer, bigger, calmer ones now; the quality governor halves them again.
 */
const WEATHER_COUNT: Record<number, number> = { 1: 8, 2: 7, 3: 14, 4: 0, 5: 7, 6: 14, 7: 9, 8: 12, 9: 38, 10: 150 };

/** where the hero is on screen (view units): the drifting things thin out around him so he never gets a petal or an orb over his face */
export function setWeatherAvoid(x: number, y: number) {
  setHeroScreen(x, y);
}

function renderWeather(ctx: CanvasRenderingContext2D, look: Look, world: number, camX: number, vw: number, vh: number, time: number, lite = false) {
  const wrap01 = (v: number) => ((v % 1) + 1) % 1;
  const count = Math.max(0, Math.round((WEATHER_COUNT[world] ?? 10) * (lite ? 0.5 : 1)));
  if (count === 0) {
    // (a world with no drifting things still gets its mist and storms below)
    if (look.weather !== 'mist' && look.weather !== 'storm' && look.weather !== 'rain') return;
  }
  switch (look.weather) {
    case 'rain':
    case 'storm': {
      const heavy = look.weather === 'storm';
      const drops = getMotes(world, heavy ? count : Math.round(count * 0.6));
      ctx.save();
      ctx.lineCap = 'round';
      // three strengths of drop, each stroked as ONE path (a stroke per drop was the costliest thing in the storm)
      for (let b = 0; b < 3; b++) {
        const lo = b / 3;
        const hi = (b + 1) / 3;
        ctx.beginPath();
        let any = false;
        for (const d of drops) {
          const u = (d.s - 0.4) / 0.9;
          if (u < lo || u >= hi + (b === 2 ? 1 : 0)) continue;
          const sp = (heavy ? 1.7 : 1.1) * (0.7 + d.s * 0.7);
          const x = wrap01(d.x - time * 0.12 * sp + camX * 0.0001) * (vw + 80);
          const y = wrap01(d.y + time * sp * 0.9) * (vh + 40) - 20;
          const len = (heavy ? 26 : 18) * d.s;
          ctx.moveTo(x, y);
          ctx.lineTo(x - len * 0.28, y + len);
          any = true;
        }
        if (!any) continue;
        const mid = 0.4 + (lo + hi) * 0.5 * 0.9;
        ctx.strokeStyle = `rgba(${heavy ? '200,214,255' : '230,244,255'},${0.18 + mid * 0.3})`;
        ctx.lineWidth = 1 + mid * 0.9;
        ctx.stroke();
      }
      ctx.restore();
      if (heavy) {
        // lightning: two quick flashes every ~7s with a forked bolt
        const ph = time % 7.3;
        const f = ph < 0.12 ? 1 : ph > 0.28 && ph < 0.38 ? 0.7 : 0;
        if (f > 0) {
          ctx.fillStyle = `rgba(210,225,255,${0.4 * f})`;
          ctx.fillRect(0, 0, vw, vh);
          const r = rng(Math.floor(time / 7.3) + 5);
          let bx = vw * (0.2 + r() * 0.6);
          let by = 0;
          ctx.strokeStyle = `rgba(255,255,255,${f})`;
          ctx.lineWidth = 3;
          ctx.shadowColor = '#bcd0ff';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          while (by < vh * 0.6) {
            bx += (r() - 0.5) * 60;
            by += 30 + r() * 40;
            ctx.lineTo(bx, by);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      } else {
        const g = ctx.createLinearGradient(0, vh * 0.5, 0, vh);
        g.addColorStop(0, 'rgba(235,248,255,0)');
        g.addColorStop(1, 'rgba(235,248,255,0.28)');
        ctx.fillStyle = g;
        ctx.fillRect(0, vh * 0.5, vw, vh * 0.5);
      }
      break;
    }
    case 'fireflies':
    case 'spores': {
      const list = getMotes(world, count);
      const pic = glowPic(look.glow ?? '#fff6a0');
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const m of list) {
        const x = wrap01(m.x + Math.sin(time * 0.3 * m.s + m.p) * 0.04 - camX * 0.00018 * m.s) * vw;
        const yy = look.weather === 'spores' ? wrap01(m.y - time * 0.018 * m.s) : m.y * 0.7 + 0.25 + Math.sin(time * 0.5 * m.s + m.p) * 0.05;
        const y = yy * vh;
        const pulse = 0.45 + 0.55 * Math.sin(time * 2 * m.s + m.p);
        const R = (3.5 + m.s * 3.5) * (0.7 + pulse * 0.5);
        const a = 0.9 * pulse * laneClear(x, y, 0.1, 90);
        if (a < 0.02) continue;
        ctx.globalAlpha = a;
        ctx.drawImage(pic, x - R * 2.2, y - R * 2.2, R * 4.4, R * 4.4);
      }
      ctx.restore();
      break;
    }
    case 'embers':
    case 'ash': {
      const list = getMotes(world, count);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const m of list) {
        const x = wrap01(m.x + Math.sin(time * 0.8 + m.p) * 0.03 + time * 0.012 - camX * 0.0002) * vw;
        const y = (1 - wrap01(m.y + time * 0.07 * m.s)) * vh;
        const a = Math.min(1, (1 - y / vh) * 1.6) * (0.4 + 0.6 * Math.abs(Math.sin(time * 3 + m.p))) * laneClear(x, y, 0.35, 70);
        ctx.fillStyle = `rgba(255,${150 + (m.c % 90)},40,${a})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.4 + m.s * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      break;
    }
    case 'petals':
    case 'leaves': {
      // a calm drift: a handful of leaves or petals, never a snowstorm of them
      const list = getMotes(world, count);
      const cols = look.weather === 'petals' ? look.flora : look.leaves.map((c) => lighten(c, 0.2));
      for (const m of list) {
        const x = wrap01(m.x + Math.sin(time * 0.6 * m.s + m.p) * 0.05 + time * 0.02 - camX * 0.0003) * (vw + 60) - 30;
        const y = wrap01(m.y + time * 0.05 * m.s) * (vh + 40) - 20;
        const clear = laneClear(x, y, 0.18, 90);
        if (clear < 0.03) continue;
        // painted leaves for the leaf worlds (the petals of Worlds 2 and 5 stay petals)
        if (look.weather === 'leaves' && drawPaintedLeaf(ctx, world, m, x, y, time, vh / 720, clear)) continue;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * m.s * 1.2 + m.p);
        ctx.fillStyle = cols[m.c % cols.length];
        ctx.globalAlpha = 0.9 * clear;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8 * m.s + 3, (3.5 + m.s * 2) * Math.abs(Math.cos(time * m.s + m.p)) + 1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      break;
    }
    case 'mist':
      // (the mist drifts behind the playfield now, soft-edged: renderScenery mistDrift. Over it, its flat hard-edged ovals washed over
      // the ground, the cliffs and Pokey alike: testers, 4-3, 4-4 and 4-7, 2026-10-25)
      break;
  }
}

export { tone as _tone };
export type { Tone };
