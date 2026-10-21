import React from 'react';
import { HeroFaceIcon } from './HeroFaceIcon.tsx';
import { GestureGlyph } from './GestureGlyph.tsx';
import { LESSONS, lessonInputMode, type LessonId } from '../game/lessons.ts';
import { arrowText } from './icons/arrowText.tsx';

/**
 * A first-time lesson: the game has paused itself, Pokey tells you what you are looking at, and you press the button when ready.
 * The button wakes a moment after the card appears, so a thumb that is still mashing the screen does not close it unread.
 */
export const LessonCard: React.FC<{ id: LessonId; onClose: () => void }> = ({ id, onClose }) => {
  const lesson = LESSONS[id];
  const mode = lessonInputMode();
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 650);
    return () => window.clearTimeout(t);
  }, [id]);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') {
        // the stage is waiting on this card: neither the menu nor a jump should hear the key
        e.preventDefault();
        e.stopPropagation();
        if (ready) onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [ready, onClose]);

  return (
    <div className="ui-scrim select-none lc-scrim" role="dialog" aria-modal="true" aria-label={lesson.title}>
      <div className="ui-panel lc">
        <div className="lc-head">
          <span className="lc-face">
            <HeroFaceIcon size={58} face={lesson.face} />
          </span>
          <div>
            <div className="ui-kicker">Pokey says</div>
            <h2 className="ui-h2">{lesson.title}</h2>
          </div>
        </div>
        <p className="ui-copy lc-intro">{lesson.intro}</p>
        <div className="lc-lines">
          {lesson.lines[mode].map((l, i) => (
            <div key={i} className={`htp-g lc-line${l.glyph && mode === 'screen' ? '' : ' lc-noglyph'}`}>
              {l.glyph && mode === 'screen' && <GestureGlyph kind={l.glyph} size={76} />}
              <span className="htp-what">
                <span className="htp-how">{arrowText(l.how)}</span>
                <b>{l.what}</b>
                {l.sub && <small>{l.sub}</small>}
              </span>
            </div>
          ))}
        </div>
        <div className="ui-row lc-foot">
          <button type="button" className="ui-btn ui-btn-gold" onClick={onClose} disabled={!ready} data-start="true">
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
