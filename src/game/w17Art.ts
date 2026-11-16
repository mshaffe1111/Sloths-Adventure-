/**
 * World 1's moss cover, Spanish moss, dead snag and perched harpy (1-7, the hiding stage): ART-678b's cut pieces
 * (src/assets/w1-678/, catalog rows hf678/w17-*, reference/art/CATALOG-MASTER.csv), each its own file, drawn at Pokey's scale: a file
 * is three times its size in the game (the catalog's units: 89.1 = Pokey standing), so a moss patch stands 73 px (0.82 of him), a drape
 * hangs 140 px, a snag stands 300 px, the perched harpy 130 px.
 *
 *   drawMossCover   a hide of kind 'moss' (a carpet tiled along the ground it lies on), 'mossPatch' (a mound) or 'mossHang' (a drape
 *                   hanging from where it is tied), in front of Pokey like the bushes and thinning the same way as the moss comes over
 *                   him (protoArt.ts drawBushArt: a green Pokey behind green leaves was a ghost, ENG-E1)
 *   drawLianaMoss   the Spanish moss on a mossy liana (1-7 NEW 6: holding one is cover), hanging from the rope where its swing puts it
 *   drawSnag        the dead snag a perched eagle sits on (decor mid: behind him)
 *   drawPerchedEagle the harpy on its snag: looking ahead, turning its head (the warn), looking down (the gaze), blinking
 * Nothing is drawn until a piece has loaded (stagePreload.ts decodes them first: stageManifest.ts 'w17'); the engine draws its plain
 * stand-ins meanwhile. The pieces are code-free: no primitives drawn over them.
 */
import { trackAtlas } from './atlasLoader.ts';

const PIECES = {
  carpet: new URL('../assets/w1-678/w17-moss-carpet.webp', import.meta.url).href,
  patch: new URL('../assets/w1-678/w17-moss-patch.webp', import.meta.url).href,
  drape: new URL('../assets/w1-678/w17-moss-drape.webp', import.meta.url).href,
  drapeB: new URL('../assets/w1-678/w17-moss-drape-b.webp', import.meta.url).href,
  snagA: new URL('../assets/w1-678/w17-snag-a.webp', import.meta.url).href,
  snagB: new URL('../assets/w1-678/w17-snag-b.webp', import.meta.url).href,
  ahead: new URL('../assets/w1-678/w17-harpy-perchfeet-ahead.webp', import.meta.url).href,
  turn: new URL('../assets/w1-678/w17-harpy-perchfeet-turn.webp', import.meta.url).href,
  down: new URL('../assets/w1-678/w17-harpy-perchfeet-down.webp', import.meta.url).href,
  blink: new URL('../assets/w1-678/w17-harpy-perchfeet-blink.webp', import.meta.url).href,
} as const;
type Piece = keyof typeof PIECES;

/** every file, for the preload (stagePreload.ts 'w17') */
export const W17_URLS: readonly string[] = Object.values(PIECES);

/**
 * Each piece's file size and where it meets what it sits on (file px, measured on the cuts): `foot` the row that rests on the ground
 * (a carpet's moss line, a mound's base, a snag's root pad), `top` the row a drape hangs from (its twig), `grip` the harpy's feet on its
 * own branch. The game draws a file at a third of its size (SCALE).
 */
export const W17 = {
  carpet: { w: 519, h: 108, foot: 98 },
  patch: { w: 506, h: 219, foot: 214 },
  drape: { w: 520, h: 420, top: 34 },
  drapeB: { w: 235, h: 420, top: 34, moss: { x: 35, y: 52, w: 118, h: 368 } },
  snagA: { w: 316, h: 900, foot: 880, trunk: 120 },
  snagB: { w: 294, h: 900, foot: 880, trunk: 132, perch: 712 },
  perch: { w: 351, h: 390, grip: { x: 190, y: 338 } },
} as const;
/** game px per file px: the catalog's units (Pokey 89.1 drawn at 267 file px) */
export const SCALE = 1 / 3;

const img: Partial<Record<Piece, HTMLImageElement>> = {};
const ready: Partial<Record<Piece, boolean>> = {};
function get(p: Piece): HTMLImageElement | null {
  if (!img[p] && typeof Image !== 'undefined') {
    const im = new Image();
    img[p] = im;
    trackAtlas(im, PIECES[p], () => { ready[p] = true; }, () => { delete img[p]; }, () => { delete img[p]; ready[p] = false; });
  }
  return ready[p] ? img[p] ?? null : null;
}

/** start every piece loading (stagePreload.ts) */
export function w17Ready(): boolean {
  let all = true;
  for (const p of Object.keys(PIECES) as Piece[]) if (!get(p)) all = false;
  return all;
}

export type MossKind = 'moss' | 'mossPatch' | 'mossHang';
export const MOSS_KINDS: ReadonlySet<string> = new Set<MossKind>(['moss', 'mossPatch', 'mossHang']);

/** how tall a moss hide is drawn (game px) at its width */
export function mossHeight(b: { w: number; kind: MossKind }): number {
  if (b.kind === 'moss') return W17.carpet.h * SCALE;
  if (b.kind === 'mossPatch') return (b.w * W17.patch.h) / W17.patch.w;
  const d = b.w > 120 ? W17.drape : W17.drapeB;
  return (b.w * d.h) / d.w;
}

/**
 * How solid a moss hide is drawn: a mound or hanging moss over his body thins as the moss comes over him (as a bush does, protoArt.ts
 * drawBushArt), so the tint and the sloth both read; a carpet only covers his feet, so it never thins: thinned, the cover vanished
 * exactly when he was hidden in it (ENG-E2's still shots/carpet-pair.jpg).
 */
export function mossAlpha(kind: MossKind, inside: boolean, moss: number): number {
  return inside && kind !== 'moss' ? 0.62 - 0.2 * Math.max(0, Math.min(1, moss)) : 1;
}

/**
 * A moss hide, in front of him. `inside`: he is in it (drawn see-through, thinning as the moss tint comes over him, `moss` 0..1); `rustle`
 * leans it when he moves in it. False until its piece has loaded.
 *   - a carpet ('moss'): the strip tiled along its width at its own height (36 px), its moss line on the ground, each tile its own width
 *     stretched no more than the join needs (every other one mirrored, so the joins never show);
 *   - a patch: one mound, its base on the ground;
 *   - hanging moss: the drape (wide) or the curtain (narrow), its twig at `y` (where it is tied: a rope's line, a bough's underside).
 */
export function drawMossCover(ctx: CanvasRenderingContext2D, b: { x: number; w: number; y: number; kind: MossKind }, inside: boolean, rustle: number, t: number, moss = 0): boolean {
  const piece: Piece = b.kind === 'moss' ? 'carpet' : b.kind === 'mossPatch' ? 'patch' : b.w > 120 ? 'drape' : 'drapeB';
  const im = get(piece);
  if (!im) return false;
  ctx.save();
  ctx.globalAlpha = mossAlpha(b.kind, inside, moss);
  const lean = Math.sin(t * 22) * 0.05 * rustle;
  if (b.kind === 'moss') {
    const c = W17.carpet;
    const tw = c.w * SCALE;
    const n = Math.max(1, Math.round(b.w / tw));
    const w = b.w / n;
    const h = c.h * SCALE;
    const top = b.y + 4 - c.foot * SCALE;
    for (let i = 0; i < n; i++) {
      const x = b.x + i * w;
      if (i % 2) {
        ctx.save();
        ctx.translate(x + w, top);
        ctx.scale(-1, 1);
        ctx.drawImage(im, 0, 0, w, h);
        ctx.restore();
      } else ctx.drawImage(im, x, top, w, h);
    }
  } else if (b.kind === 'mossPatch') {
    const c = W17.patch;
    const k = b.w / c.w;
    ctx.translate(b.x + b.w / 2, b.y + 3);
    ctx.transform(1, 0, lean, 1, 0, 0);
    ctx.drawImage(im, -b.w / 2, -c.foot * k, b.w, c.h * k);
  } else {
    const c = piece === 'drape' ? W17.drape : W17.drapeB;
    const k = b.w / c.w;
    // (hanging: it sways from its twig, never leans off it)
    ctx.translate(b.x + b.w / 2, b.y);
    ctx.rotate(lean * 0.6);
    ctx.drawImage(im, -b.w / 2, -c.top * k, b.w, c.h * k);
  }
  ctx.restore();
  return true;
}

/** the moss clumps on a mossy liana: where along the rope (0 the top, 1 its foot) and how wide each hangs (game px) */
export const LIANA_MOSS: ReadonlyArray<{ u: number; w: number }> = [
  { u: 0.18, w: 30 },
  { u: 0.42, w: 38 },
  { u: 0.66, w: 34 },
];

/**
 * Spanish moss on a mossy liana, from the rope where its swing puts it (`angle`, its top at (x, top), `len` long): each clump the curtain
 * piece without its twig, hanging straight down under gravity (it swings a little behind the rope). False until loaded.
 */
export function drawLianaMoss(ctx: CanvasRenderingContext2D, v: { x: number; top: number; len: number; angle: number }, t: number): boolean {
  const im = get('drapeB');
  if (!im) return false;
  const m = W17.drapeB.moss;
  for (const c of LIANA_MOSS) {
    const px = v.x + Math.sin(v.angle) * v.len * c.u;
    const py = v.top + Math.cos(v.angle) * v.len * c.u;
    const h = (c.w * m.h) / m.w;
    ctx.save();
    ctx.translate(px, py - 4);
    ctx.rotate(-v.angle * 0.35 + Math.sin(t * 1.3 + c.u * 9) * 0.03);
    ctx.drawImage(im, m.x, m.y, m.w, m.h, -c.w / 2, 0, c.w, h);
    ctx.restore();
  }
  return true;
}

/** the snag a perched eagle sits on: its root pad's foot on the ground at `groundY`, its trunk at `x`. False until loaded */
export function drawSnag(ctx: CanvasRenderingContext2D, x: number, groundY: number, mirror: boolean): boolean {
  const im = get('snagB');
  if (!im) return false;
  const c = W17.snagB;
  const w = c.w * SCALE, h = c.h * SCALE;
  ctx.save();
  ctx.translate(x, groundY + 4 - c.foot * SCALE);
  if (mirror) ctx.scale(-1, 1);
  ctx.drawImage(im, -c.trunk * SCALE, 0, w, h);
  ctx.restore();
  return true;
}

/** how high over its ground the snag's perch branch is (game px), measured on the snag: sweepPose.ts SNAG_PERCH, the kit's copy
 *  (w17Art.test.ts holds the two together) */
export const SNAG_PERCH_DRAWN = (W17.snagB.foot - W17.snagB.perch) * SCALE;

export type PerchFrame = 'ahead' | 'turn' | 'down' | 'blink';

/** the harpy perched, its feet on (x, y) (its branch crossing the snag there), facing +1 right (the frames face right). False until loaded */
export function drawPerchedEagle(ctx: CanvasRenderingContext2D, x: number, y: number, frame: PerchFrame, facing: 1 | -1): boolean {
  const im = get(frame);
  if (!im) return false;
  const c = W17.perch;
  const w = im.naturalWidth || c.w;
  ctx.save();
  ctx.translate(x, y);
  if (facing < 0) ctx.scale(-1, 1);
  ctx.drawImage(im, -c.grip.x * SCALE, -c.grip.y * SCALE, w * SCALE, c.h * SCALE);
  ctx.restore();
  return true;
}
