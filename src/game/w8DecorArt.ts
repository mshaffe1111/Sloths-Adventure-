/**
 * w8DecorArt — World 8's set dressing (gen2/worlds/w8.ts: the 'fungus' and 'nest' scenery sockets and the four W8_DECOR sets, in
 * proto.gen2.w8.scenery and .decor), drawn behind the boughs. Until 2026-10-31 the generator laid all of it and nothing painted it (the
 * unused-art audit; Matt: "We need to use all the art we create").
 *
 * The pieces come from Matt's World 8 sheets: w8b (shelf fungus, knot perch, branch fork, rope bridge, leaf hammock), w8c and its second
 * painting w8c-b (bark fungus, night flowers, firefly leaf, bird nest: one or the other by place, so a stage shows both), w8var (the
 * stump, the trunk with its leafy branch, the high bough) and the World 8 kit (the twisted vine, the mossy post). Standing pieces stand on
 * the bank they were laid on, their foot a little under its top so its lip covers the cut; hanging pieces hang in the canopy above it.
 * And at a bank's end over a gap, one of the two buttress corners (the kit's and w8var's) stands behind the bank, so only its mossy branch
 * reaches out over the drop. Pictures only: nothing here is solid.
 *
 * drawW8Decor draws nothing of a sheet until it has loaded.
 */
import { trackAtlas } from './atlasLoader.ts';
import type { AnimFrame } from './creatureAnim.ts';
import { KIT_FRAMES } from './kitAtlasData.ts';
import { kitUrl } from './protoArt.ts';
import type { Platform } from './types.ts';
import { W8B, W8B_URL, W8C_A, W8C_A_URL, W8C_B, W8C_B_URL, W8VAR, W8VAR_URL } from './w8DecorData.ts';

type Sheet = 'w8b' | 'w8c' | 'w8cb' | 'w8var' | 'kit';
const URLS: Record<Sheet, () => string> = { w8b: () => W8B_URL, w8c: () => W8C_A_URL, w8cb: () => W8C_B_URL, w8var: () => W8VAR_URL, kit: () => kitUrl(8) };
const imgs = new Map<Sheet, HTMLImageElement>();
const ready = new Set<Sheet>();
function load(s: Sheet) {
  if (imgs.has(s) || typeof Image === 'undefined') return;
  const im = new Image();
  imgs.set(s, im);
  trackAtlas(
    im,
    URLS[s](),
    () => ready.add(s),
    () => imgs.delete(s),
    () => {
      imgs.delete(s);
      ready.delete(s);
    },
  );
}
/** start loading the sheets (the stage's preload calls it for World 8; a draw before then starts it too) */
export function loadW8Decor(): void {
  for (const s of Object.keys(URLS) as Sheet[]) load(s);
}

/** a kit frame as an anchored one (the middle of its foot) */
const kit = (n: string): AnimFrame | undefined => {
  const f = KIT_FRAMES[8]?.[n as keyof (typeof KIT_FRAMES)[8]];
  return f ? { x: f.x, y: f.y, w: f.w, h: f.h, ax: f.w / 2, ay: f.h } : undefined;
};

const hash01 = (x: number, salt: number): number => {
  const s = Math.sin(x * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

/** the sheet and frame a piece's name is drawn from; w8c's pieces from w8c or its second painting w8c-b, by where it stands */
function frameFor(n: string, x: number): { s: Sheet; f: AnimFrame } | null {
  // (the shelf fungus is painted on a strip of bright trunk at its left: on a bank top that read as a stray blue post, so the trunk is cut
  // off and the mossy shelf and its mushroom stand on the bank)
  if (n === 'shelf-fungus') {
    const f = W8B[n];
    // (and only its top 150 px, the shelf and its mushroom: under them the frame is trunk, so the shelf floated over the bank and read
    // as a bough to stand on; cut to the shelf it lies on the bank like a mossy log, its foot sunk under the lip)
    const cut = f.ax + 10;
    return { s: 'w8b', f: { ...f, x: f.x + cut, w: f.w - cut, h: 150, ax: (f.w - cut) / 2, ay: 150 } };
  }
  if (W8B[n]) return { s: 'w8b', f: W8B[n] };
  if (W8C_A[n]) return hash01(x, 21) < 0.5 ? { s: 'w8c', f: W8C_A[n] } : { s: 'w8cb', f: W8C_B[n] ?? W8C_A[n] };
  if (W8VAR[n]) return { s: 'w8var', f: W8VAR[n] };
  // (the kit's own: its twisted liana, its mossy post)
  const k = n === 'twist-vine' ? kit('liana') : n === 'mossy-post' ? kit('bankEnd') : undefined;
  return k ? { s: 'kit', f: k } : null;
}

/** pieces that hang in the canopy over the bank they were laid on, and how far above its top their top hangs (px) */
const HANG: Record<string, number> = { 'rope-bridge': 380, 'leaf-hammock': 340, 'twist-vine': 470, 'branch-b': 420 };
/** how much a hanging piece shows (the canopy's depth) */
const HANG_ALPHA = 0.45;
/** how far under the bank's top a standing piece's foot goes (the bank's lip covers the cut) */
const SINK = 8;
/** the buttress corners at a bank's end: how much of the picture's width stands behind the bank (the rest, its branch, reaches out) */
const BUTTRESS = { inside: 0.5, w: 230, rise: 0.3 } as const;

export interface W8DecorSet {
  scenery?: ReadonlyArray<{ n: string; x: number; b: number; w: number; flip?: boolean }>;
  decor?: ReadonlyArray<{ n: string; x: number; b: number; w: number; flip?: boolean }>;
}

function piece(ctx: CanvasRenderingContext2D, img: HTMLImageElement, f: AnimFrame, x: number, foot: number, w: number, flip: boolean) {
  const k = w / f.w;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(foot));
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, f.x, f.y, f.w, f.h, -f.ax * k, -f.ay * k, f.w * k, f.h * k);
  ctx.restore();
}

/** World 8's dressing between x0 and x1 (behind the boughs): its laid pieces, and the buttress corners at the ends of its banks over a gap */
export function drawW8Decor(ctx: CanvasRenderingContext2D, set: W8DecorSet, platforms: readonly Platform[], view: { x0: number; x1: number }): void {
  loadW8Decor();
  for (const list of [set.decor, set.scenery]) {
    for (const d of list ?? []) {
      if (d.x + d.w < view.x0 - 60 || d.x - d.w > view.x1 + 60) continue;
      const fr = frameFor(d.n, d.x);
      if (!fr || !ready.has(fr.s)) continue;
      const img = imgs.get(fr.s)!;
      const hang = HANG[d.n];
      if (hang !== undefined) {
        // (hung by its top: the foot it is drawn by is its height under the hanging point)
        // (dimmed: far back in the canopy, so a bridge or a bough up there never reads as one he could reach)
        const h = (d.w * fr.f.h) / fr.f.w;
        const top = d.b - hang - Math.round(60 * hash01(d.x, 22));
        // (and never beside a raised bough he can reach: a bridge hung next to 8-1's loft read as the way on)
        if (platforms.some((q) => q.y < d.b - 60 && q.x < d.x + d.w / 2 + 160 && q.x + q.width > d.x - d.w / 2 - 160 && q.y > top - 160 && q.y < top + h + 200)) continue;
        ctx.globalAlpha = HANG_ALPHA;
        piece(ctx, img, fr.f, d.x, top + h, d.w, !!d.flip);
        ctx.globalAlpha = 1;
      } else piece(ctx, img, fr.f, d.x, d.b + SINK + (d.n === 'shelf-fungus' ? 14 : 0), d.w, !!d.flip);
    }
  }
  // the buttress corners: a bank (a tall piece) whose end has no ground on at its height, every other one, from the two paintings
  if (!ready.has('kit') && !ready.has('w8var')) return;
  for (const p of platforms) {
    if (p.height < 50 || p.type !== 'solid' || p.x > view.x1 + 200 || p.x + p.width < view.x0 - 200) continue;
    for (const side of [1, -1] as const) {
      const ex = side > 0 ? p.x + p.width : p.x;
      if (hash01(ex, 23) < 0.45 || p.width < 180) continue;
      const open = !platforms.some((q) => q !== p && Math.abs(q.y - p.y) < 40 && (side > 0 ? q.x <= ex + 30 && q.x + q.width > ex : q.x + q.width >= ex - 30 && q.x < ex));
      if (!open) continue;
      const useKit = hash01(ex, 24) < 0.5 ? ready.has('kit') : !ready.has('w8var');
      const f = useKit ? kit('buttress') : W8VAR['buttress-b'];
      if (!f) continue;
      const img = imgs.get(useKit ? 'kit' : 'w8var')!;
      const w = BUTTRESS.w;
      const h = (w * f.h) / f.w;
      // (its block behind the bank's end, its branch out over the gap; its top a little over the bank's top)
      const cx = ex - side * (w * BUTTRESS.inside - w / 2);
      piece(ctx, img, { ...f, ax: f.w / 2, ay: f.h }, cx, p.y - BUTTRESS.rise * h + h, w, side < 0);
    }
  }
}

/**
 * 8-5's second bounce plant (and 8-9's moon flowers): the bouncy leaf of Matt's w8b sheet, a broad springy leaf on a stalk, standing for
 * every other moon flower so a run of them is not one plant repeated (bounceArt.ts drawBounce asks it for World 8's odd platforms).
 * Its leaf's top on the platform's top (the collision line), squashing a little about its rim as the flower's cap does; 'plant' draws the
 * stalk down from under the leaf to bottomY (darkening as it goes), 'cap' the leaf again over the painted ground. False until w8b loads.
 */
const LEAF = { top: 140, rim: 200, pole: { x: 177, y: 216, w: 26 }, span: 1.2 } as const;
export function drawW8BounceLeaf(ctx: CanvasRenderingContext2D, p: Platform, time: number, part: 'plant' | 'cap', bottomY: number): boolean {
  loadW8Decor();
  if (!ready.has('w8b')) return false;
  const img = imgs.get('w8b')!;
  const f = W8B['bouncy-leaf'];
  const k = (p.width * LEAF.span) / f.w;
  const cx = p.x + p.width / 2;
  const x0 = cx - (f.w * k) / 2;
  const y0 = p.y - LEAF.top * k;
  if (part === 'plant') {
    // the stalk: the frame's own, then its last stretch drawn on down, fading into the dark
    const sx = x0 + LEAF.pole.x * k;
    const top = y0 + LEAF.pole.y * k;
    const end = Math.min(bottomY, top + 700);
    if (end > top) {
      ctx.drawImage(img, f.x + LEAF.pole.x, f.y + LEAF.pole.y, LEAF.pole.w, f.h - LEAF.pole.y, sx, top, LEAF.pole.w * k, end - top);
      const g = ctx.createLinearGradient(0, top, 0, end);
      g.addColorStop(0, 'rgba(8,10,14,0)');
      g.addColorStop(1, 'rgba(8,10,14,0.7)');
      ctx.fillStyle = g;
      ctx.fillRect(sx, top, LEAF.pole.w * k, end - top);
    }
  }
  // the leaf (the frame down to its rim), squashing about the rim
  const rimY = y0 + LEAF.rim * k;
  const squash = 1 + Math.sin(time * 3 + p.id) * 0.05;
  ctx.save();
  ctx.translate(cx, rimY);
  ctx.scale(p.id % 4 === 1 ? -1 : 1, squash);
  ctx.translate(-cx, -rimY);
  ctx.drawImage(img, f.x, f.y, f.w, LEAF.pole.y, x0, y0, f.w * k, LEAF.pole.y * k);
  ctx.restore();
  return true;
}
