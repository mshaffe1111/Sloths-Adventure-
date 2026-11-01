import React from 'react';
import { Sliders, COARSE } from './PauseMenu.tsx';
import { ControlsSetting, ShakeSetting, FullscreenSetting, AssistSetting, WaysideToggle, HapticsToggle, PerfToggle, DifficultySetting } from './menuParts.tsx';
import { MenuTile, SoundSetting } from './MenuFrame.tsx';
import { UpdateLink } from './UpdateControls.tsx';
import { Icon, type IconName } from './icons/index.tsx';
import { ConfirmDialog, useBack } from './nav/Nav.tsx';
import { browserStore, buildSave } from '../game/saveFile.ts';

type Tab = 'sound' | 'game' | 'saves' | 'trophies' | 'about';
const TABS: { id: Tab; icon: IconName; name: string }[] = [
  { id: 'sound', icon: 'speaker', name: 'Sound' },
  { id: 'game', icon: 'gear', name: 'Game' },
  { id: 'saves', icon: 'save', name: 'Saves' },
  { id: 'trophies', icon: 'trophy', name: 'Trophies' },
  { id: 'about', icon: 'sloth', name: 'About' },
];

interface TitleSettingsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
  onOpenTrophies?: () => void;
  onOpenCards?: () => void;
  onSaveLoad: () => void;
  /** go on to choosing how to begin again (NewGameDialog); asked first here when there is a game to lose (the title only) */
  onNewGame?: () => void;
  /** opened away from the title (the World Map): a way to the Start Screen (Matt's rule 4) */
  onStartScreen?: () => void;
  trophyCount?: number;
  trophyTotal?: number;
  /** "Oct 30, 2026, 5:38 PM" */
  updated: string | null;
  onInstallDesktop?: () => void;
  isInstalled?: boolean;
  /** the credit's tester switch (ten taps on the name; the title only) */
  onTapShaffer?: () => void;
  /** what the ten taps just did ("4 more…", "All stages and worlds unlocked"): shown on the credit itself, inside this card,
   * because a message behind the card can't be seen (Matt, 2026-10-31: the unlock "got lost" when the menu was redone) */
  creditMsg?: string | null;
}

/** a stage cleared or a star earned on this device: New Game asks before it wipes them */
function hasProgress(): boolean {
  try {
    const s = buildSave(browserStore());
    return s.summary.stagesCleared > 0 || s.summary.stars > 0;
  } catch {
    return false;
  }
}

/**
 * Settings on the start screen (Matt, 2026-10-30, layout B): the painted card, one section at a time behind painted tabs (Sound, Game,
 * Saves, Trophies, About), so the title itself keeps only Play, the map, the story and how to play. Trophies, Save / Load, New Game,
 * the credit and the update check live here. New Game asks first, with keeping the game as the big safe answer.
 */
export const TitleSettings: React.FC<TitleSettingsProps> = (p) => {
  const [tab, setTab] = React.useState<Tab>('sound');
  const [confirm, setConfirm] = React.useState(false);
  const { onClose } = p;
  // Android's Back and Esc close it, like its X and a tap outside (nav/backStack.ts; the confirm over it takes Back first)
  useBack(onClose);
  const tabs = TABS.filter((t) => (t.id === 'trophies' ? !!p.onOpenTrophies : true));

  const page = (() => {
    switch (tab) {
      case 'sound':
        return <SoundSetting isMuted={p.isMuted} onToggleMute={p.onToggleMute} keyTitle={COARSE ? undefined : 'M'} sliders={<Sliders />} />;
      case 'game':
        return (
          <div className="pm-settings">
            <FullscreenSetting />
            <DifficultySetting />
            <ControlsSetting />
            <ShakeSetting />
            <AssistSetting />
            <WaysideToggle />
            <HapticsToggle />
            <PerfToggle />
          </div>
        );
      case 'saves':
        return (
          <div className="st-rows">
            <div className="st-row">
              <Icon name="save" size={28} />
              <span className="st-row-t">
                Save / Load
                <small>A file or a save code, to keep your game safe</small>
              </span>
              <button type="button" className="st-btn" onClick={p.onSaveLoad}>
                Open
              </button>
            </div>
            {p.onNewGame && (
            <div className="st-row">
              <Icon name="leaf" size={28} />
              <span className="st-row-t">
                New Game
                <small>Start again from Stage 1-1</small>
              </span>
              <button type="button" className="st-btn" onClick={() => (hasProgress() ? setConfirm(true) : p.onNewGame?.())}>
                New
              </button>
            </div>
            )}
          </div>
        );
      case 'trophies':
        return (
          <div className="pm-tiles">
            {p.onOpenTrophies && <MenuTile icon="trophy" name="Trophies" line={p.trophyTotal ? `${p.trophyCount ?? 0} of ${p.trophyTotal} earned` : 'Every medal and trophy'} onClick={p.onOpenTrophies} />}
            {p.onOpenCards && <MenuTile icon="cards" name="Jungle Cards" line="Meet every creature" onClick={p.onOpenCards} />}
          </div>
        );
      case 'about':
        return (
          <div className="st-rows">
            <div className="st-row">
              <Icon name="sloth" size={28} />
              <span className="st-row-t">
                Sloths Rainforest Adventures
                <small>
                  Created and made by Matt{' '}
                  {p.onTapShaffer ? (
                    <button type="button" onClick={p.onTapShaffer} className="title-credit-btn" aria-label="Shaffer">
                      Shaffer
                    </button>
                  ) : (
                    'Shaffer'
                  )}
                  {p.creditMsg && (
                    <span className="st-credit-msg" role="status">
                      {p.creditMsg}
                    </span>
                  )}
                </small>
              </span>
            </div>
            <div className="st-row">
              <Icon name="heart" size={28} />
              <span className="st-row-t">
                Special thanks
                <small>Stephanie Roberts, Jen Shaffer and Sally Rotolo</small>
              </span>
            </div>
            <div className="st-row">
              <Icon name="restart" size={28} />
              <span className="st-row-t">
                This version
                <small>
                  {p.updated && <span className="block">Updated {p.updated}</span>}
                  <UpdateLink />
                </small>
              </span>
            </div>
            {!p.isInstalled && p.onInstallDesktop && (
              <div className="st-row">
                <Icon name="expand" size={28} />
                <span className="st-row-t">
                  Install the game
                  <small>Play it from its own icon</small>
                </span>
                <button type="button" className="st-btn" onClick={p.onInstallDesktop}>
                  Install
                </button>
              </div>
            )}
          </div>
        );
    }
  })();

  return (
    <div className="pm-scrim st-scrim select-none" onClick={onClose}>
      <div className="st-card" role="dialog" aria-modal="true" aria-label="Settings" onClick={(e) => e.stopPropagation()}>
        <h2 className="kit-plaque st-plaque">
          <span>Settings</span>
        </h2>
        <button type="button" className="st-x" onClick={onClose} aria-label="Close" title={COARSE ? undefined : 'Esc'}>
          <Icon name="cross" size={24} />
        </button>
        <div className="st-tabs" role="tablist" aria-label="Settings sections">
          {tabs.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} aria-label={t.name} className={`st-tab${tab === t.id ? ' on' : ''}`} onClick={() => setTab(t.id)}>
              <Icon name={t.icon} size={24} />
              <span>{t.name}</span>
            </button>
          ))}
        </div>
        <div className="st-page" role="tabpanel" aria-label={TABS.find((t) => t.id === tab)?.name}>
          {page}
        </div>
        <div className="st-foot">
          {p.onStartScreen && (
            <button type="button" className="st-btn st-home" onClick={p.onStartScreen}>
              <Icon name="sloth" size={22} />
              Start Screen
            </button>
          )}
          <button type="button" className="pm-go st-done" onClick={onClose}>
            <Icon name="check" size={22} />
            Done
          </button>
        </div>
        {confirm && (
          <ConfirmDialog
            title="Start a new game?"
            body="This wipes your stages, stars and trophies on this phone. A backup file can bring them back."
            stay="Keep my game"
            go="Yes, start over"
            onStay={() => setConfirm(false)}
            onGo={() => {
              setConfirm(false);
              p.onNewGame?.();
            }}
          />
        )}
      </div>
    </div>
  );
};
