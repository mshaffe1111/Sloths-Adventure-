# BUILD-27 REPORT: 2-7 "The Mailman's Route" (t-build-27-wip; started 12:35 PM ET 11-23 by `date`; budget 2 h, report by 2:40 PM ET)
## BUILD-27b (continuing; started 1:05 PM ET 11-23 by `date`; report by 2:40 PM ET)
### EXACT NEXT STEP (BUILD-27b's; read this, not BUILD-27's below, for what is left). BUILD-27b stopped at its 28-minute box.
NOW: nothing laid is waiting on me; 2-7 waits on the lead's hashes (ENG-JETTY: the w2.ts:372 finish fix, the race-end win/lose line,
StageHint story; ENG-BOT27: the child's log footing; the 'post:letter' moment if the lead orders it). The first thing on their landing is
step 5 below.
Head: this commit on t-build-27-wip. Scratch tree (not in the repo): /home/user/wt-b27-y = e531bce46 + the w2.ts:372 y-band fix, chattr
frozen (unfreeze with chattr -R -i before removing). Probes: scratchpad/probe/trace.mts (frames before each life lost or set-down:
`npx tsx trace.mts <bot> <setting> <seed> <n> [stuck]`, run from the scratch tree) and kidloc.mts (each set-down's leg and beat).
1. DONE 0a010f11e: catalog dupes; inventory.test 10/10 (census 218: ENG-27 packed 8 of batch 1).
2. DONE, sent: the yield on fafd18d05 + fix (a): PROVEN 2/40, 24/40 without the kid; 0 runs under 2:00. Child Normal's rescues: a BOT
   fault (walks off the lip onto a log tail sliding under the bank on `upstream`; jumps from mid-log on keep-running) -> ENG-JETTY item 4,
   landing on t-eng-27 by about 3:15 PM (lead). Not mine to fix.
3. Kid EASY 27/40 (lead: must pass): a data candidate (Easy's at-him rows on their own row back27e: logs 200, gap 70, 70 px/s) FAILED
   and is REVERTED (0293f6eb2; src equal to 0a010f11e): kid Easy 27/40 again, 2 kid runs under 2:00, child Easy 38 -> 36. Kid Easy's
   misses are 1 rescue each over 8 beats: the kid model (FT_KID) on moving logs (untimed jumps into gaps, walking off log ends), on
   every World 2 river. Sent to the lead for a ruling (bot item for ENG-JETTY or Easy's drift catch). Do not try another stage row.
4. Kid NORMAL 6/40 LOCATED and sent (the lead rules, LEAD-PERSONA): 49 set-downs on 34 seeds: out at-him 17, out upstream 14, home
   stilts 11, keep-running 2, with 2, neck 1, other 2 (scratchpad kidN-loc.jsonl). The same kid-on-logs cause as 3.
   LEAD RULINGS (on receipt of 3 and 4): kid Normal ACCEPTED as located and honest (LEAD-PERSONA); kid Easy ACCEPTED for tonight on
   2-5's footing (R-165.339), filed by the lead as its own World 2 job (should Easy forgive a kid walking off a moving log's end). So the
   proven list needs adult, middle, expert and child on BOTH settings with 0 rescues: `castBots --bots adult,child,middle,expert --proven`.
   The kid table goes in the LEVEL-LOG row.
   STILLS PRE-LOOK (lead allowed; NOT the final set, rule 29: reshoot on the GREEN head): seed 1, both settings, both ways 2x, on
   scratch 0a010f11e + fix (a), 52 stills in the scratchpad (stills/n27-*, e27-*). Seen: jetty/doors, at-him, upstream, weir, bend, home
   jetty (Normal); upstream (Easy). Findings: (a) `way.2-7` (the keeper's kept wayside line) speaks AT THE HOME JETTY (x1000), where
   win/lose will speak once ENG-JETTY's race-end line lands: a collision to settle with the lead/keeper before wiring win/lose.
   (b) My x picks for porches (11100) and stilts (5600) missed their pieces (11100 is between planks, so "high" fell to the home bank):
   pick each beat's x ON a piece from the built platforms (probe porch.mts), never by the section's span. Reshot porches at 11200.
   (c) The home rivers' logs ride low under the water sheen: World 2's deep-river art (the same on `upstream`), intended, not a defect.
   (d) The weir: the falls' foot has a hard horizontal seam with coloured specks at the pool line (x15800 upright): judge it zoomed on
   the final set. (e) Upright, the home leg sits under the out leg's soil slab (x10000): the slab's lower edge is ragged; stacked-leg look.
   way.2-7: the lead ruled (A), move it to the walk out at the doors, words verbatim. NOT doable by data: a wayside line is placed by
   WHEN (wayside.ts StageWay.at start/half/near/on a moment); the only moments are 'cast:*' (engine.ts:4878). Sent ENGINE-WORTHY: a
   moment when the post takes a letter (e.g. 'post:letter'), then wayside.ts:101 `7: dotOn('post:letter', <same words>)`, held in
   w2Arc27.test. Until then it stays 'half' (the HUD distance ratio >= 0.5, engine.ts:3732; on the out-and-back, not yet measured
   where: offered the lead an adult-bot measure). (f) Porches (n27p x11200): rope-tied planks over the race with no posts or hangers to
   the bank houses: they read as floating planks. Judge on the final set; name it to the lead if it holds.
   'half' MEASURED (adult seed 1, probe half.mts: onGuide lines + onProgressUpdate ratio): Normal half t125.0 x2139 (home neck, ~9 s
   before the jetty; run 134.4 s); Easy t119.3 x2367 (~7 s before; 126.8 s). Lines: WATER_WARN t0.2 (Normal only), handover t2.4, race
   t3.8, turn t53.2. Sent: 'half' lands mid-race (keeper note 3) -> 'post:letter' to engine. Also sent: (1) ENGINE-WORTHY, the HUD
   progress bar on an out-and-back does not move for the whole out leg (x from start to exit, engine.ts:3732); (2) WATER_WARN -> handover
   only 2.2 s apart on Normal: I offered to move the t-handover socket (w2Arc27.ts:122, 'a' 0.35) so the handover starts 3+ s after it.
   (2) DONE e531bce46 (lead: WATER_WARN stays, the handover moves): handover on the jetty's bank b at 0.15, race on z at 0.3; new test
   "handover starts 3 s at a full run after any other line" was RED on the old socket (614 px < 855), GREEN now; w2Arc27.test 7/7;
   24/24 rolls clean. 'post:letter' and the route-measured HUD bar: engine, landing on t-eng-27 (lead); then wayside.ts:101 -> dotOn.
5. When the lead sends ENG-JETTY's and ENG-BOT27's hashes (the w2.ts:372 fix, the race-end line, StageHint story, the child bot fix): merge into t-build-27-wip;
   wire `w27.win`/`w27.lose` (lines-2-7.md:24-25, verbatim) on the race-end hook, set story on handover/race; hold all four in
   w2Arc27.test; the whole suite + the CI tool line on a frozen head; castBots --proven 1-40 both settings; then the list (seedlist 2-7,
   --check, castBots --proven on the list), the flight for `judged`, registrycheck, stills of every beat both ways 2x both settings
   (the jetty's with the lines on default settings), the race clip (name the frame he wins), the full gate set.

## EXACT NEXT STEP (handover to BUILD-27b; BUILD-27 stopped at 1:03 PM ET at about 372k context. Head: see the commit that adds this)
LAID on t-build-27-wip: w2Arc27.ts (kit w2-27, stageTable row, listed.ts), the hand build deleted, the keeper's words (minus win/lose),
w2Arc27.test 6/6, planted-faults.py 7 plants (6/6 CAUGHT on 32b01afee; the 7th, turn, was added after that run and is not yet run),
limits.json scenario 2-7.
1. **Inventory red, from MY merge (fix first, minutes):** reference/art/CATALOG-MASTER.csv holds 8 DUPLICATE ids after the merge:
   w2-next#weir/doorOpen/letter/letterB/reply/replyB/mailBoat/mailBoatB (t-eng-27's rows and t-ready-27-wip's both kept). Keep the row
   equal to `git show origin/t-ready-27-wip:reference/art/CATALOG-MASTER.csv` (READY updated kb/cost and added the weir), drop the other,
   then `python3 tools/art/catalog_master.py --emit`. Then `npx tsx --test src/game/art/inventory.test.ts` must be 10/10 (main, t-eng-27
   and t-ready-27-wip are each 10/10; this head is 8/10: 9573 vs 9581 rows, 218 vs 226 images).
2. **Wait for ENG-JETTY's two landings on t-eng-27** (merge each into t-build-27 the moment it lands):
   (a) the World 2 finish fix, w2.ts:372 (`&& !lows.some((l) => p.y >= l.y0 - 2 && p.y <= l.y1 + 2)`: a soft fall must not drop the run
   leg stacked under it). Without it the home leg's bounce-bend banks vanish in play and every bot is rescued (0/40).
   (b) the jetty hook for the keeper's `win`/`lose`; wire 2-7's line ids for those two (lines-2-7.md asks 4) and hold them in w2Arc27.test.
3. **Then the yield:** castBots --proven, seeds 1-40, both settings, on a chattr-frozen tree; send it to the lead. Measured on a SCRATCH
   tree (32b01afee + fix (a), NOT committed): 1/40 proven. Cause 1: the quick adult finished under the 120 s floor (35 runs). Cause 2:
   the adult walked off the last porch plank (Normal seed 19). Both are addressed in fafd18d05 (a second reach on 'with' and on the
   signature: model fast 148 -> 163 s; the porch walk lands level, then a walked step down). The re-measure (scratch: fafd18d05's
   w2Arc27.ts + fix (a)) was RUNNING when I stopped; the successor runs it again. Left to trace after it (rule 28): kid/child falls on
   the out leg's rivers flowing at him (at-him x~7200-7500, upstream x~11150-11700). The kid is not the bar (rule 4); the proven list wants
   every bot, so report the yield with and without the kid.
4. **Suite:** the full unit suite on 32b01afee had 5 reds when I stopped (it was still running): inventory x2 (step 1), and three for 2-7
   at the bend (easyMode "checkpoints out of order" on Easy, heart at the flag 10128, flower at (9225,1434)), which step 2(a) should clear.
   Re-run the whole suite after step 2.
5. Then the list (`seedlist.ts 2-7`, `--check`, castBots --proven on the list), the flight for `judged` (`FLIGHT_STAGE=2-7 npx tsx
   reference/specs/sims/flight.ts normal all`, its rows into flownArcs.ts n27, then judged: 'normal-2-7'), registrycheck, the stills
   (every beat both ways 2x both settings, after the bots go green: rule 29), THE race clip, the full gate set.
Probes I used (scratch, not in the repo): the played-vs-built platform diff (firstTimer onFrame -> sim.stage.platforms vs libstage
buildStage) and the teleport trace (firstTimer onFrame: a jump of 150+ px in one frame is a respawn or a rescue).
## Ship verdict (step 1, D125)
| Head | castBots --proven 1-40, both settings, every bot | Cause |
|---|---|---|
| 7c040dfd4 | 0/40, discarded: the bots played the OLD hand build (w2Stages W2_STAGES['2-7'] wins first, stageGenerator.ts:2935) | Hand build still registered |
| 32b01afee | **0/40**: every bot, every seed, reaches the shrine with 1+ rescue (Easy: no lives lost, so one fixed spot) | World 2's finish (w2.ts:372) drops every solid under a SOFT fall at any depth. The out leg's porch-walk pits lie over the home leg's bounce bend, so its three banks are deleted in play (played-vs-built diff, Easy seed 2: 10078+340@1501, 9690+388@1325, 9390+300@1415). ENGINE-WORTHY, sent to the lead; ENG-JETTY is fixing it. |
| scratch: 32b01afee + fix (a), not committed | 1/40; without the kid 8/40. Under the 2:00 floor: adult Easy 23, adult Normal 12. Rescues: child Normal 5, adult Normal 5, child Easy 2, middle 1. Others PASS 35-40/40 | floor and porch walk-off, addressed in fafd18d05 |
## Done-items
1. Ship verdict: above (RED; cause traced, fix with engine). 2. Stage: w2Arc27.ts on its own row (kit `w2-27`): the arc, the boat
   (W2_RACE), the post (5 doors), the weir dress, the keeper's words (handover, race, turn, mission, journal page, find). The hand build is
   DELETED: W2_STAGES '2-7', its plan, flavours, the basket lift, mailman, doors, village end and drop builders, the frames and lift kinds,
   hint.2-7.basket/frames/open/porches (way.2-7 kept). liftRide.test and w2Stages.test re-pinned; stageSheets has no gold snake on 2-7.
   w2Arc27.test 5/5. planted-faults.py: 6/6 CAUGHT. 3-5: owed (blocked on the fix).
## Design changes (lead-accepted forks)
- The weir is laid `Dc_` (a column, which the weir's dress needs) for `Dg1_`. Its drops are walked step-downs: a jump gap in a column made
  World 2's finish throw on 2 of 12 rolls; now 40/40 build.
- `upstream` and `logs at him` are each laid as two in-sight reaches with a bank between. One 924 px reach flowing at him breaks riverLay's
  view rule, and one reach left the quick player under 2:00 (fast 130 s, floor 143). Now typical 175 s, fast 148 s, Easy fast 152 s.
- **5 doors, not 6.** Matt's rolled flags (8 on the out leg, 140 px clear each) leave room for 6 on about half the rolls; 5 doors: 22/24 clean.
## Gates (head 32b01afee)
| Gate | Verdict |
|---|---|
| tsc / generalitycheck / knowncheck / artcheck | PASS / PASS / PASS / PASS |
| registrycheck | FAIL, owed by me: no list yet; no drawcheck scenario; row not `judged` |
| roadmapcheck | FAIL: shallow clone, proofs cannot be checked (inherited; the same on main in this container) |
| unit suite (32b01afee) | 5 reds when I stopped: inventory x2 (my merge, step 1); 2-7 at the bend x3 (step 2a) |
## Polish check
BUILD-27b: a pre-look only (see 4 'STILLS PRE-LOOK', items a-f); the final check is on the GREEN head. BUILD-27:
None yet. Rule 29: no stills while the bots are red. The lead allowed stills of the beats the bend does not touch; they are next.
## Pushback
1. The design's 6 doors do not fit with Matt's rolled flags (above). 2. The design's 924 px `upstream` breaks the view rule (above).
## Unresolved
- win/lose at the jetty: no hook (ENG-JETTY). lift.ts is exists-unwired (no stage lays a basket lift; only its unit tests hold it).
- 2-7 has no `judged` flown scope (registrycheck): `FLIGHT_STAGE=2-7 npx tsx reference/specs/sims/flight.ts normal all` is owed.
## Learned (for the next builder)
- (BUILD-27b) **Check a river row against the river's own rules before running bots on it.** A slower Easy row (55 px/s) made one log
  every 5.1 s, over the 4 s rule, and no Easy roll laid; roll 12 seeds (libstage --json) first, seconds, not a 2-minute bot run.
  Proposed: riverLay's row check (log every <= 4 s) also runs on a kit's RIVERS table in the kit's own test.
- (BUILD-27b) **A stage's bad yield is often the bot, not the stage: trace before changing data.** Two frames-before-the-fall traces
  showed child Normal walking onto a log tail sliding under the bank (bot), and kid Easy spread one rescue each over 8 beats (the kid
  model on every river). My Easy data change moved the misses and was reverted. Trace two runs per cause FIRST (rule 28).
- (BUILD-27b) **castBots rows drop each stuck spot's y**, so on an out-and-back the two legs share x and a cluster by x is ambiguous.
  Proposed: castBots keeps y (and the beat) in its rows. Meanwhile scratchpad probe kidloc.mts maps a set-down to its leg and beat.
- (BUILD-27b) **Pick a still's x ON a piece from the built platforms**, never by a section's span: 11100 fell between two planks.
- (BUILD-27b) **A wayside line is placed by when, not where:** on an out-and-back 'half' is a distance ratio, not a place. A
  stage that wants a line at a piece needs a named moment.
Lessons applied (BUILD-27b): D115 (frozen scratch trees), D123 (runs in the background, 7200000), D125 (yield first), D59 (no run left
running at stop: none left besides the dev server, stopped), D111 (box, exact next step), D127 (bot and engine gaps sent the same minute).
- **Delete the hand build BEFORE the first bot run.** w2Stages' W2_STAGES wins over the stage table (stageGenerator.ts:2935), so the bots
  play the old stage while the build probes show the new one. Proposed rule: addlevel refuses a row whose id a hand-build table still holds.
- **Judge the PLAYED stage, not the built one** (rule 27 goes further than built-vs-data): libstage's buildStage keeps platforms that the
  played finish deletes. Diff the played stage's platforms (firstTimer onFrame, sim.stage) against buildStage's before tracing a bot.
- An out-and-back stage stacks one leg under the other. Every world finish rule that works by x span (drop, fill, reeds) must also check
  the y band. Proposed check: a planted stacked-leg toy through each world's finish.
