import React, { useState, useSyncExternalStore } from 'react';
import { Icon } from './icons/index.tsx';
import { applyUpdate, checkForUpdate, subscribeUpdate, updateAvailable } from '../game/updates.ts';
import { storeBuild } from '../game/appShell.ts';

/** true once a newer build of the game has been found (the page that is open is an old one) */
export function useUpdateAvailable(): boolean {
  return useSyncExternalStore(subscribeUpdate, updateAvailable, () => false);
}

/**
 * The line under the title: "Check for updates" looks right then, and turns into "New version ready: Refresh" when one is found. The title
 * refreshes itself on finding one (App.tsx) unless a pop-up is open; this is the way to do it by hand, and to see that the check happened.
 */
export const UpdateLink: React.FC = () => {
  const ready = useUpdateAvailable();
  const [state, setState] = useState<'idle' | 'checking' | 'same' | 'unknown'>('idle');
  // the Play Store app: Google Play delivers updates, so there is nothing to check here (reference/PLAY-STORE.md §2.2)
  if (storeBuild()) return null;
  if (ready) {
    return (
      <button type="button" className="title-credit-btn upd-ready" onClick={() => void applyUpdate()}>
        New version ready: Refresh
      </button>
    );
  }
  const run = async () => {
    setState('checking');
    const r = await checkForUpdate();
    setState(r === 'new' ? 'idle' : r);
    if (r !== 'new') window.setTimeout(() => setState('idle'), 3000);
  };
  return (
    <button type="button" className="title-credit-btn" onClick={() => void run()} disabled={state === 'checking'}>
      {state === 'checking' ? 'Checking…' : state === 'same' ? (
          <>
            You have the latest <Icon name="check" size={12} />
          </>
        ) : state === 'unknown' ? 'Could not check (offline?)' : 'Check for updates'}
    </button>
  );
};

/** in the pause menu, only when a newer build is waiting: it restarts the stage, so it is a button and never automatic */
export const UpdateRow: React.FC = () => {
  const ready = useUpdateAvailable();
  if (!ready) return null;
  return (
    <div className="pm-update" role="status">
      <div>
        <b>A new version is ready</b>
        <small>Refreshing restarts this stage. Your saved progress stays.</small>
      </div>
      <button type="button" className="pm-mute" onClick={() => void applyUpdate()}>
        Refresh now
      </button>
    </div>
  );
};
