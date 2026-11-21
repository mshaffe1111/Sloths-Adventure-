# FIX-IDLE REPORT: R-165.353, Pokey's idle melt never paints him see-through
Engine (draw), session_01FhBbYLF1MdAmiwcDyxoKtA. Branch t-fix-idle from origin/main 107870f5. Packet:
reference/packets/2026-11-20/FIX-IDLE.md (on ccr-ea739a2f-dfcee4). Started 7:13 PM ET 11-20 (by `date`).

## EXACT NEXT STEP (kept current)
__NEXT__

## Commits (t-fix-idle)
| Commit | What | Time (ET, by `date`) |
|---|---|---|
| acefd5d80 | RED: src/game/heroIdleMelt.test.ts planted (fails on main: 86% of his body painted mid-melt) | 7:18 PM |
| b81cfa1d3 | THE FIX: src/game/heroSprite.ts only (drawMelt), the planted test GREEN | 7:26 PM |
| 0f9316f8a | stills: 2-5 on main's code (floating log at x3268), before/after, isolated alpha | 7:27 PM |
__COMMITS__

## The defect and the cause
At each end of a clip (the 5 idle clips, hurt, the exit cheer, the ledge step-back) heroSprite.ts drew the plain pose at alpha 1-b and the
clip at alpha b, each straight onto the stage. Where both cover his body that paints only 1-(1-b)*b of him (0.75 half way): the rock
showed through him, and with the clip ~10 px off the plain pose his head looked doubled (INT-15's x3268 still).

## The fix (src/game/heroSprite.ts, draw only)
`drawMelt`: on the fade frames only (blend < 1, the plain pose has a frame), both poses go onto ONE scratch canvas lined up with the
stage's own pixels (the stage transform, moved by the box's corner): the plain pose at 1-b, then the clip at b with 'lighter' (adds), and
the scratch canvas is laid on the stage once, at full strength. Where both poses cover him the shares sum to all of him: solid. Only the
edges one pose has and the other lacks fade (the melt itself). Nothing else changes: the same clip, the same frame, the same blend
value, the same timings for every clip (heroClips.ts untouched). No pose to melt with, or no canvas: the clip draws solid.
- The scratch canvas is made ONCE (module-level `meltCv`) and only grows; never made per frame. No closure or array per frame.
- Per-frame cost, only on fade frames (about 6 at each end of a clip; none while he runs, walks or stands plain): one clearRect of a
  box 2.0 x 2.1 hero heights round his feet (__BOX__ device px at the measured scale), the same two hero draws as before (now onto
  the scratch canvas), plus one 1:1 drawImage of the box onto the stage. 'lighter' is a coefficient blend (PERFORMANCE-RULES §2: free on
  the GPU). Not a full-screen layer. Capped at 2048 px a side (past that the clip draws solid).

## Proof
__PROOF__

## The known look left (until R-165.354, the lead's row: re-anchor the clip ends)
The lead's calls (messages read 7:29 PM ET): keep the solid dissolve, no hard cut and no special rule for doze (D40: the clip ends are
being replaced by R-165.354). What a player can still see, and why:
1. **Two faces for about 3 frames (0.1 s) at each end of a standing idle clip.** His plain pose ('idle', 3/4 to the right) and every
   clip's first and last frame do not match: a different head turn (the clips face front) and an offset. Measured on the sheets, feet
   anchored, the shift that best lays each clip end on the plain pose (sheet px; one sheet px = 0.45 world units; overlap before -> after
   the shift):

   | Clip | First frame | Last frame |
   |---|---|---|
   | idle-yawn | +10, +2 (0.75 -> 0.84) | +10, +1 (0.76 -> 0.87) |
   | look-around | +9, +2 (0.76 -> 0.84) | +9, +2 (0.76 -> 0.84) |
   | belly-scratch | +4, +2 (0.77 -> 0.79; paw on belly) | +5, +2 (0.77 -> 0.79) |
   | wave | +3, +2 (0.69 -> 0.70; arm up) | +4, +2 (0.69 -> 0.70) |
   | doze | +11, -6 (0.44 -> 0.51; SITTING) | +12, -6 (0.44 -> 0.51; SITTING) |
   | hurt | +10, +1 (0.75 -> 0.84) | +10, +2 (0.76 -> 0.84) |
   | cheer (fades in only) | +10, +2 (0.75 -> 0.84) | (arms up; no fade out) |
   | step-back (fades in only) | +12, -2 (0.62 -> 0.77) | |
   | teeter (after step-back, no fade; alone it fades in) | +12, -4 (0.49 -> 0.59) | |

   (+x: the clip sits that far LEFT of the plain pose facing right; +y: that far high. Script: stills/logs/cmp.py.)
2. **Doze: a see-through standing ghost for about 6 frames at each end.** Doze's first and last frames are sitting, so the part of the
   standing pose the sitting one does not cover (his upper body) can only fade. Measured on 1-1 (seed 791759, x900), Pokey drawn alone:
   about 5.5k solid px mid-melt against 11k for the plain pose (before the fix: 0). The four standing idle clips stay solid (about 10.5k).
   The cure is the art (R-165.354: doze's first and last frames standing; each clip end re-anchored to the plain pose), not the draw.

## Gates (draw-only branch, gates.md scoping)
__GATES__

## Polish check
__POLISH__

## Method used, lessons applied, method update, learned
__METHOD__
