import React from 'react';
import { HowToPlay, journalNewCount } from './HowToPlay.tsx';
import { Icon } from './menuParts.tsx';

/** the journal's tile for the start and pause menus (How to Play is Pokey's Journal): it opens on top of the menu and closes back to it */
export const HowToTile: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [fresh, setFresh] = React.useState(() => journalNewCount());
  return (
    <>
      <button type="button" className="pm-tile" onClick={() => setOpen(true)}>
        <Icon color="#fde68a">
          <path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z" />
          <path d="M12 6v14" />
        </Icon>
        <span>
          <b>Pokey's Journal</b>
          <small>How to play: every move you have learned</small>
        </span>
        {fresh > 0 && <span className="jr-new jr-new-s pm-tile-badge">{fresh} NEW</span>}
      </button>
      {open && (
        <HowToPlay
          onClose={() => {
            setOpen(false);
            setFresh(journalNewCount());
          }}
        />
      )}
    </>
  );
};
