/**
 * Wayside: the story while you play. The cutscenes carry the big moments (arrival, halfway, guardian, the scenes after); this carries the
 * small ones, one-line asides that never pause the game: Dot grumbling about the dark, the petal warming on Pokey's wrist, a dry remark
 * after a fall. Each stage 2-9 of a world may have one scripted line (at the start, at the halfway mark or near the exit), and the first
 * time Pokey gets hurt in a stage there can be a second, from a small pool.
 *
 * Each world's stages come from its chapter (stagePlan.ts; the names are listed above each world below), so a line can lean on what the
 * player is doing there, and on where the story stands: the halfway scene plays after stage 5, so lines on stages 6-9 know what it told us.
 *
 * Rules the writing follows (see the notes in the story research):
 *   - a line is a thing someone says or does, never a feeling announced
 *   - it is short enough to read in a glance, and funny or tender because of who says it, not because of a pun
 *   - some lines plant something a later scene pays off (Dot's pouch, her tail feathers, the joke she is saving, the badly tied cages),
 *     and some answer a scene we have already seen
 *   - who can speak follows the story: Dot is with Pokey in worlds 1-5, in world 6 until the Last Note scene (she flies away after stage 5),
 *     is gone through world 7, comes back bleeding at the start of world 8, stays through world 9, and is in the net in world 10.
 *     When Dot is gone the aside is Pokey's own thought (first person) or the petal's (third person, a narrator)
 *   - each line shows once ever (per stage), so a replay is quiet
 */

import { findForStage } from './finds.ts';
import { ctestEnabled } from './playRecorder.ts';

export type WayAt = 'start' | 'half' | 'near';
/** which line of a stage: L its scripted line, H the aside after the first fall, F the hint that a Hush Fern is hiding something here */
export type WayFlag = 'L' | 'H' | 'F';
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
  // ── ACT I · THE TRAIL: Dot is chatty, two days late, and sure she is fast ──
  // 2 Petal Trail · 3 Branch Snakes · 4 Up the Kapok · 5 More Petals · 6 First Lianas · 7 A Very Good Bush · 8 The Long Branch · 9 The Boa's Branches
  1: {
    stages: {
      2: dot('start', 'She said don\'t stop to smell the flowers. She never said anything about picking up her petals.'),
      3: dot('half', 'You said "excuse me" just before that punch. I heard it. So did he.'),
      5: petal('start', 'These petals are fresher. She came this way not long ago.'),
      6: pokey('half', 'Meeca used to cross these twice before I\'d finished one. She\'d wait at the end with a snack.'),
      7: dot('start', 'Quiet stage. Quiet\'s easy. I\'ll just hum softly the whole way.'),
      8: pokey('half', 'Dot has flown to the end of this branch and back four times. I\'m still on my first.'),
      9: dot('start', 'I\'m too small to be worth the chase. Best thing about me, honestly.'),
    },
    hurt: [
      hDot("Pokey's down! Wait... up again. Good. Carry on."),
      hDot('Meeca would know what to say here. I only have "ow." So. Ow.'),
      hDot('Ow! That one was yours, but I felt it.'),
    ],
  },
  // the village of PLEASE BE PATIENT, Gruntlewick, the mailman, and a river king in a petal tiara
  // 2 Petals for the Crown · 3 Stuck in the Reeds · 4 Over the Water · 5 River Snappers · 6 Up the Bank Houses · 7 The Mailman's Route · 8 Reed Cages · 9 The Court
  2: {
    stages: {
      2: dot('start', 'A sloth watched me pick a flower and said, "Oh." That was ten minutes ago. He\'s still saying it.'),
      3: dot('half', 'Reeds, reeds, a cage, more reeds. I\'ve looked at so many reeds today. Some of them on purpose.'),
      4: pokey('half', 'I could watch this river all day... Not now. Swing, Pokey.'),
      5: pokey('half', 'The sign said PLEASE BE PATIENT. I\'m doing my best, but this one keeps lunging.'),
      6: pokey('half', 'Every house in the bank has a round door, and every door says PLEASE BE PATIENT. I\'m climbing past them very patiently.'),
      7: dot('half', 'I asked the mailman for the time. He said, "Soon." I\'m going to hold him to that.'),
      9: pokey('start', 'Meeca came through here first. I bet she admired the whole river out loud.'),
    },
    hurt: [
      hDot('Take your time getting up. Everybody in this village would.'),
      hDot('That was a fall, not a nap. I\'m only asking because it\'s happened.'),
      hDot('Nothing to see. I\'m a witness, and I saw nothing. Very reliable.'),
    ],
  },
  // the dark: glowworms, footprints in a circle, and something that can stand as still as he can
  // 2 Glowworm Path · 3 Footprints in a Circle · 4 The Sinkhole · 5 Sleeping Vines · 6 Grandma's Things · 7 Which Fern? · 8 Thorn Vine Swing · 9 The Prowler's Ring
  3: {
    stages: {
      2: dot('start', 'Stay where I can see you... I can\'t see anything. Stay where I can hear you.'),
      3: petal('half', 'Dot pats the little pouch at her side again. She does it every time the dark gets close.'),
      4: petal('half', 'A glowworm lights his next handhold. He thanks it. It glows a little brighter and pretends not to.'),
      5: pokey('start', 'I used to be good at quiet. In here, quiet is a thing that listens back.'),
      7: dot('half', 'I\'ve apologized to twelve ferns so far. None of them was the one.'),
      8: dot('start', 'Old vines only watch for things in a hurry. So don\'t hurry. You\'re very good at that.'),
      9: pokey('half', 'Seems to me a ring is just a road that forgot where it was going.'),
    },
    hurt: [
      hDot('That was the dark\'s fault. I\'ll keep saying so until we\'re out.'),
      hDot('Say something... That was a grunt. A grunt counts.'),
      hDot('I\'d help you up, but I\'d have to open my eyes.'),
    ],
  },

  // ── ACT II · THE COST: the jokes get thinner and Dot works harder at them ──
  // 1 The Broken Ledge · 2 First Glide · 3 Waterfall Steps · 4 Crosswind · 5 The Sovereign's Dive · 6 Above the Mist · 7 The Long Drop · 8 Nests · 9 The Aerie
  4: {
    stages: {
      2: petal('start', 'The leaf is bigger than he is. He holds it over his head and steps off the edge before he can think about it.'),
      3: dot('start', 'Don\'t look at my tail. It\'s molting season. That\'s a real season. I looked it up.'),
      5: dot('start', 'The mist got into the notes. Meeca\'s last one is now mostly weather.'),
      6: pokey('start', 'Dot\'s flying lower than yesterday. I\'m pretending I haven\'t noticed. She\'s pretending I haven\'t.'),
      7: petal('half', 'Dot flies with her bare patch to the wind, so it won\'t show. It shows.'),
    },
    hurt: [
      hDot('Check the ledge. I\'m going to say that at every ledge for the rest of my life.'),
      hDot('I counted your hearts. I count them every time now. Don\'t ask me why.'),
      hDot('Pokey! Oh. Okay, you\'re up. My heart does a thing. It\'s nothing. It does it all day.'),
    ],
  },
  // silk, a table set for two, and a letter in a pouch
  // 2 Don't Sit · 3 Closing Orchids · 4 Silk Bridges · 5 Caught in Silk · 6 Meeca's Messages · 7 Don't Touch the Silk · 8 Up the Bloom Trees · 9 The Queen's Garden
  5: {
    stages: {
      2: pokey('start', 'I keep thinking about that table, set for two. A trap only needs one cup.'),
      3: petal('start', 'The orchids fold shut as he passes, one after another, like doors closing down a hall.'),
      4: dot('half', 'It\'s a bridge. It\'s a lovely bridge. I\'m not admiring it. You\'re not admiring it.'),
      5: petal('near', 'Tally marks scratched into the silk, row after row. He doesn\'t count them. He cuts the threads.'),
      6: pokey('start', 'I started carving her a reply on a branch. I\'m up to "M." It\'s a good M.'),
      7: dot('half', 'Every thread here hums when you step on it. Walk like you owe the place money.'),
      8: dot('half', 'I\'m just checking it\'s still there. It\'s still there... I\'m going to check again.'),
    },
    hurt: [
      hDot('Careful! The webs are sticky and the cake is stickier. Don\'t ask how I know.'),
      hDot('Up, up! The silk is only sticky if you stay down. That is the whole trick of silk.'),
      hDot('You\'re all right! Don\'t lick it. Pokey. Pokey, don\'t lick it.'),
    ],
  },
  // the mangrove: noon, black water that looks back, and Dot gone after the Last Note (stage 5)
  // 1 The Root Maze · 2 Flat Water · 3 Root to Root · 4 Low Tide · 5 The Spear · 6 Before Noon · 7 Through the Roots · 8 Stilt Climb · 9 Blackwater
  6: {
    stages: {
      2: dot('start', 'I\'m not afraid of black water. I\'m afraid of what lives in it and has opinions.'),
      3: dot('half', 'From up here the water looks like a mirror. It looks back, mostly.'),
      5: dot('start', 'I\'m saving a joke for the halfway. A real one. Don\'t let me forget it.'),
      6: pokey('start', 'Meeca said never meet the Reaver at noon. I\'m fairly sure it\'s noon somewhere. Probably here.'),
      7: petal('half', 'The sealed note sits in the satchel. He doesn\'t touch it. He knows exactly where it is.'),
      8: petal('near', 'Near the top he stops, and leaves room on the root beside him. Out of habit.'),
      9: pokey('start', 'Blackwater. Dot would have a name for it. Something rude. I\'m trying to think of one for her.'),
    },
    hurt: [
      hDot('The water\'s watching. Don\'t give it anything to talk about.', 1, 5),
      hDot('Up, up, before the mangrove gets ideas.', 1, 5),
      hPetal('The petal warms against his wrist until he is on his feet again.', 6, 9),
    ],
  },
  // alone among the statues: the quiet has a shape
  // 2 Brown Vines · 3 Ten Chairs · 4 The Way Up · 5 Stone Sentries · 6 Falling Floors · 7 The Photograph · 8 The Upper Temple · 9 The Golem's Hall
  7: {
    stages: {
      2: petal('start', 'Flowers push up between the old stones, thin and stubborn. He tells the buds to take their time.'),
      3: petal('half', 'Ten stone chairs in a ring, and one of them knocked over. He sets it upright before he goes on.'),
      4: petal('half', 'Every statue faces the temple, as if waiting for somebody to finish a sentence.'),
      5: pokey('start', 'I\'m the loudest thing in these ruins. That has never happened before.'),
      7: pokey('half', 'There\'s a ledge about Dot\'s size, made for sitting on and complaining from. I check it anyway.'),
      8: petal('near', 'The steps were cut for someone much bigger. He climbs each one like a small wall, and doesn\'t mind.'),
      9: pokey('start', 'Nobody in these ruins is in a hurry. It\'s the first place I\'ve ever felt like the youngest.'),
    },
    hurt: [
      hPetal('He says "I\'m fine" to the empty ruins, out of habit. The ruins don\'t argue.'),
      hPetal('A stone face watched him fall. It has seen slower.'),
      hPokey('Don\'t tell Dot. She\'d have so much to say about it. Tell her anyway.'),
    ],
  },

  // ── ACT III · THE IRON ROAD: Dot is back and hurt, then gone again ──
  // 2 Night Blooms · 3 Long Swings · 4 Bat Roosts · 5 Next Branch · 6 Glide by Moonlight · 7 The Tallest Tree · 8 Night Hunters · 9 Monarch's Wood
  8: {
    stages: {
      2: dot('start', 'I had a joke saved for you in the mangrove. Three days of flying and it\'s gone. It had a bird in it.'),
      4: pokey('start', 'Sneaking\'s the one thing I\'ve always done at full speed.'),
      5: pokey('start', 'I tell myself, "Next branch, then the one after." That\'s all a long way is.'),
      6: petal('half', 'Fireflies blink on along the branch ahead, one by one, like a lamp left lit just in case.'),
      7: pokey('near', 'I\'m climbing slowly so Dot can rest. Turns out I\'ve been training for this my whole life.'),
      8: dot('near', 'Those hunters left a net behind, tied shut with a bow. A bow, Pokey. With loops.'),
    },
    hurt: [
      hDot('Ow. Oh, that was you. I\'m so used to it being me.', 1, 5),
      hDot('I\'m not counting your scratches. I\'ve got enough of my own.', 1, 5),
      hDot('One branch, then the next. You told me that. I\'m telling you.', 6, 9),
    ],
  },
  // heat, a staircase of a volcano, and a lieutenant who keeps dropping his thread
  // 2 Rising Heat · 3 Ember Canopy · 4 The Drake's Doorstep · 5 Vent Riding · 6 Ash Fields · 7 Lava Steps · 8 Pell's Thread · 9 The Drake's Hoard
  9: {
    stages: {
      2: dot('start', 'It\'s hot. I\'m a small bird in a large oven. Somebody should write that down.'),
      3: pokey('half', 'It\'s so hot Dot has stopped glowing and started sweating. I didn\'t know birds could do that.'),
      4: dot('start', 'When he says "Visitor," don\'t answer. When he says "Intruder," really don\'t answer.'),
      6: dot('half', 'I\'m not touching the pouch. Look. Hands off. Wings off. I\'m a bird.'),
      7: pokey('half', 'It\'s boiling out, and I\'d still wear Meeca\'s scarf. All of it. Right now.'),
      8: dot('half', 'More thread. Either the lieutenant is very careless, or he wants us to find him.'),
      9: dot('start', 'Plan for the Drake: you say something dry, I panic, he gets confused. It\'s worked eight times.'),
    },
    hurt: [
      hDot('You\'re smoking. Slightly. Pat it out gently and panic a little.'),
      hDot('Don\'t scare me like that. My wings only go one speed when I\'m scared, and it\'s sideways.'),
      hDot('Walk it off. Not on the lava. Around the lava.'),
    ],
  },
  // the storm: Dot has gone into the net, Pokey climbs alone, and the flowers turn toward the tower
  // 2 The Thousand Steps · 3 Thunder · 4 Holding On · 5 Halfway Up · 6 The Iron Netting · 7 The Walls · 8 The Last Steps · 9 The Fortress Gate
  10: {
    stages: {
      2: petal('start', 'Even here, in the rain, a few flowers have turned to face the tower.'),
      4: petal('half', 'Lightning shows him every step of the climb. He takes them one at a time.'),
      6: petal('half', 'Between swings he checks the netting for a small green shape. Nothing yet.'),
      7: pokey('half', 'I\'ve been humming Meeca\'s song. About a third of it\'s right. She\'ll know which third.'),
      5: petal('half', 'He counts the steps that are left. Then he stops counting, and just climbs.'),
      8: petal('near', 'Someone has sewn a hole in the netting shut, very badly. Every stitch is in the wrong place.'),
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
  // the control test stands in for 1-2, whose petal lines would make no sense there (and would cover the middle of the screen)
  if (ctestEnabled()) return false;
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

/** is Dot with Pokey at this point of the story? She is away from the second half of world 6 (after the Last Note), all of world 7, and in the net in world 10 */
export function dotPresent(world: number, mini: number): boolean {
  return !(world === 6 && mini >= 6) && world !== 7 && world !== 10;
}

/** does this stage hide a find in a Hush Fern (a keepsake in stage 5 (3 in World 4), a book in stage 8)? */
export function hidesFern(world: number, mini: number): boolean {
  const f = findForStage(world, mini);
  return !!f && f.kind !== 'note';
}

/**
 * The hint at the very start of a stage that hides a fern: it does not say where, or what to do, only that one plant is not like the
 * others. Whoever is with Pokey says it (Dot, or Pokey's own thought when Dot is away).
 */
export function fernLine(world: number, mini: number): WayLine | undefined {
  if (!hidesFern(world, mini)) return undefined;
  return dotPresent(world, mini)
    ? { who: 'Dot', text: 'One of these plants looks different from the rest. I wonder what it means.' }
    : { who: 'Pokey', text: 'One of the plants here looks different from the rest. I wonder what it means.' };
}

/** how long a line stays up: long enough to read it twice at a glance */
/** the longest a guiding line from Dot stays up (ms) */
export const GUIDE_MAX_MS = 6500;
/** how long a guiding line handed over for `ms` stays up: long enough to read, never longer than GUIDE_MAX_MS (Wayside, JournalToast) */
export const guideShowMs = (text: string, ms: number): number => Math.min(GUIDE_MAX_MS, Math.max(ms, showMs(text)));

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
  /** this stage hides a fern that has not been found yet, and its hint has not been given */
  fernOpen?: boolean;
  shownF?: boolean;
}

/** which line (if any) is due right now. A fall is answered first; the scripted line waits its turn. */
export function dueLine(p: WayProbe): { flag: WayFlag; line: WayLine } | null {
  // the fern's hint comes first, at the very start, and only while the fern is still waiting to be found
  if (p.fernOpen && !p.shownF && p.playedMs >= START_AFTER_MS) {
    const line = fernLine(p.world, p.mini);
    if (line) return { flag: 'F', line };
  }
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

export function wasShown(world: number, mini: number, flag: WayFlag, store: Mem | null = browserStore()): boolean {
  try {
    return !!store?.getItem(keyFor(world, mini))?.includes(flag);
  } catch {
    return false;
  }
}

export function markShown(world: number, mini: number, flag: WayFlag, store: Mem | null = browserStore()): void {
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
