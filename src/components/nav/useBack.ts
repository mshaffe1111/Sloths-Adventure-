import React from 'react';
import { backStack } from './backStack.ts';

/**
 * while `enabled`, Android's Back (and Escape) runs `onBack`; the newest caller wins. Its own file (no stylesheet) so a card that
 * owns its Back can be loaded by the unit tests; Nav.tsx passes it on.
 */
export function useBack(onBack: () => void, enabled = true): void {
  const ref = React.useRef(onBack);
  ref.current = onBack;
  React.useEffect(() => (enabled ? backStack.push(() => ref.current()) : undefined), [enabled]);
}
