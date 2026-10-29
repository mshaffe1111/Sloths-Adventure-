import React, { useEffect, useRef } from 'react';
import type { TouchGestures } from '../game/touchGestures.ts';
import { MARK, type MarkKind, type TouchMarks } from '../game/touchMarks.ts';
import { FONT_UI } from '../game/fonts.ts';

/**
 * Screen mode's marks under the fingers (touchMarks.ts, polish report CT-14), drawn on a canvas that never takes a touch:
 *  - a faint ring where the steering thumb is anchored, and a chevron beside it the way he runs;
 *  - a burst at the finger for every move it made, with the move's name, in the Pad buttons' colours.
 * It draws only while a finger is down or a mark is fading.
 */
const COLOUR: Record<MarkKind, string> = { jump: '#10b981', punch: '#f59e0b', kick: '#f43f5e', mega: '#a855f7', duck: '#38bdf8' };
const LABEL: Record<MarkKind, string> = { jump: 'Jump', punch: 'Punch', kick: 'Kick', mega: 'Mega!', duck: 'Duck' };
const RING = 30;

export const TouchFeedback: React.FC<{ gestures: TouchGestures; marks: TouchMarks }> = ({ gestures, marks }) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let raf = 0;
    let drawn = false;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const c = canvas.current;
      if (!c) return;
      const now = performance.now();
      const steer = gestures.steerMark();
      const live = marks.live(now);
      if (!steer && !live.length) {
        if (drawn) c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
        drawn = false;
        return;
      }
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = window.innerWidth, h = window.innerHeight;
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      const ctx = c.getContext('2d');
      if (!ctx) return;
      drawn = true;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (steer) {
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(steer.x, steer.y, RING, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (steer.dir) {
          // two chevrons just outside the ring, pointing the way he runs
          ctx.strokeStyle = 'rgba(255,255,255,0.75)';
          ctx.lineWidth = 4;
          for (const k of [0, 1]) {
            const x = steer.x + steer.dir * (RING + 10 + k * 11);
            ctx.globalAlpha = k ? 0.55 : 1;
            ctx.beginPath();
            ctx.moveTo(x - steer.dir * 6, steer.y - 9);
            ctx.lineTo(x + steer.dir * 3, steer.y);
            ctx.lineTo(x - steer.dir * 6, steer.y + 9);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
      }
      // (labels close together stack upward, newest on top, rather than overlap: a mega then a flick from one thumb)
      const placed: Array<{ x0: number; x1: number; y: number }> = [];
      for (const m of live) {
        const age = now - m.t;
        const col = COLOUR[m.kind];
        if (age < MARK.burstMs) {
          const u = age / MARK.burstMs;
          ctx.globalAlpha = 0.8 * (1 - u);
          ctx.strokeStyle = col;
          ctx.lineWidth = 5 - 3 * u;
          ctx.beginPath();
          ctx.arc(m.x, m.y, 16 + 26 * u, 0, Math.PI * 2);
          ctx.stroke();
        }
        // the name, above the finger so the thumb does not hide it, fading out
        const a = age < MARK.burstMs ? 1 : 1 - (age - MARK.burstMs) / (MARK.labelMs - MARK.burstMs);
        ctx.globalAlpha = Math.max(0, a);
        ctx.font = `900 15px ${FONT_UI}`;
        const text = LABEL[m.kind];
        const tw = ctx.measureText(text).width;
        const lx = Math.max(tw / 2 + 12, Math.min(w - tw / 2 - 12, m.x));
        let ly = Math.max(24, m.y - 58 - Math.min(age, 200) * 0.05);
        const x0 = lx - tw / 2 - 10, x1 = lx + tw / 2 + 10;
        for (let again = true; again; ) {
          again = false;
          for (const r of placed) {
            if (x0 < r.x1 && x1 > r.x0 && Math.abs(ly - r.y) < 28) {
              ly = r.y - 30;
              again = true;
            }
          }
        }
        placed.push({ x0, x1, y: ly });
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.roundRect(lx - tw / 2 - 10, ly - 13, tw + 20, 26, 13);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, lx, ly + 1);
        ctx.globalAlpha = 1;
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [gestures, marks]);

  return <canvas ref={canvas} className="fixed inset-0 pointer-events-none" style={{ width: '100%', height: '100%', zIndex: 31 }} aria-hidden="true" />;
};
