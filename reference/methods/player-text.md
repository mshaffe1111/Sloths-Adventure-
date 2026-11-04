# Method: player-facing words (Pokey's and Dot's voice, journal entries, notes, cards)
Last proven: 2026-11-01, branch `journal-voice`. It produced Pokey's Journal: a line for each of the 103 stages in Worlds 1-10, 4-D, 5-M and S-1; 13 kinds of record line with 6-10 variants each; 10 review-page closing lines. The lead approved them all at 1:05 PM ET with 4 rewrites. Last updated by the journal-voice helper (session_01FhBbYMSoYpk53bJALanKUY).

## When to use it
Use it for any words a player reads that a character "says" or "writes": journal entries, notes, Dot's tips, card lines, stage descriptions in a voice, and boss lines. Read `reference/VOICE.md` first, all of it, and above all "Pokey" and "Pokey's sarcasm". Matt's short version is that Pokey is **"a slow smart-ass"** (2026-11-01).

## Steps
1. **Read what each item really is before writing a word.** For a stage, that means its name and description (`src/game/stagePlan.ts`), its builder's header comment (`w1Sections.ts`, `protoStage.ts`, `gen2/worlds/w5-w8.ts`, specials like `w7Slide.ts`, `w8Lantern.ts`, `dotFlightStage.ts`, `meecaStage.ts`), its creatures, and its story moment (`reference/STORY-REWRITE.md` and `storyWorlds.ts` WORLD_MID). List the real stage names from the game itself, not from memory. `generateAllLevels()` plus `withExtraStages()` plus `THORNBARK_LEVEL` gives the full list (run it with tsx, stubbing `location` and `localStorage`).
2. **Write one line per item by hand.** Don't use a template with a `{name}` slot. Each line is about that item's creature, trick, place or story beat. The test: if you could swap two items' lines, rewrite one.
3. **Know where each character is.** Dot is away from 6-6 to the end of World 7, and at the foot of the mountain in World 10 (`wayside.ts dotPresent`). A line can miss her ("Turned to tell Dot the view was good. Told the view instead."), but it never has her doing something there. Where a beat already says "No Dot" (6-5), treat that stage as Dot-away too.
4. **Mark the real moments.** At a real moment the joke doesn't come (VOICE.md). The journal's are in `QUIET_STAGES` (1-5, 4-1, 4-D, 5-M, 7-7, 10-1, 10-3, 10-5, 10-10). There, Pokey's line is plain, and any generated note is cut to its first sentence with no joke after it (`plainOf`).
5. **Where variants are generated** (play notes), write 6-10 variants per kind, all at the same bar. Never use a line twice on one page: pick without reuse across the page (`worldEntries` shares a `used` set). Pick by a seed of the item's id, so a page reads the same every time it opens. Spell small numbers and times as words ("Fell four times", "Took five minutes").
6. **Send the full list to the lead as plain text** (id, name, line) before building the UI, and note the reason behind any line that isn't obvious. Build in parallel, but expect rewrites. Drop rewrites in word for word.
7. **Judge on the page, not in the list.** Render the real screen (Playwright: seed `sloth_lvl_*`, `sloth_play_*`, `sloth_finds`, `sloth_badges`, then open Satchel > Journal). Read every page out loud from top to bottom, upright 412x915 and sideways 915x412, with the page scrolled to its end. Lines that read well in a list ran together on the page: the story beat merged into the play notes, "4 falls." opened a sentence, and "Took 5:00" didn't read as speech. Those fixes came only from reading the page.

## The bar
Each line is 8-23 words. It's dry and polite, understated, one beat, and then he moves on. He's a smart-ass about himself and the situation, never cruel to a friend. The lines that set the bar:
- 3-2 "The glowworms only light up if you stand still and listen. Finally, a puzzle made for me."
- 6-2 "A spear came up out of the water and looked around. I stayed in the reeds and did my best reed."
- 6-9 "Caimans that look like roots, and frogs you mustn't touch. I touched nothing. Nothing is my best event."
- 5-6 (real) "She got away from them here, for one night. I followed where she ran. I didn't know she could do that." This echoes her first note: "I saw you run. I didn't know you could do that."
- A play note: "Golden tree snakes: sixteen. Pokey: still here."

Screenshots: `reference/satchel-mockups/journal-voice/`.

## Checks before reporting
- **Tests** (`src/game/pokeyJournal.test.ts`):
  - every live item has a line, and no two lines are equal;
  - word counts are in range;
  - no line starts with the item's name;
  - `BANNED_FILLER` matches nothing;
  - pages built from an empty record set, a mixed set and an all-clean set never repeat a line;
  - no two lines in a row open the same way (`opener`);
  - no Dot note appears where she's away;
  - quiet stages get one plain note;
  - a guardian's entry is 4 lines or fewer;
  - the review page is full on an old save.
- **Shots**, upright and sideways:
  - an old save with no records;
  - a save with records;
  - the review page;
  - each of those scrolled to the end.

  Check that every creature name fits its tile in all 10 worlds at both widths. The shot script measures this.
- **Gates**: `npx tsc --noEmit -p .`, the full test globs, `npx vite build`, `node tools/perf/artcheck.mjs`.

## Pitfalls we already paid for
- **2026-11-01, filler on old saves.** Saves from before play records fell back to 3 "unrecorded" templates ("Cleared it. I didn't write it down at the time. I remember it was green."), so a whole World 1 page repeated one line. Matt: "That is worthless and doesn't sound like Pokey." What to do instead: every item gets its own hand-written line that stands alone. When data is missing, show less, never filler about the missing data. Keep the banned-phrase test.
- **Templates with `{s}.` in front of every line** made every entry sound the same. Put the name in the heading, not in the line.
- **Checking only the list.** Repeated openers ("Fell…" then "Fell…"), a beat colliding with its own stage line ("Halfway up…" twice), and a joke right after a real moment only showed up on the rendered page.
- **Trusting "not released".** The brief said Worlds 9-10 weren't live, but they were. Check what the live build actually lists before skipping anything.
- **Screenshot script, sideways.** Sideways shows a whole world as one spread, so clicking "turn the page" moves to the next world. Turn pages by watching the page label, not by counting clicks.

## Tried and didn't work
- Three generic "unrecorded" lines, chosen by seed: a full page still repeated them, because 10 stages share 3 lines.
- Showing the record lines in the same paragraph as the story: on a phone the beat and the stats ran together into one block.

## To try
- A `playerText` gate that scans every string shown in the game for the banned filler and for lines repeated across one screen.
- The same per-item treatment for Dot's tips and the stage cards' descriptions.
