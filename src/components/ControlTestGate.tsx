import React from 'react';
import { CTEST_LEVEL_ID, recorder, savedTesterName, testerId } from '../game/playRecorder.ts';
import { refinedControls } from '../game/refinedControls.ts';
import { difficulty, setDifficulty, type Difficulty } from '../game/difficulty.ts';
import { checkForUpdate, hardRefresh } from '../game/updates.ts';
import { BUILD_TIME, formatBuildTime } from '../game/version.ts';
import { Plaque } from './KitParts.tsx';
import { STD_ATLAS_SIZE, STD_FRAMES, STD_STAND_H } from '../game/heroStandardData.ts';
import { stretchChoices } from './ctestStretches.ts';
import { GIT_COMMIT, TEST_ROUND } from '../game/testRound.ts';

/*
 * The testers' link (#ctest): the front page, the end questions and the sent screen, in the game's own menu kit (the lead and Matt,
 * 11-06: "make the page look like the game"): the painted parchment card with Pokey over its top edge, the carved plaque, the wooden
 * boards, World 1's sunrise behind (index.css, the ct-* rules: w1sun2's far layer, the same file 1-1 draws, so no new download).
 */

/** the screen behind every tester page: the sunrise, dimmed for reading, scrolling as one page */
const Scene: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => (
  <div className="ct-scene fixed inset-0 z-[60] overflow-y-auto" role="dialog" aria-label={label}>
    <div className="ct-wrap">
      <div className="ct-card">{children}</div>
    </div>
  </div>
);

/**
 * The big Refresh at the top of the name screen, so every tester starts on the newest build: it checks by itself and says so when a newer
 * one is out, and the button always works (updates.ts hardRefresh). The date shows which build this phone has.
 */
const FreshBuild: React.FC = () => {
  const [state, setState] = React.useState<'checking' | 'new' | 'same' | 'unknown'>('checking');
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => {
    let live = true;
    void checkForUpdate().then((r) => live && setState(r));
    return () => {
      live = false;
    };
  }, []);
  const stamp = formatBuildTime(BUILD_TIME);
  const isNew = state === 'new';
  // just came back from a Refresh (the address carries its stamp), or the server says this is the newest: say so, so nobody loops
  const fresh = !isNew && (state === 'same' || /[?&]fresh=/.test(window.location.search));
  return (
    <div className={`ct-ledger ct-fresh${isNew ? ' ct-fresh-new' : ''}`}>
      <p className="ct-fresh-t">
        {isNew ? 'A newer version is out. Tap Refresh first!' : fresh ? <span className="ct-ok">✓ You have the newest version. Good to go!</span> : 'First, tap Refresh to get the newest version'}
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void hardRefresh();
        }}
        className={`gx-plank gx-plank-gold ct-board${isNew ? ' animate-pulse' : ''}`}
      >
        <span aria-hidden="true" className="ct-refresh-ic">↻</span>
        {busy ? 'Refreshing…' : 'Refresh'}
      </button>
      <p className="ct-small ct-center">
        {stamp ? `This version: ${stamp}` : 'This version: (no date)'}
        {state === 'checking' ? ' · checking…' : ''}
      </p>
    </div>
  );
};

/** Pokey's painted sheet, the one the game draws him from (heroStandard.ts: the stage loads it anyway, so it costs nothing new) */
const HERO_URL = new URL('../assets/hero/hero-standard.webp', import.meta.url).href;
/** a still Pokey: one frame of the sheet, drawn at the scale that makes him `h` px tall standing (every pose the same size, as in play) */
export const HeroPose: React.FC<{ frame: string; h: number; className?: string }> = ({ frame, h: standH, className }) => {
  const f = STD_FRAMES[frame];
  const k = standH / STD_STAND_H;
  const h = Math.round(f.h * k);
  return (
    <span
      aria-hidden="true"
      className={`ct-pose${className ? ` ${className}` : ''}`}
      style={{
        width: Math.round(f.w * k),
        height: h,
        backgroundImage: `url(${HERO_URL})`,
        backgroundSize: `${STD_ATLAS_SIZE.w * k}px ${STD_ATLAS_SIZE.h * k}px`,
        backgroundPosition: `${-f.x * k}px ${-f.y * k}px`,
      }}
    />
  );
};

/** one of the testers' moves: a painted Pokey pose on a little card with what to do (the tips folded in: the lead and Matt, 11-06) */
export interface CtestMove {
  frame: string;
  name: string;
  how: string;
}
/** the front page of one testers' stage: its still (the real level as the game draws it, 880 x 425, src/assets/ui/ctest-<stage>.webp),
 *  the still's words for a screen reader, and only the moves that stage asks for (the story keeper's words, verbatim) */
export interface CtestPage {
  alt: string;
  moves: readonly CtestMove[];
}
const RUN: CtestMove = { frame: 'run_3', name: 'Run', how: 'Slide your thumb sideways. Keep it down to keep running.' };
const JUMP: CtestMove = { frame: 'rise', name: 'Jump', how: 'A quick flick up and forward, close to the edge. Not a slow drag.' };
/**
 * Each stage the testers' link can name (playRecorder.ts CTEST_LEVEL_ID: 1-4, the vine-field climb, Matt 11-13 12:02 PM ET; 1-3 if 1-4 is
 * not ready). The cards' words are the story keeper's (t-story@57ce5589), each checked against the built controls (FIX-B REPORT).
 */
export const CTEST_PAGES: Readonly<Record<string, CtestPage>> = {
  '1-4': {
    alt: 'Pokey climbing a curtain of vines up a giant kapok tree',
    moves: [
      { frame: 'climb_2', name: 'Climb', how: 'Slide your thumb up to climb. Slide down to whoosh back down.' },
      { frame: 'hang_b', name: 'Two hands', how: 'Slide toward the next vine to hold both. Two hands climb faster.' },
      { frame: 'climb_6', name: 'Push the figs', how: 'Climb up under a fig bunch to push it free. The branch lifts.' },
      { frame: 'swing_grip', name: 'Heads up', how: 'A creak above means a pod is coming. Move over a vine.' },
    ],
  },
  '1-3': {
    alt: 'Pokey on the forest floor near a golden snake and a hive',
    moves: [
      RUN,
      JUMP,
      { frame: 'punch_2', name: 'Punch', how: 'Tap when a snake is close to punch it. Off it glides.' },
      { frame: 'air_punch_1', name: 'Drop a trap', how: 'Punch the vine by a hive or stone. It drops beside the snake.' },
    ],
  },
};
/** the stills on hand (one per stage that has been shot; a stage with none shows the page without it) */
let STILLS: Record<string, string> = {};
try {
  STILLS = import.meta.glob<string>('../assets/ui/ctest-*.webp', { eager: true, query: '?url', import: 'default' });
} catch {
  // (no bundler: the node tests, which read the files themselves)
  STILLS = {};
}
/** the still of a testers' stage, or null when it has not been shot yet */
export const ctestStill = (id: string): string | null => STILLS[`../assets/ui/ctest-${id}.webp`] ?? null;
/** the front page of the stage the link plays */
export const ctestPage = (id: string = CTEST_LEVEL_ID): CtestPage => CTEST_PAGES[id];

/** a numbered step on the front door: a little gold token */
const Step: React.FC<{ n: number }> = ({ n }) => (
  <span aria-hidden="true" className="ct-step">
    {n}
  </span>
);

/** a small heading on the parchment */
const Head: React.FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="ct-h">{children}</h2>;

/**
 * The testers' front door (only with #ctest in the address): who is playing, what gets recorded, and Start. Recording begins on
 * Start, and the level opens straight away (playRecorder.ts CTEST_LEVEL_ID, a fresh roll of its list each run, on the setting picked here).
 */
export const ControlTestGate: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const page = ctestPage();
  const still = ctestStill(CTEST_LEVEL_ID);
  const [name, setName] = React.useState(savedTesterName);
  const [level, setLevel] = React.useState<Difficulty>(difficulty);
  // (the name box kept above the phone's keyboard while it is typed in)
  const nameRef = React.useRef<HTMLInputElement>(null);
  useAboveKeyboard(nameRef, nameRef);
  // (the tester code, made once on this device: a tester can read it out to us)
  const code = React.useMemo(() => testerId(), []);
  const go = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    setDifficulty(level);
    recorder.start(name);
    // which touch rules this run used, so before and after can be compared
    recorder.event('rules', refinedControls() ? 'refined' : 'old');
    // and how hard it was set (difficulty.ts): Easy runs are not compared with Normal ones
    recorder.event('difficulty', level);
    onStart();
  };
  return (
    <Scene label="Level test">
      <form onSubmit={go}>
        {/* the hero: the real level, Pokey big in front of it, the NEW tag on its corner */}
        <div className="ct-hero">
          {still && <img className="ct-hero-still" src={still} alt={page.alt} draggable={false} />}
          <span className="ct-new-tag ct-hero-new">NEW</span>
          <HeroPose frame="cheer_a" h={150} className="ct-hero-pokey" />
        </div>
        <p className="ct-kicker">Level test · Brand-new levels</p>
        <Plaque as="h1" className="ct-title">Pokey's new level</Plaque>
        <p className="ct-p ct-lead">One level, a few minutes. Every run is different.</p>
        <FreshBuild />

        <Head>The moves</Head>
        <div className="ct-moves">
          {page.moves.map((m) => (
            <div key={m.name} className="ct-move">
              <span className="ct-move-pic">
                <HeroPose frame={m.frame} h={80} />
              </span>
              <span className="ct-move-t">
                <b>{m.name}</b>
                <small>{m.how}</small>
              </span>
            </div>
          ))}
        </div>

        <Head>Get started</Head>
        <div className="ct-row">
          <Step n={1} />
          <label className="ct-label" htmlFor="ctest-name">
            Your name or a nickname
          </label>
          <span className="ct-need">Required</span>
        </div>
        <input
          ref={nameRef}
          data-kbd-box="ctest-name"
          id="ctest-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          required
          autoComplete="nickname"
          className="ct-input"
          placeholder="e.g. Matt"
        />
        <div className="ct-row">
          <Step n={2} />
          <p className="ct-label">How hard?</p>
        </div>
        <div className="ct-modes" role="radiogroup" aria-label="How hard">
          {(
            [
              ['easy', 'Easy', 'Gentler jumps and more help'],
              ['normal', 'Normal', 'The game as it is meant to be played'],
            ] as const
          ).map(([id, label, blurb]) => (
            <button key={id} type="button" role="radio" aria-checked={level === id} onClick={() => setLevel(id)} className={`ct-mode${level === id ? ' on' : ''}`}>
              <b>{label}</b>
              <small>{blurb}</small>
            </button>
          ))}
        </div>
        <div className="ct-row">
          <Step n={3} />
          <p className="ct-label">{name.trim() ? 'Tap Start' : 'Type your name, then tap Start'}</p>
        </div>
        <button type="submit" disabled={!name.trim()} className="pm-go ct-go">
          Start
        </button>
        <p className="ct-small">
          While you play, it records where your fingers touch and what Pokey does, to fine-tune how the game plays. No camera, microphone,
          location or personal info, and nothing is kept: the recordings are deleted when testing ends.
        </p>
        <p className="ct-ledger ct-close">
          <span aria-hidden="true">✕</span>
          <span>When you're done, please close the browser tab. That stops the test.</span>
        </p>
        {/* which test round this is (testRound.ts: bumped by hand), so Matt can tell testers which round they are on */}
        <p className="ct-small ct-center ct-code">
          Your tester code: <b>{code}</b>
        </p>
        <p className="ct-small ct-center ct-round">
          Test round: {TEST_ROUND} · build {GIT_COMMIT}
        </p>
      </form>
    </Scene>
  );
};

/** one question on the end screen: one tap picks (or a few, for "many") */
export type SurveyQ = { id: string; q: string; a: readonly string[]; many?: boolean; faces?: boolean; required?: boolean };

/** the five faces for "How fun was it?" (stored as 1 to 5) and what each one means, for a screen reader */
export const FACES: ReadonlyArray<readonly [string, string]> = [
  ['😞', 'Not fun'],
  ['🙁', 'A little fun'],
  ['😐', 'OK'],
  ['🙂', 'Fun'],
  ['😄', 'Loads of fun'],
];

/** the three answers Send waits for (Matt, 11-06: "anything that's a must, make it required"); the rest are optional */
export const REQUIRED = ['fun', 'long', 'knew'] as const;

/**
 * The questions at the end: only what the recording cannot tell (Matt, 11-06: no redundant questions). The log already has the fingers
 * (which hand: LOG_EVENTS.md), how the phone was held, where he fell, how long it took, and how skilled the player is, so none of that is
 * asked, and no age either. The three required come first; "What felt hardest?" lists this run's own stretches in plain words
 * (ctestStretches.ts), because how hard it FELT is not what the log measures.
 */
export const surveyQuestions = (stretches: readonly string[]): SurveyQ[] => [
  { id: 'fun', q: 'How fun was it?', a: FACES.map((f) => f[1]), faces: true, required: true },
  { id: 'long', q: 'How long did it feel?', a: ['Too short', 'About right', 'Too long'], required: true },
  { id: 'knew', q: 'Did you know what to do?', a: ['Always', 'Mostly', 'I got lost'], required: true },
  { id: 'hard', q: 'What felt hardest? (tap any)', a: ['Running', ...stretchChoices(stretches), 'Nothing'], many: true },
  { id: 'tips', q: "Did Dot's tips help?", a: ['Yes', 'A bit', 'No', "Didn't notice them"] },
  { id: 'looked', q: 'Did anything look wrong or out of place?', a: ['No', 'Yes'] },
  { id: 'next', q: 'Would you play the next level?', a: ['Yes', 'Maybe', 'No'] },
];

/** all three required answers are in */
export const readyToSend = (ans: Readonly<Record<string, readonly string[]>>): boolean => REQUIRED.every((id) => (ans[id]?.length ?? 0) > 0);

/**
 * The survey's row ('survey' moment, JSON). The keys the control test already sent keep their shape, so old rows still read: hard is a
 * list of picks, note is text (hand and held, in old rows only, were lists too). The new ones are single values: fun 1 to 5, the rest
 * the words picked; a skipped question is left out. `v: 2` marks the level test's rows, `run` is the run's own 'gen2' line.
 */
/** how much a tester may write (Matt, 11-06: notes were cut off at 120 and 300); a full row stays far under a sheet cell (47 000) */
export const LOOKED_MAX = 600;
export const NOTE_MAX = 1000;

/**
 * A note box: a few rows, its count under it ("212 / 600"), and kept in view over the phone's keyboard while typed in (the keyboard
 * covered it, Matt 11-06): on focus, and whenever the visual viewport shrinks or scrolls, the box is scrolled to the middle of what
 * is left of the screen (visualViewport where the browser has it, scrollIntoView alone otherwise)
 */
/** how far the kept box's bottom stays above the keyboard's top (Matt, 11-06: "at least 16 px") */
export const KEYBOARD_GAP = 24;
/**
 * Keep a text field (and its count, `box`) above the phone's keyboard while it is typed in: on focus, a moment later (the keyboard
 * comes up after the focus), and on every visualViewport resize or scroll. It scrolls the box to the middle of what the keyboard
 * leaves, adding room under the page as tall as the keyboard so the last box can rise; scrollIntoView alone where the browser has no
 * visualViewport. `window.__ctNoKeep` turns it off, for the keyboard check's planted failure (tools/perf/kbdcheck.mjs).
 */
export function useAboveKeyboard(field: React.RefObject<HTMLElement | null>, box: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    const keep = () => {
      const el = field.current;
      if (!el || document.activeElement !== el || (window as unknown as { __ctNoKeep?: boolean }).__ctNoKeep) return;
      const sc = el.closest('.ct-scene') as HTMLElement | null;
      const target = box.current ?? el;
      if (!vv) {
        target.scrollIntoView({ block: 'center', behavior: 'auto' });
        return;
      }
      // (room under the page as tall as the keyboard, so the last box can scroll up above it: at the page's end there was none)
      if (sc) sc.style.paddingBottom = `${Math.max(16, Math.round(window.innerHeight - vv.height + 16))}px`;
      const r = target.getBoundingClientRect();
      const top = vv.offsetTop, bottom = vv.offsetTop + vv.height;
      if (r.bottom > bottom - KEYBOARD_GAP || r.top < top + 8) {
        // (the middle of what is left, or its top when the box is taller than that)
        const room = bottom - KEYBOARD_GAP - (top + 8);
        const dy = r.height <= room ? r.top + r.height / 2 - (top + 8 + room / 2) : r.top - (top + 8);
        if (sc) sc.scrollTop += dy;
        else window.scrollBy(0, dy);
      }
    };
    const onBlur = () => {
      const sc = field.current?.closest('.ct-scene') as HTMLElement | null;
      if (sc) sc.style.paddingBottom = '';
    };
    const onFocus = () => {
      keep();
      window.setTimeout(keep, 350);
    };
    const el = field.current;
    el?.addEventListener('focus', onFocus);
    el?.addEventListener('blur', onBlur);
    el?.addEventListener('input', keep);
    vv?.addEventListener('resize', keep);
    vv?.addEventListener('scroll', keep);
    return () => {
      el?.removeEventListener('focus', onFocus);
      el?.removeEventListener('blur', onBlur);
      el?.removeEventListener('input', keep);
      vv?.removeEventListener('resize', keep);
      vv?.removeEventListener('scroll', keep);
    };
  }, [field, box]);
}

/** a note box: a few rows and its count under it ("212 / 600"), kept above the keyboard while typed in (useAboveKeyboard) */
const NoteBox: React.FC<{ id: string; value: string; onChange: (v: string) => void; max: number; rows: number; placeholder: string; label?: string }> = ({ id, value, onChange, max, rows, placeholder, label }) => {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const box = React.useRef<HTMLDivElement>(null);
  useAboveKeyboard(ref, box);
  return (
    <div ref={box} className="ct-notebox" data-kbd-box={id}>
      <textarea ref={ref} id={id} value={value} onChange={(e) => onChange(e.target.value)} maxLength={max} rows={rows} aria-label={label}
        placeholder={placeholder} className="ct-input ct-note" />
      <p className="ct-count" aria-live="polite">{value.length} / {max}</p>
    </div>
  );
};

export function surveyRow(ans: Readonly<Record<string, readonly string[]>>, note: string, lookedNote: string, run: string): Record<string, unknown> {
  const row: Record<string, unknown> = { v: 2 };
  if (ans.hard?.length) row.hard = [...ans.hard];
  for (const id of ['long', 'knew', 'tips', 'looked', 'next']) if (ans[id]?.length) row[id] = ans[id][0];
  const fun = FACES.findIndex((f) => f[1] === ans.fun?.[0]);
  if (fun >= 0) row.fun = fun + 1;
  if (row.looked === 'Yes' && lookedNote.trim()) row.lookedNote = lookedNote.trim().slice(0, LOOKED_MAX);
  row.note = note.trim().slice(0, NOTE_MAX);
  if (run) row.run = run;
  return row;
}

/** one question, its chips (or faces) under it */
const Question: React.FC<{ q: SurveyQ; picked: readonly string[]; onPick: (a: string) => void; children?: React.ReactNode }> = ({ q, picked, onPick, children }) => (
  <div className="ct-q" role="group" aria-label={q.q}>
    <p className="ct-q-t">
      {q.q}
      {q.required && <span className={`ct-need${picked.length ? ' done' : ''}`}>{picked.length ? '✓' : 'Required'}</span>}
    </p>
    {q.faces ? (
      <>
        <div className="ct-faces">
          {FACES.map(([face, label]) => (
            <button key={label} type="button" onClick={() => onPick(label)} aria-pressed={picked.includes(label)} aria-label={label} className={`ct-face${picked.includes(label) ? ' on' : ''}`}>
              <span aria-hidden="true">{face}</span>
            </button>
          ))}
        </div>
        <div aria-hidden="true" className="ct-faces-ends">
          <span>Not fun</span>
          <span>Loads of fun</span>
        </div>
      </>
    ) : (
      <div className="ct-chips">
        {q.a.map((a) => (
          <button key={a} type="button" onClick={() => onPick(a)} aria-pressed={picked.includes(a)} className={`ct-chip${picked.includes(a) ? ' on' : ''}`}>
            {a}
          </button>
        ))}
      </div>
    )}
    {children}
  </div>
);

/** the end of the test (at the shrine, or "I'm done"): three required taps, the optional ones, thanks, and a way to play again */
export const ControlTestDone: React.FC<{ onAgain: () => void; stretches?: string[] }> = ({ onAgain, stretches = [] }) => {
  const QUESTIONS = React.useMemo(() => surveyQuestions(stretches), [stretches.join('|')]);
  const [ans, setAns] = React.useState<Record<string, string[]>>({});
  const [note, setNote] = React.useState('');
  const [lookedNote, setLookedNote] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const pick = (id: string, a: string, many?: boolean) =>
    setAns((o) => {
      const cur = o[id] ?? [];
      // (a second tap on a single pick takes it back)
      const next = many ? (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]) : cur[0] === a ? [] : [a];
      return { ...o, [id]: next };
    });
  const ready = readyToSend(ans);
  const left = REQUIRED.filter((id) => !(ans[id]?.length)).length;
  const send = () => {
    if (!ready) return;
    recorder.event('survey', JSON.stringify(surveyRow(ans, note, lookedNote, recorder.lastRun)));
    setSent(true);
  };
  const ask = (q: SurveyQ) => (
    <Question key={q.id} q={q} picked={ans[q.id] ?? []} onPick={(a) => pick(q.id, a, q.many)}>
      {q.id === 'looked' && ans.looked?.[0] === 'Yes' && (
        <NoteBox id="ctest-looked" value={lookedNote} onChange={setLookedNote} max={LOOKED_MAX} rows={3} label="What looked wrong? (optional)"
          placeholder="e.g. the log jumped out of nowhere" />
      )}
    </Question>
  );
  return (
    <Scene label="Level test: thank you">
      <div className="ct-done-head">
        <span className="ct-done-t">
          <p className="ct-kicker">Level test</p>
          <Plaque as="h1" className="ct-title">{sent ? 'Sent!' : 'Thank you!'}</Plaque>
        </span>
        <HeroPose frame={sent ? 'cheer_b' : 'cheer_a'} h={96} className="ct-done-pokey" />
      </div>
      {!sent ? (
        <>
          <p className="ct-p">You're done! Three quick taps help Matt a lot. The rest are up to you.</p>
          {QUESTIONS.filter((q) => q.required).map(ask)}
          <Head>Optional</Head>
          {QUESTIONS.filter((q) => !q.required).map(ask)}
          <div className="ct-q">
            <label className="ct-q-t" htmlFor="ctest-note">Anything else?</label>
            <NoteBox id="ctest-note" value={note} onChange={setNote} max={NOTE_MAX} rows={3} placeholder="e.g. I loved the mushroom bounce" />
          </div>
          <p className={`ct-send-hint${ready ? ' ready' : ''}`} aria-live="polite">
            {ready ? 'All set. Tap Send!' : left === 3 ? '3 quick taps to send' : `${left} more tap${left === 1 ? '' : 's'} to send`}
          </p>
          <button type="button" onClick={send} disabled={!ready} className="pm-go ct-go">
            Send
          </button>
        </>
      ) : (
        <p className="ct-p">Thank you! You can close this page now, or play again. Every run is a new level, and every run helps.</p>
      )}
      <button type="button" onClick={onAgain} className={`gx-plank ct-board${sent ? ' gx-plank-gold' : ''}`}>
        Play again (a new level)
      </button>
    </Scene>
  );
};

/**
 * the little red dot while the test records, and an "I'm done" button beside it: a tester who is stuck or has played enough can end
 * the test any time (it used to end only at the shrine, so anyone who gave up never reached the questions). The button asks once more
 * before it ends, so a stray touch while playing cannot end the run.
 */
export const RecordingBadge: React.FC<{ onDone?: () => void }> = ({ onDone }) => {
  const [state, setState] = React.useState(recorder.sendState);
  const [sure, setSure] = React.useState(false);
  React.useEffect(() => {
    recorder.onState = setState;
    return () => {
      recorder.onState = null;
    };
  }, []);
  React.useEffect(() => {
    if (!sure) return;
    const t = window.setTimeout(() => setSure(false), 3000);
    return () => window.clearTimeout(t);
  }, [sure]);
  return (
    <div
      className="fixed left-1/2 z-[55] flex -translate-x-1/2 items-center gap-2"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
    >
      <div className="pointer-events-none flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-xs font-bold text-white" aria-label="Recording">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        REC{state === 'blocked' ? ' · not sending from this link' : ''}
      </div>
      {onDone && (
        // (the pill stays small over the play, the button around it is a full 44 px tap target)
        <button type="button" onClick={() => (sure ? onDone() : setSure(true))} className="flex min-h-[44px] min-w-[44px] items-center justify-center">
          <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${sure ? 'bg-[#f2c14e] text-[#2a1a08]' : 'bg-black/45 text-white'}`}>
            {sure ? 'Tap again to finish' : "I'm done"}
          </span>
        </button>
      )}
    </div>
  );
};
