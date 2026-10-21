/** The painted creature pictures the Jungle Journal shows: which sheet, which frame. */
import { BOA_ATLAS_SIZE, BOA_FRAMES } from './boaAtlasData.ts';
import { CAIMAN_ATLAS_SIZE, CAIMAN_FRAMES } from './caimanAtlasData.ts';
import { EAGLE_ATLAS_SIZE, EAGLE_FRAMES } from './eagleAtlasData.ts';
import { FROG_ATLAS_SIZE, FROG_FRAMES } from './frogAtlasData.ts';
import { JAGUAR_ATLAS_SIZE, JAGUAR_FRAMES } from './jaguarAtlasData.ts';
import { OCELOT_ATLAS_SIZE, OCELOT_FRAMES } from './ocelotAtlasData.ts';
import { QUEEN_ATLAS_SIZE, QUEEN_FRAMES } from './queenAtlasData.ts';
import { SNAKE_ATLAS_SIZE, SNAKE_FRAMES } from './snakeAtlasData.ts';
import { SPIDER_ATLAS_SIZE, SPIDER_FRAMES } from './spiderAtlasData.ts';
import { TAYRA_ATLAS_SIZE, TAYRA_FRAMES } from './tayraAtlasData.ts';
import { HARPY_ATLAS_SIZE, HARPY_FRAMES } from './harpyAtlasData.ts';
import { VENOM_ATLAS_SIZE, VENOM_FRAMES } from './venomAtlasData.ts';
import { CROC_ATLAS_SIZE, CROC_FRAMES } from './crocAtlasData.ts';

interface Frame {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface CreaturePicSpec {
  url: string;
  atlas: { w: number; h: number };
  frame: Frame;
}

const u = (name: string) => new URL(`../assets/enemies/${name}-atlas.webp`, import.meta.url).href;

/** frames chosen to read well as a small portrait */
export const CREATURE_ART: Record<string, CreaturePicSpec> = {
  jaguar: { url: u('jaguar'), atlas: JAGUAR_ATLAS_SIZE, frame: JAGUAR_FRAMES.walk_0 },
  snake: { url: u('snake'), atlas: SNAKE_ATLAS_SIZE, frame: SNAKE_FRAMES.slither_0 },
  harpy: { url: u('harpy'), atlas: HARPY_ATLAS_SIZE, frame: HARPY_FRAMES.walkB },
  tayra: { url: u('tayra'), atlas: TAYRA_ATLAS_SIZE, frame: TAYRA_FRAMES.walk_1 },
  ocelot: { url: u('ocelot'), atlas: OCELOT_ATLAS_SIZE, frame: OCELOT_FRAMES.walk_0 },
  boa: { url: u('boa'), atlas: BOA_ATLAS_SIZE, frame: BOA_FRAMES.alert },
  eagle: { url: u('eagle'), atlas: EAGLE_ATLAS_SIZE, frame: EAGLE_FRAMES.glide_a },
  spider: { url: u('spider'), atlas: SPIDER_ATLAS_SIZE, frame: SPIDER_FRAMES.idle_a },
  caiman: { url: u('caiman'), atlas: CAIMAN_ATLAS_SIZE, frame: CAIMAN_FRAMES.alert },
  frog: { url: u('frog'), atlas: FROG_ATLAS_SIZE, frame: FROG_FRAMES.idle },
  // guardians that have painted art
  guardian_1: { url: u('venom'), atlas: VENOM_ATLAS_SIZE, frame: VENOM_FRAMES.idle },
  guardian_2: { url: u('croc'), atlas: CROC_ATLAS_SIZE, frame: CROC_FRAMES.idle },
  guardian_5: { url: u('queen'), atlas: QUEEN_ATLAS_SIZE, frame: QUEEN_FRAMES.idle },
};
