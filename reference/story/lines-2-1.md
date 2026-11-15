# 2-1 Down to the River: the player lines, approved by the story keeper (KEEPER-21, 11-14 about 8:20 PM ET)

Authority: Matt 11-13 10:43 AM ET ("full authority to add to the story and to approve all lines"). Asked by the lead
(session_01FhBbYN2CVHnFXg7XzqKXpM) at 7:52 PM ET. Read: reference/design/2-1.md (origin/t-pitch-b@b85dba7f), STORY-REWRITE.md
"World 2: Sunlit Riverbank" (:178-256 on main: the village, Meeca's note, the raft), the old 2-1 rows (dotLinesData.ts:172-173),
STAGE-RULES §5b.7. Counts are `wc -w`. World 2's voice: the river is wide and in no hurry; Dot is not. She talks faster the slower
everything around her gets.

## The lines (verbatim; the builder copies these, a test holds them equal)
| Ask | Key | Who, where | Line | Words |
|---|---|---|---|---|
| 1 | `edge` | Dot, World 2's first line, at the canopy's edge (beat 0) | The trees just stop! The river's our road now. | 9 |
| 2 | `logs` | Dot, teach, 800+ px before beat 2 (the first log) | Hear the knock? Hop on. Logs carry you! | 8 |
| 3 | `deep` | Dot, teach, 800+ px before beat 4 (replaces `hint.2-1.deep`) | This river's deep. Stay on the logs! | 7 |
| 4 | `back` | Dot, teach, 800+ px before beat 6 (the twist) | It flows the other way! Run, and hop ahead! | 9 |
| 5 | `village` | Dot, at the village gate (beat 11) | A whole village of sloths! They're all still waving. | 9 |
| 7 | `mark` | Dot, her mark on the gate (exit) | Her mark, right on the village gate! | 7 |
| 6 | road page `river` (journal, a page) | the journal | Lowland rivers run wide and lazy and carry fallen logs for days. Most sloths swim well. Pokey has never tried, and this is not the river to start on. | 28 |

Mission (stagePlan's 2-1 row, "Hop the drifting logs down to the riverbank village."): true, KEEP.

## Why
1. **edge.** Sets World 2: the canopy ends, the road changes. Dot's voice at full speed after World 1's last scare.
2. **logs.** The knock is the tell for ears; "Hop on" is the one move; "Logs carry you" is the gift (he rests while carried).
3. **deep.** The turn from splash-back to a heart, in seven words; "Stay on" also says why he doesn't swim (ask 6).
4. **back.** The design's move (run along the log, hop off its front). "Flows the other way", not "backwards": a real backwater eddy runs
   back along a bank, so it is true (Nature check).
5. **village.** The joke is in the picture: everyone waving, and still waving when he passes (canon: the mailman's nod "took a while,
   and neither of them minded"). No "slow" in player text: the word is the General's.
6. **why he won't swim yet.** Real sloths are strong swimmers, so the page says so, then gives Pokey's reason: he has never tried, and a
   river this wide is no place to learn. In 2-2 Meeca's note says "Don't swim." (STORY-REWRITE:212), and World 6 is where he learns.
7. **mark.** Her trail goes through the village (her note in 2-2: "we crossed the river today").
**Old rows go when 2-1 ships:** `hint.2-1.deep`, `hint.2-1.open` ("Down to the river!"; 1-9's exit line now says it).

## Story faults in the design (for the lead)
1. **The village is dug INTO the bank** (canon: "A village of sloths had dug its houses into the bank in a long row, and every front
   door had the same hand-painted sign: PLEASE BE PATIENT", STORY-REWRITE:182). The design's "stilt houses" contradict it; its round doors
   fit. Paint bank houses with round doors and the signs.
2. **Few of her petals in World 2.** Meeca's note: "I made it out of the petals I had left, so there won't be many for a while." 2-1's
   "petals on the way" must be few, or another find; never a full trail.
3. **The World 2 arrival scene is set IN the village.** If it plays before 2-1, the player meets the village before walking to it. Play
   it at 2-1's gate (after the exit), or check where storyWorlds.ts plays it.

## Nature check: PASS
| Thing | Verdict |
|---|---|
| A sloth coming down to a river; sloths swim | REAL (brown-throated sloths are strong swimmers); riding a log instead is the story's choice, said on the page |
| Logs drifting on a lowland river | REAL |
| A log handing him up onto the bank | storybook |
| A river "running back"; twin rivers one each way | storybook made true by an eddy: back-currents run upstream along banks and round islets. Paint the counter-flow as an eddy channel by a reed islet, not a second river flowing uphill |
| Lianas from riverside trees | REAL |
| The bounce on the high bank | FIX (look): it must be a natural springy thing in World 2's look, e.g. a bent Guadua bamboo (a Neotropical bamboo) or a springy fallen palm frond; never World 1's mushroom |
| Reeds, a reed islet, the village jetty | REAL kinds (the jetty is made by the sloths, fine from World 2 on) |
