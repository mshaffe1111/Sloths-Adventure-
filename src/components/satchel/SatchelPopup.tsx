import React from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../icons/index.tsx';

/**
 * A pop-up inside the satchel (a medal close up, a creature's story): Matt's exit rule (2026-10-31): it closes by its X, by a tap
 * outside, and by Android Back (App.tsx androidBack clicks the last `.ui-x` on screen, which is this one).
 * Minimal on purpose: when the shared pop-up from menus-nav lands, this becomes a thin wrapper over it.
 */
export const SatchelPopup: React.FC<{ label: string; onClose: () => void; className?: string; children: React.ReactNode }> = ({ label, onClose, className = '', children }) =>
  // (on document.body: the satchel's panel animates in with a transform, which would pin a fixed pop-up inside its scroll)
  createPortal(
  <div className="ui-scrim sp-scrim" role="dialog" aria-modal="true" aria-label={label} onClick={onClose}>
    <div className={`ui-panel sp-panel ${className}`} onClick={(e) => e.stopPropagation()}>
      <button type="button" className="ui-x sp-x" onClick={onClose} aria-label="Close">
        <Icon name="cross" size={14} />
      </button>
      {children}
    </div>
  </div>,
  document.body,
);
