import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { StoryPanel } from '../game/story.ts';
import { drawStoryScene, preloadScenePhotos, preloadScenePlates, releaseStoryArt, SCENE_H } from '../game/storyArt.ts';
import { sound } from '../game/audio.ts';
import { stingDue } from '../audio/scenes.ts';
import { typeSchedule } from '../game/storyTyping.ts';
import { Icon, type IconName } from './icons/index.tsx';
import { SpeakerMark } from './SpeakerMark.tsx';

interface StoryPlayerProps {
  panels: StoryPanel[];
  onFinish: () => void;
  finishLabel?: string;
  /** the glyph after the finish label (default an arrow) */
  finishIcon?: IconName;
  skipLabel?: string;
}

/** each speaker's colour (their picture comes from SpeakerMark) */
const SPEAKERS: Record<string, { dot: string }> = {
  Pokey: { dot: '#ffb02e' },
  Meeca: { dot: '#f58ab4' },
  Narrator: { dot: '#8fd3f0' },
  Dot: { dot: '#4fd18b' },
  Grandma: { dot: '#c9a8e8' },
  'Lieutenant Pell': { dot: '#9aa3ad' },
  Squirrel: { dot: '#c98a4b' },
  'General Iron-Claw': { dot: '#e0524a' },
  Grandfather: { dot: '#b9a37a' },
  Thornbark: { dot: '#7a9a3c' },
  'Venom Fang': { dot: '#7bd34f' },
  'Crocus Rex': { dot: '#4aa87a' },
  'Shadow Prowler': { dot: '#8a7bd6' },
  'Sky Sovereign': { dot: '#f0c04a' },
  'Tarantula Queen': { dot: '#b05ad6' },
  'Marsh Reaver': { dot: '#5f9a8a' },
  'Stone Idol Golem': { dot: '#a8a090' },
  'Night-Wing Monarch': { dot: '#6a6ad8' },
  'Magma Drake': { dot: '#ff7a3a' },
};

/** a lullaby line is marked with music notes in the script: show them as the game's own note icon instead of a font glyph */
function lyrics(text: string): React.ReactNode {
  if (!text.includes('♪')) return text;
  return text.split('♪').flatMap((part, i, all) => (i < all.length - 1 ? [part, <Icon key={i} name="note" size="0.95em" className="sp-note" />] : [part]));
}

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
/** upright the picture is a 4:3 window just above the words (it was 16:9, centred, a third of the screen with a dark band under it) */
const UPRIGHT_ASPECT = 0.75;
/** its height on this screen: never so tall the words lose their room (about 300 px for the box and the top chips) */
/** the room kept for the words under it */
const UPRIGHT_WORDS = 290;
const uprightH = (v: { w: number; h: number }) => Math.round(Math.min(v.w * UPRIGHT_ASPECT, Math.max(160, v.h - UPRIGHT_WORDS - 60)));

export const StoryPlayer: React.FC<StoryPlayerProps> = ({ panels, onFinish, finishLabel = 'Continue', finishIcon = 'arrow', skipLabel = 'Skip' }) => {
  const [idx, setIdx] = useState(0);
  // the photographs and backdrops of the next panels: start loading them now (only a few ahead: holding every picture of a story at
  // once came to about 300 MB, memory audit 2026-10-25)
  useEffect(() => {
    const ahead = panels.slice(idx, idx + 3);
    preloadScenePhotos(ahead.map((p) => p.scene.photo?.key));
    preloadScenePlates(ahead.slice(1).map((p) => p.scene.plate));
  }, [panels, idx]);
  // a closed story lets its pictures go
  useEffect(() => () => releaseStoryArt(), []);
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
    const when = typeSchedule(panel.text);
    let k = 0;
    let raf = 0;
    const tick = (now: number) => {
      while (k < when.length && when[k] <= now - start) k++;
      const n = k;
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

  // a panel's own sting plays once, as its picture appears: after the title card has gone and the first letter is typed (at once for a picture
  // with no words). Going Back and forward again does not play it a second time. (The first pass for a new panel still holds the last panel's
  // card and typing state, so it never counts.)
  const stung = useRef(new Set<number>());
  const lastIdx = useRef(-1);
  useEffect(() => {
    const fresh = lastIdx.current !== idx;
    lastIdx.current = idx;
    if (!panel.sting || stung.current.has(idx)) return;
    if (!stingDue({ fresh, wantsCard, cardUp, shown, textLength: panel.text.length })) return;
    stung.current.add(idx);
    sound.storySting(panel.sting);
  }, [idx, panel, wantsCard, cardUp, shown]);

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
  // where the figures' feet may come down to, as a share of the picture's height: sideways, a little above the words box laid over the
  // bottom of it (measured, since its height follows the words); upright the words are under the picture, so just inside its bottom
  const boxRef = useRef<HTMLDivElement | null>(null);
  const feetRef = useRef(0.95);
  useLayoutEffect(() => {
    const cv = canvasRef.current;
    const bx = boxRef.current;
    if (!wide || !cv || !bx) {
      feetRef.current = 0.95;
      return;
    }
    const measure = () => {
      const c = cv.getBoundingClientRect();
      const top = bx.getBoundingClientRect().top;
      feetRef.current = c.height > 0 ? Math.max(0.5, Math.min(0.95, (top - c.top) / c.height - 0.06)) : 0.95;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(bx);
    return () => ro.disconnect();
  }, [wide, idx, cardUp, view.w, view.h]);

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
    // (sharp on a phone either way: ST-1, the old 1.25 / 1.5 caps had the browser stretch the picture 2.1x on a 1080p phone)
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = wide ? view.w : view.w;
    const cssH = wide ? view.h : uprightH(view);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    // scene space: 540 tall; as wide as the screen needs
    const sh = SCENE_H;
    // (upright the window is 4:3, so the scene shows 720 units across: the narrowest a sideways screen already shows)
    const sw = Math.max(720, Math.min(1500, sh * (cssW / cssH)));
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
      drawStoryScene(ctx, panel.scene, (now - t0) / 1000, sw, sh, lift, feetRef.current);
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

  const who = SPEAKERS[panel.speaker] ?? { dot: '#ff7a6a' };
  const narrator = panel.speaker === 'Narrator';
  const card = splitChapter(panel.chapter);

  const box = (
    <div ref={boxRef} className={`sp-box ${wide ? 'sp-box-over' : ''}`} onClick={next}>
      {!narrator && (
        <span className="sp-name" style={{ ['--dot' as string]: who.dot }}>
          <SpeakerMark name={panel.speaker} size={22} talking={!done} />
          {panel.speaker}
        </span>
      )}
      <p className={`sp-text ${narrator ? 'narr' : ''}`}>
        {lyrics(panel.text.slice(0, shown))}
        <span className="opacity-0">{lyrics(panel.text.slice(shown))}</span>
      </p>
      {panel.tip && done && (
        <p className="sp-tip">
          <Icon name="bulb" size={16} /> {panel.tip}
        </p>
      )}
      <div className="sp-foot">
        {panels.length <= 12 ? (
          <div className="flex gap-1.5 items-center">
            {panels.map((_, i) => (
              <span key={i} className={`sp-dot ${i === idx ? 'on' : i < idx ? 'past' : ''}`} />
            ))}
          </div>
        ) : (
          // a long scene: a dot for every picture would run off the screen, so it is a bar
          <div className="sp-bar" role="progressbar" aria-valuemin={1} aria-valuemax={panels.length} aria-valuenow={idx + 1}>
            <i style={{ width: `${((idx + 1) / panels.length) * 100}%` }} />
          </div>
        )}
        <div className="flex gap-2">
          {idx > 0 && (
            <button type="button" className="sp-back" onClick={(e) => { e.stopPropagation(); back(); }}>
              <Icon name="arrow" size={13} rotate={180} /> Back
            </button>
          )}
          <button type="button" className="sp-next" onClick={(e) => { e.stopPropagation(); next(); }}>
            {last && done ? (
              <>
                {finishLabel} <Icon name={finishIcon} size={15} />
              </>
            ) : (
              <>
                Next <Icon name="arrow" size={15} />
              </>
            )}
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
        <div className="flex-1 min-h-0 flex items-end pt-12" style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(40,70,48,.55), rgba(7,13,9,1) 70%)' }}>
          <canvas ref={canvasRef} onClick={next} className="w-full cursor-pointer shadow-2xl" style={{ height: uprightH(view) }} />
        </div>
      )}
      {wide && <div className="absolute inset-x-0 bottom-0 h-[44%] pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(6,12,8,.82), rgba(6,12,8,0))' }} />}

      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 px-3 sm:px-5 pt-2.5">
        <span className={`ui-chip transition-opacity duration-300 ${cardUp ? 'opacity-0' : 'opacity-100'}`}>{panel.chapter}</span>
        <button type="button" onClick={onFinish} className="ui-chip ui-chip-btn">
          {skipLabel} <Icon name="arrow" size={13} />
        </button>
      </div>

      {/* (a steady height for six lines of words, so the picture above stays put from one panel to the next; a longer line still grows it) */}
      {!wide && <div className="shrink-0 px-3 pb-3 pt-3" style={{ minHeight: UPRIGHT_WORDS }}>{!cardUp && box}</div>}
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
