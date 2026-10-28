import React from 'react';
import type { GameEngine } from '../game/engine.ts';

/**
 * Meeca's stage draws all its words on the canvas (the "On the March North" card, her thought clouds, Pell's words, the ending's story
 * box). This puts the same words in the page, out of sight, each with an aria-label of its real words: screen readers and QA's bots
 * read them (QA v200: none of 5-M's words were in the page). It asks the engine a few times a second (engine.ts meecaWords).
 */
export const MeecaWords: React.FC<{ engine: () => GameEngine | null }> = ({ engine }) => {
  const [words, setWords] = React.useState<Array<{ kind: string; text: string }>>([]);
  React.useEffect(() => {
    let last = '';
    const id = window.setInterval(() => {
      const w = engine()?.meecaWords() ?? [];
      const key = w.map((q) => `${q.kind}:${q.text}`).join('|');
      if (key === last) return;
      last = key;
      setWords(w);
    }, 150);
    return () => window.clearInterval(id);
  }, [engine]);
  return (
    <div className="meeca-words" aria-live="polite" style={HIDDEN}>
      {words.map((w) => (
        <p key={`${w.kind}:${w.text}`} data-meeca={w.kind} role={w.kind === 'card' ? 'heading' : 'note'} aria-label={w.text}>
          {w.text}
        </p>
      ))}
    </div>
  );
};

/** out of sight, but in the page's text (not display: none, which takes it out of both) */
const HIDDEN: React.CSSProperties = {
  position: 'fixed', left: 0, top: 0, width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap', pointerEvents: 'none',
};
