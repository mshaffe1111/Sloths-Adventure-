/**
 * The opening: a slow morning, and the afternoon it ends. The only part of the story where the player has nothing to do but watch, so it
 * has to make them like these three before it takes one away. Rewritten with Matt line by line (reference/VOICE.md has it as approved).
 * Shape: warm (Dot a day late, Pokey teasing) -> Meeca's flower opening -> the birds go quiet -> the General -> nobody comes -> Grandma in
 * the rain, maybe -> the petal.
 * What it plants, for later: Dot's lateness and her wing going to the pouch, "it's still morning" (paid off in the ending, when she is late
 * again), the snail that trained for it, "You know how I feel about thunder", the General counting aloud, "little bloom" scaring Meeca
 * ("Who told you that?"), and "He's too slow. He'll never make it", which every guardian says again in its own way.
 */
import { chapter, D, GEN, GM, M, N, P, pan } from './storyDsl.ts';
import type { StoryPanel } from './story.ts';

/** a wider camera for the pictures with Dot on Pokey's head: the automatic close-up on whoever speaks crops him off the top */
const WIDE = { zoom: 1.2, focusX: 0.45, focusY: 0.5 };

const MORNING = chapter({ name: 'PROLOGUE · THE SLOWEST MORNING', w: 1, m: 'day', cue: 'pokey', i: 0.3, base: { particles: 'sparkles' } }, [
  N('Morning came down through the canopy one branch at a time. Pokey\'s branch was usually last.',
    'PF:calm_closed@.34 H:bloom@.76^.82', { p: pan(1.05, 0.5, 0.3, 1.3, 0.5, 0.62, 7) }),
  D('I\'m sorry, I\'m so sorry I\'m late. I have letters. Important letters. I wanted to have them here this morning, first thing, I promised myself first thing in the morning—',
    'P:surprised@.3 D:yelp@.36^.3', { cue: 'comedy', i: 0.4, p: WIDE }),
  P('Well. It seems to me that it\'s still morning.', 'P:happy@.3 D:perch@.3^.32', { p: WIDE }),
  D('Yesterday morning. I meant yesterday morning.', 'P:happy@.3 D:puzzled@.3^.32', { p: WIDE }),
  P('Oh. Well, you\'re really late then.', 'P:talk@.3 D:puzzled@.3^.32', { sting: 'laugh', p: WIDE }),
  D('There was a headwind over the river, I hit it head on, and then there was another one right behind it, a completely different one, I don\'t even know where it came from, and you know I hate being late, you KNOW I—',
    'P:happy@.3 D:yelp@.3^.32', { p: WIDE }),
  N('She stopped and looked at him properly.', 'P:idle@.3 D:perch@.3^.32', { cue: 'tender', i: 0.3, p: WIDE }),
  D('You look thin. Have you lost weight? Have you been eating?', 'P:surprised@.3 D:puzzled@.3^.32', { p: WIDE }),
  M('Dot. If I\'ve told you once, I\'ve told you twice. It\'s fine. It\'s just mail. Come here, both of you, come look. LOOK. It\'s opening!',
    'P:happy@.3 M:cheer@.62< H:bloom@.5 D:perch@.3^.32', { cue: 'meeca', i: 0.45, p: { ...WIDE, particles: 'petals' } }),
  P('I\'m looking. I\'m looking.', 'P:happy@.3 M:happy@.62< H:bloom@.5 D:perch@.3^.32', { p: WIDE }),
  M('It\'s never opened for me. Not once. Not since Grandma. Everybody sit down. Sit, sit, I\'ll go get the tea, everybody gets tea, nobody\'s going anywhere—',
    'P:happy@.3 M:talk@.62< H:bloom@.5 D:perch@.3^.32', { p: WIDE }),
  N('The Heartbloom is older than the oldest tree here. While it stays open, the ten realms stay green and the thorns stay asleep.',
    'H:epic@.5^.8*1.4', { w: 4, cue: 'bloom', i: 0.5, sting: 'bloom', p: { ...pan(1.1, 0.2, 0.55, 1.1, 0.8, 0.55, 10), particles: 'petals' } }),
  N('It opens for one keeper at a time. For fifty years that was Meeca\'s grandmother. Now it was Meeca.', 'H:epic@.5^.8*1.4'),
  P('How long are we gonna sit here and watch it?', 'P:talk@.3 M:happy@.62< H:epic@.5 D:perch@.3^.32', { w: 1, cue: 'pokey', i: 0.4, p: WIDE }),
  M('All day, if it takes all day.', 'P:idle@.3 M:talk@.62< H:epic@.5 D:perch@.3^.32', { p: WIDE }),
  P('I\'m happy for you. I really am. But sitting here staring at it isn\'t gonna make it grow any faster.', 'P:talk@.3 M:laugh@.62< H:epic@.5 D:perch@.3^.32', { p: WIDE }),
  M('You once sat and watched a snail win a race.', 'P:happy@.3 M:talk@.62< H:epic@.5 D:perch@.3^.32', { cue: 'tender', i: 0.45, p: WIDE }),
  P('Of course I did. He trained for it.', 'P:talk@.3 M:laugh@.62< H:epic@.5 D:perch@.3^.32', { sting: 'laugh', p: WIDE }),
  D('Well, you can\'t watch a flower all day on an empty stomach. I\'ll go get snacks. Don\'t let it open without me.',
    'P:happy@.3 M:happy@.62< H:epic@.5 D:cheer@.3^.32', { cue: 'comedy', i: 0.4, p: WIDE }),
  N('She was already lifting off the branch when the birds went quiet. Every one of them, all at once.', 'P:worried@.3 M:surprised@.62< H:bloom@.5 D@.42^.3',
    { m: 'dusk', cue: 'dread', i: 0.35, sting: 'darkness', p: { ...WIDE, particles: 'none', fx: [{ at: 0.2, kind: 'flash', dur: 0.25, amount: 0.35 }] } }),
  N('Dot stopped in the air. And way off in the distance, up in the Highlands, thunder.', 'P:worried@.3 M:surprised@.62< H:bloom@.5 D:gasp@.42^.3',
    { i: 0.4, p: { ...WIDE, particles: 'rain', fx: [{ at: 0.4, kind: 'flash', dur: 0.3, amount: 0.3 }] } }),
  P('Did I just hear thunder? You know how I feel about thunder.', 'P:worried@.3 M:surprised@.62< H:bloom@.5 D@.42^.3', { p: WIDE }),
  N('His hands were already on the branch. Both of them.', 'P:duck@.3 M:surprised@.62< H:bloom@.5 D@.42^.3', { cue: 'dread', i: 0.35, p: WIDE }),
  P('It\'s only weather. It\'s only weather.', 'P:duck@.3 M:sad@.62< H:bloom@.5 D@.42^.3', { p: WIDE }),
  N('Meeca looked at his hands. Then, to be kind, she looked at the sky. Dot\'s wing went to the pouch at her side.',
    'P:duck@.3 M:sad@.62< H:bloom@.5 D:sad@.42^.3', { cue: 'dread', i: 0.4, p: WIDE }),
  D('That\'s not weather. Inside. Both of you, inside, right now. Meeca, leave the flower. Pokey, I need you to let go of the branch.',
    'P:duck@.3 M:scared@.62< D:yelp@.46^.3', { m: 'storm', i: 0.5, p: { ...WIDE, particles: 'rain' } }),
  N('The Heartbloom closed up, petal over petal, and its light went out.', 'P:worried@.3 M:scared@.6< H:bud@.5',
    { i: 0.55, p: { particles: 'rain', fx: [{ at: 1.2, kind: 'flash', dur: 0.35 }, { at: 1.2, kind: 'shake', amount: 7, dur: 0.45 }] } }),
  N('Soldiers came, in two straight lines. The one in front was bigger than the rest.', 'P:worried@.2 M:scared@.44< G~@.86<',
    { cue: 'war', i: 0.5, sting: 'blow', p: { fx: [{ at: 0.2, kind: 'flash', dur: 0.3 }, { at: 0.2, kind: 'shake', amount: 7, dur: 0.4 }] } }),
  GEN('That one. She\'s the keeper. Bring her to me.', 'P:worried@.2 M:scared@.44< G~@.86<'),
  M('Excuse me? You\'re standing in my garden. And you\'re blocking my flower.', 'P:worried@.2 M:talk@.46< G~@.86<'),
  GEN('Come, little bloom. You\'re coming with me.', 'P:worried@.2 M:surprised@.46< G~@.8<', { i: 0.4 }),
  M('Who told you that?', 'P:worried@.2 M:surprised@.46< G~@.8<', { cue: 'dread', i: 0.4 }),
  GEN('Grab her. We\'re leaving.', 'P:worried@.2 M:scared@.46< G!@.8<', { cue: 'war', i: 0.6, sting: 'blow' }),
  P('Excuse me, sir? I think there\'s been some kind of misunderstanding here.', 'P:talk@.24 M:scared@.46< G!@.8<'),
  P('Are you feeling okay? You seem a little grumpy.', 'P:talk@.24 M:scared@.46< G!@.8<'),
  GEN('One.', 'P:worried@.24 M:scared@.46< G!@.8<', { i: 0.6 }),
  N('Pokey looked over at Meeca, and he moved faster than he had ever moved in his life.', 'P:urgent@.3 M:scared@.5<',
    { cue: 'chase', i: 0.6, sting: 'blow', p: { zoom: 1.3, fx: [{ at: 0.4, kind: 'shake', amount: 8, dur: 0.5 }] } }),
  GEN('Two.', 'P:urgent@.3 G!@.8<'),
  N('He threw his arms out toward her, reaching for her hand.', 'P:urgent@.3 M:scared@.6<'),
  GEN('Three.', 'P:urgent@.3 G!@.8<'),
  M('Pokey! Pokey, help me! Follow the petals! Follow the petals, Pokey!', 'P:urgent@.2 MW:scaredwave@.88^.7*.5', { p: { particles: 'petals' } }),
  GEN('Him? Save you? He\'s too slow. He was always too slow. He\'ll never make it.', 'P:worried@.24 G!@.8<', { i: 0.6, p: { zoom: 1.2, focusX: 0.55 } }),
  D('Pokey. Pokey, look at me. Look at me. I\'m the fast one. I\'ll follow them. I\'ll see where. And I\'ll come straight back. Straight back, do you hear me? Don\'t you go anywhere without me.',
    'P:worried@.2 D:yelp@.5^.3', { cue: 'chase', i: 0.6, p: WIDE }),
  N('And she was gone.', 'P:sad@.3', { cue: 'sorrow', i: 0.4 }),
]);

const CHASE = chapter({ name: 'THE CHASE', w: 1, m: 'storm', cue: 'chase', i: 0.7, base: { particles: 'rain' } }, [
  N('Pokey ran.', 'P:run@.2', { x: { 0: { move: { dx: 0.4, dur: 3, gait: 'run' } } } }),
  N('The soldiers weren\'t even hurrying, and they pulled away from him anyway.', 'P:run@.2',
    { x: { 0: { move: { dx: 0.55, dur: 5.5, gait: 'run' } } } }),
  N('He tripped over the old root he said good morning to every day, and this time he didn\'t say anything to it.', 'P:run@.3', { x: { 0: { move: { dx: 0.2, dur: 1.3, gait: 'run', then: 'hurt' } } } }),
  N('When he looked up, they were a line along the ridge. Then they were only rain.', 'P:sad@.3', { cue: 'sorrow', i: 0.4 }),
]);

const VOW = chapter({ name: 'THE VOW', w: 1, m: 'storm', cue: 'sorrow', i: 0.3, base: { particles: 'rain' } }, [
  N('He stood there alone in the rain. And for a second, by the closed-up Heartbloom, he could have sworn he saw someone. An old sloth in a gardening apron, looking right at him.',
    'P:sad@.28 H:bud@.52^.8 GR:stand_hands@.76*.9', { cue: 'grandma', i: 0.3, p: { memory: true } }),
  GM('Follow the petals, Pokey.', 'P:surprised@.28 H:bud@.52^.8 GR:point@.76*.9', { cue: 'grandma', i: 0.45, p: { memory: true, particles: 'petals' } }),
  N('He blinked the rain out of his eyes. There was nobody there.', 'P:surprised@.28 H:bud@.52^.8', { cue: 'hush', i: 0.2 }),
  P('Was that Meeca\'s grandma?', 'PF:surprised+worried@.4', { cue: 'hush', i: 0.2 }),
  N('On his wrist, the faded petal Meeca had tied there years ago began to warm, and slowly, all by itself, it turned to the north.',
    'PX:petal_glow@.4', { m: 'dusk', cue: 'bloom', i: 0.5, sting: 'bloom', p: { particles: 'petals', fx: [{ at: 0.8, kind: 'glints', x: 0.45, y: 0.6 }] } }),
  P('Hang on, Meeca. I\'m coming. I\'m slow, but I\'m coming.', 'PF:calm@.4', { cue: 'resolve', i: 0.65, p: pan(1.2, 0.5, 0.65, 1.0, 0.5, 0.5, 6) }),
]);

const EXPEDITION = chapter({ name: 'ACT I · THE TRAIL', w: 4, m: 'dusk', cue: 'journey', i: 0.5, base: { particles: 'sparkles' } }, [
  N('Ten realms lay between Pokey and the Highland Fortress. Each one had a guardian, and every guardian answered to the General.',
    undefined, { p: { lineup: true } }),
]);

export const INTRO_PANELS: StoryPanel[] = [...MORNING, ...CHASE, ...VOW, ...EXPEDITION];
