import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { StoryPanel } from '../game/story.ts';
import { drawStoryScene, preloadScenePhotos, SCENE_W, SCENE_H } from '../game/storyArt.ts';
import { sound } from '../game/audio.ts';

interface StoryPlayerProps {
  panels: StoryPanel[];
  onFinish: () => void;
  finishLabel?: string;
  skipLabel?: string;
}

const SPEAKERS: Record<string, { dot: string; icon: string }> = {
  Slomatt: { dot: '#ffb02e', icon: '🦥' },
  Jennifur: { dot: '#f58ab4', icon: '🌸' },
  Narrator: { dot: '#8fd3f0', icon: '📖' },
  Dot: { dot: '#4fd18b', icon: '🐦' },
  Grandma: { dot: '#c9a8e8', icon: '🌿' },
  Officer: { dot: '#9aa3ad', icon: '🎖' },
  'General Iron-Claw': { dot: '#e0524a', icon: '⚔' },
};

/** "WORLD 3 · MOSSY GROTTO" -> the small line and the big line of the title card */
function splitChapter(chapter: string): { kicker: string; title: string } {
  const i = chapter.indexOf(' · ');
  if (i > 0) return { kicker: chapter.slice(0, i), title: chapter.slice(i + 3) };
  return { kicker: 'CHAPTER', title: chapter };
}
const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s'’-])([a-z])/g, (_, a: string, b: string) => a + b.toUpperCase());

const CARD_MS = 2600;
const FPS = 30;

/** Full-screen cinematic: the stage scenery behind the actors, a title card for each chapter, and a dialogue panel. */
export const StoryPlayer: React.FC<StoryPlayerProps> = ({ panels, onFinish, finishLabel = 'Continue', skipLabel = 'Skip' }) => {
  const [idx, setIdx] = useState(0);
  // photographs the story holds up: start loading them now
  useEffect(() => {
    preloadScenePhotos(panels.map((p) => p.scene.photo?.key));
  }, [panels]);
  const [shown, setShown] = useState(0);
  const panel = panels[idx];
  const prevChapter = idx > 0 ? panels[idx - 1].chapter : null;
  const wantsCard = panel.chapter !== prevChapter;
  const [cardUp, setCardUp] = useState(wantsCard);
  const done = shown >= panel.text.length;
  const last = idx === panels.length - 1;

  // a new chapter opens with its title card
  useEffect(() => {
    setCardUp(wantsCard);
    if (!wantsCard) return;
    const id = window.setTimeout(() => setCardUp(false), CARD_MS);
    return () => clearTimeout(id);
  }, [idx, wantsCard]);

  // typewriter (time-based so a slow frame never stalls the text); waits for the title card
  useEffect(() => {
    setShown(0);
    if (cardUp) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const n = Math.min(panel.text.length, Math.floor((now - start) / 26));
      setShown((prev) => (prev === n ? prev : Math.max(prev, n)));
      if (n < panel.text.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [idx, panel.text, cardUp]);

  // the music follows the story: each panel's chapter and mood choose the piece (same piece = no restart)
  useEffect(() => {
    sound.storyPanel(panel);
  }, [panel]);

  // a soft voice blip for each letter as it is typed (not when the whole line is skipped to)
  const spoken = useRef(0);
  useEffect(() => {
    spoken.current = 0;
  }, [idx]);
  useEffect(() => {
    const from = spoken.current;
    spoken.current = shown;
    if (shown - from > 4) return;
    for (let i = from; i < shown; i++) sound.speak(panel.speaker, panel.text[i] ?? ' ', i);
  }, [shown, panel]);

  // ── the picture: full screen on landscape, a 16:9 window above the text on tall screens
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [view, setView] = useState({ w: 844, h: 390 });
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const fit = () => setView({ w: el.clientWidth, h: el.clientHeight });
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const wide = view.w / view.h >= 1.3;

  const startRef = useRef(performance.now());
  // (a picture's own timeline starts when the title card has gone, so an action beat is never played out behind the card)
  useEffect(() => {
    startRef.current = performance.now();
  }, [idx, cardUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, wide ? 1.25 : 1.5);
    const cssW = wide ? view.w : view.w;
    const cssH = wide ? view.h : view.w * (SCENE_H / SCENE_W);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    // scene space: 540 tall; as wide as the screen needs
    const sh = SCENE_H;
    const sw = wide ? Math.max(720, Math.min(1500, sh * (cssW / cssH))) : SCENE_W;
    const sc = canvas.height / sh;
    const lift = wide ? 0.09 : 0;
    const t0 = performance.now();
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      last = now;
      ctx.setTransform(sc, 0, 0, sc, 0, 0);
      drawStoryScene(ctx, panel.scene, (now - t0) / 1000, sw, sh, lift);
      // dip in from dark at every new picture
      const k = Math.max(0, 1 - (now - startRef.current) / 520);
      if (k > 0) {
        ctx.fillStyle = `rgba(6,10,8,${k * 0.9})`;
        ctx.fillRect(0, 0, sw, sh);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [panel.scene, wide, view.w, view.h, cardUp]);

  const next = useCallback(() => {
    if (cardUp) {
      setCardUp(false);
      return;
    }
    if (!done) {
      setShown(panel.text.length);
      return;
    }
    if (last) onFinish();
    else setIdx((i) => i + 1);
  }, [cardUp, done, last, onFinish, panel.text.length]);

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

  const who = SPEAKERS[panel.speaker] ?? { dot: '#ff7a6a', icon: '⚔' };
  const narrator = panel.speaker === 'Narrator';
  const card = splitChapter(panel.chapter);

  const box = (
    <div className={`sp-box ${wide ? 'sp-box-over' : ''}`} onClick={next}>
      {!narrator && (
        <span className="sp-name" style={{ ['--dot' as string]: who.dot }}>
          <i>{who.icon}</i>
          {panel.speaker}
        </span>
      )}
      <p className={`sp-text ${narrator ? 'narr' : ''}`}>
        {panel.text.slice(0, shown)}
        <span className="opacity-0">{panel.text.slice(shown)}</span>
      </p>
      {panel.tip && done && <p className="sp-tip">💡 {panel.tip}</p>}
      <div className="sp-foot">
        <div className="flex gap-1.5 items-center">
          {panels.map((_, i) => (
            <span key={i} className={`sp-dot ${i === idx ? 'on' : i < idx ? 'past' : ''}`} />
          ))}
        </div>
        <div className="flex gap-2">
          {idx > 0 && (
            <button type="button" className="sp-back" onClick={(e) => { e.stopPropagation(); back(); }}>
              ◀ Back
            </button>
          )}
          <button type="button" className="sp-next" onClick={(e) => { e.stopPropagation(); next(); }}>
            {last && done ? finishLabel : 'Next ▶'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 bg-[#070d09] text-white select-none font-game overflow-hidden flex flex-col">
      {wide ? (
        <canvas ref={canvasRef} onClick={next} className="absolute inset-0 w-full h-full cursor-pointer" />
      ) : (
        <div className="flex-1 min-h-0 flex items-center pt-12" style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(40,70,48,.55), rgba(7,13,9,1) 70%)' }}>
          <canvas ref={canvasRef} onClick={next} className="w-full cursor-pointer shadow-2xl" style={{ height: view.w * (SCENE_H / SCENE_W) }} />
        </div>
      )}
      {wide && <div className="absolute inset-x-0 bottom-0 h-[44%] pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(6,12,8,.82), rgba(6,12,8,0))' }} />}

      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 px-3 sm:px-5 pt-2.5">
        <span className={`ui-chip transition-opacity duration-300 ${cardUp ? 'opacity-0' : 'opacity-100'}`}>{panel.chapter}</span>
        <button type="button" onClick={onFinish} className="ui-chip ui-chip-btn">
          {skipLabel} ➔
        </button>
      </div>

      {!wide && <div className="shrink-0 px-3 pb-3 pt-3" style={{ minHeight: 190 }}>{!cardUp && box}</div>}
      {wide && !cardUp && (
        <div className="absolute inset-x-0 bottom-0 z-10 px-3 sm:px-6" style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom, 0px))' }}>
          {box}
        </div>
      )}

      {cardUp && (
        <div className="sp-card" onClick={next} key={`card-${idx}`}>
          <div className="sp-card-k">{card.kicker}</div>
          <div className="sp-card-t">{titleCase(card.title)}</div>
          <div className="sp-card-rule" />
          <div className="sp-card-hint">tap to continue</div>
        </div>
      )}
    </div>
  );
};
