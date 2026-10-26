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
import { ctestEnabled } from './playRecorder.ts';
import type { GuideLine, TopicId } from './dotGuide.ts';
import { dotLine, gestureMove, targetTopic } from './dotLines.ts';

export type LessonId =
  | 'foe' | 'nostomp' | 'eagle' | 'tough'
  | 'gap' | 'climb' | 'swing' | 'bounce' | 'crumble' | 'moving' | 'water'
  | 'fruit' | 'heart' | 'cage' | 'idol' | 'power' | 'checkpoint' | 'shrine' | 'rope';

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
        { glyph: 'tap', how: 'Tap when it is close', what: 'Punch', sub: 'in the air, a tap is a jump kick' },
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
    intro: 'Big animals take several hits and are hard to shove. Watch for it rearing back. That is when it strikes, so step away, then hit it as it recovers.',
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
        { glyph: 'up', how: 'Flick up again in the air', what: 'Double jump', sub: 'it pushes you forward, for a gap that is a little too wide' },
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
        { glyph: 'jump', how: 'Flick up and forward', what: 'Let go and leap', sub: 'let go while you are swinging forward' },
      ],
      pad: [{ how: 'Jump into the vine', what: 'Grab on' }, { how: 'Pad ← →', what: 'Swing harder' }, { how: 'Jump', what: 'Let go and leap' }],
      keys: [{ how: 'Jump into the vine', what: 'Grab on' }, { how: 'A D or ← →', what: 'Swing harder' }, { how: 'Space', what: 'Let go and leap' }],
    },
  },
  rope: {
    id: 'rope',
    title: 'A rope to hang from!',
    face: 'face_calm',
    intro: 'Stand by the post at its end and jump straight up: Pokey grabs the rope and hangs on by himself. Creep along it to the far ledge.',
    lines: {
      screen: [
        { glyph: 'up', how: 'Flick up beside the post', what: 'Grab on', sub: 'then let go of the glass: he keeps hanging' },
        { glyph: 'run', how: 'Slide left or right', what: 'Creep along', sub: 'at the far end he steps off onto the ledge' },
        { glyph: 'down', how: 'Slide down', what: 'Let go', sub: 'only over something to land on' },
      ],
      pad: [{ how: 'Jump beside the post', what: 'Grab on' }, { how: 'Pad ← →', what: 'Creep along' }, { how: 'Pad down', what: 'Let go' }],
      keys: [{ how: 'Jump beside the post', what: 'Grab on' }, { how: 'A D or ← →', what: 'Creep along' }, { how: 'S or ↓', what: 'Let go' }],
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
    intro: 'When you are hurt, touch it to heal one heart. At full health it stays where it is, waiting for when you need it.',
    lines: same([{ how: 'Touch it when you are hurt', what: 'Heals a heart', sub: 'at full health you cannot pick it up' }]),
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
    title: 'Something hidden!',
    face: 'face_wink',
    intro: 'Some stages hide things to find: Grandma\'s keepsakes, Meeca\'s messages, old relics. Look in the high and out-of-the-way places.',
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
    intro: 'You just passed a flag, and the game remembers. If you lose a life, you start again from here, not the beginning.',
    lines: same([{ how: 'Run past a flag', what: 'Saves your place' }]),
  },
  shrine: {
    id: 'shrine',
    title: 'The exit shrine!',
    face: 'face_cheer',
    intro: 'Touch it to finish the stage. If the stage asked for something first, such as fruit, foes, or friends, the shrine opens once you have done it.',
    lines: same([{ how: 'Reach it', what: 'Finish the stage' }]),
  },
};

// ───────────────────────────── what has been shown ─────────────────────────────

const KEY = 'sloth_lessons';

function forced(): 'off' | 'all' | null {
  // the control test is about the controls: no pop-up lessons stopping the play
  if (ctestEnabled()) return 'off';
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
  /** the flags; `reached` once he has run past one (the checkpoint card comes on the flag, not on the way to it) */
  checkpoints: { x: number; y: number; reached?: boolean }[];
  rivers: { x0: number; x1: number }[];
  /** shimmy ropes (their ends, and their height), when the stage has them and he can use them */
  ropes?: { x0: number; x1: number; g0: number; g1: number }[];
}

/** how far ahead of the hero something has to be before it is "here", and how far above or below */
export const NEAR = { foe: 400, thing: 340, climb: 170, dy: 230 } as const;
/**
 * a swinging vine is "here" by the part of it he can catch: anywhere along it, down to a hand's reach (`below`) under its end, and
 * `grabX` px either side of it (physics.ts TIMED.grabX). It used to be measured to the vine's middle, which on a tall liana is more
 * than 230 px above the ground beside it, so the lesson waited until he was already swinging (QA, 1-6, 2026-10-26)
 */
export const SWING_SPAN = { grabX: 60, below: 30 } as const;

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
  // (a swinging vine before the gap: the gap it hangs over is crossed by the vine, and the lesson that crossing needs is the swing's)
  if (want('swing') && s.vines.some((v) => v.vineType !== 'tree_climb' && near(v.x, Math.max(v.topY, Math.min(v.bottomY + SWING_SPAN.below, s.py)), NEAR.thing + SWING_SPAN.grabX))) return 'swing';
  if (want('gap')) {
    const ps = s.platforms.filter((p) => !p.broken && p.type !== 'drift' && Math.abs(p.y - s.py) <= 120 && p.x + p.width >= s.px - 60).sort((a, b) => a.x - b.x);
    for (let i = 0; i + 1 < ps.length; i++) {
      const edge = ps[i].x + ps[i].width;
      // (not a gap a swinging vine hangs over: that one is crossed on the vine, and its lesson is the swing's)
      if (s.vines.some((v) => v.vineType !== 'tree_climb' && v.x > edge && v.x < ps[i + 1].x)) continue;
      if (ps[i + 1].x - edge > 60 && edge >= s.px && edge - s.px <= NEAR.thing && onScreen(edge, s.py)) return 'gap';
    }
  }
  if (want('climb') && s.vines.some((v) => v.vineType === 'tree_climb' && Math.abs(v.x - s.px) <= NEAR.climb && s.py >= v.topY - 40 && s.py <= v.bottomY + 90 && onScreen(v.x, s.py))) return 'climb';
  // a rope: one of its ends (where its post stands, on a ledge) close by, at about his height
  if (want('rope') && (s.ropes ?? []).some((r) => near(r.x0, r.g0, NEAR.climb + 60) || near(r.x1, r.g1, NEAR.climb + 60))) return 'rope';
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
  if (want('checkpoint') && s.checkpoints.some((c) => c.reached && near(c.x, c.y, NEAR.thing))) return 'checkpoint';
  if (want('shrine') && col(['exit_totem'])) return 'shrine';
  return null;
}

// ───────────────────────────── when a card may open ─────────────────────────────

/**
 * A card pauses the stage, and closing it takes the thumb off the glass. So a card only opens when that is harmless: standing on
 * something, or holding a trunk or a rope (which he keeps hold of with no thumb), not hurt, with no animal or falling thing close
 * enough to hit him the moment play carries on. Until then the card waits (engine.ts lessonTick). The play-testers lost lives to cards
 * that opened mid-glide, mid-jump, mid-climb and with a snake already touching him (2026-10-25).
 */
export interface CardSafety {
  grounded: boolean;
  /** on a trunk, a ladder or a rope: he stays put there with no input (a swinging vine does not count: it keeps swinging) */
  holding: boolean;
  /** still blinking from a hit */
  hurt: boolean;
  /** the nearest animal still in the fight, px (Infinity for none) */
  foeDx: number;
  foeDy: number;
  /** something already on its way to him: a rock, a spit, a dropping thorn (px to the nearest; Infinity for none) */
  hazard: number;
}
export const CARD_SAFE = { foeDx: 190, foeDy: 150, hazard: 240 } as const;

export function cardSafe(s: CardSafety): boolean {
  if (s.hurt || !(s.grounded || s.holding)) return false;
  if (Math.abs(s.foeDx) < CARD_SAFE.foeDx && Math.abs(s.foeDy) < CARD_SAFE.foeDy) return false;
  return s.hazard >= CARD_SAFE.hazard;
}

// ───────────────────────────── a lesson is one of Dot's lines ─────────────────────────────

/**
 * A lesson does not stop the stage for a card: it becomes Dot's lines, said where they are needed, with her
 * ring on the thing (dotGuide.ts). The words are Matt's approved lines (dotLines.ts, by id); a move lesson stays until the move is done,
 * and the next line of the lesson follows it (grab the vine, then leap off it). The fuller wording stays in Pokey's Journal. The approved
 * lines are for a touch screen; a pad or a keyboard gets a short line of its own.
 */
export const LESSON_DOT: Record<LessonId, { ids: string[]; topic: TopicId; pad?: string; keys?: string; padHeld?: string; keysHeld?: string }> = {
  foe: { ids: ['lesson.foe.punch'], topic: 'foe', pad: 'Press Punch when it\'s close.', keys: 'Press J to punch it when it\'s close.' },
  nostomp: { ids: ['lesson.nostomp'], topic: 'foe', pad: 'Punch this one. Don\'t stomp it.', keys: 'Press J. Don\'t stomp this one.' },
  eagle: { ids: ['lesson.eagle.duck'], topic: 'foe', pad: 'Pad down to duck its dive.', keys: 'Press S to duck its dive.' },
  tough: { ids: ['lesson.tough'], topic: 'foe' },
  gap: { ids: ['lesson.gap.jump'], topic: 'gap', pad: 'Push the pad, then Jump.', keys: 'Run, then Space to jump the gap.' },
  climb: { ids: ['lesson.climb.grab', 'lesson.climb.up'], topic: 'trunk', pad: 'Jump at the trunk, hold Pad up.', keys: 'Jump at the trunk, hold W.' },
  swing: {
    ids: ['lesson.swing.grab', 'lesson.swing.leap'], topic: 'vine', pad: 'Jump into the vine to grab it.', keys: 'Jump into the vine to grab it.',
    // (already on the vine: the stage hints' words for letting go, protoStage.ts)
    padHeld: 'Press Jump as you swing forward.', keysHeld: 'Press Space as you swing forward.',
  },
  rope: { ids: ['lesson.rope.grab', 'lesson.rope.creep'], topic: 'rope', pad: 'Jump by the post to grab on.', keys: 'Jump by the post to grab on.' },
  bounce: { ids: ['lesson.bounce'], topic: 'mushroom' },
  crumble: { ids: ['lesson.crumble'], topic: 'crumble' },
  moving: { ids: ['lesson.moving'], topic: 'moving' },
  water: { ids: ['lesson.water'], topic: 'gap' },
  fruit: { ids: ['lesson.fruit'], topic: 'petal' },
  heart: { ids: ['lesson.heart'], topic: 'heart' },
  cage: { ids: ['lesson.cage'], topic: 'cage', pad: 'Press Punch beside the cage.', keys: 'Press J beside the cage.' },
  idol: { ids: ['lesson.idol'], topic: 'relic' },
  power: { ids: ['lesson.power'], topic: 'power' },
  checkpoint: { ids: ['lesson.checkpoint'], topic: 'flag' },
  shrine: { ids: ['lesson.shrine'], topic: 'exit' },
};

/** one approved line as a guide line (a move line stays until its move; `next`: what follows it once done) */
function lessonStep(lesson: LessonId, ids: string[], i: number, mode: InputMode): GuideLine | undefined {
  const d = LESSON_DOT[lesson];
  const l = dotLine(ids[i]);
  if (!l || !l.text) return i + 1 < ids.length ? lessonStep(lesson, ids, i + 1, mode) : undefined;
  const topic = targetTopic(l.target) ?? d.topic;
  // (the first line of a lesson on a pad or keyboard: its own words, and nothing after it; the approved lines name touch gestures)
  const own = mode === 'pad' ? d.pad : mode === 'keys' ? d.keys : undefined;
  const move = l.kind === 'move' ? (/\.leap$/.test(l.id) ? 'leap' : gestureMove(l.gesture, topic)) : undefined;
  return {
    key: `lesson:${lesson}:${i}`,
    text: mode !== 'screen' && i === 0 ? own ?? l.text : l.text,
    kind: l.kind === 'move' ? 'teach' : 'info',
    who: 'Dot',
    move,
    topic: i === 0 ? d.topic : topic,
    gesture: l.gesture ?? undefined,
    skill: `lesson:${lesson}${i ? `:${i}` : ''}`,
    source: 'lesson',
    waitMs: 9000,
    next: mode === 'screen' && i + 1 < ids.length ? lessonStep(lesson, ids, i + 1, mode) : undefined,
  };
}

/**
 * the lesson as Dot's line(s), for the way this player is controlling the game. `holding`: he already has hold of the thing (the swing's
 * lesson can come once he is on the vine, engine.ts lessonTick), so a first "grab it" step is skipped: it would wait for a grab that has
 * happened already
 */
export function lessonDotLine(id: LessonId, mode: InputMode = lessonInputMode(), holding = false): GuideLine | undefined {
  const d = LESSON_DOT[id];
  if (holding && /\.grab$/.test(d.ids[0]) && d.ids.length > 1) {
    if (mode === 'screen') return lessonStep(id, d.ids, 1, mode);
    const own = mode === 'pad' ? d.padHeld : d.keysHeld;
    const l = lessonStep(id, d.ids, 1, 'screen');
    if (own && l) return { ...l, text: own, next: undefined };
  }
  return lessonStep(id, d.ids, 0, mode);
}
