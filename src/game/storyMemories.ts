/**
 * The scenes that play once, right after a guardian falls (and the dream in World 8): the old days Pokey remembers, and the turns of the
 * plot that need a quiet moment of their own. Warm faded flashbacks have `memory: true`; the present-day scenes do not.
 *   2  The Waiting            how they met                                       (flashback)
 *   3  The Horn               the end of Act I: the General reaches out          (cliffhanger)
 *   3  The Map                the General alone with his pins and forks          (Tower scene, Pokey absent)
 *   4  Grandma's Garden       where "slow is not stopped" comes from            (flashback)
 *   5  Tea with the Queen     the middle of the story: what the Pact really is   (turn)
 *   6  The Sealed Note        the lowest point, and Meeca's lullaby              (scene) -> The Singing Storm (flashback) -> The Tally (Tower scene)
 *   7  The Photograph         who the General is                                 (reveal)
 *   8  The Promise            the petal                                          (dream, inside the world card) / The Lieutenant (scene)
 *   9  The Blessing           what Pokey was asked, years ago                    (flashback) -> The Open Gates (cliffhanger) -> The Door (Tower scene)
 */
import { chapter, D, FL, GEN, GM, M, N, OFF, P, pan, say } from './storyDsl.ts';
import type { StoryPanel } from './story.ts';

/** a little Pokey and a little Meeca: the same painted pair, drawn smaller */
const kp = (mood: string, x = 0.36) => `P:${mood}@${x}*.78`;
const km = (mood: string, x = 0.66) => `M:${mood}@${x}*.78`;
// the cub and Meeca in the old nest, pinned to the nest of the plate (the left of the picture, its rim at about .6 of the scene)
const kn = (mood: string, x = 0.2) => `P:${mood}@${x}^.6%*.6`;
const mn = (mood: string, x = 0.32) => `M:${mood}@${x}^.6%*.6`;

export const LULLABY = '♪ Slow the rain, slow the thunder. Slow the thorn that holds you under. Slow the kettle, slow the stair. Someone\'s coming. Keep a chair. ♪';

const PROWLER = say('Shadow Prowler');
const QUEEN = say('Tarantula Queen');
/** Meeca's grandfather, before he was the General */
const GF = say('Grandfather');

const GRANDMA_PHOTO: [string, string, number, number] = ['s3_02', 'Grandma', 0.46, -0.02];

// ═════════════════════════════════ World 2 · the day they met ═════════════════════════════════

export const WAITING = chapter({ name: 'MEMORY · THE WAITING', w: 1, m: 'day', cue: 'tender', i: 0.4, base: { memory: true, particles: 'sparkles' } }, [
  N('Pokey remembered the day they met. He\'d been crossing a single vine for two days.', kp('walk', 0.22), { cue: 'pokey', x: { 0: { move: { dx: 0.4, dur: 8, gait: 'walk' } } } }),
  // ART HOOK: the squirrel below the vine nailing up the sign THE SLOTH (reference/ART-TO-GET.md)
  N('Below him, a squirrel was nailing up a sign. It said THE SLOTH.', kp('walk', 0.3), { sting: 'laugh', x: { 0: { move: { dx: 0.3, dur: 8, gait: 'walk' } } } }),
  M('You\'ve been on this vine two days. Is it a good vine?', `${kp('idle')} ${km('happy')}`, { cue: 'meeca', i: 0.4 }),
  P('Very good. I\'m nearly halfway.', `${kp('happy')} ${km('happy')}`),
  M('Halfway to what?', `${kp('idle')} ${km('talk')}`),
  P('The other side.', `${kp('talk')} ${km('talk')}`),
  M('And what\'s on the other side?', '='),
  P('I\'ve lost track. It\'s still a good vine.', `${kp('think')} ${km('laugh')}`, { sting: 'laugh' }),
  N('Every other cub who came along that branch had said "Hurry up" or "Can you move?" She sat down next to him instead and unwrapped a leaf with mango in it.',
    `${kp('idle')} ${km('happy')}`, { cue: 'tender', i: 0.4 }),
  M('Then I\'ll wait. I brought breakfast.', `${kp('surprised')} ${km('cheer')}`, { cue: 'meeca', i: 0.5 }),
  P('Won\'t you be bored?', `${kp('talk')} ${km('happy')}`),
  M('Nobody\'s ever let me look at anything this long.', `${kp('happy')} ${km('think')}`),
  N('She waited six hours. When he got to the end of the vine, she was still there, and she had saved him the last piece of mango.',
    `${kp('happy', 0.42)} ${km('happy', 0.58)}`, { cue: 'pokey', i: 0.5, p: { particles: 'petals' } }),
]);

// ═════════════════════════════════ World 3 · the end of Act I ═════════════════════════════════

export const HORN = chapter({ name: 'WORLD 3 · THE HORN', w: 3, m: 'glow', cue: 'tender', i: 0.3, base: { particles: 'sparkles' } }, [
  N('They came out of the Grotto at dawn, the way you come out of a long sleep: slowly, not quite sure of the time.', 'P:tired@.3 D@.6^.4', { p: pan(1.1, 0.3, 0.55, 1.2, 0.5, 0.5, 8) }),
  D('We did it. You did it. I was there, and I was loud.', 'P:tired@.3 D:cheer@.6^.4', { cue: 'comedy', i: 0.4 }),
  P('You were really loud. It helped.', 'P:happy@.3 D@.6^.4'),
  N('To the north, past the last of the trees, a dark point stood on the horizon, narrow and straight. The Highland Fortress. It looked no closer than it had the day before.',
    'P:idle@.26 D@.52^.4', { cue: 'journey', i: 0.35, p: pan(1.05, 0.3, 0.55, 1.35, 0.78, 0.45, 9) }),
  P('She\'s up there.', 'P:determined@.26 D@.52^.4 B3#@.82<', { cue: 'resolve', i: 0.35 }),
  D('And the weather lives up there too. I\'ve been trying not to say it.', '='),
  PROWLER('North, past the falls. Follow the wind, not the path. And, sloth. When the horn sounds, do not stand near me.', 'P:idle@.26 D@.52^.4 B3#@.82<', { cue: 'dread', i: 0.3 }),
  P('What horn?', 'P:worried@.26 D@.52^.4 B3#@.82<'),
  N('The note came down out of the north. It was so low he felt it in his feet before he heard it, and back in the Grotto the glowworms went out, one after another, all along the ceiling.', '=', { m: 'storm', cue: 'war', i: 0.45, sting: 'darkness', p: { particles: 'none', fx: [{ at: 0.3, kind: 'shake', amount: 5, dur: 0.8 }] } }),
  N('It rolled on and on, like thunder. Pokey grabbed the ledge.', 'P:worried@.26 D:gasp@.52^.4 B3!@.82<', { i: 0.5 }),
  N('The collar on the Prowler\'s neck turned the red of a coal. His eyes went flat, as if someone far away had put a hand over them.', 'P:worried@.26 D@.52^.4 B3!@.82<', { p: { zoom: 1.5, focusX: 0.8 } }),
  PROWLER('Run. Run, little one. I cannot—', 'P:urgent@.26 D@.52^.4 B3!@.82<', { i: 0.6 }),
  GEN('Prowler. The ledge.', 'P:urgent@.26 D@.52^.4 B3!@.82<', { cue: 'war', i: 0.7, sting: 'blow' }),
  N('The Prowler\'s claws came down on the ledge. He fought them every inch of the way, and he wasn\'t strong enough.', 'P:urgent@.26 D@.52^.4 B3!@.82<', { cue: 'chase', i: 0.8, p: { fx: [{ at: 0.9, kind: 'shake', amount: 10, dur: 0.8 }, { at: 1.3, kind: 'dust', x: 0.5, y: 0.7 }] } }),
  PROWLER('Forgive me, little one. Forgive me.', '=', { i: 0.7 }),
  N('The ledge went the way a dropped plate goes. Dot screamed Pokey\'s name the whole way down. Pokey didn\'t say anything at all.', 'D@.5^.4', { cue: 'hush', sting: 'cliffhanger', p: { particles: 'none', fx: [{ at: 0.1, kind: 'flash', dur: 0.5 }] } }),
]);

// ═════════════════════════════════ World 4 · where the saying comes from ═════════════════════════════════

export const GARDEN = chapter({ name: 'MEMORY · GRANDMA\'S GARDEN', w: 5, m: 'glow', cue: 'tender', i: 0.4, base: { memory: true, particles: 'sparkles' } }, [
  N('The Heartbloom garden, years ago. Meeca\'s grandma was teaching her how to keep it.', `${km('think', 0.3)} GR:water@.74*.92 H:bud@.52^.8*1.2`, { cue: 'grandma' }),
  GM('Don\'t fuss at it, dear. Sit.', `${km('think', 0.3)} GR:wave_talk@.74*.92 H:bud@.52^.8*1.2`),
  M('But how will I know it\'s happy?', `${km('think', 0.3)} GR:laugh@.74*.92 H:bud@.52^.8*1.2`),
  GM('When it opens. Until then, you bring a chair, and you sit with it, and you don\'t poke. Bring your knitting if you have to fidget.', `${km('think', 0.3)} GR:hand_chest@.74*.92 H:bud@.52^.8*1.2`),
  N('Young Pokey, all elbows, was watering the wrong plant, very carefully.', '', { ph: ['s4_07', 'Somebody was always nearby', 0.5, 0.02] }),
  P('I think I watered the fern.', `${kp('worried', 0.18)} ${km('laugh', 0.38)} H:bud@.56^.8 GR:look_up@.8*.92`),
  M('You watered the fern, the snail, and my sandal.', `${kp('worried', 0.18)} ${km('laugh', 0.38)} H:bud@.56^.8 GR:giggle@.8*.92`, { sting: 'laugh' }),
  GM('Thank you for watering it anyway, Pokey. The fern never gets any. That frond\'s been unrolling all week. Slow is not stopped, dear.', `${kp('worried', 0.18)} ${km('laugh', 0.38)} H:bud@.56^.8 GR:hand_chest@.8*.92`, { cue: 'grandma', i: 0.5 }),
  P('It\'s Monday.', `${kp('happy', 0.18)} ${km('happy', 0.38)} H:bloom@.56^.8 GR:laugh@.8*.92`, { cue: 'pokey', i: 0.5 }),
  GM('You\'re staying for supper, Pokey. You always are.', `${kp('happy', 0.18)} ${km('happy', 0.38)} H:bloom@.56^.8 GR:wave_talk@.8*.92`, { cue: 'grandma', i: 0.5 }),
  N('The frond unrolled another inch while they argued about the sandal.', `${kp('happy', 0.18)} ${km('happy', 0.38)} H:bloom@.56^.8 GR:wave@.8*.92`, { cue: 'tender', i: 0.5, p: { particles: 'petals' } }),
]);

// ═════════════════════════════════ World 5 · the middle of the story ═════════════════════════════════

export const TEA = chapter({ name: 'WORLD 5 · TEA WITH THE QUEEN', w: 5, m: 'dusk', cue: 'tender', i: 0.3, base: { plate: 'tea', particles: 'petals' } }, [
  N('The Tarantula Queen didn\'t bow. She laid out four cups, a plate of small cakes, and a napkin that was clearly not a napkin. The fourth cup went at the head of the table, in front of an empty chair.', 'P:idle@.26 D@.46^.4 B5#@.74<', { cue: 'comedy', i: 0.35 }),
  QUEEN('Sit. I know you\'re in a hurry. Sit anyway. I haven\'t poured for anyone in nine years, and I\'d like to remember how it\'s done.', 'P:idle@.26 D@.46^.4 B5#@.74<'),
  D('Pokey, it\'s a trap.', 'P:worried@.26 D@.46^.4 B5#@.74<'),
  P('It\'s a tea.', 'P:talk@.26 D@.46^.4 B5#@.74<'),
  D('It\'s a trap with cookies, which is the worst kind. I\'m not drinking anything. I\'m forty percent sugar already.', '=', { sting: 'laugh' }),
  N('Pokey drank the whole cup, down to the leaves. The Queen watched every sip.', 'P:happy@.26 D@.46^.4 B5#@.74<', { cue: 'tender', i: 0.4 }),
  D('Sip. Don\'t gulp. She\'s watching you gulp.', 'P:happy@.26 D:puzzled@.46^.4 B5#@.74<'),
  QUEEN('You\'ll forgive an old queen for asking. It\'s a long road, and the Highlands are cold. Why do you keep going?', 'P:idle@.26 D@.46^.4 B5#@.74<'),
  P('Because she waited for me once.', 'PF:happy@.4', { cue: 'meeca', i: 0.4 }),
  QUEEN('Ah.', 'P:idle@.26 D@.46^.4 B5#@.74<', { cue: 'sorrow', i: 0.3 }),
  QUEEN('Mind that chair. I dust it every morning. He always put his feet up on it, and he took too much honey and not enough company. We were a council in the old days, ten of us and him at the head. We argued about everything. It was glorious.', '='),
  P('Who sat there?', 'P:surprised@.26 D@.46^.4 B5#@.74<'),
  QUEEN('Iron-Claw. Before he was anyone\'s General. Then came the storm. His wife died in it, and the help came late. He sat in her chair for a year. Then he came to each of us at night, crying, with the same bargain. "No more waiting. No more late. Let me make this forest fast enough to save anyone."', '=', { cue: 'reveal', i: 0.4, sting: 'reveal' }),
  QUEEN('We said yes. All but one of us. That\'s all the Pact is. I poured him a cup first. He never touched it, and I said yes before it went cold.', '='),
  // the General's motive, layer one (the public reason): her flower undoes his Pact
  QUEEN('Her flower puts our thorns to sleep, darling. The morning it opened, his whole Pact started to yawn.', '=', { cue: 'reveal', i: 0.35 }),
  P('In a storm.', 'PF:worried@.4', { cue: 'sorrow', i: 0.4 }),
  N('Pokey held the cup until it went cold.', 'PF:worried+tired@.4', { cue: 'hush', i: 0.25 }),
  QUEEN('Have another cake, darling.', 'P:idle@.26 D@.46^.4 B5#@.74<', { cue: 'sorrow', i: 0.35 }),
  N('Dot had been quiet the whole time. Her wing rested on the little pouch at her side, and she didn\'t look up.', 'P:idle@.26 D@.46^.45 B5#@.74<', { cue: 'sorrow', i: 0.35, p: { zoom: 1.6, focusX: 0.46 } }),
  N('When Pokey stood to leave, the cup at the head of the table was still full. She\'d been topping it up the whole time.', 'P:happy@.3 B5#@.74<', { cue: 'tender', i: 0.45, p: pan(1.25, 0.5, 0.55, 1.5, 0.74, 0.55, 8) }),
]);

// ═════════════════════════════════ World 6 · the lowest point ═════════════════════════════════

export const SEALED = chapter({ name: 'WORLD 6 · THE SEALED NOTE', w: 6, m: 'dusk', cue: 'sorrow', i: 0.2, base: { particles: 'none' } }, [
  N('Past the Reaver\'s water, the ground went up in steps of root, and Pokey took them one at a time. At the fourth, he stopped.', 'P:tired@.5', { p: pan(1.1, 0.5, 0.45, 1.35, 0.5, 0.6, 9) }),
  N('He\'d been walking for months. Under the satchel strap, his fur had worn through to a pale stripe.', 'P:tired@.5'),
  N('A snail overtook him on the left. Pokey tipped his head to it. It didn\'t tip back. It had a schedule.', 'P:tired@.5'),
  P('I\'m tired.', 'PF:tired@.4', { i: 0.25 }),
  N('Flicker had gone ahead to light the next root. He said it again anyway.', 'PF:worried+tired@.4', { cue: 'hush', i: 0.2 }),
  N('The petal on his wrist kept pointing north. He turned his wrist over so he wouldn\'t have to watch it.', 'P:tired@.5', { cue: 'hush', i: 0.2 }),
  N('Then he sat down on a root and didn\'t look at the next one.', 'P:sad@.5', { sting: 'heartbreak', p: { zoom: 1.3, focusY: 0.6 } }),
  N('He took the sealed note out of the satchel. The last word of every line was written on top of the one before it, where Meeca had run out of paper.', 'P:sad@.5', { cue: 'meeca', i: 0.25 }),
  M('Pokey. If you\'re reading this, you\'ve stopped. Good. Take the satchel off first. It rubs your shoulder, and you never say.', 'P:sad@.4 M:sad@.64', { w: 6, p: { memory: true, particles: 'petals' }, cue: 'meeca', i: 0.4 }),
  M('I\'m not going to tell you to hurry. This is what I sing to the Heartbloom on its worst days.', 'P:sad@.4 M:think@.64'),
  M(LULLABY, 'P:sad@.4 M:sing@.64', { cue: 'meeca', i: 0.7, sting: 'bloom' }),
  M('That\'s the whole spell. I know it isn\'t much. I\'m not counting, Pokey. Come when you come.', 'P:tired@.4 M:happy@.64', { cue: 'tender', i: 0.5 }),
  N('Pokey read it three times. He put it back in the satchel, took the satchel off, and sat for a long time with nothing on his shoulder.', 'PX:read_cry@.5', { m: 'dusk', cue: 'resolve', i: 0.4, p: { memory: false, particles: 'petals' } }),
]);

// ART HOOK: the nest-in-the-storm plate (two grown sloths seen from behind, going out along the branch; a cub's hands on the rim) belongs on the "It had been his parents' nest" beat once it is painted.
export const STORM = chapter({ name: 'MEMORY · THE SINGING STORM', w: 1, m: 'storm', cue: 'tender', i: 0.3, base: { memory: true, plate: 'nest-night', particles: 'rain' } }, [
  N('A storm, in the old nest. Pokey was small, and the nest was bigger than he was.', kn('duck'), { cue: 'dread', i: 0.2 }),
  P('It\'s only weather.', `${kn('duck')} ${mn('happy')}`, { p: { fx: [{ at: 0.4, kind: 'flash', dur: 0.3, amount: 0.5 }] } }),
  M('You\'re holding the nest with both hands.', `${kn('duck')} ${mn('talk')}`),
  P('It\'s a very good nest. I want it to stay.', `${kn('duck')} ${mn('talk')}`),
  N('It had been his parents\' nest. He remembered a few small things about them. The sound his father\'s claws made on the bark, coming home. His mother humming something he could never get all the way back.', kn('sad'), { cue: 'sorrow', i: 0.3, p: { plate: 'nest-storm' } }),
  N('On a night like this one they\'d gone out along the far branches, and afterward the grown-ups said it was a storm, sweetheart, and talked about something else. No one ever said what they went out for.', kn('sad'), { cue: 'sorrow', i: 0.3, p: { plate: 'nest-storm' } }),
  M('Can I sit?', `${kn('duck')} ${mn('talk')}`),
  P('It\'s small.', `${kn('duck')} ${mn('talk')}`),
  M('I\'m small.', `${kn('worried')} ${mn('happy')}`, { cue: 'meeca', i: 0.4 }),
  N('She put one hand over both of his on the rim of the nest. She didn\'t ask him to let go.', `${kn('worried')} ${mn('happy')}`, { cue: 'tender', i: 0.4 }),
  M('♪ Slow the rain... slow the thunder... ♪', `${kn('worried')} ${mn('sing')}`, { cue: 'meeca', i: 0.8, sting: 'bloom', m: 'dusk', p: { particles: 'petals' } }),
  N('The thunder kept coming. After a while, he could hear her over it.', `${kn('sleep')} ${mn('sing')}`, { cue: 'tender', i: 0.6 }),
  P('Who taught you that?', `${kn('happy')} ${mn('happy')}`),
  M('Grandma. It was her song first. She has a music box that plays it, with a little iron key. When it runs down, I sing the rest.', `${kn('happy')} ${mn('think')} GR:box_sit@.76*.9`, { cue: 'grandma', i: 0.5 }),
  N('Down in the house, the music box ran down. She went on without it, and he fell asleep with both hands still on the nest.', `${kn('sleep')} ${mn('happy')} GR:hum_sit@.86*.7`, { cue: 'pokey', i: 0.5, p: { particles: 'sparkles' } }),
]);

// ═════════════════════════════════ World 7 · who the General is ═════════════════════════════════

export const PHOTOGRAPH = chapter({ name: 'THE REVEAL · THE PHOTOGRAPH', w: 7, m: 'dusk', cue: 'reveal', i: 0.3, base: { plate: 'ruins', particles: 'sparkles' } }, [
  N('Behind the broken rune there was a hollow in the stone. Inside it, wrapped in cloth, lay a single photograph.', 'P:idle@.3 FL@.385^.44*.8>', { p: { zoom: 1.4, focusX: 0.55, fx: [{ at: 0.6, kind: 'glints', x: 0.62, y: 0.7 }] } }),
  P('A baby. And whoever\'s holding her. I know him. I stood at his door once.', 'P:surprised@.2 FL@.285^.44*.8>', { ph: ['s4_01', 'Meeca, three weeks old', 0.5, 0] }),
  N('He turned it over. There was pencil on the back, in a hand he\'d seen on Meeca\'s birthday cards.', 'P:surprised@.2 FL@.285^.44*.8>', { ph: ['s4_04', 'Grandpa has not put her down since', 0.5, 0.02] }),
  P('Grandpa.', 'PF:surprised+worried@.4', { cue: 'sorrow', i: 0.4, sting: 'reveal' }),
  N('Before the cape and the club and the red eyes, General Iron-Claw had held her like something that might spill.', 'PF:worried@.4', { cue: 'reveal', i: 0.5, ph: ['s4_01', 'Meeca, three weeks old', 0.5, 0] }),
  N('Pokey sat down on the stone. He took hold of the satchel strap and didn\'t let go of it.', 'PX:kneel_sad@.4', { cue: 'sorrow', i: 0.3, p: { zoom: 1.35, focusX: 0.4 } }),
  P('She thinks he walked out on her.', 'PF:worried@.4', { i: 0.3 }),
  P('He came and took her himself.', 'PF:worried+tired@.4', { cue: 'hush', i: 0.2 }),
  N('Pokey sat in the ruins until the last of the light was gone. Then he turned the photograph face-down, then face-up, then put it in the satchel beside the note.', 'P:tired@.4 FL@.485^.44*.8>', { m: 'night', cue: 'resolve', i: 0.35, p: pan(1.3, 0.4, 0.6, 1.05, 0.5, 0.55, 8) }),
  N('The petal on his wrist turned north and held there. He got up.', 'P:determined@.34 FL@.425^.44*.8>', { cue: 'journey', i: 0.4, p: { particles: 'petals', ...pan(1.1, 0.4, 0.64, 1.1, 0.7, 0.64, 8) } }),
]);

// ═════════════════════════════════ World 8 · the petal ═════════════════════════════════

/** the dream in World 8: it also plays inside that world's own story card */
export const PROMISE_PANELS: StoryPanel[] = chapter({ name: 'MEMORY · THE PROMISE', w: 8, m: 'night', cue: 'tender', i: 0.3, base: { memory: true, particles: 'sparkles' } }, [
  N('Pokey dreamed of the old nest, and the stars over it.', `${kp('sleep')} ${km('happy')}`, { cue: 'meeca', i: 0.25 }),
  M('Hold out your wrist. I\'m tying a petal on it. It\'s off the Heartbloom, so it\'ll point at me.', 'PB:tie_stand@.5*1.05', { p: { particles: 'petals' } }),
  P('A petal will wilt.', '=', { p: { zoom: 1.35, focusX: 0.5 } }),
  M('Not this one. Grandma says it lasts exactly as long as somebody is thinking of you, so you\'re stuck with it.', 'PA:tie_closeup@.5*1.6', { p: { zoom: 1.0 } }),
  P('Then it\'ll last.', 'PA:kneel_tie@.5*1.05', { cue: 'pokey', i: 0.5 }),
  M('Keep it on. Even if I go somewhere you can\'t follow.', 'PA:reach_slump@.5*1.05', { cue: 'sorrow', i: 0.3 }),
  P('Especially then.', 'PH:nuzzle@.5*1.05', { cue: 'resolve', i: 0.5 }),
  N('In the dream, the petal began to glow. It pointed out of the dark, and he went.', 'PH:heart_hands@.5*1.05', { cue: 'tender', i: 0.5, p: { particles: 'petals', ...pan(1.2, 0.5, 0.7, 1.2, 0.5, 0.3, 8) } }),
]);

export const SEAM = chapter({ name: 'WORLD 8 · THE LIEUTENANT', w: 8, m: 'night', cue: 'comedy', i: 0.3, base: { particles: 'sparkles' } }, [
  N('The Monarch was gone, and the fireflies came back one at a time. In the dark, a lantern was bobbing along at ground level, as if the person holding it didn\'t want to be seen.', 'P:tired@.26 D@.5^.4 LP:lantern@.9*.9 FL@.345^.44*.8>', { p: pan(1.1, 0.3, 0.55, 1.3, 0.55, 0.65, 8) }),
  OFF('I am so sorry, but would you mind not looking at me?', 'P:idle@.26 D@.5^.4 LP:peek_door@.84*.9 FL@.345^.44*.8>'),
  D('Soldier! Pokey, there\'s a soldier! I\'ll distract him. I\'m extremely distracting. Look at my three feathers!', 'P:worried@.26 D:yelp@.5^.4 LP:peek_door@.84*.9 FL@.345^.44*.8>', { cue: 'comedy', i: 0.45 }),
  OFF('I am so sorry, but please do not scream. Everyone screams. I am Lieutenant Pell. I bring Miss Meeca her breakfast.', 'P:surprised@.26 D@.5^.4 LP:bow@.8*.9 FL@.345^.44*.8>'),
  P('Is she okay?', 'P:worried@.26 D@.5^.4 LP:cap_in_hand@.8*.9 FL@.345^.44*.8>'),
  OFF('She is very polite to me. I do not deserve it. I am sorry. Yes.', 'P:happy@.26 D@.5^.4 LP:bow@.8*.9 FL@.345^.44*.8>', { cue: 'tender', i: 0.35 }),
  OFF('I am not supposed to be here. I have come to tell you two things, and then I shall go back and say I was in the bathroom.', 'P:idle@.26 D@.5^.4 LP:hands_clasped@.8*.9 FL@.345^.44*.8>'),
  OFF('The first. The General has asked the cook for the soup Miss Meeca liked as a cub. It has come out wrong four times this week. He eats it anyway.', 'P:worried@.26 D@.5^.4 LP:tray_walk@.8*.9 FL@.345^.44*.8>', { cue: 'sorrow', i: 0.35 }),
  OFF('The second. There is a seam in the net behind the cookhouse. The bird found it, and that was not an accident. The cookhouse is never checked, and we have been leaving it open since you started.', 'P:talk@.26 D@.5^.4 LP:mend_coat@.8*.9 FL@.345^.44*.8>', { cue: 'tender', i: 0.4 }),
  OFF('If I am ordered to sew it shut, I shall do it badly. I was a tailor\'s apprentice. I was terrible. We are not allowed to say that we hope you win.', 'P:talk@.26 D@.5^.4 LP:sew_table@.8*.9 FL@.345^.44*.8>'),
  D('On purpose? Do you know what that seam did to me?', 'P:happy@.26 D:yelp@.5^.4 LP:hopeful@.8*.9 FL@.345^.44*.8>', { sting: 'laugh' }),
  OFF('I am so sorry about the seam.', 'P:happy@.26 D@.5^.4 LP:cap_in_hand@.8*.9 FL@.345^.44*.8>'),
  P('Thanks, Lieutenant.', 'P:happy@.26 D@.5^.4 LP:hopeful@.8*.9 FL@.345^.44*.8>'),
  OFF('Oh, I am sorry. Please do not thank me. It is embarrassing.', 'P:happy@.26 D@.5^.4 LP:salute_nervous@.8*.9 FL@.345^.44*.8>', { sting: 'laugh' }),
  N('The lantern bobbed away into the dark. From somewhere down the slope, a quiet voice said, "Good luck." Then, after a moment, "Sir."', 'P:happy@.26 D@.5^.4 LP:lantern@.92*.9 FL@.345^.44*.8>', { cue: 'journey', i: 0.4 }),
]);

// ═════════════════════════════════ World 9 · what he was asked ═════════════════════════════════

export const BLESSING = chapter({ name: 'MEMORY · THE BLESSING', w: 1, m: 'dusk', cue: 'tender', i: 0.3, base: { plate: 'grandma-door', memory: true, particles: 'sparkles' } }, [
  N('Ten years ago, a few weeks before the storm, Pokey knocked on a door.', `${kp('worried', 0.34)} GY:stand_b@.76*.9`, { cue: 'pokey' }),
  GM('Don\'t loom in the doorway, dear. Come in. Sit. He doesn\'t bite. Often.', `${kp('worried', 0.24)} GR:wave_talk@.54*.9 GY:stand_b@.82*.9`),
  P('Sir, I\'d like your blessing. I\'d like to walk beside Meeca for as long as she\'ll have me.', `${kp('talk', 0.34)} GY:stand_b@.76*.9`, { p: { zoom: 1.5, focusX: 0.34 } }),
  GF('Boy. It took you fourteen minutes to come up my path. I timed it.', `${kp('worried', 0.34)} GY:stand_b@.76*.9`, { p: { zoom: 1.5, focusX: 0.72 } }),
  P('Yes, sir. I stopped to look at your fern.', `${kp('happy', 0.34)} GY:stand_b@.76*.9`, { cue: 'resolve', i: 0.4, p: { zoom: 1.55, focusX: 0.34 } }),
  N('The old soldier looked at him for a long time. The kettle in the next room began to sing. Somewhere behind the door, someone was pretending, badly, not to listen.', `${kp('idle', 0.34)} GY:stand_b@.76*.9`, { cue: 'tender', i: 0.4, p: { zoom: 1.3 } }),
  GF('Come back when you can protect her.', `${kp('worried', 0.34)} GY:turn_away@.76*.9`, { cue: 'dread', i: 0.3, p: { zoom: 1.5, focusX: 0.72 } }),
  P('I will. Slowly.', `${kp('happy', 0.34)} GY:stand_b@.76*.9`, { cue: 'resolve', i: 0.5, p: { zoom: 1.55, focusX: 0.34 } }),
  N('Pokey went down the path with one hand on his satchel strap. The kettle was still singing when he reached the gate.', kp('happy', 0.5), { cue: 'sorrow', i: 0.4, p: { zoom: 1.25 } }),
  N('Then the storm came, and took Meeca\'s grandma. For a year after, the old soldier sat by the window and didn\'t come to the door when Pokey knocked. Then one morning the door stood open, and his chair was empty.', '', { m: 'storm', cue: 'hush', i: 0.2, sting: 'darkness', p: { plate: 'grandma-door-empty', memory: true, particles: 'rain' } }),
]);

/** the camera for the wall beats: the whole picture, so the ten guardians on the wall tops are in view */
const GATE_VIEW = { zoom: 1.0, focusX: 0.5, focusY: 0.5 };

/** the ten guardians on the wall tops, standing on the plate's ten green lights (the first five face right, the last five face left) */
const GATE_WALL = 'B1@.206^.349*.15> B2@.246^.326*.15> B3@.286^.303*.15> B4@.326^.28*.15> B5@.366^.257*.15> B6@.626^.256*.15< B7@.669^.281*.15< B8@.711^.305*.15< B9@.754^.329*.15< B10@.796^.353*.15<';

/** the night before the mountain (STORY-REVIEW-2026-10-27.md item 9): Pokey asleep, and Dot hears her own guilt in Flicker's */
const NIGHT = chapter({ name: 'WORLD 9 · THE NIGHT BEFORE', w: 9, m: 'night', cue: 'tender', i: 0.25, base: { particles: 'embers' } }, [
  N('The night before the mountain, Pokey fell asleep against a warm rock with his mouth open. Dot couldn\'t sleep. She never could, near weather. Flicker sat on a stone a little way off and turned himself down low, so he wouldn\'t keep anybody up.',
    'P:sleep@.26 D:perch@.52^.62 FL:doze@.72^.66', { p: pan(1.05, 0.45, 0.6, 1.25, 0.55, 0.62, 9) }),
  D('You can turn that off, you know, I don\'t need it, I can see fine, I can see perfectly fine.', 'P:sleep@.26 D@.52^.5 FL:doze@.72^.66'),
  FL('You flew into a rock an hour ago.', 'P:sleep@.26 D@.52^.5 FL:talk@.72^.66'),
  D('I was checking the rock.', 'P:sleep@.26 D:flinch@.52^.5 FL@.72^.66', { sting: 'laugh' }),
  FL('She got out, you know. Meeca. In the orchids. She was nearly all the way out.', 'P:sleep@.26 D@.52^.5 FL:talk@.72^.66', { cue: 'sorrow', i: 0.3 }),
  D('I saw the carvings.', 'P:sleep@.26 D@.52^.5 FL@.72^.66'),
  FL('She didn\'t know the way, so I lit it for her. Every tree. I was the one showing her where to go.', 'P:sleep@.26 D@.52^.5 FL:talk@.72^.66'),
  FL('They followed my light.', 'P:sleep@.26 D@.52^.5 FL:sad@.72^.66', { cue: 'hush', i: 0.2 }),
  N('Dot didn\'t say anything for a while.', 'P:sleep@.26 D:sad@.52^.5 FL:sad@.72^.66'),
  D('How far did she get?', '=', { cue: 'sorrow', i: 0.3 }),
  FL('One more tree.', 'P:sleep@.26 D:sad@.52^.5 FL:sad@.72^.66'),
  D('And now you go over it. Every night. Which tree. What if you\'d been somewhere else.', 'P:sleep@.26 D:sad@.56^.5 FL:sad@.72^.66'),
  FL('How do you know that?', 'P:sleep@.26 D:sad@.56^.5 FL:startled@.72^.66'),
  N('Dot\'s wing went to the pouch at her side. She looked at Pokey, asleep with his mouth open.', 'P:sleep@.26 D:sad@.44^.5 FL@.72^.66', { cue: 'hush', i: 0.2, p: { zoom: 1.45, focusX: 0.36 } }),
  D('Lucky guess.', 'P:sleep@.26 D:sad@.5^.5 FL@.72^.66', { cue: 'sorrow', i: 0.3 }),
  D('Tomorrow, at the bottom of the mountain, I might say something to him. If I stop halfway, don\'t let me.', 'P:sleep@.26 D@.56^.5 FL@.72^.66'),
  FL('I won\'t.', 'P:sleep@.26 D@.56^.5 FL:talk@.72^.66', { cue: 'tender', i: 0.35 }),
  N('She sat down on the stone next to him. She didn\'t take up much room. Neither did he. After a while, he turned himself back up.', 'P:sleep@.26 D:perch@.66^.66 FL:glow@.72^.62', { cue: 'tender', i: 0.4, p: { zoom: 1.5, focusX: 0.68 } }),
]);

const GATES_DAY = chapter({ name: 'WORLD 9 · THE OPEN GATES', w: 10, m: 'storm', cue: 'dread', i: 0.35, base: { plate: 'gates', particles: 'rain' } }, [
  N('The lava road ended where the mountain began. Above him, the fortress went up in iron towers, and every thorn on every wall pointed down.',
    'P:idle@.3 D@.6^.4 FL@.385^.44*.8>', { p: pan(1.0, 0.5, 0.35, 1.25, 0.65, 0.45, 9) }),
  D('Pokey. Pokey! The front door is open. The big one, up there. Wide open, and not a guard in it. I\'ve been through a lot of doors, Pokey, a lot of doors, and not one of them did that on purpose!', 'P:idle@.3 D@.6^.4 FL@.385^.44*.8>'),
  P('Is that bad?', 'P:talk@.3 D@.6^.4 FL@.385^.44*.8>'),
  D('Pokey. The last thing that was this nice to us had a doily.', '=', { sting: 'laugh' }),
  // the two soldiers from the garden, back (2026-10-29 story report, people who come back)
  N('Two soldiers stood at the foot of the steps, the same two from the garden, and a good deal more tired.', 'P:idle@.3 D@.6^.4 FL@.385^.44*.8>', { cue: 'comedy', i: 0.35 }),
  say('Soldier')('Is that a hummingbird?', '='),
  say('Soldier')('Where?', '='),
  N('Dot was already behind Pokey\'s ear.', 'P:idle@.3 D:flinch@.33^.36*.8 FL@.385^.44*.8>', { sting: 'laugh' }),
  N('Along the great wall, one by one, the guardians took their places. They didn\'t look down. Every collar was glowing.', `P:worried@.3 D@.6^.4 FL@.385^.44*.8> ${GATE_WALL}`, { cue: 'dread', i: 0.45, p: GATE_VIEW }),
  N('Above them, the great gates of the Highland Fortress groaned on their hinges, though no hand was on them. Lightning walked the length of the wall.', `P:worried@.3 D@.6^.4 FL@.385^.44*.8> ${GATE_WALL}`, { cue: 'war', i: 0.5, sting: 'door', p: { ...GATE_VIEW, fx: [{ at: 0.8, kind: 'flash', dur: 0.4, amount: 0.5 }, { at: 0.8, kind: 'shake', amount: 7, dur: 0.6 }] } }),
  GEN('Come up, sloth. The General has counted every step you took. There are a thousand more. The General is not tired. The General is never tired.', `P:worried@.3 D@.6^.4 FL@.385^.44*.8> ${GATE_WALL}`, {
    cue: 'war', i: 0.7, sting: 'blow', p: GATE_VIEW,
    // (the General counts the player's real falls, once there are any: storyNotice.ts)
    withFalls: 'Come up, sloth. The General has counted every step you took, and every fall. {N} of them. There are a thousand more. The General is not tired. The General is never tired.',
  }),
  D('He counted your steps, Pokey. That\'s... I don\'t know what that is. That\'s a hobby. That\'s a very concerning hobby.', `P:worried@.3 D@.6^.4 FL@.385^.44*.8> ${GATE_WALL}`, { cue: 'comedy', i: 0.4, p: GATE_VIEW }),
  N('Pokey looked up the thousand steps. Then he looked at the petal on his wrist, which had begun, faintly, to glow.', `P:determined@.3 FL@.385^.44*.8> ${GATE_WALL}`, { cue: 'resolve', i: 0.5, sting: 'cliffhanger', p: { ...GATE_VIEW, fx: [{ at: 0.8, kind: 'glints', x: 0.3, y: 0.8 }] } }),
]);

export const GATES: StoryPanel[] = [...NIGHT, ...GATES_DAY];

// ═════════════════════════════════ the Tower scenes: the three where Pokey is not in the room ═════════════════════════════════
// Each one is one painted plate and about three hundred words. Pokey never appears; the player knows what he does not.

/** after World 3: the General alone with his map */
export const MAP = chapter({ name: 'THE TOWER · THE MAP', w: 3, m: 'day', cue: 'war', i: 0.25, base: { plate: 'warroom', particles: 'none' } }, [
  N('The General had started with a box of forty pins, one for every night the sloth slept somewhere new. He hadn\'t thought he would need more. The sloth slept a great deal.', '', { p: pan(1.0, 0.5, 0.5, 1.2, 0.5, 0.6, 8) }),
  N('The pins had run out the week before. Now there were forks standing in the map, in a row, where the last pins should have been.', '', { p: pan(1.2, 0.45, 0.62, 1.45, 0.42, 0.68, 8) }),
  GEN('Forty-four.', 'GN:ready@.8*.8', { cue: 'dread', i: 0.3, p: { zoom: 1.2, focusX: 0.7 } }),
  OFF('Sir, I am sorry to interrupt. I am also sorry to report that the mess hall is out of forks.', 'GN:ready@.8*.8 LP:stand_worry@.16*.8', { p: { zoom: 1.0 } }),
  GEN('Spoons.', '=', { cue: 'comedy', i: 0.3, p: { zoom: 1.0 } }),
  OFF('Sir, the spoons are for the soup. I am sorry. People will notice. Sir. Everyone will notice.', 'GN:ready@.8*.8 LP:shrug@.16*.8', { sting: 'laugh', p: { zoom: 1.0 } }),
  N('Pell went away and came back with a tray of spoons.', 'GN:ready@.8*.8 LP:tray_walk@.3*.8', { cue: 'tender', i: 0.3, p: pan(1.1, 0.5, 0.65, 1.4, 0.45, 0.7, 8) }),
  N('The General laid his paw flat on the map. The last fork stood four fingers from the tower.', 'GN:ready@.8*.8 LP:stand_worry@.16*.8', { cue: 'dread', i: 0.3, p: { zoom: 1.3, focusX: 0.6 } }),
  GEN('He has not gone around anything. Not the river. Not the Grotto. He walks straight through.', '=', { p: { zoom: 1.3, focusX: 0.6 } }),
  OFF('That is very foolish of him, sir.', 'GN:ready@.8*.8 LP:hands_clasped@.16*.8', { p: { zoom: 1.0 } }),
  GEN('Yes.', 'GN:ready@.8*.8 LP:hands_clasped@.16*.8', { cue: 'sorrow', i: 0.3, p: { zoom: 1.2, focusX: 0.75 } }),
  GEN('Lieutenant. The prisoner will have a blanket. That is an order. It is not from me.', '=', { p: { zoom: 1.2, focusX: 0.75 } }),
  OFF('Yes, sir. Not from you, sir.', 'GN:ready@.8*.8 LP:salute_nervous@.16*.8', { p: { zoom: 1.0 } }),
  GEN('Go to bed, Lieutenant. Leave the lantern.', 'GN:ready@.8*.8 LP:hands_clasped@.16*.8', { p: { zoom: 1.2, focusX: 0.75 } }),
  OFF('Yes, sir. Good night, sir. I am sorry about the spoons.', 'GN:ready@.8*.8 LP:salute_nervous@.16*.8', { p: { zoom: 1.0 } }),
  N('When the door had closed, the General took a spoon from the tray and drove it into the map beside the last fork, bowl up.', 'GN:ready@.8*.8', { cue: 'hush', i: 0.2, p: { zoom: 1.4, focusX: 0.62, focusY: 0.72 } }),
  GEN('I used to walk straight through.', '=', { cue: 'sorrow', i: 0.2, p: { zoom: 1.4, focusX: 0.62, focusY: 0.72 } }),
  GEN('Forty-five.', '=', { cue: 'hush', i: 0.2, p: { zoom: 1.4, focusX: 0.62, focusY: 0.72 } }),
]);

/** after World 6: Meeca in the cell, writing a letter she will not be able to send */
export const TALLY = chapter({ name: 'THE TOWER · THE TALLY', w: 6, m: 'day', cue: 'sorrow', i: 0.2, base: { plate: 'cell', particles: 'none' } }, [
  N('There were a hundred and twelve marks on the wall behind the bed, in bundles of five. Meeca had made them with the handle of a spoon. She sat down at the desk with her back to them.', 'MS:write@.38*.8', { p: pan(1.0, 0.4, 0.5, 1.25, 0.3, 0.55, 9) }),
  N('Her handwriting was very steady. It always was when she lied.', '=', { cue: 'hush', i: 0.2, p: { zoom: 1.5, focusX: 0.36, focusY: 0.7 } }),
  M('Dear Pokey. Don\'t hurry. I\'m not counting.', 'MS:write@.38*.8', { cue: 'meeca', i: 0.3, p: { zoom: 1.5, focusX: 0.36, focusY: 0.7 } }),
  N('There was no way to send it now. She wrote it anyway.', '=', { cue: 'hush', i: 0.2, p: { zoom: 1.5, focusX: 0.36, focusY: 0.7 } }),
  OFF('Miss Meeca? It is Lieutenant Pell. I am knocking. I am sorry about the knocking.', 'MS:write@.38*.8 LP:peek_door@.56*.8', { sting: 'door', p: { zoom: 1.0 } }),
  M('You don\'t have to knock, Pell. You\'re the one with the key.', 'MS:stand_wait@.38*.8 LP:peek_door@.56*.8', { cue: 'meeca', i: 0.3 }),
  OFF('It is the General\'s key, Miss. I only carry it. I have brought a pillow. I am sorry that it is only a pillow.', 'MS:stand_wait@.38*.8 LP:cap_in_hand@.56*.8'),
  M('Thank you. It looks soft. Why am I here, Pell?', '=', { cue: 'tender', i: 0.3 }),
  OFF('For your safety, Miss. He says so every morning. I think he says it to the mirror first.', 'MS:stand_wait@.38*.8 LP:hands_clasped@.56*.8'),
  M('Who told him to call me that? Little bloom.', 'MS:stand_wait@.38*.8 LP:cap_in_hand@.56*.8'),
  N('Pell looked at the pillow for a while.', 'MS:stand_wait@.38*.8 LP:cap_in_hand@.56*.8', { cue: 'hush', i: 0.2 }),
  OFF('I could not say, Miss. I am sorry that I could not say. And if there is a letter, I am not permitted to carry it. I am very sorry that I am not permitted.', 'MS:stand_wait@.38*.8 LP:hands_clasped@.56*.8', { cue: 'sorrow', i: 0.25 }),
  M('It isn\'t finished.', 'MS:stand_wait@.38*.8 LP:hands_clasped@.56*.8'),
  N('Pell closed the door softly and turned the key softly. Somebody had told him to lock it. Nobody had told him to be loud about it.', 'MS:stand_wait@.38*.8', { cue: 'sorrow', i: 0.25, p: { zoom: 1.2, focusX: 0.5 } }),
  N('Meeca finished the letter and put it under the new pillow. Then she picked up the spoon and turned to the wall. The hundred and thirteenth mark took a long time. She was careful not to press any harder than she had for the others.', 'MS:carve_wall@.2*.8', { cue: 'hush', i: 0.2, p: pan(1.0, 0.3, 0.5, 1.25, 0.24, 0.55, 10) }),
]);

/** after World 9: the General at her door with a bowl of soup, and the door does not open */
export const DOOR = chapter({ name: 'THE TOWER · THE DOOR', w: 9, m: 'day', cue: 'hush', i: 0.2, base: { plate: 'door', particles: 'none' } }, [
  N('The soup was the fifth try, and it had been hot when he left the kitchen. He took the last eleven steps slowly.', '', { p: { plate: 'cookhouse', ...pan(1.0, 0.3, 0.5, 1.2, 0.5, 0.6, 8) } }),
  N('Her door was oak, banded in iron, with a peephole at the height of a guard\'s eye. He had never used the peephole. Under the door lay a line of lamplight, and he stopped at the edge of it.', 'GN:ready@.3*.8', { cue: 'dread', i: 0.25, p: { zoom: 1.15, focusX: 0.5 } }),
  GEN('One.', 'GN:ready@.42*.8', { cue: 'dread', i: 0.3, p: { zoom: 1.35, focusX: 0.48, focusY: 0.6 } }),
  N('His paw came up as far as the wood and stayed there.', '=', { p: { zoom: 1.35, focusX: 0.48, focusY: 0.6 } }),
  GEN('Two.', '=', { p: { zoom: 1.35, focusX: 0.48, focusY: 0.6 } }),
  M('♪ Slow the rain, slow the thunder. Slow the thorn that holds you under. ♪', '=', { cue: 'meeca', i: 0.5, sting: 'bloom', p: { zoom: 1.35, focusX: 0.48, focusY: 0.6 } }),
  N('His wife had hummed it over the kettle for forty years, always a little flat. Meeca sang it in tune. It was worse.', 'GN:ready@.42*.8', { cue: 'sorrow', i: 0.4, p: { zoom: 1.35, focusX: 0.48, focusY: 0.6 } }),
  N('He didn\'t say three.', '=', { cue: 'hush', i: 0.2, p: { zoom: 1.35, focusX: 0.48, focusY: 0.6 } }),
  N('He set the bowl on the stool and moved it an inch, so it sat square to the wall. Then he walked down the corridor, counting, and lost the number at the stairs.', 'GN:ready@.7*.8', { cue: 'tender', i: 0.3, p: pan(1.1, 0.55, 0.6, 1.0, 0.5, 0.5, 9) }),
]);
