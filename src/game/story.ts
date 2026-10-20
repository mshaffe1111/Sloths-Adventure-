/**
 * The full script for Sloths Rainforest Adventures.
 * Every cutscene in the game (intro, world intros, boss showdowns, ending) is data here,
 * rendered by StoryPlayer with scenes drawn from the in-game art.
 */

import type { JennifurMood } from './jennifurSprite.ts';
import type { CameraMove, PoseKey, SceneFx } from './storyShots.ts';
import { finalePanels, PROMISE_PANELS } from './storyChapters.ts';

export type ActorKind =
  | 'milo'
  | 'daisy'
  | 'daisy_wave'
  | 'boss'
  | 'thornbark'
  | 'bloom'
  /** Dot, the hummingbird courier: hovers, scale is its size */
  | 'dot';

/** the Heartbloom's life: a closed bud, the open bloom, the epic glowing bloom, and its ultimate state */
export type BloomStage = 'bud' | 'bloom' | 'epic' | 'ultimate';

export interface SceneActor {
  kind: ActorKind;
  /** 0..1 across the scene width */
  x: number;
  /** 0..1 down the scene height (feet position) */
  y?: number;
  scale?: number;
  facing?: 1 | -1;
  /** boss world id 1..10 when kind === 'boss' */
  world?: number;
  /** draw as a dark silhouette */
  silhouette?: boolean;
  /** boss only: attack pose */
  angry?: boolean;
  /** boss only: defeated and dizzy */
  beaten?: boolean;
  /** bloom only: which painted stage of the Heartbloom (the open bloom when unset) */
  stage?: BloomStage;
  /** daisy (Jennifur) only: which animation she plays */
  mood?: JennifurMood;
  /** milo only: pose */
  pose?: 'idle' | 'punch' | 'duck' | 'happy';
  /**
   * a performance in painted poses (milo and the painted bosses): which frame to show when, and where the actor moves between them.
   * When set it replaces `pose` / `angry` / `beaten`, and the actor falls back to those if the painted art is not loaded.
   */
  seq?: PoseKey[];
  /** milo only: a big face portrait instead of the body ('face_calm', 'face_wink'...; `seq` can change the expression), drawn `scale` times the usual size */
  portrait?: boolean;
}

/** a photograph shown on a card over the picture (a keepsake from the albums: the key is its photo in src/assets/photos) */
export interface ScenePhoto {
  key: string;
  /** printed under the picture */
  caption?: string;
  /** how wide the card is, as a share of the scene width */
  size?: number;
  /** lean in radians */
  tilt?: number;
}

export type SceneMood = 'day' | 'storm' | 'dusk' | 'night' | 'glow';

export interface StoryScene {
  /** world id 1..10 whose backdrop to use */
  world: number;
  mood: SceneMood;
  actors: SceneActor[];
  /** falling petals / sparkles */
  particles?: 'petals' | 'sparkles' | 'rain' | 'embers' | 'none';
  /** camera x offset in px to pick a different slice of the backdrop */
  camX?: number;
  /** show the ten guardians as a silhouette line-up */
  lineup?: boolean;
  /** camera zoom (1 = full frame) and focus point (0..1) for close-ups */
  zoom?: number;
  focusX?: number;
  focusY?: number;
  /** which painted castle stands behind a world-10 picture (5-7); the Highland Fortress when unset */
  castle?: number;
  /** a camera move over the picture (replaces the slow default push-in) */
  camera?: CameraMove;
  /** effects at moments of the picture: flash, shake, impact burst, dust, dizzy stars, glints */
  fx?: SceneFx[];
  /** a remembered moment: faded warm colour, soft old-paper edges */
  memory?: boolean;
  /** a photograph held up over the picture */
  photo?: ScenePhoto;
}

export interface StoryPanel {
  chapter: string;
  speaker: string;
  text: string;
  scene: StoryScene;
  /** optional gameplay tip shown under the text (boss intros) */
  tip?: string;
}

const HERO_FACE = { y: 1.04, scale: 1.25, portrait: true } as const;

export const INTRO_PANELS: StoryPanel[] = [
  {
    chapter: 'PROLOGUE',
    speaker: 'Narrator',
    text: 'High above the forest floor, where sunlight spills like honey through the leaves, a very slow sloth named Slomatt had fallen asleep in the Heartbloom garden. Again.',
    scene: {
      world: 1, mood: 'day', particles: 'sparkles', zoom: 1.2,
      camera: { from: { zoom: 1.05, fx: 0.5, fy: 0.3 }, to: { zoom: 1.3, fx: 0.5, fy: 0.62 }, dur: 6 },
      actors: [{ kind: 'bloom', x: 0.72, y: 0.82, scale: 1.0, stage: 'bloom' }, { kind: 'milo', x: 0.34, ...HERO_FACE, seq: [{ at: 0, frame: 'face_calm_closed' }, { at: 4.5, frame: 'face_surprised' }] }],
    },
  },
  {
    chapter: 'PROLOGUE',
    speaker: 'Slomatt',
    text: 'Eleven minutes. That is a personal best.',
    scene: {
      world: 1, mood: 'day', particles: 'petals', zoom: 1.25, focusX: 0.4,
      actors: [{ kind: 'bloom', x: 0.72, y: 0.82, scale: 1.0, stage: 'bloom' }, { kind: 'milo', x: 0.34, ...HERO_FACE, seq: [{ at: 0, frame: 'face_surprised' }, { at: 1.6, frame: 'face_happy' }] }],
    },
  },
  {
    chapter: 'PROLOGUE',
    speaker: 'Jennifur',
    text: 'Slomatt, look! The Heartbloom opened overnight! Grandma says it only blossoms when the whole forest is happy.',
    scene: {
      world: 1, mood: 'day', particles: 'petals', zoom: 1.45, focusX: 0.5,
      actors: [
        { kind: 'daisy', x: 0.66, scale: 1.0, facing: -1 },
        { kind: 'bloom', x: 0.5, y: 0.8, scale: 1.0, stage: 'bloom' },
        { kind: 'milo', x: 0.34, scale: 1.0 },
      ],
    },
  },
  {
    chapter: 'PROLOGUE',
    speaker: 'Slomatt',
    text: 'Then the forest must be very happy. …Or you have been singing to it again.',
    scene: {
      world: 1, mood: 'day', particles: 'petals', zoom: 1.5, focusX: 0.44,
      actors: [
        { kind: 'daisy', x: 0.66, scale: 1.0, facing: -1 },
        { kind: 'bloom', x: 0.5, y: 0.8, scale: 1.0, stage: 'bloom' },
        { kind: 'milo', x: 0.34, scale: 1.0, pose: 'happy' },
      ],
    },
  },
  {
    chapter: 'PROLOGUE',
    speaker: 'Jennifur',
    text: 'Both. Mostly the second. Every realm leans on this flower, you know. It keeps the rain gentle, and the rivers kind, and the thorns asleep.',
    scene: {
      world: 4, mood: 'day', particles: 'petals', zoom: 1.0,
      camera: { from: { zoom: 1.1, fx: 0.2, fy: 0.55 }, to: { zoom: 1.1, fx: 0.8, fy: 0.55 }, dur: 9 },
      actors: [{ kind: 'bloom', x: 0.5, y: 0.8, scale: 1.4, stage: 'epic' }],
    },
  },
  {
    chapter: 'THE STORM',
    speaker: 'Narrator',
    text: 'Then the sky turned the color of a bruise. Thunder rolled down from the Stormy Highlands, and the birds fell silent all at once.',
    scene: { world: 10, mood: 'storm', actors: [], particles: 'rain', zoom: 1.15, focusX: 0.6, focusY: 0.5, fx: [{ at: 1.5, kind: 'flash', dur: 0.35 }, { at: 1.5, kind: 'shake', amount: 6, dur: 0.4 }] },
  },
  {
    chapter: 'THE STORM',
    speaker: 'General Iron-Claw',
    text: 'Seize the keeper of the Heartbloom! Whoever holds her holds every realm. And I have waited long enough!',
    scene: {
      world: 1, mood: 'storm', particles: 'rain', zoom: 1.08, focusX: 0.5,
      fx: [{ at: 0.3, kind: 'flash', dur: 0.3 }, { at: 0.3, kind: 'shake', amount: 7, dur: 0.4 }],
      actors: [
        { kind: 'milo', x: 0.2, scale: 0.95 },
        { kind: 'daisy', x: 0.42, scale: 0.95, mood: 'scared' },
        { kind: 'boss', world: 10, x: 0.84, scale: 1.0, facing: -1, silhouette: true },
      ],
    },
  },
  {
    chapter: 'THE STORM',
    speaker: 'Narrator',
    text: 'Slomatt ran. It was the fastest he had ever run. It was not fast enough.',
    scene: {
      world: 1, mood: 'storm', particles: 'rain', zoom: 1.12, focusX: 0.4,
      actors: [{ kind: 'milo', x: 0.2, scale: 1.0, seq: [{ at: 0, frame: ['run_a', 'run_b', 'run_c', 'run_d', 'run_e', 'run_f', 'run_g', 'run_h', 'run_i', 'run_j'], fps: 12, dx: 0.4, dur: 4, ease: 'linear' }] }],
    },
  },
  {
    chapter: 'THE STORM',
    speaker: 'Jennifur',
    text: 'Slomatt! Follow the petals! I will leave you a trail, I promise!',
    scene: {
      world: 1, mood: 'storm', particles: 'petals', zoom: 1.12, focusX: 0.45,
      actors: [
        { kind: 'milo', x: 0.22, scale: 1.0 },
        { kind: 'daisy_wave', x: 0.64, y: 0.6, scale: 0.9, mood: 'scaredwave' },
      ],
    },
  },
  {
    chapter: 'THE VOW',
    speaker: 'Slomatt',
    text: 'I am not fast. I am not fierce. But I have never once let go of someone I love. Hang on, Jennifur.',
    scene: {
      world: 1, mood: 'dusk', particles: 'petals', zoom: 1.5, focusX: 0.5, focusY: 0.55,
      actors: [{ kind: 'milo', x: 0.5, scale: 1.5 }],
    },
  },
  {
    chapter: 'THE EXPEDITION',
    speaker: 'Narrator',
    text: 'Ten realms lay between Slomatt and the Highland Fortress, each ruled by one of the General\'s guardians. One hundred trials. One very determined sloth.',
    scene: { world: 4, mood: 'dusk', actors: [], lineup: true, particles: 'sparkles' },
  },
];

export interface WorldStory {
  /** short line under the world name on the intro card */
  teaser: string;
  panels: StoryPanel[];
}

const W = (world: number, mood: SceneMood = 'day'): StoryScene => ({
  world, mood, actors: [], particles: 'sparkles', zoom: 1.2, focusX: 0.5,
});

/** Slomatt looks around, and the guardian of the world waits in silhouette */
function look(world: number, chapter: string, text: string, mood: SceneMood = 'day', extra: Partial<StoryScene> = {}): StoryPanel {
  return {
    chapter, speaker: 'Slomatt', text,
    scene: { ...W(world, mood), ...extra, actors: [{ kind: 'milo', x: 0.35 }, { kind: 'boss', world, x: 0.7, scale: 1.0, silhouette: true, facing: -1 }] },
  };
}

/** Dot the hummingbird courier hovers beside Slomatt and reads out Jennifur's latest note */
function dotNote(world: number, chapter: string, text: string, mood: SceneMood = 'day', extra: Partial<StoryScene> = {}): StoryPanel {
  return {
    chapter, speaker: 'Dot', text,
    scene: { ...W(world, mood), zoom: 1.45, focusX: 0.5, particles: 'petals', ...extra, actors: [{ kind: 'milo', x: 0.32 }, { kind: 'dot', x: 0.62, y: 0.46, scale: 1.0 }] },
  };
}

const C1 = 'WORLD 1 · EMERALD CANOPY';
const C2 = 'WORLD 2 · SUNLIT RIVERBANK';
const C3 = 'WORLD 3 · MOSSY GROTTO';
const C4 = 'WORLD 4 · MIST CASCADES';
const C5 = 'WORLD 5 · ORCHID SANCTUARY';
const C6 = 'WORLD 6 · DEEP MANGROVE';
const C7 = 'WORLD 7 · ANCIENT RUINS';
const C8 = 'WORLD 8 · TWILIGHT TREETOPS';
const C9 = 'WORLD 9 · VOLCANIC JUNGLE';
const C10 = 'WORLD 10 · STORMY HIGHLANDS';

export const WORLD_STORIES: Record<number, WorldStory> = {
  1: {
    teaser: 'Jennifur\'s trail begins in the treetops.',
    panels: [
      look(1, C1, 'A pink petal! Jennifur was here. The trail leads up through the Emerald Canopy, and something large has been slithering through these branches.'),
      dotNote(1, C1, 'Dot. Courier. I carry notes for a keeper who is, please do not ask, currently locked in a tower. This one says: "Slomatt, if you are reading this you have found a petal. Congratulations. Do not stop to smell it. Smell it later."'),
    ],
  },
  2: {
    teaser: 'The river hides a very hungry king.',
    panels: [
      look(2, C2, 'More petals, floating downstream. Jennifur is making sure I do not get lost. Those river stones look slippery, and those logs look suspiciously like teeth.'),
      dotNote(2, C2, 'Note from the tower: "The river guard shouts his warnings very, very late. He means well. The warning will arrive after the danger. Please take it in the spirit it was meant."'),
    ],
  },
  3: {
    teaser: 'Glowworm threads light the way, and something watches.',
    panels: [
      look(3, C3, 'The Grotto glows like a thousand lanterns. Beautiful, but I have the feeling I am being watched by two bright, patient eyes.', 'night'),
      dotNote(3, C3, 'Note: "The glowworms look friendly. They are not friendly. They are ENTHUSIASTIC. Whatever you do, do not let them in on the plan."', 'night'),
    ],
  },
  4: {
    teaser: 'Mist, thunder falls, and wings above the clouds.',
    panels: [
      look(4, C4, 'Waterfalls as tall as the sky! A feather drifts down from above. It is the size of my whole arm. I should not look up. I am looking up.'),
      dotNote(4, C4, 'Note: "The Sky Sovereign is the one with the wings. You will know her by the wings. Please be polite. She hates being interrupted in the middle of a dive."'),
    ],
  },
  5: {
    teaser: 'Orchids bloom, and so do cobwebs.',
    panels: [
      look(5, C5, 'A carving in the bark: "Slomatt, I know you will save me." Jennifur! But the silk threads between these orchids are thicker than vines…'),
      dotNote(5, C5, 'Note: "The Tarantula Queen invites everyone to tea. I accepted once. The tea was lovely. Leaving was the problem."'),
    ],
  },
  6: {
    teaser: 'The mangrove swamp swallows the sun.',
    panels: [
      look(6, C6, 'The roots twist like a maze and the water is perfectly still. In my experience, perfectly still water means something enormous is holding its breath.', 'dusk'),
      dotNote(6, C6, 'Note: "The Reaver eats lunch at noon. Do NOT meet him at noon. I have learned this the hard way and I will not elaborate."', 'dusk'),
    ],
  },
  7: {
    teaser: 'Crumbling temples guard a stony secret.',
    panels: [
      look(7, C7, 'Moss-covered statues, golden idols, and a temple door that is slightly open. Jennifur came through here. So did something very heavy.'),
      dotNote(7, C7, 'Note: "The Golem is the slowest talker in the forest. You will get on wonderfully. Do not finish his sentences. He hates that. It took him a week to tell me so."'),
    ],
  },
  8: {
    teaser: 'Fireflies, moonlight, and a monarch of the night.',
    panels: [
      look(8, C8, 'The sun has gone to bed and the fireflies are awake. I would sleep too, but Jennifur is out there somewhere, and so is something with very large wings.', 'night'),
      {
        chapter: C8, speaker: 'Narrator',
        text: 'Slomatt sat down on a branch to rest his eyes. His eyes had other plans.',
        scene: { ...W(8, 'night'), zoom: 1.3, focusX: 0.4, actors: [{ kind: 'milo', x: 0.4, y: 1.04, scale: 1.25, portrait: true, seq: [{ at: 0, frame: 'face_calm' }, { at: 2.4, frame: 'face_calm_closed' }] }] },
      },
      ...PROMISE_PANELS,
      dotNote(8, C8, 'Wake up. You were mumbling. Mostly about a petal. Here, a note: "Slomatt, I am quite sure you are asleep right now. It is fine. I would be too. Keep going."', 'night'),
    ],
  },
  9: {
    teaser: 'Lava rivers and a dragon who hates visitors.',
    panels: [
      look(9, C9, 'The jungle is on fire! Well, glowing. The rocks are warm, the air tastes like pepper, and the biggest lizard I have ever seen is clearing his throat.', 'dusk', { particles: 'embers' }),
      dotNote(9, C9, 'Note: "It is hot. I am fine. The tower has a window now, and a chair, and the General brought me a blanket. Please do not tell him I said thank you."', 'dusk', { particles: 'embers' }),
    ],
  },
  10: {
    teaser: 'The Highland Fortress. Jennifur is close.',
    panels: [
      look(10, C10, 'There it is: the Highland Fortress, and the lightning above it. Every guardian is behind me now. Jennifur, I can see the tower. One last climb.', 'storm', { particles: 'rain' }),
      dotNote(10, C10, 'Last note: "I am not scared anymore. He sits with me. He does not talk much. I think he is waiting for something. Come soon, Slomatt. And be kind when you come."', 'storm', { particles: 'rain' }),
    ],
  },
};

export interface BossStory {
  intro: Array<{ speaker: string; text: string }>;
  defeat: Array<{ speaker: string; text: string }>;
  tip: string;
}

export const BOSS_STORIES: Record<number, BossStory> = {
  1: {
    intro: [
      { speaker: 'Venom Fang', text: 'Sssilly sloth. Do you know how long it takes you to climb one tree? Long enough for me to eat you twice.' },
      { speaker: 'Slomatt', text: 'Then I will have to be quick about it. Where is Jennifur?' },
    ],
    defeat: [
      { speaker: 'Venom Fang', text: 'Impossssible… a sloth, tied me in a knot… The General\'sss fortress is north. Go on, sssnack.' },
      { speaker: 'Slomatt', text: 'Thank you. And I am sorry about the knot. Mostly.' },
    ],
    tip: 'Venom Fang strikes after a red ring flashes. Jump over the lunge, then punch his head.',
  },
  2: {
    intro: [
      { speaker: 'Crocus Rex', text: 'These waters belong to me! Nobody crosses my river without paying a toll. Today\'s toll is you.' },
      { speaker: 'Slomatt', text: 'I only have a petal and a very polite request. Please let me through.' },
      { speaker: 'Crocus Rex', text: 'A petal? The little keeper came by wearing a crown of them. Made me wear one too. I looked magnificent. Do NOT tell the General.' },
    ],
    defeat: [
      { speaker: 'Crocus Rex', text: 'Blub… my crown… my dignity… Fine! The river is open. The General is not as forgiving as I am.' },
      { speaker: 'Slomatt', text: 'Noted. Please keep the crown. It suits you.' },
    ],
    tip: 'Crocus Rex opens his jaws wide before he snaps. Hit his head when the jaws close.',
  },
  3: {
    intro: [
      { speaker: 'Shadow Prowler', text: 'You cannot punch what you cannot catch, little sloth. I am the dark between the glowworm threads.' },
      { speaker: 'Slomatt', text: 'I have all day. Literally. I am a sloth.' },
    ],
    defeat: [
      { speaker: 'Shadow Prowler', text: 'You… waited. You just waited, and I got tired. Nobody ever does that. Jennifur passed north, toward the clouds.' },
      { speaker: 'Slomatt', text: 'Patience is my best move. It is also my only move.' },
      { speaker: 'Shadow Prowler', text: 'The thorns on our necks are called the Iron Pact. None of us chose it. Find out who did.' },
    ],
    tip: 'Shadow Prowler vanishes, then pounces. Watch the glowing eyes and strike as he lands.',
  },
  4: {
    intro: [
      { speaker: 'Sky Sovereign', text: 'No creature climbs past my cliffs. Behold the Harpy Matriarch, queen of the winds!' },
      { speaker: 'Slomatt', text: 'Your Majesty, I only need to get past. Jennifur needs me.' },
    ],
    defeat: [
      { speaker: 'Sky Sovereign', text: 'A sloth, outflying a queen… Ha! And I am relieved, honestly. Your courage is worth a feather. Take the wind lane, it leads to the orchids.' },
      { speaker: 'Slomatt', text: 'You are kinder than your talons suggest.' },
    ],
    tip: 'Sky Sovereign dives from above. Dodge sideways, then punch her as she pulls out of the dive.',
  },
  5: {
    intro: [
      { speaker: 'Tarantula Queen', text: 'Welcome to my sanctuary, dear. Do stay awhile. Everyone does. Eventually.' },
      { speaker: 'Slomatt', text: 'That is very polite, and also very sticky. No thank you.' },
    ],
    defeat: [
      { speaker: 'Tarantula Queen', text: 'My webs, my beautiful webs! Hmph. The mangrove swamp is next. Mind the Reaver. He is not polite.' },
      { speaker: 'Slomatt', text: 'I will remember that. Thank you for the warning, Your Majesty.' },
      { speaker: 'Tarantula Queen', text: 'And, dear: the General is not afraid of you. He is afraid of being late. Remember that when you meet him.' },
    ],
    tip: 'The Queen shoots webs in a spread. Jump between them and punch her when she drops down.',
  },
  6: {
    intro: [
      { speaker: 'Marsh Reaver', text: 'Hssst. Who wades into the Reaver\'s blackwater? Nobody wades into the Reaver\'s blackwater!' },
      { speaker: 'Slomatt', text: 'Sorry! I was only passing through. Very, very slowly. Is that a real spear?' },
      { speaker: 'Marsh Reaver', text: '…Wait. You are the sloth. The General talks about you at every meal. "The sloth is coming. The sloth is slow. The sloth is somehow still coming." I thought you would be taller.' },
      { speaker: 'Slomatt', text: 'I get that a lot.' },
    ],
    defeat: [
      { speaker: 'Marsh Reaver', text: 'Hrmph… fine. Keep your feet. The ruins are past the reeds. Nobody tells the General a sloth got past my spear.' },
      { speaker: 'Slomatt', text: 'My lips are sealed. Mind the mud, and keep that spear pointed somewhere else.' },
    ],
    tip: 'The Reaver smashes the ground to send out mud waves. Jump on the beat, duck the spear thrust, then punch him while he recovers.',
  },
  7: {
    intro: [
      { speaker: 'Stone Idol Golem', text: 'I… am… the guardian… of the… ancient… temple. None… may… pass.' },
      { speaker: 'Slomatt', text: 'Finally, somebody who talks as slowly as I do.' },
    ],
    defeat: [
      { speaker: 'Stone Idol Golem', text: 'Crumble… the rune… is broken. The way up… is open. Jennifur… went… that way.' },
      { speaker: 'Slomatt', text: 'Thank you. Rest well, old friend.' },
      { speaker: 'Stone Idol Golem', text: 'Behind… the rune… there is… a photograph. He… asked me… to keep it… from you. I… am… sorry.' },
    ],
    tip: 'The Golem\'s rune glows before a smash. Dodge it, then punch the glowing rune on his chest.',
  },
  8: {
    intro: [
      { speaker: 'Night-Wing Monarch', text: 'The night belongs to me, little climber. Every star above this canopy answers to my wings.' },
      { speaker: 'Slomatt', text: 'I do not want your stars. I want my friend back.' },
    ],
    defeat: [
      { speaker: 'Night-Wing Monarch', text: 'Hm. Even the night bows to loyalty. Take the lava road. The Drake awaits, and he has not had company in a century.' },
      { speaker: 'Slomatt', text: 'I will try to be good company.' },
    ],
    tip: 'The Monarch swoops in the dark. Listen for the screech, dodge, then punch as he turns.',
  },
  9: {
    intro: [
      { speaker: 'Magma Drake', text: 'Another visitor! You will make a fine snack. Or a fine hat. I have not decided.' },
      { speaker: 'Slomatt', text: 'I would prefer neither. May I pass? Please? I brought a petal.' },
      { speaker: 'Magma Drake', text: 'Hm. Most visitors are the General\'s soldiers, and they never bring petals. Very well. Let us see what a petal can do.' },
    ],
    defeat: [
      { speaker: 'Magma Drake', text: 'Cough! You put out my fire with your sheer… stubbornness. Go. The General\'s fortress is just beyond the clouds.' },
      { speaker: 'Slomatt', text: 'Thank you. Drink some water. You sound terrible.' },
    ],
    tip: 'The Drake breathes fire along the ground. Jump the flame, then punch when he rears back.',
  },
  10: {
    intro: [
      { speaker: 'General Iron-Claw', text: 'You crossed ten realms for a flower-keeper? Foolish sloth. I rule the Highlands, and soon, everything below it.' },
      { speaker: 'Slomatt', text: 'She is not just a flower-keeper. She is my best friend. Give her back, General.' },
      { speaker: 'General Iron-Claw', text: 'Slow gets people killed, sloth. I have buried what slow costs. I will not bury another.' },
    ],
    defeat: [
      { speaker: 'General Iron-Claw', text: 'Impossible… I was the strongest in the whole forest. Why did you not give up?' },
      { speaker: 'Slomatt', text: 'Because I was never fighting for the forest. I was fighting for her.' },
    ],
    tip: 'Iron-Claw lunges with his steel claw and stomps. Dodge both, then punch his helmet.',
  },
};

/** the ending as it plays when nothing has been found in the Library (the game builds it with the player's finds, see storyChapters.ts) */
export const ENDING_PANELS: StoryPanel[] = finalePanels([]);

const BOSS_MOODS: Record<number, SceneMood> = { 3: 'night', 6: 'dusk', 8: 'night', 9: 'dusk', 10: 'storm' };

/** The secret boss: the Jungle Guardian, twisted by thorns. After the fight he is himself again. */
export function thornbarkPanels(kind: 'intro' | 'defeat'): StoryPanel[] {
  const intro = [
    { speaker: 'Thornbark', text: 'Grrr… the thorns… they whisper… Leave this hollow, little sloth…' },
    { speaker: 'Slomatt', text: 'You were the Jungle Guardian. Grandma told me about you. The thorns did this to you, didn\'t they?' },
    { speaker: 'Thornbark', text: 'I cannot stop them… they want you gone. RUN… or FIGHT.' },
  ];
  const defeat = [
    { speaker: 'Thornbark', text: 'The thorns… they are gone. I can think again. Thank you, small sloth.' },
    { speaker: 'Slomatt', text: 'Slow and steady. That is the whole trick.' },
    { speaker: 'Thornbark', text: 'Take this Thorn Heart. The forest gives strength to the kind. Go and find your Jennifur.' },
  ];
  const lines = kind === 'intro' ? intro : defeat;
  return lines.map((line, i) => ({
    chapter: kind === 'intro' ? 'SECRET BOSS · THORNBARK' : 'VICTORY · THORNBARK',
    speaker: line.speaker,
    text: line.text,
    tip: kind === 'intro' && i === lines.length - 1 ? 'A red glow means an attack is coming. A hook or Mega Punch breaks it. Hit him when he tires.' : undefined,
    scene: {
      world: 7,
      mood: 'night' as SceneMood,
      zoom: 1.5,
      focusX: line.speaker === 'Slomatt' ? 0.28 : 0.7,
      focusY: 0.58,
      particles: 'sparkles' as const,
      actors: [
        { kind: 'milo' as const, x: 0.24, scale: 1.0, pose: kind === 'defeat' && line.speaker === 'Slomatt' ? ('happy' as const) : ('idle' as const) },
        { kind: 'thornbark' as const, x: 0.72, scale: 1.0, facing: -1 as const, angry: kind === 'intro' && line.speaker !== 'Slomatt', beaten: kind === 'defeat' },
      ],
    },
  }));
}

/** Build the cutscene panels for a boss encounter (before the fight) or its defeat (after). */
export function bossPanels(world: number, kind: 'intro' | 'defeat', bossName: string): StoryPanel[] {
  const story = BOSS_STORIES[world] ?? BOSS_STORIES[1];
  const lines = kind === 'intro' ? story.intro : story.defeat;
  const mood = BOSS_MOODS[world] ?? 'day';
  return lines.map((line, i) => ({
    chapter: `${kind === 'intro' ? 'BOSS' : 'VICTORY'} · ${bossName.toUpperCase()}`,
    speaker: line.speaker,
    text: line.text,
    tip: kind === 'intro' && i === lines.length - 1 ? story.tip : undefined,
    scene: {
      world,
      mood,
      zoom: 1.5,
      focusX: line.speaker === 'Slomatt' ? 0.28 : 0.7,
      focusY: 0.58,
      particles: world === 9 ? 'embers' : world === 10 ? 'rain' : 'sparkles',
      actors: [
        { kind: 'milo', x: 0.24, scale: 1.0, pose: kind === 'defeat' && line.speaker === 'Slomatt' ? 'happy' : 'idle' },
        {
          kind: 'boss', world, x: 0.72, scale: 1.0, facing: -1,
          angry: kind === 'intro' && line.speaker !== 'Slomatt',
          beaten: kind === 'defeat',
        },
      ],
    },
  }));
}
