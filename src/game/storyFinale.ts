/**
 * The ending, from the moment the General falls. Four chapters, each with one job (the running order of the 2026-10-29 story report):
 *   THE TOWER    Pokey lets go with one hand; the song frees the guardians; the war look goes out of the General (the red, the club, the cape, the
 *                spikes) and the plain sloth is what is left; Meeca is angry out loud and then takes his hand; the General stops counting; the
 *                blessing; then Pokey and Meeca, on the steps
 *   THE SEAM     Dot, alive and late again ("Seems to me it's still morning"), what she has carried since the storm; Grandma's letter ("It was
 *                only weather"); Pokey's answer to her
 *   THE WEEKS AFTER  the village, Pell's tailor shop and Flicker, tea at four, three keepsakes ending on the bell, Pell's question
 *   THE END      the hill, and the snail half an inch from the finish
 * `found` is what the player has picked up in the Library: the ribbon, the key and the bell each add a small scene at the tea table, the seeds
 * are planted on the hill, and a full set adds Grandma's last word. The other keepsakes' scenes are kept for the satchel (KEEPSAKE_LINES), and
 * the stopwatch plays after the end (endTagPanels). The scenes on a plate are painted rooms (plateData.ts); the guardians and the vignettes use the stage's own scenery.
 */
import { chapter, D, FL, GF, GM, M, N, OFF, P, pan, say, type Beat } from './storyDsl.ts';
import { LULLABY } from './storyMemories.ts';
import { allFound, allOf, POCKET_FINDS, RUINS_NOTE, SNAIL_FINDS } from './finds.ts';
import type { StoryPanel } from './story.ts';
import { END_CARDS } from './endCardsData.ts';

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

/** the Drake's cave on the lava road: Pokey with the tea, the Drake sitting across from him (and Dot, about the sock) */
const DRAKE_CAVE = 'P:happy@.28*.95 B9@.7*.75<';
const DRAKE_CAVE_DOT = 'P:happy@.28*.95 B9@.7*.75< D:puzzled@.46^.42';
/** at the tea table: Pokey, Meeca, Dot, and the General in the chair at the head of the table, the one the Queen dusted every morning */
const TEA = 'P:happy@.2*.9 M:happy@.42*.9 GV:sit@.72*1.12 D@.5^.5*.9';
/** the same table a minute earlier: the General has his cup and is looking at that chair */
const TEA_UP = 'P:happy@.2*.9 M:happy@.42*.9 GV:tea@.72*1.12 D@.5^.5*.9';
const VIL = { plate: 'village' };

/**
 * What each keepsake says when it comes out of the satchel at the tea table. The finale plays three of them (FINALE_KEEPSAKES, in that order:
 * the ribbon finishes his grief, the key's music box plays the song, the bell is always last). The seeds are planted on the hill. The other
 * six are kept here word for word for the satchel screen, where each one opens on its own page; the stopwatch also plays as a short tag
 * after the end (endTagPanels).
 */
export const KEEPSAKE_LINES: Partial<Record<string, Beat[]>> = {
  w2_keepsake: [
    N('The day she started school he walked her there by the hand. At the gate he stopped, so that she could go in first.', 'GC:hand@.5*.92', { cue: 'tender', i: 0.4, p: { memory: true } }),
    M('My locket. You fastened it on me the day I started school. "So you\'ll always know your name." I never took it off until they took me.', TEA, { p: VIL }),
    GF('You were so small. I thought the chain would be too heavy for you.', '=', { p: VIL }),
  ],
  w6_keepsake: [
    M('Grandpa. Is that my rattle?', TEA, { cue: 'comedy', i: 0.4, p: VIL }),
    GF('It was the only thing that stopped you crying. I used it on the Council. It worked on them too.', '=', { sting: 'laugh', p: VIL }),
  ],
  w7_keepsake: [
    P('Sir, who sewed the eye back on the bear?', TEA, { cue: 'comedy', i: 0.4, p: VIL }),
    GF('A soldier is trained in needlework. I was not good at it. The eye is on the wrong side.', '=', { sting: 'laugh', p: VIL }),
    M('It looks surprised. I always loved that.', '=', { cue: 'tender', i: 0.4, p: VIL }),
  ],
  w9_keepsake: [
    GF('I always stopped the watch one second early, so you would beat your time. You never knew.', TEA, { cue: 'tender', i: 0.45, p: VIL }),
    M('Grandpa. I always knew.', '=', { p: VIL }),
    GF('You did?', '=', { p: VIL }),
    M('I let you.', '=', { sting: 'bloom', p: VIL }),
  ],
  w3_keepsake: [
    P('Sir, I found a medal in a fern. On the back it says, "For the next cub."', TEA, { cue: 'tender', i: 0.4, p: VIL }),
    GF('I scratched that on the back the day they gave it to me, for the river. I was keeping it for a cub who would need it more than I did.', '=', { p: VIL }),
    P('I think I\'m a little old to be a cub, sir.', '=', { p: VIL }),
    GF('You are the right age. Keep it.', '=', { cue: 'resolve', i: 0.5, p: VIL }),
  ],
  w4_keepsake: [
    P('There was half a ribbon in a fern. The knot was still tied.', TEA, { cue: 'sorrow', i: 0.4, p: VIL }),
    GF('She tied it around our wrists the day we were married. When she was gone, I could not undo the knot. I had to cut it.', '=', { cue: 'grandma', i: 0.5, p: VIL }),
    N('He opened his paw. Inside was the other half. Pokey laid his beside it. The cut ends were a thumb\'s width short, so the General tied them together with a bit of string from his belt.', TEA, { cue: 'tender', i: 0.5, sting: 'bloom', p: { ...VIL, zoom: 1.5, fx: [{ at: 1.0, kind: 'glints', x: 0.5, y: 0.7 }] } }),
  ],
  w1_keepsake: [
    P('There was a key in a fern, too, on a green ribbon.', TEA, { p: VIL }),
    GF('I wore that around my neck for a year. I thought I lost it the morning I left.', '=', { p: VIL }),
    M('You left it on her chair. I\'ve had it in my apron ever since. It\'s the key to Grandma\'s music box. It plays the song.', '=', { cue: 'meeca', i: 0.5, p: VIL }),
    N('Meeca wound it. The little box played her grandma\'s song all the way through, a little out of tune. The General bowed his head and let it play to the end.', TEA, { cue: 'grandma', i: 0.7, sting: 'bloom', p: { ...VIL, particles: 'petals' } }),
  ],
  w5_keepsake: [
    P('There was a petal, too. It says, "Be patient with the slow ones. They always arrive."', TEA, { cue: 'grandma', i: 0.5, p: VIL }),
    GF('That is her handwriting. Everything of hers turns up in a fern. I am beginning to think the bird has a problem.', '=', { sting: 'laugh', p: VIL }),
  ],
  w10_keepsake: [
    P('Sir, I think this is yours. It was in a fern.', TEA, { cue: 'grandma', i: 0.5, p: VIL }),
    N('It was a small bronze bell, green with age. Meeca\'s grandma had rung it whenever someone she loved was coming home. It hadn\'t rung since the day she died.', TEA, { p: { ...VIL, zoom: 1.6, focusX: 0.7, fx: [{ at: 1.0, kind: 'glints', x: 0.7, y: 0.7 }] } }),
    N('The General turned it over in his big hands. Then, very gently, he rang it. One clear note went out over the village and up the mountain, the way it used to go down a garden path.', TEA,
      { cue: 'meeca', i: 0.7, sting: 'bloom', p: { ...VIL, zoom: 1.6, focusX: 0.7, fx: [{ at: 0.6, kind: 'glints', x: 0.7, y: 0.6 }] } }),
    GF('Somebody is coming home.', TEA, { cue: 'meeca', i: 0.8, p: VIL }),
  ],
};
/** the keepsakes the finale shows, in order (the bell always last) */
export const FINALE_KEEPSAKES = ['w4_keepsake', 'w1_keepsake', 'w10_keepsake'] as const;
/** the keepsakes that open from the satchel instead (the seeds are planted on the hill) */
export const SATCHEL_KEEPSAKES = ['w2_keepsake', 'w3_keepsake', 'w5_keepsake', 'w6_keepsake', 'w7_keepsake', 'w9_keepsake'] as const;

const TB = say('Thornbark');

/**
 * After the end (Matt, 2026-10-30: the sequel hint, A + B, after the stopwatch so the ending itself stays whole and happy):
 *   the stopwatch, if it was found;
 *   B, only if Thornbark was freed: the thorns were never Iron-Claw's, and one comes up by Pokey's branch;
 *   A, always: the storm comes back for Pokey, and this time Meeca goes. Dot's one short line, on purpose: the one time she doesn't run on.
 * (The storm-night pictures are the old nest's plates and the story cels until Matt's Gemini cards come: the scarf on the thorn, the thorn
 * coming up, and Meeca holding the scarf are the three still waiting on their art.)
 */
export function endTagPanels(found: string[] = [], thornHeart = false): StoryPanel[] {
  const out: StoryPanel[] = [];
  if (found.includes('w9_keepsake')) {
    out.push(...chapter({ name: 'AFTER THE END · THE STOPWATCH', w: 2, m: 'day', cue: 'tender', i: 0.4, base: { particles: 'sparkles' } }, KEEPSAKE_LINES.w9_keepsake!));
  }
  if (thornHeart) {
    out.push(...chapter({ name: 'AFTER THE END · THE HOLLOW', w: 7, m: 'night', cue: 'dread', i: 0.3, base: { particles: 'none' } }, [
      N('Far away, in his hollow, Thornbark\'s roots were trembling.', 'T@.6', { p: { zoom: 1.3, focusX: 0.6, fx: [{ kind: 'shake', at: 0.4, dur: 1.2, amount: 2 }] } }),
      TB('The thorns did not come from Iron-Claw. They came from the east, with the storm. And they are growing back.', 'T@.6', { p: { zoom: 1.5, focusX: 0.6 } }),
      N('By Pokey\'s branch, in the dark, a single black thorn pushed up out of the bark.', '', { m: 'storm', p: { plate: 'nest-night', zoom: 1.35, focusX: 0.5, particles: 'rain' } }),
    ]));
  }
  out.push(...chapter({ name: 'AFTER THE END · MONTHS LATER', w: 1, m: 'storm', cue: 'dread', i: 0.35, base: { particles: 'rain' } }, [
    N('Months later, the storm came back from the east. It came at night.', '', { p: { plate: 'nest-storm', zoom: 1.1 } }),
    N('Pokey was asleep on his branch. The end of the scarf hung down off it, most of the way to the ground.', 'P:sleep@.5', { p: { plate: 'nest-night', zoom: 1.3, focusX: 0.5 } }),
    N('In the morning the branch was empty.', '', { m: 'day', cue: 'sorrow', i: 0.3, p: { plate: 'nest-morning', particles: 'none', zoom: 1.2 } }),
    N('The scarf was still there. It hung from a black thorn that had not been there the night before.', '', { p: { plate: 'nest-morning', particles: 'none', zoom: 1.6, focusX: 0.55 } }),
    M('Dot. How fast can you fly?', 'MS:stand_wait@.44*.85 D@.62^.42', { cue: 'tender', i: 0.4, p: { plate: 'nest-morning', particles: 'none' } }),
    D('Faster than him.', 'MS:stand_wait@.44*.85 D@.6^.4', { p: { plate: 'nest-morning', particles: 'none' } }),
    M('Good. This time, I\'m the one coming.', 'MS:hips@.44*.85 D@.6^.4', { cue: 'finale', i: 0.6, sting: 'bloom', p: { plate: 'nest-morning', particles: 'none', zoom: 1.4, focusX: 0.48 } }),
    N('To be continued.', '', { closing: true, cue: 'hush', i: 0, p: { plate: 'nest-morning', particles: 'none', zoom: 1.2 } }),
  ]));
  return out;
}

export function finalePanels(found: string[] = []): StoryPanel[] {
  const has = (id: string) => found.includes(id);
  const all = allFound(found);
  const when = (cond: boolean, beats: Beat[]): Beat[] => (cond ? beats : []);

  // ───────────── THE TOWER ─────────────
  const tower = chapter({ name: 'THE TOWER', w: 10, m: 'day', cue: 'hush', i: 0.2, base: { plate: 'courtyard', particles: 'rain' } }, [
    N('The General lay in the rubble in the middle of the courtyard. The thunder was still coming up the mountain after them both.',
      'G#@.62*.9< P:duck@.31*.95', { sting: 'blow', p: pan(1.0, 0.5, 0.55, 1.15, 0.42, 0.62, 8) }),
    // the let-go, played (2026-10-29 story report): on a touch screen the player's thumbs are his hands, and the two pictures after it are
    // only read where it could not be played
    N('Pokey had hold of the nearest wall with both hands. He always held something when it thundered.',
      'G#@.62*.9< PN:grip_wall@.31*.95', {
        p: { zoom: 1.35, focusX: 0.3, focusY: 0.66 },
        hold: { both: 'Hold on with both thumbs.', lift: 'Now lift one.', reach: 'G#@.62*.9< PN:reach_back@.31*.95', p: { zoom: 1.45, focusX: 0.46, focusY: 0.72 } },
      }),
    N('He let go with one hand.',
      'G#@.62*.9< PN:sing_reach@.3*.95', { cue: 'tender', i: 0.3, narratedOnly: true, p: { zoom: 1.45, focusX: 0.46, focusY: 0.72 } }),
    N('He held it out across the wet stones. Thunder broke over the wall, and he did not take it back.',
      '=', { cue: 'tender', i: 0.35, narratedOnly: true, p: { zoom: 1.55, focusX: 0.46, focusY: 0.74 } }),
    N('The General looked at the hand. From the lit window high in the tower, somebody began to sing.',
      'G#@.62*.9< PN:sing_reach@.3*.95 M:sing@.335^.333*.3%>', { cue: 'meeca', i: 0.4, p: pan(1.45, 0.46, 0.66, 1.5, 0.34, 0.3, 6) }),
    M(LULLABY, 'M:sing@.335^.333*.3%> G#@.62*.9<', { cue: 'meeca', i: 0.8, sting: 'bloom', p: { particles: 'petals', zoom: 1.6, focusX: 0.34, focusY: 0.3 } }),
    N('Along the walls, the iron thorns of the Pact went still. The guardians raised their heads.', WALL,
      { cue: 'tender', i: 0.6, p: { ...OUT, particles: 'petals', ...pan(1.15, 0.12, 0.6, 1.15, 0.88, 0.6, 9) } }),
    VF('Sso. That\'s the song.', WALL, { p: zoomOn(wallX(1)) }),
    CROCUS('Everyone look. I kept the crown.', WALL, { p: zoomOn(wallX(2)), sting: 'laugh' }),
    PROWLER('Again, keeper. The thorn line.', WALL, { p: zoomOn(wallX(3)), cue: 'resolve', i: 0.7 }),
    QUEEN('Tea is at four, dears. Everyone is invited. Even you, General.', WALL, { p: zoomOn(wallX(5)), cue: 'tender', i: 0.6 }),
    GOLEM('I have waited a thousand years for—', WALL, { p: zoomOn(wallX(7)), cue: 'tender', i: 0.6 }),
    MONARCH('Once more, please. I slept through the middle.', WALL, { p: zoomOn(wallX(8)), cue: 'finale', i: 0.7 }),
    N('Far away, down in his hollow, the old tree Thornbark lifted his branches to listen.', 'T@.6', { w: 7, m: 'night', cue: 'mercy', i: 0.6, p: { ...OUT, zoom: 1.3, focusX: 0.6 } }),
    N('The iron collars cracked and fell. They rang on the stones, and kept ringing.',
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
    GF('She waited for help, and it came late. So I put you somewhere nobody would ever be late for you.', 'P:idle@.22 GV:sorrow@.6*1.12 MS:bow_head@.82*.8', { cue: 'sorrow', i: 0.45, p: { particles: 'none', zoom: 1.35, focusX: 0.6 } }),
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
    // the reunion (2026-10-29 story report): the whole game is a slow friend coming for her, and here they finally say hello
    N('Meeca turned around. Pokey was standing where he\'d stopped, soaked, in the middle of the courtyard.', 'P:tired@.28 FL@.365^.44*.8> MS:startled@.72*.8', { cue: 'hush', i: 0.25, p: { particles: 'sparkles' } }),
    M('You came.', 'P:idle@.28 FL@.365^.44*.8> MS:happy_tears@.68*.8', { cue: 'meeca', i: 0.4, p: { particles: 'sparkles', zoom: 1.4, focusX: 0.6 } }),
    P('I was in the neighborhood. Slowly.', 'P:talk@.28 FL@.365^.44*.8> MS:happy_tears@.68*.8', { p: { particles: 'sparkles' } }),
    N('She laughed. Then her back stopped being straight.', 'P:happy@.28 FL@.365^.44*.8> MS:laugh@.62*.8', { cue: 'tender', i: 0.45, p: { particles: 'sparkles' } }),
    P('You can sit down now.', 'P:idle@.3 FL@.385^.44*.8> MS:content@.6*.8', { cue: 'tender', i: 0.4, p: { particles: 'sparkles', zoom: 1.35, focusX: 0.42 } }),
    N('They sat on the wet steps. Neither of them said much. It was the best conversation of the year.', 'PA:lean_rest@.41^.64%*.95', { cue: 'meeca', i: 0.5, p: { plate: 'steps', particles: 'petals', zoom: 1.2 } }),
    // and the light that got her a night out lifts off Pokey's wrist (lead, 2026-10-29: here, not at Pell's shop)
    M('There you are. I wondered where my light went.', 'PA:lean_rest@.41^.64%*.95 FL@.58^.42', { cue: 'tender', i: 0.4, p: { plate: 'steps', particles: 'petals' } }),
    FL('I\'m sorry.', 'PA:lean_rest@.41^.64%*.95 FL:sad@.58^.42', { p: { plate: 'steps', particles: 'petals' } }),
    M('You got me a whole night out. Come here.', 'PA:lean_rest@.41^.64%*.95 FL:happy@.54^.46', { p: { plate: 'steps', particles: 'petals' } }),
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
    // Pokey answers her, to her face (2026-10-29 story report): he counted the times help came anyway
    D('I did! I do! It was both. I came because I owed you, and I stayed because... I stayed. You\'re mine, Pokey. You\'ve been mine since you were this big and couldn\'t reach the low branch.', '=', { cue: 'sorrow', i: 0.4 }),
    // (all six things from her lost pocket found: she says the rest of it)
    ...when(allOf(POCKET_FINDS, found), [D('I kept your map. I kept all of it. I\'ve had you in my pocket the whole time.', '=', { cue: 'sorrow', i: 0.4 })]),
    P('You were late every time, you know.', '=', { cue: 'tender', i: 0.3 }),
    D('I know.', 'P:idle@.22 GV:sit@.62*1.12 D:sad@.22^.32', { cue: 'sorrow', i: 0.3 }),
    P('And you came back every time. I was counting.', 'P:idle@.22 GV:sit@.62*1.12 D:perch@.22^.32', { cue: 'tender', i: 0.45 }),
    N('Dot\'s wing went to the pouch at her side, which was empty, and she left it there.', 'P:idle@.22 GV:sit@.62*1.12 D:perch@.22^.32', { cue: 'hush', i: 0.2, p: { zoom: 1.6, focusX: 0.3 } }),
  ]);

  // ───────────── THE WEEKS AFTER ─────────────
  // (the 2026-10-29 running order: the warning, the Golem, Pell's shop and Flicker; tea at four; three keepsakes, ending on the bell; Pell)
  const morning = chapter({ name: 'THE WEEKS AFTER', w: 2, m: 'day', cue: 'comedy', i: 0.5, base: { particles: 'sparkles' } }, [
    N('Down at the Sunlit Riverbank, Gruntlewick the crier reached the end of his flood warning. He\'d started it on a Tuesday, five months before. At the top of the bank, the slow mailman finally delivered his one package, which was the flood warning, addressed to Gruntlewick. Gruntlewick signed for it.', 'PO:offer_parcel@.36*.95 TC:scroll@.62*.95', { sting: 'laugh', p: { zoom: 1.1 } }),
    N('In the ruins, the Stone Idol Golem finally finished his sentence. "...company." That afternoon, all ten chairs were full.', '', { w: 7, m: 'dusk', cue: 'tender', i: 0.4, p: { zoom: 1.1 } }),
    N('Lieutenant Pell left the army that week and opened a tailor\'s shop at the foot of the mountain. He hung the sign himself. It hangs a little crooked, and he apologizes to it every morning.',
      'LP:sew_table@.5*.8', { w: 1, m: 'day', cue: 'comedy', i: 0.5, p: VIL }),
    // Flicker stays, and Dot hands him over for good (STORY-REVIEW-2026-10-27.md item 9): his light holds steady now
    FL('I\'m staying, if that\'s all right.', 'M:happy@.3*.9 D@.6^.42 FL:talk@.42^.5 LP:sew_table@.8*.8', { cue: 'tender', i: 0.45, p: VIL }),
    D('He\'s all right. Don\'t tell him.', 'M:happy@.3*.9 D@.6^.42 FL@.42^.5 LP:sew_table@.8*.8', { p: VIL }),
    FL('I\'m right here.', 'M:laugh@.3*.9 D:flinch@.6^.42 FL:smug@.42^.5 LP:sew_table@.8*.8', { sting: 'laugh', p: VIL }),
    // the Drake's two cups (Matt approved the teacup ending, 2026-10-30): his "Bring tea. Two cups." comes true, and Pokey's
    // "Maybe. If you tidy." comes back as the answer
    N('On the first cold morning, Pokey walked the lava road with a pot of tea and two cups.', 'P:walk@.3', { w: 9, m: 'day', cue: 'comedy', i: 0.4, p: { ...OUT, zoom: 1.15 } }),
    N('The Drake had tidied. Everything he owned was in one corner of the cave, and a large rock had been rolled in front of the corner.', DRAKE_CAVE, { p: OUT }),
    DRAKE('You came.', DRAKE_CAVE, { p: OUT }),
    P('You asked.', '=', { p: OUT }),
    DRAKE('There is nothing behind the rock.', '=', { p: OUT }),
    D('There\'s a sock behind the rock, I can see it from here, it\'s an enormous sock, I\'m not going to ask about the sock, I\'m asking, why is there a sock.', DRAKE_CAVE_DOT, { sting: 'laugh', p: OUT }),
    DRAKE('It is a tea cosy. I made it. It did not go well.', '=', { p: OUT }),
    N('Pokey poured. The Drake held his cup in both claws and looked at it for a long time.', DRAKE_CAVE, { cue: 'tender', i: 0.4, p: { ...OUT, zoom: 1.35, focusX: 0.62 } }),
    DRAKE('It is too hot.', '=', { p: OUT }),
    P('You breathe fire.', '=', { p: OUT }),
    DRAKE('Not any more. A visitor put it out.', '=', { p: OUT }),
    N('He drank it anyway, and held the cup out, very carefully, for another.', DRAKE_CAVE, { cue: 'mercy', i: 0.45, p: OUT }),
    DRAKE('Wednesday?', '=', { p: OUT }),
    P('If you tidy.', '=', { sting: 'laugh', p: OUT }),
    N('The Drake looked at the rock for a while.', '=', { p: { ...OUT, zoom: 1.2 } }),
    N('On the first fine afternoon, at four o\'clock exactly, the Tarantula Queen poured the tea. The General looked at the chair at the head of the table, the one she had dusted every morning for nine years.',
      `${TEA_UP} B5@.92^.84*.45<`, { w: 1, cue: 'tender', i: 0.4, p: VIL }),
    N('He sat down in it, put his feet up, and finished the whole cup.', `${TEA} B5@.92^.84*.45<`, { cue: 'mercy', i: 0.5, p: VIL }),
    D('It\'s a trap with cookies. I\'ve had four.', `${TEA} B5@.92^.84*.45<`, { sting: 'laugh', p: VIL }),
    N('Meeca had finished the scarf. It went around Pokey four times and still dragged on the ground. He was wearing it.', TEA, { cue: 'comedy', i: 0.4, p: VIL }),
    M('Was it a nice bush?', TEA, { p: VIL }),
    D('It was the best bush, it was a really excellent bush, I\'ve been back, I sit in it sometimes, it\'s very calming.', TEA, { p: VIL }),
    N('She also gave him the letters from under her pillow, all of them, every one saying she was fine. He read them one at a time. The handwriting never wobbled once.', TEA, { cue: 'tender', i: 0.45, p: VIL }),
    // (Pokey's own note from Under the Ruins, the one going the other way: SECRET-LEVELS.md)
    ...when(has(RUINS_NOTE.id), [
      M('You crossed out "I\'m fine."', TEA, { cue: 'tender', i: 0.4, p: VIL }),
      P('It wasn\'t true.', '=', { p: VIL }),
      M('Mine wasn\'t either.', '=', { p: VIL }),
    ]),
    // three keepsakes, in this order, the bell always last; the other six are in the satchel (KEEPSAKE_LINES) and the seeds go to the hill
    ...FINALE_KEEPSAKES.flatMap((id) => [
      ...when(has(id), KEEPSAKE_LINES[id]!),
      ...(id === 'w1_keepsake' ? when(all, [
        M('That\'s every one, Grandpa. Every last thing of hers.', TEA, { cue: 'tender', i: 0.6, sting: 'bloom', p: VIL }),
        GF('In ferns. Of course.', '=', { cue: 'grandma', i: 0.5, p: VIL }),
      ]) : []),
    ]),
    N('Far off in the east, the last of the storm said something. Pokey was holding a teacup in one hand. He went on holding it in one hand.', TEA, { cue: 'tender', i: 0.4, p: { ...VIL, zoom: 1.4, focusX: 0.3 } }),
    OFF('Shall I tell the General, sir?', `${TEA} LP:cap_in_hand@.92*.75`, { cue: 'comedy', i: 0.4, p: VIL }),
    GF('Tell him he has retired.', `${TEA} LP:salute_nervous@.92*.75`, { sting: 'laugh', p: VIL }),
    // S-7: the ending cards, one a character, the line under each (endCards.ts; the soldiers' and the squirrels' weeks after are theirs)
    ...END_CARDS.map(([card, line], k) => N(line, '', { ...(k === 0 ? { cue: 'tender' as const, i: 0.45 } : {}), p: { card } })),
  ]);

  // ───────────── THE END ─────────────
  const end = chapter({ name: 'THE END', w: 1, m: 'dusk', cue: 'tender', i: 0.4, base: { particles: 'petals' } }, [
    N('That evening, they climbed the hill to the old tree, where Meeca\'s grandma had said she\'d be. The General went up last.', 'P:happy@.3*.9 M:happy@.5*.9 GV:scout@.72*1.12', { w: 10, p: { plate: 'hill', zoom: 1.15 } }),
    GF('Hello, love. I\'m late. I brought the whole family.', 'P:idle@.2*.9 M:sad@.4*.9 GV:scout@.64*1.12', { cue: 'grandma', i: 0.6, sting: 'heartbreak', p: { plate: 'hill', zoom: 1.5, focusX: 0.64 } }),
    ...when(has('w8_keepsake'), [
      N('Pokey took a paper packet out of his satchel, the one he\'d found in a fern in the Twilight Treetops. Meeca read the label. "For the hill," she said. "Plant when it is quiet." It was. They sat down in the grass together. Dot sat on Pokey\'s head and, for once, didn\'t say a word.', 'P:happy@.34*.9 M:happy@.54*.9 GV:sit@.74*1.12 D:perch@.34^.5', { cue: 'tender', i: 0.5, sting: 'bloom', p: { plate: 'hill', zoom: 1.35 } }),
    ]),
    N('Home was exactly the way they\'d left it, except that the Heartbloom was open, and a snail who had set off across the garden path on the morning they took Meeca was half an inch from the finish line.', 'PH:arm_around@.34*1.1 H:epic@.68^.8', { cue: 'tender', i: 0.5, p: { zoom: 1.2 } }),
    P('He\'s gonna make it. He trained for it.', 'PH:cheek_glad@.34*1.1 H:epic@.68^.8', { sting: 'laugh' }),
    N('Meeca sat down on the garden path beside the snail. After a while, Pokey sat down too.', 'PH:sit_hug@.4*1.1 H:epic@.7^.8', { cue: 'finale', i: 0.8, sting: 'bloom', p: { zoom: 1.2 } }),
    // SR-36: her prologue snacks, and her "early for something, once": the game ends on a laugh, and on Dot healed
    N('Dot went to get snacks. She was back before they\'d finished sitting down.', 'PH:sit_hug@.4*1.1 H:epic@.7^.8 D:cheer@.62^.46', { sting: 'laugh', p: { zoom: 1.15 } }),
    // (every snail found, one in each world: SNAIL_FINDS)
    ...when(allOf(SNAIL_FINDS, found), [P('I saw him every day, you know. He never once stopped for tea.', 'PH:sit_hug@.4*1.1 H:epic@.7^.8', { cue: 'tender', i: 0.5 })]),
  ]);

  return [...tower, ...seam, ...morning, ...end];
}
