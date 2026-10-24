import React from 'react';
import { recorder, savedTesterName } from '../game/playRecorder.ts';
import { refinedControls } from '../game/refinedControls.ts';
import { checkForUpdate, hardRefresh } from '../game/updates.ts';
import { BUILD_TIME, formatBuildTime } from '../game/version.ts';

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
    <div className={`mb-3 rounded-2xl border-2 p-3 ${isNew ? 'border-[#f2c14e] bg-[#f2c14e]/15' : 'border-[#f4ecd8]/25 bg-black/20'}`}>
      <p className="text-center text-base font-black leading-tight">
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
        className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-2xl font-black text-[#2a1a08] ${isNew ? 'animate-pulse bg-[#f2c14e]' : 'bg-[#f2c14e]'}`}
      >
        <span aria-hidden="true" className="text-3xl leading-none">↻</span>
        {busy ? 'Refreshing…' : 'Refresh'}
      </button>
      <p className="mt-2 text-center text-xs text-[#f4ecd8]/75">
        {stamp ? `This version: ${stamp}` : 'This version: (no date)'}
        {state === 'checking' ? ' · checking…' : ''}
      </p>
    </div>
  );
};

/**
 * The control test's front door (only with #ctest in the address): who is playing, what gets recorded, and Start.
 * Recording begins on Start, and the test stage opens straight away.
 */
export const ControlTestGate: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [name, setName] = React.useState(savedTesterName);
  const go = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    recorder.start(name);
    // which touch rules this run used, so before and after can be compared
    recorder.event('rules', refinedControls() ? 'refined' : 'old');
    onStart();
  };
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#0e3b28]/95 p-3 text-[#f4ecd8]">
      <form onSubmit={go} className="mx-auto my-2 w-full max-w-xl rounded-2xl border border-[#f4ecd8]/20 bg-[#123d2a] p-4 shadow-2xl sm:p-5">
        <FreshBuild />
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f2c14e]">Control test</p>
        <h1 className="mt-1 text-2xl font-black leading-tight">Who's playing?</h1>
        <p className="mt-2 text-sm leading-snug text-[#f4ecd8]/85">
          Play this short level however feels natural to you. Thumbs, one finger, anything goes. There's no wrong way. Every run is a
          different mix of challenges, so playing again shows you new ones.
        </p>
        <p className="mt-2 rounded-lg bg-black/20 px-3 py-2 text-sm leading-snug">
          <b className="text-[#f2c14e]">How to play:</b> slide a finger to run ·{' '}
          {refinedControls() ? 'tap or flick up to jump · tap near a foe to punch' : 'flick up to jump · tap to punch'} · flick sideways to kick
        </p>
        <p className="mt-2 text-xs leading-snug text-[#f4ecd8]/70">
          While you play, it records your taps and swipes and what Pokey does, so Matt can see where the controls trip people
          up. No camera, microphone, location or personal info.
        </p>
        <label className="mt-3 block text-sm font-bold" htmlFor="ctest-name">
          Your name or a nickname
        </label>
        <input
          id="ctest-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          autoComplete="nickname"
          className="mt-1 w-full rounded-lg border border-[#f4ecd8]/30 bg-[#0b2e20] px-3 py-2.5 text-base text-[#f4ecd8] outline-none focus:border-[#f2c14e]"
          placeholder="e.g. Jen"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="mt-3 w-full rounded-xl bg-[#f2c14e] py-2.5 text-lg font-black text-[#2a1a08] disabled:opacity-40"
        >
          Start
        </button>
      </form>
    </div>
  );
};

/**
 * the quick questions at the end: what the recording cannot tell (which hand, how the phone was held, what felt hard). "Hardest" lists
 * the stretches this run had (every run is a different mix: protoStage.ts).
 */
const questions = (stretches: string[]): Array<{ id: string; q: string; a: string[]; many?: boolean }> => {
  const played = stretches.filter((n) => n !== 'Finish' && n !== 'Run and stop');
  return [
    { id: 'hand', q: 'What did you mostly play with?', a: ['One thumb', 'Two thumbs', 'One finger (like your pointer)', 'A mix'] },
    { id: 'held', q: 'How did you hold the phone?', a: ['In one hand', 'In both hands', 'Lying on a table or lap'] },
    { id: 'hard', q: 'What felt hardest? (tap any)', a: ['Running', ...(played.length ? played : ['Short hops', 'Long jumps', 'Climbing', 'Swinging on vines', 'Fighting']), 'Nothing'], many: true },
  ];
};

/** the end of the test (at the shrine): a few one-tap questions, thanks, and a way to play it again */
export const ControlTestDone: React.FC<{ onAgain: () => void; stretches?: string[] }> = ({ onAgain, stretches = [] }) => {
  const QUESTIONS = React.useMemo(() => questions(stretches), [stretches.join('|')]);
  const [ans, setAns] = React.useState<Record<string, string[]>>({});
  const [note, setNote] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const pick = (id: string, a: string, many?: boolean) =>
    setAns((o) => {
      const cur = o[id] ?? [];
      const next = many ? (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]) : [a];
      return { ...o, [id]: next };
    });
  const send = () => {
    recorder.event('survey', JSON.stringify({ ...ans, note: note.trim().slice(0, 300) }));
    setSent(true);
  };
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#0e3b28]/95 p-3 text-[#f4ecd8]">
      <div className="mx-auto my-2 w-full max-w-xl rounded-2xl border border-[#f4ecd8]/20 bg-[#123d2a] p-4 shadow-2xl sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f2c14e]">Control test</p>
        <h1 className="mt-1 text-2xl font-black leading-tight">You're done. Thank you!</h1>
        {!sent ? (
          <>
            <p className="mt-2 text-sm leading-snug text-[#f4ecd8]/85">Three quick taps help Matt a lot:</p>
            {QUESTIONS.map((q) => (
              <div key={q.id} className="mt-3">
                <p className="text-sm font-bold">{q.q}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {q.a.map((a) => {
                    const on = (ans[q.id] ?? []).includes(a);
                    return (
                      <button key={a} type="button" onClick={() => pick(q.id, a, q.many)} aria-pressed={on}
                        className={`rounded-full border px-3 py-1.5 text-sm ${on ? 'border-[#f2c14e] bg-[#f2c14e] font-bold text-[#2a1a08]' : 'border-[#f4ecd8]/30 bg-black/15'}`}>
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <label className="mt-3 block text-sm font-bold" htmlFor="ctest-note">Anything feel wrong or annoying? (optional)</label>
            <textarea id="ctest-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} rows={2}
              className="mt-1 w-full rounded-lg border border-[#f4ecd8]/30 bg-[#0b2e20] px-3 py-2 text-base text-[#f4ecd8] outline-none focus:border-[#f2c14e]" />
            <button type="button" onClick={send} className="mt-3 w-full rounded-xl bg-[#f2c14e] py-2.5 text-lg font-black text-[#2a1a08]">
              Send
            </button>
          </>
        ) : (
          <p className="mt-3 text-sm leading-snug text-[#f4ecd8]/85">
            Sent. You can close this page now, or play the level again. Every run helps.
          </p>
        )}
        <button type="button" onClick={onAgain}
          className={`mt-3 w-full rounded-xl py-2.5 text-lg font-black ${sent ? 'bg-[#f2c14e] text-[#2a1a08]' : 'border border-[#f4ecd8]/30 text-[#f4ecd8]'}`}>
          Play again (a new mix)
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
      <div className="pointer-events-none flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold text-white" aria-label="Recording">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        REC{state === 'blocked' ? ' · not sending from this link' : ''}
      </div>
      {onDone && (
        <button
          type="button"
          onClick={() => (sure ? onDone() : setSure(true))}
          className={`rounded-full px-3 py-1 text-[12px] font-bold ${sure ? 'bg-[#f2c14e] text-[#2a1a08]' : 'bg-black/45 text-white'}`}
        >
          {sure ? 'Tap again to finish' : "I'm done"}
        </button>
      )}
    </div>
  );
};
