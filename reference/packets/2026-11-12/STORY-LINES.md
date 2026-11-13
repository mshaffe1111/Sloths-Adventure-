# Player lines from the story keeper, 2026-11-12 (final words; builders copy them exactly)

## Save and Load dialog (SaveLoadDialog.tsx; for AF's audit fix #3; 11:35 AM ET)
| Where | Now | Final words |
|---|---|---|
| :157 | Saves every stage result, the stories you have seen and your sound settings into one small file. You can load it later, or on another device. | Saves your stages, the stories you have seen and the things you have found in one small file. Load it later, or on another device. |
| :122 | Could not write the save into this browser. | Could not save it on this device. |
| the load note | Loading **replaces** the progress on this device with what is in the file. | Loading **replaces** the progress on this device with this save. |

The :157 line assumes the notes, books and keepsakes (`sloth_finds`, saveFile.ts:38) still travel in the file. If they don't, use:
"Saves your stages, the stories you have seen and the secret in one small file. Load it later, or on another device."
It makes no promise about sound, volume or mute.

## 1-3 Branch Snakes: the first drop trap sprung in World 1 (ruling for the lead, 11:47 AM ET)
| Where | Speaker | Final words | When |
|---|---|---|---|
| the first trap sprung in World 1 (hive or stone lands beside a snake, the snake glides off) | Dot | Off he glides, not a scratch, just very offended! | once, as the snake leaves; then silent for every later trap |

- Dot's "You said "excuse me" before that punch. I heard. So did he." stays, but ONLY on the first PUNCH knockout of a snake (it is
  1-3's story aside, GAP-MAP). It must never fire for a trap.
- The hive or stone fits World 1 and Pokey: a fright, not harm. The hive lands WHOLE and buzzes; no swarm, no stings shown; the bees
  are not hurt either. The snake flattens and glides to a lower tree (PREDATORS.md §2).

**Update (Matt, R-165.141, 11:42 AM ET):** every way of beating the Golden Tree Snake ends with it flattening and gliding to a lower tree,
gone for good. Dot's "excuse me" line plays on the FIRST PUNCH that sends a snake gliding. The first-trap line above stays as written.
**Keeper's view on World 1's other creatures (for Matt, when they are built):** each leaves on its own, never hurt. "Bested" means
outwitted or outwaited. The boa is lured off its ledge, lands in leaves and slithers off grumpy, or gives up on a still Pokey. The eagle
is never bested by force: after two empty passes it flies off.

## 1-3 the trap teach (12:47 PM ET; replaces "Knock the snakes off the branches. Punch, or shake the vine." as the teach)
| Where | Speaker | Final words |
|---|---|---|
| 1-3's first lesson: a sleeping snake, a hive above, the vine handle by Pokey | Dot | See that hive? Punch the vine, down it comes! |
| the same moment, second line | Dot | Don't worry, it only gives him a fright. |
| later, the bare-branch beat (no vine) | Dot | No vine? Walk him to the end of his branch. |

**The stagePlan mission line for 1-3 changes too** (R-165.141: nothing is knocked off). Mine from 11-11 is withdrawn:
"Clear the branches. Shake a vine and the snakes glide off."
Each line is taught once and is then silent (one tip, one channel). The first-trap reaction "Off he glides, not a scratch, just very
offended!" stays as written.

## 1-3 testers' survey chips (ctestStretches.ts; 1:40 PM ET). Lower case, "the ...", like 1-1's chips
| W1C working name | Chip label |
|---|---|
| the first hive | the first hive |
| the watching snake | the snake on watch |
| the stone on the stair | the stone on the steps |
| the bare branches | the branches with no vine |
| the high perch | the high branch |
| three traps in a row | three traps in a row |
| the last two snakes | the last two snakes |

## Pokey's journal (pokeyJournal.ts STAGE_LINES; 1:55 PM ET)
| Stage | Now | Final words |
|---|---|---|
| 1-3 (now) | Learned to punch today. I said excuse me first. The snakes didn't wait for the second part. | Punched a vine and a hive dropped beside the snake. He glided off. Nobody told me snakes could fly. |
| 1-7 (when 1-7 is laid with stillness) | Tossed an acorn so the eagle would look the other way. Dot called it cunning. I'd call it throwing. | Held still in a bush while an eagle looked right at me. I've been practising that all my life. |
| 1-9 (when 1-9 is laid; provisional until Matt rules the boa's exits) | Fought the boa's guards all the way along his branches. They were only doing their job. So was I. | The boa thought I was a branch. I let him. Then a hive helped him find somewhere else to be. |

## 1-2 The Petal Trail: the thorn and mushroom lesson (2:08 PM ET)
| Where | Speaker | Final words |
|---|---|---|
| 1-2's lesson, first flag, about 800 px before the first thorn bed (once) | Dot | Ooh, thorns. Don't touch those, not even a little. |
| the same moment, second line | Dot | Hop on and let the mushrooms do the jumping! |

- The second line means "don't press Jump mid-chain" without naming a button, so it works for touch and pad alike.
- "There's something down by the roots..." (hint.1-2.roots, approved 11-05) goes back in at the twist, the thorn-free hollow. Its
  label is "the note": BRIEF-1-2's "must" puts Meeca's note by the pink bell LOW and in plain sight, so the hollow holds the note
  (once the bell art exists, R-165.42), not petals alone.

## 1-3 additions (2:12 PM ET)
- New chip, for "two snakes, one hive": **the two snakes on a log**
- The mission line changes, because on Normal the goal is every trap and the bare-branch snakes are optional, so "Clear the branches"
  over-promises. New: **"Shake every vine, and off the snakes glide."** This supersedes "Clear the branches. Shake a vine and the snakes
  glide off."

## 1-2 Meeca's note (2:14 PM ET)
- **YES, a big folded leaf** fits. It is already `paper: 'leaf'` (finds.ts:54). One fix: it is WRITTEN, not only marked. Her words are
  scratched into the leaf in shaky letters ("I'm writing this walking"), so paint lines of writing, not symbols. It lies low against a
  root in the hollow, in plain sight.
- **When he picks it up it reads the existing w1_note text, unchanged** (finds.ts:57, "The first petal": "Pokey, if you're reading
  this, you're already further than they think you'll get... Keep your eyes low. Sorry about the handwriting. I'm writing this
  walking. P.S. If you see Dot, tell her I saw her in that bush. Love, M."). No new words.
- **The hint changes** (finds.ts:409, which still describes the old layout): **"Down in the hollow, low against a root."**

## Settings > About the game: "Inspired by" (R-165.158; DRAFT for Matt, 3:20 PM ET)

**What the docs actually name** (searched every file in reference/ideas/, MAP-REVISIONS.md, GAME-MAP.md and PREDATORS.md):
| Game named | Where | What it gave Sloths | In the game? |
|---|---|---|---|
| Frogger | MATT-IDEAS #1 (R-165.93); MATT-30 Tier 2 #1; MAP-REVISIONS §7 (Matt 7:57 PM: "I like the Frogger idea") | World 2's river lanes; 1-8's rolling nuts are a first taste | planned (World 2, 1-8) |
| Super Mario Bros. 3 (Koopas and Boos) | PREDATORS.md §0 rule 1 and the ocelot row | every creature learned by one habit; the ocelot that creeps while your back is turned | planned (the predator kit) |
| Qix | MATT-IDEAS #3, MATT-30 Tier 3 | territory loops | PARKED, not in the game: leave out |
| Lemmings | MATT-30 Tier 3 #5 | a walker/escort stage | PARKED, not in the game: leave out |

The platformer-archetype and early-arcade lists (MATT-PLATFORMER-ARCHETYPES, MATT-80S-ARCADE-IDEAS) name NO titles: they are mechanics
from outside research. So only two games can be credited honestly today. To credit more, Matt names the games he had in mind; nothing
is guessed.

**Draft section (phone-short):**

> **Inspired by**
> Sloths was built from a lot of small ideas. These are some of the places they came from.
> **Frogger**: the river lanes of the Sunlit Riverbank, and the rolling nuts on The Long Branch.
> **Super Mario Bros. 3**: creatures you learn by what they always do, like the ocelot that creeps while you look away.
> **The real rainforest**: a sloth who stays safe by staying still, a snake that glides from tree to tree, and a mantis that looks
> just like an orchid.
> Sloths Rainforest Adventures is not affiliated with or endorsed by these games or their makers.

Rules for building it:
- Each line ships only when what it credits is in the shipped game. Today none of the three is built: stillness, gliding snakes and
  World 2's lanes are all still to come. Keep the list as data and add lines as stages land.
- Titles only: no logos, art or characters.

**Revised to Matt's framing (a tribute; 3:25 PM ET). This supersedes the draft above:**

> **Inspired by**
> Sloths is our tribute to the classic 2D platformers and the little arcade games that came before it. Every idea we borrowed, we grew
> into something the rainforest could call its own.
> **Frogger**: lanes of traffic became a river of drifting logs and dozing caimans in the Sunlit Riverbank.
> **Super Mario Bros. 3**: creatures you learn by one habit became an ocelot that creeps while you look away, and a boa that mistakes a
> still sloth for a branch.
> **The real rainforest**: a sloth who stays safe by staying still, a snake that glides from tree to tree, and a mantis dressed as an
> orchid.
> Sloths Rainforest Adventures is not affiliated with or endorsed by these games or their makers.

## About the game: "How Sloths began" and "What's ours", BEFORE "Inspired by" (R-165.158; DRAFT for Matt, 3:28 PM ET)

> **How Sloths began**
> Sloths started as a conversation between my wife and me: what would a game about a sloth be like?
>
> **What's ours**
> Pokey, Meeca, Dot and everyone they meet.
> Their story, from the first petal to the last letter, and Pokey's journal.
> Ten rainforest worlds, and every level in them.
> A hero whose stillness is his strength.
> The art, made for this game in its own style.

- If the About screen should not speak in Matt's own voice, the first line becomes: "Sloths started as a conversation between a
  husband and wife: what would a game about a sloth be like?"
- Every claim is true as written. It names no one beyond "my wife". It says nothing about how the art was made, and nothing about the
  music, whose origin I have not checked. If the music was made for the game, Matt can add "The music, too."
- The "Inspired by" tribute follows unchanged.

**APPROVED by Matt (relayed by the lead, 3:30 PM ET):** the About opening ("How Sloths began" and "What's ours"), in HIS voice ("between
my wife and me"), exactly as drafted. Still open:
- The music line stays out until Matt says.
- The "Inspired by" list waits for the games Matt names. The tribute intro and its lines are drafted above.

**Revised opening (Matt's added fact, 3:32 PM ET; this supersedes the approved one only by adding the cats line):**

> **How Sloths began**
> Sloths started as a conversation between my wife and me: what would a game about a sloth be like?
> Pokey and Meeca are named after two cats we had, who did everything together. A little of how they act is theirs, too.
>
> **What's ours**
> (unchanged, as approved)

The line uses the game's spelling, Meeca ("Mika" was speech-to-text). If the cat's own name was spelled differently, the line still
reads true, because it names the characters, not the cats.

**FINAL opening (3:34 PM ET; APPROVED, pending Matt's look):**

> **How Sloths began**
> Sloths started as a conversation between my wife and me: what would a game about a sloth be like?
> Pokey (Pocono, really) and Meeca are named after two of our cats, who did everything together. A little of how they act is theirs, too.
>
> **What's ours**
> Pokey, Meeca, Dot and everyone they meet.
> Their story, from the first petal to the last letter, and Pokey's journal.
> Ten rainforest worlds, and every level in them.
> A hero whose stillness is his strength.
> The art, made for this game in its own style.

"two of our cats" replaces "two cats we had" so it doesn't touch on the cats having passed (Matt: "we don't have to get into that").

## About: the arc (Matt, 3:36 PM ET: "a little project just for fun... to what it is now"). DRAFT for Matt
**About screen (one phone screen):**

> **How Sloths began**
> It started as a little project, just for fun, because my wife said she'd like a sloth game.
> Pokey (Pocono, really) and Meeca are named after two of our cats, who did everything together. A little of how they act is theirs, too.
> Then it kept growing. **Our story ›**
>
> **What's ours** (as approved)
> **Inspired by** (waits for Matt's games)

**"Our story" page (a short scroll, linked from About):**

> **Our story**
> A sloth game needed a reason to keep going, so Pokey got one: Meeca, carried off to the north, and a trail of petals to follow.
> The story was written, then rewritten world by world, until every voice sounded like itself: Dot who never stops talking, a General
> who never says "I".
> Ten worlds grew around it, each with its own guardian, and a journal for Pokey to keep along the way.
> The very first stage has been rebuilt from the ground up more than once, until the jumps felt right.
> Every level is played on real phones, upright and sideways, and by testers, little ones included.
> It's still a little project, just for fun. It just got bigger.

**Truth check, line by line:**
- The wife's wish is Matt's words. The cats are Matt's, 11-12.
- The rewrite is reference/STORY-REWRITE.md, all 10 worlds. Dot's and the General's voices are in VOICE.md.
- Ten guardians are in bossDefs.ts. The journal is pokeyJournal.ts.
- 1-1 was rebuilt more than once: the 11-04 rebuild, gen2 1-1 in 0.9.5, and the re-lay in 0.9.6.
- The phone checks are clipcheck, upright and sideways. The testers, including a child tester, are on the #ctest survey (HANDOFF).
- It names no dates or counts I can't verify, and it doesn't mention AI or the cats having passed.

**"Our story": the then-and-now pair, plus the lead's truth fix (3:40 PM ET).**
- Caption under the pair (Matt's first-attempt shot, and 1-3 today):
  **"Then: six buttons and a lot of instructions. Now: the same sloth, and a lot more rainforest."**
  This is true of the shot: it has LEFT, RIGHT, DUCK, PUNCH, KICK and JUMP buttons, plus a line of instructions and a "[W / UP] CLIMB
  TREE" hint. There are no left/right words, so it reads stacked or side by side.
- Line 5 becomes: "Levels are played on real phones, upright and sideways, and by testers, little ones included."

The page in order: line 1 (Pokey's reason), line 2 (the rewrite), line 3 (ten worlds), line 4 (the first stage rebuilt), THE PAIR with
its caption, line 5 (as fixed), then the closing line (Matt's choice: "It's still a little project, just for fun. It just got bigger."
or "It started as a little project, just for fun. It still is, just a lot bigger, and made with a lot of care.").

**APPROVED by Matt (relayed by the lead, 3:42 PM ET):**
- the About opening ("How Sloths began" with the Pocono/cats line, the "Our story ›" link, and "What's ours");
- the "Our story" page, with line 5 as fixed;
- the then-and-now caption "Then: six buttons and a lot of instructions. Now: the same sloth, and a lot more rainforest.";
- the closing line "It's still a little project, just for fun. It just got bigger."

Waiting: "Inspired by" (Matt's list of games) and the music line (Matt).

**FINAL About opening (3:44 PM ET; only the first line changes, with Matt's added fact; everything else as approved):**

> **How Sloths began**
> It started as a little project, just for fun, because my wife thinks sloths are cute and wanted a sloth game.
> Pokey (Pocono, really) and Meeca are named after two of our cats, who did everything together. A little of how they act is theirs, too.
> Then it kept growing. **Our story ›**

## About and Our story: the keeper's polished pass (Matt, 3:47 PM ET: "do this justice... with the same thought and time as the story")
Same facts as the approved drafts; only the writing is reworked. Every line keeps its truth source (see the truth checks above). For
Matt's okay before it is built.

**About (one phone screen):**

> **How Sloths began**
> My wife thinks sloths are cute. One day she said she'd like a sloth game, so I started making one, just for fun.
> Pokey (Pocono, really) and Meeca are named after two of our cats, who did everything together. A little of how they act is theirs, too.
> It kept growing. **Our story ›**
>
> **What's ours**
> Pokey, Meeca, Dot, and everyone they meet along the way.
> Their story, from the first petal to the last letter, and the journal Pokey keeps.
> Ten rainforest worlds, and every level in them.
> A hero whose stillness is his strength.
> Art made for this game, in its own style.
>
> **Inspired by** (waits for Matt's games)

**Our story (a short scroll):**

> **Our story**
> Sloths began as one sloth, some branches and a row of buttons. Then Pokey needed a reason to keep going.
> So we gave him one: Meeca, carried off to the north, and a trail of petals she dropped so he could follow.
> The story was written, then rewritten world by world, until every voice sounded like itself. Dot never stops talking. The General
> never says "I".
> Ten worlds grew around it, each with its own guardian, and each with something new for Pokey to learn.
> The very first stage has been rebuilt from the ground up more than once, until the jumps felt right.
> [the then-and-now pair]
> *Then: six buttons and a lot of instructions. Now: the same sloth, and a lot more rainforest.*
> Levels are played on real phones, upright and sideways, and by testers, little ones included.
> It's still a little project, just for fun. It just got bigger.

**What changed, and why:**
- The opening leads with the person, not the project: "My wife thinks sloths are cute." It is the warmest true sentence we have, and it
  lands first.
- "One day she said... so I started making one" tells it as a small moment, the way it happened.
- "It kept growing" now hands straight into the page.
- Our story opens on the small beginning ("one sloth, some branches and a row of buttons"), which sets up the then-and-now pair later.
- The beginning then turns on the game's own theme: "Pokey needed a reason to keep going."
- "A trail of petals she dropped so he could follow" carries Meeca's care, which is the heart of World 1, without spoiling anything.
- Dot and the General are each one short sentence: one dry smile, the narrator's rule.
- "Something new for Pokey to learn" says what the worlds DO, not only how many there are.
- The pair sits right after the rebuilt-first-stage line, so the picture proves the sentence before it.
- The closing is Matt's pick, unchanged.
- No spoilers: nothing about who the General is, Dot's secret or the ending. No AI. No mention of the cats having passed.

## The stage card's goal line for a purge goal, the kind way (all stages; 3:52 PM ET)
- Replaces "This stage: beat {count} predators to open the shrine":
  **"This stage: send {count} {creatures} on their way to open the shrine."**
  1-3 on Normal reads: "This stage: send 13 snakes on their way to open the shrine."
- The slot words: {creatures} is the PLURAL animal name (snakes, prowlers, hunters). For a count of 1, use the singular: "send 1 boa on
  its way". "on their way" fits every exit (gliding, sulking off, giving up, chased off), so one line serves the whole game.
- "beat" and "predators" never appear on a card: no one is beaten, and they are animals, not foes.

## FINAL layout (Matt's ruling, 3:58 PM ET): the About screen, plus two pages. This supersedes every earlier About/Our story draft
**ABOUT screen:**

> **What's ours**
> Pokey, Meeca, Dot, and everyone they meet along the way.
> Their story, from the first petal to the last letter, and the journal Pokey keeps.
> Ten rainforest worlds, and every level in them.
> A hero whose stillness is his strength.
> Art made for this game, in its own style.
>
> **Our story ›**
> **Inspired by ›**

**OUR STORY page (one page, start to finish):**

> **Our story**
> My wife thinks sloths are cute. One day she said she'd like a sloth game, so I started making one, just for fun.
> Pokey (Pocono, really) and Meeca are named after two of our cats, who did everything together. A little of how they act is theirs, too.
> The first version was one sloth, some branches and a row of buttons. Then Pokey needed a reason to keep going.
> So we gave him one: Meeca, carried off to the north, and a trail of petals she dropped so he could follow.
> The story was written, then rewritten world by world, until every voice sounded like itself. Dot never stops talking. The General
> never says "I".
> Ten worlds grew around it, each with its own guardian, and each with something new for Pokey to learn.
> The very first stage has been rebuilt from the ground up more than once, until the jumps felt right.
> [the then-and-now pair]
> *Then: six buttons and a lot of instructions. Now: the same sloth, and a lot more rainforest.*
> Levels are played on real phones, upright and sideways, and by testers, little ones included.
> It's still a little project, just for fun. It just got bigger.

No line is said twice. "Just for fun" appears only as the bookend: the first line and the last. ("Sloths began as..." became "The first
version was...", so the page doesn't start twice.)

**INSPIRED BY page:** the tribute intro, one line per game Matt names, and the not-affiliated line (drafted above; it waits for Matt's
list).

**APPROVED by Matt ("Like it", relayed by the lead at 4:00 PM ET):** the final ABOUT screen ("What's ours" with its two links) and the
one-page OUR STORY, exactly as written in the FINAL layout section above. Waiting: the "Inspired by" games, and the music line.

## "What's ours", revised with gameplay (Matt, 4:03 PM ET: "a lot of gameplay too"). DRAFT for Matt; for 0.9.7
> **What's ours**
> Pokey, Meeca, Dot, and everyone they meet along the way.
> Their story, from the first petal to the last letter, and the journal Pokey keeps.
> Ten rainforest worlds, with art made for this game in its own style.
> Stages that change each time you play, every layout checked to be fair before you see it.
> Dot, who helps when you're stuck, and never tells.
> Bounce chains that carry Pokey over the thorns, along Meeca's petals.
> Traps made from the forest itself: punch a vine, a hive drops, and the snake glides off unhurt.

**Truth gates (each line ships only if true in the 0.9.7 build):**
- "Stages that change... checked to be fair": TRUE today for 1-1 (200 proven layouts, each clean on both settings, seedlist --check;
  the first-ever run is one fixed layout, which is still "checked"). It reads as true for the game only if every stage that changes is
  a proven-list gen2 stage. The old generator's stages also change but are not proven. If 0.9.7 still has old-generator stages, write
  "Levels that change each time you play, checked to be fair before you see them" only when that is true of them, or limit it to
  "The first stages change each time you play...". The lead checks which stages are gen2 proven-list in 0.9.7.
- "Dot, who helps when you're stuck, and never tells": TRUE in 0.9.6 (the help ladder, "I won't tell anyone").
- "Bounce chains... along Meeca's petals": only if the new 1-2 ships in 0.9.7.
- "Traps... the snake glides off unhurt": only if the new 1-3 ships in 0.9.7.
- **Removed for now:** "A hero whose stillness is his strength." Stillness is not in play until 1-7 is laid. It comes back, word for
  word, the release stillness ships. (The story already carries it: the Prowler is outwaited, storyBosses.ts.)
- **NOT claimed:** "creatures you outwit, never hurt" across the game. The old stages still have defeat clips and stomps until each
  world gets the predator kit, so for now that claim is made only through the 1-3 trap line. It widens as worlds are re-laid.

**"What's ours", revised again (Matt, 4:05 PM ET: "Gameplay and story tied"). This supersedes the draft above:**
> **What's ours**
> Pokey, Meeca, Dot, and everyone they meet along the way.
> Their story, from the first petal to the last letter, and the journal Pokey keeps.
> Ten rainforest worlds, with art made for this game in its own style.
> Levels that grow out of the story: you follow the petals Meeca dropped, even across the thorns.
> Traps made from the forest itself: punch a vine, a hive drops, and the snake glides off unhurt.
> Dot, who helps when you're stuck, and never tells.
> World 1's new stages change each time you play, every layout checked to be fair before you see it.

- The petals line is merged into the story-tied line. "Win by being kind" is shown, not claimed: the trap line right after it does
  that, and stays true while the older stages still have stomps.
- "World 1's new stages" means ONLY the proven-list gen2 stages in 0.9.7. The lead confirms which ones. If only 1-1 is on the proven
  list, the line becomes "The first stage changes each time you play, every layout checked to be fair before you see it."
- The other gates stand: the petals/thorns line needs the new 1-2 in 0.9.7, and the trap line needs the new 1-3. Stillness returns
  when 1-7 ships.

**"What's ours", FINAL draft (Matt, 4:08 PM ET: "we can be vague"). This supersedes both drafts above:**
> **What's ours**
> Pokey, Meeca, Dot, and everyone they meet along the way.
> Their story, from the first petal to the last letter, and the journal Pokey keeps.
> Ten rainforest worlds, with art made for this game in its own style.
> Gameplay crafted to tell that story the whole way through, and many ideas of our own along the way.
> Dot, who helps when you're stuck, and never tells.

- This needs no per-release truth gate: every line is true in 0.9.6 and stays true.
- "Many ideas of our own" claims ownership, not uniqueness. We never say "found nowhere else", which can't be verified.
- The Dot line is kept because it is specific, warm and already true (the help ladder ships in 0.9.6).

**APPROVED by Matt (4:10 PM ET): the broad "What's ours" above.** About is now a LIVING page. The running "ours" list lives in
reference/story/ABOUT-OURS.md. The keeper proposes an update to "What's ours" when a world is finished, and before launch.

**1-3 teach, line 1 rewritten (6:13 PM ET).** The card shows about 3 s before the vine, and the hive is not yet on screen. Line 1 is now
**"Snake napping under a hive ahead! Punch the vine!"** (it supersedes "See that hive? Punch the vine, down it comes!"). Line 2 is
unchanged: "Don't worry, it only gives him a fright." Both lines share one card.

## Nature check (R-165.164, new standing duty; first pass on what's already built, 6:55 PM ET)
- **Golden Tree Snake + gliding: NOT TRUE to World 1.** Gliding snakes (Chrysopelea) live only in South/Southeast Asia. True swap: the
  **parrot snake** (Leptophis ahaetulla), green, Central/South American lowlands. Its tell is the real gaping-mouth display, and its exit
  is to drop to a lower branch and slip away. This needs Matt's call against R-165.141. If he picks the swap:
  - Dot's first trap: "Off he drops, not a scratch, just very offended!"
  - Journal 1-3: "Punched a vine and a hive dropped beside the snake. He dropped to a lower branch. Very dignified."
- **Orchid mantis (W5): NOT TRUE** (Southeast Asian). Swap: the dead-leaf mantis (Acanthops), which poses as a dry leaf.
- **"Inspired by", "The real rainforest" line, corrected:** "a sloth who stays safe by staying still, a harpy eagle that watches for
  movement, and a frog whose colours are its warning." This supersedes the glide/orchid-mantis wording.
- **Checked TRUE (Neotropical):** boa, harpy eagle, spectacled caiman, ocelot, jaguar, tayra, capuchins, poison dart frogs, howler
  monkeys, piranhas, tapir, fruit bats, hummingbirds, kapok (Ceiba pentandra), red-tailed and variegated squirrels.
- Queued for tomorrow: the 1-4 journal's squirrel lift (made up; rewrite), and R-165.165 (the Keeper's Bell "against a root" beside a
  stone ledge).

## The snake rename (Matt, R-165.166: rename only; the look and the glide stay). For tomorrow's work
**New name: Golden Eyelash Viper.** This is the real golden ("oropel") form of the eyelash viper (Bothriechis schlegelii), a yellow
tree snake of Central American and north-western South American rainforest, Costa Rica to Ecuador. The raised scales over its eyes
read as lashes or little horns, which matches the art: Matt's "golden horned tree snake" (goldSnake.ts:2).

Every player-facing mention to change:
| File | Now | Final words |
|---|---|---|
| src/game/journal.ts:27 (name) | Golden Tree Snake | Golden Eyelash Viper |
| src/game/creatureLore.ts:9 | Golden tree snakes sleep in the sun all morning... | Golden eyelash vipers sleep in the sun all morning and are cross about it all afternoon. They rear up and sway to look bigger. Dot says it works on her every time. |
| the plural used by the journal ("3 golden tree snakes") | golden tree snakes | golden eyelash vipers (it follows the journal name; check how the plural is built) |

- Lines that say only "snake" (Dot's, the stage card, the survey chips, the journal "beside the snake") stay as they are. A viper is a
  snake, and "snake" reads better in play.
- Code comments (goldSnake.ts, engine.ts, predatorAI.ts, snakeSprite.ts, types.ts) are not player-facing, so no change is needed.

**The nature-check bar (Matt):** the KIND of plant or animal and its LOOK must really exist in that world's setting; its behaviour may
be storybook. The glide stays.
**W5 orchid mantis, re-judged on that bar:** for tomorrow. The question is whether a real Neotropical mantis looks like a flower. The
dead-leaf mantis (Acanthops) is the known fallback.

## 1-4 Up the Kapok: nature check and story words (design doc t-14-design@1b88b431; 7:10 PM ET)
**Nature check: PASS** (the bar: kind and look real; behaviour may be storybook)
| Thing | Verdict |
|---|---|
| Kapok (Ceiba pentandra): buttress roots, emergent crown, seed pods, fluff drifting on the wind | REAL, Neotropical. Whole pods falling on a beat and bursting is storybook behaviour, which is allowed. |
| A hollow trunk to climb inside | the kind is real (hollow giant trees). Fine. |
| Rotting boughs with bracket fungus | REAL (tropical polypores) |
| Lianas, one draped over a bough | REAL, and very rainforest |
| Knot-hole hollows | REAL |
| The snake | REAL once renamed: the Golden Eyelash Viper (R-165.166) dozes on branches, true to life |
| Squirrels on a pod pile | REAL kind (red-tailed squirrel); eating the seeds is storybook enough |
| The Hush Fern | REAL kind (fern); the name is ours |
| Morning mist at the roots, the Highlands far north | REAL (lowland mist; Central American highlands) |

**Story notes:**
- The squirrels at the crown are a callback CAMEO, not a beat. 1-1 owns the squirrels (STORY-KEEPER §5): they stare, and nothing more.
- "Never slow" is guarded in the doc. The petals stay low with none up the tree, as BRIEF requires. The twist's "glides off, very
  offended" matches 1-3. Dot's first-trap line does NOT replay here (taught once, in 1-3).

**The owed words:**
| Where | Speaker | Final words |
|---|---|---|
| beat 6, the halfway flag (STORY-KEEPER §5's "Meeca climbs this every Sunday") | Pokey | Meeca climbs this every Sunday. I waved from below. |
| beat 4, the pods flag (Dot, once, on Normal's Tips) | Dot | Hear it creak? Duck in a hollow till it drops! |
| the journal, 1-4 (pokeyJournal.ts:51; replaces the squirrel lift, a made thing) | Pokey | Climbed the kapok between falling pods. From the top you can see where they took her. |

The journal line is a real moment, so the joke doesn't come (VOICE: Pokey). It pays off the view north.

**Nature check, Matt's sharpened test (6:46 PM ET): "does it make sense there to a player?"** Bananas and mangoes are fine; a pear is not.
- 1-4: still PASS. Everything in it is what a player pictures in a rainforest.
- W5 orchid mantis, re-judged: KEEP. A flower-shaped mantis in an orchid sanctuary makes sense to any player, and the kind (a mantis)
  is real in the Neotropics. The dead-leaf mantis swap is withdrawn.
- The snake rename (R-165.166) stands; Matt asked for it.

## 1-5 Where She Walked (design t-15-design@1fc844d9; the keeper's answers, 11-13 about 10:25 PM ET)
**(1) Nature check: PASS** (the test: "does it make sense there to a player?")
| Thing | Verdict |
|---|---|
| Kapok boughs at dusk, creaky limbs with bracket fungus, root tunnels, a big fallen hollow trunk | real, and what a player pictures |
| A creek with stepping roots and lily pads | real (Amazon water lilies; roots at creek edges) |
| The snake | the Golden Eyelash Viper (R-165.166) |
| Squirrels' berry-juice paintings on living leaves | storybook, and it makes sense in this world: the squirrels already make signs (THE SLOTH sign, canon). Not a "made thing" like a stake or a plank. |
| Her mark on living bark | right; the split stake (vectorArt.ts:1266) goes |
| Dusk light | real |

**(2) The goal is HER MARKS: CONFIRMED** (STORY-KEEPER §5: 1-5 owns the folded petals, the trail chase, creaky limbs, and Meeca's marks).
Her arrows sit at marching height, on her road, never up on the limbs, as the doc already has it.
- The mission line (stagePlan.ts:42) changes: "The petals go on. Gather more." becomes **"She marked the way they took her. Follow her
  marks."**

**(3) The four new lines (each needs Matt's okay):**
| Where | Speaker | Final words |
|---|---|---|
| the creaky teach, before beat 2's first creaky limb | Dot | Creaky limbs drop you, but only down to the roots! |
| the big sign, beat 6, before the curtain | Dot | Squirrels painted what's each way. Your pick! |
| the locked exit (Dot explains any locked exit) | Dot | We missed some of her marks. They're back there! |
| the two-signs joke, beat 1, at the first THIS WAY / THAT WAY | Pokey | THIS WAY. THAT WAY. Thank you, squirrels. |

- The creaky line is true by the doc's own rule: a fall from over ALWAYS lands on the under road. It never says "slow" or "hurry".
- The joke pays off at beat 9, where both signs finally say THIS WAY.
- The kept lines stay as written: "She's making them last", the fresher-petals line, the journal, and the keepsake's lone tree.

**APPROVED by Matt (10:20 PM ET, relayed by the lead):** all five 1-5 lines as written: the mission line "She marked the way they took
her. Follow her marks." and the four lines (the creaky teach, the big sign, the locked exit, the two-signs joke).

## 0.9.7 What's New (11:01 PM ET, for the lead's approval)
version '0.9.7', date '2026-11-12', title: **Petals and snakes, rebuilt**
- The Petal Trail is rebuilt: bounce from mushroom to mushroom over the thorns, following Meeca's petals.
- Touch the thorns and you only go back a little. Look for something hidden down by the roots.
- Branch Snakes is rebuilt: punch a vine, a hive drops, and the snake glides away. Nobody gets hurt.
- Into the Canopy has fairer landings.
- Quieter sound, and volume sliders that go all the way down.
- Smoother on phones, with lots of small fixes.

**0.9.7 What's New APPROVED by the lead** (11:02 PM ET); its date is set to 2026-11-13, the day it goes live. The text is unchanged.
