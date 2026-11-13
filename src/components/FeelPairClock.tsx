import React from 'react';
import { feelClock, speedLabel } from '../game/feelPair.ts';

/**
 * The vine pair test's stopwatch (feelPair.ts; a QA build only, feelPairStage.ts): each climb's last time, grab to standing on the bough,
 * the running one counting up. Upright top middle under the HUD, sideways at the left under the lives (clear of his head), clear of the
 * phone's notch; it takes no taps (the game's thumbs pass
 * through it). It looks at the clock ten times a second and redraws only when a time has changed by a tenth.
 */
export const FeelPairClock: React.FC = () => {
  const [, setRev] = React.useState(feelClock().rev);
  React.useEffect(() => {
    const id = window.setInterval(() => setRev(feelClock().rev), 100);
    return () => window.clearInterval(id);
  }, []);
  const c = feelClock();
  if (!c.lines.length) return null;
  return (
    <div className="fp-clock" aria-live="off" role="status" aria-label="Climb times">
      <div className="fp-head">Climb times</div>
      {c.lines.map((l) => (
        <div key={l.label} className={`fp-line${l.running ? ' on' : ''}`}>
          <span className="fp-what">{l.label}</span>
          <span className="fp-secs">{l.secs === null ? '–' : `${l.secs.toFixed(1)} s`}</span>
        </div>
      ))}
      <div className="fp-tip">Tap by the sign: two vines at {speedLabel(c.speed)}</div>
      <style>{CSS}</style>
    </div>
  );
};

const CSS = `
.fp-clock {
  position: fixed; left: 50%; transform: translateX(-50%); z-index: 40; pointer-events: none;
  top: calc(env(safe-area-inset-top, 0px) + 64px);
  min-width: 188px; padding: 6px 12px 7px; border-radius: 14px;
  background: rgba(30, 20, 10, 0.72); border: 2px solid rgba(253, 224, 71, 0.35);
  color: #fdf6e3; font: 600 13px/1.35 var(--font-ui, 'Outfit', sans-serif); text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
}
.fp-head { font: 15px/1.2 var(--font-fun, 'Cherry Bomb One', sans-serif); color: #fde047; text-align: center; margin-bottom: 2px; }
.fp-line { display: flex; justify-content: space-between; gap: 14px; }
.fp-line.on { color: #fde047; }
.fp-secs { font-variant-numeric: tabular-nums; min-width: 44px; text-align: right; }
.fp-tip { margin-top: 3px; font-size: 11px; color: rgba(253, 246, 227, 0.75); text-align: center; }
/* sideways the view is short and his head climbs through its top middle (45-50% feet, measured): there it sits at the left, under the
   lives, where he never is (the camera keeps him 40% across) */
@media (orientation: landscape) and (max-height: 500px) {
  .fp-clock { left: calc(env(safe-area-inset-left, 0px) + 10px); transform: none; top: calc(env(safe-area-inset-top, 0px) + 96px); }
}
`;
