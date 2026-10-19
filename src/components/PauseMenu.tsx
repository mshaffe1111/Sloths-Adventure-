import React from 'react';
import { sound } from '../game/audio.ts';
import type { LevelConfig } from '../game/types.ts';
import { HeroFaceIcon } from './HeroFaceIcon.tsx';

/** keyboard shortcut hints only make sense when there is a keyboard (not on a touch-only phone) */
const COARSE = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;

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
}

const Icon: React.FC<{ color: string; children: React.ReactNode; size?: number }> = ({ color, children, size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
    {children}
  </svg>
);

/** music and effects volume (saved on the device) */
const Sliders: React.FC = () => {
  const [music, setMusic] = React.useState(() => sound.musicVolume);
  const [sfx, setSfx] = React.useState(() => sound.sfxVolume);
  const row = (id: string, label: string, value: number, set: (v: number) => void, apply: (v: number) => void) => (
    <div className="pm-row">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => {
          const v = Number(e.target.value) / 100;
          set(v);
          apply(v);
        }}
      />
      <output htmlFor={id}>{Math.round(value * 100)}</output>
    </div>
  );
  return (
    <>
      {row('pm-music', 'Music', music, setMusic, (v) => sound.setMusicVolume(v))}
      {row('pm-sfx', 'Effects', sfx, setSfx, (v) => sound.setSfxVolume(v))}
    </>
  );
};

/** The pause menu: opens when the player taps Menu (the game is paused behind it). */
export const PauseMenu: React.FC<PauseMenuProps> = ({ levelConfig, isMuted, onToggleMute, onResume, onRestart, onOpenTrophies, onOpenCards, onOpenMap, trophyCount, trophyTotal }) => (
  <div className="pm-scrim select-none">
    <div className="pm-card modal-card" role="dialog" aria-label="Menu">
      <div className="pm-head">
        <div>
          <h2 className="pm-title">Paused</h2>
          <div className="pm-sub">{levelConfig.secret ? 'Secret stage' : `Stage ${levelConfig.id}`} &middot; {levelConfig.name}</div>
        </div>
        <span className="pm-face">
          <HeroFaceIcon size={46} face="face_happy" />
        </span>
      </div>

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
    </div>
  </div>
);
