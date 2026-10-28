import React, { useEffect, useRef } from 'react';
import { standardAtlas, warmStandardAtlas } from '../../game/heroStandard.ts';
import { STD_FRAMES } from '../../game/heroStandardData.ts';
import { drawMeecaFrame, jennifurSpriteReady } from '../../game/jennifurSprite.ts';
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
  const down = c.createLinearGradient(0, 0, 0, 384);
  down.addColorStop(0, 'rgba(0,0,0,.9)');
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
    const x = rnd() * 768, y = 54 + (rnd() - 0.5) * 40, r = 40 + rnd() * 60;
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
    const cache = new Map<number, World>();
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
    // the pair and their log are drawn into their own layer first, so the world's light can be graded over all of them at once
    const actors = document.createElement('canvas');
    const rim = document.createElement('canvas');

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
      // the game's own pace: 30 frames a second (15 with a menu over it, 4 while the splash still covers it)
      const fps = st.arriveAt === null ? 4 : dimRef.current ? 15 : 30;
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
        for (const k of [...cache.keys()]) if (k !== list[idx] && k !== nextN && k !== list[(idx - 1 + list.length) % list.length]) cache.delete(k);
      }
      const prevW = list.length > 1 && showT > hold && into < FADE ? cache.get(list[(idx - 1 + list.length) % list.length]) : undefined;
      const fadeK = prevW && prevW.ready && cur.ready ? Math.min(1, into / FADE) : 1;
      const showing = cur.ready ? cur : prevW && prevW.ready ? prevW : first;
      const pal: Palette = prevW && prevW.ready && fadeK < 1 ? { light: mix(prevW.pal.light, showing.pal.light, fadeK), shade: mix(prevW.pal.shade, showing.pal.shade, fadeK), dark: prevW.pal.dark + (showing.pal.dark - prevW.pal.dark) * fadeK } : showing.pal;

      // the entrance: the painting fades up from the splash's green and settles from a little close
      const inK = Math.min(1, arr / (reduced ? 0.6 : 1.1));
      const settle = reduced ? 0 : 1 - Math.min(1, arr / 2.6);
      const settleZ = 1 + 0.07 * settle * settle;
      c.fillStyle = rgba(pal.shade, 1);
      c.fillRect(0, 0, w, h);

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
          c.globalAlpha = alpha * inK * (0.55 + 0.15 * Math.sin(t * 0.13));
          const mh = h * 0.2, mw = mh * 6;
          const my = Math.min(groundY - mh * 0.8, h * 0.62);
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
      if (b && logImg && pokeyAtlas) {
        const pad = H * 0.5;
        const ax0 = logX - pad, ay0 = feet - H * 1.35, aw = logW + pad * 2, ah = groundY - ay0 + H * 0.25;
        const pw = Math.ceil(aw * dpr), ph = Math.ceil(ah * dpr);
        if (actors.width !== pw || actors.height !== ph) {
          actors.width = rim.width = pw;
          actors.height = rim.height = ph;
        }
        const a = actors.getContext('2d')!;
        a.setTransform(1, 0, 0, 1, 0, 0);
        a.clearRect(0, 0, pw, ph);
        a.setTransform(dpr, 0, 0, dpr, -ax0 * dpr, -ay0 * dpr);
        a.imageSmoothingEnabled = true;
        a.imageSmoothingQuality = 'high';
        a.drawImage(logImg, logX, logTop, logW, logH);
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
          const g = a.createRadialGradient(x, feet + 1, 0, x, feet + 1, H * 0.26);
          g.addColorStop(0, `rgba(25,14,4,${0.5 * al})`);
          g.addColorStop(1, 'rgba(25,14,4,0)');
          a.fillStyle = g;
          a.beginPath();
          a.ellipse(x, feet + 1, H * 0.26, H * 0.055, 0, 0, Math.PI * 2);
          a.fill();
        }
        // Pokey, on the left, facing her; Meeca on the right, facing him
        const pose = pairPose(t, PAIR_STEPS);
        const breathe = 1 + Math.sin(t * 2.1) * 0.012;
        {
          const f = STD_FRAMES[pose.pokey] ?? STD_FRAMES.idle;
          const k = H / 205;
          a.save();
          a.globalAlpha = ph1.al;
          a.translate(logX + logW * POKEY_AT, feet + ph1.dy);
          a.scale(k * (2 - ph1.sq), k * breathe * ph1.sq);
          a.drawImage(pokeyAtlas, f.x, f.y, f.w, f.h, -f.ax, -f.ay, f.w, f.h);
          a.restore();
        }
        {
          const s = (H * 0.97) / 90;
          const bounce = pose.meecaHop ? Math.abs(Math.sin(pose.meecaHop * Math.PI)) * H * 0.07 : 0;
          a.save();
          a.globalAlpha = ph2.al;
          a.translate(logX + logW * MEECA_AT, feet + ph2.dy - bounce);
          a.scale(-s * (2 - ph2.sq), s * (1 + Math.sin(t * 2.3 + 1) * 0.01) * ph2.sq);
          drawMeecaFrame(a, pose.meeca, 1, 1, true);
          a.restore();
        }
        // ferns at the log's ends, in front of it
        a.globalAlpha = 1;
        drawPlantAt(a, 25, logX + logW * 0.04, groundY + H * 0.05, H * 0.62, false);
        drawPlantAt(a, 58, logX + logW * 0.5, groundY + H * 0.08, H * 0.42, true);
        drawPlantAt(a, 26, logX + logW * 0.97, groundY + H * 0.05, H * 0.56, true);
        // the world's light over all of it: warm from above, the undergrowth's shade at the foot
        a.setTransform(1, 0, 0, 1, 0, 0);
        a.globalCompositeOperation = 'source-atop';
        const gy0 = (feet - H - ay0) * dpr, gy1 = (groundY - ay0) * dpr;
        const grade = a.createLinearGradient(0, gy0, 0, gy1);
        grade.addColorStop(0, rgba(pal.light, 0.14));
        grade.addColorStop(0.55, rgba(pal.light, 0.03));
        grade.addColorStop(0.8, rgba(pal.shade, 0.18));
        grade.addColorStop(1, rgba(pal.shade, 0.5));
        a.fillStyle = grade;
        a.fillRect(0, 0, pw, ph);
        // a little of the world's darkness, so they sit in the dusk worlds and do not glow in them
        a.fillStyle = rgba(pal.shade, 0.22 * pal.dark);
        a.fillRect(0, 0, pw, ph);
        a.globalCompositeOperation = 'source-over';
        // the rim: their shape in the world's light, set a hair toward the light, drawn behind them
        const r = rim.getContext('2d')!;
        r.setTransform(1, 0, 0, 1, 0, 0);
        r.globalCompositeOperation = 'source-over';
        r.clearRect(0, 0, pw, ph);
        r.drawImage(actors, 0, 0);
        r.globalCompositeOperation = 'source-in';
        r.fillStyle = rgba(mix(pal.light, [255, 255, 255], 0.3), 1);
        r.fillRect(0, 0, pw, ph);
        // the shadow the log throws on the ground
        const lg = c.createRadialGradient(cx, groundY - logH * 0.04, 0, cx, groundY - logH * 0.04, logW * 0.6);
        lg.addColorStop(0, rgba(mix(pal.shade, [0, 0, 0], 0.6), 0.55));
        lg.addColorStop(1, rgba(pal.shade, 0));
        c.save();
        c.fillStyle = lg;
        c.translate(cx, groundY - logH * 0.04);
        c.scale(1, 0.16);
        c.translate(-cx, -(groundY - logH * 0.04));
        c.beginPath();
        c.arc(cx, groundY - logH * 0.04, logW * 0.6, 0, Math.PI * 2);
        c.fill();
        c.restore();
        c.save();
        c.globalAlpha = 0.34 * inK;
        c.drawImage(rim, ax0 - 1.3, ay0 - 1.8, aw, ah);
        c.globalAlpha = inK;
        c.drawImage(actors, ax0, ay0, aw, ah);
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
      cache.clear();
    };
  }, [key, hold, stageSelector]);

  return <canvas ref={cvRef} className="ts-scene" aria-hidden="true" />;
});
TitleScene.displayName = 'TitleScene';

export type { PoseStep };
