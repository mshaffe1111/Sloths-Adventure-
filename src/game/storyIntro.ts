/**
 * The opening: a slow morning, and the afternoon it ends. About a thousand words, and the only part of the story where the player has
 * nothing to do but watch, so it has to make them like these three before it takes one away.
 * Shape: warm (the morning) -> funny (Dot is early, for Pokey) -> frightening (the General) -> quiet (nothing comes) -> resolve (the petal).
 * What the prologue plants, for later: Dot's lateness (and his hand going to the pouch), "You said morning. It's still morning",
 * "Please wipe your feet", "Then bring a blanket", the snail that trained, the General counting aloud and "Eat something". The saying is NOT said here: Grandma's garden (World 4) is where it comes from.
 */
import { chapter, D, GEN, GM, M, N, P, pan } from './storyDsl.ts';
import type { StoryPanel } from './story.ts';

/** a wider camera for the pictures with Dot on Pokey's head: the automatic close-up on whoever speaks crops him off the top */
const WIDE = { zoom: 1.2, focusX: 0.45, focusY: 0.5 };

const MORNING = chapter({ name: 'PROLOGUE · THE SLOWEST MORNING', w: 1, m: 'day', cue: 'pokey', i: 0.3, base: { particles: 'sparkles' } }, [
  N('Morning came down through the canopy one branch at a time. Pokey\'s branch was usually last.',
    'PF:calm_closed@.34 H:bloom@.76^.82', { p: pan(1.05, 0.5, 0.3, 1.3, 0.5, 0.62, 7) }),
  P('Eleven minutes awake. I think I\'m peaking.', 'PF:calm_closed+calm+surprised@.34 H:bloom@.76^.82'),
  N('Somewhere below, a woodpecker started on a tree.', 'P:idle@.3 H:bloom@.7^.82', { p: { zoom: 1.2, focusX: 0.5 } }),
  D('Post! POST! I have post! Two letters and a leaf, and I meant to be here at DAWN, but there was a headwind on the river and then ANOTHER headwind, a different one, I don\'t know where it came from, and I\'m hours late!',
    'P:surprised@.3 D:yelp@.36^.3', { cue: 'comedy', i: 0.4, sting: 'laugh', p: WIDE }),
  P('You\'re early.', 'P:happy@.3 D:perch@.3^.32', { p: WIDE }),
  D('I am not early, I am HOURS— what?', 'P:happy@.3 D:puzzled@.3^.32', { p: WIDE }),
  P('You said morning. It\'s still morning.', 'P:talk@.3 D:perch@.3^.32', { p: WIDE }),
  D('I\'m going to be thinking about that until Thursday.', 'P:happy@.3 D:puzzled@.3^.32', { sting: 'laugh', p: WIDE }),
  M('Dot! Sit, sit. I kept your tea. It\'s gone cold, but it\'s still tea.', 'P:happy@.3 M:happy@.7< D:perch@.3^.32', { cue: 'journey', i: 0.4, p: WIDE }),
  D('Hours late! I could have been DAYS! I HAVE been days!', 'P:happy@.3 M:happy@.7< D:cheer@.3^.32', { p: WIDE }),
  M('Thank you for coming. Two letters and a very nice leaf.', 'P:idle@.3 M:talk@.7< D:perch@.3^.32', { p: WIDE }),
  D('It\'s a good leaf.', 'P:happy@.3 M:laugh@.7< D:perch@.3^.32', { sting: 'laugh', p: WIDE }),
  M('Pokey, look. It\'s starting to open. It\'s never done that for me.',
    'P:idle@.3 M:happy@.62< H:bloom@.5 D:perch@.3^.32', { p: { ...WIDE, particles: 'petals' } }),
  P('Then the forest must be very happy. Or you\'ve been singing to it again.', 'P:happy@.3 M:happy@.62< H:bloom@.5 D:perch@.3^.32', { p: WIDE }),
  M('Both. Mostly the second.', 'P:happy@.3 M:laugh@.62< H:bloom@.5 D:perch@.3^.32', { sting: 'laugh', p: WIDE }),
  N('The Heartbloom is older than the oldest tree here. While it stays open, the ten realms stay green and the thorns stay asleep.',
    'H:epic@.5^.8*1.4', { w: 4, cue: 'bloom', i: 0.5, sting: 'bloom', p: { ...pan(1.1, 0.2, 0.55, 1.1, 0.8, 0.55, 10), particles: 'petals' } }),
  N('It opens for one keeper at a time. For fifty years that was Meeca\'s grandmother. Now it was Meeca.',
    'H:epic@.5^.8*1.4'),
  M('♪ Slow the rain, slow the thunder. Slow the thorn that holds you under. ♪', 'P:happy@.28 M:sing@.62< H:bloom@.5', { w: 1, cue: 'meeca', i: 0.5, p: { zoom: 1.5, focusX: 0.5, particles: 'petals' } }),
  N('Petals lifted off the bloom and rose through the light. Pokey had seen it a hundred times. He stopped chewing.',
    'P:happy@.28 M:sing@.62< H:epic@.5'),
  P('I could watch this all day.', 'P:happy@.3 M:happy@.62< H:epic@.5 D:perch@.3^.32', { cue: 'tender', i: 0.5, p: WIDE }),
  M('You could watch anything all day. You once watched a snail win a race.', 'P:happy@.3 M:talk@.62< H:epic@.5 D:perch@.3^.32', { p: WIDE }),
  P('He trained.', 'P:talk@.3 M:laugh@.62< H:epic@.5 D:perch@.3^.32', { sting: 'laugh', p: WIDE }),
  M('Then stay with me and watch it open. All the way.', 'P:happy@.3 M:happy@.62< H:epic@.5 D:perch@.3^.32', { p: WIDE }),
  P('That takes until Tuesday.', 'P:talk@.3 M:happy@.62< H:epic@.5 D:perch@.3^.32', { p: WIDE }),
  M('Then bring a blanket.', 'P:happy@.3 M:happy@.62< H:epic@.5 D:perch@.3^.32', { cue: 'tender', i: 0.6, p: WIDE }),
  D('I\'ll bring snacks! I\'ll be EARLY!', 'P:happy@.3 M:happy@.62< H:epic@.5 D:cheer@.3^.32', { p: WIDE }),
  N('Then the birds stopped. All of them, at once.', 'P:worried@.3 M:surprised@.62< H:bloom@.5 D:perch@.3^.32',
    { m: 'dusk', cue: 'dread', i: 0.35, sting: 'darkness', p: { ...WIDE, particles: 'none', fx: [{ at: 0.2, kind: 'flash', dur: 0.25, amount: 0.35 }] } }),
  N('Thunder, a long way off, somewhere up in the Highlands.', 'P:worried@.3 M:surprised@.62< H:bloom@.5 D:perch@.3^.32',
    { i: 0.4, p: { ...WIDE, particles: 'rain', fx: [{ at: 0.4, kind: 'flash', dur: 0.3, amount: 0.3 }] } }),
  P('It\'s only weather.', 'P:worried@.3 M:surprised@.6< H:bloom@.5 D:perch@.3^.32', { p: WIDE }),
  N('He had taken hold of the branch with both hands. Meeca looked at his hands. Then, to be kind, she looked at the sky.',
    'P:worried@.3 M:sad@.6< H:bloom@.5 D:perch@.3^.32', { cue: 'dread', i: 0.4, p: WIDE }),
  N('Dot had stopped talking. His wing went to the pouch at his hip.', 'D:gasp@.5^.5*1.7',
    { m: 'storm', cue: 'dread', i: 0.45, p: { zoom: 1.6, focusX: 0.5, focusY: 0.5 } }),
  D('ALERT. Storm from the Highlands. Soldiers, armor, boots, so many boots. Coming here. Get INSIDE!', 'P:worried@.3 M:surprised@.62< D:yelp@.46^.3',
    { i: 0.5, p: { ...WIDE, particles: 'rain' } }),
  N('The Heartbloom closed up, petal over petal, and its light went out.', 'P:worried@.3 M:scared@.6< H:bud@.5',
    { i: 0.55, p: { particles: 'rain', fx: [{ at: 1.2, kind: 'flash', dur: 0.35 }, { at: 1.2, kind: 'shake', amount: 7, dur: 0.45 }] } }),
  GEN('Seize the keeper of the Heartbloom.', 'P:worried@.2 M:scared@.44< G~@.86<',
    { cue: 'war', i: 0.5, sting: 'blow', p: { fx: [{ at: 0.2, kind: 'flash', dur: 0.3 }, { at: 0.2, kind: 'shake', amount: 7, dur: 0.4 }] } }),
  M('Whoever you are, you\'re standing in my garden. Please wipe your feet.', 'P:worried@.2 M:talk@.46< G~@.86<'),
  GEN('Come, little bloom. You are not safe here.', 'P:worried@.2 M:surprised@.46< G~@.8<', { i: 0.4 }),
  M('Nobody calls me that. Not since Grandma.', 'P:worried@.2 M:surprised@.46< G~@.8<', { cue: 'dread', i: 0.4 }),
  GEN('Take her.', 'P:worried@.2 M:scared@.46< G!@.8<', { cue: 'war', i: 0.6, sting: 'blow' }),
  P('Excuse me, sir? I think there\'s been a mis—', 'P:talk@.24 M:scared@.46< G!@.8<'),
  GEN('One.', 'P:worried@.24 M:scared@.46< G!@.8<', { i: 0.6 }),
  N('Pokey reached for her hand. It was the fastest he had ever reached for anything.', 'P:urgent@.3 M:scared@.5<',
    { cue: 'chase', i: 0.6, sting: 'blow', p: { zoom: 1.3, fx: [{ at: 0.4, kind: 'shake', amount: 8, dur: 0.5 }] } }),
  GEN('Two.', 'P:urgent@.3 G!@.8<'),
  N('His fingers closed on air.', 'P:urgent@.3'),
  GEN('Three.', 'P:urgent@.3 G!@.8<'),
  M('Follow the petals, Pokey! And eat something!', 'P:urgent@.2 MW:scaredwave@.88^.7*.5', { p: { particles: 'petals' } }),
  GEN('You.', 'P:worried@.24 G!@.8<', { i: 0.6, p: { zoom: 1.2, focusX: 0.55 } }),
  GEN('Still slow.', 'P:worried@.24 G!@.8<', { p: { zoom: 1.2, focusX: 0.55 } }),
  D('I\'ll follow them! I\'ll find out where! I\'ll be right BACK!', 'P:worried@.2 D:yelp@.5^.3', { cue: 'chase', i: 0.6, p: WIDE }),
]);

const CHASE = chapter({ name: 'THE CHASE', w: 1, m: 'storm', cue: 'chase', i: 0.7, base: { particles: 'rain' } }, [
  N('Pokey ran.', 'P:run@.2', { x: { 0: { move: { dx: 0.4, dur: 3, gait: 'run' } } } }),
  N('The column wasn\'t even hurrying, and it pulled away from him anyway.', 'P:run@.2',
    { x: { 0: { move: { dx: 0.55, dur: 5.5, gait: 'run' } } } }),
  N('He tripped on the old root. For once he didn\'t say good morning to it.', 'P:run@.3', { x: { 0: { move: { dx: 0.2, dur: 1.3, gait: 'run', then: 'hurt' } } } }),
  N('When he looked up, the column was a line along the ridge. Then it was only the rain.', 'P:sad@.3', { cue: 'sorrow', i: 0.4 }),
  N('He opened his mouth to say something dry. Nothing came.', 'PF:worried+tired@.4', { cue: 'sorrow', i: 0.5 }),
]);

const VOW = chapter({ name: 'THE VOW', w: 1, m: 'dusk', cue: 'sorrow', i: 0.4, base: { particles: 'petals' } }, [
  N('On his wrist, the faded petal Meeca had tied there years ago woke up in the rain. It warmed, and it turned by itself to the north.',
    'PF:surprised@.4', { cue: 'bloom', i: 0.5, sting: 'bloom', p: { fx: [{ at: 0.8, kind: 'glints', x: 0.5, y: 0.8 }] } }),
  P('Still.', 'PF:worried@.4', { cue: 'dread', i: 0.3 }),
  GM('Tie the flap on your satchel, dear. You\'ll lose the leaves.', 'GR:water@.5', { cue: 'grandma', i: 0.4, p: { memory: true, particles: 'sparkles' } }),
  P('All right, Grandma.', 'PF:calm@.4', { cue: 'resolve', i: 0.4 }),
  N('He tied the flap. Meeca had said to eat something, so he ate a leaf.', 'PF:calm@.4', { cue: 'resolve', i: 0.5 }),
  P('Hang on, Meeca. I\'ll be a while.', 'PF:calm@.4', { cue: 'resolve', i: 0.65, p: pan(1.2, 0.5, 0.65, 1.0, 0.5, 0.5, 6) }),
]);

const EXPEDITION = chapter({ name: 'ACT I · THE TRAIL', w: 4, m: 'dusk', cue: 'journey', i: 0.5, base: { particles: 'sparkles' } }, [
  N('Ten realms lay between Pokey and the Highland Fortress. Each one had a guardian, and every guardian answered to the General.',
    undefined, { p: { lineup: true } }),
]);

export const INTRO_PANELS: StoryPanel[] = [...MORNING, ...CHASE, ...VOW, ...EXPEDITION];
