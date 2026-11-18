/**
 * vineSnakeArt — the vine snake's two painted poses (ART-678b, t-art-678b@a93e335, Hugging Face take snake-37 re-cut by recut.py):
 *   hang   hanging head-down from a loop round the vine (110 x 345): the snake on the move along a liana, rotated to the liana's swing
 *   hiss   reared, mouth open (187 x 180): its tell, at the end it starts from
 * and for the FALSE liana (vineSnake.ts isFalseLiana) the BROWN cut (tools/art/snakebrown.py: only the green scales, to bark brown; the
 * lead's ruling 11-14: its disguise is passing for a liana): hang-brown (it hangs stiff from the bough, head at its foot) and slide-brown
 * (it slithers off once startled).
 * Drawn at the catalog's planned ship sizes against Pokey's 89.1 drawn height (D41): hang 115 px tall, hiss 60 px. Loaded with the stage
 * that lays a snake (stageManifest.ts 'vine-snake', stagePreload.ts), and dropped and loaded again if the phone loses its canvas (D6).
 */
import { trackAtlas } from './atlasLoader.ts';

export const VINE_SNAKE_HANG_URL = new URL('../assets/w1-678/w16-vinesnake-hang.webp', import.meta.url).href;
export const VINE_SNAKE_HISS_URL = new URL('../assets/w1-678/w16-vinesnake-hiss.webp', import.meta.url).href;
export const FALSE_LIANA_HANG_URL = new URL('../assets/w1-678/w16-vinesnake-hang-brown.webp', import.meta.url).href;
export const FALSE_LIANA_SLIDE_URL = new URL('../assets/w1-678/w16-vinesnake-slide-brown.webp', import.meta.url).href;
/** the drawn sizes (px): the catalog's ship sizes, so the snake is a little longer than Pokey is tall and its tell head-high to his hands */
export const VINE_SNAKE_ART = { hang: { w: 110, h: 345, drawH: 115 }, hiss: { w: 187, h: 180, drawH: 60 }, slide: { w: 390, h: 188, drawH: 30 } } as const;

type Pose = 'hang' | 'hiss' | 'hang-brown' | 'slide-brown';
const imgs: Record<Pose, HTMLImageElement | null> = { hang: null, hiss: null, 'hang-brown': null, 'slide-brown': null };
const ready: Record<Pose, boolean> = { hang: false, hiss: false, 'hang-brown': false, 'slide-brown': false };
const URLS: Record<Pose, string> = { hang: VINE_SNAKE_HANG_URL, hiss: VINE_SNAKE_HISS_URL, 'hang-brown': FALSE_LIANA_HANG_URL, 'slide-brown': FALSE_LIANA_SLIDE_URL };
/** every picture the vine snakes draw (stagePreload.ts decodes them with the stage) */
export const VINE_SNAKE_URLS: readonly string[] = Object.values(URLS);

function load(k: Pose) {
  if (imgs[k] || typeof Image === 'undefined') return;
  const im = new Image();
  imgs[k] = im;
  trackAtlas(im, URLS[k], () => { ready[k] = true; }, () => { imgs[k] = null; }, () => { imgs[k] = null; ready[k] = false; });
}

/** start loading every pose; true once all are ready to draw */
export function vineSnakeArtReady(): boolean {
  const all = Object.keys(URLS) as Pose[];
  for (const k of all) load(k);
  return all.every((k) => ready[k] && !!imgs[k]);
}

/** a pose's picture, or null until it has loaded */
export function vineSnakeImg(k: Pose): HTMLImageElement | null {
  load(k);
  return ready[k] ? imgs[k] : null;
}
