import React, { useEffect, useState } from 'react';
import type { FindDef, KeepsakeIcon } from '../game/finds.ts';
import { photoUrl } from '../game/photos.ts';

interface Props {
  find: FindDef;
  onClose: () => void;
}

/** little placeholder pictures for the keepsakes (drawn in code; painted versions can replace them) */
export const KeepsakePic: React.FC<{ icon: KeepsakeIcon; size?: number }> = ({ icon, size = 96 }) => {
  const stroke = '#2a2118';
  const common = { width: size, height: size, viewBox: '0 0 100 100', role: 'img' as const, 'aria-hidden': true };
  switch (icon) {
    case 'key':
      return (
        <svg {...common}>
          <path d="M8 92 C 30 70 40 70 52 58" stroke="#4f9a48" strokeWidth="6" fill="none" strokeLinecap="round" />
          <circle cx="66" cy="38" r="17" fill="#8a8f96" stroke={stroke} strokeWidth="3" />
          <circle cx="66" cy="38" r="7" fill="#243329" />
          <rect x="62" y="52" width="9" height="34" rx="2" fill="#8a8f96" stroke={stroke} strokeWidth="3" />
          <rect x="71" y="66" width="12" height="7" fill="#8a8f96" stroke={stroke} strokeWidth="3" />
          <rect x="71" y="78" width="9" height="6" fill="#8a8f96" stroke={stroke} strokeWidth="3" />
        </svg>
      );
    case 'locket':
      return (
        <svg {...common}>
          <path d="M50 4 C 20 20 20 40 36 52 M50 4 C 80 20 80 40 64 52" stroke="#aab4be" strokeWidth="3" fill="none" />
          <path d="M50 52 C 28 52 24 70 30 80 C 38 94 62 94 70 80 C 76 70 72 52 50 52Z" fill="#c8d0d8" stroke={stroke} strokeWidth="3" />
          <path d="M50 62 C 44 56 36 62 42 70 L 50 78 L 58 70 C 64 62 56 56 50 62Z" fill="#e9a0b4" stroke="#8a4a60" strokeWidth="2" />
        </svg>
      );
    case 'medal':
      return (
        <svg {...common}>
          <path d="M30 4 L 50 40 L 70 4Z" fill="#3b6ea5" stroke={stroke} strokeWidth="3" />
          <circle cx="50" cy="64" r="26" fill="#b8892a" stroke={stroke} strokeWidth="3" />
          <circle cx="50" cy="64" r="18" fill="none" stroke="#e8c46a" strokeWidth="3" />
          <path d="M42 56 L 58 72" stroke="#6b5018" strokeWidth="3" />
        </svg>
      );
    case 'ribbon':
      return (
        <svg {...common}>
          <path d="M10 30 C 30 10 40 50 50 50 C 60 50 70 10 90 30 L 90 46 C 70 28 60 66 50 66 C 40 66 30 28 10 46Z" fill="#e9a0b4" stroke="#8a4a60" strokeWidth="3" />
          <path d="M38 62 L 24 92 M62 62 L 76 92" stroke="#8a4a60" strokeWidth="6" strokeLinecap="round" />
        </svg>
      );
    case 'rattle':
      return (
        <svg {...common}>
          <circle cx="50" cy="34" r="22" fill="#d7a05a" stroke={stroke} strokeWidth="3" />
          <path d="M40 30 C 46 22 56 24 60 32" stroke="#6b4a2a" strokeWidth="3" fill="none" />
          <rect x="46" y="54" width="8" height="38" rx="4" fill="#d7a05a" stroke={stroke} strokeWidth="3" />
        </svg>
      );
    case 'teddy':
      return (
        <svg {...common}>
          <circle cx="30" cy="22" r="11" fill="#c98f52" stroke={stroke} strokeWidth="3" />
          <circle cx="70" cy="22" r="11" fill="#c98f52" stroke={stroke} strokeWidth="3" />
          <ellipse cx="50" cy="72" rx="24" ry="22" fill="#c98f52" stroke={stroke} strokeWidth="3" />
          <circle cx="50" cy="38" r="22" fill="#d7a05a" stroke={stroke} strokeWidth="3" />
          <circle cx="42" cy="34" r="3" fill={stroke} />
          <path d="M60 31 L 68 39 M68 31 L 60 39" stroke="#8a4a60" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="50" cy="46" rx="8" ry="6" fill="#f0d9b0" stroke={stroke} strokeWidth="2" />
          <circle cx="50" cy="44" r="2.5" fill={stroke} />
        </svg>
      );
    case 'seeds':
      return (
        <svg {...common}>
          <path d="M22 16 H 78 L 84 90 H 16Z" fill="#e8d5a6" stroke={stroke} strokeWidth="3" />
          <path d="M22 16 H 78 L 76 30 H 24Z" fill="#c9a96a" stroke={stroke} strokeWidth="3" />
          <path d="M30 48 H 70 M30 58 H 62 M30 68 H 66" stroke="#6b4a2a" strokeWidth="2" strokeLinecap="round" />
          <path d="M50 88 C 50 76 46 74 40 72 C 40 80 44 86 50 88Z M50 88 C 52 78 58 76 62 76 C 60 84 56 88 50 88Z" fill="#4f9a48" stroke={stroke} strokeWidth="2" />
        </svg>
      );
    case 'stopwatch':
      return (
        <svg {...common}>
          <rect x="42" y="4" width="16" height="9" rx="2" fill="#8a8f96" stroke={stroke} strokeWidth="3" />
          <circle cx="50" cy="56" r="34" fill="#f1ead8" stroke={stroke} strokeWidth="4" />
          <circle cx="50" cy="56" r="26" fill="none" stroke="#b8a77a" strokeWidth="2" strokeDasharray="2 5" />
          <path d="M50 56 L 50 36" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <path d="M50 56 L 64 64" stroke="#b3342f" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="56" r="3" fill={stroke} />
        </svg>
      );
    case 'bell':
      return (
        <svg {...common}>
          <circle cx="50" cy="12" r="6" fill="none" stroke={stroke} strokeWidth="3" />
          <path d="M50 18 C 28 18 26 48 22 66 H 78 C 74 48 72 18 50 18Z" fill="#c4923a" stroke={stroke} strokeWidth="3" />
          <path d="M20 66 H 80 L 84 74 H 16Z" fill="#a67a2c" stroke={stroke} strokeWidth="3" />
          <circle cx="50" cy="82" r="7" fill="#7a5a20" stroke={stroke} strokeWidth="3" />
          <path d="M38 30 C 36 42 36 52 34 60" stroke="#e8c46a" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M50 14 C 18 20 14 64 50 90 C 86 64 82 20 50 14Z" fill="#e9a0b4" stroke="#8a4a60" strokeWidth="3" />
          <path d="M50 24 C 48 46 52 66 50 82" stroke="#8a4a60" strokeWidth="2" fill="none" />
          <path d="M36 44 C 44 50 44 60 38 70" stroke="#8a4a60" strokeWidth="2" fill="none" />
        </svg>
      );
  }
};

const PaperText: React.FC<{ text?: string }> = ({ text }) => (
  <>
    {(text ?? '').split('\n\n').map((para, i) => (
      <p key={i}>{para}</p>
    ))}
  </>
);

export const FindReader: React.FC<Props> = ({ find, onClose }) => {
  const [page, setPage] = useState(0);
  const last = find.pages.length - 1;
  const pg = find.pages[Math.min(page, last)];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight' && find.kind === 'book') setPage((p) => Math.min(last, p + 1));
      else if (e.code === 'ArrowLeft' && find.kind === 'book') setPage((p) => Math.max(0, p - 1));
      else if (e.code === 'Escape') onClose();
      else if (e.code === 'Enter' || e.code === 'Space') {
        if (find.kind === 'book' && page < last) setPage(page + 1);
        else onClose();
      } else return;
      // the reader owns these keys while it is open (the game underneath is paused)
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [find.kind, last, page, onClose]);

  const label =
    find.kind === 'note' ? 'A note' : find.kind === 'book' ? 'A photo album' : 'A keepsake';

  return (
    <div className="ui-scrim fr-scrim" role="dialog" aria-modal="true" aria-label={find.title} onClick={onClose}>
      <div className={`fr-card fr-${find.kind} ${find.kind === 'note' ? `fr-paper-${find.paper ?? 'leaf'}` : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="fr-label">{label} · World {find.world}</div>
        <h2 className="fr-title">{find.title}</h2>

        {find.kind === 'note' && (
          <div className="fr-text">
            <PaperText text={pg.text} />
          </div>
        )}

        {find.kind === 'keepsake' && (
          <div className="fr-keep">
            <KeepsakePic icon={find.icon ?? 'petal'} />
            <div className="fr-text">
              <PaperText text={pg.text} />
            </div>
          </div>
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
          {find.kind === 'book' ? (
            <>
              <button type="button" className="fr-btn" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} aria-label="Previous page">
                ←
              </button>
              <span className="fr-count">
                {page + 1} / {find.pages.length}
              </span>
              <button type="button" className="fr-btn" onClick={() => setPage(Math.min(last, page + 1))} disabled={page === last} aria-label="Next page">
                →
              </button>
            </>
          ) : (
            <span />
          )}
          <button type="button" className="fr-btn fr-close" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="fr-saved">Saved to the Library in the Trophy Room</div>
      </div>
    </div>
  );
};
