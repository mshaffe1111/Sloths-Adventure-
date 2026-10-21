/**
 * The ten guardians and the secret one: what they say before the fight (every attempt, so it stays short) and after it.
 * Each guardian wears an iron collar with thorns on the inside, the Iron Pact, and each one is a prisoner of a promise that was made in grief.
 * They are fought hard and forgiven: the more of them Pokey beats, the more he learns about who put the collars on and why.
 */
import { chapter, type Beat } from './storyDsl.ts';
import type { SceneMood, StoryCue, StoryPanel, StorySting } from './story.ts';

export interface BossLine {
  speaker: string;
  text: string;
  /** Pokey's mood in this picture (defaults: talking when he speaks, calm otherwise, happy after a win) */
  pokey?: string;
  /** the boss in this picture: 'calm' stops the angry pose on a boss line */
  boss?: 'calm' | 'angry';
  cue?: StoryCue;
  intensity?: number;
  sting?: StorySting;
}

export interface BossStory {
  intro: BossLine[];
  defeat: BossLine[];
  tip: string;
}

export const BOSS_STORIES: Record<number, BossStory> = {
  1: {
    intro: [
      { speaker: 'Venom Fang', text: 'Sssilly sloth. Do you know how long it takes you to climb one tree? Long enough for me to eat you twice.' },
      { speaker: 'Dot', text: 'He would have to catch ME first. Please don\'t make him try.' },
      { speaker: 'Pokey', text: 'Then I\'ll have to be quick about it. Where is Meeca?' },
      { speaker: 'Venom Fang', text: 'Sssomewhere high. Ssafe, the General ssays. ...I do not enjoy sssaying it.', boss: 'calm' },
    ],
    defeat: [
      { speaker: 'Venom Fang', text: 'Impossssible… a sloth, tied me in a knot… The General\'sss fortress is north. Go on, sssnack.' },
      { speaker: 'Pokey', text: 'Thank you. And I\'m sorry about the knot. Mostly.' },
    ],
    tip: 'Venom Fang strikes after a red ring flashes. Jump over the lunge, then punch his head.',
  },
  2: {
    intro: [
      { speaker: 'Crocus Rex', text: 'These waters belong to me! Nobody crosses my river without paying a toll. Today\'s toll is you.' },
      { speaker: 'Pokey', text: 'I only have a petal and a very polite request. Please let me through.' },
      { speaker: 'Crocus Rex', text: 'A petal? The little keeper came by wearing a crown of them. Made me wear one too. I looked magnificent. Do NOT tell the General.', boss: 'calm' },
      { speaker: 'Pokey', text: 'My lips are sealed. May I please cross?' },
      { speaker: 'Crocus Rex', text: 'Not before I have bitten something. It is a matter of professional pride.' },
    ],
    defeat: [
      { speaker: 'Crocus Rex', text: 'Blub… my crown… my dignity… Fine! The river is open. The General is not as forgiving as I am.' },
      { speaker: 'Pokey', text: 'Noted. Please keep the crown. It suits you.' },
    ],
    tip: 'Crocus Rex opens his jaws wide before he snaps. Hit his head when the jaws close.',
  },
  3: {
    intro: [
      { speaker: 'Shadow Prowler', text: 'You cannot punch what you cannot catch, little sloth. I am the dark between the glowworm threads.' },
      { speaker: 'Pokey', text: 'I can wait. I\'m told it\'s unsettling.' },
      { speaker: 'Shadow Prowler', text: 'Everyone says that. Then they hurry. Everyone hurries.', boss: 'calm' },
      { speaker: 'Pokey', text: 'It\'s the one thing I have never learned to do.' },
    ],
    defeat: [
      { speaker: 'Shadow Prowler', text: 'You… waited. You just waited, and I got tired. Nobody ever does that. Meeca passed north, toward the clouds.' },
      { speaker: 'Pokey', text: 'Sorry. It\'s the only trick I know.' },
      { speaker: 'Shadow Prowler', text: 'The thorns on our necks are called the Iron Pact. Ask the others how it began.' },
    ],
    tip: 'Shadow Prowler vanishes, then pounces. Watch the glowing eyes and strike as he lands.',
  },
  4: {
    intro: [
      { speaker: 'Sky Sovereign', text: 'No creature climbs past my cliffs. Behold the Harpy Matriarch, queen of the winds!' },
      { speaker: 'Pokey', text: 'Your Majesty, I only need to get past. Meeca needs me.' },
      { speaker: 'Sky Sovereign', text: 'Everyone needs something. I need you to hold still while I dive on you.', boss: 'calm' },
      { speaker: 'Pokey', text: 'Please don\'t. I\'ve already lost one ledge this week.' },
    ],
    defeat: [
      { speaker: 'Sky Sovereign', text: 'A sloth, outflying a queen… Ha! And I am relieved, honestly. Your courage is worth a feather. Take the wind lane, it leads to the orchids.' },
      { speaker: 'Pokey', text: 'You\'re kinder than your talons suggest.' },
      { speaker: 'Sky Sovereign', text: 'I did not cut your ledge, little one. The General\'s reach is long, and it is not clean. Mind the next collar you meet.', boss: 'calm' },
    ],
    tip: 'Sky Sovereign dives from above. Dodge sideways, then punch her as she pulls out of the dive.',
  },
  5: {
    intro: [
      { speaker: 'Tarantula Queen', text: 'Welcome to my sanctuary, dear. Do stay awhile. Everyone does. Eventually.' },
      { speaker: 'Pokey', text: 'That\'s very polite, and also very sticky. No thank you.' },
      { speaker: 'Dot', text: 'There\'s a doily, Pokey. Nothing good has ever had a doily.' },
      { speaker: 'Tarantula Queen', text: 'You did not eat the cake, dear. Nobody has ever not eaten the cake.', boss: 'calm' },
      { speaker: 'Pokey', text: 'I was told it was a trap. Sorry. It looked lovely.' },
    ],
    defeat: [
      { speaker: 'Tarantula Queen', text: 'My webs, my beautiful webs! Hmph. The mangrove swamp is next. Mind the Reaver. He is not polite.' },
      { speaker: 'Pokey', text: 'I\'ll remember that. Thank you for the warning, Your Majesty.' },
      { speaker: 'Tarantula Queen', text: 'And, dear: the General is not afraid of you. He is afraid of being late. Remember that when you meet him.' },
    ],
    tip: 'The Queen shoots webs in a spread. Jump between them and punch her when she drops down.',
  },
  6: {
    intro: [
      { speaker: 'Marsh Reaver', text: 'Hssst. Who wades into the Reaver\'s blackwater at NOON? Nobody wades in at noon! It is LUNCH!' },
      { speaker: 'Pokey', text: 'Sorry! I was only passing through. Very, very slowly. Is that a real spear?' },
      { speaker: 'Marsh Reaver', text: '…Wait. You are the sloth. The General talks about you at every meal. "The sloth is coming. The sloth is slow. The sloth is somehow still coming." I thought you would be taller.', boss: 'calm' },
      { speaker: 'Pokey', text: 'I get that a lot.' },
    ],
    defeat: [
      { speaker: 'Marsh Reaver', text: 'Hrmph… fine. Keep your feet. The ruins are past the reeds. Nobody tells the General a sloth got past my spear.' },
      { speaker: 'Pokey', text: 'I never saw a thing. Mind the mud, and keep that spear pointed somewhere else.' },
    ],
    tip: 'The Reaver smashes the ground to send out mud waves. Jump on the beat, duck the spear thrust, then punch him while he recovers.',
  },
  7: {
    intro: [
      { speaker: 'Stone Idol Golem', text: 'I… am… the guardian… of the… ancient… temple. None… may… pass.' },
      { speaker: 'Pokey', text: 'Finally, somebody who talks as slowly as I do.' },
      { speaker: 'Stone Idol Golem', text: 'I… have… waited… a thousand… years. For… someone… who… would… wait… back.', boss: 'calm' },
      { speaker: 'Pokey', text: 'I\'ll wait.', pokey: 'happy' },
    ],
    defeat: [
      { speaker: 'Stone Idol Golem', text: 'Crumble… the rune… is broken. The way up… is open. Meeca… went… that way.' },
      { speaker: 'Pokey', text: 'Thank you. Rest well, old friend.' },
      { speaker: 'Stone Idol Golem', text: 'Behind… the rune…' },
      { speaker: 'Pokey', text: 'Take your time.' },
      { speaker: 'Stone Idol Golem', text: 'I… always… do.' },
      { speaker: 'Stone Idol Golem', text: 'There… is… a photograph. He… asked me… to keep it… from you. I… am… sorry.' },
    ],
    tip: 'The Golem\'s rune glows before a smash. Dodge it, then punch the glowing rune on his chest.',
  },
  8: {
    intro: [
      { speaker: 'Night-Wing Monarch', text: 'The night belongs to me, little climber. Every star above this canopy answers to my wings.' },
      { speaker: 'Pokey', text: 'I don\'t want your stars. I want my friend back.' },
      { speaker: 'Night-Wing Monarch', text: 'You talk in your sleep, you know. I listened to the whole dream. A petal. A promise. Nobody has promised like that in all my nights.', boss: 'calm' },
      { speaker: 'Pokey', text: 'Then you know I can\'t stop.', pokey: 'determined' },
    ],
    defeat: [
      { speaker: 'Night-Wing Monarch', text: 'Hm. Even the night bows to loyalty. Take the lava road. The Drake awaits, and he has not had company in a century.' },
      { speaker: 'Pokey', text: 'I\'ll try to be good company.' },
    ],
    tip: 'The Monarch swoops in the dark. Listen for the screech, dodge, then punch as he turns.',
  },
  9: {
    intro: [
      { speaker: 'Magma Drake', text: 'Another visitor! You will make a fine snack. Or a fine hat. I have not decided.' },
      { speaker: 'Pokey', text: 'I\'d prefer neither. May I pass? Please? I brought a petal.' },
      { speaker: 'Magma Drake', text: 'Hm. Most visitors are the General\'s soldiers, and they never bring petals. Very well. Let us see what a petal can do.', boss: 'calm' },
      { speaker: 'Dot', text: 'It isn\'t a weapon! It\'s a very small flower!' },
    ],
    defeat: [
      { speaker: 'Magma Drake', text: 'Cough! You put out my fire with your sheer… stubbornness. Nobody has visited me in a hundred years. Not even to be unpleasant.' },
      { speaker: 'Pokey', text: 'I\'d like to visit again, when this is over. Drink some water. You sound terrible.' },
      { speaker: 'Magma Drake', text: '…Bring tea. Now go. The General\'s fortress is just beyond the clouds.', boss: 'calm' },
    ],
    tip: 'The Drake breathes fire along the ground. Jump the flame, then punch when he rears back.',
  },
  10: {
    intro: [
      { speaker: 'General Iron-Claw', text: 'Ten realms. A hundred trials. And here you stand at my door: the slow one. Still slow.' },
      { speaker: 'Pokey', text: 'Give her back, General. And tell me what happened to Dot.', pokey: 'determined', cue: 'resolve', intensity: 0.5 },
      { speaker: 'General Iron-Claw', text: 'I do not know where your bird is, and I find that I mind. Meeca is the last thing I have. And you are a kind, slow, hopeful boy. Kind, slow, hopeful boys are how the world takes people.', cue: 'war', intensity: 0.7 },
      { speaker: 'Pokey', text: 'I know what it costs, sir. I\'ve never said it was free.' },
      { speaker: 'General Iron-Claw', text: 'Slow gets people killed. I have buried what slow costs. I will not bury another.', sting: 'blow' },
    ],
    defeat: [
      { speaker: 'General Iron-Claw', text: 'Impossible… I built all of this so that nothing would ever be late again. Why did you not give up?', cue: 'hush', intensity: 0.2 },
      { speaker: 'Pokey', text: 'Because I was never fighting for the forest, sir. I was fighting for her.', pokey: 'determined' },
      { speaker: 'General Iron-Claw', text: 'I left the door open. I told myself it was a trap.', cue: 'sorrow', intensity: 0.3 },
      { speaker: 'Pokey', text: 'It was a good door, sir. It fit.', pokey: 'tired' },
    ],
    tip: 'Iron-Claw lunges with his steel claw and stomps. Dodge both, then punch his helmet.',
  },
};

const BOSS_MOODS: Record<number, SceneMood> = { 3: 'night', 6: 'dusk', 8: 'night', 9: 'dusk', 10: 'storm' };
/** Dot travels with Pokey in every world except the ones where he has gone ahead with a note (6 and 7) and the last, where he is lost in the thorns */
const DOT_WITH = new Set([1, 2, 3, 4, 5, 8, 9]);

/**
 * The cutscene panels for a boss encounter (before the fight) or its defeat (after).
 * The boss stands on the right, angry while it talks before a fight and dizzy after; Pokey on the left, calm until he speaks.
 */
export function bossPanels(world: number, kind: 'intro' | 'defeat', bossName: string): StoryPanel[] {
  const story = BOSS_STORIES[world] ?? BOSS_STORIES[1];
  const lines = kind === 'intro' ? story.intro : story.defeat;
  const bossSpeaker = lines.find((l) => l.speaker !== 'Pokey' && l.speaker !== 'Dot')?.speaker ?? bossName;
  const beats: Beat[] = lines.map((line, i) => {
    const bossTalks = line.speaker === bossSpeaker;
    const angry = kind === 'intro' && bossTalks && line.boss !== 'calm' || line.boss === 'angry';
    const pokey = line.pokey ?? (line.speaker === 'Pokey' ? (kind === 'defeat' ? 'happy' : 'talk') : 'idle');
    const dot = DOT_WITH.has(world) ? ' D@.44^.38*.85' : '';
    const boss = `B${world}${angry ? '!' : ''}${kind === 'defeat' ? '#' : ''}@.72<`;
    const b: Beat = { s: line.speaker, t: line.text, c: `P:${pokey}@.24${dot} ${boss}` };
    if (line.cue) b.cue = line.cue;
    if (line.intensity !== undefined) b.i = line.intensity;
    if (line.sting) b.sting = line.sting;
    if (kind === 'intro' && i === lines.length - 1) b.tip = story.tip;
    return b;
  });
  return chapter(
    {
      name: `${kind === 'intro' ? 'BOSS' : 'VICTORY'} · ${bossName.toUpperCase()}`,
      w: world,
      m: BOSS_MOODS[world] ?? 'day',
      base: { particles: world === 9 ? 'embers' : world === 10 ? 'rain' : 'sparkles' },
    },
    beats,
  );
}

/** The secret boss: the Jungle Guardian, twisted by thorns. After the fight he is himself again. */
export function thornbarkPanels(kind: 'intro' | 'defeat'): StoryPanel[] {
  const intro: BossLine[] = [
    { speaker: 'Thornbark', text: 'Grrr… the thorns… they whisper… Leave this hollow, little sloth…' },
    { speaker: 'Pokey', text: 'You were the Jungle Guardian. Grandma told me about you. The thorns did this to you, didn\'t they?' },
    { speaker: 'Thornbark', text: 'I would not kneel. The others did. I would not. The thorns grew through me… to teach me…', boss: 'calm' },
    { speaker: 'Thornbark', text: 'I cannot stop them… they want you gone. RUN… or FIGHT.' },
  ];
  const defeat: BossLine[] = [
    { speaker: 'Thornbark', text: 'The thorns… they are gone. I can think again. Thank you, small sloth.' },
    { speaker: 'Pokey', text: 'I didn\'t beat them. I just kept coming back until they got tired of me. It\'s my best skill.' },
    { speaker: 'Thornbark', text: 'The keeper before her sat among my roots for fifty years, humming. Your Meeca hums the same song. Tell her an old tree is listening.' },
    { speaker: 'Thornbark', text: 'Take this Thorn Heart. It was a heart all along; the thorns were only what grew around it. Go and bring your Meeca home.' },
  ];
  const lines = kind === 'intro' ? intro : defeat;
  const beats: Beat[] = lines.map((line, i) => {
    const talks = line.speaker === 'Thornbark';
    const angry = kind === 'intro' && talks && line.boss !== 'calm';
    const pokey = line.speaker === 'Pokey' ? (kind === 'defeat' ? 'happy' : 'talk') : 'idle';
    const b: Beat = { s: line.speaker, t: line.text, c: `P:${pokey}@.24 T${angry ? '!' : ''}${kind === 'defeat' ? '#' : ''}@.72<` };
    if (kind === 'intro' && i === lines.length - 1) b.tip = 'A red glow means an attack is coming. A hook or Mega Punch breaks it. Hit him when he tires.';
    return b;
  });
  return chapter(
    { name: kind === 'intro' ? 'SECRET BOSS · THORNBARK' : 'VICTORY · THORNBARK', w: 7, m: 'night', base: { particles: 'sparkles' } },
    beats,
  );
}
