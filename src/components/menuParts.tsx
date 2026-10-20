import React from 'react';
import { polishEnabled, setPolishPref } from '../game/polish.ts';

/** keyboard shortcut hints only make sense when there is a keyboard (not on a touch-only phone) */
export const COARSE = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;

export const Icon: React.FC<{ color: string; children: React.ReactNode; size?: number }> = ({ color, children, size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
    {children}
  </svg>
);

/** the polished-visuals switch (saved on the device) */
export const PolishToggle: React.FC = () => {
  const [on, setOn] = React.useState(() => polishEnabled());
  return (
    <div className="pm-sound">
      <div className="pm-sound-h">
        <span className="flex items-center gap-2">
          <Icon color="#fde68a" size={22}>
            <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
            <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
          </Icon>
          Polished visuals
        </span>
        <button
          type="button"
          className="pm-mute pm-polish"
          aria-pressed={on}
          onClick={() => {
            const v = !on;
            setPolishPref(v);
            setOn(v);
          }}
        >
          {on ? 'On' : 'Off'}
        </button>
      </div>
      <small className="pm-polish-note">Wind, glow, soft shadows and richer ground. Turn it off if the game feels slow.</small>
    </div>
  );
};
