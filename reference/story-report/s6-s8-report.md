# S-6 and S-8 report (story-a, 2026-10-29/30)

Built as approved, with the lead's four edits. Stills, upright and sideways: `reference/story-report/s6-stills/`.

## What's in

**Pokey's satchel** (Satchel.tsx), a new screen opened from the pause menu (a "Satchel" tile) and from the world map (a satchel chip beside the trophy). It has three tabs.
- **Satchel:** the finds by kind: Keepsakes, Dot's lost pocket, From the old nest, Notes from Meeca, Photo albums, and the quest bonus.
  - Tapping a keepsake opens its page at the top: the painted thing, its name and world, and its tea-table lines word for word, the six the finale leaves out included.
  - "What it looks like" opens the reader card. Notes, albums and Dot's things open in the reader.
- **Journal:** Pokey's line for each world, in the game's own hand face (Cherry Bomb One) on ruled paper. Each line is written when that world's guardian falls, and the others stay blank lines.
- **Story scenes:** the replays the Library had.
- The Trophy Room's Library tab is gone; it moved here whole. Replaying a scene from the satchel and going back keeps a paused stage, which screenFlow.test.ts covers.

**Dot's lost pocket.** Six finds, w4_pocket to w9_pocket, each in its world's 6th stage, crouched for at a Hush Fern. Each card shows Dot's run-on line under the words, on the keepsake paper. Finding all six adds her line in the finale: "I kept your map. I kept all of it. I've had you in my pocket the whole time."

**The Notch** (w1_notch). It's in 1-4, not 1-1: a fern in 1-1 would trigger the crouch lesson before 1-5 teaches it. The card waits for story-art's painted twig, and shows it as soon as notch.webp lands.

**How the finds are placed.** Generated and gen2 stages get them from finishStage -> addFinds, unchanged. Hand stages get them from the new addMissingFind, which runs only when the builder placed no find of its own. That puts the fern on a platform the level check already reaches, without touching the layout or the stage's random numbers.
- The fern also keeps 120 px from World 5's carvings and relics (w5-rebuild).
- finds.test.ts checks every stage: in its own stage, on reachable ground, clear of the start and exit. It also checks that no two find kinds share a stage, in every world.
- Agreed with the builders: w5-rebuild (5-6 is gen2 and runs finishStage; the carvings rule), the W8 builder (no change), and the W9 builder (asked).

**The snail.** Data, placement (stage 3; 4-9 in World 4) and the payoff are all wired: with all ten found, the last line is "I saw him every day, you know. He never once stopped for tea." He stays hidden (SNAIL_PAINTED = false) until story-art's sprite lands; there's no code-drawn stand-in.

**Under the Ruins.** The new note is in (finds.ts RUINS_NOTE): "Meeca. ~~I'm fine.~~ I'm tired too. Coming anyway. Save my chair. P.", struck through the same way as the World 7 note. Its tea payoff is wired and said only if it was found: MEECA "You crossed out 'I'm fine.'" / POKEY "It wasn't true." / MEECA "Mine wasn't either." (storyNotice.test.ts covers both ways). It waits for the World 7 secret level to place it.

**The world notices** (storyNotice.ts). A panel can be said only when a find was found (ifFound), or switch to a variant once the player has fallen (withFalls). StoryPlayer applies both from the saved finds and a new lifetime counter in the badge store, counters.falls, which adds up every life lost and survives a reload.
- **Gates:** "...The General has counted every step you took, and every fall. Forty-one of them. There are a thousand more..."
- **Boss 10, first time only:** "...One more. Forty-one falls, boy. Forty-one times you got up. ..."
- The count is in words up to ninety-nine, then "more than a hundred"; with no falls, the line is unchanged.
- **World 8, only if the World 6 note was found:** Dot "And don't tell me it's the soup, I read the note, everybody's read the note, don't eat that soup, I mean it."

**People who come back.**
- **The World 9 gates:** the two soldiers from the garden are now drawn, from their own painted clips (shared with Meeca's stage as soldierClips.ts). One turns to look and the other shrugs; "Is that a hummingbird?" / "Where?"; Dot is already behind Pokey's ear.
- **The weeks after:** Pell's first customers (the two soldiers), and the squirrel's "Back already?" on the road home. Both move onto their ending cards when story-art's cards land, so nothing is said twice.

**Fixed on the way**
- The reader only paged photo albums, so the World 6 note's second page (the letter to Grandma) could not be reached. It now pages any find with more than one page.
- The Story Reader page imported gameUi.css, which ccr folded into index.css, so the page didn't load. Fixed.

## Polish check

| Item | Still | Verdict |
|---|---|---|
| Satchel, keepsake page open, upright | satchel-satchel-up.webp | Clean. The kit panel, the log plaque and Dot on the edge match the Trophy Room. The lines read as a little scene. |
| Satchel, sideways | satchel-satchel-side.webp | Clean. The page runs wide and the cards sit below. |
| Journal, upright and sideways | satchel-journal-up.webp, -side | The writing sits on the rules (a first pass didn't; fixed). "World 10" fits. Unwritten worlds are blank lines. |
| Pocket card in the reader | reader-w8_pocket-up.webp, -side | Readable on the keepsake paper (a first pass was dark on dark; fixed). Dot's line is marked in her green. |
| The Notch card | reader-w1_notch-up.webp | Text only until the painted twig lands. Named, not hidden. |
| The World 6 note, page 2 | reader-w6_note-up.webp | Pages now; 2 / 2 shown. |
| Soldiers at the gates | gates-soldiers-up.webp, -side | Drawn, feet on the ground, facing Pokey. Upright, the two overlap a little; acceptable. |
| Falls at the gates and boss 10 | gates-falls-*.webp, boss10-falls-*.webp | Reads as the General, not a stat. |
| Soup line | w8-soup-up.webp, -side | Clean. |
| Squirrel "Back already?" | end-squirrel-up.webp | **Rough:** no squirrel is drawn (there's no squirrel story art). The line reads as heard from above. The squirrels' ending card fixes it when it lands. |
| Snacks, the last line | end-snacks-up.webp | Clean, and ends on the laugh. |
| Snail | (none) | Hidden until his sprite lands, by design. |
| Pocket item pictures | (none) | **Rough:** the cards use Dot's painted perch frame, not the item itself. Small painted items (button, pin, feather, ribbon, map, scrap) would be better; not asked for yet. |

## Still to do

- Place the Under the Ruins note when the World 7 secret level is built.
- Wire the cards (S-7) when story-art lands them, and move the soldiers' and squirrel's weeks-after lines onto them.
- The snail sprite, and the Notch twig art.
