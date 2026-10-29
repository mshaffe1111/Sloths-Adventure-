/**
 * World 10's swings, drawn in the world's own painted pieces (gen2/worlds/w10Swing.ts: each liana's `hangLook`). Every swing hangs from a
 * stretch of the iron netting overhead (the World 10 kit's grate, kits/w10.webp 'branch', held up by two chains running off the top of the
 * screen, so nothing floats), and is one of:
 *   chain   the kit's own chain (its 'liana': a ring, links, a hook), the links laid one after another at their painted size, never stretched
 *   cage    the chain with a hanging cage under its hook (props-made/w10alt 'cage-b' or gemini/w10c 'cage', by the vine), under his feet
 *   rope    the twisted rope of the shimmy kit (props/rope-kit.webp, World 2's painted rope cut to tile), a hook tied on at its end
 *   banner  a torn war banner on its ring (w10/swing-banners.webp: Hugging Face, from the world's own banner, 2026-10-29); its cloth
 *           stretches only in its plain middle, the ring and the torn end keep their painted size
 * The swing itself is the engine's (physics.ts): the look turns with the vine about its anchor. Until a sheet has loaded the caller draws
 * the kit's chain (protoArt.ts drawSwingLianaArt).
 */
import { KIT_FRAMES } from './kitAtlasData.ts';
import { ROPE_KIT } from './ropeKitData.ts';
import { W10_BANNERS } from './w10SwingArtData.ts';

const URL_OF = {
  kit: new URL('../assets/kits/w10.webp', import.meta.url).href,
  alt: new URL('../assets/w6to10/props-made/w10alt.webp', import.meta.url).href,
  dress: new URL('../assets/w6to10/gemini/w10c-set-dressing.webp', import.meta.url).href,
  rope: new URL('../assets/props/rope-kit.webp', import.meta.url).href,
  banner: new URL('../assets/w10/swing-banners.webp', import.meta.url).href,
} as const;
type Sheet = keyof typeof URL_OF;
const imgs = new Map<Sheet, HTMLImageElement>();
const ready = new Set<Sheet>();
function sheet(n: Sheet): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!imgs.has(n)) {
    const im = new Image();
    im.onload = () => ready.add(n);
    im.src = URL_OF[n];
    imgs.set(n, im);
  }
  return ready.has(n) ? imgs.get(n)! : null;
}
/** start loading every sheet (a World 10 stage with swings, as it starts) */
export function loadW10SwingArt(): void {
  for (const n of Object.keys(URL_OF) as Sheet[]) sheet(n);
}

/** the cages, where they sit in their sheets (props-made/w10alt.json 'cage-b', gemini/w10c-set-dressing.json 'cage'), and the middle of
 *  the top ring each hangs from (ax: the cage's own body, its open door to the right) */
const CAGES = [
  { sheet: 'alt' as const, x: 864, y: 0, w: 405, h: 419, ax: 144 },
  { sheet: 'dress' as const, x: 517, y: 0, w: 247, h: 249, ax: 87 },
];

/** the kit's chain: its picture, the ring (rows 0-RING), two links that tile pinch to pinch (LINK), the hook (rows HOOK on) */
const CHAIN = KIT_FRAMES[10].liana;
const RING = 92;
const LINK = { y0: 160, y1: 300 };
const HOOK = 440;
/** the chain's links' middle across its picture, and how wide it is drawn (world px: the painted links about 26 px) */
const CHAIN_AX = 44;
const CHAIN_K = 0.6;
/** the netting's grate (the kit's 'branch': an iron grate), how wide it is drawn over a swing */
const GRATE = KIT_FRAMES[10].branch;

/** a chain hanging straight down from (x, y) for `len` px (links only), in the current transform */
function links(ctx: CanvasRenderingContext2D, kit: HTMLImageElement, x: number, y: number, len: number) {
  const th = (LINK.y1 - LINK.y0) * CHAIN_K;
  const w = CHAIN.w * CHAIN_K;
  for (let d = 0; d < len; d += th) {
    const h = Math.min(th, len - d);
    ctx.drawImage(kit, CHAIN.x, CHAIN.y + LINK.y0, CHAIN.w, h / CHAIN_K, x - CHAIN_AX * CHAIN_K, y + d, w, h + 0.5);
  }
}

/** the stretch of iron netting a swing hangs from, held up by two chains off the top of the screen (static: it does not swing) */
function netting(ctx: CanvasRenderingContext2D, kit: HTMLImageElement, v: { x: number; topY: number; id: number }) {
  const gw = 200 + (Math.abs(v.id) % 3) * 30;
  const gh = (gw * GRATE.h) / GRATE.w;
  const top = v.topY - gh + 12;
  for (const s of [-1, 1]) links(ctx, kit, v.x + s * (gw / 2 - 18), top - 900, 900 + gh * 0.4);
  ctx.save();
  if (v.id % 2) {
    ctx.translate(v.x, 0);
    ctx.scale(-1, 1);
    ctx.translate(-v.x, 0);
  }
  ctx.drawImage(kit, GRATE.x, GRATE.y, GRATE.w, GRATE.h, v.x - gw / 2, top, gw, gh);
  ctx.restore();
}

/** the hook at the end of a chain or rope, its eye at (0, y) */
function hook(ctx: CanvasRenderingContext2D, kit: HTMLImageElement, y: number) {
  const h = (CHAIN.h - HOOK) * CHAIN_K;
  ctx.drawImage(kit, CHAIN.x, CHAIN.y + HOOK, CHAIN.w, CHAIN.h - HOOK, -CHAIN_AX * CHAIN_K, y - 4, CHAIN.w * CHAIN_K, h);
  return h;
}

/**
 * A World 10 swing, its look `v.hangLook`, at angle `ang` about its anchor (the engine's swing). False until its sheets have loaded.
 */
export function drawW10Liana(ctx: CanvasRenderingContext2D, v: { x: number; topY: number; bottomY: number; id: number; hangLook?: string }, ang: number, t = 0): boolean {
  const kit = sheet('kit');
  if (!kit) return false;
  const look = v.hangLook ?? 'chain';
  const need: Sheet | null = look === 'cage' ? CAGES[Math.abs(v.id) % 2].sheet : look === 'rope' ? 'rope' : look === 'banner' ? 'banner' : null;
  const img2 = need ? sheet(need) : null;
  if (need && !img2) return false;
  netting(ctx, kit, v);
  const len = v.bottomY - v.topY;
  ctx.save();
  ctx.translate(v.x, v.topY);
  ctx.rotate(-ang);
  if (look === 'banner') {
    const b = W10_BANNERS[Math.abs(v.id) % W10_BANNERS.length];
    // (the cloth runs on past where he can hold it, its torn end under his feet; a slow ripple in the storm wind)
    const w = 110;
    const k = w / b.w;
    const capT = b.capT * k, capB = (b.h - b.capB) * k;
    const total = len + 70;
    const mid = Math.max(10, total - capT - capB);
    const ripple = 1 + Math.sin(t * 2.3 + v.id) * 0.04;
    ctx.drawImage(img2!, b.x, b.y, b.w, b.capT, -b.ax * k, -b.ring * k, w, capT + 1);
    ctx.drawImage(img2!, b.x, b.y + b.capT, b.w, b.capB - b.capT, -b.ax * k * ripple, -b.ring * k + capT, w * ripple, mid + 1);
    ctx.drawImage(img2!, b.x, b.y + b.capB, b.w, b.h - b.capB, -b.ax * k * ripple, -b.ring * k + capT + mid, w * ripple, capB);
  } else if (look === 'rope') {
    // (the rope tile lies left to right in its sheet: turned a quarter, it runs down)
    const T = ROPE_KIT.tile;
    const k = 15 / T.thick;
    const tl = T.w * k;
    ctx.save();
    ctx.rotate(Math.PI / 2);
    for (let d = 0; d < len; d += tl) {
      const l = Math.min(tl, len - d);
      ctx.drawImage(img2!, T.x, T.y, l / k, T.h, d, -T.mid * k, l + 0.5, T.h * k);
    }
    ctx.restore();
    hook(ctx, kit, len);
  } else {
    // the chain: the ring at the anchor, links down to the hook
    ctx.drawImage(kit, CHAIN.x, CHAIN.y, CHAIN.w, RING, -CHAIN_AX * CHAIN_K, -RING * CHAIN_K * 0.6, CHAIN.w * CHAIN_K, RING * CHAIN_K);
    links(ctx, kit, 0, RING * CHAIN_K * 0.35, len - RING * CHAIN_K * 0.35);
    const hh = hook(ctx, kit, len);
    if (look === 'cage') {
      // (a cage on the hook, under his feet: it hangs from its top ring, swinging with the chain)
      const c = CAGES[Math.abs(v.id) % 2];
      const ch = 150;
      const cw = (c.w * ch) / c.h;
      ctx.drawImage(img2!, c.x, c.y, c.w, c.h, -(c.ax * ch) / c.h, len + hh * 0.75, cw, ch);
    }
  }
  ctx.restore();
  return true;
}
