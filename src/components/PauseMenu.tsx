import React from 'react';
import { sound } from '../game/audio.ts';
import { COARSE, Icon, PolishToggle, OrchSfxToggle, GoldSnakeToggle, ProtoStageToggle, PaintedKitToggle, HeroClipsToggle, RefinedControlsToggle, ControlsSetting, FullscreenSetting, AssistSetting, WaysideToggle, PerfToggle } from './menuParts.tsx';
import { HowToTile } from './HowToTile.tsx';

export { COARSE, Icon, PolishToggle, OrchSfxToggle, GoldSnakeToggle, ProtoStageToggle, PaintedKitToggle, HeroClipsToggle, RefinedControlsToggle };
import type { LevelConfig } from '../game/types.ts';
import { HeroFaceIcon } from './HeroFaceIcon.tsx';
import { SKILLS, type SkillId } from '../game/skills.ts';
import { SkillIcon } from './SkillIcon.tsx';
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
}


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
export const PauseMenu: React.FC<PauseMenuProps> = ({ levelConfig, isMuted, onToggleMute, onResume, onRestart, onOpenTrophies, onOpenCards, onOpenMap, trophyCount, trophyTotal, skills }) => (
  <div className="pm-scrim select-none">
    <div className="pm-card" role="dialog" aria-label="Menu">
      <div className="pm-head">
        <div>
          <h2 className="pm-title">Paused</h2>
          <div className="pm-sub">{levelConfig.secret ? 'Secret stage' : `Stage ${levelConfig.id}`} &middot; {levelConfig.name}</div>
        </div>
        <span className="pm-face">
          <HeroFaceIcon size={46} face="face_happy" />
        </span>
      </div>

      <UpdateRow />
      <button type="button" className="pm-go" onClick={onResume} data-start="true" title={COARSE ? undefined : 'Esc'}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#022c22" aria-hidden="true">
          <path d="M7 4.5v15l13-7.5z" />
        </svg>
        Resume
      </button>

      <div className="pm-tiles">
        <button type="button" className="pm-tile" onClick={onRestart} title={COARSE ? undefined : 'R'}>
          <Icon color="#6ee7b7">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </Icon>
          <span>
            <b>Restart</b>
            <small>Start this stage over</small>
          </span>
        </button>
        <button type="button" className="pm-tile" onClick={onOpenTrophies}>
          <Icon color="#fbbf24">
            <path d="M8 21h8M12 17v4" />
            <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
            <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" />
          </Icon>
          <span>
            <b>Trophies</b>
            <small>
              {trophyCount} of {trophyTotal} earned
            </small>
          </span>
        </button>
        <button type="button" className="pm-tile" onClick={onOpenCards}>
          <Icon color="#f9a8d4">
            <rect x="4" y="3" width="13" height="18" rx="2" />
            <path d="M8 7h5M8 11h5" />
            <path d="M17 7l3 1-3 12" />
          </Icon>
          <span>
            <b>Jungle Cards</b>
            <small>Meet every creature</small>
          </span>
        </button>
        <button type="button" className="pm-tile" onClick={onOpenMap}>
          <Icon color="#93c5fd">
            <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" />
            <path d="M9 4v14M15 6v14" />
          </Icon>
          <span>
            <b>World Map</b>
            <small>Leave this stage</small>
          </span>
        </button>
        <HowToTile />
      </div>

      <div className="pm-skills" aria-label="Skills">
        {SKILLS.map((sk) => {
          const has = skills.has(sk.id);
          return (
            <div key={sk.id} className={`pm-skill ${has ? '' : 'off'}`}>
              <SkillIcon skill={sk.id} size={44} locked={!has} />
              <span>
                <b>{sk.name}</b>
                <small>{has ? 'Learned' : `Clear stage ${sk.unlockedBy}`}</small>
              </span>
            </div>
          );
        })}
      </div>

      <div className="pm-sound">
        <div className="pm-sound-h">
          <span className="flex items-center gap-2">
            <Icon color="#6ee7b7" size={22}>
              <path d="M4 9v6h4l5 4V5L8 9z" />
              <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
            </Icon>
            Sound
          </span>
          <button type="button" className="pm-mute" aria-pressed={isMuted} onClick={onToggleMute} title={COARSE ? undefined : 'M'}>
            {isMuted ? 'Muted: tap to unmute' : 'Mute all'}
          </button>
        </div>
        <Sliders />
      </div>
      <FullscreenSetting />
      <ControlsSetting />
      <AssistSetting />
      <PolishToggle />
      <WaysideToggle />
      <PerfToggle />
      <OrchSfxToggle />
      <GoldSnakeToggle />
      <ProtoStageToggle />
      <PaintedKitToggle />
      <HeroClipsToggle />
      <RefinedControlsToggle />
    </div>
  </div>
);
