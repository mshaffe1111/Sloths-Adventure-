import { ModeChip } from './ModeChip.tsx';
import React from 'react';
import { sound } from '../game/audio.ts';
import { COARSE, OrchSfxToggle, ControlsSetting, ShakeSetting, FullscreenSetting, AssistSetting, WaysideToggle, PerfToggle, DifficultySetting, DotHelpSetting } from './menuParts.tsx';
import { HowToTile } from './HowToTile.tsx';
import { MenuFrame, MenuTile, SoundSetting } from './MenuFrame.tsx';

export { COARSE, OrchSfxToggle };
import type { LevelConfig } from '../game/types.ts';
import type { SkillId } from '../game/skills.ts';
import { UpdateRow } from './UpdateControls.tsx';

interface PauseMenuProps {
  levelConfig: LevelConfig;
  isMuted: boolean;
  onToggleMute: () => void;
  onResume: () => void;
  onRestart: () => void;
  onOpenTrophies: () => void;
  onOpenCards: () => void;
  onOpenMap: () => void;
  trophyCount: number;
  trophyTotal: number;
  /** the skills Pokey has learned so far */
  skills: Set<SkillId>;
  /** Meeca's stage: ask Flicker for a hint, a step at a time (null when he cannot be asked now) */
  onAskHint?: () => string | null;
}

/**
 * Meeca's stage: "Ask Flicker". Hints only when asked, in steps, and never the answer (Matt, 2026-10-27): each tap gives the room's next
 * step of help, said in his bubble when play resumes, and shown here.
 */
const HintTile: React.FC<{ ask: () => string | null }> = ({ ask }) => {
  const [said, setSaid] = React.useState<string | null>(null);
  const [none, setNone] = React.useState(false);
  return (
    <MenuTile
      icon="bulb"
      name="Ask Flicker"
      className="pm-hint"
      line={said ? `"${said}"` : none ? 'Flicker is not here yet.' : 'A hint, not the answer'}
      onClick={() => {
        const h = ask();
        setSaid(h);
        setNone(!h);
      }}
    />
  );
};


/** music and effects volume (saved on the device) */
/**
 * A volume bar the thumb can really drag. The browser's own range input sits inside a card that scrolls up and down, and on a phone a
 * thumb that drifts a little off level hands the gesture to the scroll, so the bar seems dead. This one keeps the touch for itself
 * (touch-action: none, pointer capture), has a tall hit area, jumps to wherever the track is tapped, and answers the arrow keys.
 */
const VolumeBar: React.FC<{ id: string; label: string; value: number; onChange: (v: number) => void }> = ({ id, label, value, onChange }) => {
  const track = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef(false);
  const pct = Math.round(value * 100);
  const fromX = (clientX: number) => {
    const r = track.current?.getBoundingClientRect();
    if (!r || r.width <= 0) return;
    onChange(Math.max(0, Math.min(1, (clientX - r.left) / r.width)));
  };
  return (
    <div className="pm-row">
      <span id={`${id}-l`}>{label}</span>
      <div
        ref={track}
        id={id}
        className="pm-vol"
        role="slider"
        tabIndex={0}
        aria-labelledby={`${id}-l`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        onPointerDown={(e) => {
          drag.current = true;
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* a pointer that cannot be captured still drags while it is over the bar */
          }
          fromX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (drag.current) fromX(e.clientX);
        }}
        onPointerUp={() => {
          drag.current = false;
        }}
        onPointerCancel={() => {
          drag.current = false;
        }}
        onKeyDown={(e) => {
          const step = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -0.05 : e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 0.05 : 0;
          if (!step) return;
          e.preventDefault();
          onChange(Math.max(0, Math.min(1, value + step)));
        }}
      >
        <div className="pm-vol-track">
          <div className="pm-vol-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="pm-vol-thumb" style={{ left: `${pct}%` }} />
      </div>
      <output htmlFor={id}>{pct}</output>
    </div>
  );
};

export const Sliders: React.FC = () => {
  const [music, setMusic] = React.useState(() => sound.musicVolume);
  const [sfx, setSfx] = React.useState(() => sound.sfxVolume);
  const lastBeep = React.useRef(0);
  return (
    <>
      <VolumeBar
        id="pm-music"
        label="Music"
        value={music}
        onChange={(v) => {
          setMusic(v);
          sound.setMusicVolume(v);
        }}
      />
      <VolumeBar
        id="pm-sfx"
        label="Effects"
        value={sfx}
        onChange={(v) => {
          setSfx(v);
          sound.setSfxVolume(v);
          // a little sample so the bar is heard working
          const now = performance.now();
          if (v > 0 && now - lastBeep.current > 220) {
            lastBeep.current = now;
            sound.playJump();
          }
        }}
      />
    </>
  );
};

/** The pause menu: opens when the player taps Menu (the game is paused behind it). */
export const PauseMenu: React.FC<PauseMenuProps> = ({ levelConfig, isMuted, onToggleMute, onResume, onRestart, onOpenTrophies, onOpenCards, onOpenMap, trophyCount, trophyTotal, skills, onAskHint }) => (
  <MenuFrame
    label="Menu"
    title="Paused"
    sub={`${levelConfig.secret ? 'Secret stage' : `Stage ${levelConfig.id}`} · ${levelConfig.name}`}
    subChip={<ModeChip />}
    notice={<UpdateRow />}
    go={{ label: 'Resume', onClick: onResume, title: COARSE ? undefined : 'Esc', start: true }}
    skills={skills}
    tiles={
      <>
        {onAskHint && <HintTile ask={onAskHint} />}
        <MenuTile icon="restart" name="Restart" line="Start this stage over" onClick={onRestart} title={COARSE ? undefined : 'R'} />
        <MenuTile icon="trophy" name="Trophies" line={`${trophyCount} of ${trophyTotal} earned`} onClick={onOpenTrophies} />
        <MenuTile icon="cards" name="Jungle Cards" line="Meet every creature" onClick={onOpenCards} />
        <MenuTile icon="map" name="World Map" line="Leave this stage" onClick={onOpenMap} />
        <HowToTile />
      </>
    }
    sound={<SoundSetting isMuted={isMuted} onToggleMute={onToggleMute} keyTitle={COARSE ? undefined : 'M'} sliders={<Sliders />} />}
    settings={
      <>
        <FullscreenSetting />
        <DifficultySetting />
        <ControlsSetting />
        <ShakeSetting />
        <AssistSetting />
        {/* Dot's help and what she said */}
        <DotHelpSetting />
        <WaysideToggle />
        <PerfToggle />
        <OrchSfxToggle />
      </>
    }
  />
);
