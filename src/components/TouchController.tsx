import React, { useRef, useState, useEffect, useCallback } from 'react';
import { InputEngine } from '../game/inputEngine.ts';
import { TiltSensor, setControlMode } from '../game/controls.ts';
import type { ControlMode } from '../game/controls.ts';

/**
 * The whole screen is the controller. There are no buttons.
 *
 *  gestures   LEFT half  (floating stick)  drag left/right = run, drag down = duck, drag up = jump
 *             RIGHT half (action pad)      tap = punch, flick up = jump, flick down = duck,
 *                                          flick sideways = kick, hold = mega
 *  tilt       lean the phone to run; the whole screen is the action pad
 *
 * Both thumbs work at once, so you can run with one and jump or punch with the other.
 */

interface TouchControllerProps {
  inputEngine: InputEngine;
  mode: ControlMode;
}

type Role = 'move' | 'action';

interface Track {
  role: Role;
  startX: number;
  startY: number;
  anchorX: number;
  time: number;
  /** a flick, hold or mega already happened, so lifting the finger must not also punch */
  consumed: boolean;
  jumped: boolean;
  ducked: boolean;
  holdTimer: number | null;
}

const MOVE_DEAD = 14; // px of drag before the hero starts running
const MOVE_REANCHOR = 64; // the stick follows the finger past this, so turning around is quick
const FLICK = 28; // px for a flick
const KICK_FLICK = 36;
const TAP_MAX_MS = 280;
const TAP_MAX_PX = 20;
const HOLD_MS = 380;

const HINT_KEY = 'sloth_hint_v2';
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

export const TouchController: React.FC<TouchControllerProps> = ({ inputEngine, mode }) => {
  const tracks = useRef(new Map<number, Track>());
  const [pill, setPill] = useState<string | null>(null);
  const pillTimer = useRef<number | null>(null);
  const [hint, setHint] = useState<boolean>(() => !hintSeen());
  const [tiltNote, setTiltNote] = useState<string | null>(null);

  const flash = useCallback((text: string) => {
    setPill(text);
    if (pillTimer.current !== null) window.clearTimeout(pillTimer.current);
    pillTimer.current = window.setTimeout(() => setPill(null), 380);
  }, []);

  const releaseAll = useCallback(() => {
    tracks.current.forEach((t) => {
      if (t.holdTimer !== null) window.clearTimeout(t.holdTimer);
    });
    tracks.current.clear();
    inputEngine.triggerTouchMove('none');
    inputEngine.triggerTouchDuck(false);
    inputEngine.releaseTouchUp();
  }, [inputEngine]);

  // ---- tilt sensor (only in tilt mode)
  useEffect(() => {
    if (mode !== 'tilt') return;
    const sensor = new TiltSensor(
      (d) => inputEngine.triggerTouchMove(d),
      () => {
        setControlMode('gestures');
        setTiltNote('No tilt sensor found on this device, so gestures are back on.');
        window.setTimeout(() => setTiltNote(null), 4000);
      },
    );
    sensor.start();
    return () => {
      sensor.stop();
      inputEngine.triggerTouchMove('none');
    };
  }, [mode, inputEngine]);

  // the hint fades by itself
  useEffect(() => {
    if (!hint) return;
    const id = window.setTimeout(() => {
      setHint(false);
      markHintSeen();
    }, 7000);
    return () => window.clearTimeout(id);
  }, [hint]);

  // If the pad unmounts mid-touch (level cleared, pause), release everything so nothing stays held into the next stage.
  useEffect(
    () => () => {
      tracks.current.forEach((t) => {
        if (t.holdTimer !== null) window.clearTimeout(t.holdTimer);
      });
      tracks.current.clear();
      inputEngine.triggerTouchMove('none');
      inputEngine.triggerTouchDuck(false);
      inputEngine.releaseTouchUp();
    },
    [inputEngine],
  );

  // safety net: when every finger is up, nothing may stay held
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
  }, [releaseAll]);

  const hasRole = (role: Role) => {
    for (const t of tracks.current.values()) if (t.role === role) return true;
    return false;
  };

  const onStart = (e: React.TouchEvent) => {
    if (hint) {
      setHint(false);
      markHintSeen();
    }
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const role: Role = mode === 'gestures' && touch.clientX < window.innerWidth / 2 ? 'move' : 'action';
      if (hasRole(role)) continue;
      const tr: Track = {
        role,
        startX: touch.clientX,
        startY: touch.clientY,
        anchorX: touch.clientX,
        time: performance.now(),
        consumed: false,
        jumped: false,
        ducked: false,
        holdTimer: null,
      };
      if (role === 'action') {
        const id = touch.identifier;
        tr.holdTimer = window.setTimeout(() => {
          const t = tracks.current.get(id);
          if (!t || t.consumed) return;
          t.consumed = true;
          t.holdTimer = null;
          inputEngine.triggerHaptic(35);
          inputEngine.triggerTouchMega();
          flash('MEGA!');
        }, HOLD_MS);
      }
      tracks.current.set(touch.identifier, tr);
    }
  };

  const onMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const t = tracks.current.get(touch.identifier);
      if (!t) continue;
      if (t.role === 'move') {
        let dx = touch.clientX - t.anchorX;
        if (dx > MOVE_REANCHOR) {
          t.anchorX = touch.clientX - MOVE_REANCHOR;
          dx = MOVE_REANCHOR;
        } else if (dx < -MOVE_REANCHOR) {
          t.anchorX = touch.clientX + MOVE_REANCHOR;
          dx = -MOVE_REANCHOR;
        }
        inputEngine.triggerTouchMove(dx > MOVE_DEAD ? 'right' : dx < -MOVE_DEAD ? 'left' : 'none');

        const dy = touch.clientY - t.startY;
        inputEngine.triggerTouchDuck(dy > 30);
        if (dy < -30 && !t.jumped) {
          t.jumped = true;
          inputEngine.triggerHaptic(15);
          inputEngine.triggerTouchUp();
          flash('JUMP!');
        } else if (dy > -12 && t.jumped) {
          t.jumped = false;
          inputEngine.releaseTouchUp();
        }
        continue;
      }

      // action pad
      const dx = touch.clientX - t.startX;
      const dy = touch.clientY - t.startY;
      if (t.holdTimer !== null && Math.hypot(dx, dy) > 14) {
        window.clearTimeout(t.holdTimer);
        t.holdTimer = null;
      }
      if (t.consumed) continue;
      if (dy < -FLICK && Math.abs(dy) > Math.abs(dx) * 0.8) {
        t.consumed = true;
        t.jumped = true;
        inputEngine.triggerHaptic(15);
        inputEngine.triggerTouchUp();
        flash('JUMP!');
      } else if (dy > FLICK && Math.abs(dy) > Math.abs(dx)) {
        t.consumed = true;
        t.ducked = true;
        inputEngine.triggerTouchDuck(true);
        flash('DUCK');
      } else if (Math.abs(dx) > KICK_FLICK && Math.abs(dx) > Math.abs(dy)) {
        t.consumed = true;
        inputEngine.triggerHaptic(25);
        inputEngine.triggerTouchKick();
        flash('KICK!');
      }
    }
  };

  const finish = (touch: React.Touch) => {
    const t = tracks.current.get(touch.identifier);
    if (!t) return;
    if (t.holdTimer !== null) window.clearTimeout(t.holdTimer);
    tracks.current.delete(touch.identifier);

    if (t.role === 'move') {
      inputEngine.triggerTouchMove('none');
      inputEngine.triggerTouchDuck(false);
      if (t.jumped) inputEngine.releaseTouchUp();
      return;
    }
    if (t.jumped) inputEngine.releaseTouchUp();
    if (t.ducked) inputEngine.triggerTouchDuck(false);
    if (!t.consumed) {
      const dist = Math.hypot(touch.clientX - t.startX, touch.clientY - t.startY);
      if (dist < TAP_MAX_PX && performance.now() - t.time < TAP_MAX_MS) {
        inputEngine.triggerHaptic(20);
        inputEngine.triggerTouchPunch();
        flash('PUNCH!');
      }
    }
  };

  const onEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) finish(e.changedTouches[i]);
  };

  return (
    <div
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
      onTouchCancel={onEnd}
      className="fixed inset-0 pointer-events-auto z-30 select-none touch-none"
      style={{ touchAction: 'none', WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
      data-controls={mode}
    >
      {/* what the last gesture was */}
      {pill && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 pointer-events-none z-40 bg-emerald-950/85 border border-amber-400/80 px-3.5 py-1 rounded-full text-amber-300 font-black text-[11px] uppercase tracking-wider shadow-xl">
          {pill}
        </div>
      )}

      {tiltNote && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-40 bg-black/80 border border-amber-400/60 px-4 py-2 rounded-xl text-amber-200 text-xs font-bold max-w-[80vw] text-center">
          {tiltNote}
        </div>
      )}

      {/* shown once, so nobody has to guess that there are no buttons */}
      {hint && (
        <div className="fixed inset-x-0 bottom-0 h-[24%] min-h-[96px] pointer-events-none flex items-stretch gap-3 px-4 pb-4 animate-[fadeIn_.4s_ease]">
          {mode === 'gestures' ? (
            <>
              <HintCard title="LEFT THUMB" lines={['Drag ← → to run', 'Drag ↓ to duck', 'Drag ↑ to jump']} />
              <HintCard title="RIGHT THUMB" lines={['Tap to punch', 'Flick ↑ to jump', 'Flick ← → to kick', 'Hold for mega']} />
            </>
          ) : (
            <>
              <HintCard title="TILT" lines={['Lean the phone to run', 'Hold it how you like;', 'it re-centres each stage']} />
              <HintCard title="TAP ANYWHERE" lines={['Tap to punch', 'Flick ↑ jump · ↓ duck', 'Flick ← → to kick', 'Hold for mega']} />
            </>
          )}
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
