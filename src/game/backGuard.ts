/**
 * backGuard — a back swipe from the screen's edge must not leave the game (polish report CT-6). In landscape the left thumb rests at the
 * edge, and on Android a run started there is the system's back gesture: the touch was cancelled and the browser went back, off the
 * game. Safari's edge swipe does the same when there is page history.
 *
 * While a stage is on, one history entry of our own sits on top. A back swipe only takes that entry off: the game hears it (popstate),
 * pauses, and puts the entry back, so the next back swipe is caught too. The entry is pushed once (not one per stage), and it keeps the
 * page's address as it is.
 */
interface HistoryLike {
  state: unknown;
  pushState(data: unknown, unused: string): void;
}
interface WindowLike {
  addEventListener(type: 'popstate', fn: () => void): void;
  removeEventListener(type: 'popstate', fn: () => void): void;
}

const MARK = 'slothStage';

/** our entry is on top of the history */
const ours = (h: HistoryLike) => !!h.state && typeof h.state === 'object' && (h.state as Record<string, unknown>)[MARK] === 1;

/**
 * guard the back gesture while a stage is on: `onBack` runs when one is caught. Returns the function that stops guarding (the entry
 * stays: a later stage reuses it, and at the title a back swipe takes it off quietly).
 */
export function guardBack(onBack: () => void, h: HistoryLike = history, w: WindowLike = window): () => void {
  const arm = () => {
    try {
      if (!ours(h)) h.pushState({ [MARK]: 1 }, '');
    } catch {
      /* a sandboxed frame may refuse: then there is nothing to guard with */
    }
  };
  const onPop = () => {
    onBack();
    arm();
  };
  arm();
  w.addEventListener('popstate', onPop);
  return () => w.removeEventListener('popstate', onPop);
}
