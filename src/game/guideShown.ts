/**
 * Which of the engine's lines Dot has really shown (audit C-03, 11-11). Her guide reports a line, in the engine's own words, once it has
 * been up its minimum time (dotSay.ts DotSay.keep: the DOT-1 rule a tip is heard by; RealPlay, with no bubble, at once), and the engine
 * reads the reports each frame (engine.ts takeShown). What the engine counts as given hangs off this report, never off the send: the
 * stuck helper's "told", World 5's hold while she says it, and the recorder's `dot` and `stuckHelp` moments. A line her setting dropped,
 * or one that waited in her queue until it was old news, was never given.
 */
let shown: string[] = [];
/** reports kept for an engine that is not reading them (a tool, a test, between stages): the oldest go first */
const KEEP = 32;
const NONE: readonly string[] = [];

/** Dot's guide: this engine line has been shown its minimum time */
export function guideShown(text: string): void {
  if (!text) return;
  shown.push(text);
  if (shown.length > KEEP) shown.shift();
}

/** the engine lines reported shown since the last call (the engine reads them each frame; a new engine drops the last stage's) */
export function takeGuideShown(): readonly string[] {
  if (!shown.length) return NONE;
  const s = shown;
  shown = [];
  return s;
}
