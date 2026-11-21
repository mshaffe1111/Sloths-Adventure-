# FIX-IDLE REPORT: R-165.353, Pokey's idle melt never paints him see-through
Engine (draw), session_01FhBbYLF1MdAmiwcDyxoKtA. Branch t-fix-idle from origin/main 107870f5. Packet:
reference/packets/2026-11-20/FIX-IDLE.md (on ccr-ea739a2f-dfcee4). Started 7:13 PM ET 11-20 (by `date`).

## EXACT NEXT STEP (kept current)
(8:01 PM ET) Suite PASS (3 shards, 7:29-7:58 PM ET). Running: tierBots on the branch, lockall --layouts 16 on main (scratch worktree
of 107870f5) for the compare. Then: lockall --check on the branch, drawcheck, clipcheck; fill the Gates table; push; final hash to the
lead. If stopped: rerun the missing gate lines with the commands in the Gates table on the branch head.

## Commits (t-fix-idle)
| Commit | What | Time (ET, by `date`) |
|---|---|---|
| acefd5d80 | RED: src/game/heroIdleMelt.test.ts planted (fails on main: 86% of his body painted mid-melt) | 7:18 PM |
| b81cfa1d3 | THE FIX: src/game/heroSprite.ts only (drawMelt), the planted test GREEN | 7:26 PM |
| 0f9316f8a | stills: 2-5 on main's code (floating log at x3268), before/after, isolated alpha | 7:27 PM |
| 175618352 | REPORT draft, the clip-end table, cmp.py | 7:31 PM |
| c219e4a9d | stills: the exact 2-5 spot (t-int-15 code) and 1-1, before/after, 2x, alone-on-checker | 7:32 PM |

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
  box 2.0 x 2.1 hero heights round his feet (about 357 x 375 (134k px) at 2 device px a world unit; it scales with dpr x zoom device px at the measured scale), the same two hero draws as before (now onto
  the scratch canvas), plus one 1:1 drawImage of the box onto the stage. 'lighter' is a coefficient blend (PERFORMANCE-RULES §2: free on
  the GPU). Not a full-screen layer. Capped at 2048 px a side (past that the clip draws solid).

## Proof
1. **The planted test** (src/game/heroIdleMelt.test.ts, in the suite glob): the real drawHeroSprite with every sheet "loaded" (a fake
   Image and a fake 2D context that keeps alpha and compositing through save/restore), a still Pokey stepped at 30 fps through all five
   idle clips (about 51 s), a ledge's step-back and the exit cheer. For every frame it works out how much of his body is painted where
   both poses cover it (source-over stacks, 'lighter' adds, a scratch canvas carries what was painted on it). RED on main (acefd5d80):
   86% at the first part-way frame. GREEN on b81cfa1d3. It also fails if the melt turns into a pop (the clip's share jumping more than a
   quarter in a frame), so "fix it with a cut" cannot pass it.
2. **The real page, Pokey alone** (stills/logs/melt2.mjs: the real engine stepped frame by frame on a frozen clock; after each render the
   same Pokey is drawn again, alone, on a transparent canvas through the same drawHeroSprite, and its pixels counted: solid = alpha 250+,
   part = 20-249). The exact INT-15 spot, 2-5 layout 1 (seed 2), x3268, feet 530 on the rock top, on t-int-15's code (before) and
   t-int-15 + b81cfa1d3 cherry-picked in a scratch worktree, never pushed (after), because main's 2-5 is not the rock build:

   | Frames (sideways; upright the same within a frame) | Before: solid / part px | After: solid / part px |
   |---|---|---|
   | 60, plain pose (no clip) | 11,044 / 4,744 | 11,040 / 4,718 |
   | 123-127, idle-yawn melting in | 0 / 17,738-18,359 | 10,469-10,751 / 7,237-7,762 |
   | 128, the clip alone | 13,616 / 3,979 | 13,725 / 3,880 |
   | 209-213, idle-yawn melting out | 0 / 17,461-17,585 | 10,490-10,993 / 6,504-7,134 |
   | 214, plain again | 11,041 / 4,776 | 11,037 / 4,804 |

   (The plain pose's own "part" pixels are his soft edges, the rim and his shadow.) Same frames melt on both builds: the timings did not
   move. 1-1 (seed 791759, x900) gives the same: before 0 solid on every melt frame, after about 10.5k; doze is the one exception
   (below).
3. **Stills** (pushed for the lead; my own look in "Polish check"): stills/2-5-rock/ (the spot above, upright + sideways: settle 8 / 20
   / 40 / 60 frames, melt in 123-126, melt out 209-212, each a 2x crop of his body on the stage; and the same melt frames with Pokey
   alone on a checker at 2x), stills/1-1/ (the World 1 stop: settle, melt in, alone melt in, alone doze in), stills/2-5-main-log/ (the
   first set, on main's 2-5, where x3268 is a floating log). Logs and scripts: stills/logs/.

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
