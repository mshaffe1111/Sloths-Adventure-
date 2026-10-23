import React, { useRef, useEffect } from 'react';
import { InputEngine } from '../game/inputEngine.ts';
import { TouchGestures } from '../game/touchGestures.ts';
import { jumpHelp } from '../game/jumpHelp.ts';
import { recorder } from '../game/playRecorder.ts';

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

export const TouchController: React.FC<TouchControllerProps> = ({ inputEngine }) => {
  // the recogniser holds all the rules (see touchGestures.ts); this component only feeds it fingers
  const gestures = useRef<TouchGestures | null>(null);
  if (!gestures.current) {
    gestures.current = new TouchGestures(
      {
        // each decision also goes to the control-test recorder (it does nothing unless the test is running)
        move: (d) => { recorder.intent('move', d); inputEngine.triggerTouchMove(d); },
        duck: (on) => { recorder.intent('duck', on ? 1 : 0); inputEngine.triggerTouchDuck(on); },
        jumpPress: () => { recorder.intent('jump'); inputEngine.triggerTouchUp(); },
        jumpRelease: () => { recorder.intent('jumpUp'); inputEngine.releaseTouchUp(); },
        punch: () => { recorder.intent('punch'); inputEngine.triggerTouchPunch(); },
        kick: (dir) => { recorder.intent('kick', dir ?? 0); inputEngine.triggerTouchKick(dir ?? 0); },
        mega: () => { recorder.intent('mega'); inputEngine.triggerTouchMega(); },
        feedback: (kind) => {
          const haptic = { jump: 15, duck: 0, punch: 20, kick: 25, mega: 35 }[kind];
          if (haptic) inputEngine.triggerHaptic(haptic);
        },
      },
      () => window.innerWidth,
      // jump help (game/jumpHelp.ts): the recogniser asks whether it is on, and whether he is in the air with a second jump to spare
      { assist: () => jumpHelp() !== 'off', air: () => inputEngine.airJumpReady, megaReady: () => inputEngine.megaReady },
    );
  }
  const G = gestures.current;

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

  // the moment the touch really happened (the browser's own stamp), not the moment this code got to run: a janky frame used to make a
  // quick flick look slow. Falls back to the clock if the stamp is missing or from a different clock (some old browsers use the date).
  const stamp = (e: React.TouchEvent): number => {
    const now = performance.now();
    const ts = e.timeStamp;
    return ts > 0 && ts <= now + 5 && now - ts < 2000 ? ts : now;
  };

  const onStart = (e: React.TouchEvent) => {
    inputEngine.source = 'gesture';
    const now = stamp(e);
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      recorder.touch('d', t.identifier, t.clientX, t.clientY, now, Math.max((t as unknown as { radiusX?: number }).radiusX || 0, (t as unknown as { radiusY?: number }).radiusY || 0));
      G.down(t.identifier, t.clientX, t.clientY, now);
    }
  };
  const onMove = (e: React.TouchEvent) => {
    const now = stamp(e);
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      recorder.touch('m', t.identifier, t.clientX, t.clientY, now);
      G.move(t.identifier, t.clientX, t.clientY, now);
    }
  };
  // a cancelled touch (a system gesture took it) is not a lift: it must not punch, kick or jump
  const onCancel = (e: React.TouchEvent) => {
    const now = stamp(e);
    for (let i = 0; i < e.changedTouches.length; i++) {
      recorder.touch('c', e.changedTouches[i].identifier, 0, 0, now);
      G.cancelFinger(e.changedTouches[i].identifier, now);
    }
  };
  const onEnd = (e: React.TouchEvent) => {
    const now = stamp(e);
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      recorder.touch('u', t.identifier, t.clientX, t.clientY, now);
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
    </div>
  );
};
