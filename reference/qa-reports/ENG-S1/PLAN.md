# ENG-S1 PLAN (t-eng-s1 from origin/t-a1-swing@3edc896c; packet reference/packets/2026-11-14/ENG-S1.md on the lead's branch)
Box: 90 min from 2:21 AM ET (ends ~3:51 AM ET) or 400k tokens. Order is the packet's (D40: foundations first).

## 0. Measured first (cap.ts, cap.out.txt, 2:26 AM ET)
The foot's release window onto a FAR perch does NOT depend on the perch's width (100-240 px give identical windows, Normal and Easy):
he lands on its near part. So a narrow FAR perch costs no window, and "the WHOLE perch in view" is set by the perch's FAR END.
Camera arithmetic (cameraFollow.ts constants, checked in code): at the release from the foot (410 px hold, ~0.364 rad forward, A1's mock)
his middle is anchor + 146; the view eased 1.3x on the narrowest gate phone's usual upright view (412x915 / 400x880 on a 900 px level:
405 px of world, 1.3x = 527) with him led to the back edge (heroBox + AHEAD.heroPad 2%) shows up to anchor + 146 - 28 + 0.96 x 527 = anchor + 623.
So FAR near end <= 623 - perch width: a 240-280 perch caps at 343-383 (shorter than SHORT); a 120-140 perch at 483-503.
Pushback to the lead (sent with this plan): narrow the FAR perch to 120-140 and cap FAR at ~460-500, or FAR collapses into SHORT.

## 1. The swing camera (every stage, upright): FIRST
- cameraFollow.ts (pure, tested): SWING_CAM {out 1.3, rate out 4.5/s, back in ~1 s}; swingWide(k, target, dt) the ease; swingLand(...)
  the WHOLE perch box (not landingBox's 60 px lip) of the landing a swing throws him onto; swingFarEnd(hold) the cap, in ONE place.
- engine.ts: a `swingWide` factor divides the zoom AFTER roomUsual's level-height floor (engine.ts:1247), so a short level can widen
  (the extra is sky over the top, as a puzzle room's: overTop); showBoth leads with the whole perch box; upright only.
- Planted tests (red without, green with): whole perch in view at the release at the cap, out 20 px past it; the ease rates; sideways
  never widens; the height floor lifted only while swinging.
- Real still upright at the release (setting printed from the game, D62) + a clip of the whole swing (D63), at the cap.
## 2. The vine snake on a liana (StagePiece, by data: down-and-off, down-and-back, up-from-the-foot; hands -> let go, never a bite;
   tell >= 0.5 s; art w16-vinesnake-* recoloured brown). Planted tests on 2+ worlds; clip upright + sideways.
## 3. The false liana (still snake, never sweeps, head at its foot, tongue every 2.5 s; startle-drop).
## 4. Liana-to-liana chains, LIANA len per row, LONG with a dial, by the cap.
Realistic in the box: 1 whole (with its gates), 2 started. What is not reached is named in REPORT with an EXACT NEXT STEP.

## Gates
Full CLAUDE.md Checks on the head before REPORT (game code changes); lockall vs t-a1-swing base: only the stages named change.
Never stop with a gate running (D59). Context % in every message (D64).
