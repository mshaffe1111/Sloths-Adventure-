/**
 * The one Back for every screen and pop-up (menus-nav, Matt 2026-10-31: "a consistency with how you exit menus").
 *
 * Whatever is on top owns Back. A screen's Back button and an open pop-up each put a handler on this stack while they are shown
 * (useBack, nav/Nav.tsx); Android's Back button, a back swipe and the Escape key all call handleBack(), which runs only the newest
 * handler, so Back closes the top pop-up first, then leaves the screen under it. When nothing is on the stack, App.tsx falls back
 * to its own per-screen rule (play pauses, the title asks before leaving).
 */
export type BackHandler = () => void;

export interface BackStack {
  /** put a handler on top; the function returned takes it off again (safe to call twice) */
  push(fn: BackHandler): () => void;
  /** run the top handler; false when the stack is empty */
  handle(): boolean;
  size(): number;
}

export function createBackStack(): BackStack {
  const items: { fn: BackHandler }[] = [];
  return {
    push(fn) {
      const item = { fn };
      items.push(item);
      return () => {
        const i = items.indexOf(item);
        if (i >= 0) items.splice(i, 1);
      };
    },
    handle() {
      const top = items[items.length - 1];
      if (!top) return false;
      top.fn();
      return true;
    },
    size: () => items.length,
  };
}

/** the game's own stack */
export const backStack = createBackStack();
export const handleBack = (): boolean => backStack.handle();
