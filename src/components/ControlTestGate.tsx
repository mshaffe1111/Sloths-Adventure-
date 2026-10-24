import React from 'react';
import { recorder, savedTesterName } from '../game/playRecorder.ts';

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
    onStart();
  };
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#0e3b28]/95 p-3 text-[#f4ecd8]">
      <form onSubmit={go} className="mx-auto my-2 w-full max-w-xl rounded-2xl border border-[#f4ecd8]/20 bg-[#123d2a] p-4 shadow-2xl sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f2c14e]">Control test</p>
        <h1 className="mt-1 text-2xl font-black leading-tight">Who's playing?</h1>
        <p className="mt-2 text-sm leading-snug text-[#f4ecd8]/85">
          Play this short level however feels natural to you. Thumbs, one finger, anything goes. There's no wrong way.
        </p>
        <p className="mt-2 rounded-lg bg-black/20 px-3 py-2 text-sm leading-snug">
          <b className="text-[#f2c14e]">How to play:</b> slide a finger to run · flick up to jump · tap to punch · flick sideways to kick
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

/** the little red dot while the test records (it never takes a touch) */
export const RecordingBadge: React.FC = () => {
  const [state, setState] = React.useState(recorder.sendState);
  React.useEffect(() => {
    recorder.onState = setState;
    return () => {
      recorder.onState = null;
    };
  }, []);
  return (
    <div
      className="pointer-events-none fixed left-1/2 z-[55] flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold text-white"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
      aria-label="Recording"
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
      REC{state === 'blocked' ? ' · not sending from this link' : ''}
    </div>
  );
};
