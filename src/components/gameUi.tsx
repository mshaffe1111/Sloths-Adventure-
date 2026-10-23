import React, { useEffect, useRef, useState } from 'react';
import { standardAtlas, warmStandardAtlas } from '../game/heroStandard.ts';
import { STD_FRAMES } from '../game/heroStandardData.ts';
import { drawJennifurSprite } from '../game/jennifurSprite.ts';
import { fullscreenSupported, isFullscreen, launchedAsApp, toggleFullscreen } from '../game/fullscreen.ts';

/**
 * The pieces of the game-look UI (approved 2026-10-23): the logo word, the red ribbon, the round wooden full-screen token, and
 * Pokey and Meeca standing together on the title. Their styles are in gameUi.css.
 */

/** the word SLOTHS: puffy letters packed close, each a little off true */
export const LogoWord: React.FC<{ className?: string }> = ({ className }) => (
  <h1 className={`gx2-word${className ? ` ${className}` : ''}`} aria-label="Sloths">
    {'SLOTHS'.split('').map((l, i) => (
      <span key={i} aria-hidden="true" style={{ transform: `translateY(${[4, -2, -5, -3, 1, 5][i]}px) rotate(${[-7, -3, 1, -2, 3, 7][i]}deg)` }}>
        {l}
      </span>
    ))}
  </h1>
);

/** a curved cloth ribbon with its ends folded back, a lit top edge and gold stitching, the text along its curve */
export const Ribbon: React.FC<{ text: string; id?: string; className?: string }> = ({ text, id = 'rb', className }) => (
  <svg className={`gx2-ribbon${className ? ` ${className}` : ''}`} viewBox="0 0 640 150" role="img" aria-label={text}>
    <defs>
      <linearGradient id={`${id}-band`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f0574a" />
        <stop offset=".5" stopColor="#d23a35" />
        <stop offset="1" stopColor="#a8252a" />
      </linearGradient>
      <linearGradient id={`${id}-tail`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#b22a2c" />
        <stop offset="1" stopColor="#7c1a1f" />
      </linearGradient>
      <path id={`${id}-arc`} d="M120 92 Q320 40 520 92" />
    </defs>
    <g stroke="#4a0d10" strokeWidth="4" strokeLinejoin="round">
      <path d="M176 70 L38 84 L70 116 L38 148 L176 134 Z" fill={`url(#${id}-tail)`} />
      <path d="M464 70 L602 84 L570 116 L602 148 L464 134 Z" fill={`url(#${id}-tail)`} />
      <path d="M148 96 L148 112 L176 134 L176 100 Z" fill="#5e1216" />
      <path d="M492 96 L492 112 L464 134 L464 100 Z" fill="#5e1216" />
      <path d="M148 40 Q320 -4 492 40 L492 112 Q320 68 148 112 Z" fill={`url(#${id}-band)`} />
    </g>
    <path d="M156 50 Q320 8 484 50" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="4" strokeLinecap="round" />
    <path d="M158 56 Q320 15 482 56" fill="none" stroke="#ffd36a" strokeWidth="2.2" strokeDasharray="7 6" strokeLinecap="round" />
    <path d="M158 100 Q320 59 482 100" fill="none" stroke="#ffd36a" strokeWidth="2.2" strokeDasharray="7 6" strokeLinecap="round" />
    <path d="M44 132 L66 120 M44 96 L64 108 M596 132 L574 120 M596 96 L576 108" stroke="rgba(255,210,150,.25)" strokeWidth="2" />
    <text className="gx2-ribbon-t">
      <textPath href={`#${id}-arc`} startOffset="50%" textAnchor="middle">
        {text}
      </textPath>
    </text>
  </svg>
);

/** the round wooden full-screen token for a corner: hidden where the browser cannot do full screen, or the game already runs as an app */
export const FullscreenButton: React.FC<{ className?: string }> = ({ className }) => {
  const [full, setFull] = useState(() => isFullscreen());
  useEffect(() => {
    const on = () => setFull(isFullscreen());
    document.addEventListener('fullscreenchange', on);
    document.addEventListener('webkitfullscreenchange', on);
    return () => {
      document.removeEventListener('fullscreenchange', on);
      document.removeEventListener('webkitfullscreenchange', on);
    };
  }, []);
  if (!fullscreenSupported() || launchedAsApp()) return null;
  return (
    <button
      type="button"
      data-fs-toggle="true"
      className={`gx-token${className ? ` ${className}` : ''}`}
      aria-pressed={full}
      aria-label={full ? 'Leave full screen' : 'Full screen'}
      title={full ? 'Leave full screen' : 'Full screen'}
      onClick={() => setFull(toggleFullscreen())}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {full ? <path d="M4 9h5V4M20 9h-5V4M4 15h5v5M20 15h-5v5" /> : <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />}
      </svg>
    </button>
  );
};

/** a mossy fallen log with its top at y, for the two of them to stand on (the title on an upright phone) */
function drawLog(c: CanvasRenderingContext2D, x0: number, x1: number, y: number, r: number) {
  const top = y - r * 0.25;
  c.save();
  c.shadowColor = 'rgba(0,0,0,.4)';
  c.shadowBlur = r * 0.8;
  c.shadowOffsetY = r * 0.4;
  const g = c.createLinearGradient(0, top, 0, top + r * 2);
  g.addColorStop(0, '#9b6a3c');
  g.addColorStop(0.45, '#7a4e28');
  g.addColorStop(1, '#4a2c14');
  c.fillStyle = g;
  c.strokeStyle = '#2a1608';
  c.lineWidth = Math.max(2, r * 0.09);
  c.beginPath();
  c.roundRect(x0, top, x1 - x0, r * 2, r);
  c.fill();
  c.stroke();
  c.restore();
  c.strokeStyle = 'rgba(42,22,8,.45)';
  c.lineWidth = Math.max(1.5, r * 0.06);
  c.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const x = x0 + r * 1.2 + ((x1 - x0 - r * 2.4) * i) / 8;
    c.beginPath();
    c.moveTo(x, top + r * 0.75);
    c.quadraticCurveTo(x + r * 0.6, top + r * 1.2, x + r * 0.2, top + r * 1.8);
    c.stroke();
  }
  c.fillStyle = '#d8b07a';
  c.strokeStyle = '#2a1608';
  c.lineWidth = Math.max(2, r * 0.09);
  c.beginPath();
  c.ellipse(x1 - r * 0.35, top + r, r * 0.55, r * 0.95, 0, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.strokeStyle = 'rgba(120,70,30,.6)';
  c.lineWidth = Math.max(1, r * 0.05);
  for (const k of [0.62, 0.36]) {
    c.beginPath();
    c.ellipse(x1 - r * 0.35, top + r, r * 0.55 * k, r * 0.95 * k, 0, 0, Math.PI * 2);
    c.stroke();
  }
  c.fillStyle = '#5fa83e';
  c.strokeStyle = '#2c5a1f';
  c.lineWidth = Math.max(1.5, r * 0.06);
  c.beginPath();
  c.moveTo(x0 + r * 0.4, top + r * 0.5);
  const n = 12;
  for (let i = 0; i <= n; i++) {
    const x = x0 + r * 0.4 + ((x1 - x0 - r * 1.3) * i) / n;
    c.quadraticCurveTo(x - r * 0.25, top - r * (0.28 + 0.12 * ((i * 7) % 3)), x, top + r * 0.12);
  }
  c.lineTo(x1 - r * 0.9, top + r * 0.55);
  c.quadraticCurveTo((x0 + x1) / 2, top + r * 0.9, x0 + r * 0.4, top + r * 0.5);
  c.closePath();
  c.fill();
  c.stroke();
  c.fillStyle = 'rgba(190,240,140,.45)';
  for (let i = 0; i < 8; i++) {
    const x = x0 + r + ((x1 - x0 - r * 2.5) * i) / 7;
    c.beginPath();
    c.ellipse(x, top - r * 0.05, r * 0.28, r * 0.08, 0, 0, Math.PI * 2);
    c.fill();
  }
}

/** Pokey's little performance while he waits: mostly standing, a blink now and then, once in a while a cheer */
const POKEY_STEPS: Array<[string, number]> = [['idle', 2.6], ['blink', 0.13], ['idle', 1.7], ['blink', 0.13], ['idle', 0.5], ['blink', 0.13], ['idle', 3.2], ['cheer_a', 0.9], ['idle', 1.2]];
const POKEY_LOOP = POKEY_STEPS.reduce((a, [, d]) => a + d, 0);
const pokeyAt = (t: number) => {
  let u = t % POKEY_LOOP;
  for (const [f, d] of POKEY_STEPS) {
    if (u < d) return f;
    u -= d;
  }
  return 'idle';
};

/**
 * Pokey and Meeca standing together on the title, breathing, blinking and looking about. Side by side in the box the layout keeps
 * clear for them (`stageSelector`); upright, on a mossy log. The canvas covers the screen and draws nothing else.
 */
export const TitlePair: React.FC<{ stageSelector: string }> = ({ stageSelector }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    warmStandardAtlas();
    let raf = 0;
    const t0 = performance.now();
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const cv = ref.current;
      if (!cv || document.hidden) return;
      const w = window.innerWidth, h = window.innerHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      const c = cv.getContext('2d');
      if (!c) return;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, w, h);
      const box = document.querySelector(stageSelector)?.getBoundingClientRect();
      if (!box || box.width < 40 || box.height < 40) return;
      const t = (performance.now() - t0) / 1000;
      const portrait = h > w;
      const H = portrait ? Math.min(box.height * 0.86, w * 0.48) : Math.min(box.height * 0.96, box.width * 0.5, h * 0.5);
      const cx = box.left + box.width / 2;
      const ground = portrait ? box.bottom - H * 0.3 : box.bottom - H * 0.04;
      const gap = H * 0.36;
      if (portrait) drawLog(c, cx - H * 0.95, cx + H * 0.95, ground, H * 0.13);
      for (const x of [cx - gap, cx + gap]) {
        const g = c.createRadialGradient(x, ground, 0, x, ground, H * 0.3);
        g.addColorStop(0, 'rgba(0,0,0,.45)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g;
        c.beginPath();
        c.ellipse(x, ground, H * 0.3, H * 0.06, 0, 0, Math.PI * 2);
        c.fill();
      }
      // Pokey, on the left, looking toward her; he breathes a little
      const atlas = standardAtlas();
      if (atlas) {
        const f = STD_FRAMES[pokeyAt(t)] ?? STD_FRAMES.idle;
        const k = H / 200;
        c.save();
        c.translate(cx - gap, ground);
        c.scale(k, k * (1 + Math.sin(t * 2.1) * 0.012));
        c.imageSmoothingEnabled = true;
        c.imageSmoothingQuality = 'high';
        c.drawImage(atlas, f.x, f.y, f.w, f.h, -f.ax, -f.ay, f.w, f.h);
        c.restore();
      }
      // Meeca, on the right, facing him (her idle has her own blinks, a head tilt and a look about)
      c.save();
      c.translate(cx + gap, ground);
      const s = (H * 0.97) / 90;
      c.scale(-s, s);
      drawJennifurSprite(c, 'idle', t + 1.3, 1, true);
      c.restore();
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [stageSelector]);
  return <canvas ref={ref} className="gx2-pair" aria-hidden="true" />;
};
