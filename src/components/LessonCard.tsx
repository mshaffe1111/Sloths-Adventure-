import React from 'react';
import type { LessonId } from '../game/lessons.ts';

/**
 * A first-time lesson: no card in play (the stage does not stop). Dot says it as one of her lines (components/dot/DotGuide.tsx takes it
 * from the same lessonId), so this only hands the lesson straight back.
 */
export const LessonCard: React.FC<{ id: LessonId; onClose: () => void }> = ({ id, onClose }) => {
  React.useEffect(() => {
    onClose();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};
