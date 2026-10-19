/**
 * The full script for Sloths Rainforest Adventures.
 * Every cutscene in the game (intro, world intros, boss showdowns, ending) is data here,
 * rendered by StoryPlayer with scenes drawn from the in-game art.
 */

export type ActorKind =
  | 'milo'
  | 'daisy'
  | 'daisy_wave'
  | 'boss'
  | 'thornbark'
  | 'bloom';

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
  /** milo only: pose */
  pose?: 'idle' | 'punch' | 'duck' | 'happy';
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
}

export interface StoryPanel {
  chapter: string;
  speaker: string;
  text: string;
  scene: StoryScene;
  /** optional gameplay tip shown under the text (boss intros) */
  tip?: string;
}

export const INTRO_PANELS: StoryPanel[] = [
  {
    chapter: 'PROLOGUE',
    speaker: 'Narrator',
    text: 'High above the forest floor, where sunlight spills like honey through the leaves, there lived a very slow sloth named Slomatt… and the kindest keeper in all the canopy, Jennifur.',
    scene: { world: 1, mood: 'day', actors: [{ kind: 'bloom', x: 0.5, y: 0.8, scale: 1.4 }], particles: 'sparkles', zoom: 1.25, focusX: 0.5 },
  },
  {
    chapter: 'PROLOGUE',
    speaker: 'Jennifur',
    text: 'Slomatt, look! The Heartbloom opened overnight! Grandma says it only blossoms when the whole forest is happy.',
    scene: {
      world: 1, mood: 'day', particles: 'petals', zoom: 1.45, focusX: 0.5,
      actors: [
        { kind: 'daisy', x: 0.66, scale: 1.0, facing: -1 },
        { kind: 'bloom', x: 0.5, y: 0.8, scale: 1.0 },
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
        { kind: 'bloom', x: 0.5, y: 0.8, scale: 1.0 },
        { kind: 'milo', x: 0.34, scale: 1.0, pose: 'happy' },
      ],
    },
  },
  {
    chapter: 'THE STORM',
    speaker: 'Narrator',
    text: 'Then the sky turned the color of a bruise. Thunder rolled down from the Stormy Highlands, and the birds fell silent all at once.',
    scene: { world: 10, mood: 'storm', actors: [], particles: 'rain', zoom: 1.15, focusX: 0.6, focusY: 0.5 },
  },
  {
    chapter: 'THE STORM',
    speaker: 'General Iron-Claw',
    text: 'Seize the keeper of the Heartbloom! Without her, the canopy will wither, and every realm will bow to the Highland Fortress!',
    scene: {
      world: 1, mood: 'storm', particles: 'rain', zoom: 1.08, focusX: 0.5,
      actors: [
        { kind: 'milo', x: 0.22, scale: 0.95 },
        { kind: 'daisy', x: 0.46, scale: 0.95 },
        { kind: 'boss', world: 10, x: 0.74, scale: 1.25, facing: -1, angry: true },
      ],
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
        { kind: 'daisy_wave', x: 0.64, y: 0.6, scale: 0.9 },
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
    text: 'Ten realms lay between Slomatt and the Highland Fortress, each ruled by one of the General\'s fearsome guardians. One hundred trials. One very determined sloth.',
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

export const WORLD_STORIES: Record<number, WorldStory> = {
  1: {
    teaser: 'Jennifur\'s trail begins in the treetops.',
    panels: [
      {
        chapter: 'WORLD 1 · EMERALD CANOPY', speaker: 'Slomatt',
        text: 'A pink petal! Jennifur was here. The trail leads up through the Emerald Canopy, and something large has been slithering through these branches.',
        scene: { ...W(1), actors: [{ kind: 'milo', x: 0.35 }, { kind: 'boss', world: 1, x: 0.7, scale: 1.0, silhouette: true, facing: -1 }] },
      },
    ],
  },
  2: {
    teaser: 'The river hides a very hungry king.',
    panels: [
      {
        chapter: 'WORLD 2 · SUNLIT RIVERBANK', speaker: 'Slomatt',
        text: 'More petals, floating downstream. Jennifur is making sure I do not get lost. Those river stones look slippery, and those logs look suspiciously like teeth.',
        scene: { ...W(2), actors: [{ kind: 'milo', x: 0.35 }, { kind: 'boss', world: 2, x: 0.7, scale: 1.0, silhouette: true, facing: -1 }] },
      },
    ],
  },
  3: {
    teaser: 'Glowworm threads light the way, and something watches.',
    panels: [
      {
        chapter: 'WORLD 3 · MOSSY GROTTO', speaker: 'Slomatt',
        text: 'The Grotto glows like a thousand lanterns. Beautiful, but I have the feeling I am being watched by two bright, patient eyes.',
        scene: { ...W(3, 'night'), actors: [{ kind: 'milo', x: 0.35 }, { kind: 'boss', world: 3, x: 0.7, scale: 1.0, silhouette: true, facing: -1 }] },
      },
    ],
  },
  4: {
    teaser: 'Mist, thunder falls, and wings above the clouds.',
    panels: [
      {
        chapter: 'WORLD 4 · MIST CASCADES', speaker: 'Slomatt',
        text: 'Waterfalls as tall as the sky! A feather drifts down from above. It is the size of my whole arm. I should not look up. I am looking up.',
        scene: { ...W(4), actors: [{ kind: 'milo', x: 0.35 }, { kind: 'boss', world: 4, x: 0.7, scale: 1.0, silhouette: true, facing: -1 }] },
      },
    ],
  },
  5: {
    teaser: 'Orchids bloom, and so do cobwebs.',
    panels: [
      {
        chapter: 'WORLD 5 · ORCHID SANCTUARY', speaker: 'Slomatt',
        text: 'A carving in the bark: "Slomatt, I know you will save me." Jennifur! But the silk threads between these orchids are thicker than vines…',
        scene: { ...W(5), actors: [{ kind: 'milo', x: 0.35 }, { kind: 'boss', world: 5, x: 0.7, scale: 1.0, silhouette: true, facing: -1 }] },
      },
    ],
  },
  6: {
    teaser: 'The mangrove swamp swallows the sun.',
    panels: [
      {
        chapter: 'WORLD 6 · DEEP MANGROVE', speaker: 'Slomatt',
        text: 'The roots twist like a maze and the water is perfectly still. In my experience, perfectly still water means something enormous is holding its breath.',
        scene: { ...W(6, 'dusk'), actors: [{ kind: 'milo', x: 0.35 }, { kind: 'boss', world: 6, x: 0.7, scale: 1.0, silhouette: true, facing: -1 }] },
      },
    ],
  },
  7: {
    teaser: 'Crumbling temples guard a stony secret.',
    panels: [
      {
        chapter: 'WORLD 7 · ANCIENT RUINS', speaker: 'Slomatt',
        text: 'Moss-covered statues, golden idols, and a temple door that is slightly open. Jennifur came through here. So did something very heavy.',
        scene: { ...W(7), actors: [{ kind: 'milo', x: 0.35 }, { kind: 'boss', world: 7, x: 0.7, scale: 1.0, silhouette: true, facing: -1 }] },
      },
    ],
  },
  8: {
    teaser: 'Fireflies, moonlight, and a monarch of the night.',
    panels: [
      {
        chapter: 'WORLD 8 · TWILIGHT TREETOPS', speaker: 'Slomatt',
        text: 'The sun has gone to bed and the fireflies are awake. I would sleep too, but Jennifur is out there somewhere, and so is something with very large wings.',
        scene: { ...W(8, 'night'), actors: [{ kind: 'milo', x: 0.35 }, { kind: 'boss', world: 8, x: 0.7, scale: 1.0, silhouette: true, facing: -1 }] },
      },
    ],
  },
  9: {
    teaser: 'Lava rivers and a dragon who hates visitors.',
    panels: [
      {
        chapter: 'WORLD 9 · VOLCANIC JUNGLE', speaker: 'Slomatt',
        text: 'The jungle is on fire! Well, glowing. The rocks are warm, the air tastes like pepper, and the biggest lizard I have ever seen is clearing his throat.',
        scene: { ...W(9, 'dusk'), particles: 'embers', actors: [{ kind: 'milo', x: 0.35 }, { kind: 'boss', world: 9, x: 0.7, scale: 1.0, silhouette: true, facing: -1 }] },
      },
    ],
  },
  10: {
    teaser: 'The Highland Fortress. Jennifur is close.',
    panels: [
      {
        chapter: 'WORLD 10 · STORMY HIGHLANDS', speaker: 'Slomatt',
        text: 'There it is: the Highland Fortress, and the lightning above it. Every guardian is behind me now. Jennifur, I can see the tower. One last climb.',
        scene: { ...W(10, 'storm'), particles: 'rain', actors: [{ kind: 'milo', x: 0.3 }, { kind: 'boss', world: 10, x: 0.7, scale: 1.0, silhouette: true, facing: -1 }] },
      },
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
    ],
    tip: 'Shadow Prowler vanishes, then pounces. Watch the glowing eyes and strike as he lands.',
  },
  4: {
    intro: [
      { speaker: 'Sky Sovereign', text: 'No creature climbs past my cliffs. Behold the Harpy Matriarch, queen of the winds!' },
      { speaker: 'Slomatt', text: 'Your Majesty, I only need to get past. Jennifur needs me.' },
    ],
    defeat: [
      { speaker: 'Sky Sovereign', text: 'A sloth, outflying a queen… Ha! Your courage is worth a feather. Take the wind lane, it leads to the orchids.' },
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
    ],
    tip: 'The Queen shoots webs in a spread. Jump between them and punch her when she drops down.',
  },
  6: {
    intro: [
      { speaker: 'Marsh Reaver', text: 'Hssst. Who wades into the Reaver\'s blackwater? Nobody wades into the Reaver\'s blackwater!' },
      { speaker: 'Slomatt', text: 'Sorry! I was only passing through. Very, very slowly. Is that a real spear?' },
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
    ],
    defeat: [
      { speaker: 'General Iron-Claw', text: 'Impossible… I was the strongest in the whole forest. Why did you not give up?' },
      { speaker: 'Slomatt', text: 'Because I was never fighting for the forest. I was fighting for her.' },
    ],
    tip: 'Iron-Claw lunges with his steel claw and stomps. Dodge both, then punch his helmet.',
  },
};

export const ENDING_PANELS: StoryPanel[] = [
  {
    chapter: 'EPILOGUE', speaker: 'Jennifur',
    text: 'Slomatt! You followed every petal! I knew you would!',
    scene: {
      world: 10, mood: 'glow', particles: 'sparkles', zoom: 1.4, focusX: 0.5,
      actors: [
        { kind: 'milo', x: 0.3, scale: 1.1, pose: 'happy' },
        { kind: 'daisy_wave', x: 0.68, scale: 1.1 },
      ],
    },
  },
  {
    chapter: 'EPILOGUE', speaker: 'Slomatt',
    text: 'It took me ten realms, one hundred trials, and a very long nap in the middle. Worth every slow step.',
    scene: {
      world: 10, mood: 'glow', particles: 'sparkles', zoom: 1.35, focusX: 0.46,
      actors: [
        { kind: 'milo', x: 0.3, scale: 1.1 },
        { kind: 'daisy', x: 0.68, scale: 1.1, facing: -1 },
      ],
    },
  },
  {
    chapter: 'EPILOGUE', speaker: 'Narrator',
    text: 'With the General gone, the storm broke and the sun poured over the Highlands. Far away, back in the Emerald Canopy, the Heartbloom began to glow.',
    scene: { world: 1, mood: 'glow', actors: [{ kind: 'bloom', x: 0.5, y: 0.8, scale: 1.5 }], particles: 'petals' },
  },
  {
    chapter: 'THE END', speaker: 'Jennifur',
    text: 'Come on, Slomatt. Let us go home and watch it bloom. Slowly, of course.',
    scene: {
      world: 1, mood: 'dusk', particles: 'petals', zoom: 1.35, focusX: 0.5,
      actors: [
        { kind: 'milo', x: 0.36, scale: 1.2, pose: 'happy' },
        { kind: 'bloom', x: 0.52, y: 0.8, scale: 1.0 },
        { kind: 'daisy', x: 0.68, scale: 1.2, facing: -1 },
      ],
    },
  },
];

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
