# FIX-14 REPORT (step 1 only; box hit at 40% context). t-fix-14 from origin/main@73e7bed0
## EXACT NEXT STEP
Step 2, SHOW FIRST: build the two upright mock clips from per-frame screenshots (Playwright video draws the page in a corner here; use
`p.screenshot` every 1/15 s + ffmpeg): (a) one vine vs two past a pod whose vine/bough shakes and turns a warning colour, dust trickling,
1.5 s+ before a slower drop (pods today fall at 620 px/s: try ~300); (b) the fig lock: tied-down thatch, ties strain, SNAP at full push,
Pokey's head stopping at the bough's underside. Code-drawn stand-ins for the mock only. Send both to the lead; build nothing past them.
Before (b): ask the lead for Matt's frames of "it still goes over the top": I could not reproduce Pokey above a SHUT bough on seed 1.
## Done (1 of 5 packet steps; step 2 is next)
1. PLAN.md: the step-1 table (pods, tell, beats, per-screen count, how the tell is drawn, the gate on the real page, vine speeds vs 1-5,
   air steer). Repro tool: figrepro.mjs (real page, head vs bough every 0.2 s).
## Findings that steer step 3-4 (all in PLAN.md with file:line)
- Matt's "rocks" are 1-4's PODS (podfall.ts), falling at rockfall's 620 px/s: a column is ~0.5 s of fall after a 1.0 s tell.
- The tell is drawn only on the pod and as pale tufts; the vine/bough never changes: Matt's colour cue is new work.
- Gate: the lid is written on his FEET (GATE.lid, 4 px under the bough's top), not his head; on my runs the vine's top exit stops him
  first (head 24 px under the underside), so Matt's exact case is unreproduced. A gate of two drops him 300 px off the vine top.
- Two hands: 1.6x up (0.6 s saved on a 360 px field) but pods hit on either hand's line (two columns of exposure), he must stop
  climbing to take a hand (engine.ts:2102), and he hangs midway so a petal on a vine's line is ~40 px off. That is "worse than one".
- 1-5 is plain 220 px/s climbs both ways; air steer is the same PHYS on both: the field climb (slide x2, stop-to-step) is the gap.
## Gates (docs + a read-only tool: LAWS 5 fast gates) on this head
tsc PASS; roadmapcheck PASS (after `git fetch --unshallow`: a shallow clone fails it, on main too); knowncheck PASS; generality PASS.
## Not done / rough, named
Steps 2-5 not started (box). No clip yet (D63): the video capture failed and was not sent. Matt's over-the-top case not reproduced.
Turnover notes not rewritten (no content-role note was touched by a measure-only step).
## Learned
- Name the thing as the code names it before measuring: Matt's "rocks" are pods; rockfall.ts is not used on 1-4.
- Playwright recordVideo here paints the page into a corner of the frame; per-frame screenshots are the clip method (proposed for
  methods/level.md step 5).
- A shallow clone fails roadmapcheck; `git fetch --unshallow origin` first (proposed for gates.md).
## Lessons applied: D61 (judged frames myself, none passed), D62 (difficulty set via localStorage sloth_difficulty, printed BUILT), D63
(gate judged on the whole push, then a jump to cheat), D59 (no gate or server left running).
