/**
 * How much help a touch player gets with the second jump, chosen in the menu and kept on the device. It only ever changes the Screen controls
 * (slide and flick; a tap is always a punch); the keyboard, a game pad and the on-screen Pad keep their own, exact feel. A first jump is never changed: lift the
 * thumb and Pokey stops in the air, a jump from standing goes straight up, so small platforms stay easy to land on.
 *   off:     how it used to be. The second jump needs a fast flick up.
 *   keep:    ("On") a short, slow slide up in the air is the second jump, and so is a short wiggle of the thumb that is still steering.
 *   forward: ("On + forward") all of "keep", and a second jump taken with nothing steering also pushes him forward, the way he faces,
 *            until he lands. Steering or pushing back takes over at once.
 */
export type JumpHelp = 'off' | 'keep' | 'forward';

export const DEFAULT_JUMP_HELP: JumpHelp = 'forward';

const KEY = 'sloth_jump_help';
let help: JumpHelp | null = null;
const listeners = new Set<() => void>();

function isHelp(v: unknown): v is JumpHelp {
  return v === 'off' || v === 'keep' || v === 'forward';
}

/** `?jumphelp=off|keep|forward` tries a setting for this visit without saving it (handy for comparing). Read once: the engine asks every frame. */
let urlHelp: JumpHelp | null | undefined;
function fromUrl(): JumpHelp | null {
  if (urlHelp !== undefined) return urlHelp;
  try {
    const q = new URLSearchParams(window.location.search).get('jumphelp');
    urlHelp = isHelp(q) ? q : null;
  } catch {
    urlHelp = null;
  }
  return urlHelp;
}

export function jumpHelp(): JumpHelp {
  const q = fromUrl();
  if (q) return q;
  if (help === null) {
    let v: string | null = null;
    try {
      v = localStorage.getItem(KEY);
    } catch {
      /* storage blocked: the default */
    }
    help = isHelp(v) ? v : DEFAULT_JUMP_HELP;
  }
  return help;
}

export function setJumpHelp(v: JumpHelp) {
  help = v;
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* storage blocked: the choice lasts for this visit only */
  }
  listeners.forEach((l) => l());
}

export function subscribeJumpHelp(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
