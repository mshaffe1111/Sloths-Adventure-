import React from 'react';
import { PeekPokey, Plaque } from './KitParts.tsx';
import { SKILLS, type SkillId } from '../game/skills.ts';
import { SkillIcon } from './SkillIcon.tsx';
import { Icon, type IconName } from './icons/index.tsx';
import { useExitGhost } from './fx/exitGhost.ts';
import { CloseX, useBack } from './nav/Nav.tsx';

/**
 * The in-game Settings card (the pause card, 2026-10-28; option A, Matt 2026-10-30): the painted card. Upright, one column: the header
 * plaque, the big green board, the quick tiles two by two, the skills on a dark wood shelf, then the options behind painted tab chips
 * (Sound, Game, Trophies: the same chips as the title's Settings). Sideways, two columns: the tiles and the skills on the left, the
 * options on the right, each scrolling on its own if it must.
 */
export const MenuFrame: React.FC<{
  label: string;
  title: string;
  sub: string;
  /** shown after the stage line (the pause menu: the mode the stage is played on, LV-1) */
  subChip?: React.ReactNode;
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
  /** the Trophies tab's tiles (trophies, jungle cards) */
  trophies?: React.ReactNode;
  /** the X at the top-right corner, Android's Back and Escape (the pause card: Resume) */
  onClose: () => void;
}> = ({ label, title, sub, subChip, onScrim, go, notice, tiles, skills, sound, settings, trophies, onClose }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  // the options under the quick tiles, one section at a time behind the same painted tab chips as the title's Settings
  const [tab, setTab] = React.useState<'sound' | 'game' | 'trophies'>('sound');
  const tabs: { id: typeof tab; icon: IconName; name: string }[] = [
    { id: 'sound', icon: 'speaker', name: 'Sound' },
    { id: 'game', icon: 'gear', name: 'Game' },
    ...(trophies ? [{ id: 'trophies' as const, icon: 'trophy' as IconName, name: 'Trophies' }] : []),
  ];
  useExitGhost(ref);
  useBack(onClose);
  return (
    <div ref={ref} className="pm-scrim select-none" onClick={onScrim}>
      <div className="pm-wrap">
      {/* Pokey looks over the top of the panel */}
      <PeekPokey className="pm-peek" />
      <CloseX onClose={onClose} className="pm-x" label="Close and resume" />
      <div className="pm-card" role="dialog" aria-label={label} onClick={(e) => e.stopPropagation()}>
        <div className="pm-head">
          <div className="pm-head-t">
            <Plaque className="pm-title">{title}</Plaque>
            <div className="pm-sub">{sub}{subChip && <> {subChip}</>}</div>
          </div>
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
            <div className="st-tabs pm-tabs" role="tablist" aria-label="Options" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
              {tabs.map((t) => (
                <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} aria-label={t.name} className={`st-tab${tab === t.id ? ' on' : ''}`} onClick={() => setTab(t.id)}>
                  <Icon name={t.icon} size={24} />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
            <div role="tabpanel" aria-label={tabs.find((t) => t.id === tab)?.name}>
              {tab === 'sound' && <div className="pm-settings">{sound}</div>}
              {tab === 'game' && <div className="pm-settings">{settings}</div>}
              {tab === 'trophies' && <div className="pm-tiles">{trophies}</div>}
            </div>
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
