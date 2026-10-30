# S-6, S-8 and "people who come back": draft for approval (story-a, 2026-10-29)

Nothing below is built yet. Mock-up stills: `reference/story-report/s6-mockups/` (satchel and journal, upright and sideways). Every line here is new and waits for the lead's (and Matt's) OK.

## S-6: Pokey's Satchel (one screen, three tabs)

**What it is.** A new screen in the Trophy Room's look: the painted panel, the log plaque, and Dot perched on the edge. Tabs: **Satchel**, **Journal**, **Story scenes**.
- **Satchel**: every find, in groups: Keepsakes, Dot's lost pocket, Notes from Meeca, Photo albums, plus the Notch.
  - Tapping a keepsake opens its page at the top: the painted item, its name and world, and its lines from the tea table, word for word (the six cut from the finale, KEEPSAKE_LINES).
  - Notes and albums open in the reader the Library uses today.
- **Journal**: one line per world in Pokey's hand, on ruled paper. Each entry is written when that world's guardian falls (World 10's after the ending). Worlds not reached yet are blank lines.
- **Story scenes**: the replays the Library has today.
- **New replaces old.** The Trophy Room's Library tab moves here whole and is removed there, so the Trophy Room is Medals + Jungle Journal.
- **Reached from:** a satchel button on the pause menu and on the world map, beside the Trophy Room's.
- The mock uses a plain serif for the handwriting; the real one uses the game's own hand-lettered face (or a new one; Matt's call).

**Pokey's journal (one per world):**
1. Left home. Dot says I forgot something. I didn't. I checked.
2. The village is building me a raft. They agreed on the wood. I'll walk.
3. Dark in there. The glowworms helped. So did Dot. Loudly.
4. Fell off a ledge. Climbed back up. Dot held one claw the whole way.
5. Had tea with a spider. Good tea. Found out who the empty chair is for.
6. We stopped for tea. It cost a night. Dot left. I'm going to keep writing in here like she didn't.
7. A firefly sits on my strap. He doesn't say much. Found a photograph I didn't want to find.
8. Dot came back. She won't sit down. Meeca knows who he is.
9. A thousand steps tomorrow. I'm going to take them one at a time. There isn't another way.
10. Got there. Tea at four.

## S-8: the hidden finds

### Dot's lost pocket (approved by Matt): six finds, Worlds 4-9, stage 6 of each

Stage 6 holds no find today; 7-7's Thorn Gate is untouched. The pocket tears in Dot's netting flight (4-D). Each find has a card line (what Pokey sees) and Dot's line in her run-on voice. She says it on pick-up when she is with him (Worlds 4, 5, 8, 9). The World 6 and 7 ones she says from the satchel once she's back. The pick-up line is said in the stage, so I'd hand those four to polish-dot to place.

| World | Find | Card | Dot |
|---|---|---|---|
| 4 | A button | A plain brown button, the thread still in it. | That's mine, that's off my pouch, the thorns took a few things, I'm not going to list them, it's a button, give it here, thank you. |
| 5 | A bent pin | A pin, bent double, the kind that holds an envelope shut. | That's for pinning letters shut, no, not that letter, other letters, normal letters, mail, it's just mail. |
| 6 | A feather that isn't hers | A grey feather, far too big to be Dot's. It smells of her pouch. | That's not mine, I know it's not mine, it's from a friend, a messenger friend, from a long time ago, a bad night, can we look at the button again. |
| 7 | A ribbon | A strip of blue ribbon, the kind you tie on a nest so you can find it in the dark. | I tied one of those on a nest once, on the far branches, so I'd find it fast, and I didn't find it fast. |
| 8 | A tiny map | A map the size of a leaf, one tree circled over and over. Pokey's tree. | That's my map, from before you could walk, I circled your tree so I'd never get lost getting to it, and I never did, not once, I came every morning. |
| 9 | An envelope scrap | A torn corner of yellowed envelope, with a faded petal pressed in the seal. | Don't, don't open the pouch, that's off the letter, the corner tore, the letter's fine, the letter's still in here, I'm giving it to him, I am, at the top. |

**Payoff.** Finding all six adds one sentence to Dot's finale line. After "...since you were this big and couldn't reach the low branch.":
> I kept your map. I kept all of it. I've had you in my pocket the whole time.

### The Notch (the growth-notch twig): one find, World 1, stage 1, at the old nest

- **Card:** A twig from the old nest, notched up its length, one notch a year. The low notches are cut deep and neat. The higher ones are in a different hand, and each has a tiny fern drawn beside it.
- **Payoff:** it sits in the satchel next to the painting of his parents (S-11). No words.

### The Under the Ruins note

This depends on the World 7 secret level (SECRET-LEVELS.md), which isn't built yet. The words are ready for when it is:
> Meeca. I'm coming. It's taking a while. I'm fine. P.
> P.S. My handwriting's wobbling. That's the rain.

**Payoff, at tea, if it was found:** MEECA "Your handwriting wobbled." / POKEY "It was raining." / MEECA "You were underground, Pokey."

### The snail: one per world

- He's hidden once in every world, a little further along each time, always moving left to right.
- Tapping him gives only a small sound.
- **Payoff, if all ten were found:** a last line from Pokey at the very end: "I saw him every day, you know. He never once stopped for tea."
- He needs a small painted snail sprite (story-art).

## People who come back

**The two prologue soldiers, at the World 9 gates** (after Dot's doily line):
> N: Two soldiers stood at the foot of the steps, the same two from the garden, and a good deal more tired.
> SOLDIER: Is that a hummingbird?
> SOLDIER: Where?
> N: Dot was already behind Pokey's ear.

**The weeks after** (before tea at four):
> N: Pell's first customers were two soldiers. He took their measurements. They didn't need new coats. They just wanted to sit down.
> N: On the road home, a squirrel looked down from the old vine.
> SQUIRREL: Back already?

## The world notices what you did

**The General counts your real falls,** at the gates and at boss 10. Today the game keeps no running total, so this needs a small counter that adds up lives lost across all stages.
- **Gates:** "Come up, sloth. The General has counted every step you took. There are a thousand more. The General is not tired. The General is never tired." becomes "...every step you took, and every one of the {N} times you fell. There are a thousand more. ..." when N > 0.
- **Boss 10 intro, first time only:** after "One more." it adds "{N} falls, boy. {N} times you got up."

**Dot knows about the soup.** If the World 6 note (the soup) was found, World 8 adds a line after Dot's "you've lost weight":
> DOT: and don't tell me it's the soup, I read the note, everybody's read the note, nobody should be eating that soup.

## Who does what in dotLinesData

polish-dot owns Dot's in-stage lines (S-5). From me:
- the Flicker stage-line edits from the Oct 27 plan;
- the four pocket pick-up lines above.

I've asked polish-dot to place them, so neither of us edits the same rows. The SR-pointer rows of S-1 are all applied (story-a 72374c9, merged).

## S-7 ending cards: the line under each picture (draft; the pictures are story-art's)

Shown as a run of cards between the weeks after and the hill. Each card is 1920x1080, with the safe area in the middle 1440x880.
- venom-fang: Pokey stops by on Thursdays. He always asks first.
- crocus-rex: He ferries the village across, three at a time. The crown is still crooked.
- shadow-prowler: He still sits on the ledge. Now somebody sits with him.
- sky-sovereign: She lets the wind lane run where it likes.
- tarantula-queen: Tea at four, every day. Somebody always stays to the bottom of the cup.
- marsh-reaver: Lunch at noon, on a root by the path. He leaves half.
- stone-golem: He talks the slowest at the council now. The others wait.
- night-wing-monarch: Pokey told her how the dream ended. She wrote it down.
- magma-drake: Two cups. Both used.
- general: Every spring he plants a tree by the river. He takes his time.
- soldiers: Pell took their measurements. They didn't need new coats. They just wanted to sit down.
- squirrels: They put up a new sign. It says BACK ALREADY?
- gruntlewick: He has started a new warning. It is about Tuesday.
- mailman: His new package says NO HURRY. He is taking it very seriously.
- pell: The sign still hangs crooked. The shop is never empty.
- flicker: He stays at Pell's shop. The light over the counter is steady.

With the cards in, the weeks-after narration for the soldiers and the squirrels (above, under People who come back) moves onto their cards instead of being said twice.
