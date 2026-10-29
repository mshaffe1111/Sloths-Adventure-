import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { InputEngine } from '../game/inputEngine.ts';
import { PAD, PadInput, followAnchor, clampKnob, pickButton, BUTTON_REACH, type PadButtonSpot } from '../game/padControl.ts';
import type { PadSide } from '../game/controlPrefs.ts';
import { Icon } from './icons/index.tsx';

/**
 * The drawn controller. A floating thumb pad fills one half of the screen (it appears wherever the thumb lands), and
 * Jump, Punch and Kick buttons sit in the other half, arranged around where that thumb rests. `side` is where the pad
 * is; the buttons take the other side, so left-handers just flip it in the menu.
 *
 *   pad:   slide sideways to run, down to duck, up to jump (hold up to climb a trunk or grab a rope)
 *   Jump:  press to jump, hold for height, press again in the air for a double jump
 *   Punch: press to punch, hold on to upgrade it to a mega punch
 *   Kick:  tap to kick the way he faces
 */
interface Props {
  inputEngine: InputEngine;
  side: PadSide;
}

type Btn = 'jump' | 'punch' | 'kick';

export const PadController: React.FC<Props> = ({ inputEngine, side }) => {
  // the pad under the thumb: shown or not is React state, but where it and its knob are moves through refs and a CSS transform, so a
  // touchmove re-renders nothing (it re-rendered the whole controller on every move: polish report CT-25)
  const [shown, setShown] = useState(false);
  const geo = useRef({ ax: 0, ay: 0, kx: 0, ky: 0 });
  const ringRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLDivElement | null>(null);
  const place = () => {
    const g = geo.current;
    if (ringRef.current) ringRef.current.style.transform = `translate3d(${g.ax - PAD.radius - 14}px, ${g.ay - PAD.radius - 14}px, 0)`;
    if (knobRef.current) knobRef.current.style.transform = `translate3d(${g.ax + g.kx - 26}px, ${g.ay + g.ky - 26}px, 0)`;
  };
  useLayoutEffect(() => {
    if (shown) place();
  }, [shown]);
  const [down, setDown] = useState<Set<Btn>>(new Set());

  const st = useRef({
    padId: -1,
    ax: 0,
    ay: 0,
  });
  // what the pad and the Jump button mean (padControl.ts PadInput)
  const drive = useRef<PadInput | null>(null);
  if (!drive.current) drive.current = new PadInput(inputEngine);
  const P = drive.current;

  const padRelease = () => {
    st.current.padId = -1;
    P.padUp();
    setShown(false);
  };

  const releaseAll = () => {
    fingerBtn.current.clear();
    P.punchButton(false);
    padRelease();
    P.jumpButton(false);
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
    geo.current = { ax: s.ax, ay: s.ay, kx: 0, ky: 0 };
    setShown(true);
  };
  const padMove = (e: React.TouchEvent) => {
    const s = st.current;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier !== s.padId) continue;
      s.ax = followAnchor(s.ax, t.clientX);
      const dx = t.clientX - s.ax;
      const dy = t.clientY - s.ay;
      P.pad(dx, dy);
      const k = clampKnob(dx, dy);
      geo.current = { ax: s.ax, ay: s.ay, kx: k.x, ky: k.y };
      place();
    }
  };
  const padEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === st.current.padId) padRelease();
  };

  // ---- the buttons ----
  // one touch area covers the buttons' half of the screen, and each finger presses the button nearest it (pickButton): a touch that
  // missed a button by a few px did nothing (polish report CT-18). The buttons themselves are only drawn.
  const btnEls = useRef<Partial<Record<Btn, HTMLDivElement | null>>>({});
  const fingerBtn = useRef(new Map<number, Btn>());
  const press = (b: Btn) => {
    mark(b, true);
    if (b === 'jump') P.jumpButton(true);
    else if (b === 'kick') {
      inputEngine.triggerTouchKick(0);
      inputEngine.triggerHaptic(25);
    } else P.punchButton(true);
  };
  const letGo = (b: Btn) => {
    // (two fingers on one button: it is let go when the last one lifts)
    if ([...fingerBtn.current.values()].includes(b)) return;
    mark(b, false);
    if (b === 'jump') P.jumpButton(false);
    else if (b === 'punch') P.punchButton(false);
  };
  const btnsStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const spots: PadButtonSpot<Btn>[] = [];
    for (const [b, el] of Object.entries(btnEls.current) as Array<[Btn, HTMLDivElement | null]>) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      spots.push({ b, cx: r.left + r.width / 2, cy: r.top + r.height / 2, r: r.width / 2 });
    }
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const b = pickButton(t.clientX, t.clientY, spots);
      if (!b) continue;
      const again = [...fingerBtn.current.values()].includes(b);
      fingerBtn.current.set(t.identifier, b);
      if (!again) press(b);
    }
  };
  const btnsEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const id = e.changedTouches[i].identifier;
      const b = fingerBtn.current.get(id);
      if (!b) continue;
      fingerBtn.current.delete(id);
      letGo(b);
    }
  };

  const hit = { onTouchStart: btnsStart, onTouchEnd: btnsEnd, onTouchCancel: btnsEnd };

  // the pad is on `side`; the buttons are on the other one, mirrored so the cluster always opens toward the thumb
  const btnSide: PadSide = side === 'right' ? 'left' : 'right';
  const edge = (v: string) => ({ [btnSide]: v }) as React.CSSProperties;
  const pos = (rx: string, by: string): React.CSSProperties => ({ ...edge(`calc(${rx} + max(10px, env(safe-area-inset-${btnSide})))`), bottom: `calc(${by} + max(10px, env(safe-area-inset-bottom)))` });

  return (
    <div
      className="fixed inset-0 z-30 pointer-events-none select-none touch-none"
      style={{ ['--b' as string]: 'clamp(54px, 15vh, 80px)' }}
      onTouchStartCapture={() => {
        inputEngine.source = 'pad';
      }}
    >
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
          style={{ width: PAD.radius * 2 + 28, height: PAD.radius * 2 + 28, opacity: shown ? 0 : 1 }}
        >
          <span className="inline-flex items-center gap-3" aria-hidden="true">
            <Icon name="arrow" size={18} rotate={180} />
            <Icon name="arrow" size={18} />
          </span>
        </div>
      </div>
      {shown && (
        <>
          <div ref={ringRef} className="fixed left-0 top-0 rounded-full border-[3px] border-white/55 bg-white/15 pointer-events-none" style={{ width: PAD.radius * 2 + 28, height: PAD.radius * 2 + 28, willChange: 'transform' }} />
          <div ref={knobRef} className="fixed left-0 top-0 rounded-full bg-white/80 shadow-lg pointer-events-none" style={{ width: 52, height: 52, willChange: 'transform' }} />
        </>
      )}

      {/* the buttons' half of the screen: any touch there presses the nearest button */}
      <div
        className="absolute top-[16%] bottom-0 w-1/2 pointer-events-auto"
        style={{ [btnSide]: 0, touchAction: 'none', WebkitTouchCallout: 'none' }}
        onTouchStart={btnsStart}
        onTouchEnd={btnsEnd}
        onTouchCancel={btnsEnd}
      />
      {/* Jump sits nearest the thumb's rest; Punch beside it, Kick above */}
      <Button label="Kick" className="from-rose-400 to-rose-600 border-rose-200/80" down={down.has('kick')} size="1" style={pos('calc(var(--b) * 0.45)', 'calc(var(--b) * 1.45)')} el={(d) => (btnEls.current.kick = d)} {...hit} />
      <Button label="Punch" className="from-amber-300 to-amber-500 border-amber-100/80" down={down.has('punch')} size="1" style={pos('calc(var(--b) * 1.55)', 'calc(var(--b) * 0.7)')} el={(d) => (btnEls.current.punch = d)} {...hit} />
      <Button label="Jump" className="from-emerald-400 to-emerald-600 border-emerald-100/80" down={down.has('jump')} size="1.2" style={pos('calc(var(--b) * 0.1)', '0px')} el={(d) => (btnEls.current.jump = d)} {...hit} />
    </div>
  );
};

const Button: React.FC<{
  label: string;
  className: string;
  down: boolean;
  size: string;
  style: React.CSSProperties;
  el: (d: HTMLDivElement | null) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onTouchCancel: (e: React.TouchEvent) => void;
}> = ({ label, className, down, size, style, el, ...h }) => (
  <div
    ref={el}
    className={`absolute pointer-events-none grid place-items-center rounded-full border-[3px] bg-gradient-to-b font-black uppercase tracking-wide text-white shadow-[0_5px_0_rgba(0,0,0,.35)] transition-transform duration-75 [text-shadow:0_1px_2px_rgba(0,0,0,.6)] ${className} ${down ? 'scale-90 brightness-125 shadow-none' : 'opacity-80'}`}
    style={{ width: `calc(var(--b) * ${size})`, height: `calc(var(--b) * ${size})`, fontSize: 'calc(var(--b) * 0.2)', touchAction: 'none', ...style }}
    role="button"
    aria-label={label}
  >
    {label}
    {/* its reach: an invisible ring BUTTON_REACH times its size, which answers touches even past the middle of the screen (CT-18) */}
    <div className="absolute rounded-full pointer-events-auto" style={{ inset: `${(-(BUTTON_REACH - 1) / 2) * 100}%`, touchAction: 'none' }} {...h} />
  </div>
);
