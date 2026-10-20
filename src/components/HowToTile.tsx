import React from 'react';
import { HowToPlay } from './HowToPlay.tsx';
import { Icon } from './menuParts.tsx';

/** the "How to Play" tile for the start and pause menus: it opens the guide on top of the menu and closes back to it */
export const HowToTile: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button type="button" className="pm-tile" onClick={() => setOpen(true)}>
        <Icon color="#fde68a">
          <circle cx="12" cy="12" r="9" />
          <path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.2c-.8.5-1.2 1-1.2 1.9" />
          <path d="M12 17h.01" />
        </Icon>
        <span>
          <b>How to Play</b>
          <small>Controls, saving, tips</small>
        </span>
      </button>
      {open && <HowToPlay onClose={() => setOpen(false)} />}
    </>
  );
};
