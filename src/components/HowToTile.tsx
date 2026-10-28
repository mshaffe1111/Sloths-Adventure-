import React from 'react';
import { HowToPlay, journalNewCount } from './HowToPlay.tsx';
import { MenuTile } from './MenuFrame.tsx';

/** the journal's tile for the start and pause menus (How to Play is Pokey's Journal): it opens on top of the menu and closes back to it */
export const HowToTile: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [fresh, setFresh] = React.useState(() => journalNewCount());
  return (
    <>
      <MenuTile
        icon="book"
        name="Pokey's Journal"
        line="Every move you have learned"
        onClick={() => setOpen(true)}
        badge={fresh > 0 ? <span className="jr-new jr-new-s pm-tile-badge">{fresh} NEW</span> : undefined}
      />
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
