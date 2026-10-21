import React from 'react';
import { polishEnabled, setPolishPref } from '../game/polish.ts';
import { orchSfxEnabled, setOrchSfxPref } from '../audio/sfxOrch.ts';
import { sound } from '../game/audio.ts';
import { controlStyle, padSide, setControlStyle, setPadSide, type ControlStyle, type PadSide } from '../game/controlPrefs.ts';

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

/** a row of exclusive choices, drawn as a segmented button */
function Seg<T extends string>({ value, options, onPick }: { value: T; options: { id: T; label: string }[]; onPick: (v: T) => void }) {
  return (
    <div className="pm-seg" role="group">
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} className={value === o.id ? 'on' : ''} onClick={() => onPick(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** how a touch screen controls the game: the whole screen, or a drawn thumb pad with Jump / Punch / Kick buttons (flippable for left-handers) */
export const ControlsSetting: React.FC = () => {
  const [style, setStyle] = React.useState<ControlStyle>(() => controlStyle());
  const [side, setSide] = React.useState<PadSide>(() => padSide());
  return (
    <div className="pm-sound">
      <div className="pm-sound-h">
        <span className="flex items-center gap-2">
          <Icon color="#93c5fd" size={22}>
            <circle cx="8" cy="12" r="4" />
            <circle cx="17" cy="8" r="2.5" />
            <circle cx="17" cy="16" r="2.5" />
          </Icon>
          Touch controls
        </span>
        <Seg
          value={style}
          options={[
            { id: 'screen', label: 'Screen' },
            { id: 'pad', label: 'Pad' },
          ]}
          onPick={(v) => {
            setControlStyle(v);
            setStyle(v);
          }}
        />
      </div>
      {style === 'pad' && (
        <div className="pm-sound-h" style={{ marginTop: 8 }}>
          <span className="pm-polish-note" style={{ margin: 0 }}>
            Thumb pad on the
          </span>
          <Seg
            value={side}
            options={[
              { id: 'right', label: 'Right' },
              { id: 'left', label: 'Left' },
            ]}
            onPick={(v) => {
              setPadSide(v);
              setSide(v);
            }}
          />
        </div>
      )}
      <small className="pm-polish-note">{style === 'pad' ? 'A pad for running, and Jump, Punch and Kick buttons on the other side. Flip it for left-handers.' : 'No buttons: slide, flick and tap anywhere on the screen.'}</small>
    </div>
  );
};

/** the orchestral sound-effects switch (saved on the device): pickups, hits and animals played by the music's own instruments, no bells or glass */
export const OrchSfxToggle: React.FC = () => {
  const [on, setOn] = React.useState(() => orchSfxEnabled());
  return (
    <div className="pm-sound">
      <div className="pm-sound-h">
        <span className="flex items-center gap-2">
          <Icon color="#fcd34d" size={22}>
            <path d="M9 18V6l10-2v12" />
            <circle cx="7" cy="18" r="2.2" />
            <circle cx="17" cy="16" r="2.2" />
          </Icon>
          Orchestra sound effects
        </span>
        <button
          type="button"
          className="pm-mute pm-polish"
          aria-pressed={on}
          onClick={() => {
            const v = !on;
            setOrchSfxPref(v);
            if (v) sound.warmOrchSfx();
            // a flower and a defeat, so the change is heard at once (the recordings may still be arriving: whatever is ready plays)
            window.setTimeout(() => {
              sound.playFlowerPickup(1);
              window.setTimeout(() => sound.playEnemyDefeated('jaguar'), 450);
            }, 500);
            setOn(v);
          }}
        >
          {on ? 'On' : 'Off'}
        </button>
      </div>
      <small className="pm-polish-note">Pickups, hits and each animal's sounds played by the same instruments as the music: no bells or glass, and a different instrument each time. Off by default; switch it on if you like it.</small>
    </div>
  );
};

