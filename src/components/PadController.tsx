import React, { useEffect, useRef, useState } from 'react';
import { InputEngine } from '../game/inputEngine.ts';
import { PAD, padIntent, followAnchor, clampKnob } from '../game/padControl.ts';
import type { PadSide } from '../game/controlPrefs.ts';

/**
 * The drawn controller. A floating thumb pad fills one half of the screen (it appears wherever the thumb lands), and
 * Jump, Punch and Kick buttons sit in the other half, arranged around where that thumb rests. `side` is where the pad
 * is; the buttons take the other side, so left-handers just flip it in the menu.
 *
 *   pad:   slide sideways to run, down to duck, up to jump (hold up to climb a trunk or grab a rope)
 *   Jump:  press to jump, hold for height, press again in the air for a double jump
 *   Punch: tap to punch, hold to charge a mega punch
 *   Kick:  tap to kick the way he faces
 */
interface Props {
  inputEngine: InputEngine;
  side: PadSide;
}

type Btn = 'jump' | 'punch' | 'kick';
const MEGA_HOLD_MS = 320;

export const PadController: React.FC<Props> = ({ inputEngine, side }) => {
  const [pad, setPad] = useState<{ ax: number; ay: number; kx: number; ky: number } | null>(null);
  const [down, setDown] = useState<Set<Btn>>(new Set());

  const st = useRef({
    padId: -1,
    ax: 0,
    ay: 0,
    move: 'none' as 'left' | 'right' | 'none',
    duck: false,
    jumpSrc: new Set<string>(),
    megaTimer: 0,
    megaFired: false,
  });

  const jumpSet = (src: string, on: boolean) => {
    const s = st.current.jumpSrc;
    const before = s.size > 0;
    if (on) s.add(src);
    else s.delete(src);
    const after = s.size > 0;
    if (!before && after) {
      inputEngine.triggerTouchUp();
      inputEngine.triggerHaptic(15);
    } else if (before && !after) inputEngine.releaseTouchUp();
  };

  const padApply = (dx: number, dy: number) => {
    const s = st.current;
    const it = padIntent(dx, dy);
    if (it.move !== s.move) {
      s.move = it.move;
      inputEngine.triggerTouchMove(it.move);
    }
    if (it.duck !== s.duck) {
      s.duck = it.duck;
      inputEngine.triggerTouchDuck(it.duck);
    }
    jumpSet('pad', it.up);
  };

  const padRelease = () => {
    const s = st.current;
    s.padId = -1;
    s.move = 'none';
    s.duck = false;
    inputEngine.triggerTouchMove('none');
    inputEngine.triggerTouchDuck(false);
    jumpSet('pad', false);
    setPad(null);
  };

  const releaseAll = () => {
    const s = st.current;
    window.clearTimeout(s.megaTimer);
    s.megaFired = false;
    padRelease();
    jumpSet('btn', false);
    setDown(new Set());
  };

  // nothing may stay held when the pad goes away (pause, stage over) or the page loses focus
  useEffect(() => {
    inputEngine.onFocusLost = releaseAll;
    return () => {
      inputEngine.onFocusLost = null;
      releaseAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputEngine]);

  useEffect(() => {
    const onEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) releaseAll();
    };
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    return () => {
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputEngine]);

  const mark = (b: Btn, on: boolean) =>
    setDown((prev) => {
      const n = new Set(prev);
      if (on) n.add(b);
      else n.delete(b);
      return n;
    });

  // ---- the pad ----
  const padStart = (e: React.TouchEvent) => {
    const s = st.current;
    if (s.padId !== -1) return;
    const t = e.changedTouches[0];
    s.padId = t.identifier;
    s.ax = t.clientX;
    s.ay = t.clientY;
    setPad({ ax: s.ax, ay: s.ay, kx: 0, ky: 0 });
  };
  const padMove = (e: React.TouchEvent) => {
    const s = st.current;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier !== s.padId) continue;
      s.ax = followAnchor(s.ax, t.clientX);
      const dx = t.clientX - s.ax;
      const dy = t.clientY - s.ay;
      padApply(dx, dy);
      const k = clampKnob(dx, dy);
      setPad({ ax: s.ax, ay: s.ay, kx: k.x, ky: k.y });
    }
  };
  const padEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === st.current.padId) padRelease();
  };

  // ---- the buttons ----
  const btnStart = (b: Btn) => (e: React.TouchEvent) => {
    e.stopPropagation();
    mark(b, true);
    const s = st.current;
    if (b === 'jump') jumpSet('btn', true);
    else if (b === 'kick') {
      inputEngine.triggerTouchKick(0);
      inputEngine.triggerHaptic(25);
    } else {
      s.megaFired = false;
      window.clearTimeout(s.megaTimer);
      s.megaTimer = window.setTimeout(() => {
        s.megaFired = true;
        inputEngine.triggerTouchMega();
        inputEngine.triggerHaptic(35);
      }, MEGA_HOLD_MS);
    }
  };
  const btnEnd = (b: Btn) => (e: React.TouchEvent) => {
    e.stopPropagation();
    mark(b, false);
    const s = st.current;
    if (b === 'jump') jumpSet('btn', false);
    else if (b === 'punch') {
      window.clearTimeout(s.megaTimer);
      if (!s.megaFired) {
        inputEngine.triggerTouchPunch();
        inputEngine.triggerHaptic(20);
      }
      s.megaFired = false;
    }
  };
  const btnProps = (b: Btn) => ({ onTouchStart: btnStart(b), onTouchEnd: btnEnd(b), onTouchCancel: btnEnd(b) });

  // the pad is on `side`; the buttons are on the other one, mirrored so the cluster always opens toward the thumb
  const btnSide: PadSide = side === 'right' ? 'left' : 'right';
  const edge = (v: string) => ({ [btnSide]: v }) as React.CSSProperties;
  const pos = (rx: string, by: string): React.CSSProperties => ({ ...edge(`calc(${rx} + max(10px, env(safe-area-inset-${btnSide})))`), bottom: `calc(${by} + max(10px, env(safe-area-inset-bottom)))` });

  return (
    <div className="fixed inset-0 z-30 pointer-events-none select-none touch-none" style={{ ['--b' as string]: 'clamp(54px, 15vh, 80px)' }}>
      {/* the pad's half of the screen */}
      <div
        className="absolute top-[16%] bottom-0 w-1/2 pointer-events-auto"
        style={{ [side]: 0, touchAction: 'none', WebkitTouchCallout: 'none' }}
        onTouchStart={padStart}
        onTouchMove={padMove}
        onTouchEnd={padEnd}
        onTouchCancel={padEnd}
      >
        {/* the ghost pad that shows where to put a thumb. It stays mounted (and never takes a touch) because a touch that began on an element which then unmounts stops reporting its moves */}
        <div
          className="absolute left-1/2 bottom-[18%] -translate-x-1/2 grid place-items-center rounded-full border-2 border-white/30 bg-white/10 text-white/50 font-black pointer-events-none transition-opacity"
          style={{ width: PAD.radius * 2 + 28, height: PAD.radius * 2 + 28, opacity: pad ? 0 : 1 }}
        >
          <span className="text-[13px] tracking-[0.35em]">◀ ▶</span>
        </div>
      </div>
      {pad && (
        <>
          <div className="fixed rounded-full border-[3px] border-white/55 bg-white/15 pointer-events-none" style={{ width: PAD.radius * 2 + 28, height: PAD.radius * 2 + 28, left: pad.ax - PAD.radius - 14, top: pad.ay - PAD.radius - 14 }} />
          <div className="fixed rounded-full bg-white/80 shadow-lg pointer-events-none" style={{ width: 52, height: 52, left: pad.ax + pad.kx - 26, top: pad.ay + pad.ky - 26 }} />
        </>
      )}

      {/* Jump sits nearest the thumb's rest; Punch beside it, Kick above */}
      <Button label="Kick" className="from-rose-400 to-rose-600 border-rose-200/80" down={down.has('kick')} size="1" style={pos('calc(var(--b) * 0.45)', 'calc(var(--b) * 1.45)')} {...btnProps('kick')} />
      <Button label="Punch" className="from-amber-300 to-amber-500 border-amber-100/80" down={down.has('punch')} size="1" style={pos('calc(var(--b) * 1.55)', 'calc(var(--b) * 0.7)')} {...btnProps('punch')} />
      <Button label="Jump" className="from-emerald-400 to-emerald-600 border-emerald-100/80" down={down.has('jump')} size="1.2" style={pos('calc(var(--b) * 0.1)', '0px')} {...btnProps('jump')} />
    </div>
  );
};

const Button: React.FC<{
  label: string;
  className: string;
  down: boolean;
  size: string;
  style: React.CSSProperties;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onTouchCancel: (e: React.TouchEvent) => void;
}> = ({ label, className, down, size, style, ...h }) => (
  <div
    {...h}
    className={`absolute pointer-events-auto grid place-items-center rounded-full border-[3px] bg-gradient-to-b font-black uppercase tracking-wide text-white shadow-[0_5px_0_rgba(0,0,0,.35)] transition-transform duration-75 [text-shadow:0_1px_2px_rgba(0,0,0,.6)] ${className} ${down ? 'scale-90 brightness-125 shadow-none' : 'opacity-80'}`}
    style={{ width: `calc(var(--b) * ${size})`, height: `calc(var(--b) * ${size})`, fontSize: 'calc(var(--b) * 0.2)', touchAction: 'none', ...style }}
    role="button"
    aria-label={label}
  >
    {label}
  </div>
);
