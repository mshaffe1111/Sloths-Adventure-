import React from 'react';
import { sound } from '../game/audio.ts';
import { waysideEnabled, setWaysidePref } from '../game/wayside.ts';
import { setShakeLevel, shakeLevel, type ShakeLevel } from '../game/screenShake.ts';
import { canBuzz, hapticsOn, setHaptics, vibrate } from '../game/haptics.ts';
import { controlStyle, padSide, setControlStyle, setPadSide, steerHand, setSteerHand, touchSensitivity, setTouchSensitivity, type ControlStyle, type PadSide } from '../game/controlPrefs.ts';
import { showTouches, setShowTouches, type ShowTouches } from '../game/touchMarks.ts';
import { perfEnabled, perfOffered, setPerfPref } from '../game/perfLog.ts';
import { jumpHelp, setJumpHelp, type JumpHelp } from '../game/jumpHelp.ts';
import { fullscreenSupported, isFullscreen, launchedAsApp, toggleFullscreen } from '../game/fullscreen.ts';
import { extraLives, gameSpeed, setExtraLives, setGameSpeed, type ExtraLives, type GameSpeed } from '../game/assist.ts';
import { DIFFICULTY_LABEL, difficulty, switchDifficulty, subscribeDifficulty, type Difficulty } from '../game/difficulty.ts';
import { DOT_HELP_LABEL, dotHelp, setDotHelp, type DotHelp } from '../game/dotGuideHelp.ts';
import { dotSaid } from '../game/dotGuide.ts';
import { hearTipsAgain } from '../game/dotMemory.ts';
import { DotFace } from './DotFace.tsx';
import { Icon as Glyph, type IconName } from './icons/index.tsx';

/** "Dot's help" (the new look): Help / Tips / Quiet, "Hear Dot's tips again", and her last three lines under it */
export const DotHelpSetting: React.FC = () => {
  const [help, setHelp] = React.useState<DotHelp>(() => dotHelp());
  const [again, setAgain] = React.useState(false);
  const said = dotSaid();
  return (
    <div className="pm-sound">
      <div className="pm-sound-h">
        <span className="flex items-center gap-2">
          <span className="pm-set-ic" aria-hidden="true">
            <DotFace size={24} />
          </span>
          Dot&apos;s help
        </span>
      </div>
      <div style={{ marginTop: 8 }}>
        <Seg
          value={help}
          options={(['teach', 'reminders', 'quiet'] as const).map((id) => ({ id, label: DOT_HELP_LABEL[id].name }))}
          onPick={(v) => {
            setDotHelp(v);
            setHelp(v);
          }}
        />
      </div>
      <small className="pm-polish-note">{DOT_HELP_LABEL[help].blurb} A locked exit is always explained.</small>
      <button
        type="button"
        className="pm-mute pm-dot-again"
        disabled={again}
        onClick={() => {
          hearTipsAgain();
          setAgain(true);
        }}
      >
        {again ? 'Dot will teach it all again' : "Hear Dot's tips again"}
      </button>
      {said.length > 0 && (
        <div className="pm-dotsaid" aria-label="Dot said">
          <small className="pm-polish-note" style={{ fontWeight: 700 }}>
            Dot said:
          </small>
          {said.map((s, i) => (
            <small key={i} className="pm-polish-note" style={{ display: 'block', marginTop: 2 }}>
              {s.who === 'Dot' ? '' : `${s.who === 'Pokey' ? 'Pokey' : 'The petal'}: `}&ldquo;{s.text}&rdquo;
            </small>
          ))}
        </div>
      )}
    </div>
  );
};

/** keyboard shortcut hints only make sense when there is a keyboard (not on a touch-only phone) */
export const COARSE = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;

/** a setting's picture, from the game's own painted icon set, in a small round well */
export const SetIcon: React.FC<{ name: IconName }> = ({ name }) => (
  <span className="pm-set-ic" aria-hidden="true">
    <Glyph name={name} size={20} />
  </span>
);

/** the frame-time check (saved on the device; off unless turned on): a corner box with frames per second and a report of freezes */
export const PerfToggle: React.FC = () => {
  const [on, setOn] = React.useState(() => perfEnabled());
  const [offered] = React.useState(() => perfOffered());
  if (!offered) return null;
  return (
    <div className="pm-sound">
      <div className="pm-sound-h">
        <span className="flex items-center gap-2">
          <SetIcon name="bolt" />
          Frame-time check
        </span>
        <button
          type="button"
          className="pm-mute pm-polish"
          aria-pressed={on}
          onClick={() => {
            const v = !on;
            setPerfPref(v);
            setOn(v);
          }}
        >
          {on ? 'On' : 'Off'}
        </button>
      </div>
      <small className="pm-polish-note">For testing: shows a small box with the frame rate and logs every freeze. Tap the box to copy the report.</small>
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
          <SetIcon name="scroll" />
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

/** how hard the screen shakes on a big hit or a boss's slam (AN-10); Gentle to start with where the phone asks for less motion */
export const ShakeSetting: React.FC = () => {
  const [v, setV] = React.useState<ShakeLevel>(() => shakeLevel());
  return (
    <div className="pm-sound">
      <div className="pm-sound-h">
        <span className="flex items-center gap-2">
          <SetIcon name="burst" />
          Screen shake
        </span>
        <Seg<ShakeLevel>
          value={v}
          options={[
            { id: 'full', label: 'Full' },
            { id: 'gentle', label: 'Gentle' },
            { id: 'off', label: 'Off' },
          ]}
          onPick={(n) => {
            setShakeLevel(n);
            setV(n);
          }}
        />
      </div>
    </div>
  );
};

/** the phone's buzz for a hurt, a hard landing, a boss's slam, a flag and a clear, and the button presses (AN-9; on unless turned off) */
export const HapticsToggle: React.FC = () => {
  const [on, setOn] = React.useState(() => hapticsOn());
  return (
    <div className="pm-sound">
      <div className="pm-sound-h">
        <span className="flex items-center gap-2">
          <SetIcon name="bolt" />
          Vibration
        </span>
        <button
          type="button"
          className="pm-mute pm-polish"
          aria-pressed={on}
          onClick={() => {
            const v = !on;
            setHaptics(v);
            setOn(v);
            if (v) vibrate(20);
          }}
        >
          {on ? 'On' : 'Off'}
        </button>
      </div>
      <small className="pm-polish-note">{canBuzz() ? 'A buzz when Pokey is hurt, lands hard, a boss slams, at a flag and at the shrine.' : 'This browser cannot buzz the phone (iPhones never do).'}</small>
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
  const [marks, setMarks] = React.useState<ShowTouches>(() => showTouches());
  const [hand, setHand] = React.useState<PadSide>(() => steerHand());
  const [sens, setSens] = React.useState<number>(() => touchSensitivity());
  // (iPhones never buzz for a web page: there the marks are the only feedback a touch gets, CT-14)
  const noBuzz = typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function';
  return (
    <div className="pm-sound">
      <div className="pm-sound-h">
        <span className="flex items-center gap-2">
          <SetIcon name="paw" />
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
              { id: 'left', label: 'Left' },
              { id: 'right', label: 'Right' },
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
              { id: 'keep', label: 'On' },
              { id: 'forward', label: 'On + forward' },
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
          ? 'A pad for running under your left thumb, and Jump, Punch and Kick buttons on the other side. Flip it to run with your right thumb.'
          : help === 'off'
            ? 'No buttons: slide, flick and tap anywhere on the screen. A tap punches and every jump is a move up. The second jump needs a quick flick up.'
            : help === 'keep'
              ? 'No buttons: slide, flick and tap anywhere. A tap punches and every jump is a move up. In the air a short slide up (or a wiggle of your thumb) is the second jump.'
              : 'Like On, and the second jump also pushes Pokey forward the way he faces, so one thumb can jump twice and cross a gap. Push the other way to brake. A first jump is always just a jump.'}
      </small>
      {style === 'screen' && (
        <div className="pm-sound-h" style={{ marginTop: 8 }}>
          <span className="pm-polish-note" style={{ margin: 0 }}>
            Steer with
          </span>
          <Seg
            value={hand}
            options={[
              { id: 'left', label: 'Left' },
              { id: 'right', label: 'Right' },
            ]}
            onPick={(v) => {
              setSteerHand(v);
              setHand(v);
            }}
          />
        </div>
      )}
      {style === 'screen' && (
        <div className="pm-sound-h" style={{ marginTop: 8 }}>
          <span className="pm-polish-note" style={{ margin: 0 }}>
            Sensitivity
          </span>
          <span className="flex items-center gap-2">
            <input
              type="range"
              min={0.75}
              max={1.35}
              step={0.05}
              value={sens}
              aria-label="Touch sensitivity"
              style={{ width: 120, accentColor: '#10b981' }}
              onChange={(e) => {
                const v = Number(e.target.value);
                setTouchSensitivity(v);
                setSens(v);
              }}
            />
            <span className="pm-polish-note" style={{ margin: 0, minWidth: 34, textAlign: 'right' }}>
              {Math.round(sens * 100)}%
            </span>
          </span>
        </div>
      )}
      {style === 'screen' && (
        <div className="pm-sound-h" style={{ marginTop: 8 }}>
          <span className="pm-polish-note" style={{ margin: 0 }}>
            Show touches
          </span>
          <Seg
            value={marks}
            options={[
              { id: 'auto', label: 'Auto' },
              { id: 'on', label: 'On' },
              { id: 'off', label: 'Off' },
            ]}
            onPick={(v) => {
              setShowTouches(v);
              setMarks(v);
            }}
          />
        </div>
      )}
      {style === 'screen' && (
        <small className="pm-polish-note">
          {marks === 'off' ? 'No marks under your fingers.' : `A ring shows where your steering thumb is, and each move flashes its name${marks === 'auto' ? ' (in World 1, while the moves are new)' : ''}.`}
          {noBuzz ? " This phone doesn't buzz for web games, so the marks are your feedback." : ''}
        </small>
      )}
    </div>
  );
};

/** Easy or Normal: picked at New Game, changeable here any time; it applies from the next stage */
export const DifficultySetting: React.FC = () => {
  const [level, setLevel] = React.useState<Difficulty>(() => difficulty());
  React.useEffect(() => subscribeDifficulty(() => setLevel(difficulty())), []);
  return (
    <div className="pm-sound">
      <div className="pm-sound-h">
        <span className="flex items-center gap-2">
          <SetIcon name="shield" />
          Difficulty
        </span>
        <Seg
          value={level}
          options={[
            { id: 'easy', label: DIFFICULTY_LABEL.easy.name },
            { id: 'normal', label: DIFFICULTY_LABEL.normal.name },
          ]}
          onPick={(v) => {
            switchDifficulty(v);
            setLevel(v);
          }}
        />
      </div>
      <small className="pm-polish-note">{DIFFICULTY_LABEL[level].blurb} It starts from the next stage.</small>
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
          <SetIcon name="heart" />
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

/** full screen on or off (the game starts full screen; this is the way out, and back): hidden where the browser cannot do it */
export const FullscreenSetting: React.FC = () => {
  const [on, setOn] = React.useState(() => isFullscreen());
  React.useEffect(() => {
    const f = () => setOn(isFullscreen());
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);
  if (!fullscreenSupported() || launchedAsApp()) return null;
  return (
    <div className="pm-sound">
      <div className="pm-sound-h">
        <span className="flex items-center gap-2">
          <SetIcon name="expand" />
          Full screen
        </span>
        <button type="button" data-fs-toggle="true" className="pm-mute pm-polish" aria-pressed={on} onClick={() => setOn(toggleFullscreen())}>
          {on ? 'On' : 'Off'}
        </button>
      </div>
    </div>
  );
};
