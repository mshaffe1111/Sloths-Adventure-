# STATE: the PM's ledger (one page; the PM updates it on every PASS, REJECT and decision)

## Live (11-07)
- main 11242520 (PR #66, on 0.9.5 PR #63 + #64 + #65): gen2 1-1 (138 layouts), the survey fix. APK v0.9.5-33 and later. The testers' link is the live site + #ctest.
- Test link EnK5 = the same build (v242).

## Open graph (from Wednesday 11-11, the fresh lead; the team is quiet until the reset), in order
0. ANALYST then CONSULTANT on the play window that ends Tuesday 11-10 (their findings may reorder 1-5).
1. DESIGNER: the reach spec from the 30 fps simulation (reference/consultant/2026-11-07-scripts/sim.py), verified in the engine;
   the gap and rise bands per setting; help thresholds.
2. ARCHITECT: the verdict schema (setting-aware arcs, headroom, floors, lethal vs soft visibility); the perf budget of 8 ms at
   60-for-30.
3. CONTENT: re-lay the 1-1 lessons to the Designer's new reach spec (the consultant suggested a double-teach rise of 136 px or more and
   a bounce teach of 205 px or less; the designer's frozen ruling is a bounce lip of 200-220: the Designer settles it in the spec); the
   log chain on Easy;
   the new art (art-raw-2026-11-07/cut); move the accepted 1-1 near strip into the game (reference/art/near11/w1sun2-near-A.webp,
   sha 64294b6d, replaces src/assets/backdrops/w1sun2-near.webp 85b0f79f) with a wide-pan still: bright right-hand boulders must not
   read as standable, and the seam must hold across 3 tiles (handoffs/art-director.md §1).
4. ENGINE: the pipeline changes; escalating help; the WebGL stage 0 onto main.
5. CRITIC: traversal with the real reach; the child, middle and expert bots (after Tuesday's data); the gates. Two new gates from
   handoffs/release-clerk.md §4: fail when the candidate has more `todo:` test markers than main; add funknown.json to knowncheck.

## Carried from the old team (handoffs: reference/handoffs/<role>.md, all six in)
- R-165.47..51 (gentle intro, dead walk, nothing bites, funcheck vs lock, the proven list 138 toward 300).
- The pad's two old coach lines need new words next release (R-165.57; CoachOverlay.tsx COACH_TEXT.pad).
- Bundle headroom 31 KB under 4 MiB; lazy-seeds.py is ready (reference/qa-reports/0.9.5/).
- Dot says nothing while a first-timer stands stuck 20 s at the step (handoffs/tester-page.md §5); goes with escalating help.
- Art: earth ledges "from the floor up only" until Matt rates them; flowering vine petals read grey; Matt's redo list R-01..R-09.

- Ruled (Matt, 11-07): tools/playtesters/personas/ keeps its four first-name files (summary numbers only; Matt checked with them).
  It's the one named exception: everything else stays roles-only.

## Decisions waiting on Matt (the one list; each has an R-number on ROADMAP.md)
- R-165.52: a fixed first 1-1 (Super Mario Run style) or random from the start (consultant finding 9).
- R-165.53: lethal pits in a first stage: allowed if they look different, or none.
- R-165.54: the "can it float?" ratings for earth ledges: a rating page of about 40 pieces, 10 held back to test the
  rule the ratings teach (the plan: the lead branch's next-week notes, "float rating").
- R-165.55: the story keeper's 10 open story threads (reference/story/STORY-KEEPER.md).
- R-165.56: DECIDED (Matt, 11-07: A): studio goes to main by a PR before the handover (moved up to 11-07 evening).
Not Matt's: the pad's two coach lines (R-165.57) are the lead's call with the story keeper (LEAD-PLAYBOOK: the lead approves in-play
lines); Matt sees them in the release.

## Defect log: reference/CONTINUOUS-IMPROVEMENT.md. Method index: reference/methods/README.md. Team: reference/TEAM.md.
