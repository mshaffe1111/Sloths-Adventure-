/**
 * The opening: a slow morning, the best one of Pokey's life, and the afternoon it ends. About four minutes, and the only part of the
 * story where the player has nothing to do but feel: it has to make them love these two before it takes one away.
 * Shape: warm (the morning) -> funny (Dot is late) -> terrifying (the General) -> heartbreak (too slow) -> resolve (the petal).
 */
import { chapter, D, GEN, GM, M, N, P, pan } from './storyDsl.ts';
import type { StoryPanel } from './story.ts';

const MORNING = chapter({ name: 'PROLOGUE · THE SLOWEST MORNING', w: 1, m: 'day', cue: 'pokey', i: 0.3, base: { particles: 'sparkles' } }, [
  N('High above the forest floor, morning arrived one leaf at a time. The light came down through the branches warm and green, and the whole canopy smelled of wet bark and ripe figs.',
    'PF:calm_closed@.34 H:bloom@.76^.82', { p: pan(1.05, 0.5, 0.3, 1.3, 0.5, 0.62, 7) }),
  N('Pokey, short for Pocono, had been awake for eleven minutes. It was a record, and he lay perfectly still while he got used to it.',
    'PF:calm_closed+calm+surprised@.34 H:bloom@.76^.82'),
  P('Eleven minutes. I\'m going to lie down and think about it.', 'PF:surprised+happy@.34 H:bloom@.76^.82'),
  N('A woodpecker was already at work somewhere below. Pokey wished it well.',
    'P:idle@.3 H:bloom@.7^.82', { p: { zoom: 1.2, focusX: 0.5 } }),
  M('Pokey! Pokey, look!', 'P:surprised@.3 M:happy@.8<', { cue: 'journey', i: 0.4 }),
  M('The Heartbloom opened in the night, Pokey, all the way. It hasn\'t done that since Grandma, and she used to say it only blooms when the whole forest is happy.',
    'P:idle@.3 M:happy@.62< H:bloom@.5', { p: { particles: 'petals' } }),
  P('Then the forest must be happy. Or you sang to it again.', 'P:happy@.3 M:happy@.62< H:bloom@.5'),
  M('Both. Mostly the second.', 'P:happy@.3 M:laugh@.62< H:bloom@.5', { sting: 'laugh' }),
  N('The Heartbloom is older than the oldest tree in the canopy. While it glows, the rivers of all ten realms run gentle and the thorns stay asleep.',
    'H:epic@.5^.8*1.4', { w: 4, cue: 'bloom', i: 0.5, sting: 'bloom', p: { ...pan(1.1, 0.2, 0.55, 1.1, 0.8, 0.55, 10), particles: 'petals' } }),
  N('It blooms for one keeper at a time. For fifty years that was Meeca\'s grandmother, and now it was Meeca, whose only gift was that she paid attention.',
    'H:epic@.5^.8*1.4'),
  M('♪ Slow the rain... slow the thunder... ♪', 'P:happy@.28 M:sing@.62< H:bloom@.5', { w: 1, cue: 'meeca', i: 0.5, p: { zoom: 1.5, focusX: 0.5, particles: 'petals' } }),
  N('Petals lifted off the bloom and drifted up through the light. Pokey had seen it a hundred times, and he still forgot to breathe.',
    'P:happy@.28 M:sing@.62< H:epic@.5'),
  P('I could watch this all day.', 'P:happy@.3 M:happy@.62< H:epic@.5', { cue: 'tender', i: 0.5 }),
  M('You could watch anything all day. You once watched a snail win a race.', 'P:happy@.3 M:talk@.62< H:epic@.5'),
  P('He deserved it. He trained.', 'P:talk@.3 M:laugh@.62< H:epic@.5', { sting: 'laugh' }),
  M('Stay and watch it open, then. Even if it takes until dinner.', 'P:happy@.3 M:happy@.62< H:epic@.5'),
  P('Meeca. It takes until next Tuesday.', 'P:talk@.3 M:happy@.62< H:epic@.5'),
  M('Then bring a blanket.', 'P:happy@.3 M:happy@.62< H:epic@.5', { cue: 'tender', i: 0.6 }),
  N('It was the best morning Pokey could remember. By sloth reckoning, it lasted almost the whole morning.',
    'P:happy@.34 M:happy@.62< H:epic@.5', { p: pan(1.3, 0.5, 0.6, 1.0, 0.5, 0.5, 6) }),
  N('Then the birds stopped singing. All of them. All at once.', 'P:worried@.3 M:surprised@.62< H:bloom@.5',
    { m: 'dusk', cue: 'dread', i: 0.35, sting: 'darkness', p: { particles: 'none', fx: [{ at: 0.2, kind: 'flash', dur: 0.25, amount: 0.35 }] } }),
  D('ALERT! Storm coming from the Highlands! Soldiers, armor, a great many boots, all heading directly for—', 'P:worried@.3 M:surprised@.58< D:yelp@.84^.34', { m: 'storm', i: 0.45, p: { particles: 'rain' } }),
  D('—this exact spot. I am, uh, slightly late.', 'P:worried@.3 M:surprised@.58< D@.84^.34', { sting: 'laugh' }),
  N('The sky went the color of old iron. Thunder rolled down from the Highlands, and the Heartbloom folded its petals shut like a hand.',
    'P:worried@.3 M:scared@.6< H:bud@.5', { i: 0.55, p: { particles: 'rain', fx: [{ at: 1.2, kind: 'flash', dur: 0.35 }, { at: 1.2, kind: 'shake', amount: 7, dur: 0.45 }] } }),
  GEN('Seize the keeper of the Heartbloom.', 'P:worried@.2 M:scared@.44< G~@.86<', { cue: 'war', i: 0.5, sting: 'blow', p: { fx: [{ at: 0.2, kind: 'flash', dur: 0.3 }, { at: 0.2, kind: 'shake', amount: 7, dur: 0.4 }] } }),
  M('Whoever you are, you\'re standing in my garden. Please wipe your feet.', 'P:worried@.2 M:talk@.46< G~@.86<'),
  GEN('Come, little bloom. You are not safe here.', 'P:worried@.2 M:surprised@.46< G~@.8<', { i: 0.4 }),
  M('Nobody calls me that. Not since Grandma.', 'P:worried@.2 M:surprised@.46< G~@.8<', { cue: 'dread', i: 0.4 }),
  GEN('Take her.', 'P:worried@.2 M:scared@.46< G!@.8<', { cue: 'war', i: 0.6, sting: 'blow' }),
  P('Excuse me, sir? I think there\'s been a misunderstanding. Meeca is—', 'P:talk@.24 M:scared@.46< G!@.8<'),
  GEN('You.', 'P:worried@.24 M:scared@.46< G!@.8<', { i: 0.6 }),
  GEN('The slow one. Still slow.', 'P:worried@.24 M:scared@.46< G!@.8<'),
  N('Pokey reached for her hand, faster than he had ever reached for anything in his life. His fingers closed on the air where she had been.',
    'P:urgent@.3', { cue: 'chase', i: 0.6, sting: 'blow', p: { zoom: 1.3, fx: [{ at: 0.4, kind: 'shake', amount: 8, dur: 0.5 }] } }),
  M('Pokey! Follow the petals! I\'ll leave you a trail, I promise!', 'P:urgent@.2 MW:scaredwave@.88^.7*.5', { p: { particles: 'petals' } }),
]);

const CHASE = chapter({ name: 'THE CHASE', w: 1, m: 'storm', cue: 'chase', i: 0.7, base: { particles: 'rain' } }, [
  N('Pokey ran.', 'P:run@.2', { x: { 0: { move: { dx: 0.4, dur: 3, gait: 'run' } } } }),
  N('By sloth standards it was a gallop. To everyone else it looked like a determined lean.', 'P:run@.2', { x: { 0: { move: { dx: 0.55, dur: 5.5, gait: 'run' } } } }),
  N('He tripped on the old root. For once he didn\'t say good morning to it.', 'P:run@.3', { x: { 0: { move: { dx: 0.2, dur: 1.3, gait: 'run', then: 'hurt' } } } }),
  N('When he looked up, the soldiers were a dark line on the ridge. Then the lightning flashed, and there was only the ridge.',
    'P:sad@.3', { cue: 'sorrow', i: 0.4 }),
  P('I was too slow.', 'PF:worried@.4', { cue: 'sorrow', i: 0.5 }),
  N('He said it quietly, to the mud.', 'PF:worried+tired@.4'),
]);

const VOW = chapter({ name: 'THE VOW', w: 1, m: 'dusk', cue: 'sorrow', i: 0.4, base: { particles: 'petals' } }, [
  N('On his wrist, the faded petal Meeca had tied there years ago stirred in the rain. It warmed against his skin and began to glow, and slowly, like a compass needle making up its mind, it turned to point north.',
    'PF:surprised@.4', { cue: 'bloom', i: 0.5, sting: 'bloom', p: { fx: [{ at: 0.8, kind: 'glints', x: 0.5, y: 0.8 }] } }),
  P('"Still slow." Still. How does a warlord know what I was before?', 'PF:worried@.4', { cue: 'dread', i: 0.3 }),
  GM('Slow is not stopped, dear.', '', { cue: 'grandma', i: 0.4, ph: ['s3_02', 'Grandma', 0.46, -0.02], p: { memory: true } }),
  P('All right, Grandma.', 'PF:calm@.4', { cue: 'resolve', i: 0.4 }),
  N('He retied the petal, tight, and faced north.', 'PF:calm@.4', { cue: 'resolve', i: 0.5 }),
  P('Hang on, Meeca. I\'ll be a while.', 'PF:calm@.4', { cue: 'resolve', i: 0.65, p: pan(1.2, 0.5, 0.65, 1.0, 0.5, 0.5, 6) }),
]);

const EXPEDITION = chapter({ name: 'ACT I · THE TRAIL', w: 4, m: 'dusk', cue: 'journey', i: 0.5, base: { particles: 'sparkles' } }, [
  N('Ten realms lay between Pokey and the Highland Fortress, each held by one of the General\'s guardians. One hundred trials in all, and one sloth to face them.',
    undefined, { p: { lineup: true } }),
  N('And one hummingbird, who was already running late.', 'D@.5^.4', { sting: 'laugh', p: { zoom: 1.3 } }),
]);

export const INTRO_PANELS: StoryPanel[] = [...MORNING, ...CHASE, ...VOW, ...EXPEDITION];
