import React, { useEffect, useRef } from 'react';
import { standardAtlas, warmStandardAtlas } from '../../game/heroStandard.ts';
import { STD_FRAMES } from '../../game/heroStandardData.ts';
import { MEECA_UNITS, drawMeecaFrame, jennifurSpriteReady } from '../../game/jennifurSprite.ts';
import { MEECA_FRAMES, MEECA_STAND_H } from '../../game/meecaStandardData.ts';
import { drawPaintedLeaf, warmLeaves } from '../../game/leafSprites.ts';
import { drawPaintedButterfly } from '../../game/butterflySprites.ts';
import { drawPlantAt, plantsPainted } from '../../game/plantSprites.ts';
import { PAIR_STEPS, pairPose, type PoseStep } from './titleActors.ts';

/**
 * The living title scene (Matt, 2026-10-28: "a highly polished start screen"): one canvas, drawn at the game's own 30 frames a second.
 *
 *   the painting   each world's far, middle and near strips (src/assets/backdrops), the far and middle ones slowly pushed in for depth,
 *                  every strip drifting at its own pace; the next world crossfades in over a few seconds while the push carries on
 *   the air        soft light shafts from the canopy and two bands of mist drifting at different depths, tinted by the world's own light
 *   the pair       Pokey and Meeca on Matt's painted mossy log (World 1's prop sheet), ferns at its ends, the near foliage behind it, soft
 *                  contact shadows, and the world's light graded over them (warm from above, the shade of the undergrowth at their feet,
 *                  a thin rim of light on the lit side), breathing, blinking, glancing at each other, Meeca's little bounce and wave
 *   the life       fireflies (brighter in the darker worlds), a couple of painted butterflies and a few falling painted leaves
 *
 * Nothing in it re-renders React. `arrive` starts the entrance: the painting fades up from the splash with a gentle settle, then the
 * two of them hop onto the log. With reduced motion asked for, the push and the drift are slower, and nothing flies or falls.
 */

let FILES: Record<string, string> = {};
try {
  FILES = import.meta.glob('../../assets/backdrops/w*-*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
} catch {
  FILES = {};
}
const stripUrl = (w: number, p: 'far' | 'mid' | 'near') => FILES[`../../assets/backdrops/w${w}-${p}.webp`] ?? null;
export const TITLE_LOG_URL = new URL('../../assets/title/log.webp', import.meta.url).href;
/** where the log's top (the moss they stand on) is, as a share of the painting's height, and where each of them stands along it */
const LOG_TOP = 0.165;
const POKEY_AT = 0.31;
const MEECA_AT = 0.7;

interface Palette {
  /** the world's light (its sky), the shade of its undergrowth, and how dark the world is overall (0 bright .. 1 dark) */
  light: [number, number, number];
  shade: [number, number, number];
  dark: number;
}
interface World {
  far: HTMLImageElement | null;
  mid: HTMLImageElement | null;
  near: HTMLImageElement | null;
  ready: boolean;
  pal: Palette;
  /** the near strip's ground line (the first row that is solid across most of it), as a share of its height */
  ground: number;
  beam: HTMLCanvasElement | null;
  mist: HTMLCanvasElement | null;
}

const DEFAULT_PAL: Palette = { light: [255, 226, 160], shade: [22, 44, 28], dark: 0.4 };

function avg(data: Uint8ClampedArray, from: number, to: number): [number, number, number, number] {
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = from; i < to; i += 4) {
    const a = data[i + 3];
    if (a < 128) continue;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    n++;
  }
  return n ? [r / n, g / n, b / n, n] : [0, 0, 0, 0];
}

/** the world's light and shade, read off its own painting (a few pixels of each strip), so every biome lights the pair its own way */
function readPalette(w: World): Palette {
  try {
    const cv = document.createElement('canvas');
    cv.width = 24;
    cv.height = 12;
    const c = cv.getContext('2d', { willReadFrequently: true });
    if (!c || !w.far) return DEFAULT_PAL;
    c.drawImage(w.far, 0, 0, 24, 12);
    const far = c.getImageData(0, 0, 24, 12).data;
    const sky = avg(far, 0, 24 * 4 * 3);
    const all = avg(far, 0, far.length);
    let shade: [number, number, number] = [all[0] * 0.35, all[1] * 0.4, all[2] * 0.35];
    if (w.near) {
      c.clearRect(0, 0, 24, 12);
      c.drawImage(w.near, 0, 0, 24, 12);
      const nd = c.getImageData(0, 0, 24, 12).data;
      const low = avg(nd, 24 * 4 * 8, nd.length);
      if (low[3]) shade = [low[0] * 0.55, low[1] * 0.55, low[2] * 0.55];
    }
    const lum = (0.3 * all[0] + 0.59 * all[1] + 0.11 * all[2]) / 255;
    // the light is the sky, pushed warm and bright so it reads as light and not as a colour wash
    const light: [number, number, number] = [Math.min(255, sky[0] * 0.7 + 90), Math.min(255, sky[1] * 0.7 + 74), Math.min(255, sky[2] * 0.6 + 50)];
    return { light, shade, dark: Math.max(0, Math.min(1, 1 - lum * 1.4)) };
  } catch {
    return DEFAULT_PAL;
  }
}

/** the row where the near strip turns solid ground (most of its width painted), as a share of its height */
function readGround(im: HTMLImageElement): number {
  try {
    const W = 64, H = 64;
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const c = cv.getContext('2d', { willReadFrequently: true });
    if (!c) return 0.78;
    c.drawImage(im, 0, 0, W, H);
    const d = c.getImageData(0, 0, W, H).data;
    for (let y = 0; y < H; y++) {
      let n = 0;
      for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 160) n++;
      if (n > W * 0.82) return y / H;
    }
  } catch {
    /* fall through */
  }
  return 0.78;
}

const rgba = (c: [number, number, number], a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mix = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** a soft shaft of light, in the world's light: brightest at the top, fading out down its length, soft at both edges */
function makeBeam(light: [number, number, number]): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = 96;
  cv.height = 384;
  const c = cv.getContext('2d')!;
  const across = c.createLinearGradient(0, 0, 96, 0);
  across.addColorStop(0, rgba(light, 0));
  across.addColorStop(0.5, rgba(light, 1));
  across.addColorStop(1, rgba(light, 0));
  c.fillStyle = across;
  c.fillRect(0, 0, 96, 384);
  c.globalCompositeOperation = 'destination-in';
  // (feathered at the top as well, so a tilted shaft never shows the straight end of its picture)
  const down = c.createLinearGradient(0, 0, 0, 384);
  down.addColorStop(0, 'rgba(0,0,0,0)');
  down.addColorStop(0.14, 'rgba(0,0,0,.9)');
  down.addColorStop(0.55, 'rgba(0,0,0,.35)');
  down.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = down;
  c.fillRect(0, 0, 96, 384);
  return cv;
}

/** a long band of mist: soft overlapping puffs, its ends faded so it tiles */
function makeMist(light: [number, number, number]): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = 768;
  cv.height = 128;
  const c = cv.getContext('2d')!;
  const tint = mix(light, [235, 240, 236], 0.55);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 26; i++) {
    const x = rnd() * 768, y = 64 + (rnd() - 0.5) * 24, r = 36 + rnd() * 50;
    for (const dx of [-768, 0, 768]) {
      const g = c.createRadialGradient(x + dx, y, 0, x + dx, y, r);
      g.addColorStop(0, rgba(tint, 0.34));
      g.addColorStop(1, rgba(tint, 0));
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(x + dx, y, r * 1.8, r * 0.55, 0, 0, Math.PI * 2);
      c.fill();
    }
  }
  // feathered top and bottom: the band has no edge anywhere, only a soft middle
  c.globalCompositeOperation = 'destination-in';
  const fade = c.createLinearGradient(0, 0, 0, 128);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(0.4, 'rgba(0,0,0,1)');
  fade.addColorStop(0.62, 'rgba(0,0,0,1)');
  fade.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = fade;
  c.fillRect(0, 0, 768, 128);
  return cv;
}

function loadWorld(n: number): World {
  const w: World = { far: null, mid: null, near: null, ready: false, pal: DEFAULT_PAL, ground: 0.78, beam: null, mist: null };
  const parts = (['far', 'mid', 'near'] as const).filter((p) => stripUrl(n, p));
  let left = parts.length;
  for (const p of parts) {
    const im = new Image();
    im.decoding = 'async';
    im.onload = im.onerror = () => {
      if (im.naturalWidth) w[p] = im;
      if (--left === 0 && w.far) {
        const finish = () => {
          w.pal = readPalette(w);
          if (w.near) w.ground = readGround(w.near);
          w.beam = makeBeam(w.pal.light);
          w.mist = makeMist(w.pal.light);
          w.ready = true;
        };
        // decoded before it is first drawn, so the first frame with it is not a decode
        Promise.all([w.far, w.mid, w.near].filter(Boolean).map((i) => (i as HTMLImageElement).decode?.().catch(() => {}))).then(finish, finish);
      }
    };
    im.src = stripUrl(n, p)!;
  }
  return w;
}

/** the worlds kept decoded: the one on show, the one coming next, and the first one (the title always opens on it) */
const WORLD_CACHE = new Map<number, World>();

let logImg: HTMLImageElement | null = null;
let logReady = false;
function loadLog() {
  if (logImg || typeof Image === 'undefined') return;
  const im = new Image();
  logImg = im;
  im.onload = () => {
    void im.decode?.().catch(() => {}).finally(() => (logReady = true));
    if (!im.decode) logReady = true;
  };
  im.onerror = () => (logReady = true);
  im.src = TITLE_LOG_URL;
}

/**
 * One frame of Pokey or Meeca, cut out of its sheet once and cleaned: the sheets keep a faint haze of near-clear pixels around each
 * figure, which the light grading over the pair would otherwise turn into a pale box behind them. Anything fainter than a whisper
 * goes; the soft edge of the figure itself stays. Meeca's frames are cut already facing left (toward Pokey), her bib turned back.
 */
interface Cut {
  cv: HTMLCanvasElement;
  /** where the feet are in the cut, in its pixels */
  ax: number;
  ay: number;
  /** sheet pixels to her game units (Meeca only; Pokey's frames are drawn at H / 205 per pixel) */
  k: number;
}
const CUTS = new Map<string, Cut>();
function clean(cv: HTMLCanvasElement) {
  const c = cv.getContext('2d', { willReadFrequently: true });
  if (!c || !cv.width || !cv.height) return;
  const im = c.getImageData(0, 0, cv.width, cv.height);
  const d = im.data;
  for (let i = 3; i < d.length; i += 4) {
    const a = d[i];
    d[i] = a < 34 ? 0 : a > 200 ? a : Math.round(((a - 34) / 166) * 200);
  }
  c.putImageData(im, 0, 0);
}
function pokeyCut(atlas: HTMLImageElement, name: string): Cut | null {
  const key = 'p:' + name;
  const have = CUTS.get(key);
  if (have) return have;
  const f = STD_FRAMES[name];
  if (!f) return null;
  const cv = document.createElement('canvas');
  cv.width = f.w;
  cv.height = f.h;
  cv.getContext('2d')!.drawImage(atlas, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
  clean(cv);
  const cut = { cv, ax: f.ax, ay: f.ay, k: 1 };
  CUTS.set(key, cut);
  return cut;
}
function meecaCut(name: string): Cut | null {
  const key = 'm:' + name;
  const have = CUTS.get(key);
  if (have) return have;
  const f = MEECA_FRAMES[name];
  if (!f) return null;
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(f.w);
  cv.height = Math.ceil(f.h);
  const c = cv.getContext('2d')!;
  const k = (MEECA_UNITS / MEECA_STAND_H) * f.s;
  c.translate(f.w - f.ax, f.ay);
  c.scale(-1, 1);
  if (!drawMeecaFrame(c, name, 1, 1 / k, true)) return null;
  clean(cv);
  const cut = { cv, ax: f.w - f.ax, ay: f.ay, k };
  CUTS.set(key, cut);
  return cut;
}

/** the world's light over a picture: warm from above, the undergrowth's shade at the foot, a little of the world's dusk overall */
function grade(g: CanvasRenderingContext2D, pal: Palette, y0: number, y1: number, w: number, h: number) {
  g.save();
  g.globalCompositeOperation = 'source-atop';
  const gr = g.createLinearGradient(0, y0, 0, y1);
  gr.addColorStop(0, rgba(pal.light, 0.14));
  gr.addColorStop(0.55, rgba(pal.light, 0.03));
  gr.addColorStop(0.8, rgba(pal.shade, 0.18));
  gr.addColorStop(1, rgba(pal.shade, 0.5));
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = rgba(pal.shade, 0.22 * pal.dark);
  g.fillRect(0, 0, w, h);
  g.restore();
}
/** the light, quantised, so a pose is graded again only when the light has really changed */
const palKey = (p: Palette) => [...p.light, ...p.shade].map((v) => Math.round(v / 10)).join('.') + ':' + Math.round(p.dark * 20);

/** a pose in the world's light, with a thin rim of that light on its lit (upper left) edge; made once per pose and light */
const GRADED = new Map<string, Cut>();
function gradedCut(cut: Cut, name: string, pal: Palette, pk: string): Cut {
  const key = name + '|' + pk;
  const have = GRADED.get(key);
  if (have) return have;
  if (GRADED.size > 80) GRADED.clear();
  const P = 4;
  const w = cut.cv.width + P * 2, h = cut.cv.height + P * 2;
  const sprite = document.createElement('canvas');
  sprite.width = w;
  sprite.height = h;
  const s = sprite.getContext('2d')!;
  s.drawImage(cut.cv, P, P);
  // (the figure's own height: its top to its feet)
  const gs = s.createLinearGradient(0, P, 0, P + cut.ay);
  s.globalCompositeOperation = 'source-atop';
  gs.addColorStop(0, rgba(pal.light, 0.14));
  gs.addColorStop(0.55, rgba(pal.light, 0.03));
  gs.addColorStop(0.88, rgba(pal.shade, 0.14));
  gs.addColorStop(1, rgba(pal.shade, 0.26));
  s.fillStyle = gs;
  s.fillRect(0, 0, w, h);
  s.fillStyle = rgba(pal.shade, 0.22 * pal.dark);
  s.fillRect(0, 0, w, h);
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const o = out.getContext('2d')!;
  o.drawImage(cut.cv, P - 1.6, P - 2.2);
  o.globalCompositeOperation = 'source-in';
  o.fillStyle = rgba(mix(pal.light, [255, 255, 255], 0.3), 0.34);
  o.fillRect(0, 0, w, h);
  o.globalCompositeOperation = 'source-over';
  o.drawImage(sprite, 0, 0);
  const g = { cv: out, ax: cut.ax + P, ay: cut.ay + P, k: cut.k };
  GRADED.set(key, g);
  return g;
}

interface Mote {
  x: number;
  y: number;
  s: number;
  p: number;
  c: number;
}
const rand = (() => {
  let s = 12345;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
})();

export interface TitleSceneHandle {
  /** everything the first frame needs has arrived (the first world, both sloths and the log) */
  ready: () => boolean;
  /** start the entrance now */
  arrive: () => void;
}

export const TitleScene = React.forwardRef<
  TitleSceneHandle,
  {
    worlds: number[];
    /** seconds each world stays before the next fades in */
    hold?: number;
    /** the box the layout keeps clear for the pair */
    stageSelector: string;
    /** a menu is open over the scene: it draws less often */
    dim?: boolean;
  }
>(({ worlds, hold = 13, stageSelector, dim = false }, ref) => {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const dimRef = useRef(dim);
  dimRef.current = dim;
  const state = useRef<{ ready: boolean; arriveAt: number | null }>({ ready: false, arriveAt: null });
  React.useImperativeHandle(ref, () => ({
    ready: () => state.current.ready,
    arrive: () => {
      if (state.current.arriveAt === null) state.current.arriveAt = performance.now();
    },
  }));
  const key = worlds.join(',');

  useEffect(() => {
    const list = key.split(',').map(Number).filter((n) => n > 0);
    if (!list.length) return;
    const reduced = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    warmStandardAtlas();
    jennifurSpriteReady();
    loadLog();
    warmLeaves();
    plantsPainted();
    const cache = WORLD_CACHE;
    const get = (n: number) => {
      let s = cache.get(n);
      if (!s) {
        s = loadWorld(n);
        cache.set(n, s);
      }
      return s;
    };
    get(list[0]);

    // the life of the scene: fireflies, leaves, butterflies (positions are shares of the screen)
    const flies: Mote[] = Array.from({ length: reduced ? 6 : 16 }, () => ({ x: rand(), y: 0.2 + rand() * 0.7, s: 0.6 + rand() * 0.8, p: rand() * 6.3, c: rand() }));
    const leaves: Mote[] = reduced ? [] : Array.from({ length: 7 }, () => ({ x: rand(), y: rand(), s: 0.5 + rand() * 0.5, p: rand() * 6.3, c: Math.floor(rand() * 100000) }));
    const glow = document.createElement('canvas');
    glow.width = glow.height = 48;
    {
      const g = glow.getContext('2d')!;
      const rg = g.createRadialGradient(24, 24, 0, 24, 24, 24);
      rg.addColorStop(0, 'rgba(255,250,200,1)');
      rg.addColorStop(0.18, 'rgba(240,255,150,.85)');
      rg.addColorStop(0.5, 'rgba(190,255,110,.22)');
      rg.addColorStop(1, 'rgba(190,255,110,0)');
      g.fillStyle = rg;
      g.fillRect(0, 0, 48, 48);
    }
    // the log and its ferns, in the world's light (made again only when the light or the size changes)
    const logLayer = { key: '', back: document.createElement('canvas'), front: document.createElement('canvas') };

    let box: DOMRect | null = null;
    let boxAt = 0;
    let raf = 0;
    let last = 0;
    const t0 = performance.now();
    const FADE = reduced ? 1.6 : 3.2;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const cv = cvRef.current;
      if (!cv || document.hidden) return;
      const st = state.current;
      const first = get(list[0]);
      const pokeyAtlas = standardAtlas();
      const ready = first.ready && !!pokeyAtlas && jennifurSpriteReady() && logReady;
      st.ready = ready;
      // the game's own pace: 30 frames a second (10 with a menu over it, 4 while the splash still covers it)
      const fps = st.arriveAt === null ? 4 : dimRef.current ? 10 : 30;
      if (now - last < 1000 / fps - 3) return;
      last = now;
      if (!ready) return;

      const w = cv.clientWidth || window.innerWidth, h = cv.clientHeight || window.innerHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
        box = null;
      }
      if (!box || now - boxAt > 600) {
        box = document.querySelector(stageSelector)?.getBoundingClientRect() ?? null;
        boxAt = now;
      }
      const c = cv.getContext('2d');
      if (!c) return;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = 'high';

      const t = (now - t0) / 1000;
      const arr = st.arriveAt === null ? 0 : (now - st.arriveAt) / 1000;
      // which world is showing, how far into its turn, and the one before it while it fades out
      const showT = Math.max(0, arr);
      const idx = list.length > 1 ? Math.floor(showT / hold) % list.length : 0;
      const into = list.length > 1 ? showT - Math.floor(showT / hold) * hold : showT;
      const cur = get(list[idx]);
      const nextN = list[(idx + 1) % list.length];
      if (list.length > 1) {
        get(nextN);
        for (const k of [...cache.keys()]) if (k !== list[0] && k !== list[idx] && k !== nextN && k !== list[(idx - 1 + list.length) % list.length]) cache.delete(k);
      }
      const prevW = list.length > 1 && showT > hold && into < FADE ? cache.get(list[(idx - 1 + list.length) % list.length]) : undefined;
      const fadeK = prevW && prevW.ready && cur.ready ? Math.min(1, into / FADE) : 1;
      const showing = cur.ready ? cur : prevW && prevW.ready ? prevW : first;
      const pal: Palette = prevW && prevW.ready && fadeK < 1 ? { light: mix(prevW.pal.light, showing.pal.light, fadeK), shade: mix(prevW.pal.shade, showing.pal.shade, fadeK), dark: prevW.pal.dark + (showing.pal.dark - prevW.pal.dark) * fadeK } : showing.pal;

      // the entrance: the painting fades up from the splash's green and settles from a little close
      const inK = Math.min(1, arr / (reduced ? 0.6 : 1.1));
      const settle = reduced ? 0 : 1 - Math.min(1, arr / 2.6);
      const settleZ = 1 + 0.07 * settle * settle;
      // (the far strip covers the whole frame once it is in: the ground colour is needed only while it fades up)
      if (inK < 1 || !showing.far) {
        c.fillStyle = rgba(pal.shade, 1);
        c.fillRect(0, 0, w, h);
      }

      const portrait = h > w;
      const pan = reduced ? 2.5 : 8;
      // the pair's place: their log, its top, and how tall they stand
      const b = box && box.width > 40 && box.height > 40 ? box : null;
      // (they and their log fit the box: about 1.85 times their height from the tops of their heads to the foot of the log)
      const H = b ? (portrait ? Math.min(b.height / 1.8, w * 0.42) : Math.min(b.height / 1.62, b.width * 0.34, h * 0.4)) : 0;
      const logW = H * 1.85;
      const logH = logImg && logImg.naturalWidth ? (logW * logImg.naturalHeight) / logImg.naturalWidth : logW * 0.46;
      const cx = b ? b.left + b.width / 2 : w / 2;
      const feet = b ? (portrait ? b.bottom - logH * 0.92 : b.bottom - logH * 0.62) : h * 0.7;
      const logTop = feet - logH * LOG_TOP;
      const logX = cx - logW / 2;
      const groundY = logTop + logH * 0.86;

      const paint = (s: World, alpha: number, k: number) => {
        if (!s.ready || alpha <= 0) return;
        c.save();
        c.globalAlpha = alpha * inK;
        const strip = (im: HTMLImageElement | null, speed: number, top: number, height: number, zoom: number, sway = 0) => {
          if (!im) return;
          c.save();
          // pushed in about a point a little above the middle
          const fx = w / 2, fy = h * 0.42;
          c.translate(fx, fy);
          c.scale(zoom, zoom);
          c.translate(-fx, -fy);
          if (sway) {
            // the canopy breathing: the top of the strip leans a touch, its foot stays put
            const foot = top + height;
            c.translate(0, foot);
            c.transform(1, 0, sway, 1, 0, 0);
            c.translate(0, -foot);
          }
          const kk = height / im.naturalHeight;
          const tw = im.naturalWidth * kk;
          const off = -((t * speed + 0.5 * tw) % (tw * 2));
          for (let x = off, i = 0; x < w + 2; x += tw, i++) {
            if (x + tw < -2) continue;
            if (i % 2) {
              c.save();
              c.translate(x + tw, top);
              c.scale(-1, 1);
              c.drawImage(im, 0, 0, tw + 0.5, height);
              c.restore();
            } else c.drawImage(im, x, top, tw + 0.5, height);
          }
          c.restore();
        };
        // the push-in: far most, middle less, the near strip not at all (it carries the log)
        const push = reduced ? 0 : k;
        strip(s.far, pan * 0.3, -h * 0.01, h * 1.03, settleZ * (1 + 0.07 * push));
        strip(s.mid, pan, -h * 0.02, h * 1.03, settleZ * (1 + 0.045 * push), reduced ? 0 : Math.sin(t * 0.35) * 0.006);
        // light from the canopy
        if (s.beam) {
          c.save();
          c.globalCompositeOperation = 'screen';
          const beams = portrait ? [[0.18, 0.55], [0.46, 0.8], [0.8, 0.5]] : [[0.12, 0.5], [0.34, 0.75], [0.6, 0.6], [0.86, 0.45]];
          for (let i = 0; i < beams.length; i++) {
            const [bx, bs] = beams[i];
            const pulse = 0.55 + 0.45 * Math.sin(t * (0.21 + i * 0.07) + i * 1.9);
            c.globalAlpha = alpha * inK * (0.1 + 0.16 * pulse) * (1.1 - s.pal.dark * 0.5);
            c.save();
            c.translate(w * bx + Math.sin(t * 0.05 + i) * w * 0.02, -h * 0.05);
            c.rotate(0.32);
            c.drawImage(s.beam, -w * 0.09 * bs, 0, w * 0.18 * bs + 40, h * 1.15);
            c.restore();
          }
          c.restore();
        }
        // the far mist band, behind the near strip
        if (s.mist) {
          c.save();
          // (low and faint: a haze lying in the trees behind the log, never a patch)
          c.globalAlpha = alpha * inK * (0.3 + 0.08 * Math.sin(t * 0.13));
          const mh = h * 0.24, mw = mh * 6;
          const my = groundY - mh * 0.7;
          const off = -((t * pan * 0.9) % mw);
          for (let x = off; x < w; x += mw) c.drawImage(s.mist, x, my, mw + 1, mh);
          c.restore();
        }
        // the near strip: its ground line under the log, so the log lies in the undergrowth
        if (s.near) {
          const nh = portrait ? Math.min(h * 0.46, w * 1.05) : h * 0.82;
          const nTop = groundY - s.ground * nh;
          strip(s.near, pan * 1.55, nTop, nh, 1, reduced ? 0 : Math.sin(t * 0.6 + 1) * 0.012);
          // under the strip, the floor of the forest in its shade
          const below = nTop + nh - 1;
          if (below < h) {
            // (it starts a little above the strip's foot and fades in, so the strip melts into it instead of ending on a line)
            const top = below - nh * 0.16;
            const g = c.createLinearGradient(0, top, 0, h);
            g.addColorStop(0, rgba(s.pal.shade, 0));
            g.addColorStop(Math.min(0.99, (nh * 0.16) / Math.max(1, h - top)), rgba(s.pal.shade, 1));
            g.addColorStop(1, rgba(mix(s.pal.shade, [0, 0, 0], 0.55), 1));
            c.fillStyle = g;
            c.fillRect(0, top, w, h - top + 1);
          }
        }
        c.restore();
      };
      if (prevW && prevW.ready && fadeK < 1) {
        paint(prevW, 1, (hold + into) / hold);
        paint(showing, fadeK, into / hold);
      } else paint(showing, 1, into / hold);

      // ---- the pair on their log ----
      // (everything here is drawn from small pictures made once: the log and the ferns already in the world's light, and each pose of
      // the two of them already graded and rimmed; only when the light changes, in a world's crossfade, are they made again)
      if (b && logImg && pokeyAtlas) {
        const pk = palKey(pal);
        // the shadow the log throws on the ground
        const sy = groundY - logH * 0.04;
        const lg = c.createRadialGradient(cx, sy, 0, cx, sy, logW * 0.6);
        lg.addColorStop(0, rgba(mix(pal.shade, [0, 0, 0], 0.6), 0.55 * inK));
        lg.addColorStop(1, rgba(pal.shade, 0));
        c.save();
        c.fillStyle = lg;
        c.translate(cx, sy);
        c.scale(1, 0.16);
        c.beginPath();
        c.arc(0, 0, logW * 0.6, 0, Math.PI * 2);
        c.fill();
        c.restore();
        // the log and its ferns, in the world's light
        const lx0 = logX - H * 0.45, ly0 = logTop - H * 0.12, lw = logW + H * 0.9, lh = groundY + H * 0.2 - ly0;
        const lkey = `${pk}|${Math.round(lw * dpr)}|${Math.round(lh * dpr)}|${plantsPainted() ? 1 : 0}`;
        if (logLayer.key !== lkey) {
          logLayer.key = lkey;
          const gy0 = feet - H - ly0, gy1 = groundY - ly0;
          for (const [cvL, which] of [[logLayer.back, 'back'], [logLayer.front, 'front']] as const) {
            cvL.width = Math.ceil(lw * dpr);
            cvL.height = Math.ceil(lh * dpr);
            const g = cvL.getContext('2d')!;
            g.setTransform(dpr, 0, 0, dpr, 0, 0);
            g.imageSmoothingEnabled = true;
            g.imageSmoothingQuality = 'high';
            const ox = logX - lx0, oy = logTop - ly0, gyy = groundY - ly0;
            if (which === 'back') g.drawImage(logImg, ox, oy, logW, logH);
            else {
              // ferns at the log's ends and one in front of its middle
              drawPlantAt(g, 61, ox + logW * 0.04, gyy + H * 0.05, H * 0.62, false);
              drawPlantAt(g, 59, ox + logW * 0.52, gyy + H * 0.08, H * 0.36, true);
              drawPlantAt(g, 26, ox + logW * 0.97, gyy + H * 0.05, H * 0.56, true);
            }
            grade(g, pal, gy0, gy1, lw, lh);
          }
        }
        c.save();
        c.globalAlpha = inK;
        c.drawImage(logLayer.back, lx0, ly0, lw, lh);
        c.restore();
        // the two of them hop onto it as the title arrives
        const hop = (delay: number) => {
          if (reduced) return { dy: 0, sq: 1, al: Math.min(1, Math.max(0, (arr - delay) / 0.4)) };
          const u = (arr - delay) / 0.62;
          if (u <= 0) return { dy: -H * 0.5, sq: 1, al: 0 };
          if (u >= 1.4) return { dy: 0, sq: 1, al: 1 };
          if (u < 1) {
            const e = u * u;
            return { dy: -H * 0.5 * (1 - e), sq: 1 + 0.04 * (1 - u), al: Math.min(1, u * 3) };
          }
          const v = (u - 1) / 0.4;
          return { dy: 0, sq: 1 - 0.07 * Math.sin(v * Math.PI), al: 1 };
        };
        const ph1 = hop(0.45), ph2 = hop(0.62);
        // contact shadows on the moss
        for (const [u, al] of [[POKEY_AT, ph1.al], [MEECA_AT, ph2.al]] as const) {
          const x = logX + logW * u;
          const g = c.createRadialGradient(x, feet + 1, 0, x, feet + 1, H * 0.26);
          g.addColorStop(0, `rgba(25,14,4,${0.5 * al})`);
          g.addColorStop(1, 'rgba(25,14,4,0)');
          c.fillStyle = g;
          c.beginPath();
          c.ellipse(x, feet + 1, H * 0.26, H * 0.055, 0, 0, Math.PI * 2);
          c.fill();
        }
        // Pokey, on the left, facing her; Meeca on the right, facing him
        const pose = pairPose(t, PAIR_STEPS);
        const breathe = 1 + Math.sin(t * 2.1) * 0.012;
        {
          const raw = pokeyCut(pokeyAtlas, pose.pokey) ?? pokeyCut(pokeyAtlas, 'idle');
          const cut = raw && gradedCut(raw, 'p:' + pose.pokey, pal, pk);
          const k = H / 205;
          if (cut) {
            c.save();
            c.globalAlpha = ph1.al;
            c.translate(logX + logW * POKEY_AT, feet + ph1.dy);
            c.scale(k * (2 - ph1.sq), k * breathe * ph1.sq);
            c.drawImage(cut.cv, -cut.ax, -cut.ay);
            c.restore();
          }
        }
        {
          const sm = (H * 0.97) / 90;
          const bounce = pose.meecaHop ? Math.abs(Math.sin(pose.meecaHop * Math.PI)) * H * 0.07 : 0;
          const raw = meecaCut(pose.meeca) ?? meecaCut('idle');
          const cut = raw && gradedCut(raw, 'm:' + pose.meeca, pal, pk);
          if (cut) {
            const kk = sm * cut.k;
            c.save();
            c.globalAlpha = ph2.al;
            c.translate(logX + logW * MEECA_AT, feet + ph2.dy - bounce);
            c.scale(kk * (2 - ph2.sq), kk * (1 + Math.sin(t * 2.3 + 1) * 0.01) * ph2.sq);
            c.drawImage(cut.cv, -cut.ax, -cut.ay);
            c.restore();
          }
        }
        c.save();
        c.globalAlpha = inK;
        c.drawImage(logLayer.front, lx0, ly0, lw, lh);
        c.restore();
      }

      // ---- the air in front: the near mist, fireflies, butterflies, leaves ----
      if (showing.mist && !reduced) {
        c.save();
        c.globalAlpha = 0.13 * inK;
        const mh = h * 0.16, mw = mh * 6;
        const my = groundY - mh * 0.45;
        const off = -((t * pan * 2.2 + mw * 0.4) % mw);
        for (let x = off; x < w; x += mw) c.drawImage(showing.mist, x, my, mw + 1, mh);
        c.restore();
      }
      c.save();
      c.globalCompositeOperation = 'lighter';
      const flyK = (0.3 + 0.7 * pal.dark) * inK;
      for (const m of flies) {
        const x = (m.x + Math.sin(t * 0.13 * m.s + m.p) * 0.06) * w;
        const y = (m.y + Math.sin(t * 0.21 * m.s + m.p * 2) * 0.04) * h;
        const blink = Math.max(0, Math.sin(t * (0.8 + m.s * 0.6) + m.p * 3));
        const r = (5 + 6 * m.s) * (0.7 + 0.3 * blink);
        c.globalAlpha = flyK * (0.15 + 0.7 * blink * blink);
        c.drawImage(glow, x - r, y - r, r * 2, r * 2);
      }
      c.restore();
      if (!reduced) {
        const sc = Math.min(w, h) / 520;
        for (let i = 0; i < 2; i++) {
          const u = t * (0.035 + i * 0.012) + i * 0.47;
          const lap = u - Math.floor(u);
          const x = (i ? 1.1 - lap * 1.2 : -0.1 + lap * 1.2) * w;
          const y = h * (0.16 + i * 0.14) + Math.sin(u * 17) * h * 0.05 + Math.sin(u * 41) * h * 0.012;
          drawPaintedButterfly(c, list[idx] ?? 1, i + 3, x, y, t, sc * 0.9, 1, i ? -1 : 1, Math.sin(u * 17) * 0.25);
        }
        for (const m of leaves) {
          const fall = (t * (0.025 + m.s * 0.02) + m.p) % 1.25;
          const x = (m.x + Math.sin(t * 0.4 * m.s + m.p) * 0.05 + fall * 0.08) * w;
          const y = (fall - 0.1) * h;
          drawPaintedLeaf(c, 1, m, x, y, t, Math.min(w, h) / 520, 0.9 * inK);
        }
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      // keep only the first world, so coming back to the title is instant and the next visit starts from it
      for (const k of [...cache.keys()]) if (k !== list[0]) cache.delete(k);
    };
  }, [key, hold, stageSelector]);

  return <canvas ref={cvRef} className="ts-scene" aria-hidden="true" />;
});
TitleScene.displayName = 'TitleScene';

export type { PoseStep };
