# FIX-14b REPORT. t-fix-14b (from t-fix-14@f35253ba + t-len-14@d56cd915), head d7ee9114. 11-14, 3:0x AM ET (box to ~3:37)
## EXACT NEXT STEP (in order; the next member starts here)
1. Fork (R-165.206, NOT STARTED: cut at the box, measured first). The 80 px rule is bigger than the fork: fork/ledge-margins.txt
   (fork/ledge.ts, 1-4 seeds 1-12): 25 of 37 non-field climb vines top out with under 80 px of ledge on one side. (a) the CROWN's own
   `sure` vine (w1Arc14.ts CROWN, tag s21:sure on s21:mid) 20 px from its ledge's end on every seed: 1-4 data, move it in; (b) untagged
   vines (World 1's links/rests, laid by the kit, not 1-4's sections) at 26-34 px; (c) some ends are the stage WALL (0..114, ..1280):
   no walk-off there, so the rule's check must count only an open end (a drop). The fork's own vine has 80/140 px (seeds 1-4: fine).
   Rule + check: "a climbable vine's top has >= 80 px of ledge to any open end" as a lay test over every roll; fix (a) in data and (b)
   at the link builder (its root), never by loosening; then the creak dip ("in a dip 50 px deep, the way on is 150 px up", middle N s4);
   castBots 40 before/after (BEFORE = this head, below); adult Easy >= 100 s (106.1 s now).
2. Then ONE relist (`npx tsx tools/engine/addlevel.ts 1-4 --relist`; the one run here was BEFORE the two-vine/petal/tell commits, so the
   fork's relist is the one that counts), sideways clips (clip.mjs `side` threw: the engine was null sideways; wait on __engine longer),
   the two-vine clip (clip.mjs has no `vines` mode yet), and the full Checks on that head.
3. Two-vine clip (vines-normal-up.mp4) showed 2/3 petals two-handed; NOT reproduced headless: the whole paired column climbed from the
   foot takes every petal on 1-4 rolls 0-24 (fieldPetals.test.ts planted case, passes). The clip's counter stops on the vault frame, where
   a +250 pops: re-shoot with the count read after the vault before calling it a defect.
4. The checkpoint aura is removed GAME-WIDE (the lead was told first; no reply before I acted): look at an unlit flag on a bright
   backdrop in each world (flag/flag-1-1-after.jpg reads, but it is quieter than before); flag/flag-1-4-after.jpg did not frame the flag.
## Done (evidence in reference/qa-reports/FIX-14b/)
- Step 1, fig gate (R-165.212 + R-165.223's probe): his DRAWN head stops at the shut bough's DRAWN underside on the one-hand, two-hand
  and plain climb and the jump (FieldPlay.shutBoughAt/capY/lid; GATE.head 89 = heroSprite 66 x 1.35, tested; GATE.depth = the painted
  bough's measured underside). Found while testing: the old "from below" test was against the line, which falls toward the sagging end,
  so a leap along the bough slipped over it (now against the drawn top). A fig tears at full push with his head held under the wood
  ("just enough to get the fruit up"). Tests (fieldGate.test.ts, 4 settings x seeds): Matt's case (push full, hold up, jump, climb the
  rest: head never over the underside, never stood up there, fig still tears); the skip probe (every vine, up/jump/leaps/climb-then-leap,
  figs held on so every case is a SHUT gate, and the probe must meet the wood on half its cases); planted: the 0.9.8 feet rule puts his
  head 40+ px through (red).
- Step 1, the lock moment in Matt's own art (sheet 1 + 2 cuts brought from t-art-matt@11490e83 with their 14 catalog rows, inventory
  re-emitted): the leaf thatch along the shut bough, a vine tie at each fig: taut -> straining (pale, frayed, shivering by push %) ->
  SNAP (painted snap + bark chips), thatch shudders; on the last the thatch is thrown off. Replaces the thorn tangle (new replaces old).
  Clips: gate-normal-up.mp4, gate-easy-up.mp4 (+ sheet). Clip measure: his head most over the shut underside 0 px (never over).
- Step 2, two vines (R-165.229): a side push with up held takes the other field vine (latched once a push; never hops off): no
  stop-start. Petals on a paired stretch hang BETWEEN the pair (vineField.ts pairPetals, run last in finishStage, general: any field
  vine): two hands take them, one hand passes 40 px by. fieldPetals.test.ts: every paired petal on 1-4 seeds 1-6, both settings, taken
  by a climb that steps while climbing; planted: left on the line (0.9.8), missed; two hands measured 1.6x one hand up; one hand slides
  2x down (FIELD_FEEL, unchanged). Not built: a separate "reward pair" art; the strings of petals between the pair are the visible pair.
- Step 3, pods (R-165.227): PODS_14 in w1Arc14.ts is the ONE place: on / speed 300 (was 620) / tell 1.5 (was 1.0) / beats 4.6, 4.2,
  3.6 (was 3.6, 3.0, 2.3) / Easy 1.5x; `on: false` lays no pods (Matt's other choice, one line; planted on the real finish). POD.tellMin
  1.5. The tell is the pod's OWN vine, its painted art laid again lit and shaking harder as the drop nears, Matt's sheet-2 dust and bark
  chips sifting down it; his restyled pod hangs and falls (w1m-pod-hang/fall, ART-MATT ed4f59c0 recut). Clip pods-normal-up.mp4 + strip.
- Found by the full suite and fixed at the root: the bots' fig step (figPush.ts) waited to be stuck at the vine's TOP, so under the new
  head stop it never pushed (castBots 1-4 went 0/40, its test freed 0): it now reads the stop (capY). feelPairRoom's gate test now
  checks the head rule (it asserted the old feet rule).
- The lead's ruling 2:08 AM applied: the tie draws at 0.55 Pokey (short loop, knot on the bough).
- The lead's review 2:56 AM: (1) the dark ring = engine.ts's readable 'take' aura (readable.ts drawAura: a code-made radial pool +
  gold rim) behind every UNREACHED checkpoint flag, all worlds (10-21 readability pass): removed (painted-art rule). (2) the gold pops at
  a fig's tear and at the open removed: one signal, the tie's painted snap + Matt's bark chips + the sound. (3) the 15 catalog rows
  (Matt's 14 'in game (FIX-14b)', w14-kapokpod replaced) with used_in, inventory re-emitted.
## castBots 1-4 x40 (at e69dcb5c; every later commit is draw, catalog or test only), PASS by tier, Normal / Easy: kid 24 / 34, adult 40 / 40 (Easy median
   110.7 s, fastest 106.1 s: over the 100 s climb floor), child 10 / 13, middle 22 / 23, expert 25 / (its Easy line did not print).
   231 of 320 printed vs FIX-14's 209 of 360 on the fork head; NOT like for like (one tier line missing): judge the 40-seed totals again
   after the fork. Before the figPush fix the same run was 0/40 on every tier (the relist's run, relist.log).
## Gates on head d7ee9114 (frozen worktree /home/user/w14c): RUNNING at 3:01 AM, results below
(On 72d1ca6d, one commit back, these all PASSED: tsc, build, chunkcheck, artcheck, buildcheck, knowncheck, generality, roadmapcheck,
kbdcheck, seedlist 1-1 (257) and 1-4 (100) --check, tool tests 41/41, tierBots 7/7. Its full suite was at 1055 ok / 0 not ok when I
stopped it for the new head; drawcheck and clipcheck did not finish there. The first suite run, on the pods commit, timed out at 25 min
under load with 2 failures, both fixed: feelPairRoom gate test, figPush.)
## Polish check (judged on the real page, stepped-frame clips; seed 1, built setting printed by clip.mjs)
- gate-normal-up-sheet.jpg: the ties read in three states at phone size (green loop; pale frayed loop; two whipping ends), the thatch
  reads as leaves over the bough; his head stays under the wood on hold and jump. Rough spots, named plainly: (1) the loops are small
  (49 x 108 px as ART-MATT sized them) and the strain shiver is subtle at 1x: the lead should judge the clip at phone size; (2) the old
  white-gold "pop" still flashes at the tear beside the new snap (two signals at once: drop the pop if the lead agrees); (3) the camera
  sits Pokey low on screen while he pushes (not this job's, but it hides the push); (4) NO sideways clip yet (clip.mjs failed sideways).
- vines-normal-up-strip.jpg: one vine passes the petals by, two hands take them, 1.5x quicker to the top; rough: 2/3 (step 3 above).
- pods-normal-up-strip.jpg: the pod's own vine is visibly brighter than its neighbour through the tell, dust at its top, the new pod reads
  on the leaves. Rough: the shake is small at 1x, and the lit vine reads yellow-green, not a colour change Matt named: the lead judges.
## Lessons applied: D40 (built on t-len-14 for the fork; nothing patched that a planned job replaces), D59 (no gate left running),
   D61 (no code-drawn primitive in the lock: all painted), D62 (clips print the built setting), D63 (judged on clips + a cheat probe),
   D64 (context from the token count).
## Learned (for the next builder)
- A "lid" line that slopes (a sagging bough) cannot be tested "from below the line": test against the wood's drawn top. Planted tests
  of a leap ALONG the slope found it.
- A gate probe must hold the figs on (or every case after the first fig opens the gate and probes nothing) and must prove it met the
  wood (`met >= half`), or it passes by never reaching the bough.
- "Stop at the drawn underside" and "the fig passes the drawn top" conflict on a thick painted bough (56 px at 440 wide): the fig tears
  at full push instead (Matt's "just enough to get the fruit up").
- Look a bough lookup up by x AND y: a gate 3000 px below shared the x and capped a climb at the top of the stage.
## Proposed rule changes (lead decides): level.md "every gate-type piece has a skip probe that holds its keys and proves it met the
   wood" (check: fieldGate.test.ts's probe shape); FIX-14's "a climbable vine at a ledge's end has >= 80 px of ledge past it" stands.
