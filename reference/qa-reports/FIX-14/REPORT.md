# FIX-14 REPORT (steps 1-2; step 3+ waits on Matt's pick). t-fix-14 from origin/main@73e7bed0; mock on t-fix-14-mock
## EXACT NEXT STEP
The lead judges the two mocks as clips (D63) and asks Matt one question: (a) mockA (two vines faster + petal pair between them, pods
slow and telegraphed) and (b) mockB (tied thatch that snaps; head stops under the bough). On his pick, build packet step 3 on t-fix-14
from mock.patch (it is a mock: the real build moves numbers into one place for every stage that uses pods, adds the planted tests from
Matt's case, and drops the bramble), then steps 4-5.
## Done (2 of 5 packet steps; step 2 ends at "show first", as the packet says)
1. PLAN.md: the step-1 table, plus step 1b: Matt's "over the top" REPRODUCED on the real page (before-over-the-top-0.9.8.mp4): on a plain
   field vine under a shut gate his feet stop at the bough's top (box 76 px over the underside). Cause: the climb stop and GATE.lid
   are on his feet at the bough's top, and he is drawn 89 px tall on a 48 px box.
2. Two mock clips from the real game, stepped frame by frame, upright 412x915 at 2x, 15 fps, captioned, labelled MOCK:
   mockA (one vine 1.30 s, 0/2 petals; two vines 0.90 s, 2/2), mockB (strain, snap, head under, jump under, thatch off). Repro and
   recorder tools: overtop.mjs, mockclip.mjs (print BUILT: seed 1, Normal, upright).
## Polish check (judged on contact sheets and key frames, upright only: the packet asks upright)
- mockB-keyframes.jpg: the snap's crack and whipping ends read; his head stays under the bough. Rough: the thatch reads a little like moss
  on the bough at phone size; the ties at rest needed a pale edge and a knot to show up (added). Code-drawn: painted art is named in PLAN.
- mockA-pod-tell-keyframes.jpg: the glowing vine reads clearly. Rough: the pod itself is small and dark against the leaves, so the
  fall is easy to miss; real fix is a painted, lighter pod (named for HF).
- mockA's petal pair uses the game's petal; in mockB pods still fall but cannot hit him (invincible for the clip so the push is shown).
## Findings for Matt's choice (honest pushback)
- A 1.5 s tell alone makes the pods beatable on ONE vine from the foot (1.14 s to pass a pod's spot): slower, telegraphed pods do not
  by themselves make two vines worth it. The reward that shows in a clip is speed AND petals only two hands reach (Matt's own idea).
- Two hands still get hit on either vine's line, and he still has to stop to take a hand (engine.ts:2102): step 4 should let a side
  push take a hand while climbing.
## Gates (docs, media and read-only tools on t-fix-14: LAWS 5 fast gates) on this head: see the commit message
## Learned
- Matt's "rocks" are pods; name the thing as the code names it before measuring.
- Playwright recordVideo here paints the page into a corner; step the engine (e.isPaused, e.update(1/30), e.render()) and screenshot
  every 2nd frame, with unrecorded settle frames after any jump cut (the camera lags). Proposed for methods/level.md step 5.
- A shallow clone fails roadmapcheck; `git fetch --unshallow origin` first (proposed for gates.md).
- I misread my own context use as near the 40% box at 15%: read the session's figure, not an estimate (the lead caught it).
## Lessons applied: D61 (judged every frame myself; two rough spots fixed, two named), D62 (BUILT printed from the game), D63 (gate judged
on the whole push, then the cheats: hold, jump, a plain vine), D58 (DK Jr.'s rule is the measure), D40 (mock only; nothing built past it),
D59 (no server or gate left running at stop).
