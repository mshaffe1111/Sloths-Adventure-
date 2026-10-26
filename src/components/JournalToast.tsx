import React from 'react';
import { takeNewlyOpened } from '../game/movesJournal.ts';
import { guideShowMs } from '../game/wayside.ts';

/**
 * "New page in your journal": while a stage is being played, any journal page that has just opened (a lesson card, a tip from Dot, a
 * skill, a find) is announced once, in a small note at the bottom of the screen for a few seconds. It never pauses the game. Pages that
 * open together (the first foe opens Kick, Mega punch and Stomp) share one note. It waits while a card or the menu is up, and while
 * Dot is speaking: her line can sit at the bottom of the screen too, and the note used to cover it (`guide`: her latest line).
 */
export const JournalToast: React.FC<{ active: boolean; guide?: { text: string; ms: number; n: number } | null }> = ({ active, guide }) => {
  const [note, setNote] = React.useState<{ titles: string[]; n: number } | null>(null);
  const queue = React.useRef<string[][]>([]);
  const showing = React.useRef(false);
  const holdUntil = React.useRef(0);
  const current = React.useRef<string[] | null>(null);
  /** the one pending step of the queue (a held note must not leave a second chain running) */
  const timer = React.useRef(0);
  const later = (f: () => void, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(f, ms);
  };

  const next = React.useCallback(() => {
    const wait = holdUntil.current - performance.now();
    if (wait > 0) {
      showing.current = true;
      later(next, wait);
      return;
    }
    const titles = queue.current.shift();
    if (!titles) {
      showing.current = false;
      setNote(null);
      return;
    }
    showing.current = true;
    current.current = titles;
    setNote((n) => ({ titles, n: (n?.n ?? 0) + 1 }));
    later(() => {
      current.current = null;
      next();
    }, 3600);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Dot starts a line: a note on screen steps aside (it comes back after her) and the queue waits until she is done
  React.useEffect(() => {
    if (!guide || !guide.text) return;
    // (as long as her line is actually up: Wayside keeps a line long enough to read, longer than the engine asked for)
    const ms = guideShowMs(guide.text, guide.ms);
    holdUntil.current = performance.now() + ms + 400;
    if (current.current) {
      queue.current.unshift(current.current);
      current.current = null;
      setNote(null);
    }
    if (showing.current) later(next, ms + 400);
  }, [guide?.n]); // eslint-disable-line react-hooks/exhaustive-deps

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
