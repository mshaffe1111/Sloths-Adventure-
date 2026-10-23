/**
 * What happens on the road: one picture sequence when Pokey first arrives in each world, and one halfway through it (after stage 5),
 * where Dot the courier brings Meeca's latest note. Together they carry the middle of the story:
 *   Act I   The Trail   (1-3)  a quest with a good-humored hummingbird; patience wins; the guardians are bound, not wicked.
 *   Act II  The Cost    (4-7)  the mystery gets personal, the notes get thin, the General turns out to be family.
 *   Act III The Iron Road (8-10) rest, loss, mercy and the last climb.
 * The guardians' fights and what comes after them are in storyBosses.ts and storyChapters.ts.
 */
import { chapter, D, M, N, OFF, P, pan, say } from './storyDsl.ts';
import { PROMISE_PANELS } from './storyChapters.ts';
import type { StoryPanel } from './story.ts';

export interface WorldStory {
  /** short line under the world name on the intro card */
  teaser: string;
  panels: StoryPanel[];
}

export const C1 = 'WORLD 1 · EMERALD CANOPY';
export const C2 = 'WORLD 2 · SUNLIT RIVERBANK';
export const C3 = 'WORLD 3 · MOSSY GROTTO';
export const C4 = 'WORLD 4 · MIST CASCADES';
export const C5 = 'WORLD 5 · ORCHID SANCTUARY';
export const C6 = 'WORLD 6 · DEEP MANGROVE';
export const C7 = 'WORLD 7 · ANCIENT RUINS';
export const C8 = 'WORLD 8 · TWILIGHT TREETOPS';
export const C9 = 'WORLD 9 · VOLCANIC JUNGLE';
export const C10 = 'WORLD 10 · STORMY HIGHLANDS';

/** the halfway scenes get a title card of their own: same world, a new line under it */
const MID: Record<number, string> = {
  1: 'WORLD 1 · I AM FINE', 2: 'WORLD 2 · THE COLLARS', 3: 'WORLD 3 · ALL FERNS LOOK ALIKE', 4: 'WORLD 4 · FEATHERS',
  5: 'WORLD 5 · THE POUCH', 6: 'WORLD 6 · THE LAST NOTE', 7: 'WORLD 7 · THE QUIET', 8: 'WORLD 8 · ONE BRANCH', 9: 'WORLD 9 · THE LANTERN',
  10: 'WORLD 10 · THE SONG FROM THE TOWER',
};

// ═════════════════════════════════ ACT I · THE TRAIL ═════════════════════════════════

const GRUNT = say('Gruntlewick');

const W1 = chapter({ name: C1, w: 1, m: 'day', cue: 'journey', i: 0.4, base: { particles: 'petals' } }, [
  N('The first petal was stuck to the bark of a kapok tree, pressed flat, at about the height of someone being marched past. Pokey peeled it off with one claw and held it in both hands.',
    'P:idle@.3 B1~@.8<', { p: pan(1.1, 0.4, 0.5, 1.25, 0.5, 0.58, 8) }),
  P('She pressed it flat. With a soldier on each arm.', 'P:talk@.3 B1~@.8<'),
  D('Don\'t move! Don\'t—oh. You aren\'t. Good. Wonderful. I followed the petals for two days and one of them was a hibiscus, which is a DIFFERENT pink, I want that on the record, and I went all the way round a hill, and I have post!',
    'P:surprised@.3 D@.64^.4', { cue: 'comedy', i: 0.45 }),
  P('You said you\'d be right back.', 'P:talk@.3 D@.64^.4'),
  D('I was going to be! There was a—it doesn\'t matter what there was. Two days. Forty-one hours, I counted, and some of those were naps.', 'P:worried@.3 D@.64^.4'),
  P('You got away from the soldiers, though.', 'P:happy@.3 D@.64^.4'),
  D('Barely! One of them looked straight at me and said "Is that a hummingbird?" and a different one said "Where?" and I was already in a bush. I stayed in the bush an hour. It was a very good bush.', '=', { sting: 'laugh' }),
  D('Now. Business. Meeca got three notes out before they closed the netting. There is exactly one gap in it, the width of a folded letter, and notes go OUT. Nothing goes in. I tried to carry one in, twice, and it was the same thorn both times.',
    'P:idle@.3 D@.64^.4', { cue: 'dread', i: 0.3 }),
  P('So I can\'t tell her I\'m coming.', 'P:worried@.3 D@.64^.4'),
  D('First note. "Pokey. If you have this, you found the petal. I put it low so you wouldn\'t have to look up. Eat something. Don\'t stand in the rain and think about it. —M."', 'P:happy@.3 D@.64^.4', { cue: 'tender', i: 0.4 }),
  P('I ate a leaf this morning.', 'P:talk@.3 D@.64^.4'),
  D('That isn\'t eating, that\'s apologizing to a leaf.', '=', { sting: 'laugh' }),
  P('Then I\'ll arrive. It\'s all I can do.', 'P:determined@.3 D@.64^.4', { cue: 'resolve', i: 0.4 }),
  D('Arriving. Great. I\'ll fly ahead and look at things.', 'P:determined@.3 D@.64^.4'),
  N('On a branch above them something long shifted its weight. It had been told to look fearsome and had been doing it since breakfast. It was a warm morning, and it was tired of it.',
    'P:idle@.3 D@.64^.4 B1~@.84<', { cue: 'dread', i: 0.35 }),
]);

const W1_MID = chapter({ name: MID[1], w: 1, m: 'day', cue: 'comedy', i: 0.4, base: { particles: 'petals' } }, [
  D('Halfway! That\'s a real thing people say, I looked it up. Second note. It\'s short. I didn\'t open it, I could tell from the weight.', 'P:idle@.3 D@.62^.4'),
  D('"Pokey. I\'m fine. I have a window, a chair, a blanket that smells of mothballs, and a lieutenant who says sorry every time he brings the porridge. Nobody has been unkind. I am fine. —M."',
    'P:happy@.3 D@.62^.4', { cue: 'tender', i: 0.4 }),
  N('Far away, in a tower, a sloth sat at a desk by a window with her back very straight.', 'MS:wait@.5', { w: 10, m: 'dusk', cue: 'tender', i: 0.35, p: { particles: 'none', zoom: 1.35, focusX: 0.5 } }),
  P('Let me see it.', 'P:talk@.3 D@.62^.4', { w: 1, m: 'day', p: { particles: 'petals' } }),
  N('He ran a claw under the writing. The words sat on the line, evenly, from one edge of the paper to the other.', 'P:think@.3 D@.62^.4'),
  P('She falls off the end of the line. Always. She runs out of room and writes the last word on top.', 'P:worried@.3 D@.62^.4', { cue: 'sorrow', i: 0.3 }),
  D('This one has margins! Look at them! She had room for margins!', '=', { cue: 'comedy', i: 0.35 }),
  P('Yes.', 'P:worried@.34 D@.62^.4', { cue: 'sorrow', i: 0.35 }),
  N('He folded the note along its own creases and put it in the satchel with the first one. It took him two tries to get the flap shut.', 'P:tired@.34 D@.62^.4', { cue: 'tender', i: 0.45 }),
]);

const W2 = chapter({ name: C2, w: 2, m: 'day', cue: 'comedy', i: 0.4, base: { particles: 'sparkles' } }, [
  N('The Sunlit Riverbank was wide, brown, and in no hurry. A village of sloths had dug its houses into the bank in a long row, and every front door carried the same hand-painted sign: PLEASE BE PATIENT.',
    'P:idle@.3', { cue: 'journey', i: 0.4, p: pan(1.1, 0.2, 0.55, 1.2, 0.6, 0.55, 9) }),
  P('I like it here.', 'P:happy@.3'),
  N('At the top of the bank the village crier, Gruntlewick, was reading out a flood warning. He had started on Tuesday. The flood had come and gone since. He was on the word FLOOD.',
    'P:idle@.24 D@.5^.4 TC:hat_shout@.8*.9', { cue: 'comedy', i: 0.5 }),
  D('And that\'s the mailman, with the parcel! He\'s been taking it to number nine since the spring, it\'s marked URGENT in red, I offered to carry it and he said thank you and held on tighter!',
    'P:talk@.24 D@.5^.4 PO:walk_parcel@.62*.9 TC:scroll@.86*.9', { sting: 'laugh' }),
  N('The mailman and Pokey passed each other on the path. They nodded. It took a while, and neither of them minded.', 'P:happy@.24 D@.5^.4 PO:carry_walk@.62*.9 TC:scroll@.86*.9'),
  GRUNT('Young sir. You have come a long way. Are your people behind you? They will want to know where you have got to.', 'P:idle@.24 D@.5^.4 TC:announce@.8*.9', { cue: 'tender', i: 0.3 }),
  P('Somewhere behind me. I think they stopped for lunch.', 'P:talk@.24 D@.5^.4 TC:announce@.8*.9'),
  GRUNT('Ah. Then they will catch you up.', 'P:idle@.24 D@.5^.4 TC:hat_stand@.8*.9'),
  P('I expect so.', 'P:talk@.24 D@.5^.4 TC:hat_stand@.8*.9'),
  N('Dot had been in the middle of a sentence. He left it there and went to look at a reed.', 'P:idle@.24 D:flinch@.5^.4 TC:hat_stand@.86*.9', { cue: 'sorrow', i: 0.3 }),
  N('Pokey touched the petal on his wrist.', 'P:idle@.3', { cue: 'sorrow', i: 0.3, p: { zoom: 1.5, focusX: 0.3 } }),
  D('Note! Fresh note! From Meeca, obviously. "Pokey. The river king will want to be admired. He is wearing the crown of petals I wove him on the way past. It is crooked. Tell him it suits him. If the village offers dinner, say no. Stay for the pudding. —M."',
    'P:idle@.3 D@.64^.4', { cue: 'journey', i: 0.4 }),
  P('Dinner, no. Pudding, yes.', 'P:talk@.3 D@.64^.4'),
  N('Out on the water something long and dark slid toward the bank without making a ripple. On its head, slightly crooked, sat a crown of pink petals.',
    'P:idle@.3 D@.64^.4 B2~@.82<', { cue: 'dread', i: 0.3 }),
]);

const W2_MID = chapter({ name: MID[2], w: 2, m: 'day', cue: 'comedy', i: 0.4, base: { particles: 'petals' } }, [
  N('They served the pudding at last. It had been started on Monday. Every sloth at the long table agreed it was worth the wait, and Pokey agreed hardest, with his mouth full.', 'P:happy@.3 D@.62^.4', { sting: 'laugh' }),
  D('Pokey, I have a note, and it\'s not a good one, and I need you to stay calm, which, you do, you always do, it\'s the rest of us who— here.', 'P:idle@.3 D@.62^.4'),
  D('"Every guardian wears an iron collar with thorns on the inside. They scratch at them when they think nobody is looking. I don\'t think they chose this. Be kind to them. But please win. —M."',
    'P:worried@.3 D@.62^.4', { cue: 'reveal', i: 0.35 }),
  P('Venom Fang scratched at his neck the whole time. I thought it was a rash.', 'P:talk@.3 D@.62^.4'),
  D('It isn\'t a rash.', '=', { cue: 'dread', i: 0.35 }),
  N('Pokey put down his spoon. The pudding that had taken three days to make went cold in front of him, and nobody at the table said a word about it.', 'P:tired@.3 D@.62^.4', { cue: 'sorrow', i: 0.3 }),
  P('She wants me to be gentle with the ones who are stopping me.', 'P:talk@.3 D@.62^.4', { cue: 'tender', i: 0.4 }),
  D('That\'s her whole thing. It\'s also, a little bit, her whole problem.', '=', { sting: 'laugh' }),
]);

const W3 = chapter({ name: C3, w: 3, m: 'night', cue: 'dread', i: 0.25, base: { particles: 'sparkles' } }, [
  N('The Mossy Grotto was lit from above by glowworms. They hung from the ceiling in long threads, and each one hummed a slightly different note.',
    'P:idle@.3', { p: pan(1.05, 0.5, 0.35, 1.3, 0.5, 0.6, 8) }),
  D('I don\'t do dark, Pokey. I do daylight. I do a bit of dusk if there are snacks. Is this dusk? It\'s dusk-adjacent. There are no snacks, so I\'m not counting it.', 'P:idle@.3 D:flinch@.62^.4', { cue: 'comedy', i: 0.4 }),
  P('Stay close. I\'m dim, but I\'m steady.', 'P:happy@.3 D@.62^.4'),
  D('Dim and steady. I\'ll take it. I\'ve worked for less.', '=', { sting: 'laugh' }),
  N('Pokey stopped to listen to the glowworms, and the glowworms noticed. One at a time, over his head, they turned up, until he stood in a warm yellow light that had not been there a minute before.', 'P:happy@.3 D@.62^.4', { cue: 'bloom', i: 0.4 }),
  N('Between the stalactites hung the old thorn vines that Grandma had always said were asleep. One of them moved.', 'P:idle@.3 D@.62^.4', { cue: 'dread', i: 0.3 }),
  N('On the floor, in the mud, were footprints. Each one was as wide as Pokey was tall. They went once around the two of them, in a perfect circle, and stopped.',
    'P:worried@.3 D@.62^.4 B3~@.88<', { cue: 'dread', i: 0.4, p: { particles: 'none' } }),
  D('I\'m looking at them with my eyes closed.', '='),
  P('That doesn\'t make them smaller.', 'P:talk@.3 D@.62^.4 B3~@.88<'),
  N('Far back in the dark something shifted its weight. Whatever it was, it could stand perfectly still, too.',
    'P:worried@.3 D@.62^.4 B3~@.9<', { cue: 'dread', i: 0.4 }),
]);

const W3_MID = chapter({ name: MID[3], w: 3, m: 'night', cue: 'comedy', i: 0.35, base: { particles: 'sparkles' } }, [
  D('Okay. Confession. Meeca asked me to hide Grandma\'s things before the soldiers came, so I did, I hid them, I put them in ferns, a LOT of ferns, all over the forest, very fast, because there were boots.',
    'P:idle@.3 D@.62^.4'),
  P('In ferns.', 'P:surprised@.3 D@.62^.4'),
  D('The plan was sound. The ferns were the problem. All ferns look alike, that\'s the thing about ferns, and I have lost track of which is which.', '=', { sting: 'laugh' }),
  P('Where, roughly?', 'P:talk@.3 D@.62^.4'),
  D('Ferny places. If you crouch down next to one it might rustle. That could have been the wind. I\'ve become very good at ferns, I can tell you that much, I can tell you which ones are rude.',
    '=', { cue: 'journey', i: 0.4 }),
  N('So the search for Grandma\'s things began. A sloth crouched beside a fern, and a hummingbird hovered beside the sloth, and the two of them said "hello?" in a very small voice.',
    'P:duck@.3 D@.62^.4', { cue: 'comedy', i: 0.45 }),
]);

// ═════════════════════════════════ ACT II · THE COST ═════════════════════════════════

const W4_ACT = chapter({ name: 'ACT II · THE COST', w: 4, m: 'day', cue: 'dread', i: 0.4, base: { particles: 'sparkles' } }, [
  N('The vine held. Pokey hung from the end of it, turning a little, over the long white nothing where the ledge used to be.', 'P:hurt@.5', { sting: 'cliffhanger', p: pan(1.0, 0.5, 0.2, 1.2, 0.5, 0.55, 5) }),
  P('I\'m looking down.', 'P:worried@.5 D@.7^.3'),
  D('Why are you looking down?! Don\'t look at the DOWN, look at the UP, the up is lovely, there\'s a bird, it\'s a vulture, it\'s a very small vulture, it isn\'t even looking at you!', '=', { cue: 'comedy', i: 0.5 }),
  P('Dot. It\'s kind of you to try. You weigh about as much as a spoon.', 'P:talk@.5 D@.7^.3'),
  D('A SPOONFUL. Heaped.', '=', { sting: 'laugh' }),
  N('It took Pokey eleven minutes to climb up. Dot timed it, then sat down hard, as if he had done the climbing.', 'P:tired@.4 D@.64^.35', { cue: 'journey', i: 0.4 }),
  P('That wasn\'t the Prowler. That was the General, using the Prowler\'s paw. He dropped the ledge and he said hello.', 'P:talk@.3 D@.64^.35', { cue: 'dread', i: 0.4 }),
  D('He says hello to everyone like that, usually with arrows, I\'ve been hello\'d at by arrows, it\'s a whole thing, you just got the personal touch.', '='),
  P('The Prowler said sorry. Twice.', 'P:worried@.3 D@.64^.35', { cue: 'reveal', i: 0.35 }),
  P('That was a loud horn.', '=', { cue: 'dread', i: 0.35 }),
  D('It was a HORN, Pokey, horns have a person on the end, thunder doesn\'t, I check, I check every time.', 'P:worried@.3 D:flinch@.64^.35', { cue: 'sorrow', i: 0.3 }),
]);

const W4 = chapter({ name: C4, w: 4, m: 'day', cue: 'journey', i: 0.5, base: { particles: 'sparkles' } }, [
  N('Waterfalls as tall as the sky. The water ran cloudy, which the old sloths say happens when the Heartbloom has stayed closed too long.',
    'P:idle@.3 D@.64^.35', { cue: 'journey', i: 0.5, p: pan(1.2, 0.5, 0.7, 1.1, 0.5, 0.2, 6) }),
  N('A feather drifted down out of the mist, as long as Pokey\'s whole arm.', 'P:surprised@.3 D@.64^.35'),
  D('That\'s Her Majesty the Sky Sovereign, so please, please be polite, she hates being interrupted in the middle of a dive.', 'P:idle@.3 D@.64^.35 B4~@.82<'),
  P('I\'ll wait until she\'s finished.', 'P:happy@.3 D@.64^.35 B4~@.82<'),
  D('She STARTED it at breakfast, I watched her go, she took a sandwich.', '=', { sting: 'laugh' }),
]);

const W4_MID = chapter({ name: MID[4], w: 4, m: 'day', cue: 'tender', i: 0.35, base: { particles: 'petals' } }, [
  D('Okay. The note. Don\'t be alarmed. It\'s short.', 'P:idle@.3 D@.62^.4', { cue: 'dread', i: 0.3 }),
  P('Short.', 'P:worried@.3 D@.62^.4'),
  N('Today\'s note said: "Still here." That was all of it. Dot\'s tail had a bare patch the size of a thumb, and he kept turning so that Pokey would see the other side.', 'P:worried@.3 D@.62^.4', { cue: 'sorrow', i: 0.3 }),
  P('Why keep bringing them?', 'P:talk@.3 D@.62^.4'),
  D('Two words weigh nothing. I checked. I weighed it against a berry, and the berry won, it won by a lot, I\'d like it noted that I was thorough.', 'P:surprised@.3 D@.62^.4', { cue: 'tender', i: 0.5 }),
  P('...Dot.', 'P:happy@.3 D@.62^.4'),
  D('Don\'t. I\'ll cry, and I cannot afford the water weight.', '=', { sting: 'laugh' }),
  N('Pokey read the note twice. Then he put it in the satchel, on top, where it would not get squashed.', 'P:idle@.3 D@.62^.4', { cue: 'tender', i: 0.4 }),
]);

const W5 = chapter({ name: C5, w: 5, m: 'day', cue: 'comedy', i: 0.4, base: { particles: 'sparkles' } }, [
  N('The Orchid Sanctuary was the loveliest place on the whole road, and Pokey was counting the insides of his own eyelids.', 'P:happy@.3', { cue: 'bloom', i: 0.4, p: pan(1.05, 0.2, 0.5, 1.25, 0.7, 0.55, 9) }),
  N('It was barely afternoon, and the orchids were already closing, a few at a time.', 'P:worried@.3', { cue: 'dread', i: 0.3 }),
  N('On the trunk of the first tree someone had carved a message with something small and sharp. The letters were shaky, as if cut on the move. POKEY - DON\'T SIT. - M',
    'P:surprised@.3 D@.62^.4', { cue: 'meeca', i: 0.4, sting: 'bloom', p: { zoom: 1.5, focusX: 0.4 } }),
  P('She did this while they marched her past.', 'PF:happy+worried@.4', { cue: 'tender', i: 0.4 }),
  D('With a HAIRPIN. She\'s extremely resourceful, she\'s the most resourceful person I know, and she also now has no hairpin, so if she needs to pick a lock, and I\'m saying she will, she\'ll have to do it with her hands.', 'P:happy@.3 D@.62^.4', { cue: 'comedy', i: 0.45 }),
  D('Rules! Don\'t eat anything. Don\'t drink anything. Don\'t touch the silk. Don\'t admire the silk, it takes it as a compliment.', '=', { cue: 'comedy', i: 0.5 }),
  N('A small table stood in the middle of the path, set for two: china cups, a plate of tiny cakes and, on a silk napkin, a card in careful handwriting. "Do sit. The kettle is on. It is always on."',
    'P:idle@.3 D@.62^.4 B5~@.86<'),
  P('That\'s very polite.', 'P:talk@.3 D@.62^.4 B5~@.86<'),
  D('That\'s what\'s so scary.', '=', { sting: 'laugh' }),
  P('Dot. Be honest. How bad would it be if I just had one cake?', 'P:talk@.3 D@.62^.4 B5~@.86<'),
  D('You would be a cake, Pokey. You would be, forever, a very still cake.', '=', { cue: 'dread', i: 0.3 }),
]);

const W5_MID = chapter({ name: MID[5], w: 5, m: 'dusk', cue: 'tender', i: 0.3, base: { particles: 'petals' } }, [
  N('They stopped to rest on a branch where the orchids hung in rows. Dot touched the pouch at his hip. Then he touched it again.', 'P:tired@.3 D@.62^.45', { cue: 'tender', i: 0.3 }),
  P('You keep checking that pouch.', 'P:talk@.3 D@.62^.45'),
  D('It\'s a thing. It isn\'t for you.', '=', { cue: 'sorrow', i: 0.3 }),
  P('Who is it for?', 'P:talk@.3 D@.62^.45'),
  D('Somebody I\'m scared of.', 'P:worried@.3 D@.62^.45'),
  P('The General?', 'P:talk@.3 D@.62^.45'),
  D('It\'s not him I\'m scared of. It\'s what it says, and what he does when he reads it, and that I\'m, that I took so—', '=', { cue: 'sorrow', i: 0.4 }),
  P('Then give it to him when you\'re ready. Not before.', 'P:happy@.3 D@.62^.45'),
  D('And if it\'s too late by then?', 'P:worried@.3 D@.62^.45', { cue: 'sorrow', i: 0.3 }),
  P('Slow isn\'t stopped.', 'P:happy@.3 D@.62^.45', { cue: 'grandma', i: 0.4 }),
  D('Is that true, or is that just something you say?', 'P:happy@.3 D@.62^.45'),
  P('I don\'t know yet. It hasn\'t been wrong.', 'P:happy@.3 D@.62^.45', { cue: 'tender', i: 0.4 }),
  N('Dot let go of the pouch. A minute later his claw was back on it.', 'P:happy@.3 D@.62^.45', { cue: 'sorrow', i: 0.3 }),
]);

const W6 = chapter({ name: C6, w: 6, m: 'dusk', cue: 'dread', i: 0.3, base: { particles: 'sparkles' } }, [
  N('The roots of the Deep Mangrove stood up out of the water in a maze, and the sun only got in where they allowed it. The water between them lay flat and gray. Rivers are kind when the Heartbloom is open. This one had stopped.', 'P:idle@.3', { p: pan(1.05, 0.5, 0.3, 1.3, 0.5, 0.6, 8) }),
  P('Water that flat has something under it.', 'P:worried@.3 D@.62^.4 B6~@.86<'),
  N('Out of the black water a spear rose, slowly. It turned to look at them. Then it sank again.', 'P:worried@.3 D@.62^.4 B6~@.88<', { cue: 'dread', i: 0.4, sting: 'darkness' }),
  D('Did the water just look at us?', '=', { cue: 'comedy', i: 0.35 }),
  P('Somebody\'s holding it.', 'P:worried@.3 D@.62^.4 B6~@.88<'),
  D('That\'s WORSE! I\'m fine, I\'m completely fine, I\'ve gone back about nine feet, which for me is a lot, I\'m just over here!', '='),
  D('"Pokey: the Reaver eats lunch at noon. Do NOT meet him at noon." ...That\'s all it says. There\'s no second line. There\'s a stain.', 'P:idle@.3 D@.62^.4', { sting: 'laugh' }),
  P('What time is it?', 'P:worried@.3 D@.62^.4'),
  D('NOON. It\'s NOON, I can see the sun, there, straight down through the roots, Pokey, it is directly OVERHEAD.', '=', { cue: 'dread', i: 0.4, sting: 'cliffhanger' }),
]);

const W6_MID = chapter({ name: MID[6], w: 6, m: 'dusk', cue: 'sorrow', i: 0.3, base: { particles: 'petals' } }, [
  D('Pokey. I have to tell you something, and I tried to make it funny the whole way over, I got as far as a pelican, and then I couldn\'t.', 'P:tired@.3 D:sad@.62^.4', { cue: 'sorrow', i: 0.3 }),
  P('Go on.', 'P:talk@.3 D@.62^.4'),
  D('That was the last note I can get out. The net is sealed past here. There\'s no gap anymore. I checked every inch. I checked it with my face.', '=', { cue: 'dread', i: 0.35 }),
  D('She wrote me two. The lunch one was the silly one. This one\'s sealed, she wrote it on a very bad day, and she made me swear to give it to you only when you need it.', 'P:worried@.3 D@.62^.4'),
  P('How will I know when I need it?', 'P:talk@.3 D@.62^.4'),
  D('She said, "He\'ll know. He\'ll have stopped."', '=', { cue: 'sorrow', i: 0.4, sting: 'heartbreak' }),
  N('Dot had three tail feathers left. He had left the rest in the net. Pokey had counted, and said nothing.', 'P:sad@.3 D@.62^.4', { cue: 'sorrow', i: 0.3 }),
  N('Dot tucked the sealed note into the satchel with both claws, gently, as if it might break.', 'P:sad@.3 D@.62^.4', { cue: 'tender', i: 0.3 }),
  D('I\'m going round. There\'s always a seam, I\'m a hummingbird, I live in seams, I\'ll find the one that\'s open and I\'ll be back before you\'ve, before you\'ve even— I\'ll be early, Pokey. Watch me.', '=', { cue: 'resolve', i: 0.4 }),
  P('We never agreed on a time.', 'P:happy@.3 D@.62^.4', { cue: 'tender', i: 0.4 }),
  N('Dot went up through the roots. One leaf kept shivering after he was gone.', 'P:sad@.3', { cue: 'sorrow', i: 0.4 }),
]);

const W7 = chapter({ name: C7, w: 7, m: 'dusk', cue: 'reveal', i: 0.3, base: { plate: 'ruins', particles: 'sparkles' } }, [
  N('The temple door stood slightly open. Meeca had come through here. So, by the look of the floor, had something heavy.', 'P:idle@.3', { p: pan(1.05, 0.5, 0.35, 1.3, 0.55, 0.6, 8) }),
  N('The vines on the old walls hung brown. When he touched one, it did not move.', 'P:tired@.3', { cue: 'dread', i: 0.25 }),
  N('He turned to say something to Dot. The air by his shoulder was empty.', 'P:sad@.3', { cue: 'sorrow', i: 0.3 }),
  N('In the first courtyard, ten stone chairs stood in a ring around a cracked floor where a faint sigil still glowed. Each had a creature carved into its back: a panther, a crocodile, an owl.',
    'P:worried@.3', { cue: 'reveal', i: 0.35, p: { zoom: 1.5, focusX: 0.4 } }),
  N('An eleventh chair stood a little apart from the ring, plain, with no carving at all. Dry leaves lay on the seat, and in the middle of it a deep dent, worn by someone who had sat there often, and then stopped.',
    '=', { cue: 'dread', i: 0.35 }),
  P('Ten, and him.', 'P:talk@.3', { cue: 'sorrow', i: 0.3 }),
  N('From the shadows, something very large began to speak. It took four minutes to say good morning.', 'P:idle@.3 B7~@.84<', { cue: 'comedy', i: 0.4, sting: 'laugh' }),
]);

const W7_MID = chapter({ name: MID[7], w: 7, m: 'dusk', cue: 'sorrow', i: 0.3, base: { particles: 'sparkles' } }, [
  P('Excuse me. Do you know the way up?', 'P:talk@.3', { cue: 'comedy', i: 0.3 }),
  N('The statue said nothing. Pokey thanked it for not interrupting.', 'P:happy@.3', { sting: 'laugh' }),
  N('Further in, he stopped to listen to the quiet. It was a different quiet from the Grotto\'s.', 'P:tired@.3', { cue: 'sorrow', i: 0.3 }),
  P('Dot would say this place is older than the river, and he\'d have a number. He\'d have it written down.', 'P:talk@.3', { cue: 'tender', i: 0.3 }),
  N('He left a gap after it, for the answer.', 'P:tired@.3'),
  N('He hummed to fill it, badly.', 'P:determined@.3', { cue: 'resolve', i: 0.35 }),
]);

// ═════════════════════════════════ ACT III · THE IRON ROAD ═════════════════════════════════

const W8_ACT = chapter({ name: 'ACT III · THE IRON ROAD', w: 8, m: 'dusk', cue: 'dread', i: 0.3, base: { particles: 'sparkles' } }, [
  N('Seven guardians lay behind him. No note had come since the mangrove, and he had stopped checking the satchel for one.', 'P:tired@.3', { p: pan(1.05, 0.5, 0.35, 1.3, 0.45, 0.6, 8) }),
  P('Seven. Two more, and then him.', 'P:talk@.3', { cue: 'sorrow', i: 0.3 }),
]);

const W8_A = chapter({ name: C8, w: 8, m: 'night', cue: 'dread', i: 0.2, base: { particles: 'sparkles' } }, [
  N('The fireflies came out as the light went. Pokey kept going. Meeca was ahead in the dark, and so was something with enormous wings.',
    'P:tired@.3 B8~@.86<', { p: pan(1.05, 0.5, 0.35, 1.25, 0.45, 0.6, 8) }),
  N('He sat down on a branch to rest his eyes. He was asleep before he had finished sitting.', 'PF:tired+calm_closed@.4', { cue: 'tender', i: 0.2, p: { zoom: 1.3, focusX: 0.4 } }),
]);

/** after the dream (PROMISE_PANELS, storyChapters.ts) Pokey wakes up to Dot */
const W8_B = chapter({ name: 'WORLD 8 · WAKE UP', w: 8, m: 'night', cue: 'tender', i: 0.4, base: { particles: 'sparkles' } }, [
  D('Wake up wake up wake up, you were mumbling, mostly about a petal, and I have been flying for THREE DAYS and I would like to sit down on something that is not air, is this branch taken, Pokey? POKEY.',
    'P:tired@.3 D@.62^.4'),
  P('Dot. You came back. You\'re bleeding.', 'P:surprised@.3 D@.62^.45', { cue: 'sorrow', i: 0.4, p: { memory: false } }),
  D('It\'s a scratch. It\'s nine scratches, I counted. I found a seam in the net that was just narrower than me and went through it anyway, and then I went up the wall to her window, it has bars, I fit between them, mostly. Here.',
    '=', { cue: 'tender', i: 0.45 }),
  D('"Pokey, I\'m quite sure you\'re asleep right now. It\'s fine. I\'d be too. Keep going. I\'m still here. And I have found out who he is. I\'ll tell you when I can look at you."',
    'P:talk@.3 D@.62^.45', { cue: 'reveal', i: 0.4 }),
  P('She knows. Meeca knows.', 'P:worried@.3 D@.62^.45'),
  D('She worked it out by herself, in the dark. She said she tried being angry for an afternoon and it didn\'t fit. She gave me four more notes, they\'re in my pouch, I\'m rationing them, she\'s very funny when she\'s frightened.', '=', { cue: 'sorrow', i: 0.4 }),
  P('Dot, sit down. I have to tell you something.', 'P:talk@.3 D@.62^.45', { cue: 'tender', i: 0.3 }),
  D('I\'m sitting. It\'s hover-sitting. It takes core.', '=', { sting: 'laugh' }),
  P('The General is her grandfather. I found the photograph in the ruins.', 'P:talk@.3 D@.62^.45', { cue: 'reveal', i: 0.35 }),
  D('I know. I have always known. I was there the night of the storm.', '=', { cue: 'sorrow', i: 0.4 }),
  N('Dot landed on the branch. Pokey hadn\'t seen his feet touch anything in days.', 'P:sad@.3 D@.62^.55', { cue: 'sorrow', i: 0.4 }),
  P('You never said.', 'P:surprised@.3 D@.62^.45'),
  D('I can\'t tell you half of it, it doesn\'t come in halves. Grandma gave me a letter for him that night. I was late with it, and I still have it, and I\'ll say the rest once, to him.', 'P:surprised@.3 D@.62^.5', { i: 0.35 }),
  P('She\'s been up there by herself with all of it.', 'P:worried@.3 D@.62^.45', { cue: 'resolve', i: 0.4 }),
  D('Yes.', '=', { cue: 'sorrow', i: 0.3 }),
  P('Then we should go.', 'P:determined@.3 D@.62^.45', { cue: 'resolve', i: 0.5 }),
]);

const W8_MID = chapter({ name: MID[8], w: 8, m: 'night', cue: 'tender', i: 0.3, base: { particles: 'sparkles' } }, [
  P('Dot, you\'re humming.', 'P:talk@.3 D@.62^.4', { cue: 'comedy', i: 0.3 }),
  D('I\'m vibrating. It happens when I don\'t sleep. It\'s worse.', '=', { sting: 'laugh' }),
  D('Pokey. A question. It\'s the middle of the night and I\'m asking it out loud and I\'d like you not to repeat it.', 'P:idle@.3 D@.62^.4'),
  P('Of course.', 'P:talk@.3 D@.62^.4'),
  D('It\'s about a bird. Not me. A bird who\'s nearly somewhere and also a day behind, and I\'d like to know what you\'d say to him.', 'P:idle@.3 D@.62^.4', { cue: 'sorrow', i: 0.3 }),
  P('Next branch.', 'P:talk@.3 D@.62^.4', { cue: 'grandma', i: 0.35 }),
  D('That\'s it?', '='),
  P('That\'s what Meeca says. Then the one after.', 'P:talk@.3 D@.62^.4', { cue: 'tender', i: 0.35 }),
  D('Huh.', '=', { cue: 'tender', i: 0.4 }),
  N('Dot stopped vibrating somewhere around the next branch. Neither of them mentioned it.', 'P:happy@.3 D@.62^.4', { cue: 'tender', i: 0.4 }),
]);

const W9 = chapter({ name: C9, w: 9, m: 'dusk', cue: 'comedy', i: 0.4, base: { particles: 'embers' } }, [
  N('The Volcanic Jungle glowed from underneath. The air tasted of pepper. Ahead, something enormous was clearing its throat.',
    'P:idle@.3 D@.62^.4 B9~@.88<', { p: pan(1.05, 0.5, 0.35, 1.3, 0.5, 0.6, 8) }),
  N('A voice boomed, "A visitor!" There was a pause. Then, much smaller: "Intruder."', '=', { sting: 'laugh' }),
  D('"It\'s cold. I\'m fine. The General sent up a blanket. Please don\'t tell him I said thank you." That\'s the last of the silly ones. The rest are the other kind, and I\'m not reading those out loud, they\'re yours.',
    '=', { cue: 'tender', i: 0.4 }),
  P('She said thank you to him?', 'P:surprised@.3 D@.62^.4'),
  D('She says thank you to everyone. She said it to a thorn once. It had been trying to snag her sleeve, and it just stopped.', '=', { sting: 'laugh' }),
  N('Behind the smoke, the fortress stood up out of the thunder. Pokey put the note in the satchel, on top.',
    'P:idle@.3 D@.62^.4', { cue: 'dread', i: 0.4, p: pan(1.1, 0.7, 0.4, 1.1, 0.4, 0.6, 7) }),
]);

const W9_MID = chapter({ name: MID[9], w: 9, m: 'dusk', cue: 'comedy', i: 0.35, base: { particles: 'embers' } }, [
  N('The lantern was back, held low to the ground, which had not fooled anyone the first time.', 'P:idle@.26 D@.56^.4 LP:lantern@.88*.9', { sting: 'laugh' }),
  OFF('I am so sorry, it is me again. I told the kitchen I was out buying thread. I have bought a great deal of thread. I have been ordered to sew the seam shut, and I have done six stitches, and I am afraid five of them are in the wrong place.', 'P:idle@.26 D@.56^.4 LP:mend_coat@.86*.9'),
  D('PELL! I forgive the scratches! All nine of them!', 'P:idle@.26 D:cheer@.56^.4 LP:cap_in_hand@.86*.9', { cue: 'comedy', i: 0.45 }),
  OFF('Miss Meeca asked me to tell you one thing. She says: "Tell Pokey I am knitting him a scarf. It is going to be very long. He will have time to arrive."',
    'P:idle@.26 D@.56^.4 LP:hopeful@.86*.9', { cue: 'tender', i: 0.45 }),
  P('Tell her I\'ll wear it.', 'P:happy@.26 D@.56^.4 LP:hopeful@.86*.9'),
  OFF('I shall. Sir. Everyone. I am so sorry, I really must go.', 'P:happy@.26 D@.56^.4 LP:salute_nervous@.86*.9', { sting: 'laugh' }),
  D('Pokey, you\'ve been quiet for two hours, I counted, it was two hours and eleven minutes, you\'re worrying, I can tell, you do a thing with your eyebrow.', 'P:tired@.3 D@.62^.4', { cue: 'comedy', i: 0.35 }),
  P('I\'m thinking about Meeca\'s grandfather.', 'P:talk@.3 D@.62^.4', { cue: 'sorrow', i: 0.35 }),
  D('What about him?', 'P:worried@.3 D@.62^.4'),
  P('Do you think he sleeps?', '=', { cue: 'tender', i: 0.4 }),
  D('No.', 'P:worried@.3 D@.62^.4', { cue: 'sorrow', i: 0.3 }),
  P('He ate four bowls of the wrong soup. Somebody who does that isn\'t sleeping.', 'P:talk@.3 D@.62^.4'),
  D('You\'re going to go up there and ASK him, aren\'t you, nicely, with your WORDS, in front of all those spikes.', 'P:happy@.3 D@.62^.4', { cue: 'tender', i: 0.45 }),
  P('I thought I\'d start there.', 'P:determined@.3 D@.62^.4'),
]);

const W10 = chapter({ name: C10, w: 10, m: 'storm', cue: 'dread', i: 0.4, base: { particles: 'rain' } }, [
  N('The Stormy Highlands began where the trees stopped, and after that the rain had nothing to hit but rock. A thousand steps went up the mountain. The Highland Fortress sat on the last of them with one window lit.', 'P:idle@.3 D@.62^.4', { p: pan(1.1, 0.3, 0.5, 1.2, 0.7, 0.4, 9) }),
  N('The netting was back at the foot of the mountain. Iron thorns, floor to cloud, humming faintly in the wind. In front of the first step it had folded away into a doorway. It was exactly one sloth wide.', 'P:worried@.3 D@.62^.4', { sting: 'door' }),
  D('He measured you.', 'P:worried@.3 D@.62^.45', { cue: 'dread', i: 0.4 }),
  P('Dot. This is where you go home.', 'P:talk@.3 D@.62^.45', { cue: 'sorrow', i: 0.4 }),
  D('No.', '=', { cue: 'resolve', i: 0.5 }),
  P('The door fits one. You heard the Lieutenant. They\'ve probably sewn the seam shut by now.', 'P:talk@.3 D@.62^.45'),
  D('He said he\'d sew it badly, he was a tailor\'s apprentice, he was TERRIBLE, it\'s the one thing I\'m sure of about this whole fortress, and I am counting on it.', '=', { sting: 'laugh' }),
  P('He\'s been practicing.', 'P:talk@.3 D@.62^.45'),
  N('Thunder came down the mountain, long and low. Pokey took hold of the nearest rock with both hands. Dot watched him do it.', 'P:duck@.3 D@.62^.45', { m: 'storm', cue: 'dread', i: 0.5, p: { fx: [{ at: 0.3, kind: 'flash', dur: 0.4, amount: 0.6 }, { at: 0.3, kind: 'shake', amount: 6, dur: 0.6 }] } }),
  P('It\'s only weather.', 'P:duck@.3 D@.62^.45'),
  N('The thunder came again. His hands stayed where they were.', '=', { cue: 'hush', i: 0.3 }),
  P('I\'m afraid of thunder.', 'PF:worried@.4', { cue: 'resolve', i: 0.3 }),
  D('I know. Everyone knows. You hold things. You held a teacup for forty minutes at Meeca\'s birthday because a cloud went over, a TEACUP, Pokey, it was empty.', 'P:duck@.3 D@.62^.45', { cue: 'tender', i: 0.4 }),
  N('Dot always laughed at his own jokes. He did not now. He put a wing over the pouch at his side and left it there.', 'P:duck@.3 D@.62^.5', { cue: 'sorrow', i: 0.4 }),
  D('Pokey. The night your parents went out. There was a warning to give, the storm had turned early, I was the one who was meant to fly it round the nests, and I went down the wrong river, I took the wrong, I was LATE.', 'P:worried@.3 D@.62^.5', { cue: 'sorrow', i: 0.5, sting: 'reveal' }),
  // ART HOOK: the nest-in-the-storm plate (see STORM in storyMemories.ts) comes back here, on "They were already out on the far branches"
  D('They were already out on the far branches. I have never told anyone. I tell myself it wouldn\'t have mattered, I say it every night, and it doesn\'t take. And I turned up at your branch every morning after that, and you thought I was just being nice.', '=', { cue: 'hush', i: 0.3 }),
  N('Pokey said nothing. He looked at his hands on the rock, and then at Dot.', 'PF:worried@.4', { cue: 'hush', i: 0.2 }),
  D('You don\'t have to answer. I\'m going in. I\'m going to be early for something, once, I\'m going to be so early that—', 'P:worried@.3 D@.62^.5', { cue: 'resolve', i: 0.5 }),
  P('Dot—', 'P:urgent@.3 D@.62^.5', { i: 0.5 }),
  N('Dot pushed three folded notes into the satchel with one claw, and then he was gone along the netting, round the black shoulder of the mountain, toward a badly sewn seam Pokey could not see.', 'P:sad@.3', { cue: 'hush', i: 0.2 }),
  N('Up the mountain, a flash, and something metal fell over. Then nothing at all.', 'P:urgent@.3', { cue: 'hush', sting: 'darkness', p: { fx: [{ at: 0.5, kind: 'flash', dur: 0.4 }, { at: 0.5, kind: 'shake', amount: 10, dur: 0.6 }] } }),
  P('Dot?', 'PF:worried@.4', { cue: 'hush' }),
  N('The thorns hummed in the wind. Pokey stood in the rain for a long time. Then he went through the door that had been made for him. It was exactly his width.', 'P:sad@.3', { cue: 'resolve', i: 0.5, p: { camera: pan(1.2, 0.3, 0.6, 1.0, 0.6, 0.35, 8).camera } }),
]);

/** the singing from the tower, halfway up the last mountain */
const W10_MID = chapter({ name: MID[10], w: 10, m: 'storm', cue: 'sorrow', i: 0.3, base: { particles: 'rain' } }, [
  N('Halfway up the mountain the thunder stopped for a while. In the gap, from far above, Pokey heard something that was not thunder.', 'P:tired@.3', { cue: 'hush', i: 0.15, p: pan(1.1, 0.3, 0.6, 1.3, 0.5, 0.3, 8) }),
  N('It was a voice, singing softly, and the tune was one he knew.', 'PF:surprised@.4', { cue: 'meeca', i: 0.4, sting: 'bloom' }),
  N('At a barred window at the top of the mountain, Meeca was singing with her eyes closed and her back straight. She had sung it every night since they brought her up.', 'MF:drowsy+weary@.5', { cue: 'meeca', i: 0.5 }),
  P('Meeca.', 'PF:happy@.4', { cue: 'meeca', i: 0.5 }),
  N('He could not make out the words from this far away. He took the next step, and the next, and found that he was humming. Up on the wall, one collar went dark for a moment, and came on again.', 'P:determined@.3', { cue: 'resolve', i: 0.6, p: { particles: 'petals' } }),
]);

const W8 = [...W8_ACT, ...W8_A, ...PROMISE_PANELS, ...W8_B];

export const WORLD_STORIES: Record<number, WorldStory> = {
  1: { teaser: 'A petal on a tree, and a hummingbird two days late.', panels: W1 },
  2: { teaser: 'A village that asks everyone to wait, and a river king in a crooked crown.', panels: W2 },
  3: { teaser: 'Glowworm threads light the way, and something is watching.', panels: W3 },
  4: { teaser: 'Mist, thunder falls, and wings above the clouds.', panels: [...W4_ACT, ...W4] },
  5: { teaser: 'Orchids bloom, and so do cobwebs.', panels: W5 },
  6: { teaser: 'Black water, a spear, and a very strict lunch.', panels: W6 },
  7: { teaser: 'Ten stone chairs in a ring, and an eleventh with a dent in it.', panels: W7 },
  8: { teaser: 'Fireflies, moonlight, and a monarch of the night.', panels: W8 },
  9: { teaser: 'Lava rivers and a dragon who hates visitors.', panels: W9 },
  10: { teaser: 'The Highland Fortress. Meeca is close.', panels: W10 },
};

/** a short scene halfway through a world (after its fifth stage): Dot, a note, a little more of the story */
export const WORLD_MID: Record<number, StoryPanel[]> = {
  1: W1_MID, 2: W2_MID, 3: W3_MID, 4: W4_MID, 5: W5_MID, 6: W6_MID, 7: W7_MID, 8: W8_MID, 9: W9_MID, 10: W10_MID,
};

