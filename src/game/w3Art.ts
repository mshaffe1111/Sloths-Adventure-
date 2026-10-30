/**
 * w3Art — Matt's World 3 sheets (2026-10-24): the grotto pieces (glowworm threads lit and asleep, a stalactite, stalagmites, glowing
 * mushrooms, the grotto mouth) and the ferns and hiding places (a fern still and rustling, a curtain of moss, a hollow log, a giant
 * pawprint pressed in the mud, a boulder with claw marks).
 *
 * The dressing of the World 3 stages (protoStage.ts) is a list of W3Decor. Standing pieces sit with their bottom on `b`; hanging pieces
 * (`hang`) hang with their top at `b`. A glowworm thread names the light it belongs to (`light`), and is drawn asleep until that light
 * wakes (the engine's glowworms, engine.ts), then lit. Every draw does nothing until the atlas has loaded.
 */
import { trackAtlas } from './atlasLoader.ts';
import { W3_FRAMES } from './w3PropsData.ts';
import { drawKitArt, kitArtReady, kitSize } from './puzzleArt.ts';
import { FONT_UI } from './fonts.ts';

export type W3Piece = keyof typeof W3_FRAMES;

export interface W3Decor {
  n: W3Piece;
  x: number;
  /** the bottom of a standing piece, the top of a hanging one */
  b: number;
  w: number;
  flip?: boolean;
  front?: boolean;
  hang?: boolean;
  /** a glowworm thread: the id of its light (asleep until the light wakes) */
  light?: number;
  /** drawn only while the platform with this id stands (or, with `whenBroken`, once it has broken): 3-9's ring wall */
  wall?: number;
  whenBroken?: boolean;
  /**
   * a fern that rustles on its own every few seconds, as a fern hiding one of Grandma's things does (3-7's "Which fern?": the empty ferns
   * rustle too, so rustling tells nothing there): the number sets its beat
   */
  rustle?: number;
  /**
   * a fern painted as one of Matt's World 3 puzzle ferns instead of the grotto's own (3-7's "Which fern?": the three ferns of a hollow are
   * all one kind, rolled with the stage, artDress.ts; the puzzle kit's sheet)
   */
  kit?: 'fern1' | 'fern3';
}

/** the sheet's address (stagePreload.ts decodes it before a World 3 stage starts) */
export const W3_PROPS_URL = new URL('../assets/props/w3-props.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, W3_PROPS_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}
/** whether the World 3 pieces have loaded (starts the load) */
export function w3ArtReady(): boolean {
  load();
  return ready && !!img;
}

/** a piece's drawn height at width w */
export function w3Height(n: W3Piece, w: number): number {
  const f = W3_FRAMES[n];
  return (w * f.h) / f.w;
}

function blit(ctx: CanvasRenderingContext2D, n: W3Piece, x: number, y: number, w: number, h: number, flip = false) {
  const f = W3_FRAMES[n];
  if (!flip) {
    ctx.drawImage(img!, f.x, f.y, f.w, f.h, x, y, w, h);
    return;
  }
  ctx.save();
  ctx.translate(x + w, y);
  ctx.scale(-1, 1);
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, 0, 0, w, h);
  ctx.restore();
}

/**
 * The dressing on one layer (behind Pokey, or `front`) between x0 and x1. `lit(id)` says how awake a light is (0 asleep, 1 lit); the
 * glowworm threads cross-fade from asleep to lit with it, and sway a little.
 */
export function drawW3Decor(
  ctx: CanvasRenderingContext2D, items: W3Decor[], x0: number, x1: number, t: number, front: boolean, lit: (id: number) => number, broken: (id: number) => boolean = () => false,
) {
  if (!w3ArtReady()) return;
  for (const d of items) {
    if (!!d.front !== front) continue;
    if (d.wall !== undefined && broken(d.wall) !== !!d.whenBroken) continue;
    if (d.x + d.w < x0 - 60 || d.x - d.w > x1 + 60) continue;
    const h = w3Height(d.n, d.w);
    const left = d.x - d.w / 2;
    const top = d.hang ? d.b : d.b - h;
    if (d.light !== undefined) {
      const u = Math.max(0, Math.min(1, lit(d.light)));
      // the threads sway about the knot they hang from
      ctx.save();
      ctx.translate(d.x, d.b);
      ctx.rotate(Math.sin(t * 0.9 + d.x * 0.01) * 0.025);
      ctx.translate(-d.x, -d.b);
      if (u < 1) blit(ctx, 'glowDim', left, top, d.w, h, d.flip);
      if (u > 0) {
        ctx.globalAlpha = u;
        blit(ctx, 'glowLit', left, top, d.w, h, d.flip);
      }
      ctx.restore();
      continue;
    }
    if (d.n === 'fern' && d.rustle !== undefined) {
      drawW3Fern(ctx, { x: left, w: d.w, y: d.b - 6 }, false, thingTell(d.rustle, t), t, d.kit);
      continue;
    }
    blit(ctx, d.n, left, top, d.w, h, d.flip);
  }
}

/** how hard a fern that hides something rustles on its own right now (0..1): a quick shiver every five seconds or so, on its own beat */
const thingTell = (id: number, t: number) => Math.max(0, Math.sin(t * 1.25 + id * 2.3) - 0.8) / 0.2;

/** a fern to hide in (World 3's bushes): the still fern, or the rustling one while he moves inside it */
export function drawW3Fern(ctx: CanvasRenderingContext2D, b: { x: number; w: number; y: number }, inside: boolean, rustle: number, t: number, kit?: 'fern1' | 'fern3'): boolean {
  if (kit && kitArtReady()) {
    // Matt's puzzle fern: shaken on its own (it has no rustling painting), a shiver and a little bounce as its leaves move
    ctx.save();
    if (inside) ctx.globalAlpha = 0.62;
    ctx.translate(b.x + b.w / 2, b.y + 6);
    ctx.transform(1, 0, Math.sin(t * 22) * 0.09 * rustle, 1 + Math.sin(t * 31) * 0.03 * rustle, 0, 0);
    const sz = kitSize(kit);
    drawKitArt(ctx, kit, 0, 0, { w: b.w, h: (b.w * sz.h) / sz.w });
    ctx.restore();
    return true;
  }
  if (!w3ArtReady()) return false;
  const still = W3_FRAMES.fern;
  const h = (b.w * still.h) / still.w;
  ctx.save();
  if (inside) ctx.globalAlpha = 0.62;
  ctx.translate(b.x + b.w / 2, b.y + 6);
  ctx.transform(1, 0, Math.sin(t * 22) * 0.05 * rustle, 1, 0, 0);
  if (rustle > 0.3) {
    // the rustling fern is drawn at the same scale as the still one (its loose leaves stick up above it)
    const r = W3_FRAMES.fernRustle;
    const k = b.w / still.w;
    blit(ctx, 'fernRustle', (-r.w * k) / 2, -r.h * k, r.w * k, r.h * k);
  } else blit(ctx, 'fern', -b.w / 2, -h, b.w, h);
  ctx.restore();
  return true;
}

/** a World 3 fern's drawn height at width w */
export function w3FernHeight(w: number): number {
  return w3Height('fern', w);
}

/** how tall a glowworm is drawn (world px, hands to tail) and how long its thread is above its hands */
export const GLOWWORM_H = 74;
export const GLOWWORM_THREAD = 190;

/**
 * One of the grotto's glowworms (Matt's glowworm sheets), hanging by its hands from a thread at (x, hands). Asleep (eyes shut, dim,
 * breathing) until its light wakes; `age` is how long it has been awake (s, negative while asleep). Waking, it looks round and waves for a
 * moment, then hangs and sways, and now and then waves again.
 */
export function drawGlowworm(ctx: CanvasRenderingContext2D, x: number, hands: number, age: number, t: number, seed: number): boolean {
  if (!w3ArtReady()) return false;
  let n: W3Piece;
  if (age < 0) n = Math.floor(t / 1.3 + seed * 0.37) % 2 === 0 ? 'glowSleep0' : 'glowSleep1';
  else if (age < 0.35) n = 'glowHang0';
  else if (age < 2.6 || (t + seed * 1.7) % 7 < 1.1) n = (['glowWave0', 'glowWave1', 'glowWave2', 'glowWave3'] as const)[Math.floor(t * 8 + seed) % 4];
  else n = (['glowHang0', 'glowHang1', 'glowHang2', 'glowHang1'] as const)[Math.floor(t * 2.5 + seed) % 4];
  const f = W3_FRAMES[n];
  const h = GLOWWORM_H;
  const w = (h * f.w) / f.h;
  ctx.save();
  // the thread, up into the dark
  ctx.strokeStyle = age < 0 ? 'rgba(120, 170, 160, 0.35)' : 'rgba(160, 240, 225, 0.55)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x, hands - GLOWWORM_THREAD);
  ctx.lineTo(x + Math.sin(t * 0.8 + seed) * 3, hands + 2);
  ctx.stroke();
  ctx.translate(x, hands);
  ctx.rotate(Math.sin(t * 0.8 + seed) * 0.07);
  if (age < 0) ctx.globalAlpha = 0.85;
  const flip = seed % 2 === 1;
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, -w / 2, 0, w, h);
  ctx.restore();
  if (age < 0) {
    // a slow z or two
    const u = (t * 0.4 + seed * 0.21) % 1;
    ctx.save();
    ctx.globalAlpha = Math.sin(u * Math.PI) * 0.8;
    ctx.fillStyle = '#ccfbf1';
    ctx.font = `700 ${10 + u * 6}px ${FONT_UI}`;
    ctx.fillText('z', x + 14 + u * 10, hands + 12 - u * 22);
    ctx.restore();
  }
  return true;
}

/** the painted thorn vine's size in the world, and where in its frames the vine's top and the bud sit (fractions of the frame) */
const THORN_H = 270;
const THORN_TOP_X = 0.35;
const THORN_BUD_Y = 0.8;
/**
 * The painted thorn vine (Matt's sheet, 2026-10-25): asleep and breathing, then a yawn back to sleep after a look, one eye cracking open
 * as it stirs, both open and coiled while it looks, and the lash. The sheet's vine curls round to a bud that hangs to one side; the bud
 * is kept toward Pokey (the frames are mirrored for the other side), and the frames lash the way the lash goes. A long vine is a plain
 * painted stroke from the roof down to the top of the frame.
 */
function drawThornSprite(
  ctx: CanvasRenderingContext2D, v: { x: number; top: number; bud: number; sleep?: number }, phase: 'sleep' | 'stir' | 'look', u: number, lash: number, dir: number, t: number,
) {
  let i: number;
  if (lash >= 0) i = 8 + Math.min(3, Math.floor(lash * 4));
  else if (phase === 'look') i = Math.floor(t * 2.5 + v.x) % 5 === 0 ? 6 : 7;
  else if (phase === 'stir') i = 4 + Math.min(2, Math.floor(u * 3));
  else {
    const since = u * (v.sleep ?? 4);
    i = since < 1.2 ? 12 + Math.min(3, Math.floor(since / 0.3)) : Math.floor(t * 2.2 + v.x * 0.01) % 4;
  }
  const n = `thorn${i}` as W3Piece;
  const f = W3_FRAMES[n];
  const h = THORN_H;
  const w = (h * f.w) / f.h;
  const top = v.bud - 10 - THORN_BUD_Y * h;
  // the stretch of vine above the painting, from the roof
  if (top > v.top + 4) {
    const sway = Math.sin(t * 0.7 + v.x * 0.01) * 3;
    ctx.save();
    ctx.lineCap = 'round';
    for (const [col, lw] of [['#0f1f10', 26], ['#3a6a34', 18], ['rgba(150, 200, 120, 0.35)', 3]] as const) {
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(v.x, v.top);
      ctx.quadraticCurveTo(v.x + sway, (v.top + top) / 2, v.x, top + 12);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.save();
  ctx.translate(v.x, top);
  if (dir < 0) ctx.scale(-1, 1);
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, -THORN_TOP_X * w, 0, w, h);
  ctx.restore();
}

/**
 * A vine that struck at a noise (3-5's lure: the bell, a pebble's clack) has tied itself in a knot round where it struck: Matt's tangled
 * thorn vine, hanging from the roof, harmless (while it listens to the noise it sees nobody: thornVine.ts vineSees). In its last moments
 * it works itself loose (his loose thorn vine), then it hangs as before. `left`: seconds it still listens.
 */
function drawTangled(ctx: CanvasRenderingContext2D, v: { x: number; top: number; bud: number }, left: number, t: number): boolean {
  if (!kitArtReady()) return false;
  const loose = left < 0.6;
  const n = loose ? 'thornLoose' : 'thornTangle';
  const sz = kitSize(n, 1.9);
  const bottom = v.bud + 6;
  const top = bottom - sz.h * 0.8;
  ctx.save();
  ctx.lineCap = 'round';
  const sway = Math.sin(t * 0.7 + v.x * 0.01) * 2;
  for (const [col, lw] of [['#0f1f10', 22], ['#3a6a34', 15], ['rgba(150, 200, 120, 0.35)', 3]] as const) {
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(v.x, v.top);
    ctx.quadraticCurveTo(v.x + sway, (v.top + top) / 2, v.x, top + 10);
    ctx.stroke();
  }
  ctx.restore();
  drawKitArt(ctx, n, v.x, bottom, { scale: 1.9, rot: Math.sin(t * 1.3 + v.x) * 0.04 });
  return true;
}

/**
 * A sleeping thorn vine (thornVine.ts), drawn in shapes until Matt's sheet arrives: a thick twisted vine hanging from the roof, thorns
 * along it, and a drooping bud with eyes at its end. `phase` and `u` say what it is doing; `lash` (0..1, or -1) swings it out toward `dir`.
 */
export function drawThornVine(
  ctx: CanvasRenderingContext2D, v: { x: number; top: number; bud: number; sleep?: number }, phase: 'sleep' | 'stir' | 'look', u: number, lash: number, dir: number, t: number,
  knot = -1,
) {
  if (knot >= 0 && drawTangled(ctx, v, knot, t)) return;
  if (w3ArtReady()) {
    drawThornSprite(ctx, v, phase, u, lash, dir, t);
    return;
  }
  const len = v.bud - v.top;
  const sway = Math.sin(t * 0.7 + v.x * 0.01) * 0.03;
  const swing = lash >= 0 ? Math.sin(Math.min(1, lash) * Math.PI) * 0.95 * dir : 0;
  const tense = phase === 'look' ? 1 : phase === 'stir' ? u : 0;
  ctx.save();
  ctx.translate(v.x, v.top);
  ctx.rotate(-(sway + swing));
  // the vine: a twisted stroke, darker edge then the body
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const n = 8;
    for (let i = 1; i <= n; i++) {
      const y = (len * i) / n;
      const wob = Math.sin(i * 1.7 + v.x) * (6 - 3 * tense);
      ctx.lineTo(wob, y);
    }
  };
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#0f1f10';
  ctx.lineWidth = 22;
  path();
  ctx.stroke();
  ctx.strokeStyle = '#2f5a2a';
  ctx.lineWidth = 15;
  path();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(140, 190, 110, 0.5)';
  ctx.lineWidth = 2.5;
  path();
  ctx.stroke();
  // thorns, standing up as it wakes
  ctx.fillStyle = '#1a2a14';
  for (let i = 1; i < 11; i++) {
    const y = (len * i) / 11;
    const s = i % 2 ? 1 : -1;
    const wob = Math.sin((i * 8) / 11 * 1.7 + v.x) * 4;
    const out = 12 + 8 * tense;
    ctx.beginPath();
    ctx.moveTo(wob + s * 4, y - 5);
    ctx.lineTo(wob + s * (4 + out), y - 1 - 6 * tense);
    ctx.lineTo(wob + s * 4, y + 3);
    ctx.closePath();
    ctx.fill();
  }
  // a couple of leaves
  ctx.fillStyle = '#3f7a35';
  for (const [fy, s] of [[0.28, 1], [0.55, -1]] as const) {
    ctx.beginPath();
    ctx.ellipse(s * 12, len * fy, 10, 5, s * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  // the bud
  const bw = 25, bh = 33;
  ctx.fillStyle = '#0f1f10';
  ctx.beginPath();
  ctx.ellipse(0, len - bh * 0.4, bw + 2, bh + 2, 0, 0, Math.PI * 2);
  ctx.fill();
  const g = ctx.createLinearGradient(0, len - bh * 1.4, 0, len + bh * 0.6);
  g.addColorStop(0, '#2f5a2a');
  g.addColorStop(1, '#5b8f3d');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, len - bh * 0.4, bw, bh, 0, 0, Math.PI * 2);
  ctx.fill();
  // eyes: shut while it sleeps, one cracks open as it stirs, both open (and cross) while it looks
  const eye = (ex: number, open: number) => {
    const ey = len - bh * 0.35;
    if (open < 0.15) {
      ctx.strokeStyle = '#0f1f10';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ex, ey - 2, 6, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      return;
    }
    ctx.fillStyle = '#f7f3c4';
    ctx.beginPath();
    ctx.ellipse(ex, ey, 7.5, 7.5 * open, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a1d10';
    ctx.beginPath();
    ctx.arc(ex + dir * 2, ey + 0.5, 3.6 * Math.max(0.5, open), 0, Math.PI * 2);
    ctx.fill();
    if (phase === 'look') {
      // a cross brow
      ctx.strokeStyle = '#0f1f10';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ex - 8, ey - 11 + (ex < 0 ? -3 : 3));
      ctx.lineTo(ex + 8, ey - 11 + (ex < 0 ? 3 : -3));
      ctx.stroke();
    }
  };
  eye(-9, phase === 'sleep' ? 0 : phase === 'stir' ? Math.min(1, u * 2) * 0.6 : 0.85);
  eye(9, phase === 'look' ? 0.85 : phase === 'stir' ? Math.max(0, u * 2 - 1) * 0.6 : 0);
  ctx.restore();
  if (phase === 'sleep') {
    const zu = (t * 0.4 + v.x * 0.003) % 1;
    ctx.save();
    ctx.globalAlpha = Math.sin(zu * Math.PI) * 0.8;
    ctx.fillStyle = '#d9f99d';
    ctx.font = `700 ${11 + zu * 7}px ${FONT_UI}`;
    ctx.fillText('z', v.x + 16 + zu * 12, v.bud - 30 - zu * 26);
    ctx.restore();
  }
}

/**
 * A fern that hides one of Grandma's things (3-6, 3-7: a hidden relic), drawn with the origin 26 px above the ground it stands on (as
 * the finds are). It looks like every other fern, except that every few seconds it rustles on its own (something is in it), and harder
 * while he searches it. `decoy` ferns (3-7) rustle too, at their own beat, and hold nothing.
 */
export function drawThingFern(ctx: CanvasRenderingContext2D, item: { id: number; search?: number }, t: number, w = 150): boolean {
  if (!w3ArtReady()) return false;
  const search = item.search ?? 0;
  const rustle = Math.max(search > 0 ? 1 : 0, thingTell(item.id, t));
  drawW3Fern(ctx, { x: -w / 2, w, y: 26 - 6 }, false, rustle, t);
  return true;
}

/** one World 3 piece by name, centred on x with its bottom at y (false until the pieces have loaded) */
export function drawW3Piece(ctx: CanvasRenderingContext2D, n: W3Piece, x: number, bottom: number, w: number, alpha = 1): boolean {
  if (!w3ArtReady()) return false;
  const h = w3Height(n, w);
  ctx.save();
  ctx.globalAlpha *= alpha;
  blit(ctx, n, x - w / 2, bottom - h, w, h);
  ctx.restore();
  return true;
}
