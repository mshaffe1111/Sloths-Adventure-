import { CloseX, useBack } from './nav/Nav.tsx';
import React from 'react';
import { GhostOnExit } from './fx/exitGhost.ts';
import { HeroFaceIcon } from './HeroFaceIcon.tsx';
import { GestureGlyph } from './GestureGlyph.tsx';
import { Icon } from './icons/index.tsx';
import { JournalDemo } from './JournalDemo.tsx';
import { warmJournalArt } from '../game/journalScenes.ts';
import { CHAPTERS, PAGES, PAGE_BY_ID, chapterPages, isNew, markLooked, openPages, type ChapterId, type JournalPage, type PoseId } from '../game/movesJournal.ts';
import { lessonInputMode, type InputMode, type LessonLine } from '../game/lessons.ts';

/**
 * How to Play (once called Pokey's Journal; Matt, 2026-10-24): a book that fills in as you play. Chapters by kind of move; each page is one move
 * or idea with Pokey doing it on a loop and the moves for this player's own controls; pages still to come are mystery pages. The pages
 * and their unlock rules are in game/movesJournal.ts, the scenes in game/journalScenes.ts. Stars, lives and saving keep a short section
 * of their own at the back.
 *
 * `intro` is the first-time version before the very first stage: the three basics (run, jump, punch) and one big "Let's go".
 */
interface Props {
  onClose: () => void;
  /** the first-time pop-up: the basics only, and the button says "Let's go" */
  intro?: boolean;
}

const POSES_URL = new URL('../assets/hero/journal-poses.webp', import.meta.url).href;
const FOREST_URL = new URL('../assets/backdrops/w1c-mid.webp', import.meta.url).href;
const POSE_CELL: Record<PoseId, number> = { stand: 0, run: 1, jump: 2, duck: 3, punch: 4, kick: 5, climb: 6, hang: 7, swing: 8 };

const MODE_LABEL: Record<InputMode, string> = { screen: 'touch screen', pad: 'thumb pad', keys: 'keyboard' };

/** Pokey's pose for a page's tile, from the pose sheet (3 x 3 cells) */
const Pose: React.FC<{ pose: PoseId; dark?: boolean }> = ({ pose, dark }) => {
  const i = POSE_CELL[pose];
  return (
    <span
      className={`jr-pose${dark ? ' dark' : ''}`}
      aria-hidden="true"
      style={{ backgroundImage: `url(${POSES_URL})`, backgroundPosition: `${(i % 3) * 50}% ${Math.floor(i / 3) * 50}%` }}
    />
  );
};

const ChapterIcon: React.FC<{ id: ChapterId | 'extras' }> = ({ id }) => {
  const d: Record<string, React.ReactNode> = {
    moving: <><circle cx="14" cy="4.5" r="2" /><path d="M8 21l3-6 3 2v5M6 12l4-4 4 2 3 3M11 15l-1-6" /></>,
    fighting: <path d="M6 13V8a2 2 0 014 0v4M10 11V6a2 2 0 014 0v6M14 11V8a2 2 0 014 0v6a6 6 0 01-6 6H11a5 5 0 01-5-5" />,
    climbing: <path d="M7 2v20M17 2c0 6-6 6-6 12v8" />,
    sneaking: <path d="M3 20c2-6 5-9 9-9s7 3 9 9M7 14c-1-3 0-6 2-8M17 14c1-3 0-6-2-8M12 11V4" />,
    dangers: <path d="M12 3l10 18H2zM12 10v5M12 18v.5" />,
    finding: <><circle cx="11" cy="11" r="6" /><path d="M16 16l5 5" /></>,
    extras: <path d="M12 3l2.8 5.8 6.2.9-4.5 4.3 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.7l6.2-.9z" />,
  };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {d[id]}
    </svg>
  );
};

/** one way of doing the move: the thumb picture (touch), how, and what it does */
const Line: React.FC<{ l: LessonLine; mode: InputMode }> = ({ l, mode }) => (
  <div className="jr-line">
    {mode === 'screen' && l.glyph ? (
      <span className="jr-glyph">
        <GestureGlyph kind={l.glyph} size={50} bare />
      </span>
    ) : (
      <span className="jr-glyph jr-glyph-txt" aria-hidden="true">
        <Icon name="arrow" size={18} />
      </span>
    )}
    <span className="jr-line-txt">
      <span className="jr-how">{l.how}</span>
      <b>{l.what}</b>
      {l.sub && <small>{l.sub}</small>}
    </span>
  </div>
);

const NewBadge: React.FC = () => <span className="jr-new">NEW!</span>;

/** a page you have: Pokey doing it, and how */
const PageView: React.FC<{ p: JournalPage; mode: InputMode; fresh: boolean; nav: React.ReactNode; navBeside?: boolean }> = ({ p, mode, fresh, nav, navBeside }) => (
  <div className="jr-page">
    <div className="jr-left">
      <div className="jr-demo-wrap">
        <JournalDemo demo={p.demo} label={`Pokey: ${p.title}`} className="jr-demo" />
      </div>
      {!navBeside && nav}
    </div>
    <div className="jr-page-txt">
      <div className="jr-page-kick">
        {fresh && <NewBadge />}
        {p.where && <span className="ui-kicker">{p.where}</span>}
      </div>
      <h3 className="jr-page-title">{p.title}</h3>
      <p className="jr-intro">{p.intro}</p>
      <div className="jr-lines">
        {p.lines[mode].map((l, i) => (
          <Line key={i} l={l} mode={mode} />
        ))}
      </div>
      {navBeside && nav}
    </div>
  </div>
);

/** a page still to come */
const LockedView: React.FC<{ p: JournalPage; nav: React.ReactNode }> = ({ p, nav }) => (
  <div className="jr-page">
    <div className="jr-left">
      <div className="jr-demo-wrap jr-locked-art">
        <Pose pose={p.pose} dark />
        <span className="jr-q">?</span>
      </div>
      {nav}
    </div>
    <div className="jr-page-txt">
      <span className="ui-kicker">A page still to come</span>
      <h3 className="jr-page-title">? ? ?</h3>
      <p className="jr-intro">
        <b>{p.where}.</b> Keep going and this page fills in by itself.
      </p>
      <div className="jr-riddle">
        <Icon name="bulb" size={22} />
        <span>
          <b>Dot's hint:</b> {p.riddle}
        </span>
      </div>
    </div>
  </div>
);

const Extras: React.FC = () => (
  <div className="jr-extras">
    <section className="htp-sec">
      <h3 className="ui-label">Each stage</h3>
      <p className="ui-copy">
        Every stage ends at an <b>exit shrine</b>. Some ask for something first, like petals to gather or snakes to beat: the yellow count at the top right shows how many. The last stage of every
        world is a <b>boss</b>.
      </p>
    </section>
    <section className="htp-sec">
      <h3 className="ui-label">Hearts and lives</h3>
      <p className="ui-copy">
        <b>Hearts</b> are your health: a hit costs one, a heart pick-up gives one back. Lose every heart and a <b>life</b> goes, and you start again from the last flag. With no lives left, you can try the
        stage again.
      </p>
    </section>
    <section className="htp-sec">
      <h3 className="ui-label">Stars for a stage</h3>
      <p className="ui-copy">
        <b>One star</b> for clearing it. <b>Two</b> for keeping at least half your hearts, or beating the target time. <b>Three</b> for losing no life, keeping most of your hearts, and being quick (or
        collecting nearly everything).
      </p>
    </section>
    <section className="htp-sec">
      <h3 className="ui-label">Your game saves itself</h3>
      <p className="ui-copy">
        Every stage, star and trophy is kept <b>on this device, in this browser</b>. Switching phones or clearing the browser's data loses it, so on the title screen <b>Save / Load</b> can write your game
        to a file or a save code, and bring it back.
      </p>
      <p className="ui-copy ui-warn">New Game erases your progress. It offers a backup first, so use it.</p>
    </section>
    <section className="htp-sec">
      <h3 className="ui-label">Settings</h3>
      <p className="ui-copy">
        In a stage, <b>Settings</b> (the leaf at the top) pauses the game. It has Resume, Restart, Trophies, the World Map, the start screen, this journal, how you control the game, and the sound.
      </p>
      <p className="ui-copy">
        The phone's <b>Back</b> swipe pauses the game too, instead of leaving it. Keep your thumbs <b>a finger's width in from the edges</b>: the phone keeps swipes that start at the very edge for itself.
      </p>
    </section>
  </div>
);

/** the first-time card: run, jump and punch, one at a time, then off you go */
const Intro: React.FC<{ mode: InputMode; onGo: () => void; onMore: () => void }> = ({ mode, onGo, onMore }) => {
  const basics = ['run', 'jump', 'punch'].map((id) => PAGE_BY_ID[id]);
  const [i, setI] = React.useState(0);
  const p = basics[i];
  return (
    <>
      <div className="ui-tabs jr-intro-tabs" role="tablist" aria-label="The basics">
        {basics.map((b, k) => (
          <button key={b.id} type="button" role="tab" aria-selected={k === i} className={k === i ? 'on' : ''} onClick={() => setI(k)}>
            {k + 1}. {b.title}
          </button>
        ))}
      </div>
      <PageView
        p={p}
        mode={mode}
        fresh={false}
        navBeside
        nav={
          <div className="jr-nav">
            {i < basics.length - 1 ? (
              <button type="button" className="ui-btn ui-btn-gold" onClick={() => setI(i + 1)}>
                Next: {basics[i + 1].title}
              </button>
            ) : (
              <button type="button" className="ui-btn ui-btn-gold" onClick={onGo} data-start="true">
                Let's go!
              </button>
            )}
            <button type="button" className="ui-btn ui-btn-plain" onClick={onMore}>
              Open the journal
            </button>
          </div>
        }
      />
      <p className="jr-foot-note">Every new move you meet gets its own page here.</p>
    </>
  );
};

type View = { kind: 'chapter'; ch: ChapterId } | { kind: 'page'; id: string } | { kind: 'extras' };

export const HowToPlay: React.FC<Props> = ({ onClose, intro = false }) => {
  const mode = React.useMemo(() => lessonInputMode(), []);
  const open = React.useMemo(() => openPages(), []);
  // (the painted sheets the pages' scenes draw, asked for as the journal opens, so a page never shows its gate or pickups popping in)
  React.useEffect(() => warmJournalArt(), []);
  const [short, setShort] = React.useState(intro);
  const [view, setView] = React.useState<View>({ kind: 'chapter', ch: 'moving' });
  // which pages were NEW when the journal opened: a page stays marked for this visit even after you look at it
  const [fresh] = React.useState(() => new Set(PAGES.filter((p) => isNew(p.id, open)).map((p) => p.id)));
  const [looked, setLooked] = React.useState<Set<string>>(new Set());
  // every new view starts at its top (a page opened from the bottom row must not open half-scrolled)
  const mainRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [view]);

  const show = (id: string) => {
    setView({ kind: 'page', id });
    if (open.has(id)) {
      markLooked(id);
      setLooked((s) => new Set(s).add(id));
    }
  };

  const page = view.kind === 'page' ? PAGE_BY_ID[view.id] : null;
  const ch: ChapterId | null = view.kind === 'chapter' ? view.ch : page ? page.chapter : null;
  const list = ch ? chapterPages(ch) : [];
  const at = page ? list.findIndex((p) => p.id === page.id) : -1;
  const step = (d: number) => {
    const n = list[at + d];
    if (n) show(n.id);
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!short && view.kind === 'page' && (e.code === 'ArrowRight' || e.code === 'ArrowLeft')) {
        e.preventDefault();
        step(e.code === 'ArrowRight' ? 1 : -1);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  });

  // Back (Android, Escape): a page goes back to its chapter first, then the book closes, like its X and a tap outside (nav/backStack.ts)
  useBack(() => {
    if (!short && view.kind === 'page') setView({ kind: 'chapter', ch: PAGE_BY_ID[view.id].chapter });
    else onClose();
  });

  const total = PAGES.length;
  const have = open.size;
  const newIn = (c: ChapterId) => chapterPages(c).filter((p) => fresh.has(p.id) && !looked.has(p.id)).length;

  const title = short ? 'How to Play' : view.kind === 'extras' ? 'Stars, lives & saving' : CHAPTERS.find((c) => c.id === ch)?.name ?? '';

  const nav = page && (
    <div className="jr-nav">
      <button type="button" className="ui-btn ui-btn-plain" disabled={at <= 0} onClick={() => step(-1)}>
        ‹ {at > 0 ? (open.has(list[at - 1].id) ? list[at - 1].title : '? ? ?') : 'Back'}
      </button>
      <button type="button" className="ui-btn ui-btn-gold" disabled={at >= list.length - 1} onClick={() => step(1)}>
        {at < list.length - 1 ? (open.has(list[at + 1].id) ? list[at + 1].title : '? ? ?') : 'Last page'} ›
      </button>
    </div>
  );

  return (
    <div className="ui-scrim select-none" role="dialog" aria-modal="true" aria-label="How to Play" onClick={onClose}>
      <GhostOnExit />
      <div className={`ui-panel jr${short ? ' jr-short' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="jr-head">
          {page && !short ? (
            <button type="button" className="jr-back" onClick={() => setView({ kind: 'chapter', ch: page.chapter })}>
              <Icon name="arrow" size={14} rotate={180} /> {CHAPTERS.find((c) => c.id === page.chapter)?.name}
            </button>
          ) : (
            <span className="htp-face">
              <HeroFaceIcon size={42} face="face_happy" />
            </span>
          )}
          <div className="jr-head-txt">
            <div className="ui-kicker">{short ? 'Before you start' : 'How to Play'}</div>
            <h2 className="ui-h2">{page && !short ? `Page ${at + 1} of ${list.length}` : title}</h2>
          </div>
          {!short && (
            <div className="jr-progress" aria-label={`${have} of ${total} pages`}>
              <span>
                {have} of {total} pages
              </span>
              <span className="jr-bar">
                <span style={{ width: `${Math.round((have / total) * 100)}%` }} />
              </span>
            </div>
          )}
          <span className="jr-mode">For your {MODE_LABEL[mode]}</span>
          <CloseX onClose={onClose} className="jr-x" />
        </div>

        {short ? (
          <div className="jr-main">
            <Intro mode={mode} onGo={onClose} onMore={() => setShort(false)} />
          </div>
        ) : (
          <div className="jr-split">
            <nav className="jr-chapters" aria-label="Chapters">
              {CHAPTERS.map((c) => {
                const ps = chapterPages(c.id);
                const n = ps.filter((p) => open.has(p.id)).length;
                const on = ch === c.id && view.kind !== 'extras';
                const fresh = newIn(c.id);
                return (
                  <button key={c.id} type="button" className={`jr-ch${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined} onClick={() => setView({ kind: 'chapter', ch: c.id })}>
                    <ChapterIcon id={c.id} />
                    <span className="jr-ch-name">{c.name}</span>
                    {fresh > 0 && <span className="jr-dot" aria-label={`${fresh} new`} />}
                    <span className="jr-ch-n">
                      {n}/{ps.length}
                    </span>
                  </button>
                );
              })}
              <button type="button" className={`jr-ch jr-ch-extra${view.kind === 'extras' ? ' on' : ''}`} onClick={() => setView({ kind: 'extras' })}>
                <ChapterIcon id="extras" />
                <span className="jr-ch-name">Stars, lives &amp; saving</span>
              </button>
            </nav>

            <div className="jr-main" ref={mainRef}>
              {view.kind === 'extras' && <Extras />}
              {view.kind === 'chapter' && (
                <div className="jr-grid">
                  {chapterPages(view.ch).map((p) => {
                    const has = open.has(p.id);
                    const isFresh = fresh.has(p.id) && !looked.has(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={`jr-tile${has ? '' : ' locked'}${isFresh ? ' fresh' : ''}`}
                        onClick={() => show(p.id)}
                        aria-label={has ? p.title : `A page still to come: ${p.where}`}
                      >
                        <span className="jr-tile-art" style={has ? { backgroundImage: `linear-gradient(rgba(10,30,18,.38), rgba(10,30,18,.38)), url(${FOREST_URL})` } : undefined}>
                          <Pose pose={p.pose} dark={!has} />
                          {!has && <span className="jr-q">?</span>}
                          {isFresh && <NewBadge />}
                        </span>
                        <span className="jr-tile-name">{has ? p.title : p.where}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {page && (open.has(page.id) ? <PageView p={page} mode={mode} fresh={fresh.has(page.id)} nav={nav} /> : <LockedView p={page} nav={nav} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/** the first-time pop-up is shown once per device */
const SEEN_KEY = 'sloth_howto_seen';
export function howToSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return true; // storage blocked: never nag
  }
}
export function markHowToSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* ignore */
  }
}

/** how many pages are NEW (for a badge on the journal tile in Settings) */
export function journalNewCount(): number {
  const open = openPages();
  return PAGES.filter((p) => isNew(p.id, open)).length;
}
