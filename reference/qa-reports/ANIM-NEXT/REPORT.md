# ANIM-NEXT report (R-165.349): Pokey's animation needs for 2-6..3-9 + the W2/W3 special stages

Status 4:36 PM ET 11-20: steps 1-2 DONE; lead's GO 4:31 PM (cap $2.50). Sandbox 6b00bc7befaf5e14f4b3e954 created 4:32 PM ET, pulling its image.

## Done-items
1. Needs list: reference/art/ANIM-NEEDS.md (21 rows: HAVE / ADAPT / NEW, ranked by first stage). 3 NEW for job 1, 1 low NEW + 2 optional for job 2.
2. Job 1 plan (below), spec committed: tools/art/hfpokey/spec-anim1.json.
3. (on the go) takes sheet + preview per clip to the lead before any cut.

## Job 1 plan
- Clips: drowsy-walk (3-1), freeze (3-3; six W3 stages), tiptoe (3-7), x seeds 3 and 11 = 6 takes, 704x704, 49 frames.
- Method: the proven hfpokey route (pokeygpu.py clips(): Wan 2.2 I2V A14B + Matt's slothadv motion LoRA 1.0), start
  tools/art/hfpokey/starts/ref-stand-satchel.png @ 6e7b85f8f (x14's start: the step-back passed Matt's bar).
- ONE sandbox (rtx-pro-6000, ~$2.75/h), terminated the moment the zips + sheets are back (hf_sandbox_fs, saved to files).
- Estimate: x14-clips1 ran 4 takes in 20.7 min ($0.95); 6 takes ~30-35 min wall incl. load = ~$1.40-1.60. Cap asked: $2.50.
- Then: takes sheet + 16 fps preview per clip (tools/art/reanim/preview_anim.py) to the lead; the lead picks; cut (tools/art/train/clips.py)
  to src/assets/hero/clips/<name>.webp + heroClipsData rows; catalog; HF-SPEND. Wiring (when each plays) is a builder's job.

## Pushback
- None on the packet. Notes: World 2's hidden stage "The Rapids" has no design (WORLD-MAP only): its row is provisional. R-165.178's
  two-vine climb shipped: art 2e203b44b (hero-climb2.webp/.json, ART 11-13), wired be0b28c48 (B14b), both on main via PR #71
  (release-0.9.8, merge 73e7bed03): the row can close. The idle chain (yawn/wave after 4 s) would play
  during a freeze or a long hide in W3 today: the freeze clip's wiring must suppress it (a builder's line, in Suggestions).

## Suggestions
- Builder packet (after the pick): play `freeze` when grounded, |vx| < 25 and a watcher/sleeper is in reach (3-5's freeze rule), and hold
  off the idle chain while it does; `tiptoe` under the quiet line (200 px/s) on stages with a listener; `drowsy-walk` while drowsy.

## EXACT NEXT STEP
Sandbox hfsb2:mshaffe111:6b00bc7befaf5e14f4b3e954 (anim-next1): once running, exec detached `sh anim1.sh 21667c79` (curl
tools/art/hfpokey/anim1.sh first), poll /w/out for DONE-<name>; per take: `python sbx.py parts /w/out/<name>.zip`, cat each .pN
(--max-bytes 100000), rebuild with tools/art/hf1113/pull.py into reference/art/anim-next/takes/, commit; after the last take TERMINATE,
log HF-SPEND; per clip run tools/art/hfpokey/anim1preview.py -> sheet + mp4 to the lead. If the sandbox is gone: check `hf_sandbox status`.
