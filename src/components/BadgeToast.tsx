import React, { useEffect, useRef, useState } from 'react';
import type { BadgeDef } from '../game/badges.ts';
import { BadgeMedal } from './BadgeMedal.tsx';
import { guardianWorld } from './icons/badgeIcons.ts';
import { useBlinkWatch } from './blinkWatch.ts';

/**
 * "New badge!" slides in over whatever screen is showing, then goes away by itself.
 * One or two badges come one after the other; a bigger haul arrives together as a single card.
 */
export const BadgeToast: React.FC<{ badges: BadgeDef[]; onDone: () => void }> = ({ badges, onDone }) => {
  const [i, setI] = useState(0);
  const group = badges.length >= 3;
  // the parent hands over a new onDone on every render (each frame of play), so the timer reads it from a ref; with it in the effect's
  // list the timer restarted every render and the toast sat over Menu and Dot for a whole stage
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    setI(0);
  }, [badges]);
  useEffect(() => {
    if (!badges.length) return;
    const t = window.setTimeout(
      () => {
        if (!group && i + 1 < badges.length) setI(i + 1);
        else done.current();
      },
      group ? 4200 : 2600,
    );
    return () => window.clearTimeout(t);
  }, [badges, i, group]);

  useBlinkWatch('badge', group ? 'group' : badges[i]?.id);
  if (group) {
    const names = badges.slice(0, 3).map((b) => b.name).join(', ');
    return (
      <div className="tr-toast tr-toast-group" key="group" role="status" aria-live="polite">
        <div className="tr-toast-medals">
          {badges.slice(0, 6).map((b) => (
            <BadgeMedal key={b.id} icon={b.icon} tier={b.tier} earned size={36} world={guardianWorld(b.id)} />
          ))}
        </div>
        <div className="tr-toast-k">{badges.length} new badges!</div>
        <div className="tr-toast-d">
          {names}
          {badges.length > 3 ? ` and ${badges.length - 3} more` : ''}
        </div>
      </div>
    );
  }
  const b = badges[i];
  if (!b) return null;
  return (
    <div className="tr-toast" key={b.id} role="status" aria-live="polite">
      <BadgeMedal icon={b.icon} tier={b.tier} earned size={44} world={guardianWorld(b.id)} />
      <div>
        <div className="tr-toast-k">New badge!</div>
        <div className="tr-toast-n">{b.name}</div>
        <div className="tr-toast-d">{b.desc}</div>
      </div>
    </div>
  );
};
