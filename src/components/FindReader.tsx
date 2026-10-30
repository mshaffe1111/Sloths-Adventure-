import React, { useEffect, useState } from 'react';
import { GhostOnExit } from './fx/exitGhost.ts';
import type { FindDef, KeepsakeIcon } from '../game/finds.ts';
import { photoUrl } from '../game/photos.ts';
import { itemUrl } from '../game/items.ts';
import { Icon } from './icons/index.tsx';
import { DotPerched } from './KitParts.tsx';

/** the Notch's painted cut-out (story-art, src/assets/story/finds/notch.webp): none until it is painted, and then the card shows it */
const NOTCH_URL: string | null =
  (Object.values(import.meta.glob('../assets/story/finds/notch.webp', { eager: true, query: '?url', import: 'default' }))[0] as string | undefined) ?? null;

interface Props {
  find: FindDef;
  onClose: () => void;
  /** this find was the last one: tell the player the bonus is waiting */
  completes?: boolean;
}

/** the painted picture of a keepsake (see items.ts) */
export const KeepsakePic: React.FC<{ icon: KeepsakeIcon; size?: number }> = ({ icon, size = 96 }) => {
  const url = itemUrl(icon);
  if (!url) return <span className="fr-noart" style={{ width: size, height: size }} aria-hidden="true" />;
  return <img className="fr-item" src={url} alt="" style={{ width: size * 1.18, height: size }} />;
};

/** a paragraph of a note: ~~words~~ are crossed out, the way she wrote them and then thought better of it */
const struck = (para: string): React.ReactNode => {
  const parts = para.split(/~~(.+?)~~/);
  return parts.length === 1 ? para : parts.map((s, i) => (i % 2 ? <s key={i} className="fr-struck">{s}</s> : s));
};

const PaperText: React.FC<{ text?: string }> = ({ text }) => (
  <>
    {(text ?? '').split('\n\n').map((para, i) => (
      <p key={i}>{struck(para)}</p>
    ))}
  </>
);

export const FindReader: React.FC<Props> = ({ find, onClose, completes }) => {
  const [page, setPage] = useState(0);
  const last = find.pages.length - 1;
  const pg = find.pages[Math.min(page, last)];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight' && last > 0) setPage((p) => Math.min(last, p + 1));
      else if (e.code === 'ArrowLeft' && last > 0) setPage((p) => Math.max(0, p - 1));
      else if (e.code === 'Escape') onClose();
      else if (e.code === 'Enter' || e.code === 'Space') {
        if (page < last) setPage(page + 1);
        else onClose();
      } else return;
      // the reader owns these keys while it is open (the game underneath is paused)
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [last, page, onClose]);

  const label =
    find.kind === 'note' ? 'A note' : find.kind === 'book' ? 'A photo album' : find.kind === 'pocket' ? "Something of Dot's" : find.kind === 'notch' ? 'From the old nest' : 'A keepsake';

  return (
    <div className="ui-scrim fr-scrim" role="dialog" aria-modal="true" aria-label={find.title} onClick={onClose}>
      <GhostOnExit />
      <div className={`fr-card fr-${find.kind} ${find.kind === 'note' ? `fr-paper-${find.paper ?? 'leaf'}` : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="fr-label">{label} · {find.world > 0 ? `World ${find.world}` : 'Quest bonus'}</div>
        <h2 className="fr-title">{find.title}</h2>

        {find.kind === 'note' && (
          <div className="fr-text">
            <PaperText text={pg.text} />
          </div>
        )}

        {find.kind === 'keepsake' && (
          <div className="fr-keep">
            <KeepsakePic icon={find.icon ?? 'petal'} size={118} />
            <div className="fr-text">
              <PaperText text={pg.text} />
            </div>
          </div>
        )}

        {(find.kind === 'pocket' || find.kind === 'notch') && (
          <div className="fr-keep">
            {find.kind === 'pocket' ? <DotPerched size={96} className="fr-dot" /> : NOTCH_URL && <img className="fr-item" src={NOTCH_URL} alt="" style={{ height: 118 }} />}
            <div className="fr-text">
              <PaperText text={pg.text} />
            </div>
          </div>
        )}
        {find.said && (
          <p className="fr-said">
            <b>{find.said.who}</b> {find.said.text}
          </p>
        )}

        {find.kind === 'book' && (
          <div className="fr-page">
            <div className="fr-photo">
              {photoUrl(pg.photo) ? <img src={photoUrl(pg.photo) as string} alt={pg.caption ?? ''} /> : <div className="fr-faded">a faded photograph</div>}
              {pg.caption && <div className="fr-cap">{pg.caption}</div>}
            </div>
            <div className="fr-text">
              <PaperText text={pg.text} />
            </div>
          </div>
        )}

        <div className="fr-foot">
          {last > 0 ? (
            <>
              <button type="button" className="fr-btn" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} aria-label="Previous page">
                <Icon name="arrow" size={18} rotate={180} />
              </button>
              <span className="fr-count">
                {page + 1} / {find.pages.length}
              </span>
              <button type="button" className="fr-btn" onClick={() => setPage(Math.min(last, page + 1))} disabled={page === last} aria-label="Next page">
                <Icon name="arrow" size={18} />
              </button>
            </>
          ) : (
            <span />
          )}
          <button type="button" className="fr-btn fr-close" onClick={onClose}>
            Close
          </button>
        </div>
        <div className={`fr-saved${completes ? " done" : ""}`}>{completes ? "That is all 30! Something new is waiting in the satchel." : "Saved in Pokey's satchel"}</div>
      </div>
    </div>
  );
};
