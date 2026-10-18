import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { StoryPanel } from '../game/story.ts';
import { drawStoryScene, SCENE_W, SCENE_H } from '../game/storyArt.ts';

interface StoryPlayerProps {
  panels: StoryPanel[];
  onFinish: () => void;
  finishLabel?: string;
  skipLabel?: string;
}

const SPEAKER_COLORS: Record<string, string> = {
  Slomatt: 'bg-amber-500 text-amber-950',
  Jennifur: 'bg-pink-400 text-pink-950',
  Narrator: 'bg-sky-300 text-sky-950',
};

/** Full-screen cinematic: canvas scene on top, storybook dialogue box below. */
export const StoryPlayer: React.FC<StoryPlayerProps> = ({
  panels,
  onFinish,
  finishLabel = 'Continue',
  skipLabel = 'Skip',
}) => {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const panel = panels[idx];
  const done = shown >= panel.text.length;
  const last = idx === panels.length - 1;

  // typewriter (time-based so a slow frame never stalls the text)
  useEffect(() => {
    setShown(0);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const n = Math.min(panel.text.length, Math.floor((now - start) / 26));
      setShown((prev) => (prev === n ? prev : Math.max(prev, n)));
      if (n < panel.text.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [idx, panel.text]);

  // fit the 16:9 scene inside the available space
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 640, h: 360 });
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => {
      const bw = el.clientWidth;
      const bh = el.clientHeight;
      const w = Math.max(200, Math.min(bw, bh * (SCENE_W / SCENE_H)));
      setSize({ w, h: w * (SCENE_H / SCENE_W) });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // scene animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SCENE_W * dpr;
    canvas.height = SCENE_H * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawStoryScene(ctx, panel.scene, (now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [panel.scene]);

  const next = useCallback(() => {
    if (!done) {
      setShown(panel.text.length);
      return;
    }
    if (last) onFinish();
    else setIdx((i) => i + 1);
  }, [done, last, onFinish, panel.text.length]);

  const back = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        next();
      } else if (e.key === 'ArrowLeft') {
        back();
      } else if (e.key === 'Escape') {
        onFinish();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [next, back, onFinish]);

  const chip = SPEAKER_COLORS[panel.speaker] ?? 'bg-red-400 text-red-950';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center bg-stone-950 text-white select-none font-game">
      <div className="w-full max-w-5xl flex items-center justify-between px-4 pt-3 pb-2">
        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-xl text-[11px] sm:text-xs font-black tracking-widest uppercase">
          {panel.chapter}
        </span>
        <button
          type="button"
          onClick={onFinish}
          className="bg-black/40 hover:bg-black/60 active:scale-95 border border-stone-600/50 hover:border-emerald-400 text-stone-300 hover:text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
        >
          {skipLabel} ➔
        </button>
      </div>

      <div ref={boxRef} className="w-full max-w-5xl px-3 flex-1 min-h-0 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onClick={next}
          className="rounded-2xl border-2 border-emerald-500/40 shadow-2xl cursor-pointer"
          style={{ width: size.w, height: size.h }}
        />
      </div>

      <div className="w-full max-w-5xl px-3 pb-4 pt-3">
        <div
          onClick={next}
          className="relative bg-gradient-to-b from-stone-900/95 to-black/95 border-2 border-amber-400/50 rounded-2xl p-4 sm:p-5 cursor-pointer shadow-2xl"
        >
          <span className={`absolute -top-3.5 left-4 px-3 py-0.5 rounded-lg text-xs sm:text-sm font-black tracking-wide ${chip}`}>
            {panel.speaker}
          </span>
          <p className="text-base sm:text-xl leading-relaxed text-stone-50 min-h-[3.5rem] sm:min-h-[4.5rem] pt-1">
            {panel.text.slice(0, shown)}
            <span className="opacity-0">{panel.text.slice(shown)}</span>
          </p>
          {panel.tip && done && (
            <p className="mt-2 text-xs sm:text-sm text-emerald-300 font-sans">💡 {panel.tip}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-1.5">
              {panels.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-amber-400' : 'w-1.5 bg-stone-600'}`} />
              ))}
            </div>
            <div className="flex gap-2">
              {idx > 0 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); back(); }}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold"
                >
                  ◀ Back
                </button>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="px-5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-sm font-black shadow-lg"
              >
                {last && done ? finishLabel : 'Next ▶'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
