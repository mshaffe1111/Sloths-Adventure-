# KIT-W3a-f (3-1's down kit, box 6). STOPPED before its merge 11-27 12:36 PM ET by Matt's R-165.552; the next lead decides when it runs.
First session: session_01FhBbYLDxrBNgHaqMuXbqVy (stopped). Start a FRESH session with the text below as its whole prompt (CI #108).
WHERE IT STOPPED: step 1 is DONE: t-kit-w3a 38c1b2b20 (1a14f49ac merges t-eng-w3 51ef0c6ab into 2a18464da; union proven by
probe/w3ids.mts: ours 8 sections/29 pieces/22 sockets, theirs 11/42/50, merge 16/65/64; 3-1's rolls identical; tsc 0, generality PASS,
w3Tower 9/9, w3Level 5/5, w3.test 10/12 with 2 INHERITED reds (w3.test.ts:166 head room over cap-down's cap; :196 e11), w3Noise 0/8 =
box 5's own pick bug (a saved UNVERIFIED patch, not in code)). STEP 2 IS BLOCKED on a lead call: reference/qa-reports/KIT-W3a/PUSHBACK.md
(no World 3 level-stage row exists, and World 3's run lay never lays a 400 px drop in its corridor: an engine change, or leave the drop
toys red by name until 3-5's build). t-eng-w3 has moved to f3014145c (ENG-ROOT) since; merge it with step 3's landed hashes.
Since it was written: ENG-CATCH-e froze 18a353e4a (lands on t-eng-w3 when its tail is green); relay each t-eng-w3 landed hash.

You are KIT-W3a-f, a Content member (Opus 5.5 xhigh: this box carries a ~300-line merge) on Sloths Rainforest Adventures: World 3's DOWN-TOWER kit, box 6. 3-1 (World 3's first level) waits on your ONE landing; World 3's 3-1..3-4 are due Sunday night.

READ FIRST (in this order, lean): reference/roles/README.md, reference/roles/CONTENT.md, reference/LAWS.md, reference/LESSONS.md (tail -40), reference/methods/level.md (the ranked Building rules), then your turnover: the top "EXACT NEXT STEP (box 5 ...)" section of reference/qa-reports/KIT-W3a/REPORT.md on origin/t-kit-w3a 2a18464da. That section is your plan; this brief adds the merge and wins where they differ.

START: `git fetch origin +refs/heads/t-kit-w3a:refs/remotes/origin/t-kit-w3a +refs/heads/t-eng-w3:refs/remotes/origin/t-eng-w3 && git checkout -B t-kit-w3a origin/t-kit-w3a` (must be 2a18464da). npm ci --legacy-peer-deps as a TRACKED background task (run_in_background; NEVER a shell '&').

THE LEAD'S RULINGS (final):
- KEEP the narrowing: a down brick's DECLARED widest roll = widest widths + widest gaps + EASY_LANDING 48 per landing piece, at least 10% under the 1140 storey (1026); every piece at least 120 px; w3Tower.test's width test + its plant stay.
- TOWER WOOD (e11, e19, n33, n13, n24, n36 and their Easy twins) belongs to ENG-CATCH-e, frozen at t-eng-catch-e 18a353e4a: the down tower never lays a miss; an unmendable miss throws TowerRefusal by name and the seed search skips that roll. You do NOT mend tower wood in kit data.
- THE DROP TOYS (w3Noise:317, moss and stone): lay them OUTSIDE a tower, on a level-stage row where the 400 px drop is in view, picked by PROPERTY with your dropClear check and its PLANT. The 400 px drop number does not change (3-5's design).

STEPS:
1. MERGE origin/t-eng-w3 (51ef0c6ab unless the lead names a newer head) into t-kit-w3a NOW. ENG-CATCH-e found that de6feebff conflicts with it in src/game/gen2/worlds/w3.ts (about 300 lines: your tower bricks against KIT-W3b's 3-2 content). Resolve so NOTHING from either side is lost: list every brick / section / socket id in w3.ts on both parents and on the merge, and show the merge holds the union (a short script, its output in REPORT). Then tsc AND generalitycheck (CI #103), the WHOLE w3Tower.test, w3.test, w3Noise.test, and every 3-2 test KIT-W3b-b added on t-eng-w3 (name each file and its totals). Commit the merge, named; push t-kit-w3a (no force). Send the lead the merge hash and those counts.
2. The drop toys onto the level-stage row (ruling above), with the plant; w3Noise green by property. Commit, push.
3. WAIT for the lead's message with the LANDED hashes of ENG-CATCH-e (and ENG-CATCH-d, contained in it) and ENG-DEAL on t-eng-w3. Merge ONLY landed hashes, each named (BUILD-28-h rule). tsc + generalitycheck. RE-PROBE the six configs on seeds 1-40 x BOTH settings (reference/qa-reports/KIT-W3a/probe/widths.mts; two at a time, tracked background tasks): the bar is 80/80 each with no throw; report per config the refused rolls / rolls tried. A refusal is the guarantee working, but a config refusing more than about 1 roll in 4 is a finding to send the lead.
4. Your plan's step 5 (3-1's after-roll) and step 6 (the tests), on the merged head.
5. Stills of the narrowed tower on 3-1 at phone size, upright and sideways, Normal and Easy, after an 80/80 probe (rule 29). Look at each yourself first (the polish bar, STAGE-RULES §5b); the lead judges them.
6. FREEZE one head. ONE gate run on it, the full set in CLAUDE.md "Checks" order: tsc; the suite (6 shards, each shard's totals line); vite build (BASE_PATH=/Sloths-Adventure-/); chunkcheck; artcheck; drawcheck; clipcheck; knowncheck; generalitycheck; roadmapcheck; kbdcheck; buildcheck; seedlist 1-1 --check; the engine tools' tests; tierBots. THE LOCK as TWO runs (`npx tsx tools/engine/lockall.ts --layouts 16 --out base.json` on the base, then `--check base.json` on the candidate) with its counts line; the base BY HASH = the t-eng-w3 head you land on (CI #106). Name every stage that moves; only 3-1 / World 3 drafts may move. After any seed-list rebuild run the WIDENED pin grep: `grep -rlE "setPick11|roll11Seed|provenSeedFor|firstTimer\(|castRun\(|RealPlay" src tools --include=*.test.ts` and run every file it lists.
7. ONE landing onto origin/t-eng-w3: merge (no rebase, never force); if t-eng-w3 moved since your freeze, re-run tsc and the lock check on the result; push; ls-remote equal. Send the lead the landed hash, every gate's counts line, the six probe counts and the stills.

THE BAR: every red is named with its file:line and whether it is yours or inherited (proven by running it alone on the base). Any red of yours = do not land; send the lead what failed and your fix. No claim without its counts line (CI #93). Lessons to apply and name in your report: D151 (pick by property), D153 (no gate without its counts line), D154 (prove on 1-40, not 1-12), D156 (generality with tsc), D159 (lock base by hash), D160 (prove on the final pieces).

REPORTING: send_message to the lead (the session on reference/handoffs/lead.md's top line). Messages to the lead carry NO clock times. First message by step 1's end (the merge hash + counts); keep reference/qa-reports/KIT-W3a/REPORT.md's EXACT NEXT STEP current at every commit (stamps from `TZ=America/New_York date`). End with "Learned" and any proposed level.md rule (the lead approves).
