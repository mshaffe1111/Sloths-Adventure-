# DESIGN-23 REPORT (Designer, t-design-23 from origin/main 6e7b85f8; started 12:22 PM ET 11-18, written 12:36 PM ET; packet reference/packets/2026-11-18/DESIGN-23.md)
**EXACT NEXT STEP (lead):** rule on Pushback 1-5, then cut the follow.ts engine packet (NEW 1) and the heron packet (NEW 2) from 2-3.md's contract section; 2-3 is built after 2-4 and 2-5.

## Done-items and evidence
1. **reference/design/2-3.md, built-ready:** one idea; tributes (Pac-Land, Abe's Oddysee, INSIDE: loved, taught, ours, not copied; Red Light Green Light ours); beats table (s, bits, there, does,
   feels); every first appearance taught (followers beat 1, the heron's look beat 2 freeFirst, the paddle beat 3, the climb wait beat 5); story-keeper ASKS only (8), no lines.
2. **Node string passes checkCode:** `A Tg1< Tm1&<:&heron R Pw1<:#soft Xm1&>:&heron R Pr1< Wp1&>:#soft:&heron R Cm1&>:&heron R Sg1< E`, 14 tokens, no errors
   (`npx tsx reference/specs/sims/nodes23.ts`, out/nodes23.txt). The pitch's sketch FAILED it (V22 x4: no creatures mark; V1: L structural).
3. **Targets pasted:** Normal 14.5 (DIFFICULTY.md:63 slot formula, :62 band 9-21), Easy at most 8.7 (:61). Goal "bring N home": Normal 5, Easy 3 (goals.ts EASY_SHARE 0.65).
4. **Every number flown** (reference/specs/sims/follow23.ts on the real engine at 30 fps through InputEngine, relative imports, D83; out/follow23.txt): his run/stop; the view 440 / 1,199 px;
   the line's spread and bunch time by D (Normal 190 / Easy 230 px/s, gap 34); hop replay (path 1.3 x); the climb wait and rejoin (0.3 s); clump to clump (line home 2.4-4.8 s; latest leave
   after a look 2.6-6.2 s by side); clump widths (260: 0.3 s let-go window, 340: 0.5 s); two herons (G 350 / 3.2 s off: 2.6 s window; G 500 / 4.8 s: 0.4 s REFUSED); the pond (G 360: latest
   leave 3.0 s Normal, 3.6 Easy; G 510: 1.9 s); the setback (1.7 s back, 3.6 s fetch).
5. **follow.ts written as the engine packet's contract** (data, pure API, never climb/ride/fall, the heron's look, gen2's lineFaults, six planted toys, two bot skills, READY on a real row), sized M (B's
   3-4 h estimate, unmeasured: D25). The lost heart (line re-forms at the flag, spooked ones too); the goal and exit count; the hand build and its tests (w2Stages.ts :33/:44-45/:58/:851-856/:1085;
   w2Puzzles, w2Stages, dipWayOut, puzzleCamera, stagePlanGoals tests; stageSheets.ts:206); the art the inventory has, and two Hugging Face asks for the lead.
6. **Gates:** sims tsc 0 errors (temp tsconfig extending the project's with node types, lib ES2023); project tsc 0; roadmapcheck PASS (unshallowed); knowncheck PASS.

## Polish check
Docs only, no stills. Read 2-3.md against out/follow23.txt line by line; a pond number I had derived (1.3 x path, unflown) was flown before it was written (section 9). 2-3.md is 93 lines (2-4.md 74):
the packet's contract section is the extra; nothing in it repeats the table.

## Pushback (for the lead's ruling)
1. **The heron's look must sweep the ZONE in world x, not the view.** watcher.ts:148 shadowX crosses the camera view +-160 px; upright (440 px) the line is 293-544 px wide at D 400-1,200, so a tail
   more than 160 px off screen is never read: upright would be easier than sideways (1,199 px). NEW 2 sweeps [x0-160, x1+160].
2. **The count is not the bite.** 3 and 5 little ones cross in the same time (the tail travels his distance); the dials are the open mud, the clump width and the second heron.
3. **"Go on the warn" fails from G 350 up;** the teach must say "go right after it looks" (story-keeper ask 2), and the bot skill is wait-for-the-tail.
4. **The HUD's five faces are a screen change** (upright the tail is often off screen): show Matt a mock-up first (CLAUDE.md "Show first") and run clipcheck; it is in NEW 1's size.
5. **Two herons at G 500 out of step by half a cycle leave 0.4 s:** the picks' "two herons" holds only at G <= 350 / 3.2 s off; Easy gets one heron (rule 4: its windows are wider in every row).

## Suggestions (outside my walls)
1. ENGINE (xhigh): follow.ts + the heron's line look, from 2-3.md "follow.ts" verbatim; done = the six toys RED with their plants, lineFaults with a planted case, READY on a stageTable row.
2. CONTENT: the two Hugging Face asks (the little ones' waddle + paddle; the heron's look/fish poses) before the build's stills.

## Unresolved
2-2's sinking pads are flown here as solid stones (the pond): the pad's sink time against the line's wait is the builder's flight on the built beat (rule 27). Bits per beat are estimates; the meter
reads the built stage. The upright camera lead (where he stands in the 440 px view) is from realPlay's 0.45, not the live updateCamera: stills decide. follow.ts's size is an estimate.

## Method used / Lessons applied / Method update
Used: methods/level.md rules 1-9, 17, 21-27; DESIGNER.md; 2-4.md as the format. Lessons: D30/D42 (times from `date`), D15 (the follow model run on a planted case: the climb WAIT
held, section 4), D25 (estimate named as unmeasured), D34 (cites read on main 6e7b85f8), D49 (flags by the live rule), D58 (tributes), D41 (Pokey 89.1 for the art), D53, D36, D59, D64, R-165.284.
**Method update (level.md rule 24, proposed):** "A system the engine does not have yet (followers) is flown as its CONTRACT: write the pure functions in the flight script, step them on his real
path, and hand the script to the engine packet as the prototype." **Learned:** a camera-relative watcher judges a line behind him differently upright and sideways: any rule reading things
behind him must be in world x. Turnover note: reference/handoffs/designer.md §0 rewritten (this commit).
