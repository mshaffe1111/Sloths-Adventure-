# 2-4 Over the Water ("Never Touch the Bank"): the player lines, approved by the story keeper (KEEPER-24, 11-18)

Authority: Matt 11-13, "the storykeeper has full authority to add to the story and to approve all lines" (packet KEEPER-24, written by
the lead 3:05 PM ET 11-18). For 2-4's build (DESIGN-24-25; the design is origin/t-design-24 reference/design/2-4.md).
Read for this: reference/story/STORY-KEEPER.md (§2 the bible, §3 Dot's rules, §7 checks), the design (the arc :28-40, "First
appearances" :44, "For the story keeper" :61-62), World 2's voice (lines-2-1.md, lines-2-2.md; w2Arc21.ts LINES_21, w2Arc22.ts LINES_22,
w2.ts W2_TIPS), Dot's voice today (lines-1-9.md on origin/t-keeper-19), the goal words (stagePlan.ts:69 the 2-4 row, goalLine :197,
SEALED_LINES :208, GOAL_WORDS :216; goals.ts:76-81), the water warning (pipeline.ts:3713-3736: the kit's `tips.water`), the old 2-4 rows
(dotLinesData.ts:149, 150, 159, 176, 182; stageClue.ts:30; pokeyJournal.ts:63), the journal caps (journal.test.ts:31), the banned
words (playerText.test.ts:35 BANNED; whatsNew.test.ts:28 is What's New only), Meeca's World 2 note (finds.ts:81). Counts are `wc -w`.
All checked on origin/main 6e7b85f8f.

## The lines (verbatim; the builder copies these, a test holds them equal)

| Ask | Key | Who, where | Line | Words |
|---|---|---|---|---|
| 1 | `drop` | Dot, THE let-go teach, 800+ px before beat 1 (the first drop, soft), on the arrival bank where the first knock is heard | Knock? Log coming! Let go when it's under you. | 9 |
| 2 | `catch` | Dot, teach, 800+ px before beat 4 (TURN: up from the log), on beat 2's or 3's stump bank | Ride a log under the vine, then jump up! | 9 |
| 3 | `deep` | Dot, World 2's water warning (w2.ts W2_TIPS.water, said by the pipeline before the first deadly water; in 2-4 that is beat 6). REPLACES "This river's deep. Stay on the logs!" world-wide (conflict 1) | This river's deep. Don't touch the water! | 7 |
| 4 | `view` | Pokey, once, on the raft after the great swing (beat 9), when the camera has pulled out and he is drifting to the jetty; never on the swing itself | So this is what Dot sees all day. | 8 |
| 5 | `kapok` | the journal: the kapok's tip (12 words, journal.test.ts:31's cap; card name "Kapok Tree") | Among the rainforest's tallest trees. Its seeds sail off on silky fluff. | 12 |
| 6 | `mission` | the stage card (stagePlan.ts:69, replaces "Swing across the river on the hanging vines.") | Vines to logs, logs to vines. Cross the river to the jetty. | 12 |
| 7 | (none) | SEALED: 2-4's exit never locks, so there is no line (conflict 4) | | |
| 8 | `page` | Pokey's journal page `'2-4'` (pokeyJournal.ts:63, REPLACES "Swung across the river on the vines while the crocodile watched. Meeca's note said don't swim. I didn't.", conflict 6) | Dropped from the vines onto passing logs and jumped back up. Meeca's note said don't swim, so I flew instead. | 20 |
| 9 | `clue` | the Stage Cleared clue `'2-4'` (stageClue.ts:30, REPLACES C('A Shadow Underwater', 'Under the still water, a long shadow with a crown on its head.'), conflict 6): title **Dry Bootprints** | On the jetty the bootprints start again, perfectly dry. Somebody carried them over. | 13 |

Code form for the builder: `'2-4': "Dropped from the vines onto passing logs and jumped back up. Meeca's note said don't swim, so I flew instead.",`
and `'2-4': C('Dry Bootprints', 'On the jetty the bootprints start again, perfectly dry. Somebody carried them over.'),`.

Ids for the kit, as 2-1's (w2Arc21.ts lineId21): `w24.drop`, `w24.catch`, `w24.view`; `deep` stays World 2's kit tip (W2_TIPS.water);
MISSION_24 for the card. TEACH lines (said on Normal's default Tips as on Help, D50): `drop`, `catch`.

## Why each one, and its one-line check

1. **drop.** The stage's one new move (the design's teach: two clocks, one press). "Knock?" calls back 2-1's own teach ("Hear the knock?
   Hop on. Logs carry you!", LINES_21.logs) without repeating it: the player already knows a knock means a log, so here it means GET
   READY. "Let go" is 1-6's word for leaving a liana ("Grab at the edge. Let go when you glow!", w1Arc16.ts:58), so the move has one name
   across both worlds. Dot's World 2 voice: she talks faster the slower everything around her gets (lines-2-1.md). *Check: 9 words; no
   control word (no tap, flick, press, hold); true (beat 1 is soft: a miss splashes him back, so the line promises nothing it can't keep);
   holds "let go" and "log" for the bots' new `drop-on-log` skill's reading (design NEW 2).*
2. **catch.** The TURN: the log stops being a floor and becomes the way up. "Ride a log under the vine" is the read (wait for the log to
   carry you there), "then jump up" is the one press; the felt "The log threw me!" is left for him to find (the design's own "He feels").
   Not "that vine" (said 800 px early, upright shows ~425 px: the vine is not on screen yet). *Check: 9 words; "jump" is a move word, not a
   control word; true on both settings (every ride has a catch at every phase of the swing, design :20; Easy rides only <= 80 px/s logs).*
3. **deep.** Replaced, not reused (conflict 1). Seven words, the same opening as 2-1's line, so World 2's warning still sounds like one
   sign; the new half is true wherever World 2 has deadly water. *Check: 7 words; no "slow", "late", "hurry", "too", "wait"; nobody hurt
   in the words (the cost is shown by the sign and the heart, pipeline.ts:3714).*
4. **view.** The wonder, in Pokey's deadpan, and it lands on a real thing: Dot FLIES (she "was meant to fly the warning round the nests",
   STORY-KEEPER §2), and on the great swing, for one arc, he sees the forest from where she always sees it. No joke, no button ending; a
   sloth who has never been above the canopy saying the quiet thing. Said on the raft (calm, his hands free, the slow row) so the box
   covers no jump (STAGE-RULES §5b.7). Pokey speaks in World 2 already (2-2's `lily`), so it is not new to give him the line. *Check:
   8 words; once; replaces the design's felt "I flew over the whole lake!" (a lake is ruled out, conflict 2).*
5. **kapok.** Fact-checked (Nature check below): "among the tallest", never "the tallest" (conflict 3). The second sentence is the kapok
   the player already knows: 1-4's pods shed fluff before they fall (podfall.ts:4, "fluff trickles down the column"), so the card pays off
   World 1 with the reason for the fluff. *Check: 12 words, journal.test.ts:31's cap; no key words; true.*
6. **mission.** The stage's idea in its own rhythm (vine to log, log to vine: beats 1 and 4, then both in 6, 8 and 9) and its goal, the
   jetty (the design's goal: vine_runner, reach the jetty). The old line ("Swing across the river on the hanging vines.") is half true: it
   leaves out the logs, which ARE the stage. "River", as every 2-4 text on main says (conflict 2). *Check: 12 words on a card (not a
   speech box, as 1-9's MISSION_19); no "defeat", no count, no "wait".*
7. **sealed.** None: see conflict 4.

## The story conflicts, settled

1. **W2_TIPS.water is REPLACED, world-wide: "This river's deep. Don't touch the water!"** The approved 2-1 line ("This river's deep. Stay
   on the logs!", lines-2-1.md `deep`) is said by the pipeline before the first deadly water of EVERY World 2 stage (pipeline.ts:3721, the
   kit's `tips.water`). In 2-4 that is beat 6, "liana, twin log, liana, twin log, no bank": the player must LEAVE the logs for the vines,
   which he was taught two beats earlier (line 2). "Stay on the logs!" there tells a child the one thing not to do (the D38 rule: what a
   thing tells the player must be true here). It is also wrong in any World 2 stage whose deadly water has no logs (2-2's pond: pads).
   The new words are true in all of them, keep 2-1's reason (why he doesn't swim: lines-2-1.md "Why" 3), and echo Meeca's own World 2
   note: "The soldiers wouldn't touch the water... Don't swim." (finds.ts:81). **For the builder, in ONE commit (the keeper does not edit
   code):** w2.ts:67 W2_TIPS.water, w2.test.ts:116's pinned string, and lines-2-1.md's `deep` row (w2Arc21.test.ts:53 parses that row and
   holds W2_TIPS.water equal to it; I have not edited lines-2-1.md here, because main's test would fail until the code moves with it).
   lines-2-1.md's `deep` row then reads "This river's deep. Don't touch the water!", 7 words, with a note "replaced by KEEPER-24".
2. **A wide RIVER, not a lake.** The design's look says "a wide lake under riverside fig trees, logs drifting with the current" and its
   felt line "I flew over the whole lake!". Logs drift steadily only on a current; World 2 is the Sunlit Riverbank; and every 2-4 text on
   main says river: way.2-4 "I could watch this river all day" (dotLinesData.ts:182), pokeyJournal.ts:63 "Swung across the river on the
   vines", the water warning "This river's deep". So 2-4 is a broad river reach (channels between sandbars and stump banks, which the
   beats' "next river" banks already are) and no player line says lake. The giant kapok leans over the middle of the river.
3. **The kapok is not "the tallest tree of the rainforest".** The packet's ask (5) says "the tallest"; that is false. Kapok (Ceiba
   pentandra) is an emergent that grows to about 60-70 m, among the tallest in the Amazon, but the tallest tree found there is an
   angelim vermelho (Dinizia excelsa, about 88 m, measured 2019). So the card says "Among the rainforest's tallest trees."
4. **No locked exit, so no SEALED line.** stagePlan.ts:69 makes 2-4 `vine_runner` with no `gathers`; goals.ts:81 counts petals only for a
   harvest or a `gathers: 'petals'` stage, and GOAL_WORDS (stagePlan.ts:216) has no words for vine_runner, so goalLine is empty and the
   exit is never locked. Keep it that way: the design's goal is the jetty, and Meeca's petals are FEW in World 2 (lines-2-1.md fault 2;
   her note: "there won't be many for a while"), so a petal count here would contradict the story. If the lead ever gives 2-4 a count,
   the keeper writes the line then (the key '2:vine_runner' would be 2-4's alone in World 2).
5. **Two cues for "let go" (for the lead and the engine, not words).** World 1 taught "Let go when you glow!" (the sweet spot, physics.ts
   :740: a let-go there is the leap toward the next vine). Line 1 teaches "let go when a log is under you". On a liana whose landing is a
   river (the design's NEW 1), the glow must agree with the log (light only when a let-go will land on a log) or not show, or the two
   teaches fight. The line stays; the cue is the engine packet's call.

6. **2-4 has NO cast, so the journal page and the clue are rewritten (follow-up, 11-18; the earlier "Stay" ruling on both is withdrawn).**
   The builder reports the new 2-4 has no crocodile and no animals: vines, logs, a river, a raft at the end (the design says "Cast none",
   2-4.md :25). pokeyJournal.ts:63 "while the crocodile watched" tells a watcher the stage never shows; stageClue.ts:30 shows "a long
   shadow with a crown" under "the still water", and the water is a current carrying logs. Both untrue now, so both are replaced (rows
   8, 9). **The page** keeps the old page's one true thing (Meeca's note: "Don't swim.", finds.ts:81) and turns it into Pokey's deadpan
   with the stage's two moves and its great swing ("so I flew instead"); 20 words, inside pokeyJournal.test.ts:38's 8-23, two sentences,
   past tense, as its neighbours ('2-1', '2-3'). **The clue** stays on the World 1-4 thread the file names (Meeca's trail and the
   soldiers', stageClue.ts:4) and calls back 1-1's "A Bootprint": at the jetty the soldiers' prints begin again, DRY, because they were
   carried over (her note: "The soldiers wouldn't touch the water, so the crocodile carried us over"). It hints at Crocus Rex without
   putting him in the stage, keeping the crown and the crocodile for 2-9 / 2-10's clues. Not the raft: 2-5's clue is "The Raft" (the
   village starts building his), so 2-4's own drifting raft is not mentioned. *Checks: no semicolon, spaced hyphen or ellipsis
   (storyStyle.test.ts); "Dry Bootprints" vs 2-3's "Wet Footprints" differ in more than a number or name (playerText rule 2); grepped
   src/ for "perfectly dry", "carried them over", "so I flew": no player line uses them; nobody hurt.*

## Nature check: PASS (two fixes taken in the words)

| Thing | Verdict |
|---|---|
| Kapok "among the rainforest's tallest trees" (5) | REAL: Ceiba pentandra grows to about 60-70 m, an emergent standing above the canopy; "the tallest" would be FALSE (Dinizia excelsa, about 88 m, is the tallest known in the Amazon). Fix taken: "among" |
| "Its seeds sail off on silky fluff" (5) | REAL: the pods split and the seeds ride away on the wind in kapok fibre (the silky fluff once used to stuff life jackets); 1-4's pods already show the fluff |
| A kapok leaning over a river | REAL: kapok is common on river banks and flooded forest |
| Lianas hanging from riverside fig trees | REAL (as lines-2-1.md) |
| Logs drifting on the current, knocking as they leave the bank | REAL (a lake would not carry them: conflict 2) |
| A sloth dropping onto a drifting log, jumping from it to a vine | storybook, as 2-1's rides; fine |
| A raft drifting to the village jetty | REAL kinds (sloth-made, as 2-1's jetty) |
| Nobody hurt | HOLDS: no line names a creature; the stage has no cast, and the old crocodile watcher and shadow are gone (conflict 6) |

Source note: en.wikipedia.org is not reachable from this cloud session (the fetch was refused by the network rules), so the heights are
from the keeper's own knowledge of the Wikipedia pages "Ceiba pentandra" and "Dinizia excelsa" (the 2019 Amapa measurement); the lead
can re-check them there. The wording only claims "among the tallest", which holds on any figure in that range.

## Checked against the rules

- Speech boxes 7-9 words (`wc -w`), under 10 (STAGE-RULES §5b.7); the card 12; the journal tip 12 (journal.test.ts:31's cap).
- Banned words: none of playerText BANNED; no "slow", "late", "hurry", "too" (the General's wound) and no "wait" in Pokey's help
  (lines-2-2.md "Why" 2).
- No control words: no tap, press, swipe, flick, button, hold, duck, crouch, slide down. "Let go", "ride", "jump" are move words.
- Repeats: grepped src/ on origin/main for "Log coming", "under the vine", "what Dot sees", "Vines to logs", "touch the water", "silky",
  "tallest trees": no player line uses them. "touch the water" is in Meeca's note (finds.ts:81), another list, on purpose (conflict 1).
- One tip, one channel: (1) and (2) each play once, before their beat; (3) is the world's one water warning; nothing re-teaches 1-6's
  liana or 2-1's knock.
- Dot is she; Pokey deadpan; nobody hurt; no winter words.

## For the builder and the lead (code, not words; the keeper does not edit code)

- **New replaces old when 2-4 ships:** dotLinesData.ts:149 `hint.2-4.deep` ("Let go at the front of the swing": contradicts line 1),
  :150 `hint.2-4.vine` ("Flick up": a control word), :159 `hint.2-4.island` (the design has no island), :176 `hint.2-4.missed` (beat 1 is
  splash-back by design; the help line is the engine's), and stagePlan.ts:69's mission (line 6). W2_TIPS.water per conflict 1.
- **Stay:** way.2-4 (dotLinesData.ts:182, the river). **Replaced:** pokeyJournal.ts:63 (row 8) and stageClue.ts:30 (row 9), conflict 6.
- **The water warning in 2-4** must fall before beat 6 (the first deadly water), never before beats 1 or 3 (soft, splash-back): w2.test.ts
  :126 already holds "no warning before a splash-back river".
- **The kapok card:** a ROAD_ENTRIES card needs its own painted picture (journal.test.ts:18-24); or it waits as a journal page with 2-1's
  `river` and 2-2's `lily`. The lead's call; the words fit either.
- **The lines live in one object** (LINES_24, MISSION_24) in 2-4's world file (w2Arc24.ts) with a verbatim test that parses this table, as
  w2Arc21.ts / w2Arc21.test.ts do.
