import React from 'react';
import { createPortal } from 'react-dom';
import { PaintedIcon } from './icons/PaintedIcon.tsx';
import { Popup } from './nav/Nav.tsx';
import { WHATS_NEW, releaseLine } from '../game/whatsNew.ts';
import './whatsNew.css';

/**
 * What's New (Settings > About): every release, newest first (src/game/whatsNew.ts). The newest is open, the rest folded; tapping a
 * heading opens or folds it. The list scrolls inside the pop-up, which closes the kit's three ways (X, a tap outside, Back).
 */
export const WhatsNew: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [open, setOpen] = React.useState<ReadonlySet<number>>(() => new Set([0]));
  const toggle = (i: number) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  // on <body>, so the Settings card's filter (a containing block for fixed children) can't shrink the scrim to the card
  return createPortal(
    <Popup title="What’s New" label="What’s New" onClose={onClose} top className="wn-card">
      <ol className="wn-list">
        {WHATS_NEW.map((r, i) => {
          const on = open.has(i);
          const id = `wn-rel-${i}`;
          return (
            <li key={`${r.date}-${r.version ?? r.part ?? ''}`} className={`wn-rel${on ? ' on' : ''}`}>
              <button type="button" className="wn-head" aria-expanded={on} aria-controls={id} onClick={() => toggle(i)}>
                <span className="wn-head-t">
                  {r.title}
                  {i === 0 && <span className="wn-new">New</span>}
                  <small>{releaseLine(r)}</small>
                </span>
                <span className="wn-chev" aria-hidden="true">
                  <PaintedIcon name="back" size={22} style={{ transform: `rotate(${on ? 270 : 180}deg)`, transition: 'transform 0.15s' }} />
                </span>
              </button>
              {on && (
                <ul className="wn-items" id={id}>
                  {r.items.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </Popup>,
    document.body,
  );
};
