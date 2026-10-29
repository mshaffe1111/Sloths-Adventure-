import React from 'react';
import type { SkillId } from '../game/skills.ts';
import { Sliders, COARSE, OrchSfxToggle } from './PauseMenu.tsx';
import { ControlsSetting, FullscreenSetting, AssistSetting, WaysideToggle, HapticsToggle, PerfToggle, DifficultySetting } from './menuParts.tsx';
import { HowToTile } from './HowToTile.tsx';
import { MenuFrame, MenuTile, SoundSetting } from './MenuFrame.tsx';

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
    <MenuFrame
      label="Menu"
      title="Menu"
      sub="Sloths Rainforest Adventures"
      onScrim={onClose}
      go={{ label: 'Back to the title', onClick: onClose, title: COARSE ? undefined : 'Esc' }}
      skills={skills}
      tiles={
        <>
          <MenuTile icon="trophy" name="Trophies" line={`${trophyCount} of ${trophyTotal} earned`} onClick={onOpenTrophies} />
          <MenuTile icon="cards" name="Jungle Cards" line="Meet every creature" onClick={onOpenCards} />
          <MenuTile icon="map" name="World Map" line="Pick a world" onClick={onOpenMap} />
          <MenuTile icon="scroll" name="Story" line="Watch it again" onClick={onViewStory} />
          <HowToTile />
        </>
      }
      sound={<SoundSetting isMuted={isMuted} onToggleMute={onToggleMute} keyTitle={COARSE ? undefined : 'M'} sliders={<Sliders />} />}
      settings={
        <>
          <FullscreenSetting />
          <DifficultySetting />
          <ControlsSetting />
          <AssistSetting />
          <WaysideToggle />
          <HapticsToggle />
          <PerfToggle />
          <OrchSfxToggle />
        </>
      }
    />
  );
};
