/**
 * Normal's help offer in 1-1 (R-165.62, helpLadder.ts; the story keeper's words, reference/specs/help-lines.md §3): Dot asks whether
 * Pokey wants a little step. The two answers are pictures, for a player who can't read: YES is Pokey standing on the very stone that
 * will grow, NO is Pokey jumping on his own. No tick or cross: saying no is never failing. The stage holds still while it is up
 * (engine.ts askHelp); the phone's Back is a no (PLAY-STORE-RULES §6, nav/backStack.ts). Mounted by the engine on its own root, loaded
 * only the first time it is asked.
 */
import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { DotFace } from './DotFace.tsx';
import { HeroPose } from './HeroPose.tsx';
import { backStack } from './nav/backStack.ts';
import { W1_CUT, W1_CUT_URL } from '../game/w1CutArt.ts';
import { OFFER_LINE, REASK_LINE } from '../game/helpLadder.ts';

/** the picture's box (px): each answer is a tap target this size, well over 44 */
const PIC = 104;

/** the stone that will grow, cut from the World 1 sheet, with Pokey standing on its top */
const StepPicture: React.FC<{ cut?: string }> = ({ cut }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const c = cut ? W1_CUT[cut] : undefined;
  // (the stone fills the lower part of the picture; his feet go on its footing line, the top a foot stands on)
  const sw = 74;
  const k = c ? sw / c.w : 1;
  const sh = c ? Math.round(c.h * k) : 40;
  const stoneTop = PIC - Math.min(sh, 52) - 4;
  const feet = c ? stoneTop + c.fy * k : stoneTop;
  const midX = c ? (PIC - sw) / 2 + ((c.fx0 + c.fx1) / 2) * k : PIC / 2;
  useEffect(() => {
    const cv = ref.current;
    if (!cv || !c) return;
    const img = new Image();
    img.onload = () => {
      const ctx = cv.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, c.x, c.y, c.w, c.h, 0, 0, sw, sh);
    };
    img.src = W1_CUT_URL;
  }, [c, sh]);
  const heroH = Math.round(feet - 6);
  return (
    <span className="ho-pic" aria-hidden="true">
      <canvas ref={ref} width={sw} height={sh} style={{ position: 'absolute', left: (PIC - sw) / 2, top: stoneTop, width: sw, height: sh }} />
      <span style={{ position: 'absolute', left: midX - heroH * 0.4, top: feet - heroH, width: heroH * 0.8, height: heroH, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
        <HeroPose frame="idle_a" height={heroH} maxWidth={heroH * 0.8} />
      </span>
    </span>
  );
};

const CSS = `
.ho-scrim { position: fixed; inset: 0; z-index: 90; display: flex; align-items: center; justify-content: center; box-sizing: border-box;
  padding: max(12px, env(safe-area-inset-top, 0px)) max(12px, env(safe-area-inset-right, 0px)) max(12px, env(safe-area-inset-bottom, 0px)) max(12px, env(safe-area-inset-left, 0px));
  background: rgba(2, 20, 14, 0.62); font-family: var(--font-ui, system-ui, sans-serif); touch-action: none; }
.ho-card { box-sizing: border-box; width: min(100%, 380px); padding: 14px 14px 16px; border-radius: 22px; background: rgba(8, 44, 28, .97);
  border: 3px solid #fde68a; box-shadow: 0 10px 30px rgba(0,0,0,.55); color: #fff7e0; display: flex; flex-direction: column; gap: 12px;
  animation: ho-in .35s cubic-bezier(.2,1.25,.4,1) both; }
@keyframes ho-in { from { transform: scale(.85); opacity: 0 } to { transform: none; opacity: 1 } }
.ho-say { display: flex; align-items: center; gap: 10px; font-size: 19px; line-height: 1.3; font-weight: 700; }
.ho-say > :first-child { flex: none; }
.ho-row { display: flex; gap: 16px; justify-content: center; }
.ho-btn { position: relative; flex: none; width: ${PIC + 16}px; height: ${PIC + 16}px; padding: 8px; border-radius: 20px; cursor: pointer;
  border: 3px solid rgba(253, 230, 138, .75); background: radial-gradient(circle at 50% 35%, #2f6b48, #174230); box-shadow: 0 4px 0 #0b2418; }
.ho-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 #0b2418; }
.ho-btn:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
.ho-pic { position: relative; display: block; width: ${PIC}px; height: ${PIC}px; }
@media (max-height: 430px) { .ho-card { width: min(100%, 520px); flex-direction: row; align-items: center; } .ho-say { flex: 1; } }
`;

export const HelpOffer: React.FC<{ reask: boolean; cut?: string; onAnswer: (yes: boolean) => void }> = ({ reask, cut, onAnswer }) => {
  const done = useRef(false);
  const answer = (yes: boolean) => {
    if (done.current) return;
    done.current = true;
    onAnswer(yes);
  };
  // the phone's Back, and Escape on a keyboard: a no
  useEffect(() => {
    const off = backStack.push(() => answer(false));
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        answer(false);
      }
    };
    window.addEventListener('keydown', key, true);
    return () => {
      off();
      window.removeEventListener('keydown', key, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  return (
    <div className="ho-scrim" role="dialog" aria-modal="true" aria-label="Dot offers a step" onPointerDown={stop} onTouchStart={stop}>
      <style>{CSS}</style>
      <div className="ho-card">
        <div className="ho-say">
          <DotFace size={44} talking />
          <span>{reask ? REASK_LINE : OFFER_LINE}</span>
        </div>
        <div className="ho-row">
          <button type="button" className="ho-btn ho-yes" aria-label="Yes, a step" onClick={() => answer(true)}>
            <StepPicture cut={cut} />
          </button>
          <button type="button" className="ho-btn ho-no" aria-label="No, I will jump" onClick={() => answer(false)}>
            <span className="ho-pic" aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HeroPose frame="jump_up" height={88} maxWidth={96} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

/** put the offer on screen on its own root; it takes itself down when answered */
export function showHelpOffer(o: { reask: boolean; cut?: string }, answer: (yes: boolean) => void): void {
  const host = document.createElement('div');
  host.className = 'ho-host';
  document.body.appendChild(host);
  const root = createRoot(host);
  const onAnswer = (yes: boolean) => {
    // (taken down after this tap's events are over, so the tap that answered never reaches the touch controls under it)
    window.setTimeout(() => {
      root.unmount();
      host.remove();
    }, 0);
    answer(yes);
  };
  root.render(<HelpOffer reask={o.reask} cut={o.cut} onAnswer={onAnswer} />);
}
