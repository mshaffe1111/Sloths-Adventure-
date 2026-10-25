import React, { useEffect, useRef } from 'react';
import { HERO_FRAMES } from '../game/heroAtlasData.ts';
import { tintImageData, type Coat } from '../game/heroTint.ts';
import { STD_ATLAS_URL, standardEnabled, stdUi } from '../game/heroStandard.ts';

const atlasUrl = new URL('../assets/hero/hero-atlas.webp', import.meta.url).href;
let atlasImg: HTMLImageElement | null = null;
let stdImg: HTMLImageElement | null = null;

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
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = size * dpr;
      c.height = size * dpr;
      const x = c.getContext('2d', { willReadFrequently: coat !== 'none' });
      if (!x) return;
      x.clearRect(0, 0, c.width, c.height);
      const k = Math.min((size * dpr) / f.w, (size * dpr) / f.h);
      x.imageSmoothingQuality = 'high';
      x.drawImage(img, f.x, f.y, f.w, f.h, (c.width - f.w * k) / 2, c.height - f.h * k, f.w * k, f.h * k);
      // the coat is laid on the little picture itself: recolouring a copy of the whole sheet for each coat cost up to 32 MB
      if (coat !== 'none') {
        try {
          const d = x.getImageData(0, 0, c.width, c.height);
          tintImageData(d.data, coat);
          x.putImageData(d, 0, 0);
        } catch {
          /* no pixel access: the plain coat shows */
        }
      }
    });
  }, [coat, size]);
  return <canvas ref={ref} style={{ width: size, height: size }} aria-hidden />;
};
