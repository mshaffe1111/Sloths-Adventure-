import React from 'react';
import { HowToPlay, journalNewCount } from './HowToPlay.tsx';
import { MenuTile } from './MenuFrame.tsx';

/** How to Play's tile on the in-game Settings card ("Journal" now means only the diary in the Satchel, 2026-10-30): it opens on top of
 * the card and closes back to it */
export const HowToTile: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [fresh, setFresh] = React.useState(() => journalNewCount());
  return (
    <>
      <MenuTile
        icon="howto"
        name="How to Play"
        line="Every move and control"
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
