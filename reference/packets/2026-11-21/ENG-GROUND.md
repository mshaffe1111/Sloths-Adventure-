# ENG-GROUND: a leg laid UNDER another leg is not buried by the upper leg's earth (2-7 "The Way Home" and every out-and-back stage)
Engine, Opus 5.5 xhigh. Written 12:48 PM ET 11-21 (by `date` in the same command). A FRESH member. 2-7 waits on it.
BOX: hand over at 320k REAL context (the lead reads it at 20 minutes and every 15 minutes after 250k) with the EXACT NEXT STEP; stop by 10:45 PM ET.
READ LEAN (D102): this packet; `git show origin/t-eng-27:reference/design/2-7.md` lines 1-40 (the out leg and the way home); the evidence still
`reference/qa-reports/ENG-27/stills-27d/4-race-leg-under-out-leg-buried-x14950-sideways.jpg` on origin/t-eng-27 (look once, downscaled);
reference/STAGE-RULES.md §4 (painted art for anything that changes the look) and §5b (the polish bar); PERFORMANCE-RULES §1 (the draw budget);
LAWS headlines; LESSONS D57/D87, D75, D101, D102, D105, D107, D109. Code by grep and line ranges only (cut -c1-200).
**Run ReadNotifications at EVERY step boundary, at every push and between long tool rounds. Messages to the lead carry NO clock times (D109).**
BASE: a NEW branch t-eng-ground from origin/t-eng-27 at 2460568a9 (it has ENG-27d's 'under' layer and beforeGround hook in drawProtoScene).
Push there. ENG-27d keeps working on t-eng-27; touch only the ground paint and its tests, so the merge back is small.
THE DEFECT (found by ENG-27d, lead looked): on the home toy (?fixture=home, POST_CODE, seed 1), wherever the race leg runs UNDER the out leg
(x about 14000-18600), the out leg's painted earth (protoArt drawGround: the soil runs to the stage's foot) is drawn down over the race leg:
Pokey walks in front of solid earth and the river at 14173-14911 does not show at all.
1. FIND every place the ground paint runs to the foot and every stage kind that stacks walkable ground (a leg under a leg; check towers too)
   and send me the list in one short message before you change anything.
2. FIX, general (no stage id; generalitycheck PASS): an upper leg's earth ENDS above the lower leg with the lower leg's headroom clear (his
   height plus a jump), and its underside reads as painted ground seen from below (an earth ceiling: roots, a dark lip), never a straight
   cut. If that underside needs art the inventory does not have, STOP and tell me what (size, look, light/dark); I order it (Hugging Face).
   The lower leg draws its own sky band or backdrop between the two, so the scene reads as two levels of the same world.
3. PLANT: a test that on a stacked toy the lower leg's walk band and its river are not covered by the upper leg's soil (RED on 2460568a9).
4. LOCK: lockall vs 0eefc707e: NO shipped stage's draw moves (paintcheck x3 PASS; drawcheck PASS within PERFORMANCE-RULES §1; if a shipped
   stage moves, STOP and send me which).
5. STILLS at 2x, upright and sideways: the race leg under the out leg (him walking, the river, the boat if it shows there), the join where the
   legs meet, the underside up close. Look at each the way Matt will on a phone. REPORT reference/qa-reports/ENG-GROUND/REPORT.md: the list,
   the fix, the plant, the lock, stills, gates (tsc, the planted tests, the CI tool line, generality, paintcheck, drawcheck, lockall), EXACT NEXT
   STEP, lessons applied.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Rulings arrive with priority 'next'.
