import React, { useEffect, useRef } from 'react';

/**
 * A world's painted backdrop (the strips in src/assets/backdrops) as a slow panorama for the title screen and the world map: the far,
 * middle and near strips drift at their own speeds, each repeated mirrored every other time, and with several worlds the vista
 * crossfades from one to the next. Only the world on show and the one coming next are kept decoded (about 5 MB each).
 */
let FILES: Record<string, string> = {};
try {
  FILES = import.meta.glob('../assets/backdrops/w*-*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
} catch {
  FILES = {};
}
const url = (w: number, p: 'far' | 'mid' | 'near') => FILES[`../assets/backdrops/w${w}-${p}.webp`] ?? null;

interface Strips { far: HTMLImageElement | null; mid: HTMLImageElement | null; near: HTMLImageElement | null; ready: boolean }

function loadWorld(w: number): Strips {
  const s: Strips = { far: null, mid: null, near: null, ready: false };
  const parts = (['far', 'mid', 'near'] as const).filter((p) => url(w, p));
  let left = parts.length;
  for (const p of parts) {
    const im = new Image();
    im.decoding = 'async';
    im.onload = im.onerror = () => {
      if (im.naturalWidth) s[p] = im;
      if (--left === 0) s.ready = !!s.far;
    };
    im.src = url(w, p)!;
  }
  if (!parts.length) s.ready = false;
  return s;
}

export const PaintedVista: React.FC<{
  worlds: number[];
  /** seconds each world stays before the next fades in */
  hold?: number;
  /** px per second the middle strip drifts (the far one a third of that, the near one about twice) */
  pan?: number;
  /** draw the near strip (the low foreground) */
  near?: boolean;
  className?: string;
}> = ({ worlds, hold = 14, pan = 9, near = true, className }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const key = worlds.join(',');
  useEffect(() => {
    const list = key.split(',').map(Number).filter((n) => n > 0);
    if (!list.length) return;
    const cache = new Map<number, Strips>();
    const get = (w: number) => {
      let s = cache.get(w);
      if (!s) { s = loadWorld(w); cache.set(w, s); }
      return s;
    };
    let raf = 0;
    const t0 = performance.now();
    const FADE = 1.6;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const cv = ref.current;
      if (!cv || document.hidden) return;
      const rect = cv.getBoundingClientRect();
      const w = Math.max(1, rect.width), h = Math.max(1, rect.height);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      const c = cv.getContext('2d');
      if (!c) return;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const t = (performance.now() - t0) / 1000;
      const idx = list.length > 1 ? Math.floor(t / hold) % list.length : 0;
      const into = list.length > 1 ? t - Math.floor(t / hold) * hold : 0;
      const cur = get(list[idx]);
      const nextW = list[(idx + 1) % list.length];
      // the next world loads while this one shows; anything else is let go
      if (list.length > 1) {
        get(nextW);
        for (const k of [...cache.keys()]) if (k !== list[idx] && k !== nextW) cache.delete(k);
      }
      const prev = list.length > 1 && into < FADE ? cache.get(list[(idx - 1 + list.length) % list.length]) : undefined;
      c.fillStyle = '#16261a';
      c.fillRect(0, 0, w, h);
      const paint = (s: Strips, alpha: number) => {
        if (!s.ready || alpha <= 0) return;
        c.globalAlpha = alpha;
        const strip = (im: HTMLImageElement | null, speed: number, top: number, height: number) => {
          if (!im) return;
          const k = height / im.naturalHeight;
          const tw = im.naturalWidth * k;
          const off = -((t * speed) % (tw * 2));
          for (let x = off, i = 0; x < w; x += tw, i++) {
            if (x + tw < 0) continue;
            if (i % 2) {
              c.save();
              c.translate(x + tw, top);
              c.scale(-1, 1);
              c.drawImage(im, 0, 0, tw, height);
              c.restore();
            } else c.drawImage(im, x, top, tw, height);
          }
        };
        // the far and middle strips fill the frame; the near strip covers the lower part, as it does behind a stage
        strip(s.far, pan * 0.45, 0, h * 1.02);
        strip(s.mid, pan, -h * 0.02, h * 1.02);
        if (near) strip(s.near, pan * 1.8, h * 0.28, h * 0.8);
        c.globalAlpha = 1;
      };
      if (prev && prev.ready) {
        paint(prev, 1);
        paint(cur, Math.min(1, into / FADE));
      } else paint(cur, 1);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      cache.clear();
    };
  }, [key, hold, pan, near]);
  return <canvas ref={ref} className={className} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true" />;
};
