/**
 * Settings > About (R-165.158): "What's ours", "Our story" and "Inspired by", in the story keeper's words, copied exactly from
 * reference/packets/2026-11-12/STORY-LINES.md (t-story): the FINAL layout (Matt's ruling 3:58 PM ET, approved 4:00 PM), "What's ours"
 * FINAL (approved 4:10 PM) with the music line (Matt 11:13 PM: "the music was written for the game itself"; the lead closed it 11:19 PM),
 * and the full "Inspired by" page (29 games: PUBG and Fortnite dropped, Matt 11:25 PM). About is a living page that claims only what
 * ships (the keeper keeps reference/story/ABOUT-OURS.md): change a line here only with the keeper's words.
 * The "Our story" then-and-now picture pair and its caption wait for their painted pictures (the lead, 11-13).
 */
export const WHATS_OURS: readonly string[] = [
  'Pokey, Meeca, Dot, and everyone they meet along the way.',
  'Their story, from the first petal to the last letter, and the journal Pokey keeps.',
  'Ten rainforest worlds, with art made for this game in its own style, and music written just for it.',
  'Gameplay crafted to tell that story the whole way through, and many ideas of our own along the way.',
  "Dot, who helps when you're stuck, and never tells.",
];

export const OUR_STORY: readonly string[] = [
  "My wife thinks sloths are cute. One day she said she'd like a sloth game, so I started making one, just for fun.",
  'Pokey (Pocono, really) and Meeca are named after two of our cats, who did everything together. A little of how they act is theirs, too.',
  'The first version was one sloth, some branches and a row of buttons. Then Pokey needed a reason to keep going.',
  'So we gave him one: Meeca, carried off to the north, and a trail of petals she dropped so he could follow.',
  'The story was written, then rewritten world by world, until every voice sounded like itself. Dot never stops talking. The General never says "I".',
  'Ten worlds grew around it, each with its own guardian, and each with something new for Pokey to learn.',
  'The very first stage has been rebuilt from the ground up more than once, until the jumps felt right.',
  'Levels are played on real phones, upright and sideways, and by testers, little ones included.',
  "It's still a little project, just for fun. It just got bigger.",
];

export const INSPIRED_INTRO =
  'Sloths is our tribute to the classic 2D platformers and the little arcade games that came before it. Every idea we borrowed, we grew into something the rainforest could call its own. Some are still on their way.';

/** one line: the game titles (shown bold, joined with "and"), then what each gave Sloths */
export const INSPIRED_BY: readonly { games: readonly string[]; gave: string }[] = [
  { games: ['Adventure Island'], gave: "an energy meter, which became Pokey's drowsiness." },
  { games: ['Angry Birds'], gave: 'a slingshot, which became a vine that flings him.' },
  { games: ['Balloon Fight'], gave: 'floating up, which became a ride on kapok fluff.' },
  { games: ['Bionic Commando'], gave: 'grabbing the underside of things.' },
  { games: ['Bubble Bobble'], gave: 'bubbles that lift you, and trap whoever is chasing.' },
  { games: ['Celeste'], gave: 'getting right back up after a fall, and wind that pushes you.' },
  { games: ['Contrast'], gave: 'things that are only there in the light.' },
  { games: ['Dark Souls'], gave: 'a mimic, which became a forest that always blinks first.' },
  { games: ['Donkey Kong'], gave: 'barrels down the ladders, which became rolling nuts and falling fruit.' },
  { games: ['Donkey Kong Country Returns'], gave: 'stages in silhouette at sunset.' },
  { games: ['Donkey Kong Jr.'], gave: 'climbing two vines at once, and fruit dropped on whoever is below.' },
  { games: ['Downwell'], gave: 'a whole stage that goes down.' },
  { games: ['Elevator Action'], gave: 'riding a lift, which became a vine elevator.' },
  { games: ['Flower', 'Okami'], gave: 'a trail that blooms where you walk.' },
  { games: ['Frogger'], gave: 'lanes to cross, and turtles that sink.' },
  { games: ['Hades', 'Loop Hero'], gave: 'choosing what comes next.' },
  { games: ['Ice Climber'], gave: 'climbing up, and breaking through from below.' },
  { games: ['The Legend of Zelda'], gave: 'sinking with heavy boots, a world in reflection, rooms that change.' },
  { games: ['Mario Bros.'], gave: 'the POW block, which became a hollow-log drum.' },
  { games: ['Metal Gear Solid 3'], gave: "camouflage, which became Pokey's stillness." },
  { games: ["Montezuma's Revenge"], gave: 'timed doors and coloured keys.' },
  { games: ['Ori and the Blind Forest'], gave: 'a forest that glows at night.' },
  { games: ['Pikmin', "Yoshi's Island"], gave: 'little ones who follow you home.' },
  { games: ['Pitfall!'], gave: 'swinging vines, tunnels below, and crocodile stepping stones.' },
  { games: ['Q*bert', 'Amidar'], gave: 'changing every step you land on.' },
  { games: ['Rodeo Stampede'], gave: 'riding the animals.' },
  { games: ['Sokoban'], gave: 'pushing things into place.' },
  { games: ['Super Mario Bros.', 'Super Mario World'], gave: 'hidden warps, ghosts that creep while you look away, crumbling platforms and a cape to float on.' },
  { games: ['Thief'], gave: 'sneaking by sound.' },
  { games: ['Wario Land 4'], gave: 'hit a switch, then race back.' },
];

export const REAL_RAINFOREST = {
  title: 'The real rainforest',
  gave: 'a sloth who stays safe by staying still, a harpy eagle that watches for movement, and a frog whose colours are its warning.',
};

export const NOT_AFFILIATED = 'Sloths Rainforest Adventures is not affiliated with or endorsed by any of these games or their makers.';
