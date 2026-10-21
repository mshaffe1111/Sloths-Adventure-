/**
 * lessons — the first time each new thing shows up, the game stops and explains it, once.
 *
 * A lesson is a card with Pokey's face, a title, and a few "do this, get that" lines for the way this player is controlling the game (touch
 * screen, thumb pad, or keyboard). The engine spots the first foe, the first climbable trunk, the first swinging vine and so on ahead of the hero
 * (`pickLesson`), pauses, and the app shows the card (components/LessonCard.tsx). What has been shown is kept on the device, in the save, so a
 * New Game teaches it all again. `?lessons=off` skips them, `?lessons=all` shows every one again (for trying them out).
 */
import { controlStyle } from './controlPrefs.ts';
import type { GlyphKind } from '../components/GestureGlyph.tsx';

export type LessonId =
  | 'foe' | 'nostomp' | 'eagle' | 'tough'
  | 'gap' | 'climb' | 'swing' | 'bounce' | 'crumble' | 'moving' | 'water'
  | 'fruit' | 'heart' | 'cage' | 'idol' | 'power' | 'checkpoint' | 'shrine';

export type InputMode = 'screen' | 'pad' | 'keys';

export interface LessonLine {
  /** a thumb picture, on a touch screen */
  glyph?: GlyphKind;
  how: string;
  what: string;
  sub?: string;
}
export interface Lesson {
  id: LessonId;
  title: string;
  /** which of Pokey's faces fits the news */
  face: 'face_surprised' | 'face_cheer' | 'face_happy' | 'face_calm' | 'face_wink';
  /** one or two sentences, the same for every kind of controls */
  intro: string;
  lines: Record<InputMode, LessonLine[]>;
}

const same = (l: LessonLine[]): Record<InputMode, LessonLine[]> => ({ screen: l, pad: l, keys: l });

export const LESSONS: Record<LessonId, Lesson> = {
  foe: {
    id: 'foe',
    title: 'A foe ahead!',
    face: 'face_surprised',
    intro: 'Touching it costs a heart. Hit it first, or land on its head.',
    lines: {
      screen: [
        { glyph: 'tap', how: 'Tap', what: 'Punch', sub: 'a quick tap, anywhere on the screen' },
        { glyph: 'flick', how: 'Quick flick ← →', what: 'Kick', sub: 'it kicks the way you flick' },
        { glyph: 'hold', how: 'Press and hold', what: 'Mega punch', sub: 'slower, but it hits hard' },
        { glyph: 'up', how: 'Jump on its head', what: 'Stomp', sub: 'most foes can be stomped' },
      ],
      pad: [
        { how: 'Punch button', what: 'Punch', sub: 'tap it, or hold it for a mega punch' },
        { how: 'Kick button', what: 'Kick' },
        { how: 'Jump on its head', what: 'Stomp', sub: 'most foes can be stomped' },
      ],
      keys: [
        { how: 'J or Z', what: 'Punch' },
        { how: 'K or X', what: 'Kick' },
        { how: 'L or Shift', what: 'Mega punch', sub: 'slower, but it hits hard' },
        { how: 'Jump on its head', what: 'Stomp', sub: 'most foes can be stomped' },
      ],
    },
  },
  nostomp: {
    id: 'nostomp',
    title: 'Not this one!',
    face: 'face_surprised',
    intro: 'Spiders and ants cannot be stomped, so do not land on them. Punch or kick them, or jump right over.',
    lines: same([{ how: 'Punch or kick', what: 'Beat it', sub: 'one hit does it' }]),
  },
  eagle: {
    id: 'eagle',
    title: 'Swooping bird!',
    face: 'face_surprised',
    intro: 'It circles, then dives at you. Dodge the dive, then hit it when it comes in low.',
    lines: {
      screen: [
        { glyph: 'down', how: 'Slide down', what: 'Duck', sub: 'a low duck can slip under a dive' },
        { glyph: 'up', how: 'Flick up', what: 'Jump', sub: 'or hop over it' },
      ],
      pad: [{ how: 'Pad ↓', what: 'Duck', sub: 'a low duck can slip under a dive' }, { how: 'Jump', what: 'Hop over it' }],
      keys: [{ how: 'S or ↓', what: 'Duck', sub: 'a low duck can slip under a dive' }, { how: 'Space', what: 'Hop over it' }],
    },
  },
  tough: {
    id: 'tough',
    title: 'A big one!',
    face: 'face_surprised',
    intro: 'Big animals take several hits and are hard to shove. Watch for it rearing back: that is when it strikes, so step away, then hit it as it recovers.',
    lines: same([{ how: 'Keep at it', what: 'It takes a few hits', sub: 'a mega punch hits hardest, and landing on a caiman only bounces you off' }]),
  },
  gap: {
    id: 'gap',
    title: 'A gap ahead!',
    face: 'face_surprised',
    intro: 'Falling into water or a pit costs a life. Run up and jump a little before the edge, not at it.',
    lines: {
      screen: [
        { glyph: 'jump', how: 'Slide up and across', what: 'Run and jump', sub: 'keep your thumb moving forward in the air' },
        { glyph: 'up', how: 'Flick up again in the air', what: 'Double jump', sub: 'for a gap that is a little too wide' },
      ],
      pad: [{ how: 'Pad → then Jump', what: 'Run and jump' }, { how: 'Jump again in the air', what: 'Double jump', sub: 'for a gap that is a little too wide' }],
      keys: [{ how: 'D or → then Space', what: 'Run and jump' }, { how: 'Space again in the air', what: 'Double jump', sub: 'for a gap that is a little too wide' }],
    },
  },
  climb: {
    id: 'climb',
    title: 'A tree to climb!',
    face: 'face_cheer',
    intro: 'Pokey can scale a trunk with a vine on it. Grab on, climb to the top, and he vaults onto the branch.',
    lines: {
      screen: [
        { glyph: 'up', how: 'Jump into the trunk', what: 'Grab on', sub: 'a flick up beside it, then keep your thumb up' },
        { glyph: 'up', how: 'Hold your thumb up', what: 'Climb' },
        { glyph: 'down', how: 'Slide down', what: 'Come back down' },
        { glyph: 'jump', how: 'Flick up while climbing', what: 'Leap off', sub: 'a big jump away from the trunk' },
      ],
      pad: [
        { how: 'Jump, then hold Pad ↑', what: 'Grab on and climb' },
        { how: 'Pad ↓', what: 'Come back down' },
        { how: 'Jump', what: 'Leap off', sub: 'a big jump away from the trunk' },
      ],
      keys: [
        { how: 'Jump into it, hold W or ↑', what: 'Grab on and climb' },
        { how: 'S or ↓', what: 'Come back down' },
        { how: 'Space', what: 'Leap off', sub: 'a big jump away from the trunk' },
      ],
    },
  },
  swing: {
    id: 'swing',
    title: 'A swinging vine!',
    face: 'face_cheer',
    intro: 'Grab the vine, swing out over the gap, and let go to leap across.',
    lines: {
      screen: [
        { glyph: 'up', how: 'Jump into the vine', what: 'Grab on' },
        { glyph: 'run', how: 'Slide left and right', what: 'Swing harder' },
        { glyph: 'up', how: 'Flick up', what: 'Let go and leap', sub: 'let go while you are swinging forward' },
      ],
      pad: [{ how: 'Jump into the vine', what: 'Grab on' }, { how: 'Pad ← →', what: 'Swing harder' }, { how: 'Jump', what: 'Let go and leap' }],
      keys: [{ how: 'Jump into the vine', what: 'Grab on' }, { how: 'A D or ← →', what: 'Swing harder' }, { how: 'Space', what: 'Let go and leap' }],
    },
  },
  bounce: {
    id: 'bounce',
    title: 'A bouncy mushroom!',
    face: 'face_happy',
    intro: 'Land on it and it springs you much higher than any jump. Good for reaching the high ledges.',
    lines: same([{ how: 'Land on it', what: 'Boing!', sub: 'steer in the air to aim your landing' }]),
  },
  crumble: {
    id: 'crumble',
    title: 'A crumbling branch!',
    face: 'face_surprised',
    intro: 'It breaks about a second after you land on it. Keep moving and do not stop on it.',
    lines: same([{ how: 'Keep moving', what: 'Cross quickly' }]),
  },
  moving: {
    id: 'moving',
    title: 'A moving platform!',
    face: 'face_calm',
    intro: 'It slides back and forth and carries you with it. Wait for it to swing close, then hop on.',
    lines: same([{ how: 'Hop on when it is close', what: 'Ride it' }]),
  },
  water: {
    id: 'water',
    title: 'Water ahead!',
    face: 'face_surprised',
    intro: 'Falling in costs a life. Jump from bank to bank, or hop onto the drifting logs.',
    lines: same([{ how: 'Time your jump', what: 'Land on a log', sub: 'logs drift, so aim ahead of one' }]),
  },
  fruit: {
    id: 'fruit',
    title: 'Fruit and flowers!',
    face: 'face_happy',
    intro: 'Touch them to score points. Some stages ask you to gather a number of them before the exit opens.',
    lines: same([{ how: 'Just touch them', what: 'Score points' }]),
  },
  heart: {
    id: 'heart',
    title: 'A heart!',
    face: 'face_happy',
    intro: 'Touch it to heal one heart. Hearts are how much a hit can cost you before you lose a life.',
    lines: same([{ how: 'Just touch it', what: 'Heals a heart' }]),
  },
  cage: {
    id: 'cage',
    title: 'A friend in a cage!',
    face: 'face_cheer',
    intro: 'Hit the cage a few times to crack it open and set the friend free.',
    lines: {
      screen: [{ glyph: 'tap', how: 'Tap beside it', what: 'Punch the cage', sub: 'stand close and keep punching' }],
      pad: [{ how: 'Punch button', what: 'Punch the cage', sub: 'stand close and keep punching' }],
      keys: [{ how: 'J or Z', what: 'Punch the cage', sub: 'stand close and keep punching' }],
    },
  },
  idol: {
    id: 'idol',
    title: 'A Jungle Idol!',
    face: 'face_wink',
    intro: 'A hidden treasure. Some stages ask you to find them all, so look in the high and out-of-the-way places.',
    lines: same([{ how: 'Just touch it', what: 'Collect it' }]),
  },
  power: {
    id: 'power',
    title: 'A power-up!',
    face: 'face_cheer',
    intro: 'Each one lasts a few seconds. Speed makes you run faster, the sun makes you invincible, and the nectar magnet pulls fruit and hearts to you.',
    lines: same([{ how: 'Just touch it', what: 'Take it' }]),
  },
  checkpoint: {
    id: 'checkpoint',
    title: 'A checkpoint!',
    face: 'face_happy',
    intro: 'Run past it and the game remembers. If you lose a life, you start again from here, not the beginning.',
    lines: same([{ how: 'Just run past it', what: 'Saves your place' }]),
  },
  shrine: {
    id: 'shrine',
    title: 'The exit shrine!',
    face: 'face_cheer',
    intro: 'Touch it to finish the stage. If the stage asked for something first, such as fruit, foes or friends, the shrine opens once you have done it.',
    lines: same([{ how: 'Reach it', what: 'Finish the stage' }]),
  },
};

// ───────────────────────────── what has been shown ─────────────────────────────

const KEY = 'sloth_lessons';

function forced(): 'off' | 'all' | null {
  try {
    const q = new URLSearchParams(window.location.search).get('lessons');
    return q === 'off' || q === 'all' ? q : null;
  } catch {
    return null;
  }
}

export function lessonsSeen(): Set<LessonId> {
  if (forced() === 'all') return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return new Set((Array.isArray(list) ? list : []).filter((id): id is LessonId => typeof id === 'string' && id in LESSONS));
  } catch {
    return new Set(Object.keys(LESSONS) as LessonId[]); // storage blocked: never nag
  }
}
export function markLessonSeen(id: LessonId) {
  try {
    const s = lessonsSeen();
    s.add(id);
    if (forced() === 'all') return;
    localStorage.setItem(KEY, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
}
export function lessonsOn(): boolean {
  return forced() !== 'off';
}

/** how this player is controlling the game right now */
export function lessonInputMode(): InputMode {
  let coarse = false;
  try {
    coarse = !!window.matchMedia?.('(pointer: coarse)').matches;
  } catch {
    /* no window */
  }
  if (!coarse) return 'keys';
  return controlStyle() === 'pad' ? 'pad' : 'screen';
}

// ───────────────────────────── noticing the first of each ─────────────────────────────

export interface LessonScene {
  /** the hero */
  px: number;
  py: number;
  /** the part of the world on screen */
  view: { x0: number; x1: number; y0: number; y1: number };
  enemies: { type: string; x: number; y: number; defeated: boolean }[];
  collectibles: { type: string; x: number; y: number; collected: boolean }[];
  vines: { x: number; topY: number; bottomY: number; vineType?: string }[];
  platforms: { x: number; y: number; width: number; type: string; broken?: boolean }[];
  checkpoints: { x: number; y: number }[];
  rivers: { x0: number; x1: number }[];
}

/** how far ahead of the hero something has to be before it is "here", and how far above or below */
export const NEAR = { foe: 400, thing: 340, climb: 170, dy: 230 } as const;

const NO_STOMP = new Set(['spider', 'ant_hazard']);
const TOUGH = new Set(['jaguar', 'boa', 'caiman', 'harpy']);

/** the lesson to show now, if something new is close ahead; the foe lesson first, then the rest by how soon they matter */
export function pickLesson(s: LessonScene, seen: ReadonlySet<LessonId>): LessonId | null {
  const onScreen = (x: number, y: number) => x >= s.view.x0 && x <= s.view.x1 && y >= s.view.y0 - 40 && y <= s.view.y1 + 40;
  const near = (x: number, y: number, r: number) => Math.abs(x - s.px) <= r && Math.abs(y - s.py) <= NEAR.dy && onScreen(x, y);
  const want = (id: LessonId) => !seen.has(id);

  for (const e of s.enemies) {
    if (e.defeated || e.type === 'boss' || !near(e.x, e.y, NEAR.foe)) continue;
    if (want('foe')) return 'foe';
    if (e.type === 'eagle' && want('eagle')) return 'eagle';
    if (NO_STOMP.has(e.type) && want('nostomp')) return 'nostomp';
    if (TOUGH.has(e.type) && want('tough')) return 'tough';
  }
  if (want('gap')) {
    const ps = s.platforms.filter((p) => !p.broken && p.type !== 'drift' && Math.abs(p.y - s.py) <= 120 && p.x + p.width >= s.px - 60).sort((a, b) => a.x - b.x);
    for (let i = 0; i + 1 < ps.length; i++) {
      const edge = ps[i].x + ps[i].width;
      if (ps[i + 1].x - edge > 60 && edge >= s.px && edge - s.px <= NEAR.thing && onScreen(edge, s.py)) return 'gap';
    }
  }
  if (want('climb') && s.vines.some((v) => v.vineType === 'tree_climb' && Math.abs(v.x - s.px) <= NEAR.climb && s.py >= v.topY - 40 && s.py <= v.bottomY + 90 && onScreen(v.x, s.py))) return 'climb';
  if (want('swing') && s.vines.some((v) => v.vineType !== 'tree_climb' && near(v.x, (v.topY + v.bottomY) / 2, NEAR.thing))) return 'swing';
  for (const p of s.platforms) {
    if (p.broken) continue;
    const cx = p.x + p.width / 2;
    if (p.type === 'bouncy' && want('bounce') && near(cx, p.y, NEAR.thing)) return 'bounce';
    if (p.type === 'fragile' && want('crumble') && near(cx, p.y, NEAR.thing)) return 'crumble';
    if (p.type === 'moving' && want('moving') && near(cx, p.y, NEAR.thing)) return 'moving';
  }
  if (want('water') && s.rivers.some((r) => (r.x0 <= s.px + NEAR.thing && r.x1 >= s.px - 40) && s.py >= 0 && Math.abs(r.x0 - s.px) <= 500)) return 'water';
  const col = (types: string[]) => s.collectibles.find((c) => !c.collected && types.includes(c.type) && near(c.x, c.y, NEAR.thing));
  if (want('cage') && col(['cage'])) return 'cage';
  if (want('power') && col(['powerup_speed', 'powerup_invincible', 'powerup_magnet'])) return 'power';
  if (want('heart') && col(['heart', 'super_heart'])) return 'heart';
  if (want('idol') && col(['relic'])) return 'idol';
  if (want('fruit') && col(['fruit', 'flower', 'leaf'])) return 'fruit';
  if (want('checkpoint') && s.checkpoints.some((c) => near(c.x, c.y, NEAR.thing))) return 'checkpoint';
  if (want('shrine') && col(['exit_totem'])) return 'shrine';
  return null;
}
