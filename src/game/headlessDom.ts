/**
 * headlessDom — just enough of a browser for the real engine to run in a test, with no screen (realPlay.ts). It must be imported before
 * engine.ts (the sound engine reaches for `window` the moment it loads), so realPlay.ts imports it first. Nothing here is used by the
 * game itself: in a browser every one of these already exists and is left alone.
 */
const g = globalThis as Record<string, unknown>;
const noop = () => {};

if (typeof g.window === 'undefined') {
  const store = new Map<string, string>();
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  };
  // a drawing surface that takes every call and draws nothing (only the update is run, never the render, but the constructor asks for one)
  const ctx: unknown = new Proxy(function () {}, {
    get: (_t, k) => (k === 'measureText' ? () => ({ width: 10 }) : ctx),
    apply: () => ctx,
    set: () => true,
  });
  const location = { search: '', href: 'http://localhost/', hash: '', pathname: '/' };
  g.localStorage ??= storage;
  g.location = location;
  g.window = {
    setTimeout, clearTimeout, setInterval, clearInterval,
    addEventListener: noop, removeEventListener: noop,
    location, devicePixelRatio: 1, innerWidth: 800, innerHeight: 450, localStorage: g.localStorage,
    matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop }),
  };
  g.document = {
    addEventListener: noop, removeEventListener: noop, hidden: false,
    documentElement: { dataset: {}, style: {} },
    createElement: () => ({ getContext: () => ctx, style: {} }),
  };
  g.requestAnimationFrame = () => 0;
  g.cancelAnimationFrame = noop;
  g.__headlessCtx = ctx;
}

export const headlessCanvas = () =>
  ({ getContext: () => g.__headlessCtx, getBoundingClientRect: () => ({ width: 800, height: 450 }), width: 800, height: 450, style: {} }) as unknown as HTMLCanvasElement;
