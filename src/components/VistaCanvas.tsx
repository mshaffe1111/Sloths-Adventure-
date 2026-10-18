import React, { useEffect, useRef } from 'react';
import { renderVista, warmVista, dropVista, VISTA_SCALE } from '../game/scenery.ts';

/**
 * A live painted backdrop for the menus: the same parallax scenery the stages use, baked at a fraction of the
 * resolution (see scenery.ts) and panned slowly. Give it one world, or a list to cycle through with a crossfade.
 */
interface VistaCanvasProps {
  worlds: number[];
  /** seconds each world is shown (only matters for more than one) */
  hold?: number;
  /** px per second the camera drifts */
  pan?: number;
  /** draw the foreground leaves + weather over everything */
  front?: boolean;
  className?: string;
  scale?: number;
}

const FPS = 24;
const FADE = 1.6;

export const VistaCanvas: React.FC<VistaCanvasProps> = ({ worlds, hold = 15, pan = 16, front = true, className, scale = VISTA_SCALE }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const key = worlds.join(',');

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d', { alpha: false });
    if (!ctx) return;
    const list = worlds.length ? worlds : [1];
    const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let alive = true;
    let last = 0;
    const t0 = performance.now();
    const cams = list.map((_, i) => 400 + i * 970);

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
      }
    };

    // warm the first world straight away, the rest one at a time while the first is on screen
    let warmIdx = 0;
    let warmTimer = 0;
    const warmNext = () => {
      if (!alive || warmIdx >= list.length) return;
      warmVista(list[warmIdx++], scale);
      warmTimer = window.setTimeout(warmNext, 900);
    };
    warmNext();

    const frame = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (now - last < 1000 / FPS) return;
      last = now;
      fit();
      const t = reduced ? 0 : (now - t0) / 1000;
      const w = cv.width;
      const h = cv.height;
      const n = list.length;
      const cyc = hold + FADE;
      const idx = n > 1 ? Math.floor(t / cyc) % n : 0;
      const into = n > 1 ? t % cyc : 0;
      const cam = (i: number) => cams[i] + t * pan;
      renderVista(ctx, list[idx], cam(idx), w, h, t, front, scale);
      if (n > 1 && into > hold) {
        // crossfade into the next world, drawn on top at rising opacity through a scratch canvas
        const nxt = (idx + 1) % n;
        const k = (into - hold) / FADE;
        const tmp = scratch(w, h);
        const tc = tmp.getContext('2d')!;
        renderVista(tc, list[nxt], cam(nxt), w, h, t, front, scale);
        ctx.globalAlpha = k * k * (3 - 2 * k);
        ctx.drawImage(tmp, 0, 0);
        ctx.globalAlpha = 1;
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(warmTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, hold, pan, front, scale]);

  return <canvas ref={ref} className={className ?? 'absolute inset-0 w-full h-full'} aria-hidden="true" />;
};

let scratchCv: HTMLCanvasElement | null = null;
function scratch(w: number, h: number) {
  if (!scratchCv) scratchCv = document.createElement('canvas');
  if (scratchCv.width !== w || scratchCv.height !== h) {
    scratchCv.width = w;
    scratchCv.height = h;
  }
  return scratchCv;
}

// ───────────────────────────── medallion thumbnails ─────────────────────────────

const thumbs = new Map<number, HTMLCanvasElement>();
const queue: number[] = [];
let pumping = false;
const THUMB_SCALE = 0.2;

function bakeThumb(world: number) {
  if (thumbs.has(world)) return;
  const cv = document.createElement('canvas');
  cv.width = 128;
  cv.height = 128;
  const c = cv.getContext('2d')!;
  // a square crop of the scenery: draw wide (so the parallax reads) then centre it
  c.save();
  c.beginPath();
  c.rect(0, 0, 128, 128);
  c.clip();
  c.translate(-31, 0);
  renderVista(c, world, 900, 190, 128, 0, true, THUMB_SCALE);
  c.restore();
  dropVista(world, THUMB_SCALE);
  thumbs.set(world, cv);
}

function pump() {
  if (pumping) return;
  pumping = true;
  const step = () => {
    const w = queue.shift();
    if (w === undefined) {
      pumping = false;
      return;
    }
    try {
      bakeThumb(w);
    } catch {
      /* a failed thumbnail just stays blank */
    }
    window.dispatchEvent(new CustomEvent('sloth-thumb', { detail: w }));
    setTimeout(step, 60);
  };
  setTimeout(step, 40);
}

export function requestThumbs(worlds: number[]) {
  for (const w of worlds) if (!thumbs.has(w) && !queue.includes(w)) queue.push(w);
  pump();
}

/** a little round picture of a world, filled in as soon as it has been baked */
export const WorldThumb: React.FC<{ world: number; size: number; className?: string }> = ({ world, size, className }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const paint = () => {
      const src = thumbs.get(world);
      const cv = ref.current;
      if (!src || !cv) return;
      const c = cv.getContext('2d')!;
      c.clearRect(0, 0, cv.width, cv.height);
      c.drawImage(src, 0, 0, cv.width, cv.height);
    };
    paint();
    const on = (e: Event) => {
      if ((e as CustomEvent).detail === world) paint();
    };
    window.addEventListener('sloth-thumb', on);
    return () => window.removeEventListener('sloth-thumb', on);
  }, [world]);
  const px = Math.round(size * Math.min(window.devicePixelRatio || 1, 2));
  return <canvas ref={ref} width={px} height={px} className={className} style={{ width: size, height: size }} aria-hidden="true" />;
};
