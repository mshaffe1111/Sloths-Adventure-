/**
 * The ending, from the moment the General falls. Four chapters, each with one job:
 *   THE TOWER    Pokey lets go with one hand; the song frees the guardians; the war look goes out of the General (the red, the club, the cape, the
 *                spikes) and the plain sloth is what is left; Meeca is angry out loud and then takes his hand; the General stops counting; the blessing
 *   THE SEAM     Dot, alive and late again ("Seems to me it's still morning"), what she has carried since the storm; Grandma's letter ("It was only weather")
 *   THE MORNING  the village, Pell's tailor shop, the tea, the keepsakes, the last of the thunder
 *   THE END      the hill, and the snail half an inch from the finish
 * `found` is what the player has picked up in the Library: each keepsake adds a small scene of its own at the tea table, and a full set adds
 * Grandma's last word. The scenes on a plate are painted rooms (plateData.ts); the guardians and the vignettes use the stage's own scenery.
 */
import { chapter, D, GF, GM, M, N, OFF, P, pan, say, type Beat } from './storyDsl.ts';
import { LULLABY } from './storyMemories.ts';
import { allFound } from './finds.ts';
import type { StoryPanel } from './story.ts';

const VF = say('Venom Fang');
const CROCUS = say('Crocus Rex');
const PROWLER = say('Shadow Prowler');
const SOVEREIGN = say('Sky Sovereign');
const QUEEN = say('Tarantula Queen');
const REAVER = say('Marsh Reaver');
const GOLEM = say('Stone Idol Golem');
const DRAKE = say('Magma Drake');
const MONARCH = say('Night-Wing Monarch');

/** the guardians on the fortress walls in full colour: a cast string (Thornbark listens from his hollow, far away) */
const wallX = (w: number) => 0.07 + (w - 1) * 0.0905;
const WALL = Array.from({ length: 10 }, (_, i) => `B${i + 1}@${wallX(i + 1).toFixed(3)}^.74*.34${i + 1 > 5 ? '<' : '>'}`).join(' ');
/** a beat that leaves the painted room and plays on the stage's own scenery */
const OUT = { plate: undefined as string | undefined };
const zoomOn = (x: number) => ({ ...OUT, zoom: 2.4, focusX: x, focusY: 0.66 });

/** at the tea table: Pokey, Meeca, Dot, and the General in the chair at the head of the table, the one the Queen dusted every morning */
const TEA = 'P:happy@.2*.9 M:happy@.42*.9 GV:sit@.72*1.12 D@.5^.5*.9';
/** the same table a minute earlier: the General has his cup and is looking at that chair */
const TEA_UP = 'P:happy@.2*.9 M:happy@.42*.9 GV:tea@.72*1.12 D@.5^.5*.9';
const VIL = { plate: 'village' };

export function finalePanels(found: string[] = []): StoryPanel[] {
  const has = (id: string) => found.includes(id);
  const all = allFound(found);
  const when = (cond: boolean, beats: Beat[]): Beat[] => (cond ? beats : []);

  // ───────────── THE TOWER ─────────────
  const tower = chapter({ name: 'THE TOWER', w: 10, m: 'day', cue: 'hush', i: 0.2, base: { plate: 'courtyard', particles: 'rain' } }, [
    N('The General lay in the rubble in the middle of the courtyard. The thunder was still coming up the mountain after them both.',
      'P:duck@.26*.95 G#@.62*.9<', { sting: 'blow', p: pan(1.0, 0.5, 0.55, 1.15, 0.42, 0.62, 8) }),
    N('Pokey had hold of the nearest wall with both hands. He always held something when it thundered.',
      'P:duck@.26*.95 G#@.62*.9<', { p: { zoom: 1.35, focusX: 0.3, focusY: 0.66 } }),
    N('He let go with one hand.',
      'PN:sing_reach@.3*.95 G#@.62*.9<', { cue: 'tender', i: 0.3, p: { zoom: 1.45, focusX: 0.46, focusY: 0.72 } }),
    N('He held it out across the wet stones. Thunder broke over the wall, and he did not take it back.',
      '=', { cue: 'tender', i: 0.35, p: { zoom: 1.55, focusX: 0.46, focusY: 0.74 } }),
    N('The General looked at the hand. From the lit window high in the tower, somebody began to sing.',
      'PN:sing_reach@.3*.95 G#@.62*.9< M:sing@.335^.27*.42>', { cue: 'meeca', i: 0.4, p: pan(1.45, 0.46, 0.66, 1.5, 0.34, 0.3, 6) }),
    M(LULLABY, 'M:sing@.335^.27*.42> G#@.62*.9<', { cue: 'meeca', i: 0.8, sting: 'bloom', p: { particles: 'petals', zoom: 1.6, focusX: 0.34, focusY: 0.3 } }),
    N('Along the walls, the iron thorns of the Pact went still. The guardians raised their heads.', WALL,
      { cue: 'tender', i: 0.6, p: { ...OUT, particles: 'petals', ...pan(1.15, 0.12, 0.6, 1.15, 0.88, 0.6, 9) } }),
    VF('Sso. That\'s the song.', WALL, { p: zoomOn(wallX(1)) }),
    CROCUS('Everyone look. I kept the crown.', WALL, { p: zoomOn(wallX(2)), sting: 'laugh' }),
    PROWLER('Again, keeper. The thorn line.', WALL, { p: zoomOn(wallX(3)), cue: 'resolve', i: 0.7 }),
    QUEEN('Tea is at four, dears. Everyone is invited. Even you, General.', WALL, { p: zoomOn(wallX(5)), cue: 'tender', i: 0.6 }),
    GOLEM('I have waited a thousand years for—', WALL, { p: zoomOn(wallX(7)), cue: 'tender', i: 0.6 }),
    MONARCH('Once more, please. I slept through the middle.', WALL, { p: zoomOn(wallX(8)), cue: 'finale', i: 0.7 }),
    N('Far away, down in his hollow, the old tree Thornbark lifted his branches to listen.', 'T@.6', { w: 7, m: 'night', cue: 'mercy', i: 0.6, p: { ...OUT, zoom: 1.3, focusX: 0.6 } }),
    N('The iron collars cracked and fell. They rang on the stones for a long time.',
      WALL, { cue: 'mercy', i: 0.7, sting: 'bloom', p: { ...OUT, particles: 'petals', zoom: 1.1, focusX: 0.5, fx: [{ at: 1.5, kind: 'shake', amount: 6, dur: 0.8 }] } }),
    N('In the courtyard, the General got to his feet. He did it slowly and without help, and he did not take his eyes off the hand.',
      'PN:sing_reach@.24*.95 GN:ready@.62*.95', { cue: 'tender', i: 0.4, p: { particles: 'petals', zoom: 1.05, focusX: 0.46, focusY: 0.66 } }),
    N('Up in the window, Meeca began the verse again. The red in his eyes went down a little with every line, until there was only brown.',
      'PN:sing_reach@.24*.95 GN:soften@.62*.95', { cue: 'meeca', i: 0.7, p: { particles: 'petals', zoom: 1.1, focusX: 0.5, focusY: 0.66 } }),
    N('The club went first. Then the cape, and the spikes on his shoulder. None of it made a sound. What was left was an old sloth, brown and tired, in a rust-colored scarf.',
      'PN:sing_reach@.24*.95 GN:morph@.62*.95', {
        sting: 'bloom',
        p: {
          particles: 'sparkles', zoom: 1.15, focusX: 0.52, focusY: 0.66,
          fx: [{ at: 3.0, kind: 'flash', dur: 0.5, amount: 0.5 }, { at: 3.0, kind: 'burst', x: 0.62, y: 0.6, amount: 1.1 }, { at: 5.2, kind: 'glints', x: 0.62, y: 0.62 }],
        },
      }),
    OFF('The door is open, Miss. I am sorry it was ever shut.', 'P:idle@.22 GV:sorrow@.6*1.12 LP:lantern@.93*.8', { cue: 'sorrow', i: 0.3, p: { particles: 'sparkles', zoom: 1.0 } }),
    N('Meeca came down the steps and stopped ten paces away. Her back was very straight.', 'P:idle@.22 GV:sorrow@.6*1.12 MS:stand_wait@.82*.8', { cue: 'hush', i: 0.25, p: { particles: 'sparkles' } }),
    M('Hello, Grandpa.', 'P:idle@.22 GV:sorrow@.6*1.12 MS:stand_wait@.82*.8', { cue: 'sorrow', i: 0.35, sting: 'heartbreak', p: { particles: 'sparkles' } }),
    GF('Little bloom.', '=', { cue: 'grandma', i: 0.4, p: { particles: 'sparkles' } }),
    M('No. You don\'t get to say that yet.', 'P:idle@.22 GV:sorrow@.6*1.12 MS:holler@.82*.8', { cue: 'dread', i: 0.3, p: { particles: 'none', zoom: 1.3, focusX: 0.72 } }),
    M('You left. You sat in her chair for a whole year, and I kept the kettle on, and I kept the garden, and I kept everything so quiet and so gentle so you\'d come back to me. And one morning the door was standing open, and you didn\'t even close it behind you.', 'P:idle@.22 GV:sorrow@.6*1.12 MS:stomp_angry@.82*.8', { cue: 'sorrow', i: 0.45, p: { particles: 'none', zoom: 1.3, focusX: 0.72 } }),
    M('Then you put me in a room with a lock and sent me soup. I ate all of it. I said thank you every time. I wrote Pokey that I was fine. A hundred and ninety-one nights, and I kept every letter on the line so he wouldn\'t know.', 'P:idle@.22 GV:sorrow@.6*1.12 MS:hips@.82*.8', { p: { particles: 'none', zoom: 1.3, focusX: 0.72 } }),
    M('And every night, somebody stood outside my door and never knocked. Eleven steps there, eleven back. I counted them. I KNEW it was you.', 'P:idle@.22 GV:sorrow@.6*1.12 MS:holler@.82*.8', { cue: 'dread', i: 0.45, sting: 'heartbreak', p: { particles: 'none', zoom: 1.3, focusX: 0.72 } }),
    N('The General looked down at his empty hands. He had held a club in them for nine years.', 'P:idle@.22 GV:sorrow@.6*1.12 MS:fume@.82*.8', { cue: 'sorrow', i: 0.3, p: { particles: 'none', zoom: 1.3, focusX: 0.6 } }),
    GF('She waited for help. It came late. I counted every hour. I have not stopped.', 'P:idle@.22 GV:sorrow@.6*1.12 MS:bow_head@.82*.8', { cue: 'sorrow', i: 0.45, p: { particles: 'none', zoom: 1.35, focusX: 0.6 } }),
    GF('I should have knocked.', 'P:idle@.22 GV:sorrow_b@.6*1.12 MS:bow_head@.82*.8', { cue: 'hush', i: 0.3, p: { particles: 'none', zoom: 1.45, focusX: 0.6 } }),
    N('Meeca didn\'t say it was all right. She crossed the stones and took his hand. It closed over hers completely.', 'P:idle@.22 GV:sorrow@.6*1.12 MS:stand_wait@.74*.8', { cue: 'tender', i: 0.4, p: { particles: 'sparkles', zoom: 1.5, focusX: 0.68 } }),
    GF('One. Two.', 'P:idle@.22 GV:sorrow@.6*1.12 MS:stand_wait@.74*.8', { cue: 'tender', i: 0.4, p: { particles: 'sparkles', zoom: 1.5, focusX: 0.68 } }),
    M('Grandpa.', '=', { p: { particles: 'sparkles', zoom: 1.5, focusX: 0.68 } }),
    GF('I have lost count.', '=', { cue: 'mercy', i: 0.5, p: { particles: 'sparkles', zoom: 1.5, focusX: 0.68 } }),
    GF('Boy.', 'P:idle@.22 GV:stand@.6*1.12 MS:stand_wait@.8*.8', { cue: 'resolve', i: 0.5, p: { particles: 'petals' } }),
    P('Sir?', 'P:talk@.22 GV:stand@.6*1.12 MS:stand_wait@.8*.8', { p: { particles: 'petals' } }),
    GF('Come back when you can protect her, I said. You protected her from me. I suppose that counts.', '=', { p: { particles: 'petals' } }),
    GF('You may. Walk. With her.', 'P:happy@.22 GV:stand@.6*1.12 MS:cheer_fist@.8*.8', { cue: 'tender', i: 0.7, sting: 'triumph', p: { particles: 'petals' } }),
    GF('Sometimes.', '=', { p: { particles: 'petals' } }),
    M('Grandpa!', 'P:cheer@.22 GV:stand@.6*1.12 MS:cheer_fist@.8*.8', { cue: 'finale', i: 0.8, p: { particles: 'petals' } }),
    GF('Mostly.', '=', { sting: 'laugh', p: { particles: 'petals' } }),
  ]);

  // ───────────── THE SEAM ─────────────
  const seam = chapter({ name: 'THE SEAM', w: 10, m: 'day', cue: 'comedy', i: 0.5, base: { plate: 'courtyard', particles: 'sparkles' } }, [
    // ART HOOK: Dot white with flour from beak to tail (reference/ART-TO-GET.md)
    N('The sun was just coming up over the wall when a small, white, very dusty shape came around the corner of the cookhouse, with a lantern bobbing along behind it.', 'P:surprised@.22 GV:stand@.62*1.12 MS:stand_wait@.82*.8 D@.46^.34', { cue: 'comedy', i: 0.4 }),
    D('Hello! Everybody stay calm. I\'m alive! I fell into the cookhouse. Into the flour. All of it.', 'P:surprised@.22 GV:stand@.62*1.12 MS:stand_wait@.82*.8 D:cheer@.46^.34', { sting: 'laugh' }),
    OFF('She has been no trouble at all, Miss. Sir. Everyone. I apologize.', '=', { p: { zoom: 1.0 } }),
    P('Dot!', 'P:cheer@.22 GV:stand@.62*1.12 MS:stand_wait@.82*.8 D@.46^.34', { cue: 'journey', i: 0.6, sting: 'triumph' }),
    D('I\'m so sorry I\'m late! I know. I know. The seam was tiny, and I went in sideways, and there was a cookhouse, and a lot of flour, and then Pell found me. I\'m so sorry. I\'m always... I\'m always...',
      'P:happy@.22 GV:stand@.62*1.12 MS:stand_wait@.82*.8 D@.46^.34'),
    P('Seems to me it\'s still morning.', 'P:happy@.22 GV:stand@.62*1.12 MS:stand_wait@.82*.8 D:puzzled@.46^.34', { cue: 'tender', i: 0.45 }),
    N('Dot stopped. Then she took the pouch off her side and held it out in both feet.', 'P:idle@.22 GV:stand@.62*1.12 MS:stand_wait@.82*.8 D@.5^.34', { cue: 'sorrow', i: 0.3, p: { zoom: 1.5, focusX: 0.5 } }),
    D('General. I have something I should have given you a long time ago.', '=', { cue: 'sorrow', i: 0.35 }),
    N('It was a letter, yellow at the edges, sealed with one faded petal.', '=', { cue: 'tender', i: 0.3 }),
    D('She gave it to me the night she died, in the storm. "Give him this when he can sit still," she said. I flew out to find you, and the storm kept me a day. One day. And then you were home, sitting by her chair, all that year, so still, and I couldn\'t. I was afraid it said it was my fault.',
      '=', { cue: 'sorrow', i: 0.4 }),
    GF('Give it here, little courier.', 'P:idle@.22 GV:reach_a@.62*1.12 MS:stand_wait@.82*.8 D@.5^.34', { cue: 'grandma', i: 0.4 }),
    GM('My dearest. If you\'re reading this, you\'re sitting down, which means something has gone very right or very wrong. Either way, put the kettle on. The little bird will be late. I always set the kettle for when she actually arrives.', '', { ph: ['s3_02', 'Grandma', 0.46, -0.02], cue: 'grandma', i: 0.6, p: { memory: true } }),
    GM('It isn\'t anybody\'s fault, my love. It was only weather. Don\'t build anything on my account. I put a fence around the garden once, and the rabbits were over it by lunch, and so were the neighbors. I\'ll be on the hill. Leave the gate open.', '', { ph: ['s2_06', 'The hill', 0.5, -0.02], cue: 'meeca', i: 0.8, sting: 'bloom', p: { memory: true } }),
    D('She always had the kettle on when I got there. Every time. However late I was. I thought she was just lucky.', 'P:happy@.22 GV:letter@.62*1.12 MS:stand_wait@.82*.8 D@.5^.34', { cue: 'sorrow', i: 0.5, p: { memory: false, zoom: 1.5, focusX: 0.6 } }),
    GF('Courier. Sit.', 'P:idle@.22 GV:letter@.62*1.12 MS:stand_wait@.82*.8 D@.5^.34', { cue: 'mercy', i: 0.6, m: 'glow' }),
    N('Pokey stood very still. After a while, Dot landed on his head.', 'P:idle@.22 GV:sit@.62*1.12 D:perch@.22^.32', { cue: 'tender', i: 0.4, p: { zoom: 1.3, focusX: 0.4 } }),
    P('I thought you came around because you liked me.', 'P:idle@.22 GV:sit@.62*1.12 D:perch@.22^.32', { cue: 'tender', i: 0.3, p: { zoom: 1.3, focusX: 0.3 } }),
    D('I did! I do! It was both. It was always both, Pokey. I swear it was—', '=', { cue: 'sorrow', i: 0.4 }),
    P('Okay.', '=', { cue: 'tender', i: 0.4 }),
    N('Dot didn\'t say anything. Her wing went to the pouch at her side, which was empty, and she left it there.', 'P:idle@.22 GV:sit@.62*1.12 D:perch@.22^.32', { cue: 'hush', i: 0.2, p: { zoom: 1.6, focusX: 0.3 } }),
  ]);

  // ───────────── THE MORNING ─────────────
  const morning = chapter({ name: 'THE WEEKS AFTER', w: 2, m: 'day', cue: 'comedy', i: 0.5, base: { particles: 'sparkles' } }, [
    N('Down at the Sunlit Riverbank, Gruntlewick the crier reached the end of his flood warning. He\'d started it on a Tuesday, five months before. At the top of the bank, the slow mailman finally delivered his one package, which was the flood warning, addressed to Gruntlewick. Gruntlewick signed for it.', 'PO:offer_parcel@.36*.95 TC:scroll@.62*.95', { sting: 'laugh', p: { zoom: 1.1 } }),
    N('In the ruins, the Stone Idol Golem finally finished a sentence. Nobody was there to hear it. He said it again, slowly, to the chairs.', '', { w: 7, m: 'dusk', cue: 'tender', i: 0.4, p: { zoom: 1.1 } }),
    N('Lieutenant Pell left the army that week and opened a tailor\'s shop at the foot of the mountain. He hung the sign himself. It hangs a little crooked, and he apologizes to it every morning.',
      'LP:sew_table@.5*.8', { w: 1, m: 'day', cue: 'comedy', i: 0.5, p: VIL }),
    N('On the first fine afternoon, at four o\'clock exactly, the Tarantula Queen poured the tea. The General looked at the chair at the head of the table, the one she had dusted every morning for nine years.',
      `${TEA_UP} B5@.92^.84*.45<`, { cue: 'tender', i: 0.4, p: VIL }),
    N('He sat down in it, put his feet up, and finished the whole cup.', `${TEA} B5@.92^.84*.45<`, { cue: 'mercy', i: 0.5, p: VIL }),
    D('It\'s a trap with cookies. I\'ve had four.', `${TEA} B5@.92^.84*.45<`, { sting: 'laugh', p: VIL }),
    N('Meeca had finished the scarf. It went around Pokey four times and still dragged on the ground. He was wearing it.', TEA, { cue: 'comedy', i: 0.4, p: VIL }),
    N('She also gave him the letters from under her pillow, all of them, every one saying she was fine. He read them one at a time. The handwriting never wobbled once.', TEA, { cue: 'tender', i: 0.45, p: VIL }),
    ...when(has('w2_keepsake'), [
      N('The day she started school he walked her there by the hand. At the gate he stopped, so that she could go in first.', 'GC:hand@.5*.92', { cue: 'tender', i: 0.4, p: { memory: true } }),
      M('My locket. You fastened it on me the day I started school. "So you\'ll always know your name." I never took it off until they took me.', TEA, { p: VIL }),
      GF('You were so small. I thought the chain would be too heavy for you.', '=', { p: VIL }),
    ]),
    ...when(has('w6_keepsake'), [
      M('Grandpa. Is that my rattle?', TEA, { cue: 'comedy', i: 0.4, p: VIL }),
      GF('It was the only thing that stopped you crying. I used it on the Council. It worked on them too.', '=', { sting: 'laugh', p: VIL }),
    ]),
    ...when(has('w7_keepsake'), [
      P('Sir, who sewed the eye back on the bear?', TEA, { cue: 'comedy', i: 0.4, p: VIL }),
      GF('A soldier is trained in needlework. I was not good at it. The eye is on the wrong side.', '=', { sting: 'laugh', p: VIL }),
      M('It looks surprised. I always loved that.', '=', { cue: 'tender', i: 0.4, p: VIL }),
    ]),
    ...when(has('w9_keepsake'), [
      GF('I always stopped the watch one second early, so you would beat your time. You never knew.', TEA, { cue: 'tender', i: 0.45, p: VIL }),
      M('Grandpa. I always knew.', '=', { p: VIL }),
      GF('You did?', '=', { p: VIL }),
      M('I let you.', '=', { sting: 'bloom', p: VIL }),
    ]),
    ...when(has('w3_keepsake'), [
      P('Sir, I found a medal in a fern. On the back it says, "For the next cub."', TEA, { cue: 'tender', i: 0.4, p: VIL }),
      GF('I scratched that on the back the day they gave it to me, for the river. I was keeping it for a cub who would need it more than I did.', '=', { p: VIL }),
      P('I think I\'m a little old to be a cub, sir.', '=', { p: VIL }),
      GF('You are exactly the right age to be brave and foolish. Keep it.', '=', { cue: 'resolve', i: 0.5, sting: 'triumph', p: VIL }),
    ]),
    ...when(has('w4_keepsake'), [
      P('There was half a ribbon in a fern. The knot was still tied.', TEA, { cue: 'sorrow', i: 0.4, p: VIL }),
      GF('She tied it around our wrists the day we were married. When she was gone, I could not undo the knot. I had to cut it.', '=', { cue: 'grandma', i: 0.5, p: VIL }),
      N('He opened his paw. Inside was the other half. Pokey laid his beside it. The cut ends were a thumb\'s width short, so the General tied them together with a bit of string from his belt.', TEA, { cue: 'tender', i: 0.5, sting: 'bloom', p: { ...VIL, zoom: 1.5, fx: [{ at: 1.0, kind: 'glints', x: 0.5, y: 0.7 }] } }),
    ]),
    ...when(has('w1_keepsake'), [
      P('There was a key in a fern, too, on a green ribbon.', TEA, { p: VIL }),
      GF('I wore that around my neck for a year. I thought I lost it the morning I left.', '=', { p: VIL }),
      M('You left it on her chair. I\'ve had it in my apron ever since. It\'s the key to Grandma\'s music box. It plays the song.', '=', { cue: 'meeca', i: 0.5, p: VIL }),
      N('Meeca wound it. The little box played her grandma\'s song all the way through, a little out of tune. The General bowed his head, and for a long time nobody said a word.', TEA, { cue: 'grandma', i: 0.7, sting: 'bloom', p: { ...VIL, particles: 'petals' } }),
    ]),
    ...when(has('w5_keepsake'), [
      P('There was a petal, too. It says, "Be patient with the slow ones. They always arrive."', TEA, { cue: 'grandma', i: 0.5, p: VIL }),
      GF('That is her handwriting. Everything of hers turns up in a fern. I am beginning to think the bird has a problem.', '=', { sting: 'laugh', p: VIL }),
    ]),
    ...when(all, [
      M('That\'s every one, Grandpa. Every last thing of hers.', TEA, { cue: 'tender', i: 0.6, sting: 'bloom', p: VIL }),
      GF('In ferns. Of course. Thank you for being patient enough to find them, boy.', '=', { cue: 'grandma', i: 0.5, p: VIL }),
    ]),
    ...when(has('w10_keepsake'), [
      P('Sir, I think this is yours. It was in a fern.', TEA, { cue: 'grandma', i: 0.5, p: VIL }),
      N('It was a small bronze bell, green with age. Meeca\'s grandma had rung it whenever someone she loved was coming home. It hadn\'t rung since the day she died.', TEA, { p: { ...VIL, zoom: 1.6, focusX: 0.7, fx: [{ at: 1.0, kind: 'glints', x: 0.7, y: 0.7 }] } }),
      N('The General turned it over in his big hands. Then, very gently, he rang it. One clear note went out over the village and up the mountain, the way it used to go down a garden path.', TEA,
        { cue: 'meeca', i: 0.7, sting: 'bloom', p: { ...VIL, zoom: 1.6, focusX: 0.7, fx: [{ at: 0.6, kind: 'glints', x: 0.7, y: 0.6 }] } }),
      GF('Somebody is coming home.', TEA, { cue: 'meeca', i: 0.8, p: VIL }),
      M('Yes, Grandpa. You are.', '=', { p: VIL }),
    ]),
    N('Far off in the east, the last of the storm said something. Pokey was holding a teacup in one hand. He went on holding it in one hand.', TEA, { cue: 'tender', i: 0.4, p: { ...VIL, zoom: 1.4, focusX: 0.3 } }),
  ]);

  // ───────────── THE END ─────────────
  const end = chapter({ name: 'THE END', w: 1, m: 'dusk', cue: 'tender', i: 0.4, base: { particles: 'petals' } }, [
    N('That evening, they climbed the hill to the old tree, where Meeca\'s grandma had said she\'d be. The General went up last.', 'P:happy@.3*.9 M:happy@.5*.9 GV:scout@.72*1.12', { w: 10, p: { plate: 'hill', zoom: 1.15 } }),
    GF('Hello, love. I\'m late. I brought the whole family.', 'P:idle@.2*.9 M:sad@.4*.9 GV:scout@.64*1.12', { cue: 'grandma', i: 0.6, sting: 'heartbreak', p: { plate: 'hill', zoom: 1.5, focusX: 0.64 } }),
    ...when(has('w8_keepsake'), [
      N('Pokey took a paper packet out of his satchel, the one he\'d found in a fern in the Twilight Treetops. Meeca read the label. "For the hill," she said. "Plant when it is quiet." It was. They sat down in the grass together. Dot sat on Pokey\'s head and, for once, didn\'t say a word.', 'P:happy@.34*.9 M:happy@.54*.9 GV:sit@.74*1.12 D:perch@.34^.5', { cue: 'tender', i: 0.5, sting: 'bloom', p: { plate: 'hill', zoom: 1.35 } }),
    ]),
    N('Home was exactly the way they\'d left it, except that the Heartbloom was open, and a snail who had set off across the garden path on the morning they took Meeca was half an inch from the finish line.', 'PH:arm_around@.34*1.1 H:epic@.68^.8', { cue: 'tender', i: 0.5, p: { zoom: 1.2 } }),
    P('Of course he made it. He trained for it.', 'PH:cheek_glad@.34*1.1 H:epic@.68^.8', { sting: 'laugh' }),
    N('Meeca sat down on the garden path beside the snail. After a while, Pokey sat down too.', 'PH:sit_hug@.4*1.1 H:epic@.7^.8', { cue: 'finale', i: 0.8, sting: 'bloom', p: { zoom: 1.2 } }),
  ]);

  return [...tower, ...seam, ...morning, ...end];
}
