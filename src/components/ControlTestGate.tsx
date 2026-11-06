import React from 'react';
import { recorder, savedTesterName } from '../game/playRecorder.ts';
import { refinedControls } from '../game/refinedControls.ts';
import { difficulty, setDifficulty, type Difficulty } from '../game/difficulty.ts';
import { checkForUpdate, hardRefresh } from '../game/updates.ts';
import { BUILD_TIME, formatBuildTime } from '../game/version.ts';
import { GestureGlyph, type GlyphKind } from './GestureGlyph.tsx';
import { PeekPokey, Plaque } from './KitParts.tsx';
import { stretchChoices } from './ctestStretches.ts';

/*
 * The testers' link (#ctest): the front page, the end questions and the sent screen, in the game's own menu kit (the lead and Matt,
 * 11-06: "make the page look like the game"): the painted parchment card with Pokey over its top edge, the carved plaque, the wooden
 * boards, World 1's sunrise behind (index.css, the ct-* rules: w1sun2's far layer, the same file 1-1 draws, so no new download).
 */

/** the screen behind every tester page: the sunrise, dimmed for reading, scrolling as one page */
const Scene: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => (
  <div className="ct-scene fixed inset-0 z-[60] overflow-y-auto" role="dialog" aria-label={label}>
    <div className="ct-wrap">
      <PeekPokey className="ct-peek" />
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

/** the moves, as tiles with their moving thumb (GestureGlyph): what to do, and what it does */
const CONTROLS: ReadonlyArray<readonly [GlyphKind, string, string]> = [
  ['run', 'Slide sideways', 'to run'],
  ['jump', 'Flick up and forward', 'to jump'],
  ['up', 'Flick up again in the air', 'to double jump'],
  ['tap', 'Tap', 'to punch'],
  ['flick', 'Flick toward an animal', 'to kick'],
  ['down', 'Slide straight up or down', 'to climb a vine'],
];

/**
 * what has tripped testers up so far (the control tests and QA, 2026-10): the fixes are habits, so they go on the front door. Only what
 * 1-1 has (run, jump, double jump, the mushroom: the lead, 11-06); no vines, kicks or animals, which the level does not have
 */
export const TIPS: readonly string[] = [
  'Keep your thumb on the screen to keep running. Lifting it stops Pokey.',
  'Jump with a quick flick, not a slow drag. A slow slide up does not jump.',
  'Tall steps need a double jump: flick up, then flick up again while he is in the air.',
  'For a long jump, keep sliding forward as you flick up, and flick close to the edge.',
  'Land on a mushroom to bounce up high. Steer in the air to aim where you land.',
];

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
 * Start, and the level opens straight away (gen2 1-1, a fresh proven seed each run, on the setting picked here).
 */
export const ControlTestGate: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [name, setName] = React.useState(savedTesterName);
  const [level, setLevel] = React.useState<Difficulty>(difficulty);
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
        <FreshBuild />
        <p className="ct-kicker">Level test</p>
        <Plaque as="h1" className="ct-title">Pokey's new level</Plaque>
        {/* the big step: a carved NEW badge */}
        <div className="ct-new" role="note">
          <span className="ct-new-tag">NEW</span>
          <span className="ct-new-t">
            <b>Brand-new levels</b>
            <small>Every run is different, so playing a few times helps the most.</small>
          </span>
        </div>
        <p className="ct-p">Help test it! One level, about three minutes. Play however feels natural: thumbs, one finger, upright or sideways. There's no wrong way.</p>

        <Head>The controls</Head>
        <div className="ct-tiles">
          {CONTROLS.map(([kind, verb, what]) => (
            <div key={what} className="ct-tile">
              <GestureGlyph kind={kind} size={52} />
              <b>{verb}</b>
              <small>{what}</small>
            </div>
          ))}
        </div>

        <div className="ct-ledger ct-tips">
          <p className="ct-tips-h">Tips (what trips people up)</p>
          <ul>
            {TIPS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
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
export function surveyRow(ans: Readonly<Record<string, readonly string[]>>, note: string, lookedNote: string, run: string): Record<string, unknown> {
  const row: Record<string, unknown> = { v: 2 };
  if (ans.hard?.length) row.hard = [...ans.hard];
  for (const id of ['long', 'knew', 'tips', 'looked', 'next']) if (ans[id]?.length) row[id] = ans[id][0];
  const fun = FACES.findIndex((f) => f[1] === ans.fun?.[0]);
  if (fun >= 0) row.fun = fun + 1;
  if (row.looked === 'Yes' && lookedNote.trim()) row.lookedNote = lookedNote.trim().slice(0, 120);
  row.note = note.trim().slice(0, 300);
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
        <input id="ctest-looked" value={lookedNote} onChange={(e) => setLookedNote(e.target.value)} maxLength={120} aria-label="What looked wrong? (optional)"
          placeholder="e.g. the log jumped out of nowhere" className="ct-input" />
      )}
    </Question>
  );
  return (
    <Scene label="Level test: thank you">
      <p className="ct-kicker">Level test</p>
      <Plaque as="h1" className="ct-title">{sent ? 'Sent. Thank you!' : 'Thank you!'}</Plaque>
      {!sent ? (
        <>
          <p className="ct-p">You're done! Three quick taps help Matt a lot. The rest are up to you.</p>
          {QUESTIONS.filter((q) => q.required).map(ask)}
          <Head>Optional</Head>
          {QUESTIONS.filter((q) => !q.required).map(ask)}
          <div className="ct-q">
            <label className="ct-q-t" htmlFor="ctest-note">Anything else?</label>
            <textarea id="ctest-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} rows={2}
              placeholder="e.g. I loved the mushroom bounce" className="ct-input" />
          </div>
          <p className={`ct-send-hint${ready ? ' ready' : ''}`} aria-live="polite">
            {ready ? 'All set. Tap Send!' : left === 3 ? '3 quick taps to send' : `${left} more tap${left === 1 ? '' : 's'} to send`}
          </p>
          <button type="button" onClick={send} disabled={!ready} className="pm-go ct-go">
            Send
          </button>
        </>
      ) : (
        <p className="ct-p">You can close this page now, or play again. Every run is a new level, and every run helps.</p>
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
