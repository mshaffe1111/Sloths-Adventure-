import { CloseX, useBack } from './nav/Nav.tsx';
import React, { useRef, useState } from 'react';
import { GhostOnExit } from './fx/exitGhost.ts';
import { browserStore, buildSave, parseSave, applySave, saveFileName, type SaveFile } from '../game/saveFile.ts';
import { nativeApp } from '../game/appShell.ts';

/**
 * Save and load a whole game as a file. Only ever mounted by the title screen and the world map, so it cannot be
 * opened while a stage is being played.
 */
interface Props {
  onClose: () => void;
  /** called after a save has replaced the current progress */
  onLoaded: () => void;
}

const when = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

export const SaveLoadDialog: React.FC<Props> = ({ onClose, onLoaded }) => {
  // the X, a tap outside and Android Back all close it (nav/Nav.tsx)
  useBack(onClose);
  const [tab, setTab] = useState<'save' | 'load'>('save');
  const [note, setNote] = useState<{ kind: 'ok' | 'bad'; text: string } | null>(null);
  const [pending, setPending] = useState<SaveFile | null>(null);
  const [paste, setPaste] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const current = (() => {
    try {
      return buildSave(browserStore());
    } catch {
      return null;
    }
  })();

  // the Android app: the WebView cannot download, so the file is written to the app's cache and handed to the share sheet
  // (Drive, Files, email, a message), which is where a phone keeps a file anyway
  const doShareFile = async () => {
    try {
      const name = saveFileName();
      const text = JSON.stringify(buildSave(browserStore()), null, 2);
      const [{ Filesystem, Directory, Encoding }, { Share }] = await Promise.all([import('@capacitor/filesystem'), import('@capacitor/share')]);
      const { uri } = await Filesystem.writeFile({ path: name, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
      await Share.share({ title: 'Sloths Rainforest Adventures save', files: [uri], dialogTitle: 'Keep your save file' });
      setNote({ kind: 'ok', text: `Made ${name}. Keep it somewhere safe.` });
    } catch (e) {
      // closing the share sheet without picking anything is not a failure
      if (/cancel/i.test(String((e as { message?: string })?.message ?? e))) return;
      setNote({ kind: 'bad', text: 'Could not make the file here. Try "Copy save code" instead.' });
    }
  };

  const doDownload = () => {
    if (nativeApp()) {
      void doShareFile();
      return;
    }
    try {
      const save = buildSave(browserStore());
      const blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = saveFileName();
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setNote({ kind: 'ok', text: `Saved as ${a.download}. Keep it somewhere safe.` });
    } catch {
      setNote({ kind: 'bad', text: 'Could not make the file here. Try "Copy save code" instead.' });
    }
  };

  const doCopy = async () => {
    const text = JSON.stringify(buildSave(browserStore()));
    try {
      await navigator.clipboard.writeText(text);
      setNote({ kind: 'ok', text: 'Save code copied. Paste it into a note or message to keep it.' });
    } catch {
      setPaste(text);
      setTab('load');
      setNote({ kind: 'ok', text: 'Copying is blocked here, so the code is in the box. Select it all and copy it by hand.' });
    }
  };

  const consider = (text: string) => {
    const r = parseSave(text);
    if (!r.ok) {
      setPending(null);
      setNote({ kind: 'bad', text: r.reason });
      return;
    }
    setNote(null);
    setPending(r.save);
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (f.size > 200_000) {
      setNote({ kind: 'bad', text: 'That file is too big to be a Sloths save.' });
      return;
    }
    try {
      consider(await f.text());
    } catch {
      setNote({ kind: 'bad', text: 'Could not read that file.' });
    }
  };

  const confirmLoad = () => {
    if (!pending) return;
    try {
      applySave(browserStore(), pending);
      setPending(null);
      setNote({ kind: 'ok', text: 'Loaded. Your adventure is back.' });
      onLoaded();
    } catch {
      setNote({ kind: 'bad', text: 'Could not write the save into this browser.' });
    }
  };

  return (
    <div className="ui-scrim" role="dialog" aria-modal="true" aria-label="Save and load" onClick={onClose}>
      <GhostOnExit />
      <div className="ui-panel ui-saveload" onClick={(e) => e.stopPropagation()}>
        <div className="ui-panel-head">
          <div>
            <div className="ui-kicker">Your adventure</div>
            <h2 className="ui-h2">Save &amp; Load</h2>
          </div>
          <CloseX onClose={onClose} className="nv-inline" />
        </div>

        <div className="ui-tabs">
          <button type="button" className={tab === 'save' ? 'on' : ''} onClick={() => { setTab('save'); setNote(null); setPending(null); }}>
            Save
          </button>
          <button type="button" className={tab === 'load' ? 'on' : ''} onClick={() => { setTab('load'); setNote(null); }}>
            Load
          </button>
        </div>

        {tab === 'save' && (
          <div className="ui-body">
            {current && (
              <div className="ui-stats">
                <Stat label="Stages cleared" value={current.summary.stagesCleared} />
                <Stat label="Stars" value={current.summary.stars} />
                <Stat label="Worlds started" value={current.summary.worldsStarted} />
              </div>
            )}
            <p className="ui-copy">
              Saves every stage result, the stories you have seen and your sound settings into one small file. You can load it later, or on another device.
            </p>
            <div className="ui-row">
              <button type="button" className="ui-btn ui-btn-gold" onClick={doDownload}>
                Save to file
              </button>
              <button type="button" className="ui-btn ui-btn-green" onClick={doCopy}>
                Copy save code
              </button>
            </div>
          </div>
        )}

        {tab === 'load' && (
          <div className="ui-body">
            {!pending && (
              <>
                <p className="ui-copy">Loading <b>replaces</b> the progress on this device with what is in the file.</p>
                <div className="ui-row">
                  <button type="button" className="ui-btn ui-btn-gold" onClick={() => fileRef.current?.click()}>
                    Choose save file…
                  </button>
                  <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ''; }} />
                </div>
                <label className="ui-label" htmlFor="sl-paste">
                  or paste a save code
                </label>
                <textarea id="sl-paste" className="ui-area" rows={3} value={paste} onChange={(e) => setPaste(e.target.value)} spellCheck={false} placeholder='{"format":"sloths-rainforest-adventures-save", …' />
                <div className="ui-row">
                  <button type="button" className="ui-btn ui-btn-green" disabled={!paste.trim()} onClick={() => consider(paste)}>
                    Read code
                  </button>
                </div>
              </>
            )}
            {pending && (
              <>
                <div className="ui-stats">
                  <Stat label="Stages cleared" value={pending.summary.stagesCleared} />
                  <Stat label="Stars" value={pending.summary.stars} />
                  <Stat label="Worlds started" value={pending.summary.worldsStarted} />
                </div>
                <p className="ui-copy">
                  {pending.savedAt ? <>Saved {when(pending.savedAt)}. </> : null}
                  {current && current.summary.stars > pending.summary.stars ? (
                    <b className="ui-warn">This save has fewer stars than you have now ({current.summary.stars}). </b>
                  ) : null}
                  Replace your current progress with this?
                </p>
                <div className="ui-row">
                  <button type="button" className="ui-btn ui-btn-gold" onClick={confirmLoad}>
                    Yes, load it
                  </button>
                  <button type="button" className="ui-btn ui-btn-plain" onClick={() => setPending(null)}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {note && <div className={`ui-note ${note.kind}`}>{note.text}</div>}
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="ui-stat">
    <b>{value}</b>
    <span>{label}</span>
  </div>
);
