/**
 * Wayside: the story while you play. The cutscenes carry the big moments (arrival, halfway, guardian, the scenes after); this carries the
 * small ones, one-line asides that never pause the game: Dot grumbling about the dark, the petal warming on Pokey's wrist, a dry remark
 * after a fall. Each stage 2-9 of a world may have one scripted line (at the start, at the halfway mark or near the exit), and the first
 * time Pokey gets hurt in a stage there can be a second, from a small pool.
 *
 * Every world has the same ten stages in the same order, so a line can lean on what the player is doing:
 *   2 harvest (flowers) · 3 purge (predators) · 4 ascent (climbing) · 5 stealth (sneaking) · 6 vine swing · 7 idol hunt · 8 rescue (cages) · 9 gauntlet
 * and on where the story stands: the halfway scene plays after stage 5, so lines on stages 6-9 know what it told us.
 *
 * Rules the writing follows (see the notes in the story research):
 *   - a line is a thing someone says or does, never a feeling announced
 *   - it is short enough to read in a glance, and funny or tender because of who says it, not because of a pun
 *   - some lines plant something a later scene pays off (Dot's pouch, his tail feathers, the joke he is saving, the badly tied cages),
 *     and some answer a scene we have already seen
 *   - who can speak follows the story: Dot is with Pokey in worlds 1-5, in world 6 until the Last Note scene (he flies away after stage 5),
 *     is gone through world 7, comes back bleeding at the start of world 8, stays through world 9, and is in the net in world 10.
 *     When Dot is gone the aside is Pokey's own thought (first person) or the petal's (third person, a narrator)
 *   - each line shows once ever (per stage), so a replay is quiet
 */

export type WayAt = 'start' | 'half' | 'near';
export type WayWho = 'Dot' | 'Pokey' | 'Petal';
export interface WayLine {
  who: WayWho;
  text: string;
}
interface StageWay extends WayLine {
  at: WayAt;
}
interface HurtWay extends WayLine {
  /** the stages (1-9) of the world this line suits; unset = all of them */
  from?: number;
  to?: number;
}
interface WorldWay {
  stages: Record<number, StageWay>;
  hurt: HurtWay[];
}

const dot = (at: WayAt, text: string): StageWay => ({ at, who: 'Dot', text });
const pokey = (at: WayAt, text: string): StageWay => ({ at, who: 'Pokey', text });
const petal = (at: WayAt, text: string): StageWay => ({ at, who: 'Petal', text });
const hDot = (text: string, from?: number, to?: number): HurtWay => ({ who: 'Dot', text, from, to });
const hPokey = (text: string, from?: number, to?: number): HurtWay => ({ who: 'Pokey', text, from, to });
const hPetal = (text: string, from?: number, to?: number): HurtWay => ({ who: 'Petal', text, from, to });

export const WAYSIDE: Record<number, WorldWay> = {
  // ── ACT I · THE TRAIL: Dot is new, chatty, and sure he is fast ──
  1: {
    stages: {
      2: dot('start', 'She said don\'t stop to smell the flowers. Nobody said anything about picking them.'),
      3: dot('half', 'You said "excuse me" just before that punch. I heard it. So did he.'),
      5: dot('start', 'Quiet stage. Quiet\'s easy. I\'ll just hum softly the whole way.'),
      6: pokey('half', 'Meeca used to cross these twice before I\'d finished one. She\'d wait at the end with a snack.'),
      8: pokey('half', 'They all look at me like I\'m the fast part of the plan. Hello. I\'m the slow part.'),
      9: dot('start', 'I\'m too small to be worth the chase. Best thing about me, honestly.'),
    },
    hurt: [
      hDot('Recipient down! ...Recipient up. Good. Carry on.'),
      hDot('Meeca would know what to say here. I only have "ow." So. Ow.'),
      hDot('Ow! That one was yours, but I felt it.'),
    ],
  },
  // the village of PLEASE BE PATIENT, Gruntlewick, the mailman, and a river king in a petal tiara
  2: {
    stages: {
      2: dot('start', 'A sloth watched me pick a flower and said "oh." That was ten minutes ago. He\'s still saying it.'),
      3: pokey('half', 'The sign said PLEASE BE PATIENT. I\'m doing my best, but this one keeps lunging.'),
      4: dot('half', 'I asked the mailman for the time. He said "soon." I\'m going to hold him to that.'),
      6: pokey('half', 'I could watch this river all day. ...Not now. Swing, Pokey.'),
      7: dot('half', '"Admire something. Anything." ...Gorgeous idol. Wonderful idol. I\'m practicing.'),
      9: pokey('start', 'Meeca came through here first. I bet she admired the whole river out loud.'),
    },
    hurt: [
      hDot('Take your time getting up. Everybody in this village would.'),
      hDot('That was a fall, not a nap. I\'m only asking because it\'s happened.'),
      hDot('Nothing to see. I\'m a witness, and I saw nothing. Very reliable.'),
    ],
  },
  // the dark: glowworms, footprints in a circle, and something that can stand as still as he can
  3: {
    stages: {
      2: dot('start', 'Stay where I can see you. ...I can\'t see anything. Stay where I can hear you.'),
      3: petal('half', 'Dot pats the little pouch at his side again. He does it every time the dark gets close.'),
      4: petal('half', 'A glowworm lights his next handhold. He thanks it. It glows a little brighter and pretends not to.'),
      5: pokey('start', 'I used to be good at quiet. In here, quiet is a thing that listens back.'),
      7: dot('half', 'I\'ve apologized to eleven ferns so far. None of them was the one.'),
    },
    hurt: [
      hDot('That was the dark\'s fault. I\'ll keep saying so until we\'re out.'),
      hDot('Say something. ...That was a grunt. A grunt counts.'),
      hDot('I\'d help you up, but I\'d have to open my eyes.'),
    ],
  },

  // ── ACT II · THE COST: the jokes get thinner and Dot works harder at them ──
  4: {
    stages: {
      2: petal('start', 'The flowers by the falls have gone pale at the edges. He picks them gently, one hand underneath.'),
      3: dot('start', 'Don\'t look at my tail. It\'s molting season. That\'s a real season. I looked it up.'),
      5: dot('start', 'The mist got into the notes. Meeca\'s last one is now mostly weather.'),
      6: pokey('start', 'Dot\'s flying lower than yesterday. I\'m pretending I haven\'t noticed. He\'s pretending I haven\'t.'),
      7: petal('half', 'Dot flies with his bare patch to the wind, so it won\'t show. It shows.'),
    },
    hurt: [
      hDot('Check the ledge. I\'m going to say that at every ledge for the rest of my life.'),
      hDot('I counted your hearts. I count them every time now. Don\'t ask me why.'),
      hDot('Pokey! ...Okay. You\'re up. My heart does a thing. It\'s nothing. It does it all day.'),
    ],
  },
  // silk, a table set for two, and a letter in a pouch
  5: {
    stages: {
      2: pokey('start', 'I started carving her a reply on a branch. I\'m up to "M." It\'s a good M.'),
      4: dot('half', 'Every thread here hums when you step on it. Walk like you owe the place money.'),
      5: pokey('start', 'I keep thinking about that table, set for two. A trap only needs one cup.'),
      6: dot('half', 'I\'m just checking it\'s still there. It\'s still there. ...I\'m going to check again.'),
      8: petal('near', 'Tally marks scratched into the cage floor, row after row. He doesn\'t count them. He opens the door.'),
    },
    hurt: [
      hDot('Careful! The webs are sticky and the cake is stickier. Don\'t ask how I know.'),
      hDot('Up, up! The silk is only sticky if you stay down. That is the whole trick of silk.'),
      hDot('You\'re all right! Don\'t lick it. Pokey. Pokey, don\'t lick it.'),
    ],
  },
  // the mangrove: noon, black water that looks back, and Dot gone after the Last Note (stage 5)
  6: {
    stages: {
      2: dot('start', 'I\'m not afraid of black water. I\'m afraid of what lives in it and has opinions.'),
      4: dot('half', 'From up here the water looks like a mirror. It looks back, mostly.'),
      5: dot('start', 'I\'m saving a joke for the halfway. A real one. Don\'t let me forget it.'),
      7: petal('half', 'The sealed note sits in the satchel. He doesn\'t touch it. He knows exactly where it is.'),
      8: petal('near', 'Through the bars, someone holds out half a berry. He takes it, and eats it slowly, so they can see he likes it.'),
      9: pokey('start', 'Dot said never meet the Reaver at noon. I\'m fairly sure it\'s noon somewhere. Probably here.'),
    },
    hurt: [
      hDot('The water\'s watching. Don\'t give it anything to talk about.', 1, 5),
      hDot('Up, up, before the mangrove gets ideas.', 1, 5),
      hPetal('The petal warms against his wrist until he is on his feet again.', 6, 9),
    ],
  },
  // alone among the statues: the quiet has a shape
  7: {
    stages: {
      2: petal('start', 'Flowers push up between the old stones, thin and stubborn. He tells the buds to take their time.'),
      4: petal('half', 'Every statue faces the temple, as if waiting for somebody to finish a sentence.'),
      5: pokey('start', 'I\'m the loudest thing in these ruins. That has never happened before.'),
      7: pokey('half', 'There\'s a ledge about Dot\'s size, made for sitting on and complaining from. I check it anyway.'),
      8: petal('near', 'Freed, the little creature doesn\'t run. It walks beside him a while, in no hurry at all.'),
      9: pokey('start', 'Nobody in these ruins is in a hurry. It\'s the first place I\'ve ever felt like the youngest.'),
    },
    hurt: [
      hPetal('He says "I\'m fine" to the empty ruins, out of habit. The ruins don\'t argue.'),
      hPetal('A stone face watched him fall. It has seen slower.'),
      hPokey('Don\'t tell Dot. ...He\'d have so much to say about it. Tell him anyway.'),
    ],
  },

  // ── ACT III · THE IRON ROAD: Dot is back and hurt, then gone again ──
  8: {
    stages: {
      2: dot('start', 'I had a joke saved for you in the mangrove. Three days of flying and it\'s gone. It had a bird in it.'),
      4: pokey('near', 'I\'m climbing slowly so Dot can rest. Turns out I\'ve been training for this my whole life.'),
      5: pokey('start', 'Sneaking\'s the one thing I\'ve always done at full speed.'),
      6: petal('half', 'Fireflies blink on along the branch ahead, one by one, like a lamp left lit just in case.'),
      8: dot('near', 'Somebody tied this cage shut with a bow. A bow, Pokey. With loops.'),
    },
    hurt: [
      hDot('Ow, oh, that was you. I\'m so used to it being me.', 1, 5),
      hDot('I\'m not counting your scratches. I\'ve got enough of my own.', 1, 5),
      hDot('One branch, then the next. You told me that. I\'m telling you.', 6, 9),
    ],
  },
  // heat, a staircase of a volcano, and soldiers who have stopped locking things
  9: {
    stages: {
      2: dot('start', 'It\'s hot. I\'m a small bird in a large oven. I\'d like that on the record.'),
      4: pokey('half', 'The ledges up here are warm. I\'ve decided to think of that as friendly.'),
      6: dot('half', 'I\'m not touching the pouch. Look. Hands off. ...Claws off. I\'m a bird.'),
      7: pokey('half', 'It\'s boiling out. I\'d still wear Meeca\'s scarf. All of it. Right now.'),
      8: petal('near', 'This cage isn\'t locked. The creature inside waits politely to be rescued anyway.'),
      9: dot('start', 'Plan for the Drake: be so polite he feels bad. It\'s worked eight times.'),
    },
    hurt: [
      hDot('You\'re smoking. Slightly. Pat it out gently and panic a little.'),
      hDot('Don\'t scare me like that. My wings only go one speed when I\'m scared, and it\'s sideways.'),
      hDot('Walk it off. Not on the lava. Around the lava.'),
    ],
  },
  // the storm: Dot has gone into the net, Pokey climbs alone, and the flowers turn toward the tower
  10: {
    stages: {
      2: petal('start', 'Even here, in the rain, a few flowers have turned to face the tower.'),
      4: petal('half', 'Lightning shows him every step of the climb. He takes them one at a time.'),
      6: petal('half', 'Between swings he checks the netting for a small green shape. Nothing yet.'),
      7: pokey('half', 'I\'ve been humming Meeca\'s song. About a third of it\'s right. She\'ll know which third.'),
      8: petal('near', 'Someone has sewn this cage door shut, very badly. Every stitch is in the wrong place.'),
    },
    hurt: [
      hPetal('He sits. He breathes. He stands. In that order, every time.'),
      hPetal('The petal flares once, as if someone far above had felt it.'),
      hPokey('Up. That\'s the whole move.'),
    ],
  },
};

/** does a stage get asides at all? Not the guardian fights (they have their own scenes), not the hidden Hollow, not the guided first stage */
export function waysideApplies(level: { worldIndex: number; miniIndex: number; secret?: unknown; objectiveType?: string }): boolean {
  if (level.secret) return false;
  if (level.objectiveType === 'boss_lair') return false;
  if (level.miniIndex < 1 || level.miniIndex > 9) return false;
  if (level.worldIndex === 1 && level.miniIndex === 1) return false;
  return !!WAYSIDE[level.worldIndex];
}

export function stageLine(world: number, mini: number): (WayLine & { at: WayAt }) | undefined {
  return WAYSIDE[world]?.stages[mini];
}

/** the aside after the first fall in a stage: a stable pick from this world's pool, so the same stage always says the same thing */
export function hurtLine(world: number, mini: number): WayLine | undefined {
  const pool = (WAYSIDE[world]?.hurt ?? []).filter((h) => (h.from === undefined || mini >= h.from) && (h.to === undefined || mini <= h.to));
  if (!pool.length) return undefined;
  const h = pool[(mini * 7 + world * 3) % pool.length];
  return { who: h.who, text: h.text };
}

/** how long a line stays up: long enough to read it twice at a glance */
export function showMs(text: string): number {
  return Math.min(7600, 2800 + text.length * 50);
}

// ── when a line is due ──
export const START_AFTER_MS = 2400;
export const HALF_AT = 0.5;
export const NEAR_AT = 0.85;
/** a fall is answered a beat later, not in the middle of the knock-back */
export const HURT_DELAY_MS = 700;
/** quiet time between one aside and the next */
export const GAP_MS = 4000;
/** a fall is only answered if the reply can come within this long; after that it is old news */
export const HURT_WINDOW_MS = 9000;

export interface WayProbe {
  world: number;
  mini: number;
  /** how far along the stage (0-1) */
  ratio: number;
  /** milliseconds of actual play so far (not while paused or a card is up) */
  playedMs: number;
  /** a fall happened this many ms ago (undefined = none waiting) */
  hurtAgoMs?: number;
  shownL: boolean;
  shownH: boolean;
}

/** which line (if any) is due right now. A fall is answered first; the scripted line waits its turn. */
export function dueLine(p: WayProbe): { flag: 'L' | 'H'; line: WayLine } | null {
  if (p.hurtAgoMs !== undefined && p.hurtAgoMs >= HURT_DELAY_MS && p.hurtAgoMs <= HURT_WINDOW_MS && !p.shownH) {
    const line = hurtLine(p.world, p.mini);
    if (line) return { flag: 'H', line };
  }
  const s = stageLine(p.world, p.mini);
  if (s && !p.shownL) {
    const ready = s.at === 'start' ? p.playedMs >= START_AFTER_MS : s.at === 'half' ? p.ratio >= HALF_AT : p.ratio >= NEAR_AT;
    if (ready) return { flag: 'L', line: { who: s.who, text: s.text } };
  }
  return null;
}

// ── what has been shown (one tiny entry per stage: L = its scripted line, H = the hurt aside) and the on/off switch ──
type Mem = Pick<Storage, 'getItem' | 'setItem'>;
type PrefMem = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const keyFor = (world: number, mini: number) => `sloth_way_${world}-${mini}`;
const browserStore = (): PrefMem | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};

export function wasShown(world: number, mini: number, flag: 'L' | 'H', store: Mem | null = browserStore()): boolean {
  try {
    return !!store?.getItem(keyFor(world, mini))?.includes(flag);
  } catch {
    return false;
  }
}

export function markShown(world: number, mini: number, flag: 'L' | 'H', store: Mem | null = browserStore()): void {
  try {
    if (!store) return;
    const cur = store.getItem(keyFor(world, mini)) ?? '';
    if (!cur.includes(flag)) store.setItem(keyFor(world, mini), cur + flag);
  } catch {
    /* no storage: the line just may show again */
  }
}

/** on unless the player turned it off (a device setting, like the sound and the controls; it is not part of a saved game) */
export function waysideEnabled(store: Pick<Storage, 'getItem'> | null = browserStore()): boolean {
  try {
    return store?.getItem('sloth_wayside_off') !== '1';
  } catch {
    return true;
  }
}

export function setWaysidePref(on: boolean, store: Pick<Storage, 'setItem' | 'removeItem'> | null = browserStore()): void {
  try {
    if (!store) return;
    if (on) store.removeItem('sloth_wayside_off');
    else store.setItem('sloth_wayside_off', '1');
  } catch {
    /* ignore */
  }
}
