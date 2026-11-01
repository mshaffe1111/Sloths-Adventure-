import React, { useEffect, useRef, useState } from 'react';
import { TIER_NAME, TIER_POINTS, type BadgeDef } from '../game/badges.ts';
import { BadgeMedal } from './BadgeMedal.tsx';
import { useBlinkWatch } from './blinkWatch.ts';

/**
 * "New medal!" slides in over whatever screen is showing, then goes away by itself, with the medal's tier and points.
 * One or two medals come one after the other; a bigger haul arrives together as a single card with the points it is worth.
 */
export const BadgeToast: React.FC<{ badges: BadgeDef[]; onDone: () => void; inPlay?: boolean }> = ({ badges, onDone, inPlay = false }) => {
  const [i, setI] = useState(0);
  // (in play, every medal gets its own short pop: a group card would be too big over the stage)
  const group = badges.length >= 3 && !inPlay;
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
      group ? 4200 : inPlay ? 2400 : 2600,
    );
    return () => window.clearTimeout(t);
  }, [badges, i, group, inPlay]);

  useBlinkWatch('badge', group ? 'group' : badges[i]?.id);
  if (group) {
    const names = badges.slice(0, 3).map((b) => b.name).join(', ');
    const pts = badges.reduce((a, b) => a + TIER_POINTS[b.tier], 0);
    return (
      <div className="tr-toast tr-toast-group" key="group" role="status" aria-live="polite">
        <div className="tr-toast-medals">
          {badges.slice(0, 6).map((b) => (
            <BadgeMedal key={b.id} badge={b} earned size={44} />
          ))}
        </div>
        <div className="tr-toast-k">{badges.length} new medals!</div>
        <div className="tr-toast-p">+{pts} points</div>
        <div className="tr-toast-d">
          {names}
          {badges.length > 3 ? ` and ${badges.length - 3} more` : ''}
        </div>
      </div>
    );
  }
  const b = badges[i];
  if (!b) return null;
  // in play: a small pop at the top centre, between the hearts and the menu, clear of Pokey and the thumbs (MedalPop, 2026-11-01)
  if (inPlay)
    return (
      <div className={`mp-pop mp-${b.tier}`} key={b.id} role="status" aria-live="polite">
        <BadgeMedal badge={b} earned size={44} />
        <div className="mp-t">
          <div className="mp-k">New {TIER_NAME[b.tier].toLowerCase()} medal!</div>
          <div className="mp-n">{b.name}</div>
        </div>
      </div>
    );
  return (
    <div className="tr-toast" key={b.id} role="status" aria-live="polite">
      <BadgeMedal badge={b} earned size={60} />
      <div>
        <div className="tr-toast-k">New {TIER_NAME[b.tier].toLowerCase()} medal!</div>
        <div className="tr-toast-n">{b.name}</div>
        <div className="tr-toast-d">{b.desc}</div>
        <div className="tr-toast-p">+{TIER_POINTS[b.tier]} points</div>
      </div>
    </div>
  );
};
