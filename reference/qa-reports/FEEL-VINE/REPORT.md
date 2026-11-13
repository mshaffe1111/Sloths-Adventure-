# FEEL-VINE report (R-165.214), t-feel-vine from origin/t-int-5 e8afc05, written 6:25 PM ET. Opus 5.5 xhigh.
**Measured (real engine, 30 fps, tools/inspect/vineFeel.ts; 1-4#1 Normal = Easy):** the body is put on the vine in ONE frame. Worst
on-screen jerk: grab beside a trunk 40 px; jump caught on a trunk 49 px and a dead stop (268 px/s to 0); vault off a top 25 px up;
each push between field vines 40 px (twice); leap caught on the next vine 50 px + dead stop; 1-5's uncleared trunk: a bough pushed him
up 24 px the frame before the vault (17 px jerk). No stalls with a thumb held except by design (a held push after a step; up on the bough).
**Fix (engine, every stage):** src/game/vineFeel.ts, a drawn-only settle: at each snap the drawn Pokey keeps where he WOULD have been and
his speed, and a critically damped spring (25/s) lands him on the body; engine.ts carries the grab, hand step, keepHands, vault and any
outside push while climbing (climb block only + 1 field + the hero draw's translate, both approved 5:56 PM). Body, reach, vault and
every verdict number untouched (no rule or STAGE-RULES number loosened; straight up/down still climbs). Respawn/flag (body jump >96 px)
clears it; nothing is carried once he lets go.
**After (drawn jerk, both settings):** grab 40→10 px, jump-grab 49→4, vault 25→6, step 40→8, leap 50→6; 1-5 and 6-1 the same
(1-5 vault 17→6). 5 frames (167 ms) after a snap he is drawn ≤3.2 px off the body (paws on the vine, feet on the bough).
**Tests:** src/game/vineFeel.test.ts, 7 planted (spring path, carried speed, respawn/cut, outside push, real engine on 1-4, 1-5, 6-1 x
both settings); with the carry switched off 7/7 fail (after the carry check was added to test 1).
**Clips (Matt):** reference/qa-reports/FEEL-VINE/clips/{grab,vault,step,leap}-{up,side}.mp4 (BEFORE left/top, AFTER right/bottom) and
-half.mp4 at half speed; strips stills/{grab,vault,step,leap}-up-sheet.png, stills/grab-side-f12.png.
## Polish check
- grab-up-sheet: BEFORE f12 teleports onto the trunk; AFTER f12-14 reaches in and lands on it by f14. grab-side-f12: same, sideways.
- step-up-sheet: BEFORE f4/f11 jump 40 px; AFTER slides across in ~4 frames, two-hand pose kept.
- vault-up-sheet: busy (Dot sits on him at the top); the half-speed mp4 shows it better: the lift off the top no longer jumps.
- Rough spot named: at the first frame of a catch the climb pose is drawn up to ~25 px short of the vine (a reach) for 1-2 frames.
## Gates (in flight at 6:26 PM, final list in the next commit): tsc, build, chunkcheck, artcheck, knowncheck, generality, roadmapcheck (after unshallow) PASS; kbdcheck PASS; unit tests, buildcheck, seedlist, engine tools, tierBots, lock vs base running; drawcheck, clipcheck next
## Pushback / left
- The leap between two field vines 80 px apart uses the trunk leap (330 px/s, -600): he rockets up and is caught 4 frames later. The
  catch is now smooth, but the leap itself is big for an 80 px gap: a Designer number, named not changed (proposal: a field-vine hop).
- Not merged: origin/main (0.9.7) differs from the base only in package.json's version and release docs. physics.ts untouched.
- Camera: no camera jump measured once the view settles (the harness's own placement cut was the only one); sideways, 1-4's trunk sits
  near the right edge at the first storey (framing, not this packet).
## Method used / lessons / method update
Method: engine-core §4 measure first; NEW reference/methods/feel-fix.md (no method existed). Lessons applied: D37 (real engine, pasted
runs), D19 (the test calls the code the screen calls: drawnOff), D43 (every stage, proven on 3 stages / 2 worlds), D15 (measuring tool
fixed twice: per-move fresh stage, clock before load), D21 (x and y both carried), D55/D57 (context % and queue at each push).
## Learned (for the next builder)
- A snap's carry must start where his own speed would have put him that frame, or the eye sees a one-frame stall (jerk 13.8 → 3.7).
- Playwright's clock must be installed before the page loads; installed mid-run, the loop took one step in ten (no motion in clips).
- Recorder placements: never leave invincibility on (he draws faded); pick vine pairs by overlapping span, not just x.
