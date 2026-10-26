import React from 'react';
import { HeroFaceIcon } from './HeroFaceIcon.tsx';
import { GestureGlyph } from './GestureGlyph.tsx';
import { LESSONS, lessonInputMode, type LessonId } from '../game/lessons.ts';
import { arrowText } from './icons/arrowText.tsx';
import { useBlinkWatch } from './blinkWatch.ts';
import { stageNewLook } from '../game/dotGuide.ts';

/**
 * A first-time lesson: the game has paused itself, Pokey tells you what you are looking at, and you press the button when ready.
 * The button wakes a moment after the card appears, so a thumb that is still mashing the screen does not close it unread.
 */
export const LessonCard: React.FC<{ id: LessonId; onClose: () => void }> = (props) =>
  // the new look: no card in play (the stage did not stop); Dot says the lesson as one of her lines (components/dot/DotGuide.tsx)
  stageNewLook() ? <LessonAsLine {...props} /> : <LessonCardShown {...props} />;

/** the new look: hand the lesson straight back (Dot's guide took it from the same props) */
const LessonAsLine: React.FC<{ id: LessonId; onClose: () => void }> = ({ id, onClose }) => {
  React.useEffect(() => {
    onClose();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

const LessonCardShown: React.FC<{ id: LessonId; onClose: () => void }> = ({ id, onClose }) => {
  const lesson = LESSONS[id];
  const mode = lessonInputMode();
  const [ready, setReady] = React.useState(false);
  useBlinkWatch('lesson', id);
  React.useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 650);
    return () => window.clearTimeout(t);
  }, [id]);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') {
        // the stage is waiting on this card: neither the menu nor a jump should hear the key (the game's own key listener is on the
        // same window, so only stopImmediatePropagation keeps it from seeing the press)
        e.preventDefault();
        e.stopImmediatePropagation();
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
          {/* closes on the finger's lift as well as the click: a phone makes no click for a tap while another thumb is still on the glass
              (the steering thumb, held while the card is read), so "Got it!" did nothing for a two-thumb player */}
          <button
            type="button"
            className="ui-btn ui-btn-gold"
            onClick={onClose}
            onTouchEnd={(e) => {
              if (!ready) return;
              // (only a lift on the button: a finger that slid off it is not a press)
              const t = e.changedTouches[0];
              const r = e.currentTarget.getBoundingClientRect();
              if (t && (t.clientX < r.left || t.clientX > r.right || t.clientY < r.top || t.clientY > r.bottom)) return;
              if (e.cancelable) e.preventDefault(); // (and no click after it: it would close the next card too)
              onClose();
            }}
            disabled={!ready}
            data-start="true"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
