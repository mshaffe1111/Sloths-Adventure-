# Release 0.10.2 "Walk them home": debrief (the lead, 11-22, written 5:18 PM ET by `date`)

LIVE: Matt played the candidate on the test link (EnK5 v268, code 5d8a7eb79; "Looks good", 4:20 PM ET) and answered "Push" at 4:41 PM.
PR #78 opened 4:42 PM and merged by Matt 4:43 PM, making main cdffdc627. Publish run 45073660336 SUCCESS (finished 5:11 PM; every test
shard and every gates job green). Pages run 207 SUCCESS (206 cancelled, superseded). gh-pages "Publish cdffdc6": its main bundle carries
0.10.2, "Walk them home", "Stuck in the Reeds" and the #ctest page. The container's network blocks github.io, so this was checked in
the published files, not a browser. APK: v0.10.2-47 on Releases (run 45073660310 SUCCESS, 4:46 PM).

Shipped: 2-3 Stuck in the Reeds (rolled, proven list), the edge marker and HUD faces (R-165.372), Pokey's sheets matched to his plain
pose (R-165.377, .378, .379) and the cheer's ghost cut (R-165.382). NOT shipped: 2-6 and t-build-26's bot work, which move to release 4.

## Right
- **A green fallback was held ready beside the riskier work.** INT-R4 gated release-0.10.2 while t-build-26 was still moving, so the
  checkpoint decision cost nothing. When 2-6's yield came in at 29, release 3 was ready to go that minute.
- **The bar held against the clock.** 2-6's castBots --proven yield was 29 of 100, against the packet's bar of 60. The lead refused to
  fill from a sweep, because that would have picked rolls around an unexplained stuck spot (the kid on Easy needs a rescue on 36 of 100
  rolls). The cause and the plan went to release 4 (R-165.390, R-165.393).
- THE FULL SET on the exact code head, every gate PASS by name. funcheck's advisory red was named in the PR body with Matt's 0.9.7
  acceptance, not hidden. The suite ran ALONE in its own run (D122) with 0 fail.
- PLAY-STORE §6 was filled item by item against the real diff main..release-0.10.2: no audio, save, network, wake-lock or new-screen
  change, and the marker sits inside the safe insets (edgeMarker.test).
- Members improved the method mid-day: the chattr freeze (D115 made a check, not a rule), and its one-folder exception for
  seedListChunk.test.

## Wrong
- **The ship verdict for 2-6 came last.** Its --proven yield (a run of about 3 minutes) was measured at 4:34 PM on release day, after
  two days of bot, draw and wall work aimed at shipping it. Measured first, 29 of 100 would have moved 2-6 to release 4 before that spend.
  Why: the packets ordered the relist "on the landed head", so the one number that decides shipping waited for everything else (D125).
- **The lead's own 4b miss (D124).** The PR body said "2-3 adds about 2 min to seedlists shard 1" and gave the seedlists max as 20.4 of 45.
  But 2-3 reshuffled the shards and moved 2-5 into shard 4 beside 1-6. Shard 4 ran 25.8 min (19.5 on 0.10.1). The verdict held (57% of
  the limit), but the numbers in the PR were wrong.
- Members' method misses today: D115 broken a third time (ENG-26r edited a tree a run was reading; it caught this and threw the run away),
  and D123 (three heavy runs side by side slowed a suite past the timeout its member gave it).
- The lead stamped one STATE line 4:20 for a 4:14 check-in and corrected it the same turn. The clock goes from `date`, never by estimate.

## Stop
- Stop ordering a stage's ship verdict after its polish: the --proven yield runs FIRST in any packet that aims a stage at a release.
- Stop carrying a CI job time over from the last release; sum per list by the candidate's own shard plan.
- Stop letting members guess background timeouts: a suite or drawcheck always gets 7200000 ms (D123).

## Continue
- A gated fallback candidate beside the risky work, with a named checkpoint.
- Show-first stills judged at 2x before anything lands (ENG-26r's foot and corner).
- Deciding on evidence against the bar, then telling Matt plainly what moves and why.
- One multiple-choice question to Matt with a recommendation and the cost.

## Numbers
- Members, 11-22 so far: BUILD-26n $13.90, INT-R4 $5.80, ENG-26r $9.87 (still landing for release 4), BUILD-26o $3.77.
- Escapes to Matt: 0 known (he played the candidate first and named no defect).
- CI: publish 28 min end to end. The slowest job was seedlists shard 4 at 25.8 of 45 min, then the gates job at 18.5 of 25 on 0.10.1.
- Defects found after release: none yet.

## Countermeasures written (each a standard, not a promise)
- release.md 4b: per-list sums by the candidate's shard plan (D124), and R-165.394, a script to do it.
- dispatch-packet.md D123: the most timeout, with the heavy runs named.
- dispatch-packet.md D115: chattr, plus the proven-folder exception.
- LESSONS D123, D124, D125. D125 is the yield-first rule, in dispatch-packet.md "A stage aimed at a release".
