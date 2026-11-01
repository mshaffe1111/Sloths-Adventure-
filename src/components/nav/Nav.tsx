import React from 'react';
import { Icon, type IconName } from '../icons/index.tsx';
import { Plaque } from '../KitParts.tsx';
import { backStack } from './backStack.ts';
import './nav.css';

/**
 * The shared way out of every screen and pop-up (menus-nav, the rule Matt approved 2026-10-31):
 *  1. every screen has a Back button in the same top-left spot, and Android's Back does the same thing (BackButton);
 *  2. every pop-up closes the same three ways: the X at its top-right, a tap outside it, and Android's Back (Popup);
 *  3. leaving a stage asks "are you sure?" when progress would be lost (ConfirmDialog).
 * Each one puts its handler on the back stack (backStack.ts) while it is shown, so the phone's Back always does what the newest
 * thing on screen would do. Use these, never a hand-made X or a back chip, so every screen exits the same way.
 */

/** while `enabled`, Android's Back (and Escape) runs `onBack`; the newest caller wins */
export function useBack(onBack: () => void, enabled = true): void {
  const ref = React.useRef(onBack);
  ref.current = onBack;
  React.useEffect(() => (enabled ? backStack.push(() => ref.current()) : undefined), [enabled]);
}

/**
 * A screen's Back: the round painted token with an arrow, and the place it goes on a wooden tag beside it ("Start Screen",
 * "World Map"), always at the top-left, clear of the notch. Android's Back does the same.
 */
export const BackButton: React.FC<{ to: string; onBack: () => void; className?: string; icon?: IconName }> = ({ to, onBack, className, icon }) => {
  useBack(onBack);
  return (
    <button type="button" className={`nv-back${className ? ` ${className}` : ''}`} onClick={onBack} aria-label={`Back to ${to}`}>
      <span className="nv-back-tok" aria-hidden="true">
        <Icon name={icon ?? 'arrow'} size={24} rotate={icon ? 0 : 180} />
      </span>
      <span className="nv-back-tag">{to}</span>
    </button>
  );
};

/** the round painted X at a pop-up's top-right corner (also usable alone, e.g. on a full-screen card) */
export const CloseX: React.FC<{ onClose: () => void; className?: string; label?: string }> = ({ onClose, className, label = 'Close' }) => (
  <button type="button" className={`nv-x${className ? ` ${className}` : ''}`} onClick={onClose} aria-label={label}>
    <Icon name="cross" size={22} />
  </button>
);

/**
 * A pop-up: the dimmed screen, the painted card with its plaque, and the X. It closes the three same ways: the X, a tap outside the
 * card, and Android's Back. `wide` lets the card take more of a sideways phone (a list, a grid).
 */
export const Popup: React.FC<{
  title: React.ReactNode;
  /** what a screen reader calls it */
  label: string;
  onClose: () => void;
  children: React.ReactNode;
  /** a small line over the card's content (above the body, under the plaque) */
  kicker?: React.ReactNode;
  /** buttons at the foot of the card */
  footer?: React.ReactNode;
  wide?: boolean;
  className?: string;
  /** above another pop-up (a confirm over Settings) */
  top?: boolean;
}> = ({ title, label, onClose, children, kicker, footer, wide, className, top }) => {
  useBack(onClose);
  return (
    <div className={`nv-scrim select-none${top ? ' nv-top' : ''}`} role="dialog" aria-modal="true" aria-label={label} onClick={onClose}>
      <div className={`nv-card${wide ? ' nv-wide' : ''}${className ? ` ${className}` : ''}`} onClick={(e) => e.stopPropagation()}>
        <Plaque className="nv-plaque">{title}</Plaque>
        <CloseX onClose={onClose} />
        {kicker && <div className="nv-kicker">{kicker}</div>}
        <div className="nv-body">{children}</div>
        {footer && <div className="nv-foot">{footer}</div>}
      </div>
    </div>
  );
};

/**
 * "Are you sure?" The safe answer (stay) is the big green board and has the focus; the answer that loses something is the smaller
 * wooden one under it. The X, a tap outside and Back all mean the safe answer.
 */
export const ConfirmDialog: React.FC<{
  title: string;
  body: React.ReactNode;
  /** the safe answer: "Keep playing" */
  stay: string;
  /** the answer that loses something: "Yes, leave" */
  go: string;
  onStay: () => void;
  onGo: () => void;
}> = ({ title, body, stay, go, onStay, onGo }) => (
  <Popup title={title} label={title} onClose={onStay} top className="nv-confirm">
    <p className="nv-confirm-p">{body}</p>
    <button type="button" className="pm-go nv-confirm-stay" autoFocus onClick={onStay}>
      <Icon name="play" size={20} />
      {stay}
    </button>
    <button type="button" className="st-btn nv-confirm-go" onClick={onGo}>
      {go}
    </button>
  </Popup>
);

/**
 * A big round leaf button with its name under it: the title's own leaf tokens (World Map, Story, How to Play), for the bottom row of
 * the map and any screen that needs a few labelled ways on.
 */
export const LeafButton: React.FC<{ icon: IconName; name: string; onClick: () => void; badge?: React.ReactNode; className?: string }> = ({ icon, name, onClick, badge, className }) => (
  <button type="button" onClick={onClick} className={`ttl-leaf nv-leaf${className ? ` ${className}` : ''}`}>
    <span className="ttl-leaf-ic">
      <Icon name={icon} size={30} />
      {badge}
    </span>
    {name}
  </button>
);

/** the round painted token for a screen's top-right corner (Settings, sound): the title's own */
export const CornerToken: React.FC<{ icon: IconName; label: string; onClick: () => void; pressed?: boolean }> = ({ icon, label, onClick, pressed }) => (
  <button type="button" className="ttl-token" onClick={onClick} aria-label={label} title={label} aria-pressed={pressed}>
    <Icon name={icon} size={28} />
  </button>
);
