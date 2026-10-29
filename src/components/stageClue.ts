/**
 * What Pokey finds at the end of each stage, on the Stage Cleared card: `title` is the name of the find, `text` what he sees. One per
 * stage, keyed by its full id (polish report ST-4: the old nine clues repeated in every world, and one of them broke the story), in the
 * narrator's voice, in the order the story goes: Meeca's trail and the soldiers' in Worlds 1-4, her five carved warnings in World 5
 * (MEECA_WARNINGS, in the order Pokey finds them), Flicker from World 6 on, Dot gone in World 7 and back from World 8.
 */
export interface StageClue {
  title: string;
  text: string;
}

const C = (title: string, text: string): StageClue => ({ title, text });

export const STAGE_CLUES: Record<string, StageClue> = {
  // ── World 1 · Emerald Canopy
  '1-1': C('A Bootprint', 'One deep bootprint in the moss, pointing north. They did not stop here.'),
  '1-2': C('Low on the Bark', 'Another petal, low on the bark, where you would not have to look up.'),
  '1-3': C('A Shed Skin', 'A snake skin hangs from a branch, neatly folded. The snake here is tidy.'),
  '1-4': C('The View North', 'From the top of the kapok you can see the Highlands. They are very far.'),
  '1-5': C('Petals in a Row', 'The petals run in a straight row here. She must have been humming.'),
  '1-6': C('A Cut Liana', 'One liana hangs cut short. The soldiers did not swing. They went around.'),
  '1-7': C('A Very Good Bush', 'The bush Dot hid in. It still has a small, worried dent in it.'),
  '1-8': C('Squirrel Tracks', 'Tiny tracks run beside yours. The squirrels have been checking on you.'),
  '1-9': C('Coiled Branches', 'The branches ahead are wrapped in coils. The snake is close.'),
  '1-10': C('An Itchy Collar', 'Venom Fang scratches at his collar and pretends he is not watching you go.'),
  // ── World 2 · Sunlit Riverbank
  '2-1': C('PLEASE BE PATIENT', 'Every door in the bank village has the same sign. You like it here already.'),
  '2-2': C('A Bare Stem', 'A flower stem with no petals left on it. She used them all on the crown.'),
  '2-3': C('Wet Footprints', 'Little wet footprints run off into the reeds, very fast, very grateful.'),
  '2-4': C('A Shadow Underwater', 'Under the still water, a long shadow with a crown on its head.'),
  '2-5': C('The Raft', 'The village has started on your raft. They have agreed on the wood.'),
  '2-6': C('A Welcome Mat', 'A mat outside the top house says TAKE YOUR TIME. They mean it.'),
  '2-7': C('URGENT', 'The mailman\'s package rests on a step. It still says URGENT, in red.'),
  '2-8': C('Open Cages', 'The reed cages hang open, and the water is still rising, slowly.'),
  '2-9': C('A Crooked Crown', 'A crooked crown of petals floats past. Somebody will want that back.'),
  '2-10': C('Never Crooked', 'Crocus Rex straightens his crown with one claw, then puts it back crooked.'),
  // ── World 3 · Mossy Grotto
  '3-1': C('Glowworm Threads', 'The glowworms light up as you pass. They seem to like slow visitors.'),
  '3-2': C('Still Water', 'A pool so still it holds the ceiling\'s lights like a second sky.'),
  '3-3': C('The Circle', 'The big footprints go round in a circle again, and stop where you are standing.'),
  '3-4': C('Moonlight', 'At the top of the sinkhole, a coin of moonlight. The way out is up.'),
  '3-5': C('A Dreaming Thorn', 'One thorn vine twitches as you pass, then settles. It is dreaming.'),
  '3-6': C('A Rustling Fern', 'A fern rustles. It might be the wind.'),
  '3-7': C('Rude Ferns', 'Dot points out the rude ferns. They look exactly like the polite ones.'),
  '3-8': C('Something Still', 'The dark ahead is very still. It is being still on purpose.'),
  '3-9': C('Claw Marks', 'Long claw marks on the rock, too high up to be friendly.'),
  '3-10': C('Sorry', 'The Prowler watches you from his ledge. He looks sorry about something.'),
  // ── World 4 · Mist Cascades
  '4-1': C('A Clean Break', 'The ledge was cut, not cracked. Somebody wanted it to fall.'),
  '4-2': C('A Long Feather', 'A feather as long as your arm, drifting down out of the mist.'),
  '4-3': C('Behind the Falls', 'Behind the water the rock is dry and quiet. You could sleep here. You don\'t.'),
  '4-4': C('The Wind Lane', 'The wind always blows the same way up here. North, mostly.'),
  '4-5': C('A Shadow Overhead', 'A great shadow passes over, and then, a moment later, the sound of it.'),
  // Dot's netting flight: no clue of Meeca's on the way, just the note delivered
  '4-D': C('Still Here', 'Meeca\'s note came out through the gap as wide as a folded letter. A white feather stayed behind on the thorns.'),
  '4-6': C('Old Orders', 'The nests are woven from old orders. You can still read SEAL THE PASS.'),
  '4-7': C('Soft Landing', 'Moss at the bottom of the long drop, thick as a bed, and just as welcome.'),
  '4-8': C('Eaglets', 'The eaglets you freed are already arguing about who flies first.'),
  '4-9': C('Talon Gouges', 'Fresh talon marks on the rock. The Sovereign lands here.'),
  '4-10': C('On the Ground', 'The Sky Sovereign stands on the ground and looks at it as if it might bite.'),
  // ── World 5 · Orchid Sanctuary: her five warnings, cut with a hairpin as she ran
  '5-1': C('A Carving', 'Cut into the bark, shaky and quick: POKEY. DON\'T SIT. M.'),
  '5-2': C('Another Carving', 'Lower down, in the same small hand: DON\'T EAT. M.'),
  '5-3': C('Closing Early', 'The orchids are folding up, and it is barely afternoon.'),
  '5-4': C('By the Web', 'Cut beside a web, deeper than the others: HANDS OFF THE SILK. M.'),
  '5-5': C('A Slipped Hairpin', 'A long scratch across the bark, where the hairpin slipped.'),
  '5-M': C('One Night Out', 'She learned every warning the hard way first, and cut it into a tree for you.'),
  '5-6': C('By a Little Table', 'Carved into the leg of a tea table: NO TEA. BE RUDE. M.'),
  '5-7': C('A Humming Thread', 'One silk thread hums when the wind touches it. The others hum back.'),
  '5-8': C('The Last Carving', 'High in a bloom tree: DON\'T STOP TO LOOK. LOVE, M.'),
  '5-9': C('A Set Table', 'A table set for two, the pot still warm. It is always warm.'),
  '5-10': C('A Full Cup', 'The cup at the head of the Queen\'s table is full. It always is.'),
  // ── World 6 · Deep Mangrove
  '6-1': C('Flat Water', 'The water between the roots lies flat and gray, and very patient.'),
  '6-2': C('A Spear Tip', 'A spear tip breaks the water, turns to look at you, and sinks again.'),
  '6-3': C('A Stain', 'A stain on a leaf, about the shape of lunch.'),
  '6-4': C('Webbed Prints', 'The tide is out. Big webbed prints lead off into the roots.'),
  '6-5': C('Noon', 'The sun is nearly straight overhead. Lunch is coming.'),
  '6-6': C('A Small Light', 'A small light rides on the satchel strap. It says it is just passing.'),
  '6-7': C('Something of Dot\'s', 'A green feather tucked in the roots, where only you would look.'),
  '6-8': C('Dry Wood', 'Up on the stilts the wood is dry, and you cannot hear the water.'),
  '6-9': C('Ripples', 'Ripples cross the black water, all of them coming from one place.'),
  '6-10': C('Half a Lunch', 'Half of the Reaver\'s lunch sits on a root, facing the path.'),
  // ── World 7 · Ancient Ruins (Dot is gone; Flicker is the light)
  '7-1': C('Heavy Footprints', 'The temple floor is scuffed by something heavy that walks very slowly.'),
  '7-2': C('Brown Vines', 'The old vines do not move when you touch them.'),
  '7-3': C('The Eleventh Chair', 'A plain chair stands apart from the ring, with a dent worn in the seat.'),
  '7-4': C('Old Words', 'Words cut into an old stone by the path: SLOW IS NOT STOPPED.'),
  '7-5': C('Quiet Halls', 'The halls are quiet now. The quiet is louder without Dot.'),
  '7-6': C('Falling Dust', 'Dust is still falling from the ceiling. You were quicker than the floor.'),
  '7-7': C('A Folded Cloth', 'Behind a broken rune, a hollow, and a cloth folded around something flat.'),
  '7-8': C('Ten Friends', 'Flicker lights a carving of ten friends around one table, arguing.'),
  '7-9': C('A Long Good Morning', 'Somewhere ahead, a very large voice has started saying good morning.'),
  '7-10': C('An Unfinished Sentence', 'The Golem is still working on his sentence. He waves you on, slowly.'),
  // ── World 8 · Twilight Treetops (Dot is back)
  '8-1': C('Fireflies', 'The fireflies come out one by one. Flicker nods to each of them.'),
  '8-2': C('Night Blooms', 'The night blooms only open after dark. They understand slow.'),
  '8-3': C('Moon Shadow', 'Something passes in front of the moon, and the whole branch goes dark.'),
  '8-4': C('Tiptoes', 'Every bat is still asleep. You have never tiptoed better.'),
  '8-5': C('Hover-Sitting', 'Dot rests on your head. She says it is hover-sitting. It is sitting.'),
  '8-6': C('A Small Square of Light', 'From up here the fortress window is a small square of light.'),
  '8-7': C('Smoke in the North', 'From the top of the tallest tree you can see smoke in the north.'),
  '8-8': C('Soft Wings', 'Wingbeats overhead, very soft. Somebody up there is writing things down.'),
  '8-9': C('A Torn Page', 'A page caught in the branches, in neat writing: "He said petal again."'),
  '8-10': C('A Good Ending', 'The Monarch is writing down how the dream ends.'),
  // ── World 9 · Volcanic Jungle
  '9-1': C('Pepper Air', 'The air tastes like pepper. Dot sneezes, and pretends she did not.'),
  '9-2': C('Warm Rock', 'The rock is warm through your paws. Keep moving.'),
  '9-3': C('Embers', 'Embers drift up through the canopy and go out in the leaves.'),
  '9-4': C('A Doormat', 'A doormat at the edge of the lava. WELCOME, it says, and then, smaller, GO AWAY.'),
  '9-5': C('The Mountain Breathes', 'The vents breathe out, and in, and out. The mountain is asleep. Mostly.'),
  '9-6': C('A Lantern Stake', 'An old lantern stake in the ash. The soldiers camped here weeks ago.'),
  '9-7': C('Cooled Steps', 'The lava cooled into steps here, as if it wanted to help.'),
  '9-8': C('Too Much Thread', 'Pell\'s thread runs off toward the fortress. He bought a great deal of it.'),
  '9-9': C('One Teacup', 'A single teacup on a rock, freshly dusted. Somebody has been tidying.'),
  '9-10': C('Two Cups', 'The Drake asks you to bring tea next time. Two cups.'),
  // ── World 10 · Stormy Highlands
  '10-1': C('The Netting', 'The iron thorns hum in the wind, from the ground up into the clouds.'),
  '10-2': C('Into the Rain', 'The steps go on up into the rain. You stop trying to see the top.'),
  '10-3': C('Still Holding', 'The thunder passes. Your paws are still on the rock. That is all right.'),
  '10-4': C('A Lit Window', 'Above you, one window is lit. It is closer than it was.'),
  '10-5': C('A Song', 'Halfway up, between the thunder, someone is singing a song you know.'),
  '10-6': C('Bad Stitches', 'A place in the netting where the stitches are wrong. Very badly wrong.'),
  '10-7': C('Empty Walls', 'The guards are gone from the walls. They looked tired anyway.'),
  '10-8': C('The Gate', 'The fortress gate stands open, and the wind is not the one holding it.'),
  '10-9': C('The Last Step', 'One step left, and a door with a line of lamplight under it.'),
  '10-10': C('Lost Count', 'The General has stopped counting. Up in the tower, the song goes on.'),
};

/** a stage with no clue of its own (the secret stages): the trail goes on */
const ONWARD = C('The Trail Goes On', 'Meeca\'s trail goes on, north.');

export function getStageClue(levelId: string): StageClue {
  return STAGE_CLUES[levelId] ?? ONWARD;
}
