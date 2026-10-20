import React, { useEffect, useRef } from 'react';
import { HERO_FRAMES } from '../game/heroAtlasData.ts';
import { makeTintedCanvas, type Coat } from '../game/heroTint.ts';
import { STD_ATLAS_URL, standardEnabled, stdUi } from '../game/heroStandard.ts';

const atlasUrl = new URL('../assets/hero/hero-atlas.webp', import.meta.url).href;
let atlasImg: HTMLImageElement | null = null;
let stdImg: HTMLImageElement | null = null;
const tinted: Partial<Record<Coat, HTMLCanvasElement | null>> = {};
const stdTinted: Partial<Record<Coat, HTMLCanvasElement | null>> = {};

function withAtlas(std: boolean, cb: (img: HTMLImageElement) => void) {
  let img: HTMLImageElement;
  if (std) {
    if (!stdImg) {
      stdImg = new Image();
      stdImg.src = STD_ATLAS_URL;
    }
    img = stdImg;
  } else {
    if (!atlasImg) {
      atlasImg = new Image();
      atlasImg.src = atlasUrl;
    }
    img = atlasImg;
  }
  if (img.complete && img.naturalWidth) cb(img);
  else img.addEventListener('load', () => cb(img), { once: true });
}

/** Pokey standing, in the given coat (for the reward cards) */
export const CoatPreview: React.FC<{ coat: Coat; size?: number }> = ({ coat, size = 64 }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const std = standardEnabled();
    withAtlas(std, (img) => {
      const c = ref.current;
      const f = (std ? stdUi('idle_a') : null) ?? HERO_FRAMES.idle_a;
      if (!c || !f) return;
      const cache = std ? stdTinted : tinted;
      if (coat !== 'none' && cache[coat] === undefined) cache[coat] = makeTintedCanvas(img, coat);
      const src: CanvasImageSource = (coat !== 'none' && cache[coat]) || img;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = size * dpr;
      c.height = size * dpr;
      const x = c.getContext('2d');
      if (!x) return;
      x.clearRect(0, 0, c.width, c.height);
      const k = Math.min((size * dpr) / f.w, (size * dpr) / f.h);
      x.imageSmoothingQuality = 'high';
      x.drawImage(src, f.x, f.y, f.w, f.h, (c.width - f.w * k) / 2, c.height - f.h * k, f.w * k, f.h * k);
    });
  }, [coat, size]);
  return <canvas ref={ref} style={{ width: size, height: size }} aria-hidden />;
};
