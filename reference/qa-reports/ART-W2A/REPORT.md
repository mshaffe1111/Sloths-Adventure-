# ART-W2A REPORT: 2-3's painted follow poses (the little ones waddle, paddle, hide; the heron looks up), wired in followArt.ts
Branch t-art-w2a from origin/t-eng-23 9e306581; head in the last message to the lead. Lead OK 6:53 PM ET; re-layout accepted 7:25 PM.
## Done-items
1. **Show first:** reference/qa-reports/ART-W2A/show-first.jpg (sheet px beside Matt's Happy poses, colour-matched; game size on 2-3's own
   stills both ways; edges 3x on light and dark) and post-edge-3x.jpg (the lead's post check: the staircase top edge is w2Heron's own).
2. **Art (Hugging Face, ~$2.11):** Qwen-Image-Edit-2511 from Matt's Happy poses and w2Heron on flat grey (tools/art/hfw2a: starts.py,
   make_spec.py rounds 1-3, run.sh, cut.py, pack.py, catalog.py, picks.json). Per little one: WalkA (stride), WalkB (PASSING: legs together,
   body up), Paddle; w2HeronLook (head up, looking), its post body/rope/water/cattails w2Heron's own pixels so only the bird moves.
3. **Wired (followArt.ts):** followerPose: walk frames swap by GROUND covered (FOLLOW_STRIDE 15 px: no foot-slide at any pace), paddle
   sunk 40% under the code ripple, spooked-and-hiding -> Matt's Sad pose (lead's YES), home -> Happy hopping; heronPose: w2HeronLook
   while warn/pass (drawn at HERON_LOOK_W 84.52 = w2Heron's px a unit), w2Heron while calm; gaze + '!' from the LOOK pose's eye/head.
4. **Packed:** one band on src/assets/props/w2-props.webp (2048x2166 -> 2048x2592, one encode at Q 88: Matt's pieces 40.0 dB), W2_FRAMES
   +10; dressnew-w2 untouched. Catalog: 10 rows (part W2A) by catalog.py, `catalog_master.py --emit` -> cast.json.
5. **Planted test:** src/game/followArt.test.ts (4): one waddle frame only -> RED (test 1); heron never looks up -> RED (test 4); green
   with the change (run 6:55 PM ET). artDress.test caught the heron on a dressing sheet (a pose in no set): moved to w2-props, not loosened.

## Checks (on c3e97e807 unless marked)
| Check | Result |
|---|---|
| tsc | PASS |
| followArt.test, artDress.test, artUse.test, art/*.test | PASS (4, 1+, 1, 16) |
| full suite, 3 shards | PASS: 1276/1276 + 1409 (1 existing TODO, 4-3) + 1136/1136; shards 1-2 re-run on 44e5884f4 (7:50 PM ET), shard 3 on 1af947c75 (its files untouched since) |
| artcheck, knowncheck, generalitycheck, roadmapcheck | PASS (roadmapcheck after `git fetch --unshallow`) |
| lockall vs main; BASE_PATH build + chunkcheck; drawcheck (both ways) | UNRUN (wind-down at 438k context, the lead's call 7:25 PM ET) |
| clipcheck; kbdcheck, buildcheck, seedlist 1-1 --check, engine tool tests, tierBots | UNRUN (no screen, stage, seed, bot or build path changed) |
| walk clip (no foot-slide) | UNRUN: reference/qa-reports/ART-W2A/clip.mjs written, never run |

**EXACT NEXT STEP for a fresh member (branch t-art-w2a, worktree with node_modules):**
1. `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-main.json` on origin/main, then on t-art-w2a
   `npx tsx tools/engine/lockall.ts --layouts 16 --check lock-main.json` (expect 102/102 unchanged: no layout code changed).
2. `BASE_PATH=/Sloths-Adventure-/ npx vite build && node tools/perf/chunkcheck.mjs`; `node tools/perf/drawcheck.mjs` (in the background;
   the follow draw swaps one drawImage for one drawImage, so the counts must not move); `node tools/perf/clipcheck.mjs`.
3. The CI tool line (CLAUDE.md "Checks"), then `ORIENT=land node reference/qa-reports/ART-W2A/clip.mjs` and judge strip-*.png in order:
   the frame (A/B) must change every ~15 px of x and the feet must not slide on the ground.

## Polish check (stills: reference/qa-reports/ART-W2A/stills/*-{port,land}.webp, contact-land.jpg, contact-port.jpg, crops-line-land.jpg)
- Walking, both frames caught (1-walk-frameA / frameB): the five read as walking, stride and passing poses mixed down the line; same
  painter as the Happy poses; no halo on the ground or the reeds.
- Paddling (2-paddle): three sunk to the chest at the creek's surface with the ripple; they read as swimming. (The game's stage card sits
  over the right half of that still: the game's, not mine.)
- The heron: plain while calm (7), neck up and looking while it warns and sweeps (4, 5); its post does not move between them.
- Home (8): Happy and hopping.
- **Named, not fixed:** the spooked one hiding in its Sad pose (6) is hard to find in the still: it crouches behind the code reed tuft at
  the stretch's start, as ENG-23 already named ("hidden perhaps TOO well"). The judgement belongs on the real 2-3, once laid.
- Whole screen (D79): the bright code-drawn green stalks near the start (ENG-23's stills too) are the toy's decor: named for the builder.

## HF: one sandbox 6afe2efd545f95df1c06c8a8, 6:04-6:50 PM ET, 46 min, ~$2.11 of $4; balance ~$51.3 (HF-SPEND.md). 10 pieces kept
(~$0.21 a piece); round 2 (~$0.55) wasted: "other foot forward" came back as the same frame.

## Pushback: none. Suggestion: the 2-3 builder judges the hiding Sad pose on the real stage; a heron call sound is still open.

## Learned / method update (hf-art.md, proposed)
- New POSES of an existing painted character: Qwen-Image-Edit-2511 from the shipped piece on flat grey (no LoRA) keeps the painter; 3
  seeds a pose; ~$0.05 a take. Text-to-image is not needed.
- Two-frame walk: STRIDE, then the PASSING pose made FROM it ("other foot forward" comes back unchanged); swap by distance, not clock.
- A pose that swaps in place: register it on a fixed part (the post) and paste the old fixed parts back. Key only FLAT trapped grey.
- An actor pose never goes on a dressing sheet; pack new frames as one band, encoded once (texture height and quality both cost).

## Lessons applied: D41, D57/D87, D59, D79, D81 (drawcheck UNRUN, step named), law 8 (token stayed in the sandbox), law 22 (rule kept).
## Turnover notes: reference/handoffs/engine-core.md section 0W2A, reference/handoffs/art-director.md section 0g (commit c3e97e807).
