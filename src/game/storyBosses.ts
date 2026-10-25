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
      { speaker: 'Venom Fang', text: 'Ssloth. What are you doing on my branch?', boss: 'calm' },
      { speaker: 'Pokey', text: 'I\'m going to get Meeca back.', pokey: 'determined' },
      { speaker: 'Venom Fang', text: 'You\'re going to take her from him? From the General. Up there. I was told to stop anyone who followed her. I pictured a soldier. A hawk, maybe. I did not picture this.', boss: 'calm' },
      { speaker: 'Venom Fang', text: 'You\'ll have to get through me, ssloth. Take all the time you need. Someone has to.' },
      { speaker: 'Pokey', text: 'I usually do.', sting: 'laugh' },
    ],
    defeat: [
      { speaker: 'Venom Fang', text: 'Beaten. By a sloth. Not even a fast one. The slowest sloth in the whole rainforest.' },
      { speaker: 'Pokey', text: 'Wait till the neighbors hear.', sting: 'laugh' },
      { speaker: 'Venom Fang', text: 'If anyone asks, I tied myself in this knot on purpose.' },
      { speaker: 'Pokey', text: 'Sure you did.' },
      { speaker: 'Venom Fang', text: 'Don\'t look at the collar. It itches. It always itches. She went north, toward the river. She thanked me too, on the way past. Nobody thanks me. The king at the river has a crown now. Don\'t laugh at it.', boss: 'calm', cue: 'tender', intensity: 0.4 },
    ],
    tip: 'Venom Fang strikes after a red ring flashes. Jump over the lunge, then punch his head.',
  },
  2: {
    intro: [
      { speaker: 'Crocus Rex', text: 'HALT! You stand on the bank of Crocus Rex, King of the Sunlit Riverbank! The toll is one traveler, and today, my friend, you are it. Wait. You\'re the one following her? You? I\'ve watched logs float past faster than you, and they weren\'t even trying.' },
      { speaker: 'Pokey', text: 'Nice crown.' },
      { speaker: 'Crocus Rex', text: 'Don\'t look at it. It\'s crooked. The little keeper made it for me on the way across, with a soldier on each arm, and it is crooked, and it is staying crooked.', boss: 'calm' },
      { speaker: 'Pokey', text: 'It suits you.' },
      { speaker: 'Crocus Rex', text: 'Does it? No. NO. Nice try. It is a matter of professional pride that I bite something first.' },
    ],
    defeat: [
      { speaker: 'Crocus Rex', text: 'Upside down! I, Crocus Rex, King of the Sunlit Riverbank, upside down in my own mud! The village will never let me hear the end of it. They\'ll make a sign!' },
      { speaker: 'Pokey', text: 'They\'re pretty slow. You\'ve got a few years.', sting: 'laugh' },
      { speaker: 'Crocus Rex', text: 'My crown! Where is my... oh. There. Fine. You may have the river. The General need not know. And tell her it was never crooked. Tell her I said so.', boss: 'calm', cue: 'tender', intensity: 0.4 },
      { speaker: 'Pokey', text: 'I\'ll tell her.' },
      { speaker: 'Crocus Rex', text: 'Now go. Before I\'m ordered to be unreasonable.', boss: 'calm' },
    ],
    tip: 'Crocus Rex opens his jaws wide before he snaps. Hit his head when the jaws close.',
  },
  3: {
    intro: [
      { speaker: 'Shadow Prowler', text: 'Word came down the river that the snake lost to a sloth. I did not believe it. I still do not.', boss: 'calm' },
      { speaker: 'Shadow Prowler', text: 'You will not hit what you cannot find, little sloth. I am the dark between the threads. I try to be.' },
      { speaker: 'Pokey', text: 'I can wait.' },
      { speaker: 'Shadow Prowler', text: 'Everyone says that. Then they hurry. Everyone hurries. Nobody has ever lasted me past the second hour.', boss: 'calm' },
      { speaker: 'Pokey', text: 'I never learned how to hurry.', pokey: 'determined' },
    ],
    defeat: [
      { speaker: 'Shadow Prowler', text: 'Two hours, and you did not look at the sky once. I got tired first. That has never happened to me.' },
      { speaker: 'Pokey', text: 'Two hours? Try two days on a vine sometime.', sting: 'laugh' },
      { speaker: 'Shadow Prowler', text: 'Meeca went north, toward the clouds. The thorns on our necks are called the Iron Pact. Ask the others how it began. I am not permitted to say.', boss: 'calm', cue: 'reveal', intensity: 0.35 },
    ],
    tip: 'Shadow Prowler vanishes, then pounces. Watch the glowing eyes and strike as he lands.',
  },
  4: {
    intro: [
      { speaker: 'Sky Sovereign', text: 'Nothing climbs my cliffs. State your business, sloth, and keep it short. I was mid-dive.' },
      { speaker: 'Pokey', text: 'I\'m going to get Meeca back. She came through here with a column of soldiers.', pokey: 'determined' },
      { speaker: 'Sky Sovereign', text: 'I saw her. She waved. I have orders concerning whatever follows her. You\'re the one who went off the ledge in the gorge. Nothing climbs out of that gorge. How?', boss: 'calm' },
      { speaker: 'Pokey', text: 'Slowly.', sting: 'laugh' },
      { speaker: 'Sky Sovereign', text: 'The cat says you outwaited him. Cats lie.' },
    ],
    defeat: [
      { speaker: 'Sky Sovereign', text: 'Enough. I am on the ground. I am never on the ground. The owls will be talking about this for a year.' },
      { speaker: 'Pokey', text: 'I won\'t tell anybody.' },
      { speaker: 'Dot', text: 'I\'m telling everybody.', sting: 'laugh' },
      { speaker: 'Sky Sovereign', text: 'The cliff is yours. I am relieved, if you must know. Do not repeat that. And I did not cut your ledge. I will not have it said that I did.', boss: 'calm' },
      { speaker: 'Pokey', text: 'I know. I heard who did.' },
      { speaker: 'Sky Sovereign', text: 'Good. Take the wind lane to the orchids, and mind the next collar. The General\'s hand is on every one of them, and it does not ask.', boss: 'calm' },
    ],
    tip: 'Sky Sovereign dives from above. Dodge sideways, then punch her as she pulls out of the dive.',
  },
  5: {
    intro: [
      { speaker: 'Tarantula Queen', text: 'Welcome, darling. Do stay awhile. Everyone does. Eventually.' },
      { speaker: 'Pokey', text: 'I can\'t stay. My friend\'s in a tower.' },
      { speaker: 'Dot', text: 'There\'s a doily, Pokey. Nothing good has ever had a doily.' },
      { speaker: 'Tarantula Queen', text: 'The eagle sent word a sloth was coming, so I set the table. A week ago. I thought, he\'ll be along any minute, darling. And then I thought, no. No, he won\'t.', boss: 'calm' },
      { speaker: 'Pokey', text: 'Sorry I\'m late. Somebody carved me a note about your chairs.', sting: 'laugh' },
    ],
    defeat: [
      { speaker: 'Tarantula Queen', text: 'My webs. Fifty years of silk, and a sloth walks straight through it. Well. It was only silk, darling.' },
      { speaker: 'Pokey', text: 'I\'ll send a thank-you note.', sting: 'laugh' },
      { speaker: 'Tarantula Queen', text: 'Don\'t go yet. The pot\'s still warm. The cat told you to ask how it began, didn\'t he? Sit. I\'ll tell you.', boss: 'calm', cue: 'tender', intensity: 0.4 },
    ],
    tip: 'The Queen shoots webs in a spread. Jump between them and punch her when she drops down.',
  },
  6: {
    intro: [
      { speaker: 'Marsh Reaver', text: 'Who wades into the blackwater at noon? Nobody wades at noon. It is LUNCH.' },
      { speaker: 'Pokey', text: 'I know what time it is. I\'m not waiting.', pokey: 'determined' },
      { speaker: 'Marsh Reaver', text: 'Wait. You\'re the sloth. The runners talk about you when they bring my lunch. "The sloth is coming. The sloth is slow. The sloth is somehow still coming." I thought you\'d be taller.', boss: 'calm' },
      { speaker: 'Pokey', text: 'I\'m taller upside down.', sting: 'laugh' },
    ],
    defeat: [
      { speaker: 'Marsh Reaver', text: 'You waded in at LUNCH and WON. Nobody wins at lunch. The runners are going to sing about this.' },
      { speaker: 'Pokey', text: 'Your lunch is getting cold.' },
      { speaker: 'Marsh Reaver', text: 'It is cold NOW. Hrmph. Keep your feet. The ruins are past the reeds, and the third root is a crocodile. GO.', boss: 'calm', sting: 'laugh' },
    ],
    tip: 'The Reaver smashes the ground to send out mud waves. Jump on the beat, duck the spear thrust, then punch him while he recovers.',
  },
  7: {
    intro: [
      { speaker: 'Stone Idol Golem', text: 'I... heard... you were... coming. Three... weeks... ago. You... are... early.', boss: 'calm' },
      { speaker: 'Pokey', text: 'First time for everything.', sting: 'laugh' },
      { speaker: 'Stone Idol Golem', text: 'I... am... the guardian... of this... temple. None... may... pass.' },
      { speaker: 'Pokey', text: 'Finally. Somebody I can keep up with.' },
      { speaker: 'Stone Idol Golem', text: 'I... have... waited... a thousand... years. For...', boss: 'calm' },
    ],
    defeat: [
      { speaker: 'Stone Idol Golem', text: 'In... under... an hour. You are... so... fast.' },
      { speaker: 'Pokey', text: 'Say that again. Slower. I want to enjoy it.', sting: 'laugh' },
      { speaker: 'Stone Idol Golem', text: 'The rune... is broken. The way up... is open. Behind... the rune...' },
      { speaker: 'Pokey', text: 'Take your time.' },
      { speaker: 'Stone Idol Golem', text: 'I... always... do.', boss: 'calm' },
      { speaker: 'Stone Idol Golem', text: 'There is... a photograph. The General asked me... to keep it... from you. I am... sorry. I do not... think... I should.', boss: 'calm', cue: 'reveal', intensity: 0.35 },
    ],
    tip: 'The Golem\'s rune glows before a smash. Dodge it, then punch the glowing rune on his chest.',
  },
  8: {
    intro: [
      { speaker: 'Night-Wing Monarch', text: 'Good evening, little climber. They say you have beaten seven of us. I hoped you would take the long way, through the dreams.', boss: 'calm' },
      { speaker: 'Pokey', text: 'I\'m going to get Meeca back.', pokey: 'determined' },
      { speaker: 'Night-Wing Monarch', text: 'I am told to stop you. I will try to do it softly. You talk in your sleep, you know. I was on the branch above you, writing it down. Then the bird woke you in the middle, and I have been wondering since where the petal was going.', boss: 'calm' },
      { speaker: 'Pokey', text: 'I didn\'t know anybody was up there.', pokey: 'determined' },
    ],
    defeat: [
      { speaker: 'Night-Wing Monarch', text: 'Hm. I was asked to stop you softly. I am not sure that counts.' },
      { speaker: 'Pokey', text: 'You were very soft about it.', sting: 'laugh' },
      { speaker: 'Night-Wing Monarch', text: 'Will you tell me how it ends? The dream. The bird woke you before the petal got anywhere.', boss: 'calm' },
      { speaker: 'Pokey', text: 'It ends with me getting there.', pokey: 'determined' },
      { speaker: 'Night-Wing Monarch', text: 'Ah. A good ending. Then take the lava road. The Drake lives on it. He is bad at visitors. Be patient with the fire.', boss: 'calm' },
    ],
    tip: 'The Monarch swoops in the dark. Listen for the screech, dodge, then punch as she turns.',
  },
  9: {
    intro: [
      { speaker: 'Magma Drake', text: 'You came. Eight of them said you would, and I did not tidy. I am to burn you. There is a speech that goes with it. I have lost my place.', boss: 'calm' },
      { speaker: 'Pokey', text: 'It starts with "I am to burn you." You did that part.', sting: 'laugh' },
      { speaker: 'Magma Drake', text: 'Don\'t be— what is that? On your wrist. It glows. Is it for me?', boss: 'calm' },
      { speaker: 'Pokey', text: 'No.' },
      { speaker: 'Magma Drake', text: 'No. Of course not. Then we will see what it can do.' },
    ],
    defeat: [
      { speaker: 'Magma Drake', text: 'My fire. A hundred years I kept that going, and the first visitor puts it out. I suppose that is what visitors are for.' },
      { speaker: 'Pokey', text: 'You sound terrible. Drink some water.' },
      { speaker: 'Magma Drake', text: 'Will you come back? After. Bring tea. Two cups.', boss: 'calm', cue: 'tender', intensity: 0.4 },
      { speaker: 'Pokey', text: 'Maybe. If you tidy.', sting: 'laugh' },
      { speaker: 'Magma Drake', text: 'Go. Now. Before I say something nice.', boss: 'calm' },
    ],
    tip: 'The Drake breathes fire along the ground. Jump the flame, then punch when he rears back.',
  },
  10: {
    intro: [
      { speaker: 'General Iron-Claw', text: 'Nine hundred and ninety-nine steps. I counted. Still slow, boy.' },
      { speaker: 'Pokey', text: 'Still here, sir. I\'ve come for Meeca. Where\'s Dot?', pokey: 'determined', cue: 'resolve', intensity: 0.5 },
      { speaker: 'General Iron-Claw', text: 'I do not know where your bird is, and I find that I mind. You did not hurry once, boy. I watched for it. Slow gets people killed.', cue: 'war', intensity: 0.7 },
      { speaker: 'Pokey', text: 'I know it does, sir. My folks went out in a storm when I was little. The warning came late. Tonight I found out whose warning it was. She\'s my best friend, sir. She\'s been late my whole life. She came back every time.', cue: 'hush', intensity: 0.3 },
      { speaker: 'General Iron-Claw', text: 'Then you know what it costs. I have buried what late costs. I will not bury another.', sting: 'blow' },
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
/** Dot travels with Pokey in every world except the ones where she has gone to find a way in (6 and 7) and the last, where she is lost in the thorns */
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
    { speaker: 'Thornbark', text: 'Grrr... the thorns... they whisper... Leave this hollow, little sloth...' },
    { speaker: 'Pokey', text: 'You were the Jungle Guardian. Meeca\'s grandma told me about you. The thorns did this to you, didn\'t they?' },
    { speaker: 'Thornbark', text: 'I would not kneel. The others did. I would not. The thorns grew through me... to teach me...', boss: 'calm' },
    { speaker: 'Thornbark', text: 'I cannot stop them... they want you gone. RUN... or FIGHT.' },
  ];
  const defeat: BossLine[] = [
    { speaker: 'Thornbark', text: 'The thorns... they are gone. I can think again. A sloth. They sent... a sloth. No. Nobody sent you.' },
    { speaker: 'Pokey', text: 'I didn\'t beat them. I just kept coming back until they got tired of me. It\'s my best skill.' },
    { speaker: 'Pokey', text: 'You were right, you know. Not to kneel.' },
    { speaker: 'Thornbark', text: 'Nobody has said that. Not in nine years. Nine of them knelt. I am the one who would not. The keeper before her sat among my roots for fifty years, humming. Your Meeca hums the same song. Tell her an old tree is listening.' },
    { speaker: 'Thornbark', text: 'Take this Thorn Heart. It was a heart before the thorns grew around it. Go and bring your Meeca home.' },
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
