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
