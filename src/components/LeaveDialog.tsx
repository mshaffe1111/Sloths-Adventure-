import React from 'react';
import { GhostOnExit } from './fx/exitGhost.ts';
import { Icon } from './icons/index.tsx';

/**
 * The Android app only: the phone's Back button on the title asks before the game closes (Play Store job, 2026-10-29). Back again,
 * the X or a tap outside keeps playing; everything is already saved, so leaving loses nothing.
 */
export const LeaveDialog: React.FC<{ onStay: () => void; onLeave: () => void }> = ({ onStay, onLeave }) => (
  <div className="ui-scrim" role="dialog" aria-modal="true" aria-label="Leave the game" onClick={onStay}>
    <GhostOnExit />
    <div className="ui-panel ui-saveload" onClick={(e) => e.stopPropagation()}>
      <div className="ui-panel-head">
        <div>
          <div className="ui-kicker">Your progress is saved</div>
          <h2 className="ui-h2">Leave the game?</h2>
        </div>
        <button type="button" className="ui-x" onClick={onStay} aria-label="Close">
          <Icon name="cross" size={14} />
        </button>
      </div>
      <div className="ui-body">
        <div className="ui-row">
          <button type="button" className="ui-btn ui-btn-green" onClick={onStay}>
            Keep playing
          </button>
          <button type="button" className="ui-btn ui-btn-gold" onClick={onLeave}>
            Leave
          </button>
        </div>
      </div>
    </div>
  </div>
);
