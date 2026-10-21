import React from 'react';
import { polishEnabled, setPolishPref } from '../game/polish.ts';
import { orchSfxEnabled, setOrchSfxPref } from '../audio/sfxOrch.ts';
import { sound } from '../game/audio.ts';
import { waysideEnabled, setWaysidePref } from '../game/wayside.ts';
import { controlStyle, padSide, setControlStyle, setPadSide, type ControlStyle, type PadSide } from '../game/controlPrefs.ts';
import { jumpHelp, setJumpHelp, type JumpHelp } from '../game/jumpHelp.ts';
import { extraLives, gameSpeed, setExtraLives, setGameSpeed, type ExtraLives, type GameSpeed } from '../game/assist.ts';

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

/** the story-lines-while-you-play switch (saved on the device; on unless turned off) */
export const WaysideToggle: React.FC = () => {
  const [on, setOn] = React.useState(() => waysideEnabled());
  return (
    <div className="pm-sound">
      <div className="pm-sound-h">
        <span className="flex items-center gap-2">
          <Icon color="#f9a8d4" size={22}>
            <path d="M4 5h16v10H9l-5 4z" />
            <path d="M8 9h8M8 12h5" />
          </Icon>
          Story lines in stages
        </span>
        <button
          type="button"
          className="pm-mute pm-polish"
          aria-pressed={on}
          onClick={() => {
            const v = !on;
            setWaysidePref(v);
            setOn(v);
          }}
        >
          {on ? 'On' : 'Off'}
        </button>
      </div>
      <small className="pm-polish-note">Now and then Dot, Pokey or the petal says a short line while you play. They never pause the game. Turn them off if you would rather just play.</small>
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
  const [help, setHelp] = React.useState<JumpHelp>(() => jumpHelp());
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
      {style === 'screen' && (
        <div className="pm-sound-h" style={{ marginTop: 8 }}>
          <span className="pm-polish-note" style={{ margin: 0 }}>
            Jump help
          </span>
          <Seg
            value={help}
            options={[
              { id: 'off', label: 'Off' },
              { id: 'keep', label: 'Tap' },
              { id: 'forward', label: 'Tap + forward' },
            ]}
            onPick={(v) => {
              setJumpHelp(v);
              setHelp(v);
            }}
          />
        </div>
      )}
      <small className="pm-polish-note">
        {style === 'pad'
          ? 'A pad for running, and Jump, Punch and Kick buttons on the other side. Flip it for left-handers.'
          : help === 'off'
            ? 'No buttons: slide, flick and tap anywhere on the screen. The second jump needs a quick flick up.'
            : help === 'keep'
              ? 'No buttons: slide, flick and tap anywhere. In the air a tap (or a wiggle of your thumb) is the second jump. A tap in the air no longer punches until the second jump is used.'
              : 'Like Tap, and the second jump also pushes Pokey forward the way he faces, so one thumb can jump, tap and cross a gap. Push the other way to brake. A first jump is always just a jump.'}
      </small>
    </div>
  );
};

/** optional help: more lives before Game Over, and a slower game. Never changes the stars; applies from the next stage entry or retry */
export const AssistSetting: React.FC = () => {
  const [lives, setLives] = React.useState<ExtraLives>(() => extraLives());
  const [speed, setSpeed] = React.useState<GameSpeed>(() => gameSpeed());
  return (
    <div className="pm-sound">
      <div className="pm-sound-h">
        <span className="flex items-center gap-2">
          <Icon color="#fda4af" size={22}>
            <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
          </Icon>
          Extra lives
        </span>
        <Seg
          value={String(lives)}
          options={[
            { id: '0', label: 'None' },
            { id: '2', label: '+2' },
            { id: '4', label: '+4' },
          ]}
          onPick={(v) => {
            const n = Number(v) as ExtraLives;
            setExtraLives(n);
            setLives(n);
          }}
        />
      </div>
      <div className="pm-sound-h" style={{ marginTop: 8 }}>
        <span className="pm-polish-note" style={{ margin: 0 }}>
          Game speed
        </span>
        <Seg
          value={String(speed)}
          options={[
            { id: '1', label: '100%' },
            { id: '0.9', label: '90%' },
            { id: '0.8', label: '80%' },
          ]}
          onPick={(v) => {
            const n = Number(v) as GameSpeed;
            setGameSpeed(n);
            setSpeed(n);
          }}
        />
      </div>
      <small className="pm-polish-note">Help for a tough stage: more lives before Game Over, and a slower game (animals, hazards and Pokey all slow together). Stars are earned the same way. It starts from the next stage or retry.</small>
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

