import React, { useEffect, useRef } from 'react';
import { LEAVES_URL, warmLeaves } from '../../game/leafSprites.ts';
import { LEAF_FRAMES } from '../../game/leafAtlasData.ts';
import { drawPaintedLeaf } from '../../game/leafSprites.ts';
import { drawPaintedButterfly } from '../../game/butterflySprites.ts';
import { drawPlantAt, plantsPainted } from '../../game/plantSprites.ts';
import { frameAt, timeline, type Cast, type ClipFrame, type Segment } from './clipPlayer.ts';
import { MEECA_CAST, POKEY_CAST } from './titleCast.ts';

/**
 * The living title scene (Matt, 2026-10-28: "a highly polished start screen"): one canvas, drawn at the game's own 30 frames a second.
 *
 *   the camera     it starts close on the pair in the dark and draws back as the light comes up (the title's reveal), then drifts
 *                  slowly from side to side for ever: the far painting slides one way, the leaves in front the other, the pair stay put
 *   the depth      far: the world's far strip out of focus; middle: its middle strip, pushed in slowly; the pair's plane: the near strip
 *                  with Matt's painted mossy log in it; in front: big out-of-focus leaves at the corners, one drifting past now and then,
 *                  and the near foliage turned over as a dark canopy across the top
 *   the air        soft light shafts and two bands of mist, all in the world's own light; fireflies (brighter in the darker worlds),
 *                  painted butterflies and a few falling leaves
 *   the pair       Pokey and Meeca, large, the heart of the picture, drawn only from painted frames played as clips (clipPlayer.ts,
 *                  titleCast.ts): an idle, and now and then a moment. Their only other motion is a very slow breath. The world's
 *                  light is graded over them and the log (warm above, the undergrowth's shade at the feet, a thin rim of light)
 *   the worlds     every biome takes a turn, crossfading slowly while the far and middle strips push in
 *
 * Nothing in it re-renders React. `arrive` starts the entrance. With reduced motion asked for, the camera holds still, the drift and
 * the push are gone, and nothing flies or falls.
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
  /** the far strip out of focus (the depth of the scene), and the near strip turned over as a soft dark canopy over the top */
  farSoft: HTMLCanvasElement | null;
  canopy: HTMLCanvasElement | null;
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

/**
 * A picture made soft, as a camera would see something far behind or close in front of what it is focused on: blurred where the
 * browser can blur a canvas, and drawn small (so it is soft when drawn large) where it cannot.
 */
function soften(src: CanvasImageSource, sw: number, sh: number, scale: number, blur: number, draw?: (g: CanvasRenderingContext2D, w: number, h: number) => void): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = Math.max(2, Math.round(sw * scale));
  cv.height = Math.max(2, Math.round(sh * scale));
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  const canFilter = 'filter' in g;
  if (canFilter) g.filter = `blur(${blur * scale}px)`;
  if (draw) draw(g, cv.width, cv.height);
  else g.drawImage(src, 0, 0, cv.width, cv.height);
  if (canFilter) g.filter = 'none';
  return cv;
}

function loadWorld(n: number): World {
  const w: World = { far: null, mid: null, near: null, ready: false, pal: DEFAULT_PAL, ground: 0.78, beam: null, mist: null, farSoft: null, canopy: null };
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
          const far = w.far!;
          w.farSoft = soften(far, far.naturalWidth, far.naturalHeight, 0.5, 5);
          if (w.near) {
            const near = w.near;
            // the near foliage turned over and darkened: leaves hanging into the top of the picture, close and out of focus
            w.canopy = soften(near, near.naturalWidth, near.naturalHeight, 0.25, 7, (g, cw, ch) => {
              g.translate(0, ch);
              g.scale(1, -1);
              g.drawImage(near, 0, 0, cw, ch);
              g.setTransform(1, 0, 0, 1, 0, 0);
              g.globalCompositeOperation = 'source-atop';
              g.fillStyle = rgba(mix(w.pal.shade, [0, 0, 0], 0.35), 0.72);
              g.fillRect(0, 0, cw, ch);
            });
          }
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

function loadImage(url: string, done: (im: HTMLImageElement | null) => void): HTMLImageElement {
  const im = new Image();
  im.decoding = 'async';
  im.onload = () => {
    const ok = () => done(im);
    if (im.decode) im.decode().then(ok, ok);
    else ok();
  };
  im.onerror = () => done(null);
  im.src = url;
  return im;
}

let logImg: HTMLImageElement | null = null;
let logReady = false;
function loadLog() {
  if (logImg || typeof Image === 'undefined') return;
  logImg = loadImage(TITLE_LOG_URL, () => (logReady = true));
}

// ---- the pair's casts: their clip sheets (titleCast.ts). The idles load with the title; a moment's sheet loads a few seconds before it
// plays and is let go after, so only the idles and one moment are ever held decoded ----
interface LiveCast {
  cast: Cast;
  segs: Segment[];
  pics: Record<string, HTMLImageElement | null | undefined>;
}
let pokey: LiveCast | null = null;
let meeca: LiveCast | null = null;
function liveCast(cast: Cast, seed: number): LiveCast {
  return { cast, segs: timeline(cast, seed, 1800), pics: {} };
}
/** start fetching a sheet (once); true when it is in */
function ensure(live: LiveCast, sheet: string): boolean {
  const have = live.pics[sheet];
  if (have) return true;
  if (have === null) return false;
  const src = live.cast.sheets[sheet];
  if (typeof src !== 'string') return false;
  live.pics[sheet] = null;
  loadImage(src, (im) => {
    if (live.pics[sheet] === null) live.pics[sheet] = im ?? undefined;
  });
  return false;
}
function loadCasts() {
  if (typeof Image === 'undefined') return;
  if (!pokey) pokey = liveCast(POKEY_CAST, 17);
  if (!meeca) meeca = liveCast(MEECA_CAST, 5);
  ensure(pokey, POKEY_CAST.idle);
  ensure(meeca, MEECA_CAST.idle);
}
/** the frame to draw at time t (the idle's, while a moment's sheet is still on its way); fetches what comes next, lets go of the rest */
function castFrame(live: LiveCast, t: number): { pic: HTMLImageElement; f: ClipFrame } | null {
  const { cast, segs } = live;
  const at = frameAt(cast, segs, t);
  const total = segs.length ? segs[segs.length - 1].end : 1;
  const u = ((t % total) + total) % total;
  // the next moment's sheet, three seconds ahead; any other moment's let go
  const soon = new Set<string>([cast.idle]);
  for (const sg of segs) if (sg.end > u && sg.start < u + 3) soon.add(cast.clips[sg.clip]?.sheet ?? cast.idle);
  for (const sh of soon) ensure(live, sh);
  for (const k of Object.keys(live.pics)) if (!soon.has(k) && live.pics[k]) live.pics[k] = undefined;
  const clip = cast.clips[at.clip];
  const pic = clip && live.pics[clip.sheet];
  if (clip && pic) return { pic, f: clip.frames[at.frame] };
  const idle = cast.clips[cast.idle];
  const ip = live.pics[idle.sheet];
  if (!ip) return null;
  return { pic: ip, f: idle.frames[Math.floor(u * idle.fps) % idle.frames.length] };
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
/** the light, quantised, so a frame is lit again only when the light has really changed */
const palKey = (p: Palette) => [...p.light, ...p.shade].map((v) => Math.round(v / 10)).join('.') + ':' + Math.round(p.dark * 20);

// ---- the leaves in front of the camera: big, close, out of focus, in the shade ----
let leafAtlas: HTMLImageElement | null = null;
let leafAtlasReady = false;
const FRONT_LEAVES = ['big_C10_0', 'big_B09_0', 'big_C06_0', 'big_B06_0'];
const fronts = new Map<string, HTMLCanvasElement>();
function frontLeaf(name: string, shade: [number, number, number], pk: string): HTMLCanvasElement | null {
  if (!leafAtlasReady || !leafAtlas) return null;
  const key = name + '|' + pk;
  const have = fronts.get(key);
  if (have) return have;
  const f = LEAF_FRAMES[name];
  if (!f) return null;
  if (fronts.size > 24) fronts.clear();
  const atlas = leafAtlas;
  const cv = soften(atlas, f.w * 2, f.h * 2, 1, 3, (g, w, h) => {
    g.drawImage(atlas, f.x, f.y, f.w, f.h, 6, 6, w - 12, h - 12);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = rgba(mix(shade, [0, 0, 0], 0.3), 0.62);
    g.fillRect(0, 0, w, h);
  });
  fronts.set(key, cv);
  return cv;
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

const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.pow(1 - u, 3));

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
    /** behind a menu screen (the Trophy Room, the map): the same painting, depth, air and drift, without the pair and the reveal */
    backdrop?: boolean;
  }
>(({ worlds, hold = 13, stageSelector, dim = false, backdrop = false }, ref) => {
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
    loadCasts();
    loadLog();
    warmLeaves();
    plantsPainted();
    if (!leafAtlas) leafAtlas = loadImage(LEAVES_URL, (im) => (leafAtlasReady = !!im));
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
    const leaves: Mote[] = reduced ? [] : Array.from({ length: 6 }, () => ({ x: rand(), y: rand(), s: 0.5 + rand() * 0.5, p: rand() * 6.3, c: Math.floor(rand() * 100000) }));
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
    // the pair's own small picture for lighting a frame
    const pairLight = document.createElement('canvas');
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
      const ready = first.ready && (backdrop || (!!pokey?.pics[POKEY_CAST.idle] && !!meeca?.pics[MEECA_CAST.idle] && logReady));
      st.ready = ready;
      // the game's own pace: 30 frames a second (10 with a menu over it, 4 while the splash still covers it)
      // (a backdrop comes on by itself, and draws a little less often: the screen over it is what the player looks at)
      if (backdrop && ready && st.arriveAt === null) st.arriveAt = now;
      const fps = st.arriveAt === null ? 4 : dimRef.current ? 10 : backdrop ? 24 : 30;
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
      if (!backdrop && (!box || now - boxAt > 600)) {
        box = document.querySelector(stageSelector)?.getBoundingClientRect() ?? null;
        boxAt = now;
      }
      const c = cv.getContext('2d');
      if (!c) return;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = 'high';

      const t = (now - t0) / 1000;
      const arr = st.arriveAt === null ? 0 : Math.max(0, (now - st.arriveAt) / 1000);
      // which world is showing, how far into its turn, and the one before it while it fades out
      const idx = list.length > 1 ? Math.floor(arr / hold) % list.length : 0;
      const into = list.length > 1 ? arr - Math.floor(arr / hold) * hold : arr;
      const cur = get(list[idx]);
      const nextN = list[(idx + 1) % list.length];
      if (list.length > 1) {
        get(nextN);
        for (const k of [...cache.keys()]) if (k !== list[0] && k !== list[idx] && k !== nextN && k !== list[(idx - 1 + list.length) % list.length]) cache.delete(k);
      }
      const prevW = list.length > 1 && arr > hold && into < FADE ? cache.get(list[(idx - 1 + list.length) % list.length]) : undefined;
      const fadeK = prevW && prevW.ready && cur.ready ? Math.min(1, into / FADE) : 1;
      const showing = cur.ready ? cur : prevW && prevW.ready ? prevW : first;
      const pal: Palette = prevW && prevW.ready && fadeK < 1 ? { light: mix(prevW.pal.light, showing.pal.light, fadeK), shade: mix(prevW.pal.shade, showing.pal.shade, fadeK), dark: prevW.pal.dark + (showing.pal.dark - prevW.pal.dark) * fadeK } : showing.pal;
      const pk = palKey(pal);

      const portrait = h > w;
      // ---- the pair's place: large, the heart of the picture; the log under them runs out past the edges and behind the buttons ----
      const b = box && box.width > 40 && box.height > 40 ? box : null;
      // (never drawn more than about twice the size of their painted frames: today's frames are small, and blown up further they go
      // soft; the art helper's sheets at 600 px and more let them grow to fill the box)
      // (never drawn more than about twice the size of their painted frames)
      const sharp = (POKEY_CAST.height * 2.1) / dpr;
      // (sideways the box runs to the bottom of the screen: the pair stand on the log with a band of its face showing under them)
      const H = Math.min(sharp, b ? (portrait ? Math.min(b.height * 0.9, w * 0.72) : Math.min(b.height / 1.6, b.width * 0.54)) : h * 0.3);
      const cx = b ? b.left + b.width / 2 : w / 2;
      const logW = H * 1.95;
      const feet = b ? b.bottom - (portrait ? H * 0.05 : logW * 0.457 * 0.6) : h * 0.7;
      const logH = logImg && logImg.naturalWidth ? (logW * logImg.naturalHeight) / logImg.naturalWidth : logW * 0.46;
      const logTop = feet - logH * LOG_TOP;
      const logX = cx - logW / 2;
      const groundY = logTop + logH * 0.86;

      // ---- the camera: the reveal draws back from close on the pair; then a slow drift from side to side ----
      const reveal = reduced || backdrop ? 1 : ease(arr / 2.8);
      const zoom = 1 + 0.28 * (1 - reveal);
      const fx = cx, fy = feet - H * 0.55;
      const drift = reduced ? 0 : Math.sin((t * Math.PI * 2) / 38) * w * 0.03 + Math.sin((t * Math.PI * 2) / 71 + 1) * w * 0.014;
      const rise = reduced ? 0 : (1 - reveal) * h * 0.04 + Math.sin((t * Math.PI * 2) / 47) * h * 0.004;
      /** a layer at `depth` (0 the far distance, 1 the pair's plane, more than 1 in front): its share of the zoom and of the drift */
      const camera = (depth: number) => {
        const z = Math.pow(zoom, Math.min(1.4, 0.35 + depth * 0.65));
        c.translate(fx, fy);
        c.scale(z, z);
        c.translate(-fx + drift * (1 - depth), -fy + rise * (1 - depth * 0.5));
      };
      const light = reduced || backdrop ? Math.min(1, arr / 0.6) : ease(arr / 1.3);

      if (light < 1 || !showing.far) {
        c.fillStyle = '#0b1a13';
        c.fillRect(0, 0, w, h);
      }
      const strip = (im: CanvasImageSource | null, iw: number, ih: number, speed: number, top: number, height: number, sway = 0) => {
        if (!im || !ih) return;
        if (sway) {
          // the canopy breathing: the top of the strip leans a touch, its foot stays put
          const foot = top + height;
          c.translate(0, foot);
          c.transform(1, 0, sway, 1, 0, 0);
          c.translate(0, -foot);
        }
        const kk = height / ih;
        const tw = iw * kk;
        const pad = w * 0.4;
        const off = -((t * speed + 0.5 * tw) % (tw * 2)) - pad;
        for (let x = off, i = 0; x < w + pad; x += tw, i++) {
          if (x + tw < -pad) continue;
          if (i % 2) {
            c.save();
            c.translate(x + tw, top);
            c.scale(-1, 1);
            c.drawImage(im, 0, 0, tw + 0.5, height);
            c.restore();
          } else c.drawImage(im, x, top, tw + 0.5, height);
        }
      };
      const paint = (s: World, alpha: number, k: number) => {
        if (!s.ready || alpha <= 0) return;
        const push = reduced ? 0 : k;
        c.save();
        c.globalAlpha = alpha * light;
        // far: out of focus, pushed in the most
        c.save();
        camera(0.1);
        const kb = 1 + 0.06 * push;
        c.translate(w / 2, h * 0.42);
        c.scale(kb, kb);
        c.translate(-w / 2, -h * 0.42);
        const far = s.farSoft ?? s.far;
        if (far && s.far) strip(far, s.far.naturalWidth, s.far.naturalHeight, reduced ? 0.8 : 2.4, -h * 0.02, h * 1.05);
        c.restore();
        // middle
        c.save();
        camera(0.45);
        const kb2 = 1 + 0.035 * push;
        c.translate(w / 2, h * 0.42);
        c.scale(kb2, kb2);
        c.translate(-w / 2, -h * 0.42);
        if (s.mid) strip(s.mid, s.mid.naturalWidth, s.mid.naturalHeight, reduced ? 2 : 6, -h * 0.02, h * 1.04, reduced ? 0 : Math.sin(t * 0.35) * 0.005);
        c.restore();
        // light from the canopy (brighter as the title reveals itself)
        if (s.beam) {
          c.save();
          camera(0.6);
          c.globalCompositeOperation = 'screen';
          const flare = reduced ? 0 : Math.max(0, Math.sin(Math.min(1, arr / 2.4) * Math.PI)) * 0.22;
          const beams = portrait ? [[0.18, 0.55], [0.48, 0.8], [0.82, 0.5]] : [[0.12, 0.5], [0.34, 0.75], [0.6, 0.6], [0.86, 0.45]];
          for (let i = 0; i < beams.length; i++) {
            const [bx, bs] = beams[i];
            const pulse = 0.55 + 0.45 * Math.sin(t * (0.21 + i * 0.07) + i * 1.9);
            c.globalAlpha = alpha * light * ((0.1 + 0.16 * pulse) * (1.1 - s.pal.dark * 0.5) + flare);
            c.save();
            c.translate(w * bx + Math.sin(t * 0.05 + i) * w * 0.02, -h * 0.08);
            c.rotate(0.32);
            c.drawImage(s.beam, -w * 0.09 * bs, 0, w * 0.18 * bs + 40, h * 1.2);
            c.restore();
          }
          c.restore();
        }
        // the far mist band, low in the trees behind the log
        if (s.mist) {
          c.save();
          camera(0.7);
          c.globalAlpha = alpha * light * (0.3 + 0.08 * Math.sin(t * 0.13));
          const mh = h * 0.24, mw = mh * 6;
          const my = groundY - mh * 0.7;
          const off = -((t * (reduced ? 1 : 7)) % mw) - mw;
          for (let x = off; x < w + mw; x += mw) c.drawImage(s.mist, x, my, mw + 1, mh);
          c.restore();
        }
        // the near strip: the pair's plane (it does not scroll: the log lies in it); its ground line under the log
        if (s.near) {
          c.save();
          camera(1);
          const nh = portrait ? Math.min(h * 0.5, w * 1.15) : h * 0.86;
          const nTop = groundY - s.ground * nh;
          strip(s.near, s.near.naturalWidth, s.near.naturalHeight, 0, nTop, nh, reduced ? 0 : Math.sin(t * 0.6 + 1) * 0.008);
          // under the strip, the floor of the forest in its shade
          const below = nTop + nh - 1;
          const top = below - nh * 0.16;
          const g = c.createLinearGradient(0, top, 0, h * 1.3);
          g.addColorStop(0, rgba(s.pal.shade, 0));
          g.addColorStop(Math.min(0.99, (nh * 0.16) / Math.max(1, h * 1.3 - top)), rgba(s.pal.shade, 1));
          g.addColorStop(1, rgba(mix(s.pal.shade, [0, 0, 0], 0.55), 1));
          c.fillStyle = g;
          c.fillRect(-w * 0.3, top, w * 1.6, h * 1.3 - top + 1);
          c.restore();
        }
        c.restore();
      };
      if (prevW && prevW.ready && fadeK < 1) {
        paint(prevW, 1, (hold + into) / hold);
        paint(showing, fadeK, into / hold);
      } else paint(showing, 1, into / hold);

      // ---- the pair on their log ----
      if (logImg && pokey && meeca && !backdrop) {
        const lightCv = pairLight;
        c.save();
        camera(1);
        c.globalAlpha = light;
        // the shadow the log throws on the ground
        const sy = groundY - logH * 0.04;
        const lg = c.createRadialGradient(cx, sy, 0, cx, sy, logW * 0.6);
        lg.addColorStop(0, rgba(mix(pal.shade, [0, 0, 0], 0.6), 0.55));
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
              // ferns where the log meets the undergrowth
              drawPlantAt(g, 61, ox + logW * 0.1, gyy + H * 0.05, H * 0.5, false);
              drawPlantAt(g, 26, ox + logW * 0.9, gyy + H * 0.05, H * 0.46, true);
            }
            grade(g, pal, gy0, gy1, lw, lh);
          }
        }
        c.drawImage(logLayer.back, lx0, ly0, lw, lh);
        // they come up with the light; then only what was painted moves, and a very slow breath
        const show = reduced ? light : Math.min(1, Math.max(0, (arr - 0.35) / 0.9));
        const sep = H * 0.34;
        // (one scale for both: the art has them at their real sizes, Meeca a head shorter)
        const k = H / POKEY_CAST.height;
        for (const [live, x, seed] of [[pokey, cx - sep, 0], [meeca, cx + sep * 0.95, 2.1]] as const) {
          const tall = live.cast.height * k;
          // contact shadow on the moss
          const g = c.createRadialGradient(x, feet + 1, 0, x, feet + 1, tall * 0.25);
          g.addColorStop(0, `rgba(25,14,4,${0.5 * show})`);
          g.addColorStop(1, 'rgba(25,14,4,0)');
          c.fillStyle = g;
          c.beginPath();
          c.ellipse(x, feet + 1, tall * 0.25, tall * 0.05, 0, 0, Math.PI * 2);
          c.fill();
          const fr = castFrame(live, t + seed);
          if (!fr) continue;
          const { pic, f } = fr;
          // the world's light over the frame, made in a small picture of its own (warm from above, the undergrowth's shade at the feet)
          if (lightCv.width < f.w || lightCv.height < f.h) {
            lightCv.width = Math.max(lightCv.width, f.w);
            lightCv.height = Math.max(lightCv.height, f.h);
          }
          const lc = lightCv.getContext('2d')!;
          lc.globalCompositeOperation = 'source-over';
          lc.clearRect(0, 0, lightCv.width, lightCv.height);
          lc.drawImage(pic, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
          lc.globalCompositeOperation = 'source-atop';
          const gr = lc.createLinearGradient(0, f.ay - live.cast.height, 0, f.ay);
          gr.addColorStop(0, rgba(pal.light, 0.13));
          gr.addColorStop(0.55, rgba(pal.light, 0.02));
          gr.addColorStop(0.88, rgba(pal.shade, 0.14));
          gr.addColorStop(1, rgba(pal.shade, 0.26));
          lc.fillStyle = gr;
          lc.fillRect(0, 0, f.w, f.h);
          lc.fillStyle = rgba(pal.shade, 0.2 * pal.dark);
          lc.fillRect(0, 0, f.w, f.h);
          c.save();
          c.globalAlpha = light * show;
          c.translate(x, feet + 1);
          c.scale(k, k);
          c.drawImage(lightCv, 0, 0, f.w, f.h, -f.ax, -f.ay, f.w, f.h);
          c.restore();
        }
        c.drawImage(logLayer.front, lx0, ly0, lw, lh);
        c.restore();
      }

      // ---- the air in front: the near mist, fireflies, butterflies, leaves ----
      if (showing.mist && !reduced) {
        c.save();
        camera(1.15);
        c.globalAlpha = 0.12 * light;
        const mh = h * 0.16, mw = mh * 6;
        const my = groundY - mh * 0.45;
        const off = -((t * 14 + mw * 0.4) % mw) - mw;
        for (let x = off; x < w + mw; x += mw) c.drawImage(showing.mist, x, my, mw + 1, mh);
        c.restore();
      }
      c.save();
      c.globalCompositeOperation = 'lighter';
      const flyK = (0.3 + 0.7 * pal.dark) * light;
      for (const m of flies) {
        const x = (m.x + Math.sin(t * 0.13 * m.s + m.p) * 0.06) * w + drift * -0.2;
        const y = (m.y + Math.sin(t * 0.21 * m.s + m.p * 2) * 0.04) * h;
        const blink = Math.max(0, Math.sin(t * (0.8 + m.s * 0.6) + m.p * 3));
        const r = (5 + 6 * m.s) * (0.7 + 0.3 * blink);
        c.globalAlpha = flyK * (0.15 + 0.7 * blink * blink);
        c.drawImage(glow, x - r, y - r, r * 2, r * 2);
      }
      c.restore();
      if (!reduced) {
        const sc = Math.min(w, h) / 520;
        for (let i = 0; i < (backdrop ? 1 : 2); i++) {
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
          drawPaintedLeaf(c, 1, m, x, y, t, Math.min(w, h) / 520, 0.9 * light);
        }
      }

      // ---- in front of the camera: the dark canopy over the top, big soft leaves at the corners, one drifting past now and then ----
      if (showing.canopy) {
        c.save();
        camera(1.5);
        c.globalAlpha = light * 0.9;
        const chh = portrait ? h * 0.15 : h * 0.24;
        const im = showing.canopy;
        const tw = (im.width / im.height) * chh * 1.6;
        for (let x = -w * 0.3 - ((t * 3) % tw); x < w * 1.3; x += tw) c.drawImage(im, x, -chh * 0.62, tw + 1, chh * 1.6);
        c.restore();
      }
      {
        c.save();
        camera(1.6);
        c.globalAlpha = light;
        const big = Math.min(w, h) * (portrait ? 0.62 : 0.5);
        const corner = (name: string, x: number, y: number, size: number, rot: number, flip: boolean, sway: number) => {
          const leaf = frontLeaf(name, pal.shade, pk);
          if (!leaf) return;
          c.save();
          c.translate(x, y);
          c.rotate(rot + (reduced ? 0 : Math.sin(t * 0.5 + sway) * 0.04));
          if (flip) c.scale(-1, 1);
          const k = size / Math.max(leaf.width, leaf.height);
          c.drawImage(leaf, (-leaf.width * k) / 2, (-leaf.height * k) / 2, leaf.width * k, leaf.height * k);
          c.restore();
        };
        corner('big_C10_0', -big * 0.16, h - big * (portrait ? 0.3 : 0.2), big, -0.5, false, 0);
        corner('big_B09_0', w + big * 0.14, h - big * (portrait ? 0.34 : 0.22), big * 0.9, 0.6, true, 1.7);
        if (!portrait) corner('big_C06_0', w + big * 0.05, -big * 0.12, big * 0.8, 2.6, false, 3.1);
        // one leaf crosses in front every half a minute or so, close and soft
        if (!reduced) {
          const lap = ((t + 9) % 27) / 9;
          if (lap < 1) {
            const x = -big * 0.6 + lap * (w + big * 1.2);
            const y = h * (portrait ? 0.64 : 0.55) + Math.sin(lap * Math.PI) * -h * 0.12;
            corner('big_B06_0', x, y, big * 1.15, -0.4 + lap * 0.9, false, 0.5);
          }
        }
        c.restore();
      }
      // the dark the reveal comes out of
      if (light < 1) {
        c.fillStyle = `rgba(11,26,19,${(1 - light) * 0.85})`;
        c.fillRect(0, 0, w, h);
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      // keep only the first world, so coming back to the title is instant and the next visit starts from it
      for (const k of [...cache.keys()]) if (k !== list[0]) cache.delete(k);
    };
  }, [key, hold, stageSelector, backdrop]);

  return <canvas ref={cvRef} className="ts-scene" aria-hidden="true" />;
});
TitleScene.displayName = 'TitleScene';

/** the title's living painting behind a menu screen: one world, its depth, its air and the slow drift (2026-10-28, the shared kit) */
export const SceneBackdrop: React.FC<{ world: number; dim?: boolean }> = ({ world, dim }) => (
  <div className="kit-backdrop" aria-hidden="true">
    <TitleScene worlds={[world]} stageSelector="" backdrop dim={dim} />
  </div>
);
