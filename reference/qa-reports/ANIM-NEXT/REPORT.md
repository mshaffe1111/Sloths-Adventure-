# ANIM-NEXT report (R-165.349): Pokey's animation needs for 2-6..3-9 + the W2/W3 special stages, and job 1's clips

Status 5:27 PM ET 11-20: DONE. Needs list, job 1 (+ the tiptoe reroll) run, picked by the lead, cut and catalogued. NOT wired (a builder's job).

## Done-items (3/3)
1. Needs list: reference/art/ANIM-NEEDS.md (21 rows, HAVE / ADAPT / NEW, ranked by first stage). World 2 needs no new clip.
2. Job 1 plan to the lead 4:28 PM; go 4:31 PM, cap $2.50; reroll yes 4:58 PM.
3. Takes sheet + preview per clip to the lead before any cut (freeze 4:49, tiptoe 5:00, drowsy 5:08, tiptoe2 5:20); picks: freeze s11,
   drowsy-walk s11, tiptoe2 s5; one set for Matt: reference/art/anim-next/picks/picks-preview.mp4. Then cut + catalogue.

## Spend
ONE sandbox 6b00bc7befaf5e14f4b3e954, 4:32-5:17 PM ET (terminated, status CANCELED), 44.7 min, ~$2.05 of $2.50; 8 takes, every take
pulled as it landed (D98). Logged in reference/art/HF-SPEND.md. Token never left the sandbox's forwarded env.

## What shipped on the branch
- src/assets/hero/clips/freeze.webp (20 frames: 0-13 stop one-shot, 14-19 hold loop), tiptoe.webp (22-frame loop), drowsy-walk.webp
  (24-frame loop); cut by tools/art/train/clips.py (SOURCE rows name the frames; loop joints by silhouette IoU 0.966 / 0.987).
- Rows HELD in reference/art/anim-next/heroClips-rows.json, NOT in heroClipsData.ts (see Pushback 1).
- Catalog: 66 rows in reference/art/CATALOG-MASTER.csv (status "ready (not in the build: no code plays it yet)"), --emit -> cast.json.
- Reviews: reference/art/anim-next/review/ (every take), picks/cut-preview.mp4 (the final loops at sheet size and 89 px on W3 dark).

## Polish check
- Each clip judged at 89 px on World 3's dark (picks-preview, cut-preview): freeze reads "hiding" (paws gripped, wide eye aside),
  tiptoe reads "sneaking" (hunched, paws at chest, strides), drowsy reads "nodding off" (half lids, arms hanging).
- Fixed before reporting: the first freeze cut held on the squeezed-shut eyes (looked asleep) and kept an arm-fling frame (a wave);
  recut to the wide-eyed peek and skipped take frames 1-2.
- Edge: a faint pale key fringe at 3x zoom, the same as the shipped step-back (same keyer): not visible at 89 px.

## Gates (run at 7f61083a + the report)
tsc PASS; tsx tests (heroClips, heroStandard, artUse, src/game/art/*, dressArt, brickSlots, w6WheelArt) 45/45 PASS; artcheck PASS;
knowncheck PASS; BASE_PATH vite build PASS; chunkcheck PASS; buildcheck PASS. NOT run: the full 3-shard suite, drawcheck, clipcheck,
kbdcheck, seedlist, tierBots (no code path draws or reads these sheets yet; the builder that wires them runs all of them).

## Pushback
1. Rows held out of HERO_CLIPS: heroClips.ts warmHeroClips() loads every row at each stage start, so 3 unplayed rows would cost every
   stage ~430 KB and ~9 MB decoded (PERFORMANCE-RULES). The wiring builder pastes them in with the code that plays them.
2. World 2's hidden stage "The Rapids" has no design: its needs row is provisional. R-165.349 is not on ROADMAP.md yet (the lead's row).

## Miss (owned)
Commit 29cc0b6e's Claude-Session line names the lead's session (paste slip); force-push fix refused by the guard; the lead noted it in
STATE. Countermeasure: copy the trailer from the previous commit, never retype it.

## Lessons applied
D41 (sized on 89.1 px drawn height), show first (every take to the lead before any cut), D3 (status -sb before commits, ls-remote = HEAD
after pushes), D54 (grep proof for R-165.178: art 2e203b44b + wiring be0b28c48 on main via PR #71, merge 73e7bed03), D97/D98 (sandbox
only, pull each take as it lands).

## Suggestions (ready packets, not done)
- BUILDER (engine, after Matt's look): paste reference/art/anim-next/heroClips-rows.json into HERO_CLIPS; play freeze (stop once, then
  loop 14-19) when grounded, |vx| < 25 and a watcher/sleeper is in reach, and hold off the idle chain while frozen; tiptoe under the quiet
  line (200 px/s) on stages with a listener; drowsy-walk while drowsy. Run every CLAUDE.md gate.
- Job 2 (parked by the lead): sit-in-moonlight (3-4), the fern find, a winch-crank turn.

## EXACT NEXT STEP
None for this packet. Next owner: the wiring builder (Suggestions 1) once Matt has seen picks-preview.mp4.
