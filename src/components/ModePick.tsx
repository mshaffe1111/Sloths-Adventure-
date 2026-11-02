import { CloseX, useBack } from './nav/Nav.tsx';
import React from 'react';
import { HeroPose } from './HeroPose.tsx';
import { setDifficulty, type Difficulty } from '../game/difficulty.ts';
import './modePick.css';

const CHOICES: { mode: Difficulty; who: string; name: string; line: string; pose: string }[] = [
  { mode: 'easy', who: 'Little explorer', name: 'Easy', line: 'More help', pose: 'idle_a' },
  { mode: 'normal', who: 'Big explorer', name: 'Normal', line: 'The full adventure', pose: 'cheer_b' },
];

/**
 * LV-19: a fresh game asks who is exploring, between How to Play and the story, on the painted card (the title Settings' look). Two big
 * choices and no default: nothing goes on until one is tapped, and the pick is kept (difficulty.ts), changeable later in Settings.
 */
export const ModePick: React.FC<{ onPicked: () => void; onClose: () => void }> = ({ onPicked, onClose }) => {
  // the X, a tap outside, Android Back and Escape all close it (nav/Nav.tsx)
  useBack(onClose);
  const pick = (d: Difficulty) => {
    setDifficulty(d);
    onPicked();
  };
  return (
    <div className="pm-scrim st-scrim mp-scrim select-none" onClick={onClose}>
      <div className="st-card mp-card" role="dialog" aria-modal="true" aria-label="Who is exploring?" onClick={(e) => e.stopPropagation()}>
        <h2 className="kit-plaque st-plaque">
          <span>Who's exploring?</span>
        </h2>
        <CloseX onClose={onClose} className="st-x" />
        <div className="mp-row" role="group" aria-label="Pick how to play">
          {CHOICES.map((c) => (
            <button key={c.mode} type="button" className={`mp-choice mp-${c.mode}`} onClick={() => pick(c.mode)}>
              <span className="mp-pose">
                <HeroPose frame={c.pose} height={c.mode === 'easy' ? 92 : 112} maxWidth={110} label="" />
              </span>
              <span className="mp-who">{c.who}</span>
              <span className="mp-name">{c.name}</span>
              <span className="mp-line">{c.line}</span>
            </button>
          ))}
        </div>
        <p className="mp-note">You can change this any time in Settings.</p>
      </div>
    </div>
  );
};
