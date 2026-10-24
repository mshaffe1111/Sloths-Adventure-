import React from 'react';
import { polishEnabled, setPolishPref } from '../game/polish.ts';
import { goldSnakeEnabled, setGoldSnakePref } from '../game/goldSnake.ts';
import { protoStageEnabled, setProtoStagePref } from '../game/protoStage.ts';
import { paintedKitEnabled, setPaintedKitPref } from '../game/protoArt.ts';
import { heroClipsEnabled, setHeroClipsPref } from '../game/heroClips.ts';
import { orchSfxEnabled, setOrchSfxPref } from '../audio/sfxOrch.ts';
import { sound } from '../game/audio.ts';
import { waysideEnabled, setWaysidePref } from '../game/wayside.ts';
import { controlStyle, padSide, setControlStyle, setPadSide, type ControlStyle, type PadSide } from '../game/controlPrefs.ts';
import { perfEnabled, perfOffered, setPerfPref } from '../game/perfLog.ts';
import { jumpHelp, setJumpHelp, type JumpHelp } from '../game/jumpHelp.ts';
import { fullscreenSupported, isFullscreen, launchedAsApp, toggleFullscreen } from '../game/fullscreen.ts';
import { extraLives, gameSpeed, setExtraLives, setGameSpeed, type ExtraLives, type GameSpeed } from '../game/assist.ts';
import { refinedControls, setRefinedControlsPref } from '../game/refinedControls.ts';

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

/** the frame-time check (saved on the device; off unless turned on): a corner box with frames per second and a report of freezes */
export const PerfToggle: React.FC = () => {
  const [on, setOn] = React.useState(() => perfEnabled());
  const [offered] = React.useState(() => perfOffered());
  if (!offered) return null;
  return (
    <div className="pm-sound">
      <div className="pm-sound-h">
        <span className="flex items-center gap-2">
          <Icon color="#a5f3fc" size={22}>
            <path d="M3 12h4l3-8 4 16 3-8h4" />
          </Icon>
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


/** Matt's golden snake (saved on the device): off by default while testers try it */
export const GoldSnakeToggle: React.FC = () => {
  const [on, setOn] = React.useState(() => goldSnakeEnabled());
  return (
    <div className="pm-sound">
      <div className="pm-sound-h">
        <span className="flex items-center gap-2">
          <Icon color="#f6c35a" size={22}>
            <path d="M4 16c3 0 3-4 6-4s3 4 6 4 3-4 4-4" />
            <circle cx="20" cy="11" r="1.6" />
          </Icon>
          Golden snakes
        </span>
        <button
          type="button"
          className="pm-mute pm-polish"
          aria-pressed={on}
          onClick={() => {
            const v = !on;
            setGoldSnakePref(v);
            setOn(v);
          }}
        >
          {on ? 'On' : 'Off'}
        </button>
      </div>
      <small className="pm-polish-note">Try the new snake: one painting with a body that slithers, rears and strikes smoothly. It moves and hits exactly like the old one. Off by default while it is being tested.</small>
    </div>
  );
};

/** the hand-built 1-6 (protoStage.ts): off by default while it is being tested */
export const ProtoStageToggle: React.FC = () => {
  const [on, setOn] = React.useState(() => protoStageEnabled());
  return (
    <div className="pm-sound">
      <div className="pm-sound-h">
        <span className="flex items-center gap-2">
          <Icon color="#7fd36a" size={22}>
            <path d="M5 3v8a4 4 0 0 0 8 0" />
            <path d="M13 3v5" />
            <path d="M19 3v10a3 3 0 0 1-6 0" />
          </Icon>
          New stage 1-6 (test)
        </span>
        <button
          type="button"
          className="pm-mute pm-polish"
          aria-pressed={on}
          onClick={() => {
            const v = !on;
            setProtoStagePref(v);
            setOn(v);
          }}
        >
          {on ? 'On' : 'Off'}
        </button>
      </div>
      <small className="pm-polish-note">Plays the rebuilt "First Lianas": vine-to-vine swings, a tree to climb, a log to push, a branch that snaps and two golden seeds to find. Starts the next time you enter 1-6. Off by default while it is being tested.</small>
    </div>
  );
};

/** Matt's painted World 1 platforms on every World 1 stage (protoArt.ts): off by default while it is being tested */
export const PaintedKitToggle: React.FC = () => {
  const [on, setOn] = React.useState(() => paintedKitEnabled());
  return (
    <div className="pm-sound">
      <div className="pm-sound-h">
        <span className="flex items-center gap-2">
          <Icon color="#a3d977" size={22}>
            <path d="M3 17h18" />
            <path d="M5 17v-4h6v4" />
            <path d="M13 17v-7h6v7" />
          </Icon>
          Painted platforms (test)
        </span>
        <button
          type="button"
          className="pm-mute pm-polish"
          aria-pressed={on}
          onClick={() => {
            const v = !on;
            setPaintedKitPref(v);
            setOn(v);
          }}
        >
          {on ? 'On' : 'Off'}
        </button>
      </div>
      <small className="pm-polish-note">The new painted ground, ledges, climbs and rocks, in each world's own look where its sheets are in (Worlds 1 to 6 so far; the rest keep today's look). Starts on the next stage you enter. Off by default while it is being tested.</small>
    </div>
  );
};

/** Pokey's new moving clips (heroClips.ts): off by default while they are being tested */
export const HeroClipsToggle: React.FC = () => {
  const [on, setOn] = React.useState(() => heroClipsEnabled());
  return (
    <div className="pm-sound">
      <div className="pm-sound-h">
        <span className="flex items-center gap-2">
          <Icon color="#f6c177" size={22}>
            <circle cx="12" cy="8" r="4" />
            <path d="M5 21c1-4 4-6 7-6s6 2 7 6" />
          </Icon>
          New animations (test)
        </span>
        <button
          type="button"
          className="pm-mute pm-polish"
          aria-pressed={on}
          onClick={() => {
            const v = !on;
            setHeroClipsPref(v);
            setOn(v);
          }}
        >
          {on ? 'On' : 'Off'}
        </button>
      </div>
      <small className="pm-polish-note">Real animation made with the trained art models: stand still and Pokey yawns, scratches, waves and nods off, rubs his head after a hit and cheers at the exit; some story scenes move (the campfire, the storm, the misty village). Starts on the next stage or scene. Off by default while it is being tested.</small>
    </div>
  );
};

/** the refined touch rules from the control test (refinedControls.ts): off by default while testers play */
export const RefinedControlsToggle: React.FC = () => {
  const [on, setOn] = React.useState(() => refinedControls());
  return (
    <div className="pm-sound">
      <div className="pm-sound-h">
        <span className="flex items-center gap-2">
          <Icon color="#9ccfd8" size={22}>
            <path d="M9 11V5a2 2 0 0 1 4 0v6" />
            <path d="M13 9a2 2 0 0 1 4 0v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-3l-2-4a2 2 0 0 1 3-2l2 2" />
          </Icon>
          Refined controls (test)
        </span>
        <button
          type="button"
          className="pm-mute pm-polish"
          aria-pressed={on}
          onClick={() => {
            const v = !on;
            setRefinedControlsPref(v);
            setOn(v);
          }}
        >
          {on ? 'On' : 'Off'}
        </button>
      </div>
      <small className="pm-polish-note">The fixes from the control test: Pokey keeps his speed when you lift your finger mid-jump, letting go of a vine sends you forward, vines swing on their own, and a sideways flick only kicks when an animal is near. Starts on the next stage. Off by default while it is being tested.</small>
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
          <Icon color="#93c5fd" size={22}>
            <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
          </Icon>
          Full screen
        </span>
        <button type="button" data-fs-toggle="true" className="pm-mute pm-polish" aria-pressed={on} onClick={() => setOn(toggleFullscreen())}>
          {on ? 'On' : 'Off'}
        </button>
      </div>
    </div>
  );
};
