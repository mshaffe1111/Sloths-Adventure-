import React from 'react';
import { createPortal } from 'react-dom';
import { Popup } from '../nav/Nav.tsx';

/**
 * A pop-up inside the satchel (a medal close up, a creature's story): the shared Popup (nav/Nav.tsx: the X, a tap outside and Android
 * Back all close it), put on document.body: the satchel's panel animates in with a transform, which would pin a fixed pop-up inside
 * its scroll.
 */
export const SatchelPopup: React.FC<{ title: React.ReactNode; label: string; onClose: () => void; className?: string; children: React.ReactNode }> = ({ title, label, onClose, className, children }) =>
  createPortal(
    <Popup title={title} label={label} onClose={onClose} className={className}>
      {children}
    </Popup>,
    document.body,
  );
