import React from 'react';
import { PaintedIcon } from '../icons/PaintedIcon.tsx';
import { useBack } from '../nav/Nav.tsx';
import { INSPIRED_BY, INSPIRED_INTRO, NOT_AFFILIATED, OUR_STORY, REAL_RAINFOREST, WHATS_OURS } from './aboutWords.ts';
import './about.css';

export type AboutPageId = 'story' | 'inspired';

/**
 * Settings > About, R-165.158 (the FINAL layout Matt approved 11-12): "What's ours", then two links, "Our story ›" and "Inspired by ›",
 * each a page of its own inside the About tab (Back, Esc and Android's Back return to About). The words: aboutWords.ts.
 */
export const WhatsOurs: React.FC<{ onOpen: (id: AboutPageId) => void }> = ({ onOpen }) => (
  <>
    <section className="ab-ours" aria-labelledby="ab-ours-h">
      <h3 id="ab-ours-h" className="ab-h">What’s ours</h3>
      <ul>
        {WHATS_OURS.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </section>
    <button type="button" className="st-row ab-link" onClick={() => onOpen('story')}>
      <PaintedIcon name="story" size={40} />
      <span className="st-row-t">Our story</span>
      <span className="ab-chev" aria-hidden="true">›</span>
    </button>
    <button type="button" className="st-row ab-link" onClick={() => onOpen('inspired')}>
      <PaintedIcon name="sparkle" size={40} />
      <span className="st-row-t">Inspired by</span>
      <span className="ab-chev" aria-hidden="true">›</span>
    </button>
  </>
);

export const AboutPage: React.FC<{ page: AboutPageId; onBack: () => void }> = ({ page, onBack }) => {
  useBack(onBack);
  const top = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    top.current?.scrollIntoView({ block: 'start' });
    top.current?.focus({ preventScroll: true });
  }, [page]);
  return (
    <div className="ab-page" ref={top} tabIndex={-1} role="region" aria-label={page === 'story' ? 'Our story' : 'Inspired by'}>
      <div className="ab-head">
        <button type="button" className="ab-back" onClick={onBack} aria-label="Back to About">
          <span aria-hidden="true">‹</span> About
        </button>
        <h3 className="ab-h">{page === 'story' ? 'Our story' : 'Inspired by'}</h3>
      </div>
      {page === 'story' ? (
        <>
          {OUR_STORY.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </>
      ) : (
        <>
          <p>{INSPIRED_INTRO}</p>
          <ul className="ab-games">
            {INSPIRED_BY.map((e) => (
              <li key={e.games.join()}>
                {e.games.map((g, i) => (
                  <React.Fragment key={g}>
                    {i > 0 && ' and '}
                    <b>{g}</b>
                  </React.Fragment>
                ))}
                : {e.gave}
              </li>
            ))}
            <li>
              <b>{REAL_RAINFOREST.title}</b>: {REAL_RAINFOREST.gave}
            </li>
          </ul>
          <p className="ab-small">{NOT_AFFILIATED}</p>
        </>
      )}
    </div>
  );
};
