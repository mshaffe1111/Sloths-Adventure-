# INT-R5L REPORT: release 4 (0.10.3) = release-0.10.3-lite (main cdffdc627 + t-fix-sidewall + t-fix-soil), Matt's option A

Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Integration: INT-R5d-c. Matt chose A on 11-25 (the lead's message): release 4 ships main + the two
draw fixes; 2-7 and the bot fix wait (release-0.10.3 stays at c73cb9766, release 5's line; its red: INT-R5/REPORT.md on
release-0.10.3-wip-fixes, d/rule28/). The PR is from release-0.10.3-lite; the LEAD opens it on Matt's word.

## EXACT NEXT STEP (written 6:04 PM ET 11-25 by `date`)
Code head **2b5f0d6c8** (What's New 'Two little fixes', approved as written by the lead; 0.10.3). THE FULL SET is RUNNING on it, frozen
(/home/user/int-l2b, chattr +i src tools, proven writable; main /home/user/int-main at cdffdc627 frozen; out /home/user/fs-lite), in lanes
(tools/lane.sh runs tools/run1.sh's own g-lines by name; every run_in_background with timeout 7,200,000 ms):
- L1 drawcheck clipcheck kbdcheck vitebuild chunkcheck artcheck buildstore slotconfirm
- L2 seedlists shardplan lockbase lockall (NO --intended: the two draw fixes move nothing; FIX-SOIL-b and step 1 measured zero moves)
- L3 tsc toolline tipwalk registrycheck knowncheck generalitycheck coveragecheck unshallow roadmapcheck timecheck paint0-2 castbots14
  funcheck fundiff tierbots
- L4 tools/rows28.sh on the head (2-1 2-2 2-4 2-5 1-4, seeds 1-40, 5 bots, both settings) vs MAIN's rows from the same frozen main tree
  (/home/user/fs-c73/rows-main, run by INT-R5d-c at 4:59 PM ET on cdffdc627, copied to /home/user/fs-lite/rows-main); tools/flips.py.
run1.sh here = INT-R5's minus storytipscan and teachfirst (not on main), castbots27 (no 2-7), lockhints (the release's hint stages).
NEXT: when L1-L4 finish: `bash tools/run2.sh /home/user/int-l2b /home/user/fs-lite` (the suite, 3 shards; 0 fail; pacerLay is main's own:
if red, run it on /home/user/int-main and name main's result beside it), then `bash tools/lane.sh ... L9 buildcheck` LAST and ALONE;
release.md 4b sums from g-shardplan.log + g-seedlists.log; then the gate table here, push, ls-remote, the head + one line per gate to
the lead. A container restart loses /home/user/fs-lite: re-run what is not recorded here.

## Option A's base (INT-R5d-c, from the lead's message)
- d2943b94c: merge origin/t-fix-sidewall 1558489a2 into main cdffdc627 (clean).
- e73e7d4dc: merge origin/t-fix-soil 375f5a562 (code 539885c37). Conflicts: protoArt.ts drawProtoScene, resolved as INT-R5d's step 1
  (a2b7dde04): the soil fix's groundBanks(platforms); groundBanks returns the sidewall fix's bankList(platforms,
  platforms.filter(paintedBank)), ONE place for the painter and the paint gate. handoffs/engine-core.md: 0zs-SOIL on top, 0zs-SIDEWALL
  under it. No drawGround/drawBankArt/import conflicts (those were the release's stacked-leg ceiling, not on main; f7c5b8a2e not needed).
  paintcheck.ts auto-merged with both rules (SIDE-ON, SOIL OVER); every other fix file byte-identical to its branch.
- 2b5f0d6c8: package.json and package-lock's two fields 0.10.2 -> 0.10.3; What's New 0.10.3, 2026-11-25, 'Two little fixes' (3 lines:
  whatsNew.test needs 3-8 per entry, so the ruled one-line A could not stand alone). tsc clean; whatsNew.test + playerText.test 79/79.

## Lessons applied
D115 (frozen trees), D119 (commits by -m), D128 (stamps from `date`), D132 (rule 28 vs MAIN), D134 (pushed and ls-remote before every
report), D135 (no red called inherited without main's own result), D138 (the c73cb9766 lanes stopped at the lead's word, what they had
recorded kept).
