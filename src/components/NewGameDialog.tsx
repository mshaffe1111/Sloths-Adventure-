import { CloseX, useBack } from './nav/Nav.tsx';
import React from 'react';
import { GhostOnExit } from './fx/exitGhost.ts';
import { browserStore, buildSave, resetProgress } from '../game/saveFile.ts';
import { Icon } from './icons/index.tsx';
import { DIFFICULTY_LABEL, difficulty, setDifficulty, type Difficulty } from '../game/difficulty.ts';

/**
 * Start a new adventure. With progress on this device it says what will be erased (and points at the backup
 * file first); either way it asks Easy or Normal (nothing picked for a first game: LV-1) and whether to play the story or skip it,
 * so nobody has to sit through cutscenes.
 */
interface Props {
  onClose: () => void;
  /** called after the old progress has been cleared; `skipStory` says which way to start */
  onStarted: (skipStory: boolean) => void;
  /** open Save & Load, so a backup can be made first */
  onBackup: () => void;
}

export const NewGameDialog: React.FC<Props> = ({ onClose, onStarted, onBackup }) => {
  // the X, a tap outside and Android Back all close it (nav/Nav.tsx)
  useBack(onClose);
  const current = (() => {
    try {
      return buildSave(browserStore());
    } catch {
      return null;
    }
  })();
  const hasProgress = !!current && (current.summary.stagesCleared > 0 || current.summary.stars > 0);

  // a brand-new player picks Easy or Normal themselves (LV-1: a new game used to start on Easy without saying so); someone starting
  // over starts with what they had, and can change it here
  const [level, setLevel] = React.useState<Difficulty | null>(() => (hasProgress ? difficulty() : null));

  const begin = (skipStory: boolean) => {
    if (!level) return;
    try {
      resetProgress(browserStore(), { skipStory });
    } catch {
      /* storage blocked: the game still starts, it just cannot forget */
    }
    setDifficulty(level);
    onStarted(skipStory);
  };

  return (
    <div className="ui-scrim" role="dialog" aria-modal="true" aria-label="New game" onClick={onClose}>
      <GhostOnExit />
      <div className="ui-panel ui-saveload" onClick={(e) => e.stopPropagation()}>
        <div className="ui-panel-head">
          <div>
            <div className="ui-kicker">{hasProgress ? 'Start over' : 'Before you begin'}</div>
            <h2 className="ui-h2">New Game</h2>
          </div>
          <CloseX onClose={onClose} className="nv-inline" />
        </div>
        <div className="ui-body">
          {hasProgress && current && (
            <>
              <div className="ui-stats">
                <div className="ui-stat">
                  <b>{current.summary.stagesCleared}</b>
                  <span>Stages cleared</span>
                </div>
                <div className="ui-stat">
                  <b>{current.summary.stars}</b>
                  <span>Stars</span>
                </div>
                <div className="ui-stat">
                  <b>{current.summary.worldsStarted}</b>
                  <span>Worlds started</span>
                </div>
              </div>
              <p className="ui-copy">
                <b className="ui-warn">This erases your progress on this device</b> and starts again from Stage 1-1. Your sound settings stay.
                Want it back later? <button type="button" className="ui-link" onClick={onBackup}>Save a backup file first</button>.
              </p>
            </>
          )}
          {!hasProgress && <p className="ui-copy">Start from Stage 1-1. Play the story as you go, or jump straight into the jungle.</p>}
          <div className="ng-diff" role="radiogroup" aria-label="Difficulty">
            {(['easy', 'normal'] as Difficulty[]).map((d) => (
              <button key={d} type="button" role="radio" aria-checked={level === d} className={`ng-diff-card${level === d ? ' on' : ''}`} onClick={() => setLevel(d)}>
                <span className="ng-diff-name">{DIFFICULTY_LABEL[d].name}</span>
                <span className="ng-diff-blurb">{DIFFICULTY_LABEL[d].blurb}</span>
              </button>
            ))}
          </div>
          <p className={`ui-copy ng-diff-note${level ? '' : ' ng-diff-ask'}`} aria-live="polite">
            {level ? 'You can change this any time in the menu.' : 'Pick Easy or Normal to start.'}
          </p>
          <div className="ui-row">
            <button type="button" className="ui-btn ui-btn-gold" onClick={() => begin(false)} disabled={!level}>
              {hasProgress ? 'Start over, with the story' : 'Start with the story'}
            </button>
            <button type="button" className="ui-btn ui-btn-green" onClick={() => begin(true)} disabled={!level}>
              {hasProgress ? 'Start over, skip the story' : 'Skip the story'}
            </button>
            <button type="button" className="ui-btn ui-btn-plain" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
