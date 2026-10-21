/**
 * The scenes that play once, right after a guardian falls (and the dream in World 8): the old days Pokey remembers, and the turns of the
 * plot that need a quiet moment of their own. Warm faded flashbacks have `memory: true`; the present-day scenes do not.
 *   2  The Waiting            how they met                                       (flashback)
 *   3  The Horn               the end of Act I: the General reaches out          (cliffhanger)
 *   4  Grandma's Garden       where "slow is not stopped" comes from            (flashback)
 *   5  Tea with the Queen     the middle of the story: what the Pact really is   (turn)
 *   6  The Sealed Note        the lowest point, and Meeca's lullaby              (scene) -> The Singing Storm (flashback)
 *   7  The Photograph         who the General is                                 (reveal)
 *   8  The Promise            the petal                                          (dream, inside the world card) / The Lieutenant (scene)
 *   9  The Blessing           what Pokey was asked, years ago                    (flashback) -> The Open Gates (cliffhanger)
 */
import { chapter, D, GEN, GM, M, N, OFF, P, pan, say } from './storyDsl.ts';
import type { StoryPanel } from './story.ts';

/** a little Pokey and a little Meeca: the same painted pair, drawn smaller */
const kp = (mood: string, x = 0.36) => `P:${mood}@${x}*.78`;
const km = (mood: string, x = 0.66) => `M:${mood}@${x}*.78`;

export const LULLABY = '♪ Slow the rain, slow the thunder. Slow the thorn that holds you under. Slow the heart that runs too fast. Slow, and let the morning last. ♪';

const PROWLER = say('Shadow Prowler');
const QUEEN = say('Tarantula Queen');
/** Meeca's grandfather, before he was the General */
const GF = say('Grandfather');

const GRANDMA_PHOTO: [string, string, number, number] = ['s3_02', 'Grandma', 0.46, -0.02];

// ═════════════════════════════════ World 2 · the day they met ═════════════════════════════════

export const WAITING = chapter({ name: 'MEMORY · THE WAITING', w: 1, m: 'day', cue: 'tender', i: 0.4, base: { memory: true, particles: 'sparkles' } }, [
  N('Pokey remembered the day they met. He had been crossing one single vine for two days.', kp('walk', 0.22), { cue: 'pokey', x: { 0: { move: { dx: 0.4, dur: 8, gait: 'walk' } } } }),
  N('A family of squirrels had moved in below him, raised their young, and put up a small sign. The sign said THE SLOTH.', kp('walk', 0.3), { sting: 'laugh', x: { 0: { move: { dx: 0.3, dur: 8, gait: 'walk' } } } }),
  M('You\'ve been on this vine for two days. Is it a good vine?', `${kp('idle')} ${km('happy')}`, { cue: 'meeca', i: 0.4 }),
  P('It\'s a very good vine. I\'m nearly halfway.', `${kp('happy')} ${km('happy')}`),
  M('Halfway to what?', `${kp('idle')} ${km('talk')}`),
  P('The other side.', `${kp('talk')} ${km('talk')}`),
  M('And what\'s on the other side?', '='),
  P('...I have lost track. But it\'s a very good vine.', `${kp('think')} ${km('laugh')}`, { sting: 'laugh' }),
  N('Every other cub who had come by had said the same two things. "Hurry up," or "Can you move?" She sat down on the branch beside him and unwrapped her breakfast.',
    `${kp('idle')} ${km('happy')}`, { cue: 'tender', i: 0.4 }),
  M('Then I\'ll wait. I brought breakfast. The view is better when you go slowly.', `${kp('surprised')} ${km('cheer')}`, { cue: 'meeca', i: 0.5 }),
  P('Are you not bored?', `${kp('talk')} ${km('happy')}`),
  M('Nobody has ever let me look at anything this long.', `${kp('happy')} ${km('think')}`),
  N('She waited six hours. They counted the clouds, and when he got to the end of the vine, she was still there. She had saved him the last of the mango.',
    `${kp('happy', 0.42)} ${km('happy', 0.58)}`, { cue: 'pokey', i: 0.5, p: { particles: 'petals' } }),
]);

// ═════════════════════════════════ World 3 · the end of Act I ═════════════════════════════════

export const HORN = chapter({ name: 'WORLD 3 · THE HORN', w: 3, m: 'glow', cue: 'tender', i: 0.3, base: { particles: 'sparkles' } }, [
  N('The Grotto let them go the way a good dream does: slowly, and with the light coming up.', 'P:tired@.3 D@.6^.4', { p: pan(1.1, 0.3, 0.55, 1.2, 0.5, 0.5, 8) }),
  D('We did it! Well, you did it. I contributed volume.', 'P:tired@.3 D@.6^.4', { cue: 'comedy', i: 0.4 }),
  P('You were very loud. I mean that kindly.', 'P:happy@.3 D@.6^.4'),
  N('Far to the north, over the last of the trees, a dark point stood on the horizon, sharp as a splinter. It was the Highland Fortress. It did not look any closer than it had that morning. It did not look any friendlier either.',
    'P:idle@.26 D@.52^.4', { cue: 'journey', i: 0.35, p: pan(1.05, 0.3, 0.55, 1.35, 0.78, 0.45, 9) }),
  P('That\'s where she is.', 'P:determined@.26 D@.52^.4 B3#@.82<', { cue: 'resolve', i: 0.35 }),
  D('That\'s where she is, and also where the weather lives.', '='),
  PROWLER('North. Past the falls. Follow the wind, not the path.', 'P:idle@.26 D@.52^.4 B3#@.82<'),
  PROWLER('And, sloth... when the horn sounds, do not stand near me.', '=', { cue: 'dread', i: 0.3 }),
  P('What horn?', 'P:worried@.26 D@.52^.4 B3#@.82<'),
  N('A single note rolled down out of the north. It was very long, and very low, and it was made of iron.', '=', { m: 'storm', cue: 'war', i: 0.45, sting: 'darkness', p: { particles: 'none', fx: [{ at: 0.3, kind: 'shake', amount: 5, dur: 0.8 }] } }),
  D('Oh. Oh, no. That isn\'t a hello horn.', 'P:worried@.26 D@.52^.4 B3!@.82<', { i: 0.5 }),
  N('The collar on the Prowler\'s neck began to glow the color of a coal. Pokey saw his eyes go flat, as if someone far away had put a hand over them.', 'P:worried@.26 D@.52^.4 B3!@.82<', { p: { zoom: 1.5, focusX: 0.8 } }),
  PROWLER('Run. Run, little one. I cannot...', 'P:urgent@.26 D@.52^.4 B3!@.82<', { i: 0.6 }),
  GEN('You wait well, sloth. Let us see how you fall.', 'P:urgent@.26 D@.52^.4 B3!@.82<', { cue: 'war', i: 0.7, sting: 'blow' }),
  N('The Prowler\'s claws came down on the ledge. He fought them every inch of the way. He was not strong enough.', 'P:urgent@.26 D@.52^.4 B3!@.82<', { cue: 'chase', i: 0.8, p: { fx: [{ at: 0.9, kind: 'shake', amount: 10, dur: 0.8 }, { at: 1.3, kind: 'dust', x: 0.5, y: 0.7 }] } }),
  PROWLER('I am sorry. I am so sorry.', '=', { i: 0.7 }),
  N('The ledge broke like a plate. Dot screamed Pokey\'s name all the way down, and the mist closed over him, and the sound went with it.', 'D@.5^.4', { cue: 'hush', sting: 'cliffhanger', p: { particles: 'none', fx: [{ at: 0.1, kind: 'flash', dur: 0.5 }] } }),
]);

// ═════════════════════════════════ World 4 · where the saying comes from ═════════════════════════════════

export const GARDEN = chapter({ name: 'MEMORY · GRANDMA\'S GARDEN', w: 5, m: 'glow', cue: 'tender', i: 0.4, base: { memory: true, particles: 'sparkles' } }, [
  N('The Heartbloom garden, years ago. Grandma was teaching Meeca how to keep it.', `${km('think', 0.62)} H:bud@.42^.8*1.2`, { cue: 'grandma' }),
  GM('It is not magic, my dear. It only grows where somebody takes care of it.', '', { ph: GRANDMA_PHOTO }),
  M('But how do I know it\'s happy?', `${km('think', 0.62)} H:bud@.42^.8*1.2`),
  GM('You sit with it. You do not fix it. You do not hurry it. You just keep it company, and one day it opens, and you were there.', '', { ph: GRANDMA_PHOTO }),
  N('Young, clumsy Pokey watered the wrong plant. Somebody else was always close by, quietly setting things right.', '', { ph: ['s4_07', 'Somebody was always nearby', 0.5, 0.02] }),
  P('I think I watered the fern.', `${kp('worried', 0.34)} ${km('laugh', 0.62)} H:bud@.48^.8`),
  M('You watered the fern, the snail and my sandal.', `${kp('worried', 0.34)} ${km('laugh', 0.62)} H:bud@.48^.8`, { sting: 'laugh' }),
  GM('Thank you for watering it anyway, Pokey. Nobody ever waters the fern. And remember, dear: slow is not stopped.', '', { ph: GRANDMA_PHOTO, cue: 'grandma', i: 0.5 }),
  P('Slow isn\'t stopped.', `${kp('happy', 0.34)} ${km('happy', 0.62)} H:bloom@.48^.8`, { cue: 'pokey', i: 0.5 }),
  N('He has said it a hundred times since. He had no idea, then, that he would need every one of them.', `${kp('happy', 0.34)} ${km('happy', 0.62)} H:bloom@.48^.8`, { cue: 'tender', i: 0.5, p: { particles: 'petals' } }),
]);

// ═════════════════════════════════ World 5 · the middle of the story ═════════════════════════════════

export const TEA = chapter({ name: 'WORLD 5 · TEA WITH THE QUEEN', w: 5, m: 'dusk', cue: 'tender', i: 0.3, base: { particles: 'petals' } }, [
  N('The Tarantula Queen did not bow. She laid out three cups, a plate of very small cakes, and a napkin that was clearly not a napkin.', 'P:idle@.26 D@.46^.4 B5#@.74<', { cue: 'comedy', i: 0.35 }),
  QUEEN('Sit, dear. I know you are in a hurry. Sit anyway. I have not poured for anyone in nine years, and I would like to remember how it is done.', 'P:idle@.26 D@.46^.4 B5#@.74<'),
  D('Pokey, it\'s a trap.', 'P:worried@.26 D@.46^.4 B5#@.74<'),
  P('It\'s a tea.', 'P:talk@.26 D@.46^.4 B5#@.74<'),
  D('It\'s a trap with biscuits. I won\'t be drinking anything. I\'m forty percent sugar already.', '=', { sting: 'laugh' }),
  N('It took Pokey forty minutes to finish one cup. The Queen did not mind in the least. She had never, in her whole life, been allowed to finish a cup of tea in company.', 'P:happy@.26 D@.46^.4 B5#@.74<', { cue: 'tender', i: 0.4 }),
  QUEEN('You will forgive an old queen for asking. It is a very long road, and the Highlands are cold. Why do you keep going?', 'P:idle@.26 D@.46^.4 B5#@.74<'),
  P('Because she waited for me once.', 'PF:happy@.4', { cue: 'meeca', i: 0.4 }),
  QUEEN('Ah.', 'P:idle@.26 D@.46^.4 B5#@.74<', { cue: 'sorrow', i: 0.3 }),
  QUEEN('He sat in that chair, you know. Third on the left. Before the Pact. He took too much honey and not enough company. We were a council, in the old days. We argued about everything. It was glorious.', '='),
  P('Who did?', 'P:surprised@.26 D@.46^.4 B5#@.74<'),
  QUEEN('There was a winter, dear. The winter his wife died. He came to each of us at night with a bargain. "No more waiting. No more late. Let me make this forest fast enough to save anyone."', '=', { cue: 'reveal', i: 0.4, sting: 'reveal' }),
  QUEEN('We said yes. He was weeping. That is all the Pact is, dear. A promise made by someone who could not stop crying, and kept by friends who could not say no.', '='),
  P('His wife.', 'PF:worried@.4', { cue: 'sorrow', i: 0.4 }),
  P('...No. It\'s a coincidence. It has to be a coincidence.', 'PF:worried+tired@.4', { cue: 'hush', i: 0.25 }),
  QUEEN('Everyone has someone, dear. His is gone. The help came late. I still dust his chair.', 'P:idle@.26 D@.46^.4 B5#@.74<', { cue: 'sorrow', i: 0.35 }),
  N('Dot had been very quiet. His claw rested on the little pouch at his side, and he did not look up.', 'P:idle@.26 D@.46^.45 B5#@.74<', { cue: 'sorrow', i: 0.35, p: { zoom: 1.6, focusX: 0.46 } }),
  QUEEN('Leave one of those petals on my chair when you go. I would like to have something that grows.', 'P:happy@.26 D@.46^.4 B5#@.74<', { cue: 'tender', i: 0.4 }),
  N('When Pokey stood to leave, her cup was still full.', 'P:happy@.3 B5#@.74<', { cue: 'tender', i: 0.45, p: pan(1.25, 0.5, 0.55, 1.5, 0.74, 0.55, 8) }),
]);

// ═════════════════════════════════ World 6 · the lowest point ═════════════════════════════════

export const SEALED = chapter({ name: 'WORLD 6 · THE SEALED NOTE', w: 6, m: 'dusk', cue: 'sorrow', i: 0.2, base: { particles: 'none' } }, [
  N('The Reaver\'s blackwater was behind him. So was everything else.', 'P:tired@.5', { p: pan(1.1, 0.5, 0.45, 1.35, 0.5, 0.6, 9) }),
  N('He had been walking for weeks. Somewhere along the way the road behind him had grown longer than the road ahead, and what was ahead had a fortress at the end of it. With an army.', 'P:tired@.5'),
  N('A snail overtook him on the left. Pokey tipped his head to it. It did not tip back. It had a schedule.', 'P:tired@.5', { sting: 'laugh' }),
  P('She\'s in a tower, and the General has ten guardians and an iron net. And I\'m a sloth who\'s tired.', 'PF:tired@.4', { i: 0.25 }),
  N('The petal on his wrist kept pointing north. He turned his wrist over so he wouldn\'t have to watch.', 'PF:worried+tired@.4', { cue: 'hush', i: 0.2 }),
  N('So he stopped. For a sloth, stopping is not unusual. But Pokey knew the difference between resting and stopping. He sat on a root in the dusk, and for the first time on the whole journey, he did not take another step.', 'P:sad@.5', { sting: 'heartbreak', p: { zoom: 1.3, focusY: 0.6 } }),
  N('That was when the satchel moved. Not much. Like something that had been waiting very patiently to be needed.', 'P:sad@.5', { cue: 'meeca', i: 0.25 }),
  M('Pokey. If you\'re reading this, you\'ve stopped. Good. Take the satchel off first. It rubs your shoulder, and you never say.', 'P:sad@.4 M:sad@.64', { w: 6, p: { memory: true, particles: 'petals' }, cue: 'meeca', i: 0.4 }),
  M('I\'m not going to tell you to hurry. I\'m going to tell you what I sing to the Heartbloom on its worst days.', 'P:sad@.4 M:think@.64'),
  M(LULLABY, 'P:sad@.4 M:sing@.64', { cue: 'meeca', i: 0.7, sting: 'bloom' }),
  M('That\'s the whole spell. You were always going to get there, Pokey. I only wanted you to know I\'m not counting.', 'P:tired@.4 M:happy@.64', { cue: 'tender', i: 0.5 }),
  N('Pokey read it three times. Then he folded it very small, and put it where his heart would feel it, and remembered the night in the old nest when she first sang it to him.', 'P:tired@.5', { m: 'dusk', cue: 'resolve', i: 0.4, p: { memory: false, particles: 'petals' } }),
]);

export const STORM = chapter({ name: 'MEMORY · THE SINGING STORM', w: 1, m: 'storm', cue: 'tender', i: 0.3, base: { memory: true, particles: 'rain' } }, [
  N('A thunderstorm in the old nest. Pokey did not like thunder. He had never told anyone.', kp('duck', 0.5), { cue: 'dread', i: 0.2 }),
  P('It\'s only weather. Weather is very loud, but it\'s only weather.', `${kp('duck')} ${km('happy')}`, { p: { fx: [{ at: 0.4, kind: 'flash', dur: 0.3, amount: 0.5 }] } }),
  M('You\'re holding the nest with both hands.', `${kp('duck')} ${km('talk')}`),
  P('It\'s a very good nest. I want it to stay.', `${kp('duck')} ${km('talk')}`),
  M('Close your eyes. I\'ll sing it quiet.', `${kp('worried')} ${km('happy')}`, { cue: 'meeca', i: 0.4 }),
  M('♪ Slow the rain... slow the thunder... ♪', `${kp('sleep')} ${km('sing')}`, { cue: 'meeca', i: 0.8, sting: 'bloom', m: 'dusk', p: { particles: 'petals' } }),
  N('She sang, and the whole forest went still to listen: the leaves, the rain, even the thunder, which stood on the horizon for a while with its hat in its hands.', `${kp('sleep', 0.4)} ${km('sing', 0.6)}`, { cue: 'tender', i: 0.6 }),
  M('See? Everything slows down when it listens.', `${kp('happy')} ${km('cheer')}`),
  P('Who taught you that?', `${kp('happy')} ${km('happy')}`),
  M('Grandma. It was her song first. She had a music box that played it, with a little iron key. When I miss her, I sing it, and it feels like she\'s winding it.', `${kp('happy')} ${km('think')}`, { cue: 'grandma', i: 0.5 }),
  N('The next thunderclap came. Pokey, for once, missed it.', `${kp('sleep', 0.4)} ${km('happy', 0.6)}`, { cue: 'pokey', i: 0.5, p: { particles: 'sparkles' } }),
]);

// ═════════════════════════════════ World 7 · who the General is ═════════════════════════════════

export const PHOTOGRAPH = chapter({ name: 'THE REVEAL · THE PHOTOGRAPH', w: 7, m: 'dusk', cue: 'reveal', i: 0.3, base: { particles: 'sparkles' } }, [
  N('Behind the broken rune there was a hollow in the stone. Inside it, wrapped in cloth, lay a single photograph.', 'P:idle@.3', { p: { zoom: 1.4, focusX: 0.55, fx: [{ at: 0.6, kind: 'glints', x: 0.62, y: 0.7 }] } }),
  P('A baby. And the one holding her... I know that face. Not the armor. The eyes.', 'P:surprised@.2', { ph: ['s4_01', 'Meeca, three weeks old', 0.5, 0] }),
  N('He turned it over. There was pencil on the back, in a hand he knew from a hundred birthday cards.', 'P:surprised@.2', { ph: ['s4_04', 'Grandpa has not put her down since', 0.5, 0.02] }),
  P('"Grandpa hasn\'t put her down since."', 'PF:surprised+worried@.4', { cue: 'sorrow', i: 0.4, sting: 'reveal' }),
  P('It\'s him. General Iron-Claw is Meeca\'s grandfather.', 'PF:worried@.4', { cue: 'reveal', i: 0.5 }),
  N('Pokey sat down very slowly, as though the truth were a thing that could be spilled.', 'P:sad@.4', { cue: 'sorrow', i: 0.3, p: { zoom: 1.35, focusX: 0.4 } }),
  P('I stood on his doorstep once. I asked him for his blessing. He told me to come back when I could protect her. And I thought... I thought he was only a stern old sloth who had gone away to the Highlands when Grandma died.',
    'PF:worried@.4', { i: 0.3 }),
  P('She can\'t know. She would never recognize him under all that iron. And she\'s up there in his tower, being kept safe, by the one person who loves her more than anyone.', 'PF:worried+tired@.4', { cue: 'hush', i: 0.2 }),
  N('Pokey sat in the ruins until the last of the light was gone. Then he turned the photograph face-down, then face-up, then put it in the satchel beside the note.', 'P:tired@.4', { m: 'night', cue: 'resolve', i: 0.35, p: pan(1.3, 0.4, 0.6, 1.05, 0.5, 0.55, 8) }),
  N('The petal trail ended at the temple door. After that there was only stone, one very slow sloth, and a secret that was now his to carry.', 'P:determined@.34', { cue: 'journey', i: 0.4, p: { particles: 'petals', ...pan(1.1, 0.4, 0.64, 1.1, 0.7, 0.64, 8) } }),
]);

// ═════════════════════════════════ World 8 · the petal ═════════════════════════════════

/** the dream in World 8: it also plays inside that world's own story card */
export const PROMISE_PANELS: StoryPanel[] = chapter({ name: 'MEMORY · THE PROMISE', w: 8, m: 'night', cue: 'tender', i: 0.3, base: { memory: true, particles: 'sparkles' } }, [
  N('In the dark of the Treetops Pokey slept, and he dreamed of the stars over the old nest.', `${kp('sleep')} ${km('happy')}`, { cue: 'meeca', i: 0.25 }),
  M('Hold out your wrist. I\'m tying a petal to it, so you will always know the way back.', `${kp('idle', 0.38)} ${km('happy', 0.62)}`, { p: { particles: 'petals' } }),
  P('A petal will wilt.', `${kp('talk', 0.38)} ${km('happy', 0.62)}`),
  M('Not this one. It\'s a Heartbloom petal. It stays as long as someone is thinking about the person who wore it.', `${kp('surprised', 0.38)} ${km('talk', 0.62)}`),
  P('Then it will never wilt. I promise never to let go.', `${kp('happy', 0.38)} ${km('happy', 0.62)}`, { cue: 'pokey', i: 0.5 }),
  M('Not even if I go somewhere you can\'t follow?', `${kp('idle', 0.38)} ${km('sad', 0.62)}`, { cue: 'sorrow', i: 0.3 }),
  P('Especially then.', `${kp('determined', 0.38)} ${km('sad', 0.62)}`, { cue: 'resolve', i: 0.5 }),
  N('In the dream the petal began to glow. The glow became a trail, and the trail led out of the dark.', kp('happy', 0.5), { cue: 'tender', i: 0.5, p: { particles: 'petals', ...pan(1.2, 0.5, 0.7, 1.2, 0.5, 0.3, 8) } }),
]);

export const SEAM = chapter({ name: 'WORLD 8 · THE LIEUTENANT', w: 8, m: 'night', cue: 'comedy', i: 0.3, base: { particles: 'sparkles' } }, [
  N('The Monarch was gone, and the fireflies had begun to breathe again. Somewhere in the dark, a lantern was bobbing along at ground level, as if the person holding it very much did not want to be seen.', 'P:tired@.3 D@.6^.4', { p: pan(1.1, 0.3, 0.55, 1.3, 0.55, 0.65, 8) }),
  OFF('Please do not look at me.', 'P:idle@.3 D@.6^.4'),
  D('SOLDIER! Pokey, there\'s a soldier! I\'ll distract him! I\'m very distracting! Look at my feathers!', 'P:worried@.3 D@.6^.4', { cue: 'comedy', i: 0.45 }),
  OFF('Please do not scream. Everyone screams. I am Lieutenant Pell. I bring Miss Meeca her breakfast.', 'P:surprised@.3 D@.6^.4'),
  P('You\'re the one who apologizes.', 'P:happy@.3 D@.6^.4'),
  OFF('I am so sorry. Yes.', '=', { sting: 'laugh' }),
  OFF('I am not supposed to be here. I have come to tell you three things, and then I shall go back and say I was in the latrine.', 'P:idle@.3 D@.6^.4'),
  OFF('One. The General has asked the cook for the soup Miss Meeca liked as a cub. It has come out wrong four times. He eats it anyway.', 'P:worried@.3 D@.6^.4', { cue: 'sorrow', i: 0.35 }),
  OFF('Two. He has a map. Each time you win, he moves a pin. He has run out of pins. He has started using forks.', 'P:surprised@.3 D@.6^.4', { cue: 'comedy', i: 0.4, sting: 'laugh' }),
  OFF('Three. There is a seam in the net behind the cookhouse. Nobody checks the cookhouse. We have been leaving it open since you started.', 'P:talk@.3 D@.6^.4', { cue: 'tender', i: 0.4 }),
  OFF('If I am ordered to sew it shut, I shall do it very badly. I was a tailor\'s apprentice. I was terrible. We are not allowed to say that we hope you win.', '='),
  D('The seam! I flew through your seam! I got nine scratches!', 'P:happy@.3 D@.6^.4'),
  OFF('I am so sorry about the scratches.', '='),
  P('Thank you, Lieutenant. Truly.', 'P:happy@.3 D@.6^.4'),
  OFF('Please do not thank me. It is embarrassing.', '=', { sting: 'laugh' }),
  N('The lantern bobbed away into the dark. A long way off, a very quiet voice said, "Good luck." And then, in a tone of deep regret, "Sir."', 'P:happy@.3 D@.6^.4', { cue: 'journey', i: 0.4 }),
]);

// ═════════════════════════════════ World 9 · what he was asked ═════════════════════════════════

export const BLESSING = chapter({ name: 'MEMORY · THE BLESSING', w: 1, m: 'dusk', cue: 'tender', i: 0.3, base: { memory: true, particles: 'sparkles' } }, [
  N('Years ago, a few weeks before everything changed, Pokey did the bravest thing of his life. He knocked on a door.', `${kp('worried', 0.34)} G~@.72*.9<`, { cue: 'pokey' }),
  GM('Don\'t loom in the doorway, dear. Come in. Sit. He doesn\'t bite. Often.', '', { ph: GRANDMA_PHOTO }),
  P('Sir, I\'d like your blessing. I\'d like to walk beside Meeca for as long as she will have me.', `${kp('talk', 0.34)} G~@.72*.9<`, { p: { zoom: 1.5, focusX: 0.34 } }),
  GF('You walk very slowly, young man.', `${kp('worried', 0.34)} G~@.72*.9<`, { p: { zoom: 1.5, focusX: 0.72 } }),
  P('Yes, sir. But I\'ve never left anyone behind.', `${kp('happy', 0.34)} G~@.72*.9<`, { cue: 'resolve', i: 0.4, p: { zoom: 1.55, focusX: 0.34 } }),
  N('The old soldier looked at him for a long time. The kettle in the next room began to sing. Somewhere behind the door, a very small voice was pretending not to listen.', `${kp('idle', 0.34)} G~@.72*.9<`, { cue: 'tender', i: 0.4, p: { zoom: 1.3 } }),
  GF('The world is a great deal faster than you are. It is unkind to people who cannot keep up. Come back when you can protect her.', `${kp('worried', 0.34)} G~@.72*.9<`, { cue: 'dread', i: 0.3, p: { zoom: 1.5, focusX: 0.72 } }),
  P('I will. Slowly.', `${kp('happy', 0.34)} G~@.72*.9<`, { cue: 'resolve', i: 0.5, p: { zoom: 1.55, focusX: 0.34 } }),
  N('He thought it was a test. He did not yet know it was a wound.', kp('happy', 0.5), { cue: 'sorrow', i: 0.4, p: { zoom: 1.25 } }),
  N('A few weeks later, the storm came. And the doorway Pokey had knocked on was empty.', 'G~@.72*.9<', { m: 'storm', cue: 'hush', i: 0.2, sting: 'darkness', p: { memory: true, particles: 'rain' } }),
]);

export const GATES = chapter({ name: 'WORLD 9 · THE OPEN GATES', w: 10, m: 'storm', cue: 'dread', i: 0.35, base: { particles: 'rain' } }, [
  N('The lava road ended where the mountain began. Pokey stood at the foot of it and, for the first time on the whole journey, he could see the entire fortress: every tower, every wall, every thorn.',
    'P:idle@.3 D@.6^.4', { p: pan(1.0, 0.5, 0.35, 1.25, 0.65, 0.45, 9) }),
  D('Pokey, I don\'t want to alarm you, but the front door is open.', 'P:idle@.3 D@.6^.4'),
  P('Is that bad?', 'P:talk@.3 D@.6^.4'),
  D('It\'s the worst thing a front door can be.', '=', { sting: 'laugh' }),
  N('Along the great wall, one by one, the guardians took their places. They did not look down. Every collar was glowing.', 'P:worried@.3 D@.6^.4', { cue: 'dread', i: 0.45 }),
  N('Far above them, the great gates of the Highland Fortress swung slowly outward. Nobody was pushing them. Lightning walked the length of the wall, and it seemed to Pokey that the whole fortress had taken a breath.', 'P:worried@.3 D@.6^.4', { cue: 'war', i: 0.5, sting: 'door', p: { fx: [{ at: 0.8, kind: 'flash', dur: 0.4, amount: 0.5 }, { at: 0.8, kind: 'shake', amount: 7, dur: 0.6 }] } }),
  GEN('Come up, sloth. I have counted every step you took. Let us see whether you can manage the last thousand.', 'P:worried@.3 D@.6^.4', { cue: 'war', i: 0.7, sting: 'blow' }),
  D('He has counted your steps. That\'s romantic, in a murder way.', 'P:worried@.3 D@.6^.4', { cue: 'comedy', i: 0.4 }),
  P('Dot. The door isn\'t open for you. Only for me.', 'P:determined@.3 D@.6^.4', { cue: 'dread', i: 0.4 }),
  D('Nobody opens a door like that unless he\'s already sure he has won.', '=', { cue: 'dread', i: 0.5 }),
  N('Pokey looked up the thousand steps. Then he looked at the petal on his wrist, which had begun, faintly, to glow.', 'P:determined@.3', { cue: 'resolve', i: 0.5, sting: 'cliffhanger', p: { fx: [{ at: 0.8, kind: 'glints', x: 0.3, y: 0.8 }] } }),
]);
