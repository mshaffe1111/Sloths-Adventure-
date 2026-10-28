/**
 * The opening splash (index.html draws it before any script runs). The title tells it how far along it is and when everything it needs
 * has arrived, so the title appears in one piece: the fonts, the first world's painting and both sloths, all at once (Matt, 2026-10-28:
 * "make the opening screen look polished"). Any other first screen (a test link straight into a stage) just lets it go.
 */
type BootApi = { set: (p: number) => void; done: () => void; t0?: number };

function api(): BootApi | null {
  return typeof window !== 'undefined' ? ((window as unknown as { __boot?: BootApi }).__boot ?? null) : null;
}

/** grow the splash's vine: 0..1 of what the title is waiting for */
export function bootProgress(p: number) {
  api()?.set(p);
}

let finished = false;
/** fade the splash away (once) */
export function bootDone() {
  if (finished) return;
  finished = true;
  api()?.done();
}

/** true while the splash is still up (the title holds its entrance until it has gone) */
export function bootShowing(): boolean {
  return !finished && !!api() && !!document.getElementById('boot');
}

/** the faces the title is set in: it waits for these, so its words never show in a stand-in font first */
const FACES = ["400 20px 'Cherry Bomb One'", "800 20px 'Baloo 2'", "700 16px 'Outfit'", "500 16px 'Outfit'"];

/** resolves once the title's fonts are in (or after `ms`, so a font that never comes cannot hold the game) */
export function fontsReady(ms = 6000): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts?.load) return Promise.resolve();
  const all = Promise.all(FACES.map((f) => document.fonts.load(f).catch(() => []))).then(() => undefined);
  return Promise.race([all, new Promise<void>((r) => setTimeout(r, ms))]);
}

/**
 * Waits for a list of things, reporting progress as each arrives. `checks` are polled (an atlas loader that only says ready or not),
 * `promises` are awaited. Resolves when all are in, or after `ms` whatever is missing.
 */
export function waitForAll(opts: { checks: Array<() => boolean>; promises: Promise<unknown>[]; ms: number; onProgress: (p: number) => void }): Promise<void> {
  const { checks, promises, ms, onProgress } = opts;
  const total = checks.length + promises.length;
  let settled = 0;
  return new Promise<void>((resolve) => {
    let over = false;
    const finish = () => {
      if (over) return;
      over = true;
      window.clearInterval(poll);
      window.clearTimeout(limit);
      onProgress(1);
      resolve();
    };
    const report = () => {
      const ok = checks.filter((c) => c()).length + settled;
      onProgress(total ? ok / total : 1);
      if (ok >= total) finish();
    };
    for (const p of promises)
      p.then(
        () => {
          settled++;
          report();
        },
        () => {
          settled++;
          report();
        },
      );
    const poll = window.setInterval(report, 120);
    const limit = window.setTimeout(finish, ms);
    report();
  });
}
