import React from 'react';
import type { GameScreen } from '../game/types.ts';
import { PaintedIcon } from './icons/PaintedIcon.tsx';

/** App.tsx sends this once a stage's first frames are drawing (the iris opens on it) */
export const STAGE_LIVE_EVENT = 'sloth-stage-live';

/**
 * How one screen hands over to the next (2026-10-28):
 *   into a stage   the screen closes to the jungle's dark green with the stage's name on it (its title card) while the stage gets ready,
 *                  then opens as a soft round iris once the stage is really drawing, so nothing half-loaded is ever seen
 *   to the map or the Trophy Room   a quick dip through the dark green
 * Everything else (the pause menu, the cleared and out-of-lives cards, the stories) has its own entrance. Drawing only: it never
 * changes which screen is up or when.
 */
export const ScreenVeil: React.FC<{ screen: GameScreen; stage: { kicker: string; name: string } }> = ({ screen, stage }) => {
  const prev = React.useRef<GameScreen>(screen);
  const [veil, setVeil] = React.useState<{ kind: 'iris' | 'dip'; n: number; open: boolean; kicker: string; name: string } | null>(null);
  const seq = React.useRef(0);
  const stageRef = React.useRef(stage);
  stageRef.current = stage;

  React.useEffect(() => {
    const from = prev.current;
    prev.current = screen;
    if (from === screen) return;
    if (screen === 'playing' && from !== 'paused') {
      const n = ++seq.current;
      setVeil({ kind: 'iris', n, open: false, kicker: stageRef.current.kicker, name: stageRef.current.name });
      let done = false;
      const t0 = performance.now();
      const reduced = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      let hold = 0;
      const open = () => {
        if (done || seq.current !== n) return;
        done = true;
        // the stage's title stays up long enough to be read (about a second), and the iris waits two frames more, so the first
        // picture of the stage is on the screen before it starts to open
        const wait = Math.max(0, (reduced ? 500 : 1000) - (performance.now() - t0));
        hold = window.setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(() => setVeil((v) => (v && v.n === n ? { ...v, open: true } : v)))), wait);
      };
      window.addEventListener(STAGE_LIVE_EVENT, open, { once: true });
      const limit = window.setTimeout(open, 8000);
      return () => {
        window.removeEventListener(STAGE_LIVE_EVENT, open);
        window.clearTimeout(limit);
        window.clearTimeout(hold);
      };
    }
    if (screen === 'world_map' || screen === 'satchel') {
      const n = ++seq.current;
      setVeil({ kind: 'dip', n, open: true, kicker: '', name: '' });
    } else if (screen !== 'playing') setVeil(null);
  }, [screen]);

  if (!veil) return null;
  const end = () => setVeil((v) => (v && v.n === veil.n ? null : v));
  if (veil.kind === 'dip') return <div key={veil.n} className="sv-dip" aria-hidden="true" onAnimationEnd={end} />;
  return (
    <div key={veil.n} className={`sv-iris${veil.open ? ' open' : ''}`} aria-hidden="true" onAnimationEnd={(e) => e.target === e.currentTarget && veil.open && end()}>
      <div className="sv-card">
        <span className="sv-leaf">
          <PaintedIcon name="leaf" size={28} />
        </span>
        <div className="sv-kicker">{veil.kicker}</div>
        <div className="sv-name">{veil.name}</div>
      </div>
    </div>
  );
};
