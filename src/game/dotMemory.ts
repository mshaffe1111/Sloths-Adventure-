/**
 * Dot's memory on this phone: the stage tips she has said (tipMemory.ts), the lessons (lessons.ts), the things she has taught and the
 * moves done (dotGuideHelp.ts). A New Game clears it (saveFile.ts resetProgress), and so does "Hear Dot's tips again" in the menu, so
 * a new adventure, or a player who turned tips back on, is taught again (polish report DOT-1).
 */
import { forgetSent } from './tipMemory.ts';

export const DOT_MEMORY = /^sloth_(tips_.+|lessons|dot_seen|dot_moves)$/;

/** forget what this session has sent but not yet shown */
export function forgetDotSession(): void {
  forgetSent();
}

/** "Hear Dot's tips again": forget every tip, lesson and thing she has taught on this phone */
export function hearTipsAgain(store: Pick<Storage, 'removeItem' | 'key' | 'length'> | null = typeof localStorage === 'undefined' ? null : localStorage): void {
  try {
    if (store) {
      const keys: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        if (k && DOT_MEMORY.test(k)) keys.push(k);
      }
      for (const k of keys) store.removeItem(k);
    }
  } catch {
    /* no storage */
  }
  forgetSent();
}
