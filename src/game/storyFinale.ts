/**
 * The ending, from the moment the General falls. About ten minutes, and everything the story has been saving up:
 *   THE SONG      Meeca sings; the ten collars crack; the guardians come home
 *   THE MERCY     the armor splits; a grandfather and a granddaughter; the keepsakes Pokey carried up the mountain
 *   THE LETTER    Dot, alive, and what he has been carrying for nine years
 *   THE BLESSING  "You may walk with her. Sometimes."
 *   EPILOGUE      the hill, the seeds, the jokes that finally land
 *   THE END       and one more petal
 * `found` is what the player has picked up in the Library: each keepsake adds a small scene of its own, and a full set adds Grandma's last word.
 */
import { chapter, D, GEN, GM, M, N, OFF, P, pan, say, type Beat } from './storyDsl.ts';
import { LULLABY } from './storyMemories.ts';
import { allFound } from './finds.ts';
import type { StoryPanel } from './story.ts';

const VF = say('Venom Fang');
const CROCUS = say('Crocus Rex');
const PROWLER = say('Shadow Prowler');
const QUEEN = say('Tarantula Queen');
const GOLEM = say('Stone Idol Golem');
const DRAKE = say('Magma Drake');
const MONARCH = say('Night-Wing Monarch');

/** the ten guardians on the fortress walls in full colour, and Thornbark at the back: a cast string */
const wallX = (w: number) => 0.07 + (w - 1) * 0.0905;
const WALL = `${Array.from({ length: 10 }, (_, i) => `B${i + 1}@${wallX(i + 1).toFixed(3)}^.74*.34${i + 1 > 5 ? '<' : '>'}`).join(' ')} T@.93^.74*.34<`;
const zoomOn = (x: number) => ({ zoom: 2.4, focusX: x, focusY: 0.66 });


export function finalePanels(found: string[] = []): StoryPanel[] {
  const has = (id: string) => found.includes(id);
  const all = allFound(found);
  const when = (cond: boolean, beats: Beat[]): Beat[] => (cond ? beats : []);

  // ───────────── THE SONG ─────────────
  const song = chapter({ name: 'THE SONG', w: 10, m: 'storm', cue: 'hush', i: 0.2, base: { particles: 'rain' } }, [
    N('The General went down in the rain, and the whole mountain seemed to hold its breath. In the walls the iron thorns of the Pact trembled. Nobody cheered.',
      'P:tired@.22 G#@.58*.85<', { sting: 'blow' }),
    P('Sir. Please stay down. I don\'t want to hit you again.', 'P:talk@.22 G#@.58*.85<'),
    GEN('Then why did you come so far? ...What did you want?', 'P:tired@.22 G#@.58*.85<', { cue: 'sorrow', i: 0.3 }),
    P('To bring her home. And you, I think. I only just worked that out.', 'PF:worried+calm@.4', { cue: 'reveal', i: 0.3 }),
    N('And from the high tower, somebody began to sing.', 'P:tired@.2 G#@.55*.85< M:sing@.9^.3*.6<', { cue: 'meeca', i: 0.35, p: pan(1.1, 0.4, 0.62, 1.3, 0.85, 0.35, 5) }),
    M(LULLABY, 'M:sing@.9^.3*.6< G#@.55*.85<', { cue: 'meeca', i: 0.8, sting: 'bloom', m: 'dusk', p: { particles: 'petals', zoom: 1.5, focusX: 0.88, focusY: 0.38 } }),
    N('The thorns of the Pact went still. One by one, along the walls of the fortress, the guardians lifted their heads.', WALL, { cue: 'tender', i: 0.6, p: { particles: 'petals', ...pan(1.15, 0.12, 0.6, 1.15, 0.88, 0.6, 9) } }),
    VF('Sssso... that is the ssong. Ssomeone ought to have ssung it to usss ssooner.', WALL, { p: zoomOn(wallX(1)) }),
    CROCUS('I would like it noted that I kept the crown.', WALL, { p: zoomOn(wallX(2)), sting: 'laugh' }),
    PROWLER('Sloth. The ledge. It was never my paw, even when it was my paw. Sing again, keeper. Whatever he asks of us now, we will not.', WALL, { p: zoomOn(wallX(3)), cue: 'resolve', i: 0.7 }),
    QUEEN('Tea is at four, dears. Everyone is invited. Even you, General.', WALL, { p: zoomOn(wallX(5)), cue: 'tender', i: 0.6 }),
    GOLEM('Late... but... here.', WALL, { p: zoomOn(wallX(7)), cue: 'tender', i: 0.6 }),
    MONARCH('I once listened to an entire dream. I should like to hear how this one ends.', WALL, { p: zoomOn(wallX(8)), cue: 'finale', i: 0.7 }),
    DRAKE('*cough* I will be on the roof. Nobody is to light anything.', WALL, { p: zoomOn(wallX(9)), sting: 'laugh' }),
    N('Ten iron collars cracked, and fell, and rang on the stones like a handful of dropped bells. And on the courtyard floor, the armor that had held the General upright for nine years began to crack as well.',
      WALL, { cue: 'mercy', i: 0.7, sting: 'bloom', p: { particles: 'petals', zoom: 1.1, focusX: 0.5, fx: [{ at: 1.5, kind: 'shake', amount: 6, dur: 0.8 }] } }),
  ]);

  // ───────────── THE MERCY ─────────────
  const merc = { name: 'THE MERCY', w: 10, m: 'glow' as const, cue: 'mercy' as const, i: 0.5, base: { particles: 'sparkles' as const } };
  const mercy = chapter(merc, [
    N('The General\'s armor split from shoulder to knee, and a very old, very tired soldier stood up inside it.',
      'P:idle@.22 GN:crack@.62*.85', {
        sting: 'bloom',
        p: {
          zoom: 1.5, focusX: 0.6,
          camera: { from: { zoom: 1.2, fx: 0.55, fy: 0.62 }, to: { zoom: 1.6, fx: 0.6, fy: 0.62 }, dur: 8 },
          fx: [{ at: 3.4, kind: 'flash', dur: 0.4 }, { at: 3.4, kind: 'shake', amount: 9, dur: 0.5 }, { at: 3.4, kind: 'burst', x: 0.6, y: 0.56, amount: 1.3 }, { at: 6.0, kind: 'glints', x: 0.6, y: 0.6 }],
        },
      }),
    M('Hello, Grandpa.', 'P:idle@.22 GN:sorrow@.6*.85 M:sad@.84', { cue: 'sorrow', i: 0.35, sting: 'heartbreak' }),
    GEN('Little bloom.', 'P:idle@.22 GN:sorrow@.6*.85 M:sad@.84', { cue: 'grandma', i: 0.4 }),
    GEN('I called you that when you were three weeks old. Your grandmother said I was ridiculous. She said it every day, and every day she smiled.', '='),
    M('I worked it out in the tower. Every night, somebody stood outside my door and never knocked. Only one person in the world ever stood and waited like that.',
      'P:idle@.22 GN:sorrow@.6*.85 M:talk@.84', { p: { zoom: 1.5, focusX: 0.82 } }),
    ...when(has('w2_keepsake'), [
      M('And my locket. You fastened it on me the day I started school. "So you will always know your name." I never took it off.', 'P:idle@.22 GN:sorrow@.6*.85 M:sad@.84', { p: { zoom: 1.5, focusX: 0.8 } }),
      GEN('You were so small. I thought the chain would be too heavy for you.', '='),
    ]),
    GEN('The Heartbloom opened the same way the morning before the storm that took her. When I saw it open again, I thought: not again. Not her. So I came for the only thing I had left.', 'P:idle@.22 GN:sorrow@.6*.85 M:sad@.84', { cue: 'sorrow', i: 0.4, p: { zoom: 1.5, focusX: 0.6 } }),
    GEN('I only wanted to be early. Just once. Your grandmother waited for help, and it came too late. I swore that nothing I loved would ever have to wait again.', 'P:idle@.22 GN:sorrow@.6*.85 M:sad@.84',
      { cue: 'sorrow', i: 0.45, p: { zoom: 1.5, focusX: 0.6 } }),
    GEN('I put you in a tower and called it keeping you safe. I should have knocked.', 'P:idle@.22 GN:sorrow@.6*.85 M:sad@.84', { cue: 'sorrow', i: 0.45, p: { zoom: 1.5, focusX: 0.6 } }),
    N('Meeca did not say it was all right. She took his hand, which was the size of her whole arm.', 'P:idle@.22 GN:sorrow@.6*.85 M:sad@.84', { cue: 'tender', i: 0.4, p: { zoom: 1.5, focusX: 0.72 } }),
    GEN('You asked me for my blessing once, and I told you to come back when you could protect her. I thought it was a way to keep you away.', 'P:idle@.22 GN:sorrow@.6*.85 M:sad@.84', { cue: 'grandma', i: 0.5, p: { zoom: 1.5, focusX: 0.6 } }),
    GEN('You came back anyway. I counted every step, boy. I lost count at the river. I did not start again.', '='),
    ...when(has('w6_keepsake'), [
      M('Grandpa... is that my rattle?', 'P:happy@.22 GN:sorrow@.6*.85 M:surprised@.84', { cue: 'comedy', i: 0.4 }),
      GEN('It was the only thing that stopped you crying. I used it on the Council. It worked on them, too.', '=', { sting: 'laugh' }),
    ]),
    ...when(has('w7_keepsake'), [
      P('Sir, who sewed the eye back on the bear?', 'P:talk@.22 GN:sorrow@.6*.85 M:happy@.84', { cue: 'comedy', i: 0.4 }),
      GEN('A soldier is trained in needlework. ...I was not very good at it. The eye is on the wrong side.', 'P:talk@.22 GN:sorrow@.6*.85 M:laugh@.84', { sting: 'laugh' }),
      M('It looks surprised. I always loved that.', '=', { cue: 'tender', i: 0.4 }),
    ]),
    ...when(has('w9_keepsake'), [
      GEN('I always stopped the watch one second early. So that you would beat your time. You never knew.', 'P:idle@.22 GN:sorrow@.6*.85 M:happy@.84', { cue: 'tender', i: 0.45 }),
      M('Grandpa. I always knew.', 'P:idle@.22 GN:sorrow@.6*.85 M:laugh@.84'),
      GEN('...You did?', '='),
      M('I let you.', '=', { sting: 'bloom' }),
    ]),
    ...when(has('w3_keepsake'), [
      P('Sir, I found a medal in a fern. On the back it says "For the next cub."', 'P:talk@.22 GN:sorrow@.6*.85 M:happy@.84', { cue: 'tender', i: 0.4, p: { zoom: 1.5, focusX: 0.26 } }),
      GEN('I scratched that on the back the day they gave it to me. For the river. I was keeping it for a cub who would need it more than I did.', 'P:talk@.22 GN:sorrow@.6*.85 M:happy@.84', { p: { zoom: 1.5, focusX: 0.6 } }),
      P('I think I\'m a little old to be a cub, sir.', 'P:talk@.22 GN:sorrow@.6*.85 M:happy@.84', { p: { zoom: 1.5, focusX: 0.26 } }),
      GEN('You are exactly the right age to be brave and foolish. Keep it.', 'P:surprised@.22 GN:sorrow@.6*.85 M:happy@.84', { cue: 'resolve', i: 0.5, sting: 'triumph', p: { zoom: 1.5, focusX: 0.6 } }),
    ]),
    ...when(has('w4_keepsake'), [
      P('There was half a ribbon in a fern. The knot was still tied.', 'P:talk@.22 GN:sorrow@.6*.85 M:sad@.84', { cue: 'sorrow', i: 0.4, p: { zoom: 1.5, focusX: 0.26 } }),
      GEN('She tied it around our wrists the day we were married. When she was gone, I could not undo the knot. I had to cut it.', 'P:idle@.22 GN:sorrow@.6*.85 M:sad@.84', { cue: 'grandma', i: 0.5, p: { zoom: 1.5, focusX: 0.6 } }),
      N('He opened his gauntlet. Inside was the other half. Pokey laid his beside it. The cut ends were a thumb\'s width short, so the General tied them with a bit of string from his belt.', 'P:idle@.22 GN:sorrow@.6*.85', { cue: 'tender', i: 0.5, sting: 'bloom', p: { zoom: 1.6, focusX: 0.44, fx: [{ at: 1.0, kind: 'glints', x: 0.45, y: 0.7 }] } }),
    ]),
    ...when(has('w1_keepsake'), [
      P('There was a key in a fern, too, on a green ribbon.', 'P:talk@.22 GN:sorrow@.6*.85 M:surprised@.84', { p: { zoom: 1.5, focusX: 0.26 } }),
      GEN('I wore that for a year. I thought I had lost it in the first storm.', 'P:talk@.22 GN:sorrow@.6*.85 M:surprised@.84', { p: { zoom: 1.5, focusX: 0.6 } }),
      M('It\'s the key to Grandma\'s music box. It plays the song.', 'P:idle@.22 GN:sorrow@.6*.85 M:talk@.84', { cue: 'meeca', i: 0.5 }),
      N('Meeca wound it. The little box played Grandma\'s song, all the way through, a little out of tune. The General bowed his head, and for a long time nobody said a word.', 'P:idle@.22 GN:sorrow@.6*.85 M:sad@.84', { cue: 'grandma', i: 0.7, sting: 'bloom', p: { particles: 'petals' } }),
    ]),
    ...when(has('w5_keepsake'), [
      P('There was a petal, too. It says: "Be patient with the slow ones. They always arrive."', 'P:talk@.22 GN:sorrow@.6*.85 M:happy@.84', { cue: 'grandma', i: 0.5 }),
      GEN('...That is her handwriting. Everything of hers was in a fern. I am beginning to think the bird has a problem.', 'P:talk@.22 GN:sorrow@.6*.85 M:happy@.84', { sting: 'laugh' }),
    ]),
    ...when(all, [
      M('That\'s every one, Grandpa. Every last thing of hers.', 'P:happy@.26 GN:sorrow@.58*.85 M:happy@.84', { cue: 'tender', i: 0.6, sting: 'bloom' }),
      GEN('In ferns. Of course. ...Thank you for being patient enough to find them, boy.', '=', { cue: 'grandma', i: 0.5 }),
    ]),
  ]);

  // ───────────── THE LETTER ─────────────
  const letter = chapter({ name: 'THE LETTER', w: 10, m: 'glow', cue: 'comedy', i: 0.5, base: { particles: 'sparkles' } }, [
    D('Hello! I\'m alive! Everybody stay calm! I fell into the cookhouse! I have been eating very well!', 'P:surprised@.22 GN:tunic_stand@.62*.85 M:surprised@.84 D:cheer@.46^.34', { sting: 'laugh' }),
    OFF('He has been no trouble at all, ma\'am. Sir. Everyone. ...I apologize.', '='),
    P('Dot!', 'P:cheer@.22 GN:tunic_stand@.62*.85 M:happy@.84 D@.46^.34', { cue: 'journey', i: 0.6, sting: 'triumph' }),
    D('I\'m so sorry I\'m late. I know. I\'m always...', 'P:happy@.22 GN:tunic_stand@.62*.85 M:happy@.84 D@.46^.34'),
    D('General. I have something I should have brought you nine years ago.', 'P:idle@.22 GN:tunic_stand@.62*.85 M:idle@.84 D@.5^.34', { cue: 'sorrow', i: 0.35, p: { zoom: 1.5, focusX: 0.5 } }),
    N('Dot took the pouch from his side, and with both claws he held out a letter. It was yellow at the edges, and sealed with a single faded petal.', '=', { cue: 'tender', i: 0.3 }),
    D('She gave it to me in the storm, on the last night. "Give him this when he can sit still," she said. I flew at dawn, and the storm kept me one day. One day. And afterward I was afraid it would say it was my fault.',
      '=', { cue: 'sorrow', i: 0.4 }),
    GEN('Give it here, little courier.', 'P:idle@.22 GV:reach_a@.62*.85 M:sad@.84 D@.5^.34', { cue: 'grandma', i: 0.4 }),
    GM('My dearest. If you are reading this, you are sitting down, which means something has gone very right or very wrong.', '', { ph: ['s3_02', 'Grandma', 0.46, -0.02], cue: 'grandma', i: 0.6, p: { memory: true } }),
    GM('I am not afraid. I want you to know that first. This storm is nobody\'s fault. The little bird will fly as fast as a bird can fly, which is faster than anyone has a right to. And if he is late, tell him he was exactly on time.', '', { ph: ['s2_05', 'Everyone who loved her', 0.5, 0.02], p: { memory: true } }),
    GM('Do not build a wall out of me. Walls keep out the rain, and also the people who would carry you through it.', '', { ph: ['s2_06', 'The hill', 0.5, -0.02], cue: 'sorrow', i: 0.6, p: { memory: true } }),
    GM('Be slow with our girl. And be slow with yourself, my love. I will be on the hill.', '', { ph: ['s3_02', 'Grandma', 0.46, -0.02], cue: 'meeca', i: 0.8, sting: 'bloom', p: { memory: true } }),
    GEN('Late is a thing that happens to birds, and to weather. I made it a crime.', 'P:idle@.22 GV:kneel_read@.62*.85 M:sad@.84 D@.5^.34', { cue: 'mercy', i: 0.6, m: 'glow', p: { memory: false, zoom: 1.5, focusX: 0.6 } }),
    GEN('I am sorry, Dot. I am sorry I let you carry that.', 'P:idle@.22 GV:wipe_eye@.62*.85 M:sad@.84 D@.5^.34'),
    D('...Exactly on time. She said I was exactly on time.', 'P:happy@.22 GV:hand_heart@.62*.85 M:sad@.84 D@.5^.34', { cue: 'sorrow', i: 0.5 }),
    D('I cannot afford the water weight.', 'P:happy@.22 GV:gentle@.62*.85 M:happy@.84 D@.5^.34', { cue: 'tender', i: 0.5, sting: 'laugh' }),
  ]);

  // ───────────── THE BLESSING ─────────────
  const blessing = chapter({ name: 'THE BLESSING', w: 10, m: 'glow', cue: 'tender', i: 0.5, base: { particles: 'petals' } }, [
    GEN('Boy.', 'P:idle@.22 GN:tunic_stand@.6*.85 M:happy@.82', { cue: 'resolve', i: 0.5 }),
    P('Sir?', 'P:talk@.22 GN:tunic_stand@.6*.85 M:happy@.82'),
    GEN('Come back when you can protect her, I said. ...You protected her from me. I suppose that counts.', '='),
    GEN('You... may... walk... with her.', 'P:happy@.22 GN:tunic_stand@.6*.85 M:cheer@.82', { cue: 'tender', i: 0.7, sting: 'triumph' }),
    GEN('...Sometimes.', '='),
    M('Grandpa!', 'P:cheer@.22 GN:tunic_stand@.6*.85 M:cheer@.82', { cue: 'finale', i: 0.8 }),
    GEN('...Mostly.', '=', { sting: 'laugh' }),
    N('It took the General forty-five seconds to say it. Pokey fell asleep halfway through. Everyone let him.', 'PF:calm+calm_closed@.4', { cue: 'tender', i: 0.4, sting: 'laugh' }),
    ...when(has('w10_keepsake'), [
      P('Sir, I think this is yours. It was in a fern.', 'P:talk@.22 GN:tunic_stand@.6*.85 M:surprised@.82', { cue: 'grandma', i: 0.5 }),
      N('It was a small bronze bell, green with age. Grandma had rung it whenever someone she loved was coming home. It had not rung since the day she died.', 'P:idle@.22 GN:tunic_stand@.6*.85', { p: { zoom: 1.6, focusX: 0.5, fx: [{ at: 1.0, kind: 'glints', x: 0.5, y: 0.7 }] } }),
      N('The General turned it over in his big hands. Then, very gently, he rang it. One clear note went out over the walls and down the mountain, the way it used to go down a garden path.',
        'P:idle@.22 GN:tunic_stand@.6*.85 M:sad@.82', { cue: 'meeca', i: 0.7, sting: 'bloom', p: { zoom: 1.6, focusX: 0.6, fx: [{ at: 0.6, kind: 'glints', x: 0.6, y: 0.6 }] } }),
      GEN('Somebody is coming home.', 'P:idle@.22 GN:tunic_stand@.6*.85 M:sad@.82', { cue: 'meeca', i: 0.8 }),
      M('Yes, Grandpa. You are.', '='),
    ]),
  ]);

  // ───────────── EPILOGUE ─────────────
  const epilogue = chapter({ name: 'EPILOGUE', w: 10, m: 'glow', cue: 'finale', i: 0.7, base: { castle: 7, particles: 'sparkles' } }, [
    M('Pokey! You followed every petal! I knew you would!', 'P:cheer@.3*1.1 MW:cheer@.68*1.1', { p: { zoom: 1.4 } }),
    P('It took me ten realms, one hundred trials, and a very long nap in the middle. Worth every slow step.', 'PH:hug_a@.5*1.1', { p: { zoom: 1.35, focusX: 0.5 } }),
    N('The storm broke and the sun poured over the Highlands. The ten guardians went home, the creatures in the cages cheered, and far away in the Emerald Canopy the Heartbloom began to glow.',
      'H:ultimate@.5^.8*1.5', { w: 1, m: 'day', cue: 'bloom', i: 0.8, sting: 'bloom', p: { castle: undefined, zoom: 1.0, particles: 'petals' } }),
    N('Down at the Sunlit Riverbank, Gruntlewick the crier reached the end of his flood warning. It had taken three weeks. Everyone applauded. Someone asked what to do about the flood. Gruntlewick said that was a separate announcement.', 'TC:announce@.5*.95', { w: 2, cue: 'comedy', i: 0.5, sting: 'laugh', p: { castle: undefined, zoom: 1.1 } }),
    N('At the top of the bank, the slow mailman finally delivered his one parcel. It was the flood warning, addressed to Gruntlewick. Both of them agreed it had arrived exactly on time.', 'PO:offer_parcel@.36*.95 TC:scroll@.62*.95', { w: 2, sting: 'laugh', p: { castle: undefined, zoom: 1.1 } }),
    N('In the ruins, the Stone Idol Golem finally finished a sentence. Nobody was left to hear it. He said it was still worth saying.', '', { w: 7, m: 'dusk', p: { castle: undefined, zoom: 1.1 } }),
    N('Lieutenant Pell left the army that spring and opened a tailor\'s shop at the foot of the mountain. He apologized to his first customer for the stitches. She bought three coats.', 'LP:sew_table@.5*1.0', { w: 1, m: 'day', cue: 'comedy', i: 0.5, sting: 'laugh', p: { zoom: 1.1 } }),
    N('At four o\'clock exactly, the Tarantula Queen poured the tea. The General sat in a chair far too small for him and finished a whole cup. "It is a trap with biscuits," said Dot, who had been invited too, and who had four.', 'GN:tunic_stand@.62*.8 D@.34^.5*.9', { w: 5, m: 'day', cue: 'tender', i: 0.4, sting: 'laugh', p: { zoom: 1.1 } }),
    N('Dot\'s tail grew back by autumn, except for one very long, very grand feather that had floated down out of the clouds with a note pinned to it: "Worth a feather." Dot wore it for the rest of his life. He told everyone it was natural.', 'D@.5^.42*1.3', { w: 4, m: 'day', cue: 'comedy', i: 0.5, sting: 'laugh', p: { zoom: 1.2 } }),
    N('Three days later, the village guard arrived at the fortress, sword drawn. "Did anyone hear a loud noise?" he asked. Nobody had the heart to tell him.', '', { w: 10, m: 'day', cue: 'comedy', i: 0.5, sting: 'laugh', p: { zoom: 1.1 } }),
    N('On the hill, in the first quiet the Highlands had known in years, they climbed up to the oldest tree, where the valley is widest.', 'P:happy@.3 M:happy@.5 GN:sorrow@.7*.85', { w: 10, m: 'dusk', cue: 'tender', i: 0.4, p: { zoom: 1.2, particles: 'petals' } }),
    GEN('Hello, love. I brought the whole family.', 'P:idle@.2 M:sad@.4 GV:look_up@.64*.85', { cue: 'grandma', i: 0.6, sting: 'heartbreak', p: { zoom: 1.5, focusX: 0.64 } }),
    ...when(has('w8_keepsake'), [
      N('Pokey took a paper packet from his satchel, the one he had found in a fern in the Twilight Treetops. Meeca read the label. "For the hill," she said. "Plant when it is quiet." It was. The three of them knelt in the grass together, and none of them said a word.', 'P:happy@.34 M:happy@.54 GN:sorrow@.74*.8', { cue: 'tender', i: 0.5, sting: 'bloom', p: { zoom: 1.35 } }),
    ]),
    N('That night, in the tallest tower, one lamp stayed lit. Nobody asked who it was for.', '', { w: 10, m: 'night', cue: 'hush', i: 0.25, p: { zoom: 1.15 } }),
  ]);

  // ───────────── THE END ─────────────
  const end = chapter({ name: 'THE END', w: 1, m: 'dusk', cue: 'finale', i: 0.7, base: { particles: 'petals' } }, [
    M('Come on, Pokey. Let\'s go home and watch it bloom. Slowly, of course.', 'PH:stand_smile@.34*1.1 H:epic@.68^.8', { p: { zoom: 1.35 } }),
    N('Home was exactly as they had left it, except the Heartbloom was open, and a snail who had set off across the garden path on the morning of the storm was one centimetre from the finish line.', 'PH:arm_around@.34*1.1 H:epic@.68^.8', { cue: 'tender', i: 0.5, p: { zoom: 1.2 } }),
    P('He deserves it. He trained.', 'PH:cheek_glad@.34*1.1 H:epic@.68^.8', { sting: 'laugh' }),
    N('And far away, the petal tied to Pokey\'s wrist glowed once, and pointed back at the tallest tower.', 'PX:petal_glow@.4', { m: 'night', cue: 'bloom', i: 0.5, sting: 'cliffhanger', p: { fx: [{ at: 1.2, kind: 'glints', x: 0.55, y: 0.78 }] } }),
  ]);

  return [...song, ...mercy, ...letter, ...blessing, ...epilogue, ...end];
}
