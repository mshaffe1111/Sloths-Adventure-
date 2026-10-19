import React from 'react';
import { browserStore, buildSave, resetProgress } from '../game/saveFile.ts';

/**
 * Start a new adventure. With progress on this device it says what will be erased (and points at the backup
 * file first); either way it asks whether to play the story or skip it, so nobody has to sit through cutscenes.
 */
interface Props {
  onClose: () => void;
  /** called after the old progress has been cleared; `skipStory` says which way to start */
  onStarted: (skipStory: boolean) => void;
  /** open Save & Load, so a backup can be made first */
  onBackup: () => void;
}

export const NewGameDialog: React.FC<Props> = ({ onClose, onStarted, onBackup }) => {
  const current = (() => {
    try {
      return buildSave(browserStore());
    } catch {
      return null;
    }
  })();
  const hasProgress = !!current && (current.summary.stagesCleared > 0 || current.summary.stars > 0);

  const begin = (skipStory: boolean) => {
    try {
      resetProgress(browserStore(), { skipStory });
    } catch {
      /* storage blocked: the game still starts, it just cannot forget */
    }
    onStarted(skipStory);
  };

  return (
    <div className="ui-scrim" role="dialog" aria-modal="true" aria-label="New game" onClick={onClose}>
      <div className="ui-panel ui-saveload" onClick={(e) => e.stopPropagation()}>
        <div className="ui-panel-head">
          <div>
            <div className="ui-kicker">{hasProgress ? 'Start over' : 'Before you begin'}</div>
            <h2 className="ui-h2">New Game</h2>
          </div>
          <button type="button" className="ui-x" onClick={onClose} aria-label="Close">
            ✕
          </button>
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
          <div className="ui-row">
            <button type="button" className="ui-btn ui-btn-gold" onClick={() => begin(false)}>
              {hasProgress ? 'Start over, with the story' : 'Start with the story'}
            </button>
            <button type="button" className="ui-btn ui-btn-green" onClick={() => begin(true)}>
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
