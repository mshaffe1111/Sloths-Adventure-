import type { CoachStep } from '../game/touchCoach.ts';
import type { ControlStyle } from '../game/controlPrefs.ts';
import type { GlyphKind } from './GestureGlyph.tsx';

/** The first-stage coach's words (see game/touchCoach.ts for when each step comes). Dot says them in play (components/dot/DotGuide.tsx). */
export const COACH_TEXT: Record<ControlStyle, Record<Exclude<CoachStep, null>, { title: string; sub: string; glyph: GlyphKind }>> = {
  screen: {
    run: { title: 'Touch anywhere and slide to run', sub: 'You do not have to touch Pokey. Put your thumb down anywhere on the screen and slide sideways. Slide the other way to turn around.', glyph: 'run' },
    jump: { title: 'Slide up and across to jump', sub: 'Keep running and slide your thumb up and forward in one quick move.', glyph: 'jump' },
    nice: { title: 'Nice jump!', sub: 'In the air, flick up again for a double jump.', glyph: 'up' },
  },
  pad: {
    run: { title: 'Push the pad to run', sub: 'Press anywhere on the pad side of the screen and push sideways.', glyph: 'run' },
    // (R-165.57: the pad's lines say what Dot's do: a held second Jump reaches 189 px, a tap-tap only 124 (helpLadder.ts MOVE_LINES.double.pad))
    jump: { title: 'Press Jump', sub: 'Tap the Jump button to leap.', glyph: 'tap' },
    nice: { title: 'Nice jump!', sub: 'In the air, hold Jump again for a double jump.', glyph: 'tap' },
  },
};
