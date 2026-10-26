import React from 'react';
import type { CoachStep } from '../game/touchCoach.ts';
import type { ControlStyle } from '../game/controlPrefs.ts';
import { GestureGlyph, type GlyphKind } from './GestureGlyph.tsx';
import { stageNewLook } from '../game/dotGuide.ts';

/**
 * The first-stage lesson, drawn over the game (see game/touchCoach.ts for when each step shows). It takes no touches, so nothing it covers stops
 * working: the player does the move it shows, and it moves on by itself.
 */
export const COACH_TEXT: Record<ControlStyle, Record<Exclude<CoachStep, null>, { title: string; sub: string; glyph: GlyphKind }>> = {
  screen: {
    run: { title: 'Touch anywhere and slide to run', sub: 'You do not have to touch Pokey. Put your thumb down anywhere on the screen and slide sideways. Slide the other way to turn around.', glyph: 'run' },
    jump: { title: 'Slide up and across to jump', sub: 'Keep running and slide your thumb up and forward in one quick move.', glyph: 'jump' },
    nice: { title: 'Nice jump!', sub: 'In the air, flick up again for a double jump.', glyph: 'up' },
  },
  pad: {
    run: { title: 'Push the pad to run', sub: 'Press anywhere on the pad side of the screen and push sideways.', glyph: 'run' },
    jump: { title: 'Press Jump', sub: 'Tap the Jump button to leap. Tap it again in the air for a double jump.', glyph: 'tap' },
    nice: { title: 'Nice jump!', sub: 'Hold Jump a little longer to go higher.', glyph: 'tap' },
  },
};

export const CoachOverlay: React.FC<{ step: CoachStep; style: ControlStyle }> = ({ step, style }) => {
  // the new look: Dot says the coach's steps herself, hovering beside Pokey (components/dot/DotGuide.tsx)
  if (!step || stageNewLook()) return null;
  const t = COACH_TEXT[style][step];
  return (
    <div className={`coach coach-${step}`} aria-live="polite">
      <div className="coach-card">
        <span className="coach-glyph">
          <GestureGlyph kind={t.glyph} size={64} />
        </span>
        <span className="coach-text">
          <b>{t.title}</b>
          <small>{t.sub}</small>
        </span>
      </div>
      {step !== 'nice' && style === 'screen' && (
        <div className="coach-demo" aria-hidden="true">
          <GestureGlyph kind={t.glyph} size={150} bare />
        </div>
      )}
    </div>
  );
};
