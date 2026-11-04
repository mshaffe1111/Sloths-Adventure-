/**
 * Runs first, before any module reads the game from storage (main.tsx imports it before App): a change of explorer that was cut off
 * part way (the phone died, the app was swiped away) is finished here, so the game below always reads one whole explorer (saveSlots.ts).
 */
import { browserStore } from './saveFile.ts';
import { recoverSlots } from './saveSlots.ts';

try {
  recoverSlots(browserStore());
} catch {
  /* storage blocked: there is nothing to finish */
}
