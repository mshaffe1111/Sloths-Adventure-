# KEEPER-23-29 report: the player lines for 2-3 "Walk Them Home" and 2-9 "The King's Drum" (story keeper; written 7:53 PM ET 11-18 by `date`)

Branch t-keeper-23-29 from origin/main 6e7b85f8f. Files: reference/story/lines-2-3.md, reference/story/lines-2-9.md (the lines,
verbatim, with ids, reasons, cites and the nature checks), this report. No code, no asset, no seed list (LAWS 5, scoped: fast gates).

## Method used
reference/methods/player-text.md (steps 1-6: read what each item is in the code first, one line per item by hand, who is where, the
real moments; checks: word ranges, openers, BANNED), reference/methods/in-play-text.md (boxes never over Pokey or the next action:
each line's "where" puts it on a rest or flat ground), STORY-KEEPER.md §7 (who says it, why, now; the facts; another stage's beat; true
here; one tip; cite; read the goal type and its words before an exit line), and lines-2-4.md's file shape (KEEPER-24, approved 11-18).

## 1. Done-items
- 2-3, all 8 asks, APPROVED (lines-2-3.md table): follow, heron + look, spooked, missingCage / missingReed, post, home, heronCard
  (Cocoi Heron), mission; plus goalStart / goalLate (fixed lines) and the HUD word "home"; the old page and clue the design makes false,
  replaced (page, clue).
- 2-9, all 7 asks, APPROVED (lines-2-9.md table): drum, roar (a sound; Dot reacts), goalStart / goalLate / sealed, rang, drumCard (The
  King's Drum), mission ("Fight" reworded), the guard's card (no change, with the reason); the old page replaced.
- Evidence: every count by `wc -w` (speech boxes 5-9 words, under STAGE-RULES.md:276's 10; teach lines 8 or fewer; cards 11-12, the
  cap journal.test.ts:31; pages 21-22, pokeyJournal.test.ts:38's 8-23); every file:line cite re-read after the last edit (D52); openers
  checked against pokeyJournal.ts `opener` and World 2's pages; no BANNED filler (playerText.test.ts:35); no workshop words.
- Fact checks: cocoi heron (Wikipedia, read 11-18); crocodilian head slaps (Dinets, Copeia 2013); the "water dance" NOT used (alligators,
  and Crocus Rex is a crocodile).
- Gates: roadmapcheck PASS, knowncheck PASS, timecheck (below).

## 2. Polish check
No screen to shoot: the lines are not in the game until 2-3's and 2-9's builds (both "DESIGN ONLY", 2-3.md:1, 2-9.md:1). Judged instead
where they will sit: each line's "Who, where" puts the box on a rest, a bank, flat ground or a walk-in, never over a jump, a pad row or a
beat row (in-play-text.md "The law"); the two lines the player must get on every setting (2-3 post / home, 2-9 rang) are flagged for a
default-Tips test (D50). Named plainly: the polish of these lines on a phone, upright and sideways, is proved by the builder's stills.

## 3. Pushback
1. 2-9 ask 1 "hop when it booms": the BOOM is ONE only, the flown rows need a hop on EVERY beat (2-9.md:10-11, :38). The line says
   "to the drum's beat".
2. 2-9 ask 1 "listen": a muted phone sees the beat in the lanterns (2-9.md:52); the line never says "hear".
3. goalLine's template with a two-word verb makes the 'late' line 10-11 words, over the box's 10: both stages get fixed goal lines.
4. 2-3's goal cannot hang on '2:rescue' (2-7 is rescue too, stagePlan.ts:73): it hangs on the new goal type or the stage.
5. 2-9: if the posted royal guard counts toward the gauntlet's animals (goals.ts:92), "Chase off 5 snappers" lies by one.
6. 2-9: the bell's silence: the keeper asks the guard be met BEFORE the bell, so bell, silence, Pokey's line, shrine run unbroken
   (PICKS-29-32.md:46 says "at the shrine steps"); and a locked shrine needs a way back across the barge. The lead's calls.

## 4. Suggestions
- **2-5's goal words** (packet-ready): objective: World 2's purge says "Defeat 5 predators" (stagePlan.ts:227) on a stage whose card
  says "Chase the snappers off the bank" (:70); files: stagePlan.ts GOAL_WORDS / countWord, w2Arc25 when built; done-items: 2-5's goal
  lines in World 2's words (the same "Chase off {n} snappers" / "Still {n} snappers to chase off", if the keeper approves them for 2-5),
  under 10 words, held by a test.
- **goalLine's 'late' form** (packet-ready): drop "before the sanctuary opens" from the template so every two-word verb fits a box;
  files: stagePlan.ts:197-203 and its tests; done-item: every world's 'late' line under 10 words, checked by a test over every world and type.

## 5. Unresolved
- Nothing in the packet left undone. Open for the lead: where the two new cards live (road card with a painted picture, or a journal
  page), the guard's place against the bell, the shrine's way back, and the guard out of the count.

## 6. Method update (proposed; the keeper does not edit methods)
- player-text.md "Checks": add "a goal's three lines (start, late, sealed) are counted against the speech box AFTER the template fills
  them" (found here: goalLine's 'late' with a two-word verb is 10-11 words).
- STORY-KEEPER.md §7: add "a line about sound is checked on a muted phone: say what is seen as well as heard" (2-9's lanterns).

## 7. Lessons applied
D52 (cites checked last, after every edit), D50 (lines that must be said on Normal's default Tips are named), D30 (every time here
from `date`), law 3 / D7 (every fact read in origin/main's code, not in the packet's words: the old rows, the template, the count),
D34 (each claim cites file:line), D1 / law 6 (per-item lines, no repeats: openers checked across World 2's pages), D43 (shipped words
checked on origin/main, never a working branch), D84 (roadmapcheck run, PASS).

## 8. Turnover note
The story keeper's turnover is its bible, reference/story/STORY-KEEPER.md: not rewritten in this packet (the packet names only the two
line files); its §7 addition is proposed above for the lead.
