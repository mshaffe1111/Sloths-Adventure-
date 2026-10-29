import React, { useEffect, useState } from 'react';
import { Icon } from './icons/index.tsx';
import { fullscreenSupported, isFullscreen, launchedAsApp, toggleFullscreen } from '../game/fullscreen.ts';

/**
 * The round wooden full-screen token (its style is in index.css, .gx-token). The title's carved name is title/CarvedLogo.tsx, and Pokey and Meeca
 * on the title are drawn by the title scene, title/TitleScene.tsx.
 */

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
