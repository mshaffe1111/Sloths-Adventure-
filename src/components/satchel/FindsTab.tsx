import React, { useState } from 'react';
import { Icon } from '../icons/index.tsx';
import { BONUS_FIND, FINDS, NOTCH_FIND, POCKET_FINDS, SNAIL_FINDS, SNAIL_PAINTED, allFound, type FindDef } from '../../game/finds.ts';
import { photoUrl } from '../../game/photos.ts';
import { itemUrl } from '../../game/items.ts';
import { KEEPSAKE_LINES } from '../../game/storyFinale.ts';
import { snailUrl } from '../../game/findArt.ts';

/** who a keepsake line belongs to, as the card shows it (the narrator's lines have no name) */
const SPEAKER: Record<string, string> = { Pokey: 'Pokey', Meeca: 'Meeca', Grandfather: 'Grandfather', Dot: 'Dot' };

/**
 * The satchel's first page: everything Pokey picked up on the way, by kind. A keepsake opens its page here: the painted thing and its
 * lines from the tea table, the six the finale leaves out included (storyFinale.ts KEEPSAKE_LINES). Notes, albums and Dot's things open
 * in the reader.
 */
export const FindsTab: React.FC<{ finds: string[]; onOpenFind: (id: string) => void }> = ({ finds, onOpenFind }) => {
  const [open, setOpen] = useState<string | null>(null);
  const got = (id: string) => finds.includes(id);
  const openKeep = open ? FINDS.find((f) => f.id === open) : undefined;
  const lines = openKeep ? KEEPSAKE_LINES[openKeep.id] ?? [] : [];

  const card = (f: FindDef, onTap: () => void, pic: React.ReactNode) => {
    const has = got(f.id);
    return (
      <div
        key={f.id}
        className={`tr-card tr-find ${has ? 'open' : 'lock'} ${open === f.id ? 'sc-sel' : ''}`}
        role={has ? 'button' : undefined}
        tabIndex={has ? 0 : undefined}
        onClick={has ? onTap : undefined}
        onKeyDown={has ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(); } } : undefined}
      >
        <div className="tr-cpic">{has ? pic : <Icon name="lock" size={34} />}</div>
        <div className="tr-cn">{has ? f.title : '???'}</div>
        <div className="tr-ct">{has ? `World ${f.world}` : f.hint}</div>
      </div>
    );
  };
  const group = (title: string, set: FindDef[], pic: (f: FindDef) => React.ReactNode, tap: (f: FindDef) => void = (f) => onOpenFind(f.id)) => (
    <>
      <div className="tr-sec">{title}</div>
      <div className="tr-grid tr-grid-j">{set.map((f) => card(f, () => tap(f), pic(f)))}</div>
    </>
  );
  const opened = allFound(finds);
  return (
    <>
      <div className="tr-sub tr-jsub">
        {FINDS.filter((f) => got(f.id)).length} of Meeca&apos;s and Grandma&apos;s {FINDS.length} things found · tap one to look again
      </div>
      {openKeep && (
        <div className="sc-page" aria-live="polite">
          <img className="sc-pic" src={itemUrl(openKeep.icon ?? 'petal') ?? ''} alt="" />
          <div className="sc-words">
            <div className="sc-t">
              {openKeep.title} <span>World {openKeep.world}</span>
            </div>
            {lines.map((b, i) => (
              <p key={i} className={`sc-l ${SPEAKER[b.s] ? '' : 'sc-n'}`}>
                {SPEAKER[b.s] && <b>{SPEAKER[b.s]}</b>}
                {b.t}
              </p>
            ))}
            <button type="button" className="sc-read" onClick={() => onOpenFind(openKeep.id)}>
              <Icon name="book" size={14} /> What it looks like
            </button>
          </div>
        </div>
      )}
      {group('Keepsakes', FINDS.filter((f) => f.kind === 'keepsake'), (f) => <img className="tr-thumb tr-item" src={itemUrl(f.icon ?? 'petal') ?? ''} alt="" />, (f) => setOpen(open === f.id ? null : f.id))}
      {group("Dot's lost pocket", POCKET_FINDS, () => <Icon name="hummingbird" size={42} />)}
      {group('From the old nest', [NOTCH_FIND], () => <Icon name="leaf" size={42} />)}
      {SNAIL_PAINTED && group('The snail', SNAIL_FINDS, () => <span className="sc-snail" style={{ backgroundImage: `url(${snailUrl() ?? ''})` }} />)}
      {group('Notes from Meeca', FINDS.filter((f) => f.kind === 'note'), () => <img className="tr-thumb tr-item" src={itemUrl('scroll') ?? ''} alt="" />)}
      {group('Photo albums', FINDS.filter((f) => f.kind === 'book'), (f) => {
        const url = photoUrl(f.pages[0]?.photo);
        return url ? <img className="tr-thumb" src={url} alt="" /> : <Icon name="book" size={42} />;
      })}
      <div className="tr-sec">Quest bonus</div>
      <div className="tr-grid tr-grid-j">
        <div
          className={`tr-card tr-find ${opened ? 'open' : 'lock'}`}
          role={opened ? 'button' : undefined}
          tabIndex={opened ? 0 : undefined}
          onClick={opened ? () => onOpenFind(BONUS_FIND.id) : undefined}
          onKeyDown={opened ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenFind(BONUS_FIND.id); } } : undefined}
        >
          <div className="tr-cpic">{opened ? <img className="tr-thumb tr-item" src={itemUrl('token') ?? ''} alt="" /> : <Icon name="lock" size={34} />}</div>
          <div className="tr-cn">{opened ? BONUS_FIND.title : '???'}</div>
          <div className="tr-ct">{opened ? 'Quest bonus' : BONUS_FIND.hint}</div>
        </div>
      </div>
    </>
  );
};
