/**
 * What happens on the road: one picture sequence when Pokey first arrives in each world, and one halfway through it (after stage 5),
 * where Dot the courier brings Meeca's latest note. Together they carry the middle of the story:
 *   Act I   The Trail   (1-3)  a quest with a good-humored hummingbird; patience wins; the guardians are bound, not wicked.
 *   Act II  The Cost    (4-7)  the mystery gets personal, the notes get thin, the General turns out to be family.
 *   Act III The Iron Road (8-10) rest, loss, mercy and the last climb.
 * The guardians' fights and what comes after them are in storyBosses.ts and storyChapters.ts.
 */
import { chapter, D, GEN, M, N, OFF, P, pan } from './storyDsl.ts';
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
  5: 'WORLD 5 · THE POUCH', 6: 'WORLD 6 · THE LAST NOTE', 7: 'WORLD 7 · THE QUIET', 8: 'WORLD 8 · ONE BRANCH', 9: 'WORLD 9 · THE FORTRESS-BUILDER',
  10: 'WORLD 10 · THE SONG FROM THE TOWER',
};

// ═════════════════════════════════ ACT I · THE TRAIL ═════════════════════════════════

const W1 = chapter({ name: C1, w: 1, m: 'day', cue: 'journey', i: 0.4, base: { particles: 'petals' } }, [
  N('Meeca\'s first petal hung in the Emerald Canopy like a tiny pink flag. Beyond it lay a hundred trees, a thousand branches, and something very long that had been slithering through them all morning.',
    'P:idle@.3 B1~@.8<', { p: pan(1.1, 0.4, 0.5, 1.25, 0.5, 0.58, 8) }),
  P('A petal. She made it out of the garden alive, and what she did with her first free moment was leave me a petal. That\'s the most Meeca thing that has ever happened.',
    'P:talk@.3 B1~@.8<'),
  D('Don\'t move! Don\'t-- oh. You aren\'t moving. Perfect. That\'s a superb quality in a recipient.', 'P:surprised@.3 D@.64^.4', { cue: 'comedy', i: 0.45 }),
  P('Dot! You got away from the soldiers!', 'P:happy@.3 D@.64^.4'),
  D('I got away, I got lost, I found you. Two of those were skill.', '=', { sting: 'laugh' }),
  P('You were supposed to catch up an hour ago.', 'P:talk@.3 D@.64^.4'),
  D('I did! I found a tree that looked exactly like you. It was a very common tree.', '=', { sting: 'laugh' }),
  D('Anyway. Courier business. I have a note from Meeca, a second note from Meeca, and a third note from Meeca that\'s mostly a drawing of me looking worried. It\'s accurate.', '='),
  P('Meeca wrote to you?', 'P:surprised@.3 D@.64^.4'),
  D('She wrote to YOU. I\'m the delivery. It\'s a very important role. Very underrated.', '='),
  D('Here. "Pokey: if you\'re reading this, you have found a petal. Congratulations. Don\'t stop to smell it. Smell it later. P.S. Dot will talk. Let him. He gets anxious when he cannot."', 'P:happy@.3 D@.64^.4', { cue: 'tender', i: 0.4 }),
  D('...I don\'t get anxious. I get ENERGETIC.', '=', { cue: 'comedy', i: 0.45 }),
  P('Can you carry a message back? Just tell her I\'m coming.', 'P:talk@.3 D@.64^.4', { cue: 'journey', i: 0.4 }),
  D('Ah. About that.', 'P:idle@.3 D@.64^.4', { cue: 'dread', i: 0.3 }),
  D('The fortress is wrapped in thorn netting now. Iron thorns, floor to cloud. There\'s one gap, one, just big enough for a note going OUT. Nothing goes in. I know. I tried. Twice. Into the same thorn.', 'P:worried@.3 D@.64^.4'),
  P('Then I\'ll just have to arrive.', 'P:determined@.3 D@.64^.4', { cue: 'resolve', i: 0.4 }),
  D('She said you would say that. She also said you would say it slowly. She\'s good.', 'P:happy@.3 D@.64^.4', { cue: 'journey', i: 0.5 }),
  N('Something long and very hungry had been listening from the branches. It had been listening for some time. It was, frankly, getting bored.',
    'P:idle@.3 D@.64^.4 B1~@.84<', { cue: 'dread', i: 0.35 }),
]);

const W1_MID = chapter({ name: MID[1], w: 1, m: 'day', cue: 'comedy', i: 0.4, base: { particles: 'petals' } }, [
  D('Halfway! Good! I\'m so proud. Fresh note! Meeca says: "The General has a great many rules. So far I have broken eleven. Dot, don\'t read the next part aloud."',
    'P:idle@.3 D@.62^.4'),
  D('I\'m going to read the next part aloud.', '=', { sting: 'laugh' }),
  D('"The next part is: I\'m fine. I have a window and a chair, and a lieutenant who apologizes every time he brings my breakfast. Tell Pokey I\'m fine."',
    'P:happy@.3 D@.62^.4', { cue: 'tender', i: 0.4 }),
  P('She\'s fine.', 'P:talk@.3 D@.62^.4'),
  D('She\'s fine!', '=', { cue: 'comedy', i: 0.45 }),
  P('She\'s sitting in a tower, held hostage by a sloth warlord, and she\'s fine.', 'P:talk@.3 D@.62^.4'),
  D('Look at the handwriting. Not one wobble.', '=', { cue: 'tender', i: 0.35 }),
  P('...Her handwriting always wobbles.', 'P:worried@.34 D@.62^.4', { cue: 'sorrow', i: 0.3 }),
  N('Pokey let go of the branch he had been gripping. It kept the shape of his hand.', 'P:tired@.34 D@.62^.4', { cue: 'tender', i: 0.45 }),
]);

const W2 = chapter({ name: C2, w: 2, m: 'day', cue: 'comedy', i: 0.4, base: { particles: 'sparkles' } }, [
  N('The Sunlit Riverbank was wide, brown and very sure of itself. Beside it stood a village of sloths, in a row of houses built into the bank, each with the same neat little sign: PLEASE BE PATIENT.',
    'P:idle@.3', { cue: 'journey', i: 0.4, p: pan(1.1, 0.2, 0.55, 1.2, 0.6, 0.55, 9) }),
  N('Pokey liked them immediately.', 'P:happy@.3'),
  N('At the top of the bank, Gruntlewick the village crier was halfway through a flood warning. He had begun it on Tuesday. The flood had come and gone since, and he was still only on the word FLOOD.',
    'P:idle@.3 D@.64^.4', { cue: 'comedy', i: 0.5 }),
  P('It sounds like a lovely warning. I\'d have wanted to hear all of it.', 'P:talk@.3 D@.64^.4'),
  D('Everybody here talks like that. The mailman has been delivering one parcel since spring. I have been a little rude to him about it.', '=', { sting: 'laugh' }),
  D('Fresh note, hot off the General\'s mail slot! "Pokey: the villagers will want you to stay for dinner. Don\'t stay for dinner. (Stay for pudding.) The river king is a diva. Admire something. Anything."',
    'P:idle@.3 D@.64^.4', { cue: 'journey', i: 0.4 }),
  P('Admire something?', 'P:surprised@.3 D@.64^.4'),
  D('She underlined "anything" three times. I think there\'s a history.', '='),
  P('And the pudding?', 'P:talk@.3 D@.64^.4'),
  D('She underlined the pudding four times. I won\'t be taking questions.', '=', { sting: 'laugh' }),
  N('Out on the water, a long dark shape slid slowly, silently and not at all subtly toward the shore. On its head, slightly crooked, sat a tiara of petals.',
    'P:idle@.3 B2~@.82<', { cue: 'dread', i: 0.3 }),
]);

const W2_MID = chapter({ name: MID[2], w: 2, m: 'day', cue: 'comedy', i: 0.4, base: { particles: 'petals' } }, [
  N('The village served the pudding at last. It had been started on Monday. Every sloth at the table agreed it was worth the wait, and Pokey agreed hardest.', 'P:happy@.3 D@.62^.4', { sting: 'laugh' }),
  D('Pokey, I have news, and I need you to take it calmly. Which, I know. You\'re calm. It\'s the news that needs help.', 'P:idle@.3 D@.62^.4'),
  D('Meeca says: "Every guardian wears an iron collar with thorns on the inside. They scratch at them when they think nobody is looking. I don\'t think they chose this."',
    'P:worried@.3 D@.62^.4', { cue: 'reveal', i: 0.35 }),
  P('Venom Fang had a collar. I thought it was a fashion choice.', 'P:talk@.3 D@.62^.4'),
  D('It\'s a fashion choice for the General. For them it\'s a leash.', '=', { cue: 'dread', i: 0.35 }),
  D('"Be kind to them," she says. "But please also win."', 'P:happy@.3 D@.62^.4', { cue: 'tender', i: 0.45 }),
  P('She wants me to be gentle with the ones who are trying to stop me.', 'P:happy@.3 D@.62^.4'),
  D('That\'s her whole thing. Also, a little bit, her whole problem.', '=', { sting: 'laugh' }),
]);

const W3 = chapter({ name: C3, w: 3, m: 'night', cue: 'dread', i: 0.25, base: { particles: 'sparkles' } }, [
  N('The Mossy Grotto glowed like a thousand lanterns that somebody had forgotten to turn off. Glowworms hung from the ceiling in long shimmering threads, each humming its own small, off-key tune.',
    'P:idle@.3', { p: pan(1.05, 0.5, 0.35, 1.3, 0.5, 0.6, 8) }),
  D('I don\'t do the dark, Pokey. I do daylight. I do a little dusk, if there are snacks.', 'P:idle@.3 D@.62^.4', { cue: 'comedy', i: 0.4 }),
  P('Then stay close. I\'m very dim, but I\'m extremely steady.', 'P:happy@.3 D@.62^.4'),
  D('Dim and steady. I\'ve been hired on less.', '=', { sting: 'laugh' }),
  N('Pokey stopped to listen to the glowworms, and the glowworms noticed. One by one, they brightened. The light followed him.', 'P:happy@.3 D@.62^.4', { cue: 'bloom', i: 0.4 }),
  N('Above them, between the stalactites, hung the old thorn-vines the grandmothers swore were asleep. One of them twitched.', 'P:idle@.3 D@.62^.4', { cue: 'dread', i: 0.3 }),
  N('And by that light they saw the footprints. Each was as wide as Pokey was tall. They went in a perfect circle, around the two of them, and then stopped.',
    'P:worried@.3 D@.62^.4 B3~@.88<', { cue: 'dread', i: 0.4, p: { particles: 'none' } }),
  D('I\'m looking at them with my eyes closed.', '='),
  P('Dot, that makes the footprints no smaller.', 'P:talk@.3 D@.62^.4 B3~@.88<'),
  N('Far back in the dark, something shifted its weight. Something that could stand perfectly still, too.',
    'P:worried@.3 D@.62^.4 B3~@.9<', { cue: 'dread', i: 0.4 }),
]);

const W3_MID = chapter({ name: MID[3], w: 3, m: 'night', cue: 'comedy', i: 0.35, base: { particles: 'sparkles' } }, [
  D('Okay. Confession time. Meeca asked me to hide Grandma\'s things before the soldiers came. So I hid them. In ferns. All over the forest. I panicked.', 'P:idle@.3 D@.62^.4'),
  P('All of them? In ferns?', 'P:surprised@.3 D@.62^.4'),
  D('In my defense, all ferns look alike. In their defense, they\'re ferns. I have lost track of which is which.', '=', { sting: 'laugh' }),
  P('Dot. Where, exactly?', 'P:talk@.3 D@.62^.4'),
  D('Somewhere ferny. If you crouch down beside one, it rustles. I may have said that wrong. I may have said it perfectly. It\'s hard to know with ferns.',
    '=', { cue: 'journey', i: 0.4 }),
  N('So the great search for Grandma\'s lost things began. It began with a sloth and a hummingbird, crouching by every fern in the Grotto, saying "hello?" in a very small voice.',
    'P:duck@.3 D@.62^.4', { cue: 'comedy', i: 0.45 }),
]);

// ═════════════════════════════════ ACT II · THE COST ═════════════════════════════════

const W4_ACT = chapter({ name: 'ACT II · THE COST', w: 4, m: 'day', cue: 'dread', i: 0.4, base: { particles: 'sparkles' } }, [
  N('The vine held. Which was lucky, because nothing else had.', 'P:hurt@.5', { sting: 'cliffhanger', p: pan(1.0, 0.5, 0.2, 1.2, 0.5, 0.55, 5) }),
  P('I\'m looking down.', 'P:worried@.5 D@.7^.3'),
  D('Why are you looking down?!', '=', { cue: 'comedy', i: 0.5 }),
  P('Because it\'s there.', 'P:worried@.5 D@.7^.3'),
  D('Don\'t look at the there! Look at the up! The up is lovely!', '='),
  P('Dot. It\'s very kind of you to try. You weigh about as much as a spoon.', 'P:talk@.5 D@.7^.3'),
  D('A SPOONFUL. Heaped.', '=', { sting: 'laugh' }),
  N('It took Pokey eleven minutes to climb up. He considered it a new personal best. Dot considered it a medical event.', 'P:tired@.4 D@.64^.35', { cue: 'journey', i: 0.4 }),
  P('That wasn\'t the Prowler. That was the General, working the Prowler\'s paw like a puppet. He took the ledge away, and he said hello.', 'P:talk@.3 D@.64^.35', { cue: 'dread', i: 0.4 }),
  D('The General says hello to everyone like that. Normally it\'s with arrows. You\'re getting the personal touch.', '='),
  P('The Prowler didn\'t want to. I saw his face. Somebody made him.', 'P:worried@.3 D@.64^.35', { cue: 'reveal', i: 0.35 }),
  D('That\'s the part I keep not saying out loud.', '=', { cue: 'sorrow', i: 0.3 }),
]);

const W4 = chapter({ name: C4, w: 4, m: 'day', cue: 'journey', i: 0.5, base: { particles: 'sparkles' } }, [
  N('Waterfalls as tall as the sky. The water ran a little cloudy. It does that, the old sloths say, when the Heartbloom has stayed closed too long.',
    'P:idle@.3 D@.64^.35', { cue: 'journey', i: 0.5, p: pan(1.2, 0.5, 0.7, 1.1, 0.5, 0.2, 6) }),
  N('A feather drifted down out of the mist, as long as Pokey\'s whole arm. He should not look up. He looked up.', 'P:surprised@.3 D@.64^.35'),
  D('Her Majesty the Sky Sovereign. Please, please be polite. She hates being interrupted in the middle of a dive.', 'P:idle@.3 D@.64^.35 B4~@.82<'),
  P('I\'ll wait until she has finished.', 'P:happy@.3 D@.64^.35 B4~@.82<'),
  D('She started that dive at breakfast. Wait politely.', '=', { sting: 'laugh' }),
]);

const W4_MID = chapter({ name: MID[4], w: 4, m: 'day', cue: 'tender', i: 0.35, base: { particles: 'petals' } }, [
  D('I have to tell you something about the notes. They\'re getting shorter.', 'P:idle@.3 D@.62^.4', { cue: 'dread', i: 0.3 }),
  P('Shorter?', 'P:worried@.3 D@.62^.4'),
  N('Today\'s note said only: "Still here." Dot\'s tail had a bare patch the size of a thumb.', 'P:worried@.3 D@.62^.4', { cue: 'sorrow', i: 0.3 }),
  P('Why keep bringing them?', 'P:talk@.3 D@.62^.4'),
  D('Two words weigh nothing. I checked.', 'P:surprised@.3 D@.62^.4', { cue: 'tender', i: 0.5 }),
  P('...Dot.', 'P:happy@.3 D@.62^.4'),
  D('Don\'t. I\'ll cry, and I cannot afford the water weight.', '=', { sting: 'laugh' }),
]);

const W5 = chapter({ name: C5, w: 5, m: 'day', cue: 'comedy', i: 0.4, base: { particles: 'sparkles' } }, [
  N('The Orchid Sanctuary was the loveliest place Pokey had ever seen, and he was counting the insides of his own eyelids.', 'P:happy@.3', { cue: 'bloom', i: 0.4, p: pan(1.05, 0.2, 0.5, 1.25, 0.7, 0.55, 9) }),
  N('It was barely afternoon, and the orchids were closing already, one by one, like guests who had stopped enjoying the party.', 'P:worried@.3', { cue: 'dread', i: 0.3 }),
  N('On the trunk of the first tree, someone had carved a message with something very small and very sharp. The letters were shaky, as if cut on the move. POKEY - I KNOW YOU WILL.',
    'P:surprised@.3 D@.62^.4', { cue: 'meeca', i: 0.4, sting: 'bloom', p: { zoom: 1.5, focusX: 0.4 } }),
  P('She did this while they marched her past.', 'PF:happy+worried@.4', { cue: 'tender', i: 0.4 }),
  D('With a hairpin. She\'s extremely resourceful. She also now has no hairpin.', 'P:happy@.3 D@.62^.4', { cue: 'comedy', i: 0.45 }),
  D('Rules! Don\'t eat anything. Don\'t drink anything. Don\'t touch the silk. Don\'t admire the silk. It takes it as a compliment.', '=', { cue: 'comedy', i: 0.5 }),
  N('A small table stood in the middle of the path, set for two: china cups, a plate of tiny cakes and, on a silk napkin, a card in careful handwriting. "Do come in. Do stay. Everybody does, eventually."',
    'P:idle@.3 D@.62^.4 B5~@.86<'),
  P('That\'s very polite.', 'P:talk@.3 D@.62^.4 B5~@.86<'),
  D('That\'s what\'s so scary.', '=', { sting: 'laugh' }),
  P('Dot. Be honest. How bad would it be if I just had one cake?', 'P:talk@.3 D@.62^.4 B5~@.86<'),
  D('You would be a cake, Pokey. You would be, forever, a very still cake.', '=', { cue: 'dread', i: 0.3 }),
]);

const W5_MID = chapter({ name: MID[5], w: 5, m: 'dusk', cue: 'tender', i: 0.3, base: { particles: 'petals' } }, [
  N('They stopped to rest on a quiet branch, where the orchids hung like small lamps. Dot kept touching the little pouch at his side.', 'P:tired@.3 D@.62^.45', { cue: 'tender', i: 0.3 }),
  P('You keep checking that pouch.', 'P:talk@.3 D@.62^.45'),
  D('It\'s nothing. It\'s a thing. It isn\'t for you.', '=', { cue: 'sorrow', i: 0.3 }),
  P('Whose is it?', 'P:talk@.3 D@.62^.45'),
  D('Someone I\'m scared of.', 'P:worried@.3 D@.62^.45'),
  P('...The General?', 'P:talk@.3 D@.62^.45'),
  D('I\'m not scared of him. I\'m scared of what it says. And I\'m scared of what he will do when he reads it. And I\'m scared that I waited too long to bring it.',
    '=', { cue: 'sorrow', i: 0.4 }),
  P('Then bring it when you\'re ready. Not before. Slow isn\'t stopped.', 'P:happy@.3 D@.62^.45', { cue: 'grandma', i: 0.4 }),
  D('You keep saying that. Is it true?', 'P:happy@.3 D@.62^.45'),
  P('I have no idea. But it hasn\'t been wrong yet.', 'P:happy@.3 D@.62^.45', { cue: 'tender', i: 0.4 }),
]);

/** the villain's side of the story: he is not absent, he is waiting (and running out of pins) */
const W6_MAP = chapter({ name: 'MEANWHILE · THE MAP', w: 10, m: 'night', cue: 'war', i: 0.3, base: { particles: 'none' } }, [
  N('Meanwhile, in the Highland Fortress, a very large sloth stood in front of a very large map.', 'G@.62*.9<', { p: pan(1.05, 0.4, 0.55, 1.35, 0.62, 0.5, 8) }),
  GEN('Five pins. He is the slowest creature in the forest, and he has taken five of my pins.', 'G@.62*.9<', { cue: 'sorrow', i: 0.3 }),
  GEN('...Why does he keep coming?', '=', { i: 0.25 }),
  N('Above the map, on the wall, hung an iron horn. He took it down. It was very heavy. He lifted it to his lips, and for a long time he did not blow it.', 'G@.62*.9<', { cue: 'hush', i: 0.15 }),
  N('Then he blew. And far to the south, in the black water, something old and angry opened its eyes.', 'G@.62*.9<', { cue: 'war', i: 0.6, sting: 'blow', p: { fx: [{ at: 0.3, kind: 'shake', amount: 6, dur: 0.7 }] } }),
]);

const W6 = chapter({ name: C6, w: 6, m: 'dusk', cue: 'dread', i: 0.3, base: { particles: 'sparkles' } }, [
  N('The Deep Mangrove swallowed the sun in one gulp. The roots twisted like a maze, and the water lay perfectly still, the color of old pewter. Rivers are kind when the Heartbloom is open. This one had stopped being kind.', 'P:idle@.3', { p: pan(1.05, 0.5, 0.3, 1.3, 0.5, 0.6, 8) }),
  P('In my experience, perfectly still water means something enormous is holding its breath.', 'P:worried@.3 D@.62^.4 B6~@.86<'),
  N('Out of the black water, very slowly, a spear rose like a periscope. It turned to look at them. Then it sank again.', 'P:worried@.3 D@.62^.4 B6~@.88<', { cue: 'dread', i: 0.4, sting: 'darkness' }),
  D('Did the water just look at us?', '=', { cue: 'comedy', i: 0.35 }),
  P('It was very polite about it.', 'P:worried@.3 D@.62^.4 B6~@.88<'),
  D('I\'d like it on record that I\'m terrified. Somebody should be.', '='),
  D('"Pokey: the Reaver eats lunch at noon. Do NOT meet him at noon." ...That\'s all it says. There\'s no second line. There\'s a stain.', 'P:idle@.3 D@.62^.4', { sting: 'laugh' }),
  P('What time is it?', 'P:worried@.3 D@.62^.4'),
  D('...Noon.', '=', { cue: 'dread', i: 0.4, sting: 'cliffhanger' }),
]);

const W6_MID = chapter({ name: MID[6], w: 6, m: 'dusk', cue: 'sorrow', i: 0.3, base: { particles: 'petals' } }, [
  D('Pokey. I need to tell you something and I cannot make it funny. I tried.', 'P:tired@.3 D@.62^.4', { cue: 'sorrow', i: 0.3 }),
  P('Go on.', 'P:talk@.3 D@.62^.4'),
  D('This is the last note I can get out. The net is sealed past here. There\'s no gap anymore. I checked every inch. I checked it with my face.', '=', { cue: 'dread', i: 0.35 }),
  D('She wrote two. One is silly. The other one she wrote on her very bad day, and made me swear to give you only when you needed it.', 'P:worried@.3 D@.62^.4'),
  P('How will I know when I need it?', 'P:talk@.3 D@.62^.4'),
  D('You will know. That\'s what she said. She said, "he will know, because he will stop."', '=', { cue: 'sorrow', i: 0.4, sting: 'heartbreak' }),
  N('Dot had three tail feathers left. He had given the rest to the net. Pokey had counted, and said nothing.', 'P:sad@.3 D@.62^.4', { cue: 'sorrow', i: 0.3 }),
  N('Dot tucked the sealed note into Pokey\'s satchel, very gently, with both claws, as if it might break. Then he flew away into the mist without a single joke. Pokey noticed.',
    'P:sad@.3', { cue: 'sorrow', i: 0.4 }),
]);

const W7 = chapter({ name: C7, w: 7, m: 'dusk', cue: 'reveal', i: 0.3, base: { particles: 'sparkles' } }, [
  N('Moss-covered statues. Golden idols. A temple door that stood slightly open. Meeca had come through here. So, by the look of the floor, had something very heavy.', 'P:idle@.3', { p: pan(1.05, 0.5, 0.35, 1.3, 0.55, 0.6, 8) }),
  N('The vines on the old walls hung brown. Somewhere far behind him, the Heartbloom had not opened once.', 'P:tired@.3', { cue: 'dread', i: 0.25 }),
  P('Dot would have said something funny here.', 'P:sad@.3', { cue: 'sorrow', i: 0.3 }),
  N('There was no hummingbird. The air by his shoulder was empty.', 'P:sad@.3'),
  N('In the first courtyard, ten stone chairs stood in a ring around a cold fire pit. Each had a creature carved into its back: a panther, a crocodile, an owl.',
    'P:worried@.3', { cue: 'reveal', i: 0.35, p: { zoom: 1.5, focusX: 0.4 } }),
  N('An eleventh chair, at the head of the ring, had no carving at all. Only a deep dent in the seat, worn by someone very large who had sat there very often, and then stopped.',
    '=', { cue: 'dread', i: 0.35 }),
  P('The Council. Her Majesty said they argued about everything. ...Nobody has sat here for a long time.', 'P:talk@.3', { cue: 'sorrow', i: 0.3 }),
  P('The stones remember a lot, I think. They just say it slowly.', 'P:talk@.3 B7~@.84<', { cue: 'reveal', i: 0.3 }),
  N('From the shadows, something very large began to speak. It took four minutes to say good morning.', 'P:idle@.3 B7~@.84<', { cue: 'comedy', i: 0.4, sting: 'laugh' }),
]);

const W7_MID = chapter({ name: MID[7], w: 7, m: 'dusk', cue: 'sorrow', i: 0.3, base: { particles: 'sparkles' } }, [
  P('Excuse me. Do you know the way up?', 'P:talk@.3', { cue: 'comedy', i: 0.3 }),
  N('The statue said nothing. Pokey thanked it for not interrupting.', 'P:happy@.3', { sting: 'laugh' }),
  N('Somewhere deep in the ruins, Pokey stopped to listen to the quiet. It was a different quiet from the Grotto, or the river. It had a shape. It was the shape of someone missing.', 'P:tired@.3', { cue: 'sorrow', i: 0.3 }),
  P('Dot would say: "Pokey, this temple is so old that even the dust has dust."', 'P:talk@.3', { cue: 'tender', i: 0.3 }),
  N('He left a gap after it, just the right size for a laugh.', 'P:tired@.3'),
  N('In his satchel was a note he had read so many times that the folds had gone soft. He did not take it out. He hummed instead. It was a bad hum. It was the right tune.', 'P:tired@.3', { cue: 'tender', i: 0.35 }),
  N('Then he picked up the satchel, and kept climbing.', 'P:determined@.3', { cue: 'resolve', i: 0.35 }),
]);

// ═════════════════════════════════ ACT III · THE IRON ROAD ═════════════════════════════════

const W8_ACT = chapter({ name: 'ACT III · THE IRON ROAD', w: 8, m: 'dusk', cue: 'dread', i: 0.3, base: { particles: 'sparkles' } }, [
  N('Seven guardians were behind him. The notes had stopped. And over the treetops the sky was the color of a held breath.', 'P:tired@.3', { p: pan(1.05, 0.5, 0.35, 1.3, 0.45, 0.6, 8) }),
  P('Seven down. Three to go. And I don\'t think the last one is the kind of fight I know how to win.', 'P:talk@.3', { cue: 'sorrow', i: 0.3 }),
  N('Meanwhile, in the tallest tower of the Highland Fortress, a young keeper sat awake. Outside her door, a great shadow stood with one paw raised to knock.',
    'M:sad@.3 G~@.8*.9<', { w: 10, m: 'night', cue: 'hush', i: 0.2, p: { particles: 'none', ...pan(1.1, 0.6, 0.55, 1.35, 0.5, 0.55, 8) } }),
  M('I can hear you breathing, you know. You don\'t have to knock.', 'M:think@.3 G~@.8*.9<', { cue: 'meeca', i: 0.3 }),
  N('The shadow did not answer. After a long time, it lowered its paw and went away.', 'M:sad@.3', { cue: 'sorrow', i: 0.25 }),
  M('Goodnight.', '=', { i: 0.2 }),
  N('She left the lamp lit anyway. Just in case.', '=', { cue: 'tender', i: 0.3, sting: 'bloom' }),
]);

const W8_A = chapter({ name: C8, w: 8, m: 'night', cue: 'dread', i: 0.2, base: { particles: 'sparkles' } }, [
  N('The sun went to bed, and the fireflies woke up. Pokey would have gone to bed too. But Meeca was out there somewhere in the dark, and so was something with very large wings.',
    'P:tired@.3 B8~@.86<', { p: pan(1.05, 0.5, 0.35, 1.25, 0.45, 0.6, 8) }),
  N('He sat down on a branch to rest his eyes. His eyes had other plans.', 'PF:tired+calm_closed@.4', { cue: 'tender', i: 0.2, p: { zoom: 1.3, focusX: 0.4 } }),
]);

/** after the dream (PROMISE_PANELS, storyChapters.ts) Pokey wakes up to Dot */
const W8_B = chapter({ name: 'WORLD 8 · WAKE UP', w: 8, m: 'night', cue: 'tender', i: 0.4, base: { particles: 'sparkles' } }, [
  D('Wake up. Wake up. You were mumbling. Mostly about a petal. ...Pokey? Pokey. I have been flying for three days and I\'m not even a little bit cool right now.',
    'P:tired@.3 D@.62^.4'),
  P('Dot?! You came back. Dot, you\'re bleeding.', 'P:surprised@.3 D@.62^.45', { cue: 'sorrow', i: 0.4, p: { memory: false } }),
  D('It\'s a scratch. It\'s nine scratches. I found a seam in the net and I put my entire body through it, and a thorn has opinions about that. Here.',
    '=', { cue: 'tender', i: 0.45 }),
  D('"Pokey, I\'m quite sure you\'re asleep right now. It\'s fine. I\'d be too. Keep going. I\'m still here. And I have found out who he is. I\'ll tell you when I can look at you."',
    'P:talk@.3 D@.62^.45', { cue: 'reveal', i: 0.4 }),
  P('...She knows. Meeca knows.', 'P:worried@.3 D@.62^.45'),
  D('She knows enough. She worked it out alone, in the dark, and she isn\'t angry. She says she\'s sad in a way that has no name yet.', '=', { cue: 'sorrow', i: 0.4 }),
  P('Dot, sit down. I have to tell you something.', 'P:talk@.3 D@.62^.45', { cue: 'tender', i: 0.3 }),
  D('I\'m sitting. It\'s hover-sitting. It takes core.', '=', { sting: 'laugh' }),
  P('The General is her grandfather. I found the photograph in the ruins.', 'P:talk@.3 D@.62^.45', { cue: 'reveal', i: 0.35 }),
  D('I know. I have always known. I was there the night of the storm.', '=', { cue: 'sorrow', i: 0.4 }),
  N('Dot landed. Pokey hadn\'t seen his feet touch a branch in days.', 'P:sad@.3 D@.62^.55', { cue: 'sorrow', i: 0.4 }),
  P('You never said.', 'P:surprised@.3 D@.62^.45'),
  D('It wasn\'t mine to say. It isn\'t even mine to carry, and I\'m carrying it anyway.', 'P:surprised@.3 D@.62^.5', { i: 0.35 }),
  P('Then I had better get there. Before she has to find the name on her own.', 'P:determined@.3 D@.62^.45', { cue: 'resolve', i: 0.5 }),
]);

const W8_MID = chapter({ name: MID[8], w: 8, m: 'night', cue: 'tender', i: 0.3, base: { particles: 'sparkles' } }, [
  P('Dot, you\'re humming.', 'P:talk@.3 D@.62^.4', { cue: 'comedy', i: 0.3 }),
  D('I\'m vibrating. It happens when I don\'t sleep. It\'s worse.', '=', { sting: 'laugh' }),
  D('Pokey. A question. It\'s the middle of the night, and I\'m asking it out loud, and I\'d like you not to repeat it.', 'P:idle@.3 D@.62^.4'),
  P('Of course.', 'P:talk@.3 D@.62^.4'),
  D('When you\'re afraid of being too late, what do you do?', 'P:idle@.3 D@.62^.4', { cue: 'sorrow', i: 0.3 }),
  P('I do what Meeca told me once. I put one foot on the next branch. Then another. Then I look back, and I\'m somewhere.', 'P:talk@.3 D@.62^.4', { cue: 'grandma', i: 0.35 }),
  D('Huh.', '=', { cue: 'tender', i: 0.4 }),
  N('Dot stopped vibrating somewhere around the next branch. Neither of them mentioned it.', 'P:happy@.3 D@.62^.4', { cue: 'tender', i: 0.4 }),
]);

const W9 = chapter({ name: C9, w: 9, m: 'dusk', cue: 'comedy', i: 0.4, base: { particles: 'embers' } }, [
  N('The jungle was on fire. Well. Glowing. The rocks were warm, the air tasted of pepper, and somewhere up ahead the largest lizard Pokey had ever seen was clearing his throat.',
    'P:idle@.3 D@.62^.4 B9~@.88<', { p: pan(1.05, 0.5, 0.35, 1.3, 0.5, 0.6, 8) }),
  N('He began: "Another visitor!" Then there was a pause, in which he remembered he was not supposed to be pleased about it.', '=', { sting: 'laugh' }),
  D('"It\'s cold. I\'m fine. The General sent up a blanket. Please don\'t tell him I said thank you." The last of the silly ones. I was saving it for a day you needed a laugh.',
    '=', { cue: 'tender', i: 0.4 }),
  P('She said thank you to him?', 'P:surprised@.3 D@.62^.4'),
  D('She says thank you to everyone. She said it to a thorn once. The thorn didn\'t know what to do with itself.', '=', { sting: 'laugh' }),
  N('Far ahead, behind the smoke, the fortress rose out of the thunder like a tooth. It was close now. For the first time in all his journey, Pokey could see exactly where he was going.',
    'P:idle@.3 D@.62^.4', { cue: 'dread', i: 0.4, p: pan(1.1, 0.7, 0.4, 1.1, 0.4, 0.6, 7) }),
]);

const W9_MID = chapter({ name: MID[9], w: 9, m: 'dusk', cue: 'comedy', i: 0.35, base: { particles: 'embers' } }, [
  N('A lantern was bobbing along the ridge at ground level, very much trying not to be seen.', 'P:idle@.3 D@.62^.4', { sting: 'laugh' }),
  OFF('Please do not look at me. I have come to report that I have been ordered to sew the seam shut. I have done eleven stitches. Nine are in the wrong place.', '='),
  D('PELL! I forgive the scratches! All nine of them!', '=', { cue: 'comedy', i: 0.45 }),
  OFF('Miss Meeca asked me to tell you one thing. She says: "Tell the slow one I am knitting him a scarf. It is going to be very long. He will have time to arrive."',
    '=', { cue: 'tender', i: 0.45 }),
  P('Tell her I\'m on my way.', 'P:happy@.3 D@.62^.4'),
  OFF('I shall. ...Sir. I mean, everyone. I should go.', '=', { sting: 'laugh' }),
  D('Pokey, you\'ve been quiet for two hours. You\'re worrying.', 'P:tired@.3 D@.62^.4', { cue: 'comedy', i: 0.35 }),
  P('I\'m not worrying. I\'m thinking about Meeca\'s grandfather.', 'P:talk@.3 D@.62^.4', { cue: 'sorrow', i: 0.35 }),
  D('...What about him?', 'P:worried@.3 D@.62^.4'),
  P('That he must be scared stiff. Nobody builds that much wall for nothing.', '=', { cue: 'tender', i: 0.4 }),
  D('...', 'P:happy@.3 D@.62^.4'),
  D('You really are going to ask him to be kind, aren\'t you.', '=', { cue: 'tender', i: 0.45 }),
  P('I\'m going to ask. He doesn\'t have to say yes.', 'P:determined@.3 D@.62^.4'),
]);

const W10 = chapter({ name: C10, w: 10, m: 'storm', cue: 'dread', i: 0.4, base: { particles: 'rain' } }, [
  N('The Stormy Highlands. Every guardian was behind him now. In front of him: lightning, a thousand stone steps, and the Highland Fortress, black against the sky.', 'P:idle@.3 D@.62^.4', { p: pan(1.1, 0.3, 0.5, 1.2, 0.7, 0.4, 9) }),
  N('The netting began at the foot of the mountain. Iron thorns, floor to cloud, humming faintly in the wind. But in front of the first stone step it had folded back into a doorway. It was exactly one sloth wide.', 'P:worried@.3 D@.62^.4', { sting: 'door' }),
  D('He measured you.', 'P:worried@.3 D@.62^.45', { cue: 'dread', i: 0.4 }),
  P('Dot. This is where you go home.', 'P:talk@.3 D@.62^.45', { cue: 'sorrow', i: 0.4 }),
  D('No.', '=', { cue: 'resolve', i: 0.5 }),
  P('The door fits one. You heard the Lieutenant. They have probably sewn up his seam by now.', 'P:talk@.3 D@.62^.45'),
  D('He said he would sew it very badly. He was a tailor\'s apprentice, and he was terrible. I have been counting on that ever since.', '=', { sting: 'laugh' }),
  P('That isn\'t a plan, Dot. That\'s a hummingbird-shaped hole.', 'P:talk@.3 D@.62^.45'),
  N('Dot touched the little pouch at his side, the way he always did when he was frightened.', 'P:worried@.3 D@.62^.45', { cue: 'sorrow', i: 0.35 }),
  D('Nine years. One late message. I\'d like to be early for something.', 'P:worried@.3 D@.62^.45', { cue: 'sorrow', i: 0.45 }),
  P('Dot, please. Please don\'t.', 'P:worried@.3 D@.62^.45'),
  D('You said it. Slow isn\'t stopped. Well. Fast isn\'t stopped, either.', 'P:happy@.3 D@.62^.45', { cue: 'resolve', i: 0.6 }),
  N('Dot streaked into the dark along the netting, round the black shoulder of the mountain, toward a badly sewn seam he could not see. For a moment there was only the rain.', 'P:sad@.3', { cue: 'hush', i: 0.2 }),
  N('Then, far away, a flash. A scream of iron. And nothing at all.', 'P:urgent@.3', { cue: 'hush', sting: 'darkness', p: { fx: [{ at: 0.5, kind: 'flash', dur: 0.4 }, { at: 0.5, kind: 'shake', amount: 10, dur: 0.6 }] } }),
  P('...Dot?', 'PF:worried@.4', { cue: 'hush' }),
  N('The thorns hummed in the wind. Pokey stood in the rain for a long time. Then he turned toward the one door that had been made for him. He did not know whether the hummingbird had made it through. He climbed anyway.',
    'P:sad@.3', { cue: 'resolve', i: 0.5, p: { camera: pan(1.2, 0.3, 0.6, 1.0, 0.6, 0.35, 8).camera } }),
]);

/** the singing from the tower, halfway up the last mountain */
const W10_MID = chapter({ name: MID[10], w: 10, m: 'storm', cue: 'sorrow', i: 0.3, base: { particles: 'rain' } }, [
  N('Halfway up the mountain, the thunder paused to take a breath. And in the gap, from very far above, Pokey heard something that was not thunder.', 'P:tired@.3', { cue: 'hush', i: 0.15, p: pan(1.1, 0.3, 0.6, 1.3, 0.5, 0.3, 8) }),
  N('It was a voice, singing. It was singing very softly, the way you sing to something that is afraid of the dark.', 'PF:surprised@.4', { cue: 'meeca', i: 0.4, sting: 'bloom' }),
  P('Meeca.', 'PF:happy@.4', { cue: 'meeca', i: 0.5 }),
  N('He could not make out the words from this far away. He did not need them. He took the next step, and the next, and found that he was humming.', 'P:determined@.3', { cue: 'resolve', i: 0.6, p: { particles: 'petals' } }),
]);

const W8 = [...W8_ACT, ...W8_A, ...PROMISE_PANELS, ...W8_B];

export const WORLD_STORIES: Record<number, WorldStory> = {
  1: { teaser: 'Meeca\'s trail begins in the treetops.', panels: W1 },
  2: { teaser: 'The river hides a very hungry king.', panels: W2 },
  3: { teaser: 'Glowworm threads light the way, and something watches.', panels: W3 },
  4: { teaser: 'Mist, thunder falls, and wings above the clouds.', panels: [...W4_ACT, ...W4] },
  5: { teaser: 'Orchids bloom, and so do cobwebs.', panels: W5 },
  6: { teaser: 'The mangrove swamp swallows the sun.', panels: [...W6_MAP, ...W6] },
  7: { teaser: 'Crumbling temples guard a stony secret.', panels: W7 },
  8: { teaser: 'Fireflies, moonlight, and a monarch of the night.', panels: W8 },
  9: { teaser: 'Lava rivers and a dragon who hates visitors.', panels: W9 },
  10: { teaser: 'The Highland Fortress. Meeca is close.', panels: W10 },
};

/** a short scene halfway through a world (after its fifth stage): Dot, a note, a little more of the story */
export const WORLD_MID: Record<number, StoryPanel[]> = {
  1: W1_MID, 2: W2_MID, 3: W3_MID, 4: W4_MID, 5: W5_MID, 6: W6_MID, 7: W7_MID, 8: W8_MID, 9: W9_MID, 10: W10_MID,
};

