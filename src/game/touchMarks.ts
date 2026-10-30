/**
 * What Screen mode shows under the fingers (polish report CT-14): Screen mode drew nothing, and its only feedback was a buzz, which iPhones
 * never give a web page. Now a faint ring sits where the steering thumb is anchored, with a chevron the way he runs, and every move
 * the touch made flashes at the finger for a moment with its name (Jump, Punch, Kick, Mega, Duck). TouchFeedback.tsx draws it.
 *
 * "Show touches" is kept on the device: Auto (on for World 1, where the controls are new), On, or Off (the default).
 */
export type ShowTouches = 'auto' | 'on' | 'off';
export type MarkKind = 'jump' | 'duck' | 'punch' | 'kick' | 'mega';

const KEY = 'sloth_show_touches';
let pref: ShowTouches | null = null;
const listeners = new Set<() => void>();

export function showTouches(): ShowTouches {
  if (pref === null) {
    let v: string | null = null;
    try {
      v = localStorage.getItem(KEY);
    } catch {
      /* storage blocked */
    }
    // off unless the player picks Auto or On (Matt, 2026-10-30: the special options start off)
    pref = v === 'on' || v === 'auto' ? v : 'off';
  }
  return pref;
}
export function setShowTouches(v: ShowTouches) {
  pref = v;
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* storage blocked: the choice lasts for this visit only */
  }
  listeners.forEach((l) => l());
}
export function subscribeShowTouches(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
/** are the marks shown in a stage of this world */
export function touchMarksOn(world: number, v: ShowTouches = showTouches()): boolean {
  return v === 'on' || (v === 'auto' && world <= 1);
}

/** how long a mark lasts: the burst, then its label fades (ms) */
export const MARK = { burstMs: 150, labelMs: 450 };

export interface Mark {
  kind: MarkKind;
  x: number;
  y: number;
  t: number;
}

/** the marks flashing now, oldest first */
export class TouchMarks {
  private marks: Mark[] = [];

  add(kind: MarkKind, x: number, y: number, t: number) {
    this.marks.push({ kind, x, y, t });
  }

  /** a punch taken back (a jab the finger outran: CT-17) shows nothing */
  takeBack(kind: MarkKind) {
    for (let i = this.marks.length - 1; i >= 0; i--) {
      if (this.marks[i].kind === kind) {
        this.marks.splice(i, 1);
        return;
      }
    }
  }

  live(t: number): Mark[] {
    this.marks = this.marks.filter((m) => t - m.t < MARK.labelMs);
    return this.marks;
  }

  clear() {
    this.marks = [];
  }
}
