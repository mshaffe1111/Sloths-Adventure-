/**
 * vineSnakeArt — the vine snake's two painted poses (ART-678b, t-art-678b@a93e335, Hugging Face take snake-37 re-cut by recut.py):
 *   hang   hanging head-down from a loop round the vine (110 x 345): the snake on the move along a liana, rotated to the liana's swing
 *   hiss   reared, mouth open (187 x 180): its tell, at the end it starts from
 * Drawn at the catalog's planned ship sizes against Pokey's 89.1 drawn height (D41): hang 115 px tall, hiss 60 px. Loaded with the stage
 * that lays a snake (stageManifest.ts 'vine-snake', stagePreload.ts), and dropped and loaded again if the phone loses its canvas (D6).
 */
import { trackAtlas } from './atlasLoader.ts';

export const VINE_SNAKE_HANG_URL = new URL('../assets/w1-678/w16-vinesnake-hang.webp', import.meta.url).href;
export const VINE_SNAKE_HISS_URL = new URL('../assets/w1-678/w16-vinesnake-hiss.webp', import.meta.url).href;
/** the drawn sizes (px): the catalog's ship sizes, so the snake is a little longer than Pokey is tall and its tell head-high to his hands */
export const VINE_SNAKE_ART = { hang: { w: 110, h: 345, drawH: 115 }, hiss: { w: 187, h: 180, drawH: 60 } } as const;

type Pose = 'hang' | 'hiss';
const imgs: Record<Pose, HTMLImageElement | null> = { hang: null, hiss: null };
const ready: Record<Pose, boolean> = { hang: false, hiss: false };
const URLS: Record<Pose, string> = { hang: VINE_SNAKE_HANG_URL, hiss: VINE_SNAKE_HISS_URL };

function load(k: Pose) {
  if (imgs[k] || typeof Image === 'undefined') return;
  const im = new Image();
  imgs[k] = im;
  trackAtlas(im, URLS[k], () => { ready[k] = true; }, () => { imgs[k] = null; }, () => { imgs[k] = null; ready[k] = false; });
}

/** start loading both poses; true once both are ready to draw */
export function vineSnakeArtReady(): boolean {
  load('hang');
  load('hiss');
  return ready.hang && ready.hiss && !!imgs.hang && !!imgs.hiss;
}

/** a pose's picture, or null until it has loaded */
export function vineSnakeImg(k: Pose): HTMLImageElement | null {
  load(k);
  return ready[k] ? imgs[k] : null;
}
