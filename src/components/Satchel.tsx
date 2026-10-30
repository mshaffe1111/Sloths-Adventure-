import React, { useState } from 'react';
import { Icon } from './icons/index.tsx';
import { BONUS_FIND, FINDS, NOTCH_FIND, POCKET_FINDS, SNAIL_FINDS, SNAIL_PAINTED, allFound, type FindDef } from '../game/finds.ts';
import { photoUrl } from '../game/photos.ts';
import { itemUrl } from '../game/items.ts';
import { MEMORIES, MEMORY_ORDER, type MemoryId } from '../game/storyChapters.ts';
import { KEEPSAKE_LINES } from '../game/storyFinale.ts';
import { POKEY_JOURNAL, journalWritten } from '../game/pokeyJournal.ts';
import type { LevelConfig } from '../game/types.ts';
import { SceneBackdrop } from './title/TitleScene.tsx';
import { DotPerched, Plaque } from './KitParts.tsx';

/**
 * Pokey's satchel (2026-10-29 story report, step 6): everything he picked up on the way, his journal, and the story scenes to watch
 * again. It took the Trophy Room's Library over whole (new replaces old), opened from the pause menu and the world map.
 *   Satchel   the finds, by kind. A keepsake opens its page here: the painted thing and its lines from the tea table, the six the finale
 *             leaves out included (storyFinale.ts KEEPSAKE_LINES). Notes, albums and Dot's things open in the reader.
 *   Journal   a line a world in Pokey's own hand (pokeyJournal.ts), written when its guardian falls.
 *   Scenes    the flashbacks and Tower scenes seen so far.
 */
export type SatchelTab = 'satchel' | 'journal' | 'scenes';

interface Props {
  finds: string[];
  levels: LevelConfig[];
  memories: MemoryId[];
  world?: number;
  initialTab?: SatchelTab;
  onOpenFind: (id: string) => void;
  onReplayMemory: (id: MemoryId) => void;
  onBack: () => void;
}

/** who a keepsake line belongs to, as the card shows it (the narrator's lines have no name) */
const SPEAKER: Record<string, string> = { Pokey: 'Pokey', Meeca: 'Meeca', Grandfather: 'Grandfather', Dot: 'Dot' };

export const Satchel: React.FC<Props> = ({ finds, levels, memories, world = 1, initialTab = 'satchel', onOpenFind, onReplayMemory, onBack }) => {
  const [tab, setTab] = useState<SatchelTab>(initialTab);
  const [open, setOpen] = useState<string | null>(null);
  const got = (id: string) => finds.includes(id);
  const written = journalWritten(levels);
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

  return (
    <div className="tr-screen" role="dialog" aria-label="Pokey's satchel">
      <SceneBackdrop world={world} />
      <div className="tr-inner">
        <DotPerched size={74} className="tr-dot" />
        <div className="tr-head">
          <button type="button" className="ui-x" onClick={onBack} aria-label="Back">
            <Icon name="arrow" size={16} rotate={180} />
          </button>
          <div className="tr-titles">
            <Plaque as="h1" className="tr-h1">
              Pokey&apos;s Satchel
            </Plaque>
            <div className="tr-sub">Everything he picked up on the way</div>
          </div>
        </div>

        <div className="tr-tabs" role="tablist">
          {([['satchel', 'Satchel'], ['journal', 'Journal'], ['scenes', 'Story scenes']] as const).map(([id, name]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
              {name}
            </button>
          ))}
        </div>

        {tab === 'satchel' && (
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
            {SNAIL_PAINTED && group('The snail', SNAIL_FINDS, () => <Icon name="sloth" size={42} />)}
            {group('Notes from Meeca', FINDS.filter((f) => f.kind === 'note'), () => <img className="tr-thumb tr-item" src={itemUrl('scroll') ?? ''} alt="" />)}
            {group('Photo albums', FINDS.filter((f) => f.kind === 'book'), (f) => {
              const url = photoUrl(f.pages[0]?.photo);
              return url ? <img className="tr-thumb" src={url} alt="" /> : <Icon name="book" size={42} />;
            })}
            <div className="tr-sec">Quest bonus</div>
            <div className="tr-grid tr-grid-j">
              {(() => {
                const opened = allFound(finds);
                return (
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
                );
              })()}
            </div>
          </>
        )}

        {tab === 'journal' && (
          <div className="sc-journal" aria-label="Pokey's journal">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((w) => (
              <div key={w} className={`sc-entry ${written.includes(w) ? '' : 'sc-blank'}`}>
                <span className="sc-w">World {w}</span>
                <span className="sc-hand">{written.includes(w) ? POKEY_JOURNAL[w] : ''}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'scenes' && (
          <div className="tr-grid tr-grid-j">
            {MEMORY_ORDER.map((id) => {
              const seen = memories.includes(id);
              return (
                <div
                  key={id}
                  className={`tr-card tr-find tr-memory ${seen ? 'open' : 'lock'}`}
                  role={seen ? 'button' : undefined}
                  tabIndex={seen ? 0 : undefined}
                  onClick={seen ? () => onReplayMemory(id) : undefined}
                  onKeyDown={seen ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onReplayMemory(id); } } : undefined}
                >
                  <div className="tr-cpic">{seen ? <Icon name={MEMORIES[id].kind === 'memory' ? 'heart' : 'scroll'} size={42} /> : <Icon name="lock" size={34} />}</div>
                  <div className="tr-cn">{seen ? MEMORIES[id].title : '???'}</div>
                  <div className="tr-ct">{seen ? 'Tap to watch again' : MEMORIES[id].hint}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
