# Story gap map: a beat every three stages (story-gaps, phase 1)

Oct 30, 2026 · for the lead, then Matt

Matt's question: "how are we planning to implement the story throughout the game so that there's not big gaps in it like there is today?"
The rule he approved: every world has a story beat at its start, its middle and its end, and no stretch of more than about three
stages passes without one.

**Checked against** story-a `4fdbd600` (what lands today: satchel, journal, finds, ending cards, the teacup scene) on top of
ccr `5a747006`. No game file was changed for this map.

## What counts as a beat

A beat moves the story or a relationship: a scene, Meeca's note, a line that plants or pays off something, a side character coming
back, a line that shows where someone stands with someone else. A joke about the scenery is not a beat, however good it is
("Hot, hot, so hot, I'm a small bird in a big oven" is flavour). Hidden finds (keepsakes, books, Dot's pocket, the snail, the Notch)
are a bonus layer and don't count, because a player can miss them. Meeca's note does count: it sits in plain sight in stage 2.

A **gap** is a run of three or more stages in a row with no beat. Three is "about three", so I flag it: those are the stretches a
player feels as "nothing's happening".

Where the story sits in a world today, and it's the same shape in all ten:

| When | What plays | Code |
|---|---|---|
| Before stage 1 (World 1: after 1-1) | the world's arrival scene | `storyWorlds.ts` `WORLD_STORIES` |
| Stage 2 | Meeca's note, in plain sight | `finds.ts` `w{N}_note` |
| Stages 2 to 9 | one aside per stage, at most (Dot, Pokey, or the Petal narrating), plus one after the first fall | `wayside.ts` `WAYSIDE` (the words said are the new-look text in `dotLinesData.ts` `way.*`) |
| After stage 5 | the halfway scene (World 4: after Dot's flight 4-D; World 5: inside 5-5) | `WORLD_MID`, `midScene.ts` |
| Stage 10 | the guardian's scene, before and after | `storyBosses.ts` |
| After the guardian | the memory scenes and Pokey's journal page | `storyChapters.ts` `AFTER_BOSS`, `pokeyJournal.ts` |

So **start, middle and end are already there in every world**: an arrival, a halfway scene and a guardian scene with its memories.
The gaps are all in the in-between stages, where the aside is a joke about the place. That's good news: the fix is words in the
asides, not new scenes.

## The count

| | Before | After |
|---|---|---|
| Runs of 3+ stages with no beat | **5** (W1, W2, W3, W9, W10) | **0** |
| Longest run | 4 stages (3-6 to 3-9) | 2 stages |
| Stages where Flicker is with Pokey and says nothing in play | all 40 (6-6 to 10-9) | Flicker speaks in 5 stages and one fall line, Dot and Flicker together in 3 |
| Asides that contradict the story | 1 (10-6) | 0 |

**The five biggest gaps**, biggest first:

1. **World 3, 3-6 to 3-9: four stages with nothing.** The player is digging Grandma's locket, rattle, teddy and bell out of the
   ferns, and nobody says one word about Grandma. Fixed with two lines that plant the bell (the finale's last keepsake) and Grandma
   half-raising Pokey (the supper line in the garden memory).
2. **Flicker never speaks while you play.** He's with Pokey for 40 stages, from 6-6 to the gate, and has zero in-stage lines (S-12).
   The Oct 27 plan's approved lines were never placed. Fixed with those lines, plus two new ones.
3. **World 10, right after Dot's confession (10-3 to 10-5).** The biggest scene in the game, then three stages of rain. And 10-6
   says Pokey is still looking for "a small green shape" in the net, when Dot has just come back at the halfway scene. Fixed: Flicker
   keeps his light up "so she can find us" (which the halfway scene then pays off), and 10-6 becomes Dot and Flicker guiding him
   together, as Matt decided.
4. **World 1, 1-7 to 1-9.** The stage is literally called A Very Good Bush and Dot talks about humming. Fixed with the bush, which
   starts the running joke Meeca's notes and the finale already pay off ("Was it a nice bush?").
5. **World 9, 9-3 to 9-5, and World 2, 2-3 to 2-5 (tied).** World 9 gets Dot's best mothering slip ("I didn't raise you"), which
   plants her confession a world early. World 2 brings Gruntlewick back twice, so his flood warning finishing in the finale lands.

## World by world

Key: **★** a beat · **·** flavour only · **◇** a hidden find (bonus, not counted). "New" lines are drafts for approval.
Every new line is short enough to read at a glance (the asides stay up 6.5 seconds at most).

### World 1 · Emerald Canopy

| Stage | Beat today | Gap? | New beat drafted | Where it goes |
|---|---|---|---|---|
| prologue, 1-1 | ★ the prologue; ★ after 1-1, Dot arrives with the first note | | | |
| 1-2 The Petal Trail | ★ Meeca's note ("tell her I saw her in that bush"); · Dot: picking's different | | | |
| 1-3 Branch Snakes | · Dot: "excuse me" before the punch | | | |
| 1-4 Up the Kapok | ◇ the Notch | | | |
| 1-5 Where She Walked | ★ "She squashed this one extra flat." (the trail) | | | |
| halfway | ★ "I Am Fine" | | | |
| 1-6 First Lianas | ★ Pokey: Meeca always waited | | | |
| 1-7 A Very Good Bush | · Dot: she'll hum softly | **gap 1-7 to 1-9** | **Dot** (start): "Get low, low like me in my bush, she says she saw me, she did not." | `wayside.ts` W1 stage 7 + `dotLinesData.ts` `way.1-7` (replaces the hum line) |
| 1-8 The Long Branch | · Pokey: Dot's flown it four times | | | |
| 1-9 The Boa's Branches | · Dot: too small to chase | | | |
| 1-10 Venom Fang | ★ guardian scene; ★ journal | | | |

Why the bush: it's the stage named after it, and it answers the note from 1-2 in Dot's own voice. Kids get Dot denying it; the
notes in Worlds 1 and 3 and the tea ("Was it a nice bush?") pay it off.

### World 2 · Sunlit Riverbank

| Stage | Beat today | Gap? | New beat drafted | Where it goes |
|---|---|---|---|---|
| arrival | ★ Gruntlewick, the mailman, "Are your folks behind you?" | | | |
| 2-1 Down to the River | (just after the arrival) | | | |
| 2-2 Petals for the Crown | ★ Meeca's note; · Dot: a sloth said "Oh" | | | |
| 2-3 Stuck in the Reeds | · Dot: reeds, reeds | **gap 2-3 to 2-5** | | |
| 2-4 Over the Water | · Pokey: could watch this river all day | | | |
| 2-5 River Snappers | · the PLEASE BE PATIENT sign (the same joke as 2-6) | | **Petal** (half): "Up on the bank, Gruntlewick's flood warning has reached the word "however."" | `wayside.ts` W2 stage 5 + `way.2-5` (replaces the repeated sign joke; 2-6 keeps it) |
| halfway | ★ "The Collars" | | | |
| 2-6 Up the Bank Houses | · PLEASE BE PATIENT, every door | | | |
| 2-7 The Mailman's Route | ★ the mailman comes back: "Soon." | | | |
| 2-8 Before the Water Rises | ◇ book; no aside | | **Petal** (start): "The river's rising. Up on the bank, Gruntlewick has just reached that part." | `wayside.ts` W2 stage 8 + new row `way.2-8` |
| 2-9 The River King's Court | ★ Pokey: Meeca admired the whole river out loud | | | |
| 2-10 Crocus Rex | ★ guardian; ★ "The Waiting" memory; ★ journal | | | |

Gruntlewick is the report's first "people who come back" (he's on the bank at the end of 2-1 and 2-7 already, painted). Twice in
play, then he finishes the warning in the weeks after (`storyFinale.ts`), and his ending card starts a new one about Tuesday.

### World 3 · Mossy Grotto

| Stage | Beat today | Gap? | New beat drafted | Where it goes |
|---|---|---|---|---|
| arrival | ★ "I don't do dark"; "Petal? Satchel? Ears?" | | | |
| 3-2 Glowworm Path | ★ Meeca's note; · Dot: hear you, then | | | |
| 3-3 Footprints in a Circle | ★ Dot pats her pouch (the letter) | | | |
| 3-4 The Sinkhole | · the glowworm pretends | | | |
| 3-5 Sleeping Vines | · Pokey: never this quiet | | | |
| halfway | ★ "All Ferns Look Alike" (Grandma's things in the ferns) | | | |
| 3-6 Grandma's Things | no aside | **gap 3-6 to 3-9 (the longest)** | **Pokey** (start): "Grandma rang a bell when somebody was coming home. Mostly me." | `wayside.ts` W3 stage 6 + new row `way.3-6` |
| 3-7 Which Fern? | · Dot: apologised to twelve ferns | | **Dot** (half): "Find the bell, don't ring it, it's for coming home, it isn't for now." | `wayside.ts` W3 stage 7 + `way.3-7` (replaces the fern joke) |
| 3-8 Thorn Vine Swing | · old vines only watch for hurrying | | | |
| 3-9 The Prowler's Ring | · "Seems to me we've been here." | | | |
| 3-10 Shadow Prowler | ★ guardian; ★ "The Horn", "The Map"; ★ journal | | | |

Why these two: the player is picking the bell up in this very stage (the search turns up a locket, a rattle, a teddy and a bell).
Pokey's line is dry and says more than it says: he was the one coming home to Grandma's, so the garden memory's "You're staying for
supper, Pokey. You always are." (after Boss 4) lands as something we already half knew. Dot's line plants the finale, where the bell
is the last keepsake and rings for the first time since Grandma died, and it's Dot thinking about being late without saying so.

### World 4 · the Broken Ledge to the Aerie

No gap. 4-3 (her tail), 4-5 (the mist in the notes), Dot's flight 4-D, the halfway "Feathers", 4-6 (flying low) and 4-7 (the bare
patch) are the best-planted run in the game. 4-4 and 4-8 have no aside and don't need one. Guardian: the Sky Sovereign; after it,
Grandma's garden.

### World 5 · Orchid Sanctuary

No gap. Meeca's own stage (5-M) opens it, with Flicker's "I was the light". Then the arrival, the note, the table set for two (5-2),
the tally marks (5-5) and the pouch scene inside 5-5, Pokey's carved "M" (5-6), Dot checking the pouch (5-8), the Tarantula Queen,
and tea.

### World 6 · Deep Mangrove

| Stage | Beat today | Gap? | New beat drafted | Where it goes |
|---|---|---|---|---|
| arrival | ★ the spear; "Do NOT meet him at noon"; "Noon. It's noon." | | | |
| 6-2 Flat Water | ★ Meeca's note (the soup); · Dot: opinions | | | |
| 6-3 Root to Root | · the water looks back | | | |
| 6-4 Low Tide | no aside | | | |
| 6-5 The Spear | ★ Dot's saving a joke (paid in World 8) | | | |
| halfway | ★ "The Last Note": the tea cost a night, Dot leaves, Flicker arrives | | | |
| 6-6 Lights in the Roots | · Pokey: it's noon somewhere (Flicker is lighting the way and says nothing) | Flicker silent | **Flicker** (start): "Don't look at me. Look where I'm lighting." | `wayside.ts` W6 stage 6 + `way.6-6` (Oct 27 plan, approved word for word) |
| 6-7 Through the Roots | ★ he doesn't touch the sealed note | | | |
| 6-8 Stilt Climb | ★ he leaves room on the root, from habit | | **Petal** (near): "He leaves Dot's room on the root. Flicker sits in it. It's a lot of room." | `way.6-8` (the Oct 27 line, trimmed to read at a glance) |
| 6-9 Blackwater | ★ Pokey: Dot would call it something rude | | keep it | |
| 6-10 Marsh Reaver | ★ guardian; ★ "The Sealed Note", "The Singing Storm", "The Tally"; ★ journal | | | |

The Oct 27 plan also gives 6-9 to Flicker ("It's nearly noon."). Don't: the arrival already says it *is* noon, at 6-1, so "nearly"
contradicts it, and Pokey's line is the better beat (Dot's absence, in his voice).

### World 7 · Ancient Ruins

| Stage | Beat today | Gap? | New beat drafted | Where it goes |
|---|---|---|---|---|
| arrival | ★ "There was only Flicker, which wasn't the same"; ten chairs and an eleventh | | | |
| 7-2 Brown Vines | ★ Meeca's note ("~~I'm fine.~~ I'm tired"); · flowers between stones | | | |
| 7-3 Ten Chairs | ★ he sets the knocked-over chair right (the council, the Golem) | | | |
| 7-4 The Way Up | · statues waiting for someone to finish a sentence (a plant for the Golem) | | | |
| 7-5 Stone Sentries | · the loudest thing in the ruins | | | |
| halfway | ★ "The Quiet" | | | |
| 7-6 Falling Floors | ◇ Dot's pocket; no aside | Flicker silent | **Pokey** (start): "Flicker doesn't say much. When I say Meeca's name, his light goes funny." | `wayside.ts` W7 stage 6 + new row `way.7-6` |
| 7-7 The Photograph | ★ the ledge Dot's size; the Thorn Gate | | | |
| 7-8 The Upper Temple | · the steps were cut for someone bigger | | | |
| 7-9 The Golem's Hall | · slower than me, I feel young | | | |
| after a fall | Petal: the ruins don't argue | | **Petal** (Oct 27, approved): "He tells the ruins "I'm fine," out of habit. Nobody argues. Flicker blinks." and a new fourth, **Flicker**: "Dot would know what to say. I don't. Are you all right?" | `wayside.ts` W7 `hurt` + `way.7.hurt0`, new `way.7.hurt3` |
| 7-10 Stone Idol Golem | ★ guardian; ★ "The Photograph"; ★ journal | | | |

World 7 had no counted gap, but it's where Flicker matters most: Pokey is alone, so Flicker stays nearly silent on purpose. The 7-6
line is Pokey noticing Flicker's tell (his light stutters when he's not telling the whole truth, from the report), and it's paid in
World 9's night scene ("They followed my light."). Flicker's one line, after a fall, is him not knowing how to do Dot's job yet.

### World 8 · As the Light Goes to Monarch's Wood

| Stage | Beat today | Gap? | New beat drafted | Where it goes |
|---|---|---|---|---|
| arrival | ★ the dream, Dot comes back, meets Flicker, the photograph, her secret | | | |
| 8-2 Night Blooms | ★ Meeca's note; ★ Dot: my saved joke's gone | | | |
| 8-3 Long Swings | ◇ snail; no aside | Flicker silent | **Dot, Flicker, Dot, Flicker** (start), the Oct 27 banter, approved: "Flicker, go see if that branch is safe." / "You're faster." / "I'm resting." / "You're hovering." | `wayside.ts` W8 stage 3 + new rows `way.8-3`..; needs the exchange (see Phase 2) |
| 8-4 Bat Roosts | · sneaking at full speed | | | |
| 8-5 Next Branch | ★ "Next branch, then the one after." | | | |
| halfway | ★ "One Branch" (Flicker lights the branch before Dot can say which) | | | |
| 8-6 Glide by Moonlight | ★ a lamp left on for him | | **Petal** (Oct 27, approved): "Flicker's family blinks on along the branch ahead, one by one." | `way.8-6` |
| 8-7 The Tallest Tree | ★ climbing slow so Dot can rest | | | |
| 8-8 Night Hunters | ★ the net tied with a bow (Pell) | | | |
| 8-9 Monarch's Wood | no aside | | | |
| 8-10 Night-Wing Monarch | ★ guardian; ★ "The Lieutenant"; ★ journal | | | |

### World 9 · Volcanic Jungle

| Stage | Beat today | Gap? | New beat drafted | Where it goes |
|---|---|---|---|---|
| arrival | ★ "A visitor!" "Intruder."; Meeca said thank you to him | | | |
| 9-2 Rising Heat | ★ Meeca's note; · a small bird in a big oven | | | |
| 9-3 Ember Canopy | · Dot's sweating | **gap 9-3 to 9-5** | | |
| 9-4 The Drake's Doorstep | · when he says "Visitor" | | | |
| 9-5 Vent Riding | ◇ keepsake; no aside | | **Dot** (start): "Leaf up, hold it properly, I didn't raise you to wobble. I didn't raise you." | `wayside.ts` W9 stage 5 + new row `way.9-5` |
| halfway | ★ "The Lantern" (Pell, the scarf, four bowls of the wrong soup) | | optional, Oct 27: after Pell's "I shall. Sir. Everyone." → **Pell**: "I am sorry. Is the bug with you?" **Dot**: "No." **Pokey and Flicker**: "Yes." **Pell**: "I am sorry. Good evening, sir." | `storyWorlds.ts` W9 mid (a cutscene: Flicker's actor is already in it) |
| 9-6 Ash Fields | ★ not touching the pouch | | | |
| 9-7 Lava Steps | ★ I'd still wear Meeca's scarf | | | |
| 9-8 Pell's Thread | ★ more thread: he wants to be found | | | |
| 9-9 The Drake's Hoard | · Dot's plan for the Drake | | **add after it**, Oct 27, approved: **Flicker**: "What do I do?" **Dot**: "Glow quietly." **Flicker**: "I don't have a quiet setting." | `wayside.ts` W9 stage 9 + `way.9-9`.. (the exchange) |
| 9-10 Magma Drake | ★ guardian; ★ "The Blessing", the night before the mountain, "The Open Gates", "The Door"; ★ journal | | | |

Why "I didn't raise you": Matt's Dot is "almost Pokey's second mother", and the report wants her mothering shown in the middle
worlds. She catches herself. A grown-up hears guilt (she watched over him because she was late the night his parents went out), and
the confession at the foot of the mountain a world later makes sense of it. A kid hears Dot fussing about a leaf.

### World 10 · Stormy Highlands

| Stage | Beat today | Gap? | New beat drafted | Where it goes |
|---|---|---|---|---|
| arrival | ★ the door made for him; Dot's confession; Dot goes; Flicker lights the first step | | | |
| 10-2 The Thousand Steps | ★ Meeca's note ("Bring snacks"); ★ flowers turned toward the tower | | | |
| 10-3 Thunder | ◇ snail; no aside | **gap 10-3 to 10-5** | **Flicker** (start): "Hold on. I'm keeping my light up, so she can find us." | `wayside.ts` W10 stage 3 + new row `way.10-3` |
| 10-4 Holding On | · lightning shows him every step | | | |
| 10-5 Halfway Up | · he loses count | | | |
| halfway | ★ "The Song from the Tower"; Dot comes back; Flicker's light dims, Dot shelters it | | | |
| 10-6 The Iron Netting | ✗ "he looks for a small green shape. Nothing yet." **Wrong now:** Dot came back at the halfway scene | contradiction | **Dot, Flicker, Dot** (half): "Left vine, Flicker, I said left." / "His left." / "Fine. His left." | `wayside.ts` W10 stage 6 + `way.10-6`.. (the exchange; replaces the Petal line) |
| 10-7 The Walls | ★ humming Meeca's song | | | |
| 10-8 The Last Steps | ★ the netting sewn shut, badly (Pell) | | | |
| 10-9 The Fortress Gate | no aside; ★ the gate scene after it ("Flicker, stay with him." "I will.") | | | |
| 10-10 The General | ★ the showdown, the finale, the weeks after, the ending cards | | | |

Why Flicker's line: right after the confession, Pokey is alone in the thunder with the one who promised Dot, the night before, not to
let her stop halfway. Flicker keeping his light up "so she can find us" is him keeping that promise the only way he can. The halfway
scene then pays it off: his light has gone dim in the rain, and Dot holds a wing over it. Pokey says nothing here on purpose; his
answer to Dot is saved for her face in the finale.

10-6 is Matt's decision ("Dot and Flicker guide Pokey together") played as a squabble that has already turned into teamwork: the
jealousy is done, and the gate's "Flicker, stay with him" is two stages away.

## S-12: Flicker in play, all of it

| Where | Line | Status |
|---|---|---|
| 6-6 | Flicker: "Don't look at me. Look where I'm lighting." | Oct 27, approved |
| 6-8 | Petal: "He leaves Dot's room on the root. Flicker sits in it. It's a lot of room." | Oct 27, trimmed |
| 7-6 | Pokey: "Flicker doesn't say much. When I say Meeca's name, his light goes funny." | new |
| 7, a fall | Petal: "He tells the ruins "I'm fine," out of habit. Nobody argues. Flicker blinks." | Oct 27, approved |
| 7, a fall | Flicker: "Dot would know what to say. I don't. Are you all right?" | new |
| 8-3 | Dot/Flicker: "Flicker, go see if that branch is safe." / "You're faster." / "I'm resting." / "You're hovering." | Oct 27, approved |
| 8-6 | Petal: "Flicker's family blinks on along the branch ahead, one by one." | Oct 27, approved |
| 9-9 | after Dot's plan: "What do I do?" / "Glow quietly." / "I don't have a quiet setting." | Oct 27, approved |
| 9 halfway | Pell: "Is the bug with you?" / "No." / "Yes." / "Good evening, sir." | Oct 27, optional |
| 10-3 | Flicker: "Hold on. I'm keeping my light up, so she can find us." | new |
| 10-6 | Dot/Flicker: "Left vine, Flicker, I said left." / "His left." / "Fine. His left." | new |

Not used: "It's nearly noon." at 6-9 (it contradicts the World 6 arrival, above).

His voice, every line: short, dry, earnest, never a joke at anyone's expense, never wise. He answers Dot's bossing with plain facts
("You're hovering."), which is why it's funny.

**Overlap to check:** STATUS.md has S-12 also listed for polish-dot (Oct 29, 8:05 PM ET). There's no polish-dot branch on the
remote, so I've drafted it all here. The lead should tell polish-dot not to place Flicker rows, so we don't both edit `way.*`.

## Side characters coming back

| Who | Today | This map adds | Still to do (needs something beyond text) |
|---|---|---|---|
| Gruntlewick | arrival, the finale, his ending card | 2-5 and 2-8 | |
| The mailman | arrival, 2-7, his ending card | | |
| Pell | the soup note, the bow (8-8), the thread (9-8), the stitches (10-8), the lantern, the finale | "Is the bug with you?" (optional) | |
| The two soldiers | prologue, the open gates (story-a), their ending card | | **The soldiers' trail** (a dropped helmet and a half-eaten ration in Worlds 3, 6 and 9): needs one small painted prop. Art, so the lead routes it. |
| The squirrels | World 1 arrival, their ending card | | **"Back already?" on the map** when Pokey walks back through World 1: the map has no way to say a line yet. A small text bubble on the map, no art. Suggest after the audit. |
| Flicker | 5-M, the World 6 halfway scene onward | S-12, above | |
| The Prowler | Boss 3, "He said sorry" (World 4), his ending card | | |

## Other things I found on the way

1. **10-6 contradicts the story** (Pokey looking for Dot after she's back). Fixed above.
2. **2-5 and 2-6 tell the same joke** (the PLEASE BE PATIENT sign). 2-5 becomes Gruntlewick.
3. **The asides can be switched off** (`setWaysidePref`). A player who does that only gets the cutscenes, and then every world has two
   four-stage runs (2-5 and 6-9). That's the player's choice, and the default is on, so I'd leave it.
4. **Pokey's Under the Ruins note is a payoff with no setup yet.** The tea scene's "You crossed out "I'm fine."" plays only if the
   player found `w7_ruins`, and nothing in the game can grant it until the Under the Ruins level is built (`SECRET-LEVELS.md`). Not a
   bug today (the lines just don't play), but it's a story the player can't reach.
5. **`wayside.ts`'s header still says Dot "is in the net in world 10".** She leaves at the foot of the mountain and comes back halfway
   up now. Fix the comment when wiring, so nobody writes another 10-6.

## Phase 2: how it gets wired (after story-a lands)

Text and existing systems only. No new art.

1. Merge ccr first, then story-a's landing.
2. **Single lines** (1-7, 2-5, 2-8, 3-6, 3-7, 6-6, 6-8, 7-6, 8-6, 9-5, 10-3, and the World 7 fall lines): the line in `wayside.ts`,
   and the said words in `dotLinesData.ts` (`way.*` rows; new rows for the stages that have none). Old rows are edited in place, so
   "already heard" memory stays keyed right.
3. **Flicker as a speaker:** add `'Flicker'` to `WayWho` and a `flicker()` helper. His speaker mark already exists (`speakers.ts`,
   the sparkle), so no art.
4. **The three exchanges** (8-3, 9-9, 10-6): a stage line gets an optional short list of follow-up lines, each shown in turn in its
   own bubble with its speaker's mark, using the timing the asides already use. Small, and tested. If it fights the guide's one-line
   layout, the fallback is to keep each exchange's best single line (8-3: Flicker "You're hovering." would need the setup, so I'd
   rather build the exchange).
5. **Pell's "Is the bug with you?"** only if the lead and Matt want the optional one: four panels in the World 9 halfway scene.
6. **Show it:** a screenshot of every new line as it appears in play, upright and sideways, checked against the polish bar (STAGE-RULES
   §5b): it reads in one glance, never covers Pokey or what he's about to jump to, and the right speaker mark shows.
7. **Gate:** CLAUDE.md's Checks, including `node tools/perf/artcheck.mjs` and `node tools/perf/drawcheck.mjs`.
