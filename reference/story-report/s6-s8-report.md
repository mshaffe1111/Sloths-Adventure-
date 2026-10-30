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

**The snail.** Live now that story-art's sprite is in (SNAIL_PAINTED = true). He's in each world's 3rd stage (4-9 and 5-9 in Worlds 4 and 5, whose 3rd stages hold their own things). He sits out in the open on the ground, creeping on the spot in his two painted frames, facing right. Walking into him is the whole find: a tiny tap sound, no card, no stopping, and he stays where he is. The satchel shows him under "The snail", and his card opens in the reader. With all ten found, the last line is "I saw him every day, you know. He never once stopped for tea." Stills: `s7-stills/snail-7-3-*.webp`.

**Under the Ruins.** The new note is in (finds.ts RUINS_NOTE): "Meeca. ~~I'm fine.~~ I'm tired too. Coming anyway. Save my chair. P.", struck through the same way as the World 7 note. Its tea payoff is wired and said only if it was found: MEECA "You crossed out 'I'm fine.'" / POKEY "It wasn't true." / MEECA "Mine wasn't either." (storyNotice.test.ts covers both ways). It waits for the World 7 secret level to place it.

**The world notices** (storyNotice.ts). A panel can be said only when a find was found (ifFound), or switch to a variant once the player has fallen (withFalls). StoryPlayer applies both from the saved finds and a new lifetime counter in the badge store, counters.falls, which adds up every life lost and survives a reload.
- **Gates:** "...The General has counted every step you took, and every fall. Forty-one of them. There are a thousand more..."
- **Boss 10, first time only:** "...One more. Forty-one falls, boy. Forty-one times you got up. ..."
- The count is in words up to ninety-nine, then "more than a hundred"; with no falls, the line is unchanged.
- **World 8, only if the World 6 note was found:** Dot "And don't tell me it's the soup, I read the note, everybody's read the note, don't eat that soup, I mean it."

**The ending cards (S-7).** story-art's 16 cards play as a run at the end of the weeks after, before the hill, with the approved line under each (endCardsData.ts; story.test.ts checks every card has its picture and plays once, in order). Each card is as big as it can be without losing its middle 1440 x 880. The rest of the screen is the same painting, soft and dark. The soldiers' and the squirrels' weeks-after narration is gone now that their cards say it. Stills: `s7-stills/card-*.webp`, upright and sideways.

**People who come back.**
- **The World 9 gates:** the two soldiers from the garden are now drawn, from their own painted clips (shared with Meeca's stage as soldierClips.ts). One turns to look and the other shrugs; "Is that a hummingbird?" / "Where?"; Dot is already behind Pokey's ear.
- **The weeks after:** Pell's first customers (the two soldiers) and the squirrels' sign are on their ending cards now, so nothing is said twice.

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
| The Notch card | reader-w1_notch-up.webp | The painted twig is in now (notch.webp); the reader shows it beside the words. |
| The World 6 note, page 2 | reader-w6_note-up.webp | Pages now; 2 / 2 shown. |
| Soldiers at the gates | gates-soldiers-up.webp, -side | Drawn, feet on the ground, facing Pokey. Upright, the two overlap a little; acceptable. |
| Falls at the gates and boss 10 | gates-falls-*.webp, boss10-falls-*.webp | Reads as the General, not a stat. |
| Soup line | w8-soup-up.webp, -side | Clean. |
| Squirrels | s7-stills/card-squirrels-*.webp | Clean. The card shows them, under a sign that reads BACK ALREADY? (story-art relettered it); the old unpictured "Back already?" is gone. |
| Ending cards, upright | s7-stills/card-*-up.webp | Clean. Card full width, set a little low, clear of the buttons; blurred painting above and below. |
| Ending cards, sideways | s7-stills/card-*-side.webp | Clean. Full height, blurred side bars; the words box covers only the card's bottom margin. |
| Snail in a stage | s7-stills/snail-7-3-*.webp | Clean. Small, on the ground, easy to walk past, which is the point. |
| Snacks, the last line | end-snacks-up.webp | Clean, and ends on the laugh. |
| Pocket item pictures | (none) | **Rough:** the cards use Dot's painted perch frame, not the item itself. Small painted items (button, pin, feather, ribbon, map, scrap) would be better; not asked for yet. |

## Still to do

- Place the Under the Ruins note when the World 7 secret level is built.
- **A question for the lead:** the General's card says "Every spring he plants a tree by the river. He takes his time." The narration just before the cards already says "That spring he went down to the Sunlit Riverbank... and planted a tree. The next day he went back and planted another. He took his time." It's said twice in a row. My pick: cut the narration and let the card say it, the way the soldiers' and squirrels' lines went.

## Where I stopped (2026-10-29, about 11:00 PM ET)

- story-a holds S-6, S-8, the new Under the Ruins note, the S-7 cards, the snail and the Notch art, merged with story-art 9b9a942.
- The full gate was stopped part-way, on the lead's call to stop for the night. typecheck was clean. The story, finds and World 5 tests passed on their own.
- Next step: run the full gate and the build on the story-a head, then send the lead the report, plus the General's tree-line question above.
