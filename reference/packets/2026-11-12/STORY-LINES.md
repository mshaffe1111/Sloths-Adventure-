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
