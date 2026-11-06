import React from 'react';
import { recorder, savedTesterName } from '../game/playRecorder.ts';
import { refinedControls } from '../game/refinedControls.ts';
import { difficulty, setDifficulty, type Difficulty } from '../game/difficulty.ts';
import { checkForUpdate, hardRefresh } from '../game/updates.ts';
import { BUILD_TIME, formatBuildTime } from '../game/version.ts';
import { GestureGlyph, type GlyphKind } from './GestureGlyph.tsx';
import { stretchChoices } from './ctestStretches.ts';

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
    <div className={`mb-4 rounded-2xl border-2 p-2.5 ${isNew ? 'border-[#f2c14e] bg-[#f2c14e]/15' : 'border-[#f4ecd8]/20 bg-black/20'}`}>
      <p className="text-center text-sm font-black leading-tight">
        {isNew ? 'A newer version is out. Tap Refresh first!' : fresh ? (
          <span className="text-[#9be29b]">✓ You have the newest version. Good to go!</span>
        ) : 'First, tap Refresh to get the newest version'}
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void hardRefresh();
        }}
        className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xl font-black text-[#2a1a08] ${isNew ? 'animate-pulse bg-[#f2c14e]' : 'bg-[#f2c14e]/90'}`}
      >
        <span aria-hidden="true" className="text-2xl leading-none">↻</span>
        {busy ? 'Refreshing…' : 'Refresh'}
      </button>
      <p className="mt-1.5 text-center text-xs text-[#f4ecd8]/65">
        {stamp ? `This version: ${stamp}` : 'This version: (no date)'}
        {state === 'checking' ? ' · checking…' : ''}
      </p>
    </div>
  );
};

/** the four moves, as big tiles with their moving thumb (GestureGlyph): what to do, and what it does */
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

/** a numbered step on the front door */
const Step: React.FC<{ n: number }> = ({ n }) => (
  <span aria-hidden="true" className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#f2c14e] text-sm font-black text-[#2a1a08]">
    {n}
  </span>
);

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
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#0e3b28]/95 p-3 text-[#f4ecd8]">
      <form onSubmit={go} className="mx-auto my-2 w-full max-w-xl rounded-2xl border border-[#f4ecd8]/20 bg-[#123d2a] p-4 shadow-2xl sm:p-5">
        <FreshBuild />
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f2c14e]">Level test</p>
        <h1 className="mt-1 text-2xl font-black leading-tight">Help test Pokey's new level</h1>
        <p className="mt-2 text-[15px] leading-snug text-[#f4ecd8]/90">
          One level, about three minutes. Play however feels natural: thumbs, one finger, upright or sideways. There's no wrong way.
        </p>
        <p className="mt-2 flex items-start gap-2 rounded-xl border border-[#9be29b]/40 bg-[#9be29b]/10 px-3 py-2 text-[15px] font-bold leading-snug text-[#c9f2c9]">
          <span aria-hidden="true" className="text-lg leading-none">🎲</span>
          <span>Every run is made at random, so playing a few times helps the most.</span>
        </p>

        <h2 className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-[#f2c14e]">The controls</h2>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CONTROLS.map(([kind, verb, what]) => (
            <div key={what} className="ct-tile flex flex-col items-center rounded-xl bg-[#f4ecd8] px-2 py-2 text-center text-[#20321f] shadow">
              <GestureGlyph kind={kind} size={52} />
              <span className="mt-1 text-[15px] font-black leading-tight">{verb}</span>
              <span className="text-[13px] font-bold leading-tight text-[#20321f]/75">{what}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-xl border border-[#f2c14e]/35 bg-[#f2c14e]/10 px-3 py-2">
          <p className="text-sm font-black text-[#f2c14e]">Tips (what trips people up)</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-[14px] leading-snug text-[#f4ecd8]/90">
            {TIPS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>

        <h2 className="mt-5 text-sm font-black uppercase tracking-[0.14em] text-[#f2c14e]">Get started</h2>
        <div className="mt-2 flex items-center gap-2">
          <Step n={1} />
          <label className="text-base font-black" htmlFor="ctest-name">
            Your name or a nickname
          </label>
          <span className="rounded-full bg-[#f2c14e]/20 px-2 py-0.5 text-xs font-black uppercase tracking-wider text-[#f2c14e]">Required</span>
        </div>
        <input
          id="ctest-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          required
          autoComplete="nickname"
          className="mt-1.5 w-full rounded-lg border-2 border-[#f4ecd8]/35 bg-[#0b2e20] px-3 py-2.5 text-base text-[#f4ecd8] outline-none focus:border-[#f2c14e]"
          placeholder="e.g. Matt"
        />
        <div className="mt-4 flex items-center gap-2">
          <Step n={2} />
          <p className="text-base font-black">How hard?</p>
        </div>
        <div className="mt-1.5 grid grid-cols-2 gap-2" role="radiogroup" aria-label="How hard">
          {(
            [
              ['easy', 'Easy', 'Fewer animals, more forgiving jumps, slower vines'],
              ['normal', 'Normal', 'The game as it is meant to be played'],
            ] as const
          ).map(([id, label, blurb]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={level === id}
              onClick={() => setLevel(id)}
              className={`rounded-xl border-2 px-3 py-2 text-left ${level === id ? 'border-[#f2c14e] bg-[#f2c14e]/15' : 'border-[#f4ecd8]/25 bg-black/20'}`}
            >
              <span className="block text-base font-black">{label}</span>
              <span className="block text-xs leading-snug text-[#f4ecd8]/80">{blurb}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Step n={3} />
          <p className="text-base font-black">{name.trim() ? 'Tap Start' : 'Type your name, then tap Start'}</p>
        </div>
        <button
          type="submit"
          disabled={!name.trim()}
          className="mt-1.5 w-full rounded-xl bg-[#f2c14e] py-3.5 text-2xl font-black text-[#2a1a08] shadow-lg disabled:opacity-40"
        >
          Start
        </button>
        <p className="mt-2 text-xs leading-snug text-[#f4ecd8]/70">
          While you play, it records where your fingers touch and what Pokey does, to fine-tune how the game plays. No camera, microphone,
          location or personal info, and nothing is kept: the recordings are deleted when testing ends.
        </p>
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-[#f4ecd8]/25 bg-black/25 px-3 py-2 text-sm font-bold leading-snug">
          <span aria-hidden="true" className="text-base leading-none">✕</span>
          <span>When you're done, please close the browser tab. That stops the test.</span>
        </p>
      </form>
    </div>
  );
};

/** one question on the end screen: one tap picks (or a few, for "many"), every one optional */
export type SurveyQ = { id: string; q: string; a: readonly string[]; many?: boolean; faces?: boolean };

/** the five faces for "How fun was it?" (stored as 1 to 5) and what each one means, for a screen reader */
export const FACES: ReadonlyArray<readonly [string, string]> = [
  ['😞', 'Not fun'],
  ['🙁', 'A little fun'],
  ['😐', 'OK'],
  ['🙂', 'Fun'],
  ['😄', 'Loads of fun'],
];

/** the age bands (an optional range only: no birthday, nothing that names a child; the testers' link only, never the shipped game) */
export const AGE_BANDS = ['Under 8', '8-12', '13-17', 'Adult'] as const;

/**
 * The questions at the end, about what the recording cannot tell (the recording already has where he fell, how long it took and what
 * was tapped): how it felt, and which hand. (How the phone was held is cut: the October runs already answer it, the lead, 11-06.) "What felt hardest?" lists this run's own stretches in plain words
 * (ctestStretches.ts). About 30 seconds: every question optional, one tap each.
 */
export const surveyQuestions = (stretches: readonly string[]): SurveyQ[] => [
  { id: 'fun', q: 'How fun was it?', a: FACES.map((f) => f[1]), faces: true },
  { id: 'long', q: 'How long did it feel?', a: ['Too short', 'About right', 'Too long'] },
  { id: 'knew', q: 'Did you know what to do?', a: ['Always', 'Mostly', 'I got lost'] },
  { id: 'hard', q: 'What felt hardest? (tap any)', a: ['Running', ...stretchChoices(stretches), 'Nothing'], many: true },
  { id: 'tips', q: "Did Dot's tips help?", a: ['Yes', 'A bit', 'No', "Didn't notice them"] },
  { id: 'looked', q: 'Did anything look wrong or out of place?', a: ['No', 'Yes'] },
  { id: 'next', q: 'Would you play the next level?', a: ['Yes', 'Maybe', 'No'] },
  { id: 'hand', q: 'What did you mostly play with?', a: ['One thumb', 'Two thumbs', 'One finger (like your pointer)', 'A mix'] },
  { id: 'age', q: "Who's playing? (optional, just a rough age)", a: AGE_BANDS },
];

/**
 * The survey's row ('survey' moment, JSON). The keys the control test already sent keep their shape, so old rows still read: hand and
 * hard are lists of picks, note is text (held, in old rows only, was a list too). The new ones are single values: fun 1 to 5, the rest the words picked; a skipped question
 * is left out. `v: 2` marks the level test's rows, `run` is the run's own 'gen2' line (stage, seed, setting).
 */
export function surveyRow(ans: Readonly<Record<string, readonly string[]>>, note: string, lookedNote: string, run: string): Record<string, unknown> {
  const row: Record<string, unknown> = { v: 2 };
  for (const id of ['hand', 'hard']) if (ans[id]?.length) row[id] = [...ans[id]];
  for (const id of ['long', 'knew', 'tips', 'looked', 'next', 'age']) if (ans[id]?.length) row[id] = ans[id][0];
  const fun = FACES.findIndex((f) => f[1] === ans.fun?.[0]);
  if (fun >= 0) row.fun = fun + 1;
  if (row.looked === 'Yes' && lookedNote.trim()) row.lookedNote = lookedNote.trim().slice(0, 120);
  row.note = note.trim().slice(0, 300);
  if (run) row.run = run;
  return row;
}

/** a tap target on these screens: 44 px or more each way (PLAY-STORE-RULES, clipcheck) */
const CHIP = 'inline-flex min-h-[44px] items-center rounded-full border px-3.5 py-1.5 text-[15px] leading-tight';

/** the end of the test (at the shrine, or "I'm done"): the quick questions, thanks, and a way to play again */
export const ControlTestDone: React.FC<{ onAgain: () => void; stretches?: string[] }> = ({ onAgain, stretches = [] }) => {
  const QUESTIONS = React.useMemo(() => surveyQuestions(stretches), [stretches.join('|')]);
  const [ans, setAns] = React.useState<Record<string, string[]>>({});
  const [note, setNote] = React.useState('');
  const [lookedNote, setLookedNote] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const pick = (id: string, a: string, many?: boolean) =>
    setAns((o) => {
      const cur = o[id] ?? [];
      // (a second tap on a single pick takes it back: every question stays optional)
      const next = many ? (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]) : cur[0] === a ? [] : [a];
      return { ...o, [id]: next };
    });
  const send = () => {
    recorder.event('survey', JSON.stringify(surveyRow(ans, note, lookedNote, recorder.lastRun)));
    setSent(true);
  };
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#0e3b28]/95 p-3 text-[#f4ecd8]">
      <div className="mx-auto my-2 w-full max-w-xl rounded-2xl border border-[#f4ecd8]/20 bg-[#123d2a] p-4 shadow-2xl sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f2c14e]">Level test</p>
        <h1 className="mt-1 text-2xl font-black leading-tight">You're done. Thank you!</h1>
        {!sent ? (
          <>
            <p className="mt-2 text-sm leading-snug text-[#f4ecd8]/85">A few quick taps help Matt a lot. Skip any you like.</p>
            {QUESTIONS.map((q) => (
              <div key={q.id} className="mt-3.5" role="group" aria-label={q.q}>
                <p className="text-[15px] font-bold leading-snug">{q.q}</p>
                {q.faces ? (
                  <div className="mt-1.5 flex justify-between gap-1.5">
                    {FACES.map(([face, label]) => {
                      const on = (ans[q.id] ?? []).includes(label);
                      return (
                        <button key={label} type="button" onClick={() => pick(q.id, label)} aria-pressed={on} aria-label={label}
                          className={`flex h-[52px] min-w-[44px] flex-1 items-center justify-center rounded-2xl border-2 text-[28px] leading-none ${on ? 'border-[#f2c14e] bg-[#f2c14e]' : 'border-[#f4ecd8]/25 bg-black/15'}`}>
                          <span aria-hidden="true">{face}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {q.a.map((a) => {
                      const on = (ans[q.id] ?? []).includes(a);
                      return (
                        <button key={a} type="button" onClick={() => pick(q.id, a, q.many)} aria-pressed={on}
                          className={`${CHIP} ${on ? 'border-[#f2c14e] bg-[#f2c14e] font-bold text-[#2a1a08]' : 'border-[#f4ecd8]/30 bg-black/15'}`}>
                          {a}
                        </button>
                      );
                    })}
                  </div>
                )}
                {q.faces && (
                  <div aria-hidden="true" className="mt-1 flex justify-between text-xs text-[#f4ecd8]/65">
                    <span>Not fun</span>
                    <span>Loads of fun</span>
                  </div>
                )}
                {q.id === 'looked' && ans.looked?.[0] === 'Yes' && (
                  <input id="ctest-looked" value={lookedNote} onChange={(e) => setLookedNote(e.target.value)} maxLength={120}
                    aria-label="What looked wrong?" placeholder="What looked wrong? (a few words)"
                    className="mt-2 min-h-[44px] w-full rounded-lg border border-[#f4ecd8]/30 bg-[#0b2e20] px-3 py-2 text-base text-[#f4ecd8] outline-none focus:border-[#f2c14e]" />
                )}
              </div>
            ))}
            <label className="mt-4 block text-[15px] font-bold" htmlFor="ctest-note">Anything else? (optional)</label>
            <textarea id="ctest-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} rows={2}
              className="mt-1 w-full rounded-lg border border-[#f4ecd8]/30 bg-[#0b2e20] px-3 py-2 text-base text-[#f4ecd8] outline-none focus:border-[#f2c14e]" />
            <button type="button" onClick={send} className="mt-3 min-h-[48px] w-full rounded-xl bg-[#f2c14e] py-2.5 text-lg font-black text-[#2a1a08]">
              Send
            </button>
          </>
        ) : (
          <p className="mt-3 text-sm leading-snug text-[#f4ecd8]/85">
            Sent. You can close this page now, or play again. Every run is a new level, and every run helps.
          </p>
        )}
        <button type="button" onClick={onAgain}
          className={`mt-3 min-h-[48px] w-full rounded-xl py-2.5 text-lg font-black ${sent ? 'bg-[#f2c14e] text-[#2a1a08]' : 'border border-[#f4ecd8]/30 text-[#f4ecd8]'}`}>
          Play again (a new level)
        </button>
      </div>
    </div>
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
