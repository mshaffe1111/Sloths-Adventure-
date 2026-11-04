import React from 'react';
import { Icon } from '../icons/index.tsx';
import { HeroFaceIcon } from '../HeroFaceIcon.tsx';
import { ConfirmDialog, Popup } from '../nav/Nav.tsx';
import { browserStore, buildSave, saveFileName, type Store } from '../../game/saveFile.ts';
import { cleanName, eraseSlot, listSlots, NAME_MAX, renameSlot, slotData, switchSlot, type SlotInfo } from '../../game/saveSlots.ts';
import { WORLDS_DATA } from '../../game/worldsData.ts';
import './slots.css';

/** each slot's own colour and face, so a child can find theirs without reading */
export const SLOT_LOOK = [
  { tint: 'leaf', face: 'face_happy' },
  { tint: 'sun', face: 'face_laugh' },
  { tint: 'sky', face: 'face_cheer' },
] as const;

const ago = (t: number, now = Date.now()) => {
  if (!t) return '';
  const days = Math.floor((now - t) / 86_400_000);
  return days <= 0 ? 'Played today' : days === 1 ? 'Played yesterday' : `Played ${days} days ago`;
};

const where = (s: SlotInfo) => {
  if (!s.furthest) return s.summary.worldsStarted > 0 ? 'Just set off' : 'A fresh adventure';
  if (s.furthest === '10-10') return 'All ten worlds cleared';
  const [w] = s.furthest.split('-').map(Number);
  return `World ${w} · ${WORLDS_DATA[w - 1]?.name ?? ''}`;
};

/** a backup file of one explorer's game, made before they are erased (the same file Save & Load writes) */
function downloadBackup(store: Store, n: number, name: string) {
  const data = slotData(store, n);
  const one: Store = {
    getItem: (k) => data[k] ?? null,
    setItem: () => {},
    removeItem: () => {},
    keys: () => Object.keys(data),
  };
  const blob = new Blob([JSON.stringify(buildSave(one), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = saveFileName().replace('sloths-save-', `sloths-save-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-`);
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** one explorer's card */
const SlotCard: React.FC<{ s: SlotInfo; onPlay: () => void; onRename: () => void; onErase: () => void; onNew: () => void }> = ({ s, onPlay, onRename, onErase, onNew }) => {
  const look = SLOT_LOOK[s.n - 1];
  if (s.empty)
    return (
      <div className="sl-card sl-empty" data-tint={look.tint}>
        <span className="sl-face sl-face-empty" aria-hidden="true">
          <Icon name="leaf" size={30} />
        </span>
        <span className="sl-t">
          <b>Free spot</b>
          <small>For another explorer</small>
        </span>
        <button type="button" className="st-btn sl-go" onClick={onNew}>
          New explorer
        </button>
      </div>
    );
  return (
    <div className={`sl-card${s.playing ? ' on' : ''}`} data-tint={look.tint}>
      <span className="sl-face" aria-hidden="true">
        <HeroFaceIcon size={52} face={look.face} />
      </span>
      <span className="sl-t">
        <b>{s.name}</b>
        {s.newer ? (
          <small>Saved by a newer version of the game. Update to play it.</small>
        ) : (
          <>
            <small>{where(s)}</small>
            <span className="sl-stats">
              <span>
                <Icon name="star" size={15} /> {s.summary.stars}
              </span>
              <span>
                <Icon name="check" size={14} /> {s.summary.stagesCleared} stages
              </span>
              {s.playing ? <span className="sl-now">Playing now</span> : s.playedAt ? <span className="sl-when">{ago(s.playedAt)}</span> : null}
            </span>
          </>
        )}
      </span>
      <span className="sl-acts">
        {!s.newer && !s.playing && (
          <button type="button" className="pm-go sl-play" onClick={onPlay}>
            <Icon name="play" size={18} />
            Play
          </button>
        )}
        {!s.newer && (
          <span className="sl-small">
            <button type="button" className="sl-mini" onClick={onRename} aria-label={`Rename ${s.name}`}>
              Rename
            </button>
            {!s.playing && (
              <button type="button" className="sl-mini sl-erase" onClick={onErase} aria-label={`Erase ${s.name}'s game`}>
                <Icon name="cross" size={14} />
                Erase
              </button>
            )}
          </span>
        )}
      </span>
    </div>
  );
};

/** typing a name: for a new explorer, or a new name for one */
export const NameCard: React.FC<{ title: string; start: string; go: string; onGo: (name: string) => void; onClose: () => void; children?: React.ReactNode }> = ({ title, start, go, onGo, onClose, children }) => {
  const [name, setName] = React.useState(start);
  const ok = cleanName(name).length > 0;
  return (
    <Popup title={title} label={title} onClose={onClose} top className="sl-name">
      <label className="sl-label" htmlFor="sl-name-in">
        Explorer's name
      </label>
      <input
        id="sl-name-in"
        className="sl-in"
        value={name}
        maxLength={NAME_MAX}
        autoComplete="off"
        autoCapitalize="words"
        enterKeyHint="done"
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && ok && onGo(cleanName(name))}
      />
      {children}
      <button type="button" className="pm-go" disabled={!ok} onClick={() => onGo(cleanName(name))}>
        <Icon name="check" size={20} />
        {go}
      </button>
    </Popup>
  );
};

/**
 * "Who's playing?": the three explorers on this phone, each with how far they are, a way to play as them, rename them, or erase them
 * (with a backup first). Playing as someone else saves this explorer and restarts the game as them (`onSwitched` reloads).
 */
export const WhoPlays: React.FC<{ onClose: () => void; onSwitched: () => void; startNew?: boolean }> = ({ onClose, onSwitched, startNew }) => {
  const store = browserStore();
  const [slots, setSlots] = React.useState(() => listSlots(store));
  const refresh = () => setSlots(listSlots(store));
  const [renaming, setRenaming] = React.useState<SlotInfo | null>(null);
  const [erasing, setErasing] = React.useState<SlotInfo | null>(null);
  const [naming, setNaming] = React.useState<number | null>(() => (startNew ? (listSlots(store).find((s) => s.empty)?.n ?? null) : null));
  const [full, setFull] = React.useState(false);

  const play = (n: number, name?: string) => {
    const r = switchSlot(store, n);
    if (!r.ok) {
      if (r.reason === 'full') setFull(true);
      return;
    }
    if (name) renameSlot(store, n, name);
    onSwitched();
  };

  return (
    <>
      <Popup title="Who's playing?" label="Who's playing?" onClose={onClose} wide className="sl-pop" kicker="Each explorer keeps their own game on this phone">
        <div className="sl-list">
          {slots.map((s) => (
            <SlotCard key={s.n} s={s} onPlay={() => play(s.n)} onRename={() => setRenaming(s)} onErase={() => setErasing(s)} onNew={() => setNaming(s.n)} />
          ))}
        </div>
        {full && <p className="sl-warn">This phone's storage is full, so the game couldn't be switched. Nothing was changed. Free some space and try again.</p>}
      </Popup>
      {naming !== null && (
        <NameCard title="New explorer" start={`Explorer ${naming}`} go="Start their adventure" onClose={() => setNaming(null)} onGo={(name) => play(naming, name)}>
          <p className="sl-note">{slots.find((s) => s.playing)?.name}'s game is kept safe. They can pick it up any time from here.</p>
        </NameCard>
      )}
      {renaming && (
        <NameCard
          title="Rename"
          start={renaming.name}
          go="Save the name"
          onClose={() => setRenaming(null)}
          onGo={(name) => {
            renameSlot(store, renaming.n, name);
            setRenaming(null);
            refresh();
          }}
        />
      )}
      {erasing && (
        <ConfirmDialog
          title="Erase this game?"
          body={
            <>
              {erasing.name}'s {erasing.summary.stagesCleared} stages and {erasing.summary.stars} stars go for good. A backup file can bring them back.
              <span className="sl-backup">
                <button type="button" className="sl-mini" onClick={() => downloadBackup(store, erasing.n, erasing.name)}>
                  <Icon name="save" size={18} />
                  Save a backup file first
                </button>
              </span>
            </>
          }
          stay="Keep their game"
          go="Yes, erase it"
          onStay={() => setErasing(null)}
          onGo={() => {
            eraseSlot(store, erasing.n);
            setErasing(null);
            refresh();
          }}
        />
      )}
    </>
  );
};
