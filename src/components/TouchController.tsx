import React, { useRef, useState, useEffect, useCallback } from 'react';
import { InputEngine } from '../game/inputEngine.ts';
import { TouchGestures } from '../game/touchGestures.ts';

/**
 * The whole screen is the controller. There are no buttons.
 *
 *  A slow slide steers from anywhere; a quick flick is a kick or a jump; a tap punches; a hold is a mega.
 *  The rules (and the forgiveness) live in game/touchGestures.ts.
 *
 * Both thumbs work at once, so you can run with one and jump or punch with the other.
 */

interface TouchControllerProps {
  inputEngine: InputEngine;
}

const HINT_KEY = 'sloth_hint_v3';
function hintSeen(): boolean {
  try {
    return localStorage.getItem(HINT_KEY) === '1';
  } catch {
    return false;
  }
}
function markHintSeen() {
  try {
    localStorage.setItem(HINT_KEY, '1');
  } catch {
    /* ignore */
  }
}

export const TouchController: React.FC<TouchControllerProps> = ({ inputEngine }) => {
  const [pill, setPill] = useState<string | null>(null);
  const pillTimer = useRef<number | null>(null);
  const [hint, setHint] = useState<boolean>(() => !hintSeen());

  const flash = useCallback((text: string) => {
    setPill(text);
    if (pillTimer.current !== null) window.clearTimeout(pillTimer.current);
    pillTimer.current = window.setTimeout(() => setPill(null), 380);
  }, []);

  // the recogniser holds all the rules (see touchGestures.ts); this component only feeds it fingers
  const gestures = useRef<TouchGestures | null>(null);
  if (!gestures.current) {
    gestures.current = new TouchGestures(
      {
        move: (d) => inputEngine.triggerTouchMove(d),
        duck: (on) => inputEngine.triggerTouchDuck(on),
        jumpPress: () => inputEngine.triggerTouchUp(),
        jumpRelease: () => inputEngine.releaseTouchUp(),
        punch: () => inputEngine.triggerTouchPunch(),
        kick: (dir) => inputEngine.triggerTouchKick(dir ?? 0),
        mega: () => inputEngine.triggerTouchMega(),
        feedback: (kind) => {
          const haptic = { jump: 15, duck: 0, punch: 20, kick: 25, mega: 35 }[kind];
          if (haptic) inputEngine.triggerHaptic(haptic);
          flash({ jump: 'JUMP!', duck: 'DUCK', punch: 'PUNCH!', kick: 'KICK!', mega: 'MEGA!' }[kind]);
        },
      },
      () => window.innerWidth,
    );
  }
  const G = gestures.current;

  // the hint fades by itself, and is never shown again once it has been up
  useEffect(() => {
    if (!hint) return;
    markHintSeen();
    const id = window.setTimeout(() => {
      setHint(false);
      markHintSeen();
    }, 7000);
    return () => window.clearTimeout(id);
  }, [hint]);

  // holds and undecided fingers need a clock even when the finger is perfectly still
  useEffect(() => {
    const id = window.setInterval(() => {
      if (G.active) G.tick(performance.now());
    }, 30);
    return () => window.clearInterval(id);
  }, [G]);

  // If the pad unmounts mid-touch (level cleared, pause), release everything so nothing stays held into the next stage.
  useEffect(
    () => () => {
      G.cancelAll();
    },
    [G],
  );

  // switching away mid-touch: the recogniser forgets its fingers too
  useEffect(() => {
    inputEngine.onFocusLost = () => G.cancelAll();
    return () => {
      inputEngine.onFocusLost = null;
    };
  }, [G, inputEngine]);

  // safety net: when every finger is up, nothing may stay held
  useEffect(() => {
    const onEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) G.cancelAll();
    };
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    return () => {
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [G]);

  const onStart = (e: React.TouchEvent) => {
    if (hint) {
      setHint(false);
      markHintSeen();
    }
    const now = performance.now();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      G.down(t.identifier, t.clientX, t.clientY, now);
    }
  };
  const onMove = (e: React.TouchEvent) => {
    const now = performance.now();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      G.move(t.identifier, t.clientX, t.clientY, now);
    }
  };
  // a cancelled touch (a system gesture took it) is not a lift: it must not punch, kick or jump
  const onCancel = (e: React.TouchEvent) => {
    const now = performance.now();
    for (let i = 0; i < e.changedTouches.length; i++) G.cancelFinger(e.changedTouches[i].identifier, now);
  };
  const onEnd = (e: React.TouchEvent) => {
    const now = performance.now();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      G.up(t.identifier, t.clientX, t.clientY, now);
    }
  };

  return (
    <div
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
      onTouchCancel={onCancel}
      className="fixed inset-0 pointer-events-auto z-30 select-none touch-none"
      style={{ touchAction: 'none', WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
    >
      {/* what the last gesture was */}
      {pill && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 pointer-events-none z-40 bg-emerald-950/85 border border-amber-400/80 px-3.5 py-1 rounded-full text-amber-300 font-black text-[11px] uppercase tracking-wider shadow-xl">
          {pill}
        </div>
      )}

      {/* shown once, so nobody has to guess that there are no buttons */}
      {hint && (
        <div className="fixed inset-x-0 bottom-0 h-[24%] min-h-[96px] pointer-events-none flex items-stretch gap-3 px-4 pb-4 animate-[fadeIn_.4s_ease]">
          <HintCard title="STEER" lines={['Slide a thumb ← → to run', 'Slide ↓ to duck, ↑ to jump']} />
          <HintCard title="ACT" lines={['Tap to punch', 'Quick flick ← → to kick', 'Quick flick ↑ to jump', 'Hold for mega']} />
        </div>
      )}
    </div>
  );
};

const HintCard: React.FC<{ title: string; lines: string[] }> = ({ title, lines }) => (
  <div className="flex-1 min-w-0 rounded-2xl border-2 border-dashed border-white/35 bg-black/35 flex flex-col items-center justify-center text-center px-2 py-2">
    <div className="text-[10px] font-black tracking-[0.2em] text-amber-300 mb-1">{title}</div>
    {lines.map((l) => (
      <div key={l} className="text-[12px] font-bold leading-snug text-white [text-shadow:0_1px_2px_rgba(0,0,0,.8)]">
        {l}
      </div>
    ))}
  </div>
);
