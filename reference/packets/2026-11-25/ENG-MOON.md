# ENG-MOON: a moving moonbeam and the moonflower step, plus the bot's 'wait-for-light' (3-4 NEW 1 + NEW 2; World 3 chain B; R-165.449)
CHECKED AGAINST MAIN (cdffdc627, the lead's audit 11-25, CI #84): ALL MISSING. Zone.lights is static {x,y,r,sleep?,id?} (zones.ts:51); no beam. REUSE: ride.ts:45 rideAt (a path on a clock, rests at each end) and clock.ts:24 cyclePos for the band's motion. The only moonflower is a puzzle-room light source that opens once and is never solid (puzzleCheck.ts:180/318, w6Rooms.ts:271, w8Rooms.ts:282; envKit.ts:293 is decor, envKit moonflower() a code-drawn stand-in). The wait-for-light skill MISSING (firsttimer.ts:726). Builds ON ENG-DARK's brick and ENG-SPORE's clock field (ADR-004), both on t-eng-w3 / to come: starts after ENG-SPORE lands. Size M+ (about 2.5 h).
Engine, Opus 5.5 xhigh. A FRESH member. **BUDGET 2.5 h across sessions; REPORT BY the time the lead names; HARD STOP start + 4 h.** Hand
over on the 28-minute clock with an EXACT NEXT STEP, pushed and ls-remote-confirmed first (D134). run_in_background for long runs (castBots
--json in lanes), NEVER a shell '&'; chattr-frozen worktrees (D115); no heredoc in a commit chain (D119); stamps from `date` (D128); no stage
id, seed or x in engine code; a landing runs the suite AND the CI tool line (D126).
READ LEAN: `git show origin/t-design-33-35:reference/design/3-4.md` (its numbers table and the Engine section lines 52-60: this job is
NEW 1 and NEW 2 exactly); ENG-DARK's report (the beam is a light in the dark brick); gen2's up tower (1-4, stageTable.ts); a crumble's
solidity (how a step stops being solid); level.md rules 21, 23, 24; LESSONS D125-D136.
BASE: t-eng-w3 at ENG-DARK's landing.
1. A light that MOVES on a clock: a band `{ walls: [xA, xB], rest, slide, offset }` (swing) or `{ rise, h }` (climbing), drawn as a slanted
   shaft from the mouth, as a light in the dark brick (its glow is the dark's own light ring).
2. The moonflower STEP: solid while open; opens 0.4 s after the band reaches it, stays while lit, droops `droop` s (the warning frames)
   after the band leaves, then closes (not solid). Laid by the World 3 kit's tower storeys: steps rise 100 on 120, 120 wide.
3. The verdicts, named and planted: 'every storey's open window >= the flown stair time of a 0.5 s reader + margin' (Normal 5.0 s, Easy
   6.8 s) and 'every flower over its own storey's stone'. Data: Normal rest 3.6 / slide 2.4 / droop 1.0 / rise 70 px/s, band 300; Easy rest
   4.8 / droop 1.6 / rise 55 px/s, band 400.
4. The bot skill `wait-for-light` (firsttimer.ts SKILLS): wait on stone until the storey blooms; on a rising band, jump only to an open
   flower.
5. Toys on a REAL row: one storey, one beam, three flowers: the bot climbs in the light; plants: the beam stopped away -> no flower opens
   (RED); droop 0 -> the slow reader falls (RED); the skill removed -> the bot leaves stone in the dark and falls (RED).
6. Stills both ways of the beam and a drooping flower beside Pokey (the lead judges; if the flower has no art, a code-drawn stand-in is
   named as such and ART-W3 batch 2 is told). lockall (any move traced), tierBots 9/9, the suite + the CI tool line; land on t-eng-w3
   (merge, no force); hash to the lead.
REPORT: reference/qa-reports/ENG-MOON/REPORT.md on t-eng-moon-wip. Lead: session_01FhBbYN2CVHnFXg7XzqKXpM. Messages carry no clock times.
