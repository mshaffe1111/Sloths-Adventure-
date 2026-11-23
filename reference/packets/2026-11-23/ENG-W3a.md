# ENG-W3a: World 3's kit on gen2 + a '3-1' stage row that travels DOWN (WORLD-3-PLAN F1: the foundation every World 3 stage builds on)
Engine, Opus 5.5 xhigh. Written 11:25 AM ET 11-23 (by `date`). A FRESH member. LANE 2 (pieces ahead; never pulled into a World 2 level).
**BUDGET: 2 hours of your time (WORLD-3-PLAN sized this L from ENG-W2: about 1 h 50 m). HARD STOP at 4 boxes. At each box, your
REPORT says hours used vs 2 h and what is left. Past 2 h with work left: stop and send the lead the cut you propose. Never another box by
default (D127).**
BOX: hand over at 320k REAL context OR 28 minutes after your start (from `date`), whichever comes FIRST (D111), with the EXACT NEXT STEP;
a long run may carry past the box when its verdict carries (D114). **A question to the lead never ends your box (D120). Every long run
with run_in_background, a suite with `timeout: 7200000` (D122, D123), NEVER a shell '&' (D113); at most TWO heavy runs; every run on a
FROZEN worktree (`chattr -R +i <tree>/src <tree>/tools && chattr -i <tree>/src/game/gen2/proven` right after its node_modules link;
`chattr -R -i` before removal; D115). No heredoc in a commit chain (D119). Work on t-eng-w3; candidates on t-eng-w3-wip-a until the
lead rules (D117). A landing runs the unit suite AND the CI tool line (D126).**
READ LEAN (D102): this packet; `git show origin/t-plan-w3:reference/plans/WORLD-3-PLAN.md` §1's 3-1 row and §2's F1 row ONLY; how ENG-W2
built w2.ts (src/game/gen2/worlds/w2.ts and its stageTable rows; `git log --oneline -- src/game/gen2/worlds/w2.ts | tail -5` for the
first commits); reference/STAGE-RULES.md §1-2; reference/methods/level.md's Building rules; LAWS headlines; LESSONS D40, D111-D127.
**Run ReadNotifications at EVERY step boundary, at every push and between long tool rounds. Messages to the lead carry NO clock times (D109).**
BASE: main cdffdc627 (0.10.2, live). Branch t-eng-w3 from it.
0. The suite and the CI tool line on a frozen cdffdc627 in the background (main's own verdict; CI published it green on 11-22, so a red
   here is the container's, name it).
1. **w3.ts: World 3's kit on gen2**, built the way ENG-W2 built w2.ts: World 3's pieces from the inventory (src/game/art/inventory.ts;
   the World 3 rows of the catalog, at Pokey's scale), the cast rows World 3 already has (predators/world3.ts: the ocelot and jaguar), the
   rules every kit carries. General: no stage id, no x position (generalitycheck).
2. **A '3-1' stageTable row that travels DOWN** (stagePlan.ts gets `travel: 'down'` for 3-1; the gen2 pipeline's down flow, which the plan
   cites at pipeline.ts flow down). The live 3-1 (the old section maker) STAYS live until 3-1's build replaces it: the new row is a draft
   row, not listed.
3. **The proof:** addlevel READY on the row; the bots end at the shrine on 40 seeds, both settings (castBots); the PLANT: the row's travel
   back to 'right' turns the down test RED.
4. Stills of the row (upright and sideways, 2x, a few spots down the shaft) beside Pokey for the lead's look: the scale and the read of
   a DOWN stage (polish bar: STAGE-RULES §5b).
5. Send the lead the hash, the gates, the stills, hours used vs 2 h. The lead rules; then land on t-eng-w3.
REPORT: reference/qa-reports/ENG-W3/REPORT.md on t-eng-w3-wip-a (EXACT NEXT STEP first). Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.
Rulings arrive with priority 'next'.
