import React, { useEffect, useState } from 'react';
import {
  getControlMode,
  getTiltFlip,
  requestTiltPermission,
  setControlMode,
  setTiltFlip,
  subscribeControls,
} from '../game/controls.ts';

/** Slide-your-fingers or tilt. Lives in the pause menu and on the title screen. */
export const ControlPicker: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [, force] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  useEffect(() => subscribeControls(() => force((n) => n + 1)), []);
  const mode = getControlMode();

  const choose = async (m: 'gestures' | 'tilt') => {
    setNote(null);
    if (m === 'tilt') {
      // iPhone only allows the motion prompt from inside a tap, so it has to happen here
      const r = await requestTiltPermission();
      if (r === 'unsupported') return setNote('This device has no tilt sensor.');
      if (r === 'denied') return setNote('Motion access was refused. Allow it in Settings to use tilt.');
    }
    setControlMode(m);
  };

  const btn = (m: 'gestures' | 'tilt', label: string) => (
    <button
      type="button"
      onClick={() => void choose(m)}
      aria-pressed={mode === m}
      className={`flex-1 py-2 rounded-xl text-xs font-black tracking-wide border transition-colors ${
        mode === m
          ? 'bg-amber-400 text-stone-900 border-amber-200'
          : 'bg-emerald-900/50 text-emerald-200 border-emerald-600/40 hover:bg-emerald-900/80'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className={`text-left ${className}`}>
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 mb-1.5">Controls</div>
      <div className="flex gap-2">
        {btn('gestures', 'SLIDE FINGERS')}
        {btn('tilt', 'TILT')}
      </div>
      {mode === 'tilt' && (
        <label className="mt-2 flex items-center gap-2 text-[11px] font-bold text-emerald-200/90">
          <input type="checkbox" checked={getTiltFlip()} onChange={(e) => setTiltFlip(e.target.checked)} />
          Running the wrong way? Flip tilt direction
        </label>
      )}
      {note && <div className="mt-2 text-[11px] font-bold text-amber-300">{note}</div>}
    </div>
  );
};
