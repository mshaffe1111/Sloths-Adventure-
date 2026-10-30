/**
 * What happens on the road: one picture sequence when Pokey first arrives in each world, and one halfway through it (after stage 5),
 * where Dot the courier brings Meeca's latest note. Together they carry the middle of the story:
 *   Act I   The Trail   (1-3)  a quest with a good-humored hummingbird; patience wins; the guardians are bound, not wicked.
 *   Act II  The Cost    (4-7)  the mystery gets personal, the notes get thin, the General turns out to be family.
 *   Act III The Iron Road (8-10) rest, loss, mercy and the last climb.
 * The guardians' fights and what comes after them are in storyBosses.ts and storyChapters.ts.
 */
import { chapter, D, FL, M, N, OFF, P, pan, say } from './storyDsl.ts';
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
const SQ = say('Squirrel');

const W1 = chapter({ name: C1, w: 1, m: 'day', cue: 'journey', i: 0.4, base: { particles: 'petals' } }, [
  // ART HOOK: the squirrel family under the old vine, and their sign THE SLOTH (reference/ART-TO-GET.md)
  N('The squirrels who lived under the old vine had put up a sign years ago, the day Pokey sat on that vine for two days without moving. It still said THE SLOTH, with an arrow pointing up.',
    'P:walk@.3', { p: pan(1.1, 0.3, 0.5, 1.2, 0.45, 0.58, 8) }),
  N('They\'d been watching him leave for two days now. He was almost out of sight.', 'P:walk@.42', { sting: 'laugh' }),
  SQ('Hey! Sloth! Where are you going?', 'P:idle@.42', { cue: 'comedy', i: 0.4 }),
  P('North.', 'P:talk@.42'),
  SQ('North! At that speed? See you next year!', 'P:idle@.42'),
  N('Somewhere behind the squirrel, a lot of smaller squirrels laughed.', 'P:idle@.42', { sting: 'laugh' }),
  P('I\'ll write.', 'P:walk@.42', { cue: 'journey', i: 0.4 }),
  N('The first petal was stuck to the bark of a kapok tree, pressed flat, at about the height of someone being marched past. Pokey peeled it off with one claw and held it like it might wake up.',
    'P:idle@.3', { p: pan(1.1, 0.4, 0.5, 1.25, 0.5, 0.58, 8) }),
  P('She pressed it flat. With a soldier on each arm.', 'P:talk@.3', { cue: 'tender', i: 0.4 }),
  D('Pokey! Pokey, there you are, oh, thank goodness. Don\'t move. Don\'t you move.', 'P:surprised@.3 D:yelp@.64^.4', { cue: 'comedy', i: 0.45 }),
  P('Historically, not a problem.', 'P:talk@.3 D:yelp@.64^.4'),
  D('Do you know how many pink things there are in this forest? Do you have any idea? I followed the petals for two days, and one of them was a hibiscus, which is a completely different pink, and I went all the way around a hill for it, a big hill, and—',
    'P:surprised@.3 D:yelp@.64^.4'),
  P('You said you\'d be straight back.', 'P:talk@.3 D@.64^.4', { cue: 'sorrow', i: 0.3 }),
  N('Dot\'s wing went to the pouch at her side.', 'P:idle@.3 D:sad@.64^.4'),
  D('I know what I said, I know, and I also said don\'t you go anywhere without me, and I come back and here you are, going, at your speed, which is barely going, but it\'s the principle.', 'P:idle@.3 D@.64^.4'),
  P('Not very fast.', 'P:happy@.3 D@.64^.4', { sting: 'laugh' }),
  P('Did you see her? Is she okay?', 'P:worried@.3 D@.64^.4', { cue: 'tender', i: 0.35 }),
  D('She\'s okay. She\'s okay. They took her all the way up to the Highlands, Pokey, to the fortress, the big one up in the clouds, and she walked the whole way with her chin up like she was on her way to a party. She thanked them for the march. She thanked every one of them.',
    'P:worried@.3 D@.64^.4'),
  P('Did they see you?', 'P:talk@.3 D@.64^.4'),
  D('One of them looked right at me and said, "Is that a hummingbird?" And a different one said, "Where?" And by then I was already in a bush. I stayed in that bush an hour. It was a nice bush.', 'P:happy@.3 D@.64^.4', { sting: 'laugh' }),
  D('Okay. Now listen. They put her in a tower. And there\'s this netting, all the way around the mountain, iron thorns, from the ground up into the clouds, and there\'s exactly one gap in it. About as wide as a folded letter.',
    'P:idle@.3 D@.64^.4', { cue: 'dread', i: 0.3 }),
  D('Notes go out. Nothing goes in. I tried to carry one in. Twice. Same thorn, both times.', '='),
  P('So I can\'t tell her I\'m coming.', 'P:worried@.3 D@.64^.4'),
  D('She knows you\'re coming.', 'P:worried@.3 D@.64^.4', { cue: 'tender', i: 0.4 }),
  D('She\'s already gotten two notes out through it. I\'ve got both. This is the first one.', 'P:idle@.3 D@.64^.4', { cue: 'tender', i: 0.35 }),
  D('"Pokey. If you have this, you found the petal. I put it low so you wouldn\'t have to look up. I saw you run. I didn\'t know you could do that. Don\'t you listen to a word he said. And don\'t stand in the rain and think about it. Follow the petals. Love, M."',
    'P:happy@.3 D@.64^.4', { cue: 'meeca', i: 0.4 }),
  N('Pokey read it again himself, slowly, the part about running.', 'PX:read_a@.4', { cue: 'tender', i: 0.4 }),
  P('Which way?', 'P:determined@.3 D@.64^.4', { cue: 'resolve', i: 0.4 }),
  D('North. Everything\'s north. The petals go north.', 'P:determined@.3 D@.64^.4'),
  N('On a branch above them, something long shifted its weight. It had been told to look fearsome and had been doing it since breakfast. It was a warm morning, and it was tired.',
    'P:idle@.3 D@.64^.4 B1~@.84<', { cue: 'dread', i: 0.35 }),
]);

const W1_MID = chapter({ name: MID[1], w: 1, m: 'day', cue: 'tender', i: 0.35, base: { particles: 'petals' } }, [
  D('I\'ve got another one. I was saving it. You looked like you needed it.', 'P:tired@.3 D@.62^.4'),
  D('"Pokey. I\'m fine. I have a window, a chair, a blanket that smells like mothballs, and a lieutenant who says sorry every time he brings the oatmeal. Nobody has been unkind. I am fine. Love, M."',
    'P:happy@.3 D@.62^.4', { cue: 'tender', i: 0.4 }),
  N('Far away, in a tower, a sloth sat up straight at a desk by a window. She had been sitting that way for an hour.', 'MS:wait@.5', { w: 10, m: 'dusk', cue: 'tender', i: 0.35, p: { particles: 'none', zoom: 1.35, focusX: 0.5 } }),
  P('Let me see it.', 'P:talk@.3 D@.62^.4', { w: 1, m: 'day', p: { particles: 'petals' } }),
  N('He ran a claw under the writing. The words sat on the line, evenly, from one edge of the paper to the other.', 'P:think@.3 D@.62^.4'),
  P('She falls off the end of the line. Always. She runs out of room and writes the last word on top.', 'P:worried@.3 D@.62^.4', { cue: 'sorrow', i: 0.3 }),
  D('Look, she even left margins. She had room for—', '=', { cue: 'sorrow', i: 0.3 }),
  N('Dot stopped.', 'P:worried@.34 D:sad@.62^.4', { cue: 'hush', i: 0.2 }),
  P('Yeah.', 'P:worried@.34 D:sad@.62^.4', { cue: 'sorrow', i: 0.35 }),
  N('He folded the note along its own creases and put it in the satchel with the first one. It took him two tries to get the flap shut.', 'P:tired@.34 D@.62^.4', { cue: 'tender', i: 0.45 }),
]);

const W2 = chapter({ name: C2, w: 2, m: 'day', cue: 'comedy', i: 0.4, base: { particles: 'sparkles' } }, [
  N('The Sunlit Riverbank was wide, brown, and in no hurry. A village of sloths had dug its houses into the bank in a long row, and every front door had the same hand-painted sign: PLEASE BE PATIENT.',
    'P:idle@.3', { cue: 'journey', i: 0.4, p: pan(1.1, 0.2, 0.55, 1.2, 0.6, 0.55, 9) }),
  P('Huh. I could live here.', 'P:happy@.3 D@.6^.4'),
  D('Don\'t you dare.', 'P:happy@.3 D:yelp@.6^.4'),
  N('At the top of the bank, the village crier, Gruntlewick, was reading out a flood warning. He had started on Tuesday. The flood had come and gone since. He was on the word FLOOD.',
    'P:idle@.24 D@.5^.4 TC:hat_shout@.8*.9', { cue: 'comedy', i: 0.5 }),
  D('And that\'s the mailman. With the package. He\'s been taking that package to number nine since before the rains started. It says URGENT on it, in red. I offered to carry it for him. He said thank you, and held on tighter.',
    'P:talk@.24 D@.5^.4 PO:walk_parcel@.62*.9 TC:scroll@.86*.9', { sting: 'laugh' }),
  N('The mailman and Pokey passed each other on the path. They nodded. It took a while, and neither of them minded.', 'P:happy@.24 D@.5^.4 PO:carry_walk@.62*.9 TC:scroll@.86*.9'),
  GRUNT('Young man. You\'ve come a long way. Are your folks behind you? They\'ll want to know where you\'ve gotten to.', 'P:idle@.24 D@.5^.4 TC:announce@.8*.9', { cue: 'tender', i: 0.3 }),
  P('Somewhere back there. I think they stopped for lunch.', 'P:talk@.24 D@.5^.4 TC:announce@.8*.9'),
  GRUNT('Ah. Then they\'ll catch up.', 'P:idle@.24 D@.5^.4 TC:hat_stand@.8*.9'),
  P('Any day now.', 'P:talk@.24 D@.5^.4 TC:hat_stand@.8*.9', { cue: 'sorrow', i: 0.3 }),
  N('Dot had been in the middle of a sentence. She left it there and went and looked hard at a reed.', 'P:idle@.24 D:flinch@.5^.4 TC:hat_stand@.86*.9', { cue: 'sorrow', i: 0.3 }),
  N('Pokey touched the petal on his wrist.', 'PX:petal_wrist@.4', { cue: 'sorrow', i: 0.3 }),
  N('Out on the water, a log was drifting toward the bank, against the current. On top of the log, slightly crooked, sat a crown of pink petals.',
    'P:idle@.3 D@.64^.4 B2~@.82<', { cue: 'dread', i: 0.3 }),
]);

// ART HOOK: the village building Pokey's raft, one log at a time (reference/ART-TO-GET.md)
const W2_MID = chapter({ name: MID[2], w: 2, m: 'day', cue: 'comedy', i: 0.4, base: { particles: 'sparkles' } }, [
  N('The village had promised Pokey a raft. They started building it the morning he arrived. By the afternoon, they had agreed on what kind of wood.', 'P:idle@.24 PO:carry_stand@.66*.9 TC:point_bell@.86*.9', { sting: 'laugh' }),
  N('Pokey sat on the bank and watched them.', 'P:tired@.3 D@.6^.4'),
  D('Pokey. Your foot\'s tapping.', 'P:tired@.3 D:puzzled@.6^.4'),
  P('It is not.', 'P:talk@.3 D@.6^.4'),
  D('It is. Look at it. I\'ve known you your whole life, and I have never once seen that foot move on its own.', 'P:surprised@.3 D@.6^.4', { sting: 'laugh' }),
  N('Pokey looked down at his foot. He put his hand on it.', 'P:think@.3 D@.6^.4'),
  P('Is this what it\'s like for everybody else?', 'P:talk@.3 D@.6^.4', { cue: 'tender', i: 0.4 }),
  D('Every single day.', 'P:idle@.3 D:perch@.6^.48', { cue: 'tender', i: 0.4 }),
  D('I went back to the netting last night. There was a new one. It\'s not a good one, and I need you to stay calm. Which you will. You always do. It\'s the rest of us who— Here.', 'P:idle@.3 D@.6^.4', { cue: 'dread', i: 0.3 }),
  D('"Every guardian wears an iron collar with thorns on the inside. They scratch at them when they think nobody\'s looking. I don\'t think they chose this. Be kind to them. But please win. Love, M."',
    'P:worried@.3 D@.6^.4', { cue: 'reveal', i: 0.35 }),
  P('The snake kept scratching at his. I thought he had fleas.', 'P:talk@.3 D@.6^.4'),
  D('Snakes don\'t get fleas, Pokey.', '=', { cue: 'dread', i: 0.35 }),
  N('Down on the bank, a sloth carefully fitted the first log of the raft into place, stepped back, and looked at it until lunch.', 'P:idle@.24 PO:carry_stand@.66*.9', { cue: 'comedy', i: 0.3 }),
  P('She wants me to be nice to the snake.', 'P:talk@.3 D@.6^.4', { cue: 'tender', i: 0.4 }),
  D('She was nice to a wasp once. Now it visits. It brings friends.', '=', { sting: 'laugh' }),
  P('What\'s in the pouch?', 'P:talk@.3 D@.6^.4', { cue: 'sorrow', i: 0.3 }),
  D('It\'s a thing. It isn\'t for you.', 'P:idle@.3 D:flinch@.6^.4'),
]);

const W3 = chapter({ name: C3, w: 3, m: 'night', cue: 'dread', i: 0.25, base: { particles: 'sparkles' } }, [
  N('The Mossy Grotto was lit from above by glowworms. They hung from the ceiling in long threads, and each one hummed a slightly different note.',
    'P:idle@.3', { p: pan(1.05, 0.5, 0.35, 1.3, 0.5, 0.6, 8) }),
  D('I don\'t do dark, Pokey. I do daylight. I\'ll do a little dusk if I have to. This isn\'t dusk. This is the inside of a boot.', 'P:idle@.3 D:flinch@.62^.4', { cue: 'comedy', i: 0.4 }),
  P('Stay close. I\'m dim, but I\'m steady.', 'P:happy@.3 D@.62^.4'),
  D('Dim and steady. Fine. Don\'t let go of me.', '='),
  D('Have you got everything? Petal? Satchel? Ears?', 'P:happy@.3 D:puzzled@.62^.4'),
  N('Pokey stopped to listen to the glowworms, and the glowworms noticed. One at a time, over his head, they turned up, until he stood in a warm yellow light that hadn\'t been there a minute before.', 'P:happy@.3 D@.62^.4', { cue: 'bloom', i: 0.4 }),
  N('Between the stalactites hung the old thorn vines that Meeca\'s grandma always said were asleep. One of them moved.', 'P:idle@.3 D@.62^.4', { cue: 'dread', i: 0.3 }),
  N('On the floor, in the mud, were footprints. Each one was as wide as Pokey was tall. They went once around the two of them, in a perfect circle, and stopped.',
    'P:worried@.3 D@.62^.4 B3~@.88<', { cue: 'dread', i: 0.4, p: { particles: 'none' } }),
  D('I\'m looking at them with my eyes closed.', '='),
  P('That doesn\'t make them smaller.', 'P:talk@.3 D@.62^.4 B3~@.88<', { sting: 'laugh' }),
  N('Far back in the dark, two eyes opened, and didn\'t blink. Whatever it was, it could stand perfectly still, too.',
    'P:worried@.3 D@.62^.4 B3~@.9<', { cue: 'dread', i: 0.4 }),
]);

const W3_MID = chapter({ name: MID[3], w: 3, m: 'night', cue: 'comedy', i: 0.35, base: { particles: 'sparkles' } }, [
  D('Okay. I have to tell you something, and I need you to not look at me like that.', 'P:idle@.3 D@.62^.4'),
  P('Like what?', 'P:surprised@.3 D@.62^.4'),
  D('Like that. Remember my bush? When they marched her past it, she emptied her apron pockets into it. Grandma\'s things. She keeps them in her apron, she always has, she doesn\'t like leaving them in the house by themselves.',
    'P:idle@.3 D@.62^.4', { cue: 'tender', i: 0.35 }),
  D('And then there were boots everywhere, so I hid them. In ferns. A lot of ferns. All the way to the mountain and back. Very fast.', 'P:surprised@.3 D:flinch@.62^.4'),
  P('In ferns.', 'P:surprised@.3 D@.62^.4', { sting: 'laugh' }),
  D('It was a good plan. The ferns were the problem. All ferns look alike.', '=', { cue: 'comedy', i: 0.4 }),
  P('Which ferns?', 'P:talk@.3 D@.62^.4'),
  D('Ferny ones. Around here, ish. If you crouch down next to the right one, it rustles. Or that might be the wind. I\'ve gotten very good at ferns. I can tell you which ones are rude.',
    '=', { cue: 'journey', i: 0.4 }),
  N('So the search for Meeca\'s grandma\'s things began. A sloth crouched beside a fern, and a hummingbird hovered beside the sloth, and the two of them said, "Hello?" in very small voices.',
    'P:duck@.3 D@.62^.4', { cue: 'comedy', i: 0.45 }),
]);

// ═════════════════════════════════ ACT II · THE COST ═════════════════════════════════

// ART HOOK: Dot hanging on to one of Pokey's claws over the gorge, pulling with everything she has (reference/ART-TO-GET.md)
const W4_ACT = chapter({ name: 'ACT II · THE COST', w: 4, m: 'day', cue: 'dread', i: 0.4, base: { particles: 'sparkles' } }, [
  N('The vine held. Pokey hung from the end of it, turning a little, over the long white nothing where the ledge used to be.', 'P:hurt@.5', { sting: 'cliffhanger', p: pan(1.0, 0.5, 0.2, 1.2, 0.5, 0.55, 5) }),
  P('I\'m looking down.', 'P:worried@.5 D@.6^.3'),
  D('Don\'t look at the down! Look at the up! The up is nice! Hold on, I\'ve got you, I\'ve got you—', 'P:worried@.5 D:yelp@.56^.36', { cue: 'chase', i: 0.5 }),
  N('She had hold of one of his claws and was pulling with everything she had. The vine didn\'t notice.', 'P:worried@.5 D:yelp@.54^.38'),
  P('Dot. Let go. If I fall, I\'m not taking you with me.', 'P:talk@.5 D@.54^.38', { cue: 'hush', i: 0.25 }),
  D('Don\'t you dare say that. Don\'t you dare.', 'P:worried@.5 D:yelp@.54^.38', { cue: 'sorrow', i: 0.4 }),
  N('She didn\'t let go. It took Pokey the better part of an hour to climb up, and she held on to that claw the whole way, as if she was the one doing the climbing. At the top she sat down hard.',
    'P:tired@.4 D:dizzy@.64^.5', { cue: 'tender', i: 0.4 }),
  P('That wasn\'t the Prowler. That was the General. He used the Prowler like a hand.', 'P:talk@.3 D@.64^.45', { cue: 'dread', i: 0.4 }),
  D('I know.', 'P:worried@.3 D:sad@.64^.45', { cue: 'hush', i: 0.2 }),
  P('The Prowler said sorry. He was still saying it when the ledge went.', 'P:worried@.3 D@.64^.45', { cue: 'sorrow', i: 0.35 }),
  P('That was a loud horn.', 'P:duck@.3 D@.64^.45', { cue: 'dread', i: 0.35 }),
  D('It was a horn, Pokey. A horn has somebody on the other end. I always listen for which one it is.', 'P:duck@.3 D:perch@.64^.45', { cue: 'tender', i: 0.35 }),
]);

const W4 = chapter({ name: C4, w: 4, m: 'day', cue: 'journey', i: 0.5, base: { particles: 'sparkles' } }, [
  N('Waterfalls as tall as the sky. The water ran cloudy, which the old sloths say happens when the Heartbloom has stayed closed too long.',
    'P:idle@.3 D@.64^.35', { cue: 'journey', i: 0.5, p: pan(1.2, 0.5, 0.7, 1.1, 0.5, 0.2, 6) }),
  N('A feather drifted down out of the mist, as long as Pokey\'s whole arm.', 'P:surprised@.3 D@.64^.35'),
  D('That\'s Her Majesty the Sky Sovereign, so please, please be polite. She hates being interrupted in the middle of a dive.', 'P:idle@.3 D@.64^.35 B4~@.82<'),
  P('I\'ll wait till she\'s done.', 'P:happy@.3 D@.64^.35 B4~@.82<'),
  D('She started it this morning. It\'s a very long way down.', '=', { sting: 'laugh' }),
]);

const W4_MID = chapter({ name: MID[4], w: 4, m: 'day', cue: 'tender', i: 0.35, base: { particles: 'petals' } }, [
  D('Okay. The note. Don\'t be alarmed. It\'s short.', 'P:idle@.3 D@.62^.4', { cue: 'dread', i: 0.3 }),
  P('Short.', 'P:worried@.3 D@.62^.4'),
  N('Today\'s note said, "Still here." That was all of it.', 'P:worried@.3 D@.62^.4', { cue: 'sorrow', i: 0.3 }),
  N('Dot kept turning so Pokey would only see one side of her.', 'P:think@.3 D@.62^.4>'),
  P('Dot. Turn around.', 'P:talk@.3 D@.62^.4>', { cue: 'sorrow', i: 0.3 }),
  N('She didn\'t, and then she did. There was a bare patch on her tail the size of a thumb.', 'P:worried@.3 D:sad@.62^.4', { cue: 'sorrow', i: 0.35 }),
  D('It\'s nothing. It\'s the netting. It\'s a scratch. It\'s nine scratches. I\'m fine.', '='),
  P('Why do you keep bringing them?', 'P:talk@.3 D@.62^.4'),
  D('Two words weigh nothing. I checked. I weighed it against a berry, and the berry won. I was really thorough about it.', 'P:surprised@.3 D@.62^.4', { cue: 'tender', i: 0.5 }),
  P('Oh, Dot.', 'P:happy@.3 D@.62^.4'),
  D('Don\'t. I\'ll cry, and I can\'t afford the water weight.', '='),
]);

const W5 = chapter({ name: C5, w: 5, m: 'day', cue: 'comedy', i: 0.4, base: { particles: 'sparkles' } }, [
  N('The Orchid Sanctuary was the loveliest place on the whole road, and Pokey was counting the insides of his own eyelids.', 'P:tired@.3', { cue: 'bloom', i: 0.4, p: pan(1.05, 0.2, 0.5, 1.25, 0.7, 0.55, 9) }),
  N('It was barely afternoon, and the orchids were already closing, a few at a time.', 'P:worried@.3', { cue: 'dread', i: 0.3 }),
  N('On the trunk of the first tree, someone had carved a message with something small and sharp. The letters were shaky, as if they\'d been cut in a hurry. POKEY. DON\'T SIT. M.',
    'P:surprised@.3 D@.62^.4', { cue: 'meeca', i: 0.4, sting: 'bloom', p: { zoom: 1.5, focusX: 0.4 } }),
  P('She got away from them.', 'PF:happy+worried@.4', { cue: 'tender', i: 0.4 }),
  D('She what? No. I followed that column the whole way up. She walked the whole way, Pokey, I watched her—', 'P:surprised@.3 D:yelp@.62^.4'),
  N('Dot stopped and looked at the letters again.', 'P:idle@.3 D@.62^.4', { cue: 'hush', i: 0.2 }),
  D('With a hairpin. She\'s so resourceful. She\'s the most resourceful person I know. And now she doesn\'t have a hairpin, so if she needs to pick a lock, and I\'m saying she will, she\'ll do it with a spoon. She\'ll find a spoon. She always finds a spoon.', 'P:happy@.3 D@.62^.4', { cue: 'comedy', i: 0.45 }),
  D('If she carved one, she carved more. She never leaves just one of anything. Watch the trees.', '=', { cue: 'comedy', i: 0.5 }),
  N('A little table stood in the middle of the path, set for two: china cups, a plate of tiny cakes, two soft chairs, and a card in careful handwriting on a silk napkin. "Do sit. The pot is warm. It is always warm."',
    'P:idle@.3 D@.62^.4 B5~@.86<'),
  P('That\'s very polite.', 'P:talk@.3 D@.62^.4 B5~@.86<'),
  D('That\'s what makes it scary.', '=', { sting: 'laugh' }),
  N('Pokey looked at the chairs. They looked back.', 'P:tired@.3 D@.62^.4 B5~@.86<'),
  P('Dot. Be honest. How bad would it be if I just sat for one minute?', 'P:talk@.3 D@.62^.4 B5~@.86<'),
  D('You\'d be a chair, Pokey. You\'d be, forever, a very still chair.', '=', { cue: 'dread', i: 0.3 }),
]);

const W5_MID = chapter({ name: MID[5], w: 5, m: 'dusk', cue: 'tender', i: 0.3, base: { particles: 'petals' } }, [
  N('They stopped to rest on a branch where the orchids hung in rows. Pokey stood, because the note said so. Dot touched the pouch at her side. Then she touched it again.', 'P:tired@.3 D@.62^.45', { cue: 'tender', i: 0.3 }),
  P('You\'re still checking that pouch.', 'P:talk@.3 D@.62^.45'),
  D('It\'s a thing. It isn\'t for you.', '=', { cue: 'sorrow', i: 0.3 }),
  P('Who\'s it for?', 'P:talk@.3 D@.62^.45'),
  D('Somebody I\'m scared of.', 'P:worried@.3 D@.62^.45'),
  P('The General?', 'P:talk@.3 D@.62^.45'),
  D('Not of him. Of what it says, and what he does when he reads it, and that I... that I took so...', '=', { cue: 'sorrow', i: 0.4 }),
  N('She stopped.', 'P:worried@.3 D:sad@.62^.45'),
  P('Then give it to him when you\'re ready. Not before.', 'P:happy@.3 D@.62^.45'),
  D('And what if it\'s too late by then?', 'P:worried@.3 D@.62^.45', { cue: 'sorrow', i: 0.3 }),
  P('Slow isn\'t stopped.', 'P:happy@.3 D@.62^.45', { cue: 'grandma', i: 0.4 }),
  D('Is that true, or is that just something you say?', 'P:happy@.3 D@.62^.45'),
  P('I don\'t know yet. It hasn\'t been wrong.', 'P:happy@.3 D@.62^.45', { cue: 'tender', i: 0.4 }),
]);

const W6 = chapter({ name: C6, w: 6, m: 'day', cue: 'dread', i: 0.3, base: { particles: 'sparkles' } }, [
  N('The roots of the Deep Mangrove stood up out of the water in a maze, and the sun only got in where they let it. The water between them lay flat and gray. Rivers are kind when the Heartbloom is open. This one wasn\'t.', 'P:idle@.3', { p: pan(1.05, 0.5, 0.3, 1.3, 0.5, 0.6, 8) }),
  P('Water that flat has something under it.', 'P:worried@.3 D@.62^.4 B6~@.86<'),
  N('Out of the black water, a spear rose, slowly. It turned to look at them. Then it sank again.', 'P:worried@.3 D@.62^.4 B6~@.88<', { cue: 'dread', i: 0.4, sting: 'darkness' }),
  D('Did the water just look at us?', '=', { cue: 'comedy', i: 0.35 }),
  P('Somebody\'s holding it.', 'P:worried@.3 D@.62^.4 B6~@.88<'),
  D('That\'s worse, that\'s so much worse, I\'m fine, I\'ve backed up about nine feet, I\'m going to stay over here and be fine from a distance!', 'P:worried@.3 D:flinch@.78^.36 B6~@.88<'),
  D('"Pokey, the Reaver eats lunch at noon. Do NOT meet him at noon." That\'s all it says. There\'s no second line. There\'s a stain.', 'P:idle@.3 D@.62^.4', { sting: 'laugh' }),
  P('What time is it?', 'P:worried@.3 D@.62^.4'),
  D('Noon. It\'s noon. I can see the sun, right there, straight down through the roots. Pokey, it is directly overhead.', '=', { cue: 'dread', i: 0.4, sting: 'cliffhanger' }),
]);

const W6_MID = chapter({ name: MID[6], w: 6, m: 'dusk', cue: 'sorrow', i: 0.3, base: { particles: 'petals' } }, [
  D('Pokey. I have to tell you something. I tried to make it funny the whole way over. I got as far as a pelican, and then I couldn\'t.', 'P:tired@.3 D:sad@.62^.4', { cue: 'sorrow', i: 0.3 }),
  P('Go on.', 'P:talk@.3 D@.62^.4'),
  D('That was the last note I can get out. They sewed the gap shut the night before I got there. One night, Pokey.', '=', { cue: 'dread', i: 0.35 }),
  P('We stopped for tea.', 'PF:worried@.4', { cue: 'sorrow', i: 0.3 }),
  D('We stopped for tea.', 'P:sad@.3 D:sad@.62^.4'),
  D('I\'ve been all the way around twice looking for another way in. I checked it with my face.', 'P:sad@.3 D@.62^.4', { cue: 'dread', i: 0.3 }),
  D('She gave me three at the end. The lunch one was the silly one. There\'s one I\'m not supposed to give you at all, so I\'m going to leave it somewhere you\'ll find it by accident. And this one\'s sealed.', 'P:worried@.3 D@.62^.4'),
  D('She wrote it on a really bad day, and she made me swear to give it to you only when you need it.', '='),
  P('How will I know when I need it?', 'P:talk@.3 D@.62^.4'),
  D('She said, "He\'ll know. He\'ll have stopped."', '=', { cue: 'sorrow', i: 0.4, sting: 'heartbreak' }),
  N('Dot had three tail feathers left. The rest were in the net. Pokey saw, and asked her about the pelican instead.', 'P:sad@.3 D@.62^.4', { cue: 'sorrow', i: 0.3 }),
  N('Dot tucked the sealed note into the satchel with both feet, gently, as if it might break.', 'P:sad@.3 D@.56^.5', { cue: 'tender', i: 0.3 }),
  D('I\'m going around. There\'s always a seam. I\'ll find the one that\'s open, and I\'ll be back before you\'ve... before you\'ve even— I\'ll be early, Pokey. Watch me.', 'P:sad@.3 D@.62^.4', { cue: 'resolve', i: 0.4 }),
  P('We never agreed on a time.', 'P:happy@.3 D@.62^.4', { cue: 'tender', i: 0.4 }),
  N('Dot went up through the roots. One leaf kept shivering after she was gone.', 'P:sad@.3', { cue: 'sorrow', i: 0.4 }),
  // Flicker (STORY-REVIEW-2026-10-27.md item 7): he followed Meeca's carvings out of the orchids and has been behind Pokey since
  N('The leaf kept shivering. Then a small light came down through the roots and sat on it.', 'P:sad@.3 FL@.62^.5', { cue: 'tender', i: 0.3 }),
  FL('You\'re Pokey.', 'P:surprised@.3 FL:talk@.62^.5'),
  P('Most days.', 'P:talk@.3 FL@.62^.5'),
  FL('Your name\'s on a tree back in the orchids. I\'ve been behind you ever since.', 'P:idle@.3 FL:talk@.62^.5'),
  P('Can you get a note to her? Over the net?', 'P:talk@.3 FL@.62^.5'),
  FL('I tried. It hums when anything touches it. They come running.', 'P:worried@.3 FL:worried@.62^.5'),
  P('Who are you?', 'P:talk@.3 FL@.62^.5'),
  FL('Flicker. Just passing.', 'P:idle@.3 FL:stutter@.62^.5'),
  P('You\'ve been passing since the orchids.', 'P:talk@.3 FL:stutter@.62^.5'),
  FL('Somebody who owes her.', 'P:idle@.3 FL:sad@.62^.5', { cue: 'sorrow', i: 0.3 }),
  N('He didn\'t say any more. He came and sat on the satchel strap.', 'P:idle@.3 FL@.35^.5*.8>', { cue: 'tender', i: 0.3 }),
]);

const W7 = chapter({ name: C7, w: 7, m: 'dusk', cue: 'reveal', i: 0.3, base: { plate: 'ruins', particles: 'sparkles' } }, [
  N('The temple door stood slightly open. Meeca had come through here. So, by the look of the floor, had something heavy.', 'P:idle@.3 FL@.385^.44*.8>', { p: pan(1.05, 0.5, 0.35, 1.3, 0.55, 0.6, 8) }),
  N('The vines on the old walls hung brown. When he touched one, it didn\'t move.', 'P:tired@.3 FL@.385^.44*.8>', { cue: 'dread', i: 0.25 }),
  N('He turned to say something to Dot. There was only Flicker, which wasn\'t the same.', 'P:sad@.3 FL@.385^.44*.8>', { cue: 'sorrow', i: 0.3 }),
  N('In the first courtyard, ten stone chairs stood in a ring around a cracked floor where a faint sigil still glowed. Each one had a creature carved into its back: a panther, a crocodile, an owl.',
    'P:worried@.3 FL@.385^.44*.8>', { cue: 'reveal', i: 0.35, p: { zoom: 1.5, focusX: 0.4 } }),
  N('An eleventh chair stood a little apart from the ring, plain, with no carving at all. Dry leaves lay on the seat. In the middle was a deep dent, worn by someone who\'d sat there often, and then stopped.',
    '=', { cue: 'dread', i: 0.35 }),
  P('Ten, and him.', 'P:talk@.3 FL@.385^.44*.8>', { cue: 'sorrow', i: 0.3 }),
  N('From the shadows, something very large began to speak. It took four minutes to say good morning.', 'P:idle@.3 B7~@.84< FL@.385^.44*.8>', { cue: 'comedy', i: 0.4, sting: 'laugh' }),
]);

const W7_MID = chapter({ name: MID[7], w: 7, m: 'dusk', cue: 'sorrow', i: 0.3, base: { particles: 'sparkles' } }, [
  P('Excuse me. Do you know the way up?', 'P:talk@.3 FL@.385^.44*.8>', { cue: 'comedy', i: 0.3 }),
  N('The statue said nothing.', 'P:idle@.3 FL@.385^.44*.8>'),
  P('Thanks for not interrupting.', 'P:happy@.3 FL@.385^.44*.8>', { sting: 'laugh' }),
  N('Further in, he stopped to listen to the quiet.', 'P:tired@.3 FL@.385^.44*.8>', { cue: 'sorrow', i: 0.3 }),
  P('Dot would say this place is older than the river, and she\'d have a number. She\'d have it written down.', 'P:talk@.3 FL@.385^.44*.8>', { cue: 'tender', i: 0.3 }),
  N('He left a gap after it, for the answer. Flicker didn\'t fill it.', 'P:tired@.3 FL@.385^.44*.8>'),
  N('He hummed to fill it, badly.', 'P:determined@.3 FL@.385^.44*.8>', { cue: 'resolve', i: 0.35 }),
]);

// ═════════════════════════════════ ACT III · THE IRON ROAD ═════════════════════════════════

const W8_ACT = chapter({ name: 'ACT III · THE IRON ROAD', w: 8, m: 'dusk', cue: 'dread', i: 0.3, base: { particles: 'sparkles' } }, [
  N('Seven guardians lay behind him. No note had come since the mangrove, and he\'d stopped checking the satchel for one.', 'P:tired@.3', { p: pan(1.05, 0.5, 0.35, 1.3, 0.45, 0.6, 8) }),
  P('Seven. Two more, and then him.', 'P:talk@.3', { cue: 'sorrow', i: 0.3 }),
]);

const W8_A = chapter({ name: C8, w: 8, m: 'night', cue: 'dread', i: 0.2, base: { particles: 'sparkles' } }, [
  N('Flicker went on ahead, and the fireflies came out to meet him as the light went. Pokey kept going. Meeca was somewhere ahead in the dark, and so was whatever kept passing in front of the moon.',
    'P:tired@.3 B8~@.86<', { p: pan(1.05, 0.5, 0.35, 1.25, 0.45, 0.6, 8) }),
  N('He sat down on a branch to rest his eyes. He was asleep before he\'d finished sitting.', 'PF:tired+calm_closed@.4', { cue: 'tender', i: 0.2, p: { zoom: 1.3, focusX: 0.4 } }),
]);

/** after the dream (PROMISE_PANELS, storyChapters.ts) Pokey wakes up to Dot */
const W8_B = chapter({ name: 'WORLD 8 · WAKE UP', w: 8, m: 'night', cue: 'tender', i: 0.4, base: { particles: 'sparkles' } }, [
  D('Wake up, wake up, wake up. You were mumbling, mostly about a petal. I\'ve been flying for three days, and I would like to sit down on something that isn\'t air. Is this branch taken? Pokey? Pokey!',
    'P:tired@.3 D@.62^.4'),
  // Dot meets Flicker (STORY-REVIEW-2026-10-27.md item 9), and the jealousy is a mother's
  N('Dot stopped. There was a light on Pokey\'s satchel strap, and it was looking at her.', 'P:tired@.3 D:puzzled@.62^.4 FL@.385^.44*.8>'),
  D('Pokey. There\'s a bug on you. A glowing one.', '='),
  FL('Flicker. Hello.', 'P:tired@.3 D:puzzled@.62^.4 FL:talk@.385^.44*.8>'),
  D('How long has it been glowing at you?', 'P:tired@.3 D:puzzled@.62^.4 FL@.385^.44*.8>'),
  FL('Since the mangrove. And I\'m a he.', 'P:tired@.3 D:flinch@.62^.4 FL:smug@.385^.44*.8>'),
  D('Since the mangrove. That\'s a long time to be glowing at somebody.', 'P:tired@.3 D@.62^.4 FL@.385^.44*.8>'),
  D('I\'ve been doing this his whole life. You\'ve been doing it since a mangrove.', 'P:tired@.3 D:yelp@.62^.4 FL@.385^.44*.8>'),
  FL('Then you\'ll know where he keeps the snacks.', 'P:tired@.3 D:yelp@.62^.4 FL:talk@.385^.44*.8>', { sting: 'laugh' }),
  P('Dot. You came back. You\'re bleeding.', 'P:surprised@.3 D@.62^.45', { cue: 'sorrow', i: 0.4, p: { memory: false } }),
  D('Never mind me, look at you, you\'ve lost weight, have you been eating, you haven\'t, I can tell from here.', '=', { cue: 'tender', i: 0.45 }),
  D('I found a seam in the net, behind some kind of cookhouse, that was just a little narrower than me, and I went through it anyway. Then I went up the wall to her window. It has bars. I fit between them, mostly. Here.',
    '=', { cue: 'tender', i: 0.45 }),
  D('"Pokey, I bet you\'re asleep right now. It\'s fine. I would be too. Keep going. I\'m still here. And I\'ve figured out who he is. I\'ll tell you when I can look at you."',
    'P:talk@.3 D@.62^.45 FL@.385^.44*.8>', { cue: 'reveal', i: 0.4 }),
  P('She knows. Meeca knows.', 'P:worried@.3 D@.62^.45 FL@.385^.44*.8>'),
  D('She worked it out by herself, up there, in the dark. She said she tried being angry for an afternoon, and it didn\'t fit. She gave me six more notes. I\'m going to leave some of them where you\'ll find them, so you\'ve got something to look forward to.', '=', { cue: 'sorrow', i: 0.4 }),
  P('Dot, sit down. I have to tell you something.', 'P:talk@.3 D@.62^.45 FL@.385^.44*.8>', { cue: 'tender', i: 0.3 }),
  D('I\'m sitting. It\'s hover-sitting. It takes core.', '='),
  P('The General is her grandfather. I found the photograph in the ruins.', 'P:talk@.3 D@.62^.45 FL@.385^.44*.8>', { cue: 'reveal', i: 0.35 }),
  D('I know. I\'ve known since the morning he left. I saw which way he went. And I was there the night her grandma died.', '=', { cue: 'sorrow', i: 0.4 }),
  N('Dot landed on the branch. Pokey couldn\'t remember the last time he\'d seen her feet touch anything.', 'P:sad@.3 D:perch@.62^.55 FL@.385^.44*.8>', { cue: 'sorrow', i: 0.4 }),
  P('You never said.', 'P:surprised@.3 D:perch@.62^.55 FL@.385^.44*.8>'),
  D('I can\'t tell you half of it. Grandma gave me a letter for him that night. I was late with it, and I still have it, and I\'m going to say the rest once, to him.', 'P:surprised@.3 D:perch@.62^.55 FL@.385^.44*.8>', { i: 0.35 }),
  P('She\'s been up there by herself with all of it.', 'P:worried@.3 D:perch@.62^.55 FL@.385^.44*.8>', { cue: 'resolve', i: 0.4 }),
  D('Yes.', '=', { cue: 'sorrow', i: 0.3 }),
  P('Then we should go.', 'P:determined@.3 D@.62^.45 FL@.385^.44*.8>', { cue: 'resolve', i: 0.5 }),
]);

const W8_MID = chapter({ name: MID[8], w: 8, m: 'night', cue: 'tender', i: 0.3, base: { particles: 'sparkles' } }, [
  N('Flicker lit the branch ahead before Dot could say which one.', 'P:idle@.3 D@.62^.4 FL:glow@.48^.5', { cue: 'comedy', i: 0.3 }),
  D('I was going to say that one.', 'P:idle@.3 D:puzzled@.62^.4 FL@.48^.5'),
  FL('You can say the next one.', 'P:idle@.3 D@.62^.4 FL:talk@.48^.5'),
  P('Dot, you\'re humming.', 'P:talk@.3 D@.62^.4 FL@.385^.44*.8>'),
  D('I\'m not humming. I\'m vibrating. Humming is on purpose.', '=', { sting: 'laugh' }),
  D('Pokey. A question. It\'s the middle of the night, I\'m asking it out loud, and I\'d like you to not repeat it.', 'P:idle@.3 D@.62^.4 FL@.385^.44*.8>'),
  P('Okay.', 'P:talk@.3 D@.62^.4 FL@.385^.44*.8>'),
  D('It\'s about a bird. Not me. A bird who\'s nearly somewhere, and also a day behind, and I\'d like to know what you\'d say to her.', 'P:idle@.3 D@.62^.4 FL@.385^.44*.8>', { cue: 'sorrow', i: 0.3 }),
  P('Next branch.', 'P:talk@.3 D@.62^.4 FL@.385^.44*.8>', { cue: 'grandma', i: 0.35 }),
  D('That\'s it?', '='),
  P('That\'s all I ever do. Then the one after.', 'P:talk@.3 D@.62^.4 FL@.385^.44*.8>', { cue: 'tender', i: 0.35 }),
  D('Huh.', '=', { cue: 'tender', i: 0.4 }),
  N('Dot stopped vibrating somewhere around the next branch.', 'P:happy@.3 D@.62^.4 FL@.385^.44*.8>', { cue: 'tender', i: 0.4 }),
]);

const W9 = chapter({ name: C9, w: 9, m: 'dusk', cue: 'comedy', i: 0.4, base: { particles: 'embers' } }, [
  N('The Volcanic Jungle glowed from underneath. The air tasted like pepper. Up ahead, a voice the size of a hill was clearing its throat.',
    'P:idle@.3 D@.62^.4 B9~@.88< FL@.385^.44*.8>', { p: pan(1.05, 0.5, 0.35, 1.3, 0.5, 0.6, 8) }),
  N('A voice boomed, "A visitor!" There was a pause. Then, much smaller, it said, "Intruder."', '=', { sting: 'laugh' }),
  D('"It\'s cold. I\'m fine. He sent up another blanket. Please don\'t tell him I said thank you." That\'s the last one I\'m reading out loud. The rest are the other kind. They\'re yours.',
    '=', { cue: 'tender', i: 0.4 }),
  P('She said thank you to him?', 'P:surprised@.3 D@.62^.4 FL@.385^.44*.8>'),
  D('She says thank you to everybody. She said it to a thorn once. It had been trying to snag her sleeve, and it just stopped.', '=', { sting: 'laugh' }),
  N('Behind the smoke, the fortress stood up out of the thunder.',
    'P:idle@.3 D@.62^.4 FL@.385^.44*.8>', { cue: 'dread', i: 0.4, p: pan(1.1, 0.7, 0.4, 1.1, 0.4, 0.6, 7) }),
]);

const W9_MID = chapter({ name: MID[9], w: 9, m: 'dusk', cue: 'comedy', i: 0.35, base: { particles: 'embers' } }, [
  N('The lantern was back, held low to the ground, which hadn\'t fooled anybody the first time.', 'P:idle@.26 D@.56^.4 LP:lantern@.88*.9 FL@.345^.44*.8>', { sting: 'laugh' }),
  OFF('I am so sorry. It is me again. I told the kitchen I was out buying thread. I have bought a great deal of thread. I have been ordered to sew the seam shut, and I have done six stitches, and I am afraid five of them are in the wrong place.', 'P:idle@.26 D@.56^.4 LP:mend_coat@.86*.9 FL@.345^.44*.8>'),
  D('Pell! I forgive you for the seam.', 'P:idle@.26 D:cheer@.56^.4 LP:cap_in_hand@.86*.9 FL@.345^.44*.8>', { cue: 'comedy', i: 0.45 }),
  OFF('Miss Meeca asked me to tell you one thing. She says, "Tell Pokey I\'m knitting him a scarf. It\'s going to be very long. He\'ll have time to get here."',
    'P:idle@.26 D@.56^.4 LP:hopeful@.86*.9 FL@.345^.44*.8>', { cue: 'tender', i: 0.45 }),
  P('Tell her I\'ll wear it.', 'P:happy@.26 D@.56^.4 LP:hopeful@.86*.9 FL@.345^.44*.8>'),
  OFF('I shall. Sir. Everyone. I am so sorry. I really must go.', 'P:happy@.26 D@.56^.4 LP:salute_nervous@.86*.9 FL@.345^.44*.8>', { sting: 'laugh' }),
  D('Pokey, you\'ve been quiet since the lava, which is long even for you, and you\'re doing the thing with your eyebrow.', 'P:tired@.3 D@.62^.4 FL@.385^.44*.8>', { cue: 'comedy', i: 0.35 }),
  P('I\'m thinking about Meeca\'s grandfather.', 'P:talk@.3 D@.62^.4 FL@.385^.44*.8>', { cue: 'sorrow', i: 0.35 }),
  D('What about him?', 'P:worried@.3 D@.62^.4 FL@.385^.44*.8>'),
  P('Do you think he sleeps?', '=', { cue: 'tender', i: 0.4 }),
  D('No.', 'P:worried@.3 D@.62^.4 FL@.385^.44*.8>', { cue: 'sorrow', i: 0.3 }),
  P('He ate four bowls of the wrong soup. Somebody who does that isn\'t sleeping.', 'P:talk@.3 D@.62^.4 FL@.385^.44*.8>'),
  D('You\'re going to go up there and ask him, aren\'t you? Nicely. With your words. In front of all those spikes.', 'P:happy@.3 D@.62^.4 FL@.385^.44*.8>', { cue: 'tender', i: 0.45 }),
  P('I thought I\'d start there.', 'P:determined@.3 D@.62^.4 FL@.385^.44*.8>'),
]);

const W10 = chapter({ name: C10, w: 10, m: 'storm', cue: 'dread', i: 0.4, base: { particles: 'rain' } }, [
  N('The Stormy Highlands began where the trees stopped, and after that the rain had nothing to hit but rock. A thousand steps went up the mountain. The Highland Fortress sat on the last of them with one window lit.', 'P:idle@.3 D@.62^.4 FL@.385^.44*.8>', { p: pan(1.1, 0.3, 0.5, 1.2, 0.7, 0.4, 9) }),
  N('The netting was back at the foot of the mountain. Iron thorns, floor to cloud, humming faintly in the wind. In front of the first step it had folded away into a doorway. It was exactly one sloth wide.', 'P:worried@.3 D@.62^.4 FL@.385^.44*.8>', { sting: 'door' }),
  D('He measured you.', 'P:worried@.3 D@.62^.45 FL@.385^.44*.8>', { cue: 'dread', i: 0.4 }),
  P('Dot. This is where you go home.', 'P:talk@.3 D@.62^.45 FL@.385^.44*.8>', { cue: 'sorrow', i: 0.4 }),
  D('No.', '=', { cue: 'resolve', i: 0.5 }),
  P('The door fits one. You heard the Lieutenant. They\'ve probably sewn the seam shut by now.', 'P:talk@.3 D@.62^.45 FL@.385^.44*.8>'),
  D('He said he\'d sew it badly. He was a tailor\'s apprentice, and he was terrible. It\'s the one thing I\'m sure of up here.', '='),
  P('He\'s been practicing.', 'P:talk@.3 D@.62^.45 FL@.385^.44*.8>'),
  N('Thunder came down the mountain, long and low. Pokey took hold of the nearest rock with both hands. Dot watched him do it.', 'P:duck@.3 D@.62^.45 FL@.385^.44*.8>', { m: 'storm', cue: 'dread', i: 0.5, p: { fx: [{ at: 0.3, kind: 'flash', dur: 0.4, amount: 0.6 }, { at: 0.3, kind: 'shake', amount: 6, dur: 0.6 }] } }),
  P('It\'s only weather.', 'P:duck@.3 D@.62^.45 FL@.385^.44*.8>'),
  N('The thunder came again. His hands stayed where they were.', '=', { cue: 'hush', i: 0.3 }),
  P('I\'m afraid of thunder.', 'PF:worried@.4', { cue: 'resolve', i: 0.3 }),
  D('I know. Everybody knows. You hold things. You held a teacup for forty minutes at Meeca\'s birthday because a cloud went over. A teacup, Pokey. It was empty.', 'P:duck@.3 D@.62^.45 FL@.385^.44*.8>', { cue: 'tender', i: 0.4 }),
  N('Dot waited for him to laugh. He didn\'t, and neither did she. She put a wing over the pouch at her side and left it there.', 'P:duck@.3 D:sad@.62^.5 FL@.385^.44*.8>', { cue: 'sorrow', i: 0.4 }),
  N('Flicker, on the rock beside them, didn\'t look away.', 'P:duck@.3 D:sad@.62^.5 FL:worried@.44^.66*.8', { cue: 'hush', i: 0.25 }),
  // ART HOOK: the nest-in-the-storm plate (see STORM in storyMemories.ts), and Matt's painting of Pokey's parents going out, belong on these two beats
  D('Pokey. The night your parents went out. There was a warning to give. The storm had turned early, and I was the one who was supposed to fly it around the nests. And I took the wrong river. I took the wrong... I was late, Pokey. For them.', 'P:worried@.3 D:sad@.62^.5 FL@.385^.44*.8>', { cue: 'sorrow', i: 0.5, sting: 'reveal' }),
  D('They were already out on the far branches. I\'ve never told anybody. I tell myself it wouldn\'t have mattered. I say it every night, and it doesn\'t take. And I showed up at your branch every morning after that, and you thought I was just being nice.', '=', { cue: 'hush', i: 0.3 }),
  N('Pokey didn\'t say anything. He looked at his hands on the rock, and then at Dot.', 'PF:worried@.4', { cue: 'hush', i: 0.2 }),
  D('You don\'t have to answer. I need a minute. Don\'t wait for me.', 'P:worried@.3 D:sad@.62^.5 FL@.385^.44*.8>', { cue: 'sorrow', i: 0.4 }),
  P('Dot—', 'P:urgent@.3 D@.62^.5 FL@.385^.44*.8>', { i: 0.5 }),
  N('Dot pushed three folded notes into the satchel with one foot, and then she was gone into the rain.', 'P:sad@.3 FL@.385^.44*.8>', { cue: 'hush', i: 0.2 }),
  P('Dot?', 'PF:worried@.4', { cue: 'hush' }),
  N('The thorns hummed in the wind. Pokey stood in the rain. Then he went through the door that had been made for him.', 'P:sad@.3 FL@.385^.44*.8>', { cue: 'resolve', i: 0.5, p: { camera: pan(1.2, 0.3, 0.6, 1.0, 0.6, 0.35, 8).camera } }),
  N('Flicker came and sat on his wrist, next to the petal, and lit the first step.', 'P:determined@.3 FL:glow@.4^.64*.8', { cue: 'resolve', i: 0.45 }),
]);

/** the singing from the tower, halfway up the last mountain */
const W10_MID = chapter({ name: MID[10], w: 10, m: 'storm', cue: 'sorrow', i: 0.3, base: { particles: 'rain' } }, [
  N('Halfway up the mountain, the thunder stopped for a while. In the gap, from far above, Pokey heard something that wasn\'t thunder.', 'P:tired@.3 FL@.385^.44*.8>', { cue: 'hush', i: 0.15, p: pan(1.1, 0.3, 0.6, 1.3, 0.5, 0.3, 8) }),
  N('It was a voice, singing softly, and the tune was one he knew.', 'PF:surprised@.4', { cue: 'meeca', i: 0.4, sting: 'bloom' }),
  N('At a barred window at the top of the mountain, Meeca was singing with her eyes closed and her back straight. She had sung it every night since they brought her up.', 'MF:drowsy+weary@.5', { cue: 'meeca', i: 0.5 }),
  P('Meeca.', 'PF:happy@.4', { cue: 'meeca', i: 0.5 }),
  N('He couldn\'t make out the words from this far away. He took the next step, and the next, and found that he was humming. Up on the wall, one collar went dark for a moment, and came on again.', 'P:determined@.3 FL@.385^.44*.8>', { cue: 'resolve', i: 0.6, p: { particles: 'petals' } }),
  // Dot comes back halfway up (STORY-REVIEW-2026-10-27.md item 10): the night before, she asked Flicker not to let her stop halfway
  N('Something small came down out of the rain and landed on the step in front of him. It was soaked flat, and it was Dot.', 'P:surprised@.3 D:dizzy@.6^.62 FL@.4^.58*.8', { cue: 'tender', i: 0.35 }),
  FL('You said not to let you stop halfway.', 'P:surprised@.3 D:sad@.6^.62 FL:talk@.4^.58*.8'),
  D('I know what I said. I know what I said.', 'P:idle@.3 D:sad@.6^.6 FL@.4^.58*.8', { cue: 'sorrow', i: 0.35 }),
  D('I got as far as the ridge. I sat there. I\'m not doing that again. I\'m not going to be late for this one.', 'P:idle@.3 D@.58^.5 FL@.4^.58*.8', { cue: 'resolve', i: 0.4 }),
  N('Flicker\'s light had gone dim in the rain. Dot moved over and held a wing above it, and it came back up.', 'P:idle@.3 D:perch@.44^.5 FL:doze@.42^.58*.8', { cue: 'tender', i: 0.4, p: { zoom: 1.5, focusX: 0.42 } }),
  P('Next step.', 'P:determined@.3 D@.5^.42 FL:glow@.4^.58*.8', { cue: 'resolve', i: 0.5 }),
  D('Next step.', '='),
]);

/** at the fortress gate, after 10-9 and before the General (STORY-REVIEW-2026-10-27.md item 10): Dot goes around, and hands Flicker the job */
const W10_GATE = chapter({ name: 'WORLD 10 · THE GATE', w: 10, m: 'storm', cue: 'sorrow', i: 0.35, base: { particles: 'rain' } }, [
  D('This is where I go around. The cookhouse seam. I\'m going to be at her window before you\'re at the top. Early. For something, once.', 'P:idle@.3 D@.6^.42 FL@.4^.58*.8', { cue: 'resolve', i: 0.4 }),
  P('Dot.', 'P:worried@.3 D@.6^.42 FL@.4^.58*.8', { cue: 'sorrow', i: 0.35 }),
  D('Don\'t. Go in the front. Flicker, stay with him.', 'P:worried@.3 D:sad@.6^.42 FL@.4^.58*.8'),
  FL('I will.', 'P:worried@.3 D:sad@.6^.42 FL:glow@.4^.58*.8', { cue: 'tender', i: 0.4 }),
  N('Then she was gone along the wall. Up above, a flash, and a clang like a pot lid going down a stair. Then nothing at all.', 'P:urgent@.3 FL@.4^.58*.8', { cue: 'hush', sting: 'darkness', p: { fx: [{ at: 0.5, kind: 'flash', dur: 0.4 }, { at: 0.5, kind: 'shake', amount: 10, dur: 0.6 }] } }),
  P('Dot?', 'PF:worried@.4', { cue: 'hush' }),
]);

const W8 = [...W8_ACT, ...W8_A, ...PROMISE_PANELS, ...W8_B];

export const WORLD_STORIES: Record<number, WorldStory> = {
  1: { teaser: 'A petal on a tree, and a hummingbird two days late.', panels: W1 },
  2: { teaser: 'A village that asks everyone to wait, and a river king in a crooked crown.', panels: W2 },
  3: { teaser: 'Glowworm threads light the way, and something is watching.', panels: W3 },
  4: { teaser: 'Mist, thundering falls, and wings above the clouds.', panels: [...W4_ACT, ...W4] },
  5: { teaser: 'Orchids bloom, and so do cobwebs.', panels: W5 },
  6: { teaser: 'Black water, a spear, and a very strict lunch.', panels: W6 },
  7: { teaser: 'Ten stone chairs in a ring, and an eleventh with a dent in it.', panels: W7 },
  8: { teaser: 'Fireflies, moonlight, and a monarch of the night.', panels: W8 },
  9: { teaser: 'Lava rivers, and a dragon who is bad at visitors.', panels: W9 },
  10: { teaser: 'A thousand steps, one lit window, and no hummingbird.', panels: W10 },
};

/** a short scene halfway through a world (after its fifth stage): Dot, a note, a little more of the story */
export const WORLD_MID: Record<number, StoryPanel[]> = {
  1: W1_MID, 2: W2_MID, 3: W3_MID, 4: W4_MID, 5: W5_MID, 6: W6_MID, 7: W7_MID, 8: W8_MID, 9: W9_MID, 10: W10_MID,
};

/** a short scene after a world's ninth stage, at the guardian's door (World 10 only: the fortress gate), played once */
export const WORLD_GATE: Record<number, StoryPanel[]> = { 10: W10_GATE };

