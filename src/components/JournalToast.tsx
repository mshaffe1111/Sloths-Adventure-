import React from 'react';
import { takeNewlyOpened } from '../game/movesJournal.ts';

/**
 * "New page in your journal": while a stage is being played, any journal page that has just opened (a lesson card, a tip from Dot, a
 * skill, a find) is announced once, in a small note at the bottom of the screen for a few seconds. It never pauses the game. Pages that
 * open together (the first foe opens Kick, Mega punch and Stomp) share one note. It waits while a card or the menu is up.
 */
export const JournalToast: React.FC<{ active: boolean }> = ({ active }) => {
  const [note, setNote] = React.useState<{ titles: string[]; n: number } | null>(null);
  const queue = React.useRef<string[][]>([]);
  const showing = React.useRef(false);

  const next = React.useCallback(() => {
    const titles = queue.current.shift();
    if (!titles) {
      showing.current = false;
      setNote(null);
      return;
    }
    showing.current = true;
    setNote((n) => ({ titles, n: (n?.n ?? 0) + 1 }));
    window.setTimeout(next, 3600);
  }, []);

  React.useEffect(() => {
    if (!active) return;
    const check = () => {
      const fresh = takeNewlyOpened();
      if (!fresh.length) return;
      queue.current.push(fresh.map((p) => p.title));
      if (!showing.current) next();
    };
    check();
    const id = window.setInterval(check, 1500);
    return () => window.clearInterval(id);
  }, [active, next]);

  if (!note) return null;
  const one = note.titles.length === 1;
  return (
    <div className="jr-toast" key={note.n} role="status" aria-live="polite">
      <span className="jr-toast-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b2200" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z" />
          <path d="M12 6v14" />
        </svg>
      </span>
      <span className="jr-toast-txt">
        <span className="jr-toast-kick">{one ? 'New page in your journal' : `${note.titles.length} new pages in your journal`}</span>
        <b>{note.titles.join(', ')}</b>
      </span>
    </div>
  );
};
