import React, { useEffect, useState } from 'react';
import { Icon } from './icons/index.tsx';
import { fullscreenSupported, isFullscreen, launchedAsApp, toggleFullscreen } from '../game/fullscreen.ts';

/**
 * The pieces of the game-look UI (approved 2026-10-23): the logo word, the red ribbon and the round wooden full-screen token. Their
 * styles are in gameUi.css. (Pokey and Meeca on the title are drawn by the title scene, title/TitleScene.tsx.)
 */

/** the word SLOTHS: puffy letters packed close, each a little off true (the title drops them in one by one: --i, --y, --r) */
export const LogoWord: React.FC<{ className?: string }> = ({ className }) => (
  <h1 className={`gx2-word${className ? ` ${className}` : ''}`} aria-label="Sloths">
    {'SLOTHS'.split('').map((l, i) => (
      <span key={i} aria-hidden="true" style={{ ['--i' as string]: i, ['--y' as string]: `${[4, -2, -5, -3, 1, 5][i]}px`, ['--r' as string]: `${[-7, -3, 1, -2, 3, 7][i]}deg` }}>
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
      <Icon name={full ? 'shrink' : 'expand'} size={20} />
    </button>
  );
};
