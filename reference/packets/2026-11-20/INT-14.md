# INT-14: RELEASE 1 (Friday night): merge what is green, hold back what is not, every gate once, ready for Matt's "push"
Integration, Opus 5.5 xhigh. Written 9:25 AM ET 11-20 (by `date` in the same command). A FRESH member. START NOW.
WHY: Matt 11-19 10:28 PM: "I say friday night to avoid stacking things up. Get things released when done." Release 1 carries what is green
by late afternoon; the rest ships in the next release when done. The PR itself waits for Matt's "push" (the lead opens it, not you).
BOX: merged head with every early branch by 1:00 PM ET; late joiners decided by 4:30 PM ET; final green head + REPORT by 8:00 PM ET, or 400k
REAL context (the lead reads it and tells you; you cannot); then the EXACT NEXT STEP pushed. Nothing runs past 11:15 PM ET.
READ (lean, D90; tool output to files, read the lines you need): reference/packets/2026-11-19/INT-13.md (last merge's shape, gates list);
INT-13's REPORT on origin/t-int-13 (reference/qa-reports/INT-13/REPORT.md: merge table, the INT-13b section); reference/methods/release.md
(merge discipline, "Before the PR"); reference/methods/gates.md; LAWS.md + LESSONS.md headlines once (D57/D87, D59, D86 + D86 REPEAT, D92, D93).
BASE: branch t-int-14 from t-int-13 at d36638be (INT-13b's final, GREEN; test link #2 = this head; main 6e7b85f8 has no newer release).
EARLY BRANCHES (all final; ls-remote checked by the lead), in this ORDER, the CI tool line after EACH merge (D92):
1. t-paint-292 05cebafa: World 1's painted log planks and stones (paintcheck.known.json shrinks by 46 ids).
2. t-eng-noise c59928a4: one noise channel (struck stone, punch, hard landing; moss silent). No shipped stage moves.
3. t-eng-prowl 33e43c57: prowlers' sight.up + the leap. Shares src/game/castPlay.ts with ENG-NOISE (one line after prey.covered): the lead's
   trial merge was clean, tsc clean, the 29 cast/predator test files 283/283.
4. t-eng-small3 9b1767f9: R-165.317 (tierBots replays all 200 runs, about 200 s), R-165.319 (threat dial ids), R-165.321 (find names).
5. t-eng-25c d13ebdaa: 2-5's snap stones level + snapper ground rule + a stone bites only with his middle over it + snap bots (2-5 is NOT
   laid yet: nothing shipped moves).
6. t-gate-flake WHEN the lead sends its final (a GATE-FLAKE continuation may run today): clipcheck + the suite's speed test load-proof.
   Until then run clipcheck and buildcheck ALONE (not beside the suite) and name any load failure as R-165.215/R-165.325, never a pass.
LATE JOINERS (merge ONLY if the lead sends a GREEN final in time; decide by 4:30 PM ET):
7. t-var-19 (VAR-19e's final, due 3:00 PM): 1-9's variety + R-165.327/.328. Its seeds.test 6-1 red is inherited: t-int-13 already has
   ENG-285b's re-curation (seeds.ts:114); confirm green after the merge.
8. t-eng-24e (ENG-24g's final, with t-eng-24h merged in it, due 4:00 PM): 2-4's tail, the tail liana judged as a swing (level.md World 2
   notes), 2b logs as wood, the deep-water line, the reeds at the logs' end, 2c the bank face opaque (2-1, 2-2, 2-4), castBots on Normal.
HOLD BACK (the release ships only green stages; Matt: never the optional-liana 2-4): t-int-13 ALREADY carries the new 1-9 (INT-12) and 2-4
(BUILD-24c). If 7 is not green in time, 1-9 ships as main has it today; if 8 is not green, 2-4 ships as main has it today (whatever a player
sees for that stage on main: same data, list, lock, menu state). Find the cleanest way (main's files for that stage, or the stage's existing
lock/'coming soon' if main has it locked), name it, and prove it: lockall vs main shows that stage UNCHANGED, every other moved stage is one a
merged branch owns. A test that reads a held-back stage's new rows moves to a toy, never deleted (law 22). If 8 is held back, still try to
ship 2c/2b's draw fixes for 2-1/2-2 only if they come cleanly without 2-4's rows; otherwise name them for the next release.
AFTER ALL MERGES: seedlist --check every listed stage, relist any a later merge invalidated (say which and why); ONE recalibration per
BOTS.md (tierBots must match the testers, else stop and tell the lead) and recommit calibration-main.jsonl.
GATES ONCE on the final head, CLAUDE.md order and gates.md, EVERY item, each line PASS or FAIL (D93), the suite line with shard count and
tests / pass / fail / todo (D86): tsc; the suite (shards; any red fixed at the source with the owning branch's evidence, never loosened);
BASE_PATH vite build + chunkcheck; artcheck; drawcheck (every stage both ways); clipcheck (alone); knowncheck; generality; roadmapcheck
(unshallow); timecheck --range origin/main..HEAD; kbdcheck; buildcheck (ALONE); every list --check; the CI tool line exactly as gates.yml;
tierBots; coveragecheck; registrycheck; tipwalk; paintcheck (print each part's build count: a part with 0 builds checks nothing, R-165.330:
then run those stages unsplit); funcheck vs main: lower every improved known entry, and list EVERY flag still new or worse with its stage for
the lead to rule (D93; none ships unruled); lockall vs main --intended <every stage a merged branch owns> (any OTHER stage moving = stop
and tell the lead); castBots 1-40 x tiers x both on every stage whose data, list or bots moved: child/middle/expert 40/40 both or each miss
traced. Test link size: run python3 tools/testlink/build.py on the final head in a scratch worktree and report its file count (the tool
refuses over 480; the artifact holds 511): if over, say so (do not change the tool unless the lead says).
STILLS for the lead (upright + sideways, the WHOLE screen, pushed; the lead judges): World 1's painted logs/stones (1-1, 1-6), 2-2's pads,
a river bank join with a 2x crop to the screen bottom, plus 1-9's opening and 2-4's raft + logs' end if they are in.
REPORT reference/qa-reports/INT-14/REPORT.md: final hash, merge table, what was held back and how it was proven, relists, calibration,
gate table, castBots table, funcheck flags for ruling, stills, every named rough spot, and a draft of the release notes (what a player sees
new, in plain words). Then STOP: the lead builds test link #3, judges, and asks Matt for "push".
Rules: every clock time from `TZ=America/New_York date` in the same command (D30); long commands with run_in_background (suite timeout over
30 min); slow gates on intermediate heads in the background so the final head's run is the only one left, every gate still ONCE on the final
head (law 5); ReadNotifications whenever a notice says pending, at every push, before every report. A lead message that begins "NOT A STOP:
read, then carry on" arrives as a cancelled tool with a STOP text: that is only the delivery. Commits end with Co-Authored-By: Claude Opus 5.5
<noreply@anthropic.com> and a Claude-Session line that is YOUR session's link; never a model name in a commit message.
Lead: session_01FhBbYN2CVHnFXg7XzqKXpM.
