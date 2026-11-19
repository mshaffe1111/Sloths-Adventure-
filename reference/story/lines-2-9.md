# 2-9 The River King's Court ("The King's Drum"): the player lines, approved by the story keeper (KEEPER-23-29, 11-18)

Authority: Matt 11-13, "the storykeeper has full authority to add to the story and to approve all lines" (packet KEEPER-23-29, written
by the lead 7:40 PM ET 11-18). For 2-9's build (the design is origin/t-design-29 reference/design/2-9.md: the hop :10-11, the goal
:30-32, the arc :37-48, the beat taught :52-53, "ignores the beat" :54, "For the story keeper" :89-90; the lead's rulings
reference/design/PICKS-29-32.md on ccr-ea739a2f-dfcee4: Matt's pick :15-16, the posted royal guard :46-48).
Read for this: reference/story/STORY-KEEPER.md (§2 the bible, §3 Dot's rules, §7 checks), Crocus Rex's voice and his first words
(STORY-REWRITE.md:254-290), World 2's voice (w2Arc21.ts LINES_21, w2Arc22.ts LINES_22, origin/t-keeper-24 lines-2-4.md), the goal words
(stagePlan.ts:74 the 2-9 row, :70 2-5's "Chase the snappers off the bank.", goalLine :197, GOAL_WORDS :216-229, countWord :233;
goals.ts:92), the old 2-9 rows (dotLinesData.ts:155, 156, 170, 171, 187; stageClue.ts:35; pokeyJournal.ts:68), the guard's card
(journal.ts:56, journalMet.ts:12-13), the journal cap (journal.test.ts:29-33), the banned words (playerText.test.ts:35 BANNED),
STAGE-RULES.md:276 (speech boxes under 10 words). All checked on origin/main 6e7b85f8f. Counts are `wc -w`.

## The lines (verbatim; the builder copies these, a test holds them equal)

| Ask | Key | Who, where | Line | Words |
|---|---|---|---|---|
| 1 | `drum` | Dot, TEACH, 800+ px before beat 1, at the water gate while the drum plays alone (beat 0) | Hop to the drum's beat, and keep running! | 8 |
| 2 | `roar` | Dot, once, right after the king's roar (a SOUND, no words from him) at the twist (beat 6), on its rest bank before the double-time row | That's the king! Now the drum's twice as fast! | 9 |
| 3 | `goalStart` | Dot's goal line, 'start' (in place of goalLine's, stagePlan.ts:197) | Chase off {n} snappers to open the sanctuary | 8 |
| 3 | `goalLate` | Dot's goal line, 'late' (the template's 'late' would be 10 words, over the box's 10) | Still {n} snappers to chase off | 6 |
| 3 | `sealed` | Dot at the LOCKED shrine (SEALED_LINES `'2:gauntlet'`, stagePlan.ts:208; Dot explains any locked exit) | Snappers still on the court! Back we go! | 8 |
| 4 | `rang` | Pokey, once, in the silence after the court bell (beat 10), as he steps off toward the shrine; never on the barge | I think I just rang for the king. | 8 |
| 5 | `drumCard` | the journal (card name **The King's Drum**; 12 words, journal.test.ts:31's cap) | Crocodiles signal by slapping their heads on water. This king prefers drums. | 12 |
| 6 | `mission` | the stage card (stagePlan.ts:74, replaces "Fight through the river king's court and reach the shrine.") | Dance to the king's drum, chase off his snappers, reach the shrine. | 12 |
| 7 | (no change) | the River King's Guard card (journal.ts:56), kept: the posted guard is the same wired guard (PICKS-29-32.md:46-47) | Head-on he blocks. Flick sideways to kick, or hit from behind. | 11 |

Two stage texts the new design makes false, replaced (the keeper's call, as 2-4's conflict 6):

| Key | Where | REPLACES | Line |
|---|---|---|---|
| `page` | Pokey's journal page `'2-9'` (pokeyJournal.ts:68) | "The king's guards stood up straight and held their spears just so. I bowed. Then we got on with it." | The whole court danced to the king's drum. I danced too, slowly, but on the beat. Then I rang his bell. |
| (none) | the Stage Cleared clue `'2-9'` (stageClue.ts:35, "A Crooked Crown") | stays: true of the new stage (no guards in it) | |

Code form for the builder: `'2-9': "The whole court danced to the king's drum. I danced too, slowly, but on the beat. Then I rang his bell.",`
(21 words: pokeyJournal.test.ts:38 allows 8-23; it opens "the whole", not 2-8's "the water" or 2-10's "Told", pokeyJournal.ts `opener`). The goal lines are FIXED lines for 2-9 (goalStart / goalLate; {n} the live count,
"snapper" at n = 1), `sealed` goes in SEALED_LINES as `'2:gauntlet'` (2-9 is World 2's only gauntlet, stagePlan.ts:65-75), and the
HUD's countWord for World 2's gauntlet is **`snappers`**. 2-5 (World 2's purge, also snappers) is not in this packet: its words stay
2-5's keeper call.

Ids for the kit, as 2-1's (w2Arc21.ts lineId21): `w29.drum`, `w29.roar`, `w29.rang`, `w29.goalStart`, `w29.goalLate`, `w29.sealed`; MISSION_29 for the card. TEACH lines (said on
Normal's default Tips as on Help, D50): `drum`, `roar` (the twist's first time). `rang` is a story moment the player must get on every
setting: see "For the builder". The guard keeps its own teach row, `hint.2-9.kick` (below).

## Why each one, and its one-line check

1. **drum.** The ask was "listen to the drum, keep going, hop when it booms". Two halves of that are wrong on the screen, so the line
   says what the flights say: (a) **every beat, not only the boom.** The BOOM is ONE only (design :37, "BOOM tok tok tok"), but a beat
   row is "right held, a tap on every beat" (:10-11) and beat 1 is hopped ONE-TWO (:38); "hop when it booms" would teach one hop a bar
   and land him in the water. "To the drum's beat" is every beat, as anyone dancing to a drum hears it. (b) **a muted phone.** The beat
   is SEEN as well as heard (:52, "the lanterns pulse on ONE, so a muted phone sees it"), so the line says "the drum's beat", never
   "hear" or "listen". "Keep running" is the design's "keep going" made plain: hopping from a stand never clears a row (:11), so the
   run is half the lesson. *Check: 8 words; "hop" and "running" are move words, no control word; true on Easy (Easy's rows are the
   same tap every beat, :11); promises nothing harsh: the drum says WHEN, it never kills (:54).*
2. **roar.** The roar is a crocodile's bellow, a SOUND (crocodilians do bellow: the nature check), with no words from the king, because
   2-10 owns his first words ("HALT! You stand on the bank of Crocus Rex...", STORY-REWRITE.md:258) and his surprise at who came
   ("You're the one following her? You?", :262): in 2-9 he has not seen Pokey, and the roar is him wanting his dance faster, not at
   anyone. Dot names who and what changed. "The drum's twice as fast" is true on both settings (Normal: logs twice a bar; Easy: the drum
   doubles, the logs keep one a bar, design :43), so the line never promises Easy's logs double. *Check: 9 words, under 10; said on the
   rest before the row, so the box covers no jump.*
3. **goal words.** World 2 already says "chase" for snappers (2-5's card, stagePlan.ts:70, "Chase the snappers off the bank."), and the
   design's snapper "paddles off, huffy" when bopped (:42): nobody is beaten, so "Defeat ... predators" (GOAL_WORDS :227) is wrong here.
   The template's 'late' form with a two-word verb is 10 words, so 2-9 gets fixed lines; `sealed` is Dot's World 1 turn "Back we go!"
   (SEALED_LINES '1:vine_runner', stagePlan.ts:210), so a locked exit sounds the same across worlds. The barge is not a count: it is
   the only way to the shrine (:47), so it lives in the mission, not the goal. *Check: 8, 6 and 8 words; true only if the count is
   snappers alone: see "For the builder" 2.*
4. **rang.** The design's felt line is "...uh-oh" (:48); the bell lets the whole court fall silent (:47, :88). Pokey, deadpan, says the
   true thing a beat late: he has just rung a king's bell in a king's court. It is the setup 2-10 pays off at once (Crocus Rex's
   "HALT!", STORY-REWRITE.md:258), so it steals nothing from the boss and leaves the scene on a quiet note, not a button. "I think"
   is Pokey's understatement, not doubt. *Check: 8 words; once; said walking on the landing in the silence (no move under it).*
5. **drumCard.** Fact-checked (below): crocodiles really do signal by slapping their heads on the water. The second sentence is the
   river king's character in five words (he is proud, theatrical, "a matter of professional pride", STORY-REWRITE.md:274): a real
   crocodile slaps the water; a king keeps a drum. The ask offered the "water dance" too: it is not used (nature check). *Check: 12
   words, the cap; no key words; true.*
6. **mission.** The ask: "Fight through the river king's court" against "nobody is hurt". "Fight" goes: nothing in the stage is
   fought (the snappers paddle off, :42; the guards on rafts are parked, PICKS-29-32.md:15). The new card says the stage in its own order:
   the dance (beats 1-8), the snappers (the goal), the shrine (the exit). The barge is left for the player to find (the signature,
   :47). *Check: 12 words; no "fight", "defeat" or count; "his snappers" (the king's court's, :32).*
7. **The guard's card: no change.** The posted royal guard is the wired guard (PICKS-29-32.md:46-47: "predatorAI royal; head-on he
   blocks, from behind a kick"), so the card's tip is still true, and its stage is still 2-9 (journalMet.ts:13). "Kick" is the house word
   for this move (the snapping turtle's card, journal.ts:30), and a kicked guard is shoved, not hurt. *Check: 11 words; true.*

**page.** The old page has the 14-guard court (guards standing straight, spears, a bow). The new page keeps its shape (what happened,
then the deadpan turn) on the stage's real idea (design :2, "The whole court dances to the king's drum") and the slow smart-ass's joke
that has its setup in the scene: the slowest animal in the forest, on the beat. It ends on the bell, which 2-10 answers.

## Nature check (the journal card, and the roar)

- Crocodilians signal across water with head slaps (the head brought down hard on the surface with a loud slap) and with bellows;
  the head slap is one of the main non-vocal signals in the long-distance signaling survey of all crocodilians (Dinets, "Long-Distance
  Signaling in Crocodylia", Copeia 2013(3):517-526, https://bioone.org/journals/copeia/volume-2013/issue-3/CE-12-125/Long-Distance-Signaling-in-Crocodylia/10.1643/CE-12-125.full,
  read 11-18).
- The "water dance" (water jumping on the back of a bellowing animal) is reported most clearly for alligators, and Crocus Rex is a
  crocodile (STORY-REWRITE.md:210, :260): not used, so the card claims nothing that a curious kid could look up and find false.

## Conflicts found, and the keeper's call

1. **"hop when it booms"** (design :89) against the flown rows (:10-11, :38): the line says every beat (ask 1, above).
2. **"listen"** against a muted phone (:52): the line says the beat, which is seen and heard.
3. **The goal:** GOAL_WORDS gives every gauntlet "Defeat ... predators" (stagePlan.ts:227); 2-9 has no one to defeat. World 2's own
   words (ask 3).
4. **Old 2-9 rows the design makes false:** `hint.2-9.court` (dotLinesData.ts:170, "Kick one guard into the rest!": there is no row of
   guards) and `hint.2-9.guards` (:171, a second teach of the same guard, one tip one channel): retired. **Stay:** `hint.2-9.kick` (:156,
   the posted guard's first-meeting teach, "Head-on he blocks. Kick him!"), `float.blocked` (:155), `way.2-9` (:187, true), the clue
   (stageClue.ts:35).
5. **The king's words:** none in 2-9 (ask 2): 2-10's "HALT!" is his entrance (STORY-REWRITE.md:258).

## For the builder and the lead (code, not words; the keeper does not edit code)

1. **New replaces old when 2-9 ships:** dotLinesData.ts:170 `hint.2-9.court`, :171 `hint.2-9.guards` (and their dotTips.ts:38, :145
   entries); stagePlan.ts:74's desc (line 6); pokeyJournal.ts:68 (page); the goal lines, SEALED_LINES '2:gauntlet' and countWord for World 2's gauntlet (line 3).
   **A locked shrine needs a way back:** the shrine is reached by the barge (:47); if he lands short of the count, `sealed` sends him
   back to the court, so the builder proves the barge (or the quay) takes him back, or the count is met before the barge on every roll.
2. **The count must be snappers only.** The gauntlet counts animals (goals.ts:92 `n.animals`); if the posted royal guard counts as
   one, "Chase off 5 snappers" lies by one. The guard stays out of the count (or the goal words change with the lead's ruling).
3. **The bell's silence is unbroken.** The guard is posted at the shrine steps (PICKS-29-32.md:46); `rang` plays after the bell. If
   the guard stands between the bell and the shrine, the silence becomes a scuffle. The keeper asks that the guard meet him BEFORE the
   bell (on the landing as he steps off the barge, facing the water as ruled), so bell, silence, `rang`, shrine run in that order. The
   lead's call.
4. **D50:** `rang` is said in every Tips setting (the stage's last beat). If the Tips filter (dotTips.ts) would drop it as chatter, it
   goes on the stage's own beat (as 2-4's `view`), and a test proves it is said on Normal's default Tips.
5. **The drum card** needs its own painted picture if it is a road card (journal.test.ts:18-24): the throne island's drum (design
   art ask 3, :85-86) can be it; or it waits as a journal page beside 2-4's kapok. The lead's call; the words fit either.
6. **The lines live in one object** (LINES_29 with goalStart / goalLate / sealed, MISSION_29) in 2-9's world file (w2Arc29.ts) with a verbatim test that parses this
   table, as w2Arc21.ts / w2Arc21.test.ts do.
