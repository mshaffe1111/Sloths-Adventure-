import React, { useRef, useState, useEffect, useCallback } from 'react';
import { InputEngine } from '../game/inputEngine.ts';

interface TouchControllerProps {
  inputEngine: InputEngine;
}

export const TouchController: React.FC<TouchControllerProps> = ({ inputEngine }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Active touch tracking
  const activeTouchIdRef = useRef<number | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const hasTriggeredUpInSwipeRef = useRef<boolean>(false);
  const lastTouchTapTimeRef = useRef<number>(0);
  const lastUpTapTimeRef = useRef<number>(0);
  const tapTimeoutRef = useRef<number | null>(null);

  const [activeGesture, setActiveGesture] = useState<string | null>(null);
  const [touchIndicator, setTouchIndicator] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  const clearGesture = useCallback(() => {
    setActiveGesture(null);
    setTouchIndicator({ x: 0, y: 0, visible: false });
    inputEngine.triggerTouchMove('none');
    inputEngine.triggerTouchDuck(false);
    inputEngine.releaseTouchUp();
    hasTriggeredUpInSwipeRef.current = false;
  }, [inputEngine]);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only capture first touch for fullscreen gesture pad
    if (activeTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    activeTouchIdRef.current = touch.identifier;

    const now = performance.now();
    touchStartPosRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now,
    };
    hasTriggeredUpInSwipeRef.current = false;

    setTouchIndicator({
      x: touch.clientX,
      y: touch.clientY,
      visible: true,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPosRef.current) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchIdRef.current) {
        const dx = touch.clientX - touchStartPosRef.current.x;
        const dy = touch.clientY - touchStartPosRef.current.y;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        setTouchIndicator({
          x: touch.clientX,
          y: touch.clientY,
          visible: true,
        });

        // 1. Horizontal Slide: Slide finger right to move right, slide left to move left
        const horizontalThreshold = 14;
        if (absX > horizontalThreshold && absX >= absY * 0.7) {
          if (dx > 0) {
            inputEngine.triggerTouchMove('right');
            inputEngine.triggerTouchDuck(false);
            setActiveGesture('SLIDE RIGHT');
          } else {
            inputEngine.triggerTouchMove('left');
            inputEngine.triggerTouchDuck(false);
            setActiveGesture('SLIDE LEFT');
          }
        } else if (absX <= 10) {
          inputEngine.triggerTouchMove('none');
        }

        // 2. Vertical Slide: Slide Up (Jump / Double Jump) or Down (Duck)
        const verticalThreshold = 18;
        if (absY > verticalThreshold) {
          if (dy < 0) {
            // Slide up -> Jump!
            if (!hasTriggeredUpInSwipeRef.current) {
              hasTriggeredUpInSwipeRef.current = true;
              const now = performance.now();
              const isDouble = now - lastUpTapTimeRef.current < 420;
              lastUpTapTimeRef.current = now;

              inputEngine.triggerTouchUp();
              setActiveGesture(isDouble ? 'DOUBLE JUMP!' : 'JUMP!');
            }
          } else {
            // Slide down -> Duck!
            inputEngine.triggerTouchDuck(true);
            setActiveGesture('DUCK');
          }
        }
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchIdRef.current) {
        activeTouchIdRef.current = null;
        const now = performance.now();

        if (touchStartPosRef.current) {
          const dx = touch.clientX - touchStartPosRef.current.x;
          const dy = touch.clientY - touchStartPosRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const duration = now - touchStartPosRef.current.time;

          // If movement was minimal (< 22px) and quick (< 300ms), it's a TAP or DOUBLE TAP!
          if (dist < 22 && duration < 320) {
            const timeSinceLastTap = now - lastTouchTapTimeRef.current;

            if (timeSinceLastTap > 40 && timeSinceLastTap < 340) {
              // DOUBLE TAP -> KICK!
              if (tapTimeoutRef.current) {
                clearTimeout(tapTimeoutRef.current);
                tapTimeoutRef.current = null;
              }
              lastTouchTapTimeRef.current = 0; // reset
              inputEngine.triggerTouchKick();
              setActiveGesture('DOUBLE TAP: KICK!');
              setTimeout(() => setActiveGesture(null), 300);
            } else {
              // SINGLE TAP -> PUNCH!
              lastTouchTapTimeRef.current = now;
              tapTimeoutRef.current = window.setTimeout(() => {
                inputEngine.triggerTouchPunch();
                setActiveGesture('TAP: PUNCH!');
                setTimeout(() => setActiveGesture(null), 250);
              }, 170);
            }
          }
        }

        touchStartPosRef.current = null;
        clearGesture();
        break;
      }
    }
  };

  // Direct Button Handlers for Up / Jump / Double Jump, Down / Duck, Punch, Kick
  const handleUpPress = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    inputEngine.triggerHaptic(15);
    const now = performance.now();
    const isUpTwice = now - lastUpTapTimeRef.current < 420;
    lastUpTapTimeRef.current = now;

    inputEngine.triggerTouchUp();
    setActiveGesture(isUpTwice ? 'DOUBLE JUMP!' : 'JUMP!');
    setTimeout(() => setActiveGesture(null), 300);
  };

  const handleDownPress = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    inputEngine.triggerHaptic(12);
    inputEngine.triggerTouchDuck(true);
    setActiveGesture('DUCK');
  };

  const handleDownRelease = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    inputEngine.triggerTouchDuck(false);
    setActiveGesture(null);
  };

  const handlePunchPress = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    inputEngine.triggerHaptic(20);
    inputEngine.triggerTouchPunch();
    setActiveGesture('TAP: PUNCH!');
    setTimeout(() => setActiveGesture(null), 250);
  };

  const handleKickPress = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    inputEngine.triggerHaptic(25);
    inputEngine.triggerTouchKick();
    setActiveGesture('DOUBLE TAP: KICK!');
    setTimeout(() => setActiveGesture(null), 300);
  };

  useEffect(() => {
    const handleReset = () => clearGesture();
    window.addEventListener('touchend', handleReset);
    window.addEventListener('touchcancel', handleReset);
    return () => {
      window.removeEventListener('touchend', handleReset);
      window.removeEventListener('touchcancel', handleReset);
    };
  }, [clearGesture]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="fixed inset-0 pointer-events-auto z-30 select-none touch-none"
      style={{ touchAction: 'none' }}
    >
      {/* Floating Gesture Ripple Indicator */}
      {touchIndicator.visible && (
        <div
          className="fixed pointer-events-none w-16 h-16 rounded-full border-2 border-emerald-400/70 bg-emerald-500/20 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{ left: `${touchIndicator.x}px`, top: `${touchIndicator.y}px` }}
        />
      )}

      {/* Center Gesture Feedback Pill */}
      {activeGesture && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 pointer-events-none z-40 bg-emerald-950/90 border border-amber-400/90 px-4 py-1.5 rounded-full text-amber-300 font-black text-xs uppercase tracking-wider shadow-xl animate-bounce">
          {activeGesture}
        </div>
      )}

      {/* Bottom Controls Cluster (Tactile touch buttons tailored for mobile) */}
      <div className="absolute bottom-4 inset-x-4 flex items-end justify-between pointer-events-none">
        {/* Left Side: Slide direction pad (Slide Left / Slide Right / Duck) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Slide Left */}
          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              inputEngine.triggerTouchMove('left');
              setActiveGesture('SLIDE LEFT');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              inputEngine.triggerTouchMove('none');
              setActiveGesture(null);
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              inputEngine.triggerTouchMove('none');
              setActiveGesture(null);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              inputEngine.triggerTouchMove('left');
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              inputEngine.triggerTouchMove('none');
            }}
            className="w-14 h-14 rounded-2xl bg-emerald-950/80 active:bg-emerald-700/90 border-2 border-emerald-400/60 shadow-xl flex flex-col items-center justify-center text-emerald-200 active:scale-95 transition-transform"
            aria-label="Slide Left"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="text-[8px] font-black tracking-wider text-emerald-300">LEFT</span>
          </button>

          {/* Slide Right */}
          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              inputEngine.triggerTouchMove('right');
              setActiveGesture('SLIDE RIGHT');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              inputEngine.triggerTouchMove('none');
              setActiveGesture(null);
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              inputEngine.triggerTouchMove('none');
              setActiveGesture(null);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              inputEngine.triggerTouchMove('right');
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              inputEngine.triggerTouchMove('none');
            }}
            className="w-14 h-14 rounded-2xl bg-emerald-950/80 active:bg-emerald-700/90 border-2 border-emerald-400/60 shadow-xl flex flex-col items-center justify-center text-emerald-200 active:scale-95 transition-transform"
            aria-label="Slide Right"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="text-[8px] font-black tracking-wider text-emerald-300">RIGHT</span>
          </button>

          {/* Press Down to Duck */}
          <button
            type="button"
            onTouchStart={handleDownPress}
            onTouchEnd={handleDownRelease}
            onTouchCancel={handleDownRelease}
            onMouseDown={handleDownPress}
            onMouseUp={handleDownRelease}
            className="w-14 h-14 rounded-2xl bg-emerald-950/80 active:bg-amber-700/90 border-2 border-amber-400/60 shadow-xl flex flex-col items-center justify-center text-amber-200 active:scale-95 transition-transform"
            aria-label="Press Down Duck"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="6 9 12 15 18 9" />
            </svg>
            <span className="text-[8px] font-black tracking-wider text-amber-300">DUCK</span>
          </button>
        </div>

        {/* Right Side: Jump (press up / double jump), Punch (tap), Kick (double tap) */}
        <div className="pointer-events-auto flex items-end gap-2.5">
          {/* Tap to Punch */}
          <button
            type="button"
            onTouchStart={handlePunchPress}
            onMouseDown={handlePunchPress}
            className="w-16 h-16 rounded-full bg-amber-600/90 active:bg-amber-500 border-2 border-amber-300 shadow-xl flex flex-col items-center justify-center text-white active:scale-90 transition-transform"
            aria-label="Tap to Punch"
          >
            <svg className="w-7 h-7 text-amber-100" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4c1 4 0 9-3 13 4-2 6-7 5-13zm5 0c1 4 0 10-3 14 4-2 6-8 5-14zm5 0c1 4 0 10-3 14 4-2 6-8 5-14z"/>
            </svg>
            <span className="text-[8px] font-black tracking-wider text-amber-200">PUNCH</span>
          </button>

          {/* Double Tap to Kick */}
          <button
            type="button"
            onTouchStart={handleKickPress}
            onMouseDown={handleKickPress}
            className="w-16 h-16 rounded-full bg-orange-600/90 active:bg-orange-500 border-2 border-orange-300 shadow-xl flex flex-col items-center justify-center text-white active:scale-90 transition-transform"
            aria-label="Double Tap to Kick"
          >
            <svg className="w-7 h-7 text-orange-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 17l6-6 4 4 6-8" />
              <circle cx="20" cy="7" r="2" fill="currentColor" />
            </svg>
            <span className="text-[8px] font-black tracking-wider text-orange-200">KICK</span>
          </button>

          {/* Press Up to Jump / Double Jump (Press Up Twice!) */}
          <button
            type="button"
            onTouchStart={handleUpPress}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              inputEngine.releaseTouchUp();
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              inputEngine.releaseTouchUp();
            }}
            onMouseDown={handleUpPress}
            onMouseUp={(e) => {
              e.stopPropagation();
              inputEngine.releaseTouchUp();
            }}
            className="w-18 h-18 rounded-full bg-emerald-600/95 active:bg-emerald-500 border-2 border-emerald-200 shadow-2xl flex flex-col items-center justify-center text-white active:scale-90 transition-transform"
            aria-label="Jump (Press Up Twice for Double Jump)"
          >
            <svg className="w-8 h-8 text-emerald-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
            <span className="text-[9px] font-black tracking-widest text-emerald-100">UP: JUMP 2x</span>
          </button>
        </div>
      </div>

      {/* Subtle On-screen touch gesture instructions at top */}
      <div className="absolute top-16 inset-x-0 flex justify-center pointer-events-none">
        <div className="bg-black/75 border border-emerald-400/40 px-3.5 py-1 rounded-full text-[10px] text-emerald-200 font-sans tracking-wide shadow-lg">
          Slide L/R Move · Press Up Jump (2x Double Jump) · Down Duck · Tap Punch · Double Tap Kick
        </div>
      </div>
    </div>
  );
};
