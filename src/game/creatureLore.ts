/**
 * A short backstory for every creature card in the satchel (Matt, 2026-10-31: "If you click on them, it tells you a little brief
 * backstory"). Two or three sentences each, in the narrator's plain voice, with a line from Pokey or Dot where it helps.
 *
 * PLACEHOLDERS until Matt approves them (sent to the lead as a list, 2026-11-01). Keep each under about 45 words: it is read on a phone.
 */
export const CREATURE_LORE: Record<string, string> = {
  // ── predators ──
  snake: 'Golden tree snakes sleep in the sun all morning and are cross about it all afternoon. They rear up and sway to look bigger. Dot says it works on her every time.',
  boa: 'The boa has lived on the same low branch for nine years and considers the whole tree hers. She is never in a hurry. Pokey respects that, from a distance.',
  eagle: 'Harpy eagles see a beetle move from a mile up. Their shadow arrives first, which is the only polite thing about them. Hide in a bush and wait.',
  turtle: 'Snapping turtles have been on the riverbank longer than the village. They dislike visitors, boats, weather and especially being kicked. They forgive nobody, but they forget quickly.',
  ocelot: 'Ocelots hunt the grotto at night and nap through the day in the moss. This one crouches before it pounces, every single time. It has never noticed that it does.',
  jaguar: 'The jaguars of the cascades answer to nobody. Some of them wear collars now, and those ones look tired. Pokey thinks that is the saddest thing in the jungle.',
  spider: 'Jumping spiders in the orchids work for the Queen, or say they do. They crouch, wiggle, then rush. "Very bad manners," says Dot, "for something with eight legs."',
  tayra: 'A tayra will steal anything left out: fruit, eggs, a note, a hat. It stands up to sniff before it runs. Hop over it and keep your satchel shut.',
  caiman: 'Spectacled caimans float in the black water of the mangrove with only their eyes showing. Stomping does nothing: their backs are armour. They are very proud of this.',
  harpy: 'The night harpy is the eagle\'s cousin, who works the late shift. It slides in low and stomps. Dot will not talk about it, which means it scared her once.',
  frog: 'Poison dart frogs are small, bright and completely sure of themselves. Everything in the jungle knows not to touch them. Pokey touched one once, very nearly. He doesn\'t talk about it either.',
  // ── met on the road ──
  royal_guard: 'The River King\'s guard has stood at the same gate for twenty years and has never once been told what he is guarding. He blocks anyone in front of him, out of habit.',
  capuchin: 'The capuchins of the cascades steal for fun and keep a lookout for the same reason. They never hurt anyone. They just never give anything back.',
  eaglet: 'The Sky Sovereign\'s chicks sleep most of the day and peek the rest. If one sees you, it screams for its mother. Lift your thumb and stay perfectly still.',
  butler: 'The Butler has served the Queen\'s tea for longer than anyone remembers. His cakes are delicious, and anyone who eats one falls asleep for a week. He means well.',
  seamstress: 'The Seamstress knits the Queen\'s silk and never looks up. If you watch her work, you start to feel sleepy too. Best to slide on past.',
  soldier: 'Iron-Claw\'s soldiers march in a straight line and sleep in a straight line. Most of them joined for the uniform. None of them have asked where they are going.',
  pell: 'Lieutenant Pell is the General\'s right claw. He found Meeca when she stopped to look at a flower. He has thought about that more than he will say.',
  // ── guardians ──
  guardian_1: 'Venom Fang guards the Emerald Canopy because nobody else wanted the job. A collar from the north holds him there now. Underneath the hissing, he is mostly tired.',
  guardian_2: 'Crocus Rex crowned himself king of the river and wears the crown crooked so everyone can see it is real. He makes the village wait for everything, because he can.',
  guardian_3: 'The Shadow Prowler was the bravest jaguar in the grotto until the horn sounded and the collar turned red. He warned Pokey to run. He was sorry about the ledge.',
  guardian_4: 'The Sky Sovereign rules the mist from above the clouds and guards her eaglets fiercely. She is not cruel. She just has very high standards for who comes near the nest.',
  guardian_5: 'The Tarantula Queen keeps the oldest tea table in the jungle, with one chair always empty. She knows what the Pact really is. She tells Pokey, over tea.',
  guardian_6: 'The Marsh Reaver hunts the black water of the mangrove with a spear and a very strict lunch hour. The General pays him well. It is never enough, he says.',
  guardian_7: 'The Stone Idol Golem woke when the ruins were built and has sat by its ten stone chairs ever since, waiting for the eleventh guest. It is very patient, for a rock.',
  guardian_8: 'The Night-Wing Monarch rules the treetops by moonlight and hates the dawn. The fireflies are her subjects. Most of them would rather be Flicker.',
  guardian_9: 'The Magma Drake lives at the top of the volcano and is very bad at visitors. She has not had one in a hundred years and has forgotten how. She tries.',
  guardian_10: 'General Iron-Claw holds the Highland Fortress and every collar in the jungle. He was Meeca\'s grandfather once, before he was the General. He still keeps a chair.',
};

export const loreFor = (id: string): string => CREATURE_LORE[id] ?? '';
