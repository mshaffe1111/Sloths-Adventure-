import React from 'react';
import { HeroFaceIcon } from './HeroFaceIcon.tsx';
import { SKILLS, type SkillId } from '../game/skills.ts';
import { SkillIcon } from './SkillIcon.tsx';
import { Icon, type IconName } from './icons/index.tsx';
import { useExitGhost } from './fx/exitGhost.ts';

/**
 * The menu's frame, shared by the start menu and the pause menu (2026-10-28): a parchment card in a wooden frame. Upright, one column:
 * the header plaque, the big green board, the picture tiles two by two, the skills on a dark wood shelf, then the settings ledger.
 * Sideways, two columns: the tiles and the skills on the left, the settings on the right, each scrolling on its own if it must.
 */
export const MenuFrame: React.FC<{
  label: string;
  title: string;
  sub: string;
  /** a tap on the dimmed screen around the card (the start menu closes; the pause menu has no such tap) */
  onScrim?: () => void;
  /** the big board at the top */
  go: { label: string; onClick: () => void; title?: string; start?: boolean };
  /** a row above the board (the pause menu's "new version" row) */
  notice?: React.ReactNode;
  tiles: React.ReactNode;
  skills: Set<SkillId>;
  sound: React.ReactNode;
  settings: React.ReactNode;
}> = ({ label, title, sub, onScrim, go, notice, tiles, skills, sound, settings }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  useExitGhost(ref);
  return (
    <div ref={ref} className="pm-scrim select-none" onClick={onScrim}>
      <div className="pm-card" role="dialog" aria-label={label} onClick={(e) => e.stopPropagation()}>
        <div className="pm-head">
          <div className="pm-head-t">
            <h2 className="pm-title">{title}</h2>
            <div className="pm-sub">{sub}</div>
          </div>
          <span className="pm-face">
            <HeroFaceIcon size={46} face="face_happy" />
          </span>
        </div>
        <div className="pm-body">
          <div className="pm-main">
            {notice}
            <button type="button" className="pm-go" onClick={go.onClick} title={go.title} data-start={go.start ? 'true' : undefined}>
              <Icon name="play" size={22} />
              {go.label}
            </button>
            <div className="pm-tiles">{tiles}</div>
            <div className="pm-skills" aria-label="Skills">
              {SKILLS.map((sk) => {
                const has = skills.has(sk.id);
                return (
                  <div key={sk.id} className={`pm-skill ${has ? '' : 'off'}`}>
                    <SkillIcon skill={sk.id} size={40} locked={!has} />
                    <span>
                      <b>{sk.name}</b>
                      <small>{has ? 'Learned' : `Clear stage ${sk.unlockedBy}`}</small>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pm-side">
            <div className="pm-sec-h">
              <Icon name="gear" size={20} />
              Settings
            </div>
            <div className="pm-settings">
              {sound}
              {settings}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** one picture tile: a painted icon in a coloured medallion, a name on one line, a short line under it */
export const MenuTile: React.FC<{ icon: IconName; name: string; line: React.ReactNode; onClick: () => void; title?: string; className?: string; badge?: React.ReactNode }> = ({
  icon,
  name,
  line,
  onClick,
  title,
  className,
  badge,
}) => (
  <button type="button" className={`pm-tile${className ? ` ${className}` : ''}`} onClick={onClick} title={title}>
    <span className="pm-tile-ic">
      <Icon name={icon} size={28} />
    </span>
    <span className="pm-tile-t">
      <b>{name}</b>
      <small aria-live={className?.includes('pm-hint') ? 'polite' : undefined}>{line}</small>
    </span>
    {badge}
  </button>
);

/** the sound row of the settings: the mute board and the two volume bars */
export const SoundSetting: React.FC<{ isMuted: boolean; onToggleMute: () => void; keyTitle?: string; sliders: React.ReactNode }> = ({ isMuted, onToggleMute, keyTitle, sliders }) => (
  <div className="pm-sound">
    <div className="pm-sound-h">
      <span className="flex items-center gap-2">
        <span className="pm-set-ic" aria-hidden="true">
          <Icon name={isMuted ? 'mute' : 'speaker'} size={20} />
        </span>
        Sound
      </span>
      <button type="button" className="pm-mute" aria-pressed={isMuted} onClick={onToggleMute} title={keyTitle}>
        {isMuted ? 'Muted: tap to unmute' : 'Mute all'}
      </button>
    </div>
    {sliders}
  </div>
);
