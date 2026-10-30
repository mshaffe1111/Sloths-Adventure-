import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { StoryPanel } from '../game/story.ts';
import { isEasy } from '../game/difficulty.ts';
import { holdStep, LETGO, thunderShake, type HoldPhase } from './storyHold.ts';
import { noticed } from '../game/storyNotice.ts';
import { loadFinds } from '../game/finds.ts';
import { loadBadgeStore } from '../game/badgeStore.ts';
import { drawStoryScene, preloadSceneCards, preloadScenePhotos, preloadScenePlates, releaseStoryArt, SCENE_H, warmStoryCast } from '../game/storyArt.ts';
import { sound } from '../game/audio.ts';
import { stingDue } from '../audio/scenes.ts';
import { typeSchedule } from '../game/storyTyping.ts';
import { directScene } from '../game/storyDirect.ts';
import { Plaque } from './KitParts.tsx';
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
  Flicker: { dot: '#d8f27a' },
  Grandma: { dot: '#c9a8e8' },
  'Lieutenant Pell': { dot: '#9aa3ad' },
  Squirrel: { dot: '#c98a4b' },
  Soldier: { dot: '#8c7f6a' },
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
/** upright the picture fills the screen from the top down to the words (it was a 4:3 window with dark empty screen above it: Matt,
 * 2026-10-29); the scene keeps its width and the room above it shows the top of the painting (storyArt.ts drawStoryScene `top`) */
/** the room kept for the words under it (six lines in the reading font, the Back and Next row, the top chips: 290 plus 60 to spare, or
 *  a long line pushed Next off the bottom of the screen) */
/** upright, the picture fills the whole screen and the words box sits over its bottom, as tall as its words (a two-word line had a box
 *  with a hand's width of dark under it: Matt via the lead, 2026-10-30). The figures stand clear of the tallest box a page makes (four
 *  lines of the reading font, the name and the Back and Next row), at the same place for every line, so nobody jumps when the box changes */
const UPRIGHT_WORDS = 250;
const uprightFeet = (v: { w: number; h: number }) => Math.max(0.5, Math.min(0.95, (v.h - UPRIGHT_WORDS) / v.h - 0.02));

export const StoryPlayer: React.FC<StoryPlayerProps> = ({ panels: script, onFinish, finishLabel = 'Continue', finishIcon = 'arrow', skipLabel = 'Skip' }) => {
  // a picture the player plays with their thumbs needs a touch screen; without one it reads as a picture, with the narration that says
  // what the thumbs would have done
  const touchy = useMemo(() => typeof window !== 'undefined' && ('ontouchstart' in window || (navigator.maxTouchPoints ?? 0) > 0), []);
  const panels = useMemo(() => {
    // (and the world notices what this player did: the lines for what they found, the falls the General counted: storyNotice.ts)
    const heard = noticed(script, loadFinds(), loadBadgeStore().counters.falls);
    return touchy ? heard.filter((p) => !p.narratedOnly) : heard.map((p) => (p.hold ? { ...p, hold: undefined } : p));
  }, [script, touchy]);
  // dev only: `?storyAt=N` opens a story on its Nth picture (for before/after screenshots)
  const [idx, setIdx] = useState(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return 0;
    const n = Number(new URLSearchParams(window.location.search).get('storyAt') ?? 0);
    return Number.isFinite(n) ? Math.max(0, Math.min(panels.length - 1, Math.floor(n))) : 0;
  });
  // the photographs and backdrops of the next panels: start loading them now (only a few ahead: holding every picture of a story at
  // once came to about 300 MB, memory audit 2026-10-25)
  useEffect(() => {
    const ahead = panels.slice(idx, idx + 3);
    preloadScenePhotos(ahead.map((p) => p.scene.photo?.key));
    preloadScenePlates(ahead.slice(1).map((p) => p.scene.plate));
    preloadSceneCards(ahead.slice(1).map((p) => p.scene.card));
  }, [panels, idx]);
  // the cast's paintings load as the story opens, and a closed story lets its pictures go
  useEffect(() => {
    warmStoryCast();
    return () => releaseStoryArt();
  }, []);
  // and the voices of everyone who speaks in it
  useEffect(() => {
    sound.warmVoices(new Set(panels.map((p) => p.speaker)));
  }, [panels]);
  const [shown, setShown] = useState(0);
  const panel = panels[idx];
  // how each picture is delivered: its entrance, the beat before the words, the pace, pages, camera, voice and music (storyDirect.ts)
  const dirs = useMemo(() => directScene(panels), [panels]);
  const dir = dirs[idx];
  // a long line comes a page at a time
  // (which page, of which picture: a new picture starts on its first page without waiting for an effect)
  const [pageAt, setPageAt] = useState({ idx: 0, n: 0 });
  const page = pageAt.idx === idx ? pageAt.n : 0;
  const text = dir.pages[Math.min(page, dir.pages.length - 1)] ?? panel.text;
  const lastPage = page >= dir.pages.length - 1;
  const prevChapter = idx > 0 ? panels[idx - 1].chapter : null;
  const wantsCard = panel.chapter !== prevChapter;
  const [cardUp, setCardUp] = useState(wantsCard);
  const done = shown >= text.length;
  const last = idx === panels.length - 1;

  // a new chapter opens with its title card
  useEffect(() => {
    setCardUp(wantsCard);
    if (!wantsCard) return;
    const id = window.setTimeout(() => setCardUp(false), CARD_MS);
    return () => clearTimeout(id);
  }, [idx, wantsCard]);

  // typewriter (time-based so a slow frame never stalls the text); waits for the title card, then the picture's beat (a later page
  // follows at once)
  useEffect(() => {
    setShown(0);
    if (cardUp) return;
    const start = performance.now() + (page === 0 ? dir.beat : 120);
    const when = typeSchedule(text, dir.typeMs);
    let k = 0;
    let raf = 0;
    const tick = (now: number) => {
      while (k < when.length && when[k] <= now - start) k++;
      const n = k;
      setShown((prev) => (prev === n ? prev : Math.max(prev, n)));
      if (n < text.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [idx, page, text, dir, cardUp]);

  // the music follows the story: each panel's chapter and mood choose the piece (same piece = no restart)
  // and the direction's hand on it: keep, under, silence or swell
  useEffect(() => {
    sound.storyPanel(panel);
    sound.storyMusic(dir.music);
  }, [panel, dir]);

  // a panel's own sting plays once, as its picture appears: after the title card has gone and the first letter is typed (at once for a picture
  // with no words). Going Back and forward again does not play it a second time. (The first pass for a new panel still holds the last panel's
  // card and typing state, so it never counts.)
  const stung = useRef(new Set<number>());
  const lastIdx = useRef(-1);
  useEffect(() => {
    const fresh = lastIdx.current !== idx;
    lastIdx.current = idx;
    if (!panel.sting || stung.current.has(idx)) return;
    if (!stingDue({ fresh, wantsCard, cardUp, shown, textLength: text.length })) return;
    stung.current.add(idx);
    sound.storySting(panel.sting);
  }, [idx, panel, text, wantsCard, cardUp, shown]);

  // the speaker's voice as the line types, a syllable every few letters (not when the whole line is skipped to)
  // (a slow frame can bring several letters at once: they are still spoken, the voice's own gap keeps it from gabbling; a tap that
  // finishes the line is `skipped`, and the rest of that line is silent)
  const spoken = useRef(0);
  const skipped = useRef(false);
  useEffect(() => {
    spoken.current = 0;
    skipped.current = false;
  }, [idx, page]);
  useEffect(() => {
    const from = spoken.current;
    spoken.current = shown;
    if (skipped.current) return;
    for (let i = from; i < shown; i++) sound.speak(panel.speaker, text, i, dir.tone);
  }, [shown, panel, text, dir]);

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
      feetRef.current = wide ? 0.95 : uprightFeet(view);
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
  }, [wide, idx, cardUp, view]);

  const startRef = useRef(performance.now());
  /** how this picture arrives (storyDirect.ts): the full dip from dark for a new chapter, a quick half-dark one for a new place, a cut */
  const enterRef = useRef(dir.enter);
  enterRef.current = dir.enter;
  // (a picture's own timeline starts when the title card has gone, so an action beat is never played out behind the card)
  useEffect(() => {
    startRef.current = performance.now();
  }, [idx, cardUp]);

  // ── a picture the player plays (the let-go in the tower): how many thumbs are down, and where the scene is
  const hold = !cardUp ? panel.hold : undefined;
  const [thumbs, setThumbs] = useState(0);
  const [phase, setPhase] = useState<HoldPhase>('grip');
  const tries = useRef(0);
  /** when the thunder breaks over him (performance.now ms), once one thumb is up; 0 while it has not */
  const breakAt = useRef(0);
  useEffect(() => {
    setPhase('grip');
    breakAt.current = 0;
  }, [idx]);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !hold) return;
    const count = (e: TouchEvent) => {
      // (the thumbs are the hands: no tap goes through to the Next button or the picture while they are down)
      if (e.cancelable) e.preventDefault();
      setThumbs(e.touches.length);
    };
    const opts = { passive: false } as const;
    for (const ev of ['touchstart', 'touchmove', 'touchend', 'touchcancel'] as const) el.addEventListener(ev, count, opts);
    return () => {
      for (const ev of ['touchstart', 'touchmove', 'touchend', 'touchcancel'] as const) el.removeEventListener(ev, count);
    };
  }, [hold]);
  useEffect(() => {
    if (!hold) return;
    const step = holdStep(phase, thumbs);
    if (step.phase === phase) return;
    if (phase === 'reach') tries.current++;
    if (step.phase === 'reach') breakAt.current = performance.now() + LETGO.breakMs;
    else breakAt.current = 0;
    setPhase(step.phase);
  }, [hold, thumbs, phase]);
  // both thumbs held a moment: the second prompt; one thumb kept up through the thunder: the song (the next picture)
  useEffect(() => {
    if (!hold) return;
    if (phase === 'held') {
      const id = window.setTimeout(() => setPhase((p) => (p === 'held' ? 'lift' : p)), LETGO.liftPromptMs);
      return () => clearTimeout(id);
    }
    if (phase === 'reach') {
      const boom = window.setTimeout(() => {
        sound.storySting('blow');
        try {
          navigator.vibrate?.(140);
        } catch {
          /* no vibration here */
        }
      }, LETGO.breakMs);
      const done = window.setTimeout(() => setIdx((i) => Math.min(panels.length - 1, i + 1)), LETGO.breakMs + LETGO.afterBreakMs);
      return () => {
        clearTimeout(boom);
        clearTimeout(done);
      };
    }
  }, [hold, phase, panels.length]);
  // the storm is in the room while he holds on
  useEffect(() => {
    if (!hold) return;
    sound.setAmbient('thunderstorm');
    return () => sound.setAmbient('gentle_breeze');
  }, [hold]);
  // (the picture through the direction's camera, unless the scene moves its own)
  const directed = useMemo(() => (dir.camera ? { ...panel.scene, camera: dir.camera } : panel.scene), [panel, dir]);
  const scene = hold && phase === 'reach' ? hold.reach : directed;
  const showPrompt = !!hold && phase !== 'reach' && (isEasy() || tries.current === 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    // (sharp on a phone either way: ST-1, the old 1.25 / 1.5 caps had the browser stretch the picture 2.1x on a 1080p phone)
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = wide ? view.w : view.w;
    const cssH = view.h;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    // scene space: 540 tall; as wide as the screen needs
    const sh = SCENE_H;
    // (upright the scene shows 720 units across, the narrowest a sideways screen already shows, and the room the tall screen has over
    // its 540 is `top`, painted by the plate's top or the backdrop)
    const sw = Math.max(720, Math.min(1500, sh * (cssW / cssH)));
    const sc = canvas.width / sw;
    const top = Math.max(0, canvas.height / sc - sh);
    // (a close shot the direction frames chest-up is not raised to keep feet above the words box: storyDirect.ts noLift)
    const chestUp = wide && !!dir.noLift && !hold;
    const lift = wide && !chestUp ? 0.09 : 0;
    const t0 = performance.now();
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      last = now;
      // (while the player holds on, every roll of thunder shakes the picture a little, and the one that breaks shakes it hard)
      const sk = hold ? thunderShake(now - t0, breakAt.current ? now - breakAt.current : null) : { dx: 0, dy: 0, flash: 0 };
      ctx.setTransform(sc, 0, 0, sc, sk.dx * sc, (top + sk.dy) * sc);
      drawStoryScene(ctx, scene, (now - t0) / 1000, sw, sh, lift, chestUp ? 1.5 : feetRef.current, top);
      if (sk.flash > 0) {
        ctx.fillStyle = `rgba(235,240,255,${sk.flash})`;
        ctx.fillRect(-20, -top - 20, sw + 40, sh + top + 40);
      }
      // a new chapter dips in from dark, a new place half-dark and quicker, and a picture in the same place is a cut
      const ent = enterRef.current;
      const k = ent === 'cut' ? 0 : Math.max(0, 1 - (now - startRef.current) / (ent === 'dip' ? 520 : 300));
      if (k > 0) {
        ctx.fillStyle = `rgba(6,10,8,${k * (ent === 'dip' ? 0.9 : 0.55)})`;
        ctx.fillRect(0, -top, sw, sh + top);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [scene, hold, wide, view.w, view.h, cardUp, dir.noLift]);

  // (a line that has just finished typing is not left by the same quick double tap that finished it: it gets a moment to be read)
  const doneAt = useRef(0);
  useEffect(() => {
    if (done) doneAt.current = performance.now();
  }, [done, idx, page]);
  const next = useCallback(() => {
    // (a played picture moves on when it is played, not on a tap)
    if (hold) return;
    if (cardUp) {
      setCardUp(false);
      return;
    }
    if (!done) {
      skipped.current = true;
      setShown(text.length);
      return;
    }
    if (performance.now() - doneAt.current < 350) return;
    if (!lastPage) setPageAt({ idx, n: page + 1 });
    else if (last) onFinish();
    else setIdx((i) => i + 1);
  }, [hold, cardUp, done, last, lastPage, onFinish, text.length, idx, page]);

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
      {/* (upright the box is as tall as its words: no two-line floor under a one-line line; the hidden rest of the line already holds
          the box at its full height while it types) */}
      <p className={`sp-text ${narrator ? 'narr' : ''}`} style={wide ? undefined : { minHeight: 0 }}>
        {lyrics(text.slice(0, shown))}
        <span className="opacity-0">{lyrics(text.slice(shown))}</span>
      </p>
      {panel.tip && done && lastPage && (
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
          {!hold && <button type="button" className="sp-next" onClick={(e) => { e.stopPropagation(); next(); }}>
            {last && done && lastPage ? (
              <>
                {finishLabel} <Icon name={finishIcon} size={15} />
              </>
            ) : (
              <>
                Next <Icon name="arrow" size={15} />
              </>
            )}
          </button>}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 bg-[#070d09] text-white select-none font-game overflow-hidden flex flex-col">
      <canvas ref={canvasRef} onClick={next} className="absolute inset-0 w-full h-full cursor-pointer" />
      <div className={`absolute inset-x-0 bottom-0 ${wide ? 'h-[44%]' : 'h-[30%]'} pointer-events-none`} style={{ background: 'linear-gradient(to top, rgba(6,12,8,.82), rgba(6,12,8,0))' }} />

      {/* (above the world's title card, which used to dim Skip into the dark: UI-12) */}
      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-2 px-3 sm:px-5 pt-2.5">
        <span className={`ui-chip transition-opacity duration-300 ${cardUp ? 'opacity-0' : 'opacity-100'}`}>{panel.chapter}</span>
        <button type="button" onClick={onFinish} className="ui-chip ui-chip-btn">
          {skipLabel} <Icon name="arrow" size={13} />
        </button>
      </div>

      {!cardUp && !panel.closing && (
        <div className="absolute inset-x-0 bottom-0 z-10 px-3 sm:px-6" style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom, 0px))' }}>
          {box}
        </div>
      )}

      {hold && (
        <div className={`sp-hold ${wide ? 'sp-hold-wide' : ''} ${showPrompt ? '' : 'sp-hold-off'}`} aria-live="polite" style={wide ? undefined : { top: Math.round(view.h * 0.32) }}>
          <div className="sp-hold-thumbs" aria-hidden="true">
            <span className={`sp-thumb gx-token ${thumbs >= 1 ? 'on' : ''}`}><Icon name="paw" size={17} /></span>
            <span className={`sp-thumb gx-token ${thumbs >= 2 ? 'on' : ''} ${phase === 'lift' ? 'lift' : ''}`}><Icon name="paw" size={17} /></span>
          </div>
          <div className="sp-hold-say kit-plaque"><span>{phase === 'lift' || phase === 'reach' ? hold.lift : hold.both}</span></div>
        </div>
      )}

      {/* the closing card: the picture goes dark, a beat of silence, then the words on the menu kit's plaque; a tap ends it */}
      {panel.closing && !cardUp && (
        <div className="sp-close" onClick={onFinish} key={`close-${idx}`} role="button" aria-label={panel.text}>
          <Plaque as="h2" className="sp-close-plaque">
            {panel.text.replace(/\.$/, '')}
          </Plaque>
          <div className="sp-card-hint sp-close-hint">tap to finish</div>
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
