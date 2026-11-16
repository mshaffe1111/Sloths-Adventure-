# INT-11: THE link = 1-6 + 1-7 + 1-8 + 2-1 (the lead 4:19 PM ET: link #4 and #5 merged). Branch t-int-11. Opus 5.5 high.
Started 3:44 PM ET. Times from `TZ=America/New_York date`. FIX-GATES (a) 18e323e0 + (b) b58ec0e6 merged (46a2e5dd).

## Done-items
1. **1-8 merged** (0681bf90): t-build-18c, 9 conflicts read both sides. **2-1** (a63b5131): link #4 held none of the 2-1 line, so t-fix-21
   merged whole (its net = FIX-21's order); 20 conflicts. listed.ts playFinish runs the row's WORLD finish (w2Finish for 2-1, in Play and
   every list judge); petalsLow holds 'few'; walkedSpan Ask 'ride'. INT-10d's final head merged (dbbad40e).
2. **1-8 judged**: on this head 0/24 (967249d2: plain bounces under the teach band) -> FIX-GATES (a) 18e323e0 'bounce-reuse' kind, 1-8
   judged + relisted, merged 5a42d652; after it: registrycheck PASS (10 stages), seedlist 1-1/1-6/2-1 --check PASS here (rest by FIX-GATES).
3. **2-1's crash, the lead's ruling 4:05**: the judge now sees the played 2-1 (D19): a 4.1 s quiet stretch at beat X on every seed.
   (b) pipeline: a throw after the search's own stage-wide bans is a refused roll; refuseNotThrow.test RED->GREEN (1092172f). (a) final
   form 5fba6119: 220 px steps kept + a boulder on the first descent's middle step (160 px steps made the kid turn back, traced; petals
   don't count). Relisted 100/100, quiet <= 4 s, --check PASS.
4. **Lists** --check PASS: 1-1 (161), 1-2, 1-3, 1-4, 1-5 (150), 1-6, 1-7, 1-8, 2-1, 2-2 (seedlist-*-check.txt).
5. **Bots** (final, 46a2e5dd): 1-1 calibration recommitted on the water-only look (88e988d6), tierBots 7/7 after FIX-GATES.
   castBots 2-1: child E 40 = child N 40; kid N 32 (twin river, ruled), adult E 39 (seed 8 perch turn-back: PERCH-TURNBACK, ruled).
   castBots 1-8 (FIX-GATES' relisted list): all 40/40 but child N 36 (accepted 6:03 for 1-8's polish pass): s9 rescued x11389 (stuck
   x10677 'a drop of 53 px ahead'), s17 x30772 ('fell back down 8 times' at x33951), s25 x31012, s35 x30869.
6. **Lock vs main** (lockall-2-vs-main.txt): link #4's moved set exactly + 2-1, 2-2 (World 2's gen2 kit; intended).
7. **Gates on this head**: PASS tsc, build, chunkcheck, artcheck, kbdcheck, buildcheck, drawcheck (every stage both ways; 1-8 x24036
   forced: screens 4.57/5.39, gradients 0), clipcheck (83 known), knowncheck, generality, roadmapcheck, tierBots, chaseBots.
   Reds fixed at source, none loosened: chaseBots MIDDLE (9137470f's look -> water only, proven by revert); river.test (manifest.lessons);
   LV-9 floor 30->28 (2-1/2-2 left the hand-built set); 5-7/7-1 pins back to main's own; riverSection (safe-water-art, ruling 1);
   flower species sample widened (201 pairs, 0 mixed); growth check mix-vs-mix like with like (ruling (A) 5:19, planted).
   After FIX-GATES: registrycheck (+test), riverRide 18/18, CI tools line 168/0, tipwalk, bounceReuse/judged/verdicts tests GREEN.
   FINAL full suite on 46a2e5dd's src: 3755 pass, 0 fail (gates/suite-final.txt); tsc, build, chunkcheck, artcheck, knowncheck,
   generality, roadmapcheck re-run on it: PASS. Test link: 511 files > build.py's 480 cap -> inline 64 KB (test link only): 472 files, index.js 14.2 MB (80 KB: 18.7 MB > 16 MB).

## Polish check
- 1-8 (shots/s18-*): fork x26600 (eagle, moss cover, wayside line), tip x34200, palm x6064, dip: x13930 top step + x14350 floor,
  solid bough both ways. The first x13900 still put him INSIDE the stair column (tool pick): removed; the lead confirmed 4:35.
- 2-1 final list, seed 2 (shots/s21-*): beat X boulder (painted moss stone), safe shallow ride river, deep teal river, lily bounce,
  village gate (round doors, "Touch the door!"); Normal + Easy, both ways, + old save. Whole screen painted. The lead: read well.
- 1-6/1-7: INT-10d's shots stand (1-6 x28296 re-shot: same art; cmp/).

## Pushback
- Step 2 assumed link #4 carried the 2-1 line; it carried only the bounce rule.
- 2-1 models 224 s vs World 1's gen2 median 240 s (growth-w1-w2.txt): a design question, sent to the lead.
- The packet's 'build.py --published' before the publish contradicts build.py (D72: only after a publish succeeds): left to the lead.

## Suggestions
- STILLS-PICK: stills tools pick only a piece whose top is exposed at x (approved 4:35). PERCH-TURNBACK: tier bots turn back on a
  perch whose way on is a step down (traces in this folder). TESTLINK-PACK: pack small images into lazy chunks (the test link
  is at 472/480 files, index.js 14.2/16 MB); build.py should also gate the 16 MB a file.

## Unresolved (named): 2-1 x2300 bank band; 1-8 hanging moss (BOUGH-HANG); the bamboo re-cut.
## Method used / Lessons applied / Method update
gates.md, level.md, stage-fix.md. D19 (one finish for Play and judges), D57 (queue at every push), D59 (no run left unwaited), D62
(BUILT seed printed), D79 (whole screen), law 22 (no check loosened; each red traced to its source). Method update (gates.md): "after
a merge of two lines, run the tool tests (gates.yml rolled job) on both parents first: three of today's reds were born before the merge".
Turnover: reference/handoffs/engine-core.md 0zj (1faa36f0).
