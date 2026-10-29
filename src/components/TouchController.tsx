import React, { useRef, useEffect } from 'react';
import { InputEngine } from '../game/inputEngine.ts';
import { TouchGestures, applyTouchSensitivity } from '../game/touchGestures.ts';
import { steerHand, subscribeControls, touchSensitivity } from '../game/controlPrefs.ts';
import { jumpHelp } from '../game/jumpHelp.ts';
import { recorder } from '../game/playRecorder.ts';
import { refinedControls } from '../game/refinedControls.ts';
import { CircleTrace } from '../game/circleTrace.ts';
import { TouchMarks, touchMarksOn, showTouches, subscribeShowTouches } from '../game/touchMarks.ts';
import { TouchFeedback } from './TouchFeedback.tsx';

/**
 * The whole screen is the controller. There are no buttons.
 *
 *  A slow slide steers from anywhere; a quick flick is a kick or a jump; a tap punches (or jumps, with nothing close: touchGestures.ts); a hold is a mega.
 *  In Meeca's stage, standing at a trunk, a finger tracing a circle carves (circleTrace.ts): only there, so it never fights the rest.
 *  The rules (and the forgiveness) live in game/touchGestures.ts.
 *
 * Both thumbs work at once, so you can run with one and jump or punch with the other.
 */


interface TouchControllerProps {
  inputEngine: InputEngine;
  /** the world being played: "Show touches" on Auto shows the marks in World 1 (touchMarks.ts) */
  world: number;
}

export const TouchController: React.FC<TouchControllerProps> = ({ inputEngine, world }) => {
  // the marks under the fingers (CT-14)
  const marks = useRef(new TouchMarks());
  const [show, setShow] = React.useState(() => showTouches());
  useEffect(() => subscribeShowTouches(() => setShow(showTouches())), []);
  // the recogniser holds all the rules (see touchGestures.ts); this component only feeds it fingers
  const gestures = useRef<TouchGestures | null>(null);
  if (!gestures.current) {
    gestures.current = new TouchGestures(
      {
        // each decision also goes to the control-test recorder (it does nothing unless the test is running)
        move: (d) => { recorder.intent('move', d); inputEngine.triggerTouchMove(d); },
        duck: (on) => { recorder.intent('duck', on ? 1 : 0); inputEngine.triggerTouchDuck(on); },
        jumpPress: (lean) => { recorder.intent('jump'); inputEngine.triggerTouchUp(lean ?? 0); },
        jumpRelease: () => { recorder.intent('jumpUp'); inputEngine.releaseTouchUp(); },
        punch: (hold) => { recorder.intent('punch'); inputEngine.triggerTouchPunch(hold); },
        punchCancel: () => { recorder.intent('punchCancel'); inputEngine.triggerTouchPunchCancel(); marks.current.takeBack('punch'); },
        kick: (dir) => { recorder.intent('kick', dir ?? 0); inputEngine.triggerTouchKick(dir ?? 0); },
        mega: () => { recorder.intent('mega'); inputEngine.triggerTouchMega(); },
        climb: (d) => { recorder.intent('climb', d); inputEngine.triggerTouchClimb(d); },
        feedback: (kind, x, y) => {
          if (x !== undefined && y !== undefined) marks.current.add(kind, x, y, performance.now());
          const haptic = { jump: 15, duck: 0, punch: 20, kick: 25, mega: 35 }[kind];
          if (haptic) inputEngine.triggerHaptic(haptic);
        },
      },
      () => window.innerWidth,
      // jump help (game/jumpHelp.ts): the recogniser asks whether it is on, and whether he is in the air with a second jump to spare
      { steerHand, assist: () => jumpHelp() !== 'off', air: () => inputEngine.airJumpReady, megaReady: () => inputEngine.megaReady, refined: refinedControls, kickNear: () => inputEngine.kickNear, onVine: () => inputEngine.onVine, onSwing: () => inputEngine.onSwing, onRope: () => inputEngine.onRope, inCover: () => inputEngine.inCover },
    );
  }
  const G = gestures.current;
  // the sensitivity chosen in the menu scales the recogniser's distances (CT-28)
  useEffect(() => {
    applyTouchSensitivity(touchSensitivity());
    return subscribeControls(() => applyTouchSensitivity(touchSensitivity()));
  }, []);
  // a finger tracing a circle at a carving spot (Meeca's stage): once it is a circle it is the carving's, not the slide's
  const trace = useRef(new CircleTrace());

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
    // the game dropped every held input (a new stage): forget the fingers too, or a thumb still on the glass would think it was steering
    // while nothing moved, and the next slide the same way did nothing (the recogniser only speaks when its direction changes)
    inputEngine.onCleared = () => G.cancelAll();
    return () => {
      inputEngine.onFocusLost = null;
      inputEngine.onCleared = null;
    };
  }, [G, inputEngine]);

  // safety net: when every finger is up, nothing may stay held
  useEffect(() => {
    const onEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        G.cancelAll();
        trace.current.clear();
      }
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
    // (a finger whose lift was never reported is let go: it must not hold the steering, CT-16)
    G.keepOnly(Array.from(e.touches, (t) => t.identifier), now);
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      recorder.touch('d', t.identifier, t.clientX, t.clientY, now, Math.max((t as unknown as { radiusX?: number }).radiusX || 0, (t as unknown as { radiusY?: number }).radiusY || 0));
      G.down(t.identifier, t.clientX, t.clientY, now);
      trace.current.down(t.identifier, t.clientX, t.clientY);
    }
  };
  const onMove = (e: React.TouchEvent) => {
    const now = stamp(e);
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      recorder.touch('m', t.identifier, t.clientX, t.clientY, now);
      if (inputEngine.carveSpot) {
        const was = trace.current.circling(t.identifier);
        const rad = trace.current.move(t.identifier, t.clientX, t.clientY);
        // (the moment it becomes a circle, the slide it started as lets go: no walk, no jump, no kick when it lifts)
        if (!was && trace.current.circling(t.identifier)) G.cancelFinger(t.identifier, now);
        if (rad > 0) inputEngine.addCircle(rad);
        if (trace.current.circling(t.identifier)) continue;
      }
      G.move(t.identifier, t.clientX, t.clientY, now);
    }
  };
  // a cancelled touch (a system gesture took it) is not a lift: it must not punch, kick or jump
  const onCancel = (e: React.TouchEvent) => {
    const now = stamp(e);
    for (let i = 0; i < e.changedTouches.length; i++) {
      recorder.touch('c', e.changedTouches[i].identifier, 0, 0, now);
      G.cancelFinger(e.changedTouches[i].identifier, now);
      trace.current.up(e.changedTouches[i].identifier);
    }
  };
  const onEnd = (e: React.TouchEvent) => {
    const now = stamp(e);
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      recorder.touch('u', t.identifier, t.clientX, t.clientY, now);
      if (!trace.current.circling(t.identifier)) G.up(t.identifier, t.clientX, t.clientY, now);
      trace.current.up(t.identifier);
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
      {touchMarksOn(world, show) && <TouchFeedback gestures={G} marks={marks.current} />}
    </div>
  );
};
