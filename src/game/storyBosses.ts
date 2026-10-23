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
      { speaker: 'Venom Fang', text: 'Sssloth. I am supposssed to tell you I will eat you twice before lunch. Consider it ssaid.', boss: 'calm' },
      { speaker: 'Dot', text: 'He\'d have to catch me first, and I\'m very hard to catch, I once spent forty minutes inside a teapot and nobody knew.' },
      { speaker: 'Pokey', text: 'Excuse me. We\'re looking for Meeca. May we come through, please?' },
      { speaker: 'Venom Fang', text: 'Ssomeone asssked. Nobody asssks. It changesss nothing. Ssstand there, I have been told to bite you.' },
    ],
    defeat: [
      { speaker: 'Venom Fang', text: 'I shall not be mentioning the knot. If anyone asks, I did it on purpose.' },
      { speaker: 'Pokey', text: 'Of course. Thank you. And I\'m sorry about the knot.' },
      { speaker: 'Venom Fang', text: 'Do not look at the collar. It itchesss. It always itchesss. The fortresss is north. Ssstay off the high branchesss, the others will not be asssking.' },
    ],
    tip: 'Venom Fang strikes after a red ring flashes. Jump over the lunge, then punch his head.',
  },
  2: {
    intro: [
      { speaker: 'Crocus Rex', text: 'HALT! You stand on the bank of Crocus Rex, King of the Sunlit Riverbank. The toll is one traveler, and today, my friend, you are it.' },
      { speaker: 'Pokey', text: 'Your Majesty. May I cross, please? I only have a petal and a very polite request.' },
      { speaker: 'Crocus Rex', text: 'A petal! The little keeper wove me this on her way past, with a soldier on each arm. It is crooked. It will stay crooked. Do not look at it.', boss: 'calm' },
      { speaker: 'Pokey', text: 'It suits you, Your Majesty.' },
      { speaker: 'Crocus Rex', text: '...Does it? No. NO. Nice try. It is a matter of professional pride that I bite something first.' },
    ],
    defeat: [
      { speaker: 'Crocus Rex', text: 'The crown! Mind the crown! ...Still on. Good. You may have the river. I do it because you were polite, and the General need not know that.' },
      { speaker: 'Pokey', text: 'Thank you. I\'ll tell Meeca you\'re wearing it.' },
      { speaker: 'Crocus Rex', text: 'Tell her it was never crooked. Tell her I said so. Now go, before I am ordered to be unreasonable.' },
    ],
    tip: 'Crocus Rex opens his jaws wide before he snaps. Hit his head when the jaws close.',
  },
  3: {
    intro: [
      { speaker: 'Shadow Prowler', text: 'You will not hit what you cannot find, little sloth. I am told I am the dark between the threads. I try to be.' },
      { speaker: 'Pokey', text: 'I can wait. I\'m told it\'s unnerving.' },
      { speaker: 'Shadow Prowler', text: 'Everyone says that. Then they hurry. Everyone hurries. No promise has ever lasted me past the second hour.', boss: 'calm' },
      { speaker: 'Pokey', text: 'I never learned how.' },
    ],
    defeat: [
      { speaker: 'Shadow Prowler', text: 'Two hours, and you did not look at the sky once. I got tired first. That has never happened to me.' },
      { speaker: 'Pokey', text: 'Sorry. It\'s the only trick I have.' },
      { speaker: 'Shadow Prowler', text: 'Meeca went north, toward the clouds. The thorns on our necks are called the Iron Pact. Ask the others how it began. I am not permitted to say.' },
    ],
    tip: 'Shadow Prowler vanishes, then pounces. Watch the glowing eyes and strike as he lands.',
  },
  4: {
    intro: [
      { speaker: 'Sky Sovereign', text: 'Nothing climbs my cliffs. State your business, sloth, and keep it short. I was mid-dive.' },
      { speaker: 'Pokey', text: 'Your Majesty. I\'m looking for my friend. She came through here with a column of soldiers.' },
      { speaker: 'Sky Sovereign', text: 'I saw her. She waved. I have orders concerning whatever follows her.', boss: 'calm' },
      { speaker: 'Pokey', text: 'I fell off the last ledge. I\'d rather not do it twice.' },
    ],
    defeat: [
      { speaker: 'Sky Sovereign', text: 'Enough. The cliff is yours. I am relieved, if you must know. Do not repeat that.' },
      { speaker: 'Sky Sovereign', text: 'Also, I did not cut your ledge. I will not have it said that I did.', boss: 'calm' },
      { speaker: 'Pokey', text: 'I know.' },
      { speaker: 'Sky Sovereign', text: 'Good. Take the wind lane to the orchids, and mind the next collar. The General\'s hand is on every one of them, and it does not ask.', boss: 'calm' },
    ],
    tip: 'Sky Sovereign dives from above. Dodge sideways, then punch her as she pulls out of the dive.',
  },
  5: {
    intro: [
      { speaker: 'Tarantula Queen', text: 'Welcome, dear. Do stay awhile. Everyone does. Eventually.' },
      { speaker: 'Pokey', text: 'It\'s lovely, Your Majesty. I can\'t stay. My friend is in a tower.' },
      { speaker: 'Dot', text: 'There\'s a doily, Pokey. Nothing good has ever had a doily.' },
      { speaker: 'Tarantula Queen', text: 'You did not eat the cake, dear. Nobody has ever not eaten the cake.', boss: 'calm' },
      { speaker: 'Pokey', text: 'I was told it was a trap. It looked lovely, though.' },
    ],
    defeat: [
      { speaker: 'Tarantula Queen', text: 'My webs. Well. They were only silk, dear.' },
      { speaker: 'Pokey', text: 'They were beautiful, Your Majesty.' },
      { speaker: 'Tarantula Queen', text: 'Don\'t go yet. The kettle is already on.', boss: 'calm' },
    ],
    tip: 'The Queen shoots webs in a spread. Jump between them and punch her when she drops down.',
  },
  6: {
    intro: [
      { speaker: 'Marsh Reaver', text: 'Who wades into the blackwater at noon? Nobody wades at noon. It is LUNCH.' },
      { speaker: 'Pokey', text: 'I lost track of the time. I\'m only passing through.' },
      { speaker: 'Marsh Reaver', text: 'Wait. You are the sloth. The runners talk about you when they bring my lunch. "The sloth is coming. The sloth is slow. The sloth is somehow still coming." I thought you would be taller.', boss: 'calm' },
      { speaker: 'Pokey', text: 'I\'m taller upside down.' },
    ],
    defeat: [
      { speaker: 'Marsh Reaver', text: 'Hrmph. Keep your feet. The ruins are past the reeds, and the third root is a crocodile.' },
      { speaker: 'Pokey', text: 'Thank you. I\'ll leave you your lunch.' },
      { speaker: 'Marsh Reaver', text: 'It is cold now. GO.', boss: 'calm' },
    ],
    tip: 'The Reaver smashes the ground to send out mud waves. Jump on the beat, duck the spear thrust, then punch him while he recovers.',
  },
  7: {
    intro: [
      { speaker: 'Stone Idol Golem', text: 'I… am… the guardian… of this… temple. None… may… pass.' },
      { speaker: 'Pokey', text: 'Finally. Somebody I can keep up with.' },
      { speaker: 'Stone Idol Golem', text: 'I… have… waited… a thousand… years. For…', boss: 'calm' },
      { speaker: 'Pokey', text: 'I\'ll wait.', pokey: 'happy' },
    ],
    defeat: [
      { speaker: 'Stone Idol Golem', text: 'The rune… is broken. The way up… is open.' },
      { speaker: 'Pokey', text: 'Thank you. Rest well.' },
      { speaker: 'Stone Idol Golem', text: 'Behind… the rune…' },
      { speaker: 'Pokey', text: 'Take your time.' },
      { speaker: 'Stone Idol Golem', text: 'I… always… do.' },
      { speaker: 'Stone Idol Golem', text: 'There is… a photograph. The General asked me… to keep it… from you. I am… sorry. I do not… think… I should.' },
    ],
    tip: 'The Golem\'s rune glows before a smash. Dodge it, then punch the glowing rune on his chest.',
  },
  8: {
    intro: [
      { speaker: 'Night-Wing Monarch', text: 'Good evening, little climber. I am told to stop you. I shall try to do it softly.' },
      { speaker: 'Pokey', text: 'I only want my friend back.' },
      { speaker: 'Night-Wing Monarch', text: 'You talk in your sleep, you know. I was on the branch above you, writing it down. Then the bird woke you in the middle, and I have been wondering since where the petal was going.', boss: 'calm' },
      { speaker: 'Pokey', text: 'I didn\'t know anyone was up there.', pokey: 'determined' },
    ],
    defeat: [
      { speaker: 'Night-Wing Monarch', text: 'Hm. I was asked to stop you softly. I am not sure that counts.' },
      { speaker: 'Night-Wing Monarch', text: 'Will you come back and tell me how it ends? The dream. The bird woke you before the petal got anywhere.', boss: 'calm' },
      { speaker: 'Pokey', text: 'If I get there, I will.' },
      { speaker: 'Night-Wing Monarch', text: 'Then take the lava road. The Drake lives on it. He is bad at visitors. Be patient with the fire.', boss: 'calm' },
    ],
    tip: 'The Monarch swoops in the dark. Listen for the screech, dodge, then punch as he turns.',
  },
  9: {
    intro: [
      { speaker: 'Magma Drake', text: 'I am to burn you. There is a speech that goes with it. I have lost my place.' },
      { speaker: 'Pokey', text: 'I\'d rather not be burned, thank you. May I pass? I brought a petal.' },
      { speaker: 'Magma Drake', text: 'Soldiers do not bring petals. Soldiers do not bring anything. Is it for me? No. Of course not. Then we will see what it can do.', boss: 'calm' },
      { speaker: 'Dot', text: 'It\'s a FLOWER, it\'s smaller than my head, please stop looking at it like a weapon!' },
    ],
    defeat: [
      { speaker: 'Magma Drake', text: 'My fire. A hundred years I kept that going, and the first visitor puts it out. I suppose that is what visitors are for.' },
      { speaker: 'Pokey', text: 'I\'d like to visit again, when this is over. Drink some water. You sound terrible.' },
      { speaker: 'Magma Drake', text: 'Bring tea. Two cups. Now go, before I say something nice.', boss: 'calm' },
    ],
    tip: 'The Drake breathes fire along the ground. Jump the flame, then punch when he rears back.',
  },
  10: {
    intro: [
      { speaker: 'General Iron-Claw', text: 'Nine hundred and ninety-nine steps. I counted. Still slow, boy.' },
      { speaker: 'Pokey', text: 'Sir. I\'ve come for Meeca. And I\'d like to know what\'s become of Dot.', pokey: 'determined', cue: 'resolve', intensity: 0.5 },
      { speaker: 'General Iron-Claw', text: 'I do not know where your bird is, and I find that I mind. You did not hurry once, boy. I watched for it. Slow gets people killed.', cue: 'war', intensity: 0.7 },
      { speaker: 'Pokey', text: 'I know what it costs, sir. I\'ve never said it was free.' },
      { speaker: 'General Iron-Claw', text: 'I have buried what slow costs. I will not bury another.', sting: 'blow' },
    ],
    defeat: [
      { speaker: 'General Iron-Claw', text: 'You climbed every step. Why did you not turn back?', cue: 'hush', intensity: 0.2 },
      { speaker: 'Pokey', text: 'She was at the top, sir.', pokey: 'tired' },
      { speaker: 'General Iron-Claw', text: 'I left the door open. I told myself it was a trap.', cue: 'sorrow', intensity: 0.3 },
      { speaker: 'Pokey', text: 'It was a good door, sir. It fit.', pokey: 'tired' },
    ],
    tip: 'Iron-Claw has no single weak point. The glow shows where his last move left him bare. Hit the glow.',
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
