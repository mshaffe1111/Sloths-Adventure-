import React from 'react';
import { drawScene, SCENE_H, SCENE_LEN, SCENE_W } from '../game/journalScenes.ts';
import type { DemoId } from '../game/movesJournal.ts';

/**
 * One journal page's little scene, playing on a loop (journalScenes.ts). Only one plays at a time (the page that is open), since the
 * demo Pokey has one memory of his own. With reduced motion asked for, it holds a single still.
 */
export const JournalDemo: React.FC<{ demo: DemoId; label: string; className?: string }> = ({ demo, label, className }) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    let still = false;
    try {
      still = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    } catch {
      /* no matchMedia */
    }
    let raf = 0;
    const t0 = performance.now();
    const len = SCENE_LEN[demo];
    const frame = (now: number) => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(c.clientWidth * dpr));
      const h = Math.max(1, Math.round(c.clientHeight * dpr));
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
        ctx.imageSmoothingQuality = 'high';
      }
      const sec = (now - t0) / 1000;
      const t = still ? len * 0.55 : sec % len;
      // cover the box with the scene, centred
      const s = Math.max(w / SCENE_W, h / SCENE_H);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.setTransform(s, 0, 0, s, (w - SCENE_W * s) / 2, (h - SCENE_H * s) / 2);
      try {
        drawScene(ctx, demo, t, still ? t : sec);
      } catch (err) {
        console.error('journal demo', err);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [demo]);
  return <canvas ref={ref} className={className} role="img" aria-label={label} />;
};
