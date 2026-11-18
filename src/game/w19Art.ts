/**
 * World 1's eagle roost (1-9 "be the bait": the lure post the boa fears, gen2/lureLay.ts; w1.ts W1_LURE keeps each laid post in
 * proto.gen2.roosts): ENG-19b's one Hugging Face take (roostb-101, src/assets/w1-19/, catalog row hf19/w1-roost), a harpy's stick nest
 * in the V of two living kapok limbs on a short mossy bough piece, drawn at Pokey's scale: the file is three times its size in the game
 * (89.1 units = Pokey standing), so the roost stands 145 px (1.63 of him), and its bough piece rests on the bough the post stands on.
 * Behind him and the animals (decor near). Nothing is drawn until it has loaded (stagePreload.ts 'w19'); the piece is code-free.
 */
import { trackAtlas } from './atlasLoader.ts';

const URL_ROOST = new URL('../assets/w1-19/w1-roost.webp', import.meta.url).href;
/** every file, for the preload (stagePreload.ts 'w19') */
export const W19_URLS: readonly string[] = [URL_ROOST];

/** the file (px, measured on the cut): `foot` the row its bough piece rests on (the underside's lobe below it sinks into the bough's
 *  top), `nest` the nest's middle column, set on the post's x (the post is what the boa's reach is measured from) */
export const ROOST = { w: 593, h: 435, foot: 412, nest: 322 } as const;
/** game px per file px: the catalog's units (Pokey 89.1 drawn at 267 file px) */
export const SCALE = 1 / 3;

let img: HTMLImageElement | null = null;
let ready = false;
function get(): HTMLImageElement | null {
  if (!img && typeof Image !== 'undefined') {
    const im = new Image();
    img = im;
    trackAtlas(im, URL_ROOST, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
  }
  return ready ? img : null;
}

/** start the piece loading (stagePreload.ts) */
export function w19Ready(): boolean {
  return !!get();
}

/** the roost of a lure post at (x, groundY): its nest over x, its bough piece on the ground. False until loaded */
export function drawEagleRoost(ctx: CanvasRenderingContext2D, x: number, groundY: number): boolean {
  const im = get();
  if (!im) return false;
  ctx.drawImage(im, x - ROOST.nest * SCALE, groundY - ROOST.foot * SCALE, ROOST.w * SCALE, ROOST.h * SCALE);
  return true;
}
