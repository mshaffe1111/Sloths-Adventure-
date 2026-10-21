import React from 'react';
import { HeroFaceIcon } from './HeroFaceIcon.tsx';
import { SKILLS, type SkillId } from '../game/skills.ts';
import { SkillIcon } from './SkillIcon.tsx';
import { Icon, Sliders, COARSE, PolishToggle, OrchSfxToggle } from './PauseMenu.tsx';
import { ControlsSetting, WaysideToggle } from './menuParts.tsx';
import { HowToTile } from './HowToTile.tsx';

interface StartMenuProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
  onOpenTrophies: () => void;
  onOpenCards: () => void;
  onOpenMap: () => void;
  onViewStory: () => void;
  trophyCount: number;
  trophyTotal: number;
  /** the skills Pokey has learned so far */
  skills: Set<SkillId>;
}

/** The menu on the start screen: everything the in-game menu shows (trophies, jungle cards, map, skills, sound), minus the parts that belong to a stage in progress. */
export const StartMenu: React.FC<StartMenuProps> = ({ isMuted, onToggleMute, onClose, onOpenTrophies, onOpenCards, onOpenMap, onViewStory, trophyCount, trophyTotal, skills }) => {
  // Esc closes it
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
  <div className="pm-scrim select-none" onClick={onClose}>
    <div className="pm-card" role="dialog" aria-label="Menu" onClick={(e) => e.stopPropagation()}>
      <div className="pm-head">
        <div>
          <h2 className="pm-title">Menu</h2>
          <div className="pm-sub">Sloths Rainforest Adventures</div>
        </div>
        <span className="pm-face">
          <HeroFaceIcon size={46} face="face_happy" />
        </span>
      </div>

      <button type="button" className="pm-go" onClick={onClose} title={COARSE ? undefined : 'Esc'}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#022c22" aria-hidden="true">
          <path d="M7 4.5v15l13-7.5z" />
        </svg>
        Back to the title
      </button>

      <div className="pm-tiles">
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
            <small>Pick a world</small>
          </span>
        </button>
        <button type="button" className="pm-tile" onClick={onViewStory}>
          <Icon color="#fda4af">
            <path d="M4 5h6a3 3 0 0 1 2 1 3 3 0 0 1 2-1h6v13h-6a3 3 0 0 0-2 1 3 3 0 0 0-2-1H4z" />
            <path d="M12 6v13" />
          </Icon>
          <span>
            <b>Story</b>
            <small>Watch it again</small>
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
      <ControlsSetting />
      <PolishToggle />
      <WaysideToggle />
      <OrchSfxToggle />
    </div>
  </div>
  );
};
