/**
 * The face of a tower's soft pit, drawn (BUILD-26t, the lead's ruling 1, 11-24): the face under each lip's end (gen2/pipeline.ts layStage,
 * a sunken step has sides; a solid 24 px wide, lip top to the catch bough's underside) is a street's end resting on a post. Its platform is
 * marked art 'facePost', so neither the platform look nor the painted bank draws it (protoArt.ts bankPainted leaves any block 90 px or
 * taller to the painted soil, which drew it the colour of the tower's backdrop: a wall the player could not see, BUILD-26s).
 *
 * The picture is the inventory's rope-lashed post (w1-post-vine-wrapped, 'post / scaffold', a made thing, World 2 its best world: the
 * catalog's src/assets cut, shipped as src/assets/props/face-post.webp), drawn the face's own height in its own shape, its middle on the
 * face's middle: about 28 px wide at 94 tall, a post about Pokey's height under a street (R-165.107). It is drawn in the stage's 'back'
 * layer (engine.ts drawBack: over the earth, behind every ledge), so the lip's plank and the bough sit over its top and its foot.
 *
 * Every draw does nothing until the picture has loaded (stagePreload.ts decodes it before a stage that lays a face: stageSheets.ts
 * 'face-post'); nothing is ever drawn in its place. One drawImage per face in view (PERFORMANCE-RULES §1), no allocation a frame.
 */
import { trackAtlas } from './atlasLoader.ts';
import type { Platform } from './types.ts';

/** the picture's address (stagePreload.ts decodes it before a stage that asks for it starts) */
export const FACE_POST_URL = new URL('../assets/props/face-post.webp', import.meta.url).href;
/** the picture's own size (px; the cut as shipped) */
export const FACE_POST_PX = { w: 142, h: 469 } as const;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, FACE_POST_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}
/** whether the picture has loaded (starts the load) */
export function facePostReady(): boolean {
  load();
  return ready && !!img;
}

/** the post's drawn width over a face `h` tall (its picture's own shape) */
export const facePostWidth = (h: number): number => (h * FACE_POST_PX.w) / FACE_POST_PX.h;

/** each face in view drawn as its post, the face's own height, its middle on the face's middle */
export function drawFacePosts(ctx: CanvasRenderingContext2D, faces: readonly Platform[], view: { x0: number; x1: number; y0: number; y1: number }): void {
  if (!faces.length || !facePostReady()) return;
  for (const f of faces) {
    const w = facePostWidth(f.height);
    const left = f.x + f.width / 2 - w / 2;
    if (left > view.x1 || left + w < view.x0 || f.y > view.y1 || f.y + f.height < view.y0) continue;
    ctx.drawImage(img!, 0, 0, FACE_POST_PX.w, FACE_POST_PX.h, left, f.y, w, f.height);
  }
}
