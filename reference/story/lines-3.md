# World 3, the Mossy Grotto: the player lines, approved by the story keeper (KEEPER-3X, written 7:33 PM ET 11-19)

Authority: Matt 11-13, "the storykeeper has full authority to add to the story and to approve all lines" (packet
reference/packets/2026-11-20/KEEPER-3X.md). For World 3's builds: the designs are origin/t-design-31-32 (3-1.md, 3-2.md),
origin/t-design-33-35 (3-3.md..3-5.md), origin/t-design-36-39 (3-6.md..3-9.md, 3-hidden.md); the picks and the lead's rulings are
reference/design/PICKS-29-32.md, PICKS-33-35.md, PICKS-36-39.md (origin/ccr-ea739a2f-dfcee4). Read from each design: only its "For the story
keeper" asks and its beat table's "he feels" column.
Checked on origin/main 6e7b85f8f: stagePlan.ts:76-86 (World 3's rows), goalLine :197, SEALED_LINES :208, GOAL_WORDS :216, countWord :233;
engine.ts:8248 (the ring's 'go' line), :8273 (its 'open' line); goals.ts:76-83 (only a harvest or a `gathers` stage counts petals);
predators/world3.ts:11-33 (OCELOT, JAGUAR); roster.ts:31 (World 3's cast); journal.ts:31-32 (the ocelot and jaguar cards);
journal.test.ts:29 (tips 12 words or fewer, touch words); creatureLore.ts:13-14, 31; pokeyJournal.ts:71-79; stageClue.ts:38-46;
finds.ts:418-421 (World 3's find hints); protoStage.ts:2536 (the things' names); thornVine.ts:1-3; STORY-REWRITE.md:381-397 (where
Grandma's things came from). World 3: the patience world. The prowlers are never hurt by Pokey (they yawn home, look away, flee the light);
Grandma's things are found in the ferns. Dot's voice: lines-2-5.md (origin/t-keeper-25), STORY-KEEPER.md §2-3.
Every speech line is under 10 words (STAGE-RULES §5b.7); every journal tip is 12 words or fewer in touch words. Counts are `wc -w`.

## The four conflicts, settled

| # | Stage | Old (verbatim) | New (verbatim) | Why, in one line |
|---|---|---|---|---|
| 1 | 3-2 mission, stagePlan.ts:78 | Something is watching. Keep low and keep moving. | Prowlers never look up. Hang high, and stay out of the light. | He crosses on the roof roots over ocelots that see 80 px tall (world3.ts:13); "keep low" told him the one wrong thing, and "the light" is the rule that still catches him up there (3-2.md's lit patches). |
| 2 | 3-8 mission, stagePlan.ts:84 | Swing past the thorn vines without touching the thorns. | Ride the sleeping thorn vines. Let go when an eye opens. | The sleeping vines ARE the swings (PICKS-36-39 "3-8"): he holds them, so "without touching" is false from the first beat; the new line is the whole rule (hold while asleep, go on the eye). |
| 3 | 3-9 goal words (GOAL_WORDS / countWord / engine.ts:8248) | Mission stays: "Break out of the Prowler's ring and reach the shrine." Count words today: "Defeat {n} predators to open the sanctuary"; ring line "Prowlers out of the dark! Drive them all off to open the way" | Count words for World 3's gauntlet: verb "Slip past", noun "ring"/"rings" ("Slip past 3 rings to open the sanctuary" / "Still 1 ring to slip past before the sanctuary opens" / "Sealed: slip past 1 more ring to open it"); countWord "rings"; ring line (World 3 prowler rings): "Eyes all round us. Oh, I don't like this." | **Break out wins.** The stage's idea is the light as bait: they look away and he slips behind (3-9.md beats 1-8); most rings are slipped, not driven off (3-9.md:74), and no prowler is ever beaten. A drive-off count of 14 (PROWLER_GOAL_39, protoStage.ts:318) would ask for the thing the stage teaches him not to do. Engine ask (the lead's): the ring opens and counts when he is out of it; the design's three rings (beats 3, 6, 8) are the count. |
| 4 | 3-7's things, protoStage.ts:2536 | teacup, spectacles, thimble, ball of wool, seed pouch (five names, six finds) | teacup, spectacles, thimble, ball of wool, seed pouch, button tin | A sixth thing, apron-sized as the story says they are (Meeca keeps Grandma's things in her apron, STORY-REWRITE:387), so no find repeats a name. A tin of buttons also rattles, which is the stage's rustle. |
| 5 | 3-7's jaguar (first met there; PICKS-36-39 ruling d) | journal.ts:32 tip: "Flick up when it crouches to leap. Three hits beat it." | Dot's line before beat 8: "Jaguar above! When it growls, hide in a fern!" Journal tip: "Hear the growl? It drops where you stood. Step aside or hide." | Its tell is the growl and it comes down where he stood when it growled (world3.ts:24-26); the old tip told a child to hit a World 3 cat three times. The new tip is true wherever the jaguar is met (roster.ts:31, :36-37). |

Other conflicts found and settled (the same mistake in its pairs, LESSONS D21):
- **3-6 has the same gap: five finds (GRANDMA_GOAL_36 = 5), four names** (locket, rattle, teddy bear, bell). New list: locket, rattle,
  teddy bear, bell, **garden trowel** (she kept the Heartbloom fifty years). And a builder's note, not mine to fix: the name is picked by
  `id % THINGS.length` where `id` is the stage's shared collectible counter (protoStage.ts:2541), so names can repeat even with enough of
  them; it should index by `thingsPlaced`. The lead's, for 3-6's builder.
- **3-3's count words.** "Defeat {n} predators" (GOAL_WORDS :227) is false in World 3, where nobody is beaten. New for World 3's purge:
  verb **"Send home"**, noun **"prowler"/"prowlers"** ("Send home 8 prowlers to open the sanctuary" / "Still 3 prowlers to send home before
  the sanctuary opens"); countWord "prowlers". The 3-3 design asked (ask 5): "send home" fits better. Yes. Any HUD card that says "Defeat"
  for a World 3 purge (hud/goalInfo.ts:120-145) follows these words.
- **3-5's mission** "The old thorn vines are asleep. Do not wake them." (stagePlan.ts:81) -> **"The old thorn vines are asleep. Take the
  quiet way down."** The twist has him wake them on purpose (3-5.md beat 6): the rule is quiet, not never, and "The Quiet Way Down" is the
  design's own name for it.
- **Pokey's pages that the new stages made false** (pokeyJournal.ts):
  - `'3-2'` old: "The glowworms only light up if you stand still and listen. Finally, a puzzle made for me." (that is 3-1 now) -> new:
    "Ocelots never look up, so I went along the ceiling. Finally, a puzzle made for me."
  - `'3-5'` old: "Grandma always said these vines were asleep. Most of them were. I threw a pebble for the one that wasn't." (there is no
    throw) -> new: "Grandma always said these vines were asleep. Most of them were. I woke the rest on purpose, from far away."
  - `'3-8'` old: "Swung past the thorns without touching one. Hanging still is the thing I'm best at. It finally paid off." -> new: "Swung
    on the thorn vines while they slept. Hanging still is the thing I'm best at. It finally paid off."
  - `'3-9'` old: "They closed a ring around me, ocelots and a jaguar. I broke out of it. Slowly, but out." (no jaguar in 3-9, 3-9.md:43) ->
    new: "They closed a ring of eyes around me. I threw my light one way and went the other. Slowly, but out."
- **The ocelot's journal tip** (journal.ts:31) "Crouches, then pounces. Tap twice, or flick sideways to kick." teaches kicking a World 3
  cat -> **"Hunts the ground, never looks up. Stand still and it wanders off."** (12 words; true in World 7 and 10 too: OCELOT `still:
  flees`, sight tall 80).
- **For Matt (creatureLore.ts is his, "change only with his OK"):** the jaguar's lore says "The jaguars of the cascades answer to nobody"
  (creatureLore.ts:14), but the jaguar is first met in the grotto (3-7) and never in World 4 (roster.ts:31-37). Proposed: "The jaguars of
  the grotto answer to nobody..." (rest unchanged). The lead asks him, one question.
- **For the builders (finds.ts hints follow the BUILT layout):** `w3_keepsake` "Sleeping Vines: after a log, just before the bell room."
  and `w3_note` "Glowworm Path: past the third flag, before the watching eyes." name rooms and flag counts the new 3-5 and 3-2 may not
  have. Each builder checks its hint against its built stage and sends the keeper a new one if it is false.

## The lines, stage by stage (verbatim; the builder copies these, a test holds them equal)

Ids follow 2-5's: `w3N.key` for Dot's lines, MISSION_3N for the card, `SEALED_LINES['3:type']` held equal to the kit's SEALED_3N. TEACH
lines (said on Normal's default Tips as on Help, D50) are marked T. A dash in "Sealed" means the exit cannot lock: goals.ts:76-83 counts
only a harvest or a `gathers` stage, and GOAL_WORDS has no words for sprint, ascent, stealth or vine_runner, so those exits never seal
(if the lead gives one a `gathers`, the keeper writes its line first).

### 3-1 Into the Grotto (sprint)
| Key | Who, where | Line | Words |
|---|---|---|---|
| `still` T | Dot, 800+ px before beat 1 (the first rim) | Stop at the edge. Glowworms wake for still sloths! | 9 |
| `puff` T | Dot, 800+ px before beat 6 (the puffs light the way) | Puffs light up too! Don't land in the cloud! | 9 |
| `sky` | Dot, once, at beat 9 when he stands still and the glowworm sky wakes | Oh. Oh, Pokey. There's a whole sky down here. | 9 |
| mission | stagePlan.ts:77, REPLACES "Follow the glowworm light down into the grotto." | Stand still, and the glowworms show the way down. | 9 |
| sealed | - (sprint) | | |

### 3-2 Glowworm Path (stealth)
| Key | Who, where | Line | Words |
|---|---|---|---|
| `hang` T | Dot, 800+ px before beat 1 (the safe root); echoes 1-3's "Flick up to grab, slide to creep." (dotLinesData.ts:106) | Jump up, grab a root, and creep along! | 8 |
| `glow` T | Dot, 800+ px before beat 9 (the glow patches) | Mind the glow! In the light, they see you. | 9 |
| mission | stagePlan.ts:78 (conflict 1) | Prowlers never look up. Hang high, and stay out of the light. | 12 |
| sealed | - (stealth) | | |

### 3-3 Footprints in a Circle (purge)
| Key | Who, where | Line | Words |
|---|---|---|---|
| `chime` T | Dot, 800+ px before beat 1 (the first chime stone) | Ring a stone, prowlers come. Puffs send them home! | 9 |
| `yawn` | Dot, once, at beat 1 when the first prowler falls asleep and pads home (with a big soft yawn sound: the lead's audio ask) | Aww, it yawned! Off to bed, then. | 7 |
| `bait` T | Dot, 800+ px before beat 6 (be the bait) | They come where you land, too. Be the bait! | 9 |
| mission | stagePlan.ts:79, REPLACES "Drive off the prowlers circling in the dark." | Ring the stones. The sleepy puffs send the prowlers home. | 10 |
| sealed | SEALED_LINES `'3:purge'` (3-3 is World 3's only purge) | Some prowlers are still up. Ring them home! | 8 |

### 3-4 The Sinkhole (ascent)
| Key | Who, where | Line | Words |
|---|---|---|---|
| `bloom` T | Dot, 800+ px before beat 2 (the first flowers) | Moonflowers open where the moonlight touches. Climb on them! | 9 |
| `rise` T | Dot, 800+ px before beat 6 (the moon rises) | The moon's moving! Keep up, or the flowers close! | 9 |
| `full` | Dot, once, at beat 9 when the whole wall blooms | Every flower open at once. Oh, Pokey, look! | 8 |
| mission | stagePlan.ts:80, REPLACES "Climb the sinkhole wall toward the moonlight." | Climb the moonflowers. They open where the moonlight touches. | 9 |
| sealed | - (ascent) | | |

### 3-5 Sleeping Vines (stealth)
| Key | Who, where | Line | Words |
|---|---|---|---|
| `loud` T | Dot, 800+ px before beat 1 | Thump, and vines wake! Climb down, or land soft. | 9 |
| `wake` T | Dot, 800+ px before beat 6 (wake them yourself) | Wake them yourself, from where they can't reach you! | 9 |
| `moss` T | Dot, 800+ px before beat 8 (moss and the punch) | Moss is quiet. Punches are not! | 6 |
| `oldest` | Dot, once, at beat 9 as the oldest vine's eye follows him (thornVine.ts:2-3's line, cut to fit a box) | Grandma said they were asleep. That one looked! | 8 |
| mission | stagePlan.ts:81 (settled above) | The old thorn vines are asleep. Take the quiet way down. | 11 |
| sealed | - (stealth) | | |

### 3-6 Grandma's Things (relic hunt, 5)
| Key | Who, where | Line | Words |
|---|---|---|---|
| `carry` T | Dot, 800+ px before beat 1 | Carry the glow cap. What it lights is real! | 9 |
| `toss` T | Dot, 800+ px before beat 2 | Tap Kick to toss it. Hands full, no jumping! | 9 |
| `roof` T | Dot, 800+ px before beat 5 (wake the roof) | Set it down under the sleeping roof. Watch! | 8 |
| `lamp` | Dot, once, when Grandma's lamp comes into view (beat 7, before he lights it; she knew the grotto, thornVine.ts:2) | Oh. Grandma's old lamp. Toss the cap up in. | 9 |
| mission | stagePlan.ts:82, KEPT (true: Dot hid them, STORY-REWRITE:387) | Dot hid Grandma's things in the ferns. Find {n} of them. | 11 |
| sealed | SEALED_LINES `'3:relic_hunt'` (3-6 and 3-7, World 3's two searches) | We left some of Grandma's things. Back we go! | 9 |
| names | protoStage.ts THINGS for 3-6 | locket, rattle, teddy bear, bell, garden trowel | |

### 3-7 Which Fern? (relic hunt, 6; runs left)
| Key | Who, where | Line | Words |
|---|---|---|---|
| `listen` T | Dot, 800+ px before beat 1 (ruling c: "go slow or stop") | Go slow or stop. The right fern rustles! | 8 |
| `jaguar` T | Dot, 800+ px before beat 8, the jaguar's first meeting (ruling d), before its safe teach | Jaguar above! When it growls, hide in a fern! | 9 |
| `river` | Dot, once, when the arch shadow's secret opens (beat 7) | Listen. Water, behind the wall. A secret river! | 8 |
| hidden find | the find behind the arch (the design's A) | The Golden Guarana | |
| mission | stagePlan.ts:83, KEPT | All ferns look alike. Find {n} more of Grandma's things. | 10 |
| sealed | `'3:relic_hunt'` (as 3-6) | We left some of Grandma's things. Back we go! | 9 |
| names | protoStage.ts THINGS for 3-7 (conflict 4) | teacup, spectacles, thimble, ball of wool, seed pouch, button tin | |

### 3-8 Thorn Vine Swing (vine runner)
| Key | Who, where | Line | Words |
|---|---|---|---|
| `ride` T | Dot, 800+ px before beat 1 | Ride the sleeping vines. Eye opens? Let go! | 8 |
| `oldvine` | Dot, once, whispered as the Old Vine comes into view (beat 8) | Shh. That's the Old Vine. Gently now. | 7 |
| mission | stagePlan.ts:84 (conflict 2) | Ride the sleeping thorn vines. Let go when an eye opens. | 11 |
| sealed | - (vine_runner with no `gathers`) | | |

### 3-9 The Prowler's Ring (gauntlet)
| Key | Who, where | Line | Words |
|---|---|---|---|
| `bait` T | Dot, 800+ px before beat 1 (the safe taste) | Toss the light where you aren't. They'll all look! | 9 |
| `ringgo` | the ring's 'go' line for World 3 prowler rings (engine.ts:8248's prowler branch; conflict 3): story, not a second tip | Eyes all round us. Oh, I don't like this. | 9 |
| `hold` T | Dot, 800+ px before beat 7 (the light they won't cross) | Hold the light up. They won't come into it. | 9 |
| `lair` | Dot, once, at the exit (beat 9), the last line before the lair: she asks if he has eaten when it is real (STORY-KEEPER §2) | His den. Shadow Prowler. Have you eaten anything, Pokey? | 9 |
| mission | stagePlan.ts:85, KEPT (conflict 3) | Break out of the Prowler's ring and reach the shrine. | 10 |
| sealed | SEALED_LINES `'3:gauntlet'` (said only if a ring can be left behind unslipped) | A ring's still shut back there. Slip past it! | 9 |
| `ring:open` | engine.ts:8273, KEPT | The way is open! | 4 |

### World 3's hidden stage: The Glowworm River
| Key | Who, where | Line | Words |
|---|---|---|---|
| name | the stage's name (PITCH-36B's working name, approved) | The Glowworm River | |
| `stars` T | Dot, before beat 1 (the safe teach) | Stand still, stars show the rocks. Move, they dim. | 9 |
| `dome` | Dot, once, whispered at beat 8 when the whole dome wakes | Pokey. Look up. Don't say anything. | 6 |
| mission | its stage card | Ride the glowworm river. Stand still, and the stars show the rocks. | 12 |
| reward | **(a), without a keepsake**: World 3 already has its one keepsake, the medal (finds.ts:108, in 3-5), and a second would break "one a world" and the ending's tea table. The reward is the stage itself, the Glowworms card, and Pokey's page below. The lasting gifts stay with Thornbark's secret (secret.ts). | | |
| Pokey's page | pokeyJournal, keyed by the hidden stage's id | A river under the grotto, with its own night sky. I floated under it for a long time. Nobody asked me to hurry. | |

## The journal (fact-checked)

Two tips replace old ones (above: ocelot, jaguar). Five new cards, each a road card (journal.ts ROAD_ENTRIES: a name, a tip, `first: 3`,
the stages that hold it). **Each needs a picture (journal.test.ts:20-25: every card has art) and each adds to the Naturalist medal's count
(badges.ts JOURNAL_CARDS): the lead's call, and Matt's if the medal total moves.** Until then the words sit here ready. The lore lines are
for the card's back, written as creatureLore.ts writes them (the narrator: plain, warm, at most one dry aside).

| Card | Stages | Tip (12 words or fewer) | Lore |
|---|---|---|---|
| Glowworms | 3-1, 3-2, the hidden stage | Baby gnats that glow to catch supper. Stand still to see them. (12) | Glowworms are the babies of a tiny fly, the fungus gnat. Each one hangs sticky threads from the cave roof and glows to bring insects to them. In Waitomo, in New Zealand, whole cave ceilings shine with them. Real ones dim slowly when bothered. These ones wait for a sloth to stand still. |
| Moonflowers | 3-4 | Opens at night, shuts at sunrise. Here, it opens to moonlight. (11) | Moonflowers are vines from the warm Americas. Their big white flowers open in the evening and close when the morning sun touches them, and night moths come for their sweet smell. These ones open wherever the moonlight lands. |
| Thorn Vines | 3-5, 3-8 | Asleep, they hang like ropes. When an eye opens, get clear. (11) | The real thorn vines of these forests are climbing palms, called the American rattan. Each leaf ends in a whip of hooks that catches on the trees and climbs to the canopy, then hangs down like a rope. Grandma always said they were asleep. |
| Glow Caps | 3-6 | Real mushrooms can glow. Carry one, and see what's really there. (11) | About seventy kinds of mushroom glow in the dark, a soft green. In Brazil one grows at the foot of young palm trees, and people once found children playing with it at night. Old woodsmen called the glow in rotten logs foxfire. |
| Ferns | 3-6, 3-7 | Ferns grow from dust-small spores. Lots of things hide under them. (11) | Ferns are older than the dinosaurs. They have no flowers and no seeds; they spread by spores as small as dust, from the brown dots under their leaves. New leaves come up curled tight and unroll slowly. Dot says some ferns are rude. |
| Ocelot (tip only) | as today | Hunts the ground, never looks up. Stand still and it wanders off. (12) | creatureLore.ts:13, unchanged |
| Jaguar (tip only) | as today | Hear the growl? It drops where you stood. Step aside or hide. (12) | creatureLore.ts:14, Matt's (see above) |

**Nature check** (what each fact rests on; checked 11-19 with the sources named):
- Glowworms are fungus-gnat larvae (*Arachnocampa luminosa*) that glow to lure insects into sticky silk threads (Te Ara, teara.govt.nz
  "Glow-worms"; Massey University thesis, Broadley 1998). They do NOT switch off at once when disturbed: dimming takes several minutes
  (Science Learning Hub, sciencelearn.org.nz "Glow-worms"), so the card says "dim slowly", and the instant waking is our story's, as
  3-1.md ask 4 says.
- Ocelots hunt mostly on the ground at night, though they climb and swim well; jaguars usually hunt on the ground by stealth and
  sometimes drop on prey from branches (San Diego Zoo factsheets, ielc.libguides.com; Rainforest Alliance "Jaguar"; a Guatemala
  camera-trap study, WCS, both cats taking mostly ground prey).
- Moonflower (*Ipomoea alba*): a night-blooming morning glory native to tropical North and South America; opens in the evening, lasts
  until touched by the morning sun; moth-pollinated (Wikipedia "Ipomoea alba"; NC State extension).
- *Desmoncus*, the American rattan: the only American palm genus that climbs; its leaves end in a whip armed with hooks that carry it
  20-30 m into the canopy (Britannica "Desmoncus"; Am. J. Botany 2008 via PMC2802813; Smithsonian Arecaceae notes).
- Glowing mushrooms: about 65-71 known kinds; *Neonothopanus gardneri* ("flor-de-coco") grows at the base of young palms in Brazil and
  was first recorded in 1840 when boys were seen playing with a glowing object; "foxfire" is the glow of honey-mushroom threads in rotten
  logs (ScienceDaily 2011-07-06; SFSU news 2011; WUNC 2015).
- Ferns: spore plants with no flowers or seeds, older than the dinosaurs; spores in the sori under the fronds; new fronds unroll from
  coiled fiddleheads (general botany).

## Why each line, and its check (one line each)

- 3-1 `still`: the stage's one idea in a child's words, with the pun the world is built on ("still sloths"). *9 words; said before the
  first rim, where stopping is free.* `puff`: the twist's danger in one clause (the cloud), the help in the other. `sky`: Dot's dead stop
  when something is real (STORY-KEEPER §2); it pays off the design's "There's a sky under the ground!"
- 3-2 `hang`: the move, in the order he does it, echoing 1-3's card. `glow`: the one rule that still catches a hanging sloth (lit
  patches), said before the patches, not a repeat of the mission.
- 3-3 `chime`: input and resolution together (ring, they come, the puffs send them home), with "home" matching the count words.
  `yawn`: makes it bedtime, never fear (ask 3); the sound does the rest. `bait`: the twist named the design's way.
- 3-4 `bloom`, `rise`, `full`: the teach, the twist (the light moves), and wonder with no instruction in it.
- 3-5 `loud`: the rule and both ways round it. `wake`: the twist, told as permission (the mission no longer forbids it). `moss`: the two
  noises of the combine in five words. `oldest`: Grandma's line from thornVine.ts, cut to fit, so the vine she talked about is the one
  that looks at him.
- 3-6 `carry`: "what it lights is real" is the stage's promise (PICKS-36-39). `toss`: the button and the cost (no jump) together; Kick
  is the pad's name for it (3-6.md ask 2). `roof`: says what to do, not what happens. `lamp`: Dot goes quiet for Grandma, and the line is
  also the signature's instruction.
- 3-7 `listen`: the lead's ruling c in Dot's mouth. `jaguar`: the tell (the growl) and the answer (a fern), both true on the kit.
  `river`: the secret heard before it is seen, in a world about listening.
- 3-8 `ride`: the whole rule, in the order it happens. `oldvine`: a whisper, so the signature feels like the biggest sleeper.
- 3-9 `bait`, `hold`: the two light rules (lying = lure, carried = flee; 3-9.md:71-72), each before its beat. `ringgo`: Dot's nerves, so
  the ring's arrival is a feeling, not a third tip. `lair`: the last line before a guardian is Dot being a second mother.
- Hidden `stars`, `dome`: the river's only rule, then a whisper at the dome. No keepsake (one a world).

**Checks run:** every speech line counted with `wc -w` (all 9 or fewer); every journal tip 12 or fewer with no press/key/button/space/
arrow/click; no workshop word (whatsNew.test.ts:28's list); no "I" from the General (none speaks here); Dot is she; no winter; no
prowler is hurt by Pokey in any line; no line repeats another stage's.

Learned (for the next keeper): read each stage's GOAL_WORDS before its mission line, not just the mission: World 3's count words said
"Defeat" in a world where nobody is beaten, and no design asked about it.
