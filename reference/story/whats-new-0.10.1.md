# What's New, release 2 (0.10.1): the story keeper's approved set
Approved by the story keeper (KEEPER-PICK, R-165.343) at 9:41 AM ET 11-21 (by `date` in the same command). For REL-0101: put this entry at the top
of src/game/whatsNew.ts WHATS_NEW, version '0.10.1', date '2026-11-21', exactly these words (curly apostrophes, as the entries below it).

**Title:** Count to four

**Lines (7; each 90 characters or fewer, no workshop word; checked with whatsNew.test's own regex):**
1. River Snappers is rebuilt: the stones bite on four, so I hop off before four.
2. The snappers snap on four too. Right after one snaps, a kick sends it home.
3. No snapper is ever hurt: a kicked one just hurries off, grumpy.
4. The river’s rocks come in three painted shapes now, and no two in a row look alike.
5. The ground under the forest’s stones and stumps is tidy now, with no stray grass.
6. When I stand still to yawn, wave or scratch, I stay solid: nothing shows through me.
7. The riverbanks grow painted flowers and plants now, in place of the old bright stems.

## Why each is true (file and line)
1. (a, trimmed) 2-5 was on main as "Chase the snappers off the bank" (main stagePlan.ts:76), so "rebuilt" holds. w2Arc25.ts:6 "every snap
   stone bites on four"; Dot's own line w2Arc25.ts:58 "The stones bite on four!". "snap stone" is our name, not the player's: cut.
2. (b, rewritten) w2Arc25.ts:7-8: the snappers keep the same count (their snap on four); "kick one right after it snaps"
   (TURTLE: the kick only when open, predators/world2.ts:19). "sends them home" is Dot's (w2Arc25.ts:60) and the mission's (:69).
   "paddling" cut: the kicked snapper is drawn with the shared leaving glide (castPlay.ts:26, 367-377: lifts, then glides out and down),
   not a paddle.
3. (c, rewritten) never hurt: w2Cast.ts:5-6 (a kick ends it 'chasedOff'; a stomp only stuns). "downstream" and "huffy" cut: it leaves
   away from Pokey (core.ts stepFlee, s.facing), not by the river's flow, and no huffy face is drawn. "grumpy" is Dot's (w2Arc25.ts:60).
4. (d, approved as written) ENG-ROCK REPORT: World 2's rocks = the kit boulder + rock-a + rock-b, each plain or mirrored,
   assignRockLooks "never the same look as the rock before it"; 2-4's looks listed "never the same beside".
5. (e, approved as written) FIX-TAB REPORT polish check: "W1 1-6, 1-7: the grass tab under the stone/stump is gone" (100 -> 0 tabs).
6. (f, new) FIX-IDLE REPORT: the four standing idle clips (idle-yawn, look-around, belly-scratch, wave) now stay solid mid-melt (0 -> about
   10.5k solid px). NOT "no flicker": a second face still shows for about 3 frames at each clip end, and doze's standing ghost stays,
   until R-165.354 (art). So the line names only what is fixed, and leaves doze out.
7. (g, new) ENV-W2 REPORT: World 2's code-drawn plants (reedclump, nipa, hyacinth, proproot, driftwood, crocnest) deleted; its ground
   takes Matt's painted flora (pflower, pplant) and the shared slot. Not "every plant": the front reed layer was not in that packet.

## If a part does not land in 0.10.1
Drop its line: 1-3 go with t-int-15 (2-5), 4 with t-int-15 (ENG-ROCK), 5 with t-int-15 (FIX-TAB), 6 with t-fix-idle, 7 with t-env-w2.
Seven lines minus any two is still 5 (3-8 rule). If t-hud-vine lands, its line comes from the keeper before it goes in.
