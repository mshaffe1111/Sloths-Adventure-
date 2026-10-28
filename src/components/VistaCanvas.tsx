import React, { useEffect, useRef } from 'react';
import { renderVista, dropVista } from '../game/scenery.ts';

/**
 * The little round world pictures on the map's medallions: each world's scenery (scenery.ts) baked small, one at a time. (The menus'
 * living backdrop is the title's own scene now: title/TitleScene.tsx SceneBackdrop.)
 */
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
