# POLISH-2 REPORT (t-polish-2, gates on head 0b929f18 from 6:37 PM ET; results: gates/RESULTS.txt). Box 6:12-~7:05 PM ET, context ~40% at stop.
**Lead verdicts 6:31/6:35 PM:** fig lock PASS, tufts v2 PASS, crown route PASS. 12 (sideways lock frames) re-shot on the head f5da20a6.
**EXACT NEXT STEP:** 1. Lead pass/fail on stills 18-19 (log end). 2. Matt R-165.212 left: film a 3-fig gate (1-4 gate 6, `tools/lockclip.mjs ... <gate index 5>`)
and an Easy lock clip; the lock's sound by ear on a phone (no audio in the container: UNHEARD). 3. ONE art-pass item (lead 6:35 PM, not hunted now): square-cut
posts: the crown's sure vine and every open gate's way up wind round a square-cut stump (likely trunkFit.ts DecoTrunk / protoArt.ts
setDecoTrunks; World 1 has no made things): living wood from the inventory, else the lead's HF call. 4. R-165.209a 1-5 creek's square edge (w15Creek.ts: B15's token) and b 1-5 upright
ground ~55% (cameraFollow.ts FRAME.feetAt: NODES-TRAVEL's token): not started, need tokens. 5. Pokey's "Meeca climbs this every Sunday" card
sits mid-screen over the 1-4 field in every still (stills 05-09, 18): check on the real page with Tips default, likely a still-shooter artefact (hints
marked shown). 6. 1-4 bots toward 40/40 (POLISH-1 REPORT item 4). 7. Catalog row hf1113/w14-roughbough: add "left end broken off (POLISH-2)".
## Done (evidence)
- **Stills for the lead** 01-09 (tufts before/after both ways + Easy, crown sure vine, beats U and M). Lead 6:31 PM: tufts FAIL (one stamp
  in a column), crown route PASS, post reads made.
- **R-165.212 Matt's fig gate:** reproduced headless (seed 1, every gate: a jump off a field vine's top rose ~170 px up through the shut bough).
  Root: a shut bough is `broken` = no collision. Fix: fieldPlay.ts `lid()` (a shut gate's bough and its `with` boughs are a lid from below
  only, gone the frame the last fig locks), called by ONE engine line after `p.y += p.vy * dt` (engine.ts:2537, lead OK 6:17 PM). Thorn
  tangle: 1-2's shipped bramble (w1-thorn-long, catalog w1-thorn-bramble-long; no HF) lies on the shut log, strains up as he pushes a fig,
  shudders down a notch per fig, pulls back off the log to its ends on the last (vineFieldArt.ts drawGateThorns; fieldPlay.ts thornsOf).
  Lock moment: gold pop where the fig tears, the puzzle kit's snap on that frame, gate + thorns sound on the last (engine.ts fieldSfx, lead
  OK 6:26 PM). Tests src/game/fieldGate.test.ts (6): Matt's case on 1-4 seeds 1-2 Normal+Easy (5 ways off every vine under every gate),
  from-below-only, open vaults; lock sound on the exact tear frame, strain, notch, pull-back. Planted: lid out -> "passes up through";
  'lift' sound out -> "its sound on the very frame it locked ([])": both CAUGHT.
- **Tufts v2** (lead FAIL fixed): four loose tufts, each its own size, pace, turn, side and drift, fading in and out; fall trail 3, burst varied.
- **R-165.209c:** the gate log's left end was cut square by the painting's own frame (w14-roughbough.webp). Root fixed in the art: a
  broken-off end with splinters and the art's ink line, same 707x180 (so the catalog's walk line and span hold).
## Polish check (stills/)
10/11 lock clips sideways/upright, 12/13 frame sheets: bramble reads as closed, pop + draw-back read; 14-17 tufts v2 both ways Normal/Easy:
no column; 18/19 log end before/after: square cut gone. Named rough: post (step 3), Pokey card (step 5), thorns sit partly under the HUD bar
sideways at the field's top (camera), upright the gate is half off-screen left at the lock (camera frames the vine, not the gate).
## Gates: see gates/RESULTS.txt (all CLAUDE.md Checks; each line "name exit"). Anything not 0 is named there by the stop.
## Pushback
- Upright, the camera holds Pokey and leaves the gate he is opening half off-screen: the lock is best seen sideways. A camera look-ahead
  to the gate over him is NODES-TRAVEL's file; worth a ticket (Matt's "could not tell" is partly this).
## Learned (proposed for level.md)
- Never save a repo file while a still shoots from the dev server (page reloads): shoot from a frozen worktree of the commit (`git worktree
  add <scratch> <sha>` + its own vite port); edit freely meanwhile. Cost me one shoot.
- A puzzle's progress must show while it is being done, not only at the end: a push that "did nothing yet" needs a visible strain.
**Lessons applied:** D19, D40, D55, D57, D59 (gates waited for), D61 (pass/fail stills before any link), LAWS 2, 3, 22. **Method:** level.md
rules 8, 11, 12, 18; STAGE-RULES §4 (motion is code, art is painted).
